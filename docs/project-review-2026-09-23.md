# JOJO Store: project review and design update

Reviewed September 23, 2026.

## Scope and outcome

Refreshed the storefront and admin presentation while retaining existing routes, authentication checks, Firestore queries, checkout calculations, payment endpoints, inventory behavior, and product mutation handlers. No database records or permissions were changed. No deployment was performed.

The project uses Next.js App Router and React, Tailwind CSS 3, Firebase Auth/Firestore, Stripe, Cloudinary, Zustand, and a separate Firebase Functions backend. It has a substantial commerce foundation, but some screens and controls are still prototypes. This was a source review and UI verification, not a complete payment or security audit.

## Design and usability delivered

- Editorial storefront: warm neutral surfaces, green accents, split hero using the existing brand photograph, photographic category panels, clearer collection headings, a brand section, and a structured footer.
- Responsive product listing header and result count; product actions remain visible on touch devices and appear on keyboard focus on desktop.
- Larger shared buttons and inputs, consistent card spacing, clear focus rings, and compatible Tailwind 3 styles. Bundled Geist font removes the Google Fonts build-time dependency.
- Restrained entrance, hover, and overlay animations. CSS and Framer Motion respect the user's reduced-motion preference.
- Admin workspace: dark green sidebar, active route indicators, softer content surfaces, refreshed metric cards, more readable tables and chart empty states, profile initials, and storefront navigation.
- Functional mobile admin menu with all existing destinations, Escape dismissal, focus containment/restoration, and automatic closing after navigation or switching to desktop.
- Cart, search, and product-delete overlays now support focus containment and Escape. The cart retains its existing quantity, subtotal, removal, and checkout logic.
- Product table actions are visible without hovering; labels were added to search, filters, selection boxes, and edit/delete actions.

The admin dashboard presentation was extracted into `DashboardOverview.tsx` so the exact UI can be previewed independently; the server page still computes and passes the original values.

## Recommended next work

| Priority | Finding and evidence | Recommended improvement |
| --- | --- | --- |
| High | Baseline TypeScript fails on incomplete scratch files `frontend/src/components/admin/fix-submit.tsx` and `missing-part.tsx`. Excluding these for diagnosis exposes additional type errors; see `design-typecheck.txt`. Delivery registration imports nonexistent `auth` from `src/lib/firebase/admin.ts`; ProductForm also references an unimported `Loader2`. | Archive scratch fragments outside compiled source; repair imports, product types, and nullable Firebase access. Make build/type/lint checks pass in CI before deployment. |
| High | `frontend/src/app/api/auth/promote-delivery/route.ts` accepts a valid user ID token and assigns that user the delivery role without an administrator approval check. Delivery registration also immediately assigns delivery privileges. | Decide whether delivery onboarding requires approval, then enforce the intended approval boundary on the server. Test customer-to-delivery privilege changes and existing-role preservation. |
| High | `firestore.rules` allows public reads of all products and variants, including draft/archived documents. The catalog's server query filters active products but does not constrain direct client reads. | Restrict public reads to intended published data and retain admin access. Add emulator tests for draft products and variants. |
| High | `ProductCard.tsx` quick-add constructs a synthetic `productId-default` variant with size M. The quote endpoint requires an actual variant document and skips missing variants. | Resolve a real in-stock variant or require size/color selection before adding; exercise cart-to-quote-to-order flows end to end. |
| Medium | The existing homepage advertises free shipping above $150, but `api/checkout/quote/route.ts` always charges $10 and uses a flat tax rate. This pass retains that existing behavior/copy. | Align the shipping promise and actual pricing rules; specify tax requirements and boundary tests before changing checkout. |
| Medium | Women's/men's/new-arrival links use category IDs that differ from the T-Shirts/Shirts/Jeans/Hoodies/Dresses categories in the catalog and product form. `getPublishedProducts` compares category IDs exactly. | Establish one category taxonomy or distinct audience/collection filters so navigation returns the intended products. |
| Medium | Wishlist clicks only display a toast and the wishlist page is a static empty state. Header search/notifications, product copy/filter/select/pagination controls include unfinished handlers. Footer help/legal links still target `#`. | Finish or clearly mark incomplete features; add actual policy/help pages. Preserve the existing handlers while implementing each workflow separately. |
| Medium | Dashboard chart data is not connected. Low-stock/backup messages and product growth are hard-coded. Dashboard new-product cards read `images/priceMinor` while the catalog uses `imagePaths/basePriceMinor`, which can produce missing thumbnails and $0 prices. Decorative sparklines do not represent measured trends. | Connect real data, normalize field names, and replace sample claims with measured or honest unavailable states. |
| Medium | Dashboard reads the whole order collection on each render; catalog search filters after limiting the fetched results. | Add appropriate pagination and aggregates, and define search behavior against the complete relevant product set. |
| Medium | Middleware decodes the session payload for routing and forces admins back into the admin area, so storefront/delivery links may redirect back. Server authorization and UI routing have different sources for roles. | Review routing with real customer, admin, and delivery sessions. Keep authorization on verified server claims and make navigation match allowed destinations. |
| Medium | Existing tests are limited; Firestore rules tests read `firestore.rules` from the frontend working directory although the file is in the repository root. | Fix the fixture path, run rules tests against the emulator, and cover payment retries, refunds, stock races, role enforcement, and product form submission. |
| Later | Large/raw image elements, duplicated UI styles, extensive `any` types, and inconsistent product schemas increase maintenance cost. | Optimize image delivery, consolidate reusable presentation patterns and product types, and add realistic loading/error states. |

## Verification and limitations

- PASS: `node node_modules/vitest/vitest.mjs run tests/home.test.tsx tests/design-interactions.test.tsx --maxWorkers=1` — 5 tests across 2 files, including confirmation that canceling product deletion does not call the API.
- PASS: focused ESLint on the new components, core restyled components, storefront page/layout, and interaction tests; existing raw-image performance warnings remain.
- Browser checked the storefront at desktop and 390px phone widths, including mobile navigation and the search overlay.
- Browser checked the actual admin presentation components through an isolated local fixture: dashboard, mobile menu, product table, and existing product search. At 390px the document and viewport widths both measured 390px; the wide table stays inside its horizontal scroll container.
- Whole-project TypeScript/lint checks are blocked by existing source problems. A diagnostic typecheck excluded only the two malformed scratch files; the resulting errors are recorded in `design-typecheck.txt`. No lint/type checks were disabled in project configuration.
- FAIL (existing blockers): `npm run build` compiled with warnings about the pre-existing invalid Firebase auth import, then failed its lint gate on existing errors. See `design-build.txt`. Production deployment is not verified.
- Live Firebase requests from the local server failed with network access errors. The storefront's empty-data state was verified. No authenticated admin session was available; sample data in the preview is explicitly labeled and is not evidence of live backend correctness.
- Real payment, checkout, refunds, product saves/deletes, and delivery side effects were not exercised.

## Files and local preview

- Main styles: `frontend/src/app/globals.css`.
- Storefront: `HomeClient.tsx`, `Navbar.tsx`, `NavClient.tsx`, `ProductCard.tsx`, `CartDrawer.tsx`, `SearchInput.tsx`, and `app/products/page.tsx`.
- Admin: `AdminShell.tsx`, `AdminSidebar.tsx`, `AdminHeader.tsx`, `DashboardOverview.tsx`, dashboard empty states, product table, and admin layouts.
- Shared: `MotionProvider.tsx`, `useDialogFocus.ts`, buttons, inputs, cards, and root font/layout.
- Tests: `frontend/tests/design-interactions.test.tsx`.
- The initial core UI files were copied to `docs/design-backup-2026-09-23` before editing; the workspace has no Git repository.
- App preview: from `frontend`, run `npm run dev -- --hostname 127.0.0.1 --port 3100`.
- Admin visual fixture: from `frontend`, run `node node_modules/vite/bin/vite.js --config design-preview/vite.config.mjs`; open http://127.0.0.1:3101. This is a separate development-only fixture, outside Next.js routes, with sample data and data actions disabled. It does not weaken authentication.
- Saved visual checks: `docs/design-previews/admin-desktop.png` and `docs/design-previews/storefront-mobile.png`.
