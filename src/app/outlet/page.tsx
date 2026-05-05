import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, categorySlugFromDbName } from "@/lib/categories";
import ProductCard from "@/components/ProductCard";

export const revalidate = 600;

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://lpmakeup.com.br";
const PAGE_PATH = "/outlet";
const CANONICAL = `${SITE_URL}${PAGE_PATH}`;

const PAGE_TITLE = "Outlet de Maquiagem com até 65% OFF | L&PMakeUp";
const PAGE_DESCRIPTION =
  "Outlet L&PMakeUp: catálogo completo de maquiagem profissional em promoção a partir de R$ 6,99. Cílios, delineadores, gloss, paletas e acessórios — leve 4+ e pague R$ 6,99 cada. Frete para todo o Brasil.";

const FAQ: { q: string; a: string }[] = [
  {
    q: "O que é o Outlet da L&PMakeUp?",
    a: "O Outlet da L&PMakeUp reúne todo o catálogo da loja com preços promocionais a partir de R$ 6,99. São produtos originais, novos e em pronta entrega — com descontos reais sobre o valor de tabela.",
  },
  {
    q: "Os produtos do Outlet são originais?",
    a: "Sim. Todos os itens do Outlet são originais, lacrados e adquiridos diretamente das marcas. Trabalhamos com Vivai, Ruby Rose, Maxlove, Bellafeme, Dapop, Fenzza, Mahav, Aurora e Lua&Neve.",
  },
  {
    q: "Como ganho o desconto extra de R$ 6,99?",
    a: "Adicione 4 ou mais itens ao carrinho — o preço unitário é ajustado automaticamente para R$ 6,99 cada, sem cupom. Funciona com qualquer combinação de produtos do Outlet.",
  },
  {
    q: "Qual o prazo de entrega do Outlet?",
    a: "Em São Paulo capital, entregamos em 24h após confirmação do pagamento. Para o restante do Brasil, o prazo varia entre 1 e 7 dias úteis dependendo do CEP, calculado em tempo real no checkout.",
  },
  {
    q: "Posso pagar com PIX?",
    a: "Sim. Aceitamos PIX (com aprovação instantânea), boleto, cartão de crédito (parcelado) e cartão de débito — todos processados pelo Mercado Pago.",
  },
  {
    q: "Posso revender os produtos do Outlet?",
    a: "Sim. Muitas clientes compram em quantidade para revender ou montar kits de presente. Comprando 4+ itens, o preço cai para R$ 6,99 por unidade.",
  },
];

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  keywords: [
    "outlet maquiagem",
    "maquiagem em promoção",
    "outlet make",
    "maquiagem barata online",
    "promoção maquiagem",
    "comprar maquiagem em oferta",
    "outlet beauty",
    "maquiagem profissional desconto",
    "maquiagem 6,99",
    "maquiagem atacado",
    "L&PMakeUp outlet",
  ],
  alternates: { canonical: PAGE_PATH },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    type: "website",
    url: PAGE_PATH,
    siteName: "L&PMakeUp",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default async function OutletPage() {
  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ createdAt: "desc" }],
    });
  } catch (error) {
    console.warn(
      "[outlet] findMany: banco indisponível no build, usando ISR on-demand.",
      error,
    );
  }

  const productsByCategory = new Map<
    string,
    Awaited<ReturnType<typeof prisma.product.findMany>>
  >();
  for (const p of products) {
    const list = productsByCategory.get(p.category);
    if (list) list.push(p);
    else productsByCategory.set(p.category, [p]);
  }

  const categoriesPresent = CATEGORIES.filter((c) =>
    productsByCategory.has(c.dbName),
  );

  const maxDiscount = products.reduce((acc, p) => {
    if (!p.originalPrice || p.originalPrice <= p.promoPrice) return acc;
    const pct = Math.round(
      ((p.originalPrice - p.promoPrice) / p.originalPrice) * 100,
    );
    return pct > acc ? pct : acc;
  }, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": CANONICAL,
        url: CANONICAL,
        name: "Outlet L&PMakeUp",
        description: PAGE_DESCRIPTION,
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${SITE_URL}#website` },
        about: {
          "@type": "Thing",
          name: "Outlet de maquiagem profissional",
        },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".outlet-intro", ".outlet-faq"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Outlet", item: CANONICAL },
        ],
      },
      {
        "@type": "ItemList",
        name: "Outlet — todos os produtos",
        numberOfItems: products.length,
        itemListElement: products.map((p, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: `${SITE_URL}/produto/${p.slug}`,
          item: {
            "@type": "Product",
            name: p.name,
            description: p.description,
            image: `${SITE_URL}${p.images[0] || ""}`,
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
              url: `${SITE_URL}/produto/${p.slug}`,
            },
          },
        })),
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
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

      {/* Hero */}
      <section className="relative overflow-hidden gradient-berry-soft pt-12 pb-14 sm:pt-16 sm:pb-20">
        <div
          className="absolute top-0 left-[5%] w-96 h-96 bg-linear-to-br from-rose-200/50 to-blush-50/0 rounded-full blur-3xl animate-pulse"
          aria-hidden="true"
        />
        <div
          className="absolute bottom-0 right-[5%] w-80 h-80 bg-linear-to-tl from-gold-100/40 to-rose-100/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[13px] text-gray-500 mb-8"
          >
            <Link href="/" className="hover:text-berry-600 transition-colors">
              Início
            </Link>
            <span aria-hidden="true" className="text-rose-200">
              /
            </span>
            <span className="text-gray-900 font-medium">Outlet</span>
          </nav>

          <header className="text-center max-w-3xl mx-auto">
            <p className="lp-section-eyebrow mb-3 justify-center">
              <span aria-hidden="true">🔥</span>
              <span>
                Outlet · Catálogo completo · Até {Math.max(maxDiscount, 60)}%
                OFF
              </span>
            </p>
            <h1 className="font-(family-name:--font-heading) font-black text-4xl sm:text-5xl lg:text-[58px] leading-[1.05] tracking-[-0.02em] text-gray-900 mb-5">
              Outlet de{" "}
              <em className="italic font-medium bg-linear-to-r from-berry-600 via-rose-500 to-gold-500 bg-clip-text text-transparent">
                Maquiagem
              </em>{" "}
              a partir de R$ 6,99
            </h1>
            <p className="outlet-intro text-[#3a1822] text-base sm:text-lg leading-[1.6] max-w-2xl mx-auto">
              Todos os produtos da L&amp;PMakeUp em um só lugar — com preços de{" "}
              <b>outlet de verdade</b>. Cílios, delineadores, gloss, paletas e
              acessórios das melhores marcas, em pronta entrega de São Paulo
              para todo o Brasil.{" "}
              <span className="font-semibold text-berry-600">
                Leve 4+ e pague R$ 6,99 cada.
              </span>
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-rose-100 shadow-[0_2px_6px_rgba(155,27,90,0.06)] text-[11px] sm:text-[13px] font-semibold text-gray-700">
                <span aria-hidden="true">📦</span>
                <span>{products.length} produtos no outlet</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-rose-100 shadow-[0_2px_6px_rgba(155,27,90,0.06)] text-[11px] sm:text-[13px] font-semibold text-gray-700">
                <span aria-hidden="true">🔒</span>
                <span>Mercado Pago SSL</span>
              </span>
              <span className="inline-flex items-center gap-2 bg-white/90 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-rose-100 shadow-[0_2px_6px_rgba(155,27,90,0.06)] text-[11px] sm:text-[13px] font-semibold text-gray-700">
                <span aria-hidden="true">🚚</span>
                <span>Frete em 24h em SP</span>
              </span>
            </div>
          </header>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Quick category jump (in-page anchors) */}
        {categoriesPresent.length > 1 && (
          <nav
            aria-label="Categorias do outlet"
            className="flex flex-wrap justify-center gap-2 mb-12"
          >
            {categoriesPresent.map((c) => {
              const count = productsByCategory.get(c.dbName)?.length ?? 0;
              return (
                <a
                  key={c.slug}
                  href={`#categoria-${c.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-bold bg-white text-berry-700 border-2 border-rose-200 hover:border-rose-400 hover:bg-rose-50/40 transition-all"
                >
                  <span aria-hidden="true">{c.emoji}</span>
                  <span>{c.dbName}</span>
                  <span className="text-[11px] font-bold text-gray-400">
                    {count}
                  </span>
                </a>
              );
            })}
          </nav>
        )}

        {/* All products grid */}
        {products.length > 0 ? (
          <>
            <section
              aria-label="Todos os produtos do outlet"
              className="mb-16"
            >
              <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
                <div>
                  <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-1.5">
                    Catálogo completo
                  </p>
                  <h2 className="font-(family-name:--font-heading) font-extrabold text-2xl sm:text-3xl lg:text-4xl text-gray-900 tracking-tight">
                    Todos os{" "}
                    <em className="italic font-medium bg-linear-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                      produtos
                    </em>{" "}
                    do outlet
                  </h2>
                </div>
                <p className="text-sm text-gray-500">
                  Exibindo{" "}
                  <span className="font-bold text-berry-600">
                    {products.length}
                  </span>{" "}
                  produtos
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>

            {/* By-category sections — improves UX, in-page nav and SEO */}
            {categoriesPresent.map((cat) => {
              const list = productsByCategory.get(cat.dbName) ?? [];
              if (list.length === 0) return null;
              return (
                <section
                  key={cat.slug}
                  id={`categoria-${cat.slug}`}
                  aria-label={`Outlet ${cat.dbName}`}
                  className="mb-14 scroll-mt-24"
                >
                  <div className="flex items-end justify-between mb-5 gap-4 flex-wrap">
                    <div>
                      <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-1.5 inline-flex items-center gap-1.5">
                        <span aria-hidden="true">{cat.emoji}</span>
                        <span>Outlet · {cat.dbName}</span>
                      </p>
                      <h2 className="font-(family-name:--font-heading) font-extrabold text-xl sm:text-2xl lg:text-3xl text-gray-900 tracking-tight">
                        {cat.h1}
                      </h2>
                    </div>
                    <Link
                      href={`/categoria/${categorySlugFromDbName(cat.dbName)}`}
                      className="text-sm font-bold text-berry-600 hover:text-berry-700 inline-flex items-center gap-1"
                    >
                      Ver categoria completa
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
                    {list.map((p) => (
                      <ProductCard key={p.id} product={p} />
                    ))}
                  </div>
                </section>
              );
            })}
          </>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-rose-100">
            <p className="text-gray-600 mb-3">
              Estamos repondo o estoque do outlet. Volte em instantes.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 gradient-cta text-white font-bold px-6 py-3 rounded-full shadow-[0_8px_24px_-4px_rgba(225,29,72,0.4)]"
            >
              Voltar para a home →
            </Link>
          </div>
        )}

        {/* FAQ */}
        <section
          aria-labelledby="outlet-faq-titulo"
          className="mt-16 lg:mt-20 pt-12 border-t border-rose-100 max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5">
              Dúvidas comuns
            </p>
            <h2
              id="outlet-faq-titulo"
              className="font-(family-name:--font-heading) font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight"
            >
              Perguntas frequentes sobre o{" "}
              <em className="italic font-medium bg-linear-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                Outlet
              </em>
            </h2>
          </div>
          <div className="outlet-faq space-y-3">
            {FAQ.map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border-2 border-rose-100 hover:border-rose-300 hover:shadow-[0_8px_16px_-4px_rgba(155,27,90,0.10)] transition-all"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-semibold text-gray-900 text-sm pr-4">
                    {faq.q}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-berry-600 group-open:rotate-180 transition-transform shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-sm text-gray-700 leading-relaxed border-t border-rose-100 pt-4">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
