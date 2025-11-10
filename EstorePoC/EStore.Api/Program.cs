using EStore.Api.Data;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

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
app.MapPost("/api/vendors/register", async (AppDbContext db, HttpContext http, VendorDto dto) =>
{
    var tenant = (string)http.Items["TenantId"]!;
    var v = new Vendor
    {
        Id = Guid.NewGuid(),
        TenantId = tenant,
        LegalName = dto.LegalName.Trim(),
        ContactEmail = dto.ContactEmail.Trim(),
        Verified = false,
        CreatedAt = DateTime.UtcNow
    };
    db.Vendors.Add(v);
    await db.SaveChangesAsync();
    return Results.Created($"/api/vendors/{v.Id}", v);
});

app.MapGet("/api/vendors", async (AppDbContext db, HttpContext http) =>
{
    var tenant = (string)http.Items["TenantId"]!;
    var list = await db.Vendors.Where(x => x.TenantId == tenant).OrderByDescending(x => x.CreatedAt).ToListAsync();
    return Results.Ok(list);
});

// ---------------- Products ----------------
app.MapGet("/api/products", async (AppDbContext db, HttpContext http) =>
{
    var tenant = (string)http.Items["TenantId"]!;
    var list = await db.Products
        .Where(p => p.TenantId == tenant && p.Active)
        .OrderBy(p => p.Name)
        .ToListAsync();
    return Results.Ok(list);
});

app.MapPost("/api/products", async (AppDbContext db, HttpContext http, ProductCreateDto dto) =>
{
    var tenant = (string)http.Items["TenantId"]!;
    if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.Stock < 0)
        return Results.BadRequest(new { error = "Invalid product payload." });

    var existsVendor = await db.Vendors.AnyAsync(v => v.TenantId == tenant && v.Id == dto.VendorId);
    if (!existsVendor)
        return Results.BadRequest(new { error = "Vendor not found in tenant." });

    var p = new Product
    {
        Id = Guid.NewGuid(),
        TenantId = tenant,
        VendorId = dto.VendorId,
        Name = dto.Name.Trim(),
        Description = dto.Description?.Trim(),
        Price = dto.Price,
        Stock = dto.Stock,
        ImageUrl = dto.ImageUrl,
        Active = true,
        CreatedAt = DateTime.UtcNow
    };
    db.Products.Add(p);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{p.Id}", p);
});

app.MapPost("/api/orders", (Order order, AppDbContext db, HttpContext ctx) =>
{
    var tenant = GetTenant(ctx);
    var product = db.Products.FirstOrDefault(p => p.Id == order.ProductId && p.TenantId == tenant);

    if (product is null)
        return Results.NotFound(new { error = "product not found" });

    if (product.Stock < order.Quantity)
        return Results.BadRequest(new { error = "not enough stock" });

    // reduce inventory
    product.Stock -= order.Quantity;

    // create order
    order.TenantId = tenant;
    order.Total = product.Price * order.Quantity;
    db.Orders.Add(order);

    db.SaveChanges();
    return Results.Ok(order);
});

string GetTenant(HttpContext ctx)
{
    throw new NotImplementedException();
}


// ---------------- Payments (mock gateways) ----------------
app.MapPost("/api/payments/charge", async (HttpContext http, IPaymentGatewayFactory factory, PaymentRequest req) =>
{
    if (req.Amount <= 0 || string.IsNullOrWhiteSpace(req.Currency) || string.IsNullOrWhiteSpace(req.OrderId))
        return Results.BadRequest(new { error = "Invalid payment request." });

    var tenant = (string)http.Items["TenantId"]!;
    var gw = factory.Create(req.Gateway);       // "stripe" | "mtn" | "airtel"
    var result = await gw.ChargeAsync(tenant, req);
    return Results.Ok(result);
});

app.Run();

// DTOs
public record VendorDto(string LegalName, string ContactEmail);
public record ProductCreateDto(Guid VendorId, string Name, string? Description, decimal Price, int Stock, string? ImageUrl);
public record PaymentRequest(string Gateway, decimal Amount, string Currency, string OrderId);
