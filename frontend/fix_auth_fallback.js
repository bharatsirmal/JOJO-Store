
const fs = require("fs");
const path = "src/app/admin/customers/[userId]/page.tsx";
let content = fs.readFileSync(path, "utf8");

const oldCode = `  const userRecord = await adminAuth!.getUser(params.userId);
  
  let displayName = userData.displayName || userRecord.displayName;
  if (!displayName || displayName === "Unknown") {
    const email = userData.email || userRecord.email || "";
    displayName = email.split("@")[0];
  }
  
  let joinedDate = "Unknown";
  if (userRecord.metadata.creationTime) {
    joinedDate = new Date(userRecord.metadata.creationTime).toLocaleDateString();
  }`;

const newCode = `  let userRecord = null;
  try {
    userRecord = await adminAuth!.getUser(params.userId);
  } catch (e) {
    console.warn("User exists in Firestore but missing in Auth:", params.userId);
  }
  
  let displayName = userData.displayName || userRecord?.displayName;
  if (!displayName || displayName === "Unknown") {
    const email = userData.email || userRecord?.email || "";
    displayName = email ? email.split("@")[0] : "Unknown";
  }
  
  let joinedDate = "Unknown";
  if (userRecord?.metadata?.creationTime) {
    joinedDate = new Date(userRecord.metadata.creationTime).toLocaleDateString();
  } else if (userData.createdAt) {
    joinedDate = typeof userData.createdAt === "string" 
      ? new Date(userData.createdAt).toLocaleDateString() 
      : (userData.createdAt.toDate ? userData.createdAt.toDate().toLocaleDateString() : "Unknown");
  }`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(path, content, "utf8");

