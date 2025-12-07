using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Services;

public class ReservationExpiryService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<ReservationExpiryService> _logger;

    public ReservationExpiryService(IServiceScopeFactory scopeFactory, ILogger<ReservationExpiryService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("ReservationExpiryService started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

            try
            {
                await ProcessExpiredReservations();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing expired reservations.");
            }
        }
    }

    private async Task ProcessExpiredReservations()
    {
        using var scope = _scopeFactory.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        var now = DateTimeOffset.UtcNow;

        var expired = await db.Reservations
            .Include(r => r.Items)
            .Where(r => r.Status == ReservationStatus.Pending && r.ExpiresAt <= now)
            .ToListAsync();

        if (!expired.Any())
            return;

        foreach (var res in expired)
        {
            foreach (var item in res.Items)
            {
                var product = await db.Products.FirstAsync(p => p.Id == item.ProductId);
                product.ReservedQuantity -= item.Quantity;
                if (product.ReservedQuantity < 0)
                    product.ReservedQuantity = 0;
            }

            res.Status = ReservationStatus.Cancelled;
            res.CancelledAt = now;
        }

        await db.SaveChangesAsync();
        _logger.LogInformation("Expired reservations processed: {count}", expired.Count);
    }
}
