using EStore.Api.Data;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// =======================================================================
// DATABASE CONFIGURATION (UPDATED FOR SQL SERVER)
// =======================================================================

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.CommandTimeout(60);
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 3,
            maxRetryDelay: TimeSpan.FromSeconds(5),
            errorNumbersToAdd: null);
    });

    // DEV diagnostics
    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});

builder.Services.AddCors(options =>
    options.AddPolicy("any", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Payment strategy placeholder
builder.Services.AddSingleton<IPaymentGatewayFactory, PaymentGatewayFactory>();

var app = builder.Build();

// =======================================================================
// MIDDLEWARE
// =======================================================================

app.UseCors("any");
app.UseSwagger();
app.UseSwaggerUI();

// Tenant extractor (header "X-Tenant-Id" or query "tenantId")
app.Use(async (ctx, next) =>
{
    var tenant = ctx.Request.Headers["X-Tenant-Id"].FirstOrDefault()
              ?? ctx.Request.Query["tenantId"].FirstOrDefault()
              ?? "kigali-city-mall";

    var db = ctx.RequestServices.GetRequiredService<AppDbContext>();
    db.CurrentTenantId = tenant;

    await next();
});

// =======================================================================
// DATABASE INITIALIZATION (NEW)
// =======================================================================

await EnsureDatabaseAsync(app);

// =======================================================================
// HEALTH CHECK
// =======================================================================

app.MapGet("/health", () => Results.Ok(new { ok = true, ts = DateTimeOffset.UtcNow }));

// =======================================================================
// LOCATIONS
// =======================================================================

app.MapPost("/api/locations", async (AppDbContext db, LocationCreateDto dto) =>
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
});

app.MapGet("/api/locations", async (AppDbContext db) =>
{
    var list = await db.Locations.OrderBy(x => x.Name).ToListAsync();
    return Results.Ok(list);
});

// =======================================================================
// VENDORS
// =======================================================================

app.MapPost("/api/vendors/register", async (AppDbContext db, VendorCreateDto dto) =>
{
    var tenant = db.CurrentTenantId!;

    if (dto.LocationId is Guid locId)
    {
        var valid = await db.Locations.AnyAsync(l => l.Id == locId && l.TenantId == tenant);
        if (!valid) return Results.BadRequest(new { error = "Location not found in this tenant." });
    }

    var v = new Vendor
    {
        Id = Guid.NewGuid(),
        TenantId = tenant,
        DisplayName = dto.DisplayName.Trim(),
        LegalName = dto.LegalName.Trim(),
        ContactPhone = dto.ContactPhone.Trim(),
        ContactEmail = dto.ContactEmail?.Trim(),
        Description = dto.Description?.Trim(),
        LocationId = dto.LocationId,
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

// =======================================================================
// PRODUCTS
// =======================================================================

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

    var vendorExists = await db.Vendors.AnyAsync(v =>
        v.TenantId == tenant && v.Id == dto.VendorId && v.Active);

    if (!vendorExists)
        return Results.BadRequest(new { error = "Vendor not found or inactive in this tenant." });

    var p = new Product
    {
        Id = Guid.NewGuid(),
        TenantId = tenant,
        VendorId = dto.VendorId,
        Name = dto.Name.Trim(),
        Description = dto.Description?.Trim(),
        Price = dto.Price,
        StockQuantity = dto.Stock,
        ImageUrl = dto.ImageUrl,
        Active = true,
        CreatedAt = DateTimeOffset.UtcNow
    };

    db.Products.Add(p);
    await db.SaveChangesAsync();

    return Results.Created($"/api/products/{p.Id}", p);
});

// =======================================================================
// CARTS
// =======================================================================

app.MapPost("/api/carts/ensure", async (AppDbContext db, EnsureCartDto dto) =>
{
    var tenant = db.CurrentTenantId!;

    var exists = await db.Customers.AnyAsync(c => c.Id == dto.CustomerId && c.TenantId == tenant);
    if (!exists) return Results.BadRequest(new { error = "Customer not found in this tenant." });

    var cart = await db.ShoppingCarts
        .Include(c => c.Items)
        .FirstOrDefaultAsync(c => c.TenantId == tenant && c.CustomerId == dto.CustomerId && c.IsActive);

    if (cart is null)
    {
        cart = new ShoppingCart
        {
            TenantId = tenant,
            CustomerId = dto.CustomerId,
            IsActive = true,
            CreatedAt = DateTimeOffset.UtcNow,
            UpdatedAt = DateTimeOffset.UtcNow
        };
        db.ShoppingCarts.Add(cart);
        await db.SaveChangesAsync();
    }

    return Results.Ok(cart);
});

app.MapPost("/api/carts/{cartId:guid}/items", async (AppDbContext db, Guid cartId, AddCartItemDto dto) =>
{
    if (dto.Quantity <= 0)
        return Results.BadRequest(new { error = "Quantity must be > 0." });

    var tenant = db.CurrentTenantId!;

    var cart = await db.ShoppingCarts
        .Include(c => c.Items)
        .FirstOrDefaultAsync(c => c.Id == cartId && c.TenantId == tenant && c.IsActive);

    if (cart is null)
        return Results.NotFound(new { error = "Cart not found or not active." });

    var product = await db.Products.FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.TenantId == tenant && p.Active);
    if (product is null)
        return Results.BadRequest(new { error = "Product not found or inactive in this tenant." });

    var existing = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);

    if (existing is null)
    {
        cart.Items.Add(new ShoppingCartItem
        {
            ProductId = dto.ProductId,
            Quantity = dto.Quantity
        });
    }
    else
    {
        existing.Quantity += dto.Quantity;
    }

    cart.UpdatedAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok(cart);
});

app.MapGet("/api/carts/{cartId:guid}", async (AppDbContext db, Guid cartId) =>
{
    var tenant = db.CurrentTenantId!;
    var cart = await db.ShoppingCarts
        .Include(c => c.Items)
        .ThenInclude(i => i.Product)
        .FirstOrDefaultAsync(c => c.Id == cartId && c.TenantId == tenant);

    return cart is null ? Results.NotFound() : Results.Ok(cart);
});

app.MapDelete("/api/carts/{cartId:guid}/items/{productId:guid}",
    async (AppDbContext db, Guid cartId, Guid productId) =>
    {
        var tenant = db.CurrentTenantId!;

        var cart = await db.ShoppingCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.Id == cartId && c.TenantId == tenant && c.IsActive);

        if (cart is null)
            return Results.NotFound(new { error = "Cart not found or not active." });

        var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
        if (item is null)
            return Results.NotFound(new { error = "Item not found." });

        db.ShoppingCartItems.Remove(item);
        cart.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return Results.NoContent();
    });

// =======================================================================
// RESERVATIONS
// =======================================================================

// Create a reservation
app.MapPost("/api/reservations", async (AppDbContext db, CreateReservationDto dto) =>
{
    var tenantId = db.CurrentTenantId!;
    if (dto.Items is null || dto.Items.Count == 0)
        return Results.BadRequest(new { error = "At least one item is required." });

    var vendor = await db.Vendors.FirstOrDefaultAsync(v => v.Id == dto.VendorId && v.TenantId == tenantId && v.Active);
    if (vendor is null)
        return Results.BadRequest(new { error = "Vendor not found or inactive in this tenant." });

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

        prod.ReservedQuantity += item.Quantity;
        total += line;
    }

    reservation.TotalAmount = total;
    db.Reservations.Add(reservation);
    await db.SaveChangesAsync();
    return Results.Created($"/api/reservations/{reservation.Id}", reservation);
});

// List reservations for a vendor with optional filters
app.MapGet("/api/vendors/{vendorId:guid}/reservations",
    async (AppDbContext db, Guid vendorId, string? status, DateTimeOffset? from, DateTimeOffset? to) =>
    {
        var tenantId = db.CurrentTenantId!;
        var q = db.Reservations
            .Include(r => r.Items)
            .Where(r => r.TenantId == tenantId && r.VendorId == vendorId);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ReservationStatus>(status, true, out var st))
            q = q.Where(r => r.Status == st);
        if (from.HasValue) q = q.Where(r => r.CreatedAt >= from.Value);
        if (to.HasValue) q = q.Where(r => r.CreatedAt <= to.Value);

        var list = await q.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return Results.Ok(list);
    });

// Update reservation status (with guard rules)
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

        if (reservation.Status == ReservationStatus.Completed && newStatus == ReservationStatus.Completed)
            return Results.BadRequest(new { error = "Already completed." });

        bool IsTerminal(ReservationStatus s) => s is ReservationStatus.Completed or ReservationStatus.Rejected or ReservationStatus.Cancelled;
        if (IsTerminal(reservation.Status) && reservation.Status != newStatus)
            return Results.BadRequest(new { error = $"Cannot transition from {reservation.Status} to {newStatus}." });

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

// =======================================================================
// REVIEWS
// =======================================================================

// Create a review
app.MapPost("/api/products/{productId:guid}/reviews", async (AppDbContext db, Guid productId, CreateReviewDto dto) =>
{
    if (dto.Rating < 1 || dto.Rating > 5)
        return Results.BadRequest(new { error = "Rating must be between 1 and 5." });

    var tenant = db.CurrentTenantId!;
    var productExists = await db.Products.AnyAsync(p => p.Id == productId && p.TenantId == tenant && p.Active);
    if (!productExists) return Results.BadRequest(new { error = "Product not found or inactive." });

    var customerExists = await db.Customers.AnyAsync(c => c.Id == dto.CustomerId && c.TenantId == tenant);
    if (!customerExists) return Results.BadRequest(new { error = "Customer not found in this tenant." });

    var duplicate = await db.Reviews.AnyAsync(r => r.TenantId == tenant && r.ProductId == productId && r.CustomerId == dto.CustomerId);
    if (duplicate) return Results.Conflict(new { error = "You have already reviewed this product." });

    var review = new Review
    {
        TenantId = tenant,
        ProductId = productId,
        CustomerId = dto.CustomerId,
        Rating = dto.Rating,
        Title = dto.Title?.Trim(),
        Comment = dto.Comment?.Trim(),
        IsPublished = true,
        CreatedAt = DateTimeOffset.UtcNow
    };
    db.Reviews.Add(review);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{productId}/reviews/{review.Id}", review);
});

// List reviews (paginated)
app.MapGet("/api/products/{productId:guid}/reviews", async (AppDbContext db, Guid productId, int page = 1, int pageSize = 20) =>
{
    var tenant = db.CurrentTenantId!;
    if (page < 1) page = 1;
    if (pageSize < 1 || pageSize > 100) pageSize = 20;

    var query = db.Reviews
        .Where(r => r.TenantId == tenant && r.ProductId == productId && r.IsPublished)
        .OrderByDescending(r => r.CreatedAt);

    var total = await query.CountAsync();
    var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
    return Results.Ok(new { total, page, pageSize, items });
});

// =======================================================================
// MAINTENANCE: EXPIRE PENDING
// =======================================================================

// Cancel expired Pending reservations and release holds
app.MapPost("/api/reservations/maintenance/expire", async (AppDbContext db) =>
{
    var tenant = db.CurrentTenantId!;
    var now = DateTimeOffset.UtcNow;

    var toExpire = await db.Reservations
        .Include(r => r.Items)
        .Where(r => r.TenantId == tenant && r.Status == ReservationStatus.Pending && r.ExpiresAt <= now)
        .ToListAsync();
    if (!toExpire.Any()) return Results.Ok(new { expired = 0 });

    var productIds = toExpire.SelectMany(r => r.Items.Select(i => i.ProductId)).Distinct().ToList();
    var products = await db.Products.Where(p => p.TenantId == tenant && productIds.Contains(p.Id)).ToListAsync();

    foreach (var res in toExpire)
    {
        foreach (var item in res.Items)
        {
            var prod = products.First(p => p.Id == item.ProductId);
            prod.ReservedQuantity -= item.Quantity;
            if (prod.ReservedQuantity < 0) prod.ReservedQuantity = 0;
        }
        res.Status = ReservationStatus.Cancelled;
        res.CancelledAt = now;
    }
    await db.SaveChangesAsync();
    return Results.Ok(new { expired = toExpire.Count });
});

app.Run();

static async Task EnsureDatabaseAsync(WebApplication app)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        await db.Database.EnsureCreatedAsync();

        var pending = await db.Database.GetPendingMigrationsAsync();
        if (pending.Any())
        {
            logger.LogInformation("Applying {Count} migrations…", pending.Count());
            await db.Database.MigrateAsync();
        }

        await SeedDatabaseAsync(db, logger);

        logger.LogInformation("Database initialization completed");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database initialization FAILED");
        throw;
    }
}

static async Task SeedDatabaseAsync(AppDbContext db, ILogger logger)
{
    if (await db.Tenants.AnyAsync())
    {
        logger.LogInformation("Seed skipped — database not empty");
        return;
    }

    logger.LogInformation("Seeding database…");

    var tenants = new[]
    {
        new Tenant
        {
            Id = "kigali-city-mall",
            Name = "Kigali City Mall",
            Slug = "kigali-city-mall",
            ContactEmail = "info@kcm.rw",
            TimeZone = "Africa/Kigali",
            DefaultExpiryHours = 24,
            CreatedAt = DateTimeOffset.UtcNow
        },
        new Tenant
        {
            Id = "chic-complex",
            Name = "Chic Complex",
            Slug = "chic-complex",
            ContactEmail = "info@chic.rw",
            TimeZone = "Africa/Kigali",
            DefaultExpiryHours = 12,
            CreatedAt = DateTimeOffset.UtcNow
        }
    };

    db.Tenants.AddRange(tenants);

    var locations = new[]
    {
        new Location
        {
            Id = Guid.NewGuid(),
            TenantId = "kigali-city-mall",
            Name = "Ground Floor - East Wing",
            Code = "GF-E",
            Description = "Main entrance area",
            CreatedAt = DateTimeOffset.UtcNow
        },
        new Location
        {
            Id = Guid.NewGuid(),
            TenantId = "kigali-city-mall",
            Name = "First Floor - Food Court",
            Code = "1F-FC",
            Description = "Food court",
            CreatedAt = DateTimeOffset.UtcNow
        },
        new Location
        {
            Id = Guid.NewGuid(),
            TenantId = "chic-complex",
            Name = "Shop Unit A1",
            Code = "A1",
            Description = "Corner unit",
            CreatedAt = DateTimeOffset.UtcNow
        }
    };

    db.Locations.AddRange(locations);

    await db.SaveChangesAsync();

    logger.LogInformation("Seed complete: {Tenants} tenants, {Locations} locations",
        tenants.Length, locations.Length);
}


// =======================================================================
// DTOs
// =======================================================================

public record LocationCreateDto(string Name, string? Code, string? Description);
public record VendorCreateDto(string DisplayName, string LegalName, string ContactPhone, string? ContactEmail, Guid? LocationId, string? Description);
public record ProductCreateDto(Guid VendorId, string Name, string? Description, decimal Price, int Stock, string? ImageUrl);
public record CreateReservationDto(Guid VendorId, string CustomerName, string CustomerPhone, string? CustomerEmail, string? CustomerNote, string? PreferredLanguage, List<CreateReservationItemDto> Items);
public record CreateReservationItemDto(Guid ProductId, int Quantity);
public record EnsureCartDto(Guid CustomerId);
public record AddCartItemDto(Guid ProductId, int Quantity);
public record CreateReviewDto(int Rating, string? Title, string? Comment, Guid CustomerId);

// =======================================================================
// HELPERS
// =======================================================================

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
