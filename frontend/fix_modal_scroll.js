
const fs = require("fs");
const path = "src/components/admin/ProfileEditModal.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col"`,
    `className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-y-auto max-h-[90vh] flex flex-col"`
);

fs.writeFileSync(path, content, "utf8");

