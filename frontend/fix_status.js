
const fs = require("fs");
const path = "src/lib/delivery/shipment-service.ts";
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, "utf8");
    content = content.replace(
        `data.status === "confirmed" || data.status === "paid"`,
        `data.status === "confirmed" || (data.status as string) === "paid"`
    );
    fs.writeFileSync(path, content, "utf8");
}

