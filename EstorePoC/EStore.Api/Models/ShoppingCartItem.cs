// EstorePoC/EStore.Api/Models/ShoppingCartItem.cs
namespace EStore.Api.Models;

public class ShoppingCartItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CartId { get; set; }
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }                // > 0
    public decimal? UnitPrice { get; set; }          // Snapshot at add time (optional)
    public decimal? LineTotal { get; set; }          // Quantity × UnitPrice (if snapshot used)

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public ShoppingCart Cart { get; set; } = default!;
    public Product Product { get; set; } = default!;
}