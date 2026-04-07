using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class CustomerReconciliationControls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTimeOffset>(
                name: "ArchivedAt",
                table: "Customers",
                type: "datetimeoffset",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ArchivedReason",
                table: "Customers",
                type: "nvarchar(240)",
                maxLength: 240,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsArchived",
                table: "Customers",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "CustomerIdentityIgnores",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    IssueType = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    SubjectKey = table.Column<string>(type: "nvarchar(120)", maxLength: 120, nullable: false),
                    Fingerprint = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerIdentityIgnores", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomerIdentityIgnores_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerIdentityIgnores_TenantId_IssueType_SubjectKey",
                table: "CustomerIdentityIgnores",
                columns: new[] { "TenantId", "IssueType", "SubjectKey" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerIdentityIgnores");

            migrationBuilder.DropColumn(
                name: "ArchivedAt",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "ArchivedReason",
                table: "Customers");

            migrationBuilder.DropColumn(
                name: "IsArchived",
                table: "Customers");
        }
    }
}
