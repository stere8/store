using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Data;

public class AppDbContext(DbContextOptions<AppDbContext> opts) : DbContext(opts)
{
    public DbSet<Vendor> Vendors => Set<Vendor>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Vendor>().HasIndex(x => new { x.TenantId, x.LegalName });
        b.Entity<Product>().HasIndex(x => new { x.TenantId, x.Name });

        // --- Seed data for demo ---
        var tenantA = "mall-a";
        var tenantB = "mall-b";

        var vendorA = new Vendor
        {
            Id = Guid.NewGuid(),
            TenantId = tenantA,
            LegalName = "Alpha Store",
            ContactEmail = "alpha@shop.test",
            Verified = true,
            CreatedAt = DateTime.UtcNow.AddDays(-5)
        };
        var vendorB = new Vendor
        {
            Id = Guid.NewGuid(),
            TenantId = tenantB,
            LegalName = "Beta Outfitters",
            ContactEmail = "beta@shop.test",
            Verified = true,
            CreatedAt = DateTime.UtcNow.AddDays(-3)
        };

        b.Entity<Vendor>().HasData(vendorA, vendorB);

        b.Entity<Product>().HasData(
            new Product
            {
                Id = Guid.NewGuid(),
                TenantId = tenantA,
                VendorId = vendorA.Id,
                Name = "T-Shirt",
                Description = "Cotton tee",
                Price = 49.99m,
                Stock = 120,
                Active = true,
                CreatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new Product
            {
                Id = Guid.NewGuid(),
                TenantId = tenantA,
                VendorId = vendorA.Id,
                Name = "Sneakers",
                Description = "Running shoes",
                Price = 299.00m,
                Stock = 35,
                Active = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Product
            {
                Id = Guid.NewGuid(),
                TenantId = tenantB,
                VendorId = vendorB.Id,
                Name = "Cap",
                Description = "Blue cap",
                Price = 39.99m,
                Stock = 50,
                Active = true,
                CreatedAt = DateTime.UtcNow.AddDays(-1)
            }
        );
    }
}
