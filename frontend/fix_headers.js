
const fs = require("fs");
const path = "next.config.mjs";
let content = fs.readFileSync(path, "utf8");

const headersConfig = `
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none",
          }
        ],
      },
    ];
  },
`;

if (!content.includes("headers()")) {
    content = content.replace("images: {", headersConfig + "  images: {");
    fs.writeFileSync(path, content, "utf8");
    console.log("Headers added");
}

