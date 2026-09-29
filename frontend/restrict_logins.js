
const fs = require("fs");

function updateLogin(filePath, requiredRole, redirectPath, title, successMessage) {
    let content = fs.readFileSync(filePath, "utf8");
    
    // If it is already updated, skip
    if (content.includes("This portal is for")) return;

    // Find the fetch session call
    const fetchCall = `const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to establish secure session");
      }`;

    const newLogic = `const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to establish secure session");
      }
      
      const sessionData = await res.json();
      
      if (sessionData.role !== "${requiredRole}") {
        await auth.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("This portal is for ${title} only. Please use your respective portal.");
      }`;

    content = content.replace(fetchCall, newLogic);
    
    // Note: I also need to make sure the redirect goes to the right place. 
    // We can assume the existing redirect works, but we should make sure it actually pushes properly.
    
    fs.writeFileSync(filePath, content, "utf8");
}

try {
  updateLogin("src/app/(auth)/admin-login/page.tsx", "admin", "/admin", "administrators", "Welcome Admin!");
  updateLogin("src/app/(auth)/delivery-login/page.tsx", "delivery_partner", "/delivery", "delivery partners", "Welcome Delivery Partner!");
} catch (e) {
  console.log("Error:", e);
}

