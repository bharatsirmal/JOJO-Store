export type ReadUser={uid:string;role:string}|null;
export type ReadSpec={path:string;group?:boolean;document?:boolean;filters?:[string,string,unknown][];order?:[string,"asc"|"desc"][];limit?:number;count?:boolean};
export function readAccess(spec:ReadSpec,user:ReadUser) {
  if (!/^[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*$/.test(spec.path) || spec.path.length>300) throw Error("Invalid path");
  const parts=spec.path.split("/");
  const collections=["products","users","orders","shipments","deliveryAssignments","trackingEvents"];
  if (spec.group ? spec.path!=="variants" : !collections.includes(parts[0])) throw Error("Forbidden");
  if (spec.document ? parts.length%2!==0 : parts.length%2!==1) throw Error("Invalid path");
  if (parts.length>2 && !(parts.length<=4 && parts[0]==="products" && parts[2]==="variants")) throw Error("Forbidden");
  if (user?.role==="admin") return "admin" as const;
  if (spec.group) throw Error("Forbidden");
  if (!spec.group && parts[0]==="products") return "catalog" as const;
  if (!user) throw Error("Unauthorized");
  if (parts[0]==="orders") return "orders" as const;
  if (parts[0]==="shipments") return "shipments" as const;
  if (parts[0]==="trackingEvents") return "tracking" as const;
  if (parts[0]==="deliveryAssignments" && user.role==="delivery_partner") return "assignments" as const;
  throw Error("Forbidden");
}
