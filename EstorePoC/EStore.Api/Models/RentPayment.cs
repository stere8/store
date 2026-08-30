namespace EStore.Api.Models;

public class RentPayment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;

    public Guid StoreLeaseId { get; set; }
    public Guid VendorId { get; set; }
    public Guid LocationId { get; set; }

    public DateTimeOffset PeriodStart { get; set; }
    public DateTimeOffset PeriodEnd { get; set; }
    public DateTimeOffset DueDate { get; set; }

    public decimal AmountDue { get; set; }
    public decimal AmountPaid { get; set; }
    public string Currency { get; set; } = "USD";
    public RentPaymentStatus Status { get; set; } = RentPaymentStatus.Pending;

    public string? PaymentReference { get; set; }
    public DateTimeOffset? PaidAt { get; set; }
    public string? Notes { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public StoreLease? StoreLease { get; set; }
    public Tenant? Tenant { get; set; }
    public Vendor? Vendor { get; set; }
    public Location? Location { get; set; }
}
