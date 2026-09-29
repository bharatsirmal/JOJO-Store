import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing idToken" }, { status: 400 });
    }

    const decodedToken = await adminAuth!.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Check if user already has a role in Firestore
    const userDoc = await adminDb!.collection("users").doc(uid).get();
    let currentRole = "customer";
    
    if (userDoc.exists) {
      currentRole = userDoc.data()?.role || "customer";
    }

    // Only set to delivery_pending if they are a regular customer or new user
    // Do not downgrade them if they are already an admin or delivery_partner
    if (currentRole === "customer" || !userDoc.exists) {
      await adminAuth!.setCustomUserClaims(uid, { role: "delivery_pending" });
      
      await adminDb!.collection("users").doc(uid).set({
        email: decodedToken.email || "",
        displayName: decodedToken.name || "",
        role: "delivery_pending",
        createdAt: userDoc.exists ? userDoc.data()?.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Google Delivery Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

