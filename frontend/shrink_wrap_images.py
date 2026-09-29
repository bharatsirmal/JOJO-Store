import re

file_path = "frontend/src/components/HomeClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove fixed heights from the container divs
# <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-[400px] md:h-[450px]">
# becomes
# <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-auto">
content = re.sub(r'group h-\[400px\] md:h-\[450px\]', 'group h-auto aspect-auto', content)

# 2. Update the images to not be absolute inset-0, but instead define the height
# <img src="..." alt="..." className="absolute inset-0 w-full h-full object-contain object-center transition-transform duration-700 group-hover:scale-105" />
# becomes
# <img src="..." alt="..." className="w-full h-auto object-cover object-center transition-transform duration-700 group-hover:scale-105 block" />
# I will use a robust regex for this
pattern = r'<img src="([^"]+)" alt="([^"]+)" className="absolute inset-0 w-full h-full object-contain ([^"]+)" />'
replacement = r'<img src="\1" alt="\2" className="w-full h-auto object-cover \3 block" />'

content = re.sub(pattern, replacement, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

