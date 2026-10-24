# Services and Calendar Bookings: Backend Handoff

## Scope and separation

Services are separate offerings, not products with a special pickup time. A vendor may sell products and offer services simultaneously. A service describes a repeatable offering (haircut, consultation, etc.); each customer's selected date/time belongs to a separate booking.

New tables: Services, ServiceSchedules, ServiceBookings. Products, stock, shopping carts, pickup reservations, their expiry, and existing image URLs are not migrated or repurposed. The PostgreSQL upgrade is additive, versioned and transactional. It creates the three new tables/indexes once; restarting does not clear records or reseed demo data. SQL Server has a matching EF migration.

This is appointment scheduling, not a payment gateway or medical-record system. Do not store medical diagnoses/treatment details in notes or category fields. No fees are automatically charged or included. The independent platform-fee quote can be used later, but does not affect saved service prices or bookings.

## Resource model

- One vendor is one appointment resource in this release: only one Pending/Confirmed appointment at a time, across ALL that vendor's services.
- Different vendors can accept appointments simultaneously.
- Multiple staff, rooms, seats, group sessions, per-service parallel capacity, and external calendar synchronization are not implemented.
- Vendors set weekly opening windows and closed dates, then publish service offerings with prices/durations.
- No schedule means no bookable slots. No made-up default opening hours.
- Customers choose a published slot weeks ahead; there is no pickup-reservation expiry on a booking.
- Pending appointments reserve their time until confirmed, rejected, cancelled, rescheduled, or completed under the allowed transitions. There is no automatic pending-request timeout.
- Accepted bookings snapshot service name, price, duration and time zone. Later catalog edits do not rewrite those agreed values.

## Shared conventions and authentication

Base URL after merge/deployment: https://estore-api-zxuh.onrender.com. These new routes are not live merely because a feature branch exists.

Use X-Tenant-Id consistently. Default tenant: kigali-city-mall. UUIDs identify services/bookings; all JSON names are camelCase. Money is whole nonnegative RWF. Date-only query values use YYYY-MM-DD. Appointment inputs must include Z or an explicit offset, e.g. 2026-11-09T09:00:00+02:00. The server stores UTC and returns UTC timestamps plus the named calendar time zone.

Administrator: Authorization: Bearer <admin-token>. Vendor: X-Vendor-Access-Token: <vendor-token> (or vendor Bearer). Customer: Authorization: Bearer <verified-Clerk-session-token>, linked to an active local customer profile. Existing Clerk backend issuer/origin configuration must be enabled for customer booking calls; a local user ID alone is not authentication.

The server derives vendor/customer ownership. Administrator, vendor, and customer routes are distinct; an administrator does not impersonate a customer through the customer route.

## 1. Category requirements

Use existing category routes and GET /api/categories/{id}/form. Services use the same typed category definitions and inheritance as products, stored as their own attributes JSON.

Example: create a root Services category, then Barbers and Consultations children with appropriate requirements. The API does not hardcode category names or add a product/service discriminator to existing categories. Choose suitable categories; their required fields must be satisfied.

Category deletion now also rejects active services (409), preserving valid references. Changing definitions still does not bulk-migrate existing values; the next service edit validates the current effective form.

## 2. Vendor service CRUD

| Method | Path | Result |
| --- | --- | --- |
| GET | /api/vendor-portal/services | Own services, including inactive, array |
| GET | /api/vendor-portal/services/{id} | Own service detail, including inactive |
| POST | /api/vendor-portal/services | Create own offering, 201 |
| PUT | /api/vendor-portal/services/{id} | Edit/reactivate own offering, 200 |
| DELETE | /api/vendor-portal/services/{id} | Soft-deactivate, 204 |

Example create:

```json
{
  "name": "Haircut",
  "description": "A standard haircut",
  "categoryId": "<actual-category-uuid>",
  "price": 5000,
  "durationMinutes": 30,
  "slotIntervalMinutes": 15,
  "bookingWindowDays": 90,
  "minimumNoticeMinutes": 60,
  "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/<asset>.jpg",
  "attributes": {},
  "active": true
}
```

Fill attributes with the selected category's required values. Omit vendorId on vendor writes; supplying it is rejected. Administrator creation requires vendorId. Existing services cannot be transferred to a different vendor.

| Property | Rule |
| --- | --- |
| name | Required, <=200 trimmed characters |
| description | Optional, <=10000 characters |
| categoryId | Required active category in this tenant |
| price | Whole nonnegative RWF, <=9999999999999999 |
| durationMinutes | Required integer, 5-480 |
| slotIntervalMinutes | Integer, 5-120; default 15 |
| bookingWindowDays | Integer, 1-365; default 90 |
| minimumNoticeMinutes | Integer, 0-43200; default 60, not longer than booking window |
| imageUrl | Optional HTTPS URL, <=2048, no embedded credentials |
| attributes | Object validated against effective category requirements |
| active | Optional boolean; new services default active, edit omission preserves current state |

Slot interval controls start-time spacing. A 30-minute service with a 15-minute interval can initially offer 09:00, 09:15, 09:30, etc.; accepting 09:00 removes every start that would overlap its 09:00-09:30 interval.

On edit, send required fixed fields. Omitted/null attributes preserve and revalidate saved attributes; a supplied object replaces the complete object. Omitted/null imageUrl preserves the saved image; empty string explicitly clears. Description follows the supplied full edit, including null/omission clearing it. Booking-policy omissions take the documented defaults, not arbitrary PATCH semantics.

Existing bookings retain original service name/price/duration after edits. Deactivation hides the offering and prevents new bookings, but preserves existing appointments/history. Existing appointments should still be honoured or explicitly cancelled; deleting an offering does not silently cancel them.

Use existing authenticated POST /api/uploads/images to upload service images. Then save its returned URL, as with product images. Existing assets are not deleted/reuploaded. There is no Cloudinary cleanup/delete side effect.

## 3. Public and administrator service catalog

| Method | Path | Access |
| --- | --- | --- |
| GET | /api/services | Public active services of active/verified vendors |
| GET | /api/services/{id} | Public active detail |
| GET | /api/services/{id}/availability | Public bookable starts only; no customer/private booking data |
| GET | /api/admin/services | Admin list, including inactive |
| GET | /api/admin/services/{id} | Admin detail, including inactive |
| POST | /api/admin/services | Admin create, includes vendorId |
| PUT | /api/admin/services/{id} | Admin edit; cannot transfer vendor |
| DELETE | /api/admin/services/{id} | Admin soft-deactivate |

Public/admin lists accept optional vendorId/categoryId and page/pageSize. page 1-10000; pageSize 1-100, default 20. Response:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 20,
  "hasMore": false
}
```

Service detail includes id, vendorId, vendorName, vendorLogoUrl, categoryId, category, name, description, price, durationMinutes, slotIntervalMinutes, bookingWindowDays, minimumNoticeMinutes, imageUrl, attributes, active, createdAt, updatedAt.

## 4. Configure the vendor calendar

| Method | Path | Access |
| --- | --- | --- |
| GET | /api/vendor-portal/service-schedule | Own vendor calendar |
| PUT | /api/vendor-portal/service-schedule | Own complete replacement |
| GET | /api/admin/vendors/{vendorId}/service-schedule | Admin calendar read |
| PUT | /api/admin/vendors/{vendorId}/service-schedule | Admin calendar replacement |

Example PUT:

```json
{
  "timeZone": "Africa/Kigali",
  "windows": [
    { "dayOfWeek": 1, "startTime": "09:00", "endTime": "12:00" },
    { "dayOfWeek": 1, "startTime": "13:00", "endTime": "17:00" },
    { "dayOfWeek": 2, "startTime": "09:00", "endTime": "17:00" }
  ],
  "blockedDates": ["2026-12-25"]
}
```

dayOfWeek uses 0=Sunday, 1=Monday, ..., 6=Saturday. HH:mm is 24-hour local time. End can be 24:00. Windows must not overlap/repeat; adjacent windows are fine. Overnight windows must be split across days. At most 50 weekly windows and 366 distinct closed dates. All time zones must be valid; use Africa/Kigali for Rwanda.

This is complete replacement: windows is required, [] closes all days; blockedDates omitted/null means no closed-date exceptions. Preserve all intended windows/exceptions when saving. A new schedule that would invalidate a future/in-progress Pending/Confirmed booking returns 409; reschedule/cancel those bookings first.

Reading an unset calendar returns empty windows with the tenant/default time zone. That is not a published 24/7 schedule.

DST ambiguous/nonexistent local times are not offered, and a slot crossing a DST offset change is excluded if its real elapsed duration would differ. UTC instants, not a browser's local time, identify bookings.

## 5. Read available dates/times

GET /api/services/{id}/availability?from=2026-11-09&to=2026-11-16

from is inclusive; to is exclusive, interpreted as dates in the vendor calendar's named zone. Query a future/current local date range, maximum 31 days at a time, within the next 366 days. Offering notice/horizon limits also apply. Beyond its allowed booking window a service has no offered slots.

```json
{
  "serviceId": "<service-uuid>",
  "timeZone": "Africa/Kigali",
  "from": "2026-11-09",
  "to": "2026-11-16",
  "durationMinutes": 30,
  "slotIntervalMinutes": 15,
  "slots": [
    { "startsAt": "2026-11-09T07:00:00Z", "endsAt": "2026-11-09T07:30:00Z" }
  ]
}
```

07:00 UTC is 09:00 in Kigali. Availability is advisory until the booking POST succeeds; another customer can take the slot in between. Always handle 409 and refresh. Shared vendor bookings exclude overlaps across all its services, not just this offering. Adjacent intervals ending/starting at the same instant do not overlap.

## 6. Customer booking flow

Customer sign-in -> authenticated own profile sync (POST /api/customers) -> choose service -> read availability -> submit the exact selected start.

| Method | Path | Purpose |
| --- | --- | --- |
| POST | /api/service-bookings | Customer books own appointment |
| GET | /api/service-bookings | Customer's own calendar/history |
| GET | /api/service-bookings/{id} | Own detail |
| PUT | /api/service-bookings/{id}/reschedule | Move future active appointment |
| POST | /api/service-bookings/{id}/cancel | Cancel own future appointment |

Example POST:

```json
{
  "serviceId": "<service-uuid>",
  "startsAt": "2026-11-09T09:00:00+02:00",
  "clientBookingId": "<new-UUID-for-this-intended-booking>",
  "notes": "Please confirm this appointment"
}
```

Do not send customerId on a customer request. Do not send price, duration, vendor ownership or an end time; the server derives these. Notes are optional, <=2000 characters, trimmed; not a place for medical records. A local date/time without Z/offset is rejected.

New booking returns 201, status Pending. It includes id, serviceId, vendorId/vendorName, customerId/customerName, snapshotted serviceName, price, durationMinutes, startsAt, endsAt, timeZone, status, notes, clientBookingId, createdAt and updatedAt. No charge/payment occurs.

## 7. Staff bookings and calendar management

Vendor routes:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/vendor-portal/service-bookings | Own vendor calendar/history |
| GET | /api/vendor-portal/service-bookings/{id} | Own booking detail |
| POST | /api/vendor-portal/service-bookings | Book own service for a known linked customer |
| PUT | /api/vendor-portal/service-bookings/{id}/reschedule | Move own appointment |
| PATCH | /api/vendor-portal/service-bookings/{id}/status | Confirm/reject/cancel/complete/no-show |

Administrator routes:

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/admin/service-bookings | Tenant calendar/history |
| GET | /api/admin/service-bookings/{id} | Tenant booking detail |
| POST | /api/admin/service-bookings | Book for known linked customer |
| PUT | /api/admin/service-bookings/{id}/reschedule | Move tenant appointment |
| PATCH | /api/admin/service-bookings/{id}/status | Tenant status management |

Staff POST uses the customer booking body plus customerId (local database UUID), which must identify an active Clerk-linked profile. Vendor ownership comes from the token and must match the service. No guest/customer-directory feature is introduced for vendors.

All booking lists accept page/pageSize (same bounds/defaults as catalog), optional serviceId/vendorId, status, and ISO from/to. They return {items,page,pageSize,hasMore}. from/to match appointments overlapping the UTC interval, not merely created during it. End boundary is exclusive. Customer/vendor filtering cannot widen ownership.

An unrelated customer/vendor gets 404 for another actor's detail/mutations; missing/invalid/unsuitable session gets 401. Admin routes require tenant-scoped admin authorization. Anonymous reads do not reveal personal appointment details.

## 8. Status transitions

PATCH staff status body:

```json
{ "status": "Confirmed" }
```

- Pending -> Confirmed, before appointment start.
- Pending -> Rejected or Cancelled.
- Confirmed -> Cancelled.
- Confirmed -> Completed, only after end.
- Confirmed -> NoShow, only after start.
- Cancelled, Rejected, Completed, NoShow are terminal; no reactivation.
- Repeating the current valid status returns 200 without rewriting history.
- Invalid status strings return 400; invalid transitions return 409.

Customers can only cancel their own Pending/Confirmed future appointment; they cannot mark it Confirmed/Completed/NoShow. Staff can manage their scope. Customer repeated cancellation is idempotent. There is no automatic payment/refund/cancellation fee.

## 9. Rescheduling and retries

PUT /.../service-bookings/{id}/reschedule:

```json
{ "startsAt": "2026-11-16T09:00:00+02:00" }
```

Only future Pending/Confirmed bookings can move. The new slot must fit the current vendor schedule and service notice/horizon, be grid-aligned, and not overlap another booking. Price/duration snapshots remain agreed values; an earlier booking does not become more expensive/longer because the listing changed. Rescheduling an inactive service/vendor is rejected; cancellation/history remain available to authorized actors.

The existing slot is moved only after all checks pass under the same database lock/transaction. A conflict must not lose the original appointment.

clientBookingId is a create-request idempotency key, scoped to tenant/customer subject:
- Generate once per intended booking; retain for network retries.
- Same original service/start/normalized notes/key -> 200 with the existing booking.
- Different original input with the same key -> 409.
- A deliberate new booking gets a new key.
- A retry after rescheduling still matches the original request and returns the booking's current state; it does not move it back.

Concurrent requests with different keys cannot both take overlapping time. Same-key concurrent retries create one record. The lock is database-backed and shared across API processes. Application writes to offerings, schedules, and bookings use the same vendor lock. Raw SQL writes that bypass the API are not protected by these application rules.

## 10. Preservation, deployment and verification

- No product conversion/rebuild, stock edits, reservation expiry changes, or business-data reset.
- Service soft deletion retains bookings; existing-image URLs are preserved on unrelated edits.
- Customer deletion with service history archives/anonymizes its existing customer record instead of deleting referenced booking history. Existing future appointments are not silently cancelled; administrators must handle them deliberately.
- PostgreSQL startup applies PostgresServices.sql once inside the existing schema-version transaction/advisory lock; it is safe to restart and rerun.
- SQL Server migration is generated and compile/script checked; PostgreSQL is the integration-tested provider.
- Do not run the historical business-data reset as part of deploying this feature.
- No live Aiven data was used for these tests, and the branch is not automatically merged/deployed.

Coverage includes whole-RWF/type/policy validation; Kigali UTC conversion; DST handling; lead time/horizon; schedule overlaps; customer/vendor/admin ownership; shared-vendor overlaps; independent vendors; concurrent idempotent retries; concurrent competing bookings; schedule-vs-booking races; snapshots; rescheduling/cancellation; image preservation; booking retention; Swagger contract; and running an additive upgrade twice while preserving an existing product price, stock and image.

Implementation uses built-in .NET date/time APIs and the existing PostgreSQL/SQL Server clients. References: [PostgreSQL transaction/advisory locks](https://www.postgresql.org/docs/current/explicit-locking.html), [Npgsql UTC timestamp handling](https://www.npgsql.org/doc/types/datetime.html).
