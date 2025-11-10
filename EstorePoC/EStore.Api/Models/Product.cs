namespace EStore.Api.Models;

public class Product
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid VendorId { get; set; }

    public string Name { get; set; } = default!;
    public string? Description { get; set; }

    // RWF
    public decimal Price { get; set; }                    // set precision in OnModelCreating
    public int StockQuantity { get; set; }
    public int ReservedQuantity { get; set; } = 0;

    public string? ImageUrl { get; set; }
    public string? Category { get; set; }
    public bool Active { get; set; } = true;

    public Vendor? Vendor { get; set; }
    public Tenant? Tenant { get; set; }

    // Optimistic concurrency to prevent over-reserving
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Temporary alias so existing code that uses Product.Stock compiles.
    // NOTE: once you update Program.cs to use StockQuantity, remove this alias.
    public int Stock
    {
        get => StockQuantity;
        set => StockQuantity = value;
    }

}
