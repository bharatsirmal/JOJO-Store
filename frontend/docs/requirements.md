# Requirements: Clothing Store E-Commerce Platform

## Roles
1. **Customer**: Can browse products, manage cart, checkout, and view order history.
2. **Admin**: Can manage products, variants, inventory, view analytics, and manage orders/shipments.
3. **Delivery Partner**: Can view assigned deliveries, update tracking statuses, and mark orders as delivered.

## Features
### Phase 1 (Current)
- Basic responsive layouts for Customer, Admin, and Delivery portals.
- Foundational Next.js App Router setup with Tailwind CSS and shadcn/ui.
- Firebase Client and Admin SDK configuration (placeholders for credentials).
- Role-based route structures.
- Placeholders for actual products, checkout, and live inventory.

### Future Phases (Phase 2+)
- **Authentication**: Secure login/registration via Firebase Auth, and RBAC via Custom Claims.
- **Data Layer**: Cloud Firestore integration for real products, carts, users, orders.
- **Payments**: Secure payment gateway integration.
- **Logistics**: Courier integration, live tracking.
- **Storage**: Image storage for products using Firebase Storage.

## Unresolved Business Decisions (TODOs)
- **Store details**: Name, country, currency, tax rates.
- **Payments**: Selection of payment gateway (e.g., Stripe, PayPal).
- **Logistics**: Preferred courier providers and shipping pricing rules.
- **Policies**: Return, refund, and data privacy policies.
