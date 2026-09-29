file_path = "src/app/admin/orders/[orderId]/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'import { formatPrice } from "@/lib/utils";',
    'const formatPrice = (minor: number) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(minor / 100);'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

