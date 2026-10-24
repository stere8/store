# Administrator vendor-profile editing

GET /api/vendors/{id} reads the existing administrator detail. New PUT /api/vendors/{id} edits an existing vendor, including an inactive one. Both require the administrator Bearer token and matching X-Tenant-Id. It does not register a new vendor.

```json
{
  "displayName": "Updated store name",
  "legalName": "Updated legal name",
  "contactPhone": "+250780000000",
  "contactEmail": "contact@example.com",
  "locationId": null,
  "description": "Updated business description",
  "logoUrl": "https://res.cloudinary.com/example/image/upload/logo.png"
}
```

Send the full intended profile, not a partial PATCH. Display/legal name and phone are required (limits 160/180/32). Email is normalized lowercase, valid, <=160 and unique per tenant; blank/null clears. Location must exist in this tenant; null clears. Description <=10000; null clears. logoUrl omitted/null preserves the saved image, an empty string clears it, and a new HTTPS URL replaces it. Existing dedicated logo endpoint retains its own explicit-null clearing behavior.

200 returns the existing vendor-summary shape. 400 includes validation errors; 401 anonymous/vendor; 403 administrator tenant mismatch; 404 unknown vendor; 409 duplicate contact email.

Changing contactEmail does NOT change accountEmail/login. This operation cannot change vendor ID, tenant, registration code, account email, password/hash/salt, approval, active status, creation date, products, reservations, or chat. Approval/deactivation remain separate administrator operations. No password fields are returned. Public branding is still GET /api/vendors/{id}/profile.

This branch changes the backend only, with no database migration/reset. Consumers can use the new edit route. Concurrent full-profile edits are last-writer-wins; there is no new revision token.
