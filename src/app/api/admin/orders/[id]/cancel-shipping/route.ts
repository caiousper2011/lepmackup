import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { melhorEnvioCancelShipment } from "@/lib/shipping";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        orderNumber: true,
        melhorEnvioShipmentId: true,
        status: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }

    if (!order.melhorEnvioShipmentId) {
      return NextResponse.json(
        { error: "Pedido não possui envio registrado no Melhor Envio." },
        { status: 400 },
      );
    }

    await melhorEnvioCancelShipment(order.melhorEnvioShipmentId);

    await prisma.order.update({
      where: { id },
      data: {
        melhorEnvioShipmentId: null,
        shippingLabelUrl: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE",
        entity: "shipping_label",
        entityId: order.id,
        details: {
          orderNumber: order.orderNumber,
          cancelledShipmentId: order.melhorEnvioShipmentId,
        },
      },
    });

    return NextResponse.json({
      message: "Envio cancelado no Melhor Envio com sucesso.",
    });
  } catch (error) {
    console.error("Cancel shipping error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao cancelar envio no Melhor Envio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
