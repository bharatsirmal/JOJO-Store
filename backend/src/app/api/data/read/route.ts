import { NextResponse } from "next/server";
import { z } from "zod";
import { adminDb } from "@/lib/firebase/admin";
import { getCurrentUser } from "@/lib/auth/server";
import { readAccess } from "@/lib/read-policy";
const schema = z.object({
  path: z.string(),
  group: z.boolean().optional(),
  document: z.boolean().optional(),
  filters: z
    .array(
      z.tuple([
        z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/),
        z.enum(["==", "in", ">=", "<=", ">", "<"]),
        z.unknown(),
      ]),
    )
    .max(10)
    .optional(),
  order: z
    .array(
      z.tuple([
        z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/),
        z.enum(["asc", "desc"]),
      ]),
    )
    .max(3)
    .optional(),
  limit: z.number().int().min(1).max(1000).optional(),
  count: z.boolean().optional(),
});
const publicFields = [
  "name",
  "slug",
  "description",
  "categoryId",
  "imagePaths",
  "basePriceMinor",
  "currency",
  "featured",
  "status",
  "sizes",
  "colors",
  "colorVariants",
  "isNew",
  "isBestseller",
  "offerPriceMinor",
  "createdAt",
  "updatedAt",
  "material",
  "careInstructions",
  "shippingReturns",
];
const querySchema = schema.extend({
  select: z
    .array(z.string().regex(/^[A-Za-z][A-Za-z0-9_]*$/))
    .max(20)
    .optional(),
});
function serialize(value: any): any {
  if (value?.toDate instanceof Function) return value.toDate().toISOString();
  if (Array.isArray(value)) return value.map(serialize);
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serialize(v)]),
    );
  return value;
}
export async function POST(request: Request) {
  try {
    if (!adminDb)
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 503 },
      );
    const spec = querySchema.parse(await request.json());
    const user = await getCurrentUser();
    const access = readAccess(spec, user);
    const parts = spec.path.split("/");
    const db = adminDb;
    if (access === "catalog" && parts.length > 1) {
      const product = await db.collection("products").doc(parts[1]).get();
      if (product.data()?.status !== "active")
        return NextResponse.json({ rows: [], count: 0 });
    }
    let query: FirebaseFirestore.Query = spec.group
      ? db.collectionGroup(spec.path)
      : db.collection(spec.document ? parts.slice(0, -1).join("/") : spec.path);
    for (const [field, operator, value] of spec.filters || [])
      query = query.where(
        field,
        operator as FirebaseFirestore.WhereFilterOp,
        value,
      );
    const has = (field: string, value: unknown) =>
      spec.filters?.some(
        ([key, op, v]) => key === field && op === "==" && v === value,
      );
    if (access === "catalog" && parts.length === 1 && !has("status", "active"))
      query = query.where("status", "==", "active");
    if (access === "orders" && !has("customerId", user!.uid))
      query = query.where("customerId", "==", user!.uid);
    if (access === "assignments" && !has("deliveryPartnerId", user!.uid))
      query = query.where("deliveryPartnerId", "==", user!.uid);
    // Read shipment/tracking data only after checking its owning order or assignment.
    if (access === "shipments" || access === "tracking") {
      const id =
        spec.document && access === "shipments"
          ? parts[1]
          : spec.filters?.find(
              ([field, op]) =>
                field === (access === "tracking" ? "shipmentId" : "orderId") &&
                op === "==",
            )?.[2];
      const ids =
        access === "shipments"
          ? spec.filters?.find(
              ([field, op]) => field === "id" && op === "in",
            )?.[2]
          : undefined;
      const candidates = Array.isArray(ids) ? ids : [id];
      if (
        candidates.length === 0 ||
        candidates.length > 10 ||
        candidates.some((id) => typeof id !== "string")
      )
        throw Error("Forbidden");
      for (const candidate of candidates as string[]) {
        const isOrderFilter = access === "shipments" && !spec.document && !ids;
        const shipment = isOrderFilter
          ? null
          : await db.collection("shipments").doc(candidate).get();
        const orderId = isOrderFilter ? candidate : shipment?.data()?.orderId;
        if (!orderId) throw Error("Forbidden");
        if (user!.role === "delivery_partner") {
          const matches = await db
            .collection("deliveryAssignments")
            .where("shipmentId", "==", candidate)
            .where("deliveryPartnerId", "==", user!.uid)
            .limit(1)
            .get();
          if (matches.empty) throw Error("Forbidden");
        } else {
          const order = await db.collection("orders").doc(orderId).get();
          if (order.data()?.customerId !== user!.uid) throw Error("Forbidden");
        }
      }
    }
    if (spec.document)
      query = query.where("__name__", "==", parts[parts.length - 1]);
    if (spec.count)
      return NextResponse.json({
        count: (await query.count().get()).data().count,
      });
    if (spec.select?.length) query = query.select(...spec.select);
    for (const [field, direction] of spec.order || [])
      query = query.orderBy(field, direction);
    const snapshot = await query
      .limit(spec.document ? 1 : spec.limit || 1000)
      .get();
    const rows = snapshot.docs.map((doc) => {
      let data = doc.data();
      if (access === "catalog")
        data = Object.fromEntries(
          Object.entries(data).filter(([key]) =>
            (parts.length > 2
              ? [
                  "productId",
                  "sku",
                  "size",
                  "color",
                  "priceMinor",
                  "stockAvailable",
                  "stockReserved",
                ]
              : publicFields
            ).includes(key),
          ),
        );
      return { id: doc.id, path: doc.ref.path, data: serialize(data) };
    });
    return NextResponse.json({ rows });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Read failed";
    const status =
      message === "Unauthorized"
        ? 401
        : message === "Forbidden"
          ? 403
          : error instanceof z.ZodError
            ? 400
            : 500;
    if (status === 500) console.error("Backend read failed", error);
    return NextResponse.json(
      { error: status === 500 ? "Read failed" : message },
      { status },
    );
  }
}
