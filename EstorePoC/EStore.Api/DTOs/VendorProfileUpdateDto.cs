namespace EStore.Api.DTOs;

public record VendorProfileUpdateDto(string DisplayName, string LegalName, string ContactPhone,
    string? ContactEmail = null, Guid? LocationId = null, string? Description = null, string? LogoUrl = null);
