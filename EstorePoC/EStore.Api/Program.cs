using EStore.Api.Data;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// Services
builder.Services.AddDbContext<AppDbContext>(o => o.UseInMemoryDatabase("estore"));
builder.Services.AddCors(o => o.AddPolicy("any", p => p
    .AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Payment strategy
builder.Services.AddSingleton<IPaymentGatewayFactory, PaymentGatewayFactory>(); // uses mock gateways

var app = builder.Build();

// Middleware
app.UseCors("any");
app.UseSwagger();
app.UseSwaggerUI();

// Simple multi-tenant extractor (header or query; default mall-a)
// In Program.cs (after app creation)
app.Use(async (ctx, next) =>
{
    var tenant = ctx.Request.Headers["X-Tenant-Id"].FirstOrDefault()
              ?? ctx.Request.Query["tenantId"].FirstOrDefault()
              ?? "kigali-city-mall";

    // Set on DbContext for global filters
    var db = ctx.RequestServices.GetRequiredService<AppDbContext>();
    db.CurrentTenantId = tenant;

    await next();
});

// Health
app.MapGet("/health", () => Results.Ok(new { ok = true, ts = DateTime.UtcNow }));

// ---------------- Vendors ----------------
app.MapPost("/api/vendors/register", async (AppDbContext db, VendorCreateDto dto) =>
{
    var tenant = db.CurrentTenantId!;
    var v = new Vendor
    {
        Id = Guid.NewGuid(),
        TenantId = tenant,
        DisplayName = dto.DisplayName.Trim(),
        LegalName = dto.LegalName.Trim(),
        StoreLocation = dto.StoreLocation?.Trim(),
        ContactPhone = dto.ContactPhone.Trim(),
        ContactEmail = dto.ContactEmail?.Trim(),
        Active = true,
        Verified = false,
        CreatedAt = DateTimeOffset.UtcNow
    };
    db.Vendors.Add(v);
    await db.SaveChangesAsync();
    return Results.Created($"/api/vendors/{v.Id}", v);
});

app.MapGet("/api/vendors", async (AppDbContext db) =>
{
    var tenant = db.CurrentTenantId!;
    var list = await db.Vendors
        .Where(x => x.TenantId == tenant)
        .OrderByDescending(x => x.CreatedAt)
        .ToListAsync();
    return Results.Ok(list);
});

// ---------------- Products ----------------
app.MapGet("/api/products", async (AppDbContext db) =>
{
    var tenant = db.CurrentTenantId!;
    var list = await db.Products
        .Where(p => p.TenantId == tenant && p.Active)
        .OrderBy(p => p.Name)
        .ToListAsync();
    return Results.Ok(list);
});

app.MapPost("/api/products", async (AppDbContext db, ProductCreateDto dto) =>
{
    var tenant = db.CurrentTenantId!;
    if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.Stock < 0)
        return Results.BadRequest(new { error = "Invalid product payload." });

    var existsVendor = await db.Vendors.AnyAsync(v => v.TenantId == tenant && v.Id == dto.VendorId && v.Active);
    if (!existsVendor)
        return Results.BadRequest(new { error = "Vendor not found (or inactive) in this tenant." });

    var p = new Product
    {
        Id = Guid.NewGuid(),
        TenantId = tenant,
        VendorId = dto.VendorId,
        Name = dto.Name.Trim(),
        Description = dto.Description?.Trim(),
        Price = dto.Price,
        StockQuantity = dto.Stock,              // set the canonical field
        ImageUrl = dto.ImageUrl,
        Active = true,
        CreatedAt = DateTimeOffset.UtcNow
    };
    db.Products.Add(p);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{p.Id}", p);
});

// ---------------- Reservations ----------------

// POST create reservation (holds stock)
app.MapPost("/api/reservations", async (AppDbContext db, CreateReservationDto dto) =>
{
    var tenantId = db.CurrentTenantId!;
    if (dto.Items is null || dto.Items.Count == 0)
        return Results.BadRequest(new { error = "At least one item is required." });

    var vendor = await db.Vendors.FirstOrDefaultAsync(v => v.Id == dto.VendorId && v.TenantId == tenantId && v.Active);
    if (vendor is null) return Results.BadRequest(new { error = "Vendor not found or inactive in this tenant." });

    // Upsert customer by phone
    var customer = await db.Customers.FirstOrDefaultAsync(c => c.TenantId == tenantId && c.PhoneNumber == dto.CustomerPhone);
    if (customer is null)
    {
        customer = new Customer
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            FullName = dto.CustomerName.Trim(),
            PhoneNumber = dto.CustomerPhone.Trim(),
            Email = dto.CustomerEmail?.Trim(),
            PreferredLanguage = dto.PreferredLanguage
        };
        db.Customers.Add(customer);
    }
    else
    {
        customer.FullName = dto.CustomerName.Trim();
        if (!string.IsNullOrWhiteSpace(dto.CustomerEmail)) customer.Email = dto.CustomerEmail.Trim();
        if (!string.IsNullOrWhiteSpace(dto.PreferredLanguage)) customer.PreferredLanguage = dto.PreferredLanguage;
    }

    // Validate products + stock
    var productIds = dto.Items.Select(i => i.ProductId).Distinct().ToList();
    var products = await db.Products
        .Where(p => p.TenantId == tenantId && p.VendorId == dto.VendorId && productIds.Contains(p.Id) && p.Active)
        .ToListAsync();

    if (products.Count != productIds.Count)
        return Results.BadRequest(new { error = "One or more products not found/active for this vendor/tenant." });

    foreach (var item in dto.Items)
    {
        if (item.Quantity <= 0) return Results.BadRequest(new { error = "Quantity must be > 0." });
        var prod = products.First(p => p.Id == item.ProductId);
        var available = prod.StockQuantity - prod.ReservedQuantity;
        if (available < item.Quantity)
            return Results.BadRequest(new { error = $"Not enough stock for {prod.Name}. Available: {available}" });
    }

    // Build reservation
    var reservation = new Reservation
    {
        Id = Guid.NewGuid(),
        TenantId = tenantId,
        CustomerId = customer.Id,
        VendorId = vendor.Id,
        ReservationNumber = ProgramHelpers.GenerateReservationNumber(tenantId),
        PickupCode = ProgramHelpers.GeneratePickupCode(),
        Status = ReservationStatus.Pending,
        CustomerNotes = dto.CustomerNote,
        CreatedAt = DateTimeOffset.UtcNow,
        ExpiresAt = ProgramHelpers.ComputeExpiry(db, tenantId)
    };

    decimal total = 0m;
    foreach (var item in dto.Items)
    {
        var prod = products.First(p => p.Id == item.ProductId);
        var unit = prod.Price;
        var line = unit * item.Quantity;

        reservation.Items.Add(new ReservationItem
        {
            Id = Guid.NewGuid(),
            ReservationId = reservation.Id,
            ProductId = prod.Id,
            Quantity = item.Quantity,
            UnitPrice = unit,
            LineTotal = line
        });

        prod.ReservedQuantity += item.Quantity; // hold
        total += line;
    }

    reservation.TotalAmount = total;
    db.Reservations.Add(reservation);
    await db.SaveChangesAsync();
    return Results.Created($"/api/reservations/{reservation.Id}", reservation);
});

// GET list reservations for a vendor (filters optional)
app.MapGet("/api/vendors/{vendorId:guid}/reservations",
    async (AppDbContext db, Guid vendorId, string? status, DateTimeOffset? from, DateTimeOffset? to) =>
    {
        var tenantId = db.CurrentTenantId!;
        var q = db.Reservations
            .Include(r => r.Items)
            .Where(r => r.TenantId == tenantId && r.VendorId == vendorId);

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<ReservationStatus>(status, true, out var st))
            q = q.Where(r => r.Status == st);

        if (from.HasValue) q = q.Where(r => r.CreatedAt >= from.Value);
        if (to.HasValue) q = q.Where(r => r.CreatedAt <= to.Value);

        var list = await q.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Results.Ok(list);
    });

// PATCH status (timestamps + stock finalize/release)
app.MapPatch("/api/reservations/{reservationId:guid}/status",
    async (AppDbContext db, Guid reservationId, string status) =>
    {
        var tenant = db.CurrentTenantId!;
        var reservation = await db.Reservations
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r => r.Id == reservationId && r.TenantId == tenant);

        if (reservation is null)
            return Results.NotFound(new { error = "Reservation not found." });

        if (!Enum.TryParse<ReservationStatus>(status, ignoreCase: true, out var newStatus))
            return Results.BadRequest(new { error = $"Invalid status '{status}'." });

        if (reservation.Status == ReservationStatus.Completed &&
    Enum.TryParse<ReservationStatus>(status, true, out var tmp) && tmp == ReservationStatus.Completed)
            return Results.BadRequest(new { error = "Already completed." });

        bool IsTerminal(ReservationStatus s) =>
            s is ReservationStatus.Completed or ReservationStatus.Rejected or ReservationStatus.Cancelled;

        if (IsTerminal(reservation.Status) &&
            Enum.TryParse<ReservationStatus>(status, true, out var ns) && reservation.Status != ns)
            return Results.BadRequest(new { error = $"Cannot transition from {reservation.Status} to {ns}." });


        switch (newStatus)
        {
            case ReservationStatus.Confirmed:
                reservation.Status = ReservationStatus.Confirmed;
                reservation.ConfirmedAt = DateTimeOffset.UtcNow;
                break;

            case ReservationStatus.Completed:
                var prodIds = reservation.Items.Select(i => i.ProductId).Distinct().ToList();
                var prods = await db.Products.Where(p => p.TenantId == tenant && prodIds.Contains(p.Id)).ToListAsync();
                foreach (var li in reservation.Items)
                {
                    var prod = prods.First(p => p.Id == li.ProductId);
                    prod.ReservedQuantity -= li.Quantity;
                    prod.StockQuantity -= li.Quantity;
                }
                reservation.Status = ReservationStatus.Completed;
                reservation.CompletedAt = DateTimeOffset.UtcNow;
                reservation.StockFinalized = true;
                break;

            case ReservationStatus.Rejected:
            case ReservationStatus.Cancelled:
                var pids = reservation.Items.Select(i => i.ProductId).Distinct().ToList();
                var ps = await db.Products.Where(p => p.TenantId == tenant && pids.Contains(p.Id)).ToListAsync();
                foreach (var li in reservation.Items)
                {
                    var prod = ps.First(p => p.Id == li.ProductId);
                    prod.ReservedQuantity -= li.Quantity;
                }
                reservation.Status = newStatus;
                if (newStatus == ReservationStatus.Rejected) reservation.RejectedAt = DateTimeOffset.UtcNow;
                if (newStatus == ReservationStatus.Cancelled) reservation.CancelledAt = DateTimeOffset.UtcNow;
                break;

            default:
                reservation.Status = newStatus;
                break;
        }

        await db.SaveChangesAsync();
        return Results.Ok(reservation);
    });



app.Run();

// DTOs
public record VendorCreateDto(string DisplayName, string LegalName, string ContactPhone, string? ContactEmail, string? StoreLocation);
public record ProductCreateDto(Guid VendorId, string Name, string? Description, decimal Price, int Stock, string? ImageUrl);
public record CreateReservationDto(
    Guid VendorId,
    string CustomerName,
    string CustomerPhone,
    string? CustomerEmail,
    string? CustomerNote,
    string? PreferredLanguage,
    List<CreateReservationItemDto> Items);
public record CreateReservationItemDto(Guid ProductId, int Quantity);

// Helpers (as a type, not top-level statements)
public static class ProgramHelpers
{
    public static string GeneratePickupCode()
    {
        var n = RandomNumberGenerator.GetInt32(0, 1_000_000);
        return n.ToString("D6");
    }

    public static string GenerateReservationNumber(string tenantId)
    {
        var shortTenant = tenantId.Length > 6 ? tenantId[..6].ToUpperInvariant() : tenantId.ToUpperInvariant();
        var rnd = RandomNumberGenerator.GetInt32(100, 1000);
        return $"RES-{shortTenant}-{DateTime.UtcNow:yyyyMMddHHmmss}-{rnd}";
    }

    public static DateTimeOffset ComputeExpiry(AppDbContext db, string tenantId)
    {
        var hours = db.Tenants.Where(t => t.Id == tenantId).Select(t => t.DefaultExpiryHours).FirstOrDefault();
        if (hours <= 0) hours = 24;
        return DateTimeOffset.UtcNow.AddHours(hours);
    }
}
