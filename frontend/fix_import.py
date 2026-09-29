file_path = "src/app/admin/orders/[orderId]/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('import { requireAdmin } from "@/lib/auth";', 'import { requireAdmin } from "@/lib/auth/server";')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

