file_path = "src/app/admin/orders/[orderId]/OrderDetailActions.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

replacement = """
  const createShipment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/shipments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", orderId }),
      });

      if (!res.ok) throw new Error("Failed to create shipment");
      
      const data = await res.json();
      toast.success("Shipment created successfully!");
      router.push(`/admin/shipments/${data.shipment.id}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create shipment");
    } finally {
      setIsLoading(false);
    }
  };

  if (currentStatus === "pending_payment") {"""

content = content.replace('if (currentStatus === "pending_payment") {', replacement)

replacement_confirmed = """
  if (currentStatus === "confirmed") {
    return (
      <Button 
        size="sm" 
        onClick={createShipment}
        disabled={isLoading}
      >
        <Package className="w-4 h-4 mr-1" />
        Create Shipment
      </Button>
    );
  }

  return null;
"""

content = content.replace("return null;", replacement_confirmed)
content = content.replace("import { Check, X } from \"lucide-react\";", "import { Check, X, Package } from \"lucide-react\";")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

