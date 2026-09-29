import re
file_path = "frontend/src/components/CheckoutClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("value={address.email || '''}", "value={address.email || \"\"}")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

