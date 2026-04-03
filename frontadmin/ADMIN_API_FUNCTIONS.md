# Recommended Admin API Functions

This file captures the frontend-driven gaps discovered while refactoring `frontadmin` against `EStore.Api`.

## Vendor administration

- `GET /api/vendors/{id}`
- `PUT /api/vendors/{id}`
- `PATCH /api/vendors/{id}/status`
- `PATCH /api/vendors/{id}/verify`
- `DELETE /api/vendors/{id}`

## Location administration

- `GET /api/locations/{id}`
- `PUT /api/locations/{id}`
- `DELETE /api/locations/{id}`

## Product administration

- `GET /api/products?vendorId={id}&categoryId={id}&q={term}&active={bool}`
- `PATCH /api/products/{id}/status`
- `PATCH /api/products/{id}/inventory`
- `GET /api/products/{id}/reviews`
- `DELETE /api/reviews/{id}` or `PATCH /api/reviews/{id}/publish`

## Category administration

- `GET /api/categories/{id}`
- `GET /api/categories/{id}/products`

## Reservation administration

- `GET /api/reservations?status=&vendorId=&customerId=&from=&to=`
- `PATCH /api/reservations/{id}/status`
  - Single status endpoint can replace multiple action-specific endpoints if preferred
- `PATCH /api/reservations/{id}/vendor-note`
- `PATCH /api/reservations/{id}/assign`

## Customer administration

- `PUT /api/customers/{id}`
- `DELETE /api/customers/{id}` or `PATCH /api/customers/{id}/status`
- `GET /api/customers/{id}/reservations`

## Tenant/admin configuration

- `GET /api/tenant-settings`
- `PUT /api/tenant-settings`
- `PATCH /api/tenant-settings/branding`
- `PATCH /api/tenant-settings/reservation-policy`

## Merchandising and CMS

- `GET /api/campaigns`
- `GET /api/campaigns/{id}`
- `POST /api/campaigns`
- `PUT /api/campaigns/{id}`
- `DELETE /api/campaigns/{id}`
- `POST /api/campaigns/{id}/publish`
- `GET /api/cms/pages`
- `POST /api/cms/pages`
- `PUT /api/cms/pages/{id}`
- `DELETE /api/cms/pages/{id}`

## Checkout/policy domains still missing from admin

- Shipping rules CRUD
- Payment methods CRUD
- Brand / tag / collection CRUD
- Vendor payout / withdrawal workflows
- Subscription / billing workflows
