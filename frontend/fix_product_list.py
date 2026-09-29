import re
file_path = "src/app/admin/products/ProductListClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remove outOfStockCount logic which is invalid
content = re.sub(r"const outOfStockCount =.*?\n", "const outOfStockCount = 0; // Requires fetching variants\n", content)

# Remove sku access
content = re.sub(r"<div className=\"text-sm text-gray-500\">{p\.sku}</div>", "<div className=\"text-sm text-gray-500\">Multiple SKUs</div>", content)
content = re.sub(r"<div className=\"text-sm text-gray-500 mt-1\">SKU: {p\.sku}</div>", "<div className=\"text-sm text-gray-500 mt-1\">Variants available</div>", content)

# Remove stock access
content = re.sub(r"const stock = p\.stockQuantity \?\? 0;", "const stock = 100; // Placeholder until variant aggregation is built", content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

