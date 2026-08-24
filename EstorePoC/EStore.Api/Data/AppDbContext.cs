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
        public DbSet<CustomerIdentityIgnore> CustomerIdentityIgnores => Set<CustomerIdentityIgnore>();
        public DbSet<Product> Products => Set<Product>();
        public DbSet<Reservation> Reservations => Set<Reservation>();
        public DbSet<ReservationItem> ReservationItems => Set<ReservationItem>();
        public DbSet<ShoppingCart> ShoppingCarts => Set<ShoppingCart>();
        public DbSet<ShoppingCartItem> ShoppingCartItems => Set<ShoppingCartItem>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<Referral> Referrals => Set<Referral>();
        public DbSet<PointTransaction> PointTransactions => Set<PointTransaction>();
        public DbSet<CustomerPointBalance> CustomerPointBalances => Set<CustomerPointBalance>();

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
                e.Property(x => x.Latitude).HasPrecision(18, 2);
                e.Property(x => x.Longitude).HasPrecision(18, 2);
            });

            // Vendor
            m.Entity<Vendor>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.DisplayName).HasMaxLength(160).IsRequired();
                e.Property(x => x.LegalName).HasMaxLength(180).IsRequired();
                e.Property(x => x.ContactPhone).HasMaxLength(32).IsRequired();
                e.Property(x => x.RegistrationCode).HasMaxLength(24);
                e.Property(x => x.AccountEmail).HasMaxLength(160);
                e.Property(x => x.PasswordHash).HasMaxLength(256);
                e.Property(x => x.PasswordSalt).HasMaxLength(128);

                e.HasOne(x => x.Tenant).WithMany(t => t.Vendors)
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

                e.HasOne(x => x.Location).WithMany()
                    .HasForeignKey(x => x.LocationId).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.TenantId, x.LegalName });
                e.HasIndex(x => new { x.TenantId, x.ContactEmail })
                    .IsUnique()
                    .HasFilter("[ContactEmail] IS NOT NULL");
                e.HasIndex(x => new { x.TenantId, x.RegistrationCode })
                    .IsUnique()
                    .HasFilter("[RegistrationCode] IS NOT NULL");
                e.HasIndex(x => new { x.TenantId, x.AccountEmail })
                    .IsUnique()
                    .HasFilter("[AccountEmail] IS NOT NULL");
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
                e.Property(x => x.ArchivedReason).HasMaxLength(240);

                e.HasOne(x => x.Tenant).WithMany()
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => new { x.TenantId, x.PhoneNumber }).IsUnique();
                e.HasIndex(x => new { x.TenantId, x.Email }).IsUnique();
                e.HasIndex(x => new { x.TenantId, x.Username }).IsUnique();
            });

            // Referral
            m.Entity<Referral>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.RecommendedEmail).HasMaxLength(160).IsRequired();
                e.Property(x => x.RecommendedEmailNormalized).HasMaxLength(160).IsRequired();
                e.Property(x => x.Status)
                    .HasConversion<string>()
                    .HasMaxLength(32)
                    .IsRequired();
                e.Property(x => x.CancelReason).HasMaxLength(240);

                e.HasOne(x => x.Tenant).WithMany()
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.RecommenderCustomer).WithMany(c => c.SentReferrals)
                    .HasForeignKey(x => x.RecommenderCustomerId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.RecommendedCustomer).WithMany(c => c.ReceivedReferrals)
                    .HasForeignKey(x => x.RecommendedCustomerId).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.TenantId, x.RecommenderCustomerId, x.RecommendedEmailNormalized })
                    .IsUnique();
                e.HasIndex(x => new { x.TenantId, x.RecommendedEmailNormalized, x.Status });
                e.HasIndex(x => new { x.TenantId, x.RecommenderCustomerId, x.CreatedAt });
            });

            // PointTransaction
            m.Entity<PointTransaction>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.Reason).HasMaxLength(80).IsRequired();
                e.Property(x => x.SourceType).HasMaxLength(80).IsRequired();
                e.Property(x => x.Notes).HasMaxLength(240);

                e.HasOne(x => x.Tenant).WithMany()
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Customer).WithMany(c => c.PointTransactions)
                    .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);

                e.HasIndex(x => new { x.TenantId, x.CustomerId, x.CreatedAt });
                e.HasIndex(x => new { x.TenantId, x.CustomerId, x.SourceType, x.SourceId, x.Reason })
                    .IsUnique();
            });

            // CustomerPointBalance
            m.Entity<CustomerPointBalance>(e =>
            {
                e.HasKey(x => new { x.TenantId, x.CustomerId });
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();

                e.HasOne(x => x.Tenant).WithMany()
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
                e.HasOne(x => x.Customer).WithOne(c => c.PointBalance)
                    .HasForeignKey<CustomerPointBalance>(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            });

            m.Entity<CustomerIdentityIgnore>(e =>
            {
                e.HasKey(x => x.Id);
                e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
                e.Property(x => x.IssueType).HasMaxLength(32).IsRequired();
                e.Property(x => x.SubjectKey).HasMaxLength(120).IsRequired();
                e.Property(x => x.Fingerprint).HasMaxLength(128).IsRequired();

                e.HasOne(x => x.Tenant).WithMany()
                    .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);

                e.HasIndex(x => new { x.TenantId, x.IssueType, x.SubjectKey }).IsUnique();
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
                e.Property(x => x.Price).HasPrecision(18, 2);

                e.HasOne(x => x.Vendor).WithMany(v => v.Products)
                    .HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);
                e.HasOne(x => x.Category).WithMany()
                    .HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.SetNull);
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
                e.Property(x => x.TotalAmount).HasPrecision(18, 2);

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
                e.Property(x => x.UnitPrice).HasPrecision(18, 2);
                e.Property(x => x.LineTotal).HasPrecision(18, 2);

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
                e.Property(x => x.UnitPrice).HasPrecision(18, 2);
                e.Property(x => x.LineTotal).HasPrecision(18, 2);

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
            m.Entity<CustomerIdentityIgnore>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Product>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Reservation>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<ReservationItem>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Review>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<Referral>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<PointTransaction>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<CustomerPointBalance>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<ShoppingCart>().HasQueryFilter(x => CurrentTenantId == null || x.TenantId == CurrentTenantId);
            m.Entity<ShoppingCartItem>().HasQueryFilter(x =>
                CurrentTenantId == null ||
                ((x.ShoppingCart != null && x.ShoppingCart.TenantId == CurrentTenantId) &&
                 (x.Product != null && x.Product.TenantId == CurrentTenantId)));

            // Seed minimal tenants
            SeedMinimalTenants(m);
        }

        private static void SeedMinimalTenants(ModelBuilder m)
        {
            var kigaliCreatedAt = new DateTimeOffset(
                new DateTime(2026, 4, 7, 20, 0, 20, 306, DateTimeKind.Unspecified).AddTicks(4994),
                TimeSpan.Zero);
            var chicCreatedAt = new DateTimeOffset(
                new DateTime(2026, 4, 7, 20, 0, 20, 306, DateTimeKind.Unspecified).AddTicks(4999),
                TimeSpan.Zero);

            m.Entity<Tenant>().HasData(
                new Tenant
                {
                    Id = "kigali-city-mall",
                    Name = "Kigali City Mall",
                    Slug = "kigali-city-mall",
                    ContactEmail = "info@kcm.rw",
                    TimeZone = "Africa/Kigali",
                    DefaultExpiryHours = 24,
                    CreatedAt = kigaliCreatedAt
                },
                new Tenant
                {
                    Id = "chic-complex",
                    Name = "Chic Complex",
                    Slug = "chic-complex",
                    ContactEmail = "info@chic.rw",
                    TimeZone = "Africa/Kigali",
                    DefaultExpiryHours = 12,
                    CreatedAt = chicCreatedAt
                }
            );
        }
    }
}
