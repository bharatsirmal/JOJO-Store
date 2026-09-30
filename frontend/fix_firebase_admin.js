
const fs = require("fs");
const path = "src/lib/firebase/admin.ts";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    /if \(getApps\(\)\.length === 0 && isConfigured\) \{[\s\S]*?\}\n/g,
    `if (getApps().length === 0 && isConfigured) {
  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    });
    console.log("Firebase Admin successfully initialized on Vercel.");
  } catch (error) {
    console.error("FATAL: Firebase Admin initialization failed! Your FIREBASE_PRIVATE_KEY is likely malformed in Vercel Environment Variables.", error);
  }
}\n`
);

fs.writeFileSync(path, content, "utf8");

