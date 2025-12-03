namespace EStore.Api.Models;

public class Location
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;

    public string Name { get; set; } = default!;
    public string? Code { get; set; }
    public string? Description { get; set; }

    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public string? Country { get; set; } = "Rwanda";
    public string? PostalCode { get; set; }
    public string? Floor { get; set; }
    public string? Unit { get; set; }
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? Notes { get; set; }

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
