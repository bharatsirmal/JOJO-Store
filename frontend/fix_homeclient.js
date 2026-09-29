
const fs = require("fs");
const path = "src/components/HomeClient.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `{featuredProducts.map(product => <ProductCard key={product.id} product={product} />)}`,
    `{featuredProducts.slice(0, 4).map(product => <ProductCard key={product.id} product={product} />)}`
);

content = content.replace(
    `<SweatshirtCollection />`,
    `<SweatshirtCollection products={featuredProducts} />`
);

fs.writeFileSync(path, content, "utf8");

