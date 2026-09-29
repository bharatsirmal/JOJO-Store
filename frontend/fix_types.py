import re
file_path = "src/types/index.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = re.sub(r"export interface ProductVariant \{[\s\S]*?attributes: Record<string, string>;.*?\}", "", content)
content = re.sub(r"export interface Product \{[\s\S]*?isPublished: boolean;\n\}", "", content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

