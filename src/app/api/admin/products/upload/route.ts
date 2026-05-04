import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentAdmin } from "@/lib/auth";

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);
const MAX_BYTES = 8 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json(
        {
          error:
            "Storage não configurado. Crie um Blob Store na Vercel e defina BLOB_READ_WRITE_TOKEN.",
        },
        { status: 500 },
      );
    }

    const form = await request.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Arquivo não enviado." },
        { status: 400 },
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG ou WEBP." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Imagem muito grande. Máximo 8MB." },
        { status: 400 },
      );
    }

    const ext = EXTENSION_BY_TYPE[file.type] || "jpg";
    const stamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 8);
    const pathname = `products/${stamp}-${random}.${ext}`;

    const blob = await put(pathname, file, {
      access: "public",
      contentType: file.type,
    });

    return NextResponse.json({ url: blob.url, extension: ext });
  } catch (error) {
    console.error("Admin product image upload error:", error);
    return NextResponse.json(
      { error: "Erro ao enviar imagem." },
      { status: 500 },
    );
  }
}
