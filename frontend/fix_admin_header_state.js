
const fs = require("fs");
const path = "src/components/admin/AdminHeader.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `const router = useRouter();
  const pathname = usePathname();`,
    `const router = useRouter();
  const pathname = usePathname();
  const [showProfileModal, setShowProfileModal] = useState(false);`
);

fs.writeFileSync(path, content, "utf8");

