namespace EStore.Api.Models;

public class PointTransaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid CustomerId { get; set; }

    public int Amount { get; set; }
    public string Reason { get; set; } = default!;
    public string SourceType { get; set; } = default!;
    public Guid SourceId { get; set; }
    public string? Notes { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Tenant? Tenant { get; set; }
    public Customer? Customer { get; set; }
}
