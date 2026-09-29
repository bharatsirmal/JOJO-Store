
const fs = require("fs");
const path = "src/app/(auth)/delivery-login/page.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    /await auth\.signOut\(\);/g,
    `await auth?.signOut();`
);

fs.writeFileSync(path, content, "utf8");

