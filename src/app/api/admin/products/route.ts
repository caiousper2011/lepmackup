import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { productSchema } from "@/lib/validation";
import { generateSlug } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const search = url.searchParams.get("search") || "";
    const active = url.searchParams.get("active");

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { brand: { contains: search, mode: "insensitive" } },
      ];
    }
    if (active !== null && active !== undefined && active !== "") {
      where.active = active === "true";
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin list products error:", error);
    return NextResponse.json({ error: "Erro ao listar produtos." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const slug = generateSlug(data.name);

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um produto com esse nome/slug." },
        { status: 409 }
      );
    }

    const product = await prisma.product.create({
      data: { ...data, slug, active: data.active ?? true },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE",
        entity: "product",
        entityId: product.id,
        details: { name: product.name, slug: product.slug },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Admin create product error:", error);
    return NextResponse.json({ error: "Erro ao criar produto." }, { status: 500 });
  }
}
