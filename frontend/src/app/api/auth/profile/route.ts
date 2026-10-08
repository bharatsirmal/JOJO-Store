import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { getCurrentUser } from "@/lib/auth/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  return NextResponse.json(user, { headers: { "Cache-Control": "private, no-store" } });
}

export async function PATCH(req: Request) {
  try {
    const sessionCookie = cookies().get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!adminAuth || !adminDb) return NextResponse.json({ error: "Profile service unavailable" }, { status: 503 });

    const decoded = await adminAuth!.verifySessionCookie(sessionCookie, true);
    const uid = decoded.uid;

    const body = await req.json();
    let { displayName } = body;
    const { phoneNumber, photoURL } = body;
    if (displayName !== undefined) {
      if (typeof displayName !== "string" || !displayName.trim() || displayName.trim().length > 80) {
        return NextResponse.json({ error: "Enter a name between 1 and 80 characters." }, { status: 400 });
      }
      displayName = displayName.trim();
    }

    // Prepare Auth update
    const authUpdate: any = {};
    if (displayName !== undefined) authUpdate.displayName = displayName;
    if (photoURL !== undefined) authUpdate.photoURL = photoURL;
    if (phoneNumber !== undefined && phoneNumber.trim() !== "") authUpdate.phoneNumber = phoneNumber;
    
    // Update Firebase Auth
    if (Object.keys(authUpdate).length > 0) {
      await adminAuth!.updateUser(uid, authUpdate);
    }

    // Prepare Firestore update
    const firestoreUpdate: any = { updatedAt: new Date().toISOString() };
    if (displayName !== undefined) firestoreUpdate.displayName = displayName;
    if (photoURL !== undefined) firestoreUpdate.photoURL = photoURL;
    if (phoneNumber !== undefined) firestoreUpdate.phoneNumber = phoneNumber;

    // Update Firestore
    await adminDb!.collection("users").doc(uid).set(firestoreUpdate, { merge: true });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

