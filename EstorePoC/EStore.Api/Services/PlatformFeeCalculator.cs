namespace EStore.Api.Services;

public static class PlatformFeeCalculator
{
    public const decimal MaxAmount = 9999999999999999m;

    public static Dictionary<string, string[]> Validate(decimal amount, decimal percentage)
    {
        var errors = new Dictionary<string, string[]>();
        if (amount < 0 || amount > MaxAmount || decimal.Truncate(amount) != amount)
            errors["amount"] = ["Use a nonnegative whole RWF amount within the supported range."];
        if (percentage < 0 || percentage > 100 || decimal.Round(percentage, 4) != percentage)
            errors["percentage"] = ["Use a percentage from 0 to 100 with at most four decimal places."];
        return errors;
    }

    public static PlatformFeeQuote Calculate(decimal amount, decimal percentage = 1m)
    {
        if (Validate(amount, percentage).Count > 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Invalid amount or percentage.");
        var fee = decimal.Round(amount * percentage / 100m, 0, MidpointRounding.AwayFromZero);
        return new(amount, percentage, fee, amount + fee, "RWF", "buyer", true);
    }
}

public record PlatformFeeQuote(decimal BaseAmount, decimal Percentage, decimal FeeAmount,
    decimal TotalAmount, string Currency, string ChargedTo, bool IsEstimate);
