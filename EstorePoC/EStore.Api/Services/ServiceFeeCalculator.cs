namespace EStore.Api.Services;

public static class ServiceFeeCalculator
{
    public const decimal MaxAmount = 9999999999999999m;
    public const decimal Percentage = 1m;

    public static Dictionary<string, string[]> Validate(decimal amount)
    {
        var errors = new Dictionary<string, string[]>();
        if (amount < 0 || amount > MaxAmount || decimal.Truncate(amount) != amount)
            errors["amount"] = ["Use a nonnegative whole RWF amount within the supported range."];
        return errors;
    }

    public static ServiceFeeQuote Calculate(decimal amount)
    {
        if (Validate(amount).Count > 0)
            throw new ArgumentOutOfRangeException(nameof(amount), "Invalid cart subtotal.");
        var fee = decimal.Round(amount * Percentage / 100m, 0, MidpointRounding.AwayFromZero);
        return new(amount, Percentage, fee, amount + fee, "RWF", "buyer", "cart", true);
    }

    public static ServiceFeeQuote CalculateCart(IEnumerable<CartFeeLine> lines)
    {
        decimal subtotal = 0;
        foreach (var line in lines)
        {
            if (line.Quantity <= 0 || Validate(line.UnitPrice).Count > 0)
                throw new ArgumentOutOfRangeException(nameof(lines), "Invalid cart quantity or current unit price.");
            subtotal = checked(subtotal + line.UnitPrice * line.Quantity);
            if (subtotal > MaxAmount)
                throw new ArgumentOutOfRangeException(nameof(lines), "Cart subtotal exceeds the supported range.");
        }
        // Round only after combining every line, irrespective of item count or vendor grouping.
        return Calculate(subtotal);
    }
}

public record CartFeeLine(decimal UnitPrice, int Quantity);
public record ServiceFeeQuote(decimal Subtotal, decimal ServiceFeePercentage, decimal ServiceFeeAmount,
    decimal TotalAmount, string Currency, string ChargedTo, string CalculatedPer, bool IsEstimate);
public record CartServiceFeeQuote(Guid CartId, decimal Subtotal, decimal ServiceFeePercentage,
    decimal ServiceFeeAmount, decimal TotalAmount, string Currency, string ChargedTo,
    string CalculatedPer, bool IsEstimate);
