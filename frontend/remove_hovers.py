import re

with open("frontend/src/components/SweatshirtCollection.tsx", "r", encoding="utf-8") as f:
    content = f.read()

def remove_large_card_hover(match):
    src1 = match.group(1)
    alt1 = match.group(2)
    return f'<img src="{src1}" alt="{alt1}" className="absolute inset-0 w-full h-full object-cover md:object-contain transition-transform duration-700 group-hover:scale-[1.15] scale-110" />'

pattern_large = r'<img src="([^"]+)" alt="([^"]+)" className="absolute inset-0 w-full h-full object-cover md:object-contain transition-opacity duration-500 group-hover:opacity-0 scale-110" />\s*<img src="[^"]+" alt="[^"]+" className="absolute inset-0 w-full h-full object-cover md:object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100 scale-110" />'

content = re.sub(pattern_large, remove_large_card_hover, content)

def remove_small_card_hover(match):
    src1 = match.group(1)
    return f'<img src="{src1}" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />\n              <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />'

pattern_small = r'<img src="([^"]+)" className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0" />\s*<img src="[^"]+" className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100" />'

content = re.sub(pattern_small, remove_small_card_hover, content)

with open("frontend/src/components/SweatshirtCollection.tsx", "w", encoding="utf-8") as f:
    f.write(content)

