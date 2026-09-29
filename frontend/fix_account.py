file_path = "src/app/account/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """          <div className="pt-4 border-t flex gap-4">
            {user.role === "admin" && (
              <a href="/admin">
                <Button variant="default">Go to Admin Dashboard</Button>
              </a>
            )}
            {user.role === "delivery_partner" && (
              <a href="/delivery">
                <Button variant="default" className="bg-amber-600 hover:bg-amber-700">Go to Delivery Portal</Button>
              </a>
            )}
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="destructive">Logout</Button>
            </form>
          </div>"""

content = content.replace("""          <div className="pt-4 border-t flex gap-4">
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="destructive">Logout</Button>
            </form>
          </div>""", replacement)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

