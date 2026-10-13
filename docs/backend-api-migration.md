# Separate backend API migration

Status: Full migration approved and implemented. Backend APIs are hosted by the separate Next.js service. The frontend forwards `/api/*` to that service and uses authorized backend reads for server-rendered pages. Old frontend implementations are preserved in an ignored local recovery folder.

## Implementation

1. Change the `jojo-store-backend` project from the sample Firebase Functions handler to a Next.js API service on Node.js 22. The existing store routes use Next.js request, response, cookie, and cache APIs; this preserves their behavior without rewriting every handler for another framework.
2. Host authentication, admin operations, checkout, orders, payments, uploads, messaging, delivery operations, and Stripe webhooks in the backend.
3. Replace direct database access in frontend server-rendered pages with authorized backend reads. Preserve role checks and customer ownership checks on the backend.
4. Forward frontend `/api/*` requests to the backend so browser sessions remain on the storefront domain. Forward the session cookie for server-rendered requests. Preserve raw webhook request bodies.
5. Keep public Firebase configuration, the Stripe publishable key, and a public backend URL in the frontend. Store Firebase admin credentials, Stripe secret/webhook keys, Cloudinary credentials, and SMTP credentials in the backend.
6. Deploy and verify the backend first, then deploy the frontend routing change. Remove frontend private variables only after the replacement works. Preserve a recovery copy of environment configuration locally in ignored files.

## Required verification

- Backend API and frontend builds and type checks.
- Login, logout, registration, session forwarding, and role restrictions.
- Public catalog reads; customer order ownership; admin and delivery access.
- Upload and webhook forwarding without body corruption.
- Environment-name audit confirming frontend has no private credentials.
- Vercel deployment checks and deployed endpoint smoke tests.

Existing Stripe checkout defects identified in the project audit must also be addressed before claiming that real payment processing is ready. No live payment or refund is part of migration verification.

## Local development

Run `npm run dev` in `backend` for port 4000, and `npm run dev` in `frontend` for port 3000. Use each project's `.env.example` to configure it. Frontend values are public browser settings only; backend values include private service credentials. Use `https://jojo-store-backend.vercel.app` as `NEXT_PUBLIC_BACKEND_URL` in Vercel.

The frontend Stripe webhook URL remains `/api/webhooks/stripe`; the proxy forwards the original request to the backend. Existing Stripe Dashboard registration does not need to change for this migration.

Installed backend dependency files are no longer tracked in Git. `npm ci` and `package-lock.json` reproduce the dependencies on Vercel.
