"use client";

import { auth } from "@/lib/firebase/client";

export async function logout() {
  const response = await fetch("/api/auth/logout", { method: "POST" });
  if (!response.ok) throw new Error("Unable to log out. Please try again.");
  try {
    await auth?.signOut();
  } finally {
    window.location.assign("/login");
  }
}
