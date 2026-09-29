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

    if (!adminAuth) {
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

    // Set cookie
    cookies().set("__session", sessionCookie, {
      maxAge: SESSION_EXPIRATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    
    // Fetch role from Firestore
    
    let userRole = "customer";
    try {
      const userDoc = await adminDb!.collection("users").doc(decodedToken.uid).get();
      if (userDoc.exists) {
        userRole = userDoc.data()?.role || "customer";
      }
    } catch (e) {
      console.error("Failed to fetch role", e);
    }

    return NextResponse.json({ success: true, role: userRole }, { status: 200 });

  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
