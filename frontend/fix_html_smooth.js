
const fs = require("fs");
const path = "src/app/layout.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `<html lang="en">`,
    `<html lang="en" className="scroll-smooth">`
);

fs.writeFileSync(path, content, "utf8");

