namespace EStore.Api.Models;

public class ChatConversation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string TenantId { get; set; } = default!;
    public Guid VendorId { get; set; }
    public Vendor? Vendor { get; set; }
    public Guid CustomerId { get; set; }
    public Customer? Customer { get; set; }
    public string CustomerSubject { get; set; } = default!;
    public Guid? ProductId { get; set; }
    public Product? Product { get; set; }
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public DateTimeOffset UpdatedAt { get; set; } = DateTimeOffset.UtcNow;
    public long CustomerLastReadMessageId { get; set; }
    public long VendorLastReadMessageId { get; set; }
    public ICollection<ChatMessage> Messages { get; set; } = new List<ChatMessage>();
}

public class ChatMessage
{
    public long Id { get; set; }
    public string TenantId { get; set; } = default!;
    public Guid ConversationId { get; set; }
    public ChatConversation? Conversation { get; set; }
    public string SenderRole { get; set; } = default!;
    public string SenderId { get; set; } = default!;
    public Guid ClientMessageId { get; set; }
    public string Content { get; set; } = default!;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
}
