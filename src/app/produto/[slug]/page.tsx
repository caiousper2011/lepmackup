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

  return {
    title: `${product.name} — ${promoPrice} | L&PMakeUp`,
    description: `${product.description} Compre agora por apenas ${promoPrice}. Leve 4+ itens e aproveite preço de atacado!`,
    openGraph: {
      title: `${product.name} — ${promoPrice}`,
      description: product.description,
      images: [
        {
          url: product.images[0] || "/og-default.jpg",
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `https://lpmakeup.com.br${img}`),
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      price: product.promoPrice.toFixed(2),
      priceCurrency: "BRL",
      availability:
        (product.stockQuantity ?? 0) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `https://lpmakeup.com.br/produto/${product.slug}`,
      seller: { "@type": "Organization", name: "L&PMakeUp" },
    },
    category: product.category,
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
