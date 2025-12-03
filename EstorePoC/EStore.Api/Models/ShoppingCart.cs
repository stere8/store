// EstorePoC/EStore.Api/Models/ShoppingCart.cs
namespace EStore.Api.Models;

public class ShoppingCart
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid CustomerId { get; set; }

    public bool IsActive { get; set; } = true;       // One active cart per customer per tenant
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public Customer Customer { get; set; } = default!;
    public ICollection<ShoppingCartItem> Items { get; set; } = new List<ShoppingCartItem>();
}