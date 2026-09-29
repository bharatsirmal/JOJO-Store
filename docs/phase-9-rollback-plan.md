# JOJO Store - Rollback Plan

## Deployment Rollback (Vercel)
If a critical flaw is discovered in a new production deployment (e.g., checkout crashes, incorrect pricing):
1. Log into the Vercel Dashboard.
2. Navigate to the **Deployments** tab.
3. Locate the previous stable production deployment.
4. Click the three dots (options menu) and select **Promote to Production** (or **Rollback**).
5. Vercel will instantly swap the routing layer to point to the older, stable build without downtime.

## Database Migration Rollback
Since Firestore is a NoSQL schema-less database, there are no traditional "migrations" to roll back. However, if a bad deployment wrote corrupted data (e.g., bad inventory counts):
1. Immediately execute the Vercel Rollback to prevent further corruption.
2. Run an emergency Node.js script via the Firebase Admin SDK to repair the corrupted fields based on the last known good state or transaction logs.

## Emergency Disable Switches
If the payment gateway fails entirely (e.g., Stripe outage):
- An admin can temporarily disable all active products in the Dashboard by setting their status to \`draft\`. This will instantly remove them from the storefront, preventing customers from attempting doomed checkouts until the issue is resolved.

