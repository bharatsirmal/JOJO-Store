
const fs = require("fs");
const path = "src/components/admin/AdminHeader.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `export function AdminHeader({ userEmail, userName, userRole, onMenuToggle, menuOpen }: { userEmail: string, userName?: string, userRole?: string, onMenuToggle?: () => void, menuOpen?: boolean }) {`,
    `export function AdminHeader({ userEmail, userName, userRole, userImage, onMenuToggle, menuOpen }: { userEmail: string, userName?: string, userRole?: string, userImage?: string, onMenuToggle?: () => void, menuOpen?: boolean }) {`
);

const oldAvatarUI = `<div className="h-10 w-10 rounded-full bg-[#e6eddc] text-[#315447] flex items-center justify-center text-sm font-semibold">
              {(userName || userEmail).slice(0, 2).toUpperCase()}
            </div>`;

const newAvatarUI = `<div className="h-10 w-10 rounded-full bg-[#e6eddc] text-[#315447] flex items-center justify-center text-sm font-semibold overflow-hidden">
              {userImage ? <img src={userImage} alt="Profile" className="w-full h-full object-cover" /> : (userName || userEmail).slice(0, 2).toUpperCase()}
            </div>`;

content = content.replace(oldAvatarUI, newAvatarUI);

content = content.replace(
    `<ProfileEditModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        currentName={userName || ""} 
        currentEmail={userEmail} 
      />`,
    `<ProfileEditModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        currentName={userName || ""} 
        currentEmail={userEmail} 
        currentImage={userImage || ""}
      />`
);

fs.writeFileSync(path, content, "utf8");

