  basePriceMinor: z.coerce.number().min(0, "Price must be positive"),
  status: z.enum(["active", "draft", "archived"]),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  sku: z.string().optional(),
  stockQuantity: z.coerce.number().optional(),
  brand: z.string().optional(),
  featured: z.boolean().default(false),
  colors: z.array(z.string()).optional(),
  shippingReturns: z.string().optional(),
  isNew: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  offerPriceMinor: z.coerce.number().optional(),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: CatalogProduct;
  productId?: string;
}

export function ProductForm({ initialData, productId }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for mockup UI elements
  const [tags, setTags] = useState<string[]>(initialData?.tags || ["Summer", "Casual", "Cotton"]);
  const [tagInput, setTagInput] = useState("");
  const [sizes, setSizes] = useState<string[]>(initialData?.sizes || ["S", "M", "L", "XL", "XXL", "46", "48", "50", "52"]);
  const [colors, setColors] = useState<string[]>(initialData?.colors || ["Slate", "Black", "Sand"]);
  
  // Image handling
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>(initialData?.imagePaths || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "T-Shirts",
      basePriceMinor: initialData?.basePriceMinor ? initialData.basePriceMinor / 100 : 0, 
      status: initialData?.status || "active",
      material: (initialData as any)?.material || "",
      careInstructions: (initialData as any)?.careInstructions || "",
      shippingReturns: (initialData as any)?.shippingReturns || "",
      sku: (initialData as any)?.sku || "",
      stockQuantity: (initialData as any)?.stockQuantity || 0,
      brand: (initialData as any)?.brand || "",
      featured: initialData?.featured || false,
      isNew: (initialData as any)?.isNew || false,
      isBestseller: (initialData as any)?.isBestseller || false,
      offerPriceMinor: (initialData as any)?.offerPriceMinor ? (initialData as any).offerPriceMinor / 100 : undefined,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading(productId ? "Updating product..." : "Creating product...");
