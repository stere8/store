using EStore.Api.Data;
using EStore.Api.Services;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class ServiceFeeEndpoints
{
    public static IEndpointRouteBuilder MapServiceFeeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/service-fees/calculate", (HttpContext context, decimal amount) =>
        {
            if (context.Request.Query.ContainsKey("percentage"))
                return Results.BadRequest(new { error = "The service fee is fixed at 1% of the complete cart subtotal; omit percentage." });
            var errors = ServiceFeeCalculator.Validate(amount);
            return errors.Count > 0 ? Results.ValidationProblem(errors) :
                Results.Ok(ServiceFeeCalculator.Calculate(amount));
        }).WithTags("ServiceFees").Produces<ServiceFeeQuote>().ProducesValidationProblem();
        app.MapGet("/api/carts/{cartId:guid}/service-fee", CartQuote)
            .RequireAuthorization("CustomerOrAdmin").WithTags("ServiceFees")
            .Produces<CartServiceFeeQuote>().Produces(401).Produces(403).Produces(404).Produces(409);
        return app;
    }

    private static async Task<IResult> CartQuote(HttpContext context, AppDbContext db, Guid cartId)
    {
        var admin = await StoreIdentity.IsAdminAsync(context);
        var subject = admin ? null : await StoreIdentity.CustomerSubjectAsync(context);
        if (!admin && subject is null) return Results.Unauthorized();
        var cart = await db.ShoppingCarts.AsNoTracking().Include(c => c.Customer)
            .Include(c => c.Items).ThenInclude(i => i.Product).ThenInclude(p => p!.Vendor)
            .FirstOrDefaultAsync(c => c.Id == cartId && c.IsActive &&
                (admin || (c.Customer!.Username == subject && !c.Customer.IsArchived)));
        if (cart is null) return Results.NotFound();
        if (cart.Items.Any(i => i.Product is null || !i.Product.Active || i.Product.Vendor?.Active != true))
            return Results.Conflict(new { error = "The cart contains unavailable products. Update the cart before quoting its service fee." });
        ServiceFeeQuote quote;
        try
        {
            // Match the existing reservation calculation: current catalog price, never client totals or stale snapshots.
            quote = ServiceFeeCalculator.CalculateCart(cart.Items.Select(i => new CartFeeLine(i.Product!.Price, i.Quantity)));
        }
        catch (Exception ex) when (ex is ArgumentException or OverflowException)
        { return Results.Conflict(new { error = "The cart contains invalid quantities/prices or exceeds the supported subtotal. Update the cart." }); }
        context.Response.Headers.CacheControl = "no-store";
        return Results.Ok(new CartServiceFeeQuote(cart.Id, quote.Subtotal, quote.ServiceFeePercentage,
            quote.ServiceFeeAmount, quote.TotalAmount, quote.Currency, quote.ChargedTo, quote.CalculatedPer, quote.IsEstimate));
    }
}
