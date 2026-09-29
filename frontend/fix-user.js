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

async function checkUser(email) {
  try {
    const user = await auth.getUserByEmail(email);
    console.log("Auth User exists:", user.uid);
    
    const doc = await db.collection("users").doc(user.uid).get();
    console.log("Firestore User doc exists:", doc.exists);
    if (doc.exists) {
      console.log("Firestore User data:", doc.data());
    } else {
      console.log("FIXING: Creating Firestore document for this user...");
      await db.collection("users").doc(user.uid).set({
        email: user.email,
        role: user.customClaims?.role || "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("Done.");
    }
  } catch (error) {
    console.error(error);
  }
}

checkUser("osbert2060@gmail.com");
