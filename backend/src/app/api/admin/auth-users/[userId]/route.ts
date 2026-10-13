import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { adminAuth } from "@/lib/firebase/admin";
import { adminError } from "@/lib/admin/errors";
export async function GET(_request:Request,{params}:{params:{userId:string}}) {
  try { await requireAdmin(); const user=await adminAuth!.getUser(params.userId); return NextResponse.json({displayName:user.displayName,email:user.email,photoURL:user.photoURL,phoneNumber:user.phoneNumber,emailVerified:user.emailVerified,metadata:{creationTime:user.metadata.creationTime}}); }
  catch(error) { return adminError(error); }
}
