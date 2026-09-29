
const fs = require("fs");
const path = "src/app/admin/customers/[userId]/page.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));`,
    `const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));`
);

fs.writeFileSync(path, content, "utf8");

