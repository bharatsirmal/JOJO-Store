"use client";

import { useState } from "react";
import { ProductVariant } from "@/types";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type ExtendedVariant = ProductVariant & {
  productName: string;
  variantPath?: string;
};

export function InventoryTable({
  initialData,
}: {
  initialData: ExtendedVariant[];
}) {
  const [variants, setVariants] = useState<ExtendedVariant[]>(initialData);
  const [updating, setUpdating] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const filteredVariants = variants.filter(
    (v) =>
      [v.productName, v.sku, v.size, v.color]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (!stockFilter ||
        (stockFilter === "low"
          ? v.stockAvailable - (v.stockReserved || 0) <= 5
          : v.stockAvailable - (v.stockReserved || 0) <= 0)),
  );
  const handleStockUpdate = async (
    variant: ExtendedVariant,
    adjustmentAmount: number,
  ) => {
    if (adjustmentAmount === 0) return;

    const variantId = variant.id;
    setUpdating(variant.variantPath || variantId);
    const toastId = toast.loading("Updating inventory...");

    try {
      const response = await fetch("/api/admin/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId,
          variantPath: variant.variantPath,
          adjustmentAmount,
          reason: "Manual admin adjustment",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update stock");
      }

      const { newStockAvailable } = await response.json();

      setVariants((prev) =>
        prev.map((v) =>
          (v.variantPath || v.id) === (variant.variantPath || variantId)
            ? { ...v, stockAvailable: newStockAvailable }
            : v,
        ),
      );

      toast.success("Stock updated successfully.", { id: toastId });
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Unable to update inventory.",
        { id: toastId },
      );
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="admin-panel overflow-hidden">
      <div className="admin-toolbar p-4 flex flex-wrap gap-3 border-b">
        <input
          aria-label="Search inventory"
          placeholder="Search product or SKU..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 w-full sm:max-w-xs"
        />
        <select
          aria-label="Stock status"
          value={stockFilter}
          onChange={(e) => setStockFilter(e.target.value)}
          className="px-3"
        >
          <option value="">All stock</option>
          <option value="low">Low stock (5 or fewer unreserved)</option>
          <option value="out">No unreserved stock</option>
        </select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead>Size/Color</TableHead>
            <TableHead>Physical stock</TableHead>
            <TableHead>Reserved</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Quick Adjust</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredVariants.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="h-24 text-center text-muted-foreground"
              >
                No variants found in inventory.
              </TableCell>
            </TableRow>
          ) : (
            filteredVariants.map((variant) => {
              const isLowStock =
                variant.stockAvailable - (variant.stockReserved || 0) <= 5;
              const isOutOfStock =
                variant.stockAvailable - (variant.stockReserved || 0) <= 0;

              return (
                <TableRow key={variant.variantPath || variant.id}>
                  <TableCell className="font-medium">
                    {variant.productName}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {variant.sku}
                  </TableCell>
                  <TableCell>
                    {variant.size} / {variant.color}
                  </TableCell>
                  <TableCell className="font-bold">
                    {variant.stockAvailable}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {variant.stockReserved}
                  </TableCell>
                  <TableCell>
                    {isOutOfStock ? (
                      <Badge variant="destructive">Out of Stock</Badge>
                    ) : isLowStock ? (
                      <Badge
                        variant="outline"
                        className="text-amber-500 border-amber-500"
                      >
                        Low Stock
                      </Badge>
                    ) : (
                      <Badge variant="secondary">In Stock</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          updating === (variant.variantPath || variant.id) ||
                          variant.stockAvailable <= (variant.stockReserved || 0)
                        }
                        onClick={() => handleStockUpdate(variant, -1)}
                      >
                        -1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={
                          updating === (variant.variantPath || variant.id)
                        }
                        onClick={() => handleStockUpdate(variant, 1)}
                      >
                        +1
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
