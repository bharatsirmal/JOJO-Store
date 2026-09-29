
const fs = require("fs");
const path = "src/components/HomeClient.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `<SweatshirtCollection products={featuredProducts} />`,
    `{/* Pass comfort section products, fallback to featured products if none marked */}
      <SweatshirtCollection products={featuredProducts.filter(p => p.isComfortSection).length > 0 ? featuredProducts.filter(p => p.isComfortSection) : featuredProducts} />`
);

fs.writeFileSync(path, content, "utf8");

