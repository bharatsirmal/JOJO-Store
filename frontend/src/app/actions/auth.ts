"use client";

import { auth } from "@/lib/firebase/client";

export async function createCustomerProfile(uid: string, email: string, displayName: string) {
  if (!auth?.currentUser || auth.currentUser.uid !== uid) {
    return { success: false, error: "Firebase configuration unavailable" };
  }

  try {
    const idToken=await auth.currentUser.getIdToken();
    const response=await fetch("/api/auth/register-profile",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({idToken,displayName})});
    const result=await response.json();
    return response.ok?{success:true}:{success:false,error:result.error||"Profile creation failed"};
  } catch (error) {
    console.error("Error creating customer profile:", error);
    return { success: false, error: "Profile creation failed" };
  }
}
