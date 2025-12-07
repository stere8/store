using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class AdminEndpoints
{
    public static RouteGroupBuilder MapAdminEndpoints(this RouteGroupBuilder group)
    {
        // Vendors
        group.MapGet("/vendors", GetAllVendors);
        group.MapPatch("/vendors/{vendorId:guid}/approve", ApproveVendor);
        group.MapPatch("/vendors/{vendorId:guid}/deactivate", DeactivateVendor);

        // Products
        group.MapGet("/products", GetAllProducts);
        group.MapPatch("/products/{productId:guid}/activate", ActivateProduct);
        group.MapPatch("/products/{productId:guid}/deactivate", DeactivateProduct);

        return group;
    }

    // -------------------------------------------------------------
    // 1️⃣ LIST ALL VENDORS (multi-tenant)
    // -------------------------------------------------------------
    private static async Task<IResult> GetAllVendors(AppDbContext db)
    {
        var vendors = await db.Vendors
            .Include(v => v.Location)
            .OrderByDescending(v => v.CreatedAt)
            .Select(v => new VendorAdminDto(
                v.Id,
                v.TenantId,
                v.DisplayName,
                v.LegalName,
                v.Active,
                v.Verified,
                v.CreatedAt
            ))
            .ToListAsync();

        return Results.Ok(vendors);
    }

    // -------------------------------------------------------------
    // 2️⃣ APPROVE VENDOR
    // -------------------------------------------------------------
    private static async Task<IResult> ApproveVendor(AppDbContext db, Guid vendorId)
    {
        var vendor = await db.Vendors.FirstOrDefaultAsync(v => v.Id == vendorId);
        if (vendor is null)
            return Results.NotFound(new { error = "Vendor not found." });

        vendor.Verified = true;
        await db.SaveChangesAsync();

        return Results.Ok(new { message = "Vendor approved.", vendor.Id });
    }

    // -------------------------------------------------------------
    // 3️⃣ DEACTIVATE VENDOR
    // -------------------------------------------------------------
    private static async Task<IResult> DeactivateVendor(AppDbContext db, Guid vendorId)
    {
        var vendor = await db.Vendors.FirstOrDefaultAsync(v => v.Id == vendorId);
        if (vendor is null)
            return Results.NotFound(new { error = "Vendor not found." });

        vendor.Active = false;
        await db.SaveChangesAsync();

        return Results.Ok(new { message = "Vendor deactivated.", vendor.Id });
    }

    // -------------------------------------------------------------
    // 4️⃣ LIST ALL PRODUCTS (multi-tenant)
    // -------------------------------------------------------------
    private static async Task<IResult> GetAllProducts(AppDbContext db)
    {
        var products = await db.Products
            .OrderBy(p => p.Name)
            .Select(p => new ProductAdminDto(
                p.Id,
                p.TenantId,
                p.VendorId,
                p.Name,
                p.Active,
                p.CreatedAt
            ))
            .ToListAsync();

        return Results.Ok(products);
    }

    // -------------------------------------------------------------
    // 5️⃣ ACTIVATE PRODUCT
    // -------------------------------------------------------------
    private static async Task<IResult> ActivateProduct(AppDbContext db, Guid productId)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == productId);
        if (product is null)
            return Results.NotFound(new { error = "Product not found." });

        product.Active = true;
        await db.SaveChangesAsync();

        return Results.Ok(new { message = "Product activated.", product.Id });
    }

    // -------------------------------------------------------------
    // 6️⃣ DEACTIVATE PRODUCT
    // -------------------------------------------------------------
    private static async Task<IResult> DeactivateProduct(AppDbContext db, Guid productId)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == productId);
        if (product is null)
            return Results.NotFound(new { error = "Product not found." });

        product.Active = false;
        await db.SaveChangesAsync();

        return Results.Ok(new { message = "Product deactivated.", product.Id });
    }
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

public record VendorAdminDto(
    Guid Id,
    string TenantId,
    string DisplayName,
    string LegalName,
    bool Active,
    bool Verified,
    DateTimeOffset CreatedAt);

public record ProductAdminDto(
    Guid Id,
    string TenantId,
    Guid VendorId,
    string Name,
    bool Active,
    DateTimeOffset CreatedAt);
