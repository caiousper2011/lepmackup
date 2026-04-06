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

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "L&PMakeUp",
        url: "https://lpmakeup.com.br",
        description:
          "Loja online de maquiagem profissional com preços imbatíveis",
      },
      {
        "@type": "Organization",
        name: "L&PMakeUp",
        url: "https://lpmakeup.com.br",
        logo: "https://lpmakeup.com.br/logo.png",
        contactPoint: {
          "@type": "ContactPoint",
          telephone: "+55-11-95287-5150",
          contactType: "customer service",
          availableLanguage: "Portuguese",
        },
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
            image: `https://lpmakeup.com.br${p.images[0] || ""}`,
            brand: { "@type": "Brand", name: p.brand },
            offers: {
              "@type": "Offer",
              price: p.promoPrice.toFixed(2),
              priceCurrency: "BRL",
              availability:
                (p.stockQuantity ?? 0) > 0
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              url: `https://lpmakeup.com.br/produto/${p.slug}`,
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
