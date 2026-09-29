const { initializeApp, getApps, cert } = require("firebase-admin/app");
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

async function listCustomers() {
  try {
    const snapshot = await db.collection("users").get();
    
    if (snapshot.empty) {
      console.log("No documents in 'users' collection.");
      return;
    }

    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    console.log("Firestore Users Collection:");
    console.table(users);
  } catch (error) {
    console.error("Error fetching users from Firestore:", error);
  }
}

listCustomers();
