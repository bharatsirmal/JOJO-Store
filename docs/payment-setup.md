# Stripe payment setup

The payment changes are local until both applications are deployed. Prices are
stored in paise: ₹100 is `10000`. Checkout quotes and orders use INR, ₹15 shipping,
and the existing 8% tax calculation. Confirm your intended shipping and tax rules
before accepting live payments.

## Environment variables

Backend (`backend/.env.local`, and the backend Vercel project):

- `STRIPE_SECRET_KEY`: Stripe secret API key.
- `STRIPE_WEBHOOK_SECRET`: signing secret for the destination delivering events.
- Existing Firebase Admin credentials remain required for order and stock writes.

Frontend (`frontend/.env.local`, and the frontend Vercel project):

- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: publishable key from the same Stripe
  account and mode as the backend secret key.
- `NEXT_PUBLIC_BACKEND_URL`: `http://localhost:4000` locally;
  `https://jojo-store-backend.vercel.app` on Vercel.

Private keys must stay in the backend. No additional variable names are required
for these changes. Changing frontend public variables requires rebuilding it.

## Local payment verification

1. Start the backend with `npm run dev` from `backend` and the frontend with
   `npm run dev` from `frontend`.
2. Install the Stripe CLI, then run `stripe login`.
3. In another terminal run:

   ```sh
   stripe listen --events payment_intent.succeeded,payment_intent.payment_failed --forward-to localhost:4000/api/webhooks/stripe
   ```

4. Copy the listener's `whsec_...` value into **backend/.env.local** as
   `STRIPE_WEBHOOK_SECRET` and restart the backend. This local listener secret
   is different from the hosted destination's secret; do not replace Vercel's
   secret with it.
5. Sign in as a customer and use an active product with available variant stock.
   Complete checkout in test mode using `4242 4242 4242 4242`, a future expiry and
   any three-digit CVC. Confirm the order becomes `confirmed` and stock decreases
   exactly once.
6. Check decline handling using Stripe's documented test cards. A failed attempt
   must not consume physical stock. Retry the same checkout rather than creating
   another order.

Automated tests use mocked databases and Stripe intents, plus Stripe's actual
webhook signature verifier. They do not make a real charge or replace this
end-to-end check.

## Hosted webhook

Keep the existing frontend destination URL if it already forwards successfully:

`https://jojo-store-frontend.vercel.app/api/webhooks/stripe`

The frontend proxies this to the backend. A direct backend destination also works:

`https://jojo-store-backend.vercel.app/api/webhooks/stripe`

Choose **Snapshot** payloads and these events:

- `payment_intent.succeeded`
- `payment_intent.payment_failed`

Use the signing secret of the chosen destination in the backend Vercel project.
Keep one destination for the normal integration; changing its URL or secret is
unnecessary if the existing destination works. Verify successful deliveries in
Stripe after deployment. Deploy the backend before the frontend changes.

Available payment methods are controlled by Stripe account settings and account,
currency and customer eligibility. Checkout shows only the methods Stripe offers;
cash on delivery is not implemented. Test-mode keys cannot accept real payments.

Payments with mismatched amounts, currencies, identities or unavailable reserved
stock are flagged for review without fulfilling the order. Admin order details
show the reason; inspect the payment in Stripe before any manual resolution.
Automatic refunds and automatic cleanup of abandoned reservations are outside
these changes; existing admin cancellation releases an unpaid order's reservation.

References: [Stripe webhooks](https://docs.stripe.com/webhooks),
[Stripe testing](https://docs.stripe.com/testing).
