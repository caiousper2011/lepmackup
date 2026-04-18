import { prisma } from "@/lib/prisma";
import { CATEGORIES } from "@/lib/categories";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lpmakeup.com.br";

// ISR: revalida o sitemap a cada hora
export const revalidate = 3600;

interface UrlEntry {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

function urlNode(entry: UrlEntry): string {
  return `  <url>
    <loc>${entry.loc}</loc>${entry.lastmod ? `\n    <lastmod>${entry.lastmod}</lastmod>` : ""}
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}

export async function GET() {
  let products: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.warn(
      "[sitemap.xml] findMany: banco indisponível no build, usando ISR on-demand.",
      error,
    );
  }

  const today = new Date().toISOString().split("T")[0];

  const entries: UrlEntry[] = [
    {
      loc: `${BASE_URL}/`,
      lastmod: today,
      changefreq: "daily",
      priority: "1.0",
    },
    // Categorias — alta prioridade para SEO
    ...CATEGORIES.map((c) => ({
      loc: `${BASE_URL}/categoria/${c.slug}`,
      lastmod: today,
      changefreq: "daily",
      priority: "0.9",
    })),
    // Produtos
    ...products.map((p) => ({
      loc: `${BASE_URL}/produto/${p.slug}`,
      lastmod: p.updatedAt.toISOString().split("T")[0],
      changefreq: "weekly",
      priority: "0.8",
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(urlNode).join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
