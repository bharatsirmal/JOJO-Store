
const fs = require("fs");
const path = "src/app/admin/layout.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `<AdminShell userEmail={user.email || "Admin"} userName={user.displayName || "Admin User"} userRole={user.role}>`,
    `<AdminShell userEmail={user.email || "Admin"} userName={user.displayName || "Admin User"} userRole={user.role} userImage={user.photoURL}>`
);

fs.writeFileSync(path, content, "utf8");

