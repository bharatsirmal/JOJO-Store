import { describe,it,expect } from "vitest";
import { readAccess } from "../src/lib/read-policy";
describe("Backend read authorization",()=>{
 it("restricts anonymous reads to catalog resources",()=>{
  expect(readAccess({path:"products"},null)).toBe("catalog");
  expect(readAccess({path:"products/p/variants"},null)).toBe("catalog");
  for(const path of ["orders","users","shipments","deliveryAssignments","trackingEvents"]) expect(()=>readAccess({path},null)).toThrow();
 });
 it("does not expose variant collection-group reads to customers",()=>{
  expect(()=>readAccess({path:"variants",group:true},null)).toThrow("Forbidden");
  expect(()=>readAccess({path:"variants",group:true},{uid:"u",role:"customer"})).toThrow("Forbidden");
  expect(readAccess({path:"variants",group:true},{uid:"a",role:"admin"})).toBe("admin");
 });
 it("rejects arbitrary collections, subcollections, and malformed paths",()=>{
  for(const path of ["paymentEvents","payments","users/u/private","products/p/secrets","../users","products//p"]) expect(()=>readAccess({path},{uid:"a",role:"admin"})).toThrow();
  expect(()=>readAccess({path:"orders/u"},null)).toThrow();
 });
 it("requires backend ownership checks on customer and delivery reads",()=>{
  expect(readAccess({path:"orders"},{uid:"u",role:"customer"})).toBe("orders");
  expect(readAccess({path:"shipments"},{uid:"u",role:"customer"})).toBe("shipments");
  expect(readAccess({path:"deliveryAssignments"},{uid:"d",role:"delivery_partner"})).toBe("assignments");
  expect(()=>readAccess({path:"deliveryAssignments"},{uid:"u",role:"customer"})).toThrow("Forbidden");
 });
});
