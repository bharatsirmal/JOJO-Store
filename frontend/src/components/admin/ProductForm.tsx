"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CatalogProduct } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { X, Plus, UploadCloud, ImageIcon, GripVertical, Tag, AlertCircle, Trash2, Loader2 } from "lucide-react";

// Using the established Product schema properties plus new ones from mockup
const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  categoryId: z.string().min(2, "Main category is required"),
  subCategory: z.string().optional(),
    
  basePriceMinor: z.coerce.number().min(0, "Price must be positive"),
  status: z.enum(["active", "draft", "archived"]),
  material: z.string().optional(),
  careInstructions: z.string().optional(),
  sku: z.string().optional(),
  stockQuantity: z.coerce.number().optional(),
  brand: z.string().optional(),
  featured: z.boolean().default(false),
  isComfortSection: z.boolean().default(false),
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

  const [tags, setTags] = useState<string[]>((initialData as any)?.tags || ["Summer", "Casual", "Cotton"]);
  const [tagInput, setTagInput] = useState("");
  const [sizes, setSizes] = useState<string[]>((initialData as any)?.sizes || ["S", "M", "L", "XL", "XXL", "46", "48", "50", "52"]);
  
  // Color Variants handling (Replaces global colors & global imagePaths)
  type ColorVariantInput = {
    id: string;
    colorName: string;
    previews: string[]; // URLs or blob URLs
    files: File[];
  };

  const [colorVariants, setColorVariants] = useState<ColorVariantInput[]>(() => {
    if (initialData?.colorVariants && initialData.colorVariants.length > 0) {
      return initialData.colorVariants.map((cv, i) => ({
        id: `cv-${i}`,
        colorName: cv.colorName,
        previews: cv.imagePaths,
        files: []
      }));
    }
    // Fallback: If legacy product has images but no colors, map them to a default color
    if (initialData?.imagePaths && initialData.imagePaths.length > 0) {
       return [{ id: 'cv-0', colorName: "Default", previews: initialData.imagePaths, files: [] }];
    }
    // Empty default
    return [{ id: 'cv-0', colorName: "", previews: [], files: [] }];
  });

  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const form = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || "",
      slug: initialData?.slug || "",
      description: initialData?.description || "",
      categoryId: initialData?.categoryId || "men",
      subCategory: (initialData as any)?.subCategory || "T-Shirts",
      basePriceMinor: initialData?.basePriceMinor ? initialData.basePriceMinor / 100 : 0, 
      status: initialData?.status || "active",
      material: (initialData as any)?.material || "",
      careInstructions: (initialData as any)?.careInstructions || "",
      shippingReturns: (initialData as any)?.shippingReturns || "",
      sku: (initialData as any)?.sku || "",
      stockQuantity: (initialData as any)?.stockQuantity || 0,
      brand: (initialData as any)?.brand || "",
      featured: initialData?.featured || false,
        isComfortSection: (initialData as any)?.isComfortSection || false,
      isNew: (initialData as any)?.isNew || false,
      isBestseller: (initialData as any)?.isBestseller || false,
      offerPriceMinor: (initialData as any)?.offerPriceMinor ? (initialData as any).offerPriceMinor / 100 : undefined,
    },
  });

  const onSubmit = async (data: ProductFormValues) => {
    setIsSubmitting(true);
    const toastId = toast.loading(productId ? "Updating product..." : "Creating product...");

    try {
      // 1. Upload all pending files for all color variants
      let allFiles: File[] = [];
      colorVariants.forEach(cv => allFiles.push(...cv.files));
      
      let uploadedUrls: string[] = [];
      if (allFiles.length > 0) {
        toast.loading("Uploading images to Cloudinary...", { id: toastId });
        const formData = new FormData();
        allFiles.forEach(file => formData.append("file", file));
        
        const uploadRes = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData
        });
        
        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          throw new Error(err.error || "Failed to upload images");
        }
        
        const uploadData = await uploadRes.json();
        uploadedUrls = uploadData.urls;
      }

      // 2. Reconstruct the final colorVariants array maintaining order
      let uploadIndex = 0;
      const finalColorVariants = colorVariants.map(cv => {
        const finalImagePaths = cv.previews.map(preview => {
          if (preview.startsWith("blob:")) {
            return uploadedUrls[uploadIndex++];
          }
          return preview; // Keep existing Cloudinary URL
        });
        return {
          colorName: cv.colorName,
          imagePaths: finalImagePaths
        };
      }).filter(cv => cv.colorName.trim() !== ""); // Ignore empty color names

      const flatImagePaths = finalColorVariants.flatMap(cv => cv.imagePaths);
      const flatColors = finalColorVariants.map(cv => cv.colorName);

      // 3. Save to Firebase Database
      toast.loading("Saving to database...", { id: toastId });
      const payload = {
        ...data,
        basePriceMinor: Math.round(data.basePriceMinor * 100),
        offerPriceMinor: data.offerPriceMinor ? Math.round(data.offerPriceMinor * 100) : undefined,
        tags,
        sizes,
        colors: flatColors,
        imagePaths: flatImagePaths,
        colorVariants: finalColorVariants
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

      toast.success(productId ? "Product updated successfully!" : "Product created successfully!", { id: toastId });
      router.push("/admin/products");
      router.refresh();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "An error occurred", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    
    setColorVariants(prev => prev.map(cv => {
      if (cv.id === id) {
        const remainingSlots = 4 - cv.previews.length;
        const validFiles = files.slice(0, remainingSlots);
        
        validFiles.forEach(file => {
          if (file.size > 5 * 1024 * 1024) {
            toast.error(`File ${file.name} is too large (max 5MB)`);
            return;
          }
        });

        const newPreviews = validFiles.map(file => URL.createObjectURL(file));
        
        return {
          ...cv,
          previews: [...cv.previews, ...newPreviews],
          files: [...cv.files, ...validFiles]
        };
      }
      return cv;
    }));
  };

  const removeImage = (cvId: string, index: number) => {
    setColorVariants(prev => prev.map(cv => {
      if (cv.id === cvId) {
        const previewUrl = cv.previews[index];
        // If it's a blob url, we also need to remove it from files
        let newFiles = [...cv.files];
        if (previewUrl.startsWith("blob:")) {
           const blobIndex = cv.previews.slice(0, index).filter(p => p.startsWith("blob:")).length;
           newFiles = newFiles.filter((_, i) => i !== blobIndex);
        }
        return {
          ...cv,
          previews: cv.previews.filter((_, i) => i !== index),
          files: newFiles
        };
      }
      return cv;
    }));
  };

  const addColorVariant = () => {
    setColorVariants([...colorVariants, { id: `cv-${Date.now()}`, colorName: "", previews: [], files: [] }]);
  };
  
  const removeColorVariant = (id: string) => {
    setColorVariants(colorVariants.filter(cv => cv.id !== id));
  };

  const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const onError = (errors: any) => {
    console.error("Form validation errors:", errors);
    const firstError = Object.values(errors)[0] as any;
    toast.error(`Validation Error: ${firstError?.message || "Please check all fields."}`);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="flex flex-col lg:flex-row gap-6 items-start">
      
      {/* Left Column (Main Form) */}
      <div className="flex-1 space-y-6 w-full">
        
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Basic Information</h2>
              <p className="text-xs text-slate-500">Add the essential details about your product.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-slate-700">Product Name <span className="text-red-500">*</span></Label>
              <Input id="name" {...form.register("name")} placeholder="e.g. Classic T-Shirt" className="h-11 rounded-lg border-slate-200 bg-slate-50/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug" className="text-sm font-semibold text-slate-700">Product Slug (URL) <span className="text-red-500">*</span></Label>
              <Input id="slug" {...form.register("slug")} placeholder="e.g. jojo-tshirt-001" className="h-11 rounded-lg border-slate-200 bg-slate-50/50" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="categoryId" className="text-sm font-semibold text-slate-700">Main Category <span className="text-red-500">*</span></Label>
              <select id="categoryId" {...form.register("categoryId")} className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none focus:ring-1 focus:ring-[#5c5cff]">
                <option value="" disabled>Select Main Category</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="accessories">Accessories</option>
                <option value="footwear">Footwear</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subCategory" className="text-sm font-semibold text-slate-700">Sub Category</Label>
              <select id="subCategory" {...form.register("subCategory")} className="flex h-11 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 px-3 text-sm outline-none focus:ring-1 focus:ring-[#5c5cff]">
                <option value="">Select Sub Category</option>
                <option value="T-Shirts">T-Shirts</option>
                <option value="Shirts">Shirts</option>
                <option value="Jeans">Jeans</option>
                <option value="Hoodies">Hoodies</option>
                <option value="Sweatshirts">Sweatshirts</option>
                <option value="Dresses">Dresses</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="brand" className="text-sm font-semibold text-slate-700">Brand</Label>
              <Input id="brand" {...form.register("brand")} placeholder="e.g. JoJo" className="h-11 rounded-lg border-slate-200 bg-slate-50/50" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-semibold text-slate-700">Product Description <span className="text-red-500">*</span></Label>
            <Textarea id="description" {...form.register("description")} placeholder="Write a detailed description about your product..." className="min-h-[120px] rounded-lg border-slate-200 bg-slate-50/50 resize-none" />
            <div className="text-right text-xs text-slate-400">0/1000</div>
          </div>
        </div>

        {/* Color Variants & Images */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900">Color Variants & Images</h2>
                <p className="text-xs text-slate-500">Add product images for each color variant.</p>
              </div>
            </div>
            <Button type="button" variant="outline" onClick={addColorVariant} className="text-[#5c5cff] border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50">
              <Plus className="w-4 h-4 mr-2" /> Add Color Variant
            </Button>
          </div>

          <div className="space-y-6">
            {colorVariants.map((variant, index) => (
              <div key={index} className="p-5 border border-slate-200 rounded-xl bg-slate-50/30 relative group">
                <div className="flex items-start gap-4">
                  <div className="mt-2 text-slate-300 cursor-grab active:cursor-grabbing"><GripVertical className="w-5 h-5" /></div>
                  <div className="w-6 h-6 mt-2 rounded-full border border-slate-300 bg-slate-800 shadow-sm shrink-0" />
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1.5 w-full max-w-sm">
                        <Label className="text-sm font-semibold text-slate-700">Color Name <span className="text-red-500">*</span></Label>
                        <Input 
                          placeholder="e.g. Black, White, Blue" 
                          value={variant.colorName}
                          onChange={(e) => {
                            const newName = e.target.value;
                            setColorVariants(prev => prev.map(cv => cv.id === variant.id ? { ...cv, colorName: newName } : cv));
                          }}
                          className="h-10 rounded-lg border-slate-200 bg-white"
                        />
                      </div>
                      {colorVariants.length > 1 && (
                        <button type="button" onClick={() => removeColorVariant(variant.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-slate-700">Product Images <span className="text-red-500">*</span></Label>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex flex-col items-center justify-center w-64 h-32 border-2 border-dashed border-indigo-200 bg-indigo-50/30 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors">
                          <UploadCloud className="w-8 h-8 text-[#5c5cff] mb-2" />
                          <div className="text-xs text-slate-500 text-center px-4">
                            <span className="font-semibold text-[#5c5cff]">Click to upload images</span> or drag and drop<br/>
                            PNG, JPG, WebP (Max 5MB each)
                          </div>
                          <input 
                            type="file" 
                            multiple 
                            accept="image/*"
                            className="hidden" 
                            onChange={(e) => handleImageUpload(variant.id, e)}
                          />
                        </label>
                        
                        {variant.previews.map((url, i) => (
                          <div key={i} className="relative h-32 w-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm group/img">
                            <img src={url} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              type="button"
                              onClick={() => removeImage(variant.id, i)}
                              className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition-opacity hover:bg-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing & Inventory */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Pricing & Inventory</h2>
              <p className="text-xs text-slate-500">Set the price and stock details.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="basePriceMinor" className="text-sm font-semibold text-slate-700">Base Price (INR) <span className="text-red-500">*</span></Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-medium">₹</div>
                <Input id="basePriceMinor" type="number" {...form.register("basePriceMinor")} placeholder="0" className="h-11 pl-8 rounded-lg border-slate-200 bg-slate-50/50" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerPriceMinor" className="text-sm font-semibold text-slate-700">Offer Price (INR)</Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 font-medium">₹</div>
                <Input id="offerPriceMinor" type="number" {...form.register("offerPriceMinor")} placeholder="0" className="h-11 pl-8 rounded-lg border-slate-200 bg-slate-50/50" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="sku" className="text-sm font-semibold text-slate-700">SKU</Label>
              <Input id="sku" {...form.register("sku")} placeholder="e.g. JJ-TS-001" className="h-11 rounded-lg border-slate-200 bg-slate-50/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stockQuantity" className="text-sm font-semibold text-slate-700">Stock Quantity</Label>
              <Input id="stockQuantity" type="number" {...form.register("stockQuantity")} placeholder="0" className="h-11 rounded-lg border-slate-200 bg-slate-50/50" />
            </div>
          </div>
        </div>

        {/* Product Options */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Product Options</h2>
              <p className="text-xs text-slate-500">Add sizes, tags and other product options.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[1fr_200px] gap-8">
            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">Available Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {['S', 'M', 'L', 'XL', 'XXL', '46', '48', '50', '52'].map(sz => (
                    <label key={sz} className={`flex items-center gap-2 px-3 py-1.5 border rounded-full text-sm font-medium cursor-pointer transition-colors ${sizes.includes(sz) ? 'border-[#5c5cff] bg-indigo-50 text-[#5c5cff]' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                      <input 
                        type="checkbox" 
                        className="w-3.5 h-3.5 rounded-sm text-[#5c5cff] border-slate-300 focus:ring-[#5c5cff]" 
                        checked={sizes.includes(sz)}
                        onChange={(e) => {
                          if (e.target.checked) setSizes([...sizes, sz]);
                          else setSizes(sizes.filter(s => s !== sz));
                        }}
                      />
                      {sz}
                    </label>
                  ))}
                  {sizes.filter(s => !['S', 'M', 'L', 'XL', 'XXL', '46', '48', '50', '52'].includes(s)).map(sz => (
                     <label key={sz} className="flex items-center gap-2 px-3 py-1.5 border border-[#5c5cff] bg-indigo-50 text-[#5c5cff] rounded-full text-sm font-medium cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-3.5 h-3.5 rounded-sm text-[#5c5cff] border-slate-300 focus:ring-[#5c5cff]" 
                        checked={true}
                        onChange={() => setSizes(sizes.filter(s => s !== sz))}
                      />
                      {sz}
                    </label>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                   <Input 
                    placeholder="Custom size" 
                    className="w-32 h-9 text-sm rounded-lg border-slate-200 bg-slate-50/50" 
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value) {
                        e.preventDefault();
                        if (!sizes.includes(e.currentTarget.value)) setSizes([...sizes, e.currentTarget.value]);
                        e.currentTarget.value = '';
                      }
                    }}
                  />
                  <Button type="button" variant="outline" className="h-9 text-xs text-[#5c5cff] border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50">
                    <Plus className="w-3 h-3 mr-1" /> Add Custom
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-slate-700">Tags</Label>
                <div className="flex flex-wrap gap-2 items-center bg-slate-50/50 border border-slate-200 p-2 rounded-lg min-h-[44px]">
                  {tags.map((tag) => (
                    <div key={tag} className="flex items-center gap-1 bg-indigo-100/50 text-indigo-700 px-2 py-1 rounded-md text-xs font-semibold">
                      {tag}
                      <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-indigo-400 hover:text-indigo-900">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <input 
                    placeholder={tags.length === 0 ? "Type a tag and press Enter" : ""}
                    className="flex-1 min-w-[150px] bg-transparent outline-none text-sm px-2 text-slate-700" 
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={addTag}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-8 border-l border-slate-100 pl-8">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" {...form.register("featured")} className="mt-1 w-4 h-4 rounded-sm text-[#5c5cff] border-slate-300 focus:ring-[#5c5cff]" />
                <div>
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Featured Product</div>
                  <div className="text-xs text-slate-500">Show on homepage</div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" {...form.register("isComfortSection")} className="mt-1 w-4 h-4 rounded-sm text-[#5c5cff] border-slate-300 focus:ring-[#5c5cff]" />
              <div>
                <div className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Comfort Section</div>
                <div className="text-xs text-slate-500">Show in the 'Designed for comfort' section</div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="checkbox" {...form.register("isNew")} className="mt-1 w-4 h-4 rounded-sm text-[#5c5cff] border-slate-300 focus:ring-[#5c5cff]" />
              <div>
                <div className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">New Arrival</div>
                <div className="text-xs text-slate-500">Mark as new product</div>
              </div>
            </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <input type="checkbox" {...form.register("isBestseller")} className="mt-1 w-4 h-4 rounded-sm text-[#5c5cff] border-slate-300 focus:ring-[#5c5cff]" />
                <div>
                  <div className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Bestseller</div>
                  <div className="text-xs text-slate-500">Show bestseller badge</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column (Sidebar) */}
      <div className="w-full lg:w-[380px] shrink-0 space-y-6">
        
        {/* Product Preview */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Product Preview</h2>
              <p className="text-xs text-slate-500">Live preview of your product</p>
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-100 p-6 flex flex-col items-center justify-center text-center h-[280px]">
            {colorVariants[0]?.previews?.[0] ? (
               <img src={colorVariants[0].previews[0]} alt="Preview" className="w-full h-full object-contain mix-blend-multiply" />
            ) : (
              <>
                <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V10.5a3 3 0 013-3h6a3 3 0 013 3v3m-12 0A1.5 1.5 0 007.5 15h9a1.5 1.5 0 001.5-1.5m-12 0v6a1.5 1.5 0 001.5 1.5h9a1.5 1.5 0 001.5-1.5v-6"></path></svg>
                <div className="text-sm font-semibold text-slate-500">Add images to see preview</div>
              </>
            )}
          </div>
          {!colorVariants[0]?.previews?.[0] && (
            <div className="space-y-3 pt-2 opacity-50">
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/3"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-8 bg-slate-200 rounded-md"></div>
                <div className="h-8 w-8 bg-slate-200 rounded-md"></div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Additional Information</h2>
              <p className="text-xs text-slate-500">Provide extra details about your product.</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="material" className="text-sm font-semibold text-slate-700">Material</Label>
            <Input id="material" {...form.register("material")} placeholder="e.g. 100% Cotton" className="h-11 rounded-lg border-slate-200 bg-slate-50/50" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="careInstructions" className="text-sm font-semibold text-slate-700">Care Instructions</Label>
            <Textarea id="careInstructions" {...form.register("careInstructions")} placeholder="e.g. Machine wash cold, do not bleach..." className="min-h-[80px] rounded-lg border-slate-200 bg-slate-50/50 resize-none" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="shippingReturns" className="text-sm font-semibold text-slate-700">Shipping & Returns</Label>
            <Textarea id="shippingReturns" {...form.register("shippingReturns")} placeholder="e.g. Free shipping on orders above..." className="min-h-[80px] rounded-lg border-slate-200 bg-slate-50/50 resize-none" />
          </div>
        </div>

        {/* Status */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Status</h2>
              <p className="text-xs text-slate-500">Set the product status.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="radio" value="active" {...form.register("status")} className="mt-1 w-4 h-4 text-blue-500 focus:ring-blue-500 border-slate-300" />
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500" /> Active
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Product is visible in the store</div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="radio" value="draft" {...form.register("status")} className="mt-1 w-4 h-4 text-slate-500 focus:ring-slate-500 border-slate-300" />
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300 border border-slate-400" /> Draft
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Save as draft (not visible)</div>
              </div>
            </label>
            <label className="flex items-start gap-3 cursor-pointer group">
              <input type="radio" value="archived" {...form.register("status")} className="mt-1 w-4 h-4 text-slate-500 focus:ring-slate-500 border-slate-300" />
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-300 border border-slate-400" /> Archived
                </div>
                <div className="text-xs text-slate-500 mt-0.5">Hide from store</div>
              </div>
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-4 pt-4">
          <Button 
            type="button" 
            variant="outline"
            disabled={isSubmitting} 
            className="flex-1 h-12 rounded-lg font-bold border-slate-300 text-slate-700 bg-white hover:bg-slate-50"
            onClick={() => form.setValue("status", "draft")}
          >
            Save as Draft
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="flex-1 h-12 rounded-lg font-bold bg-[#5c5cff] hover:bg-[#4b4be6] text-white shadow-md shadow-indigo-200"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
            )}
            {productId ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>
    </form>
  );

}
