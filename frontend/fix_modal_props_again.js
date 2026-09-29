
const fs = require("fs");
const path = "src/components/admin/ProfileEditModal.tsx";
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, "utf8");
    content = content.replace(
        `export function ProfileEditModal({ 
  isOpen, 
  onClose, 
  currentName, 
  currentEmail 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentName: string;
  currentEmail: string;
}) {`,
        `export function ProfileEditModal({ 
  isOpen, 
  onClose, 
  currentName, 
  currentEmail,
  currentImage
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  currentName: string;
  currentEmail: string;
  currentImage?: string;
}) {`
    );
    fs.writeFileSync(path, content, "utf8");
}

