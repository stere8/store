using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EStore.Api.Migrations
{
    /// <inheritdoc />
    public partial class ServicesCalendarBookings : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Services",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    VendorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CategoryId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", maxLength: 10000, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    SlotIntervalMinutes = table.Column<int>(type: "int", nullable: false),
                    BookingWindowDays = table.Column<int>(type: "int", nullable: false),
                    MinimumNoticeMinutes = table.Column<int>(type: "int", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(2048)", maxLength: 2048, nullable: true),
                    AttributesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Active = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                    table.CheckConstraint("CK_Services_Duration", "\"DurationMinutes\" BETWEEN 5 AND 480");
                    table.CheckConstraint("CK_Services_Interval", "\"SlotIntervalMinutes\" BETWEEN 5 AND 120");
                    table.CheckConstraint("CK_Services_Notice", "\"MinimumNoticeMinutes\" BETWEEN 0 AND 43200");
                    table.CheckConstraint("CK_Services_Price", "\"Price\" >= 0 AND \"Price\" = FLOOR(\"Price\")");
                    table.CheckConstraint("CK_Services_Window", "\"BookingWindowDays\" BETWEEN 1 AND 365");
                    table.ForeignKey(
                        name: "FK_Services_Categories_CategoryId",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Services_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServiceSchedules",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    VendorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    WindowsJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BlockedDatesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceSchedules_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServiceBookings",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TenantId = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    VendorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CustomerSubject = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    ClientBookingId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ServiceName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: false),
                    DurationMinutes = table.Column<int>(type: "int", nullable: false),
                    StartsAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RequestedStartsAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EndsAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TimeZone = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(16)", maxLength: 16, nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(2000)", maxLength: 2000, nullable: true),
                    CreatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAtUtc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceBookings", x => x.Id);
                    table.CheckConstraint("CK_ServiceBookings_Duration", "\"DurationMinutes\" BETWEEN 5 AND 480");
                    table.CheckConstraint("CK_ServiceBookings_Price", "\"Price\" >= 0 AND \"Price\" = FLOOR(\"Price\")");
                    table.CheckConstraint("CK_ServiceBookings_Status", "\"Status\" IN ('Pending','Confirmed','Cancelled','Rejected','Completed','NoShow')");
                    table.CheckConstraint("CK_ServiceBookings_Times", "\"EndsAtUtc\" > \"StartsAtUtc\"");
                    table.ForeignKey(
                        name: "FK_ServiceBookings_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceBookings_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceBookings_Vendors_VendorId",
                        column: x => x.VendorId,
                        principalTable: "Vendors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceBookings_CustomerId",
                table: "ServiceBookings",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceBookings_ServiceId",
                table: "ServiceBookings",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceBookings_TenantId_CustomerId_StartsAtUtc",
                table: "ServiceBookings",
                columns: new[] { "TenantId", "CustomerId", "StartsAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceBookings_TenantId_CustomerSubject_ClientBookingId",
                table: "ServiceBookings",
                columns: new[] { "TenantId", "CustomerSubject", "ClientBookingId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceBookings_VendorCalendar",
                table: "ServiceBookings",
                columns: new[] { "TenantId", "VendorId", "Status", "StartsAtUtc", "EndsAtUtc" });

            migrationBuilder.CreateIndex(
                name: "IX_ServiceBookings_VendorId",
                table: "ServiceBookings",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_CategoryId",
                table: "Services",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_TenantId_VendorId_Active",
                table: "Services",
                columns: new[] { "TenantId", "VendorId", "Active" });

            migrationBuilder.CreateIndex(
                name: "IX_Services_VendorId",
                table: "Services",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSchedules_TenantId_VendorId",
                table: "ServiceSchedules",
                columns: new[] { "TenantId", "VendorId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceSchedules_VendorId",
                table: "ServiceSchedules",
                column: "VendorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ServiceBookings");

            migrationBuilder.DropTable(
                name: "ServiceSchedules");

            migrationBuilder.DropTable(
                name: "Services");
        }
    }
}
