using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using System.Text.RegularExpressions;
using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.IdentityModel.Tokens;
using Npgsql;
using Xunit;

namespace EStore.Api.Tests;

public sealed class ServiceBookingIntegrationTests
{
    private static readonly DateTimeOffset FixedNow = new(2026, 10, 24, 6, 0, 0, TimeSpan.Zero);

    private sealed class FixedClock : TimeProvider { public override DateTimeOffset GetUtcNow() => FixedNow; }
    private sealed class Factory : WebApplicationFactory<Program>
    {
        protected override void ConfigureClient(HttpClient client)
        {
            base.ConfigureClient(client);
            client.DefaultRequestHeaders.Add("X-Tenant-Id", "chic-complex");
        }
        protected override void ConfigureWebHost(IWebHostBuilder builder) => builder.ConfigureServices(services => {
            services.RemoveAll<TimeProvider>();
            services.AddSingleton<TimeProvider>(new FixedClock());
        });
    }

    [PostgresFact]
    public async Task ServicesCalendarBookingsEnforceOwnershipConcurrencyAndPreserveProductData()
    {
        using var rsa = RSA.Create(2048);
        var settings = new Dictionary<string, string?> {
            ["DATABASE_URL"] = Environment.GetEnvironmentVariable("ESTORE_TEST_DATABASE_URL"),
            ["SEED_DEMO_DATA"] = "false", ["ADMIN_EMAIL"] = "services-admin@example.invalid",
            ["ADMIN_TENANT_ID"] = "chic-complex",
            ["ADMIN_LOGIN_CODE"] = "services-admin-test-code", ["ADMIN_TOKEN_SECRET"] = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48)),
            ["CLERK_JWT_ISSUER"] = "https://services.integration.invalid", ["CLERK_JWT_KEY"] = rsa.ExportSubjectPublicKeyInfoPem(),
            ["CLERK_AUTHORIZED_PARTIES"] = "http://localhost:3000" };
        var previous = settings.Keys.ToDictionary(key => key, Environment.GetEnvironmentVariable);
        foreach (var entry in settings) Environment.SetEnvironmentVariable(entry.Key, entry.Value);
        try
        {
            using var factory = new Factory();
            using var anonymous = factory.CreateClient();
            using var admin = factory.CreateClient();
            var login = await Read(await admin.PostAsJsonAsync("/api/admin-auth/login", new { email = settings["ADMIN_EMAIL"], code = settings["ADMIN_LOGIN_CODE"] }), HttpStatusCode.OK);
            admin.DefaultRequestHeaders.Authorization = new("Bearer", login.GetProperty("accessToken").GetString());
            var suffix = Guid.NewGuid().ToString("N");
            var category = await Read(await admin.PostAsJsonAsync("/api/categories", new { name = "Services-" + suffix,
                fields = new[] { new { key = "service_type", label = "Service type", dataType = "Select", required = true, options = new[] { "Hair", "Consultation" } } } }), HttpStatusCode.Created);
            var categoryId = category.GetProperty("id").GetGuid();
            var (seller, vendorId) = await Vendor(factory, admin, anonymous, "service-a-" + suffix);
            using var ownedSeller = seller;
            var (otherSeller, otherVendorId) = await Vendor(factory, admin, anonymous, "service-b-" + suffix);
            using var ownedOtherSeller = otherSeller;
            var payload = new { name = "Haircut", categoryId, price = 5000, durationMinutes = 30,
                minimumNoticeMinutes = 60, bookingWindowDays = 90, slotIntervalMinutes = 15,
                imageUrl = "https://example.invalid/old-service.png", attributes = new { service_type = "Hair" } };
            Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PostAsJsonAsync("/api/vendor-portal/services", payload)).StatusCode);
            var service = await Read(await seller.PostAsJsonAsync("/api/vendor-portal/services", payload), HttpStatusCode.Created);
            var serviceId = service.GetProperty("id").GetGuid();
            var second = await Read(await seller.PostAsJsonAsync("/api/vendor-portal/services", new { name = "Consultation", categoryId, price = 10000,
                durationMinutes = 60, attributes = new { service_type = "Consultation" } }), HttpStatusCode.Created);
            var secondId = second.GetProperty("id").GetGuid();
            var third = await Read(await otherSeller.PostAsJsonAsync("/api/vendor-portal/services", payload), HttpStatusCode.Created);
            var otherServiceId = third.GetProperty("id").GetGuid();
            Assert.Equal(HttpStatusCode.BadRequest, (await seller.PostAsJsonAsync("/api/vendor-portal/services", new { name = "Bad", categoryId, price = 1000,
                durationMinutes = 30, attributes = new { service_type = "Invalid" } })).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await seller.PostAsJsonAsync("/api/vendor-portal/services", new { name = "Spoof", categoryId, price = 1000,
                durationMinutes = 30, vendorId = otherVendorId, attributes = new { service_type = "Hair" } })).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherSeller.GetAsync($"/api/vendor-portal/services/{serviceId}")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherSeller.PutAsJsonAsync($"/api/vendor-portal/services/{serviceId}", payload)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherSeller.DeleteAsync($"/api/vendor-portal/services/{serviceId}")).StatusCode);
            Assert.Equal(HttpStatusCode.Conflict, (await admin.DeleteAsync($"/api/categories/{categoryId}")).StatusCode);

            var product = await Read(await admin.PostAsJsonAsync("/api/products", new { vendorId, name = "Unchanged product", categoryId,
                price = 12345, stock = 7, imageUrl = "https://example.invalid/original-product.png", attributes = new { service_type = "Hair" } }), HttpStatusCode.Created);
            var productId = product.GetProperty("id").GetGuid();
            var productBefore = await anonymous.GetStringAsync($"/api/products/{productId}");
            var day = DateOnly.FromDateTime(FixedNow.UtcDateTime).AddDays(14);
            var availabilityPath = $"/api/services/{serviceId}/availability?from={day:yyyy-MM-dd}&to={day.AddDays(1):yyyy-MM-dd}";
            var emptySlots = await anonymous.GetFromJsonAsync<JsonElement>(availabilityPath);
            Assert.Empty(emptySlots.GetProperty("slots").EnumerateArray());
            var windows = Enumerable.Range(0, 7).Select(dayOfWeek => new { dayOfWeek, startTime = "09:00", endTime = "17:00" }).ToArray();
            var schedule = new { timeZone = "Africa/Kigali", windows, blockedDates = Array.Empty<string>() };
            await Read(await seller.PutAsJsonAsync("/api/vendor-portal/service-schedule", schedule), HttpStatusCode.OK);
            await Read(await otherSeller.PutAsJsonAsync("/api/vendor-portal/service-schedule", schedule), HttpStatusCode.OK);
            var available = await anonymous.GetFromJsonAsync<JsonElement>(availabilityPath);
            var firstStart = available.GetProperty("slots")[0].GetProperty("startsAt").GetString()!;
            Assert.Equal(7, DateTimeOffset.Parse(firstStart).UtcDateTime.Hour);
            using var customer = factory.CreateClient();
            customer.DefaultRequestHeaders.Authorization = new("Bearer", CustomerToken(rsa, "user_service_one_" + suffix));
            var profile = await Read(await customer.PostAsJsonAsync("/api/customers", new { username = "user_service_one_" + suffix,
                fullName = "Service Customer One", phoneNumber = "+250700100001", email = "service-one-" + suffix + "@example.invalid" }), HttpStatusCode.Created);
            var customerId = profile.GetProperty("id").GetGuid();
            using var otherCustomer = factory.CreateClient();
            otherCustomer.DefaultRequestHeaders.Authorization = new("Bearer", CustomerToken(rsa, "user_service_two_" + suffix));
            await Read(await otherCustomer.PostAsJsonAsync("/api/customers", new { username = "user_service_two_" + suffix,
                fullName = "Service Customer Two", phoneNumber = "+250700100002", email = "service-two-" + suffix + "@example.invalid" }), HttpStatusCode.Created);
            Assert.Equal(HttpStatusCode.BadRequest, (await customer.PostAsJsonAsync("/api/service-bookings", new { serviceId, startsAt = firstStart,
                clientBookingId = Guid.NewGuid(), customerId })).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await customer.PostAsJsonAsync("/api/service-bookings", new { serviceId,
                startsAt = "2026-11-07T09:00:00", clientBookingId = Guid.NewGuid() })).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await customer.PostAsJsonAsync("/api/service-bookings", new { serviceId,
                startsAt = FixedNow.AddDays(95).ToString("O"), clientBookingId = Guid.NewGuid() })).StatusCode);
            var clientBookingId = Guid.NewGuid();
            var request = new { serviceId, startsAt = firstStart, clientBookingId, notes = "Please confirm availability", price = 1 };
            var retries = await Task.WhenAll(Enumerable.Range(0, 3).Select(_ => customer.PostAsJsonAsync("/api/service-bookings", request)));
            Assert.Single(retries, r => r.StatusCode == HttpStatusCode.Created);
            Assert.All(retries, r => Assert.Contains(r.StatusCode, new[] { HttpStatusCode.OK, HttpStatusCode.Created }));
            var booked = await Read(retries.First(), retries.First().StatusCode);
            var bookingId = booked.GetProperty("id").GetGuid();
            Assert.Equal(5000, booked.GetProperty("price").GetDecimal());
            Assert.Equal("Pending", booked.GetProperty("status").GetString());
            Assert.Equal(HttpStatusCode.Conflict, (await otherCustomer.PostAsJsonAsync("/api/service-bookings", new { serviceId = secondId,
                startsAt = firstStart, clientBookingId = Guid.NewGuid() })).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherCustomer.GetAsync($"/api/service-bookings/{bookingId}")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherSeller.GetAsync($"/api/vendor-portal/service-bookings/{bookingId}")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync($"/api/service-bookings/{bookingId}")).StatusCode);
            await Read(await admin.GetAsync($"/api/admin/service-bookings/{bookingId}"), HttpStatusCode.OK);
            using var crossTenant = factory.CreateClient();
            crossTenant.DefaultRequestHeaders.Authorization = admin.DefaultRequestHeaders.Authorization;
            crossTenant.DefaultRequestHeaders.Remove("X-Tenant-Id");
            crossTenant.DefaultRequestHeaders.Add("X-Tenant-Id", "kigali-city-mall");
            Assert.Equal(HttpStatusCode.Forbidden, (await crossTenant.GetAsync($"/api/admin/service-bookings/{bookingId}")).StatusCode);
            var occupied = await anonymous.GetFromJsonAsync<JsonElement>(availabilityPath);
            Assert.DoesNotContain(occupied.GetProperty("slots").EnumerateArray(), slot => slot.GetProperty("startsAt").GetString() == firstStart);
            Assert.Equal(HttpStatusCode.Conflict, (await seller.PutAsJsonAsync("/api/vendor-portal/service-schedule", new {
                timeZone = "Africa/Kigali", windows, blockedDates = new[] { day.ToString("yyyy-MM-dd") } })).StatusCode);
            await Read(await seller.PatchAsJsonAsync($"/api/vendor-portal/service-bookings/{bookingId}/status", new { status = "Confirmed" }), HttpStatusCode.OK);
            Assert.Equal(HttpStatusCode.Conflict, (await seller.PatchAsJsonAsync($"/api/vendor-portal/service-bookings/{bookingId}/status", new { status = "Completed" })).StatusCode);
            var movedStart = DateTimeOffset.Parse(firstStart).AddHours(2).ToString("O");
            await Read(await seller.PutAsJsonAsync($"/api/vendor-portal/services/{serviceId}", new {
                name = "Renamed haircut", categoryId, price = 9000, durationMinutes = 60 }), HttpStatusCode.OK);
            var persisted = await Read(await customer.GetAsync($"/api/service-bookings/{bookingId}"), HttpStatusCode.OK);
            Assert.Equal(5000, persisted.GetProperty("price").GetDecimal());
            Assert.Equal(30, persisted.GetProperty("durationMinutes").GetInt32());
            Assert.Equal("Haircut", persisted.GetProperty("serviceName").GetString());
            var moved = await Read(await customer.PutAsJsonAsync($"/api/service-bookings/{bookingId}/reschedule", new { startsAt = movedStart }), HttpStatusCode.OK);
            Assert.Equal(30, moved.GetProperty("durationMinutes").GetInt32());
            Assert.Equal(5000, moved.GetProperty("price").GetDecimal());
            await Read(await customer.PostAsJsonAsync("/api/service-bookings", request), HttpStatusCode.OK);
            Assert.Equal(HttpStatusCode.Conflict, (await customer.PostAsJsonAsync("/api/service-bookings", new { serviceId, startsAt = movedStart, clientBookingId, notes = request.notes })).StatusCode);
            var updatedService = await Read(await seller.GetAsync($"/api/vendor-portal/services/{serviceId}"), HttpStatusCode.OK);
            Assert.Equal("https://example.invalid/old-service.png", updatedService.GetProperty("imageUrl").GetString());
            Assert.Equal("Hair", updatedService.GetProperty("attributes").GetProperty("service_type").GetString());

            var contestedStart = DateTimeOffset.Parse(firstStart).AddHours(3).ToString("O");
            var competing = await Task.WhenAll(Enumerable.Range(0, 3).Select(_ => otherCustomer.PostAsJsonAsync("/api/service-bookings",
                new { serviceId, startsAt = contestedStart, clientBookingId = Guid.NewGuid() })));
            Assert.Single(competing, r => r.StatusCode == HttpStatusCode.Created);
            Assert.Equal(2, competing.Count(r => r.StatusCode == HttpStatusCode.Conflict));
            await Read(await otherCustomer.PostAsJsonAsync("/api/service-bookings", new { serviceId = otherServiceId, startsAt = contestedStart,
                clientBookingId = Guid.NewGuid() }), HttpStatusCode.Created);

            var raceDay = day.AddDays(1);
            var raceStart = DateTimeOffset.Parse(firstStart).AddDays(1).ToString("O");
            var racingBooking = customer.PostAsJsonAsync("/api/service-bookings", new { serviceId, startsAt = raceStart, clientBookingId = Guid.NewGuid() });
            var racingSchedule = seller.PutAsJsonAsync("/api/vendor-portal/service-schedule", new { timeZone = "Africa/Kigali", windows,
                blockedDates = new[] { raceDay.ToString("yyyy-MM-dd") } });
            await Task.WhenAll(racingBooking, racingSchedule);
            Assert.True((racingBooking.Result.StatusCode == HttpStatusCode.Created && racingSchedule.Result.StatusCode == HttpStatusCode.Conflict) ||
                (racingBooking.Result.StatusCode == HttpStatusCode.BadRequest && racingSchedule.Result.StatusCode == HttpStatusCode.OK));
            await Read(await seller.PutAsJsonAsync("/api/vendor-portal/service-schedule", schedule), HttpStatusCode.OK);
            await Read(await customer.PostAsync($"/api/service-bookings/{bookingId}/cancel", null), HttpStatusCode.OK);
            await Read(await customer.PostAsync($"/api/service-bookings/{bookingId}/cancel", null), HttpStatusCode.OK);
            Assert.Equal(HttpStatusCode.Conflict, (await seller.PatchAsJsonAsync($"/api/vendor-portal/service-bookings/{bookingId}/status", new { status = "Confirmed" })).StatusCode);
            var crossVendorKey = Guid.NewGuid();
            var crossVendorStart = DateTimeOffset.Parse(firstStart).AddDays(2).ToString("O");
            var crossVendorRetries = await Task.WhenAll(new[] { serviceId, otherServiceId }.Select(id =>
                customer.PostAsJsonAsync("/api/service-bookings", new { serviceId = id, startsAt = crossVendorStart, clientBookingId = crossVendorKey })));
            Assert.Single(crossVendorRetries, response => response.StatusCode == HttpStatusCode.Created);
            Assert.Single(crossVendorRetries, response => response.StatusCode == HttpStatusCode.Conflict);
            Assert.Equal(HttpStatusCode.NoContent, (await seller.DeleteAsync($"/api/vendor-portal/services/{serviceId}")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync($"/api/services/{serviceId}")).StatusCode);
            await Read(await seller.GetAsync($"/api/vendor-portal/services/{serviceId}"), HttpStatusCode.OK);
            await Read(await admin.GetAsync($"/api/admin/service-bookings/{bookingId}"), HttpStatusCode.OK);
            Assert.Equal(productBefore, await anonymous.GetStringAsync($"/api/products/{productId}"));
            var swagger = await anonymous.GetFromJsonAsync<JsonElement>("/swagger/v1/swagger.json");
            Assert.True(swagger.GetProperty("paths").TryGetProperty("/api/services/{id}/availability", out _));
            Assert.True(swagger.GetProperty("components").GetProperty("schemas").TryGetProperty("ServiceBookingDto", out _));
            VerifyHandoffContracts(swagger);
            Assert.Equal(HttpStatusCode.NoContent, (await admin.DeleteAsync("/api/customers/by-username/user_service_one_" + suffix)).StatusCode);
            var retained = await Read(await seller.GetAsync($"/api/vendor-portal/service-bookings/{bookingId}"), HttpStatusCode.OK);
            Assert.Equal("Deleted customer", retained.GetProperty("customerName").GetString());
            Assert.Equal(HttpStatusCode.Unauthorized, (await customer.GetAsync($"/api/service-bookings/{bookingId}")).StatusCode);
        }
        finally { foreach (var entry in previous) Environment.SetEnvironmentVariable(entry.Key, entry.Value); }
    }

    [PostgresFact]
    public async Task LegacyPostgresUpgradeIsRepeatableAndPreservesProductsAndImages()
    {
        var configured = Environment.GetEnvironmentVariable("ESTORE_TEST_DATABASE_URL")!;
        var baseBuilder = Connection(configured);
        var schema = "services_upgrade_" + Guid.NewGuid().ToString("N");
        await using var connection = new NpgsqlConnection(baseBuilder.ConnectionString);
        await connection.OpenAsync();
        await using (var create = new NpgsqlCommand($"CREATE SCHEMA \"{schema}\"", connection)) await create.ExecuteNonQueryAsync();
        baseBuilder.SearchPath = schema;
        try
        {
            var options = new DbContextOptionsBuilder<AppDbContext>().UseNpgsql(baseBuilder.ConnectionString).Options;
            await using var db = new AppDbContext(options) { CurrentTenantId = "kigali-city-mall" };
            await db.GetService<IRelationalDatabaseCreator>().CreateTablesAsync();
            var vendor = new Vendor { Id = Guid.NewGuid(), TenantId = "kigali-city-mall", DisplayName = "Preserved", LegalName = "Preserved Ltd", ContactPhone = "phone", Active = true, Verified = true };
            var category = new Category { Id = Guid.NewGuid(), TenantId = "kigali-city-mall", Name = "Preserved category" };
            var product = new Product { Id = Guid.NewGuid(), TenantId = "kigali-city-mall", VendorId = vendor.Id,
                CategoryId = category.Id, Name = "Preserved product", Price = 12345, StockQuantity = 7, ImageUrl = "https://example.invalid/preserved.png" };
            db.AddRange(vendor, category, product);
            await db.SaveChangesAsync();
            Assert.Equal(schema, await db.Database.SqlQueryRaw<string>("SELECT current_schema() AS \"Value\"").SingleAsync());
            // Only the new, empty tables in this test-owned schema are removed to reproduce an old installation.
            await db.Database.ExecuteSqlRawAsync("DROP TABLE \"ServiceBookings\"; DROP TABLE \"ServiceSchedules\"; DROP TABLE \"Services\";");
            DatabaseStartup.EnsureCreated(db, NullLogger.Instance);
            DatabaseStartup.EnsureCreated(db, NullLogger.Instance);
            db.ChangeTracker.Clear();
            var preserved = await db.Products.SingleAsync(p => p.Id == product.Id);
            Assert.Equal(12345, preserved.Price);
            Assert.Equal(7, preserved.StockQuantity);
            Assert.Equal("https://example.invalid/preserved.png", preserved.ImageUrl);
            Assert.Empty(await db.ServiceOfferings.ToListAsync());
            Assert.Equal(1, await db.Database.SqlQueryRaw<int>("SELECT COUNT(*)::integer AS \"Value\" FROM \"__EStoreSchemaVersions\" WHERE \"Id\" = '20261024_services_bookings'").SingleAsync());
        }
        finally
        {
            await using var drop = new NpgsqlCommand($"DROP SCHEMA \"{schema}\" CASCADE", connection);
            await drop.ExecuteNonQueryAsync();
        }
    }

    private static NpgsqlConnectionStringBuilder Connection(string configured)
    {
        if (!configured.StartsWith("postgres")) return new(configured);
        var uri = new Uri(configured);
        var credentials = uri.UserInfo.Split(':', 2);
        var result = new NpgsqlConnectionStringBuilder { Host = uri.Host, Port = uri.Port > 0 ? uri.Port : 5432,
            Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')), Username = Uri.UnescapeDataString(credentials[0]) };
        if (credentials.Length > 1) result.Password = Uri.UnescapeDataString(credentials[1]);
        return result;
    }

    private static void VerifyHandoffContracts(JsonElement swagger)
    {
        var docs = Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "../../../../../docs"));
        foreach (var file in new[] { "services-bookings-api.md", "vendor-profile-edit-api.md", "platform-fee-api.md" })
        {
            var path = Path.Combine(docs, file);
            if (!File.Exists(path)) continue; // Other feature branches are optional until combined.
            var document = File.ReadAllText(path);
            foreach (Match row in Regex.Matches(document, @"^\| (GET|POST|PUT|PATCH|DELETE) \| (/[^| ]+) \|", RegexOptions.Multiline))
            {
                var expected = Regex.Replace(row.Groups[2].Value, @"\{[^}]+\}", "{}");
                var registered = swagger.GetProperty("paths").EnumerateObject().SingleOrDefault(p =>
                    Regex.Replace(p.Name, @"\{[^}]+\}", "{}") == expected);
                Assert.NotNull(registered.Name);
                Assert.True(registered.Value.TryGetProperty(row.Groups[1].Value.ToLowerInvariant(), out _), row.Value);
            }
            foreach (Match json in Regex.Matches(document, "```json\\r?\\n([\\s\\S]*?)\\r?\\n```"))
            {
                using var parsed = JsonDocument.Parse(json.Groups[1].Value);
                Assert.Equal(JsonValueKind.Object, parsed.RootElement.ValueKind);
            }
        }
    }

    private static async Task<(HttpClient Client, Guid Id)> Vendor(Factory factory, HttpClient admin, HttpClient anonymous, string name)
    {
        var vendor = await Read(await anonymous.PostAsJsonAsync("/api/vendors/register", new { displayName = name, legalName = name + " Ltd",
            contactPhone = "+250700100003", contactEmail = name + "@example.invalid" }), HttpStatusCode.Created);
        var id = vendor.GetProperty("id").GetGuid();
        var approved = await Read(await admin.PatchAsync($"/api/admin/vendors/{id}/approve", null), HttpStatusCode.OK);
        var session = await Read(await anonymous.PostAsJsonAsync("/api/vendor-auth/register", new {
            registrationCode = approved.GetProperty("registrationCode").GetString(), email = name + "@example.invalid", password = "service-vendor-test-password" }), HttpStatusCode.OK);
        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add("X-Vendor-Access-Token", session.GetProperty("accessToken").GetString());
        return (client, id);
    }

    private static string CustomerToken(RSA rsa, string subject)
    {
        var now = DateTime.UtcNow;
        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken("https://services.integration.invalid", null,
            [new Claim("sub", subject), new Claim("azp", "http://localhost:3000")], now, now.AddMinutes(30),
            new SigningCredentials(new RsaSecurityKey(rsa), SecurityAlgorithms.RsaSha256)));
    }

    private static async Task<JsonElement> Read(HttpResponseMessage response, HttpStatusCode status)
    {
        var text = await response.Content.ReadAsStringAsync();
        Assert.True(response.StatusCode == status, $"Expected {status}, got {response.StatusCode}: {text}");
        return JsonDocument.Parse(text).RootElement.Clone();
    }
}
