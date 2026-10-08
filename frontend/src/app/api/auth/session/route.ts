import { cookies } from "next/headers";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { NextResponse } from "next/server";

// 5 days in milliseconds
const SESSION_EXPIRATION_MS = 60 * 60 * 24 * 5 * 1000;

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing ID token" }, { status: 400 });
    }

    if (!adminAuth || !adminDb) {
      return NextResponse.json({ error: "Server authentication unavailable" }, { status: 503 });
    }

    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    // Check session creation conditions (e.g., token recently generated)
    if (new Date().getTime() / 1000 - decodedToken.auth_time > 5 * 60) {
      return NextResponse.json({ error: "Recent sign-in required" }, { status: 401 });
    }

    // Create session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRATION_MS,
    });

    // First-time social sign-ins also need a profile for /account.
    // A transaction preserves existing profiles and roles during concurrent logins.
    const userRef = adminDb.collection("users").doc(decodedToken.uid);
    const userRole = await adminDb.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (userDoc.exists) {
        return userDoc.data()?.role || "customer";
      }

      const role = decodedToken.role === "admin" || decodedToken.role === "delivery_partner"
        ? decodedToken.role
        : "customer";
      transaction.set(userRef, {
        uid: decodedToken.uid,
        email: decodedToken.email || "",
        displayName: decodedToken.name || "",
        photoURL: decodedToken.picture || "",
        role,
        createdAt: new Date().toISOString(),
      });
      return role;
    });

    // Only expose a session after the account profile is ready.
    cookies().set("__session", sessionCookie, {
      maxAge: SESSION_EXPIRATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true, role: userRole }, { status: 200 });

  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
