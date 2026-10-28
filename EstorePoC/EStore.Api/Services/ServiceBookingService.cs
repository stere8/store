using System.Buffers.Binary;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Endpoints;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Services;

public sealed record ServiceActor(string Role, Guid Id, string? Subject = null);

public sealed class ServiceBookingService(AppDbContext db, TimeProvider clock)
{
    public DateTime Now => clock.GetUtcNow().UtcDateTime;

    public static async Task<ServiceActor?> Actor(HttpContext context, AppDbContext db, VendorAuthService auth)
    {
        if (await StoreIdentity.IsAdminAsync(context)) return new("admin", Guid.Empty);
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(context, db, auth);
        if (vendor is not null) return new("vendor", vendor.Id);
        var subject = await StoreIdentity.CustomerSubjectAsync(context);
        if (subject is null) return null;
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Username == subject && !c.IsArchived);
        return customer is null ? null : new("customer", customer.Id, subject);
    }

    public IQueryable<ServiceBooking> Owned(ServiceActor actor) => db.ServiceBookings
        .Include(b => b.Vendor).Include(b => b.Customer)
        .Where(b => actor.Role == "admin" || (actor.Role == "vendor" ? b.VendorId == actor.Id :
            b.CustomerId == actor.Id && b.CustomerSubject == actor.Subject));

    public static ServiceBookingDto ToDto(ServiceBooking b) => new(b.Id, b.ServiceId, b.VendorId,
        b.Vendor?.DisplayName ?? "", b.CustomerId, b.Customer?.FullName ?? "", b.ServiceName, b.Price,
        b.DurationMinutes, DateTime.SpecifyKind(b.StartsAtUtc, DateTimeKind.Utc), DateTime.SpecifyKind(b.EndsAtUtc, DateTimeKind.Utc),
        b.TimeZone, b.Status, b.Notes, b.ClientBookingId,
        DateTime.SpecifyKind(b.CreatedAtUtc, DateTimeKind.Utc), DateTime.SpecifyKind(b.UpdatedAtUtc, DateTimeKind.Utc));

    // One vendor is one appointment resource. All calendar-changing writes take this database lock,
    // including writes on separate API instances and across different services from the same vendor.
    public async Task LockVendor(Guid vendorId)
    {
        if (db.Database.IsNpgsql())
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(db.CurrentTenantId + ":" + vendorId));
            var key = BinaryPrimitives.ReadInt64LittleEndian(bytes);
            await db.Database.ExecuteSqlInterpolatedAsync($"SELECT pg_advisory_xact_lock({key});");
        }
        else if (db.Database.IsSqlServer())
        {
            var resource = "estore-calendar:" + db.CurrentTenantId + ":" + vendorId;
            await db.Database.ExecuteSqlInterpolatedAsync($"DECLARE @r int; EXEC @r = sys.sp_getapplock @Resource={resource}, @LockMode='Exclusive', @LockOwner='Transaction', @LockTimeout=10000; IF @r < 0 THROW 51000, 'Calendar is busy; retry.', 1;");
        }
        else throw new NotSupportedException("Service booking requires PostgreSQL or SQL Server database locking.");
    }

    public async Task<ServiceScheduleDto> Schedule(Guid vendorId)
    {
        var schedule = await db.ServiceSchedules.AsNoTracking().FirstOrDefaultAsync(s => s.VendorId == vendorId);
        if (schedule is null)
        {
            var zone = await db.Tenants.Where(t => t.Id == db.CurrentTenantId).Select(t => t.TimeZone).FirstOrDefaultAsync();
            return new(vendorId, ServiceCalendar.Zone(zone) is null ? "Africa/Kigali" : zone!, [], []);
        }
        return new(vendorId, schedule.TimeZone,
            JsonSerializer.Deserialize<List<ServiceHoursDto>>(schedule.WindowsJson) ?? [],
            JsonSerializer.Deserialize<List<DateOnly>>(schedule.BlockedDatesJson) ?? []);
    }

    public async Task<IResult> SaveSchedule(Guid vendorId, ServiceScheduleWriteDto dto)
    {
        var errors = ServiceCalendar.ValidateSchedule(dto);
        if (errors.Count > 0) return Results.ValidationProblem(errors);
        await using var transaction = await db.Database.BeginTransactionAsync();
        await LockVendor(vendorId);
        if (!await db.Vendors.AnyAsync(v => v.Id == vendorId && v.Active && v.Verified)) return Results.NotFound();
        var next = new ServiceScheduleDto(vendorId, dto.TimeZone, dto.Windows!, dto.BlockedDates ?? []);
        var upcoming = await db.ServiceBookings.Where(b => b.VendorId == vendorId &&
            (b.Status == "Pending" || b.Status == "Confirmed") && b.EndsAtUtc > Now).ToListAsync();
        foreach (var booking in upcoming)
        {
            var snapshot = new ServiceOffering { DurationMinutes = booking.DurationMinutes, SlotIntervalMinutes = 1 };
            if (!ServiceCalendar.IsAllowed(snapshot, next, booking.StartsAtUtc, Now, false))
                return Results.Conflict(new { error = "The new schedule would invalidate an existing appointment. Reschedule or cancel it first." });
        }
        var row = await db.ServiceSchedules.FirstOrDefaultAsync(s => s.VendorId == vendorId);
        if (row is null)
        {
            row = new() { TenantId = db.CurrentTenantId!, VendorId = vendorId };
            db.ServiceSchedules.Add(row);
        }
        row.TimeZone = dto.TimeZone;
        row.WindowsJson = JsonSerializer.Serialize(dto.Windows);
        row.BlockedDatesJson = JsonSerializer.Serialize(dto.BlockedDates ?? []);
        row.UpdatedAtUtc = Now;
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Results.Ok(next);
    }

    public async Task<IResult> Availability(Guid id, DateOnly from, DateOnly to)
    {
        var service = await db.ServiceOfferings.AsNoTracking().Include(s => s.Vendor).FirstOrDefaultAsync(s =>
            s.Id == id && s.Active && s.Vendor!.Active && s.Vendor.Verified);
        if (service is null) return Results.NotFound();
        var schedule = await Schedule(service.VendorId);
        var now = Now;
        var today = DateOnly.FromDateTime(TimeZoneInfo.ConvertTimeFromUtc(now, ServiceCalendar.Zone(schedule.TimeZone)!));
        if (to <= from || to.DayNumber - from.DayNumber > 31 || from < today || to > today.AddDays(367))
            return Results.BadRequest(new { error = "Use a future local date range [from,to), at most 31 days, within the next 366 days." });
        var lower = from.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc).AddDays(-1);
        var upper = to.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc).AddDays(1);
        var busy = await db.ServiceBookings.AsNoTracking().Where(b => b.VendorId == service.VendorId &&
            (b.Status == "Pending" || b.Status == "Confirmed") && b.StartsAtUtc < upper && b.EndsAtUtc > lower)
            .Select(b => new { b.StartsAtUtc, b.EndsAtUtc }).ToListAsync();
        var slots = new List<ServiceSlotDto>();
        for (var date = from; date < to; date = date.AddDays(1))
            slots.AddRange(ServiceCalendar.Slots(service, schedule, date, now).Where(s =>
                !busy.Any(b => b.StartsAtUtc < s.EndsAt && b.EndsAtUtc > s.StartsAt)));
        return Results.Ok(new ServiceAvailabilityDto(id, schedule.TimeZone, from, to,
            service.DurationMinutes, service.SlotIntervalMinutes, slots));
    }

    public async Task<IResult> Book(ServiceActor actor, ServiceBookingCreateDto dto)
    {
        if (dto.ClientBookingId == Guid.Empty || !ServiceCalendar.TryParseStart(dto.StartsAt, out var start) ||
            dto.Notes?.Length > 2000)
            return Results.BadRequest(new { error = "Provide serviceId, an ISO startsAt with Z/offset, clientBookingId UUID and optional notes up to 2000 characters." });
        if (actor.Role == "customer" && dto.CustomerId.HasValue)
            return Results.BadRequest(new { error = "Customer identity comes from the session; omit customerId." });
        if (actor.Role != "customer" && !dto.CustomerId.HasValue)
            return Results.BadRequest(new { error = "A linked customerId is required for a staff booking." });
        var customerId = actor.Role == "customer" ? actor.Id : dto.CustomerId!.Value;
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == customerId && !c.IsArchived);
        if (customer is null || !customer.Username.StartsWith("user_", StringComparison.Ordinal))
            return Results.BadRequest(new { error = "Active linked customer profile not found in this tenant." });
        var service = await db.ServiceOfferings.AsNoTracking().FirstOrDefaultAsync(s => s.Id == dto.ServiceId);
        if (service is null || (actor.Role == "vendor" && service.VendorId != actor.Id)) return Results.NotFound();
        await using var transaction = await db.Database.BeginTransactionAsync();
        await LockVendor(service.VendorId);
        var replay = await FindReplay(customer.Username, dto.ClientBookingId);
        if (replay is not null) return Replay(replay, dto, start);
        service = await db.ServiceOfferings.AsNoTracking().Include(s => s.Vendor).FirstAsync(s => s.Id == dto.ServiceId);
        if (!service.Active || service.Vendor?.Active != true || !service.Vendor.Verified)
            return Results.BadRequest(new { error = "The service is not currently bookable." });
        var now = Now;
        var schedule = await Schedule(service.VendorId);
        if (start < now.AddMinutes(service.MinimumNoticeMinutes) || start > now.AddDays(service.BookingWindowDays) ||
            !ServiceCalendar.IsAllowed(service, schedule, start, now))
            return Results.BadRequest(new { error = "Choose a published available slot within the notice and booking window." });
        var end = start.AddMinutes(service.DurationMinutes);
        if (await Overlaps(service.VendorId, start, end)) return SlotConflict();
        var booking = new ServiceBooking {
            TenantId = db.CurrentTenantId!, VendorId = service.VendorId, ServiceId = service.Id,
            CustomerId = customerId, CustomerSubject = customer.Username, ClientBookingId = dto.ClientBookingId,
            ServiceName = service.Name, Price = service.Price, DurationMinutes = service.DurationMinutes,
            StartsAtUtc = start, RequestedStartsAtUtc = start, EndsAtUtc = end, TimeZone = schedule.TimeZone,
            Notes = NormalizeNotes(dto.Notes), CreatedAtUtc = now, UpdatedAtUtc = now
        };
        db.ServiceBookings.Add(booking);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException ex) when (DatabaseErrors.IsUniqueViolation(ex))
        {
            await transaction.RollbackAsync();
            await transaction.DisposeAsync();
            db.Entry(booking).State = EntityState.Detached;
            replay = await FindReplay(customer.Username, dto.ClientBookingId);
            if (replay is null) throw;
            return Replay(replay, dto, start);
        }
        await transaction.CommitAsync();
        booking.Vendor = service.Vendor;
        booking.Customer = customer;
        return Results.Created($"/api/service-bookings/{booking.Id}", ToDto(booking));
    }

    private Task<ServiceBooking?> FindReplay(string subject, Guid key) => db.ServiceBookings.AsNoTracking()
        .Include(b => b.Vendor).Include(b => b.Customer)
        .FirstOrDefaultAsync(b => b.CustomerSubject == subject && b.ClientBookingId == key);

    private static string? NormalizeNotes(string? notes) => string.IsNullOrWhiteSpace(notes) ? null : notes.Trim();
    private static IResult Replay(ServiceBooking booking, ServiceBookingCreateDto dto, DateTime start) =>
        booking.ServiceId == dto.ServiceId && booking.RequestedStartsAtUtc == start && booking.Notes == NormalizeNotes(dto.Notes)
            ? Results.Ok(ToDto(booking)) : Results.Conflict(new { error = "clientBookingId was already used for a different booking request." });

    private Task<bool> Overlaps(Guid vendorId, DateTime start, DateTime end, Guid? except = null) =>
        db.ServiceBookings.AnyAsync(b => b.VendorId == vendorId && b.Id != except &&
            (b.Status == "Pending" || b.Status == "Confirmed") && b.StartsAtUtc < end && b.EndsAtUtc > start);
    private static IResult SlotConflict() => Results.Conflict(new { error = "This vendor already has an appointment during that time. Refresh availability." });

    public async Task<IResult> Reschedule(ServiceActor actor, Guid id, ServiceBookingRescheduleDto dto)
    {
        if (!ServiceCalendar.TryParseStart(dto.StartsAt, out var start))
            return Results.BadRequest(new { error = "Use an ISO startsAt with Z or an explicit offset." });
        var vendorId = await Owned(actor).Where(b => b.Id == id).Select(b => (Guid?)b.VendorId).FirstOrDefaultAsync();
        if (vendorId is null) return Results.NotFound();
        await using var transaction = await db.Database.BeginTransactionAsync();
        await LockVendor(vendorId.Value);
        var booking = await Owned(actor).FirstOrDefaultAsync(b => b.Id == id);
        if (booking is null) return Results.NotFound();
        if (!ServiceCalendar.OccupiesSlot(booking.Status) || booking.StartsAtUtc <= Now)
            return Results.Conflict(new { error = "Only future pending/confirmed appointments can be rescheduled." });
        if (booking.StartsAtUtc == start) return Results.Ok(ToDto(booking));
        var service = await db.ServiceOfferings.AsNoTracking().Include(s => s.Vendor).FirstAsync(s => s.Id == booking.ServiceId);
        if (!service.Active || service.Vendor?.Active != true || !service.Vendor.Verified)
            return Results.Conflict(new { error = "The service or vendor is inactive; contact the vendor." });
        service.DurationMinutes = booking.DurationMinutes;
        var schedule = await Schedule(booking.VendorId);
        var now = Now;
        if (start < now.AddMinutes(service.MinimumNoticeMinutes) || start > now.AddDays(service.BookingWindowDays) ||
            !ServiceCalendar.IsAllowed(service, schedule, start, now))
            return Results.BadRequest(new { error = "Choose an available slot within the booking window." });
        var end = start.AddMinutes(booking.DurationMinutes);
        if (await Overlaps(booking.VendorId, start, end, id)) return SlotConflict();
        booking.StartsAtUtc = start;
        booking.EndsAtUtc = end;
        booking.TimeZone = schedule.TimeZone;
        booking.UpdatedAtUtc = now;
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Results.Ok(ToDto(booking));
    }

    public async Task<IResult> ChangeStatus(ServiceActor actor, Guid id, string status)
    {
        if (actor.Role == "customer" && status != "Cancelled") return Results.StatusCode(403);
        if (status is not ("Confirmed" or "Cancelled" or "Rejected" or "Completed" or "NoShow"))
            return Results.BadRequest(new { error = "Use Confirmed, Cancelled, Rejected, Completed, or NoShow." });
        var vendorId = await Owned(actor).Where(b => b.Id == id).Select(b => (Guid?)b.VendorId).FirstOrDefaultAsync();
        if (vendorId is null) return Results.NotFound();
        await using var transaction = await db.Database.BeginTransactionAsync();
        await LockVendor(vendorId.Value);
        var booking = await Owned(actor).FirstOrDefaultAsync(b => b.Id == id);
        if (booking is null) return Results.NotFound();
        if (booking.Status == status) return Results.Ok(ToDto(booking));
        if ((actor.Role == "customer" && booking.StartsAtUtc <= Now) ||
            !ServiceCalendar.CanTransition(booking.Status, status, booking.StartsAtUtc, booking.EndsAtUtc, Now))
            return Results.Conflict(new { error = "This status transition is not allowed for the appointment." });
        booking.Status = status;
        booking.UpdatedAtUtc = Now;
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Results.Ok(ToDto(booking));
    }
}
