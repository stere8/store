// EstorePoC/EStore.Api/Models/Review.cs
namespace EStore.Api.Models;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid ProductId { get; set; }
    public Guid CustomerId { get; set; }

    public int Rating { get; set; }                  // 1-5 scale
    public string? Title { get; set; }               // Headline
    public string? Comment { get; set; }             // Body
    public bool IsPublished { get; set; } = true;   // Moderation flag

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset? UpdatedAt { get; set; }

    // Navigation
    public Product Product { get; set; } = default!;
    public Customer Customer { get; set; } = default!;
}