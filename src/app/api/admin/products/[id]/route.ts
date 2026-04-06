import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validation";

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
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Admin get product error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar produto." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = productSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { stockQuantity, shippingWeightGrams, ...updateData } = parsed.data;

    const product = await prisma.$transaction(async (tx) => {
      if (Object.keys(updateData).length > 0) {
        await tx.product.update({
          where: { id },
          data: updateData,
        });
      }

      if (typeof stockQuantity === "number") {
        await tx.$executeRaw`
          UPDATE "products"
          SET "stockQuantity" = ${stockQuantity}, "updatedAt" = NOW()
          WHERE "id" = ${id}
        `;
      }

      if (typeof shippingWeightGrams === "number") {
        await tx.$executeRaw`
          UPDATE "products"
          SET "shippingWeightGrams" = ${shippingWeightGrams}, "updatedAt" = NOW()
          WHERE "id" = ${id}
        `;
      }

      const refreshed = await tx.product.findUnique({ where: { id } });
      if (!refreshed) {
        throw new Error("Produto não encontrado após atualização.");
      }

      return refreshed;
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "product",
        entityId: product.id,
        details: { updatedFields: Object.keys(parsed.data) },
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Admin update product error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar produto." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 },
      );
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { active: false },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE",
        entity: "product",
        entityId: id,
        details: { name: existing.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete product error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir produto." },
      { status: 500 },
    );
  }
}
