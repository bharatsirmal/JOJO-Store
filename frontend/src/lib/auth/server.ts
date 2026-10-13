import { cookies } from "next/headers";
import { backendRequest } from "@/lib/backend/request";
import { cache } from "react";

type SessionUser = {uid:string;email?:string;role:string;displayName:string;photoURL:string;phoneNumber:string;createdAt:string;emailVerified?:boolean};

export const getCurrentUser = cache(async ():Promise<SessionUser|null> => {
  const sessionCookie = cookies().get("__session")?.value;
  if (!sessionCookie) return null;

  try {
    return await backendRequest<SessionUser>("/api/auth/profile");
  } catch (error) {
    console.error("Error verifying session cookie:", error);
    return null;
  }
});

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}

