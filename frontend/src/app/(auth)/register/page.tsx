"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { createCustomerProfile } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
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

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
      setTimeout(() => {
        router.push("/login");
      }, 5000);
      
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

  if (success) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <Card className="w-full max-w-md text-center p-6">
          <CardTitle className="text-2xl mb-4">Verification Required</CardTitle>
          <p className="text-muted-foreground mb-4">We&apos;ve sent a verification link to your email. Please verify your email before continuing.</p>
          <Link href="/login"><Button type="button">Go to Login</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Enter your details to register for JOJO Store.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {error && <div className="text-red-500 text-sm font-medium">{error}</div>}
            
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...register("name")} placeholder="John Doe" />
              {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...register("email")} placeholder="john@example.com" />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" {...register("password")} placeholder="••••••••" />
              {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              <p className="text-xs text-muted-foreground">Min 8 chars, 1 uppercase, 1 number.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" type="password" {...register("confirmPassword")} placeholder="••••••••" />
              {errors.confirmPassword && <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Login here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}




