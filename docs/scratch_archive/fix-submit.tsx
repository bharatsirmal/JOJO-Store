        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
      }

      // 2. Reconstruct the final imagePaths array maintaining order
      let uploadIndex = 0;
      const finalImagePaths = imagePreviews.map(preview => {
        if (preview.startsWith("blob:")) {
          return uploadedUrls[uploadIndex++];
        }
        return preview; // Keep existing Cloudinary URL
      });

      // 3. Save to Firebase Database
      toast.loading("Saving to database...", { id: toastId });
      const payload = {
        ...data,
        basePriceMinor: Math.round(data.basePriceMinor * 100),
        offerPriceMinor: data.offerPriceMinor ? Math.round(data.offerPriceMinor * 100) : undefined,
        tags,
        sizes,
        colors,
        imagePaths: finalImagePaths
      };

      const response = await fetch(`/api/admin/products${productId ? `/${productId}` : ""}`, {
        method: productId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save product");
      }
