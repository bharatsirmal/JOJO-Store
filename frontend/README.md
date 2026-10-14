# JOJO Store frontend

The frontend uses Next.js App Router, React, TypeScript and Tailwind CSS.
The separate backend uses Next.js API routes and starts through `backend/server.js`.
Both applications are deployed separately on Vercel.

## Project layout

- `src/app/`: pages and layouts.
- `src/components/`: storefront, account and admin UI components.
- `src/lib/`: frontend helpers, authentication, backend requests and cart state.
- `src/types/`: frontend data types.
- `public/`: images, logo and video used by the website.
- `docs/`: development, architecture and security references.

## Local development

Start the backend from the repository root:

```sh
cd backend
npm run dev
```

In another terminal start the frontend:

```sh
cd frontend
npm run dev
```

Frontend: http://localhost:3000. Backend: http://localhost:4000.

Use `frontend/.env.local` for public browser configuration and the backend URL.
Use `backend/.env.local` for private Firebase Admin, Stripe and other server credentials.
Do not put private credentials into frontend environment variables or commit environment files.

## Verification

Run `npm run lint` from `frontend` for frontend code checks, and
`npm run typecheck` from `backend` for backend TypeScript checks.

Run `npm run build` in each app folder to produce a deployment build.
For a self-hosted backend production server, run `npm run build` followed by
`npm start` from `backend`. Vercel uses the existing Next.js framework configuration.

Dependencies, generated builds and deployment metadata belong in `node_modules/`,
`.next/` and `.vercel/`; these ignored folders are needed by the development/deployment tools.
