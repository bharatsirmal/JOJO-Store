file_path = "src/components/CheckoutClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace(
    '<Image src={item.imagePath} alt={item.productName || "Product"} fill className="object-cover" />',
    '<Image src={item.imagePath} alt={item.productName || "Product"} fill sizes="80px" className="object-cover" />'
)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

