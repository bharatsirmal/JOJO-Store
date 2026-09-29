
const fs = require("fs");

function fix(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, "utf8");
  
  // adminDb.collection -> adminDb!.collection
  content = content.replace(/adminDb\.collection/g, "adminDb!.collection");
  
  fs.writeFileSync(path, content, "utf8");
}

fix("src/app/api/auth/session/route.ts");
fix("src/app/api/auth/logout/route.ts");

