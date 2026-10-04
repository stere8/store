using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;

namespace EStore.Api.Services;

public static class AuthenticationSetup
{
    public const string Admin = "Admin";
    public const string Customer = "Customer";

    public static void AddStoreAuthentication(this IServiceCollection services, IConfiguration configuration)
    {
        var settings = new AdminAuthSettings(configuration);
        services.AddSingleton(settings);
        services.AddSingleton<AdminAuthService>();
        var issuer = configuration["CLERK_JWT_ISSUER"]?.Trim().TrimEnd('/');
        var origins = (configuration["CLERK_AUTHORIZED_PARTIES"] ?? "")
            .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
        var authentication = services.AddAuthentication();
        authentication.AddJwtBearer(Admin, options =>
        {
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true, ValidIssuer = AdminAuthService.Issuer,
                ValidateAudience = true, ValidAudience = AdminAuthService.Audience,
                ValidateIssuerSigningKey = true, IssuerSigningKey = settings.SigningKey,
                ValidateLifetime = true, RequireExpirationTime = true,
                ValidAlgorithms = [SecurityAlgorithms.HmacSha256], ClockSkew = TimeSpan.FromSeconds(30),
                NameClaimType = "email", RoleClaimType = "role"
            };
        });
        authentication.AddJwtBearer(Customer, options =>
        {
            options.MapInboundClaims = false;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true, ValidIssuer = issuer ?? "unconfigured",
                ValidateAudience = false, ValidateLifetime = true, RequireExpirationTime = true,
                ValidateIssuerSigningKey = true, ValidAlgorithms = [SecurityAlgorithms.RsaSha256],
                ClockSkew = TimeSpan.FromSeconds(30), NameClaimType = "sub"
            };
            var publicKey = configuration["CLERK_JWT_KEY"]?.Replace("\\n", "\n", StringComparison.Ordinal);
            if (!string.IsNullOrWhiteSpace(publicKey))
            {
                var rsa = RSA.Create();
                rsa.ImportFromPem(publicKey);
                options.TokenValidationParameters.IssuerSigningKey = new RsaSecurityKey(rsa);
            }
            else if (Uri.TryCreate(issuer, UriKind.Absolute, out var uri) && uri.Scheme == "https")
            {
                options.ConfigurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                    issuer + "/.well-known/jwks.json", new ClerkJwksRetriever(),
                    new HttpDocumentRetriever { RequireHttps = true });
            }
            options.Events = new JwtBearerEvents
            {
                OnTokenValidated = context =>
                {
                    var subject = context.Principal?.FindFirstValue("sub");
                    var azp = context.Principal?.FindFirstValue("azp");
                    if (string.IsNullOrWhiteSpace(issuer) || string.IsNullOrWhiteSpace(subject) ||
                        subject.Length > 80 || context.Principal?.FindFirstValue("sts") == "pending" ||
                        (azp is not null && !origins.Contains(azp, StringComparer.Ordinal)))
                        context.Fail("Invalid customer session.");
                    return Task.CompletedTask;
                }
            };
        });
        services.AddAuthorization(options =>
        {
            options.AddPolicy(Admin, policy =>
            {
                policy.AddAuthenticationSchemes(Admin).RequireAuthenticatedUser().RequireClaim("role", "admin");
                policy.RequireAssertion(context => settings.IsConfigured &&
                    context.Resource is HttpContext http &&
                    context.User.FindFirstValue("tenantId") == (string?)http.Items["TenantId"]);
            });
            options.AddPolicy("CustomerOrAdmin", policy =>
            {
                policy.AddAuthenticationSchemes(Admin, Customer).RequireAuthenticatedUser();
                policy.RequireAssertion(context => context.User.HasClaim("sub", context.User.FindFirstValue("sub") ?? "") ||
                    (settings.IsConfigured && context.User.HasClaim("role", "admin") &&
                     context.Resource is HttpContext http &&
                     context.User.FindFirstValue("tenantId") == (string?)http.Items["TenantId"]));
            });
        });
    }

    private sealed class ClerkJwksRetriever : IConfigurationRetriever<OpenIdConnectConfiguration>
    {
        public async Task<OpenIdConnectConfiguration> GetConfigurationAsync(
            string address, IDocumentRetriever retriever, CancellationToken cancel)
        {
            var json = await retriever.GetDocumentAsync(address, cancel);
            var result = new OpenIdConnectConfiguration();
            foreach (var key in new JsonWebKeySet(json).GetSigningKeys())
                result.SigningKeys.Add(key);
            return result;
        }
    }
}

public sealed class AdminAuthSettings
{
    public string Email { get; }
    public string Code { get; }
    public string TenantId { get; }
    public SymmetricSecurityKey SigningKey { get; }
    public bool IsConfigured { get; }

    public AdminAuthSettings(IConfiguration configuration)
    {
        Email = configuration["ADMIN_EMAIL"]?.Trim().ToLowerInvariant() ?? "";
        Code = configuration["ADMIN_LOGIN_CODE"] ?? "";
        TenantId = configuration["ADMIN_TENANT_ID"]?.Trim() ?? "kigali-city-mall";
        var secret = configuration["ADMIN_TOKEN_SECRET"] ?? "";
        IsConfigured = Email.Contains('@') && Code.Length >= 8 && Encoding.UTF8.GetByteCount(secret) >= 32;
        SigningKey = new SymmetricSecurityKey(IsConfigured
            ? Encoding.UTF8.GetBytes(secret) : RandomNumberGenerator.GetBytes(32));
    }
}
