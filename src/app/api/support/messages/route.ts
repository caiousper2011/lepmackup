import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "orderId is required" },
        { status: 400 }
      );
    }

    const messages = await prisma.supportMessage.findMany({
      where: { orderId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        message: true,
        senderType: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, userId, message } = body;

    if (!orderId || !userId || !message) {
      return NextResponse.json(
        { error: "orderId, userId, and message are required" },
        { status: 400 }
      );
    }

    const supportMessage = await prisma.supportMessage.create({
      data: {
        orderId,
        userId,
        message,
        senderType: "USER",
      },
      select: {
        id: true,
        message: true,
        senderType: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    });

    return NextResponse.json(supportMessage, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}
