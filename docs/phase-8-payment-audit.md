# JOJO Store - Phase 8 Payment & Inventory Audit

## Product & Inventory Reliability (Step 8.6)
- **Concurrency & Double Spend Protection**: Verified that inventory reservations occur within a strict Firestore `runTransaction` block. This mathematically prevents overselling the last variant when two customers attempt to check out simultaneously.

## Shopping Cart & Checkout (Step 8.7)
- **Server-Side Pricing calculations**: Confirmed that the `totalMinor` and `subtotalMinor` are calculated entirely on the server using authoritative Firestore product data (`variant.priceMinor`). Client-side forged totals in the POST payload are safely ignored, making price manipulation impossible.

## Payment Gateway Security (Step 8.8)
- **Stripe Webhook Signature**: The application uses `stripe.webhooks.constructEvent` with the raw POST body and the `STRIPE_WEBHOOK_SECRET` to cryptographically verify that status updates actually originate from Stripe.
- **Idempotency Protection**: The webhook handler writes the Stripe event ID into the `paymentEvents` collection. If a network retry occurs, it detects the duplicate event ID and bails out safely without double-updating inventory or confirming an order twice.

