namespace EStore.Api.Models;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid VendorId { get; set; }

    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public decimal Price { get; set; }

    public int StockQuantity { get; set; }
    public int ReservedQuantity { get; set; } = 0;

    public string? ImageUrl { get; set; }
    public Guid? CategoryId { get; set; }
    public bool Active { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Tenant? Tenant { get; set; }
    public Vendor? Vendor { get; set; }
    public Category? Category { get; set; }
}
