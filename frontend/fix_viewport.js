
const fs = require("fs");
const path = "src/app/layout.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `export const metadata: Metadata = {`,
    `export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents auto-zoom on mobile inputs
};\n\nexport const metadata: Metadata = {`
);

fs.writeFileSync(path, content, "utf8");

