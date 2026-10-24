using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Cryptography;
using System.Text.Json;
using EStore.Api.DTOs;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace EStore.Api.Tests;

public sealed class VendorProfileTests
{
    [Fact]
    public void ProfileEditPreservesAccountOwnershipApprovalAndExistingImage()
    {
        var id = Guid.NewGuid();
        var vendor = new Vendor { Id = id, TenantId = "original", DisplayName = "Old", LegalName = "Old Ltd",
            ContactPhone = "old", LogoUrl = "https://example.invalid/old.png", RegistrationCode = "private-code",
            AccountEmail = "login@example.invalid", PasswordHash = "hash", PasswordSalt = "salt", Verified = true, Active = false };
        var created = vendor.CreatedAt;
        VendorProfileService.Apply(vendor, new(" New ", " New Ltd ", " +250700000001 ", " CONTACT@EXAMPLE.INVALID "));
        Assert.Equal("New", vendor.DisplayName);
        Assert.Equal("contact@example.invalid", vendor.ContactEmail);
        Assert.Equal("https://example.invalid/old.png", vendor.LogoUrl);
        Assert.Equal(id, vendor.Id);
        Assert.Equal("original", vendor.TenantId);
        Assert.Equal("login@example.invalid", vendor.AccountEmail);
        Assert.Equal("hash", vendor.PasswordHash);
        Assert.Equal("salt", vendor.PasswordSalt);
        Assert.Equal("private-code", vendor.RegistrationCode);
        Assert.True(vendor.Verified);
        Assert.False(vendor.Active);
        Assert.Equal(created, vendor.CreatedAt);
        VendorProfileService.Apply(vendor, new("New", "New Ltd", "phone", LogoUrl: ""));
        Assert.Null(vendor.LogoUrl);
    }

    [Theory]
    [InlineData("", "Name", "phone", null, null)]
    [InlineData("Name", "", "phone", null, null)]
    [InlineData("Name", "Name", "", null, null)]
    [InlineData("Name", "Name", "phone", "not-an-email", null)]
    [InlineData("Name", "Name", "phone", "Name <email@example.com>", null)]
    [InlineData("Name", "Name", "phone", null, "http://example.com/logo.png")]
    public void InvalidProfileValuesAreRejected(string display, string legal, string phone, string? email, string? logo)
    {
        Assert.NotEmpty(VendorProfileService.Validate(new(display, legal, phone, email, LogoUrl: logo)));
    }

    [Fact]
    public void OptionalFieldsCanBeClearedAndLimitsAreEnforced()
    {
        Assert.Empty(VendorProfileService.Validate(new("Name", "Legal", "phone", "")));
        Assert.NotEmpty(VendorProfileService.Validate(new(new string('x', 161), "Legal", "phone")));
        Assert.NotEmpty(VendorProfileService.Validate(new("Name", new string('x', 181), "phone")));
        Assert.NotEmpty(VendorProfileService.Validate(new("Name", "Legal", new string('x', 33))));
        Assert.NotEmpty(VendorProfileService.Validate(new("Name", "Legal", "phone", Description: new string('x', 10001))));
    }

    [PostgresFact]
    public async Task OnlyTenantAdministratorCanEditAndUnknownAccountFieldsDoNotChangeCredentials()
    {
        var settings = new Dictionary<string, string?> {
            ["DATABASE_URL"] = Environment.GetEnvironmentVariable("ESTORE_TEST_DATABASE_URL"), ["SEED_DEMO_DATA"] = "false",
            ["ADMIN_EMAIL"] = "profile-admin@example.invalid", ["ADMIN_LOGIN_CODE"] = "profile-admin-code",
            ["ADMIN_TOKEN_SECRET"] = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48)) };
        var previous = settings.Keys.ToDictionary(key => key, Environment.GetEnvironmentVariable);
        foreach (var item in settings) Environment.SetEnvironmentVariable(item.Key, item.Value);
        try
        {
            using var factory = new WebApplicationFactory<Program>();
            using var anonymous = factory.CreateClient();
            using var admin = factory.CreateClient();
            var session = await Read(await admin.PostAsJsonAsync("/api/admin-auth/login", new { email = settings["ADMIN_EMAIL"], code = settings["ADMIN_LOGIN_CODE"] }), HttpStatusCode.OK);
            admin.DefaultRequestHeaders.Authorization = new("Bearer", session.GetProperty("accessToken").GetString());
            var suffix = Guid.NewGuid().ToString("N");
            var vendor = await Read(await anonymous.PostAsJsonAsync("/api/vendors/register", new { displayName = "Profile " + suffix,
                legalName = "Original Ltd " + suffix, contactPhone = "+250700000009", contactEmail = suffix + "@example.invalid" }), HttpStatusCode.Created);
            var id = vendor.GetProperty("id").GetGuid();
            var approved = await Read(await admin.PatchAsync($"/api/admin/vendors/{id}/approve", null), HttpStatusCode.OK);
            var code = approved.GetProperty("registrationCode").GetString();
            var accountEmail = "login-" + suffix + "@example.invalid";
            var account = await Read(await anonymous.PostAsJsonAsync("/api/vendor-auth/register", new { registrationCode = code, email = accountEmail, password = "profile-vendor-password" }), HttpStatusCode.OK);
            using var seller = factory.CreateClient();
            seller.DefaultRequestHeaders.Add("X-Vendor-Access-Token", account.GetProperty("accessToken").GetString());
            var payload = new { displayName = "Updated store", legalName = "Updated legal", contactPhone = "+250700000010",
                contactEmail = "updated-" + suffix + "@example.invalid", accountEmail = "intrusion@example.invalid", passwordHash = "intrusion", verified = false, active = false, tenantId = "chic-complex" };
            Assert.Equal(HttpStatusCode.Unauthorized, (await anonymous.PutAsJsonAsync($"/api/vendors/{id}", payload)).StatusCode);
            Assert.Equal(HttpStatusCode.Unauthorized, (await seller.PutAsJsonAsync($"/api/vendors/{id}", payload)).StatusCode);
            using var crossTenant = factory.CreateClient();
            crossTenant.DefaultRequestHeaders.Authorization = admin.DefaultRequestHeaders.Authorization;
            crossTenant.DefaultRequestHeaders.Add("X-Tenant-Id", "chic-complex");
            Assert.Equal(HttpStatusCode.Forbidden, (await crossTenant.PutAsJsonAsync($"/api/vendors/{id}", payload)).StatusCode);
            var edited = await Read(await admin.PutAsJsonAsync($"/api/vendors/{id}", payload), HttpStatusCode.OK);
            Assert.Equal("Updated store", edited.GetProperty("displayName").GetString());
            Assert.Equal(accountEmail, edited.GetProperty("accountEmail").GetString());
            Assert.True(edited.GetProperty("active").GetBoolean());
            Assert.True(edited.GetProperty("verified").GetBoolean());
            Assert.False(edited.TryGetProperty("passwordHash", out _));
            await Read(await anonymous.PostAsJsonAsync("/api/vendor-auth/login", new { email = accountEmail, password = "profile-vendor-password" }), HttpStatusCode.OK);
            Assert.Equal(HttpStatusCode.BadRequest, (await admin.PutAsJsonAsync($"/api/vendors/{id}", new { displayName = "Store", legalName = "Legal", contactPhone = "Phone", locationId = Guid.NewGuid() })).StatusCode);
            Assert.Equal(HttpStatusCode.NotFound, (await admin.PutAsJsonAsync($"/api/vendors/{Guid.NewGuid()}", payload)).StatusCode);
            await Read(await anonymous.PostAsJsonAsync("/api/vendors/register", new { displayName = "Other " + suffix, legalName = "Other " + suffix, contactPhone = "phone", contactEmail = "occupied-" + suffix + "@example.invalid" }), HttpStatusCode.Created);
            Assert.Equal(HttpStatusCode.Conflict, (await admin.PutAsJsonAsync($"/api/vendors/{id}", new { displayName = "Store", legalName = "Legal", contactPhone = "Phone", contactEmail = "OCCUPIED-" + suffix + "@example.invalid" })).StatusCode);
        }
        finally { foreach (var item in previous) Environment.SetEnvironmentVariable(item.Key, item.Value); }
    }

    private static async Task<JsonElement> Read(HttpResponseMessage response, HttpStatusCode status)
    {
        var body = await response.Content.ReadAsStringAsync();
        Assert.True(response.StatusCode == status, $"Expected {status}, got {response.StatusCode}: {body}");
        return JsonDocument.Parse(body).RootElement.Clone();
    }
}
