
const fs = require("fs");
const path = "src/components/admin/AdminHeader.tsx";
let content = fs.readFileSync(path, "utf8");

// Import the modal
content = content.replace(
    `import { useRouter, usePathname } from "next/navigation";`,
    `import { useRouter, usePathname } from "next/navigation";\nimport { ProfileEditModal } from "./ProfileEditModal";\nimport { useState } from "react";`
);

// Add state to component
content = content.replace(
    `const router = useRouter();\n  const pathname = usePathname();`,
    `const router = useRouter();\n  const pathname = usePathname();\n  const [showProfileModal, setShowProfileModal] = useState(false);`
);

// Add the menu item
const oldDropdown = `<DropdownMenuLabel className="flex flex-col space-y-2 p-2">`;
const newDropdown = `<DropdownMenuItem className="p-2 cursor-pointer font-medium mb-1" onClick={() => setShowProfileModal(true)}>
              Edit Profile
            </DropdownMenuItem>\n            <DropdownMenuSeparator />\n            <DropdownMenuLabel className="flex flex-col space-y-2 p-2">`;
content = content.replace(oldDropdown, newDropdown);

// Add the modal component at the end before </header>
content = content.replace(
    `</header>`,
    `  <ProfileEditModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
        currentName={userName || ""} 
        currentEmail={userEmail} 
      />\n    </header>`
);

fs.writeFileSync(path, content, "utf8");

