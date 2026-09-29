# Authentication Architecture

## Sequence Diagram

```mermaid
sequenceDiagram
    participant Customer
    participant Frontend as Next.js Client
    participant Auth as Firebase Auth
    participant Backend as Next.js Server (API/Actions)
    participant Admin as Firebase Admin SDK
    participant Firestore as Cloud Firestore

    Customer->>Frontend: Submit Login (Email/Password)
    Frontend->>Auth: signInWithEmailAndPassword()
    Auth-->>Frontend: Returns Auth Credential & ID Token
    Frontend->>Backend: POST /api/auth/session (idToken)
    Backend->>Admin: verifyIdToken(idToken)
    Admin-->>Backend: Token decoded & validated
    Backend->>Admin: createSessionCookie(idToken)
    Admin-->>Backend: Secure session cookie string
    Backend-->>Frontend: Set-Cookie: __session (HTTP-only)
    Frontend->>Customer: Redirect to /account
    Customer->>Backend: Request protected page
    Backend->>Admin: verifySessionCookie(__session)
    Backend->>Firestore: Fetch user profile (if valid)
    Firestore-->>Backend: User profile data
    Backend-->>Customer: Render protected account page
```

## Workflows
- **Registration**: Client SDK creates Firebase Auth account -> Client updates display name -> Server Action creates a secure profile in Firestore (idempotent) -> Email verification sent.
- **Login**: Firebase Auth provides JWT -> Passed to `/api/auth/session` -> Server issues an HTTP-only secure cookie via Firebase Admin SDK.
- **Logout**: Client POSTs to `/api/auth/logout` -> Server clears the `__session` cookie -> Client signs out from Firebase Auth.
- **Password Reset**: Uses Firebase Client SDK `sendPasswordResetEmail`.
- **Role Validation**: All backend API routes and Edge Middleware decrypt or verify the token to read `role` claims, enforcing isolation.
