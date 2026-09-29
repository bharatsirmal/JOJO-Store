
const fs = require("fs");
const filePath = "src/app/admin/customers/CustomerActions.tsx";
let content = fs.readFileSync(filePath, "utf8");

content = content.replace(
    `import { Check } from "lucide-react";`,
    `import { Check } from "lucide-react";\nimport Link from "next/link";`
);

const oldButton = `<Button variant="ghost" className="text-[#5c5cff] hover:text-[#4b4be5] hover:bg-indigo-50 font-medium">
        View Profile
      </Button>`;

const newButton = `<Link href={\`/admin/customers/\${userId}\`}>
        <Button variant="ghost" className="text-[#5c5cff] hover:text-[#4b4be5] hover:bg-indigo-50 font-medium">
          View Profile
        </Button>
      </Link>`;

content = content.replace(oldButton, newButton);
fs.writeFileSync(filePath, content, "utf8");

