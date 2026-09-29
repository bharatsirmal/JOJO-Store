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
    <div className="flex justify-center items-center min-h-[100dvh] p-4 bg-white">
      <div className="w-full max-w-[450px] p-6 bg-white">
        <h1 className="text-3xl font-bold text-center text-[#112340] mb-2">Sign in</h1>
        <p className="text-[#8c94a3] text-center text-[15px] mb-8">Welcome back! Please sign in to continue</p>
        
        {error && <div className="text-red-500 text-sm font-medium text-center mb-4">{error}</div>}

        <button 
          onClick={handleGoogleLogin}
          type="button" 
          disabled={loading}
          className="w-full h-12 flex items-center justify-center gap-2 bg-[#f4f4f5] hover:bg-[#e4e4e7] text-[#71717a] font-medium rounded-full transition-colors mb-6 disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#e4e4e7]"></div>
          <span className="text-[#a1a1aa] text-sm">or sign in with email</span>
          <div className="flex-1 h-px bg-[#e4e4e7]"></div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]">
                <Mail className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <Input 
                id="email" 
                type="email" 
                {...register("email")} 
                placeholder="Email id" 
                className="pl-12 rounded-full h-[52px] border-[#e4e4e7] bg-white text-[#3f3f46] placeholder:text-[#a1a1aa] focus-visible:ring-[#6366f1] focus-visible:border-[#6366f1] shadow-sm"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1 ml-4">{errors.email.message}</p>}
            </div>

            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#a1a1aa]">
                <Lock className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <Input 
                id="password" 
                type="password" 
                {...register("password")} 
                placeholder="Password" 
                className="pl-12 rounded-full h-[52px] border-[#e4e4e7] bg-white text-[#3f3f46] placeholder:text-[#a1a1aa] focus-visible:ring-[#6366f1] focus-visible:border-[#6366f1] shadow-sm"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1 ml-4">{errors.password.message}</p>}
            </div>
          </div>

          <div className="flex items-center justify-between px-1 pt-1">
            <div className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" id="remember" className="rounded border-[#e4e4e7] text-[#6366f1] focus:ring-[#6366f1] cursor-pointer" />
              <label htmlFor="remember" className="text-sm text-[#71717a] cursor-pointer">Remember me</label>
            </div>
            <Link href="/forgot-password" className="text-sm text-[#71717a] hover:text-[#6366f1] transition-colors">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full h-[52px] rounded-full bg-[#6366f1] hover:bg-[#4f46e5] text-white text-[15px] font-medium shadow-md transition-all mt-4" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="text-[15px] text-center text-[#71717a] pt-4">
            Don't have an account?{" "}
            <Link href="/delivery-register" className="text-[#6366f1] hover:underline">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
