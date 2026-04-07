using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class VendorPortalEndpoints
{
    public static RouteGroupBuilder MapVendorPortalEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/me", GetVendorSession);
        group.MapGet("/products", ListProducts);
        group.MapPost("/products", CreateProduct);
        group.MapPut("/products/{id:guid}", UpdateProduct);
        group.MapDelete("/products/{id:guid}", DeleteProduct);
        group.MapGet("/reservations", ListReservations);
        group.MapPatch("/reservations/{reservationId:guid}/status", UpdateReservationStatus);
        group.MapPatch("/reservations/{reservationId:guid}/note", UpdateReservationNote);

        return group;
    }

    private static async Task<IResult> GetVendorSession(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService)
    {
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(httpContext, db, vendorAuthService);
        return vendor is null ? Results.Unauthorized() : Results.Ok(VendorAuthEndpoints.ToSummaryDto(vendor));
    }

    private static async Task<IResult> ListProducts(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService)
    {
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(httpContext, db, vendorAuthService);
        if (vendor is null)
        {
            return Results.Unauthorized();
        }

        var products = await db.Products
            .Where(p => p.TenantId == vendor.TenantId && p.VendorId == vendor.Id)
            .OrderByDescending(p => p.Active)
            .ThenBy(p => p.Name)
            .Select(p => new VendorPortalProductDto(
                p.Id,
                p.VendorId,
                p.Vendor != null ? p.Vendor.DisplayName : null,
                p.Name,
                p.Description,
                p.Price,
                p.ImageUrl,
                p.CategoryId,
                p.Category != null ? p.Category.Name : null,
                p.StockQuantity,
                p.ReservedQuantity,
                p.Active,
                p.CreatedAt))
            .ToListAsync();

        return Results.Ok(products);
    }

    private static async Task<IResult> CreateProduct(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService,
        VendorPortalProductWriteDto dto)
    {
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(httpContext, db, vendorAuthService);
        if (vendor is null)
        {
            return Results.Unauthorized();
        }

        var validationError = await ValidateProductWriteAsync(db, vendor.TenantId, dto);
        if (validationError is not null)
        {
            return validationError;
        }

        var product = new Product
        {
            Id = Guid.NewGuid(),
            TenantId = vendor.TenantId,
            VendorId = vendor.Id,
            Name = dto.Name.Trim(),
            Description = dto.Description?.Trim(),
            CategoryId = dto.CategoryId,
            Price = dto.Price,
            StockQuantity = dto.Stock,
            ImageUrl = NormalizeImageUrl(dto.ImageUrl),
            Active = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        db.Products.Add(product);
        await db.SaveChangesAsync();

        var hydrated = await LoadVendorProductAsync(db, vendor.TenantId, vendor.Id, product.Id);
        return Results.Created($"/api/vendor-portal/products/{product.Id}", hydrated);
    }

    private static async Task<IResult> UpdateProduct(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService,
        Guid id,
        VendorPortalProductWriteDto dto)
    {
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(httpContext, db, vendorAuthService);
        if (vendor is null)
        {
            return Results.Unauthorized();
        }

        var product = await db.Products.FirstOrDefaultAsync(p =>
            p.Id == id &&
            p.TenantId == vendor.TenantId &&
            p.VendorId == vendor.Id);
        if (product is null)
        {
            return Results.NotFound(new { error = "Product not found." });
        }

        var validationError = await ValidateProductWriteAsync(db, vendor.TenantId, dto);
        if (validationError is not null)
        {
            return validationError;
        }

        product.Name = dto.Name.Trim();
        product.Description = dto.Description?.Trim();
        product.CategoryId = dto.CategoryId;
        product.Price = dto.Price;
        product.StockQuantity = dto.Stock;
        product.ImageUrl = NormalizeImageUrl(dto.ImageUrl);

        await db.SaveChangesAsync();

        var hydrated = await LoadVendorProductAsync(db, vendor.TenantId, vendor.Id, product.Id);
        return Results.Ok(hydrated);
    }

    private static async Task<IResult> DeleteProduct(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService,
        Guid id)
    {
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(httpContext, db, vendorAuthService);
        if (vendor is null)
        {
            return Results.Unauthorized();
        }

        var product = await db.Products.FirstOrDefaultAsync(p =>
            p.Id == id &&
            p.TenantId == vendor.TenantId &&
            p.VendorId == vendor.Id &&
            p.Active);
        if (product is null)
        {
            return Results.NotFound(new { error = "Product not found or already inactive." });
        }

        product.Active = false;
        await db.SaveChangesAsync();

        return Results.NoContent();
    }

    private static async Task<IResult> ListReservations(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService,
        string? status,
        DateTimeOffset? from,
        DateTimeOffset? to)
    {
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(httpContext, db, vendorAuthService);
        if (vendor is null)
        {
            return Results.Unauthorized();
        }

        var query = db.Reservations
            .Include(r => r.Customer)
            .Include(r => r.Vendor)
            .Include(r => r.Items)
            .ThenInclude(i => i.Product)
            .Where(r => r.TenantId == vendor.TenantId && r.VendorId == vendor.Id);

        if (!string.IsNullOrWhiteSpace(status) &&
            Enum.TryParse<ReservationStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(r => r.Status == parsedStatus);
        }

        if (from.HasValue)
        {
            query = query.Where(r => r.CreatedAt >= from.Value);
        }

        if (to.HasValue)
        {
            query = query.Where(r => r.CreatedAt <= to.Value);
        }

        var reservations = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return Results.Ok(reservations);
    }

    private static async Task<IResult> UpdateReservationStatus(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService,
        Guid reservationId,
        string status)
    {
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(httpContext, db, vendorAuthService);
        if (vendor is null)
        {
            return Results.Unauthorized();
        }

        var reservation = await db.Reservations
            .Include(r => r.Items)
            .FirstOrDefaultAsync(r =>
                r.Id == reservationId &&
                r.TenantId == vendor.TenantId &&
                r.VendorId == vendor.Id);
        if (reservation is null)
        {
            return Results.NotFound(new { error = "Reservation not found." });
        }

        if (!Enum.TryParse<ReservationStatus>(status, ignoreCase: true, out var newStatus))
        {
            return Results.BadRequest(new { error = $"Invalid status '{status}'." });
        }

        var statusError = await ApplyReservationStatusAsync(db, reservation, vendor.TenantId, newStatus);
        if (statusError is not null)
        {
            return statusError;
        }

        await db.SaveChangesAsync();

        var hydrated = await LoadVendorReservationAsync(db, vendor.TenantId, vendor.Id, reservation.Id);
        return Results.Ok(hydrated);
    }

    private static async Task<IResult> UpdateReservationNote(
        HttpContext httpContext,
        AppDbContext db,
        VendorAuthService vendorAuthService,
        Guid reservationId,
        VendorPortalReservationNoteDto dto)
    {
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(httpContext, db, vendorAuthService);
        if (vendor is null)
        {
            return Results.Unauthorized();
        }

        var reservation = await db.Reservations.FirstOrDefaultAsync(r =>
            r.Id == reservationId &&
            r.TenantId == vendor.TenantId &&
            r.VendorId == vendor.Id);
        if (reservation is null)
        {
            return Results.NotFound(new { error = "Reservation not found." });
        }

        reservation.VendorNotes = dto.Note?.Trim();
        await db.SaveChangesAsync();

        var hydrated = await LoadVendorReservationAsync(db, vendor.TenantId, vendor.Id, reservation.Id);
        return Results.Ok(hydrated);
    }

    private static async Task<IResult?> ValidateProductWriteAsync(
        AppDbContext db,
        string tenantId,
        VendorPortalProductWriteDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Name) || dto.Price < 0 || dto.Stock < 0)
        {
            return Results.BadRequest(new { error = "Invalid product payload." });
        }

        if (!dto.CategoryId.HasValue)
        {
            return null;
        }

        var categoryExists = await db.Categories.AnyAsync(c =>
            c.TenantId == tenantId &&
            c.Id == dto.CategoryId.Value &&
            c.Active);

        return categoryExists
            ? null
            : Results.BadRequest(new { error = "Category not found (or inactive) in this tenant." });
    }

    private static async Task<IResult?> ApplyReservationStatusAsync(
        AppDbContext db,
        Reservation reservation,
        string tenantId,
        ReservationStatus newStatus)
    {
        if (reservation.Status == ReservationStatus.Completed && newStatus == ReservationStatus.Completed)
        {
            return Results.BadRequest(new { error = "Already completed." });
        }

        static bool IsTerminal(ReservationStatus status) =>
            status is ReservationStatus.Completed or ReservationStatus.Rejected or ReservationStatus.Cancelled;

        if (IsTerminal(reservation.Status) && reservation.Status != newStatus)
        {
            return Results.BadRequest(new
            {
                error = $"Cannot transition from {reservation.Status} to {newStatus}."
            });
        }

        switch (newStatus)
        {
            case ReservationStatus.Confirmed:
                reservation.Status = ReservationStatus.Confirmed;
                reservation.ConfirmedAt = DateTimeOffset.UtcNow;
                return null;

            case ReservationStatus.Completed:
            {
                var productIds = reservation.Items.Select(i => i.ProductId).Distinct().ToList();
                var products = await db.Products
                    .Where(p => p.TenantId == tenantId && productIds.Contains(p.Id))
                    .ToListAsync();

                foreach (var item in reservation.Items)
                {
                    var product = products.First(p => p.Id == item.ProductId);
                    product.ReservedQuantity -= item.Quantity;
                    product.StockQuantity -= item.Quantity;
                }

                reservation.Status = ReservationStatus.Completed;
                reservation.CompletedAt = DateTimeOffset.UtcNow;
                reservation.StockFinalized = true;
                return null;
            }

            case ReservationStatus.Rejected:
            case ReservationStatus.Cancelled:
            {
                var productIds = reservation.Items.Select(i => i.ProductId).Distinct().ToList();
                var products = await db.Products
                    .Where(p => p.TenantId == tenantId && productIds.Contains(p.Id))
                    .ToListAsync();

                foreach (var item in reservation.Items)
                {
                    var product = products.First(p => p.Id == item.ProductId);
                    product.ReservedQuantity -= item.Quantity;
                    if (product.ReservedQuantity < 0)
                    {
                        product.ReservedQuantity = 0;
                    }
                }

                reservation.Status = newStatus;
                if (newStatus == ReservationStatus.Rejected)
                {
                    reservation.RejectedAt = DateTimeOffset.UtcNow;
                }
                else
                {
                    reservation.CancelledAt = DateTimeOffset.UtcNow;
                }

                return null;
            }

            default:
                reservation.Status = newStatus;
                return null;
        }
    }

    private static async Task<VendorPortalProductDto?> LoadVendorProductAsync(
        AppDbContext db,
        string tenantId,
        Guid vendorId,
        Guid productId) =>
        await db.Products
            .Where(p => p.TenantId == tenantId && p.VendorId == vendorId && p.Id == productId)
            .Select(p => new VendorPortalProductDto(
                p.Id,
                p.VendorId,
                p.Vendor != null ? p.Vendor.DisplayName : null,
                p.Name,
                p.Description,
                p.Price,
                p.ImageUrl,
                p.CategoryId,
                p.Category != null ? p.Category.Name : null,
                p.StockQuantity,
                p.ReservedQuantity,
                p.Active,
                p.CreatedAt))
            .FirstOrDefaultAsync();

    private static async Task<Reservation?> LoadVendorReservationAsync(
        AppDbContext db,
        string tenantId,
        Guid vendorId,
        Guid reservationId) =>
        await db.Reservations
            .Include(r => r.Customer)
            .Include(r => r.Vendor)
            .Include(r => r.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(r =>
                r.TenantId == tenantId &&
                r.VendorId == vendorId &&
                r.Id == reservationId);

    private static string? NormalizeImageUrl(string? imageUrl)
    {
        var normalized = imageUrl?.Trim();
        return string.IsNullOrWhiteSpace(normalized) ? null : normalized;
    }
}
