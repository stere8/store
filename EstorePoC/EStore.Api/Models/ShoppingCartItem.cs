namespace EStore.Api.Models;

public class ShoppingCartItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ShoppingCartId { get; set; }
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }

    // Optional price snapshotting for cart rows
    public decimal? UnitPrice { get; set; }
    public decimal? LineTotal { get; set; }

    public ShoppingCart? ShoppingCart { get; set; }
    public Product? Product { get; set; }
}
