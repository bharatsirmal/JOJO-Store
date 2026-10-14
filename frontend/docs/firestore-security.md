# Firestore & Storage Security

## Firestore Security Rules
- **Deny-by-default**: All unmapped documents throw a permission denied error.
- **Users Collection (`/users/{uid}`)**:
  - `read`: Customers can read only their own profile. Admins can read all profiles.
  - `create`: Completely locked from the client. Profiles are only initialized by the trusted server backend (`adminDb.collection("users").set()`).
  - `update`: Customers can update their own data but are explicitly blocked from tampering with restricted keys (`role`, `uid`, `createdAt`).
  - `delete`: Only Admins.
- **Future Collections**: `/products` and `/orders` paths are locked down awaiting Phase 3 and Phase 4 definitions.

## Firebase Storage Rules
- **Product Assets (`/products/{imageId}`)**: Publicly readable, writeable only by Admins.
- **Private User Assets (`/users/{uid}/{fileName}`)**: Readable/writeable only by the authenticated owner or an Admin.

## Security Configuration
- Firestore and Storage rules remain in the repository root and are configured in `firebase.json`.
- API authorization and customer ownership checks are implemented in the backend application source.
