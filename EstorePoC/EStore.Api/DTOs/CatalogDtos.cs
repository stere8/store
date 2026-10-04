using System.Text.Json;

namespace EStore.Api.DTOs;

public record CatalogProductDto(Guid Id, Guid VendorId, string? VendorName,
    string Name, string? Description, decimal Price, string? ImageUrl,
    Guid? CategoryId, string? Category, int StockQuantity, int ReservedQuantity,
    bool Active, DateTimeOffset CreatedAt, Dictionary<string, JsonElement> Attributes,
    string? VendorLogoUrl);

public record VendorLogoDto(string? LogoUrl);
