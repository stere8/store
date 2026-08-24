namespace EStore.Api.Models;

public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;

    public string Username { get; set; } = default!; // NEW
    public string FullName { get; set; } = default!;
    public string PhoneNumber { get; set; } = default!;
    public string? Email { get; set; }
    public string? PreferredLanguage { get; set; }   // "en","rw","fr","sw"
    public bool IsArchived { get; set; }
    public DateTimeOffset? ArchivedAt { get; set; }
    public string? ArchivedReason { get; set; }

    public Tenant? Tenant { get; set; }
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<Referral> SentReferrals { get; set; } = new List<Referral>();
    public ICollection<Referral> ReceivedReferrals { get; set; } = new List<Referral>();
    public ICollection<PointTransaction> PointTransactions { get; set; } = new List<PointTransaction>();
    public CustomerPointBalance? PointBalance { get; set; }
}
