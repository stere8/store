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

        group.MapPatch("/{id:guid}/confirm", ConfirmReservation);
        group.MapPatch("/{id:guid}/complete", CompleteReservation);
        group.MapPatch("/{id:guid}/reject", RejectReservation);
        group.MapPatch("/{id:guid}/cancel", CancelReservation);

        return group;
    }

    // -------------------------------------------------------------
    // 1️⃣ Create Reservation (Cart → Reservation)
    // -------------------------------------------------------------
    private static async Task<IResult> CreateReservation(
        AppDbContext db, CreateReservationDto dto)
    {
        var tenant = db.CurrentTenantId!;

        // Validate customer
        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == dto.CustomerId && c.TenantId == tenant);

        if (customer is null)
            return Results.BadRequest(new { error = "Customer not found in tenant." });

        // Validate vendor
        var vendor = await db.Vendors
            .FirstOrDefaultAsync(v => v.Id == dto.VendorId && v.TenantId == tenant);

        if (vendor is null)
            return Results.BadRequest(new { error = "Vendor not found in tenant." });

        // Validate items and calculate total
        decimal total = 0m;
        var items = new List<ReservationItem>();

        foreach (var req in dto.Items)
        {
            var product = await db.Products.FirstOrDefaultAsync(p =>
                p.Id == req.ProductId &&
                p.TenantId == tenant &&
                p.Active);

            if (product is null)
                return Results.BadRequest(new { error = $"Invalid product {req.ProductId}" });

            if (req.Quantity <= 0)
                return Results.BadRequest(new { error = "Quantity must be > 0." });

            if (product.StockQuantity - product.ReservedQuantity < req.Quantity)
                return Results.BadRequest(new { error = $"{product.Name} is out of stock." });

            // Reserve stock (not final until confirmed)
            product.ReservedQuantity += req.Quantity;

            var lineTotal = product.Price * req.Quantity;
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

        // Create reservation object
        var reservation = new Reservation
        {
            Id = Guid.NewGuid(),
            TenantId = tenant,
            CustomerId = dto.CustomerId,
            VendorId = dto.VendorId,
            Status = ReservationStatus.Pending,
            ReservationNumber = ReservationHelper.GenerateNumber(),
            PickupCode = ReservationHelper.GeneratePickupCode(),
            CustomerNotes = dto.CustomerNotes,
            TotalAmount = total,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(12), // default, updated later
            Items = items
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        return Results.Created($"/api/reservations/{reservation.Id}", reservation);
    }

    // -------------------------------------------------------------
    // 2️⃣ List Reservations (admin/global)
    // -------------------------------------------------------------
    private static async Task<IResult> ListReservations(AppDbContext db)
    {
        var tenant = db.CurrentTenantId!;
        var list = await db.Reservations
            .Where(r => r.TenantId == tenant)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Results.Ok(list);
    }

    // -------------------------------------------------------------
    // 3️⃣ List by Vendor
    // -------------------------------------------------------------
    private static async Task<IResult> ListByVendor(AppDbContext db, Guid vendorId)
    {
        var tenant = db.CurrentTenantId!;
        var list = await db.Reservations
            .Where(r => r.TenantId == tenant && r.VendorId == vendorId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Results.Ok(list);
    }

    // -------------------------------------------------------------
    // 4️⃣ List by Customer
    // -------------------------------------------------------------
    private static async Task<IResult> ListByCustomer(AppDbContext db, Guid customerId)
    {
        var tenant = db.CurrentTenantId!;
        var list = await db.Reservations
            .Where(r => r.TenantId == tenant && r.CustomerId == customerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Results.Ok(list);
    }

    // -------------------------------------------------------------
    // 5️⃣ Confirm Reservation (vendor action)
    // -------------------------------------------------------------
    private static async Task<IResult> ConfirmReservation(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;
        var r = await db.Reservations.FirstOrDefaultAsync(r =>
            r.Id == id && r.TenantId == tenant);

        if (r is null) return Results.NotFound();

        if (r.Status != ReservationStatus.Pending)
            return Results.BadRequest(new { error = "Reservation cannot be confirmed." });

        r.Status = ReservationStatus.Confirmed;
        r.ConfirmedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return Results.Ok(r);
    }

    // -------------------------------------------------------------
    // 6️⃣ Complete Reservation (vendor action)
    // -------------------------------------------------------------
    private static async Task<IResult> CompleteReservation(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;
        var r = await db.Reservations
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenant);

        if (r is null) return Results.NotFound();

        if (r.Status != ReservationStatus.Confirmed)
            return Results.BadRequest(new { error = "Reservation cannot be completed." });

        // Finalize stock drop
        foreach (var item in r.Items)
        {
            var p = await db.Products.FirstAsync(x => x.Id == item.ProductId);
            p.StockQuantity -= item.Quantity;
            p.ReservedQuantity -= item.Quantity;
        }

        r.Status = ReservationStatus.Completed;
        r.CompletedAt = DateTimeOffset.UtcNow;
        r.StockFinalized = true;

        await db.SaveChangesAsync();
        return Results.Ok(r);
    }

    // -------------------------------------------------------------
    // 7️⃣ Reject Reservation (vendor action)
    // -------------------------------------------------------------
    private static async Task<IResult> RejectReservation(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;
        var r = await db.Reservations
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenant);

        if (r is null) return Results.NotFound();

        if (r.Status != ReservationStatus.Pending)
            return Results.BadRequest(new { error = "Only pending reservations can be rejected." });

        // Release stock
        foreach (var item in r.Items)
        {
            var p = await db.Products.FirstAsync(x => x.Id == item.ProductId);
            p.ReservedQuantity -= item.Quantity;
        }

        r.Status = ReservationStatus.Rejected;
        r.RejectedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return Results.Ok(r);
    }

    // -------------------------------------------------------------
    // 8️⃣ Cancel Reservation (customer action)
    // -------------------------------------------------------------
    private static async Task<IResult> CancelReservation(AppDbContext db, Guid id)
    {
        var tenant = db.CurrentTenantId!;
        var r = await db.Reservations
            .Include(x => x.Items)
            .FirstOrDefaultAsync(x => x.Id == id && x.TenantId == tenant);

        if (r is null) return Results.NotFound();

        if (r.Status != ReservationStatus.Pending &&
            r.Status != ReservationStatus.Confirmed)
            return Results.BadRequest(new { error = "Cannot cancel this reservation." });

        // Release reserved stock
        foreach (var item in r.Items)
        {
            var p = await db.Products.FirstAsync(x => x.Id == item.ProductId);
            p.ReservedQuantity -= item.Quantity;
        }

        r.Status = ReservationStatus.Cancelled;
        r.CancelledAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return Results.Ok(r);
    }
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

public record CreateReservationDto(
    Guid CustomerId,
    Guid VendorId,
    List<ReservationItemRequest> Items,
    string? CustomerNotes);

public record ReservationItemRequest(Guid ProductId, int Quantity);

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

public static class ReservationHelper
{
    public static string GenerateNumber() =>
        $"RSV-{Guid.NewGuid().ToString()[..8].ToUpper()}";

    public static string GeneratePickupCode() =>
        new Random().Next(100000, 999999).ToString();
}
