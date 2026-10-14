import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/config/firebase";
export async function POST(request: Request) {
  try {
    if (!adminAuth || !adminDb)
      return NextResponse.json(
        { success: false, error: "Authentication unavailable" },
        { status: 503 },
      );
    const { idToken, displayName } = await request.json();
    if (
      typeof idToken !== "string" ||
      typeof displayName !== "string" ||
      !displayName.trim() ||
      displayName.length > 80
    )
      return NextResponse.json(
        { success: false, error: "Invalid profile" },
        { status: 400 },
      );
    const user = await adminAuth.verifyIdToken(idToken, true);
    const ref = adminDb.collection("users").doc(user.uid);
    await adminDb.runTransaction(async (t) => {
      const existing = await t.get(ref);
      if (!existing.exists)
        t.set(ref, {
          uid: user.uid,
          email: user.email || "",
          displayName: displayName.trim(),
          role: "customer",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Profile creation failed" },
      { status: 401 },
    );
  }
}
