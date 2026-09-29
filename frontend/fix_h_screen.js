
const fs = require("fs");
const path = require("path");

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
            results.push(file);
        }
    });
    return results;
}

const files = walk("src");
let replacedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, "utf8");
    if (content.includes("min-h-screen")) {
        content = content.replace(/min-h-screen/g, "min-h-[100dvh]");
        fs.writeFileSync(file, content, "utf8");
        replacedCount++;
    }
    if (content.includes("h-screen")) {
        // Only replace exact matches to avoid messing up other classes
        content = content.replace(/\bh-screen\b/g, "h-[100dvh]");
        fs.writeFileSync(file, content, "utf8");
    }
});
console.log(`Replaced in ${replacedCount} files.`);

