
const fs = require("fs");
const filePath = "src/lib/auth/server.ts";
let content = fs.readFileSync(filePath, "utf8");

const oldCode = `createdAt: data?.createdAt?.toDate().toISOString() || new Date().toISOString(),`;

const newCode = `createdAt: typeof data?.createdAt === "string" ? data.createdAt : (data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),`;

content = content.replace(oldCode, newCode);
fs.writeFileSync(filePath, content, "utf8");

