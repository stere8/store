using EStore.Api.Data;
using EStore.Api.Endpoints;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

var builder = WebApplication.CreateBuilder(args);

// ===============================================================
// DATABASE CONFIGURATION (SQL SERVER)
// ===============================================================
builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs =
        Environment.GetEnvironmentVariable("DATABASE_URL")
        ?? builder.Configuration.GetConnectionString("DefaultConnection")
        ?? throw new InvalidOperationException("Database connection string is required");

    options.UseSqlServer(cs, sql =>
    {
        sql.CommandTimeout(60);
        sql.EnableRetryOnFailure();
    });

    if (builder.Environment.IsDevelopment())
    {
        options.EnableSensitiveDataLogging();
        options.EnableDetailedErrors();
    }
});



// ===============================================================
// CORE SERVICES
// ===============================================================
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(opt =>
    opt.AddPolicy("any", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

builder.Services.AddHostedService<ReservationExpiryService>();

// ===============================================================
// BUILD APP
// ===============================================================
var app = builder.Build();

app.UseCors("any");
app.UseSwagger();
app.UseSwaggerUI();

// ===============================================================
// TENANT MIDDLEWARE
// ===============================================================
app.Use(async (ctx, next) =>
{
    var tenant = ctx.Request.Headers["X-Tenant-Id"].FirstOrDefault()
              ?? ctx.Request.Query["tenantId"].FirstOrDefault()
              ?? "kigali-city-mall";

    var db = ctx.RequestServices.GetRequiredService<AppDbContext>();
    db.CurrentTenantId = tenant;

    // Optional debug header
    ctx.Response.Headers["X-Current-Tenant"] = tenant;

    await next();
});


// ===============================================================
// DATABASE INIT
// ===============================================================
await EnsureDatabaseAsync(app);

// ===============================================================
// HEALTH
// ===============================================================
app.MapGet("/health", () => Results.Ok(new { ok = true, ts = DateTimeOffset.UtcNow }));

// ===============================================================
// REGISTER ENDPOINT MODULES
// ===============================================================
app.MapGroup("/api/locations").MapLocationsEndpoints();
app.MapGroup("/api/vendors").MapVendorsEndpoints();
app.MapGroup("/api/products").MapProductsEndpoints();
app.MapGroup("/api/carts").MapCartsEndpoints();
app.MapGroup("/api/reservations").MapReservationsEndpoints();
app.MapGroup("/api/reviews").MapReviewsEndpoints();
app.MapGroup("/api/customers").MapCustomersEndpoints();
app.MapGroup("/api/categories").MapCategoriesEndpoints();
app.MapGroup("/api/tenants").MapTenantsEndpoints();
app.MapGroup("/api/admin").MapAdminEndpoints();
// Add this before app.Run()
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
app.Urls.Add($"http://0.0.0.0:{port}");
app.Run();

// ===============================================================
// DATABASE BOOTSTRAP
// ===============================================================
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
        logger.LogInformation("Database ready");
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "DB initialization FAILED");
        throw;
    }
}

// ===============================================================
// SEED DATA
// ===============================================================
static async Task SeedDatabaseAsync(AppDbContext db, ILogger logger)
{
    if (await db.Tenants.AnyAsync())
        return;

    logger.LogInformation("Seeding…");

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

    db.Locations.AddRange(
        new Location
        {
            Id = Guid.NewGuid(),
            TenantId = "kigali-city-mall",
            Name = "Ground Floor - East Wing",
            Code = "GF-E",
            CreatedAt = DateTimeOffset.UtcNow
        },
        new Location
        {
            Id = Guid.NewGuid(),
            TenantId = "kigali-city-mall",
            Name = "1F - Food Court",
            Code = "1F-FC",
            CreatedAt = DateTimeOffset.UtcNow
        }
    );

    await db.SaveChangesAsync();
}
