using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EStore.Api.Data;

public static class DatabaseStartup
{
    public static void EnsureCreated(AppDbContext db, ILogger logger)
    {
        if (!db.Database.IsSqlServer())
        {
            db.Database.EnsureCreated();
            return;
        }

        var connectionString = db.Database.GetConnectionString();
        TryRecoverBrokenLocalDbCatalog(connectionString, logger);

        try
        {
            db.Database.Migrate();
        }
        catch (SqlException ex) when (TryRecoverBrokenLocalDbCatalog(connectionString, logger, ex))
        {
            db.Database.Migrate();
        }
    }

    public static bool HasApplicationData(AppDbContext db) =>
        db.Locations.Any() ||
        db.Categories.Any() ||
        db.Vendors.Any() ||
        db.Customers.Any() ||
        db.Products.Any() ||
        db.Reservations.Any() ||
        db.ShoppingCarts.Any() ||
        db.Reviews.Any();

    private static bool TryRecoverBrokenLocalDbCatalog(string? connectionString, ILogger logger, Exception? trigger = null)
    {
        if (!TryBuildMasterConnectionString(connectionString, out var masterConnectionString, out var databaseName))
        {
            return false;
        }

        using var connection = new SqlConnection(masterConnectionString);
        connection.Open();

        var inspection = InspectDatabase(connection, databaseName);
        if (!inspection.Exists || inspection.HasDbAccess || inspection.MissingFiles.Count == 0)
        {
            return false;
        }

        if (trigger is null)
        {
            logger.LogWarning(
                "Dropping stale LocalDB catalog entry for database {DatabaseName} because SQL Server cannot access it and one or more database files are missing: {MissingFiles}",
                databaseName,
                string.Join(", ", inspection.MissingFiles));
        }
        else
        {
            logger.LogWarning(
                trigger,
                "Retrying startup after dropping stale LocalDB catalog entry for database {DatabaseName}. Missing files: {MissingFiles}",
                databaseName,
                string.Join(", ", inspection.MissingFiles));
        }

        DropDatabaseCatalogEntry(connection, databaseName, logger);
        return !DatabaseExists(connection, databaseName);
    }

    private static bool TryBuildMasterConnectionString(string? connectionString, out string masterConnectionString, out string databaseName)
    {
        masterConnectionString = string.Empty;
        databaseName = string.Empty;

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return false;
        }

        var builder = new SqlConnectionStringBuilder(connectionString);
        if (string.IsNullOrWhiteSpace(builder.DataSource) ||
            !builder.DataSource.Contains("(localdb)", StringComparison.OrdinalIgnoreCase) ||
            string.IsNullOrWhiteSpace(builder.InitialCatalog))
        {
            return false;
        }

        databaseName = builder.InitialCatalog;
        builder.InitialCatalog = "master";
        masterConnectionString = builder.ConnectionString;
        return true;
    }

    private static (bool Exists, bool HasDbAccess, List<string> MissingFiles) InspectDatabase(SqlConnection connection, string databaseName)
    {
        using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT
                d.name,
                HAS_DBACCESS(d.name) AS has_dbaccess,
                mf.physical_name
            FROM sys.databases AS d
            LEFT JOIN sys.master_files AS mf ON d.database_id = mf.database_id
            WHERE d.name = @databaseName
            """;
        command.Parameters.Add(new SqlParameter("@databaseName", SqlDbType.NVarChar, 128) { Value = databaseName });

        using var reader = command.ExecuteReader();

        var exists = false;
        var hasDbAccess = false;
        var missingFiles = new List<string>();

        while (reader.Read())
        {
            exists = true;

            if (reader["has_dbaccess"] is not DBNull)
            {
                hasDbAccess = Convert.ToInt32(reader["has_dbaccess"]) == 1;
            }

            if (reader["physical_name"] is string physicalPath &&
                !string.IsNullOrWhiteSpace(physicalPath) &&
                !File.Exists(physicalPath))
            {
                missingFiles.Add(physicalPath);
            }
        }

        return (exists, hasDbAccess, missingFiles);
    }

    private static void DropDatabaseCatalogEntry(SqlConnection connection, string databaseName, ILogger logger)
    {
        using var command = connection.CreateCommand();
        command.CommandText = $"DROP DATABASE [{EscapeSqlIdentifier(databaseName)}]";

        try
        {
            command.ExecuteNonQuery();
        }
        catch (SqlException ex)
        {
            if (DatabaseExists(connection, databaseName))
            {
                throw;
            }

            logger.LogWarning(
                ex,
                "SQL Server reported an error while dropping stale LocalDB database {DatabaseName}, but the catalog entry is already gone.",
                databaseName);
        }
    }

    private static bool DatabaseExists(SqlConnection connection, string databaseName)
    {
        using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM sys.databases WHERE name = @databaseName";
        command.Parameters.Add(new SqlParameter("@databaseName", SqlDbType.NVarChar, 128) { Value = databaseName });
        return Convert.ToInt32(command.ExecuteScalar()) > 0;
    }

    private static string EscapeSqlIdentifier(string value) => value.Replace("]", "]]", StringComparison.Ordinal);
}
