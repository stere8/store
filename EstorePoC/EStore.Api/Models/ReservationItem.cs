namespace EStore.Api.Models;

public class ReservationItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ReservationId { get; set; }
    public Guid ProductId { get; set; }

    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal LineTotal { get; set; }                   // Quantity * UnitPrice

    public Reservation? Reservation { get; set; }
    public Product? Product { get; set; }
}
