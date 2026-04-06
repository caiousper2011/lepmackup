import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
