
const fs = require("fs");
const path = "src/lib/auth/server.ts";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `displayName: data?.displayName || "",`,
    `displayName: data?.displayName || "",\n      photoURL: data?.photoURL || "",`
);

fs.writeFileSync(path, content, "utf8");

