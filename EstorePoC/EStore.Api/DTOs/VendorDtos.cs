namespace EStore.Api.DTOs;

public record VendorSummaryDto(
    Guid Id,
    string TenantId,
    Guid? LocationId,
    string DisplayName,
    string LegalName,
    string ContactPhone,
    string? ContactEmail,
    string? Description,
    bool Active,
    bool Verified,
    DateTimeOffset CreatedAt,
    bool HasAccount,
    string? AccountEmail,
    DateTimeOffset? AccountRegisteredAt,
    DateTimeOffset? LastLoginAt
);

public record VendorDetailDto(
    Guid Id,
    string TenantId,
    Guid? LocationId,
    string DisplayName,
    string LegalName,
    string ContactPhone,
    string? ContactEmail,
    string? Description,
    bool Active,
    bool Verified,
    DateTimeOffset CreatedAt,
    bool HasAccount,
    string? RegistrationCode,
    string? AccountEmail,
    DateTimeOffset? AccountRegisteredAt,
    DateTimeOffset? LastLoginAt
);

public record VendorAccountRegistrationDto(
    string RegistrationCode,
    string Email,
    string Password
);

public record VendorLoginDto(
    string Email,
    string Password
);

public record VendorSessionResponseDto(
    string AccessToken,
    VendorSummaryDto Vendor
);

public record VendorPortalProductWriteDto(
    string Name,
    string? Description,
    Guid? CategoryId,
    decimal Price,
    int Stock,
    string? ImageUrl
);

public record VendorPortalReservationNoteDto(string? Note);

public record VendorPortalProductDto(
    Guid Id,
    Guid VendorId,
    string? VendorName,
    string Name,
    string? Description,
    decimal Price,
    string? ImageUrl,
    Guid? CategoryId,
    string? Category,
    int StockQuantity,
    int ReservedQuantity,
    bool Active,
    DateTimeOffset CreatedAt
);
