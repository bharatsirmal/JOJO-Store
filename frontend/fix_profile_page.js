
const fs = require("fs");
const path = "src/app/admin/customers/[userId]/page.tsx";
let content = fs.readFileSync(path, "utf8");

// Import the client component
content = content.replace(
    `import Link from "next/link";`,
    `import Link from "next/link";\nimport { CustomerProfileActions } from "./CustomerProfileActions";`
);

// Add the component to the header
const oldHeader = `<div className="flex items-center gap-4 mb-8">
        <Link href="/admin/customers" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Profile</h1>
          <p className="text-slate-500 text-sm mt-1">ID: {params.userId}</p>
        </div>
      </div>`;

const newHeader = `<div className="flex items-center gap-4 mb-8">
        <Link href="/admin/customers" className="text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Profile</h1>
          <p className="text-slate-500 text-sm mt-1">ID: {params.userId}</p>
        </div>
        
        <CustomerProfileActions userId={params.userId} email={userData.email} />
      </div>`;

content = content.replace(oldHeader, newHeader);
fs.writeFileSync(path, content, "utf8");

