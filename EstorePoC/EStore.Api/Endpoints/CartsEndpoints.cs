using EStore.Api.Data;
using EStore.Api.DTOs;
using EStore.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace EStore.Api.Endpoints;

public static class CartsEndpoints
{
    public static RouteGroupBuilder MapCartsEndpoints(this RouteGroupBuilder group)
    {
        group.MapPost("/ensure", EnsureCart);
        group.MapPost("/{cartId:guid}/items", AddCartItem);
        group.MapGet("/{cartId:guid}", GetCart);
        group.MapDelete("/{cartId:guid}/items/{productId:guid}", RemoveItem);

        return group;
    }

    private static async Task<IResult> EnsureCart(AppDbContext db, EnsureCartDto dto)
    {
        var tenant = db.CurrentTenantId!;

        bool exists = await db.Customers.AnyAsync(c =>
            c.Id == dto.CustomerId && c.TenantId == tenant);

        if (!exists)
            return Results.BadRequest(new { error = "Customer not found." });

        var cart = await db.ShoppingCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.CustomerId == dto.CustomerId &&
                c.TenantId == tenant &&
                c.IsActive);

        if (cart == null)
        {
            cart = new ShoppingCart
            {
                Id = Guid.NewGuid(),
                TenantId = tenant,
                CustomerId = dto.CustomerId,
                IsActive = true,
                CreatedAt = DateTimeOffset.UtcNow,
                UpdatedAt = DateTimeOffset.UtcNow
            };

            db.ShoppingCarts.Add(cart);
            await db.SaveChangesAsync();
        }

        return Results.Ok(cart);
    }

    private static async Task<IResult> AddCartItem(AppDbContext db, Guid cartId, AddCartItemDto dto)
    {
        var tenant = db.CurrentTenantId!;

        if (dto.Quantity <= 0)
            return Results.BadRequest(new { error = "Quantity must be > 0." });

        var cart = await db.ShoppingCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.Id == cartId && c.TenantId == tenant && c.IsActive);

        if (cart == null)
            return Results.NotFound(new { error = "Cart not found or inactive." });

        var product = await db.Products.FirstOrDefaultAsync(p =>
            p.Id == dto.ProductId && p.TenantId == tenant && p.Active);

        if (product == null)
            return Results.BadRequest(new { error = "Product not valid for tenant." });

        var item = cart.Items.FirstOrDefault(i => i.ProductId == dto.ProductId);

        if (item == null)
            cart.Items.Add(new ShoppingCartItem { ProductId = dto.ProductId, Quantity = dto.Quantity });
        else
            item.Quantity += dto.Quantity;

        cart.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return Results.Ok(cart);
    }

    private static async Task<IResult> GetCart(AppDbContext db, Guid cartId)
    {
        var tenant = db.CurrentTenantId!;

        var cart = await db.ShoppingCarts
            .Include(c => c.Items)
            .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.Id == cartId && c.TenantId == tenant);

        return cart == null ? Results.NotFound() : Results.Ok(cart);
    }

    private static async Task<IResult> RemoveItem(AppDbContext db, Guid cartId, Guid productId)
    {
        var tenant = db.CurrentTenantId!;

        var cart = await db.ShoppingCarts
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c =>
                c.Id == cartId && c.TenantId == tenant && c.IsActive);

        if (cart == null)
            return Results.NotFound(new { error = "Cart not found or inactive." });

        var item = cart.Items.FirstOrDefault(i => i.ProductId == productId);

        if (item == null)
            return Results.NotFound(new { error = "Item not found." });

        db.ShoppingCartItems.Remove(item);
        cart.UpdatedAt = DateTimeOffset.UtcNow;

        await db.SaveChangesAsync();
        return Results.NoContent();
    }
}
