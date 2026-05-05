import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";
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

    const sortedTiers = Array.isArray(data.freeShippingTiers)
      ? data.freeShippingTiers
          .map((tier) => ({
            minValue: Math.round(tier.minValue * 100) / 100,
            discountPercent: Math.round(tier.discountPercent * 100) / 100,
            ...(tier.label ? { label: tier.label.trim() } : {}),
          }))
          .sort((a, b) => a.minValue - b.minValue)
      : null;

    const tiersInput =
      data.freeShippingTiers === undefined
        ? undefined
        : sortedTiers === null || sortedTiers.length === 0
          ? Prisma.JsonNull
          : (sortedTiers as unknown as Prisma.InputJsonValue);

    const updatePayload: Prisma.ShippingSettingsUpdateInput = {
      ...(typeof data.pickupEnabled === "boolean"
        ? { pickupEnabled: data.pickupEnabled }
        : {}),
      ...(typeof data.pickupAddress === "string"
        ? { pickupAddress: data.pickupAddress.trim() }
        : {}),
      ...(typeof data.pickupInstructions === "string"
        ? { pickupInstructions: data.pickupInstructions.trim() || null }
        : {}),
      ...(typeof data.maxItemsPerOrder === "number"
        ? { maxItemsPerOrder: data.maxItemsPerOrder }
        : {}),
      ...(typeof data.freeShippingEnabled === "boolean"
        ? { freeShippingEnabled: data.freeShippingEnabled }
        : {}),
      ...(typeof data.freeShippingThreshold === "number"
        ? { freeShippingThreshold: data.freeShippingThreshold }
        : {}),
      ...(tiersInput !== undefined ? { freeShippingTiers: tiersInput } : {}),
    };

    const createPayload: Prisma.ShippingSettingsCreateInput = {
      id: "default",
      pickupEnabled: data.pickupEnabled ?? false,
      pickupAddress:
        (typeof data.pickupAddress === "string"
          ? data.pickupAddress.trim()
          : data.pickupAddress) ?? "Retirada no endereço da loja",
      pickupInstructions:
        typeof data.pickupInstructions === "string"
          ? data.pickupInstructions.trim() || null
          : null,
      maxItemsPerOrder: data.maxItemsPerOrder ?? 6,
      freeShippingEnabled: data.freeShippingEnabled ?? false,
      freeShippingThreshold: data.freeShippingThreshold ?? 0,
      ...(tiersInput !== undefined && tiersInput !== Prisma.JsonNull
        ? { freeShippingTiers: tiersInput }
        : {}),
    };

    const settings = await prisma.shippingSettings.upsert({
      where: { id: "default" },
      update: updatePayload,
      create: createPayload,
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "shipping_settings",
        entityId: settings.id,
        details: { updatedFields: Object.keys(updatePayload) },
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
