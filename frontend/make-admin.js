const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
require("dotenv").config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();
const auth = getAuth();

async function makeAdmin(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    const uid = userRecord.uid;
    
    await auth.setCustomUserClaims(uid, { role: "admin" });
    
    await db.collection("users").doc(uid).set({
      role: "admin",
      email: email,
    }, { merge: true });
    
    console.log(`\n✅ Success! User ${email} has been granted Admin privileges.`);
    console.log(`   You can now log in and access http://localhost:3000/admin\n`);
  } catch (error) {
    console.error("Error making user admin:", error);
  }
}

const emailArgs = process.argv.slice(2);
if (emailArgs.length === 0) {
  console.log("Usage: node make-admin.js <user-email>");
  process.exit(1);
}

makeAdmin(emailArgs[0]);
