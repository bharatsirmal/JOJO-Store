"use server";

import { adminDb } from "@/lib/firebase/admin";
import { FieldValue } from "firebase-admin/firestore";
import "server-only";

export async function createCustomerProfile(uid: string, email: string, displayName: string) {
  if (!adminDb) {
    console.warn("Firebase Admin DB not initialized. Skipping profile creation.");
    return { success: false, error: "Firebase configuration unavailable" };
  }

  try {
    const userRef = adminDb.collection("users").doc(uid);
    const userDoc = await userRef.get();

    // Idempotent creation
    if (!userDoc.exists) {
      await userRef.set({
        uid,
        email,
        displayName,
        role: "customer",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Error creating customer profile:", error);
    return { success: false, error: "Profile creation failed" };
  }
}
