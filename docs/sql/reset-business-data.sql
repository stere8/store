-- Intentionally clears Aiven business records. Keep the API quiet while executing.
-- Keep Tenants and migration/schema-version records.
-- This is a manual one-time operation, never a startup script.
BEGIN;
TRUNCATE TABLE
    "ChatMessages", "ChatConversations", "CategoryFields",
    "CustomerIdentityIgnores", "CustomerPointBalances", "PointTransactions", "Referrals",
    "Reviews", "ShoppingCartItems", "ShoppingCarts", "ReservationItems", "Reservations",
    "Products", "Customers", "Categories", "Vendors", "Locations"
RESTART IDENTITY CASCADE;
COMMIT;
