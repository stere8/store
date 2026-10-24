# Buyer platform-fee quote

GET /api/platform-fees/calculate?amount=100000&percentage=1

Public, read-only calculator. percentage defaults to 1, is 0-100, and supports up to four decimal places. amount must be a nonnegative whole RWF amount, at most 9999999999999999. Invalid input returns 400 with validation errors.

```json
{
  "baseAmount": 100000,
  "percentage": 1,
  "feeAmount": 1000,
  "totalAmount": 101000,
  "currency": "RWF",
  "chargedTo": "buyer",
  "isEstimate": true
}
```

The buyer pays the fee on top; it is not deducted from vendor proceeds. Calculate on value, not number of items. Fee = amount * percentage / 100, rounded once to whole RWF, midpoint away from zero. For example, 1% of 150 RWF rounds to 2 RWF, total 152.

For a combined basket, quote its combined subtotal once. Quoting each vendor separately and summing can differ because of rounding; this release does not create split orders or select a future settlement policy. Send zero for a fee-free quote. A result can be zero for a small amount; there is no minimum fee.

This is an estimate from a caller-supplied subtotal/rate, NOT an authoritative checkout amount, payment request, commission ledger, stored fee policy, or gateway integration. It changes no prices, reservations, bookings, balances, or database schema. When payments are added, calculate the rate/subtotal server-side from trusted records and snapshot the agreed policy with the transaction. Never charge a client-supplied quote without revalidation.

Clients must handle the precision limit of JavaScript numbers. No database migration or secret configuration is required. This branch does not activate any charge on live transactions.
