import re

file_path = "frontend/src/components/HomeClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace button styles
pattern = r'className="inline-block bg-\[#080a10\] text-white font-medium px-\[18px\] py-\[10px\] text-\[16px\] rounded-full hover:bg-black transition-colors shadow-sm"'
replacement = r'className="inline-block bg-gray-500 text-white font-medium px-[18px] py-[10px] text-[16px] rounded-[10px] hover:bg-gray-600 transition-colors shadow-sm"'

content = re.sub(pattern, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

