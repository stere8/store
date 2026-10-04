using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class VendorProfileEndpoints
{
    public static RouteGroupBuilder MapVendorProfileEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/{id:guid}/profile", async (AppDbContext db, Guid id) =>
        {
            var vendor = await db.Vendors.Where(v => v.Id == id && v.Active)
                .Select(v => new { v.Id, v.DisplayName, v.Description, v.LogoUrl, v.Verified, v.LocationId })
                .FirstOrDefaultAsync();
            return vendor is null ? Results.NotFound() : Results.Ok(vendor);
        });
        group.MapPut("/{id:guid}/logo", async (AppDbContext db, Guid id, VendorLogoDto dto) =>
        {
            var vendor = await db.Vendors.FirstOrDefaultAsync(v => v.Id == id && v.Active);
            if (vendor is null) return Results.NotFound();
            if (!string.IsNullOrWhiteSpace(dto.LogoUrl) && !CategoryFormService.IsHttpsImageUrl(dto.LogoUrl))
                return Results.BadRequest(new { error = "logoUrl must be an HTTPS URL." });
            vendor.LogoUrl = ProductCatalogService.NormalizeImageUrl(dto.LogoUrl);
            await db.SaveChangesAsync();
            return Results.Ok(VendorAuthEndpoints.ToSummaryDto(vendor));
        }).RequireAuthorization(AuthenticationSetup.Admin);
        return group;
    }
}
