
const fs = require("fs");
const path = "src/app/layout.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `<body className={geist.className}>`,
    `<body className={\`\${geist.className} overscroll-none\`}>`
);

fs.writeFileSync(path, content, "utf8");

