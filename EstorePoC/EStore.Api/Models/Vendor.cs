// EstorePoC/EStore.Api/Models/Vendor.cs (REPLACE EXISTING)
namespace EStore.Api.Models;

public class Vendor
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public string DisplayName { get; set; } = default!;
    public string LegalName { get; set; } = default!;
    public string? Description { get; set; }                 // *** NEW ***
    public Guid? LocationId { get; set; }                    // *** NEW: FK to Location ***
    public string ContactPhone { get; set; } = default!;
    public bool Active { get; set; } = true;
    public string? ContactEmail { get; set; }
    public bool Verified { get; set; } = false;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public Tenant? Tenant { get; set; }
    public Location? Location { get; set; }                  // *** NEW ***
    public ICollection<Product> Products { get; set; } = new List<Product>();
}