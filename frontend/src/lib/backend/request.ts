import "server-only";
import { cookies } from "next/headers";

export async function backendRequest<T>(path: string, body?: unknown, publicRequest = false): Promise<T> {
  const origin = process.env.NEXT_PUBLIC_BACKEND_URL || (process.env.NODE_ENV === "production" ? "https://jojo-store-backend.vercel.app" : "http://localhost:4000");
  const session = publicRequest ? undefined : cookies().get("__session")?.value;
  const response = await fetch(new URL(path, origin), {
    method: body === undefined ? "GET" : "POST",
    headers: { ...(body === undefined ? {} : {"Content-Type":"application/json"}), ...(session ? {Cookie:`__session=${session}`} : {}) },
    body: body === undefined ? undefined : JSON.stringify(body), cache: publicRequest ? "force-cache" : "no-store",
    ...(publicRequest ? { next: { revalidate: 60, tags: ["catalog"] } } : {}),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || "Backend unavailable"), {status:response.status});
  return data as T;
}
