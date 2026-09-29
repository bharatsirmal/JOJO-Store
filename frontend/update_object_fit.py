import re

file_path = "frontend/src/components/HomeClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace object-cover with object-contain in the Bento Grid section
pattern = r'(<div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">[\s\S]*?<\/div>\s*<\/section>)'

def replace_cover(match):
    return match.group(1).replace("object-cover", "object-contain")

content = re.sub(pattern, replace_cover, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

