import re

with open("frontend/src/components/admin/ProductForm.tsx", "r", encoding="utf-8") as f:
    content = f.read()

replacement = """            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </div>"""

pattern = r'            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">\s*<div className="space-y-2">\s*<Label htmlFor="categoryId".*?Category.*?</Label>.*?<select id="categoryId".*?</select>\s*</div>\s*<div className="space-y-2">\s*<Label htmlFor="brand".*?Brand.*?</Label>\s*<Input id="brand".*?/>\s*</div>'

content = re.sub(pattern, replacement, content, flags=re.DOTALL)

with open("frontend/src/components/admin/ProductForm.tsx", "w", encoding="utf-8") as f:
    f.write(content)

