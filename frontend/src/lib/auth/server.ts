import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function getCurrentUser() {
  const sessionCookie = cookies().get("__session")?.value;
  if (!sessionCookie || !adminAuth || !adminDb) return null;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const userDoc = await adminDb.collection("users").doc(decodedClaims.uid).get();
    
    if (!userDoc.exists) return null;
    
    const data = userDoc.data();
    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email,
      role: data?.role || "customer",
      displayName: data?.displayName || "",
      photoURL: data?.photoURL || "",
      phoneNumber: data?.phoneNumber || "",
      createdAt: typeof data?.createdAt === "string" ? data.createdAt : (data?.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString()),
      emailVerified: decodedClaims.email_verified,
    };
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    return null;
  }
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}

