
const fs = require("fs");
const path = "src/components/SweatshirtCollection.tsx";
let content = fs.readFileSync(path, "utf8");

content = content.replace(
    `const getProductImage = (product: CatalogProduct) => {
    return product.images && product.images.length > 0 ? product.images[0].url : "https://framerusercontent.com/images/A5rZp9q9bTGgoVGDpimnt2guF0.png";
  };`,
    `const getProductImage = (product: CatalogProduct) => {
    if (product.colorVariants && product.colorVariants.length > 0 && product.colorVariants[0].imagePaths && product.colorVariants[0].imagePaths.length > 0) {
        return product.colorVariants[0].imagePaths[0];
    }
    return product.imagePaths && product.imagePaths.length > 0 ? product.imagePaths[0] : "https://framerusercontent.com/images/A5rZp9q9bTGgoVGDpimnt2guF0.png";
  };`
);

fs.writeFileSync(path, content, "utf8");

