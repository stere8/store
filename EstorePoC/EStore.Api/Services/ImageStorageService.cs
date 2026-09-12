using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace EStore.Api.Services;

public sealed class ImageStorageService
{
    private readonly HttpClient _httpClient;
    private readonly CloudinarySettings? _settings;

    public ImageStorageService(HttpClient httpClient, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _settings = CloudinarySettings.TryCreate(configuration);
    }

    public bool IsConfigured => _settings is not null;

    public async Task<ImageUploadResult> UploadImageAsync(IFormFile file, CancellationToken cancellationToken)
    {
        if (_settings is null)
        {
            throw new InvalidOperationException(
                "Cloudinary is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
        }

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
        var publicId = $"product-{Guid.NewGuid():N}";
        var signature = BuildSignature(
            new SortedDictionary<string, string>
            {
                ["folder"] = _settings.UploadFolder,
                ["public_id"] = publicId,
                ["timestamp"] = timestamp
            },
            _settings.ApiSecret);

        using var content = new MultipartFormDataContent
        {
            { new StringContent(_settings.ApiKey), "api_key" },
            { new StringContent(timestamp), "timestamp" },
            { new StringContent(_settings.UploadFolder), "folder" },
            { new StringContent(publicId), "public_id" },
            { new StringContent(signature), "signature" }
        };

        await using var stream = file.OpenReadStream();
        using var fileContent = new StreamContent(stream);
        fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
        content.Add(fileContent, "file", Path.GetFileName(file.FileName));

        using var response = await _httpClient.PostAsync(_settings.UploadUrl, content, cancellationToken);
        var body = await response.Content.ReadAsStringAsync(cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            throw new InvalidOperationException($"Cloudinary upload failed with status {(int)response.StatusCode}: {body}");
        }

        using var document = JsonDocument.Parse(body);
        var root = document.RootElement;

        var secureUrl = root.GetProperty("secure_url").GetString();
        if (string.IsNullOrWhiteSpace(secureUrl))
        {
            throw new InvalidOperationException("Cloudinary upload response did not include secure_url.");
        }

        var uploadedPublicId = root.TryGetProperty("public_id", out var publicIdProperty)
            ? publicIdProperty.GetString() ?? publicId
            : publicId;

        return new ImageUploadResult(secureUrl, uploadedPublicId, "cloudinary");
    }

    private static string BuildSignature(SortedDictionary<string, string> parameters, string apiSecret)
    {
        var payload = string.Join('&', parameters.Select(x => $"{x.Key}={x.Value}")) + apiSecret;
        var hash = SHA1.HashData(Encoding.UTF8.GetBytes(payload));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    private sealed record CloudinarySettings(
        string CloudName,
        string ApiKey,
        string ApiSecret,
        string UploadFolder)
    {
        public string UploadUrl => $"https://api.cloudinary.com/v1_1/{CloudName}/image/upload";

        public static CloudinarySettings? TryCreate(IConfiguration configuration)
        {
            var uploadFolder = configuration["CLOUDINARY_UPLOAD_FOLDER"]?.Trim();
            if (string.IsNullOrWhiteSpace(uploadFolder))
            {
                uploadFolder = "estore/products";
            }

            var cloudinaryUrl = configuration["CLOUDINARY_URL"]?.Trim();
            if (!string.IsNullOrWhiteSpace(cloudinaryUrl) &&
                Uri.TryCreate(cloudinaryUrl, UriKind.Absolute, out var uri) &&
                uri.Scheme.Equals("cloudinary", StringComparison.OrdinalIgnoreCase))
            {
                var credentials = uri.UserInfo.Split(':', 2);
                if (credentials.Length == 2 &&
                    !string.IsNullOrWhiteSpace(credentials[0]) &&
                    !string.IsNullOrWhiteSpace(credentials[1]) &&
                    !string.IsNullOrWhiteSpace(uri.Host))
                {
                    return new CloudinarySettings(
                        uri.Host,
                        Uri.UnescapeDataString(credentials[0]),
                        Uri.UnescapeDataString(credentials[1]),
                        uploadFolder);
                }
            }

            var cloudName = configuration["CLOUDINARY_CLOUD_NAME"]?.Trim();
            var apiKey = configuration["CLOUDINARY_API_KEY"]?.Trim();
            var apiSecret = configuration["CLOUDINARY_API_SECRET"]?.Trim();

            return string.IsNullOrWhiteSpace(cloudName) ||
                   string.IsNullOrWhiteSpace(apiKey) ||
                   string.IsNullOrWhiteSpace(apiSecret)
                ? null
                : new CloudinarySettings(cloudName, apiKey, apiSecret, uploadFolder);
        }
    }
}

public sealed record ImageUploadResult(string Url, string PublicId, string Provider);
