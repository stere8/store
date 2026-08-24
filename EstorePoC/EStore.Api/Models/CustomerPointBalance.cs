namespace EStore.Api.Models;

public class CustomerPointBalance
{
    public string TenantId { get; set; } = default!;
    public Guid CustomerId { get; set; }
    public int Balance { get; set; }
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Tenant? Tenant { get; set; }
    public Customer? Customer { get; set; }
}
