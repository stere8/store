namespace EStore.Api.Models;

public class ReservationItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;   // keep for scoping (set in Program)
    public Guid ReservationId { get; set; }
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }

    public Reservation? Reservation { get; set; }
    public Product? Product { get; set; }
}
