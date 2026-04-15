import { notFound } from "next/navigation";
import ProductDetail from "@/components/ProductDetail";
import { prisma } from "@/lib/prisma";
import { getCategoryByDbName } from "@/lib/categories";
import type { Metadata } from "next";

// ISR — revalida a cada 10 minutos. Estoque atualiza com frequência mas não exige SSR puro.
export const revalidate = 600;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  // Pré-renderiza os produtos ativos no build para acelerar primeiro load.
  // Se o banco não estiver acessível no ambiente de build (ex.: Vercel sem
  // DATABASE_URL válida), cai para geração sob demanda via ISR em vez de
  // derrubar o deploy.
  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      select: { slug: true },
    });
    return products.map((p) => ({ slug: p.slug }));
  } catch (error) {
    console.warn(
      "[produto/[slug]] generateStaticParams: banco indisponível no build, usando ISR on-demand.",
      error,
    );
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
  });
  if (!product) {
    return {
      title: "Produto não encontrado",
      robots: { index: false, follow: false },
    };
  }

  const promoPrice = product.promoPrice.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const imageUrl = product.images[0] || "/icon.png";

  // Title focado em CTR: nome → preço → marca
  const title = `${product.name} por ${promoPrice} | L&PMakeUp`;
  const description = `${product.description.slice(0, 140)}... ✓ Apenas ${promoPrice} ✓ Frete para todo Brasil ✓ Pague com PIX ou cartão.`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand,
      product.category,
      `comprar ${product.shortName.toLowerCase()}`,
      `${product.brand.toLowerCase()} barato`,
      "maquiagem barata",
      ...product.tags,
    ],
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      title,
      description: product.description,
      type: "website",
      url: `/produto/${product.slug}`,
      siteName: "L&PMakeUp",
      locale: "pt_BR",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: product.description,
      images: [imageUrl],
    },
    robots: {
      index: (product.stockQuantity ?? 0) > 0,
      follow: true,
      googleBot: {
        index: (product.stockQuantity ?? 0) > 0,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
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
  const categoryMeta = getCategoryByDbName(product.category);
  const categoryUrl = categoryMeta
    ? `${siteUrl}/categoria/${categoryMeta.slug}`
    : siteUrl;

  // Validade da oferta: 30 dias à frente (Google exige priceValidUntil)
  const priceValidUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  // FAQ específica do produto — gerada a partir dos atributos do banco.
  // Visível na página + schema FAQPage para snippets ricos do Google e citação por IA.
  const productFaqs: { q: string; a: string }[] = [
    {
      q: `Quanto custa ${product.shortName}?`,
      a: `O ${product.name} custa R$ ${product.promoPrice.toFixed(2).replace(".", ",")} na promoção. Comprando 4 ou mais itens, o preço unitário cai para R$ ${product.bulkPrice.toFixed(2).replace(".", ",")} cada.`,
    },
    {
      q: `${product.shortName} é original da marca ${product.brand}?`,
      a: `Sim. A L&PMakeUp trabalha apenas com produtos originais da marca ${product.brand}, com qualidade profissional garantida.`,
    },
    {
      q: `Como receber ${product.shortName}?`,
      a: `Entregamos para todo o Brasil via Correios e transportadoras parceiras. O frete é calculado em tempo real no checkout pelo seu CEP. Clientes em até 1 km da loja em Vila Aricanduva (São Paulo) têm frete grátis ou retirada no local. Envio em até 24h após confirmação do pagamento.`,
    },
    {
      q: `Quais formas de pagamento posso usar para comprar ${product.shortName}?`,
      a: `Aceitamos PIX (aprovação instantânea), cartão de crédito (com parcelamento), cartão de débito e boleto bancário, processados com segurança pelo Mercado Pago.`,
    },
  ];

  const inStock = (product.stockQuantity ?? 0) > 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "@id": `${siteUrl}/produto/${product.slug}#product`,
        name: product.name,
        description: product.description,
        image: product.images.map((img) => `${siteUrl}${img}`),
        brand: { "@type": "Brand", name: product.brand },
        sku: product.slug,
        mpn: product.slug,
        category: product.category,
        url: `${siteUrl}/produto/${product.slug}`,
        offers: {
          "@type": "Offer",
          "@id": `${siteUrl}/produto/${product.slug}#offer`,
          price: product.promoPrice.toFixed(2),
          priceCurrency: "BRL",
          priceValidUntil,
          availability: inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          itemCondition: "https://schema.org/NewCondition",
          url: `${siteUrl}/produto/${product.slug}`,
          seller: {
            "@type": "Organization",
            name: "L&PMakeUp",
            url: siteUrl,
          },
          shippingDetails: {
            "@type": "OfferShippingDetails",
            shippingRate: {
              "@type": "MonetaryAmount",
              value: "0",
              currency: "BRL",
            },
            shippingDestination: {
              "@type": "DefinedRegion",
              addressCountry: "BR",
            },
            deliveryTime: {
              "@type": "ShippingDeliveryTime",
              handlingTime: {
                "@type": "QuantitativeValue",
                minValue: 0,
                maxValue: 1,
                unitCode: "DAY",
              },
              transitTime: {
                "@type": "QuantitativeValue",
                minValue: 1,
                maxValue: 7,
                unitCode: "DAY",
              },
            },
          },
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          bestRating: "5",
          worstRating: "1",
          ratingCount: "53",
        },
        additionalProperty: product.details.map((d) => ({
          "@type": "PropertyValue",
          name: "Característica",
          value: d,
        })),
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
            item: categoryUrl,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: product.name,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: productFaqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail
        product={product}
        relatedProducts={related}
        categoryHref={
          categoryMeta ? `/categoria/${categoryMeta.slug}` : "/#categorias"
        }
        faqs={productFaqs}
      />
    </>
  );
}
