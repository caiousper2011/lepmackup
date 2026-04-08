import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrCreateShippingSettings } from "@/lib/shipping-settings";
import { shippingSettingsSchema } from "@/lib/validation";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const settings = await getOrCreateShippingSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin get shipping settings error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações de frete." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = shippingSettingsSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const normalizedData = {
      ...data,
      ...(typeof data.pickupInstructions === "string"
        ? { pickupInstructions: data.pickupInstructions.trim() || null }
        : {}),
      ...(typeof data.pickupAddress === "string"
        ? { pickupAddress: data.pickupAddress.trim() }
        : {}),
    };

    const settings = await prisma.shippingSettings.upsert({
      where: { id: "default" },
      update: normalizedData,
      create: {
        id: "default",
        pickupEnabled: normalizedData.pickupEnabled ?? false,
        pickupAddress:
          normalizedData.pickupAddress ?? "Retirada no endereço da loja",
        pickupInstructions: normalizedData.pickupInstructions ?? null,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "shipping_settings",
        entityId: settings.id,
        details: { updatedFields: Object.keys(normalizedData) },
      },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin update shipping settings error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar configurações de frete." },
      { status: 500 },
    );
  }
}
