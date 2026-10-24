using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using EStore.Api.Services;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace EStore.Api.Tests;

public sealed class PlatformFeeTests
{
    [Theory]
    [InlineData(100000, 1, 1000, 101000)]
    [InlineData(100, 1, 1, 101)]
    [InlineData(150, 1, 2, 152)]
    [InlineData(49, 1, 0, 49)]
    [InlineData(50, 1, 1, 51)]
    [InlineData(30000, 2.5, 750, 30750)]
    [InlineData(0, 1, 0, 0)]
    [InlineData(1000, 0, 0, 1000)]
    [InlineData(1000, 100, 1000, 2000)]
    [InlineData(10000, 0.0001, 0, 10000)]
    public void AddsWholeRwfFeeToBuyerTotal(decimal amount, decimal percentage, decimal fee, decimal total)
    {
        var quote = PlatformFeeCalculator.Calculate(amount, percentage);
        Assert.Equal(fee, quote.FeeAmount);
        Assert.Equal(total, quote.TotalAmount);
        Assert.Equal(amount, quote.BaseAmount);
        Assert.Equal("buyer", quote.ChargedTo);
        Assert.Equal("RWF", quote.Currency);
        Assert.True(quote.IsEstimate);
    }

    [Theory]
    [InlineData(-1, 1)]
    [InlineData(1.5, 1)]
    [InlineData(100, -1)]
    [InlineData(100, 101)]
    [InlineData(100, 0.00001)]
    public void RejectsInvalidInputs(decimal amount, decimal percentage)
    {
        Assert.NotEmpty(PlatformFeeCalculator.Validate(amount, percentage));
        Assert.Throws<ArgumentOutOfRangeException>(() => PlatformFeeCalculator.Calculate(amount, percentage));
    }

    [Fact]
    public void UsesDecimalArithmeticAndDefaultsToOnePercent()
    {
        Assert.Equal(100m, PlatformFeeCalculator.Calculate(10000).FeeAmount);
        var maximum = PlatformFeeCalculator.Calculate(PlatformFeeCalculator.MaxAmount, 100);
        Assert.Equal(19999999999999998m, maximum.TotalAmount);
        Assert.NotEmpty(PlatformFeeCalculator.Validate(PlatformFeeCalculator.MaxAmount + 1, 1));
    }

    [PostgresFact]
    public async Task PublicQuoteRouteDoesNotRequireAnAccount()
    {
        var previous = Environment.GetEnvironmentVariable("DATABASE_URL");
        var previousSeed = Environment.GetEnvironmentVariable("SEED_DEMO_DATA");
        Environment.SetEnvironmentVariable("DATABASE_URL", Environment.GetEnvironmentVariable("ESTORE_TEST_DATABASE_URL"));
        Environment.SetEnvironmentVariable("SEED_DEMO_DATA", "false");
        try
        {
            using var factory = new WebApplicationFactory<Program>();
            using var client = factory.CreateClient();
            var quote = await client.GetFromJsonAsync<JsonElement>("/api/platform-fees/calculate?amount=100000");
            Assert.Equal(1000, quote.GetProperty("feeAmount").GetDecimal());
            Assert.Equal(101000, quote.GetProperty("totalAmount").GetDecimal());
            Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync("/api/platform-fees/calculate?amount=-1")).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync("/api/platform-fees/calculate?amount=1&percentage=101")).StatusCode);
            Assert.Equal(HttpStatusCode.BadRequest, (await client.GetAsync("/api/platform-fees/calculate")).StatusCode);
        }
        finally
        {
            Environment.SetEnvironmentVariable("DATABASE_URL", previous);
            Environment.SetEnvironmentVariable("SEED_DEMO_DATA", previousSeed);
        }
    }
}
