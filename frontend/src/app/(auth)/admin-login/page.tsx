"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Shield } from "lucide-react";

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
    <div className="flex justify-center items-center min-h-[100dvh] p-4 bg-black">
      <Card className="w-full max-w-[400px] border border-slate-800 shadow-2xl p-8 rounded-xl bg-[#0f172a] text-white">
        <h1 className="text-2xl font-bold text-white mb-1">Sign In</h1>
        <p className="text-slate-400 text-sm mb-8">Login to your account</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <CardContent className="space-y-4 p-0">
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-md p-3 text-red-400 text-sm font-medium text-left">{error}</div>}
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Email address</label>
                <Input 
                  id="email" 
                  type="email" 
                  {...register("email")} 
                  placeholder="Email" 
                  className="rounded-md px-3 h-10 bg-[#0f172a] border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300">Password</label>
                <Input 
                  id="password" 
                  type="password" 
                  {...register("password")} 
                  placeholder="Password" 
                  className="rounded-md px-3 h-10 bg-[#0f172a] border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:border-indigo-500"
                />
                {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-10 rounded-md bg-[#6366f1] hover:bg-[#4f46e5] text-white font-medium mt-6" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
