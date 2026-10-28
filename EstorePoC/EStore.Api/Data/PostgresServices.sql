-- Additive upgrade only: no existing product, reservation, customer, or image rows are rewritten.
CREATE TABLE IF NOT EXISTS "Services" (
    "Id" uuid PRIMARY KEY,
    "TenantId" varchar(80) NOT NULL,
    "VendorId" uuid NOT NULL REFERENCES "Vendors" ("Id") ON DELETE RESTRICT,
    "CategoryId" uuid NOT NULL REFERENCES "Categories" ("Id") ON DELETE RESTRICT,
    "Name" varchar(200) NOT NULL,
    "Description" varchar(10000),
    "Price" numeric(18,2) NOT NULL,
    "DurationMinutes" integer NOT NULL,
    "SlotIntervalMinutes" integer NOT NULL,
    "BookingWindowDays" integer NOT NULL,
    "MinimumNoticeMinutes" integer NOT NULL,
    "ImageUrl" varchar(2048),
    "AttributesJson" text NOT NULL,
    "Active" boolean NOT NULL,
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "CK_Services_Duration" CHECK ("DurationMinutes" BETWEEN 5 AND 480),
    CONSTRAINT "CK_Services_Interval" CHECK ("SlotIntervalMinutes" BETWEEN 5 AND 120),
    CONSTRAINT "CK_Services_Window" CHECK ("BookingWindowDays" BETWEEN 1 AND 365),
    CONSTRAINT "CK_Services_Notice" CHECK ("MinimumNoticeMinutes" BETWEEN 0 AND 43200),
    CONSTRAINT "CK_Services_Price" CHECK ("Price" >= 0 AND "Price" = FLOOR("Price"))
);
CREATE INDEX IF NOT EXISTS "IX_Services_TenantId_VendorId_Active" ON "Services" ("TenantId", "VendorId", "Active");
CREATE INDEX IF NOT EXISTS "IX_Services_VendorId" ON "Services" ("VendorId");
CREATE INDEX IF NOT EXISTS "IX_Services_CategoryId" ON "Services" ("CategoryId");

CREATE TABLE IF NOT EXISTS "ServiceSchedules" (
    "Id" uuid PRIMARY KEY,
    "TenantId" varchar(80) NOT NULL,
    "VendorId" uuid NOT NULL REFERENCES "Vendors" ("Id") ON DELETE RESTRICT,
    "TimeZone" varchar(100) NOT NULL,
    "WindowsJson" text NOT NULL,
    "BlockedDatesJson" text NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_ServiceSchedules_TenantId_VendorId" ON "ServiceSchedules" ("TenantId", "VendorId");
CREATE INDEX IF NOT EXISTS "IX_ServiceSchedules_VendorId" ON "ServiceSchedules" ("VendorId");

CREATE TABLE IF NOT EXISTS "ServiceBookings" (
    "Id" uuid PRIMARY KEY,
    "TenantId" varchar(80) NOT NULL,
    "VendorId" uuid NOT NULL REFERENCES "Vendors" ("Id") ON DELETE RESTRICT,
    "ServiceId" uuid NOT NULL REFERENCES "Services" ("Id") ON DELETE RESTRICT,
    "CustomerId" uuid NOT NULL REFERENCES "Customers" ("Id") ON DELETE RESTRICT,
    "CustomerSubject" varchar(80) NOT NULL,
    "ClientBookingId" uuid NOT NULL,
    "ServiceName" varchar(200) NOT NULL,
    "Price" numeric(18,2) NOT NULL,
    "DurationMinutes" integer NOT NULL,
    "StartsAtUtc" timestamp with time zone NOT NULL,
    "RequestedStartsAtUtc" timestamp with time zone NOT NULL,
    "EndsAtUtc" timestamp with time zone NOT NULL,
    "TimeZone" varchar(100) NOT NULL,
    "Status" varchar(16) NOT NULL,
    "Notes" varchar(2000),
    "CreatedAtUtc" timestamp with time zone NOT NULL,
    "UpdatedAtUtc" timestamp with time zone NOT NULL,
    CONSTRAINT "CK_ServiceBookings_Times" CHECK ("EndsAtUtc" > "StartsAtUtc"),
    CONSTRAINT "CK_ServiceBookings_Duration" CHECK ("DurationMinutes" BETWEEN 5 AND 480),
    CONSTRAINT "CK_ServiceBookings_Status" CHECK ("Status" IN ('Pending','Confirmed','Cancelled','Rejected','Completed','NoShow')),
    CONSTRAINT "CK_ServiceBookings_Price" CHECK ("Price" >= 0 AND "Price" = FLOOR("Price"))
);
CREATE UNIQUE INDEX IF NOT EXISTS "IX_ServiceBookings_TenantId_CustomerSubject_ClientBookingId" ON "ServiceBookings" ("TenantId", "CustomerSubject", "ClientBookingId");
CREATE INDEX IF NOT EXISTS "IX_ServiceBookings_VendorCalendar" ON "ServiceBookings" ("TenantId", "VendorId", "Status", "StartsAtUtc", "EndsAtUtc");
CREATE INDEX IF NOT EXISTS "IX_ServiceBookings_TenantId_CustomerId_StartsAtUtc" ON "ServiceBookings" ("TenantId", "CustomerId", "StartsAtUtc");
CREATE INDEX IF NOT EXISTS "IX_ServiceBookings_CustomerId" ON "ServiceBookings" ("CustomerId");
CREATE INDEX IF NOT EXISTS "IX_ServiceBookings_ServiceId" ON "ServiceBookings" ("ServiceId");
CREATE INDEX IF NOT EXISTS "IX_ServiceBookings_VendorId" ON "ServiceBookings" ("VendorId");
