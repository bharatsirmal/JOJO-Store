const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
require("dotenv").config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

async function resetPass() {
  try {
    const user = await getAuth().getUserByEmail("sbharat23comp@student.mes.ac.in");
    await getAuth().updateUser(user.uid, { password: "Delivery123!" });
    console.log("Password reset successfully for " + user.email);
  } catch(e) {
    console.error("Error:", e);
  }
}
resetPass();

