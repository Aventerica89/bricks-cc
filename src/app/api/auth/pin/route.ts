import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";

const ADMIN_PIN = process.env.ADMIN_PIN;

if (!ADMIN_PIN) {
  throw new Error("ADMIN_PIN environment variable is required");
}

/**
 * Timing-safe string comparison to prevent timing attacks (Node.js version)
 */
async function timingSafeCompare(a: string, b: string): Promise<boolean> {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");

    if (bufA.length !== bufB.length) {
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== "string") {
      return NextResponse.json(
        { error: "PIN is required and must be a string" },
        { status: 400 }
      );
    }

    const isValidPin = await timingSafeCompare(pin, ADMIN_PIN as string);

    if (!isValidPin) {
      return NextResponse.json(
        { error: "Invalid PIN" },
        { status: 401 }
      );
    }

    // Create response with cookie
    const response = NextResponse.json({ success: true });

    // Set cookie that expires in 7 days
    response.cookies.set("admin_pin", pin, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
