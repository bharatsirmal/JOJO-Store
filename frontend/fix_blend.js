
const fs = require("fs");
const path = "src/components/SweatshirtCollection.tsx";
let content = fs.readFileSync(path, "utf8");

// We want to add mix-blend-multiply to the large images
content = content.replace(
    /className="absolute inset-0 w-full h-full object-cover md:object-contain transition-transform duration-700 group-hover:scale-\[1\.15\] scale-110"/g,
    `className="absolute inset-0 w-full h-full object-cover md:object-contain transition-transform duration-700 group-hover:scale-[1.15] scale-110 mix-blend-multiply"`
);

// We might also want to do this for the small cards at the bottom!
content = content.replace(
    /className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"/g,
    `className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 mix-blend-multiply"`
);

fs.writeFileSync(path, content, "utf8");

