
const fs = require("fs");
const path = "next.config.mjs";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `const nextConfig = {`,
    `const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["firebase-admin", "jose", "jwks-rsa"],
  },`
);

fs.writeFileSync(path, content, "utf8");

