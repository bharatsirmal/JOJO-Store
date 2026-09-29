import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    const sessionCookie = cookies().get("__session")?.value;
    
    if (sessionCookie && adminAuth) {
      // Optional: Verify cookie and revoke all tokens for the user
      // Note: This forcefully logs the user out of all sessions.
      // const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
      // await adminAuth.revokeRefreshTokens(decodedClaims.sub);
    }
  } catch (error) {
    console.error("Error during logout token revocation:", error);
  } finally {
    // Always clear the cookie
    cookies().delete("__session");
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
