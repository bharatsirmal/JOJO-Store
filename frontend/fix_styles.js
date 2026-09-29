
const fs = require("fs");
const path = "src/components/SweatshirtCollection.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(/<motion\.div style=\{\{ y: y1, scale: scale1 \}\}/g, "<motion.div");
content = content.replace(/<motion\.div style=\{\{ y: y2, scale: scale2 \}\}/g, "<motion.div");
content = content.replace(/<motion\.div style=\{\{ y: y3 \}\}/g, "<motion.div");

fs.writeFileSync(path, content, "utf8");

