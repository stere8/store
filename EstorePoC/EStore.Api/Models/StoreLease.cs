namespace EStore.Api.Models;

public class StoreLease
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;

    public Guid VendorId { get; set; }
    public Guid LocationId { get; set; }

    public decimal MonthlyRent { get; set; }
    public string Currency { get; set; } = "USD";
    public int BillingDay { get; set; } = 1;
    public decimal SecurityDeposit { get; set; }

    public DateTimeOffset LeaseStart { get; set; }
    public DateTimeOffset? LeaseEnd { get; set; }
    public LeaseStatus Status { get; set; } = LeaseStatus.Draft;
    public string? Notes { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Tenant? Tenant { get; set; }
    public Vendor? Vendor { get; set; }
    public Location? Location { get; set; }
    public ICollection<RentPayment> RentPayments { get; set; } = new List<RentPayment>();
}
