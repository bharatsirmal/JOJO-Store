# Role-Based Access Control (RBAC)

## Identity Provisioning
- Customers register via public forms and receive the default `customer` role assigned via backend logic in Firestore.
- Staff provisioning (Admins, Delivery Partners) cannot be performed publicly. A Firebase Admin script or manual Custom Claims adjustment via the Firebase Console/CLI is required.

## Enforcement Boundaries
1. **Middleware (`src/middleware.ts`)**: Protects Next.js route access (e.g., `/admin`, `/delivery`). Redirects to `/unauthorized` or `/login`.
2. **Server Actions & API Routes**: Hard-verify the `__session` cookie using Firebase Admin. Reads custom claims or the authoritative user document to validate the required role before executing business logic.
3. **Firestore & Storage Rules**: Enforce matching roles or `uid` checks at the database layer (preventing bypass via rogue API calls or direct Firebase Client access).

## Role Matrix
| Identity         | Customer account                                       | Admin dashboard | Delivery portal                   |
| ---------------- | ------------------------------------------------------ | --------------- | --------------------------------- |
| Unauthenticated  | Denied                                                 | Denied          | Denied                            |
| Customer         | Own account only                                       | Denied          | Denied                            |
| Admin            | Own account and explicitly authorized admin operations | Allowed         | Allowed                           |
| Delivery partner | Own account only                                       | Denied          | Assigned delivery operations only |
