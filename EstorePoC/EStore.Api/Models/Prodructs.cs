namespace EStore.Api.Models;

public class Product
{
    public Guid Id { get; set; }
    public string TenantId { get; set; } = default!;
    public Guid VendorId { get; set; }

    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int Stock { get; set; }
    public string? ImageUrl { get; set; }
    public bool Active { get; set; } = true;

    public DateTime CreatedAt { get; set; }
}
