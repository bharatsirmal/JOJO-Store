import re

file_path = "frontend/src/components/admin/ProductForm.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add to Zod schema
content = content.replace('featured: z.boolean().default(false),','featured: z.boolean().default(false),\n  isComfortSection: z.boolean().default(false),')

# Add to defaultValues
content = content.replace('featured: initialData?.featured || false,', 'featured: initialData?.featured || false,\n        isComfortSection: (initialData as any)?.isComfortSection || false,')

# Add to UI
ui_replacement = """                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" {...form.register("isComfortSection")} className="mt-1 w-4 h-4 rounded-sm text-[#5c5cff] border-slate-300 focus:ring-[#5c5cff]" />
                  <div>
                    <div className="text-sm font-semibold text-slate-700 group-hover:text-slate-900 transition-colors">Comfort Section</div>
                    <div className="text-xs text-slate-500">Show in the 'Designed for comfort' section</div>
                  </div>
                </label>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input type="checkbox" {...form.register("isNew")}"""

content = content.replace('                <label className="flex items-start gap-3 cursor-pointer group">\n                  <input type="checkbox" {...form.register("isNew")}', ui_replacement)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

