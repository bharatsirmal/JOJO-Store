"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, Lock } from "lucide-react";
import { PortalLoginCard, portalInputClass, portalIconClass, portalButtonClass } from "@/components/PortalLoginCard";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof loginSchema>;

export default function DeliveryLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema)
  });

  const establishSession = async (idToken: string) => {
    const res = await fetch("/api/auth/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    });
    if (!res.ok) throw new Error("Session failed");
    
    const sessionData = await res.json();
    if (sessionData.role === "delivery_pending") {
      await auth?.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      throw new Error("Your delivery account is pending Admin approval.");
    }
    if (sessionData.role !== "delivery_partner") {
      await auth?.signOut();
      await fetch("/api/auth/logout", { method: "POST" });
      throw new Error("This portal is for approved delivery partners only.");
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!auth) return;
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth!, data.email, data.password);
      const idToken = await userCredential.user.getIdToken();
      await establishSession(idToken);
      toast.success("Login successful!");
      window.location.href = "/delivery"; 
    } catch (err: unknown) {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    setLoading(true);
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth!, provider);
      
      // 1. Get initial token
      let idToken = await userCredential.user.getIdToken();
      
      // 2. Register them as a pending delivery partner in the backend
      const promoteRes = await fetch("/api/auth/register-delivery-google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken })
      });
      if (!promoteRes.ok) throw new Error("Registration failed");

      // 3. Force refresh token to get the new custom claims in the JWT
      idToken = await userCredential.user.getIdToken(true);

      // 4. Establish secure session
      await establishSession(idToken);
      
      toast.success("Login successful!");
      window.location.href = "/delivery"; 
    } catch (err: unknown) {
      setError("Error: " + (err instanceof Error ? err.message : String(err)));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLoginCard kind="delivery">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {error && <div role="alert" className="text-center text-xs font-medium text-red-500">{error}</div>}
        <div>
          <div className="relative"><Mail aria-hidden="true" className={portalIconClass} /><Input id="email" type="email" aria-label="Email address" {...register("email")} placeholder="Email id" className={portalInputClass} /></div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <div className="relative"><Lock aria-hidden="true" className={portalIconClass} /><Input id="password" type="password" aria-label="Password" {...register("password")} placeholder="Password" className={portalInputClass} /></div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
          <label htmlFor="remember" className="flex cursor-pointer items-center gap-1.5 text-[#333333]/80"><input type="checkbox" id="remember" className="h-3.5 w-3.5 rounded accent-[#7965ed]" />Remember me</label>
          <Link href="/forgot-password" className="font-medium text-[#7965c5] hover:text-[#7548d2] hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className={portalButtonClass} disabled={loading}>{loading ? "Logging in..." : "Login"}</Button>
      </form>
      <div className="my-4 flex items-center gap-3 text-[11px] text-[#333333]/45"><span className="h-px flex-1 bg-slate-100" />OR<span className="h-px flex-1 bg-slate-100" /></div>
      <div className="flex justify-center">
        <button type="button" onClick={handleGoogleLogin} disabled={loading} aria-label="Log in with Google" title="Log in with Google" className="flex h-[60px] w-[60px] items-center justify-center rounded-full border border-slate-100 bg-white shadow-[0_2px_10px_rgba(16,12,8,0.08)] hover:bg-slate-50 disabled:opacity-50">
          <svg aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
        </button>
      </div>
      <p className="mt-4 text-center text-xs text-[#333333]/60">Don&apos;t have an account? <Link href="/delivery-register" className="font-semibold text-[#7965c5] hover:text-[#7548d2] hover:underline">Sign up</Link></p>
    </PortalLoginCard>
  );
}