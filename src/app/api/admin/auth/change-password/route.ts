import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { changePasswordSchema } from "@/lib/validation";
import { getCurrentAdmin } from "@/lib/auth";
import { hashSync } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { newPassword } = parsed.data;

    await prisma.adminUser.update({
      where: { id: admin.id },
      data: {
        passwordHash: hashSync(newPassword, 12),
        mustChangePassword: false,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CHANGE_PASSWORD",
        entity: "admin_users",
        entityId: admin.id,
      },
    });

    return NextResponse.json({ message: "Senha alterada com sucesso." });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      { error: "Erro ao alterar senha." },
      { status: 500 }
    );
  }
}
