using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace EStore.Api.Data;

// The existing EF migration history targets SQL Server; PostgreSQL upgrades use a separate versioned script.
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args) =>
        new(new DbContextOptionsBuilder<AppDbContext>().UseSqlServer(
            "Server=(localdb)\\MSSQLLocalDB;Database=EStore_DesignTime;Integrated Security=true").Options);
}
