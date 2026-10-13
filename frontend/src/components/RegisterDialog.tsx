"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { createCustomerProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Mail, LockKeyhole, UserRound, UserPlus, ShieldCheck, X } from "lucide-react";
import { useDialogFocus } from "@/lib/useDialogFocus";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").regex(/[A-Z]/, "Must contain an uppercase letter").regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof registerSchema>;

export default function RegisterDialog() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const close = () => router.replace("/");
  const dialogRef = useDialogFocus(mounted, close);
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => router.push("/login"), 5000);
    return () => clearTimeout(timer);
  }, [success, router]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: FormData) => {
    if (!auth) {
      setError("Firebase is not configured.");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      // 1. Create Auth User
      const userCredential = await createUserWithEmailAndPassword(auth!, data.email, data.password);
      const user = userCredential.user;

      // 2. Update Display Name
      await updateProfile(user, { displayName: data.name });

      // 3. Create Profile Securely via Server Action
      const profileResult = await createCustomerProfile(user.uid, user.email || data.email, data.name);
      
      if (!profileResult.success) {
        throw new Error(profileResult.error);
      }

      // 4. Send Verification Email
      await sendEmailVerification(user);

      toast.success("Account created! Redirecting to login...");
      setSuccess(true);
      
    } catch (err) {
      console.error(err);
      if ((err as Error & { code?: string }).code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else {
        setError((err as Error).message || "An error occurred during registration.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;
  const inputClass = "h-10 rounded-[12px] bg-white pl-11 pr-4 border-[#36454f]/25 text-[#333333] placeholder:text-[#333333]/60 focus-visible:border-[#7965ed] focus-visible:ring-[#7965ed]/25";
  const iconClass = "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#36454f]";

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 backdrop-blur-sm p-4" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="register-dialog-title" tabIndex={-1} className="relative w-full max-w-[400px]">
        <Card className="w-full max-h-[calc(100dvh-32px)] overflow-y-auto gap-0 border-0 shadow-[0_0_28px_rgba(16,12,8,0.20)] p-5 sm:p-6 rounded-[12px] [@media(max-height:640px)]:p-4 bg-white text-[#333333]">
          <button type="button" onClick={close} aria-label="Close signup" className="absolute right-3 top-3 rounded-full p-2 text-[#36454f] hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#7965ed]"><X className="h-5 w-5" /></button>
          <div aria-hidden="true" className="relative mx-auto mb-3 h-[72px] w-32 [@media(max-height:640px)]:mb-2 [@media(max-height:640px)]:h-14">
            <span className="absolute left-1 top-9 h-1.5 w-1.5 rounded-full bg-[#9387ff]" />
            <span className="absolute left-3 bottom-2 h-1 w-1 rounded-full bg-[#d4baff]" />
            <span className="absolute right-1 top-12 h-1.5 w-1.5 rounded-full bg-[#93d5ff]" />
            <span className="absolute right-3 bottom-1 h-2 w-2 rounded-full bg-[#c084fc]" />
            <div className="absolute left-1/2 top-1 -translate-x-1/2 flex h-16 w-16 [@media(max-height:640px)]:h-12 [@media(max-height:640px)]:w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#8b8cff] via-[#7965ed] to-[#7548d2] shadow-[0_8px_18px_rgba(124,92,232,0.22)]">
              {success ? <ShieldCheck className="h-8 w-8 text-white [@media(max-height:640px)]:h-6 [@media(max-height:640px)]:w-6" /> : <UserPlus className="h-8 w-8 text-white [@media(max-height:640px)]:h-6 [@media(max-height:640px)]:w-6" />}
            </div>
          </div>
          <h1 id="register-dialog-title" className="text-[26px] leading-tight font-bold text-center text-[#2d383a]">{success ? "Check your email" : "Create an Account"}</h1>
          {success ? <div className="mt-4 text-center space-y-5">
            <p role="status" className="text-sm leading-relaxed text-[#333333]/70">We&apos;ve sent a verification link to your email. Please verify your email before logging in.</p>
            <Link href="/login" className="block rounded-[12px] bg-gradient-to-r from-[#6965ed] to-[#a24ed0] px-4 py-3 text-xs font-medium text-white">Go to Login</Link>
          </div> : <>
            <p className="mt-1 mb-4 text-center text-xs text-[#333333]/60">Join JOJO Store and find your everyday style</p>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {error && <div role="alert" className="text-red-500 text-xs font-medium text-center">{error}</div>}
              <div>
                <div className="relative"><UserRound aria-hidden="true" className={iconClass} /><Input id="signup-name" aria-label="Full name" autoComplete="name" {...register("name")} placeholder="Full name" className={inputClass} /></div>
                {errors.name && <p className="mt-1 text-red-500 text-xs">{errors.name.message}</p>}
              </div>
              <div>
                <div className="relative"><Mail aria-hidden="true" className={iconClass} /><Input id="signup-email" aria-label="Email address" type="email" autoComplete="email" {...register("email")} placeholder="Email address" className={inputClass} /></div>
                {errors.email && <p className="mt-1 text-red-500 text-xs">{errors.email.message}</p>}
              </div>
              <div>
                <div className="relative"><LockKeyhole aria-hidden="true" className={iconClass} /><Input id="signup-password" aria-label="Password" type="password" autoComplete="new-password" {...register("password")} placeholder="Password" className={inputClass} /></div>
                {errors.password && <p className="mt-1 text-red-500 text-xs">{errors.password.message}</p>}
                <p className="mt-1.5 text-[10px] text-[#333333]/60">At least 8 characters, 1 uppercase letter and 1 number.</p>
              </div>
              <div>
                <div className="relative"><ShieldCheck aria-hidden="true" className={iconClass} /><Input id="signup-confirm" aria-label="Confirm password" type="password" autoComplete="new-password" {...register("confirmPassword")} placeholder="Confirm password" className={inputClass} /></div>
                {errors.confirmPassword && <p className="mt-1 text-red-500 text-xs">{errors.confirmPassword.message}</p>}
              </div>
              <Button type="submit" className="flex w-full h-10 rounded-[12px] bg-gradient-to-r from-[#6965ed] to-[#a24ed0] hover:brightness-105 text-white text-xs tracking-wide font-medium shadow-[0_4px_10px_rgba(124,92,232,0.18)]" disabled={loading}>{loading ? "Creating account..." : "SIGN UP"}</Button>
              <p className="pt-1 text-xs text-center text-[#333333]/60">Already have an account? <Link href="/login" className="text-[#7965c5] font-semibold hover:text-[#7548d2] hover:underline">Log in</Link></p>
            </form>
          </>}
        </Card>
      </div>
    </div>, document.body
  );
}