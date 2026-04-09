import HomeClient from "@/components/HomeClient";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "L&PMakeUp | Maquiagem Profissional a partir de R$ 6,99",
  description:
    "Loja online de maquiagem com os melhores preços. Cílios postiços, delineadores, gloss, paletas — tudo por R$ 7,99. Compre 4+ itens e pague apenas R$ 6,99 cada!",
};

export default async function HomePage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  const categories = [...new Set(products.map((p) => p.category))];

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lpmakeup.com.br";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "L&PMakeUp",
        url: siteUrl,
        description:
          "Loja online de maquiagem profissional com preços imbatíveis",
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?busca={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": ["Organization", "LocalBusiness"],
        name: "L&PMakeUp",
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        image: `${siteUrl}/logo.png`,
        description:
          "Loja de maquiagem profissional com produtos a partir de R$ 6,99. Entrega para todo o Brasil.",
        address: {
          "@type": "PostalAddress",
          streetAddress: "Rua Monsenhor Francisco de Paula, 385",
          addressLocality: "São Paulo",
          addressRegion: "SP",
          postalCode: "03504-000",
          addressCountry: "BR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: -23.53632612030784,
          longitude: -46.53910512264193,
        },
        telephone: "+55-11-95287-5150",
        priceRange: "R$6,99 - R$7,99",
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "09:00",
          closes: "18:00",
        },
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+55-11-95287-5150",
          contactType: "customer service",
          availableLanguage: "Portuguese",
        },
        areaServed: {
          "@type": "Country",
          name: "BR",
        },
        sameAs: [],
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
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Qual o preço dos produtos da L&PMakeUp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Todos os produtos da L&PMakeUp custam R$ 7,99 na promoção. Comprando 4 ou mais itens, o preço unitário cai para R$ 6,99.",
            },
          },
          {
            "@type": "Question",
            name: "Como funciona a entrega da L&PMakeUp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Entregamos para todo o Brasil via Correios e transportadoras parceiras. O frete é calculado automaticamente no checkout com base no CEP de destino.",
            },
          },
          {
            "@type": "Question",
            name: "Quais formas de pagamento a L&PMakeUp aceita?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Aceitamos pagamento via Pix, boleto bancário, cartão de crédito e débito através do Mercado Pago.",
            },
          },
          {
            "@type": "Question",
            name: "A L&PMakeUp é confiável?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sim! A L&PMakeUp é uma loja física e online localizada em São Paulo. Todos os pagamentos são processados com segurança pelo Mercado Pago e os envios possuem rastreio.",
            },
          },
          {
            "@type": "Question",
            name: "Como funciona o frete grátis da L&PMakeUp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Clientes em um raio de até 1km da loja (Vila Aricanduva, São Paulo) têm frete grátis ou podem optar por retirada no endereço.",
            },
          },
          {
            "@type": "Question",
            name: "A L&PMakeUp vende maquiagem no atacado?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sim! Ao comprar 4 ou mais itens, você paga apenas R$ 6,99 por produto — ideal para revenda ou uso pessoal.",
            },
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Produtos em Promoção",
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          item: {
            "@type": "Product",
            name: p.name,
            description: p.description,
            image: `${siteUrl}${p.images[0] || ""}`,
            brand: { "@type": "Brand", name: p.brand },
            offers: {
              "@type": "Offer",
              price: p.promoPrice.toFixed(2),
              priceCurrency: "BRL",
              availability:
                (p.stockQuantity ?? 0) > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              url: `${siteUrl}/produto/${p.slug}`,
            },
          },
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
      <HomeClient products={products} categories={categories} />
    </>
  );
}
