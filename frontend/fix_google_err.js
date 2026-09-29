
const fs = require("fs");
const filePath = "src/app/(auth)/delivery-login/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
    `setError("Failed to sign in with Google.");`,
    `setError("Error: " + (err instanceof Error ? err.message : String(err)));\n      console.error(err);`
);

fs.writeFileSync(filePath, content, "utf8");

