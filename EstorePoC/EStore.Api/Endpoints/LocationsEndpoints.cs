using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class LocationsEndpoints
{
    public static RouteGroupBuilder MapLocationsEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/", CreateLocation);
        group.MapGet("/", GetLocations);

        return group;
    }

    private static async Task<IResult> CreateLocation(AppDbContext db, LocationCreateDto dto)
    {
        var tenant = db.CurrentTenantId!;

        var loc = new Location
        {
            Id = Guid.NewGuid(),
            TenantId = tenant,
            Name = dto.Name.Trim(),
            Code = dto.Code?.Trim(),
            Description = dto.Description?.Trim(),
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Locations.Add(loc);
        await db.SaveChangesAsync();

        return Results.Created($"/api/locations/{loc.Id}", loc);
    }

    private static async Task<IResult> GetLocations(AppDbContext db)
    {
        var tenant = db.CurrentTenantId!;
        var data = await db.Locations
            .Where(l => l.TenantId == tenant)
            .OrderBy(l => l.Name)
            .ToListAsync();

        return Results.Ok(data);
    }
}
