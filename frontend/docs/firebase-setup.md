# Firebase configuration

Firebase provides authentication and the Firestore database. The frontend and
backend run as separate Vercel applications; Firebase Hosting and Functions are
not used for these applications.

## Frontend environment

Keep browser settings in `frontend/.env.local`:

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`
- `NEXT_PUBLIC_BACKEND_URL` (`http://localhost:4000` locally)

Client initialization is in `frontend/src/lib/firebase/client.ts`.

## Backend environment

Keep server credentials in `backend/.env.local`:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`

Admin initialization is in `backend/src/config/firebase.ts`. The backend validates
sessions and authorizes database access. Never expose Admin credentials through
`NEXT_PUBLIC_` variables or the frontend Vercel project.

## Rules and emulators

The repository-root `firebase.json` configures Firestore rules/indexes, Storage
rules and local emulators. Preserve `firestore.rules`, `firestore.indexes.json`,
`storage.rules` and `.firebaserc` for Firebase administration and local development.

Both application environment files are ignored by Git. There is no shared root
`.env.local`; each application loads its own configuration.
