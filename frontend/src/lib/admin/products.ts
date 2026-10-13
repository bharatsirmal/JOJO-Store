import { z } from "zod";
export const adminProductSchema = z
  .object({
    name: z.string().trim().min(2),
    slug: z
      .string()
      .trim()
      .min(2)
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Use a URL slug with lowercase letters, numbers and hyphens",
      ),
    description: z.string().min(10),
    categoryId: z.string().min(2),
    subCategory: z.string().optional(),
    basePriceMinor: z.number().int().min(0),
    status: z.enum(["active", "draft", "archived"]),
    material: z.string().optional(),
    careInstructions: z.string().optional(),
    featured: z.boolean().default(false),
    isComfortSection: z.boolean().default(false),
    sku: z.string().optional(),
    stockQuantity: z.number().int().min(0).optional(),
    brand: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sizes: z.array(z.string().trim().min(1)).optional(),
    colors: z.array(z.string()).optional(),
    colorVariants: z
      .array(
        z.object({
          colorName: z.string().trim().min(1),
          imagePaths: z.array(z.string()),
        }),
      )
      .optional(),
    imagePaths: z.array(z.string()).optional(),
    shippingReturns: z.string().optional(),
    isNew: z.boolean().default(false),
    isBestseller: z.boolean().default(false),
    offerPriceMinor: z.number().int().min(0).optional(),
  })
  .refine(
    (p) =>
      p.offerPriceMinor === undefined || p.offerPriceMinor <= p.basePriceMinor,
    {
      message: "Offer price cannot exceed base price",
      path: ["offerPriceMinor"],
    },
  );
type ProductInput = z.infer<typeof adminProductSchema>;
export function productVariantOptions(p: ProductInput) {
  const sizes = Array.from(new Set(p.sizes?.length ? p.sizes : ["Default"]));
  const colors = Array.from(
    new Set(
      p.colorVariants?.length
        ? p.colorVariants.map((c) => c.colorName)
        : p.colors?.length
          ? p.colors
          : ["Default"],
    ),
  );
  if (sizes.length * colors.length > 200)
    throw Error("Use at most 200 size/color combinations per product.");
  return colors.flatMap((color) =>
    sizes.map((size) => ({
      color,
      size,
      priceMinor: p.offerPriceMinor ?? p.basePriceMinor,
      sku: p.sku
        ? `${p.sku}-${size}-${color}`.toUpperCase().replace(/\s+/g, "-")
        : `${p.slug}-${size}-${color}`.toUpperCase().replace(/\s+/g, "-"),
    })),
  );
}
export function variantKey(variant: { size: string; color: string }) {
  return JSON.stringify([variant.size, variant.color]);
}
