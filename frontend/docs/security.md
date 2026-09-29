# Security Design

## Identity Verification (Phase 2)
- All users will authenticate via Firebase Authentication.
- Supported providers: Email/Password and potentially OAuth (Google).
- The client SDK manages session persistence (cookies/indexedDB).

## Role-Based Access Control (RBAC) & Authorization
- **Roles**: `customer` (default), `admin`, `delivery_partner`.
- **Assignment**: Users cannot promote themselves. A server-side Firebase Admin SDK script (or initial setup) must set `custom claims` on the user's Firebase Auth token.
- **Enforcement (Client)**: Next.js Middleware checks session/claims to protect `/admin` and `/delivery` routes visually and navigationally.
- **Enforcement (Server)**: Next.js API Routes and Server Actions will verify `adminAuth.verifyIdToken(token)` before performing any sensitive operation.
- **Enforcement (Database)**: Firestore Security Rules will validate the custom claims `request.auth.token.role == 'admin'` for any sensitive document mutations.

## Firebase Rules
- **Phase 1**: All read/write operations are denied by default (`if false;`).
- **Phase 2+**: 
  - Products: Publicly readable, writeable only by admins.
  - Carts/Orders: Readable/writeable only by the document owner (`request.auth.uid == resource.data.userId`), plus admins.
  - Users Profile: Readable/writeable by the owner and admins.

## Secrets Management
- Firebase Admin SDK keys (service account credentials) and payment gateway keys are strictly stored in server environment variables.
- They are NEVER prefixed with `NEXT_PUBLIC_` and are NEVER sent to the client bundle.
- `.env.example` provides placeholders without real secrets.

## Image Access
- Public product images in Firebase Storage will have public read access.
- User-uploaded assets (if any) will be restricted to the user and admins.

## Customer Privacy
- PII (Personally Identifiable Information) such as shipping addresses and phone numbers will be stored securely in Firestore and transmitted over HTTPS.
- Access is strictly limited to the user and authorized store personnel (admin/delivery).

## Payment Webhook Verification (Phase 5)
- Webhooks from payment gateways (e.g., Stripe) will be verified using the gateway's SDK to check the webhook signature against a stored webhook secret before updating any order status in Firestore.
