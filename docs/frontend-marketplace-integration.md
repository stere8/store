# Frontend integration: admin login, vendor logos, category forms, and chat

This guide describes the backend contracts added in October 2026. Implement the screens in the active storefront, vendor portal, and frontadmin projects. nextadmin is obsolete; do not install or build it.

API base: https://estore-api-zxuh.onrender.com
Swagger UI: https://estore-api-zxuh.onrender.com/swagger/index.html
OpenAPI JSON: https://estore-api-zxuh.onrender.com/swagger/v1/swagger.json

## 1. Database and shared conventions

The API uses Aiven PostgreSQL. Automatic demo catalog seeding is disabled by default.
An explicit reset clears business records. Deploying or restarting the API does not reset data.
Two existing tenant configuration records are retained; these are infrastructure configuration, not dummy customers or products.

Use the same tenant for every request in a session:

```http
X-Tenant-Id: kigali-city-mall
```

The default tenant is kigali-city-mall. chic-complex is the other existing configured tenant.
IDs are UUIDs, except chat message IDs, which are increasing integers. JSON property names are camelCase.
Times are UTC ISO 8601 strings. Price is a whole, nonnegative RWF amount. Send 30000, not "30,000" or 30.5.
A display separator in the UI is independent of the numeric amount stored by the API.

Handle 400 as input validation, 401 as a missing/invalid login, 403 as insufficient permission,
404 as missing/inaccessible records, 409 as a conflict, 429 as a login rate limit,
502 as an upload-provider failure, and 503 as missing server configuration.
Do not automatically retry a failed write unless the endpoint explicitly supports idempotency.

## 2. Authentication boundaries

| Caller | Credential | What it is for |
| --- | --- | --- |
| Administrator | JWT from POST /api/admin-auth/login | Administration, category definitions, product administration, vendor approval/logo administration |
| Vendor | Existing opaque vendor token from vendor-auth | Own products, own logo, own conversations |
| Customer | Clerk session JWT | Own customer profile and own conversations |
| Visitor | No credential | Active catalog, category definitions, public vendor profile |

Admin login is separate from seller login and Clerk customer login.
A Clerk login does not make someone an administrator. Vendor tokens do not grant admin permissions.
Admin tokens do not grant access to private vendor/customer chat.

### Admin backend environment

Oreste supplies these values in Render's backend environment. The checked-in
.env.example is a template only; .NET does not automatically load a .env file:

```dotenv
ADMIN_EMAIL=<your-admin-email>
ADMIN_LOGIN_CODE=<your-private-code-at-least-8-characters>
ADMIN_TOKEN_SECRET=<random-secret-at-least-32-UTF8-bytes>
ADMIN_TENANT_ID=kigali-city-mall
SEED_DEMO_DATA=false
```

Do not commit these credentials, expose them in NEXT_PUBLIC variables, or put the correct code in browser code.
The email and code are a reusable configured login, not an emailed one-time code.
Missing or too-short settings disable admin login with 503; protected actions remain protected.
Tokens expire after two hours. Rotating ADMIN_TOKEN_SECRET invalidates all admin sessions.
Login permits five attempts per source IP per minute on each API process.

### Admin frontend flow

1. Render an email and private-code login form.
2. POST the entered values to /api/admin-auth/login.
3. Keep the returned token in an HttpOnly, Secure cookie in the frontend's server layer.
4. Forward it as Authorization: Bearer <accessToken> from server-side API calls.
5. Verify the session with GET /api/admin-auth/me.
6. On logout, clear that cookie. On expiry/401, send the administrator to login.
   There is no backend logout/refresh endpoint; discarding the frontend token ends that frontend session.

Request:

```json
{ "email": "<entered-email>", "code": "<entered-code>" }
```

Response, 200:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresAt": "2026-10-04T23:00:00+00:00",
  "email": "<configured-email>",
  "tenantId": "kigali-city-mall"
}
```

Always send the matching X-Tenant-Id. An admin token is restricted to ADMIN_TENANT_ID.
Existing frontadmin API helpers/server actions must forward this token. A frontend-only route guard is insufficient.

These existing routes now require admin credentials:

- Category creation, updates, definition updates, deletion, and subcategory creation.
- POST/PUT/DELETE /api/products and the /api/admin group.
- POST /api/locations; GET /api/vendors/{id}; PATCH /api/vendors/{id}/approve.
- GET /api/reservations; GET /api/vendors/{vendorId}/reservations.
- PATCH /api/reservations/{id}/status and /note; POST /api/reservations/maintenance/expire.
- Customer lists/search/archive/deletion and reconciliation controls.
- PUT /api/vendors/{id}/logo.

Other pre-existing shopping/reservation endpoints keep their existing contracts.
This update does not claim to replace all legacy customer authorization throughout carts, reservations, points, or referrals.

### Customer chat verification

Configure these on the backend, using the same Clerk instance as the storefront:

```dotenv
CLERK_JWT_ISSUER=https://<your-instance>.clerk.accounts.dev
CLERK_AUTHORIZED_PARTIES=https://<your-storefront-origin>,http://localhost:3000
# Optional: paste the Clerk PEM public key for local verification.
# Without this, the API fetches the instance's JWKS signing keys.
CLERK_JWT_KEY=<optional-PEM-public-key>
```

An origin includes its scheme and port and has no path or trailing slash.
Use Clerk's actual custom issuer when production uses a custom Clerk domain.
The API verifies RS256 signatures, issuer, expiry, allowed origin (azp when present), and rejects pending sessions.
It never treats a submitted customerId or username as authentication.

References: [Clerk session token verification](https://clerk.com/docs/guides/sessions/manual-jwt-verification),
[Clerk session token claims](https://clerk.com/docs/guides/sessions/session-tokens).

From a signed-in storefront component, obtain a fresh Clerk token with getToken() and send it as Bearer.
First sync the local profile through POST /api/customers:

```json
{
  "username": "user_<actual-Clerk-user-id>",
  "fullName": "Customer name",
  "phoneNumber": "+2507...",
  "email": "customer@example.com",
  "preferredLanguage": "en"
}
```

username must equal the signed token's sub, which is the actual Clerk user ID such as user_abc123.
It is not a display name. The example prefix above illustrates the format; do not prepend user_ to an ID that already has it.
An admin may sync customer profiles too. A customer cannot take over another profile by submitting its ID or phone.
Existing webhooks/server sync jobs need an admin token; customer-initiated sync uses the customer's Clerk token.
GET /api/customers/{id} permits the linked customer or an admin.
Chat needs an active linked customer profile. A missing/archived local profile makes chat return 401.
Deleting a customer with conversation history archives and anonymizes the profile;
it retains the stored conversation for the other participant. This is not a
full legal data-erasure workflow.

### Vendor sessions

Keep the existing /api/vendor-auth/register, /login, and /session flow.
Send either X-Vendor-Access-Token: <token> or Authorization: Bearer <vendor-token>.
Use one actor's credential per chat request, not both a customer and vendor token.
Current vendor tokens use the existing Data Protection implementation and can become invalid on container replacement.
The vendor frontend should send the user back to vendor login after 401.

## 3. Vendor logo

There is one logoUrl per vendor. This is an optional HTTPS image URL.
An omitted logo is shown using a frontend fallback. Do not replace missing logos with fabricated URLs.

### Upload and save

1. POST the selected file to /api/uploads/images as multipart/form-data, field name file.
2. Authenticate that upload as an admin or vendor.
3. Read the returned url.
4. Save it using PUT /api/vendor-portal/logo for the logged-in vendor.
5. Display logoUrl from the vendor session/profile.

```json
{ "logoUrl": "https://res.cloudinary.com/<cloud>/image/upload/<asset>.png" }
```

Admin alternative: PUT /api/vendors/{vendorId}/logo, with admin credentials.
To clear a logo, explicitly send { "logoUrl": null } or an empty string to the logo endpoint.
An unrelated product edit does not alter the vendor logo.

Read public store branding through GET /api/vendors/{vendorId}/profile.
It returns id, displayName, description, logoUrl, verified, and locationId, without registration codes or account credentials.
Vendor summary/detail/session responses also include logoUrl.
Product catalog responses include vendorLogoUrl.

Upload limits: 5 MB; JPEG, PNG, WebP, GIF, or AVIF.
The generic endpoint stores assets through the existing Cloudinary setup; it is reusable for products and logos.
Let the browser set multipart boundaries. Do not manually set Content-Type when using FormData.
Uploading returns a URL; it does not automatically save that URL to a vendor or product.
Replacing/clearing a URL does not delete the old Cloudinary asset. Existing image URLs are not rewritten.

```ts
const form = new FormData();
form.append("file", file);
const response = await fetch(apiBase + "/api/uploads/images", {
  method: "POST",
  headers: { "X-Tenant-Id": tenantId, "X-Vendor-Access-Token": vendorToken },
  body: form
});
if (!response.ok) throw new Error("Image upload failed");
const uploaded = await response.json();
await vendorApi("/api/vendor-portal/logo", {
  method: "PUT",
  body: JSON.stringify({ logoUrl: uploaded.url })
});
```

## 4. Categories and subcategories

Categories have at most two levels: a top-level category and its subcategories.
A subcategory uses the same category entity and has parentCategoryId set to its parent ID.

| Method | Path | Access | Result |
| --- | --- | --- | --- |
| GET | /api/categories | Public | Flat active list, each entry includes its own field definitions |
| GET | /api/categories?parentCategoryId={id} | Public | Active children of that parent |
| GET | /api/categories/{id} | Public | One active category |
| GET | /api/categories/{id}/subcategories | Public | Active children; parent must be top-level |
| GET | /api/categories/{id}/form | Public | Effective form, including inherited fields |
| POST | /api/categories | Admin | Create root or child with optional fields |
| POST | /api/categories/{id}/subcategories | Admin | Create a child under that root |
| PUT | /api/categories/{id} | Admin | Edit name/description and optionally replace fields |
| PUT | /api/categories/{id}/fields | Admin | Replace own field definitions |
| DELETE | /api/categories/{id} | Admin | Soft-delete; 409 if active children/products use it |

Root entries have parentCategoryId: null. Build a tree in the frontend from the flat list.
Do not request another nested level: the backend rejects a child-of-child.
Names are unique within a tenant and parent, including inactive records.
Creating subcategories with the same name under different parents is supported.
Editing an existing child must include its current parentCategoryId; reparenting is not supported.

A DELETE does not remove historical product/category references.
Fields omitted/null on category PUT keep the existing definitions.
fields: [] explicitly removes its own field definitions.
The /fields endpoint expects { "fields": [...] } and treats the array as the complete replacement.

### Category creation with its form

```json
{
  "name": "Clothes",
  "description": "Clothing and accessories",
  "fields": [
    {
      "key": "size",
      "label": "Size",
      "dataType": "Select",
      "required": true,
      "placeholder": "Choose a size",
      "options": ["XS", "S", "M", "L", "XL"],
      "sortOrder": 10
    },
    {
      "key": "origin",
      "label": "Country of origin",
      "dataType": "Text",
      "required": true,
      "placeholder": "Rwanda",
      "maxLength": 80,
      "sortOrder": 20
    },
    {
      "key": "previously_used",
      "label": "Previously used",
      "dataType": "Boolean",
      "required": true,
      "sortOrder": 30
    }
  ]
}
```

Response includes the new category's id. Use that in the subcategory route:

```json
{
  "name": "Shirts",
  "fields": [
    {
      "key": "sleeve_length",
      "label": "Sleeve length (cm)",
      "dataType": "Integer",
      "required": true,
      "min": 0,
      "max": 100,
      "sortOrder": 10
    }
  ]
}
```

The Shirts form includes size, origin, previously_used, and sleeve_length.
A child cannot redefine an inherited key. Parent field changes affect the effective form of its children.
All fields are plain definitions; do not send executable HTML, scripts, or arbitrary form expressions.

### Field definition contract

| Property | Meaning |
| --- | --- |
| key | Stable lowercase identifier, 1-80 characters: starts with a letter, then letters/digits/underscore |
| label | Required display name, up to 160 characters |
| dataType | Text, Number, Integer, Boolean, Date, Select, MultiSelect, or Image |
| required | Whether the value is required when saving a product |
| placeholder | Optional prompt, up to 240 characters |
| options | Required for Select/MultiSelect; 1-100 distinct nonblank strings |
| min / max | Optional inclusive numeric bounds for Number/Integer |
| maxLength | Optional Text limit, 1-10000; default Text limit is 2000 |
| sortOrder | Integer display order within the root or child definition |

At most 50 own fields per category; a child can additionally inherit up to 50 root fields.
Parent fields display before child fields. Numeric definition bounds allow up to 14 whole and 4 fractional digits.
Integer bounds must themselves be whole numbers.
Changing definitions does not rewrite existing product values or retroactively reject stored rows.
The next product edit is checked against current definitions. Removed/renamed keys must be removed from attributes.

## 5. Category-driven product creation/editing

### Vendor screen flow

1. Fetch categories and show top-level choices.
2. Fetch/show subcategory choices when a parent has them.
3. Obtain /api/categories/{selectedId}/form for the chosen root or child.
4. Render the fixed product fields plus the returned category fields.
5. Keep values under their field keys in attributes.
6. Upload a new image when selected and use the returned URL.
7. Submit to the vendor portal; show returned validation errors next to the matching fields.

A category is now required on product creation/editing.
The backend permits selecting a root even if it has children; the frontend may encourage selecting a child.
The form endpoint supplies category-specific fields. Fixed fields remain name, description, price, stock, and imageUrl.
For admin product creation, vendorId is also required. The vendor portal derives vendor identity from its token.

| Data type | Suggested control | JSON value |
| --- | --- | --- |
| Text | Text input / textarea | String |
| Number | Numeric input | Number, not a numeric string |
| Integer | Integer input / stepper | Whole JSON number |
| Boolean | Checkbox or toggle | true or false; false is a valid required value |
| Date | Date picker | "yyyy-MM-dd" string |
| Select | Select control | One exact options string |
| MultiSelect | Multiple-select control | Array of distinct options strings |
| Image | Image picker + upload | HTTPS URL |

Example vendor POST /api/vendor-portal/products:

```json
{
  "name": "Cotton shirt",
  "description": "Blue cotton shirt",
  "categoryId": "<shirts-category-uuid>",
  "price": 30000,
  "stock": 12,
  "imageUrl": "https://res.cloudinary.com/<cloud>/image/upload/<asset>.jpg",
  "attributes": {
    "size": "M",
    "origin": "Rwanda",
    "previously_used": false,
    "sleeve_length": 20
  }
}
```

Use PUT /api/vendor-portal/products/{id} for a vendor edit.
Use POST /api/products or PUT /api/products/{id} with admin auth for administration; include vendorId.
GET /api/products and /api/products/{id} expose attributes as an object, never an encoded JSON string.

On product edit, omitted/null attributes retain saved attributes and revalidate them.
An explicit attributes object replaces the whole saved object. Send all values to keep.
If changing category, fetch the new form and send attributes for that category; incompatible old keys are rejected.
Omitted/null imageUrl on edit preserves the existing image. An explicit empty string clears the product image.
Stock cannot be reduced below currently reserved units.
Existing image URLs are retained when no replacement is submitted.

Validation failure, 400:

```json
{
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "attributes.size": ["Choose a permitted option."],
    "attributes.origin": ["This field is required."],
    "categoryId": ["Category not found or inactive in this tenant."]
  }
}
```

Reject unknown attribute keys in the frontend too, but backend validation is authoritative.
Do not show a successful-save state until the write returned success.

## 6. Stored vendor/customer chat

Chat is durable HTTP-based messaging, with polling. There is no WebSocket/SignalR connection in this release.
Messages are stored in PostgreSQL and survive browser reloads/API restarts.
One conversation exists per tenant, vendor, and Clerk customer subject, even if the user opens chat from multiple products.
An optional productId records the initial product context; later products do not create separate conversations.
Use plain text; render content as text, not HTML.

Authentication/ownership is derived by the backend:
vendors use their vendor session; customers use their verified Clerk token and linked profile.
Do not send senderId, senderRole, a fake customer ID, or vendor identity to authenticate a request.
Only the two participants can read or write a conversation. Another participant gets 404, avoiding record disclosure.

| Method | Path | Purpose |
| --- | --- | --- |
| GET | /api/chat/me | Current chat actor, role, profileId, and tenant |
| GET | /api/chat/conversations?page=1&pageSize=20 | Inbox, last-message preview, unreadCount |
| POST | /api/chat/conversations | Create/reuse a conversation |
| GET | /api/chat/conversations/{id} | One conversation summary |
| GET | /api/chat/conversations/{id}/messages?limit=50 | Latest messages in ascending ID order |
| GET | same /messages?beforeId={oldestId}&limit=50 | Older message history |
| GET | same /messages?afterId={latestId}&limit=50 | Poll for new messages |
| POST | /api/chat/conversations/{id}/messages | Send an idempotent message |
| PUT | /api/chat/conversations/{id}/read | Advance this participant's read marker |

page must be 1-10000, pageSize 1-100, limit 1-100.
beforeId and afterId are mutually exclusive. beforeId must be positive; afterId may be zero.

### Open a chat as a customer

POST /api/chat/conversations:

```json
{ "vendorId": "<vendor-uuid>", "productId": "<optional-product-uuid>" }
```

Do not send customerId here; the backend identifies the customer.
The vendor must be active and verified. The optional product must be active and belong to that vendor.

As a vendor, use:

```json
{ "customerId": "<linked-customer-profile-uuid>" }
```

Do not send vendorId in the vendor request. A linked Clerk customer is required.
A new conversation returns 201; an existing conversation returns 200 with the same id.
Customers may discover vendor IDs through the catalog. A vendor can initiate a conversation if it already has a linked customer ID.

### Conversation list response

```json
{
  "items": [{
    "id": "<conversation-uuid>",
    "vendorId": "<vendor-uuid>",
    "vendorName": "Store name",
    "vendorLogoUrl": "https://...",
    "customerId": "<customer-profile-uuid>",
    "customerName": "Customer name",
    "productId": null,
    "createdAt": "2026-10-04T21:00:00+00:00",
    "updatedAt": "2026-10-04T21:05:00+00:00",
    "lastMessage": "Yes, it is available.",
    "unreadCount": 1,
    "lastReadMessageId": 0
  }],
  "page": 1,
  "pageSize": 20,
  "hasMore": false
}
```

### Send and retry

Generate clientMessageId once when the user sends a message, for example crypto.randomUUID():

```json
{ "content": "Is this shirt available in medium?", "clientMessageId": "<new-uuid>" }
```

Content is trimmed, must be nonblank, and is limited to 4000 characters.
Keep that same UUID if the network request is retried.
The first send returns 201. A retry with the same sender, UUID, and content returns the original message with 200.
Reusing a UUID for different content returns 409.
Generate a new UUID for an intentional second message, even when its text matches an earlier message.

Message response:

```json
{
  "id": 123,
  "conversationId": "<uuid>",
  "senderRole": "customer",
  "senderId": "user_abc123",
  "clientMessageId": "<uuid>",
  "content": "Is this shirt available in medium?",
  "createdAt": "2026-10-04T21:00:00+00:00"
}
```

Vendor senderId is that vendor's UUID string. Customer senderId is its verified Clerk user ID.
GET messages returns { items, hasMore, nextBeforeId, nextAfterId }.
Initial/history loads return chronological arrays. Prepend older history and deduplicate by message id.
Poll afterId using the newest seen ID. If hasMore is true, immediately fetch the next page before waiting again.

Mark read only after showing the messages to the user:

```json
{ "messageId": 123 }
```

The ID must belong to this conversation. Read markers only advance and cannot move backwards.
unreadCount counts messages from the other participant above this user's marker.
Fetching messages does not mark them read automatically.

### Polling and frontend states

Poll the open conversation every 3-5 seconds while the chat view is visible; pause when it is hidden or logged out.
Poll/refetch the inbox less frequently and after sends/read updates.
Refresh Clerk tokens through getToken() as needed instead of reusing an expired token forever.
Include loading, empty inbox, sending, retry, failed-send, expired-session, and unavailable-conversation states.
Preserve the unsent draft after network failures. Associate optimistic messages with clientMessageId until their server IDs arrive.

No message deletion/editing, attachments, typing indicators, presence, push notifications, or realtime socket transport are implemented.
The storage/ownership API is ready for those future extensions, but the frontend must not assume they exist.

## 7. Empty database and future dummy data

Automatic catalog seeding is opt-in via SEED_DEMO_DATA=true; leave it false for the requested empty start.
A schema upgrade adds tables/columns and retains records. It never clears production business data.
The one-time reset script is docs/sql/reset-business-data.sql; run it only when intentionally starting over.
It preserves Tenants and schema-version/migration bookkeeping.

Populate future dummy data in this order:

1. Configure admin credentials and sign in.
2. Add a location if needed.
3. Register a vendor through POST /api/vendors/register.
4. Approve it through PATCH /api/admin/vendors/{id}/approve; this returns its registrationCode.
5. Use that code with POST /api/vendor-auth/register to set up its vendor login.
6. Add a logo using the upload-and-save workflow.
7. Create categories, requirements, and subcategories through admin APIs.
8. Create products using valid category attributes.
9. Sign in a test customer using Clerk, then sync its local customer profile.
10. Create a conversation and exchange messages using each participant's own session.

Vendor account registration returns 200 with { accessToken, vendor }.
The older PATCH /api/vendors/{id}/approve returns a vendor summary; retrieve the registration code through admin-only GET /api/vendors/{id} if using that older route.

## 8. Verification for the frontend team

- Admin credentials work; a wrong code fails; anonymous/vendor category writes fail.
- Root/child menus and inherited form fields match /form.
- Required false and numeric zero values save successfully.
- Missing required fields, unknown keys, wrong types, and unsupported options show field errors.
- Product edits preserve an omitted image and omitted attributes.
- Vendor logo upload/save/display works; changing one vendor cannot change another.
- Each participant sees the same persisted chat after refresh.
- A third customer/vendor cannot read or post in that conversation.
- Retrying one message produces one saved row, and unread counts clear after a valid read update.
- Empty categories/products/inboxes render their empty states without automatically creating dummy rows.
