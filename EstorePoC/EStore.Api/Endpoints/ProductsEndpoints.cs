using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;
using EStore.Api.DTOs;

namespace EStore.Api.Endpoints;

public static class ProductsEndpoints
{
    public static RouteGroupBuilder MapProductsEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetAllProducts);
        group.MapGet("/{id:guid}", GetProductById);
        group.MapPost("/", CreateProduct);
        group.MapPut("/{id:guid}", UpdateProduct);
        group.MapDelete("/{id:guid}", DeleteProduct);
        return group;
    }
    private static async Task<IResult> UpdateProduct(
    AppDbContext db, Guid id, ProductUpdateDto dto)
    {
        var tenant = db.CurrentTenantId!;

        var product = await db.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenant && p.Active);

        if (product is null)
            return Results.NotFound(new { error = "Product not found or inactive." });

        if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.Stock < 0)
            return Results.BadRequest(new { error = "Invalid product data." });

        product.Name = dto.Name.Trim();
        product.Description = dto.Description?.Trim();
        product.Price = dto.Price;
        product.StockQuantity = dto.Stock;

        await db.SaveChangesAsync();

        return Results.Ok(product);
    }

    private static async Task<IResult> DeleteProduct(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;

        var product = await db.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenant);

        if (product is null)
            return Results.NotFound();

        product.Active = false;

        await db.SaveChangesAsync();
        return Results.Ok(new { message = "Product deactivated." });
    }


    private static async Task<IResult> GetProductById(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;

        var product = await db.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenant);

        return product is null ? Results.NotFound() : Results.Ok(product);
    }

    private static async Task<IResult> GetAllProducts(AppDbContext db)
    {
        var tenant = db.CurrentTenantId!;

        var data = await db.Products
            .Where(p => p.TenantId == tenant && p.Active)
            .OrderBy(p => p.Name)
            .ToListAsync();

        return Results.Ok(data);
    }

    private static async Task<IResult> CreateProduct(AppDbContext db, ProductCreateDto dto)
    {
        var tenant = db.CurrentTenantId!;

        if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.Stock < 0)
            return Results.BadRequest(new { error = "Invalid payload." });

        bool vendorOK = await db.Vendors.AnyAsync(v =>
            v.Id == dto.VendorId && v.TenantId == tenant && v.Active);

        if (!vendorOK)
            return Results.BadRequest(new { error = "Vendor not found or inactive." });

        var product = new Product
        {
            Id = Guid.NewGuid(),
            TenantId = tenant,
            VendorId = dto.VendorId,
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            Price = dto.Price,
            StockQuantity = dto.Stock,
            ImageUrl = dto.ImageUrl,
            Active = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        return Results.Created($"/api/products/{product.Id}", product);
    }
}
