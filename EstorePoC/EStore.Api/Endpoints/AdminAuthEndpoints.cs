using System.Security.Claims;
using EStore.Api.Services;

namespace EStore.Api.Endpoints;

public static class AdminAuthEndpoints
{
    public static RouteGroupBuilder MapAdminAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/login", (HttpContext context, AdminLoginDto dto,
            AdminAuthSettings settings, AdminAuthService auth) =>
        {
            if (!settings.IsConfigured)
                return Results.Problem("Admin login is not configured.", statusCode: 503);
            if (!auth.Verify(dto.Email, dto.Code))
                return Results.Unauthorized();
            if ((string?)context.Items["TenantId"] != settings.TenantId)
                return Results.Forbid(authenticationSchemes: [AuthenticationSetup.Admin]);
            var token = auth.IssueToken();
            return Results.Ok(new AdminSessionDto(token.Token, "Bearer", token.ExpiresAt,
                settings.Email, settings.TenantId));
        }).RequireRateLimiting("admin-login").Produces<AdminSessionDto>().Produces(401)
            .Produces(403).Produces(429).ProducesProblem(503);
        group.MapGet("/me", (HttpContext context) => Results.Ok(new AdminProfileDto(
            context.User.FindFirstValue("email")!, context.User.FindFirstValue("tenantId")!, "admin")))
            .RequireAuthorization(AuthenticationSetup.Admin).Produces<AdminProfileDto>().Produces(401).Produces(403);
        return group;
    }
}

public record AdminLoginDto(string Email, string Code);
public record AdminSessionDto(string AccessToken, string TokenType, DateTimeOffset ExpiresAt,
    string Email, string TenantId);
public record AdminProfileDto(string Email, string TenantId, string Role);
