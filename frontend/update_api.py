import re

def add_subCategory(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        if "subCategory" not in content:
            content = content.replace("categoryId: z.string().min(2),", "categoryId: z.string().min(2),\n  subCategory: z.string().optional(),")
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Updated {file_path}")
    except FileNotFoundError:
        pass

add_subCategory("frontend/src/app/api/admin/products/route.ts")
add_subCategory("frontend/src/app/api/admin/products/[id]/route.ts")

