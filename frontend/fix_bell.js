
const fs = require("fs");
const path = "src/components/admin/AdminHeader.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `<button aria-label="Notifications" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 hidden sm:block">
          <Bell className="h-5 w-5" />`,
    `<button onClick={() => toast("No new notifications", { icon: "??" })} aria-label="Notifications" className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100 hidden sm:block">
          <Bell className="h-5 w-5" />`
);

fs.writeFileSync(path, content, "utf8");

