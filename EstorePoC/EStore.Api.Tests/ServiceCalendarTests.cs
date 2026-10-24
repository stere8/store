using EStore.Api.DTOs;
using EStore.Api.Models;
using EStore.Api.Services;
using Xunit;

namespace EStore.Api.Tests;

public sealed class ServiceCalendarTests
{
    private static readonly DateTime Now = new(2026, 10, 24, 6, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void ConvertsKigaliHoursToUtcAndKeepsBookingsWeeksAhead()
    {
        var date = new DateOnly(2026, 11, 9);
        var service = new ServiceOffering { DurationMinutes = 30, SlotIntervalMinutes = 15, BookingWindowDays = 90 };
        var schedule = new ServiceScheduleDto(Guid.NewGuid(), "Africa/Kigali", [new(1, "09:00", "12:00")], []);
        var slots = ServiceCalendar.Slots(service, schedule, date, Now).ToList();
        Assert.Equal(11, slots.Count);
        Assert.Equal(new DateTime(2026, 11, 9, 7, 0, 0, DateTimeKind.Utc), slots[0].StartsAt);
        Assert.Equal(TimeSpan.FromMinutes(30), slots[0].EndsAt - slots[0].StartsAt);
        Assert.True(ServiceCalendar.IsAllowed(service, schedule, slots[0].StartsAt, Now));
        Assert.False(ServiceCalendar.IsAllowed(service, schedule, slots[0].StartsAt.AddMinutes(1), Now));
        var closed = schedule with { BlockedDates = [date] };
        Assert.Empty(ServiceCalendar.Slots(service, closed, date, Now));
        service.BookingWindowDays = 7;
        Assert.Empty(ServiceCalendar.Slots(service, schedule, date, Now));
    }

    [Theory]
    [InlineData("2026-11-09T09:00:00+02:00", true)]
    [InlineData("2026-11-09T07:00:00Z", true)]
    [InlineData("2026-11-09T07:00Z", true)]
    [InlineData("2026-11-09T07:00:00", false)]
    [InlineData("2026-11-09", false)]
    [InlineData("2026-02-30T07:00:00Z", false)]
    public void RequiresExplicitValidAppointmentTimezone(string input, bool valid)
    {
        Assert.Equal(valid, ServiceCalendar.TryParseStart(input, out var parsed));
        if (valid) Assert.Equal(DateTimeKind.Utc, parsed.Kind);
    }

    [Fact]
    public void ScheduleRejectsOverlapsAndAllowsAdjacentWindows()
    {
        Assert.Empty(ServiceCalendar.ValidateSchedule(new("Africa/Kigali", [new(1, "09:00", "12:00"), new(1, "12:00", "17:00")])));
        Assert.Empty(ServiceCalendar.ValidateSchedule(new("Africa/Kigali", [])));
        Assert.NotEmpty(ServiceCalendar.ValidateSchedule(new("Invalid/Zone", [])));
        Assert.NotEmpty(ServiceCalendar.ValidateSchedule(new("Africa/Kigali", [new(1, "09:00", "12:00"), new(1, "11:00", "17:00")])));
        Assert.NotEmpty(ServiceCalendar.ValidateSchedule(new("Africa/Kigali", [new(1, "09:00", "12:00"), new(1, "09:00", "12:00")])));
        Assert.NotEmpty(ServiceCalendar.ValidateSchedule(new("Africa/Kigali", [new(1, "17:00", "09:00")])));
        Assert.NotEmpty(ServiceCalendar.ValidateSchedule(new("Africa/Kigali", [new(7, "09:00", "12:00")])));
        Assert.NotEmpty(ServiceCalendar.ValidateSchedule(new("Africa/Kigali", null)));
        Assert.Empty(ServiceCalendar.ValidateSchedule(new("Africa/Kigali", [new(1, "23:00", "24:00")])));
    }

    [Fact]
    public void DaylightSavingAmbiguityIsNotSilentlyBooked()
    {
        var service = new ServiceOffering { DurationMinutes = 30, SlotIntervalMinutes = 15, BookingWindowDays = 365 };
        var schedule = new ServiceScheduleDto(Guid.NewGuid(), "Europe/Paris", [new(0, "02:00", "03:00")], []);
        Assert.Empty(ServiceCalendar.Slots(service, schedule, new DateOnly(2026, 10, 25), Now));
    }

    [Theory]
    [InlineData("Pending", "Confirmed", true)]
    [InlineData("Pending", "Rejected", true)]
    [InlineData("Confirmed", "Cancelled", true)]
    [InlineData("Cancelled", "Confirmed", false)]
    [InlineData("Completed", "Confirmed", false)]
    [InlineData("Pending", "Completed", false)]
    [InlineData("Confirmed", "Completed", false)]
    [InlineData("Confirmed", "NoShow", false)]
    public void GuardsStatusTransitionsBeforeAppointment(string current, string next, bool allowed) =>
        Assert.Equal(allowed, ServiceCalendar.CanTransition(current, next, Now.AddDays(1), Now.AddDays(1).AddHours(1), Now));

    [Fact]
    public void CompletionAndNoShowNeedTheirRespectiveTimes()
    {
        Assert.True(ServiceCalendar.CanTransition("Confirmed", "Completed", Now.AddHours(-2), Now.AddHours(-1), Now));
        Assert.True(ServiceCalendar.CanTransition("Confirmed", "NoShow", Now.AddMinutes(-5), Now.AddMinutes(25), Now));
        Assert.False(ServiceCalendar.CanTransition("Pending", "Confirmed", Now.AddHours(-2), Now.AddHours(-1), Now));
    }

    [Fact]
    public void ValidatesServicePriceDurationAndBookingPolicy()
    {
        var valid = new ServiceWriteDto("Haircut", Guid.NewGuid(), 5000, 30);
        Assert.Empty(ServiceCatalogService.ValidateFixed(valid));
        Assert.NotEmpty(ServiceCatalogService.ValidateFixed(valid with { DurationMinutes = 0 }));
        Assert.NotEmpty(ServiceCatalogService.ValidateFixed(valid with { Price = 1.5m }));
        Assert.NotEmpty(ServiceCatalogService.ValidateFixed(valid with { SlotIntervalMinutes = 0 }));
        Assert.NotEmpty(ServiceCatalogService.ValidateFixed(valid with { BookingWindowDays = 366 }));
        Assert.NotEmpty(ServiceCatalogService.ValidateFixed(valid with { MinimumNoticeMinutes = -1 }));
        Assert.NotEmpty(ServiceCatalogService.ValidateFixed(valid with { BookingWindowDays = 1, MinimumNoticeMinutes = 2880 }));
        Assert.NotEmpty(ServiceCatalogService.ValidateFixed(valid with { ImageUrl = "http://example.com" }));
    }
}
