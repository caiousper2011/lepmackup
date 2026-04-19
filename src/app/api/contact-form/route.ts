import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

const ADMIN_EMAIL = "lepmakeup3@gmail.com";
const FROM = process.env.EMAIL_FROM || "L&PMakeUp <noreply@lepmakeup.com.br>";

const sendGridApiKey = process.env.SENDGRID_API_KEY?.trim() ?? "";
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, question } = body;

    if (!email || !question) {
      return NextResponse.json(
        { error: "Email and question are required" },
        { status: 400 }
      );
    }

    // Salvar no banco de dados
    await prisma.contactForm.create({
      data: {
        email,
        question,
      },
    });

    // Enviar email para o admin
    if (sendGridApiKey) {
      try {
        await sgMail.send({
          from: FROM,
          to: ADMIN_EMAIL,
          subject: `Nova dúvida do cliente - ${email}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #ec4899;">📬 Nova Dúvida Recebida</h2>

              <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #ec4899; margin: 20px 0;">
                <p><strong>Email do cliente:</strong> ${email}</p>
                <p style="margin-top: 10px;"><strong>Dúvida:</strong></p>
                <p>${question.replace(/\n/g, "<br>")}</p>
              </div>

              <p style="color: #999; font-size: 12px; margin-top: 20px;">
                Enviado em: ${new Date().toLocaleString("pt-BR")}
              </p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error("Erro ao enviar email:", emailError);
      }
    }

    return NextResponse.json(
      { message: "Dúvida enviada com sucesso!" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}

