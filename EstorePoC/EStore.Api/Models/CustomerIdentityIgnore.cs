namespace EStore.Api.Models;

public class CustomerIdentityIgnore
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public string IssueType { get; set; } = default!;
    public string SubjectKey { get; set; } = default!;
    public string Fingerprint { get; set; } = default!;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Tenant? Tenant { get; set; }
}
