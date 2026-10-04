using EStore.Api.Data;
using EStore.Api.Models;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class ChatEndpoints
{
    public static RouteGroupBuilder MapChatEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/me", Me).Produces<ChatActorDto>().Produces(401);
        group.MapGet("/conversations", List).Produces<ChatInboxDto>().Produces(400).Produces(401);
        group.MapPost("/conversations", Create).Produces<ChatConversationDto>()
            .Produces<ChatConversationDto>(201).Produces(400).Produces(401);
        group.MapGet("/conversations/{id:guid}", Get).Produces<ChatConversationDto>().Produces(401).Produces(404);
        group.MapGet("/conversations/{id:guid}/messages", Messages).Produces<ChatMessagePageDto>()
            .Produces(400).Produces(401).Produces(404);
        group.MapPost("/conversations/{id:guid}/messages", Send).Produces<ChatMessageDto>()
            .Produces<ChatMessageDto>(201).Produces(400).Produces(401).Produces(404).Produces(409);
        group.MapPut("/conversations/{id:guid}/read", MarkRead).Produces<ChatConversationDto>()
            .Produces(400).Produces(401).Produces(404);
        return group;
    }

    private sealed record Actor(string Role, string Id, Guid ProfileId);
    private static async Task<Actor?> Resolve(HttpContext context, AppDbContext db, VendorAuthService auth)
    {
        var vendor = await VendorAuthEndpoints.ResolveVendorAsync(context, db, auth);
        if (vendor is not null) return new Actor("vendor", vendor.Id.ToString(), vendor.Id);
        var subject = await StoreIdentity.CustomerSubjectAsync(context);
        if (subject is null) return null;
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Username == subject && !c.IsArchived);
        return customer is null ? null : new Actor("customer", subject, customer.Id);
    }

    private static IQueryable<ChatConversation> Owned(AppDbContext db, Actor actor) =>
        db.ChatConversations.Where(c => actor.Role == "vendor" ?
            c.VendorId == actor.ProfileId : c.CustomerSubject == actor.Id);

    private static async Task<IResult> Me(HttpContext context, AppDbContext db, VendorAuthService auth)
    {
        var actor = await Resolve(context, db, auth);
        return actor is null ? Results.Unauthorized() : Results.Ok(new ChatActorDto(
            actor.Role, actor.Id, actor.ProfileId, db.CurrentTenantId!));
    }

    private static IQueryable<ChatConversationDto> Summaries(IQueryable<ChatConversation> query, Actor actor) =>
        query.Select(c => new ChatConversationDto(c.Id, c.VendorId, c.Vendor!.DisplayName,
            c.Vendor.LogoUrl, c.CustomerId, c.Customer!.FullName, c.ProductId,
            c.CreatedAt, c.UpdatedAt,
            c.Messages.OrderByDescending(m => m.Id).Select(m => m.Content).FirstOrDefault(),
            c.Messages.Count(m => m.SenderRole != actor.Role && m.Id >
                (actor.Role == "vendor" ? c.VendorLastReadMessageId : c.CustomerLastReadMessageId)),
            actor.Role == "vendor" ? c.VendorLastReadMessageId : c.CustomerLastReadMessageId));

    private static async Task<IResult> List(HttpContext context, AppDbContext db, VendorAuthService auth,
        int page = 1, int pageSize = 20)
    {
        var actor = await Resolve(context, db, auth);
        if (actor is null) return Results.Unauthorized();
        if (page is < 1 or > 10000 || pageSize is < 1 or > 100) return Results.BadRequest();
        var rows = await Summaries(Owned(db, actor).OrderByDescending(c => c.UpdatedAt).ThenBy(c => c.Id), actor)
            .Skip((page - 1) * pageSize).Take(pageSize + 1).ToListAsync();
        return Results.Ok(new ChatInboxDto(rows.Take(pageSize).ToList(), page, pageSize, rows.Count > pageSize));
    }

    private static async Task<IResult> Get(HttpContext context, AppDbContext db, VendorAuthService auth, Guid id)
    {
        var actor = await Resolve(context, db, auth);
        if (actor is null) return Results.Unauthorized();
        var row = await Summaries(Owned(db, actor).Where(c => c.Id == id), actor).FirstOrDefaultAsync();
        return row is null ? Results.NotFound() : Results.Ok(row);
    }

    private static async Task<IResult> Create(HttpContext context, AppDbContext db, VendorAuthService auth,
        ChatConversationCreateDto dto)
    {
        var actor = await Resolve(context, db, auth);
        if (actor is null) return Results.Unauthorized();
        Guid vendorId;
        Customer? customer;
        if (actor.Role == "customer")
        {
            if (!dto.VendorId.HasValue || dto.CustomerId.HasValue)
                return Results.BadRequest(new { error = "Customers supply vendorId only; customer identity comes from their session." });
            vendorId = dto.VendorId.Value;
            customer = await db.Customers.FirstAsync(c => c.Id == actor.ProfileId);
        }
        else
        {
            if (!dto.CustomerId.HasValue || dto.VendorId.HasValue)
                return Results.BadRequest(new { error = "Vendors supply customerId only; vendor identity comes from their session." });
            vendorId = actor.ProfileId;
            customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == dto.CustomerId && !c.IsArchived);
        }
        if (customer is null || !customer.Username.StartsWith("user_", StringComparison.Ordinal))
            return Results.BadRequest(new { error = "A linked Clerk customer profile is required." });
        if (!await db.Vendors.AnyAsync(v => v.Id == vendorId && v.Active && v.Verified))
            return Results.BadRequest(new { error = "Active, verified vendor not found." });
        if (dto.ProductId.HasValue && !await db.Products.AnyAsync(p => p.Id == dto.ProductId &&
            p.VendorId == vendorId && p.Active))
            return Results.BadRequest(new { error = "Product must belong to the selected vendor in this tenant." });
        var existing = await db.ChatConversations.FirstOrDefaultAsync(c =>
            c.VendorId == vendorId && c.CustomerSubject == customer.Username);
        if (existing is not null)
            return Results.Ok(await Summaries(Owned(db, actor).Where(c => c.Id == existing.Id), actor).FirstAsync());
        var conversation = new ChatConversation
        {
            TenantId = db.CurrentTenantId!, VendorId = vendorId, CustomerId = customer.Id,
            CustomerSubject = customer.Username, ProductId = dto.ProductId
        };
        db.ChatConversations.Add(conversation);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException ex) when (DatabaseErrors.IsUniqueViolation(ex))
        {
            db.Entry(conversation).State = EntityState.Detached;
            var concurrent = await db.ChatConversations.FirstAsync(c =>
                c.VendorId == vendorId && c.CustomerSubject == customer.Username);
            return Results.Ok(await Summaries(Owned(db, actor).Where(c => c.Id == concurrent.Id), actor).FirstAsync());
        }
        return Results.Created($"/api/chat/conversations/{conversation.Id}",
            await Summaries(Owned(db, actor).Where(c => c.Id == conversation.Id), actor).FirstAsync());
    }

    private static ChatMessageDto ToDto(ChatMessage m) =>
        new(m.Id, m.ConversationId, m.SenderRole, m.SenderId, m.ClientMessageId, m.Content, m.CreatedAt);

    private static async Task<IResult> Messages(HttpContext context, AppDbContext db, VendorAuthService auth,
        Guid id, long? beforeId, long? afterId, int limit = 50)
    {
        var actor = await Resolve(context, db, auth);
        if (actor is null) return Results.Unauthorized();
        if (!await Owned(db, actor).AnyAsync(c => c.Id == id)) return Results.NotFound();
        if (limit is < 1 or > 100 || beforeId <= 0 || afterId < 0 || (beforeId.HasValue && afterId.HasValue))
            return Results.BadRequest(new { error = "Use either beforeId or afterId and limit 1-100." });
        var query = db.ChatMessages.Where(m => m.ConversationId == id);
        if (beforeId.HasValue) query = query.Where(m => m.Id < beforeId);
        if (afterId.HasValue) query = query.Where(m => m.Id > afterId);
        var rows = await (afterId.HasValue ? query.OrderBy(m => m.Id) : query.OrderByDescending(m => m.Id))
            .Take(limit + 1).ToListAsync();
        var items = rows.Take(limit).OrderBy(m => m.Id).Select(ToDto).ToList();
        return Results.Ok(new ChatMessagePageDto(items, rows.Count > limit,
            items.FirstOrDefault()?.Id, items.LastOrDefault()?.Id));
    }

    private static async Task<IResult> Send(HttpContext context, AppDbContext db, VendorAuthService auth,
        Guid id, ChatMessageCreateDto dto)
    {
        var actor = await Resolve(context, db, auth);
        if (actor is null) return Results.Unauthorized();
        if (!await Owned(db, actor).AnyAsync(c => c.Id == id)) return Results.NotFound();
        if (string.IsNullOrWhiteSpace(dto.Content) || dto.Content.Trim().Length > 4000 ||
            dto.ClientMessageId == Guid.Empty)
            return Results.BadRequest(new { error = "Provide content (1-4000 characters) and a new clientMessageId UUID." });
        var existing = await db.ChatMessages.FirstOrDefaultAsync(m => m.ConversationId == id &&
            m.SenderRole == actor.Role && m.SenderId == actor.Id && m.ClientMessageId == dto.ClientMessageId);
        if (existing is not null) return Replay(existing, dto);
        var message = new ChatMessage
        {
            TenantId = db.CurrentTenantId!, ConversationId = id, SenderRole = actor.Role,
            SenderId = actor.Id, ClientMessageId = dto.ClientMessageId, Content = dto.Content.Trim()
        };
        await using var transaction = await db.Database.BeginTransactionAsync();
        db.ChatMessages.Add(message);
        try { await db.SaveChangesAsync(); }
        catch (DbUpdateException ex) when (DatabaseErrors.IsUniqueViolation(ex))
        {
            await transaction.RollbackAsync();
            await transaction.DisposeAsync();
            db.Entry(message).State = EntityState.Detached;
            existing = await db.ChatMessages.FirstAsync(m => m.ConversationId == id &&
                m.SenderRole == actor.Role && m.SenderId == actor.Id && m.ClientMessageId == dto.ClientMessageId);
            return Replay(existing, dto);
        }
        await db.ChatConversations.Where(c => c.Id == id).ExecuteUpdateAsync(update =>
            update.SetProperty(c => c.UpdatedAt, c => c.UpdatedAt > message.CreatedAt ? c.UpdatedAt : message.CreatedAt));
        await transaction.CommitAsync();
        return Results.Created($"/api/chat/conversations/{id}/messages?afterId={message.Id - 1}", ToDto(message));
    }

    private static IResult Replay(ChatMessage message, ChatMessageCreateDto dto) =>
        message.Content == dto.Content.Trim() ? Results.Ok(ToDto(message)) :
            Results.Conflict(new { error = "clientMessageId was already used for different content." });

    private static async Task<IResult> MarkRead(HttpContext context, AppDbContext db, VendorAuthService auth,
        Guid id, ChatReadDto dto)
    {
        var actor = await Resolve(context, db, auth);
        if (actor is null) return Results.Unauthorized();
        if (!await Owned(db, actor).AnyAsync(c => c.Id == id)) return Results.NotFound();
        if (dto.MessageId < 0 || (dto.MessageId > 0 && !await db.ChatMessages.AnyAsync(m =>
            m.Id == dto.MessageId && m.ConversationId == id)))
            return Results.BadRequest(new { error = "messageId must belong to this conversation." });
        if (actor.Role == "vendor")
            await Owned(db, actor).Where(c => c.Id == id).ExecuteUpdateAsync(update =>
                update.SetProperty(c => c.VendorLastReadMessageId,
                    c => c.VendorLastReadMessageId > dto.MessageId ? c.VendorLastReadMessageId : dto.MessageId));
        else
            await Owned(db, actor).Where(c => c.Id == id).ExecuteUpdateAsync(update =>
                update.SetProperty(c => c.CustomerLastReadMessageId,
                    c => c.CustomerLastReadMessageId > dto.MessageId ? c.CustomerLastReadMessageId : dto.MessageId));
        return Results.Ok(await Summaries(Owned(db, actor).Where(c => c.Id == id), actor).FirstAsync());
    }
}

public record ChatConversationCreateDto(Guid? VendorId = null, Guid? CustomerId = null, Guid? ProductId = null);
public record ChatMessageCreateDto(string Content, Guid ClientMessageId);
public record ChatReadDto(long MessageId);
public record ChatActorDto(string Role, string ActorId, Guid ProfileId, string TenantId);
public record ChatInboxDto(IReadOnlyList<ChatConversationDto> Items, int Page, int PageSize, bool HasMore);
public record ChatMessagePageDto(IReadOnlyList<ChatMessageDto> Items, bool HasMore,
    long? NextBeforeId, long? NextAfterId);
public record ChatMessageDto(long Id, Guid ConversationId, string SenderRole, string SenderId,
    Guid ClientMessageId, string Content, DateTimeOffset CreatedAt);
public record ChatConversationDto(Guid Id, Guid VendorId, string VendorName, string? VendorLogoUrl,
    Guid CustomerId, string CustomerName, Guid? ProductId, DateTimeOffset CreatedAt, DateTimeOffset UpdatedAt,
    string? LastMessage, int UnreadCount, long LastReadMessageId);
