const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
require("dotenv").config({ path: ".env.local" });

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

async function fixVariants() {
  const products = await db.collection("products").get();
  for (const doc of products.docs) {
    const data = doc.data();
    const slug = data.slug;
    const variantsSnap = await db.collection(`products/${slug}/variants`).get();
    if (variantsSnap.empty) {
      console.log(`Fixing missing variants for: ${slug}`);
      const batch = db.batch();
      let variantIndex = 1;
      
      if (data.colorVariants && data.sizes) {
        for (const cv of data.colorVariants) {
          for (const size of data.sizes) {
            const variantId = `${slug}-${variantIndex}`;
            const ref = db.collection(`products/${slug}/variants`).doc(variantId);
            batch.set(ref, {
              id: variantId,
              productId: slug,
              sku: `${slug}-${size}-${cv.colorName}`.toUpperCase().replace(/\s+/g, "-"),
              size: size,
              color: cv.colorName,
              priceMinor: data.basePriceMinor,
              stockAvailable: 100,
              stockReserved: 0
            });
            variantIndex++;
          }
        }
      } else {
        const variantId = `${slug}-default`;
        const ref = db.collection(`products/${slug}/variants`).doc(variantId);
        batch.set(ref, {
          id: variantId,
          productId: slug,
          sku: `${slug}-DEFAULT`.toUpperCase(),
          size: "Default",
          color: "Default",
          priceMinor: data.basePriceMinor,
          stockAvailable: 100,
          stockReserved: 0
        });
      }
      await batch.commit();
      console.log(`Variants created for ${slug}`);
    }
  }
}

fixVariants().catch(console.error);

