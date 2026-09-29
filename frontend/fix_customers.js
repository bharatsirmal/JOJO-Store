
const fs = require("fs");
const path = "src/app/admin/customers/page.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `import { Badge } from "@/components/ui/badge";`,
    `import { Badge } from "@/components/ui/badge";\nimport { CustomerActions } from "./CustomerActions";`
);

content = content.replace(
    `case 'delivery_partner':\n        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 shadow-none">Delivery</Badge>;`,
    `case 'delivery_partner':\n        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-0 shadow-none">Delivery</Badge>;\n      case 'delivery_pending':\n        return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 shadow-none">Pending Delivery</Badge>;`
);

content = content.replace(
    `<Button variant="ghost" className="text-[#5c5cff] hover:text-[#4b4be5] hover:bg-indigo-50 font-medium">\n                        View Profile\n                      </Button>`,
    `<CustomerActions userId={user.id} role={user.role} />`
);

fs.writeFileSync(path, content, "utf8");

