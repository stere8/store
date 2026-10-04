using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;

namespace EStore.Api.Services;

public static class StoreIdentity
{
    public static async Task<bool> IsAdminAsync(HttpContext context)
    {
        var result = await context.AuthenticateAsync(AuthenticationSetup.Admin);
        var settings = context.RequestServices.GetRequiredService<AdminAuthSettings>();
        return settings.IsConfigured && result.Succeeded && result.Principal?.HasClaim("role", "admin") == true &&
            result.Principal.FindFirstValue("tenantId") == (string?)context.Items["TenantId"];
    }

    public static async Task<string?> CustomerSubjectAsync(HttpContext context)
    {
        var result = await context.AuthenticateAsync(AuthenticationSetup.Customer);
        return result.Succeeded ? result.Principal?.FindFirstValue("sub") : null;
    }
}
