using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class VendorAuthEndpoints
{
    public static RouteGroupBuilder MapVendorAuthEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/register", RegisterVendorAccount);
        group.MapPost("/login", LoginVendor);
        group.MapGet("/session", GetSession);

        return group;
    }

    private static async Task<IResult> RegisterVendorAccount(
        AppDbContext db,
        VendorAuthService vendorAuthService,
        VendorAccountRegistrationDto dto)
    {
        var tenantId = db.CurrentTenantId!;
        var registrationCode = NormalizeRegistrationCode(dto.RegistrationCode);
        var email = NormalizeEmail(dto.Email);

        if (string.IsNullOrWhiteSpace(registrationCode))
        {
            return Results.BadRequest(new { error = "Registration code is required." });
        }

        if (string.IsNullOrWhiteSpace(email))
        {
            return Results.BadRequest(new { error = "Email is required." });
        }

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Trim().Length < 8)
        {
            return Results.BadRequest(new { error = "Password must be at least 8 characters." });
        }

        var vendor = await db.Vendors.FirstOrDefaultAsync(v =>
            v.TenantId == tenantId &&
            v.RegistrationCode == registrationCode);

        if (vendor is null)
        {
            return Results.BadRequest(new { error = "Registration code is invalid." });
        }

        if (!vendor.Active)
        {
            return Results.BadRequest(new { error = "This vendor account is inactive." });
        }

        if (!vendor.Verified)
        {
            return Results.BadRequest(new { error = "This vendor must be verified by admin before registration." });
        }

        if (!string.IsNullOrWhiteSpace(vendor.AccountEmail))
        {
            return Results.BadRequest(new { error = "A vendor account already exists for this code." });
        }

        var emailInUse = await db.Vendors.AnyAsync(v =>
            v.TenantId == tenantId &&
            v.Id != vendor.Id &&
            (v.AccountEmail == email || v.ContactEmail == email));
        if (emailInUse)
        {
            return Results.BadRequest(new { error = "That email is already used by another vendor account." });
        }

        var passwordHash = vendorAuthService.HashPassword(dto.Password.Trim());
        var now = DateTimeOffset.UtcNow;

        vendor.AccountEmail = email;
        vendor.PasswordHash = passwordHash.PasswordHash;
        vendor.PasswordSalt = passwordHash.PasswordSalt;
        vendor.AccountRegisteredAt = now;
        vendor.LastLoginAt = now;

        await db.SaveChangesAsync();

        return Results.Ok(ToSessionResponse(vendorAuthService, vendor));
    }

    private static async Task<IResult> LoginVendor(
        AppDbContext db,
        VendorAuthService vendorAuthService,
        VendorLoginDto dto)
    {
        var tenantId = db.CurrentTenantId!;
        var email = NormalizeEmail(dto.Email);

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(dto.Password))
        {
            return Results.BadRequest(new { error = "Email and password are required." });
        }

        var vendor = await db.Vendors.FirstOrDefaultAsync(v =>
            v.TenantId == tenantId &&
            v.AccountEmail == email);

        if (vendor is null ||
            !vendor.Active ||
            !vendor.Verified ||
            !vendorAuthService.VerifyPassword(dto.Password.Trim(), vendor.PasswordHash, vendor.PasswordSalt))
        {
            return Results.Unauthorized();
        }

        vendor.LastLoginAt = DateTimeOffset.UtcNow;
        await db.SaveChangesAsync();

        return Results.Ok(ToSessionResponse(vendorAuthService, vendor));
    }

    private static async Task<IResult> GetSession(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService)
    {
        var vendor = await ResolveVendorAsync(httpContext, db, vendorAuthService);
        return vendor is null ? Results.Unauthorized() : Results.Ok(ToSummaryDto(vendor));
    }

    internal static async Task<Vendor?> ResolveVendorAsync(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService)
    {
        var tenantId = db.CurrentTenantId!;
        var accessToken = ReadAccessToken(httpContext.Request);
        var payload = vendorAuthService.ReadAccessToken(accessToken, tenantId);

        if (payload is null)
        {
            return null;
        }

        return await db.Vendors.FirstOrDefaultAsync(v =>
            v.Id == payload.VendorId &&
            v.TenantId == tenantId &&
            v.Active &&
            v.Verified &&
            v.AccountEmail != null);
    }

    internal static VendorSummaryDto ToSummaryDto(Vendor vendor) =>
        new(
            vendor.Id,
            vendor.TenantId,
            vendor.LocationId,
            vendor.DisplayName,
            vendor.LegalName,
            vendor.ContactPhone,
            vendor.ContactEmail,
            vendor.Description,
            vendor.Active,
            vendor.Verified,
            vendor.CreatedAt,
            !string.IsNullOrWhiteSpace(vendor.AccountEmail),
            vendor.AccountEmail,
            vendor.AccountRegisteredAt,
            vendor.LastLoginAt);

    private static VendorSessionResponseDto ToSessionResponse(
        VendorAuthService vendorAuthService,
        Vendor vendor) =>
        new(
            vendorAuthService.CreateAccessToken(
                vendor.Id,
                vendor.TenantId,
                vendor.AccountEmail ?? string.Empty),
            ToSummaryDto(vendor));

    private static string NormalizeRegistrationCode(string? value) =>
        value?.Trim().ToUpperInvariant() ?? string.Empty;

    private static string NormalizeEmail(string? value) =>
        value?.Trim().ToLowerInvariant() ?? string.Empty;

    private static string? ReadAccessToken(HttpRequest request)
    {
        var headerValue = request.Headers["X-Vendor-Access-Token"].FirstOrDefault();
        if (!string.IsNullOrWhiteSpace(headerValue))
        {
            return headerValue.Trim();
        }

        var authorization = request.Headers.Authorization.FirstOrDefault();
        if (string.IsNullOrWhiteSpace(authorization))
        {
            return null;
        }

        const string bearerPrefix = "Bearer ";
        return authorization.StartsWith(bearerPrefix, StringComparison.OrdinalIgnoreCase)
            ? authorization[bearerPrefix.Length..].Trim()
            : authorization.Trim();
    }
}
