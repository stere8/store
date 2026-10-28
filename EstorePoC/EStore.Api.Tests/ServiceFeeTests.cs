using EStore.Api.Services;
using Xunit;

namespace EStore.Api.Tests;

public sealed class ServiceFeeTests
{
    [Theory]
    [InlineData(100000, 1000, 101000)]
    [InlineData(100, 1, 101)]
    [InlineData(150, 2, 152)]
    [InlineData(49, 0, 49)]
    [InlineData(50, 1, 51)]
    [InlineData(30000, 300, 30300)]
    [InlineData(0, 0, 0)]
    public void AddsOnePercentServiceFeeOnceToWholeCart(decimal amount, decimal fee, decimal total)
    {
        var quote = ServiceFeeCalculator.Calculate(amount);
        Assert.Equal(fee, quote.ServiceFeeAmount);
        Assert.Equal(total, quote.TotalAmount);
        Assert.Equal(amount, quote.Subtotal);
        Assert.Equal(1m, quote.ServiceFeePercentage);
        Assert.Equal("cart", quote.CalculatedPer);
        Assert.Equal("buyer", quote.ChargedTo);
        Assert.Equal("RWF", quote.Currency);
        Assert.True(quote.IsEstimate);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(1.5)]
    [InlineData(10000000000000000)]
    public void RejectsInvalidSubtotals(decimal amount)
    {
        Assert.NotEmpty(ServiceFeeCalculator.Validate(amount));
        Assert.Throws<ArgumentOutOfRangeException>(() => ServiceFeeCalculator.Calculate(amount));
    }

    [Fact]
    public void RoundsAfterAllLinesAndQuantitiesNotForEachItemOrVendor()
    {
        var whole = ServiceFeeCalculator.CalculateCart([new(50, 1), new(50, 1)]);
        Assert.Equal(100, whole.Subtotal);
        Assert.Equal(1, whole.ServiceFeeAmount);
        Assert.NotEqual(ServiceFeeCalculator.Calculate(50).ServiceFeeAmount * 2, whole.ServiceFeeAmount);
        Assert.Equal(whole, ServiceFeeCalculator.CalculateCart([new(50, 2)]));
        Assert.Equal(2, ServiceFeeCalculator.CalculateCart([new(50, 3)]).ServiceFeeAmount);
        Assert.Equal(0, ServiceFeeCalculator.CalculateCart([]).ServiceFeeAmount);
    }

    [Theory]
    [InlineData(-1, 1)]
    [InlineData(1.5, 1)]
    [InlineData(50, 0)]
    [InlineData(50, -1)]
    public void RejectsInvalidCartLines(decimal price, int quantity) =>
        Assert.Throws<ArgumentOutOfRangeException>(() => ServiceFeeCalculator.CalculateCart([new(price, quantity)]));

    [Fact]
    public void UsesDecimalArithmeticAndRejectsUnsupportedCombinedSubtotals()
    {
        var maximum = ServiceFeeCalculator.Calculate(ServiceFeeCalculator.MaxAmount);
        Assert.Equal(10099999999999999m, maximum.TotalAmount);
        Assert.Throws<ArgumentOutOfRangeException>(() => ServiceFeeCalculator.CalculateCart([new(ServiceFeeCalculator.MaxAmount, 2)]));
    }
}
