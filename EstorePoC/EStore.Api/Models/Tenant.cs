// EstorePoC/EStore.Api/Models/Tenant.cs (REPLACE EXISTING)
namespace EStore.Api.Models;

public class Tenant
{
    public string Id { get; set; } = default!;            // "kigali-city-mall" (TenantId)
    public string Name { get; set; } = default!;
    public string Slug { get; set; } = default!;
    public Guid? LocationId { get; set; }                 // *** CHANGED: FK to Location ***
    public string? ContactEmail { get; set; }
    public string TimeZone { get; set; } = "Africa/Kigali";
    public int DefaultExpiryHours { get; set; } = 24;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public Location? Location { get; set; }               // *** NEW ***
    public ICollection<Vendor> Vendors { get; set; } = new List<Vendor>();
}