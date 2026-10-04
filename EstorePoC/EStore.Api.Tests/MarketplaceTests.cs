using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using EStore.Api.DTOs;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.IdentityModel.Tokens;
using Xunit;

[assembly: CollectionBehavior(DisableTestParallelization = true)]

namespace EStore.Api.Tests;

public sealed class PostgresFactAttribute : FactAttribute
{
    public PostgresFactAttribute()
    {
        if (string.IsNullOrEmpty(Environment.GetEnvironmentVariable("ESTORE_TEST_DATABASE_URL")))
            Skip = "Set ESTORE_TEST_DATABASE_URL to an isolated PostgreSQL database/schema.";
    }
}

public sealed class MarketplaceTests
{
    [Fact]
    public void RejectsInvalidFormDefinitions()
    {
        Assert.NotNull(CategoryFormService.ValidateDefinitions([
            new("size", "Size", CategoryFieldType.Select, Options: [])]));
        Assert.NotNull(CategoryFormService.ValidateDefinitions([
            new("origin", "Origin", CategoryFieldType.Text), new("origin", "Other", CategoryFieldType.Text)]));
        Assert.NotNull(CategoryFormService.ValidateDefinitions([
            new("amount", "Amount", CategoryFieldType.Integer, Min: 1.5m)]));
        Assert.NotNull(CategoryFormService.ValidateDefinitions([
            new("amount", "Amount", CategoryFieldType.Number, Min: decimal.MinValue)]));
        Assert.NotNull(CategoryFormService.ValidateDefinitions([
            new("description", "Description", CategoryFieldType.Text, MaxLength: 0)]));
        Assert.Null(CategoryFormService.ValidateDefinitions([
            new("size", "Size", CategoryFieldType.Select, true, Options: ["S", "M", "L"]),
            new("origin", "Country of origin", CategoryFieldType.Text, true, MaxLength: 80)]));
    }

    [Fact]
    public void AdminAuthenticationFailsClosedWithoutConfiguration()
    {
        var settings = new AdminAuthSettings(new Microsoft.Extensions.Configuration.ConfigurationBuilder().Build());
        Assert.False(settings.IsConfigured);
        Assert.False(new AdminAuthService(settings).Verify("admin@example.invalid", "secret-code"));
    }

    [PostgresFact]
    public async Task AdminFormsLogosAndChatEnforceOwnershipAndPersistData()
    {
        using var rsa = RSA.Create(2048);
        var environment = new Dictionary<string, string?>
        {
            ["DATABASE_URL"] = Environment.GetEnvironmentVariable("ESTORE_TEST_DATABASE_URL"),
            ["DATABASE_PROVIDER"] = "postgres",
            ["SEED_DEMO_DATA"] = "false",
            ["ADMIN_EMAIL"] = "admin@example.invalid",
            ["ADMIN_LOGIN_CODE"] = "test-admin-code-2026",
            ["ADMIN_TOKEN_SECRET"] = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48)),
            ["CLERK_JWT_ISSUER"] = "https://clerk.integration.invalid",
            ["CLERK_JWT_KEY"] = rsa.ExportSubjectPublicKeyInfoPem(),
            ["CLERK_AUTHORIZED_PARTIES"] = "http://localhost:3000"
        };
        var previous = environment.Keys.ToDictionary(k => k, Environment.GetEnvironmentVariable);
        foreach (var entry in environment) Environment.SetEnvironmentVariable(entry.Key, entry.Value);
        try
        {
            using var factory = new WebApplicationFactory<Program>();
            using var anonymous = factory.CreateClient();
            Assert.Equal(HttpStatusCode.OK, (await anonymous.GetAsync("/health")).StatusCode);
            Assert.Empty(await anonymous.GetFromJsonAsync<JsonElement[]>("/api/products") ?? []);
            Assert.Empty(await anonymous.GetFromJsonAsync<JsonElement[]>("/api/categories") ?? []);
            Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PostAsJsonAsync("/api/categories",
                new { name = "Clothes" })).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PutAsJsonAsync("/api/vendors/" +
                Guid.NewGuid() + "/logo", new { logoUrl = "https://example.invalid/logo.png" })).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PostAsJsonAsync("/api/admin-auth/login",
                new { email = "admin@example.invalid", code = "wrong-code" })).StatusCode);

            var login = await Read(await anonymous.PostAsJsonAsync("/api/admin-auth/login",
                new { email = "admin@example.invalid", code = "test-admin-code-2026" }), HttpStatusCode.OK);
            using var admin = factory.CreateClient();
            admin.DefaultRequestHeaders.Authorization = new("Bearer", login.GetProperty("accessToken").GetString());
            Assert.Equal(HttpStatusCode.OK, (await admin.GetAsync("/api/admin-auth/me")).StatusCode);
            using var crossTenant = factory.CreateClient();
            crossTenant.DefaultRequestHeaders.Authorization = admin.DefaultRequestHeaders.Authorization;
            crossTenant.DefaultRequestHeaders.Add("X-Tenant-Id", "chic-complex");
            Assert.Equal(HttpStatusCode.Forbidden, (await crossTenant.PostAsJsonAsync("/api/categories",
                new { name = "Forbidden" })).StatusCode);

            var category = await Read(await admin.PostAsJsonAsync("/api/categories", new
            {
                name = "Clothes", fields = new object[]
                {
                    new { key = "size", label = "Size", dataType = "Select", required = true, options = new[] { "S", "M", "L" } },
                    new { key = "origin", label = "Origin", dataType = "Text", required = true, maxLength = 80 },
                    new { key = "used", label = "Previously used", dataType = "Boolean", required = true }
                }
            }), HttpStatusCode.Created);
            var categoryId = category.GetProperty("id").GetGuid();
            var child = await Read(await admin.PostAsJsonAsync($"/api/categories/{categoryId}/subcategories", new
            {
                name = "Shirts", fields = new object[]
                {
                    new { key = "sleeve_length", label = "Sleeve length", dataType = "Integer", required = true, min = 0, max = 100 }
                }
            }), HttpStatusCode.Created);
            var childId = child.GetProperty("id").GetGuid();
            var form = await anonymous.GetFromJsonAsync<JsonElement>($"/api/categories/{childId}/form");
            Assert.Equal(4, form.GetProperty("fields").GetArrayLength());
            Assert.Equal(HttpStatusCode.BadRequest, (await admin.PostAsJsonAsync($"/api/categories/{categoryId}/subcategories",
                new { name = "Duplicate fields", fields = new[] { new { key = "size", label = "Size", dataType = "Text" } } })).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await admin.PostAsJsonAsync($"/api/categories/{childId}/subcategories",
                new { name = "Third level" })).StatusCode);

            var vendor = await Read(await anonymous.PostAsJsonAsync("/api/vendors/register",
                new { displayName = "Test vendor", legalName = "Test Ltd", contactPhone = "+250700000001",
                    contactEmail = "vendor@example.invalid", description = "Integration fixture" }), HttpStatusCode.Created);
            var vendorId = vendor.GetProperty("id").GetGuid();
            await Read(await admin.PutAsJsonAsync($"/api/vendors/{vendorId}/logo",
                new { logoUrl = "https://res.cloudinary.com/dbt46usip/image/upload/test-logo.png" }), HttpStatusCode.OK);
            var approved = await Read(await admin.PatchAsync($"/api/admin/vendors/{vendorId}/approve", null), HttpStatusCode.OK);
            var registrationCode = approved.GetProperty("registrationCode").GetString();
            var vendorSession = await Read(await anonymous.PostAsJsonAsync("/api/vendor-auth/register",
                new { registrationCode, email = "vendor@example.invalid", password = "strong-test-password" }), HttpStatusCode.OK);
            using var seller = factory.CreateClient();
            seller.DefaultRequestHeaders.Add("X-Vendor-Access-Token", vendorSession.GetProperty("accessToken").GetString());
            await Read(await seller.PutAsJsonAsync("/api/vendor-portal/logo",
                new { logoUrl = "https://res.cloudinary.com/dbt46usip/image/upload/test-logo-2.png" }), HttpStatusCode.OK);
            var profile = await anonymous.GetFromJsonAsync<JsonElement>($"/api/vendors/{vendorId}/profile");
            Assert.EndsWith("test-logo-2.png", profile.GetProperty("logoUrl").GetString());
            Assert.Equal(HttpStatusCode.Unauthorized, (await seller.PostAsJsonAsync("/api/categories",
                new { name = "Vendor cannot create categories" })).StatusCode);

            var invalidProduct = await Read(await seller.PostAsJsonAsync("/api/vendor-portal/products",
                new { name = "Test shirt", categoryId = childId, price = 30000, stock = 5,
                    attributes = new { size = "XL", origin = "Rwanda", used = false, sleeve_length = 3.5 } }), HttpStatusCode.BadRequest);
            Assert.True(invalidProduct.GetProperty("errors").TryGetProperty("attributes.size", out _));
            Assert.True(invalidProduct.GetProperty("errors").TryGetProperty("attributes.sleeve_length", out _));
            var product = await Read(await seller.PostAsJsonAsync("/api/vendor-portal/products",
                new { name = "Test shirt", categoryId = childId, price = 30000, stock = 5,
                    imageUrl = "https://res.cloudinary.com/dbt46usip/image/upload/test-product.png",
                    attributes = new { size = "M", origin = "Rwanda", used = false, sleeve_length = 0 } }), HttpStatusCode.Created);
            var productId = product.GetProperty("id").GetGuid();
            Assert.False(product.GetProperty("attributes").GetProperty("used").GetBoolean());
            await Read(await seller.PutAsJsonAsync($"/api/vendor-portal/products/{productId}",
                new { name = "Updated shirt", categoryId = childId, price = 35000, stock = 8 }), HttpStatusCode.OK);
            var publicProduct = await anonymous.GetFromJsonAsync<JsonElement>($"/api/products/{productId}");
            Assert.EndsWith("test-product.png", publicProduct.GetProperty("imageUrl").GetString());
            Assert.Equal("M", publicProduct.GetProperty("attributes").GetProperty("size").GetString());
            Assert.Equal(HttpStatusCode.BadRequest, (await admin.PostAsJsonAsync("/api/products",
                new { vendorId, name = "No category", price = 10000, stock = 5 })).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await admin.PostAsJsonAsync("/api/products",
                new { vendorId, name = "Bad attributes", categoryId = childId, price = 10000, stock = 5,
                    attributes = new { size = "M", origin = "Rwanda", used = true, sleeve_length = 10, injected = "unknown" } })).StatusCode);
            Assert.Equal(HttpStatusCode.Conflict, (await admin.DeleteAsync($"/api/categories/{categoryId}")).StatusCode);

            var typedCategory = await Read(await admin.PostAsJsonAsync("/api/categories", new
            {
                name = "Typed form", fields = new object[]
                {
                    new { key = "weight", label = "Weight", dataType = "Number", required = true, min = 0, max = 10 },
                    new { key = "made_on", label = "Manufactured", dataType = "Date", required = true },
                    new { key = "colors", label = "Colors", dataType = "MultiSelect", required = true, options = new[] { "red", "green" } },
                    new { key = "detail_image", label = "Detail", dataType = "Image", required = true }
                }
            }), HttpStatusCode.Created);
            var typedId = typedCategory.GetProperty("id").GetGuid();
            await Read(await seller.PostAsJsonAsync("/api/vendor-portal/products", new
            {
                name = "Typed product", categoryId = typedId, price = 10000, stock = 1,
                attributes = new { weight = 0.25, made_on = "2026-10-04", colors = new[] { "red", "green" },
                    detail_image = "https://example.invalid/detail.png" }
            }), HttpStatusCode.Created);
            var typedErrors = await Read(await seller.PostAsJsonAsync("/api/vendor-portal/products", new
            {
                name = "Invalid typed product", categoryId = typedId, price = 10000, stock = 1,
                attributes = new { weight = 11, made_on = "2026-02-30", colors = new[] { "red", "red" },
                    detail_image = "javascript:alert(1)" }
            }), HttpStatusCode.BadRequest);
            Assert.Equal(4, typedErrors.GetProperty("errors").EnumerateObject().Count());
            Assert.Equal(HttpStatusCode.BadRequest, (await admin.PutAsJsonAsync($"/api/categories/{categoryId}/fields", new
            {
                fields = new[] { new { key = "sleeve_length", label = "Colliding child key", dataType = "Integer" } }
            })).StatusCode);

            var secondVendor = await Read(await anonymous.PostAsJsonAsync("/api/vendors/register", new
            {
                displayName = "Other vendor", legalName = "Other Ltd", contactPhone = "+250700000004",
                contactEmail = "other-vendor@example.invalid", description = "Ownership fixture"
            }), HttpStatusCode.Created);
            var secondVendorId = secondVendor.GetProperty("id").GetGuid();
            var secondApproved = await Read(await admin.PatchAsync($"/api/admin/vendors/{secondVendorId}/approve", null), HttpStatusCode.OK);
            var secondSession = await Read(await anonymous.PostAsJsonAsync("/api/vendor-auth/register", new
            {
                registrationCode = secondApproved.GetProperty("registrationCode").GetString(),
                email = "other-vendor@example.invalid", password = "strong-other-vendor-password"
            }), HttpStatusCode.OK);
            using var otherSeller = factory.CreateClient();
            otherSeller.DefaultRequestHeaders.Add("X-Vendor-Access-Token", secondSession.GetProperty("accessToken").GetString());
            Assert.Equal(HttpStatusCode.Unauthorized, (await otherSeller.PutAsJsonAsync($"/api/vendors/{vendorId}/logo",
                new { logoUrl = "https://example.invalid/intrusion.png" })).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherSeller.PutAsJsonAsync($"/api/vendor-portal/products/{productId}",
                new { name = "Intrusion", categoryId = childId, price = 1, stock = 1 })).StatusCode);

            using var customer = factory.CreateClient();
            customer.DefaultRequestHeaders.Authorization = new("Bearer", CustomerToken(rsa, "user_customer_one"));
            var customerProfile = await Read(await customer.PostAsJsonAsync("/api/customers", new
                { username = "user_customer_one", fullName = "Customer One", phoneNumber = "+250700000002",
                    email = "customer-one@example.invalid" }), HttpStatusCode.Created);
            var customerId = customerProfile.GetProperty("id").GetGuid();
            Assert.Equal(HttpStatusCode.Forbidden, (await customer.PostAsJsonAsync("/api/customers", new
                { username = "user_impersonated", fullName = "Impersonated", phoneNumber = "+250700000003" })).StatusCode);
            using var otherCustomer = factory.CreateClient();
            otherCustomer.DefaultRequestHeaders.Authorization = new("Bearer", CustomerToken(rsa, "user_customer_two"));
            await Read(await otherCustomer.PostAsJsonAsync("/api/customers", new
                { username = "user_customer_two", fullName = "Customer Two", phoneNumber = "+250700000003",
                    email = "customer-two@example.invalid" }), HttpStatusCode.Created);
            Assert.Equal(HttpStatusCode.NotFound, (await otherCustomer.GetAsync($"/api/customers/{customerId}")).StatusCode);

            var conversation = await Read(await customer.PostAsJsonAsync("/api/chat/conversations",
                new { vendorId, productId }), HttpStatusCode.Created);
            var conversationId = conversation.GetProperty("id").GetGuid();
            await Read(await customer.PostAsJsonAsync("/api/chat/conversations", new { vendorId }), HttpStatusCode.OK);
            Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync($"/api/chat/conversations/{conversationId}/messages")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherCustomer.GetAsync($"/api/chat/conversations/{conversationId}")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherCustomer.PostAsJsonAsync(
                $"/api/chat/conversations/{conversationId}/messages", new { content = "Intrusion", clientMessageId = Guid.NewGuid() })).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await admin.GetAsync($"/api/chat/conversations/{conversationId}")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherSeller.GetAsync($"/api/chat/conversations/{conversationId}/messages")).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await otherSeller.PostAsJsonAsync(
                $"/api/chat/conversations/{conversationId}/messages", new { content = "Intrusion", clientMessageId = Guid.NewGuid() })).StatusCode);
            var clientMessageId = Guid.NewGuid();
            var sent = await Read(await customer.PostAsJsonAsync($"/api/chat/conversations/{conversationId}/messages",
                new { content = "Is it available?", clientMessageId, senderRole = "vendor", senderId = vendorId }), HttpStatusCode.Created);
            Assert.Equal("customer", sent.GetProperty("senderRole").GetString());
            Assert.Equal("user_customer_one", sent.GetProperty("senderId").GetString());
            var messageId = sent.GetProperty("id").GetInt64();
            await Read(await customer.PostAsJsonAsync($"/api/chat/conversations/{conversationId}/messages",
                new { content = "Is it available?", clientMessageId }), HttpStatusCode.OK);
            Assert.Equal(HttpStatusCode.Conflict, (await customer.PostAsJsonAsync($"/api/chat/conversations/{conversationId}/messages",
                new { content = "Different text", clientMessageId })).StatusCode);
            var sellerInbox = await seller.GetFromJsonAsync<JsonElement>("/api/chat/conversations");
            Assert.Equal(1, sellerInbox.GetProperty("items")[0].GetProperty("unreadCount").GetInt32());
            await Read(await seller.PutAsJsonAsync($"/api/chat/conversations/{conversationId}/read",
                new { messageId }), HttpStatusCode.OK);
            var reply = await Read(await seller.PostAsJsonAsync($"/api/chat/conversations/{conversationId}/messages",
                new { content = "Yes, it is.", clientMessageId = Guid.NewGuid() }), HttpStatusCode.Created);
            Assert.Equal("vendor", reply.GetProperty("senderRole").GetString());
            var page = await customer.GetFromJsonAsync<JsonElement>(
                $"/api/chat/conversations/{conversationId}/messages?limit=1");
            Assert.True(page.GetProperty("hasMore").GetBoolean());
            Assert.Equal("Yes, it is.", page.GetProperty("items")[0].GetProperty("content").GetString());
            var older = await customer.GetFromJsonAsync<JsonElement>(
                $"/api/chat/conversations/{conversationId}/messages?beforeId={reply.GetProperty("id").GetInt64()}");
            Assert.Single(older.GetProperty("items").EnumerateArray());
            Assert.Equal(HttpStatusCode.BadRequest, (await customer.PutAsJsonAsync(
                $"/api/chat/conversations/{conversationId}/read", new { messageId = 99999999 })).StatusCode);
            using var forgedCustomer = factory.CreateClient();
            using var wrongRsa = RSA.Create(2048);
            forgedCustomer.DefaultRequestHeaders.Authorization = new("Bearer", CustomerToken(wrongRsa, "user_customer_one"));
            Assert.Equal(HttpStatusCode.Unauthorized, (await forgedCustomer.GetAsync("/api/chat/me")).StatusCode);
            using var wrongOrigin = factory.CreateClient();
            wrongOrigin.DefaultRequestHeaders.Authorization = new("Bearer", CustomerToken(rsa, "user_customer_one", "https://evil.invalid"));
            Assert.Equal(HttpStatusCode.Unauthorized, (await wrongOrigin.GetAsync("/api/chat/me")).StatusCode);

            // Concurrent retries must create exactly one message.
            var concurrentId = Guid.NewGuid();
            var retries = await Task.WhenAll(Enumerable.Range(0, 3).Select(_ =>
                customer.PostAsJsonAsync($"/api/chat/conversations/{conversationId}/messages",
                    new { content = "Retry-safe message", clientMessageId = concurrentId })));
            Assert.All(retries, response => Assert.Contains(response.StatusCode, new[] { HttpStatusCode.OK, HttpStatusCode.Created }));
            var persisted = await customer.GetFromJsonAsync<JsonElement>(
                $"/api/chat/conversations/{conversationId}/messages?afterId={messageId}");
            Assert.Equal(1, persisted.GetProperty("items").EnumerateArray().Count(m =>
                m.GetProperty("clientMessageId").GetGuid() == concurrentId));
            var schema = await anonymous.GetFromJsonAsync<JsonElement>("/swagger/v1/swagger.json");
            Assert.True(schema.GetProperty("paths").TryGetProperty("/api/chat/conversations", out _));
            Assert.True(schema.GetProperty("components").GetProperty("schemas").TryGetProperty("ChatMessagePageDto", out _));
            Assert.True(schema.GetProperty("components").GetProperty("schemas").TryGetProperty("AdminSessionDto", out _));
            var fieldTypeSchema = schema.GetProperty("components").GetProperty("schemas").GetProperty("CategoryFieldType");
            Assert.Equal("string", fieldTypeSchema.GetProperty("type").GetString());
            Assert.Contains(fieldTypeSchema.GetProperty("enum").EnumerateArray(), type => type.GetString() == "MultiSelect");
            Assert.Equal(HttpStatusCode.NoContent, (await admin.DeleteAsync("/api/customers/by-username/user_customer_one")).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await customer.GetAsync("/api/chat/me")).StatusCode);
            var retainedHistory = await seller.GetFromJsonAsync<JsonElement>(
                $"/api/chat/conversations/{conversationId}/messages");
            Assert.Equal(3, retainedHistory.GetProperty("items").GetArrayLength());
        }
        finally
        {
            foreach (var entry in previous) Environment.SetEnvironmentVariable(entry.Key, entry.Value);
        }
    }

    private static string CustomerToken(RSA rsa, string subject, string origin = "http://localhost:3000")
    {
        var now = DateTime.UtcNow;
        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken(
            "https://clerk.integration.invalid", null,
            [new Claim("sub", subject), new Claim("azp", origin)], now, now.AddMinutes(5),
            new SigningCredentials(new RsaSecurityKey(rsa), SecurityAlgorithms.RsaSha256)));
    }

    private static async Task<JsonElement> Read(HttpResponseMessage response, HttpStatusCode expected)
    {
        var body = await response.Content.ReadAsStringAsync();
        Assert.True(response.StatusCode == expected, $"Expected {expected}, got {response.StatusCode}: {body}");
        return JsonDocument.Parse(body).RootElement.Clone();
    }
}
