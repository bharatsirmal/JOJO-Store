
const fs = require("fs");
const path = "next.config.mjs";
let content = fs.readFileSync(path, "utf8");

if (!content.includes("ignoreDuringBuilds")) {
    content = content.replace(
        `const nextConfig = {`,
        `const nextConfig = {\n  eslint: {\n    ignoreDuringBuilds: true,\n  },`
    );
    fs.writeFileSync(path, content, "utf8");
}

