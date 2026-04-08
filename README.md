# EStore Workspace

This workspace now runs around `EStore.Api` as the source of truth. The old Mongo-backed `api-admin` setup is no longer the active architecture.

## Active apps

1. `EstorePoC/EStore.Api`
   .NET API backed by SQL Server / LocalDB, including products, categories, vendors, customers, carts, reviews, locations, and reservations.
2. `front-store`
   Customer storefront aligned to the reservation-based `EStore.Api` flow.
3. `frontadmin`
   Admin-only frontend aligned to `EStore.Api`.
4. `frontvendor`
   Dedicated vendor-facing frontend under separate development.

## Current direction

- Database authority is `EStore.Api`, not MongoDB.
- Admin and vendor experiences are being split into separate frontends.
- `frontadmin` only contains admin workflows.
- Unsupported admin domains stay visible as placeholders until the API grows to support them.

## Quick start

1. Start the API.

```bash
cd EstorePoC/EStore.Api
dotnet build
dotnet run
```

`EStore.Api` now requires a real `ConnectionStrings:DefaultConnection` and uses LocalDB by default from [`EstorePoC/EStore.Api/appsettings.json`](E:/Workspace/03_Projects/stere8/store/EstorePoC/EStore.Api/appsettings.json), so data persists across restarts instead of falling back to an in-memory database.

2. Start the storefront.

```bash
cd front-store
npm install
npm run dev
```

3. Start the admin frontend.

```bash
cd frontadmin
npm install
npm run dev
```

## Frontend environment

`front-store` and `frontadmin` both point to `EStore.Api`.

Example `frontadmin/.env.local`:

```env
NEXT_PUBLIC_ESTORE_API_URL=http://localhost:5000
NEXT_PUBLIC_ESTORE_TENANT_ID=kigali-city-mall
NEXT_PUBLIC_ESTORE_CURRENCY=USD
```

Example `front-store/.env.local`:

```env
NEXT_PUBLIC_ESTORE_API_URL=http://localhost:5000
NEXT_PUBLIC_ESTORE_TENANT_ID=kigali-city-mall
```

## Notes

- `frontadmin` runs on `http://localhost:3001` by default.
- `front-store` typically runs on `http://localhost:3000`.
- Admin API gaps and recommended backend additions are documented in [frontadmin/ADMIN_API_FUNCTIONS.md](C:/Users/oracle.admin/Desktop/Workspace/03_Projects/stere8/store/frontadmin/ADMIN_API_FUNCTIONS.md).
