import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import {
  extractMelhorEnvioServiceId,
  generateMelhorEnvioShippingLabel,
  melhorEnvioFullLabelFlow,
  mapOrderToMelhorEnvioPayload,
  type OrderShippingData,
  validateMelhorEnvioServiceFromQuote,
} from "@/lib/shipping";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    let forceRegenerate = false;
    try {
      const body = (await request.json()) as { force?: unknown };
      forceRegenerate = body.force === true;
    } catch {
      // body opcional
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, phone: true } },
        items: {
          include: {
            product: {
              select: {
                name: true,
                shortName: true,
                shippingWeightGrams: true,
              },
            },
          },
        },
        address: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }

    if (order.shippingMethod === "PICKUP_STORE") {
      return NextResponse.json(
        { error: "Pedido de retirada não possui etiqueta de envio." },
        { status: 400 },
      );
    }

    if (order.shippingLabelUrl && !forceRegenerate) {
      return NextResponse.json({
        labelUrl: order.shippingLabelUrl,
        trackingCode: order.trackingCode,
        trackingUrl: order.trackingUrl,
        shipmentId: order.melhorEnvioShipmentId,
        reused: true,
      });
    }

    // If shipment ID already exists, just re-print
    if (order.melhorEnvioShipmentId) {
      const labelResult = await generateMelhorEnvioShippingLabel(
        order.melhorEnvioShipmentId,
      );

      const mergedTrackingCode = order.trackingCode || labelResult.trackingCode;
      const mergedTrackingUrl = order.trackingUrl || labelResult.trackingUrl;

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          shippingLabelUrl: labelResult.labelUrl,
          ...(mergedTrackingCode ? { trackingCode: mergedTrackingCode } : {}),
          ...(mergedTrackingUrl ? { trackingUrl: mergedTrackingUrl } : {}),
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: admin.id,
          action: "UPDATE",
          entity: "shipping_label",
          entityId: order.id,
          details: {
            orderNumber: order.orderNumber,
            forceRegenerate,
            shipmentId: order.melhorEnvioShipmentId,
          },
        },
      });

      return NextResponse.json({
        labelUrl: updated.shippingLabelUrl,
        trackingCode: updated.trackingCode,
        trackingUrl: updated.trackingUrl,
        shipmentId: order.melhorEnvioShipmentId,
        reused: false,
      });
    }

    // No shipment ID — run full flow: cart → checkout → generate → print
    const snapshotServiceId = getNumber(
      order.addressSnapshot as Record<string, unknown> | null,
      "melhorEnvioServiceId",
    );
    const serviceId =
      snapshotServiceId ?? extractMelhorEnvioServiceId(order.shippingMethod);
    if (!serviceId) {
      return NextResponse.json(
        {
          error:
            "Método de envio não é do Melhor Envio. Informe o Shipment ID manualmente.",
        },
        { status: 400 },
      );
    }

    const addressSnapshot = order.addressSnapshot as Record<
      string,
      unknown
    > | null;
    const addr = order.address;
    if (!addr && !addressSnapshot) {
      return NextResponse.json(
        { error: "Pedido não possui endereço de entrega." },
        { status: 400 },
      );
    }

    const toCep = addr?.cep || getString(addressSnapshot ?? {}, "cep");

    if (!toCep) {
      return NextResponse.json(
        { error: "CEP de destino não encontrado no pedido." },
        { status: 400 },
      );
    }

    const cpfCnpj = normalizeCpfCnpj(
      getString(addressSnapshot ?? {}, "cpfCnpj"),
    );

    if (!cpfCnpj) {
      return NextResponse.json(
        {
          error:
            "CPF/CNPJ do destinatário não encontrado no pedido. Peça ao cliente para finalizar novamente informando CPF/CNPJ.",
        },
        { status: 400 },
      );
    }

    const products = order.items.map((item) => ({
      name: item.product.shortName || item.product.name,
      quantity: item.quantity,
      unitary_value: item.unitPrice,
    }));

    const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
    const totalWeightGrams = order.items.reduce(
      (s, i) => s + i.quantity * (i.product.shippingWeightGrams || 50),
      0,
    );

    try {
      await validateMelhorEnvioServiceFromQuote({
        cepDestino: toCep,
        totalWeightGrams,
        totalItems,
        insuranceValue: order.total,
        serviceId,
      });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível validar o service ID da cotação.";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    console.info("[Melhor Envio] service.id usado no pedido:", serviceId);

    const pkg =
      totalItems <= 6
        ? { height: 3, width: 10, length: 15 }
        : { height: 5, width: 20, length: 20 };

    const payloadData: OrderShippingData = {
      customerName: cpfCnpj,
      customerEmail: order.user?.email || "",
      customerPhone: order.user?.phone || null,
      customerDocument: cpfCnpj,
      address: {
        street: addr?.street || String(addressSnapshot?.street || ""),
        number: addr?.number || String(addressSnapshot?.number || "S/N"),
        complement:
          addr?.complement || String(addressSnapshot?.complement || ""),
        neighborhood:
          addr?.neighborhood || String(addressSnapshot?.neighborhood || ""),
        city: addr?.city || String(addressSnapshot?.city || ""),
        state: addr?.state || String(addressSnapshot?.state || ""),
        cep: toCep,
      },
      serviceId,
      products,
      volumes: [
        {
          height: pkg.height,
          width: pkg.width,
          length: pkg.length,
          weight: Number((totalWeightGrams / 1000).toFixed(3)),
        },
      ],
      insuranceValue: Math.max(order.total, 1),
    };

    const cartParams = mapOrderToMelhorEnvioPayload(payloadData);

    const result = await melhorEnvioFullLabelFlow(cartParams);

    await prisma.order.update({
      where: { id },
      data: {
        melhorEnvioShipmentId: result.shipmentId,
        shippingLabelUrl: result.labelUrl,
        trackingCode: result.trackingCode || order.trackingCode,
        trackingUrl: result.trackingUrl || order.trackingUrl,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE",
        entity: "shipping_label",
        entityId: order.id,
        details: {
          orderNumber: order.orderNumber,
          shipmentId: result.shipmentId,
          labelUrl: result.labelUrl,
          trackingCode: result.trackingCode,
        },
      },
    });

    return NextResponse.json({
      labelUrl: result.labelUrl,
      trackingCode: result.trackingCode,
      trackingUrl: result.trackingUrl,
      shipmentId: result.shipmentId,
      reused: false,
    });
  } catch (error) {
    console.error("Admin generate shipping label error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao gerar etiqueta do Melhor Envio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function getString(obj: Record<string, unknown>, key: string): string {
  const val = obj[key];
  return typeof val === "string" ? val : String(val || "");
}

function getNumber(
  obj: Record<string, unknown> | null,
  key: string,
): number | null {
  if (!obj) return null;
  const val = obj[key];
  if (typeof val === "number" && Number.isFinite(val)) return val;
  if (typeof val === "string" && /^\d+$/.test(val)) return Number(val);
  return null;
}

function normalizeCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 11 || digits.length === 14) {
    return digits;
  }
  return "";
}
