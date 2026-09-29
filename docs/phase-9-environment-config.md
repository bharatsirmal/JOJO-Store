# JOJO Store - Production Environment Variable Audit

## Public Variables (NEXT_PUBLIC_*)
These variables are safe to be exposed to the browser and Vercel Edge networks:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (Must be the LIVE key, not test)

## Server-Only Variables (SECRET)
These variables MUST NEVER be prefixed with `NEXT_PUBLIC_`. They must only be added to Vercel's secure Environment Variables dashboard:
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (Must be formatted properly with escaped newlines or injected directly as a block)
- `STRIPE_SECRET_KEY` (Must be the LIVE key, not test)
- `STRIPE_WEBHOOK_SECRET` (Must be the LIVE webhook secret from the Stripe Dashboard)
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `SMTP_USER` (Optional - for real email notifications)
- `SMTP_PASS` (Optional - for real email notifications)

## Missing Production Variables
- None required for core functionality, assuming Cloudinary and Firebase are ready. However, the Stripe keys currently in `.env.local` are `test` keys (`pk_test_...` and `sk_test_...`). These MUST be replaced with live keys in the Vercel dashboard.

## Verification
- Confirmed no secret keys have the `NEXT_PUBLIC_` prefix.
- Confirmed no service account JSON files are committed to the public repository.

