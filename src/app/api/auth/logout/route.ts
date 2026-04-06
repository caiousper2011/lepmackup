import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionCookie, deleteSessionCookie } from "@/lib/auth";

export async function POST() {
  try {
    const token = await getSessionCookie("user");
    
    if (token) {
      await prisma.session.deleteMany({ where: { token } });
      await deleteSessionCookie("user");
    }

    return NextResponse.json({ message: "Logout realizado." });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json({ message: "Logout realizado." });
  }
}
