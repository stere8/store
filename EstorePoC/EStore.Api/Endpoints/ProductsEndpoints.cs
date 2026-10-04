using EStore.Api.Data;
using System.Text.Json;
using EStore.Api.Models;
using EStore.Api.DTOs;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class ProductsEndpoints
{
    public static RouteGroupBuilder MapProductsEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", List).Produces<List<CatalogProductDto>>();
        group.MapGet("/{id:guid}", Get).Produces<CatalogProductDto>();
        group.MapPost("/", Create).RequireAuthorization(AuthenticationSetup.Admin).Produces<CatalogProductDto>(201);
        group.MapPut("/{id:guid}", Update).RequireAuthorization(AuthenticationSetup.Admin).Produces<CatalogProductDto>();
        group.MapDelete("/{id:guid}", Delete).RequireAuthorization(AuthenticationSetup.Admin);
        return group;
    }

    private static IQueryable<Product> Query(AppDbContext db) =>
        db.Products.Include(p => p.Vendor).Include(p => p.Category);

    private static async Task<IResult> List(AppDbContext db) =>
        Results.Ok((await Query(db).Where(p => p.Active).OrderBy(p => p.Name).ToListAsync())
            .Select(ProductCatalogService.ToDto));

    private static async Task<IResult> Get(AppDbContext db, Guid id)
    {
        var product = await Query(db).FirstOrDefaultAsync(p => p.Id == id && p.Active);
        return product is null ? Results.NotFound() : Results.Ok(ProductCatalogService.ToDto(product));
    }

    private static async Task<IResult> Create(AppDbContext db, ProductCatalogService catalog, ProductCreateDto dto)
    {
        var attributes = dto.Attributes ?? [];
        var errors = await catalog.ValidateAsync(dto.VendorId, dto.Name, dto.CategoryId,
            dto.Price, dto.Stock, dto.ImageUrl, attributes);
        if (errors.Count > 0) return Results.ValidationProblem(errors);
        var product = new Product
        {
            TenantId = db.CurrentTenantId!, VendorId = dto.VendorId, Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(), CategoryId = dto.CategoryId,
            Price = dto.Price, StockQuantity = dto.Stock,
            ImageUrl = ProductCatalogService.NormalizeImageUrl(dto.ImageUrl),
            AttributesJson = JsonSerializer.Serialize(attributes)
        };
        db.Products.Add(product);
        await db.SaveChangesAsync();
        await db.Entry(product).Reference(p => p.Vendor).LoadAsync();
        await db.Entry(product).Reference(p => p.Category).LoadAsync();
        return Results.Created($"/api/products/{product.Id}", ProductCatalogService.ToDto(product));
    }

    private static async Task<IResult> Update(AppDbContext db, ProductCatalogService catalog,
        Guid id, ProductUpdateDto dto)
    {
        var product = await Query(db).FirstOrDefaultAsync(p => p.Id == id && p.Active);
        if (product is null) return Results.NotFound();
        var attributes = dto.Attributes ?? ProductCatalogService.ReadAttributes(product);
        var errors = await catalog.ValidateAsync(dto.VendorId, dto.Name, dto.CategoryId,
            dto.Price, dto.Stock, dto.ImageUrl, attributes, product.ReservedQuantity);
        if (errors.Count > 0) return Results.ValidationProblem(errors);
        product.VendorId = dto.VendorId;
        product.Name = dto.Name.Trim();
        product.Description = dto.Description?.Trim();
        product.CategoryId = dto.CategoryId;
        product.Price = dto.Price;
        product.StockQuantity = dto.Stock;
        product.AttributesJson = JsonSerializer.Serialize(attributes);
        if (dto.ImageUrl is not null) product.ImageUrl = ProductCatalogService.NormalizeImageUrl(dto.ImageUrl);
        await db.SaveChangesAsync();
        await db.Entry(product).Reference(p => p.Vendor).LoadAsync();
        await db.Entry(product).Reference(p => p.Category).LoadAsync();
        return Results.Ok(ProductCatalogService.ToDto(product));
    }

    private static async Task<IResult> Delete(AppDbContext db, Guid id)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.Id == id && p.Active);
        if (product is null) return Results.NotFound();
        product.Active = false;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
