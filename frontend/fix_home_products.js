
const fs = require("fs");
const path = "src/app/page.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `const latestProducts = await getPublishedProducts({ limit: 4 });`,
    `const latestProducts = await getPublishedProducts({ limit: 8 });`
);

fs.writeFileSync(path, content, "utf8");

