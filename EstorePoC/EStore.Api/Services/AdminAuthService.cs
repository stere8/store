using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

namespace EStore.Api.Services;

public sealed class AdminAuthService(AdminAuthSettings settings)
{
    public const string Issuer = "EStore.Api.Admin";
    public const string Audience = "estore-admin";

    public bool Verify(string? email, string? code) =>
        settings.IsConfigured &&
        Equal(email?.Trim().ToLowerInvariant() ?? "", settings.Email) &&
        Equal(code ?? "", settings.Code);

    public (string Token, DateTimeOffset ExpiresAt) IssueToken()
    {
        var now = DateTimeOffset.UtcNow;
        var expires = now.AddHours(2);
        var token = new JwtSecurityToken(Issuer, Audience,
            [new Claim("role", "admin"), new Claim("email", settings.Email),
             new Claim("tenantId", settings.TenantId), new Claim("jti", Guid.NewGuid().ToString())],
            now.UtcDateTime, expires.UtcDateTime,
            new SigningCredentials(settings.SigningKey, SecurityAlgorithms.HmacSha256));
        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    private static bool Equal(string actual, string expected) =>
        CryptographicOperations.FixedTimeEquals(
            SHA256.HashData(Encoding.UTF8.GetBytes(actual)),
            SHA256.HashData(Encoding.UTF8.GetBytes(expected)));
}
