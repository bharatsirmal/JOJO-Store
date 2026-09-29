# Roadmap

## Phase 1: Foundation (Current)
- **Scope**: Planning, project scaffold, UI foundation, routing, Firebase configuration placeholders.
- **Prerequisites**: Node.js, Vercel/GitHub accounts (optional).
- **Exit Criteria**: Responsive UI scaffold running locally with no errors, successful production build, separated layout structures.

## Phase 2: Authentication & Security
- **Scope**: Firebase Auth integration, user registration/login, RBAC via custom claims, protected routes.
- **Prerequisites**: Phase 1 completed, Firebase project initialized in Console.
- **Exit Criteria**: Users can log in, Admins can access protected routes, unauthorized access is denied.

## Phase 3: Product Catalog & Storage
- **Scope**: Firestore database schema for products/categories, Firebase Storage for images, Admin product management.
- **Prerequisites**: Phase 2, Business decisions on product models.
- **Exit Criteria**: Admins can CRUD products; Customers can view live product catalog.

## Phase 4: Cart & Checkout (UI/UX)
- **Scope**: Client-side/Firestore cart state management, checkout flow UI.
- **Prerequisites**: Phase 3.
- **Exit Criteria**: Customers can add items to cart and proceed to checkout UI (mocked payment).

## Phase 5: Payment Gateway Integration
- **Scope**: Integration with Stripe/PayPal, secure server-side intent creation, webhook handling.
- **Prerequisites**: Phase 4, Business decision on payment provider.
- **Exit Criteria**: Successful end-to-end simulated payments updating order status.

## Phase 6: Order Management & Inventory
- **Scope**: Inventory reservation logic, Admin order fulfillment dashboard.
- **Prerequisites**: Phase 5.
- **Exit Criteria**: Inventory deducts on purchase, Admins can transition order statuses.

## Phase 7: Delivery Portal & Courier Integration
- **Scope**: Delivery partner assignments, third-party logistics API (optional), tracking URLs.
- **Prerequisites**: Phase 6.
- **Exit Criteria**: Delivery partners can view assignments and update tracking, Customers can see updates.

## Phase 8: Analytics & Optimization
- **Scope**: Admin analytics dashboard, SEO optimization, performance tuning.
- **Prerequisites**: Phase 7.
- **Exit Criteria**: Fast Core Web Vitals, functional sales/inventory reports.

## Phase 9: Production Launch
- **Scope**: Final security audit, domain binding, production environment variables, marketing readiness.
- **Prerequisites**: Phase 8.
- **Exit Criteria**: Live application handling real transactions.
