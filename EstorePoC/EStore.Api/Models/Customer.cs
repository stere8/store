// EstorePoC/EStore.Api/Models/Customer.cs (REPLACE EXISTING)
namespace EStore.Api.Models;

public class Customer
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public string? Username { get; set; }                // *** NEW: Unique per tenant when set ***

    public string FullName { get; set; } = default!;
    public string PhoneNumber { get; set; } = default!;   // primary identifier in Rwanda
    public string? Email { get; set; }
    public string? PreferredLanguage { get; set; }        // "en", "rw", "fr", "sw"

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    // Navigation
    public Tenant? Tenant { get; set; }
    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
    public ICollection<ShoppingCart> ShoppingCarts { get; set; } = new List<ShoppingCart>();  // *** NEW ***
    public ICollection<Review> Reviews { get; set; } = new List<Review>();                    // *** NEW ***
}