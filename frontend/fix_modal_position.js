
const fs = require("fs");
const path = "src/components/admin/AdminHeader.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `<header className="admin-header sticky top-0 z-40 flex w-full items-center justify-between gap-3 px-4 sm:px-8">`,
    `<>
    <header className="admin-header sticky top-0 z-40 flex w-full items-center justify-between gap-3 px-4 sm:px-8">`
);

content = content.replace(
    `      <ProfileEditModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        currentName={userName || ""} 
        currentEmail={userEmail} 
      />
    </header>`,
    `    </header>
      <ProfileEditModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        currentName={userName || ""} 
        currentEmail={userEmail} 
      />
    </>`
);

fs.writeFileSync(path, content, "utf8");

