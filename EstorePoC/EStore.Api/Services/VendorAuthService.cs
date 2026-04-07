using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.WebUtilities;

namespace EStore.Api.Services;

public sealed class VendorAuthService(IDataProtectionProvider dataProtectionProvider)
{
    private static readonly TimeSpan AccessTokenLifetime = TimeSpan.FromDays(14);
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);
    private readonly IDataProtector protector =
        dataProtectionProvider.CreateProtector("EStore.Api.VendorAccessToken.v1");

    public VendorPasswordHash HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(
            password,
            salt,
            120_000,
            HashAlgorithmName.SHA256,
            32);

        return new VendorPasswordHash(
            Convert.ToBase64String(hash),
            Convert.ToBase64String(salt));
    }

    public string CreateRegistrationCode() =>
        Convert.ToHexString(RandomNumberGenerator.GetBytes(6));

    public bool VerifyPassword(string password, string? passwordHash, string? passwordSalt)
    {
        if (string.IsNullOrWhiteSpace(passwordHash) || string.IsNullOrWhiteSpace(passwordSalt))
        {
            return false;
        }

        try
        {
            var hash = Convert.FromBase64String(passwordHash);
            var salt = Convert.FromBase64String(passwordSalt);
            var computed = Rfc2898DeriveBytes.Pbkdf2(
                password,
                salt,
                120_000,
                HashAlgorithmName.SHA256,
                hash.Length);

            return CryptographicOperations.FixedTimeEquals(hash, computed);
        }
        catch (FormatException)
        {
            return false;
        }
    }

    public string CreateAccessToken(Guid vendorId, string tenantId, string email)
    {
        var payload = new VendorAccessTokenPayload(
            vendorId,
            tenantId,
            email,
            DateTimeOffset.UtcNow);

        var json = JsonSerializer.Serialize(payload, JsonOptions);
        var protectedPayload = protector.Protect(json);
        return WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(protectedPayload));
    }

    public VendorAccessTokenPayload? ReadAccessToken(string? accessToken, string tenantId)
    {
        if (string.IsNullOrWhiteSpace(accessToken))
        {
            return null;
        }

        try
        {
            var protectedPayload = Encoding.UTF8.GetString(
                WebEncoders.Base64UrlDecode(accessToken));
            var json = protector.Unprotect(protectedPayload);
            var payload = JsonSerializer.Deserialize<VendorAccessTokenPayload>(json, JsonOptions);

            if (payload is null ||
                payload.TenantId != tenantId ||
                payload.IssuedAt.Add(AccessTokenLifetime) < DateTimeOffset.UtcNow)
            {
                return null;
            }

            return payload;
        }
        catch
        {
            return null;
        }
    }
}

public sealed record VendorPasswordHash(string PasswordHash, string PasswordSalt);

public sealed record VendorAccessTokenPayload(
    Guid VendorId,
    string TenantId,
    string Email,
    DateTimeOffset IssuedAt
);
