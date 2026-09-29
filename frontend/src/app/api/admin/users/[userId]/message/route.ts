import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import nodemailer from "nodemailer";

export async function POST(req: Request, { params }: { params: { userId: string } }) {
  try {
    const sessionCookie = cookies().get("__session")?.value;
    if (!sessionCookie) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const adminDecoded = await adminAuth!.verifySessionCookie(sessionCookie, true);
    if (adminDecoded.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin only" }, { status: 403 });
    }

    const { subject, message, customerEmail } = await req.json();

    if (!subject || !message || !customerEmail) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // In a real production app, use SMTP_HOST, SMTP_PORT, etc. from env
    // For now, if the user hasn't set up SMTP, we'll just simulate it or try to use env vars.
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("SMTP_USER or SMTP_PASS is missing in .env.local. Simulating email send...");
      
      // We simulate a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({ 
        success: true, 
        simulated: true,
        message: "Email simulated! To actually send emails, configure SMTP_USER and SMTP_PASS in .env.local." 
      });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail", // Assuming Gmail, adjust if necessary via env vars
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"JOJO Store Admin" <${process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: subject,
      text: message,
      html: `<div style="font-family: sans-serif; white-space: pre-wrap;">${message}</div>`
    });

    return NextResponse.json({ success: true, simulated: false });
  } catch (error: any) {
    console.error("Send email error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

