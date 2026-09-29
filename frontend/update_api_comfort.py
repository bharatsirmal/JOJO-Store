import re

def add_comfort(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "isComfortSection" not in content:
            content = content.replace("featured: z.boolean().default(false),", "featured: z.boolean().default(false),\n  isComfortSection: z.boolean().default(false),")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {file_path}")
    except FileNotFoundError:
        pass

add_comfort("frontend/src/app/api/admin/products/route.ts")
add_comfort("frontend/src/app/api/admin/products/[productId]/route.ts")

