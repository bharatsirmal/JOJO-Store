import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function DELETE(req: Request, { params }: { params: { userId: string } }) {
  try {
    const sessionCookie = cookies().get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDecoded = await adminAuth!.verifySessionCookie(sessionCookie, true);
    if (adminDecoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    if (!params.userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Delete from Auth
    try {
      await adminAuth!.deleteUser(params.userId);
    } catch (e: any) {
      // If user is already deleted from auth, proceed to clean up firestore
      if (e.code !== "auth/user-not-found") throw e;
    }

    // Delete from Firestore
    await adminDb!.collection("users").doc(params.userId).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

