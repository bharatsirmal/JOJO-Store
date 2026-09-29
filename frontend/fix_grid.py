import re

file_path = "frontend/src/components/HomeClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

pattern = r'<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">'
replacement = r'<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-start">'

content = re.sub(pattern, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

