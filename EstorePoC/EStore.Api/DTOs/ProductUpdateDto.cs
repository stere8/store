namespace EStore.Api.DTOs;

public record ProductUpdateDto(
    string Name,
    string? Description,
    decimal Price,
    int Stock
);
