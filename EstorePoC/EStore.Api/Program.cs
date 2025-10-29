using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddPolicy("any", p => p.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));
var app = builder.Build();

app.UseCors("any");
app.UseSwagger();
app.UseSwaggerUI();

var products = new List<Product> {
    new() { Id = Guid.NewGuid(), TenantId="mall-a", VendorId=Guid.NewGuid(), Name="T-Shirt", Description="Cotton tee", Price=49.99m, Stock=120 },
    new() { Id = Guid.NewGuid(), TenantId="mall-a", VendorId=Guid.NewGuid(), Name="Sneakers", Description="Running shoes", Price=299.00m, Stock=35  },
    new() { Id = Guid.NewGuid(), TenantId="mall-b", VendorId=Guid.NewGuid(), Name="Cap",     Description="Blue cap",    Price=39.99m, Stock=50  },
};
string GetTenant(HttpContext ctx) =>
    ctx.Request.Headers.TryGetValue("X-Tenant", out var h) ? h.ToString()
    : (ctx.Request.Query.TryGetValue("tenant", out var q) ? q.ToString() : "mall-a");

app.MapGet("/health", () => Results.Ok(new { ok = true, ts = DateTime.UtcNow }));
app.MapGet("/api/products", (HttpContext ctx) =>
{
    var t = GetTenant(ctx);
    return Results.Ok(products.Where(p => p.TenantId == t).ToList());
});
app.MapPost("/api/payments/charge", (PaymentRequest req) =>
{
    var reference = $"PAY-{Guid.NewGuid():N}".Substring(0, 12).ToUpperInvariant();
    return Results.Ok(new { status = "success", req.Gateway, req.Amount, req.Currency, req.OrderId, reference });
});
// existing `products` and `payment` endpoints remain unchanged above…

// in-memory store keyed by TenantId
var vendors = new Dictionary<string, List<Vendor>>();

// POST /api/vendors/register
app.MapPost("/api/vendors/register", (HttpContext ctx, VendorDto dto) =>
{
    var tenant = GetTenant(ctx);
    if (!vendors.ContainsKey(tenant))
        vendors[tenant] = new List<Vendor>();

    var v = new Vendor
    {
        Id = Guid.NewGuid(),
        TenantId = tenant,
        LegalName = dto.LegalName,
        ContactEmail = dto.ContactEmail,
        Verified = false
    };
    vendors[tenant].Add(v);
    return Results.Created($"/api/vendors/{v.Id}", v);
});

// GET /api/vendors
app.MapGet("/api/vendors", (HttpContext ctx) =>
{
    var tenant = GetTenant(ctx);
    vendors.TryGetValue(tenant, out var vendorList);
    return Results.Ok(vendorList ?? new List<Vendor>());
});

// DTO used for vendor creation
record VendorDto(string LegalName, string ContactEmail);

// Vendor record
record Vendor
{
    public Guid Id { get; init; }
    public string TenantId { get; init; } = default!;
    public string LegalName { get; init; } = default!;
    public string ContactEmail { get; init; } = default!;
    public bool Verified { get; init; }
}

app.Run();

record Product {
    public Guid Id { get; set; }
    public string TenantId { get; set; } = default!;
    public Guid VendorId { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
}
record PaymentRequest(string Gateway, decimal Amount, string Currency, string OrderId);
