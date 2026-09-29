
const fs = require("fs");
const path = "src/app/api/auth/promote-delivery/route.ts";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `import { adminAuth, adminDb } from "@/lib/firebase/admin";`,
    `import { adminAuth, adminDb } from "@/lib/firebase/admin";\nimport { cookies } from "next/headers";`
);

content = content.replace(
    `const sessionCookie = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("__session="))?.split("=")[1];`,
    `const sessionCookie = cookies().get("__session")?.value;`
);

fs.writeFileSync(path, content, "utf8");

