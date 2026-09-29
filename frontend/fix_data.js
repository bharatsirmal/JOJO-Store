
const fs = require("fs");
const path = "src/app/api/auth/session/route.ts";
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, "utf8");
    content = content.replace(
        `userDoc.data().role`,
        `userDoc.data()?.role`
    );
    fs.writeFileSync(path, content, "utf8");
}

