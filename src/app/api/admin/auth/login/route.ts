import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminLoginSchema } from "@/lib/validation";
import { createAdminSession, deleteSessionCookie } from "@/lib/auth";
import { rateLimitLogin } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";
import { compareSync } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, password } = parsed.data;

    // Rate limit
    const ip = getClientIp(request);
    const limit = rateLimitLogin(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    const admin = await prisma.adminUser.findUnique({
      where: { email, active: true },
    });

    if (!admin || !compareSync(password, admin.passwordHash)) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos." },
        { status: 401 },
      );
    }

    await createAdminSession(admin.id, admin.email);

    return NextResponse.json({
      message: "Login realizado.",
      mustChangePassword: admin.mustChangePassword,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Erro ao fazer login." },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  await deleteSessionCookie("admin");
  return NextResponse.json({ message: "Logout realizado." });
}
