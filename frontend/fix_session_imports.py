file_path = "src/app/api/auth/session/route.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'import { adminAuth } from "@/lib/firebase/admin";',
    'import { adminAuth, adminDb } from "@/lib/firebase/admin";'
)

content = content.replace(
    'const { adminDb } = require("@/lib/firebase/admin");',
    ''
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

