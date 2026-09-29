import re
file_path = "frontend/src/components/CheckoutClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("if (!address.fullName || !address.addressLine1 || !address.city) {", "if (!address.fullName || !address.email || !address.addressLine1 || !address.city) {")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

