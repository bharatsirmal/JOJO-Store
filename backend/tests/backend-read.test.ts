import {it,expect,vi,beforeEach} from "vitest";
const m=vi.hoisted(()=>({user:vi.fn(),where:vi.fn(),get:vi.fn(),docGet:vi.fn()}));
vi.mock("@/lib/auth/server",()=>({getCurrentUser:m.user}));
vi.mock("@/lib/firebase/admin",()=>{
 const query:any={where:(...args:any[])=>{m.where(...args);return query;},orderBy:()=>query,limit:()=>query,get:m.get,doc:()=>({get:m.docGet})};
 return {adminDb:{collection:()=>query,collectionGroup:()=>query}};
});
import { POST } from "../src/app/api/data/read/route";
beforeEach(()=>{vi.clearAllMocks();m.user.mockResolvedValue(null);m.get.mockResolvedValue({docs:[]});});
const request=(body:unknown)=>new Request("http://localhost/api/data/read",{method:"POST",body:JSON.stringify(body)});
it("enforces active catalog filtering and omits private product fields",async()=>{
 m.get.mockResolvedValue({docs:[{id:"p",ref:{path:"products/p"},data:()=>({name:"Shirt",status:"active",supplierCost:123,internalNotes:"private"})}]});
 const response=await POST(request({path:"products"}));const data=await response.json();
 expect(m.where).toHaveBeenCalledWith("status","==","active");
 expect(data.rows[0].data).toEqual({name:"Shirt",status:"active"});
});
it("enforces the authenticated customer ID independently of supplied filters",async()=>{
 m.user.mockResolvedValue({uid:"owner",role:"customer"});
 const response=await POST(request({path:"orders",filters:[["customerId","==","victim"]]}));
 expect(response.status).toBe(200);expect(m.where).toHaveBeenCalledWith("customerId","==","owner");
});
it("denies private reads without querying the database",async()=>{
 expect((await POST(request({path:"users"}))).status).toBe(401);
 expect(m.get).not.toHaveBeenCalled();
});
it("blocks customer shipment reads without an ownership selector",async()=>{
 m.user.mockResolvedValue({uid:"owner",role:"customer"});
 expect((await POST(request({path:"shipments"}))).status).toBe(403);
 expect(m.get).not.toHaveBeenCalled();
});
it("denies variant reads when their parent product is not published",async()=>{
 m.docGet.mockResolvedValue({data:()=>({status:"draft"})});
 const response=await POST(request({path:"products/p/variants"}));
 expect(await response.json()).toEqual({rows:[],count:0});expect(m.get).not.toHaveBeenCalled();
});
