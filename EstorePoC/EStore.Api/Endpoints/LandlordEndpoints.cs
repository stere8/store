using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class LandlordEndpoints
{
    public static RouteGroupBuilder MapLandlordEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/dashboard", GetDashboard);
        group.MapGet("/occupancy", GetOccupancy);

        group.MapGet("/leases", ListLeases);
        group.MapGet("/leases/{id:guid}", GetLease);
        group.MapPost("/leases", CreateLease);
        group.MapPut("/leases/{id:guid}", UpdateLease);
        group.MapPatch("/leases/{id:guid}/status", UpdateLeaseStatus);

        group.MapGet("/rent-payments", ListRentPayments);
        group.MapPost("/rent-payments", CreateRentPayment);
        group.MapPatch("/rent-payments/{id:guid}/payment", RecordRentPayment);
        group.MapPatch("/rent-payments/{id:guid}/status", UpdateRentPaymentStatus);

        return group;
    }

    private static async Task<IResult> GetDashboard(
        AppDbContext db,
        DateTimeOffset? from,
        DateTimeOffset? to)
    {
        var tenantId = db.CurrentTenantId!;
        var range = ResolveReportingRange(from, to);
        if (range.Error is not null)
        {
            return range.Error;
        }

        var now = DateTimeOffset.UtcNow;
        var locations = await db.Locations
            .Where(l => l.TenantId == tenantId)
            .ToListAsync();
        var vendors = await db.Vendors
            .Where(v => v.TenantId == tenantId)
            .ToListAsync();
        var leases = await db.StoreLeases
            .Include(l => l.Vendor)
            .Include(l => l.Location)
            .Where(l => l.TenantId == tenantId)
            .ToListAsync();
        var rentPayments = await db.RentPayments
            .Where(p =>
                p.TenantId == tenantId &&
                p.DueDate >= range.From &&
                p.DueDate <= range.To)
            .ToListAsync();
        var reservations = await db.Reservations
            .Where(r =>
                r.TenantId == tenantId &&
                r.CreatedAt >= range.From &&
                r.CreatedAt <= range.To)
            .ToListAsync();

        var activeLeases = leases.Where(l => IsCurrentLease(l, now)).ToList();
        var occupiedLocationIds = activeLeases.Select(l => l.LocationId)
            .Concat(vendors.Where(v => v.Active && v.LocationId.HasValue).Select(v => v.LocationId!.Value))
            .Distinct()
            .ToHashSet();

        var rentDue = rentPayments.Sum(p => p.AmountDue);
        var rentCollected = rentPayments.Sum(p => p.AmountPaid);
        var outstandingRent = rentPayments
            .Where(p => p.Status != RentPaymentStatus.Paid && p.Status != RentPaymentStatus.Waived)
            .Sum(p => Math.Max(0, p.AmountDue - p.AmountPaid));
        var overdueRent = rentPayments
            .Where(p =>
                p.Status == RentPaymentStatus.Overdue ||
                (p.DueDate < now && p.AmountPaid < p.AmountDue && p.Status != RentPaymentStatus.Waived))
            .Sum(p => Math.Max(0, p.AmountDue - p.AmountPaid));

        var occupancy = new LandlordOccupancySummaryDto(
            locations.Count,
            occupiedLocationIds.Count,
            Math.Max(0, locations.Count - occupiedLocationIds.Count),
            locations.Count == 0 ? 0m : Math.Round(occupiedLocationIds.Count * 100m / locations.Count, 2),
            activeLeases.Count,
            activeLeases.Count(l => l.LeaseEnd.HasValue && l.LeaseEnd.Value <= now.AddDays(30)));

        var rent = new LandlordRentSummaryDto(
            range.From,
            range.To,
            activeLeases.Sum(l => l.MonthlyRent),
            rentDue,
            rentCollected,
            outstandingRent,
            overdueRent,
            rentDue == 0 ? 0m : Math.Round(rentCollected * 100m / rentDue, 2),
            rentPayments.Count(p => p.Status == RentPaymentStatus.Paid),
            rentPayments.Count(p => p.Status == RentPaymentStatus.Partial),
            rentPayments.Count(p =>
                p.Status == RentPaymentStatus.Overdue ||
                (p.DueDate < now && p.AmountPaid < p.AmountDue && p.Status != RentPaymentStatus.Waived)));

        var storeRevenue = new LandlordStoreRevenueSummaryDto(
            reservations.Where(r => r.Status == ReservationStatus.Completed).Sum(r => r.TotalAmount),
            reservations.Count(r => r.Status == ReservationStatus.Completed),
            reservations.Where(r => r.Status == ReservationStatus.Pending).Sum(r => r.TotalAmount),
            reservations.Where(r => r.Status == ReservationStatus.Confirmed).Sum(r => r.TotalAmount));

        var vendorSummary = new LandlordVendorSummaryDto(
            vendors.Count,
            vendors.Count(v => v.Active),
            vendors.Count(v => v.Verified),
            vendors.Count(v => !v.Active));

        var recentRentPayments = rentPayments
            .OrderByDescending(p => p.UpdatedAt)
            .ThenByDescending(p => p.DueDate)
            .Take(8)
            .Select(ToRentPaymentDto)
            .ToList();

        return Results.Ok(new LandlordDashboardDto(
            tenantId,
            occupancy,
            rent,
            storeRevenue,
            vendorSummary,
            recentRentPayments));
    }

    private static async Task<IResult> GetOccupancy(AppDbContext db)
    {
        var tenantId = db.CurrentTenantId!;
        var now = DateTimeOffset.UtcNow;

        var locations = await db.Locations
            .Where(l => l.TenantId == tenantId)
            .OrderBy(l => l.Name)
            .ToListAsync();
        var vendors = await db.Vendors
            .Where(v => v.TenantId == tenantId && v.Active)
            .ToListAsync();
        var leases = await db.StoreLeases
            .Include(l => l.Vendor)
            .Where(l => l.TenantId == tenantId)
            .ToListAsync();

        var activeLeases = leases.Where(l => IsCurrentLease(l, now)).ToList();
        var result = locations.Select(location =>
        {
            var locationLeases = activeLeases
                .Where(l => l.LocationId == location.Id)
                .OrderBy(l => l.Vendor!.DisplayName)
                .ToList();
            var leasedVendorIds = locationLeases.Select(l => l.VendorId).ToHashSet();

            var occupancyVendors = locationLeases
                .Select(l => new LandlordOccupancyVendorDto(
                    l.VendorId,
                    l.Vendor?.DisplayName,
                    l.Id,
                    l.MonthlyRent,
                    l.Currency,
                    l.LeaseStart,
                    l.LeaseEnd))
                .ToList();

            occupancyVendors.AddRange(vendors
                .Where(v => v.LocationId == location.Id && !leasedVendorIds.Contains(v.Id))
                .OrderBy(v => v.DisplayName)
                .Select(v => new LandlordOccupancyVendorDto(
                    v.Id,
                    v.DisplayName,
                    null,
                    null,
                    null,
                    null,
                    null)));

            var status = locationLeases.Count > 0
                ? "Rented"
                : occupancyVendors.Count > 0 ? "Assigned" : "Available";

            return new LandlordOccupancyUnitDto(
                location.Id,
                location.Name,
                location.Code,
                location.Floor,
                location.Unit,
                status,
                locationLeases.Count,
                occupancyVendors);
        }).ToList();

        return Results.Ok(result);
    }

    private static async Task<IResult> ListLeases(
        AppDbContext db,
        string? status,
        Guid? vendorId,
        Guid? locationId)
    {
        var tenantId = db.CurrentTenantId!;
        var query = db.StoreLeases
            .Include(l => l.Vendor)
            .Include(l => l.Location)
            .Where(l => l.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<LeaseStatus>(status, true, out var parsedStatus))
            {
                return Results.BadRequest(new { error = $"Invalid lease status '{status}'." });
            }

            query = query.Where(l => l.Status == parsedStatus);
        }

        if (vendorId.HasValue)
        {
            query = query.Where(l => l.VendorId == vendorId.Value);
        }

        if (locationId.HasValue)
        {
            query = query.Where(l => l.LocationId == locationId.Value);
        }

        var leases = await query
            .OrderByDescending(l => l.UpdatedAt)
            .ThenBy(l => l.Vendor!.DisplayName)
            .ToListAsync();

        return Results.Ok(leases.Select(ToLeaseDto).ToList());
    }

    private static async Task<IResult> GetLease(AppDbContext db, Guid id)
    {
        var tenantId = db.CurrentTenantId!;
        var lease = await db.StoreLeases
            .Include(l => l.Vendor)
            .Include(l => l.Location)
            .FirstOrDefaultAsync(l => l.TenantId == tenantId && l.Id == id);

        return lease is null
            ? Results.NotFound(new { error = "Lease not found." })
            : Results.Ok(ToLeaseDto(lease));
    }

    private static async Task<IResult> CreateLease(
        AppDbContext db,
        LandlordLeaseWriteDto dto)
    {
        var tenantId = db.CurrentTenantId!;
        var validation = await ValidateLeaseWriteAsync(db, tenantId, dto, null);
        if (validation.Error is not null)
        {
            return validation.Error;
        }

        var now = DateTimeOffset.UtcNow;
        var lease = new StoreLease
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            VendorId = dto.VendorId,
            LocationId = dto.LocationId,
            MonthlyRent = dto.MonthlyRent,
            Currency = NormalizeCurrency(dto.Currency),
            BillingDay = dto.BillingDay,
            SecurityDeposit = dto.SecurityDeposit,
            LeaseStart = dto.LeaseStart.ToUniversalTime(),
            LeaseEnd = dto.LeaseEnd?.ToUniversalTime(),
            Status = validation.Status,
            Notes = NormalizeOptional(dto.Notes),
            CreatedAt = now,
            UpdatedAt = now
        };

        db.StoreLeases.Add(lease);
        await db.SaveChangesAsync();

        var hydrated = await LoadLeaseAsync(db, tenantId, lease.Id);
        return Results.Created($"/api/landlord/leases/{lease.Id}", ToLeaseDto(hydrated!));
    }

    private static async Task<IResult> UpdateLease(
        AppDbContext db,
        Guid id,
        LandlordLeaseWriteDto dto)
    {
        var tenantId = db.CurrentTenantId!;
        var lease = await db.StoreLeases.FirstOrDefaultAsync(l => l.TenantId == tenantId && l.Id == id);
        if (lease is null)
        {
            return Results.NotFound(new { error = "Lease not found." });
        }

        var validation = await ValidateLeaseWriteAsync(db, tenantId, dto, id);
        if (validation.Error is not null)
        {
            return validation.Error;
        }

        lease.VendorId = dto.VendorId;
        lease.LocationId = dto.LocationId;
        lease.MonthlyRent = dto.MonthlyRent;
        lease.Currency = NormalizeCurrency(dto.Currency);
        lease.BillingDay = dto.BillingDay;
        lease.SecurityDeposit = dto.SecurityDeposit;
        lease.LeaseStart = dto.LeaseStart.ToUniversalTime();
        lease.LeaseEnd = dto.LeaseEnd?.ToUniversalTime();
        lease.Status = validation.Status;
        lease.Notes = NormalizeOptional(dto.Notes);
        lease.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        var hydrated = await LoadLeaseAsync(db, tenantId, lease.Id);
        return Results.Ok(ToLeaseDto(hydrated!));
    }

    private static async Task<IResult> UpdateLeaseStatus(
        AppDbContext db,
        Guid id,
        LandlordLeaseStatusUpdateDto dto)
    {
        var tenantId = db.CurrentTenantId!;
        var lease = await db.StoreLeases.FirstOrDefaultAsync(l => l.TenantId == tenantId && l.Id == id);
        if (lease is null)
        {
            return Results.NotFound(new { error = "Lease not found." });
        }

        if (!Enum.TryParse<LeaseStatus>(dto.Status, true, out var status))
        {
            return Results.BadRequest(new { error = $"Invalid lease status '{dto.Status}'." });
        }

        if (status == LeaseStatus.Active &&
            await db.StoreLeases.AnyAsync(l =>
                l.TenantId == tenantId &&
                l.Id != lease.Id &&
                l.VendorId == lease.VendorId &&
                l.Status == LeaseStatus.Active))
        {
            return Results.Conflict(new { error = "This vendor already has an active lease." });
        }

        lease.Status = status;
        if (dto.Notes is not null)
        {
            lease.Notes = NormalizeOptional(dto.Notes);
        }
        lease.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        var hydrated = await LoadLeaseAsync(db, tenantId, lease.Id);
        return Results.Ok(ToLeaseDto(hydrated!));
    }

    private static async Task<IResult> ListRentPayments(
        AppDbContext db,
        string? status,
        Guid? leaseId,
        Guid? vendorId,
        DateTimeOffset? from,
        DateTimeOffset? to)
    {
        var tenantId = db.CurrentTenantId!;
        var query = db.RentPayments
            .Include(p => p.StoreLease)
            .Include(p => p.Vendor)
            .Include(p => p.Location)
            .Where(p => p.TenantId == tenantId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<RentPaymentStatus>(status, true, out var parsedStatus))
            {
                return Results.BadRequest(new { error = $"Invalid rent payment status '{status}'." });
            }

            query = query.Where(p => p.Status == parsedStatus);
        }

        if (leaseId.HasValue)
        {
            query = query.Where(p => p.StoreLeaseId == leaseId.Value);
        }

        if (vendorId.HasValue)
        {
            query = query.Where(p => p.VendorId == vendorId.Value);
        }

        if (from.HasValue)
        {
            var fromUtc = from.Value.ToUniversalTime();
            query = query.Where(p => p.DueDate >= fromUtc);
        }

        if (to.HasValue)
        {
            var toUtc = to.Value.ToUniversalTime();
            query = query.Where(p => p.DueDate <= toUtc);
        }

        var payments = await query
            .OrderByDescending(p => p.DueDate)
            .ThenBy(p => p.Vendor!.DisplayName)
            .ToListAsync();

        return Results.Ok(payments.Select(ToRentPaymentDto).ToList());
    }

    private static async Task<IResult> CreateRentPayment(
        AppDbContext db,
        LandlordRentPaymentWriteDto dto)
    {
        var tenantId = db.CurrentTenantId!;
        var lease = await db.StoreLeases
            .Include(l => l.Vendor)
            .Include(l => l.Location)
            .FirstOrDefaultAsync(l => l.TenantId == tenantId && l.Id == dto.StoreLeaseId);
        if (lease is null)
        {
            return Results.BadRequest(new { error = "Lease not found." });
        }

        var validationError = ValidateRentPaymentWrite(dto);
        if (validationError is not null)
        {
            return validationError;
        }

        var periodStart = dto.PeriodStart.ToUniversalTime();
        var duplicate = await db.RentPayments.AnyAsync(p =>
            p.TenantId == tenantId &&
            p.StoreLeaseId == lease.Id &&
            p.PeriodStart == periodStart);
        if (duplicate)
        {
            return Results.Conflict(new { error = "A rent payment already exists for this lease period." });
        }

        var now = DateTimeOffset.UtcNow;
        var payment = new RentPayment
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            StoreLeaseId = lease.Id,
            VendorId = lease.VendorId,
            LocationId = lease.LocationId,
            PeriodStart = periodStart,
            PeriodEnd = dto.PeriodEnd.ToUniversalTime(),
            DueDate = dto.DueDate.ToUniversalTime(),
            AmountDue = dto.AmountDue,
            AmountPaid = dto.AmountPaid,
            Currency = NormalizeCurrency(dto.Currency ?? lease.Currency),
            Status = ResolveRentPaymentStatus(dto.Status, dto.AmountDue, dto.AmountPaid, dto.DueDate),
            PaymentReference = NormalizeOptional(dto.PaymentReference),
            PaidAt = dto.PaidAt?.ToUniversalTime(),
            Notes = NormalizeOptional(dto.Notes),
            CreatedAt = now,
            UpdatedAt = now
        };

        db.RentPayments.Add(payment);
        await db.SaveChangesAsync();

        var hydrated = await LoadRentPaymentAsync(db, tenantId, payment.Id);
        return Results.Created($"/api/landlord/rent-payments/{payment.Id}", ToRentPaymentDto(hydrated!));
    }

    private static async Task<IResult> RecordRentPayment(
        AppDbContext db,
        Guid id,
        LandlordRentPaymentRecordDto dto)
    {
        if (dto.AmountPaid <= 0)
        {
            return Results.BadRequest(new { error = "AmountPaid must be greater than zero." });
        }

        var tenantId = db.CurrentTenantId!;
        var payment = await db.RentPayments.FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == id);
        if (payment is null)
        {
            return Results.NotFound(new { error = "Rent payment not found." });
        }

        payment.AmountPaid += dto.AmountPaid;
        payment.PaymentReference = NormalizeOptional(dto.PaymentReference) ?? payment.PaymentReference;
        payment.PaidAt = dto.PaidAt?.ToUniversalTime() ?? DateTimeOffset.UtcNow;
        payment.Notes = NormalizeOptional(dto.Notes) ?? payment.Notes;
        payment.Status = CalculateRentPaymentStatus(payment.AmountDue, payment.AmountPaid, payment.DueDate);
        payment.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        var hydrated = await LoadRentPaymentAsync(db, tenantId, payment.Id);
        return Results.Ok(ToRentPaymentDto(hydrated!));
    }

    private static async Task<IResult> UpdateRentPaymentStatus(
        AppDbContext db,
        Guid id,
        LandlordRentPaymentStatusUpdateDto dto)
    {
        var tenantId = db.CurrentTenantId!;
        var payment = await db.RentPayments.FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == id);
        if (payment is null)
        {
            return Results.NotFound(new { error = "Rent payment not found." });
        }

        if (!Enum.TryParse<RentPaymentStatus>(dto.Status, true, out var status))
        {
            return Results.BadRequest(new { error = $"Invalid rent payment status '{dto.Status}'." });
        }

        payment.Status = status;
        if (status == RentPaymentStatus.Paid && payment.PaidAt is null)
        {
            payment.PaidAt = DateTimeOffset.UtcNow;
        }

        if (dto.Notes is not null)
        {
            payment.Notes = NormalizeOptional(dto.Notes);
        }

        payment.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();

        var hydrated = await LoadRentPaymentAsync(db, tenantId, payment.Id);
        return Results.Ok(ToRentPaymentDto(hydrated!));
    }

    private static async Task<(LeaseStatus Status, IResult? Error)> ValidateLeaseWriteAsync(
        AppDbContext db,
        string tenantId,
        LandlordLeaseWriteDto dto,
        Guid? existingLeaseId)
    {
        if (dto.VendorId == Guid.Empty || dto.LocationId == Guid.Empty)
        {
            return (LeaseStatus.Draft, Results.BadRequest(new { error = "VendorId and LocationId are required." }));
        }

        if (dto.MonthlyRent < 0 || dto.SecurityDeposit < 0)
        {
            return (LeaseStatus.Draft, Results.BadRequest(new { error = "Rent and security deposit cannot be negative." }));
        }

        if (dto.BillingDay is < 1 or > 31)
        {
            return (LeaseStatus.Draft, Results.BadRequest(new { error = "BillingDay must be between 1 and 31." }));
        }

        if (dto.LeaseEnd.HasValue && dto.LeaseEnd.Value.ToUniversalTime() < dto.LeaseStart.ToUniversalTime())
        {
            return (LeaseStatus.Draft, Results.BadRequest(new { error = "LeaseEnd must be after LeaseStart." }));
        }

        if (!Enum.TryParse<LeaseStatus>(dto.Status ?? nameof(LeaseStatus.Active), true, out var status))
        {
            return (LeaseStatus.Draft, Results.BadRequest(new { error = $"Invalid lease status '{dto.Status}'." }));
        }

        var vendorExists = await db.Vendors.AnyAsync(v =>
            v.TenantId == tenantId &&
            v.Id == dto.VendorId &&
            v.Active);
        if (!vendorExists)
        {
            return (status, Results.BadRequest(new { error = "Vendor not found or inactive." }));
        }

        var locationExists = await db.Locations.AnyAsync(l =>
            l.TenantId == tenantId &&
            l.Id == dto.LocationId);
        if (!locationExists)
        {
            return (status, Results.BadRequest(new { error = "Location not found." }));
        }

        if (status == LeaseStatus.Active)
        {
            var activeLeaseExists = await db.StoreLeases.AnyAsync(l =>
                l.TenantId == tenantId &&
                l.VendorId == dto.VendorId &&
                l.Status == LeaseStatus.Active &&
                (!existingLeaseId.HasValue || l.Id != existingLeaseId.Value));
            if (activeLeaseExists)
            {
                return (status, Results.Conflict(new { error = "This vendor already has an active lease." }));
            }
        }

        return (status, null);
    }

    private static IResult? ValidateRentPaymentWrite(LandlordRentPaymentWriteDto dto)
    {
        if (dto.StoreLeaseId == Guid.Empty)
        {
            return Results.BadRequest(new { error = "StoreLeaseId is required." });
        }

        if (dto.PeriodEnd.ToUniversalTime() < dto.PeriodStart.ToUniversalTime())
        {
            return Results.BadRequest(new { error = "PeriodEnd must be after PeriodStart." });
        }

        if (dto.AmountDue < 0 || dto.AmountPaid < 0)
        {
            return Results.BadRequest(new { error = "Rent payment amounts cannot be negative." });
        }

        if (!string.IsNullOrWhiteSpace(dto.Status) &&
            !Enum.TryParse<RentPaymentStatus>(dto.Status, true, out _))
        {
            return Results.BadRequest(new { error = $"Invalid rent payment status '{dto.Status}'." });
        }

        return null;
    }

    private static async Task<StoreLease?> LoadLeaseAsync(AppDbContext db, string tenantId, Guid id) =>
        await db.StoreLeases
            .Include(l => l.Vendor)
            .Include(l => l.Location)
            .FirstOrDefaultAsync(l => l.TenantId == tenantId && l.Id == id);

    private static async Task<RentPayment?> LoadRentPaymentAsync(AppDbContext db, string tenantId, Guid id) =>
        await db.RentPayments
            .Include(p => p.StoreLease)
            .Include(p => p.Vendor)
            .Include(p => p.Location)
            .FirstOrDefaultAsync(p => p.TenantId == tenantId && p.Id == id);

    private static (DateTimeOffset From, DateTimeOffset To, IResult? Error) ResolveReportingRange(
        DateTimeOffset? from,
        DateTimeOffset? to)
    {
        var now = DateTimeOffset.UtcNow;
        var resolvedFrom = (from ?? StartOfUtcMonth(now)).ToUniversalTime();
        var resolvedTo = (to ?? resolvedFrom.AddMonths(1).AddTicks(-1)).ToUniversalTime();

        if (resolvedFrom > resolvedTo)
        {
            return (resolvedFrom, resolvedTo, Results.BadRequest(new { error = "from must be earlier than or equal to to." }));
        }

        return (resolvedFrom, resolvedTo, null);
    }

    private static bool IsCurrentLease(StoreLease lease, DateTimeOffset now) =>
        lease.Status == LeaseStatus.Active &&
        lease.LeaseStart <= now &&
        (!lease.LeaseEnd.HasValue || lease.LeaseEnd.Value >= now);

    private static DateTimeOffset StartOfUtcMonth(DateTimeOffset value) =>
        new(value.UtcDateTime.Year, value.UtcDateTime.Month, 1, 0, 0, 0, TimeSpan.Zero);

    private static RentPaymentStatus ResolveRentPaymentStatus(
        string? status,
        decimal amountDue,
        decimal amountPaid,
        DateTimeOffset dueDate)
    {
        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<RentPaymentStatus>(status, true, out var parsedStatus))
        {
            return parsedStatus;
        }

        return CalculateRentPaymentStatus(amountDue, amountPaid, dueDate);
    }

    private static RentPaymentStatus CalculateRentPaymentStatus(
        decimal amountDue,
        decimal amountPaid,
        DateTimeOffset dueDate)
    {
        if (amountPaid >= amountDue)
        {
            return RentPaymentStatus.Paid;
        }

        if (amountPaid > 0)
        {
            return RentPaymentStatus.Partial;
        }

        return dueDate.ToUniversalTime() < DateTimeOffset.UtcNow
            ? RentPaymentStatus.Overdue
            : RentPaymentStatus.Pending;
    }

    private static string NormalizeCurrency(string? currency) =>
        string.IsNullOrWhiteSpace(currency) ? "USD" : currency.Trim().ToUpperInvariant()[..Math.Min(8, currency.Trim().Length)];

    private static string? NormalizeOptional(string? value)
    {
        var normalized = value?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }

    private static LandlordLeaseDto ToLeaseDto(StoreLease lease) =>
        new(
            lease.Id,
            lease.TenantId,
            lease.VendorId,
            lease.Vendor?.DisplayName,
            lease.LocationId,
            lease.Location?.Name,
            lease.MonthlyRent,
            lease.Currency,
            lease.BillingDay,
            lease.SecurityDeposit,
            lease.LeaseStart,
            lease.LeaseEnd,
            lease.Status,
            lease.Notes,
            lease.CreatedAt,
            lease.UpdatedAt);

    private static LandlordRentPaymentDto ToRentPaymentDto(RentPayment payment) =>
        new(
            payment.Id,
            payment.TenantId,
            payment.StoreLeaseId,
            payment.VendorId,
            payment.Vendor?.DisplayName,
            payment.LocationId,
            payment.Location?.Name,
            payment.PeriodStart,
            payment.PeriodEnd,
            payment.DueDate,
            payment.AmountDue,
            payment.AmountPaid,
            Math.Max(0, payment.AmountDue - payment.AmountPaid),
            payment.Currency,
            payment.Status,
            payment.PaymentReference,
            payment.PaidAt,
            payment.Notes,
            payment.CreatedAt,
            payment.UpdatedAt);
}

public record LandlordDashboardDto(
    string TenantId,
    LandlordOccupancySummaryDto Occupancy,
    LandlordRentSummaryDto Rent,
    LandlordStoreRevenueSummaryDto StoreRevenue,
    LandlordVendorSummaryDto Vendors,
    IReadOnlyList<LandlordRentPaymentDto> RecentRentPayments);

public record LandlordOccupancySummaryDto(
    int TotalLocations,
    int OccupiedLocations,
    int AvailableLocations,
    decimal OccupancyRate,
    int ActiveLeases,
    int LeasesExpiringIn30Days);

public record LandlordRentSummaryDto(
    DateTimeOffset From,
    DateTimeOffset To,
    decimal MonthlyRentRoll,
    decimal RentDue,
    decimal RentCollected,
    decimal RentOutstanding,
    decimal RentOverdue,
    decimal CollectionRate,
    int PaidPayments,
    int PartialPayments,
    int OverduePayments);

public record LandlordStoreRevenueSummaryDto(
    decimal CompletedRevenue,
    int CompletedReservationCount,
    decimal PendingReservationValue,
    decimal ConfirmedReservationValue);

public record LandlordVendorSummaryDto(
    int TotalVendors,
    int ActiveVendors,
    int VerifiedVendors,
    int InactiveVendors);

public record LandlordOccupancyUnitDto(
    Guid LocationId,
    string LocationName,
    string? Code,
    string? Floor,
    string? Unit,
    string OccupancyStatus,
    int ActiveLeaseCount,
    IReadOnlyList<LandlordOccupancyVendorDto> Vendors);

public record LandlordOccupancyVendorDto(
    Guid VendorId,
    string? VendorName,
    Guid? LeaseId,
    decimal? MonthlyRent,
    string? Currency,
    DateTimeOffset? LeaseStart,
    DateTimeOffset? LeaseEnd);

public record LandlordLeaseDto(
    Guid Id,
    string TenantId,
    Guid VendorId,
    string? VendorName,
    Guid LocationId,
    string? LocationName,
    decimal MonthlyRent,
    string Currency,
    int BillingDay,
    decimal SecurityDeposit,
    DateTimeOffset LeaseStart,
    DateTimeOffset? LeaseEnd,
    LeaseStatus Status,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record LandlordLeaseWriteDto(
    Guid VendorId,
    Guid LocationId,
    decimal MonthlyRent,
    string? Currency,
    int BillingDay,
    decimal SecurityDeposit,
    DateTimeOffset LeaseStart,
    DateTimeOffset? LeaseEnd,
    string? Status,
    string? Notes);

public record LandlordLeaseStatusUpdateDto(
    string Status,
    string? Notes);

public record LandlordRentPaymentDto(
    Guid Id,
    string TenantId,
    Guid StoreLeaseId,
    Guid VendorId,
    string? VendorName,
    Guid LocationId,
    string? LocationName,
    DateTimeOffset PeriodStart,
    DateTimeOffset PeriodEnd,
    DateTimeOffset DueDate,
    decimal AmountDue,
    decimal AmountPaid,
    decimal BalanceDue,
    string Currency,
    RentPaymentStatus Status,
    string? PaymentReference,
    DateTimeOffset? PaidAt,
    string? Notes,
    DateTimeOffset CreatedAt,
    DateTimeOffset UpdatedAt);

public record LandlordRentPaymentWriteDto(
    Guid StoreLeaseId,
    DateTimeOffset PeriodStart,
    DateTimeOffset PeriodEnd,
    DateTimeOffset DueDate,
    decimal AmountDue,
    decimal AmountPaid,
    string? Currency,
    string? Status,
    string? PaymentReference,
    DateTimeOffset? PaidAt,
    string? Notes);

public record LandlordRentPaymentRecordDto(
    decimal AmountPaid,
    string? PaymentReference,
    DateTimeOffset? PaidAt,
    string? Notes);

public record LandlordRentPaymentStatusUpdateDto(
    string Status,
    string? Notes);
