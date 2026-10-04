using System.Globalization;
using System.Text.Json;
using System.Text.RegularExpressions;
using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Services;

public sealed class CategoryFormService(AppDbContext db)
{
    private static readonly Regex FieldKey = new("^[a-z][a-z0-9_]{0,79}$", RegexOptions.CultureInvariant);

    public static string? ValidateDefinitions(IReadOnlyList<CategoryFieldDto> fields)
    {
        if (fields.Count > 50) return "A category supports at most 50 fields.";
        var keys = new HashSet<string>(StringComparer.Ordinal);
        foreach (var field in fields)
        {
            if (field is null || string.IsNullOrWhiteSpace(field.Key) || !FieldKey.IsMatch(field.Key) ||
                !keys.Add(field.Key)) return "Field keys must be unique lowercase identifiers, for example country_of_origin.";
            if (string.IsNullOrWhiteSpace(field.Label) || field.Label.Trim().Length > 160 ||
                field.Placeholder?.Length > 240 || !Enum.IsDefined(field.DataType))
                return "Invalid field label, placeholder, or data type.";
            var options = field.Options ?? [];
            if (field.DataType is CategoryFieldType.Select or CategoryFieldType.MultiSelect)
            {
                if (options.Count is < 1 or > 100 || options.Any(x => string.IsNullOrWhiteSpace(x) || x.Length > 160) ||
                    options.Distinct(StringComparer.Ordinal).Count() != options.Count)
                    return "Selection fields need 1-100 unique, nonblank options.";
            }
            else if (options.Count > 0) return "Only selection fields may define options.";
            if (field.Min.HasValue || field.Max.HasValue)
            {
                if (field.DataType is not (CategoryFieldType.Number or CategoryFieldType.Integer) ||
                    field.Min > field.Max ||
                    new[] { field.Min, field.Max }.Any(x => x.HasValue &&
                        (x.Value < -99999999999999.9999m || x.Value > 99999999999999.9999m ||
                         Math.Round(x.Value, 4) != x.Value)) ||
                    (field.DataType == CategoryFieldType.Integer &&
                        new[] { field.Min, field.Max }.Any(x => x.HasValue && decimal.Truncate(x.Value) != x.Value)))
                    return "Numeric bounds are invalid (maximum 14 whole and 4 fractional digits).";
            }
            if (field.MaxLength.HasValue && (field.DataType != CategoryFieldType.Text ||
                field.MaxLength.Value is < 1 or > 10000))
                return "maxLength must be 1-10000 and applies only to Text.";
        }
        return null;
    }

    public async Task<List<CategoryField>> GetEffectiveFieldsAsync(Category category)
    {
        var ids = new List<Guid> { category.Id };
        if (category.ParentCategoryId.HasValue) ids.Add(category.ParentCategoryId.Value);
        var fields = await db.CategoryFields.Where(f => ids.Contains(f.CategoryId)).ToListAsync();
        return fields.OrderBy(f => f.CategoryId == category.Id ? 1 : 0)
            .ThenBy(f => f.SortOrder).ThenBy(f => f.Key).ToList();
    }

    public async Task<Dictionary<string, string[]>> ValidateAttributesAsync(
        Guid? categoryId, Dictionary<string, JsonElement> attributes)
    {
        var errors = new Dictionary<string, string[]>();
        if (categoryId is null)
        {
            errors["categoryId"] = ["Choose a category before entering product details."];
            return errors;
        }
        var category = await db.Categories.Include(c => c.ParentCategory)
            .FirstOrDefaultAsync(c => c.Id == categoryId && c.Active);
        if (category is null || (category.ParentCategoryId.HasValue && category.ParentCategory?.Active != true))
        {
            errors["categoryId"] = ["Category not found or inactive in this tenant."];
            return errors;
        }
        var fields = await GetEffectiveFieldsAsync(category);
        var allowed = fields.Select(f => f.Key).ToHashSet(StringComparer.Ordinal);
        foreach (var key in attributes.Keys.Where(key => !allowed.Contains(key)))
            errors["attributes." + key] = ["This field is not defined for the chosen category."];
        foreach (var field in fields)
        {
            var present = attributes.TryGetValue(field.Key, out var value) &&
                value.ValueKind is not (JsonValueKind.Null or JsonValueKind.Undefined) &&
                !(value.ValueKind == JsonValueKind.String && string.IsNullOrWhiteSpace(value.GetString()));
            if (!present)
            {
                if (field.Required) errors["attributes." + field.Key] = ["This field is required."];
                continue;
            }
            var error = ValidateValue(field, value);
            if (error is not null) errors["attributes." + field.Key] = [error];
        }
        return errors;
    }

    private static string? ValidateValue(CategoryField field, JsonElement value)
    {
        var options = JsonSerializer.Deserialize<List<string>>(field.OptionsJson) ?? [];
        switch (field.DataType)
        {
            case CategoryFieldType.Text:
                return value.ValueKind == JsonValueKind.String && value.GetString()!.Length <= (field.MaxLength ?? 2000)
                    ? null : "Enter text within the permitted length.";
            case CategoryFieldType.Number:
            case CategoryFieldType.Integer:
                if (value.ValueKind != JsonValueKind.Number || !value.TryGetDecimal(out var number) ||
                    (field.DataType == CategoryFieldType.Integer && decimal.Truncate(number) != number))
                    return field.DataType == CategoryFieldType.Integer ? "Enter a whole number." : "Enter a JSON number.";
                return number < field.Min || number > field.Max ? "Number is outside the permitted range." : null;
            case CategoryFieldType.Boolean:
                return value.ValueKind is JsonValueKind.True or JsonValueKind.False ? null : "Enter true or false.";
            case CategoryFieldType.Date:
                return value.ValueKind == JsonValueKind.String &&
                    DateOnly.TryParseExact(value.GetString(), "yyyy-MM-dd", CultureInfo.InvariantCulture,
                        DateTimeStyles.None, out _) ? null : "Use a date in yyyy-MM-dd format.";
            case CategoryFieldType.Select:
                return value.ValueKind == JsonValueKind.String &&
                    options.Contains(value.GetString()!, StringComparer.Ordinal) ? null : "Choose a permitted option.";
            case CategoryFieldType.MultiSelect:
                if (value.ValueKind != JsonValueKind.Array) return "Enter an array of permitted options.";
                var items = value.EnumerateArray().ToList();
                return items.All(x => x.ValueKind == JsonValueKind.String && options.Contains(x.GetString()!)) &&
                    items.Select(x => x.GetString()).Distinct().Count() == items.Count &&
                    (!field.Required || items.Count > 0) ? null : "Choose distinct permitted options.";
            case CategoryFieldType.Image:
                return value.ValueKind == JsonValueKind.String && IsHttpsImageUrl(value.GetString())
                    ? null : "Enter an HTTPS image URL returned by the upload endpoint.";
            default: return "Unsupported field type.";
        }
    }

    public static bool IsHttpsImageUrl(string? url) => url?.Length <= 2048 &&
        Uri.TryCreate(url, UriKind.Absolute, out var uri) && uri.Scheme == "https" &&
        string.IsNullOrEmpty(uri.UserInfo);

    public static CategoryFieldDto ToDto(CategoryField f) => new(f.Key, f.Label, f.DataType,
        f.Required, f.Placeholder, JsonSerializer.Deserialize<List<string>>(f.OptionsJson),
        f.Min, f.Max, f.MaxLength, f.SortOrder);

    public static CategoryField FromDto(string tenant, Guid categoryId, CategoryFieldDto f) => new()
    {
        TenantId = tenant, CategoryId = categoryId, Key = f.Key, Label = f.Label.Trim(),
        DataType = f.DataType, Required = f.Required, Placeholder = f.Placeholder,
        OptionsJson = JsonSerializer.Serialize(f.Options ?? []), Min = f.Min, Max = f.Max,
        MaxLength = f.MaxLength, SortOrder = f.SortOrder
    };
}
