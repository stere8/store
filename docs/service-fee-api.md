# Cart Service Fee

The buyer's service fee is **1% of the entire cart subtotal**, calculated once per cart. It is not calculated/rounded separately for each item, service offering, quantity, or vendor. "Service fee" names the fee, not an eligibility filter for the separate appointment-services catalog.

Formula: subtotal = sum(current product price * quantity); serviceFeeAmount = round(subtotal * 0.01); totalAmount = subtotal + serviceFeeAmount. Whole RWF, midpoint away from zero, with no minimum fee. The fee is added for the buyer, not deducted from vendor proceeds. For two 50 RWF lines (including different vendors), subtotal 100 => fee 1, not 2. Subtotal 100000 => fee 1000 => total 101000.

## Quote a saved cart

| Method | Path | Access |
| --- | --- | --- |
| GET | /api/carts/{cartId}/service-fee | Cart's active linked Clerk customer or tenant administrator |

Send X-Tenant-Id and the correct Bearer token. The server reads the cart's saved quantities and current product prices, matching existing reservation pricing. It ignores client amounts and stale UnitPrice/LineTotal cart snapshots. It combines the complete cart across vendors before calculating/rounding once.

```json
{
  "cartId": "<actual-cart-uuid>",
  "subtotal": 100000,
  "serviceFeePercentage": 1,
  "serviceFeeAmount": 1000,
  "totalAmount": 101000,
  "currency": "RWF",
  "chargedTo": "buyer",
  "calculatedPer": "cart",
  "isEstimate": true
}
```

The rate is server-controlled at 1%, not an input. An empty cart returns zero subtotal/fee/total. Missing/inactive/inaccessible cart: 404. Missing/invalid login: 401. Tenant administrator mismatch: 403. Unavailable product/vendor, invalid quantity/legacy fractional price, or excessive subtotal: 409; update the cart rather than silently discarding a line. Private responses are not cached.

This new route enforces ownership; it does not claim to repair every legacy cart read/write authorization rule. Clerk backend issuer/origin configuration is required for customer tokens. Administrators can quote a cart in their own tenant.

## Preview from a subtotal

| Method | Path | Access |
| --- | --- | --- |
| GET | /api/service-fees/calculate | Public arithmetic preview, required amount query |

GET /api/service-fees/calculate?amount=100000

Same result without cartId. amount is a whole nonnegative RWF subtotal, maximum 9999999999999999. This previews a supplied cart subtotal; it does not verify saved cart contents. Invalid amount returns 400. Supplying percentage returns 400: callers cannot change the 1% policy. The old unpublished /api/platform-fees route is removed.

## Boundaries

No schema migration, business-data reset, stored-price change, vendor deduction, actual payment, ledger entry or new reservation charge occurs in a quote. Existing cart responses and historical reservation totals are unchanged; use the new route for the explicit subtotal/fee/total breakdown.

The current saved cart holds products; appointment bookings remain their separate model. Do not add a separate fee to every appointment or vendor reservation and then add a cart fee again. If future checkout supports mixed product/appointment lines, include all eligible line values in its cart subtotal once under this same policy.

Before payment collection is implemented, an authoritative checkout must reprice and snapshot the full cart service fee once, then allocate any vendor splits without charging the buyer again. A preview is not a payment authorization. Existing booked service prices and past reservations are not retroactively modified.

JavaScript clients must respect safe integer limits for very large monetary values. No new secret or environment setting is required.
