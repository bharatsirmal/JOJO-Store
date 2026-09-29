
const fs = require("fs");
const path = "src/components/SweatshirtCollection.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `const getProductColor = (product: CatalogProduct, defaultColor: string) => {
    return product.colors && product.colors.length > 0 ? product.colors[0].hex : defaultColor;
  };`,
    `const getProductColor = (product: CatalogProduct, defaultColor: string) => {
    const colorStr = product.colors && product.colors.length > 0 ? product.colors[0] : defaultColor;
    if (!colorStr) return defaultColor;
    
    // Map common words to their brand hex equivalent
    const c = colorStr.toLowerCase();
    if (c.includes("burnt") || c.includes("orange")) return "#904128";
    if (c.includes("sand") || c.includes("beige") || c.includes("khaki")) return "#b49d83";
    if (c.includes("midnight") || c.includes("navy") || c.includes("blue")) return "#214668";
    if (c.includes("black")) return "#1a1a1a";
    if (c.includes("white")) return "#f8f8f8";
    if (c.includes("green")) return "#2b4a3b";
    
    // Attempt to use the raw string directly in CSS (works for hex codes or standard CSS colors like "red")
    return colorStr;
  };`
);

fs.writeFileSync(path, content, "utf8");

