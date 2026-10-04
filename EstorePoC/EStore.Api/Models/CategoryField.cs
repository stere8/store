using System.Text.Json.Serialization;

namespace EStore.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum CategoryFieldType { Text, Number, Integer, Boolean, Date, Select, MultiSelect, Image }

public class CategoryField
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }
    public string Key { get; set; } = default!;
    public string Label { get; set; } = default!;
    public CategoryFieldType DataType { get; set; }
    public bool Required { get; set; }
    public string? Placeholder { get; set; }
    public string OptionsJson { get; set; } = "[]";
    public decimal? Min { get; set; }
    public decimal? Max { get; set; }
    public int? MaxLength { get; set; }
    public int SortOrder { get; set; }
}
