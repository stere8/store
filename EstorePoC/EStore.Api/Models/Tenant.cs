namespace EStore.Api.Models
{
    public class Tenant
    {
        public string Id { get; set; } = default!;            // "kigali-city-mall" (TenantId)
        public string Name { get; set; } = default!;
        public string Slug { get; set; } = default!;
        public string Location { get; set; } = default!;
        public string? ContactEmail { get; set; }
        public string TimeZone { get; set; } = "Africa/Kigali";
        public int DefaultExpiryHours { get; set; } = 24;
        public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

        public ICollection<Vendor> Vendors { get; set; } = new List<Vendor>();
    }
}
