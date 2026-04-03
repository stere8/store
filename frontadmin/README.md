# Frontadmin

`frontadmin` is the admin-only frontend aligned to `EStore.Api`.

## Supported now

- Dashboard
- Vendor listing and create
- Vendor detail view
- Product listing, create, edit, archive
- Category listing, create, edit, delete
- Reservation listing, detail, note updates, status actions
- Customer search/list
- Location listing and create

## Intentionally not reconnected yet

- Campaigns/slides
- Shipping rules
- Payment methods
- Tenant settings / CMS / subscriptions / payouts

Those routes resolve to explicit backend-gap pages instead of dead legacy requests.

## Run

1. Install dependencies with `npm install`
2. Copy `.env.example` to `.env.local` and adjust values if needed
3. Start the app with `npm run dev`

The app runs on `http://localhost:3001` by default.

## Backend follow-up

See [ADMIN_API_FUNCTIONS.md](C:/Users/oracle.admin/Desktop/Workspace/03_Projects/stere8/store/frontadmin/ADMIN_API_FUNCTIONS.md) for the admin API functions still recommended for `EStore.Api`.
