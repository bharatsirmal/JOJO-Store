
const fs = require("fs");

function fixBlend(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, "utf8");
    
    // In ProductDetailClient (main image)
    content = content.replace(
        /className="absolute inset-0 w-full h-full object-contain object-center"/g,
        `className="absolute inset-0 w-full h-full object-contain object-center mix-blend-multiply"`
    );
    // In ProductDetailClient (thumbnails)
    content = content.replace(
        /<img src=\{img\} alt="" className="absolute inset-0 w-full h-full object-cover" \/>/g,
        `<img src={img} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply" />`
    );
    // In ProductDetailClient (color swatch thumbnails)
    content = content.replace(
        /<img src=\{cv.imagePaths\[0\]\} alt=\{cv.colorName\} className="w-full h-full object-cover" \/>/g,
        `<img src={cv.imagePaths[0]} alt={cv.colorName} className="w-full h-full object-cover mix-blend-multiply" />`
    );

    fs.writeFileSync(path, content, "utf8");
}

function fixCard(path) {
    if (!fs.existsSync(path)) return;
    let content = fs.readFileSync(path, "utf8");

    // ProductCard main image
    content = content.replace(
        /className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 group-hover:opacity-0"/g,
        `className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 group-hover:opacity-0 mix-blend-multiply"`
    );
    // ProductCard hover image
    content = content.replace(
        /className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-105 transition-transform"/g,
        `className="absolute inset-0 w-full h-full object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-105 transition-transform mix-blend-multiply"`
    );
    
    // Also remove the bg-slate-100 from the container so it blends to white
    content = content.replace(
        /className="product-media relative aspect-\[3\/4\] overflow-hidden rounded-xl bg-slate-100"/g,
        `className="product-media relative aspect-[3/4] overflow-hidden rounded-xl bg-[#f5f5f5]"`
    );

    fs.writeFileSync(path, content, "utf8");
}

fixBlend("src/components/ProductDetailClient.tsx");
fixCard("src/components/ProductCard.tsx");

