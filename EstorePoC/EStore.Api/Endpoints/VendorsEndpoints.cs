using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;
using EStore.Api.DTOs;

namespace EStore.Api.Endpoints;

public static class VendorsEndpoints
{
    public static RouteGroupBuilder MapVendorsEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/register", RegisterVendor);
        group.MapGet("/", GetVendors);

        return group;
    }

    private static async Task<IResult> RegisterVendor(AppDbContext db, VendorCreateDto dto)
    {
        var tenant = db.CurrentTenantId!;

        if (dto.LocationId is Guid locId)
        {
            bool locValid = await db.Locations
                .AnyAsync(l => l.Id == locId && l.TenantId == tenant);

            if (!locValid)
                return Results.BadRequest(new { error = "Invalid location for tenant." });
        }

        var vendor = new Vendor
        {
            Id = Guid.NewGuid(),
            TenantId = tenant,
            DisplayName = dto.DisplayName.Trim(),
            LegalName = dto.LegalName.Trim(),
            ContactPhone = dto.ContactPhone.Trim(),
            ContactEmail = dto.ContactEmail?.Trim(),
            Description = dto.Description?.Trim(),
            LocationId = dto.LocationId,
            Active = true,
            Verified = false,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Vendors.Add(vendor);
        await db.SaveChangesAsync();

        return Results.Created($"/api/vendors/{vendor.Id}", vendor);
    }

    private static async Task<IResult> GetVendors(AppDbContext db)
    {
        var tenant = db.CurrentTenantId!;
        var vendors = await db.Vendors
            .Where(v => v.TenantId == tenant)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync();

        return Results.Ok(vendors);
    }
}
