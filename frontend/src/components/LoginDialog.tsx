"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Mail, LockKeyhole, UserRound, X } from "lucide-react";
import { useDialogFocus } from "@/lib/useDialogFocus";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof loginSchema>;

class LoginError extends Error {}

function loginErrorMessage(error: unknown) {
  if (error instanceof LoginError) return error.message;
  const code = (error as { code?: string })?.code;
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Try again or reset your password.";
    case "auth/unauthorized-domain":
      return "Sign-in is unavailable on this website. Please contact support.";
    case "auth/operation-not-allowed":
      return "This sign-in method is currently unavailable. Please use email or Google.";
    case "auth/popup-blocked":
      return "Allow pop-ups for this website, then try signing in again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Sign-in was cancelled. Please try again.";
    case "auth/account-exists-with-different-credential":
      return "This email already uses another sign-in method. Use the method you originally signed up with.";
    case "auth/network-request-failed":
      return "Unable to connect. Check your internet connection and try again.";
    case "auth/too-many-requests":
      return "Too many sign-in attempts. Please wait and try again.";
    case "auth/user-disabled":
      return "This account is disabled. Please contact support.";
    default:
      return "Unable to sign in right now. Please try again.";
  }
}

export default function LoginDialog() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const close = () => router.replace("/");
  const dialogRef = useDialogFocus(mounted, close);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: FormData) => {
    if (!auth) {
      setError("Firebase is not configured.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithEmailAndPassword(auth!, data.email, data.password);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, rememberMe }),
      });

      if (!res.ok) {
        throw new LoginError("Unable to complete sign-in. Please try again.");
      }
      
      const sessionData = await res.json();
      
      if (sessionData.role !== "customer") {
        await auth?.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        throw new LoginError(sessionData.role === "admin"
          ? "This is an admin account. Please use Admin Login."
          : "This is a delivery account. Please use Delivery Login.");
      }

      toast.success("Welcome back to JOJO Store!");
      router.push("/");
      router.refresh(); 
      
    } catch (err: unknown) {
      console.error(err);
      setError(loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    if (!auth) {
      setError("Firebase is not configured.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await signInWithPopup(auth!, provider);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken, rememberMe }),
      });

      if (!res.ok) {
        throw new LoginError("Unable to complete sign-in. Please try again.");
      }

      const sessionData = await res.json();
      if (sessionData.role !== "customer") {
        await auth.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        throw new LoginError(sessionData.role === "admin"
          ? "This is an admin account. Please use Admin Login."
          : "This is a delivery account. Please use Delivery Login.");
      }

      toast.success(`Welcome back, ${userCredential.user.displayName || "User"}!`);
      router.push("/");
      router.refresh(); 
      
    } catch (err: unknown) {
      console.error(err);
      setError(loginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = () => handleSocialLogin(new GoogleAuthProvider());
  const loginWithFacebook = () => handleSocialLogin(new FacebookAuthProvider());

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="login-dialog-title" tabIndex={-1} className="relative w-full max-w-[400px]">
      <Card className="w-full max-h-[calc(100dvh-32px)] overflow-y-auto gap-0 border-0 shadow-[0_0_28px_rgba(16,12,8,0.20)] p-5 sm:p-6 rounded-[12px] [@media(max-height:640px)]:p-4 bg-white text-[#333333]">
        <button type="button" onClick={close} aria-label="Close login" className="absolute right-3 top-3 rounded-full p-2 text-[#36454f] hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#7965ed]"><X className="h-5 w-5" /></button>
        <div aria-hidden="true" className="relative mx-auto mb-3 h-[72px] w-32 [@media(max-height:640px)]:mb-2 [@media(max-height:640px)]:h-14">
          <span className="absolute left-1 top-9 h-1.5 w-1.5 rounded-full bg-[#9387ff]" />
          <span className="absolute left-3 bottom-2 h-1 w-1 rounded-full bg-[#d4baff]" />
          <span className="absolute right-1 top-12 h-1.5 w-1.5 rounded-full bg-[#93d5ff]" />
          <span className="absolute right-3 bottom-1 h-2 w-2 rounded-full bg-[#c084fc]" />
          <div className="absolute left-1/2 top-1 -translate-x-1/2 flex h-16 w-16 [@media(max-height:640px)]:h-12 [@media(max-height:640px)]:w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#8b8cff] via-[#7965ed] to-[#7548d2] shadow-[0_8px_18px_rgba(124,92,232,0.22)]">
            <UserRound className="h-8 w-8 text-white [@media(max-height:640px)]:h-6 [@media(max-height:640px)]:w-6" fill="white" strokeWidth={1.5} />
          </div>
        </div>
        <h1 id="login-dialog-title" className="text-[26px] leading-tight font-bold text-center text-[#2d383a]">Welcome Back</h1>
        <p className="mt-1 mb-4 [@media(max-height:640px)]:mb-3 text-center text-xs text-[#333333]/60">Log in to continue to your account</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-3 p-0 [@media(max-height:640px)]:space-y-2">
            {error && <div role="alert" className="text-red-500 text-sm font-medium text-center">{error}</div>}
            
            <div className="space-y-2.5">
              <div>
                <div className="relative">
                <Mail aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#36454f]" />
                <Input 
                  id="email" 
                  type="email" 
                  aria-label="Email address"
                  autoComplete="email"
                  {...register("email")} 
                  placeholder="Enter your email" 
                  className="rounded-[12px] pl-11 pr-4 h-10 bg-white border-[#36454f]/25 text-[#333333] placeholder:text-[#333333]/60 focus-visible:border-[#36454f] focus-visible:ring-[#36454f]/25"
                />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-4">{errors.email.message}</p>}
              </div>

              <div>
                <div className="relative">
                <LockKeyhole aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#36454f]" />
                <Input 
                  id="password" 
                  type="password" 
                  aria-label="Password"
                  autoComplete="current-password"
                  {...register("password")} 
                  placeholder="Enter your password" 
                  className="rounded-[12px] pl-11 pr-4 h-10 bg-white border-[#36454f]/25 text-[#333333] placeholder:text-[#333333]/60 focus-visible:border-[#36454f] focus-visible:ring-[#36454f]/25"
                />
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-4">{errors.password.message}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 text-[11px]">
              <label className="flex cursor-pointer items-center gap-1.5 text-[#333333]/80">
                <input type="checkbox" checked={rememberMe} onChange={event => setRememberMe(event.target.checked)} disabled={loading} className="h-3.5 w-3.5 rounded accent-[#7965ed]" />
                Remember me
              </label>
              <Link href="/forgot-password" className="font-medium text-[#7965c5] hover:text-[#7548d2] hover:underline">
                Forgot Password?
              </Link>
            </div>

            <Button type="submit" aria-label="Log in" className="flex w-full h-10 rounded-[12px] bg-gradient-to-r from-[#6965ed] to-[#a24ed0] hover:brightness-105 text-white text-xs tracking-wide font-medium shadow-[0_4px_10px_rgba(124,92,232,0.18)]" disabled={loading}>
              {loading ? "Logging in..." : "LOGIN"}
            </Button>
            
            <div className="flex items-center gap-3 text-[11px] text-[#333333]/45"><span className="h-px flex-1 bg-slate-100" />OR<span className="h-px flex-1 bg-slate-100" /></div>
            <div className="flex items-center justify-center gap-4">
              <Button type="button" aria-label="Log in with Facebook" title="Log in with Facebook" onClick={loginWithFacebook} disabled={loading} variant="outline" className="order-2 w-[60px] h-[60px] p-0 rounded-full [&_svg]:!size-7 bg-white border-slate-100 hover:bg-slate-50 text-[#4267b2] shadow-[0_2px_10px_rgba(16,12,8,0.08)] flex items-center justify-center disabled:opacity-50">
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="12" />
                  <path fill="white" d="M13.5 22v-8h2.7l.4-3.2h-3.1V8.7c0-.9.3-1.5 1.5-1.5h1.7V4.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.4H7.4V14h2.7v8h3.4Z" />
                </svg>
              </Button>
              
              <Button type="button" aria-label="Log in with Google" title="Log in with Google" onClick={loginWithGoogle} disabled={loading} variant="outline" className="order-1 w-[60px] h-[60px] p-0 rounded-full [&_svg]:!size-7 bg-white border-slate-100 text-[#2d383a] shadow-[0_2px_10px_rgba(16,12,8,0.08)] flex items-center justify-center hover:bg-slate-50 disabled:opacity-50">
                <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </Button>
            </div>
            <div className="text-xs text-center text-[#333333]/60 pt-1">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-[#7965c5] font-semibold hover:text-[#7548d2] hover:underline">
                Sign Up
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
      </div>
    </div>, document.body
  );
}
