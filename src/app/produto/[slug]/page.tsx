import { notFound } from "next/navigation";
import { products, getProductBySlug } from "@/data/products";
import ProductDetail from "@/components/ProductDetail";
import type { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} — R$ 7,99 | L&PMakeUp`,
    description: `${product.description} Compre agora por apenas R$ 7,99. Leve 4+ itens e pague R$ 6,99 cada!`,
    openGraph: {
      title: `${product.name} — R$ 7,99`,
      description: product.description,
      images: [
        { url: product.images[0], width: 800, height: 800, alt: product.name },
      ],
      type: "website",
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const related = products.filter(
    (p) => p.category === product.category && p.id !== product.id,
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images.map((img) => `https://lpmakeup.com.br${img}`),
    brand: { "@type": "Brand", name: product.brand },
    offers: {
      "@type": "Offer",
      price: "7.99",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
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
