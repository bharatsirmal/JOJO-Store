import re

file_path = "frontend/src/components/CheckoutClient.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Update signature
content = content.replace("export function CheckoutClient({ user }: { user: { displayName?: string } }) {", "export function CheckoutClient({ user }: { user: { displayName?: string; email?: string } }) {")

# Update initial state
content = content.replace('fullName: user.displayName || "",\n    phone: "",', 'fullName: user.displayName || "",\n    email: user.email || "",\n    phone: "",')

# Add the UI field right after the first grid (Full Name and Phone Number)
ui_to_insert = """            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address *</label>
              <input 
                required
                type="email" 
                value={address.email || '''}
                onChange={e => setAddress({...address, email: e.target.value})}
                className="w-full border rounded-md h-10 px-3 bg-muted/50 focus:bg-background outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Address Line 1 *</label>"""

content = content.replace('            <div className="space-y-2">\n              <label className="text-sm font-medium">Address Line 1 *</label>', ui_to_insert)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

