import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

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

    const contactForm = await prisma.contactForm.create({
      data: {
        email,
        question,
      },
    });

    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: "lepmakeup3@gmail.com",
      subject: `Nova dúvida do cliente - ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #ec4899;">Nova Dúvida Recebida</h2>

          <p><strong>Email do cliente:</strong> ${email}</p>

          <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #ec4899; margin: 20px 0;">
            <p><strong>Dúvida:</strong></p>
            <p>${question.replace(/\n/g, "<br>")}</p>
          </div>

          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Enviado em: ${new Date().toLocaleString("pt-BR")}
          </p>
        </div>
      `,
    });

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
