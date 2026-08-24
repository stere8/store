using EStore.Api.Models;
using EStore.Api.Services;

namespace EStore.Api.Endpoints;

public static class ReferralsEndpoints
{
    public static RouteGroupBuilder MapReferralsEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/", CreateReferral);
        group.MapGet("/customer/{customerId:guid}", ListCustomerReferrals);

        return group;
    }

    private static async Task<IResult> CreateReferral(
        PointsService pointsService,
        CreateReferralDto dto,
        CancellationToken cancellationToken)
    {
        if (dto.RecommenderCustomerId == Guid.Empty)
        {
            return Results.BadRequest(new { error = "RecommenderCustomerId is required." });
        }

        var result = await pointsService.CreateReferralAsync(
            dto.RecommenderCustomerId,
            dto.RecommendedEmail,
            cancellationToken);

        if (result.IsSuccess)
        {
            return Results.Created(
                $"/api/referrals/{result.Referral!.Id}",
                ToReferralResponse(result.Referral!, result.Message));
        }

        return result.Code switch
        {
            CreateReferralResultCode.RecommenderNotFound =>
                Results.NotFound(new { error = result.Message }),
            CreateReferralResultCode.Duplicate =>
                Results.Conflict(new { error = result.Message }),
            _ => Results.BadRequest(new { error = result.Message })
        };
    }

    private static async Task<IResult> ListCustomerReferrals(
        PointsService pointsService,
        Guid customerId,
        CancellationToken cancellationToken)
    {
        if (customerId == Guid.Empty)
        {
            return Results.BadRequest(new { error = "CustomerId is required." });
        }

        var referrals = await pointsService.ListCustomerReferralsAsync(customerId, cancellationToken);

        return Results.Ok(referrals.Select(r => ToReferralResponse(r)).ToList());
    }

    private static ReferralResponseDto ToReferralResponse(Referral referral, string? message = null) =>
        new(
            referral.Id,
            referral.TenantId,
            referral.RecommenderCustomerId,
            referral.RecommendedEmail,
            referral.RecommendedEmailNormalized,
            referral.RecommendedCustomerId,
            referral.Status,
            referral.RecommenderPointsAwarded,
            referral.RecommendedPointsAwarded,
            referral.CreatedAt,
            referral.MatchedAt,
            referral.AwardedAt,
            referral.CancelledAt,
            referral.CancelReason,
            message);
}

public record CreateReferralDto(
    Guid RecommenderCustomerId,
    string RecommendedEmail);

public record ReferralResponseDto(
    Guid Id,
    string TenantId,
    Guid RecommenderCustomerId,
    string RecommendedEmail,
    string RecommendedEmailNormalized,
    Guid? RecommendedCustomerId,
    ReferralStatus Status,
    int RecommenderPointsAwarded,
    int RecommendedPointsAwarded,
    DateTimeOffset CreatedAt,
    DateTimeOffset? MatchedAt,
    DateTimeOffset? AwardedAt,
    DateTimeOffset? CancelledAt,
    string? CancelReason,
    string? Message);
