
const fs = require("fs");
const path = "src/components/admin/ProfileEditModal.tsx";
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, "utf8");
    content = content.replace(
        `const [photoURL, setPhotoURL] = useState("");`,
        `const [photoURL, setPhotoURL] = useState(currentImage || "");`
    );
    fs.writeFileSync(path, content, "utf8");
}

