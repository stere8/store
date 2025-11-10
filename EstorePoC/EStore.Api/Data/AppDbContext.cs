using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> opts) : DbContext(opts)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public string? CurrentTenantId { get; set; }
    public DbSet<Order> Orders => Set<Order>();

    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<ReservationItem> ReservationItems => Set<ReservationItem>();

    protected override void OnModelCreating(ModelBuilder m)
    {
        // ---------- Order ----------
        m.Entity<Order>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).IsRequired();
        });

        // ---------- Tenant ----------
        m.Entity<Tenant>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(80);
            e.Property(x => x.Slug).HasMaxLength(80);
            e.HasIndex(x => x.Slug).IsUnique();
        });

        // ---------- Vendor ----------
        m.Entity<Vendor>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.DisplayName).HasMaxLength(120).IsRequired();
            e.Property(x => x.LegalName).HasMaxLength(160).IsRequired();
            e.Property(x => x.ContactPhone).HasMaxLength(32).IsRequired();
            e.HasOne(x => x.Tenant).WithMany(t => t.Vendors)
                .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

            // Fast search per mall
            e.HasIndex(x => new { x.TenantId, x.LegalName });
        });

        // ---------- Customer ----------
        m.Entity<Customer>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.FullName).HasMaxLength(120).IsRequired();
            e.Property(x => x.PhoneNumber).HasMaxLength(32).IsRequired();
            e.Property(x => x.Email).HasMaxLength(160);

            e.HasOne(x => x.Tenant).WithMany()
                .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

            // Primary lookup in Rwanda context
            e.HasIndex(x => new { x.TenantId, x.PhoneNumber }).IsUnique();

            // Optional unique when Email present (use filtered unique on relational providers)
            e.HasIndex(x => new { x.TenantId, x.Email }).IsUnique();
        });

        // ---------- Product ----------
        m.Entity<Product>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.Name).HasMaxLength(160).IsRequired();
            e.Property(x => x.Price).HasPrecision(18, 2);
            e.Property(x => x.RowVersion).IsRowVersion();

            e.HasOne(x => x.Vendor).WithMany(v => v.Products)
                .HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Tenant).WithMany()
                .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

            e.HasIndex(x => new { x.TenantId, x.VendorId, x.Active });

        });

        // ---------- Reservation ----------
        m.Entity<Reservation>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.ReservationNumber).HasMaxLength(32).IsRequired();
            e.Property(x => x.PickupCode).HasMaxLength(12).IsRequired();
            e.Property(x => x.TotalAmount).HasPrecision(18, 2);

            e.HasOne(x => x.Tenant).WithMany()
                .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Customer).WithMany(c => c.Reservations)
                .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Vendor).WithMany()
                .HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);

            // Dashboard & lookups
            e.HasIndex(x => new { x.TenantId, x.VendorId, x.Status, x.CreatedAt });
            e.HasIndex(x => new { x.TenantId, x.PickupCode }).IsUnique();
            e.HasIndex(x => new { x.TenantId, x.ReservationNumber }).IsUnique();


        });

        // ---------- ReservationItem ----------
        m.Entity<ReservationItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.UnitPrice).HasPrecision(18, 2);
            e.Property(x => x.LineTotal).HasPrecision(18, 2);

            e.HasOne(x => x.Reservation).WithMany(r => r.Items)
                .HasForeignKey(x => x.ReservationId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);

        });

        // ---------- Global query filters for multi-tenancy ----------
        // Note: works if CurrentTenantId is set before queries are composed.
        m.Entity<Vendor>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
        m.Entity<Customer>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
        m.Entity<Product>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
        m.Entity<Reservation>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);

    }
}
