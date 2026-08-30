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
            EnsurePostgresDashboardTablesIfNeeded(db, logger);
            return;
        }

        var connectionString = db.Database.GetConnectionString();
        TryRecoverBrokenLocalDbCatalog(connectionString, logger);
        BaselineLegacyInitialMigrationIfNeeded(connectionString, logger);

        try
        {
            db.Database.Migrate();
            EnsureSqlServerDashboardTablesIfNeeded(connectionString, logger);
        }
        catch (SqlException ex) when (TryRecoverBrokenLocalDbCatalog(connectionString, logger, ex))
        {
            BaselineLegacyInitialMigrationIfNeeded(connectionString, logger);
            db.Database.Migrate();
            EnsureSqlServerDashboardTablesIfNeeded(connectionString, logger);
        }
    }

    public static bool HasSeedProducts(AppDbContext db, string tenantId) =>
        db.Products.Any(x => x.TenantId == tenantId);

    private static void EnsurePostgresDashboardTablesIfNeeded(AppDbContext db, ILogger logger)
    {
        if (!IsPostgres(db))
        {
            return;
        }

        db.Database.ExecuteSqlRaw("""
            CREATE TABLE IF NOT EXISTS "StoreLeases" (
                "Id" uuid NOT NULL,
                "TenantId" character varying(80) NOT NULL,
                "VendorId" uuid NOT NULL,
                "LocationId" uuid NOT NULL,
                "MonthlyRent" numeric(18,2) NOT NULL,
                "Currency" character varying(8) NOT NULL,
                "BillingDay" integer NOT NULL,
                "SecurityDeposit" numeric(18,2) NOT NULL,
                "LeaseStart" timestamp with time zone NOT NULL,
                "LeaseEnd" timestamp with time zone NULL,
                "Status" character varying(32) NOT NULL,
                "Notes" character varying(240) NULL,
                "CreatedAt" timestamp with time zone NOT NULL,
                "UpdatedAt" timestamp with time zone NOT NULL,
                CONSTRAINT "PK_StoreLeases" PRIMARY KEY ("Id"),
                CONSTRAINT "FK_StoreLeases_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE CASCADE,
                CONSTRAINT "FK_StoreLeases_Vendors_VendorId" FOREIGN KEY ("VendorId") REFERENCES "Vendors" ("Id") ON DELETE RESTRICT,
                CONSTRAINT "FK_StoreLeases_Locations_LocationId" FOREIGN KEY ("LocationId") REFERENCES "Locations" ("Id") ON DELETE RESTRICT
            );

            CREATE TABLE IF NOT EXISTS "RentPayments" (
                "Id" uuid NOT NULL,
                "TenantId" character varying(80) NOT NULL,
                "StoreLeaseId" uuid NOT NULL,
                "VendorId" uuid NOT NULL,
                "LocationId" uuid NOT NULL,
                "PeriodStart" timestamp with time zone NOT NULL,
                "PeriodEnd" timestamp with time zone NOT NULL,
                "DueDate" timestamp with time zone NOT NULL,
                "AmountDue" numeric(18,2) NOT NULL,
                "AmountPaid" numeric(18,2) NOT NULL,
                "Currency" character varying(8) NOT NULL,
                "Status" character varying(32) NOT NULL,
                "PaymentReference" character varying(80) NULL,
                "PaidAt" timestamp with time zone NULL,
                "Notes" character varying(240) NULL,
                "CreatedAt" timestamp with time zone NOT NULL,
                "UpdatedAt" timestamp with time zone NOT NULL,
                CONSTRAINT "PK_RentPayments" PRIMARY KEY ("Id"),
                CONSTRAINT "FK_RentPayments_StoreLeases_StoreLeaseId" FOREIGN KEY ("StoreLeaseId") REFERENCES "StoreLeases" ("Id") ON DELETE CASCADE,
                CONSTRAINT "FK_RentPayments_Tenants_TenantId" FOREIGN KEY ("TenantId") REFERENCES "Tenants" ("Id") ON DELETE CASCADE,
                CONSTRAINT "FK_RentPayments_Vendors_VendorId" FOREIGN KEY ("VendorId") REFERENCES "Vendors" ("Id") ON DELETE RESTRICT,
                CONSTRAINT "FK_RentPayments_Locations_LocationId" FOREIGN KEY ("LocationId") REFERENCES "Locations" ("Id") ON DELETE RESTRICT
            );

            CREATE INDEX IF NOT EXISTS "IX_StoreLeases_TenantId_Status" ON "StoreLeases" ("TenantId", "Status");
            CREATE INDEX IF NOT EXISTS "IX_StoreLeases_TenantId_VendorId" ON "StoreLeases" ("TenantId", "VendorId");
            CREATE INDEX IF NOT EXISTS "IX_StoreLeases_TenantId_LocationId" ON "StoreLeases" ("TenantId", "LocationId");
            CREATE INDEX IF NOT EXISTS "IX_StoreLeases_TenantId_LeaseEnd" ON "StoreLeases" ("TenantId", "LeaseEnd");
            CREATE INDEX IF NOT EXISTS "IX_RentPayments_TenantId_Status" ON "RentPayments" ("TenantId", "Status");
            CREATE INDEX IF NOT EXISTS "IX_RentPayments_TenantId_DueDate" ON "RentPayments" ("TenantId", "DueDate");
            CREATE INDEX IF NOT EXISTS "IX_RentPayments_TenantId_VendorId_DueDate" ON "RentPayments" ("TenantId", "VendorId", "DueDate");
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_RentPayments_TenantId_StoreLeaseId_PeriodStart" ON "RentPayments" ("TenantId", "StoreLeaseId", "PeriodStart");
            """);

        logger.LogInformation("Ensured PostgreSQL dashboard tables exist.");
    }

    private static bool IsPostgres(AppDbContext db) =>
        db.Database.ProviderName?.Contains("Npgsql", StringComparison.OrdinalIgnoreCase) == true;

    private static void EnsureSqlServerDashboardTablesIfNeeded(
        string? connectionString,
        ILogger logger)
    {
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            return;
        }

        using var connection = new SqlConnection(connectionString);
        connection.Open();

        using var command = connection.CreateCommand();
        command.CommandText = """
            IF OBJECT_ID(N'[StoreLeases]') IS NULL
            BEGIN
                CREATE TABLE [StoreLeases] (
                    [Id] uniqueidentifier NOT NULL,
                    [TenantId] nvarchar(80) NOT NULL,
                    [VendorId] uniqueidentifier NOT NULL,
                    [LocationId] uniqueidentifier NOT NULL,
                    [MonthlyRent] decimal(18,2) NOT NULL,
                    [Currency] nvarchar(8) NOT NULL,
                    [BillingDay] int NOT NULL,
                    [SecurityDeposit] decimal(18,2) NOT NULL,
                    [LeaseStart] datetimeoffset NOT NULL,
                    [LeaseEnd] datetimeoffset NULL,
                    [Status] nvarchar(32) NOT NULL,
                    [Notes] nvarchar(240) NULL,
                    [CreatedAt] datetimeoffset NOT NULL,
                    [UpdatedAt] datetimeoffset NOT NULL,
                    CONSTRAINT [PK_StoreLeases] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_StoreLeases_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_StoreLeases_Vendors_VendorId] FOREIGN KEY ([VendorId]) REFERENCES [Vendors] ([Id]) ON DELETE NO ACTION,
                    CONSTRAINT [FK_StoreLeases_Locations_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [Locations] ([Id]) ON DELETE NO ACTION
                );
            END

            IF OBJECT_ID(N'[RentPayments]') IS NULL
            BEGIN
                CREATE TABLE [RentPayments] (
                    [Id] uniqueidentifier NOT NULL,
                    [TenantId] nvarchar(80) NOT NULL,
                    [StoreLeaseId] uniqueidentifier NOT NULL,
                    [VendorId] uniqueidentifier NOT NULL,
                    [LocationId] uniqueidentifier NOT NULL,
                    [PeriodStart] datetimeoffset NOT NULL,
                    [PeriodEnd] datetimeoffset NOT NULL,
                    [DueDate] datetimeoffset NOT NULL,
                    [AmountDue] decimal(18,2) NOT NULL,
                    [AmountPaid] decimal(18,2) NOT NULL,
                    [Currency] nvarchar(8) NOT NULL,
                    [Status] nvarchar(32) NOT NULL,
                    [PaymentReference] nvarchar(80) NULL,
                    [PaidAt] datetimeoffset NULL,
                    [Notes] nvarchar(240) NULL,
                    [CreatedAt] datetimeoffset NOT NULL,
                    [UpdatedAt] datetimeoffset NOT NULL,
                    CONSTRAINT [PK_RentPayments] PRIMARY KEY ([Id]),
                    CONSTRAINT [FK_RentPayments_StoreLeases_StoreLeaseId] FOREIGN KEY ([StoreLeaseId]) REFERENCES [StoreLeases] ([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_RentPayments_Tenants_TenantId] FOREIGN KEY ([TenantId]) REFERENCES [Tenants] ([Id]) ON DELETE CASCADE,
                    CONSTRAINT [FK_RentPayments_Vendors_VendorId] FOREIGN KEY ([VendorId]) REFERENCES [Vendors] ([Id]) ON DELETE NO ACTION,
                    CONSTRAINT [FK_RentPayments_Locations_LocationId] FOREIGN KEY ([LocationId]) REFERENCES [Locations] ([Id]) ON DELETE NO ACTION
                );
            END

            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StoreLeases_TenantId_Status' AND object_id = OBJECT_ID(N'[StoreLeases]'))
                CREATE INDEX [IX_StoreLeases_TenantId_Status] ON [StoreLeases] ([TenantId], [Status]);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StoreLeases_TenantId_VendorId' AND object_id = OBJECT_ID(N'[StoreLeases]'))
                CREATE INDEX [IX_StoreLeases_TenantId_VendorId] ON [StoreLeases] ([TenantId], [VendorId]);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StoreLeases_TenantId_LocationId' AND object_id = OBJECT_ID(N'[StoreLeases]'))
                CREATE INDEX [IX_StoreLeases_TenantId_LocationId] ON [StoreLeases] ([TenantId], [LocationId]);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_StoreLeases_TenantId_LeaseEnd' AND object_id = OBJECT_ID(N'[StoreLeases]'))
                CREATE INDEX [IX_StoreLeases_TenantId_LeaseEnd] ON [StoreLeases] ([TenantId], [LeaseEnd]);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_RentPayments_TenantId_Status' AND object_id = OBJECT_ID(N'[RentPayments]'))
                CREATE INDEX [IX_RentPayments_TenantId_Status] ON [RentPayments] ([TenantId], [Status]);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_RentPayments_TenantId_DueDate' AND object_id = OBJECT_ID(N'[RentPayments]'))
                CREATE INDEX [IX_RentPayments_TenantId_DueDate] ON [RentPayments] ([TenantId], [DueDate]);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_RentPayments_TenantId_VendorId_DueDate' AND object_id = OBJECT_ID(N'[RentPayments]'))
                CREATE INDEX [IX_RentPayments_TenantId_VendorId_DueDate] ON [RentPayments] ([TenantId], [VendorId], [DueDate]);
            IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_RentPayments_TenantId_StoreLeaseId_PeriodStart' AND object_id = OBJECT_ID(N'[RentPayments]'))
                CREATE UNIQUE INDEX [IX_RentPayments_TenantId_StoreLeaseId_PeriodStart] ON [RentPayments] ([TenantId], [StoreLeaseId], [PeriodStart]);
            """;

        command.ExecuteNonQuery();
        logger.LogInformation("Ensured SQL Server dashboard tables exist.");
    }

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
