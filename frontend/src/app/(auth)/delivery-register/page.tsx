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
import Link from "next/link";
import { toast } from "sonner";
import { Truck } from "lucide-react";

const registerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof registerSchema>;

export default function DeliveryRegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");

    try {
      // 1. Call custom API to create the user and assign the delivery_partner role
      const createRes = await fetch("/api/auth/register-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password, displayName: data.name })
      });

      if (!createRes.ok) {
        const errData = await createRes.json();
        throw new Error(errData.error || "Failed to register");
      }

      // 2. Sign in with the client SDK to get the ID token
      const userCredential = await signInWithEmailAndPassword(auth!, data.email, data.password);
      // Force token refresh to ensure the custom claim is loaded in the JWT!
      const idToken = await userCredential.user.getIdToken(true);

      // 3. Establish the secure Next.js session
      const sessionRes = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      if (!sessionRes.ok) throw new Error("Session failed");
      
      toast.success("Welcome to the JOJO Delivery Team!");
      window.location.href = "/delivery"; 
      
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4 bg-indigo-50">
      <Card className="w-full max-w-md border-0 shadow-xl sm:p-6 py-10 px-4 rounded-3xl bg-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-2 bg-indigo-600"></div>
        
        <div className="flex justify-center mb-6 mt-2">
          <div className="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Truck className="h-8 w-8" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-2">Join the Fleet</h1>
        <p className="text-slate-500 text-center text-sm mb-8">Register to become a delivery partner</p>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CardContent className="space-y-4 p-0">
            {error && <div className="text-red-500 text-sm font-medium text-center">{error}</div>}
            
            <div className="space-y-4">
              <div>
                <Input 
                  id="name" 
                  {...register("name")} 
                  placeholder="Full Name" 
                  className="rounded-xl px-4 h-12 border-slate-200 bg-slate-50 focus-visible:ring-indigo-500"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1 ml-4">{errors.name.message}</p>}
              </div>

              <div>
                <Input 
                  id="email" 
                  type="email" 
                  {...register("email")} 
                  placeholder="Email" 
                  className="rounded-xl px-4 h-12 border-slate-200 bg-slate-50 focus-visible:ring-indigo-500"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 ml-4">{errors.email.message}</p>}
              </div>

              <div>
                <Input 
                  id="password" 
                  type="password" 
                  {...register("password")} 
                  placeholder="Password" 
                  className="rounded-xl px-4 h-12 border-slate-200 bg-slate-50 focus-visible:ring-indigo-500"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1 ml-4">{errors.password.message}</p>}
              </div>
              
              <div>
                <Input 
                  id="confirmPassword" 
                  type="password" 
                  {...register("confirmPassword")} 
                  placeholder="Confirm Password" 
                  className="rounded-xl px-4 h-12 border-slate-200 bg-slate-50 focus-visible:ring-indigo-500"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1 ml-4">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <Button type="submit" className="w-full h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold tracking-wide mt-4" disabled={loading}>
              {loading ? "Creating account..." : "Sign Up"}
            </Button>

            <div className="text-sm text-center text-slate-500 pt-4">
              Already a partner?{" "}
              <Link href="/delivery-login" className="text-indigo-600 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
