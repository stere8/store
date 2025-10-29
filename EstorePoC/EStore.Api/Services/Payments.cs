using System.Text;

namespace EStore.Api.Services;

public interface IPaymentGateway
{
    Task<object> ChargeAsync(string tenantId, object request);
}

public interface IPaymentGatewayFactory
{
    IPaymentGateway Create(string gateway);
}

public class PaymentGatewayFactory : IPaymentGatewayFactory
{
    public IPaymentGateway Create(string gateway)
    {
        return (gateway?.Trim().ToLowerInvariant()) switch
        {
            "mtn"    => new MtnGatewayMock(),
            "airtel" => new AirtelGatewayMock(),
            "stripe" => new StripeGatewayMock(),
            _        => new UnknownGatewayMock(gateway ?? "unknown")
        };
    }
}

public class StripeGatewayMock : IPaymentGateway
{
    public Task<object> ChargeAsync(string tenantId, object request)
    {
        var reference = MakeRef("ST");
        return Task.FromResult<object>(new { status = "success", gateway = "stripe", tenantId, reference });
    }
}

public class MtnGatewayMock : IPaymentGateway
{
    public Task<object> ChargeAsync(string tenantId, object request)
    {
        var reference = MakeRef("MTN");
        return Task.FromResult<object>(new { status = "success", gateway = "mtn", tenantId, reference });
    }
}

public class AirtelGatewayMock : IPaymentGateway
{
    public Task<object> ChargeAsync(string tenantId, object request)
    {
        var reference = MakeRef("AIR");
        return Task.FromResult<object>(new { status = "success", gateway = "airtel", tenantId, reference });
    }
}

public class UnknownGatewayMock : IPaymentGateway
{
    private readonly string _gw;
    public UnknownGatewayMock(string gw) => _gw = gw;
    public Task<object> ChargeAsync(string tenantId, object request)
        => Task.FromResult<object>(new { status = "error", gateway = _gw, tenantId, error = "Unsupported gateway" });
}

static string MakeRef(string prefix)
{
    var core = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
        .Replace("=", "").Replace("+", "").Replace("/", "");
    return $"{prefix}-{core[..12].ToUpperInvariant()}";
}
