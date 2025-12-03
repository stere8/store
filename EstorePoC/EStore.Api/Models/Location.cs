// EstorePoC/EStore.Api/Models/Location.cs
namespace EStore.Api.Models;

public class Location
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;

    public string? Name { get; set; }                // "Main Entrance", "Block B"
    public string? AddressLine1 { get; set; }
    public string? AddressLine2 { get; set; }
    public string? City { get; set; }
    public string? Region { get; set; }
    public string? Country { get; set; } = "Rwanda";
    public string? PostalCode { get; set; }
    public string? Floor { get; set; }               // Mall floor info
    public string? Unit { get; set; }                // Shop/unit "F2-15"
    public decimal? Latitude { get; set; }           // Future: proximity search
    public decimal? Longitude { get; set; }
    public string? Notes { get; set; }               // Freeform notes

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}