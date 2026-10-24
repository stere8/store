using EStore.Api.Services;

namespace EStore.Api.Endpoints;

public static class PlatformFeeEndpoints
{
    public static RouteGroupBuilder MapPlatformFeeEndpoints(this RouteGroupBuilder group)
    {
        group.MapGet("/calculate", (decimal amount, decimal percentage = 1m) =>
        {
            var errors = PlatformFeeCalculator.Validate(amount, percentage);
            return errors.Count > 0 ? Results.ValidationProblem(errors) :
                Results.Ok(PlatformFeeCalculator.Calculate(amount, percentage));
        }).Produces<PlatformFeeQuote>().ProducesValidationProblem();
        return group;
    }
}
