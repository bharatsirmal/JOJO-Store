import re

file_path = "frontend/src/components/HomeClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Regex to remove the h3 tags in the Bento Grid Categories section
pattern = r'<h3 className="text-\[32px\] md:text-\[36px\] font-bold text-\[#080a10\] max-w-\[280px\] leading-\[1\.1em\] tracking-\[-0\.03em\]">[^<]+<\/h3>'

content = re.sub(pattern, "", content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

