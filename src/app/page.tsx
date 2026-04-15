import HomeClient from "@/components/HomeClient";
import { prisma } from "@/lib/prisma";
import type { Metadata } from "next";
import { CATEGORIES, categorySlugFromDbName } from "@/lib/categories";

// ISR — revalida a cada 5 minutos. Mantém Core Web Vitals altos sem sacrificar atualizações.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maquiagem Profissional Barata a partir de R$ 6,99 | L&PMakeUp",
  description:
    "Loja online de maquiagem profissional com preços imbatíveis: cílios postiços, delineadores, gloss labial, paletas e mais por R$ 7,99. Compre 4+ itens e pague R$ 6,99 cada. Frete para todo o Brasil.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Maquiagem Profissional Barata a partir de R$ 6,99 | L&PMakeUp",
    description:
      "Cílios, delineadores, gloss e paletas por R$ 7,99. Leve 4+ e pague R$ 6,99 cada. Marcas Vivai, Ruby Rose, Maxlove, Bellafeme, Dapop, Fenzza.",
    type: "website",
    url: "/",
    siteName: "L&PMakeUp",
    locale: "pt_BR",
  },
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
        "@id": `${siteUrl}#website`,
        name: "L&PMakeUp",
        alternateName: "L&P MakeUp",
        url: siteUrl,
        inLanguage: "pt-BR",
        description:
          "Loja online de maquiagem profissional com preços a partir de R$ 6,99. Cílios postiços, delineadores, gloss, paletas e mais — entrega para todo o Brasil.",
        publisher: { "@id": `${siteUrl}#org` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/?busca={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": ["Organization", "Store", "LocalBusiness"],
        "@id": `${siteUrl}#org`,
        name: "L&PMakeUp",
        legalName: "L&PMakeUp",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/icon.png`,
          width: 512,
          height: 512,
        },
        image: `${siteUrl}/icon.png`,
        description:
          "Loja de maquiagem profissional com produtos a partir de R$ 6,99. Cílios postiços, delineadores, gloss labial, paletas e acessórios. Entrega para todo o Brasil.",
        slogan: "Maquiagem profissional a partir de R$ 6,99",
        priceRange: "R$",
        currenciesAccepted: "BRL",
        paymentAccepted: "PIX, Cartão de Crédito, Cartão de Débito, Boleto",
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
        openingHoursSpecification: [
          {
            "@type": "OpeningHoursSpecification",
            dayOfWeek: [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
            ],
            opens: "09:00",
            closes: "18:00",
          },
        ],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+55-11-95287-5150",
          contactType: "customer service",
          availableLanguage: "Portuguese",
          areaServed: "BR",
        },
        areaServed: { "@type": "Country", name: "BR" },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: "4.9",
          bestRating: "5",
          worstRating: "1",
          ratingCount: "500",
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
      // Cada categoria como CollectionPage referenciada — força indexação
      ...CATEGORIES.map((c) => ({
        "@type": "SiteNavigationElement",
        name: c.dbName,
        url: `${siteUrl}/categoria/${c.slug}`,
        description: c.description,
      })),
      {
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "Qual o preço dos produtos da L&PMakeUp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Todos os produtos da L&PMakeUp custam R$ 7,99 na promoção. Comprando 4 ou mais itens, o preço unitário cai para R$ 6,99 — desconto aplicado automaticamente no carrinho.",
            },
          },
          {
            "@type": "Question",
            name: "Como funciona a entrega da L&PMakeUp?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A L&PMakeUp entrega para todo o Brasil via Correios e transportadoras parceiras (Jadlog, Loggi). O frete é calculado em tempo real no checkout com base no CEP. Clientes em até 1 km da loja em Vila Aricanduva (São Paulo) têm frete grátis ou retirada no local.",
            },
          },
          {
            "@type": "Question",
            name: "Quais formas de pagamento a L&PMakeUp aceita?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "A L&PMakeUp aceita PIX (com aprovação instantânea), boleto bancário, cartão de crédito (parcelado) e cartão de débito, todos processados com segurança pelo Mercado Pago.",
            },
          },
          {
            "@type": "Question",
            name: "A L&PMakeUp é confiável?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sim. A L&PMakeUp é uma loja física e online localizada na Vila Aricanduva, em São Paulo. Todos os pagamentos são processados pelo Mercado Pago e os envios possuem rastreio. A loja tem nota 4,9/5 com mais de 500 clientes atendidas.",
            },
          },
          {
            "@type": "Question",
            name: "A L&PMakeUp vende maquiagem no atacado?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Sim. Ao comprar 4 ou mais itens, você paga apenas R$ 6,99 por produto — ideal para revenda, kits de presente ou uso pessoal.",
            },
          },
          {
            "@type": "Question",
            name: "Quais marcas de maquiagem a L&PMakeUp vende?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Trabalhamos com marcas reconhecidas como Vivai, Ruby Rose, Maxlove, Bellafeme, Dapop, Fenzza, Mahav, Aurora e Lua&Neve.",
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
          url: `${siteUrl}/produto/${p.slug}`,
          item: {
            "@type": "Product",
            name: p.name,
            description: p.description,
            image: `${siteUrl}${p.images[0] || ""}`,
            brand: { "@type": "Brand", name: p.brand },
            sku: p.slug,
            category: p.category,
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

  // categorySlugFromDbName usado pelo HomeClient para gerar links reais às páginas
  const categoryLinks = categories.map((c) => ({
    name: c,
    href: `/categoria/${categorySlugFromDbName(c)}`,
  }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomeClient
        products={products}
        categories={categories}
        categoryLinks={categoryLinks}
      />
    </>
  );
}
