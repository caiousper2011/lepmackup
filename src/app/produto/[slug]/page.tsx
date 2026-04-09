import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
  });
  if (!product) return {};

  const promoPrice = product.promoPrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const imageUrl = product.images[0] || "/og-default.jpg";

  return {
    title: `${product.name} — ${promoPrice}`,
    description: `${product.description} Compre agora por apenas ${promoPrice}. Leve 4+ itens e aproveite preço de atacado!`,
    openGraph: {
      title: `${product.name} — ${promoPrice} | L&PMakeUp`,
      description: product.description,
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
      url: `/produto/${product.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} — ${promoPrice}`,
      description: product.description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/produto/${product.slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
  });
  if (!product) notFound();

  const related = await prisma.product.findMany({
    where: {
      active: true,
      category: product.category,
      id: { not: product.id },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lpmakeup.com.br";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        name: product.name,
        description: product.description,
        image: product.images.map((img) => `${siteUrl}${img}`),
        brand: { "@type": "Brand", name: product.brand },
        sku: product.slug,
        offers: {
          "@type": "Offer",
          price: product.promoPrice.toFixed(2),
          priceCurrency: "BRL",
          availability:
            (product.stockQuantity ?? 0) > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
          url: `${siteUrl}/produto/${product.slug}`,
          seller: { "@type": "Organization", name: "L&PMakeUp" },
          priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
        category: product.category,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Início",
            item: siteUrl,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: product.category,
            item: `${siteUrl}/?categoria=${encodeURIComponent(product.category)}`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
          },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} relatedProducts={related} />
    </>
  );
}
