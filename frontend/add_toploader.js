
const fs = require("fs");
const path = "src/app/layout.tsx";
let content = fs.readFileSync(path, "utf8");

if (!content.includes("NextTopLoader")) {
    // Add import at the top
    content = content.replace(
        `import type { Metadata } from "next";`,
        `import type { Metadata } from "next";\nimport NextTopLoader from "nextjs-toploader";`
    );
    
    // Add component inside body
    content = content.replace(
        `<MotionProvider>`,
        `<NextTopLoader color="#1d4ed8" initialPosition={0.08} crawlSpeed={200} height={3} crawl={true} showSpinner={false} easing="ease" speed={200} shadow="0 0 10px #1d4ed8,0 0 5px #1d4ed8" />\n          <MotionProvider>`
    );

    fs.writeFileSync(path, content, "utf8");
}

