using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class PhaseOnePointsReferrals : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomerPointBalances",
                columns: table => new
                {
                    TenantId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Balance = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomerPointBalances", x => new { x.TenantId, x.CustomerId });
                    table.ForeignKey(
                        name: "FK_CustomerPointBalances_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_CustomerPointBalances_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "PointTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<int>(type: "int", nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    SourceType = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    SourceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: true),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PointTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PointTransactions_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PointTransactions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Referrals",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    RecommenderCustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecommendedEmail = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    RecommendedEmailNormalized = table.Column<string>(type: "nvarchar(160)", maxLength: 160, nullable: false),
                    RecommendedCustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(32)", maxLength: 32, nullable: false),
                    RecommenderPointsAwarded = table.Column<int>(type: "int", nullable: false),
                    RecommendedPointsAwarded = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false),
                    MatchedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    AwardedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CancelledAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CancelReason = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Referrals", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Referrals_Customers_RecommendedCustomerId",
                        column: x => x.RecommendedCustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Referrals_Customers_RecommenderCustomerId",
                        column: x => x.RecommenderCustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Referrals_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomerPointBalances_CustomerId",
                table: "CustomerPointBalances",
                column: "CustomerId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_CustomerId",
                table: "PointTransactions",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_TenantId_CustomerId_CreatedAt",
                table: "PointTransactions",
                columns: new[] { "TenantId", "CustomerId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_PointTransactions_TenantId_CustomerId_SourceType_SourceId_Reason",
                table: "PointTransactions",
                columns: new[] { "TenantId", "CustomerId", "SourceType", "SourceId", "Reason" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_RecommendedCustomerId",
                table: "Referrals",
                column: "RecommendedCustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_RecommenderCustomerId",
                table: "Referrals",
                column: "RecommenderCustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_TenantId_RecommendedEmailNormalized_Status",
                table: "Referrals",
                columns: new[] { "TenantId", "RecommendedEmailNormalized", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_TenantId_RecommenderCustomerId_CreatedAt",
                table: "Referrals",
                columns: new[] { "TenantId", "RecommenderCustomerId", "CreatedAt" });

            migrationBuilder.CreateIndex(
                name: "IX_Referrals_TenantId_RecommenderCustomerId_RecommendedEmailNormalized",
                table: "Referrals",
                columns: new[] { "TenantId", "RecommenderCustomerId", "RecommendedEmailNormalized" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomerPointBalances");

            migrationBuilder.DropTable(
                name: "PointTransactions");

            migrationBuilder.DropTable(
                name: "Referrals");
        }
    }
}
