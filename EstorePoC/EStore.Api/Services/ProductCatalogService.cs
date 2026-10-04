using System.Text.Json;
using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Services;

public sealed class ProductCatalogService(AppDbContext db, CategoryFormService forms)
{
    public async Task<Dictionary<string, string[]>> ValidateAsync(Guid vendorId, string? name,
        Guid? categoryId, decimal price, int stock, string? imageUrl,
        Dictionary<string, JsonElement> attributes, int reserved = 0)
    {
        var errors = await forms.ValidateAttributesAsync(categoryId, attributes);
        if (string.IsNullOrWhiteSpace(name) || name.Trim().Length > 200)
            errors["name"] = ["Name is required and must be at most 200 characters."];
        if (price < 0 || price > 9999999999999999m || decimal.Truncate(price) != price)
            errors["price"] = ["Use a nonnegative whole RWF amount."];
        if (stock < 0 || stock < reserved)
            errors["stock"] = ["Stock must cover all currently reserved units."];
        if (imageUrl is not null && imageUrl.Trim().Length > 0 && !CategoryFormService.IsHttpsImageUrl(imageUrl))
            errors["imageUrl"] = ["Use an HTTPS image URL."];
        if (!await db.Vendors.AnyAsync(v => v.Id == vendorId && v.Active))
            errors["vendorId"] = ["Active vendor not found in this tenant."];
        return errors;
    }

    public static Dictionary<string, JsonElement> ReadAttributes(Product product) =>
        JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(product.AttributesJson) ?? [];

    public static CatalogProductDto ToDto(Product p) => new(p.Id, p.VendorId, p.Vendor?.DisplayName,
        p.Name, p.Description, p.Price, p.ImageUrl, p.CategoryId, p.Category?.Name,
        p.StockQuantity, p.ReservedQuantity, p.Active, p.CreatedAt, ReadAttributes(p), p.Vendor?.LogoUrl);

    public static string? NormalizeImageUrl(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
