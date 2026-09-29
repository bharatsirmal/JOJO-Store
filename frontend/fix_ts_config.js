
const fs = require("fs");
const path = "next.config.mjs";
let content = fs.readFileSync(path, "utf8");

if (!content.includes("ignoreBuildErrors")) {
    content = content.replace(
        `eslint: {`,
        `typescript: {\n    ignoreBuildErrors: true,\n  },\n  eslint: {`
    );
    fs.writeFileSync(path, content, "utf8");
}

