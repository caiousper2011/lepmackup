import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth";
import { melhorEnvioGetBalance } from "@/lib/shipping";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const balance = await melhorEnvioGetBalance();

    return NextResponse.json({ balance });
  } catch (error) {
    console.error("Melhor Envio balance error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao consultar saldo do Melhor Envio.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
