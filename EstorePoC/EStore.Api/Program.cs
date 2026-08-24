using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Endpoints;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Services
var connectionString = GetRequiredSqlServerConnectionString(builder.Configuration);

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});
builder.Services.AddCors(options => options.AddPolicy("any", p =>
    p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
});
builder.Services.AddDataProtection();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Payment strategy placeholder (currently unused)
builder.Services.AddSingleton<IPaymentGatewayFactory, PaymentGatewayFactory>();
builder.Services.AddSingleton<VendorAuthService>();
builder.Services.AddScoped<PointsService>();

var app = builder.Build();

// Middleware
app.UseCors("any");
app.UseSwagger();
app.UseSwaggerUI();

app.Logger.LogInformation("Using SQL Server with the configured database connection.");

// Tenant extractor (header "X-Tenant-Id" or query "tenantId"; default Kigali City Mall)
app.Use(async (ctx, next) =>
{
    var tenant = ctx.Request.Headers["X-Tenant-Id"].FirstOrDefault()
              ?? ctx.Request.Query["tenantId"].FirstOrDefault()
              ?? "kigali-city-mall";

    var db = ctx.RequestServices.GetRequiredService<AppDbContext>();
    db.CurrentTenantId = tenant;

    await next();
});

// Health
app.MapGet("/health", () => Results.Ok(new { ok = true, ts = DateTimeOffset.UtcNow }));

// Reuse the endpoint modules for routes the storefront already depends on.
app.MapGroup("/api/categories").MapCategoriesEndpoints();
app.MapGroup("/api/customers").MapCustomersEndpoints();
app.MapGroup("/api/referrals").MapReferralsEndpoints();
app.MapGroup("/api/points").MapPointsEndpoints();
app.MapGroup("/api/vendor-auth").MapVendorAuthEndpoints();
app.MapGroup("/api/vendor-portal").MapVendorPortalEndpoints();

// =======================================================================
// LOCATIONS
// =======================================================================

// Create a location for the current tenant
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

// List locations for current tenant
app.MapGet("/api/locations", async (AppDbContext db) =>
{
    var list = await db.Locations.OrderBy(x => x.Name).ToListAsync();
    return Results.Ok(list);
});

// =======================================================================
// VENDORS
// =======================================================================

// Register a new vendor
app.MapPost("/api/vendors/register", async (AppDbContext db, VendorCreateDto dto) =>
{
    var tenant = db.CurrentTenantId!;
    var contactEmail = dto.ContactEmail?.Trim().ToLowerInvariant();
    if (dto.LocationId is Guid locId)
    {
        var valid = await db.Locations.AnyAsync(l => l.Id == locId && l.TenantId == tenant);
        if (!valid) return Results.BadRequest(new { error = "Location not found in this tenant." });
    }

    if (!string.IsNullOrWhiteSpace(contactEmail))
    {
        var emailExists = await db.Vendors.AnyAsync(v =>
            v.TenantId == tenant &&
            (v.ContactEmail == contactEmail || v.AccountEmail == contactEmail));
        if (emailExists)
        {
            return Results.BadRequest(new { error = "That vendor email is already in use for this tenant." });
        }
    }

    var v = new Vendor
    {
        Id = Guid.NewGuid(),
        TenantId = tenant,
        DisplayName = dto.DisplayName.Trim(),
        LegalName = dto.LegalName.Trim(),
        ContactPhone = dto.ContactPhone.Trim(),
        ContactEmail = contactEmail,
        RegistrationCode = null,
        Description = dto.Description?.Trim(),
        LocationId = dto.LocationId,
        Active = true,
        Verified = false,
        CreatedAt = DateTimeOffset.UtcNow
    };
    db.Vendors.Add(v);
    await db.SaveChangesAsync();
    return Results.Created($"/api/vendors/{v.Id}", new VendorDetailDto(
        v.Id,
        v.TenantId,
        v.LocationId,
        v.DisplayName,
        v.LegalName,
        v.ContactPhone,
        v.ContactEmail,
        v.Description,
        v.Active,
        v.Verified,
        v.CreatedAt,
        false,
        v.RegistrationCode,
        v.AccountEmail,
        v.AccountRegisteredAt,
        v.LastLoginAt));
});

// List vendors for current tenant
app.MapGet("/api/vendors", async (AppDbContext db) =>
{
    var tenant = db.CurrentTenantId!;
    var list = await db.Vendors
        .Where(x => x.TenantId == tenant)
        .OrderByDescending(x => x.CreatedAt)
        .Select(v => new VendorSummaryDto(
            v.Id,
            v.TenantId,
            v.LocationId,
            v.DisplayName,
            v.LegalName,
            v.ContactPhone,
            v.ContactEmail,
            v.Description,
            v.Active,
            v.Verified,
            v.CreatedAt,
            v.AccountEmail != null,
            v.AccountEmail,
            v.AccountRegisteredAt,
            v.LastLoginAt))
        .ToListAsync();
    return Results.Ok(list);
});

app.MapGet("/api/vendors/{id:guid}", async (AppDbContext db, Guid id) =>
{
    var tenant = db.CurrentTenantId!;
    var vendor = await db.Vendors
        .Where(v => v.TenantId == tenant && v.Id == id)
        .Select(v => new VendorDetailDto(
            v.Id,
            v.TenantId,
            v.LocationId,
            v.DisplayName,
            v.LegalName,
            v.ContactPhone,
            v.ContactEmail,
            v.Description,
            v.Active,
            v.Verified,
            v.CreatedAt,
            v.AccountEmail != null,
            v.RegistrationCode,
            v.AccountEmail,
            v.AccountRegisteredAt,
            v.LastLoginAt))
        .FirstOrDefaultAsync();

    return vendor is null
        ? Results.NotFound(new { error = "Vendor not found." })
        : Results.Ok(vendor);
});

app.MapPatch("/api/vendors/{id:guid}/approve", async (AppDbContext db, Guid id, bool verified = true) =>
{
    var tenant = db.CurrentTenantId!;

    if (!verified)
        return Results.BadRequest(new { error = "Approval endpoint only supports verified=true." });

    var vendor = await db.Vendors
        .FirstOrDefaultAsync(v => v.Id == id && v.TenantId == tenant);
    if (vendor is null)
        return Results.NotFound(new { error = "Vendor not found." });

    if (!vendor.Verified)
    {
        vendor.Verified = true;
    }

    if (string.IsNullOrWhiteSpace(vendor.RegistrationCode))
    {
        vendor.RegistrationCode = ProgramHelpers.GenerateRegistrationCode();
    }

    await db.SaveChangesAsync();

    return Results.Ok(new VendorSummaryDto(
        vendor.Id,
        vendor.TenantId,
        vendor.LocationId,
        vendor.DisplayName,
        vendor.LegalName,
        vendor.ContactPhone,
        vendor.ContactEmail,
        vendor.Description,
        vendor.Active,
        vendor.Verified,
        vendor.CreatedAt,
        vendor.AccountEmail != null,
        vendor.AccountEmail,
        vendor.AccountRegisteredAt,
        vendor.LastLoginAt));
});

// =======================================================================
// PRODUCTS
// =======================================================================

// List active products for current tenant
app.MapGet("/api/products", async (AppDbContext db) =>
{
    var tenant = db.CurrentTenantId!;
    var list = await db.Products
        .Where(p => p.TenantId == tenant && p.Active)
        .OrderBy(p => p.Name)
        .Select(p => new ProductListItemDto(
            p.Id,
            p.VendorId,
            p.Vendor != null ? p.Vendor.DisplayName : null,
            p.Name,
            p.Description,
            p.Price,
            p.ImageUrl,
            p.CategoryId,
            p.Category != null ? p.Category.Name : null,
            p.StockQuantity,
            p.ReservedQuantity,
            p.Active,
            p.CreatedAt))
        .ToListAsync();
    return Results.Ok(list);
});

// Create a product
app.MapPost("/api/products", async (AppDbContext db, ProductCreateDto dto) =>
{
    var tenant = db.CurrentTenantId!;
    if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.Stock < 0)
        return Results.BadRequest(new { error = "Invalid product payload." });

    var vendorExists = await db.Vendors.AnyAsync(v =>
        v.TenantId == tenant && v.Id == dto.VendorId && v.Active);
    if (!vendorExists)
        return Results.BadRequest(new { error = "Vendor not found (or inactive) in this tenant." });

    if (dto.CategoryId.HasValue)
    {
        var categoryExists = await db.Categories.AnyAsync(c =>
            c.TenantId == tenant && c.Id == dto.CategoryId.Value && c.Active);
        if (!categoryExists)
            return Results.BadRequest(new { error = "Category not found (or inactive) in this tenant." });
    }

    var p = new Product
    {
        Id = Guid.NewGuid(),
        TenantId = tenant,
        VendorId = dto.VendorId,
        Name = dto.Name.Trim(),
        Description = dto.Description?.Trim(),
        CategoryId = dto.CategoryId,
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

app.MapPut("/api/products/{id:guid}", async (AppDbContext db, Guid id, ProductUpdateDto dto) =>
{
    var tenant = db.CurrentTenantId!;

    var product = await db.Products
        .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenant && p.Active);
    if (product is null)
        return Results.NotFound(new { error = "Product not found or inactive." });

    if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.Stock < 0)
        return Results.BadRequest(new { error = "Invalid product payload." });

    var vendorExists = await db.Vendors.AnyAsync(v =>
        v.TenantId == tenant && v.Id == dto.VendorId && v.Active);
    if (!vendorExists)
        return Results.BadRequest(new { error = "Vendor not found (or inactive) in this tenant." });

    if (dto.CategoryId.HasValue)
    {
        var categoryExists = await db.Categories.AnyAsync(c =>
            c.TenantId == tenant && c.Id == dto.CategoryId.Value && c.Active);
        if (!categoryExists)
            return Results.BadRequest(new { error = "Category not found (or inactive) in this tenant." });
    }

    product.VendorId = dto.VendorId;
    product.Name = dto.Name.Trim();
    product.Description = dto.Description?.Trim();
    product.CategoryId = dto.CategoryId;
    product.Price = dto.Price;
    product.StockQuantity = dto.Stock;

    await db.SaveChangesAsync();
    return Results.Ok(product);
});

app.MapDelete("/api/products/{id:guid}", async (AppDbContext db, Guid id) =>
{
    var tenant = db.CurrentTenantId!;

    var product = await db.Products
        .FirstOrDefaultAsync(p => p.Id == id && p.TenantId == tenant && p.Active);
    if (product is null)
        return Results.NotFound(new { error = "Product not found or inactive." });

    product.Active = false;
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// =======================================================================
// CARTS
// =======================================================================

// Ensure a customer has one active cart
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

// Add or increment an item in a cart
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
        db.ShoppingCartItems.Add(new ShoppingCartItem
        {
            Id = Guid.NewGuid(),
            ShoppingCartId = cart.Id,
            ProductId = dto.ProductId,
            Quantity = dto.Quantity,
            UnitPrice = product.Price,
            LineTotal = product.Price * dto.Quantity
        });
    }
    else
    {
        existing.Quantity += dto.Quantity;
        existing.UnitPrice = product.Price;
        existing.LineTotal = product.Price * existing.Quantity;
    }

    cart.UpdatedAt = DateTimeOffset.UtcNow;
    await db.SaveChangesAsync();

    var hydratedCart = await db.ShoppingCarts
        .Include(c => c.Items)
        .ThenInclude(i => i.Product)
        .FirstOrDefaultAsync(c => c.Id == cartId && c.TenantId == tenant);

    return Results.Ok(hydratedCart ?? cart);
});

// Get a cart with items
app.MapGet("/api/carts/{cartId:guid}", async (AppDbContext db, Guid cartId) =>
{
    var tenant = db.CurrentTenantId!;
    var cart = await db.ShoppingCarts
        .Include(c => c.Items)
        .ThenInclude(i => i.Product)
        .FirstOrDefaultAsync(c => c.Id == cartId && c.TenantId == tenant);
    return cart is null ? Results.NotFound() : Results.Ok(cart);
});

// Remove an item from cart
app.MapDelete("/api/carts/{cartId:guid}/items/{productId:guid}", async (AppDbContext db, Guid cartId, Guid productId) =>
{
    var tenant = db.CurrentTenantId!;
    var cart = await db.ShoppingCarts
        .Include(c => c.Items)
        .FirstOrDefaultAsync(c => c.Id == cartId && c.TenantId == tenant && c.IsActive);
    if (cart is null)
        return Results.NotFound(new { error = "Cart not found or not active." });

    var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);
    if (item is null)
        return Results.NotFound(new { error = "Item not in cart." });

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
    if (dto.VendorId == Guid.Empty)
        return Results.BadRequest(new { error = "VendorId is required." });

    if (string.IsNullOrWhiteSpace(dto.CustomerName) || string.IsNullOrWhiteSpace(dto.CustomerPhone))
        return Results.BadRequest(new { error = "CustomerName and CustomerPhone are required." });

    if (dto.Items is null || dto.Items.Count == 0)
        return Results.BadRequest(new { error = "At least one item is required." });

    if (dto.Items.Any(i => i.ProductId == Guid.Empty))
        return Results.BadRequest(new { error = "Each reservation item must include a ProductId." });

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
            Username = dto.CustomerPhone.Trim(),
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
            TenantId = tenantId,
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

    var hydratedReservation = await db.Reservations
        .Include(r => r.Customer)
        .Include(r => r.Vendor)
        .Include(r => r.Items)
        .ThenInclude(i => i.Product)
        .FirstAsync(r => r.Id == reservation.Id);

    return Results.Created($"/api/reservations/{reservation.Id}", hydratedReservation);
});

// List reservations for current tenant
app.MapGet("/api/reservations", async (AppDbContext db) =>
{
    var tenant = db.CurrentTenantId!;
    var reservations = await db.Reservations
        .Include(r => r.Customer)
        .Include(r => r.Vendor)
        .Include(r => r.Items)
        .ThenInclude(i => i.Product)
        .Where(r => r.TenantId == tenant)
        .OrderByDescending(r => r.CreatedAt)
        .ToListAsync();

    return Results.Ok(reservations);
});

// Get a reservation by id
app.MapGet("/api/reservations/{reservationId:guid}", async (AppDbContext db, Guid reservationId) =>
{
    var tenant = db.CurrentTenantId!;
    var reservation = await db.Reservations
        .Include(r => r.Customer)
        .Include(r => r.Vendor)
        .Include(r => r.Items)
        .ThenInclude(i => i.Product)
        .FirstOrDefaultAsync(r => r.Id == reservationId && r.TenantId == tenant);

    return reservation is null ? Results.NotFound() : Results.Ok(reservation);
});

// List reservations for a customer
app.MapGet("/api/reservations/customer/{customerId:guid}", async (AppDbContext db, Guid customerId) =>
{
    var tenant = db.CurrentTenantId!;
    var reservations = await db.Reservations
        .Include(r => r.Customer)
        .Include(r => r.Vendor)
        .Include(r => r.Items)
        .ThenInclude(i => i.Product)
        .Where(r => r.TenantId == tenant && r.CustomerId == customerId)
        .OrderByDescending(r => r.CreatedAt)
        .ToListAsync();

    return Results.Ok(reservations);
});

// List reservations for a vendor with optional filters
app.MapGet("/api/vendors/{vendorId:guid}/reservations",
    async (AppDbContext db, Guid vendorId, string? status, DateTimeOffset? from, DateTimeOffset? to) =>
    {
        var tenantId = db.CurrentTenantId!;
        var q = db.Reservations
            .Include(r => r.Customer)
            .Include(r => r.Vendor)
            .Include(r => r.Items)
            .ThenInclude(i => i.Product)
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
                    if (prod.ReservedQuantity < 0) prod.ReservedQuantity = 0;
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
        var hydratedReservation = await db.Reservations
            .Include(r => r.Customer)
            .Include(r => r.Vendor)
            .Include(r => r.Items)
            .ThenInclude(i => i.Product)
            .FirstAsync(r => r.Id == reservationId && r.TenantId == tenant);

        return Results.Ok(hydratedReservation);
    });

app.MapPatch("/api/reservations/{reservationId:guid}/note",
    async (AppDbContext db, Guid reservationId, UpdateReservationNoteDto dto) =>
    {
        var tenant = db.CurrentTenantId!;
        var reservation = await db.Reservations
            .FirstOrDefaultAsync(r => r.Id == reservationId && r.TenantId == tenant);
        if (reservation is null)
            return Results.NotFound(new { error = "Reservation not found." });

        reservation.CustomerNotes = dto.Note?.Trim();
        await db.SaveChangesAsync();
        var hydratedReservation = await db.Reservations
            .Include(r => r.Customer)
            .Include(r => r.Vendor)
            .Include(r => r.Items)
            .ThenInclude(i => i.Product)
            .FirstAsync(r => r.Id == reservationId && r.TenantId == tenant);

        return Results.Ok(hydratedReservation);
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

void SeedDemoCatalog(WebApplication webApp)
{
    using var scope = webApp.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var vendorAuthService = scope.ServiceProvider.GetRequiredService<VendorAuthService>();

    DatabaseStartup.EnsureCreated(db, webApp.Logger);
    const string tenantId = "kigali-city-mall";

    if (DatabaseStartup.HasSeedProducts(db, tenantId))
    {
        webApp.Logger.LogInformation(
            "Skipping demo seed because tenant {TenantId} already contains products.",
            tenantId);
        return;
    }

    var now = DateTimeOffset.UtcNow;

    var existingLocations = db.Locations.Where(x => x.TenantId == tenantId).ToList();
    foreach (var seed in DemoSeed.Locations)
    {
        var location = existingLocations.FirstOrDefault(x => x.Name == seed.Name);
        if (location is null)
        {
            location = new Location
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = seed.Name,
                Code = seed.Code,
                Description = seed.Description,
                AddressLine1 = seed.AddressLine1,
                Region = seed.Region,
                City = seed.City,
                Country = seed.Country,
                Floor = seed.Floor,
                Unit = seed.Unit,
                CreatedAt = now
            };
            db.Locations.Add(location);
            existingLocations.Add(location);
        }
        else
        {
            location.Code = seed.Code;
            location.Description = seed.Description;
            location.AddressLine1 = seed.AddressLine1;
            location.Region = seed.Region;
            location.City = seed.City;
            location.Country = seed.Country;
            location.Floor = seed.Floor;
            location.Unit = seed.Unit;
        }
    }

    var existingCategories = db.Categories.Where(x => x.TenantId == tenantId).ToList();
    foreach (var seed in DemoSeed.Categories)
    {
        var category = existingCategories.FirstOrDefault(x => x.Name == seed.Name);
        if (category is null)
        {
            category = new Category
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Name = seed.Name,
                Description = seed.Description,
                Active = true,
                CreatedAt = now
            };
            db.Categories.Add(category);
            existingCategories.Add(category);
        }
        else
        {
            category.Description = seed.Description;
            category.Active = true;
        }
    }

    var existingVendors = db.Vendors.Where(x => x.TenantId == tenantId).ToList();
    foreach (var seed in DemoSeed.Vendors)
    {
        var vendor = existingVendors.FirstOrDefault(x => x.DisplayName == seed.DisplayName);
        var location = existingLocations.First(x => x.Name == seed.LocationName);
        if (vendor is null)
        {
            vendor = new Vendor
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                DisplayName = seed.DisplayName,
                LegalName = seed.LegalName,
                ContactPhone = seed.ContactPhone,
                ContactEmail = seed.ContactEmail?.Trim().ToLowerInvariant(),
                RegistrationCode = vendorAuthService.CreateRegistrationCode(),
                Description = seed.Description,
                LocationId = location.Id,
                Active = true,
                Verified = true,
                CreatedAt = now
            };
            db.Vendors.Add(vendor);
            existingVendors.Add(vendor);
        }
        else
        {
            vendor.LegalName = seed.LegalName;
            vendor.ContactPhone = seed.ContactPhone;
            vendor.ContactEmail = seed.ContactEmail;
            vendor.Description = seed.Description;
            vendor.LocationId = location.Id;
            vendor.Active = true;
            vendor.Verified = true;
            vendor.ContactEmail = vendor.ContactEmail?.Trim().ToLowerInvariant();
            if (vendor.Verified && string.IsNullOrWhiteSpace(vendor.RegistrationCode))
            {
                vendor.RegistrationCode = vendorAuthService.CreateRegistrationCode();
            }
        }
    }

    var existingCustomers = db.Customers.Where(x => x.TenantId == tenantId).ToList();
    foreach (var seed in DemoSeed.Customers)
    {
        var customer = existingCustomers.FirstOrDefault(x => x.Username == seed.Username);
        if (customer is null)
        {
            customer = new Customer
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                Username = seed.Username,
                FullName = seed.FullName,
                PhoneNumber = seed.PhoneNumber,
                Email = seed.Email,
                PreferredLanguage = seed.PreferredLanguage
            };
            db.Customers.Add(customer);
            existingCustomers.Add(customer);
        }
        else
        {
            customer.FullName = seed.FullName;
            customer.PhoneNumber = seed.PhoneNumber;
            customer.Email = seed.Email;
            customer.PreferredLanguage = seed.PreferredLanguage;
        }
    }

    var existingProducts = db.Products.Where(x => x.TenantId == tenantId).ToList();
    foreach (var seed in DemoSeed.Products)
    {
        var vendor = existingVendors.First(x => x.DisplayName == seed.VendorDisplayName);
        var product = existingProducts.FirstOrDefault(x => x.Name == seed.Name);
        if (product is null)
        {
            product = new Product
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                VendorId = vendor.Id,
                Name = seed.Name,
                Description = seed.Description,
                Price = seed.Price,
                StockQuantity = seed.StockQuantity,
                ImageUrl = seed.ImageUrl,
                CategoryId = existingCategories.First(x => x.Name == seed.Category).Id,
                Active = true,
                CreatedAt = now
            };
            db.Products.Add(product);
            existingProducts.Add(product);
        }
        else
        {
            product.VendorId = vendor.Id;
            product.Description = seed.Description;
            product.Price = seed.Price;
            product.StockQuantity = seed.StockQuantity;
            product.ImageUrl = seed.ImageUrl;
            product.CategoryId = existingCategories.First(x => x.Name == seed.Category).Id;
            product.Active = true;
        }
    }

    db.SaveChanges();

    var customersByUsername = db.Customers.Where(x => x.TenantId == tenantId).ToDictionary(x => x.Username);
    var vendorsByName = db.Vendors.Where(x => x.TenantId == tenantId).ToDictionary(x => x.DisplayName);
    var productsByName = db.Products.Where(x => x.TenantId == tenantId).ToDictionary(x => x.Name);

    var activeCarts = db.ShoppingCarts
        .Include(x => x.Items)
        .Where(x => x.TenantId == tenantId && x.IsActive)
        .ToList();
    foreach (var seed in DemoSeed.Carts)
    {
        var customer = customersByUsername[seed.CustomerUsername];
        var cart = activeCarts.FirstOrDefault(x => x.CustomerId == customer.Id);
        if (cart is null)
        {
            cart = new ShoppingCart
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                CustomerId = customer.Id,
                IsActive = true,
                CreatedAt = now,
                UpdatedAt = now
            };
            db.ShoppingCarts.Add(cart);
            activeCarts.Add(cart);
        }

        foreach (var itemSeed in seed.Items)
        {
            var product = productsByName[itemSeed.ProductName];
            var item = cart.Items.FirstOrDefault(x => x.ProductId == product.Id);
            if (item is null)
            {
                cart.Items.Add(new ShoppingCartItem
                {
                    Id = Guid.NewGuid(),
                    ShoppingCartId = cart.Id,
                    ProductId = product.Id,
                    Quantity = itemSeed.Quantity,
                    UnitPrice = product.Price,
                    LineTotal = product.Price * itemSeed.Quantity
                });
            }
            else
            {
                item.Quantity = itemSeed.Quantity;
                item.UnitPrice = product.Price;
                item.LineTotal = product.Price * itemSeed.Quantity;
            }
        }

        cart.UpdatedAt = now;
    }

    var existingReviews = db.Reviews.Where(x => x.TenantId == tenantId).ToList();
    foreach (var seed in DemoSeed.Reviews)
    {
        var customer = customersByUsername[seed.CustomerUsername];
        var product = productsByName[seed.ProductName];
        var review = existingReviews.FirstOrDefault(x => x.CustomerId == customer.Id && x.ProductId == product.Id);
        if (review is null)
        {
            review = new Review
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                ProductId = product.Id,
                CustomerId = customer.Id,
                Rating = seed.Rating,
                Title = seed.Title,
                Comment = seed.Comment,
                IsPublished = true,
                CreatedAt = now
            };
            db.Reviews.Add(review);
            existingReviews.Add(review);
        }
        else
        {
            review.Rating = seed.Rating;
            review.Title = seed.Title;
            review.Comment = seed.Comment;
            review.IsPublished = true;
        }
    }

    var existingReservations = db.Reservations
        .Include(x => x.Items)
        .Where(x => x.TenantId == tenantId)
        .ToList();
    foreach (var seed in DemoSeed.Reservations(now))
    {
        var customer = customersByUsername[seed.CustomerUsername];
        var vendor = vendorsByName[seed.VendorDisplayName];
        var reservation = existingReservations.FirstOrDefault(x => x.ReservationNumber == seed.ReservationNumber);
        var total = seed.Items.Sum(x => productsByName[x.ProductName].Price * x.Quantity);
        if (reservation is null)
        {
            reservation = new Reservation
            {
                Id = Guid.NewGuid(),
                TenantId = tenantId,
                CustomerId = customer.Id,
                VendorId = vendor.Id,
                ReservationNumber = seed.ReservationNumber,
                PickupCode = seed.PickupCode,
                Status = seed.Status,
                TotalAmount = total,
                CustomerNotes = "Seeded demo reservation.",
                VendorNotes = seed.VendorNotes,
                CreatedAt = seed.CreatedAt,
                ExpiresAt = seed.ExpiresAt,
                ConfirmedAt = seed.Status is ReservationStatus.Confirmed or ReservationStatus.Completed ? seed.CreatedAt.AddHours(2) : null,
                CompletedAt = seed.Status == ReservationStatus.Completed ? seed.CreatedAt.AddDays(1) : null,
                RejectedAt = seed.Status == ReservationStatus.Rejected ? seed.CreatedAt.AddHours(8) : null,
                CancelledAt = seed.Status == ReservationStatus.Cancelled ? seed.CreatedAt.AddHours(6) : null,
                StockFinalized = seed.Status == ReservationStatus.Completed
            };
            db.Reservations.Add(reservation);
            existingReservations.Add(reservation);
        }
        else
        {
            reservation.CustomerId = customer.Id;
            reservation.VendorId = vendor.Id;
            reservation.Status = seed.Status;
            reservation.TotalAmount = total;
            reservation.VendorNotes = seed.VendorNotes;
            reservation.ExpiresAt = seed.ExpiresAt;
            reservation.ConfirmedAt = seed.Status is ReservationStatus.Confirmed or ReservationStatus.Completed ? seed.CreatedAt.AddHours(2) : null;
            reservation.CompletedAt = seed.Status == ReservationStatus.Completed ? seed.CreatedAt.AddDays(1) : null;
            reservation.RejectedAt = seed.Status == ReservationStatus.Rejected ? seed.CreatedAt.AddHours(8) : null;
            reservation.CancelledAt = seed.Status == ReservationStatus.Cancelled ? seed.CreatedAt.AddHours(6) : null;
            reservation.StockFinalized = seed.Status == ReservationStatus.Completed;
        }

        foreach (var itemSeed in seed.Items)
        {
            var product = productsByName[itemSeed.ProductName];
            var item = reservation.Items.FirstOrDefault(x => x.ProductId == product.Id);
            if (item is null)
            {
                reservation.Items.Add(new ReservationItem
                {
                    Id = Guid.NewGuid(),
                    TenantId = tenantId,
                    ReservationId = reservation.Id,
                    ProductId = product.Id,
                    Quantity = itemSeed.Quantity,
                    UnitPrice = product.Price,
                    LineTotal = product.Price * itemSeed.Quantity
                });
            }
            else
            {
                item.Quantity = itemSeed.Quantity;
                item.UnitPrice = product.Price;
                item.LineTotal = product.Price * itemSeed.Quantity;
            }
        }
    }

    var reservedByProductId = existingReservations
        .Where(x => x.Status is ReservationStatus.Pending or ReservationStatus.Confirmed)
        .SelectMany(x => x.Items)
        .GroupBy(x => x.ProductId)
        .ToDictionary(x => x.Key, x => x.Sum(i => i.Quantity));

    foreach (var product in db.Products.Where(x => x.TenantId == tenantId))
    {
        product.ReservedQuantity = reservedByProductId.GetValueOrDefault(product.Id, 0);
    }

    db.SaveChanges();
}

SeedDemoCatalog(app);
EnsureVendorAccessSetup(app);

app.Run();

void EnsureVendorAccessSetup(WebApplication webApp)
{
    using var scope = webApp.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var vendorAuthService = scope.ServiceProvider.GetRequiredService<VendorAuthService>();

    var vendors = db.Vendors.ToList();
    var changed = false;

    foreach (var vendor in vendors)
    {
        vendor.ContactEmail = vendor.ContactEmail?.Trim().ToLowerInvariant();

        if (vendor.Verified && string.IsNullOrWhiteSpace(vendor.RegistrationCode))
        {
            vendor.RegistrationCode = vendorAuthService.CreateRegistrationCode();
            changed = true;
        }

        if (!vendor.Verified &&
            string.IsNullOrWhiteSpace(vendor.AccountEmail) &&
            !string.IsNullOrWhiteSpace(vendor.RegistrationCode))
        {
            vendor.RegistrationCode = null;
            changed = true;
        }

        var normalizedEmail = vendor.AccountEmail?.Trim().ToLowerInvariant();
        if (normalizedEmail != vendor.AccountEmail)
        {
            vendor.AccountEmail = normalizedEmail;
            changed = true;
        }
    }

    if (changed)
    {
        db.SaveChanges();
    }
}

static string SanitizeSqlServerConnectionString(string? connectionString)
{
    if (string.IsNullOrWhiteSpace(connectionString))
    {
        return string.Empty;
    }

    return string.Join(
        ';',
        connectionString
            .Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(part => !part.StartsWith("Command Timeout=", StringComparison.OrdinalIgnoreCase)));
}

static string GetRequiredSqlServerConnectionString(IConfiguration configuration)
{
    var databaseUrl = SanitizeSqlServerConnectionString(configuration["DATABASE_URL"]);
    if (!string.IsNullOrWhiteSpace(databaseUrl))
    {
        return databaseUrl;
    }

    var connectionString = SanitizeSqlServerConnectionString(
        configuration.GetConnectionString("DefaultConnection"));

    if (!string.IsNullOrWhiteSpace(connectionString))
    {
        if (IsLocalDbConnectionString(connectionString) && !OperatingSystem.IsWindows())
        {
            throw new InvalidOperationException(
                "DATABASE_URL or ConnectionStrings:DefaultConnection must point to a non-LocalDB SQL Server when running outside Windows.");
        }

        return connectionString;
    }

    throw new InvalidOperationException(
        "DATABASE_URL or ConnectionStrings:DefaultConnection is required. Configure SQL Server or LocalDB on Windows.");
}

static bool IsLocalDbConnectionString(string connectionString)
{
    try
    {
        var builder = new SqlConnectionStringBuilder(connectionString);
        return builder.DataSource.Contains("(localdb)", StringComparison.OrdinalIgnoreCase);
    }
    catch
    {
        return connectionString.Contains("(localdb)", StringComparison.OrdinalIgnoreCase);
    }
}

// =======================================================================
// DTOs
// =======================================================================

public record LocationCreateDto(string Name, string? Code, string? Description);
public record VendorCreateDto(string DisplayName, string LegalName, string ContactPhone, string? ContactEmail, Guid? LocationId, string? Description);
public record ProductCreateDto(Guid VendorId, string Name, string? Description, Guid? CategoryId, decimal Price, int Stock, string? ImageUrl);
public record CreateReservationDto(Guid VendorId, string CustomerName, string CustomerPhone, string? CustomerEmail, string? CustomerNote, string? PreferredLanguage, List<CreateReservationItemDto> Items);
public record CreateReservationItemDto(Guid ProductId, int Quantity);
public record EnsureCartDto(Guid CustomerId);
public record AddCartItemDto(Guid ProductId, int Quantity);
public record CreateReviewDto(int Rating, string? Title, string? Comment, Guid CustomerId);
public record UpdateReservationNoteDto(string? Note);
public record ProductListItemDto(
    Guid Id,
    Guid VendorId,
    string? VendorName,
    string Name,
    string? Description,
    decimal Price,
    string? ImageUrl,
    Guid? CategoryId,
    string? Category,
    int StockQuantity,
    int ReservedQuantity,
    bool Active,
    DateTimeOffset CreatedAt);

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

    public static string GenerateRegistrationCode() =>
        Convert.ToHexString(RandomNumberGenerator.GetBytes(6));

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
