import { NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { adminError } from "@/lib/admin/errors";
export async function DELETE(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const admin = await requireAdmin();
    if (!adminAuth || !adminDb)
      return NextResponse.json(
        { error: "Account service unavailable" },
        { status: 503 },
      );
    if (admin.uid === params.userId)
      throw Error("You cannot delete your signed-in admin account.");
    const userRef = adminDb.collection("users").doc(params.userId);
    const user = await userRef.get();
    if (!user.exists) throw Error("User not found");
    try {
      await adminAuth.deleteUser(params.userId);
    } catch (error) {
      if ((error as { code?: string }).code !== "auth/user-not-found")
        throw error;
    }
    await userRef.delete();
    return NextResponse.json({ success: true });
  } catch (error) {
    return adminError(error);
  }
}
