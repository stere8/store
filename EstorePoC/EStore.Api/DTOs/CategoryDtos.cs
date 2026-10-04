using EStore.Api.Models;

namespace EStore.Api.DTOs;

public record CategoryFieldDto(
    string Key, string Label, CategoryFieldType DataType, bool Required = false,
    string? Placeholder = null, List<string>? Options = null, decimal? Min = null,
    decimal? Max = null, int? MaxLength = null, int SortOrder = 0);

public record CategoryWriteDto(string Name, string? Description = null,
    Guid? ParentCategoryId = null, List<CategoryFieldDto>? Fields = null);

public record CategoryDto(Guid Id, string Name, string? Description,
    Guid? ParentCategoryId, bool Active, DateTimeOffset CreatedAt,
    IReadOnlyList<CategoryFieldDto> Fields);

public record CategoryFormDto(Guid CategoryId, Guid? ParentCategoryId,
    string CategoryName, IReadOnlyList<CategoryFieldDto> Fields);
