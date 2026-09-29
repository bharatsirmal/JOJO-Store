import re

file_path = "frontend/src/components/HomeClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

pattern_acc = """{/* Bottom Left - Accessories */}
            <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-auto aspect-auto">
              <img src="/accessories.avif" alt="Accessories" className="w-full h-auto object-cover object-center transition-transform duration-700 group-hover:scale-105 block" />"""

repl_acc = """{/* Bottom Left - Accessories */}
            <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-auto aspect-[1104/1425]">
              <img src="/accessories.avif" alt="Accessories" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />"""

content = content.replace(pattern_acc, repl_acc)

pattern_foot = """{/* Bottom Right - Footwear */}
            <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-auto aspect-auto">
              <img src="/footwear.png" alt="Footwear" className="w-full h-auto object-cover object-center transition-transform duration-700 group-hover:scale-105 block" />"""

repl_foot = """{/* Bottom Right - Footwear */}
            <div className="relative rounded-[12px] overflow-hidden bg-[#e5e5e5] group h-auto aspect-[1104/1425]">
              <img src="/footwear.png" alt="Footwear" className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />"""

content = content.replace(pattern_foot, repl_foot)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

