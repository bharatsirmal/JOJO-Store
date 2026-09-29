
const fs = require("fs");
const path = "src/components/SweatshirtCollection.tsx";
let content = fs.readFileSync(path, "utf8");

// Fix Card 1
content = content.replace(
    /\(largeCards\[0\]\.variants\[0\]\?\.priceMinor \|\| 0\)/g,
    "(largeCards[0].offerPriceMinor || largeCards[0].basePriceMinor || 0)"
);
content = content.replace(
    /largeCards\[0\]\.variants\[0\]\?\.compareAtPriceMinor/g,
    "largeCards[0].offerPriceMinor"
);
content = content.replace(
    /largeCards\[0\]\.variants\[0\]\.compareAtPriceMinor/g,
    "largeCards[0].basePriceMinor"
);

// Fix Card 2
content = content.replace(
    /\(largeCards\[1\]\.variants\[0\]\?\.priceMinor \|\| 0\)/g,
    "(largeCards[1].offerPriceMinor || largeCards[1].basePriceMinor || 0)"
);
content = content.replace(
    /largeCards\[1\]\.variants\[0\]\?\.compareAtPriceMinor/g,
    "largeCards[1].offerPriceMinor"
);
content = content.replace(
    /largeCards\[1\]\.variants\[0\]\.compareAtPriceMinor/g,
    "largeCards[1].basePriceMinor"
);

// Fix Card 3
content = content.replace(
    /\(largeCards\[2\]\.variants\[0\]\?\.priceMinor \|\| 0\)/g,
    "(largeCards[2].offerPriceMinor || largeCards[2].basePriceMinor || 0)"
);
content = content.replace(
    /largeCards\[2\]\.variants\[0\]\?\.compareAtPriceMinor/g,
    "largeCards[2].offerPriceMinor"
);
content = content.replace(
    /largeCards\[2\]\.variants\[0\]\.compareAtPriceMinor/g,
    "largeCards[2].basePriceMinor"
);

// Fix Small Cards (Mapped)
content = content.replace(
    /\(product\.variants\[0\]\?\.priceMinor \|\| 0\)/g,
    "(product.offerPriceMinor || product.basePriceMinor || 0)"
);
content = content.replace(
    /product\.variants\[0\]\?\.compareAtPriceMinor/g,
    "product.offerPriceMinor"
);
content = content.replace(
    /product\.variants\[0\]\.compareAtPriceMinor/g,
    "product.basePriceMinor"
);

fs.writeFileSync(path, content, "utf8");

