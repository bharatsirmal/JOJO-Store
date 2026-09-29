# System Architecture

## Architecture Diagram

```mermaid
flowchart TD
    %% Clients
    subgraph Clients
        C[Customer Browser]
        A[Admin Browser]
        D[Delivery Browser]
    end

    %% Next.js Application
    subgraph NextJS["Next.js App Router (Vercel)"]
        UI[React UI Components]
        API[API Routes / Server Actions]
        UI --> API
    end

    %% Firebase Services
    subgraph Firebase["Firebase Platform"]
        Auth[Firebase Authentication]
        Firestore[Cloud Firestore]
        Storage[Firebase Storage]
    end

    %% External Services (Phase 2+)
    subgraph External["External Integrations (Future)"]
        Payments[Payment Gateway]
        Courier[Courier / Logistics API]
    end

    %% Connections
    Clients -->|HTTPS| UI
    API -->|Admin SDK| Auth
    API -->|Admin SDK| Firestore
    API -->|Admin SDK| Storage
    UI -.->|Client SDK| Auth
    API -.->|Webhooks/API| Payments
    API -.->|Webhooks/API| Courier
```

## Security & Data Flow
- **Authentication Boundaries**: Client-side SDK handles login/session management, Server-side Admin SDK validates tokens and handles privileged operations.
- **Server-side Authorization**: Role-based access control (RBAC) via custom claims. Next.js middleware and Server Actions will verify claims before execution.
- **Storage**: Images are stored in Firebase Storage. Public access is granted to product images; restricted access for user/admin assets.
- **Payments (Future)**: Processed securely using external gateways. Webhooks will update order statuses in Firestore securely via server-only routes.
