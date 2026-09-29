
const fs = require("fs");
const path = "src/app/admin/products/ProductListClient.tsx";
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, "utf8");
    content = content.replace(
        `"Multiple SKUs" && "Multiple SKUs".toLowerCase().includes(search.toLowerCase())`,
        `true && "Multiple SKUs".toLowerCase().includes(search.toLowerCase())`
    );
    fs.writeFileSync(path, content, "utf8");
}

