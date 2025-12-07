using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class TenantsEndpoints
{
    public static RouteGroupBuilder MapTenantsEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/", GetTenants);
        group.MapGet("/{id}", GetTenantById);
        group.MapPost("/", CreateTenant);
        group.MapPatch("/{id}/expiry", UpdateDefaultExpiryHours);

        return group;
    }

    // -------------------------------------------------------------
    // 1️⃣ List All Tenants (Malls)
    // -------------------------------------------------------------
    private static async Task<IResult> GetTenants(AppDbContext db)
    {
        var tenants = await db.Tenants
            .OrderBy(t => t.Name)
            .Select(t => new TenantDto(
                t.Id,
                t.Name,
                t.Slug,
                t.ContactEmail,
                t.TimeZone,
                t.DefaultExpiryHours,
                t.CreatedAt
            ))
            .ToListAsync();

        return Results.Ok(tenants);
    }

    // -------------------------------------------------------------
    // 2️⃣ Get Tenant by ID
    // -------------------------------------------------------------
    private static async Task<IResult> GetTenantById(AppDbContext db, string id)
    {
        var t = await db.Tenants
            .Where(x => x.Id == id)
            .Select(x => new TenantDto(
                x.Id,
                x.Name,
                x.Slug,
                x.ContactEmail,
                x.TimeZone,
                x.DefaultExpiryHours,
                x.CreatedAt
            ))
            .FirstOrDefaultAsync();

        return t is null ? Results.NotFound(new { error = "Tenant not found." }) : Results.Ok(t);
    }

    // -------------------------------------------------------------
    // 3️⃣ Create Tenant (Mall)
    // -------------------------------------------------------------
    private static async Task<IResult> CreateTenant(AppDbContext db, CreateTenantDto dto)
    {
        // Validate slug uniqueness
        var exists = await db.Tenants.AnyAsync(t => t.Slug == dto.Slug);
        if (exists)
            return Results.BadRequest(new { error = "Slug already exists." });

        var tenant = new Tenant
        {
            Id = dto.Id ?? dto.Slug, // allow custom ID or default to slug
            Name = dto.Name.Trim(),
            Slug = dto.Slug.Trim(),
            ContactEmail = dto.ContactEmail?.Trim(),
            TimeZone = dto.TimeZone?.Trim() ?? "Africa/Kigali",
            DefaultExpiryHours = dto.DefaultExpiryHours > 0 ? dto.DefaultExpiryHours : 24,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Tenants.Add(tenant);
        await db.SaveChangesAsync();

        return Results.Created($"/api/tenants/{tenant.Id}", tenant);
    }

    // -------------------------------------------------------------
    // 4️⃣ Update Default Expiry Hours
    // -------------------------------------------------------------
    private static async Task<IResult> UpdateDefaultExpiryHours(AppDbContext db, string id, UpdateExpiryDto dto)
    {
        var tenant = await db.Tenants.FirstOrDefaultAsync(t => t.Id == id);

        if (tenant is null)
            return Results.NotFound(new { error = "Tenant not found." });

        if (dto.Hours <= 0)
            return Results.BadRequest(new { error = "Hours must be > 0." });

        tenant.DefaultExpiryHours = dto.Hours;

        await db.SaveChangesAsync();
        return Results.Ok(new { message = "Expiry updated.", tenant.Id, tenant.DefaultExpiryHours });
    }
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

public record TenantDto(
    string Id,
    string Name,
    string Slug,
    string? ContactEmail,
    string TimeZone,
    int DefaultExpiryHours,
    DateTimeOffset CreatedAt);

public record CreateTenantDto(
    string? Id,
    string Name,
    string Slug,
    string? ContactEmail,
    string? TimeZone,
    int DefaultExpiryHours);

public record UpdateExpiryDto(int Hours);
