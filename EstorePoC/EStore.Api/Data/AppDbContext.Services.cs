using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Data;

public partial class AppDbContext
{
    public DbSet<ServiceOffering> ServiceOfferings => Set<ServiceOffering>();
    public DbSet<ServiceSchedule> ServiceSchedules => Set<ServiceSchedule>();
    public DbSet<ServiceBooking> ServiceBookings => Set<ServiceBooking>();

    private void ConfigureServiceModels(ModelBuilder model)
    {
        model.Entity<ServiceOffering>(e =>
        {
            e.ToTable("Services", table => {
                table.HasCheckConstraint("CK_Services_Duration", "\"DurationMinutes\" BETWEEN 5 AND 480");
                table.HasCheckConstraint("CK_Services_Interval", "\"SlotIntervalMinutes\" BETWEEN 5 AND 120");
                table.HasCheckConstraint("CK_Services_Window", "\"BookingWindowDays\" BETWEEN 1 AND 365");
                table.HasCheckConstraint("CK_Services_Notice", "\"MinimumNoticeMinutes\" BETWEEN 0 AND 43200");
                table.HasCheckConstraint("CK_Services_Price", "\"Price\" >= 0 AND \"Price\" = FLOOR(\"Price\")");
            });
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.Name).HasMaxLength(200).IsRequired();
            e.Property(x => x.Description).HasMaxLength(10000);
            e.Property(x => x.ImageUrl).HasMaxLength(2048);
            e.Property(x => x.Price).HasPrecision(18, 2);
            e.HasOne(x => x.Vendor).WithMany().HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Category).WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.TenantId, x.VendorId, x.Active });
            e.HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
        });
        model.Entity<ServiceSchedule>(e =>
        {
            e.ToTable("ServiceSchedules");
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.TimeZone).HasMaxLength(100).IsRequired();
            e.HasOne(x => x.Vendor).WithMany().HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.TenantId, x.VendorId }).IsUnique();
            e.HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
        });
        model.Entity<ServiceBooking>(e =>
        {
            e.ToTable("ServiceBookings", table => {
                table.HasCheckConstraint("CK_ServiceBookings_Times", "\"EndsAtUtc\" > \"StartsAtUtc\"");
                table.HasCheckConstraint("CK_ServiceBookings_Duration", "\"DurationMinutes\" BETWEEN 5 AND 480");
                table.HasCheckConstraint("CK_ServiceBookings_Status", "\"Status\" IN ('Pending','Confirmed','Cancelled','Rejected','Completed','NoShow')");
                table.HasCheckConstraint("CK_ServiceBookings_Price", "\"Price\" >= 0 AND \"Price\" = FLOOR(\"Price\")");
            });
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.CustomerSubject).HasMaxLength(80).IsRequired();
            e.Property(x => x.ServiceName).HasMaxLength(200).IsRequired();
            e.Property(x => x.Status).HasMaxLength(16).IsRequired();
            e.Property(x => x.TimeZone).HasMaxLength(100).IsRequired();
            e.Property(x => x.Notes).HasMaxLength(2000);
            e.Property(x => x.Price).HasPrecision(18, 2);
            e.HasOne(x => x.Service).WithMany().HasForeignKey(x => x.ServiceId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Vendor).WithMany().HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Customer).WithMany().HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            e.HasIndex(x => new { x.TenantId, x.CustomerSubject, x.ClientBookingId }).IsUnique();
            e.HasIndex(x => new { x.TenantId, x.VendorId, x.Status, x.StartsAtUtc, x.EndsAtUtc })
                .HasDatabaseName("IX_ServiceBookings_VendorCalendar");
            e.HasIndex(x => new { x.TenantId, x.CustomerId, x.StartsAtUtc });
            e.HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
        });
    }
}
