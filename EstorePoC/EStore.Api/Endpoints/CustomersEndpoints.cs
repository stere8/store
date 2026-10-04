using EStore.Api.Data;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class CustomersEndpoints
{
    public static RouteGroupBuilder MapCustomersEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/", UpsertCustomer).RequireAuthorization("CustomerOrAdmin");
        group.MapGet("/", ListCustomers).RequireAuthorization(AuthenticationSetup.Admin);
        group.MapPatch("/{id:guid}/archive", ArchiveCustomer).RequireAuthorization(AuthenticationSetup.Admin);
        group.MapGet("/reconciliation/ignores", ListIgnoredReconciliationItems).RequireAuthorization(AuthenticationSetup.Admin);
        group.MapPost("/reconciliation/ignores", UpsertIgnoredReconciliationItem).RequireAuthorization(AuthenticationSetup.Admin);
        group.MapDelete("/reconciliation/ignores/{issueType}/{subjectKey}", DeleteIgnoredReconciliationItem).RequireAuthorization(AuthenticationSetup.Admin);
        group.MapDelete("/by-username/{username}", DeleteCustomerByUsername).RequireAuthorization(AuthenticationSetup.Admin);
        group.MapGet("/{id:guid}", GetCustomer).RequireAuthorization("CustomerOrAdmin");
        group.MapGet("/search", SearchCustomers).RequireAuthorization(AuthenticationSetup.Admin);

        return group;
    }

    // -------------------------------------------------------------
    // 1️⃣ Create or Update Customer (Upsert)
    // -------------------------------------------------------------
    private static async Task<IResult> UpsertCustomer(
        HttpContext context,
        AppDbContext db,
        PointsService pointsService,
        CustomerDto dto,
        CancellationToken cancellationToken)
    {
        var tenant = db.CurrentTenantId!;
        if (string.IsNullOrWhiteSpace(dto.Username) || string.IsNullOrWhiteSpace(dto.FullName) ||
            string.IsNullOrWhiteSpace(dto.PhoneNumber) || dto.Username.Trim().Length > 80 ||
            dto.FullName.Trim().Length > 160 || dto.PhoneNumber.Trim().Length > 32 || dto.Email?.Length > 160)
            return Results.BadRequest(new { error = "Invalid customer profile." });
        var admin = await StoreIdentity.IsAdminAsync(context);
        var subject = await StoreIdentity.CustomerSubjectAsync(context);
        if (!admin && subject != dto.Username.Trim())
            return Results.Forbid(authenticationSchemes: [AuthenticationSetup.Customer]);
        var username = dto.Username.Trim();
        var fullName = dto.FullName.Trim();
        var phoneNumber = dto.PhoneNumber.Trim();
        var email = dto.Email?.Trim();

        var existingByUsername = await db.Customers
            .FirstOrDefaultAsync(c => c.TenantId == tenant && c.Username == username);
        var existingByPhone = await db.Customers
            .FirstOrDefaultAsync(c => c.TenantId == tenant && c.PhoneNumber == phoneNumber);
        var existing = existingByUsername ?? existingByPhone;
        if (!admin && existingByPhone is not null && existingByPhone.Username != username)
            return Results.Conflict(new { error = "This phone is linked to another profile; contact an administrator." });
        if (await db.Customers.AnyAsync(c => c.TenantId == tenant && c.Email == email &&
            c.Id != (existing == null ? Guid.Empty : existing.Id) && email != null))
            return Results.Conflict(new { error = "Email is already linked to another profile." });

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
                PreferredLanguage = dto.PreferredLanguage,
                IsArchived = false
            };

            db.Customers.Add(customer);
            await db.SaveChangesAsync(cancellationToken);
            await pointsService.MatchPendingReferralsForCustomerAsync(customer, cancellationToken);

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
            existing.IsArchived = false;
            existing.ArchivedAt = null;
            existing.ArchivedReason = null;

            await db.SaveChangesAsync(cancellationToken);
            await pointsService.MatchPendingReferralsForCustomerAsync(existing, cancellationToken);

            return Results.Ok(existing);
        }
    }

    // -------------------------------------------------------------
    // 2️⃣ Get Customer by ID
    // -------------------------------------------------------------
    private static async Task<IResult> GetCustomer(HttpContext context, AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;
        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenant);

        if (customer is null) return Results.NotFound();
        if (!await StoreIdentity.IsAdminAsync(context) &&
            customer.Username != await StoreIdentity.CustomerSubjectAsync(context))
            return Results.NotFound();
        return Results.Ok(customer);
    }

    // -------------------------------------------------------------
    // 3️⃣ List All Customers
    // -------------------------------------------------------------
    private static async Task<IResult> ListCustomers(AppDbContext db, bool includeArchived = false)
    {
        var tenant = db.CurrentTenantId!;

        var query = db.Customers
            .Where(c => c.TenantId == tenant);

        if (!includeArchived)
            query = query.Where(c => !c.IsArchived);

        var list = await query
            .OrderBy(c => c.FullName)
            .ToListAsync();

        return Results.Ok(list);
    }

    private static async Task<IResult> ArchiveCustomer(AppDbContext db, Guid id, ArchiveCustomerDto? dto)
    {
        var tenant = db.CurrentTenantId!;
        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == id && c.TenantId == tenant);

        if (customer is null)
            return Results.NotFound(new { error = "Customer not found." });

        customer.IsArchived = true;
        customer.ArchivedAt = DateTimeOffset.UtcNow;
        customer.ArchivedReason = string.IsNullOrWhiteSpace(dto?.Reason)
            ? "Archived from admin reconciliation."
            : dto!.Reason!.Trim();

        await db.SaveChangesAsync();

        return Results.Ok(customer);
    }

    private static async Task<IResult> ListIgnoredReconciliationItems(AppDbContext db)
    {
        var tenant = db.CurrentTenantId!;

        var items = await db.CustomerIdentityIgnores
            .Where(x => x.TenantId == tenant)
            .OrderByDescending(x => x.CreatedAt)
            .ToListAsync();

        return Results.Ok(items);
    }

    private static async Task<IResult> UpsertIgnoredReconciliationItem(
        AppDbContext db,
        CustomerIdentityIgnoreDto dto)
    {
        var tenant = db.CurrentTenantId!;
        var issueType = NormalizeIssueType(dto.IssueType);
        var subjectKey = dto.SubjectKey.Trim();
        var fingerprint = dto.Fingerprint.Trim();

        if (issueType is null)
            return Results.BadRequest(new { error = "IssueType must be clerk-only, db-only, or mismatched." });

        if (string.IsNullOrWhiteSpace(subjectKey) || string.IsNullOrWhiteSpace(fingerprint))
            return Results.BadRequest(new { error = "SubjectKey and Fingerprint are required." });

        var existing = await db.CustomerIdentityIgnores
            .FirstOrDefaultAsync(x =>
                x.TenantId == tenant &&
                x.IssueType == issueType &&
                x.SubjectKey == subjectKey);

        if (existing is null)
        {
            existing = new CustomerIdentityIgnore
            {
                TenantId = tenant,
                IssueType = issueType,
                SubjectKey = subjectKey,
                Fingerprint = fingerprint,
                CreatedAt = DateTimeOffset.UtcNow
            };
            db.CustomerIdentityIgnores.Add(existing);
        }
        else
        {
            existing.Fingerprint = fingerprint;
            existing.CreatedAt = DateTimeOffset.UtcNow;
        }

        await db.SaveChangesAsync();

        return Results.Ok(existing);
    }

    private static async Task<IResult> DeleteIgnoredReconciliationItem(
        AppDbContext db,
        string issueType,
        string subjectKey)
    {
        var tenant = db.CurrentTenantId!;
        var normalizedIssueType = NormalizeIssueType(issueType);
        var normalizedSubjectKey = Uri.UnescapeDataString(subjectKey).Trim();

        if (normalizedIssueType is null || string.IsNullOrWhiteSpace(normalizedSubjectKey))
            return Results.BadRequest(new { error = "IssueType and subjectKey are required." });

        var existing = await db.CustomerIdentityIgnores
            .FirstOrDefaultAsync(x =>
                x.TenantId == tenant &&
                x.IssueType == normalizedIssueType &&
                x.SubjectKey == normalizedSubjectKey);

        if (existing is null)
            return Results.NoContent();

        db.CustomerIdentityIgnores.Remove(existing);
        await db.SaveChangesAsync();

        return Results.NoContent();
    }

    private static async Task<IResult> DeleteCustomerByUsername(AppDbContext db, string username)
    {
        var tenant = db.CurrentTenantId!;
        username = Uri.UnescapeDataString(username).Trim();

        if (string.IsNullOrWhiteSpace(username))
            return Results.BadRequest(new { error = "Username is required." });

        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.TenantId == tenant && c.Username == username);

        if (customer is null)
            return Results.NoContent();

        var hasLinkedReservations = await db.Reservations
            .AnyAsync(r => r.TenantId == tenant && r.CustomerId == customer.Id);
        var hasLinkedCarts = await db.ShoppingCarts
            .AnyAsync(c => c.TenantId == tenant && c.CustomerId == customer.Id);
        var hasLinkedReviews = await db.Reviews
            .AnyAsync(r => r.TenantId == tenant && r.CustomerId == customer.Id);
        var hasLinkedReferrals = await db.Referrals
            .AnyAsync(r =>
                r.TenantId == tenant &&
                (r.RecommenderCustomerId == customer.Id || r.RecommendedCustomerId == customer.Id));
        var hasPointTransactions = await db.PointTransactions
            .AnyAsync(t => t.TenantId == tenant && t.CustomerId == customer.Id);
        var hasPointBalance = await db.CustomerPointBalances
            .AnyAsync(b => b.TenantId == tenant && b.CustomerId == customer.Id);
        var hasChatHistory = await db.ChatConversations
            .AnyAsync(c => c.CustomerId == customer.Id);

        if (!hasLinkedReservations &&
            !hasLinkedCarts &&
            !hasLinkedReviews &&
            !hasLinkedReferrals &&
            !hasPointTransactions &&
            !hasPointBalance &&
            !hasChatHistory)
        {
            db.Customers.Remove(customer);
            await db.SaveChangesAsync();
            return Results.NoContent();
        }

        customer.FullName = "Deleted customer";
        customer.Email = null;
        customer.PreferredLanguage = null;
        customer.PhoneNumber = customer.Id.ToString("N");
        customer.IsArchived = true;
        customer.ArchivedAt = DateTimeOffset.UtcNow;
        customer.ArchivedReason = "Archived after Clerk user deletion.";

        await db.SaveChangesAsync();

        return Results.NoContent();
    }

    // -------------------------------------------------------------
    // 4️⃣ Search Customers (by name/phone/email)
    // -------------------------------------------------------------
    private static async Task<IResult> SearchCustomers(
        AppDbContext db,
        string q,
        bool includeArchived = false)
    {
        var tenant = db.CurrentTenantId!;

        if (string.IsNullOrWhiteSpace(q))
            return Results.BadRequest(new { error = "Search query is empty." });

        q = q.Trim().ToLower();

        var query = db.Customers
            .Where(c => c.TenantId == tenant &&
                        (c.FullName.ToLower().Contains(q) ||
                         c.PhoneNumber.Contains(q) ||
                         c.Username.ToLower().Contains(q) ||
                         (c.Email != null && c.Email.ToLower().Contains(q))));

        if (!includeArchived)
            query = query.Where(c => !c.IsArchived);

        var list = await query
            .OrderBy(c => c.FullName)
            .ToListAsync();

        return Results.Ok(list);
    }

    private static string? NormalizeIssueType(string issueType)
    {
        var normalized = issueType?.Trim().ToLowerInvariant();

        return normalized is "clerk-only" or "db-only" or "mismatched"
            ? normalized
            : null;
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

public record ArchiveCustomerDto(string? Reason);

public record CustomerIdentityIgnoreDto(
    string IssueType,
    string SubjectKey,
    string Fingerprint);
