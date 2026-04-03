namespace EStore.Api.DTOs;

public record ProductUpdateDto(
    Guid VendorId,
    string Name,
    string? Description,
    Guid? CategoryId,
    decimal Price,
    int Stock
);
