using System.Net.Mail;
using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Endpoints;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Services;

public static class VendorProfileService
{
    public static Dictionary<string, string[]> Validate(VendorProfileUpdateDto dto)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(dto.DisplayName) || dto.DisplayName.Trim().Length > 160)
            errors["displayName"] = ["Display name is required and must be at most 160 characters."];
        if (string.IsNullOrWhiteSpace(dto.LegalName) || dto.LegalName.Trim().Length > 180)
            errors["legalName"] = ["Legal name is required and must be at most 180 characters."];
        if (string.IsNullOrWhiteSpace(dto.ContactPhone) || dto.ContactPhone.Trim().Length > 32)
            errors["contactPhone"] = ["Contact phone is required and must be at most 32 characters."];
        var email = NormalizeEmail(dto.ContactEmail);
        if (email is not null && (email.Length > 160 || !MailAddress.TryCreate(email, out var address) || address.Address != email))
            errors["contactEmail"] = ["Enter a valid contact email of at most 160 characters."];
        if (dto.Description?.Trim().Length > 10000)
            errors["description"] = ["Description must be at most 10000 characters."];
        if (!string.IsNullOrWhiteSpace(dto.LogoUrl) && !CategoryFormService.IsHttpsImageUrl(dto.LogoUrl))
            errors["logoUrl"] = ["Use an HTTPS logo URL of at most 2048 characters."];
        return errors;
    }

    public static string? NormalizeEmail(string? email) =>
        string.IsNullOrWhiteSpace(email) ? null : email.Trim().ToLowerInvariant();

    public static void Apply(Vendor vendor, VendorProfileUpdateDto dto)
    {
        vendor.DisplayName = dto.DisplayName.Trim();
        vendor.LegalName = dto.LegalName.Trim();
        vendor.ContactPhone = dto.ContactPhone.Trim();
        vendor.ContactEmail = NormalizeEmail(dto.ContactEmail);
        vendor.LocationId = dto.LocationId;
        vendor.Description = dto.Description?.Trim();
        if (dto.LogoUrl is not null) vendor.LogoUrl = ProductCatalogService.NormalizeImageUrl(dto.LogoUrl);
    }

    public static async Task<IResult> Update(AppDbContext db, Guid id, VendorProfileUpdateDto dto)
    {
        var vendor = await db.Vendors.FirstOrDefaultAsync(v => v.Id == id);
        if (vendor is null) return Results.NotFound();
        var errors = Validate(dto);
        if (dto.LocationId.HasValue && !await db.Locations.AnyAsync(x => x.Id == dto.LocationId))
            errors["locationId"] = ["Location not found in this tenant."];
        var email = NormalizeEmail(dto.ContactEmail);
        if (email is not null && await db.Vendors.AnyAsync(v => v.Id != id && v.ContactEmail != null && v.ContactEmail.ToLower() == email))
            return Results.Conflict(new { error = "Contact email is already used by another vendor in this tenant." });
        if (errors.Count > 0) return Results.ValidationProblem(errors);
        Apply(vendor, dto);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException ex) when (DatabaseErrors.IsUniqueViolation(ex))
        { return Results.Conflict(new { error = "Contact email is already used by another vendor in this tenant." }); }
        return Results.Ok(VendorAuthEndpoints.ToSummaryDto(vendor));
    }

}
