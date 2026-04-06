import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addressSchema } from "@/lib/validation";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses });
  } catch (error) {
    console.error("Get addresses error:", error);
    return NextResponse.json({ error: "Erro ao buscar endereços." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // If this is marked as default, unset other defaults
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    // If this is the first address, make it default
    const count = await prisma.address.count({ where: { userId: user.id } });
    const isDefault = data.isDefault || count === 0;

    const address = await prisma.address.create({
      data: {
        ...data,
        userId: user.id,
        isDefault,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("Create address error:", error);
    return NextResponse.json({ error: "Erro ao salvar endereço." }, { status: 500 });
  }
}
