file_path = "src/app/(auth)/login/page.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to establish secure session");
      }
      
      const sessionData = await res.json();
      
      if (sessionData.role !== "customer") {
        await auth.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("This portal is for customers only. Please use your respective portal.");
      }

      toast.success("Welcome back to JOJO Store!");
"""

content = content.replace("""
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to establish secure session");
      }

      toast.success("Welcome back to JOJO Store!");
""", replacement)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

