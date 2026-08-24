using System.Net.Mail;
using EStore.Api.Data;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Services;

public class PointsService(AppDbContext db)
{
    public const int DefaultRecommenderReferralPoints = 100;
    public const int DefaultRecommendedReferralPoints = 50;
    public const string ReferralSourceType = "Referral";
    public const string ReferralRegisteredReason = "ReferralRegistered";
    public const string ReferralWelcomeBonusReason = "ReferralWelcomeBonus";

    public async Task<CreateReferralResult> CreateReferralAsync(
        Guid recommenderCustomerId,
        string? recommendedEmail,
        CancellationToken cancellationToken = default)
    {
        var tenantId = db.CurrentTenantId!;
        var normalizedEmail = NormalizeEmail(recommendedEmail);

        if (normalizedEmail is null)
        {
            return CreateReferralResult.Fail(
                CreateReferralResultCode.InvalidEmail,
                "Recommended email is invalid.");
        }

        var recommender = await db.Customers
            .FirstOrDefaultAsync(
                c => c.TenantId == tenantId && c.Id == recommenderCustomerId,
                cancellationToken);

        if (recommender is null)
        {
            return CreateReferralResult.Fail(
                CreateReferralResultCode.RecommenderNotFound,
                "Recommender customer not found.");
        }

        if (recommender.IsArchived)
        {
            return CreateReferralResult.Fail(
                CreateReferralResultCode.RecommenderArchived,
                "Archived customers cannot create referrals.");
        }

        if (NormalizeEmail(recommender.Email) == normalizedEmail)
        {
            return CreateReferralResult.Fail(
                CreateReferralResultCode.SelfReferral,
                "You cannot recommend yourself.");
        }

        var duplicate = await db.Referrals
            .AnyAsync(
                r =>
                    r.TenantId == tenantId &&
                    r.RecommenderCustomerId == recommenderCustomerId &&
                    r.RecommendedEmailNormalized == normalizedEmail,
                cancellationToken);

        if (duplicate)
        {
            return CreateReferralResult.Fail(
                CreateReferralResultCode.Duplicate,
                "You have already recommended this email.");
        }

        var recommendedCustomer = await FindActiveCustomerByNormalizedEmailAsync(
            tenantId,
            normalizedEmail,
            cancellationToken);

        if (recommendedCustomer?.Id == recommenderCustomerId)
        {
            return CreateReferralResult.Fail(
                CreateReferralResultCode.SelfReferral,
                "You cannot recommend yourself.");
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var referral = new Referral
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            RecommenderCustomerId = recommenderCustomerId,
            RecommendedEmail = recommendedEmail!.Trim(),
            RecommendedEmailNormalized = normalizedEmail,
            Status = ReferralStatus.Pending,
            CreatedAt = now
        };

        db.Referrals.Add(referral);

        if (recommendedCustomer is null)
        {
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return CreateReferralResult.Success(
                referral,
                "Referral created. Points will be awarded when this email registers.");
        }

        referral.RecommendedCustomerId = recommendedCustomer.Id;
        referral.MatchedAt = now;

        if (await HasAwardedReferralForRecommendedCustomerAsync(
                tenantId,
                recommendedCustomer.Id,
                cancellationToken))
        {
            CancelReferral(referral, now, "Email already awarded to another referral.");
            await db.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            return CreateReferralResult.Success(
                referral,
                "Referral created, but this email has already been awarded to another referral.");
        }

        await AwardReferralPointsInternalAsync(referral, recommendedCustomer, now, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return CreateReferralResult.Success(
            referral,
            "Referral matched an existing customer and points were awarded.");
    }

    public async Task<ReferralMatchSummary> MatchPendingReferralsForCustomerAsync(
        Customer customer,
        CancellationToken cancellationToken = default)
    {
        var tenantId = customer.TenantId;
        var normalizedEmail = NormalizeEmail(customer.Email);

        if (normalizedEmail is null || customer.IsArchived)
        {
            return new ReferralMatchSummary(0, 0, 0);
        }

        var referrals = await db.Referrals
            .Where(r =>
                r.TenantId == tenantId &&
                r.RecommendedEmailNormalized == normalizedEmail &&
                (r.Status == ReferralStatus.Pending || r.Status == ReferralStatus.Matched))
            .OrderBy(r => r.CreatedAt)
            .ToListAsync(cancellationToken);

        if (referrals.Count == 0)
        {
            return new ReferralMatchSummary(0, 0, 0);
        }

        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var recommenderIds = referrals
            .Select(r => r.RecommenderCustomerId)
            .Distinct()
            .ToList();

        var activeRecommenderIds = (await db.Customers
                .Where(c => c.TenantId == tenantId && recommenderIds.Contains(c.Id) && !c.IsArchived)
                .Select(c => c.Id)
                .ToListAsync(cancellationToken))
            .ToHashSet();

        var alreadyAwarded = await HasAwardedReferralForRecommendedCustomerAsync(
            tenantId,
            customer.Id,
            cancellationToken);

        var awardTarget = alreadyAwarded
            ? null
            : referrals.FirstOrDefault(r =>
                r.RecommenderCustomerId != customer.Id &&
                activeRecommenderIds.Contains(r.RecommenderCustomerId));

        var matched = 0;
        var awarded = 0;
        var cancelled = 0;

        foreach (var referral in referrals)
        {
            referral.RecommendedCustomerId = customer.Id;
            referral.MatchedAt ??= now;
            matched++;

            if (referral.RecommenderCustomerId == customer.Id)
            {
                CancelReferral(referral, now, "Self-referrals are not eligible for points.");
                cancelled++;
                continue;
            }

            if (!activeRecommenderIds.Contains(referral.RecommenderCustomerId))
            {
                CancelReferral(referral, now, "Recommender customer is archived.");
                cancelled++;
                continue;
            }

            if (awardTarget?.Id == referral.Id)
            {
                await AwardReferralPointsInternalAsync(referral, customer, now, cancellationToken);
                awarded++;
                continue;
            }

            CancelReferral(referral, now, "Email already awarded to another referral.");
            cancelled++;
        }

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return new ReferralMatchSummary(matched, awarded, cancelled);
    }

    public async Task<List<Referral>> ListCustomerReferralsAsync(
        Guid customerId,
        CancellationToken cancellationToken = default)
    {
        var tenantId = db.CurrentTenantId!;

        return await db.Referrals
            .Where(r => r.TenantId == tenantId && r.RecommenderCustomerId == customerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<CustomerPointsSummary?> GetCustomerPointsAsync(
        Guid customerId,
        int transactionLimit = 50,
        CancellationToken cancellationToken = default)
    {
        var tenantId = db.CurrentTenantId!;
        var customerExists = await db.Customers
            .AnyAsync(c => c.TenantId == tenantId && c.Id == customerId, cancellationToken);

        if (!customerExists)
        {
            return null;
        }

        var balance = await db.CustomerPointBalances
            .Where(b => b.TenantId == tenantId && b.CustomerId == customerId)
            .Select(b => b.Balance)
            .FirstOrDefaultAsync(cancellationToken);

        var transactions = await db.PointTransactions
            .Where(t => t.TenantId == tenantId && t.CustomerId == customerId)
            .OrderByDescending(t => t.CreatedAt)
            .Take(Math.Clamp(transactionLimit, 1, 100))
            .ToListAsync(cancellationToken);

        return new CustomerPointsSummary(customerId, balance, transactions);
    }

    public static string? NormalizeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
        {
            return null;
        }

        var trimmed = email.Trim();

        if (trimmed.Length > 160)
        {
            return null;
        }

        try
        {
            var address = new MailAddress(trimmed);

            if (!string.Equals(address.Address, trimmed, StringComparison.OrdinalIgnoreCase))
            {
                return null;
            }

            return address.Address.ToLowerInvariant();
        }
        catch
        {
            return null;
        }
    }

    private async Task<Customer?> FindActiveCustomerByNormalizedEmailAsync(
        string tenantId,
        string normalizedEmail,
        CancellationToken cancellationToken)
    {
        return await db.Customers
            .Where(c =>
                c.TenantId == tenantId &&
                !c.IsArchived &&
                c.Email != null &&
                c.Email.Trim().ToLower() == normalizedEmail)
            .OrderBy(c => c.Id)
            .FirstOrDefaultAsync(cancellationToken);
    }

    private async Task<bool> HasAwardedReferralForRecommendedCustomerAsync(
        string tenantId,
        Guid recommendedCustomerId,
        CancellationToken cancellationToken)
    {
        return await db.Referrals
            .AnyAsync(
                r =>
                    r.TenantId == tenantId &&
                    r.RecommendedCustomerId == recommendedCustomerId &&
                    r.Status == ReferralStatus.Awarded,
                cancellationToken);
    }

    private async Task AwardReferralPointsInternalAsync(
        Referral referral,
        Customer recommendedCustomer,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var alreadyAwarded = await db.PointTransactions
            .AnyAsync(
                t =>
                    t.TenantId == referral.TenantId &&
                    t.SourceType == ReferralSourceType &&
                    t.SourceId == referral.Id,
                cancellationToken);

        if (alreadyAwarded)
        {
            referral.Status = ReferralStatus.Awarded;
            referral.AwardedAt ??= now;
            return;
        }

        referral.RecommendedCustomerId = recommendedCustomer.Id;
        referral.MatchedAt ??= now;

        await AddPointTransactionInternalAsync(
            referral.TenantId,
            referral.RecommenderCustomerId,
            DefaultRecommenderReferralPoints,
            ReferralRegisteredReason,
            ReferralSourceType,
            referral.Id,
            "User referral registered.",
            now,
            cancellationToken);

        referral.RecommenderPointsAwarded = DefaultRecommenderReferralPoints;

        if (DefaultRecommendedReferralPoints > 0)
        {
            await AddPointTransactionInternalAsync(
                referral.TenantId,
                recommendedCustomer.Id,
                DefaultRecommendedReferralPoints,
                ReferralWelcomeBonusReason,
                ReferralSourceType,
                referral.Id,
                "Welcome bonus from referral.",
                now,
                cancellationToken);

            referral.RecommendedPointsAwarded = DefaultRecommendedReferralPoints;
        }

        referral.Status = ReferralStatus.Awarded;
        referral.AwardedAt = now;
        referral.CancelledAt = null;
        referral.CancelReason = null;
    }

    private async Task AddPointTransactionInternalAsync(
        string tenantId,
        Guid customerId,
        int amount,
        string reason,
        string sourceType,
        Guid sourceId,
        string? notes,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var duplicate = await db.PointTransactions
            .AnyAsync(
                t =>
                    t.TenantId == tenantId &&
                    t.CustomerId == customerId &&
                    t.SourceType == sourceType &&
                    t.SourceId == sourceId &&
                    t.Reason == reason,
                cancellationToken);

        if (duplicate)
        {
            return;
        }

        db.PointTransactions.Add(new PointTransaction
        {
            Id = Guid.NewGuid(),
            TenantId = tenantId,
            CustomerId = customerId,
            Amount = amount,
            Reason = reason,
            SourceType = sourceType,
            SourceId = sourceId,
            Notes = notes,
            CreatedAt = now
        });

        await ApplyBalanceDeltaAsync(tenantId, customerId, amount, now, cancellationToken);
    }

    private async Task ApplyBalanceDeltaAsync(
        string tenantId,
        Guid customerId,
        int amount,
        DateTimeOffset now,
        CancellationToken cancellationToken)
    {
        var balance = await db.CustomerPointBalances
            .FirstOrDefaultAsync(
                b => b.TenantId == tenantId && b.CustomerId == customerId,
                cancellationToken);

        if (balance is null)
        {
            db.CustomerPointBalances.Add(new CustomerPointBalance
            {
                TenantId = tenantId,
                CustomerId = customerId,
                Balance = amount,
                UpdatedAt = now
            });
            return;
        }

        balance.Balance += amount;
        balance.UpdatedAt = now;
    }

    private static void CancelReferral(Referral referral, DateTimeOffset now, string reason)
    {
        referral.Status = ReferralStatus.Cancelled;
        referral.CancelledAt = now;
        referral.CancelReason = reason;
    }
}

public enum CreateReferralResultCode
{
    Created,
    InvalidEmail,
    RecommenderNotFound,
    RecommenderArchived,
    SelfReferral,
    Duplicate
}

public record CreateReferralResult(
    CreateReferralResultCode Code,
    Referral? Referral,
    string Message)
{
    public bool IsSuccess => Code == CreateReferralResultCode.Created && Referral is not null;

    public static CreateReferralResult Success(Referral referral, string message) =>
        new(CreateReferralResultCode.Created, referral, message);

    public static CreateReferralResult Fail(CreateReferralResultCode code, string message) =>
        new(code, null, message);
}

public record ReferralMatchSummary(int Matched, int Awarded, int Cancelled);

public record CustomerPointsSummary(
    Guid CustomerId,
    int Balance,
    IReadOnlyList<PointTransaction> Transactions);
