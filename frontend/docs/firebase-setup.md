# Firebase Setup & Configuration

## Firebase Console Setup Instructions
To proceed with Phase 2 testing, a real Firebase project must be connected.

1. Navigate to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Create a project** and name it `JOJO Store`.
3. Select the appropriate region for your customers (e.g., `us-central1` or `europe-west1`).
4. Navigate to **Authentication** > **Sign-in method** and enable **Email/Password**.
5. Navigate to **Firestore Database** and click **Create Database** (start in production mode, as our local rules will enforce security).
6. Navigate to **Storage** and initialize the storage bucket.
7. Navigate to **Project Settings** (gear icon) > **General**. Scroll down to **Your apps** and add a **Web App**. Name it `JOJO Store`.
8. Copy the provided configuration values to your `.env.local` file (see below).
9. Navigate to **Project Settings** > **Service Accounts**. Click **Generate new private key** to download a JSON file containing your admin credentials.

## Environment Variables (`.env.local`)
Create `.env.local` in the project root with the following format. Ensure this file is never committed to version control.

```env
# Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSy..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="jojo-store-xxxx.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="jojo-store-xxxx"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="jojo-store-xxxx.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="1234567890"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abc123def456"

# Admin Configuration
FIREBASE_PROJECT_ID="jojo-store-xxxx"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@jojo-store-xxxx.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\n-----END PRIVATE KEY-----\n"
```

## Status
- **Client Initialization:** Ready. Handled in `src/lib/firebase/client.ts`.
- **Admin Initialization:** Ready. Handled in `src/lib/firebase/admin.ts`.
- **Verification:** **[BLOCKED]** - Cannot verify real connections without a `.env.local` file provisioned by a human operator. We will proceed with safe local implementation and rely on emulator tests where possible.
