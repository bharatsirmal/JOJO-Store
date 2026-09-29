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

async function fixDeliveryPartner(email) {
  try {
    const user = await auth.getUserByEmail(email);
    
    // Set custom claim
    await auth.setCustomUserClaims(user.uid, { role: "delivery_partner" });
    
    // Create or update Firestore doc
    await db.collection("users").doc(user.uid).set({
      email: user.email,
      role: "delivery_partner",
      updatedAt: new Date().toISOString()
    }, { merge: true });

    console.log(`Success! ${email} is now a delivery_partner in BOTH Auth and Firestore.`);
  } catch (error) {
    console.error("Error setting delivery partner role:", error);
  }
}

fixDeliveryPartner("sbharat23comp@student.mes.ac.in");
