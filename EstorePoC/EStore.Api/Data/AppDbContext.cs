// EstorePoC/EStore.Api/Data/AppDbContext.cs (REPLACE EXISTING)
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Numerics;

namespace EStore.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> opts) : DbContext(opts)
{
    public DbSet<Tenant> Tenants => Set<Tenant>();
    public DbSet<Location> Locations => Set<Location>();                    // *** NEW ***
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<ReservationItem> ReservationItems => Set<ReservationItem>();
    public DbSet<ShoppingCart> ShoppingCarts => Set<ShoppingCart>();        // *** NEW ***
    public DbSet<ShoppingCartItem> ShoppingCartItems => Set<ShoppingCartItem>(); // *** NEW ***
    public DbSet<Review> Reviews => Set<Review>();                          // *** NEW ***
    public DbSet<Order> Orders => Set<Order>();

    public string? CurrentTenantId { get; set; }

    protected override void OnModelCreating(ModelBuilder m)
    {
        // ---------- Tenant ----------
        m.Entity<Tenant>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasMaxLength(80);
            e.Property(x => x.Slug).HasMaxLength(80);
            e.HasIndex(x => x.Slug).IsUnique();

            // FK to Location
            e.HasOne(x => x.Location).WithMany()
                .HasForeignKey(x => x.LocationId).OnDelete(DeleteBehavior.SetNull);
        });

        // ---------- Location ----------
        m.Entity<Location>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.Name).HasMaxLength(120);
            e.Property(x => x.AddressLine1).HasMaxLength(200);
            e.Property(x => x.AddressLine2).HasMaxLength(200);
            e.Property(x => x.City).HasMaxLength(100);
            e.Property(x => x.Region).HasMaxLength(100);
            e.Property(x => x.Country).HasMaxLength(100);
            e.Property(x => x.PostalCode).HasMaxLength(20);
            e.Property(x => x.Floor).HasMaxLength(20);
            e.Property(x => x.Unit).HasMaxLength(50);
            e.Property(x => x.Latitude).HasPrecision(18, 10);
            e.Property(x => x.Longitude).HasPrecision(18, 10);

            // Indices for vendor lookups
            e.HasIndex(x => new { x.TenantId, x.Floor, x.Unit });
            e.HasIndex(x => new { x.TenantId, x.City });
        });

        // ---------- Vendor ----------
        m.Entity<Vendor>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.DisplayName).HasMaxLength(120).IsRequired();
            e.Property(x => x.LegalName).HasMaxLength(160).IsRequired();
            e.Property(x => x.ContactPhone).HasMaxLength(32).IsRequired();
            e.Property(x => x.Description).HasMaxLength(500);

            e.HasOne(x => x.Tenant).WithMany(t => t.Vendors)
                .HasForeignKey(x => x.TenantId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Location).WithMany()
                .HasForeignKey(x => x.LocationId).OnDelete(DeleteBehavior.SetNull);

            // Fast search per mall
            e.HasIndex(x => new { x.TenantId, x.LegalName });
        });

        // ---------- Customer ----------
        m.Entity<Customer>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.Username).HasMaxLength(80);
            e.Property(x => x.FullName).HasMaxLength(120).IsRequired();
            e.Property(x => x.PhoneNumber).HasMaxLength(32).IsRequired();
            e.Property(x => x.Email).HasMaxLength(160);
            e.Property(x => x.PreferredLanguage).HasMaxLength(10);

            // Primary lookup in Rwanda context
            e.HasIndex(x => new { x.TenantId, x.PhoneNumber }).IsUnique();

            // Conditional unique indices (InMemory doesn't support filtered indices, but SQL Server would)
            e.HasIndex(x => new { x.TenantId, x.Username }).IsUnique();
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

            e.HasIndex(x => new { x.TenantId, x.VendorId, x.Active });
        });

        // ---------- ShoppingCart ----------
        m.Entity<ShoppingCart>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();

            e.HasOne(x => x.Customer).WithMany(c => c.ShoppingCarts)
                .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Cascade);

            // Enforce one active cart per customer per tenant
            e.HasIndex(x => new { x.TenantId, x.CustomerId, x.IsActive }).IsUnique();
            e.HasIndex(x => new { x.TenantId, x.CustomerId });
        });

        // ---------- ShoppingCartItem ----------
        m.Entity<ShoppingCartItem>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.UnitPrice).HasPrecision(18, 2);
            e.Property(x => x.LineTotal).HasPrecision(18, 2);

            e.HasOne(x => x.Cart).WithMany(c => c.Items)
                .HasForeignKey(x => x.CartId).OnDelete(DeleteBehavior.Cascade);
            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);

            // One row per product per cart
            e.HasIndex(x => new { x.CartId, x.ProductId }).IsUnique();
        });

        // ---------- Review ----------
        m.Entity<Review>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.Title).HasMaxLength(200);
            e.Property(x => x.Comment).HasMaxLength(2000);

            e.HasOne(x => x.Product).WithMany()
                .HasForeignKey(x => x.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Customer).WithMany(c => c.Reviews)
                .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);

            // One review per product per customer per tenant
            e.HasIndex(x => new { x.TenantId, x.ProductId, x.CustomerId }).IsUnique();
            e.HasIndex(x => new { x.TenantId, x.ProductId, x.CreatedAt });
        });

        // ---------- Reservation (EXISTING) ----------
        m.Entity<Reservation>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            e.Property(x => x.ReservationNumber).HasMaxLength(32).IsRequired();
            e.Property(x => x.PickupCode).HasMaxLength(12).IsRequired();
            e.Property(x => x.TotalAmount).HasPrecision(18, 2);

            e.HasOne(x => x.Customer).WithMany(c => c.Reservations)
                .HasForeignKey(x => x.CustomerId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(x => x.Vendor).WithMany()
                .HasForeignKey(x => x.VendorId).OnDelete(DeleteBehavior.Restrict);

            // Dashboard & lookups
            e.HasIndex(x => new { x.TenantId, x.VendorId, x.Status, x.CreatedAt });
            e.HasIndex(x => new { x.TenantId, x.PickupCode }).IsUnique();
            e.HasIndex(x => new { x.TenantId, x.ReservationNumber }).IsUnique();
        });

        // ---------- ReservationItem (EXISTING) ----------
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

            e.HasIndex(x => new { x.TenantId, x.ReservationId });
        });

        // ---------- Order (EXISTING) ----------
        m.Entity<Order>(e =>
        {
            e.HasKey(x => x.Id);
            e.Property(x => x.TenantId).HasMaxLength(80).IsRequired();
            // Add other Order configurations as needed
        });

        // ---------- SEED DATA ----------
        SeedRwandaDemo(m);
    }

    Perfect! Let me complete the seed data for your Rwanda Marketplace demo:

## 🔧 **COMPLETE SEED DATA IMPLEMENTATION**

```csharp
private void SeedRwandaDemo(ModelBuilder m)
    {
        // ---------- RWANDA MALLS (TENANTS) ----------
        var kigaliMall = new Tenant
        {
            Id = "kigali-city-mall",
            Name = "Kigali City Mall",
            Slug = "kigali-city-mall",
            ContactEmail = "info@kigalicitymall.rw",
            TimeZone = "Africa/Kigali",
            DefaultExpiryHours = 24,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var chicComplex = new Tenant
        {
            Id = "chic-complex",
            Name = "Chic Complex",
            Slug = "chic-complex",
            ContactEmail = "info@chiccomplex.rw",
            TimeZone = "Africa/Kigali",
            DefaultExpiryHours = 12,  // Smaller mall, faster turnover
            CreatedAt = DateTimeOffset.UtcNow
        };

        m.Entity<Tenant>().HasData(kigaliMall, chicComplex);

        // ---------- LOCATIONS ----------
        var kigaliMainEntrance = new Location
        {
            Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            TenantId = "kigali-city-mall",
            Name = "Main Entrance",
            AddressLine1 = "KG 9 Ave",
            City = "Kigali",
            Region = "Kigali City",
            Country = "Rwanda",
            Floor = "Ground Floor",
            Unit = "Entrance Hall",
            CreatedAt = DateTimeOffset.UtcNow
        };

        var kigaliFloor2 = new Location
        {
            Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            TenantId = "kigali-city-mall",
            Name = "Electronics Floor",
            AddressLine1 = "KG 9 Ave",
            City = "Kigali",
            Region = "Kigali City",
            Country = "Rwanda",
            Floor = "2nd Floor",
            Unit = "Electronics Wing",
            CreatedAt = DateTimeOffset.UtcNow
        };

        var chicMainFloor = new Location
        {
            Id = Guid.Parse("33333333-3333-3333-3333-333333333333"),
            TenantId = "chic-complex",
            Name = "Main Shopping Floor",
            AddressLine1 = "Kimisagara",
            City = "Kigali",
            Region = "Kigali City",
            Country = "Rwanda",
            Floor = "Ground Floor",
            Unit = "Central Area",
            CreatedAt = DateTimeOffset.UtcNow
        };

        m.Entity<Location>().HasData(kigaliMainEntrance, kigaliFloor2, chicMainFloor);

        // ---------- VENDORS ----------
        var techZone = new Vendor
        {
            Id = Guid.Parse("44444444-4444-4444-4444-444444444444"),
            TenantId = "kigali-city-mall",
            DisplayName = "TechZone Electronics",
            LegalName = "TechZone Electronics Ltd",
            Description = "Latest smartphones, laptops, and electronics with warranty support",
            LocationId = kigaliFloor2.Id,
            ContactPhone = "+250788123456",
            ContactEmail = "sales@techzone.rw",
            Active = true,
            Verified = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var rwandaFashion = new Vendor
        {
            Id = Guid.Parse("55555555-5555-5555-5555-555555555555"),
            TenantId = "kigali-city-mall",
            DisplayName = "Rwanda Fashion House",
            LegalName = "Rwanda Fashion House SARL",
            Description = "Traditional and modern Rwandan clothing, handcrafted with pride",
            LocationId = kigaliMainEntrance.Id,
            ContactPhone = "+250788654321",
            ContactEmail = "info@rwfashion.rw",
            Active = true,
            Verified = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var chicBoutique = new Vendor
        {
            Id = Guid.Parse("66666666-6666-6666-6666-666666666666"),
            TenantId = "chic-complex",
            DisplayName = "Chic Boutique",
            LegalName = "Chic Boutique Ltd",
            Description = "Trendy fashion and accessories for young professionals",
            LocationId = chicMainFloor.Id,
            ContactPhone = "+250788987654",
            ContactEmail = "hello@chicboutique.rw",
            Active = true,
            Verified = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        var kigaliPharmacy = new Vendor
        {
            Id = Guid.Parse("77777777-7777-7777-7777-777777777777"),
            TenantId = "kigali-city-mall",
            DisplayName = "City Pharmacy",
            LegalName = "City Pharmacy & Wellness Ltd",
            Description = "Health and wellness products, prescription medications, vitamins",
            LocationId = kigaliMainEntrance.Id,
            ContactPhone = "+250788111222",
            ContactEmail = "care@citypharmacy.rw",
            Active = true,
            Verified = true,
            CreatedAt = DateTimeOffset.UtcNow
        };

        m.Entity<Vendor>().HasData(techZone, rwandaFashion, chicBoutique, kigaliPharmacy);

        // ---------- DEMO CUSTOMERS ----------
        var jeanPierre = new Customer
        {
            Id = Guid.Parse("88888888-8888-8888-8888-888888888888"),
            TenantId = "kigali-city-mall",
            Username = "jeanpierre",
            FullName = "Jean Pierre Uwimana",
            PhoneNumber = "+250788555111",
            Email = "jeanpierre@email.rw",
            PreferredLanguage = "rw",
            CreatedAt = DateTimeOffset.UtcNow
        };

        var marieClaire = new Customer
        {
            Id = Guid.Parse("99999999-9999-9999-9999-999999999999"),
            TenantId = "chic-complex",
            Username = "marieclaire",
            FullName = "Marie Claire Mukamana",
            PhoneNumber = "+250788555222",
            Email = "marieclaire@email.rw",
            PreferredLanguage = "fr",
            CreatedAt = DateTimeOffset.UtcNow
        };

        m.Entity<Customer>().HasData(jeanPierre, marieClaire);

        // ---------- PRODUCTS ----------
        var products = new[]
        {
        // TechZone Electronics
        new Product
        {
            Id = Guid.Parse("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
            TenantId = "kigali-city-mall",
            VendorId = techZone.Id,
            Name = "Samsung Galaxy A54",
            Description = "Latest Android smartphone with excellent camera and long battery life",
            Price = 450000m, // RWF
            StockQuantity = 15,
            ReservedQuantity = 0,
            Category = "Smartphones",
            ImageUrl = "https://example.com/galaxy-a54.jpg",
            Active = true,
            CreatedAt = DateTimeOffset.UtcNow
        },
        new Product
        {
            Id = Guid.Parse("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
            TenantId = "kigali-city-mall",
            VendorId = techZone.Id,
            Name = "MacBook Air M2",
            Description = "Apple MacBook Air with M2 chip, perfect for students and professionals",
            Price = 1200000m, // RWF
            StockQuantity = 8,
            ReservedQuantity = 0,
            Category = "Laptops",
            ImageUrl = "https://example.com/macbook-air-m2.jpg",
            Active = true,
            CreatedAt = DateTimeOffset.UtcNow
        },
        new Product
        {
            Id = Guid.Parse("cccccccc-cccc-cccc-cccc-cccccccccccc"),
            TenantId = "kigali-city-mall",
            VendorId = techZone.Id,
            Name = "AirPods Pro",
            Description = "Apple AirPods Pro with active noise cancellation",
            Price = 180000m, // RWF
            StockQuantity = 20,
            ReservedQuantity = 0,
            Category = "Audio",
            ImageUrl = "https://example.com/airpods-pro.jpg",
            Active = true,
            CreatedAt = DateTimeOffset.UtcNow
        },

        // Rwanda Fashion House
        new Product
        {
            Id = Guid.Parse("dddddddd-dddd-dddd-dddd-dddddddddddd"),
            TenantId = "kigali-city-mall",
            VendorId = rwandaFashion.Id,
            Name = "Traditional Rwandan Dress",
            Description = "Beautiful handcrafted traditional Rwandan dress with modern touches",
            Price = 75000m, // RWF
            StockQuantity = 12,
            ReservedQuantity = 0,
            Category = "Traditional Wear",
            ImageUrl = "https://example.com/traditional-dress.jpg",
            Active = true,
            CreatedAt = DateTimeOffset.UtcNow
        },
        new Product
        {
            Id = Guid.Parse("eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"),
            TenantId = "kigali-city-mall",
            VendorId = rwandaF