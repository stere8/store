using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class ReservationsEndpoints
{
    public static RouteGroupBuilder MapReservationsEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/", CreateReservation);

        group.MapGet("/", ListReservations);
        group.MapGet("/vendor/{vendorId:guid}", ListByVendor);
        group.MapGet("/customer/{customerId:guid}", ListByCustomer);

        group.MapGet("/{id:guid}", GetReservationDetails);

        group.MapPatch("/{id:guid}/confirm", ConfirmReservation);
        group.MapPatch("/{id:guid}/complete", CompleteReservation);
        group.MapPatch("/{id:guid}/reject", RejectReservation);
        group.MapPatch("/{id:guid}/cancel", CancelReservation);

        group.MapPatch("/{id:guid}/note", UpdateCustomerNotes);

        return group;
    }

    // =====================================================================
    // 1️⃣ CREATE RESERVATION
    // =====================================================================
    private static async Task<IResult> CreateReservation(AppDbContext db, CreateReservationDto dto)
    {
        var tenant = db.CurrentTenantId!;

        // Validate customer
        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == dto.CustomerId && c.TenantId == tenant);

        if (customer is null)
            return Results.BadRequest(new { error = "Customer not found in this tenant." });

        // Validate vendor
        var vendor = await db.Vendors
            .FirstOrDefaultAsync(v => v.Id == dto.VendorId && v.TenantId == tenant && v.Active);

        if (vendor is null)
            return Results.BadRequest(new { error = "Vendor not found or inactive." });

        if (dto.Items is null || dto.Items.Count == 0)
            return Results.BadRequest(new { error = "Reservation must contain items." });

        decimal total = 0m;
        var items = new List<ReservationItem>();

        foreach (var req in dto.Items)
        {
            if (req.Quantity <= 0)
                return Results.BadRequest(new { error = "Quantity must be > 0." });

            var product = await db.Products.FirstOrDefaultAsync(p =>
                p.Id == req.ProductId &&
                p.TenantId == tenant &&
                p.VendorId == dto.VendorId &&
                p.Active);

            if (product is null)
                return Results.BadRequest(new { error = $"Product {req.ProductId} not found or inactive." });

            var available = product.StockQuantity - product.ReservedQuantity;

            if (available < req.Quantity)
                return Results.BadRequest(new { error = $"{product.Name} has only {available} available." });

            product.ReservedQuantity += req.Quantity;

            var lineTotal = req.Quantity * product.Price;
            total += lineTotal;

            items.Add(new ReservationItem
            {
                Id = Guid.NewGuid(),
                TenantId = tenant,
                ProductId = product.Id,
                Quantity = req.Quantity,
                UnitPrice = product.Price,
                LineTotal = lineTotal
            });
        }

        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            TenantId = tenant,
            CustomerId = dto.CustomerId,
            VendorId = dto.VendorId,
            Status = ReservationStatus.Pending,
            ReservationNumber = ReservationHelper.GenerateNumber(),
            PickupCode = ReservationHelper.GeneratePickupCode(),
            CustomerNotes = dto.CustomerNotes?.Trim(),
            TotalAmount = total,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(12),
            Items = items
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        return Results.Created($"/api/reservations/{reservation.Id}", reservation);
    }

    // =====================================================================
    // 2️⃣ LIST ALL (TENANT ADMIN)
    // =====================================================================
    private static async Task<IResult> ListReservations(AppDbContext db)
    {
        var tenant = db.CurrentTenantId!;

        var list = await db.Reservations
            .Where(r => r.TenantId == tenant)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Results.Ok(list);
    }

    // =====================================================================
    // 3️⃣ LIST BY VENDOR
    // =====================================================================
    private static async Task<IResult> ListByVendor(AppDbContext db, Guid vendorId)
    {
        var tenant = db.CurrentTenantId!;

        var list = await db.Reservations
            .Where(r => r.TenantId == tenant && r.VendorId == vendorId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Results.Ok(list);
    }

    // =====================================================================
    // 4️⃣ LIST BY CUSTOMER
    // =====================================================================
    private static async Task<IResult> ListByCustomer(AppDbContext db, Guid customerId)
    {
        var tenant = db.CurrentTenantId!;

        var list = await db.Reservations
            .Where(r => r.TenantId == tenant && r.CustomerId == customerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Results.Ok(list);
    }

    // =====================================================================
    // 5️⃣ GET RESERVATION DETAILS
    // =====================================================================
    private static async Task<IResult> GetReservationDetails(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;

        var res = await db.Reservations
            .Include(r => r.Items)
            .ThenInclude(i => i.Product)
            .Include(r => r.Customer)
            .Include(r => r.Vendor)
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenant);

        return res is null ? Results.NotFound() : Results.Ok(res);
    }

    // =====================================================================
    // 6️⃣ CONFIRM
    // =====================================================================
    private static async Task<IResult> ConfirmReservation(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;

        var r = await db.Reservations.FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenant);
        if (r is null) return Results.NotFound();

        if (r.Status != ReservationStatus.Pending)
            return Results.BadRequest(new { error = "Only pending reservations can be confirmed." });

        r.Status = ReservationStatus.Confirmed;
        r.ConfirmedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return Results.Ok(r);
    }

    // =====================================================================
    // 7️⃣ COMPLETE
    // =====================================================================
    private static async Task<IResult> CompleteReservation(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;

        var r = await db.Reservations
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenant);

        if (r is null) return Results.NotFound();

        if (r.Status != ReservationStatus.Confirmed)
            return Results.BadRequest(new { error = "Only confirmed reservations can be completed." });

        foreach (var item in r.Items)
        {
            var p = await db.Products.FirstAsync(p => p.Id == item.ProductId);

            p.ReservedQuantity -= item.Quantity;
            p.StockQuantity -= item.Quantity;

            if (p.ReservedQuantity < 0) p.ReservedQuantity = 0;
        }

        r.Status = ReservationStatus.Completed;
        r.CompletedAt = DateTimeOffset.UtcNow;
        r.StockFinalized = true;

        await db.SaveChangesAsync();
        return Results.Ok(r);
    }

    // =====================================================================
    // 8️⃣ REJECT
    // =====================================================================
    private static async Task<IResult> RejectReservation(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;

        var r = await db.Reservations
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenant);

        if (r is null) return Results.NotFound();

        if (r.Status != ReservationStatus.Pending)
            return Results.BadRequest(new { error = "Only pending reservations can be rejected." });

        foreach (var item in r.Items)
        {
            var p = await db.Products.FirstAsync(p => p.Id == item.ProductId);
            p.ReservedQuantity -= item.Quantity;
            if (p.ReservedQuantity < 0) p.ReservedQuantity = 0;
        }

        r.Status = ReservationStatus.Rejected;
        r.RejectedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return Results.Ok(r);
    }

    // =====================================================================
    // 9️⃣ CANCEL
    // =====================================================================
    private static async Task<IResult> CancelReservation(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;

        var r = await db.Reservations
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenant);

        if (r is null) return Results.NotFound();

        if (r.Status is ReservationStatus.Completed or ReservationStatus.Rejected)
            return Results.BadRequest(new { error = "Cannot cancel a finalized reservation." });

        foreach (var item in r.Items)
        {
            var p = await db.Products.FirstAsync(p => p.Id == item.ProductId);
            p.ReservedQuantity -= item.Quantity;
            if (p.ReservedQuantity < 0) p.ReservedQuantity = 0;
        }

        r.Status = ReservationStatus.Cancelled;
        r.CancelledAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return Results.Ok(r);
    }

    // =====================================================================
    // 🔟 UPDATE CUSTOMER NOTES
    // =====================================================================
    private static async Task<IResult> UpdateCustomerNotes(AppDbContext db, Guid id, UpdateNoteDto dto)
    {
        var tenant = db.CurrentTenantId!;

        var r = await db.Reservations.FirstOrDefaultAsync(r => r.Id == id && r.TenantId == tenant);
        if (r is null) return Results.NotFound();

        r.CustomerNotes = dto.Note?.Trim();
        await db.SaveChangesAsync();

        return Results.Ok(r);
    }
}

// ============================================================================
// DTOs
// ============================================================================

public record CreateReservationDto(
    Guid CustomerId,
    Guid VendorId,
    List<ReservationItemRequest> Items,
    string? CustomerNotes);

public record ReservationItemRequest(Guid ProductId, int Quantity);

public record UpdateNoteDto(string? Note);

// ============================================================================
// Helper
// ============================================================================

public static class ReservationHelper
{
    public static string GenerateNumber() =>
        $"RSV-{Guid.NewGuid().ToString()[..8].ToUpper()}";

    public static string GeneratePickupCode() =>
        new Random().Next(100000, 999999).ToString("D6");
}
