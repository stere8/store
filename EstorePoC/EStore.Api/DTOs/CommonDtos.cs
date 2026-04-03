namespace EStore.Api.DTOs;

// ------------------------------------
// LOCATIONS
// ------------------------------------
public record LocationCreateDto(
    string Name,
    string? Code,
    string? Description
);

// ------------------------------------
// VENDORS
// ------------------------------------
public record VendorCreateDto(
    string DisplayName,
    string LegalName,
    string ContactPhone,
    string? ContactEmail,
    Guid? LocationId,
    string? Description
);

// ------------------------------------
// PRODUCTS
// ------------------------------------
public record ProductCreateDto(
    Guid VendorId,
    string Name,
    string? Description,
    Guid? CategoryId,
    decimal Price,
    int Stock,
    string? ImageUrl
);

// ------------------------------------
// CARTS
// ------------------------------------
public record EnsureCartDto(Guid CustomerId);

public record AddCartItemDto(
    Guid ProductId,
    int Quantity
);
