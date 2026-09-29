import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    // Requires an active Admin session
    const sessionCookie = cookies().get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDecoded = await adminAuth!.verifySessionCookie(sessionCookie, true);
    if (adminDecoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { targetUid } = await req.json();

    if (!targetUid) {
      return NextResponse.json({ error: "Missing targetUid" }, { status: 400 });
    }
    
    // Set custom claim
    await adminAuth!.setCustomUserClaims(targetUid, { role: "delivery_partner" });

    // Update Firestore
    await adminDb!.collection("users").doc(targetUid).set({
      role: "delivery_partner",
      updatedAt: new Date().toISOString(),
    }, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Promotion error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

