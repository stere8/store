using System.Text.Json;

namespace EStore.Api.DTOs;

public record ServiceWriteDto(string Name, Guid? CategoryId, decimal Price, int DurationMinutes,
    string? Description = null, string? ImageUrl = null, Dictionary<string, JsonElement>? Attributes = null,
    int SlotIntervalMinutes = 15, int BookingWindowDays = 90, int MinimumNoticeMinutes = 60,
    Guid? VendorId = null, bool? Active = null);

public record ServiceDto(Guid Id, Guid VendorId, string VendorName, string? VendorLogoUrl, Guid CategoryId,
    string? Category, string Name, string? Description, decimal Price, int DurationMinutes, int SlotIntervalMinutes,
    int BookingWindowDays, int MinimumNoticeMinutes, string? ImageUrl, Dictionary<string, JsonElement> Attributes,
    bool Active, DateTime CreatedAt, DateTime UpdatedAt);
public record ServicePageDto(IReadOnlyList<ServiceDto> Items, int Page, int PageSize, bool HasMore);

public record ServiceHoursDto(int DayOfWeek, string StartTime, string EndTime);
public record ServiceScheduleWriteDto(string TimeZone, List<ServiceHoursDto>? Windows, List<DateOnly>? BlockedDates = null);
public record ServiceScheduleDto(Guid VendorId, string TimeZone, IReadOnlyList<ServiceHoursDto> Windows,
    IReadOnlyList<DateOnly> BlockedDates);
public record ServiceSlotDto(DateTime StartsAt, DateTime EndsAt);
public record ServiceAvailabilityDto(Guid ServiceId, string TimeZone, DateOnly From, DateOnly To,
    int DurationMinutes, int SlotIntervalMinutes, IReadOnlyList<ServiceSlotDto> Slots);

public record ServiceBookingCreateDto(Guid ServiceId, string StartsAt, Guid ClientBookingId,
    string? Notes = null, Guid? CustomerId = null);
public record ServiceBookingRescheduleDto(string StartsAt);
public record ServiceBookingStatusDto(string Status);
public record ServiceBookingDto(Guid Id, Guid ServiceId, Guid VendorId, string VendorName,
    Guid CustomerId, string CustomerName, string ServiceName, decimal Price, int DurationMinutes,
    DateTime StartsAt, DateTime EndsAt, string TimeZone, string Status, string? Notes,
    Guid ClientBookingId, DateTime CreatedAt, DateTime UpdatedAt);
public record ServiceBookingPageDto(IReadOnlyList<ServiceBookingDto> Items, int Page, int PageSize, bool HasMore);
