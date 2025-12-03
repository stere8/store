namespace EStore.Api.Models;

public class Review
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid ProductId { get; set; }
    public Guid CustomerId { get; set; }

    public int Rating { get; set; } // 1..5
    public string? Title { get; set; }
    public string? Comment { get; set; }
    public bool IsPublished { get; set; } = true;

    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;

    public Product? Product { get; set; }
    public Customer? Customer { get; set; }
}
