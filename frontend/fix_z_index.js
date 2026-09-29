
const fs = require("fs");
const path = "src/components/admin/ProfileEditModal.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `className="fixed inset-0 z-50 bg-black/50`,
    `className="fixed inset-0 z-[100] bg-black/50`
);

fs.writeFileSync(path, content, "utf8");

