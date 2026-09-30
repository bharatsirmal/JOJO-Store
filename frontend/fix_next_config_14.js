
const fs = require("fs");
const path = "next.config.mjs";
let content = fs.readFileSync(path, "utf8");

// Remove the experimental block
content = content.replace(/experimental: \{\s*serverComponentsExternalPackages: \["firebase-admin", "jose", "jwks-rsa"\],\s*\},/g, "");

// Add serverExternalPackages at the root
content = content.replace(
    `const nextConfig = {`,
    `const nextConfig = {
  serverExternalPackages: ["firebase-admin"],`
);

fs.writeFileSync(path, content, "utf8");

