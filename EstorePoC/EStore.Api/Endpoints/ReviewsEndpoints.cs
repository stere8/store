using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class ReviewsEndpoints
{
    public static RouteGroupBuilder MapReviewsEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/", AddReview);
        group.MapGet("/product/{productId:guid}", GetProductReviews);

        return group;
    }

    // -------------------------------------------------------------
    // 1️⃣ Add Review for a Product
    // -------------------------------------------------------------
    private static async Task<IResult> AddReview(AppDbContext db, CreateReviewDto dto)
    {
        var tenant = db.CurrentTenantId!;

        // Validate product exists
        var product = await db.Products
            .FirstOrDefaultAsync(p => p.Id == dto.ProductId && p.TenantId == tenant);

        if (product is null)
            return Results.BadRequest(new { error = "Product not found for this tenant." });

        // Validate customer exists
        var customer = await db.Customers
            .FirstOrDefaultAsync(c => c.Id == dto.CustomerId && c.TenantId == tenant);

        if (customer is null)
            return Results.BadRequest(new { error = "Customer not found for this tenant." });

        // Check for duplicate review (tenant + product + customer)
        var exists = await db.Reviews.AnyAsync(r =>
            r.TenantId == tenant &&
            r.ProductId == dto.ProductId &&
            r.CustomerId == dto.CustomerId);

        if (exists)
            return Results.BadRequest(new { error = "Customer already reviewed this product." });

        var review = new Review
        {
            Id = Guid.NewGuid(),
            TenantId = tenant,
            ProductId = dto.ProductId,
            CustomerId = dto.CustomerId,
            Rating = dto.Rating,
            Title = dto.Title,
            Comment = dto.Comment,
            CreatedAt = DateTimeOffset.UtcNow,
            IsPublished = true // no moderation for now
        };

        db.Reviews.Add(review);
        await db.SaveChangesAsync();

        return Results.Created($"/api/reviews/{review.Id}", review);
    }

    // -------------------------------------------------------------
    // 2️⃣ Get Reviews for a Product
    // -------------------------------------------------------------
    private static async Task<IResult> GetProductReviews(AppDbContext db, Guid productId)
    {
        var tenant = db.CurrentTenantId!;

        var reviews = await db.Reviews
            .Where(r => r.TenantId == tenant && r.ProductId == productId && r.IsPublished)
            .OrderByDescending(r => r.CreatedAt)
            .Select(r => new ReviewResultDto(
                r.Id,
                r.Rating,
                r.Title,
                r.Comment,
                r.CreatedAt,
                r.CustomerId
            ))
            .ToListAsync();

        return Results.Ok(reviews);
    }
}

// ---------------------------------------------------------------------------
// DTOs
// ---------------------------------------------------------------------------

public record CreateReviewDto(
    Guid ProductId,
    Guid CustomerId,
    int Rating,
    string? Title,
    string? Comment);

public record ReviewResultDto(
    Guid Id,
    int Rating,
    string? Title,
    string? Comment,
    DateTimeOffset CreatedAt,
    Guid CustomerId);
