
const fs = require("fs");

function fix(path) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, "utf8");
  content = content.replace(/await auth\.signOut\(\);/g, `await auth?.signOut();`);
  fs.writeFileSync(path, content, "utf8");
}

fix("src/app/(auth)/admin-login/page.tsx");
fix("src/app/(auth)/login/page.tsx");
fix("src/components/admin/AdminHeader.tsx");

