
const fs = require("fs");
const path = "src/components/admin/AdminShell.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `export function AdminShell({ children, userEmail, userName, userRole }: {
  children: React.ReactNode;
  userEmail: string;
  userName?: string;
  userRole?: string;
}) {`,
    `export function AdminShell({ children, userEmail, userName, userRole, userImage }: {
  children: React.ReactNode;
  userEmail: string;
  userName?: string;
  userRole?: string;
  userImage?: string;
}) {`
);

content = content.replace(
    `<AdminHeader userEmail={userEmail} userName={userName} userRole={userRole} onMenuToggle={() => setMenuOpen(true)} menuOpen={menuOpen} />`,
    `<AdminHeader userEmail={userEmail} userName={userName} userRole={userRole} userImage={userImage} onMenuToggle={() => setMenuOpen(true)} menuOpen={menuOpen} />`
);

fs.writeFileSync(path, content, "utf8");

