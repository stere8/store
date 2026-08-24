namespace EStore.Api.Models;

public class Referral
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;

    public Guid RecommenderCustomerId { get; set; }
    public string RecommendedEmail { get; set; } = default!;
    public string RecommendedEmailNormalized { get; set; } = default!;
    public Guid? RecommendedCustomerId { get; set; }

    public ReferralStatus Status { get; set; } = ReferralStatus.Pending;
    public int RecommenderPointsAwarded { get; set; }
    public int RecommendedPointsAwarded { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? MatchedAt { get; set; }
    public DateTimeOffset? AwardedAt { get; set; }
    public DateTimeOffset? CancelledAt { get; set; }
    public string? CancelReason { get; set; }

    public Tenant? Tenant { get; set; }
    public Customer? RecommenderCustomer { get; set; }
    public Customer? RecommendedCustomer { get; set; }
}
