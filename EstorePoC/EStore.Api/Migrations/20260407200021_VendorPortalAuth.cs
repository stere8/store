using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class VendorPortalAuth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AccountEmail",
                table: "Vendors",
                type: "nvarchar(160)",
                maxLength: 160,
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "AccountRegisteredAt",
                table: "Vendors",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "LastLoginAt",
                table: "Vendors",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Vendors",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PasswordSalt",
                table: "Vendors",
                type: "nvarchar(128)",
                maxLength: 128,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RegistrationCode",
                table: "Vendors",
                type: "nvarchar(24)",
                maxLength: 24,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: "chic-complex",
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 7, 20, 0, 20, 306, DateTimeKind.Unspecified).AddTicks(4999), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: "kigali-city-mall",
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 7, 20, 0, 20, 306, DateTimeKind.Unspecified).AddTicks(4994), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.CreateIndex(
                name: "IX_Vendors_TenantId_AccountEmail",
                table: "Vendors",
                columns: new[] { "TenantId", "AccountEmail" },
                unique: true,
                filter: "[AccountEmail] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Vendors_TenantId_ContactEmail",
                table: "Vendors",
                columns: new[] { "TenantId", "ContactEmail" },
                unique: true,
                filter: "[ContactEmail] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_Vendors_TenantId_RegistrationCode",
                table: "Vendors",
                columns: new[] { "TenantId", "RegistrationCode" },
                unique: true,
                filter: "[RegistrationCode] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Vendors_TenantId_AccountEmail",
                table: "Vendors");

            migrationBuilder.DropIndex(
                name: "IX_Vendors_TenantId_ContactEmail",
                table: "Vendors");

            migrationBuilder.DropIndex(
                name: "IX_Vendors_TenantId_RegistrationCode",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "AccountEmail",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "AccountRegisteredAt",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "LastLoginAt",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "PasswordSalt",
                table: "Vendors");

            migrationBuilder.DropColumn(
                name: "RegistrationCode",
                table: "Vendors");

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: "chic-complex",
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 7, 12, 29, 25, 910, DateTimeKind.Unspecified).AddTicks(3667), new TimeSpan(0, 0, 0, 0, 0)));

            migrationBuilder.UpdateData(
                table: "Tenants",
                keyColumn: "Id",
                keyValue: "kigali-city-mall",
                column: "CreatedAt",
                value: new DateTimeOffset(new DateTime(2026, 4, 7, 12, 29, 25, 910, DateTimeKind.Unspecified).AddTicks(3664), new TimeSpan(0, 0, 0, 0, 0)));
        }
    }
}
