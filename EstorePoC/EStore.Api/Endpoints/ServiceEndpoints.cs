using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class ServiceEndpoints
{
    public static IEndpointRouteBuilder MapServiceEndpoints(this IEndpointRouteBuilder app)
    {
        var catalog = app.MapGroup("/api/services").WithTags("Services");
        catalog.MapGet("", (ServiceCatalogService services, Guid? vendorId, Guid? categoryId,
            int page = 1, int pageSize = 20) => ListServices(services, false, vendorId, categoryId, page, pageSize))
            .Produces<ServicePageDto>().Produces(400);
        catalog.MapGet("/{id:guid}", async (ServiceCatalogService services, Guid id) =>
        {
            var service = await services.Query.FirstOrDefaultAsync(s => s.Id == id && s.Active &&
                s.Vendor!.Active && s.Vendor.Verified);
            return service is null ? Results.NotFound() : Results.Ok(ServiceCatalogService.ToDto(service));
        }).Produces<ServiceDto>().Produces(404);
        catalog.MapGet("/{id:guid}/availability", (ServiceBookingService bookings, Guid id, DateOnly from, DateOnly to) =>
            bookings.Availability(id, from, to)).Produces<ServiceAvailabilityDto>().Produces(400).Produces(404);

        var vendor = app.MapGroup("/api/vendor-portal").WithTags("VendorServices");
        vendor.MapGet("/services", async (HttpContext context, AppDbContext db, VendorAuthService auth, ServiceCatalogService services) =>
        {
            var actor = await Resolve(context, db, auth, "vendor");
            if (actor is null) return Results.Unauthorized();
            var rows = await services.Query.Where(s => s.VendorId == actor.Id).OrderBy(s => s.Name).ToListAsync();
            return Results.Ok(rows.Select(ServiceCatalogService.ToDto));
        }).Produces<List<ServiceDto>>();
        vendor.MapGet("/services/{id:guid}", async (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceCatalogService services, Guid id) =>
        {
            var actor = await Resolve(context, db, auth, "vendor");
            if (actor is null) return Results.Unauthorized();
            var service = await services.Query.FirstOrDefaultAsync(s => s.Id == id && s.VendorId == actor.Id);
            return service is null ? Results.NotFound() : Results.Ok(ServiceCatalogService.ToDto(service));
        }).Produces<ServiceDto>();
        vendor.MapPost("/services", (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceCatalogService services, ServiceBookingService bookings, ServiceWriteDto dto) =>
            SaveService(context, db, auth, services, bookings, "vendor", dto)).Produces<ServiceDto>(201).Produces(400).Produces(401);
        vendor.MapPut("/services/{id:guid}", (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceCatalogService services, ServiceBookingService bookings, ServiceWriteDto dto, Guid id) =>
            SaveService(context, db, auth, services, bookings, "vendor", dto, id)).Produces<ServiceDto>().Produces(400).Produces(401).Produces(404);
        vendor.MapDelete("/services/{id:guid}", (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceBookingService bookings, Guid id) => DeleteService(context, db, auth, bookings, "vendor", id));
        vendor.MapGet("/service-schedule", async (HttpContext context, AppDbContext db, VendorAuthService auth, ServiceBookingService bookings) =>
        {
            var actor = await Resolve(context, db, auth, "vendor");
            return actor is null ? Results.Unauthorized() : Results.Ok(await bookings.Schedule(actor.Id));
        }).Produces<ServiceScheduleDto>().Produces(401);
        vendor.MapPut("/service-schedule", async (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceBookingService bookings, ServiceScheduleWriteDto dto) =>
        {
            var actor = await Resolve(context, db, auth, "vendor");
            return actor is null ? Results.Unauthorized() : await bookings.SaveSchedule(actor.Id, dto);
        }).Produces<ServiceScheduleDto>().Produces(400).Produces(401).Produces(404).Produces(409);

        var admin = app.MapGroup("/api/admin").RequireAuthorization(AuthenticationSetup.Admin).WithTags("AdminServices");
        admin.MapGet("/services", (ServiceCatalogService services, Guid? vendorId, Guid? categoryId,
            int page = 1, int pageSize = 20) => ListServices(services, true, vendorId, categoryId, page, pageSize))
            .Produces<ServicePageDto>();
        admin.MapGet("/services/{id:guid}", async (ServiceCatalogService services, Guid id) =>
        {
            var service = await services.Query.FirstOrDefaultAsync(s => s.Id == id);
            return service is null ? Results.NotFound() : Results.Ok(ServiceCatalogService.ToDto(service));
        }).Produces<ServiceDto>();
        admin.MapPost("/services", (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceCatalogService services, ServiceBookingService bookings, ServiceWriteDto dto) =>
            SaveService(context, db, auth, services, bookings, "admin", dto)).Produces<ServiceDto>(201).Produces(400);
        admin.MapPut("/services/{id:guid}", (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceCatalogService services, ServiceBookingService bookings, ServiceWriteDto dto, Guid id) =>
            SaveService(context, db, auth, services, bookings, "admin", dto, id)).Produces<ServiceDto>().Produces(400).Produces(404);
        admin.MapDelete("/services/{id:guid}", (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceBookingService bookings, Guid id) => DeleteService(context, db, auth, bookings, "admin", id));
        admin.MapGet("/vendors/{vendorId:guid}/service-schedule", async (AppDbContext db, ServiceBookingService bookings, Guid vendorId) =>
            !await db.Vendors.AnyAsync(v => v.Id == vendorId) ? Results.NotFound() : Results.Ok(await bookings.Schedule(vendorId)))
            .Produces<ServiceScheduleDto>();
        admin.MapPut("/vendors/{vendorId:guid}/service-schedule", (ServiceBookingService bookings,
            Guid vendorId, ServiceScheduleWriteDto dto) => bookings.SaveSchedule(vendorId, dto)).Produces<ServiceScheduleDto>().Produces(400).Produces(404).Produces(409);

        MapBookings(app.MapGroup("/api/service-bookings").RequireAuthorization("CustomerOrAdmin"), "customer");
        MapBookings(vendor.MapGroup("/service-bookings"), "vendor");
        MapBookings(admin.MapGroup("/service-bookings"), "admin");
        return app;
    }

    private static async Task<IResult> ListServices(ServiceCatalogService catalog, bool admin, Guid? vendorId,
        Guid? categoryId, int page, int pageSize)
    {
        if (page is < 1 or > 10000 || pageSize is < 1 or > 100) return Results.BadRequest();
        var query = catalog.Query.AsNoTracking();
        if (!admin) query = query.Where(s => s.Active && s.Vendor!.Active && s.Vendor.Verified);
        if (vendorId.HasValue) query = query.Where(s => s.VendorId == vendorId);
        if (categoryId.HasValue) query = query.Where(s => s.CategoryId == categoryId);
        var rows = await query.OrderBy(s => s.Name).ThenBy(s => s.Id).Skip((page - 1) * pageSize).Take(pageSize + 1).ToListAsync();
        return Results.Ok(new ServicePageDto(rows.Take(pageSize).Select(ServiceCatalogService.ToDto).ToList(), page, pageSize, rows.Count > pageSize));
    }

    private static async Task<ServiceActor?> Resolve(HttpContext context, AppDbContext db, VendorAuthService auth, string role)
    {
        var actor = await ServiceBookingService.Actor(context, db, auth);
        return actor?.Role == role ? actor : null;
    }

    private static async Task<IResult> SaveService(HttpContext context, AppDbContext db, VendorAuthService auth,
        ServiceCatalogService catalog, ServiceBookingService bookings, string role, ServiceWriteDto dto, Guid? id = null)
    {
        var actor = await Resolve(context, db, auth, role);
        if (actor is null) return Results.Unauthorized();
        Guid vendorId;
        if (role == "vendor")
        {
            if (dto.VendorId.HasValue) return Results.BadRequest(new { error = "Omit vendorId; vendor identity comes from the session." });
            vendorId = actor.Id;
        }
        else if (id.HasValue)
        {
            var existingVendor = await db.ServiceOfferings.Where(s => s.Id == id).Select(s => (Guid?)s.VendorId).FirstOrDefaultAsync();
            if (existingVendor is null) return Results.NotFound();
            if (dto.VendorId.HasValue && dto.VendorId != existingVendor)
                return Results.BadRequest(new { error = "An existing service cannot be transferred to another vendor." });
            vendorId = existingVendor.Value;
        }
        else if (dto.VendorId.HasValue) vendorId = dto.VendorId.Value;
        else return Results.BadRequest(new { error = "vendorId is required for administrator service creation." });
        await using var transaction = await db.Database.BeginTransactionAsync();
        await bookings.LockVendor(vendorId);
        var result = await catalog.Save(vendorId, dto, id);
        if (result is IStatusCodeHttpResult { StatusCode: >= 200 and < 300 }) await transaction.CommitAsync();
        return result;
    }

    private static async Task<IResult> DeleteService(HttpContext context, AppDbContext db, VendorAuthService auth,
        ServiceBookingService bookings, string role, Guid id)
    {
        var actor = await Resolve(context, db, auth, role);
        if (actor is null) return Results.Unauthorized();
        var vendorId = await db.ServiceOfferings.Where(s => s.Id == id && (role == "admin" || s.VendorId == actor.Id))
            .Select(s => (Guid?)s.VendorId).FirstOrDefaultAsync();
        if (vendorId is null) return Results.NotFound();
        await using var transaction = await db.Database.BeginTransactionAsync();
        await bookings.LockVendor(vendorId.Value);
        var service = await db.ServiceOfferings.FirstAsync(s => s.Id == id);
        service.Active = false;
        service.UpdatedAtUtc = bookings.Now;
        await db.SaveChangesAsync();
        await transaction.CommitAsync();
        return Results.NoContent();
    }

    private static void MapBookings(RouteGroupBuilder group, string role)
    {
        group.WithTags("ServiceBookings");
        group.MapGet("", async (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceBookingService bookings, Guid? serviceId, Guid? vendorId, DateTimeOffset? from,
            DateTimeOffset? to, string? status, int page = 1, int pageSize = 20) =>
        {
            var actor = await Resolve(context, db, auth, role);
            if (actor is null) return Results.Unauthorized();
            if (page is < 1 or > 10000 || pageSize is < 1 or > 100 || (from.HasValue && to.HasValue && from >= to) ||
                (status is not null && status is not ("Pending" or "Confirmed" or "Cancelled" or "Rejected" or "Completed" or "NoShow")))
                return Results.BadRequest();
            var query = bookings.Owned(actor).AsNoTracking();
            if (serviceId.HasValue) query = query.Where(b => b.ServiceId == serviceId);
            if (vendorId.HasValue) query = query.Where(b => b.VendorId == vendorId);
            if (from.HasValue) { var lower = from.Value.UtcDateTime; query = query.Where(b => b.EndsAtUtc > lower); }
            if (to.HasValue) { var upper = to.Value.UtcDateTime; query = query.Where(b => b.StartsAtUtc < upper); }
            if (status is not null) query = query.Where(b => b.Status == status);
            var rows = await query.OrderBy(b => b.StartsAtUtc).ThenBy(b => b.Id).Skip((page - 1) * pageSize).Take(pageSize + 1).ToListAsync();
            return Results.Ok(new ServiceBookingPageDto(rows.Take(pageSize).Select(ServiceBookingService.ToDto).ToList(), page, pageSize, rows.Count > pageSize));
        }).Produces<ServiceBookingPageDto>().Produces(400).Produces(401);
        group.MapGet("/{id:guid}", async (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceBookingService bookings, Guid id) =>
        {
            var actor = await Resolve(context, db, auth, role);
            if (actor is null) return Results.Unauthorized();
            var booking = await bookings.Owned(actor).AsNoTracking().FirstOrDefaultAsync(b => b.Id == id);
            return booking is null ? Results.NotFound() : Results.Ok(ServiceBookingService.ToDto(booking));
        }).Produces<ServiceBookingDto>().Produces(401).Produces(404);
        group.MapPost("", async (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceBookingService bookings, ServiceBookingCreateDto dto) =>
        {
            var actor = await Resolve(context, db, auth, role);
            return actor is null ? Results.Unauthorized() : await bookings.Book(actor, dto);
        }).Produces<ServiceBookingDto>(201).Produces<ServiceBookingDto>().Produces(400).Produces(401).Produces(404).Produces(409);
        group.MapPut("/{id:guid}/reschedule", async (HttpContext context, AppDbContext db, VendorAuthService auth,
            ServiceBookingService bookings, ServiceBookingRescheduleDto dto, Guid id) =>
        {
            var actor = await Resolve(context, db, auth, role);
            return actor is null ? Results.Unauthorized() : await bookings.Reschedule(actor, id, dto);
        }).Produces<ServiceBookingDto>().Produces(400).Produces(401).Produces(404).Produces(409);
        if (role == "customer")
            group.MapPost("/{id:guid}/cancel", async (HttpContext context, AppDbContext db, VendorAuthService auth,
                ServiceBookingService bookings, Guid id) =>
            {
                var actor = await Resolve(context, db, auth, role);
                return actor is null ? Results.Unauthorized() : await bookings.ChangeStatus(actor, id, "Cancelled");
            }).Produces<ServiceBookingDto>().Produces(401).Produces(404).Produces(409);
        else
            group.MapPatch("/{id:guid}/status", async (HttpContext context, AppDbContext db, VendorAuthService auth,
                ServiceBookingService bookings, ServiceBookingStatusDto dto, Guid id) =>
            {
                var actor = await Resolve(context, db, auth, role);
                return actor is null ? Results.Unauthorized() : await bookings.ChangeStatus(actor, id, dto.Status);
            }).Produces<ServiceBookingDto>().Produces(400).Produces(401).Produces(404).Produces(409);
    }
}
