# Phase 2 Deployment Configuration

## Environment Secrets Management
Before deploying to Vercel, the following environment variables must be securely configured in the Vercel Dashboard:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (Ensure line breaks `\n` are handled properly in Vercel UI).

## Authentication Configuration
- Ensure the production domain (e.g., `jojo-store.vercel.app`) is added to the **Authorized Domains** list in the Firebase Console (Authentication > Settings > Authorized domains).
- The `__session` cookie uses the `secure: true` flag in production, strictly requiring HTTPS.

## Deployment Status
**[BLOCKED]** - Automatic Vercel deployment and Firebase remote configuration are blocked due to missing real project credentials. The codebase is safely equipped to handle production environments once human configuration is injected.
