namespace EStore.Api.Models
{
    public class Customer
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string TenantId { get; set; } = default!;

        public string FullName { get; set; } = default!;
        public string PhoneNumber { get; set; } = default!;   // primary identifier in Rwanda
        public string? Email { get; set; }
        public string? PreferredLanguage { get; set; }        // "en", "rw", "fr", "sw"

        public Tenant? Tenant { get; set; }
        public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    }
}
