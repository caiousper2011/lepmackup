import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { melhorEnvioSearchAgencies } from "@/lib/shipping";

export async function GET(
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
        shippingMethod: true,
        addressSnapshot: true,
        address: {
          select: { state: true, city: true },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }

    if (!order.shippingMethod?.startsWith("MELHOR_ENVIO_")) {
      return NextResponse.json(
        { error: "Pedido não utiliza Melhor Envio." },
        { status: 400 },
      );
    }

    const snapshot = order.addressSnapshot as Record<string, unknown> | null;
    const companyId = snapshot?.melhorEnvioCompanyId as number | undefined;

    if (!companyId) {
      return NextResponse.json(
        {
          error:
            "ID da transportadora não encontrado no pedido. Pedidos antigos podem não ter essa informação.",
        },
        { status: 400 },
      );
    }

    // Use sender (company) state/city for agency search since owner drops off
    const fromState = process.env.MELHOR_ENVIO_FROM_STATE || "SP";
    const fromCity = process.env.MELHOR_ENVIO_FROM_CITY || "São Paulo";

    const agencies = await melhorEnvioSearchAgencies({
      companyId,
      state: fromState,
      city: fromCity,
    });

    return NextResponse.json({ agencies });
  } catch (error) {
    console.error("Admin shipping agencies error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao buscar agências de entrega.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
