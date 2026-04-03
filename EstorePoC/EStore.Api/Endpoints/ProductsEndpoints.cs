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
    private static async Task<IResult> UpdateProduct(AppDbContext db, Guid id, ProductUpdateDto dto)
    {
        var tenant = db.CurrentTenantId!;

        var product = await db.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenant && p.Active);

        if (product is null)
            return Results.NotFound(new { error = "Product not found or inactive." });

        var validationError = await ValidateProductAsync(db, tenant, dto.VendorId, dto.Name, dto.CategoryId, dto.Price, dto.Stock);
        if (validationError is not null)
            return Results.BadRequest(new { error = validationError });

        product.VendorId = dto.VendorId;
        product.Name = dto.Name.Trim();
        product.Description = dto.Description?.Trim();
        product.CategoryId = dto.CategoryId;
        product.Price = dto.Price;
        product.StockQuantity = dto.Stock;

        await db.SaveChangesAsync();

        return Results.Ok(product);
    }

    private static async Task<IResult> DeleteProduct(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;

        var product = await db.Products
            .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenant && p.Active);

        if (product is null)
            return Results.NotFound(new { error = "Product not found or inactive." });

        product.Active = false;

        await db.SaveChangesAsync();
        return Results.NoContent();
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

        var validationError = await ValidateProductAsync(db, tenant, dto.VendorId, dto.Name, dto.CategoryId, dto.Price, dto.Stock);
        if (validationError is not null)
            return Results.BadRequest(new { error = validationError });

        var product = new Product
        {
            Id = Guid.NewGuid(),
            TenantId = tenant,
            VendorId = dto.VendorId,
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            CategoryId = dto.CategoryId,
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

    private static async Task<string?> ValidateProductAsync(
        AppDbContext db,
        string tenant,
        Guid vendorId,
        string name,
        Guid? categoryId,
        decimal price,
        int stock)
    {
        if (vendorId == Guid.Empty)
            return "VendorId is required.";

        if (string.IsNullOrWhiteSpace(name))
            return "Name is required.";

        if (price < 0)
            return "Price must be greater than or equal to zero.";

        if (stock < 0)
            return "Stock must be greater than or equal to zero.";

        if (categoryId.HasValue)
        {
            var categoryExists = await db.Categories.AnyAsync(c =>
                c.Id == categoryId.Value && c.TenantId == tenant && c.Active);

            if (!categoryExists)
                return "Category not found or inactive.";
        }

        var vendorExists = await db.Vendors.AnyAsync(v =>
            v.Id == vendorId && v.TenantId == tenant && v.Active);

        if (!vendorExists)
            return "Vendor not found or inactive.";

        return null;
    }
}
