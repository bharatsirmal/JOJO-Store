import re

file_path = "frontend/src/components/HomeClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Unsplash URL with local image
pattern = r'src="https://images\.unsplash\.com/photo-1549298916-b41d501d3772\?auto=format&fit=crop&w=800&q=80"'
replacement = r'src="/footwear.png"'

content = re.sub(pattern, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

