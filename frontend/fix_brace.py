file_path = "src/types/index.ts"
with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.strip() == "}" and len(new_lines) > 0 and "export interface UserProfile" in "".join(new_lines[-6:]):
        continue
    new_lines.append(line)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

