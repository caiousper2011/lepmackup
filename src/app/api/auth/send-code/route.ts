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

    // Generate and save OTP
    const code = generateOTPCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    const otpRecord = await prisma.otpCode.create({
      data: { email, code, expiresAt },
    });

    let delivery;
    try {
      // Send email
      delivery = await sendOTPEmail(email, code);
    } catch (sendError) {
      // Prevent stale OTP when delivery fails
      await prisma.otpCode.update({
        where: { id: otpRecord.id },
        data: { used: true },
      });
      throw sendError;
    }

    // Invalidate previous unused codes after successful delivery
    await prisma.otpCode.updateMany({
      where: {
        email,
        used: false,
        id: { not: otpRecord.id },
      },
      data: { used: true },
    });

    const response = {
      message: "Código enviado para seu e-mail.",
      deliveryMode: delivery.mode,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    console.error("Send code error:", error);

    const isConfigError =
      message.includes("SENDGRID_FORBIDDEN") ||
      message.includes("SENDGRID_UNAUTHORIZED") ||
      message.includes("SENDGRID_API_KEY não configurada");

    return NextResponse.json(
      {
        error: isConfigError
          ? "Falha na configuração do envio de e-mail. Verifique remetente e credenciais do SendGrid."
          : "Erro ao enviar código. Tente novamente.",
        ...(process.env.NODE_ENV !== "production" && message
          ? { details: message }
          : {}),
      },
      { status: 500 },
    );
  }
}
