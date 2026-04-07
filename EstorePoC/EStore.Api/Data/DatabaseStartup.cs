using System.Data;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace EStore.Api.Data;

public static class DatabaseStartup
{
    private const string InitialMigrationId = "20260120104411_InitialAzureSql";
    private const string InitialMigrationProductVersion = "8.0.8";

    public static void EnsureCreated(AppDbContext db, ILogger logger)
    {
        if (!db.Database.IsSqlServer())
        {
            db.Database.EnsureCreated();
            return;
        }

        var connectionString = db.Database.GetConnectionString();
        TryRecoverBrokenLocalDbCatalog(connectionString, logger);
        BaselineLegacyInitialMigrationIfNeeded(connectionString, logger);

        try
        {
            db.Database.Migrate();
        }
        catch (SqlException ex) when (TryRecoverBrokenLocalDbCatalog(connectionString, logger, ex))
        {
            BaselineLegacyInitialMigrationIfNeeded(connectionString, logger);
            db.Database.Migrate();
        }
    }

    public static bool HasSeedProducts(AppDbContext db, string tenantId) =>
        db.Products.Any(x => x.TenantId == tenantId);

    private static void BaselineLegacyInitialMigrationIfNeeded(
        string? connectionString,
        ILogger logger)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        try
        {
            using var connection = new SqlConnection(connectionString);
            connection.Open();

            if (!HasInitialSchemaTables(connection))
            {
                return;
            }

            EnsureMigrationsHistoryTable(connection);

            if (HasAppliedMigration(connection, InitialMigrationId))
            {
                return;
            }

            if (GetAppliedMigrationCount(connection) > 0)
            {
                return;
            }

            InsertMigrationHistoryRow(
                connection,
                InitialMigrationId,
                InitialMigrationProductVersion);

            logger.LogWarning(
                "Detected a legacy SQL schema with no recorded initial migration. Marked migration {MigrationId} as applied so later migrations can run.",
                InitialMigrationId);
        }
        catch
        {
            // If the database cannot be inspected yet, let normal migration flow handle it.
        }
    }

    private static bool TryRecoverBrokenLocalDbCatalog(
        string? connectionString,
        ILogger logger,
        Exception? trigger = null)
    {
        if (!TryBuildMasterConnectionString(
                connectionString,
                out var masterConnectionString,
                out var databaseName))
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

    private static bool TryBuildMasterConnectionString(
        string? connectionString,
        out string masterConnectionString,
        out string databaseName)
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

    private static (bool Exists, bool HasDbAccess, List<string> MissingFiles) InspectDatabase(
        SqlConnection connection,
        string databaseName)
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
        command.Parameters.Add(
            new SqlParameter("@databaseName", SqlDbType.NVarChar, 128)
            {
                Value = databaseName,
            });

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

    private static void DropDatabaseCatalogEntry(
        SqlConnection connection,
        string databaseName,
        ILogger logger)
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
        command.Parameters.Add(
            new SqlParameter("@databaseName", SqlDbType.NVarChar, 128)
            {
                Value = databaseName,
            });
        return Convert.ToInt32(command.ExecuteScalar()) > 0;
    }

    private static bool HasInitialSchemaTables(SqlConnection connection)
    {
        using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT COUNT(*)
            FROM sys.tables
            WHERE name IN (
                'Categories',
                'Customers',
                'Locations',
                'Products',
                'ReservationItems',
                'Reservations',
                'Reviews',
                'ShoppingCarts',
                'ShoppingCartItems',
                'Tenants',
                'Vendors')
            """;
        return Convert.ToInt32(command.ExecuteScalar()) == 11;
    }

    private static void EnsureMigrationsHistoryTable(SqlConnection connection)
    {
        using var command = connection.CreateCommand();
        command.CommandText = """
            IF OBJECT_ID(N'[__EFMigrationsHistory]') IS NULL
            BEGIN
                CREATE TABLE [__EFMigrationsHistory] (
                    [MigrationId] nvarchar(150) NOT NULL,
                    [ProductVersion] nvarchar(32) NOT NULL,
                    CONSTRAINT [PK___EFMigrationsHistory] PRIMARY KEY ([MigrationId])
                );
            END
            """;
        command.ExecuteNonQuery();
    }

    private static bool HasAppliedMigration(SqlConnection connection, string migrationId)
    {
        using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT COUNT(*)
            FROM [__EFMigrationsHistory]
            WHERE [MigrationId] = @migrationId
            """;
        command.Parameters.Add(
            new SqlParameter("@migrationId", SqlDbType.NVarChar, 150)
            {
                Value = migrationId,
            });
        return Convert.ToInt32(command.ExecuteScalar()) > 0;
    }

    private static int GetAppliedMigrationCount(SqlConnection connection)
    {
        using var command = connection.CreateCommand();
        command.CommandText = "SELECT COUNT(*) FROM [__EFMigrationsHistory]";
        return Convert.ToInt32(command.ExecuteScalar());
    }

    private static void InsertMigrationHistoryRow(
        SqlConnection connection,
        string migrationId,
        string productVersion)
    {
        using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
            VALUES (@migrationId, @productVersion)
            """;
        command.Parameters.Add(
            new SqlParameter("@migrationId", SqlDbType.NVarChar, 150)
            {
                Value = migrationId,
            });
        command.Parameters.Add(
            new SqlParameter("@productVersion", SqlDbType.NVarChar, 32)
            {
                Value = productVersion,
            });
        command.ExecuteNonQuery();
    }

    private static string EscapeSqlIdentifier(string value) =>
        value.Replace("]", "]]", StringComparison.Ordinal);
}
