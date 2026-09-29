import re
file_path = "frontend/src/types/index.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("fullName: string;", "fullName: string;\n  email?: string;")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

