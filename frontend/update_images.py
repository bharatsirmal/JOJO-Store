import re

file_path = "frontend/src/components/HomeClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace Men
content = content.replace('src="https://framerusercontent.com/images/9q82g77mrfSql5xHEzQZtflbLwM.png"', 'src="/man.jpg"')

# Replace Women
content = content.replace('src="https://framerusercontent.com/images/n0tMygktpfAXrgdpTtmqc1YM.png"', 'src="/woman.jpg"')

# Replace Accessories
content = content.replace('src="https://images.unsplash.com/photo-1572688484432-280f9bb4318c?auto=format&fit=crop&w=800&q=80"', 'src="/accessories.avif"')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

