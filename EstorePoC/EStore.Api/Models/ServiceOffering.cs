namespace EStore.Api.Models;

public class ServiceOffering
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public Guid CategoryId { get; set; }
    public Category? Category { get; set; }
    public string Name { get; set; } = default!;
    public string? Description { get; set; }
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
    public int SlotIntervalMinutes { get; set; } = 15;
    public int BookingWindowDays { get; set; } = 90;
    public int MinimumNoticeMinutes { get; set; } = 60;
    public string? ImageUrl { get; set; }
    public string AttributesJson { get; set; } = "{}";
    public bool Active { get; set; } = true;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class ServiceSchedule
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public string TimeZone { get; set; } = "Africa/Kigali";
    public string WindowsJson { get; set; } = "[]";
    public string BlockedDatesJson { get; set; } = "[]";
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}

public class ServiceBooking
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public Guid ServiceId { get; set; }
    public ServiceOffering? Service { get; set; }
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerSubject { get; set; } = default!;
    public Guid ClientBookingId { get; set; }
    public string ServiceName { get; set; } = default!;
    public decimal Price { get; set; }
    public int DurationMinutes { get; set; }
    public DateTime StartsAtUtc { get; set; }
    public DateTime RequestedStartsAtUtc { get; set; }
    public DateTime EndsAtUtc { get; set; }
    public string TimeZone { get; set; } = default!;
    public string Status { get; set; } = "Pending";
    public string? Notes { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
}
