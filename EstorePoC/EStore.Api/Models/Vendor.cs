namespace EStore.Api.Models;

public class Vendor
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;

    public string DisplayName { get; set; } = default!;
    public string LegalName { get; set; } = default!;
    public string ContactPhone { get; set; } = default!;
    public string? ContactEmail { get; set; }

    public string? Description { get; set; }      // NEW
    public Guid? LocationId { get; set; }         // NEW (FK into Location)

    public bool Active { get; set; } = true;
    public bool Verified { get; set; } = false;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Tenant? Tenant { get; set; }
    public Location? Location { get; set; }
    public ICollection<Product> Products { get; set; } = new List<Product>();
}
