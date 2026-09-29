# Isolated admin design preview

Run from frontend: `node node_modules/vite/bin/vite.js --config design-preview/vite.config.mjs`

Open http://127.0.0.1:3101. Uses the real admin shell, dashboard presentation, and product table with clearly labeled sample data. This is a separate local development server, not a Next.js route or authentication bypass. Firebase is never imported; network data actions are disabled in this fixture. Only Dashboard and Products have distinct preview content. Use the actual authenticated app for end-to-end workflow checks.
