using System.Text.Json;
using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Services;

public sealed class ServiceCatalogService(AppDbContext db, CategoryFormService forms, TimeProvider clock)
{
    public IQueryable<ServiceOffering> Query => db.ServiceOfferings.Include(s => s.Vendor).Include(s => s.Category);

    public static Dictionary<string, JsonElement> Attributes(ServiceOffering service) =>
        JsonSerializer.Deserialize<Dictionary<string, JsonElement>>(service.AttributesJson) ?? [];

    public static ServiceDto ToDto(ServiceOffering s) => new(s.Id, s.VendorId, s.Vendor?.DisplayName ?? "",
        s.Vendor?.LogoUrl, s.CategoryId, s.Category?.Name, s.Name, s.Description, s.Price, s.DurationMinutes,
        s.SlotIntervalMinutes, s.BookingWindowDays, s.MinimumNoticeMinutes, s.ImageUrl, Attributes(s),
        s.Active, DateTime.SpecifyKind(s.CreatedAtUtc, DateTimeKind.Utc), DateTime.SpecifyKind(s.UpdatedAtUtc, DateTimeKind.Utc));

    public static Dictionary<string, string[]> ValidateFixed(ServiceWriteDto dto)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(dto.Name) || dto.Name.Trim().Length > 200)
            errors["name"] = ["Name is required and must be at most 200 characters."];
        if (dto.Description?.Length > 10000) errors["description"] = ["Description must be at most 10000 characters."];
        if (dto.Price < 0 || dto.Price > 9999999999999999m || decimal.Truncate(dto.Price) != dto.Price)
            errors["price"] = ["Use a nonnegative whole RWF amount."];
        if (dto.DurationMinutes is < 5 or > 480)
            errors["durationMinutes"] = ["Duration must be 5-480 minutes."];
        if (dto.SlotIntervalMinutes is < 5 or > 120)
            errors["slotIntervalMinutes"] = ["Slot interval must be 5-120 minutes."];
        if (dto.BookingWindowDays is < 1 or > 365)
            errors["bookingWindowDays"] = ["Booking window must be 1-365 days."];
        if (dto.MinimumNoticeMinutes is < 0 or > 43200)
            errors["minimumNoticeMinutes"] = ["Notice must be 0-43200 minutes."];
        else if (dto.BookingWindowDays is >= 1 and <= 365 && dto.MinimumNoticeMinutes > dto.BookingWindowDays * 1440)
            errors["minimumNoticeMinutes"] = ["Notice cannot exceed the booking window."];
        if (!string.IsNullOrWhiteSpace(dto.ImageUrl) && !CategoryFormService.IsHttpsImageUrl(dto.ImageUrl))
            errors["imageUrl"] = ["Use an HTTPS image URL of at most 2048 characters."];
        return errors;
    }

    public async Task<IResult> Save(Guid vendorId, ServiceWriteDto dto, Guid? id = null)
    {
        ServiceOffering? service = null;
        if (id.HasValue)
        {
            service = await Query.FirstOrDefaultAsync(s => s.Id == id && s.VendorId == vendorId);
            if (service is null) return Results.NotFound();
        }
        var attributes = dto.Attributes ?? (service is null ? [] : Attributes(service));
        var errors = await forms.ValidateAttributesAsync(dto.CategoryId, attributes);
        foreach (var entry in ValidateFixed(dto)) errors[entry.Key] = entry.Value;
        var vendor = await db.Vendors.FirstOrDefaultAsync(v => v.Id == vendorId && v.Active && v.Verified);
        if (vendor is null) errors["vendorId"] = ["Active, verified vendor not found in this tenant."];
        if (errors.Count > 0) return Results.ValidationProblem(errors);
        var now = clock.GetUtcNow().UtcDateTime;
        if (service is null)
        {
            service = new() { TenantId = db.CurrentTenantId!, VendorId = vendorId, Vendor = vendor, CreatedAtUtc = now };
            db.ServiceOfferings.Add(service);
        }
        service.Name = dto.Name.Trim();
        service.Description = dto.Description?.Trim();
        service.CategoryId = dto.CategoryId!.Value;
        service.Category = await db.Categories.FirstAsync(c => c.Id == service.CategoryId);
        service.Price = dto.Price;
        service.DurationMinutes = dto.DurationMinutes;
        service.SlotIntervalMinutes = dto.SlotIntervalMinutes;
        service.BookingWindowDays = dto.BookingWindowDays;
        service.MinimumNoticeMinutes = dto.MinimumNoticeMinutes;
        service.AttributesJson = JsonSerializer.Serialize(attributes);
        if (dto.ImageUrl is not null) service.ImageUrl = ProductCatalogService.NormalizeImageUrl(dto.ImageUrl);
        if (dto.Active.HasValue) service.Active = dto.Active.Value;
        service.UpdatedAtUtc = now;
        await db.SaveChangesAsync();
        return id.HasValue ? Results.Ok(ToDto(service)) : Results.Created($"/api/services/{service.Id}", ToDto(service));
    }
}
