using EStore.Api.Services;
using Microsoft.AspNetCore.Mvc;
using EStore.Api.Data;

namespace EStore.Api.Endpoints;

public static class UploadsEndpoints
{
    private const long MaxImageBytes = 5 * 1024 * 1024;

    private static readonly HashSet<string> AllowedImageTypes = new(StringComparer.OrdinalIgnoreCase)
    {
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif"
    };

    public static RouteGroupBuilder MapUploadsEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/images", UploadImage)
            .Accepts<IFormFile>("multipart/form-data")
            .Produces<ImageUploadResult>()
            .Produces(StatusCodes.Status400BadRequest)
            .Produces(StatusCodes.Status503ServiceUnavailable)
            .Produces(StatusCodes.Status401Unauthorized)
            .Produces(StatusCodes.Status502BadGateway)
            .DisableAntiforgery();

        return group;
    }

    private static async Task<IResult> UploadImage(
        HttpContext context,
        AppDbContext db,
        VendorAuthService vendorAuth,
        [FromForm] IFormFile? file,
        ImageStorageService imageStorageService,
        CancellationToken cancellationToken)
    {
        if (!await StoreIdentity.IsAdminAsync(context) &&
            await VendorAuthEndpoints.ResolveVendorAsync(context, db, vendorAuth) is null)
            return Results.Unauthorized();

        if (file is null || file.Length == 0)
        {
            return Results.BadRequest(new { error = "Image file is required." });
        }

        if (file.Length > MaxImageBytes)
        {
            return Results.BadRequest(new { error = "Image file must be 5 MB or smaller." });
        }

        if (!AllowedImageTypes.Contains(file.ContentType))
        {
            return Results.BadRequest(new { error = "Only JPEG, PNG, WebP, GIF, or AVIF images are supported." });
        }

        if (!imageStorageService.IsConfigured)
        {
            return Results.Problem(
                "Image upload storage is not configured. Set the Cloudinary environment variables before uploading images.",
                statusCode: StatusCodes.Status503ServiceUnavailable);
        }

        try
        {
            var upload = await imageStorageService.UploadImageAsync(file, cancellationToken);
            return Results.Ok(upload);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Problem(
                ex.Message,
                statusCode: StatusCodes.Status502BadGateway);
        }
    }
}
