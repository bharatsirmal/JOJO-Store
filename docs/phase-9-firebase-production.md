# JOJO Store - Firebase Production Configuration

## Authentication
- **Methods Enabled:** Google Sign-In, Email/Password.
- **Authorized Domains:** \`localhost\` (for dev) and \`jojo-store-2027.firebaseapp.com\`. Vercel production domains must be added to this list in the Firebase Console prior to public launch.
- **Email Action Settings:** Email templates must be updated in Firebase Console to point to the production Vercel domain instead of the default Firebase domain.

## Cloud Firestore
- **Security Rules:** VERIFIED. Draft products are protected from public reads. Orders and payments are strictly locked to the owning customer and admins.
- **Indexes:** Any required composite indexes (e.g., sorting orders by date) must be deployed via Firebase Console. The app currently sorts customer orders in-memory to bypass index requirements for low-volume user profiles.

## Admin SDK
- **Credentials:** The \`serviceAccountKey.json\` has been successfully abstracted into Vercel environment variables (\`FIREBASE_PRIVATE_KEY\`, \`FIREBASE_CLIENT_EMAIL\`). No sensitive keys are exposed to the client.

## Actions Required for Launch
1. Add the final production domain to Firebase Authentication Authorized Domains.
2. Update Email Templates (Password Reset, Verification) to use the custom production domain.

