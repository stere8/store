using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class CategoriesEndpoints
{
    public static RouteGroupBuilder MapCategoriesEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/", CreateCategory);
        group.MapGet("/", GetCategories);
        group.MapPut("/{id:guid}", UpdateCategory);
        group.MapDelete("/{id:guid}", DeleteCategory);

        return group;
    }

    // -------------------------------------------------------------
    // CREATE
    // -------------------------------------------------------------
    private static async Task<IResult> CreateCategory(AppDbContext db, CategoryCreateDto dto)
    {
        var tenant = db.CurrentTenantId!;

        var exists = await db.Categories
            .AnyAsync(x => x.TenantId == tenant && x.Name == dto.Name.Trim());

        if (exists)
            return Results.Conflict(new { error = "Category already exists." });

        var c = new Category
        {
            Id = Guid.NewGuid(),
            TenantId = tenant,
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            Active = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Categories.Add(c);
        await db.SaveChangesAsync();

        return Results.Created($"/api/categories/{c.Id}", c);
    }

    // -------------------------------------------------------------
    // LIST
    // -------------------------------------------------------------
    private static async Task<IResult> GetCategories(AppDbContext db)
    {
        var tenant = db.CurrentTenantId!;
        var list = await db.Categories
            .Where(c => c.TenantId == tenant && c.Active)
            .OrderBy(c => c.Name)
            .ToListAsync();

        return Results.Ok(list);
    }

    // -------------------------------------------------------------
    // UPDATE
    // -------------------------------------------------------------
    private
