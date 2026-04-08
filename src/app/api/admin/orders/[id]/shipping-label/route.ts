import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { generateMelhorEnvioShippingLabel } from "@/lib/shipping";

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
      select: {
        id: true,
        orderNumber: true,
        shippingMethod: true,
        melhorEnvioShipmentId: true,
        shippingLabelUrl: true,
        trackingCode: true,
        trackingUrl: true,
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
        reused: true,
      });
    }

    if (!order.melhorEnvioShipmentId) {
      return NextResponse.json(
        {
          error:
            "Pedido sem código de envio do Melhor Envio. Informe o shipment ID no pedido para gerar a etiqueta automaticamente.",
        },
        { status: 400 },
      );
    }

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
      select: {
        shippingLabelUrl: true,
        trackingCode: true,
        trackingUrl: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "order_shipping_label",
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
      reused: false,
    });
  } catch (error) {
    console.error("Admin generate shipping label error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar etiqueta do Melhor Envio." },
      { status: 500 },
    );
  }
}
