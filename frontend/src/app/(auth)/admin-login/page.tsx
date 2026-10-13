"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PortalLoginCard, portalInputClass, portalIconClass, portalButtonClass } from "@/components/PortalLoginCard";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Mail, LockKeyhole } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof loginSchema>;

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
      const userCredential = await signInWithEmailAndPassword(auth!, data.email, data.password);
      const idToken = await userCredential.user.getIdToken();

      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        throw new Error("Failed to establish secure session");
      }
      
      const sessionData = await res.json();
      
      if (sessionData.role !== "admin") {
        await auth?.signOut();
        await fetch("/api/auth/logout", { method: "POST" });
        throw new Error("This portal is for administrators only. Please use your respective portal.");
      }

      toast.success("Admin login successful!");
      // The middleware will automatically route to /admin if the role is admin
      window.location.href = "/admin"; 
      
    } catch (err: unknown) {
      console.error(err);
      setError("Invalid admin credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalLoginCard kind="admin">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {error && <div role="alert" className="rounded-[12px] bg-red-50 p-3 text-center text-xs font-medium text-red-600">{error}</div>}
        <div>
          <div className="relative"><Mail aria-hidden="true" className={portalIconClass} /><Input id="email" type="email" aria-label="Email address" {...register("email")} placeholder="Email" className={portalInputClass} /></div>
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <div className="relative"><LockKeyhole aria-hidden="true" className={portalIconClass} /><Input id="password" type="password" aria-label="Password" {...register("password")} placeholder="Password" className={portalInputClass} /></div>
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <div className="flex justify-end pt-1"><Link href="/forgot-password" className="text-[11px] font-medium text-[#7965c5] hover:text-[#7548d2] hover:underline">Forgot password?</Link></div>
        <Button type="submit" className={portalButtonClass} disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
      </form>
    </PortalLoginCard>
  );
}