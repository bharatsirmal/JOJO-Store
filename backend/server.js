"use strict";

/**
 * Backend entry point: npm run dev, npm start, or node server.js.
 *
 * src/app/api/  HTTP endpoints (Next.js route handlers)
 * src/config/   External service configuration
 * src/services/ Authentication, payments, delivery and admin business logic
 * src/lib/      Shared utilities and access policies
 * src/types/    Shared backend data types
 *
 * This launches the standard Next.js server. Vercel continues to deploy the
 * route handlers as managed functions using npm run build.
 */
const { spawn } = require("node:child_process");

const args = process.argv.slice(2);
const development = args.includes("--dev");
const port = process.env.PORT || "4000";

const server = spawn(
  process.execPath,
  [
    require.resolve("next/dist/bin/next"),
    development ? "dev" : "start",
    __dirname,
    "--port",
    port,
    ...args.filter((argument) => argument !== "--dev"),
  ],
  {
    cwd: __dirname,
    stdio: "inherit",
    env: {
      ...process.env,
      NODE_ENV: development ? "development" : "production",
    },
  },
);

server.once("error", (error) => {
  console.error("Unable to start the backend:", error.message);
  process.exitCode = 1;
});
server.once("exit", (code, signal) => {
  process.exitCode = code ?? (signal === "SIGINT" ? 130 : 143);
});
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.once(signal, () => {
    if (!server.killed) server.kill(signal);
  });
}
