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

async function makeDeliveryPartner(email) {
  try {
    const user = await auth.getUserByEmail(email);
    await auth.setCustomUserClaims(user.uid, { role: "delivery_partner" });
    
    await db.collection("users").doc(user.uid).update({
      role: "delivery_partner",
      updatedAt: new Date().toISOString()
    });

    console.log(`Success! ${email} is now a delivery_partner.`);
    console.log("Please log out and log back in for the new role to take effect.");
  } catch (error) {
    console.error("Error setting delivery partner role:", error);
  }
}

const emailArgs = process.argv.slice(2);
if (emailArgs.length === 0) {
  console.log("Please provide an email address. Example: node make-delivery.js worker@example.com");
} else {
  makeDeliveryPartner(emailArgs[0]);
}
