
const fs = require("fs");
const path = "src/components/admin/ProfileEditModal.tsx";
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
}) {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(currentName || "");
  const [photoURL, setPhotoURL] = useState("");`,
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
}) {
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState(currentName || "");
  const [photoURL, setPhotoURL] = useState(currentImage || "");`
);

fs.writeFileSync(path, content, "utf8");

