
const fs = require("fs");
const path = "src/components/admin/ProductForm.tsx";
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, "utf8");
    content = content.replace(
        `initialData?.tags`,
        `(initialData as any)?.tags`
    );
    content = content.replace(
        `initialData?.sizes`,
        `(initialData as any)?.sizes`
    );
    fs.writeFileSync(path, content, "utf8");
}

