import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendCodeSchema } from "@/lib/validation";
import { generateOTPCode } from "@/lib/auth";
import { sendOTPEmail } from "@/lib/email";
import { rateLimitOTP } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = sendCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    // Rate limit
    const limit = rateLimitOTP(email);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    // Invalidate previous unused codes
    await prisma.otpCode.updateMany({
      where: { email, used: false },
      data: { used: true },
    });

    // Generate and save OTP
    const code = generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    await prisma.otpCode.create({
      data: { email, code, expiresAt },
    });

    // Send email
    const delivery = await sendOTPEmail(email, code);

    const response: Record<string, unknown> = {
      message: "Código enviado para seu e-mail.",
      deliveryMode: delivery.mode,
    };

    if (
      process.env.NODE_ENV !== "production" &&
      delivery.mode === "simulated"
    ) {
      response.message =
        "Ambiente de desenvolvimento: e-mail simulado. Use o código abaixo para entrar.";
      response.devCode = code;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Send code error:", error);
    return NextResponse.json(
      { error: "Erro ao enviar código. Tente novamente." },
      { status: 500 },
    );
  }
}
