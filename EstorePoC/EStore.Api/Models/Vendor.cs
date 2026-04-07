using System.ComponentModel.DataAnnotations;

namespace EStore.Api.Models;

public class Vendor
{
    public Guid Id { get; set; }

    [MaxLength(80)]
    public string TenantId { get; set; } = default!;

    public Tenant? Tenant { get; set; }

    public Guid? LocationId { get; set; }
    public Location? Location { get; set; }

    [MaxLength(160)]
    public string DisplayName { get; set; } = default!;

    [MaxLength(180)]
    public string LegalName { get; set; } = default!;

    [MaxLength(32)]
    public string ContactPhone { get; set; } = default!;

    [MaxLength(160)]
    public string? ContactEmail { get; set; }

    [MaxLength(24)]
    public string? RegistrationCode { get; set; }

    [MaxLength(160)]
    public string? AccountEmail { get; set; }

    [MaxLength(256)]
    public string? PasswordHash { get; set; }

    [MaxLength(128)]
    public string? PasswordSalt { get; set; }

    public string? Description { get; set; }

    public bool Active { get; set; } = true;
    public bool Verified { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? AccountRegisteredAt { get; set; }
    public DateTimeOffset? LastLoginAt { get; set; }

    public ICollection<Product> Products { get; set; } = new List<Product>();
}
