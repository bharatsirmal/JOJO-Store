
const fs = require("fs");
const path = "src/components/admin/AdminHeader.tsx";
let content = fs.readFileSync(path, "utf16le");
fs.writeFileSync(path, content, "utf8");

