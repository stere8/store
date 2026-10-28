using System.Globalization;
using System.Text.RegularExpressions;
using EStore.Api.DTOs;
using EStore.Api.Models;

namespace EStore.Api.Services;

public static class ServiceCalendar
{
    public static bool TryParseStart(string? value, out DateTime utc)
    {
        utc = default;
        if (value is null || !Regex.IsMatch(value,
            @"^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,7})?)?(?:Z|[+-]\d{2}:\d{2})$") ||
            !DateTimeOffset.TryParse(value, CultureInfo.InvariantCulture, DateTimeStyles.None, out var parsed)) return false;
        utc = parsed.UtcDateTime;
        return true;
    }

    public static TimeZoneInfo? Zone(string? id)
    {
        if (string.IsNullOrWhiteSpace(id) || id.Length > 100) return null;
        try { return TimeZoneInfo.FindSystemTimeZoneById(id); }
        catch (TimeZoneNotFoundException) { return null; }
        catch (InvalidTimeZoneException) { return null; }
    }

    public static int? Minute(string? text, bool allowMidnightEnd = false)
    {
        if (allowMidnightEnd && text == "24:00") return 1440;
        return TimeOnly.TryParseExact(text, "HH:mm", CultureInfo.InvariantCulture,
            DateTimeStyles.None, out var time) ? time.Hour * 60 + time.Minute : null;
    }

    public static Dictionary<string, string[]> ValidateSchedule(ServiceScheduleWriteDto dto)
    {
        var errors = new Dictionary<string, string[]>();
        if (Zone(dto.TimeZone) is null) errors["timeZone"] = ["Use a valid time-zone ID, for example Africa/Kigali."];
        if (dto.Windows is null || dto.Windows.Count > 50)
            errors["windows"] = ["Provide the complete weekly schedule, at most 50 windows; [] closes all days."];
        else
        {
            var windows = new List<(int Day, int Start, int End)>();
            foreach (var window in dto.Windows)
            {
                if (window is null || window.DayOfWeek is < 0 or > 6 || Minute(window.StartTime) is not int start ||
                    Minute(window.EndTime, true) is not int end || start >= end)
                { errors["windows"] = ["Use dayOfWeek 0-6, HH:mm times and endTime after startTime; split overnight hours."]; break; }
                windows.Add((window.DayOfWeek, start, end));
            }
            if (windows.Any(a => windows.Any(b => a != b && a.Day == b.Day && a.Start < b.End && a.End > b.Start)) ||
                windows.Distinct().Count() != windows.Count)
                errors["windows"] = ["Weekly windows cannot overlap or repeat."];
        }
        if (dto.BlockedDates?.Count > 366 || dto.BlockedDates?.Distinct().Count() != dto.BlockedDates?.Count)
            errors["blockedDates"] = ["Use at most 366 distinct closed dates."];
        return errors;
    }

    public static IEnumerable<ServiceSlotDto> Slots(ServiceOffering service, ServiceScheduleDto schedule,
        DateOnly date, DateTime now, bool applyBookingWindow = true)
    {
        if (schedule.BlockedDates.Contains(date)) yield break;
        var zone = Zone(schedule.TimeZone)!;
        foreach (var window in schedule.Windows.Where(w => w.DayOfWeek == (int)date.DayOfWeek))
        {
            var start = Minute(window.StartTime)!.Value;
            var end = Minute(window.EndTime, true)!.Value;
            for (var minute = start; minute + service.DurationMinutes <= end; minute += service.SlotIntervalMinutes)
            {
                var localStart = date.ToDateTime(TimeOnly.MinValue).AddMinutes(minute);
                var localEnd = localStart.AddMinutes(service.DurationMinutes);
                // Ambiguous/nonexistent local hours are not bookable; never silently choose a DST offset.
                if (zone.IsInvalidTime(localStart) || zone.IsAmbiguousTime(localStart) ||
                    zone.IsInvalidTime(localEnd) || zone.IsAmbiguousTime(localEnd)) continue;
                var utcStart = TimeZoneInfo.ConvertTimeToUtc(localStart, zone);
                var utcEnd = TimeZoneInfo.ConvertTimeToUtc(localEnd, zone);
                if (utcEnd - utcStart != TimeSpan.FromMinutes(service.DurationMinutes)) continue;
                if (applyBookingWindow && (utcStart < now.AddMinutes(service.MinimumNoticeMinutes) ||
                    utcStart > now.AddDays(service.BookingWindowDays))) continue;
                yield return new(utcStart, utcEnd);
            }
        }
    }

    public static bool IsAllowed(ServiceOffering service, ServiceScheduleDto schedule, DateTime start,
        DateTime now, bool applyBookingWindow = true)
    {
        var localDate = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(start, Zone(schedule.TimeZone)!));
        return Slots(service, schedule, localDate, now, applyBookingWindow).Any(slot => slot.StartsAt == start);
    }

    public static bool OccupiesSlot(string status) => status is "Pending" or "Confirmed";

    public static bool CanTransition(string current, string next, DateTime start, DateTime end, DateTime now) =>
        (current, next) switch
        {
            ("Pending", "Confirmed") => now < start,
            ("Pending", "Rejected" or "Cancelled") => true,
            ("Confirmed", "Cancelled") => true,
            ("Confirmed", "Completed") => now >= end,
            ("Confirmed", "NoShow") => now >= start,
            _ => false
        };
}
