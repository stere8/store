namespace EStore.Api.Models;

public class Reservation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;

    public Guid CustomerId { get; set; }
    public Guid VendorId { get; set; }

    public string ReservationNumber { get; set; } = default!; // unique per tenant
    public string PickupCode { get; set; } = default!;         // unique per tenant

    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public decimal TotalAmount { get; set; }

    public string? CustomerNotes { get; set; }
    public string? VendorNotes { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset ExpiresAt { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public DateTimeOffset? CompletedAt { get; set; }
    public DateTimeOffset? RejectedAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }

    public bool StockFinalized { get; set; } = false;

    public Tenant? Tenant { get; set; }
    public Customer? Customer { get; set; }
    public Vendor? Vendor { get; set; }
    public ICollection<ReservationItem> Items { get; set; } = new List<ReservationItem>();
}

