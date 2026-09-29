const { initializeApp, getApps, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
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

const auth = getAuth();

async function listUsers() {
  try {
    const listUsersResult = await auth.listUsers(100);
    const users = listUsersResult.users.map(userRecord => ({
      email: userRecord.email,
      role: userRecord.customClaims?.role || 'customer'
    }));
    
    console.log("All Users:");
    console.table(users);
  } catch (error) {
    console.error("Error listing users:", error);
  }
}

listUsers();
