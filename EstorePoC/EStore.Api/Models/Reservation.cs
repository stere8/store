// NEW: EstorePoC/EStore.Api/Models/Reservation.cs
public class Reservation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!; // Mall A, Mall B, etc.
    public Guid ProductId { get; set; }
    public Guid VendorId { get; set; }
    public string CustomerName { get; set; } = default!;
    public string CustomerPhone { get; set; } = default!;
    public string? CustomerEmail { get; set; }
    public int Quantity { get; set; }
    public decimal ReservedPrice { get; set; }

    // Reservation Status Flow
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; } // Auto-expire after X hours
    public DateTime? ConfirmedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public DateTime? RejectedAt { get; set; }

    // Vendor interaction
    public string? VendorNotes { get; set; }
    public string? RejectionReason { get; set; }
}

public enum ReservationStatus
{
    Pending,     // Customer reserved, waiting for vendor
    Confirmed,   // Vendor confirmed, customer can visit
    Completed,   // Customer visited and paid offline  
    Rejected,    // Vendor rejected the reservation
    Expired      // Auto-expired due to time limit
}