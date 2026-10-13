import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";

export async function POST(req: Request) {
  try {
    const { email, password, displayName } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // 1. Create user in Firebase Auth
    const userRecord = await adminAuth!.createUser({
      email,
      password,
      displayName,
    });

    // 2. Set custom claim for delivery_pending (Requires Admin approval to become delivery_partner)
    await adminAuth!.setCustomUserClaims(userRecord.uid, { role: "delivery_pending" });

    // 3. Save to Firestore users collection
    await adminDb!.collection("users").doc(userRecord.uid).set({
      email: userRecord.email,
      role: "delivery_pending",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Delivery registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

