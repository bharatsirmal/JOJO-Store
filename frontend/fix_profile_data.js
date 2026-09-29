
const fs = require("fs");
const path = "src/app/admin/customers/[userId]/page.tsx";
let content = fs.readFileSync(path, "utf8");

// Import adminAuth
content = content.replace(
    `import { adminDb } from "@/lib/firebase/admin";`,
    `import { adminDb, adminAuth } from "@/lib/firebase/admin";`
);

// Fetch userRecord
const oldFetch = `  const userDoc = await adminDb.collection("users").doc(params.userId).get();
  if (!userDoc.exists) {
    notFound();
  }

  const userData = userDoc.data()!;`;

const newFetch = `  const userDoc = await adminDb.collection("users").doc(params.userId).get();
  if (!userDoc.exists) {
    notFound();
  }

  const userData = userDoc.data()!;
  
  // Get absolute source of truth for name and creation date from Firebase Auth
  const userRecord = await adminAuth!.getUser(params.userId);
  
  let displayName = userData.displayName || userRecord.displayName;
  if (!displayName || displayName === "Unknown") {
    const email = userData.email || userRecord.email || "";
    displayName = email.split("@")[0];
  }
  
  let joinedDate = "Unknown";
  if (userRecord.metadata.creationTime) {
    joinedDate = new Date(userRecord.metadata.creationTime).toLocaleDateString();
  }`;

content = content.replace(oldFetch, newFetch);

// Remove the old joinedDate logic
const oldJoinedDateLogic = `  let joinedDate = "Unknown";
  if (userData.createdAt) {
    joinedDate = typeof userData.createdAt === "string" 
      ? new Date(userData.createdAt).toLocaleDateString() 
      : userData.createdAt.toDate().toLocaleDateString();
  }`;

content = content.replace(oldJoinedDateLogic, "");

// Replace usage of userData.displayName with the new displayName variable
content = content.replace(/userData\.displayName \|\| "Unknown"/g, "displayName");
content = content.replace(/userData\.displayName/g, "displayName");

fs.writeFileSync(path, content, "utf8");

