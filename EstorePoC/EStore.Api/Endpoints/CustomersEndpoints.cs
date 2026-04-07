using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class CustomersEndpoints
{
    public static RouteGroupBuilder MapCustomersEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/", UpsertCustomer);
        group.MapGet("/", ListCustomers);
        group.MapGet("/{id:guid}", GetCustomer);
        group.MapGet("/search", SearchCustomers);

        return group;
    }

    // -------------------------------------------------------------
    // 1️⃣ Create or Update Customer (Upsert)
    // -------------------------------------------------------------
    private static async Task<IResult> UpsertCustomer(AppDbContext db, CustomerDto dto)
    {
        var tenant = db.CurrentTenantId!;
        var username = dto.Username.Trim();
        var fullName = dto.FullName.Trim();
        var phoneNumber = dto.PhoneNumber.Trim();
        var email = dto.Email?.Trim();

        var existingByUsername = await db.Customers
            .FirstOrDefaultAsync(c => c.TenantId == tenant && c.Username == username);
        var existingByPhone = await db.Customers
            .FirstOrDefaultAsync(c => c.TenantId == tenant && c.PhoneNumber == phoneNumber);
        var existing = existingByUsername ?? existingByPhone;

        if (existing is null)
        {
            // CREATE
            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                TenantId = tenant,
                Username = username,
                FullName = fullName,
                PhoneNumber = phoneNumber,
                Email = email,
                PreferredLanguage = dto.PreferredLanguage
            };

            db.Customers.Add(customer);
            await db.SaveChangesAsync();

            return Results.Created($"/api/customers/{customer.Id}", customer);
        }
        else
        {
            // UPDATE
            existing.Username = username;
            existing.FullName = fullName;
            if (existingByPhone is null || existingByPhone.Id == existing.Id)
                existing.PhoneNumber = phoneNumber;
            existing.Email = email;
            existing.PreferredLanguage = dto.PreferredLanguage;

            await db.SaveChangesAsync();

            return Results.Ok(existing);
        }
    }

    // -------------------------------------------------------------
    // 2️⃣ Get Customer by ID
    // -------------------------------------------------------------
    private static async Task<IResult> GetCustomer(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;
        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenant);

        return customer is null ? Results.NotFound() : Results.Ok(customer);
    }

    // -------------------------------------------------------------
    // 3️⃣ List All Customers
    // -------------------------------------------------------------
    private static async Task<IResult> ListCustomers(AppDbContext db)
    {
        var tenant = db.CurrentTenantId!;

        var list = await db.Customers
            .Where(c => c.TenantId == tenant)
            .OrderBy(c => c.FullName)
            .ToListAsync();

        return Results.Ok(list);
    }

    // -------------------------------------------------------------
    // 4️⃣ Search Customers (by name/phone/email)
    // -------------------------------------------------------------
    private static async Task<IResult> SearchCustomers(AppDbContext db, string q)
    {
        var tenant = db.CurrentTenantId!;

        if (string.IsNullOrWhiteSpace(q))
            return Results.BadRequest(new { error = "Search query is empty." });

        q = q.Trim().ToLower();

        var list = await db.Customers
            .Where(c => c.TenantId == tenant &&
                        (c.FullName.ToLower().Contains(q) ||
                         c.PhoneNumber.Contains(q) ||
                         (c.Email != null && c.Email.ToLower().Contains(q))))
            .OrderBy(c => c.FullName)
            .ToListAsync();

        return Results.Ok(list);
    }
}

// ---------------------------------------------------------------------------
// DTO
// ---------------------------------------------------------------------------

public record CustomerDto(
    string Username,
    string FullName,
    string PhoneNumber,
    string? Email,
    string? PreferredLanguage);
