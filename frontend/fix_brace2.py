file_path = "src/types/index.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

content = content.replace("export interface UserProfile {\n  uid: string;\n  email: string;\n  role: UserRole;\n  createdAt: string;\n\n\n}\n\n\n\n", "export interface UserProfile {\n  uid: string;\n  email: string;\n  role: UserRole;\n  createdAt: string;\n}\n\n")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

