using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Data
{
    public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
    {
        // Tenant scoping – set per request in Program.cs
        public string? CurrentTenantId { get; set; }

        // DbSets
        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<Location> Locations => Set<Location>();
        public DbSet<Vendor> Vendors => Set<Vendor>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Customer> Customers => Set<Customer>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        public DbSet<ReservationItem> ReservationItems => Set<ReservationItem>();
        public DbSet<ShoppingCart> ShoppingCarts => Set<ShoppingCart>();
        public DbSet<ShoppingCartItem> ShoppingCartItems => Set<ShoppingCartItem>();
        public DbSet<Review> Reviews => Set<Review>();

        protected override void OnModelCreating(ModelBuilder m)
        {
            // Tenant
            m.Entity<Tenant>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.Id).HasMaxLength(80);
                e.Property(x => x.Slug).HasMaxLength(80);
                e.HasIndex(x => x.Slug).IsUnique();
            });

            // Location
            m.Entity<Location>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.Name).HasMaxLength(160).IsRequired();
            });

            // Vendor
            m.Entity<Vendor>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.DisplayName).HasMaxLength(160).IsRequired();
                e.Property(x => x.LegalName).HasMaxLength(180).IsRequired();
                e.Property(x => x.ContactPhone).HasMaxLength(32).IsRequired();

                e.HasOne(x => x.Tenant).WithMany(t => t.Vendors)
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

                e.HasOne(x => x.Location).WithMany()
                    .HasForeignKey(x => x.LocationId).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.TenantId, x.LegalName });
            });

            // Customer
            m.Entity<Customer>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.Username).HasMaxLength(80).IsRequired();
                e.Property(x => x.FullName).HasMaxLength(160).IsRequired();
                e.Property(x => x.PhoneNumber).HasMaxLength(32).IsRequired();
                e.Property(x => x.Email).HasMaxLength(160);

                e.HasOne(x => x.Tenant).WithMany()
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => new { x.TenantId, x.PhoneNumber }).IsUnique();
                e.HasIndex(x => new { x.TenantId, x.Email }).IsUnique();
                e.HasIndex(x => new { x.TenantId, x.Username }).IsUnique();
            });

            // Category
            m.Entity<Category>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.Name).HasMaxLength(160).IsRequired();

                e.HasIndex(x => new { x.TenantId, x.Name }).IsUnique();
            });

            // Product
            m.Entity<Product>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.Name).HasMaxLength(200).IsRequired();

                e.HasOne(x => x.Vendor).WithMany(v => v.Products)
                    .HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.Tenant).WithMany()
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => new { x.TenantId, x.VendorId, x.Active });
            });

            // Reservation
            m.Entity<Reservation>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.ReservationNumber).HasMaxLength(48).IsRequired();
                e.Property(x => x.PickupCode).HasMaxLength(16).IsRequired();

                e.HasOne(x => x.Tenant).WithMany()
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Customer).WithMany(c => c.Reservations)
                    .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.Vendor).WithMany()
                    .HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.TenantId, x.VendorId, x.Status, x.CreatedAt });
                e.HasIndex(x => new { x.TenantId, x.PickupCode }).IsUnique();
                e.HasIndex(x => new { x.TenantId, x.ReservationNumber }).IsUnique();
            });

            // ReservationItem
            m.Entity<ReservationItem>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();

                e.HasOne(x => x.Reservation).WithMany(r => r.Items)
                    .HasForeignKey(x => x.ReservationId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Product).WithMany()
                    .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            });

            // ShoppingCart
            m.Entity<ShoppingCart>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();

                e.HasOne(x => x.Customer).WithMany()
                    .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.TenantId, x.CustomerId, x.IsActive });
            });

            // ShoppingCartItem
            m.Entity<ShoppingCartItem>(e =>
            {
                e.HasKey(x => x.Id);

                e.HasOne(x => x.ShoppingCart).WithMany(c => c.Items)
                    .HasForeignKey(x => x.ShoppingCartId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Product).WithMany()
                    .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.ShoppingCartId, x.ProductId }).IsUnique();
            });

            // Review
            m.Entity<Review>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();

                e.HasOne(x => x.Product).WithMany()
                    .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Customer).WithMany()
                    .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.TenantId, x.ProductId, x.CustomerId }).IsUnique();
            });

            // Global query filters (apply tenant scoping)
            m.Entity<Location>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Vendor>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Category>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Customer>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Product>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Reservation>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<ReservationItem>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Review>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<ShoppingCart>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);

            // Seed minimal tenants
            SeedMinimalTenants(m);
        }

        private static void SeedMinimalTenants(ModelBuilder m)
        {
            m.Entity<Tenant>().HasData(
                new Tenant
                {
                    Id = "kigali-city-mall",
                    Name = "Kigali City Mall",
                    Slug = "kigali-city-mall",
                    ContactEmail = "info@kcm.rw",
                    TimeZone = "Africa/Kigali",
                    DefaultExpiryHours = 24,
                    CreatedAt = DateTimeOffset.UtcNow
                },
                new Tenant
                {
                    Id = "chic-complex",
                    Name = "Chic Complex",
                    Slug = "chic-complex",
                    ContactEmail = "info@chic.rw",
                    TimeZone = "Africa/Kigali",
                    DefaultExpiryHours = 12,
                    CreatedAt = DateTimeOffset.UtcNow
                }
            );
        }
    }
}
