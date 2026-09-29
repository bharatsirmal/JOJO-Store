import os
import glob

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Replace adminDb. with adminDb!. and adminAuth. with adminAuth!.
    # But only if it is not already adminDb!.
    new_content = content.replace("adminDb.", "adminDb!.")
    new_content = new_content.replace("adminDb!.!", "adminDb!.") # Just in case
    new_content = new_content.replace("adminAuth.", "adminAuth!.")
    new_content = new_content.replace("adminAuth!.!", "adminAuth!.")
    
    # Also auth. from lib/firebase/admin
    # Wait, auth might be imported from client too. Lets be careful.
    # It's easier to just do it via regex for adminAuth and adminDb
    
    if content != new_content:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(new_content)

files_to_fix = [
    "src/app/admin/shipments/[shipmentId]/page.tsx",
    "src/app/admin/shipments/page.tsx",
    "src/app/api/auth/promote-delivery/route.ts",
    "src/app/api/auth/register-delivery/route.ts",
    "src/app/api/delivery/shipments/[shipmentId]/route.ts",
    "src/app/delivery/assignments/[shipmentId]/page.tsx",
    "src/app/delivery/page.tsx",
    "src/app/orders/[orderId]/tracking/page.tsx",
    "src/lib/delivery/shipment-service.ts"
]

for f in files_to_fix:
    if os.path.exists(f):
        fix_file(f)

