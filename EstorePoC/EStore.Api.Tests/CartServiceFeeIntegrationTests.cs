using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text.Json;
using EStore.Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using Xunit;

namespace EStore.Api.Tests;

public sealed class CartServiceFeeIntegrationTests
{
    private sealed class Factory : WebApplicationFactory<Program>
    {
        protected override void ConfigureClient(HttpClient client)
        {
            base.ConfigureClient(client);
            client.DefaultRequestHeaders.Add("X-Tenant-Id", "chic-complex");
        }
    }

    [PostgresFact]
    public async Task QuotesWholeCartOnceAcrossVendorsUsingTrustedPricesAndEnforcesOwnership()
    {
        using var rsa = RSA.Create(2048);
        var settings = new Dictionary<string, string?> {
            ["DATABASE_URL"] = Environment.GetEnvironmentVariable("ESTORE_TEST_DATABASE_URL"),
            ["SEED_DEMO_DATA"] = "false", ["ADMIN_TENANT_ID"] = "chic-complex",
            ["ADMIN_EMAIL"] = "cart-fee-admin@example.invalid", ["ADMIN_LOGIN_CODE"] = "cart-fee-admin-test-code",
            ["ADMIN_TOKEN_SECRET"] = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48)),
            ["CLERK_JWT_ISSUER"] = "https://cart-fee.integration.invalid", ["CLERK_JWT_KEY"] = rsa.ExportSubjectPublicKeyInfoPem(),
            ["CLERK_AUTHORIZED_PARTIES"] = "http://localhost:3000" };
        var previous = settings.Keys.ToDictionary(key => key, Environment.GetEnvironmentVariable);
        foreach (var item in settings) Environment.SetEnvironmentVariable(item.Key, item.Value);
        try
        {
            using var factory = new Factory();
            using var anonymous = factory.CreateClient();
            var preview = await Read(await anonymous.GetAsync("/api/service-fees/calculate?amount=100000"), HttpStatusCode.OK);
            Assert.Equal(1000, preview.GetProperty("serviceFeeAmount").GetDecimal());
            Assert.Equal(101000, preview.GetProperty("totalAmount").GetDecimal());
            Assert.Equal("cart", preview.GetProperty("calculatedPer").GetString());
            Assert.Equal(HttpStatusCode.NotFound, (await anonymous.GetAsync("/api/platform-fees/calculate?amount=100000")).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await anonymous.GetAsync("/api/service-fees/calculate?amount=-1")).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await anonymous.GetAsync("/api/service-fees/calculate?amount=1.5")).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await anonymous.GetAsync("/api/service-fees/calculate?amount=100&percentage=2")).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await anonymous.GetAsync("/api/service-fees/calculate")).StatusCode);
            using var admin = factory.CreateClient();
            var login = await Read(await admin.PostAsJsonAsync("/api/admin-auth/login", new { email = settings["ADMIN_EMAIL"], code = settings["ADMIN_LOGIN_CODE"] }), HttpStatusCode.OK);
            admin.DefaultRequestHeaders.Authorization = new("Bearer", login.GetProperty("accessToken").GetString());
            var suffix = Guid.NewGuid().ToString("N");
            var category = await Read(await admin.PostAsJsonAsync("/api/categories", new { name = "Cart-fee-" + suffix }), HttpStatusCode.Created);
            var categoryId = category.GetProperty("id").GetGuid();
            var vendorA = await Vendor(anonymous, "cart-fee-a-" + suffix);
            var vendorB = await Vendor(anonymous, "cart-fee-b-" + suffix);
            var productA = await Product(admin, vendorA, categoryId, "Cart A", 50);
            var productB = await Product(admin, vendorB, categoryId, "Cart B", 50);
            using var customer = factory.CreateClient();
            customer.DefaultRequestHeaders.Authorization = new("Bearer", Token(rsa, "user_cart_fee_one_" + suffix));
            var profile = await Read(await customer.PostAsJsonAsync("/api/customers", new {
                username = "user_cart_fee_one_" + suffix, fullName = "Cart Customer One", phoneNumber = "+250700200001",
                email = "cart-fee-one-" + suffix + "@example.invalid" }), HttpStatusCode.Created);
            using var other = factory.CreateClient();
            other.DefaultRequestHeaders.Authorization = new("Bearer", Token(rsa, "user_cart_fee_two_" + suffix));
            await Read(await other.PostAsJsonAsync("/api/customers", new {
                username = "user_cart_fee_two_" + suffix, fullName = "Cart Customer Two", phoneNumber = "+250700200002",
                email = "cart-fee-two-" + suffix + "@example.invalid" }), HttpStatusCode.Created);
            var cart = await Read(await customer.PostAsJsonAsync("/api/carts/ensure", new { customerId = profile.GetProperty("id").GetGuid() }), HttpStatusCode.OK);
            var cartId = cart.GetProperty("id").GetGuid();
            var route = $"/api/carts/{cartId}/service-fee";
            var empty = await Read(await customer.GetAsync(route), HttpStatusCode.OK);
            Assert.Equal(0, empty.GetProperty("serviceFeeAmount").GetDecimal());
            await Read(await customer.PostAsJsonAsync($"/api/carts/{cartId}/items", new { productId = productA, quantity = 1 }), HttpStatusCode.OK);
            await Read(await customer.PostAsJsonAsync($"/api/carts/{cartId}/items", new { productId = productB, quantity = 1 }), HttpStatusCode.OK);
            var before = await customer.GetStringAsync($"/api/carts/{cartId}");
            var quote = await Read(await customer.GetAsync(route), HttpStatusCode.OK);
            Assert.Equal(cartId, quote.GetProperty("cartId").GetGuid());
            Assert.Equal(100, quote.GetProperty("subtotal").GetDecimal());
            Assert.Equal(1, quote.GetProperty("serviceFeeAmount").GetDecimal());
            Assert.Equal(101, quote.GetProperty("totalAmount").GetDecimal());
            Assert.Equal(before, await customer.GetStringAsync($"/api/carts/{cartId}"));
            var privateResponse = await customer.GetAsync(route);
            Assert.True(privateResponse.Headers.CacheControl?.NoStore);
            Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.GetAsync(route)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await other.GetAsync(route)).StatusCode);
            await Read(await admin.GetAsync(route), HttpStatusCode.OK);
            using var crossTenant = factory.CreateClient();
            crossTenant.DefaultRequestHeaders.Remove("X-Tenant-Id");
            crossTenant.DefaultRequestHeaders.Add("X-Tenant-Id", "kigali-city-mall");
            crossTenant.DefaultRequestHeaders.Authorization = admin.DefaultRequestHeaders.Authorization;
            Assert.Equal(HttpStatusCode.Forbidden, (await crossTenant.GetAsync(route)).StatusCode);
            await Read(await customer.PostAsJsonAsync($"/api/carts/{cartId}/items", new { productId = productA, quantity = 1 }), HttpStatusCode.OK);
            var quantityQuote = await Read(await customer.GetAsync(route), HttpStatusCode.OK);
            Assert.Equal(150, quantityQuote.GetProperty("subtotal").GetDecimal());
            Assert.Equal(2, quantityQuote.GetProperty("serviceFeeAmount").GetDecimal());
            await Read(await admin.PutAsJsonAsync($"/api/products/{productA}", new { vendorId = vendorA, name = "Cart A", categoryId, price = 100, stock = 100 }), HttpStatusCode.OK);
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.CurrentTenantId = "chic-complex";
                var item = await db.ShoppingCartItems.FirstAsync(i => i.ShoppingCartId == cartId && i.ProductId == productA);
                item.UnitPrice = 1;
                item.LineTotal = 1;
                await db.SaveChangesAsync();
            }
            var trusted = await Read(await customer.GetAsync(route + "?amount=1&percentage=100"), HttpStatusCode.OK);
            Assert.Equal(250, trusted.GetProperty("subtotal").GetDecimal());
            Assert.Equal(1, trusted.GetProperty("serviceFeePercentage").GetDecimal());
            Assert.Equal(3, trusted.GetProperty("serviceFeeAmount").GetDecimal());
            Assert.Equal(253, trusted.GetProperty("totalAmount").GetDecimal());
            await Read(await admin.PatchAsync($"/api/admin/products/{productA}/deactivate", null), HttpStatusCode.OK);
            Assert.Equal(HttpStatusCode.Conflict, (await customer.GetAsync(route)).StatusCode);
            Assert.Equal(HttpStatusCode.NoContent, (await customer.DeleteAsync($"/api/carts/{cartId}/items/{productA}")).StatusCode);
            var remaining = await Read(await customer.GetAsync(route), HttpStatusCode.OK);
            Assert.Equal(50, remaining.GetProperty("subtotal").GetDecimal());
            Assert.Equal(1, remaining.GetProperty("serviceFeeAmount").GetDecimal());
            using (var scope = factory.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                db.CurrentTenantId = "chic-complex";
                var saved = await db.ShoppingCarts.FirstAsync(c => c.Id == cartId);
                saved.IsActive = false;
                await db.SaveChangesAsync();
            }
            Assert.Equal(HttpStatusCode.NotFound, (await customer.GetAsync(route)).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await customer.GetAsync($"/api/carts/{Guid.NewGuid()}/service-fee")).StatusCode);
            var swagger = await anonymous.GetFromJsonAsync<JsonElement>("/swagger/v1/swagger.json");
            Assert.True(swagger.GetProperty("paths").TryGetProperty("/api/carts/{cartId}/service-fee", out _));
            Assert.False(swagger.GetProperty("paths").TryGetProperty("/api/platform-fees/calculate", out _));
        }
        finally { foreach (var entry in previous) Environment.SetEnvironmentVariable(entry.Key, entry.Value); }
    }

    private static async Task<Guid> Vendor(HttpClient client, string name)
    {
        var result = await Read(await client.PostAsJsonAsync("/api/vendors/register", new {
            displayName = name, legalName = name + " Ltd", contactPhone = "+250700200003", contactEmail = name + "@example.invalid" }), HttpStatusCode.Created);
        return result.GetProperty("id").GetGuid();
    }

    private static async Task<Guid> Product(HttpClient admin, Guid vendorId, Guid categoryId, string name, decimal price)
    {
        var result = await Read(await admin.PostAsJsonAsync("/api/products", new { vendorId, categoryId, name, price, stock = 100 }), HttpStatusCode.Created);
        return result.GetProperty("id").GetGuid();
    }

    private static string Token(RSA rsa, string subject)
    {
        var now = DateTime.UtcNow;
        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityToken("https://cart-fee.integration.invalid", null,
            [new Claim("sub", subject), new Claim("azp", "http://localhost:3000")], now, now.AddMinutes(30),
            new SigningCredentials(new RsaSecurityKey(rsa), SecurityAlgorithms.RsaSha256)));
    }

    private static async Task<JsonElement> Read(HttpResponseMessage response, HttpStatusCode expected)
    {
        var body = await response.Content.ReadAsStringAsync();
        Assert.True(response.StatusCode == expected, $"Expected {expected}, got {response.StatusCode}: {body}");
        return JsonDocument.Parse(body).RootElement.Clone();
    }
}
