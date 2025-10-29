namespace EStore.Api.Models;

public class Vendor
{
    public Guid Id { get; set; }
    public string TenantId { get; set; } = default!;

    public string LegalName { get; set; } = default!;
    public string ContactEmail { get; set; } = default!;
    public bool Verified { get; set; }
    public DateTime CreatedAt { get; set; }
}
