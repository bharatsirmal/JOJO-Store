import re
file_path = "frontend/src/components/NavbarWrapper.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace('if (pathname?.startsWith("/admin") || pathname?.startsWith("/delivery")) {', 'if (pathname?.startsWith("/admin") || pathname?.startsWith("/delivery") || pathname?.startsWith("/checkout")) {')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

