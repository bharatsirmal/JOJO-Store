
const fs = require("fs");
const filePath = "src/app/(auth)/delivery-login/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

const oldLogic = `const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Session failed");`;

const newLogic = `const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Session failed");
    
    const sessionData = await res.json();
    if (sessionData.role !== "delivery_partner") {
      await auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      throw new Error("This portal is for delivery partners only.");
    }`;

content = content.replace(oldLogic, newLogic);
fs.writeFileSync(filePath, content, "utf8");

