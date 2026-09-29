# JOJO Store - Payment Production Readiness

## Stripe Configuration
The payment integration is currently operating in **TEST MODE**. 

### Verification Checklist for LIVE Mode:
- [ ] Merchant business onboarding and verification completed in the Stripe Dashboard.
- [ ] \`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\` swapped to the LIVE key in Vercel.
- [ ] \`STRIPE_SECRET_KEY\` swapped to the LIVE key in Vercel.
- [ ] A new production Webhook endpoint registered in the Stripe Dashboard pointing to \`https://[production-domain]/api/webhooks/stripe\`.
- [ ] \`STRIPE_WEBHOOK_SECRET\` updated in Vercel with the new live webhook signing secret.
- [ ] Allowed domains configured in Stripe to prevent checkout hijacking.

## Security Posture
- **VERIFIED:** The server mathematically calculates the authoritative payment amount from the database. Client payloads cannot forge prices.
- **VERIFIED:** Duplicate webhook events are discarded via the \`paymentEvents\` Firestore collection to prevent double inventory deduction.

## Action Item
- **STATUS:** BLOCKED. Live transaction testing cannot proceed until the merchant explicitly authorizes the switch to production Stripe keys.

