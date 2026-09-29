file_path = "src/app/api/admin/products/route.ts"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """
      const newProductData = {
        ...validatedData,
        imagePaths: validatedData.imagePaths || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
      };

      t.set(docRef, newProductData);

      // Generate variant subcollection based on sizes and colors
      if (validatedData.colorVariants && validatedData.sizes) {
        let variantIndex = 1;
        for (const cv of validatedData.colorVariants) {
          for (const size of validatedData.sizes) {
            const variantId = `${validatedData.slug}-${variantIndex}`;
            const variantRef = docRef.collection("variants").doc(variantId);
            
            t.set(variantRef, {
              id: variantId,
              productId: validatedData.slug,
              sku: `${validatedData.slug}-${size}-${cv.colorName}`.toUpperCase().replace(/\s+/g, "-"),
              size: size,
              color: cv.colorName,
              priceMinor: validatedData.basePriceMinor,
              stockAvailable: 100, // Default stock for dev
              stockReserved: 0
            });
            variantIndex++;
          }
        }
      } else {
        // Create a default variant if no explicit sizes/colors
        const variantId = `${validatedData.slug}-default`;
        const variantRef = docRef.collection("variants").doc(variantId);
        t.set(variantRef, {
          id: variantId,
          productId: validatedData.slug,
          sku: `${validatedData.slug}-DEFAULT`.toUpperCase(),
          size: "Default",
          color: "Default",
          priceMinor: validatedData.basePriceMinor,
          stockAvailable: 100,
          stockReserved: 0
        });
      }
"""

content = content.replace("""
      const newProductData = {
        ...validatedData,
        imagePaths: validatedData.imagePaths || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: user.uid,
      };

      t.set(docRef, newProductData);
""", replacement)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

