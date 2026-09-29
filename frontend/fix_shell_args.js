
const fs = require("fs");
const path = "src/components/admin/AdminShell.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    /export function AdminShell\(\{ children, userEmail, userName, userRole \}: \{[\s\S]*?\}\) \{/,
    `export function AdminShell({ children, userEmail, userName, userRole, userImage }: {
  children: React.ReactNode;
  userEmail: string;
  userName?: string;
  userRole?: string;
  userImage?: string;
}) {`
);

fs.writeFileSync(path, content, "utf8");

