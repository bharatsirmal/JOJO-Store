import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase/admin";
import { requireAdmin } from "@/lib/auth/server";
import { adminError } from "@/lib/admin/errors";
import nodemailer from "nodemailer";
export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    await requireAdmin();
    if (!adminDb)
      return NextResponse.json(
        { error: "Customer service unavailable" },
        { status: 503 },
      );
    const { subject, message } = await request.json();
    if (
      typeof subject !== "string" ||
      !subject.trim() ||
      typeof message !== "string" ||
      !message.trim()
    )
      throw Error("Enter a subject and message.");
    const user = await adminDb.collection("users").doc(params.userId).get();
    if (!user.exists) throw Error("Customer not found");
    const email = user.data()?.email;
    if (!email) throw Error("This customer has no email address.");
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS)
      return NextResponse.json(
        {
          error:
            "Email sending is not configured. Add the store SMTP credentials to enable customer messages.",
        },
        { status: 503 },
      );
    const transporter = nodemailer.createTransport(
      process.env.SMTP_HOST
        ? {
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT || 587),
            secure: process.env.SMTP_PORT === "465",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          }
        : {
            service: "gmail",
            auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
          },
    );
    await transporter.sendMail({
      from: `"JOJO Store" <${process.env.SMTP_USER}>`,
      to: email,
      subject: subject.trim(),
      text: message.trim(),
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return adminError(error);
  }
}
