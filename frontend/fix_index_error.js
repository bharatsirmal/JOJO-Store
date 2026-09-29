
const fs = require("fs");
const filePath = "src/app/admin/customers/[userId]/page.tsx";
let content = fs.readFileSync(filePath, "utf8");

const oldQuery = `const ordersSnap = await adminDb.collection("orders")
    .where("customerId", "==", params.userId)
    .orderBy("createdAt", "desc")
    .get();
    
  const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));`;

const newQuery = `const ordersSnap = await adminDb.collection("orders")
    .where("customerId", "==", params.userId)
    .get();
    
  const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  // Sort in memory to avoid requiring a composite index
  orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());`;

content = content.replace(oldQuery, newQuery);
fs.writeFileSync(filePath, content, "utf8");

