import re
file_path = "frontend/src/app/api/checkout/quote/route.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    'if (!productDoc.exists) continue;',
    'if (!productDoc.exists) { console.log("Product not found:", productId); continue; }'
)

content = content.replace(
    'if (productData.status !== "active") continue;',
    'if (productData.status !== "active") { console.log("Product not active:", productId); continue; }'
)

content = content.replace(
    'if (!variantDoc.exists) continue;',
    'if (!variantDoc.exists) { console.log("Variant not found:", variantId); continue; }'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

