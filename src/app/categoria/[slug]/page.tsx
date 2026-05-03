import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CATEGORIES, getCategoryBySlug } from "@/lib/categories";
import ProductCard from "@/components/ProductCard";

// ISR — revalida a cada hora; muito mais rápido e SEO-friendly que force-dynamic
export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) return {};

  return {
    title: category.title,
    description: category.description,
    keywords: category.keywords,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: {
      title: category.title,
      description: category.description,
      type: "website",
      url: `/categoria/${category.slug}`,
      siteName: "L&PMakeUp",
      locale: "pt_BR",
    },
    twitter: {
      card: "summary_large_image",
      title: category.title,
      description: category.description,
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
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);
  if (!category) notFound();

  let products: Awaited<ReturnType<typeof prisma.product.findMany>> = [];
  try {
    products = await prisma.product.findMany({
      where: { active: true, category: category.dbName },
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    // Banco indisponível no build (ex.: Vercel prerender sem DATABASE_URL
    // válida). Renderiza vazio e deixa o ISR repopular on-demand.
    console.warn(
      "[categoria/[slug]] findMany: banco indisponível, usando ISR on-demand.",
      error,
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://lpmakeup.com.br";
  const canonical = `${siteUrl}/categoria/${category.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": canonical,
        url: canonical,
        name: category.h1,
        description: category.description,
        inLanguage: "pt-BR",
        isPartOf: { "@id": `${siteUrl}#website` },
        about: { "@type": "Thing", name: category.dbName },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", ".category-intro", ".category-faq"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: siteUrl },
          {
            "@type": "ListItem",
            position: 2,
            name: category.dbName,
            item: canonical,
          },
        ],
      },
      {
        "@type": "ItemList",
        name: category.h1,
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
      {
        "@type": "FAQPage",
        mainEntity: category.faqs.map((f) => ({
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

      {/* Hero header with soft gradient */}
      <section className="gradient-berry-soft py-14 lg:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
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
            <Link
              href="/#produtos"
              className="hover:text-berry-600 transition-colors"
            >
              Ofertas
            </Link>
            <span aria-hidden="true" className="text-rose-200">
              /
            </span>
            <span className="text-gray-900 font-medium">{category.dbName}</span>
          </nav>

          <header className="text-center max-w-2xl mx-auto">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-3">
              Maquiagem L&amp;PMakeUp · {category.dbName}
            </p>
            <span
              className="text-5xl sm:text-6xl block mb-4"
              aria-hidden="true"
            >
              {category.emoji}
            </span>
            <h1 className="font-(family-name:--font-heading) font-black text-3xl sm:text-4xl lg:text-[48px] leading-[1.1] tracking-tight text-gray-900 mb-4">
              {category.h1}
            </h1>
            <p className="category-intro text-gray-700 text-base leading-relaxed">
              {category.intro}
            </p>
          </header>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Outras categorias */}
        <nav
          aria-label="Outras categorias"
          className="flex flex-wrap justify-center gap-2 mb-10"
        >
          {CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
            <Link
              key={c.slug}
              href={`/categoria/${c.slug}`}
              className="px-5 py-2.5 rounded-full text-sm font-bold bg-white text-berry-700 border-2 border-rose-200 hover:border-rose-400 transition-all"
            >
              <span className="mr-1.5">{c.emoji}</span>
              {c.dbName}
            </Link>
          ))}
        </nav>

        {/* Grid de produtos */}
        {products.length > 0 ? (
          <section aria-label={`Produtos em ${category.dbName}`}>
            <h2 className="sr-only">
              {products.length} produto{products.length === 1 ? "" : "s"} em{" "}
              {category.dbName}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-rose-100">
            <p className="text-gray-600 mb-3">
              Nenhum produto disponível nesta categoria no momento.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 gradient-cta text-white font-bold px-6 py-3 rounded-full shadow-[0_8px_24px_-4px_rgba(225,29,72,0.4)]"
            >
              Ver todos os produtos →
            </Link>
          </div>
        )}

        {/* FAQ específica da categoria */}
        <section
          aria-labelledby="faq-titulo"
          className="mt-16 lg:mt-20 pt-12 border-t border-rose-100 max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5">
              Dúvidas comuns
            </p>
            <h2
              id="faq-titulo"
              className="font-(family-name:--font-heading) font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight"
            >
              Perguntas frequentes sobre{" "}
              <em className="italic font-medium bg-linear-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                {category.dbName.toLowerCase()}
              </em>
            </h2>
          </div>
          <div className="category-faq space-y-3">
            {category.faqs.map((faq, i) => (
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
