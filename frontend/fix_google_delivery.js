
const fs = require("fs");
const filePath = "src/app/(auth)/delivery-login/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

const oldLogic = `      // 2. Promote user in the backend
      const promoteRes = await fetch("/api/auth/promote-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
      if (!promoteRes.ok) throw new Error("Promotion failed");`;

const newLogic = `      // 2. Register them as a pending delivery partner in the backend
      const promoteRes = await fetch("/api/auth/register-delivery-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
      if (!promoteRes.ok) throw new Error("Registration failed");`;

content = content.replace(oldLogic, newLogic);

// Wait, I also need to make sure the sessionData check handles "delivery_pending" gracefully!
// In the current delivery-login page:
/*
    const sessionData = await res.json();
    if (sessionData.role !== "delivery_partner") {
      await auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      throw new Error("This portal is for delivery partners only.");
    }
*/

const oldSessionCheck = `if (sessionData.role !== "delivery_partner") {
      await auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      throw new Error("This portal is for delivery partners only.");
    }`;

const newSessionCheck = `if (sessionData.role === "delivery_pending") {
      await auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      throw new Error("Your delivery account is pending Admin approval.");
    }
    if (sessionData.role !== "delivery_partner") {
      await auth.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      throw new Error("This portal is for approved delivery partners only.");
    }`;

content = content.replace(oldSessionCheck, newSessionCheck);

fs.writeFileSync(filePath, content, "utf8");

