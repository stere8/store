using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class CategoriesEndpoints
{
    public static RouteGroupBuilder MapCategoriesEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", List).Produces<List<CategoryDto>>();
        group.MapGet("/{id:guid}", Get).Produces<CategoryDto>();
        group.MapGet("/{id:guid}/form", GetForm).Produces<CategoryFormDto>();
        group.MapGet("/{id:guid}/subcategories", ListChildren).Produces<List<CategoryDto>>();
        group.MapPost("/", Create).RequireAuthorization(AuthenticationSetup.Admin).Produces<CategoryDto>(201);
        group.MapPost("/{id:guid}/subcategories", CreateChild).RequireAuthorization(AuthenticationSetup.Admin).Produces<CategoryDto>(201);
        group.MapPut("/{id:guid}", Update).RequireAuthorization(AuthenticationSetup.Admin).Produces<CategoryDto>();
        group.MapPut("/{id:guid}/fields", UpdateFields).RequireAuthorization(AuthenticationSetup.Admin).Produces<CategoryDto>();
        group.MapDelete("/{id:guid}", Delete).RequireAuthorization(AuthenticationSetup.Admin);
        return group;
    }

    private static CategoryDto ToDto(Category c) => new(c.Id, c.Name, c.Description,
        c.ParentCategoryId, c.Active, c.CreatedAt,
        c.Fields.OrderBy(f => f.SortOrder).ThenBy(f => f.Key).Select(CategoryFormService.ToDto).ToList());

    private static async Task<IResult> List(AppDbContext db, Guid? parentCategoryId)
    {
        var query = db.Categories.Include(c => c.Fields).Where(c => c.Active);
        if (parentCategoryId.HasValue) query = query.Where(c => c.ParentCategoryId == parentCategoryId);
        return Results.Ok((await query.OrderBy(c => c.Name).ToListAsync()).Select(ToDto));
    }

    private static async Task<IResult> Get(AppDbContext db, Guid id)
    {
        var category = await db.Categories.Include(c => c.Fields).FirstOrDefaultAsync(c => c.Id == id && c.Active);
        return category is null ? Results.NotFound() : Results.Ok(ToDto(category));
    }

    private static async Task<IResult> ListChildren(AppDbContext db, Guid id)
    {
        if (!await db.Categories.AnyAsync(c => c.Id == id && c.Active && c.ParentCategoryId == null))
            return Results.NotFound();
        return Results.Ok((await db.Categories.Include(c => c.Fields)
            .Where(c => c.Active && c.ParentCategoryId == id).OrderBy(c => c.Name).ToListAsync()).Select(ToDto));
    }

    private static async Task<IResult> GetForm(AppDbContext db, CategoryFormService forms, Guid id)
    {
        var category = await db.Categories.Include(c => c.ParentCategory)
            .FirstOrDefaultAsync(c => c.Id == id && c.Active);
        if (category is null || (category.ParentCategoryId.HasValue && category.ParentCategory?.Active != true))
            return Results.NotFound();
        var fields = await forms.GetEffectiveFieldsAsync(category);
        return Results.Ok(new CategoryFormDto(category.Id, category.ParentCategoryId,
            category.Name, fields.Select(CategoryFormService.ToDto).ToList()));
    }

    private static async Task<string?> Validate(AppDbContext db, CategoryWriteDto dto, Guid? excludeId = null)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || dto.Name.Trim().Length > 160)
            return "Category name is required and must be at most 160 characters.";
        if (await db.Categories.AnyAsync(c => c.Id != excludeId &&
            c.ParentCategoryId == dto.ParentCategoryId && c.Name == dto.Name.Trim()))
            return "Category name already exists under this parent.";
        if (dto.ParentCategoryId.HasValue && !await db.Categories.AnyAsync(c =>
            c.Id == dto.ParentCategoryId && c.Active && c.ParentCategoryId == null))
            return "The parent must be an active top-level category in this tenant.";
        if (dto.Fields is null) return null;
        var error = CategoryFormService.ValidateDefinitions(dto.Fields);
        if (error is not null) return error;
        var keys = dto.Fields.Select(f => f.Key).ToList();
        if (dto.ParentCategoryId.HasValue)
        {
            if (await db.CategoryFields.AnyAsync(f => f.CategoryId == dto.ParentCategoryId && keys.Contains(f.Key)))
                return "Subcategory fields cannot reuse an inherited parent field key.";
        }
        else if (excludeId.HasValue && await db.CategoryFields.AnyAsync(f =>
            f.Category!.ParentCategoryId == excludeId && keys.Contains(f.Key)))
            return "A field key is already used by a subcategory.";
        return null;
    }

    private static async Task<IResult> Create(AppDbContext db, CategoryWriteDto dto)
    {
        var error = await Validate(db, dto);
        if (error is not null) return Results.BadRequest(new { error });
        var category = new Category
        {
            TenantId = db.CurrentTenantId!, Id = Guid.NewGuid(), Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(), ParentCategoryId = dto.ParentCategoryId,
            Active = true, CreatedAt = DateTimeOffset.UtcNow
        };
        category.Fields = (dto.Fields ?? []).Select(f => CategoryFormService.FromDto(
            db.CurrentTenantId!, category.Id, f)).ToList();
        db.Categories.Add(category);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException ex) when (DatabaseErrors.IsUniqueViolation(ex))
        { return Results.Conflict(new { error = "Category name already exists." }); }
        return Results.Created($"/api/categories/{category.Id}", ToDto(category));
    }

    private static Task<IResult> CreateChild(AppDbContext db, Guid id, CategoryWriteDto dto) =>
        Create(db, dto with { ParentCategoryId = id });

    private static async Task<IResult> Update(AppDbContext db, Guid id, CategoryWriteDto dto)
    {
        var category = await db.Categories.Include(c => c.Fields).FirstOrDefaultAsync(c => c.Id == id && c.Active);
        if (category is null) return Results.NotFound();
        if (dto.ParentCategoryId != category.ParentCategoryId)
            return Results.BadRequest(new { error = "Changing a category's parent is not supported. Include its current parentCategoryId." });
        var error = await Validate(db, dto, id);
        if (error is not null) return Results.BadRequest(new { error });
        category.Name = dto.Name.Trim();
        category.Description = dto.Description?.Trim();
        if (dto.Fields is not null) SetFields(db, category, dto.Fields);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException ex) when (DatabaseErrors.IsUniqueViolation(ex))
        { return Results.Conflict(new { error = "Category name already exists." }); }
        return Results.Ok(ToDto(category));
    }

    private static async Task<IResult> UpdateFields(AppDbContext db, Guid id, CategoryFieldsWriteDto dto)
    {
        if (dto.Fields is null) return Results.BadRequest(new { error = "fields is required." });
        var category = await db.Categories.Include(c => c.Fields).FirstOrDefaultAsync(c => c.Id == id && c.Active);
        return category is null ? Results.NotFound() :
            await Update(db, id, new CategoryWriteDto(category.Name, category.Description,
                category.ParentCategoryId, dto.Fields));
    }

    private static void SetFields(AppDbContext db, Category category, List<CategoryFieldDto> fields)
    {
        var keep = fields.Select(f => f.Key).ToHashSet();
        foreach (var obsolete in category.Fields.Where(f => !keep.Contains(f.Key)).ToList())
        {
            db.CategoryFields.Remove(obsolete);
            category.Fields.Remove(obsolete);
        }
        foreach (var field in fields)
        {
            var existing = category.Fields.FirstOrDefault(f => f.Key == field.Key);
            var replacement = CategoryFormService.FromDto(category.TenantId, category.Id, field);
            if (existing is null) category.Fields.Add(replacement);
            else
            {
                replacement.Id = existing.Id;
                db.Entry(existing).CurrentValues.SetValues(replacement);
            }
        }
    }

    private static async Task<IResult> Delete(AppDbContext db, Guid id)
    {
        var category = await db.Categories.FirstOrDefaultAsync(c => c.Id == id && c.Active);
        if (category is null) return Results.NotFound();
        if (await db.Categories.AnyAsync(c => c.ParentCategoryId == id && c.Active) ||
            await db.Products.AnyAsync(p => p.CategoryId == id && p.Active))
            return Results.Conflict(new { error = "Remove active products and subcategories before deleting this category." });
        category.Active = false;
        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}

public record CategoryFieldsWriteDto(List<CategoryFieldDto>? Fields);
