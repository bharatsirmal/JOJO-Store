
const fs = require("fs");
const path = "src/app/admin/products/ProductListClient.tsx";
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, "utf8");
    content = content.replace(
        /\{"Multiple SKUs" \|\| `JJ-XX-\$\{p\.id\.slice\(0,4\)\.toUpperCase\(\)\}`\}/g,
        `{"Multiple SKUs"}`
    );
    fs.writeFileSync(path, content, "utf8");
}

