using EStore.Api.Services;

namespace EStore.Api.Endpoints;

public static class PointsEndpoints
{
    public static RouteGroupBuilder MapPointsEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/customer/{customerId:guid}", GetCustomerPoints);

        return group;
    }

    private static async Task<IResult> GetCustomerPoints(
        PointsService pointsService,
        Guid customerId,
        int transactionLimit = 50,
        CancellationToken cancellationToken = default)
    {
        if (customerId == Guid.Empty)
        {
            return Results.BadRequest(new { error = "CustomerId is required." });
        }

        var summary = await pointsService.GetCustomerPointsAsync(
            customerId,
            transactionLimit,
            cancellationToken);

        if (summary is null)
        {
            return Results.NotFound(new { error = "Customer not found." });
        }

        return Results.Ok(new CustomerPointsResponseDto(
            summary.CustomerId,
            summary.Balance,
            summary.Transactions.Select(t => new PointTransactionResponseDto(
                t.Id,
                t.TenantId,
                t.CustomerId,
                t.Amount,
                t.Reason,
                t.SourceType,
                t.SourceId,
                t.CreatedAt,
                t.Notes)).ToList()));
    }
}

public record CustomerPointsResponseDto(
    Guid CustomerId,
    int Balance,
    IReadOnlyList<PointTransactionResponseDto> Transactions);

public record PointTransactionResponseDto(
    Guid Id,
    string TenantId,
    Guid CustomerId,
    int Amount,
    string Reason,
    string SourceType,
    Guid SourceId,
    DateTimeOffset CreatedAt,
    string? Notes);
