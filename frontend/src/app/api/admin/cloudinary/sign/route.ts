import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/server";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary backend SDK using the environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    // Only admins can generate upload signatures
    await requireAdmin();

    const body = await request.json();
    const { folder = "jojo-store/products" } = body;

    const timestamp = Math.round(new Date().getTime() / 1000);

    // Generate a signature for a secure upload
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    return NextResponse.json({
      timestamp,
      signature,
      folder,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    });
  } catch (error: unknown) {
    console.error("Cloudinary sign error:", error);
    return NextResponse.json({ error: "Unauthorized or server error" }, { status: 401 });
  }
}
