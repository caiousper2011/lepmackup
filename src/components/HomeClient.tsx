"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import HeroCarousel from "@/components/HeroCarousel";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ContactFormSection from "@/components/ContactFormSection";
import { CATEGORIES } from "@/lib/categories";

interface CategoryLink {
  name: string;
  href: string;
}

interface HomeClientProps {
  products: Product[];
  categories: string[];
  categoryLinks?: CategoryLink[];
}

export default function HomeClient({ products, categories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { setIsOpen, totalQuantity } = useCart();

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <>
      {/* Hero Carousel — autoplay, design system surfaces */}
      <HeroCarousel products={products} />

      {/* PRODUCTS GRID — Mais Vendidos da Semana */}
      <section
        id="produtos"
        className="pt-8 pb-12 sm:py-16 lg:py-20 gradient-berry-soft"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section head */}
          <div className="text-center mb-10">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5 inline-flex items-center gap-1.5">
              <span>⚡</span>
              <span>Ofertas Relâmpago</span>
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-gray-900 mb-3 font-(family-name:--font-heading) tracking-tight">
              {activeCategory ? (
                <>
                  {activeCategory} —{" "}
                  <em className="italic font-medium bg-linear-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                    Em Destaque
                  </em>
                </>
              ) : (
                <>
                  Mais{" "}
                  <em className="italic font-medium bg-linear-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                    Vendidos
                  </em>{" "}
                  da Semana
                </>
              )}
            </h2>
            <p className="text-gray-600 text-base max-w-xl mx-auto">
              Os queridinhos das nossas clientes — e dos profissionais.{" "}
              <span className="block sm:inline mt-1 sm:mt-0 text-gold-600 font-semibold">
                Compre 4+ e economize ainda mais 🎁
              </span>
            </p>
          </div>

          {/* Filter pills */}
          <div className="mb-8 sm:mb-10 -mx-4 px-4 pb-1 overflow-x-auto hide-scrollbar">
            <div className="flex min-w-max sm:min-w-full items-center justify-start sm:justify-center gap-1.5 sm:gap-2.5">
              <button
                onClick={() => setActiveCategory(null)}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 text-[12px] sm:text-sm font-bold transition-all duration-200 ${
                  !activeCategory
                    ? "gradient-cta text-white shadow-[0_8px_24px_-4px_rgba(225,29,72,0.4)]"
                    : "bg-white text-berry-700 border-2 border-rose-200 hover:border-rose-400"
                }`}
              >
                Todos
              </button>
              {categories.map((cat) => {
                const meta = CATEGORIES.find((c) => c.dbName === cat);
                const emoji = meta?.emoji ?? "💄";
                return (
                  <button
                    key={cat}
                    onClick={() =>
                      setActiveCategory(cat === activeCategory ? null : cat)
                    }
                    className={`whitespace-nowrap rounded-full px-3 py-1.5 sm:px-5 sm:py-2.5 text-[12px] sm:text-sm font-bold transition-all duration-200 ${
                      activeCategory === cat
                        ? "gradient-cta text-white shadow-[0_8px_24px_-4px_rgba(225,29,72,0.4)]"
                        : "bg-white text-berry-700 border-2 border-rose-200 hover:border-rose-400"
                    }`}
                  >
                    <span className="hidden sm:inline mr-1.5">{emoji}</span>
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="#produtos"
              className="inline-flex items-center gap-2 gradient-cta text-white font-extrabold px-8 sm:px-10 py-4 sm:py-4.5 rounded-full shadow-[0_8px_24px_-4px_rgba(225,29,72,0.4)] hover:shadow-[0_12px_28px_-4px_rgba(225,29,72,0.55)] transition-all transform hover:scale-[1.04] active:scale-[0.97] text-base sm:text-[17px]"
            >
              Comprar Agora com Desconto
              <span className="text-xl">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* HOW TO BUY — White panel, rounded-3xl */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5">
              Simples &amp; Seguro
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-gray-900 font-(family-name:--font-heading) tracking-tight">
              Compre em{" "}
              <em className="italic font-medium bg-linear-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                3 Passos
              </em>
            </h2>
          </div>

          <div className="bg-white border border-rose-100 rounded-4xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 shadow-[0_2px_6px_rgba(155,27,90,0.06)]">
            {[
              {
                num: "01",
                title: "Escolha seus produtos",
                desc: "Adicione tudo o que quiser ao carrinho. Quanto mais leva, mais economiza 🎁",
              },
              {
                num: "02",
                title: "Pague com segurança",
                desc: "Mercado Pago SSL 256-bit. PIX, cartão ou boleto — você escolhe.",
              },
              {
                num: "03",
                title: "Receba em casa",
                desc: "Em SP, 24h. Brasil inteiro, 3 a 7 dias. Acompanhe em tempo real.",
              },
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="font-(family-name:--font-heading) font-black text-5xl sm:text-[48px] leading-none mb-2 bg-linear-to-br from-berry-600 via-rose-500 to-gold-500 bg-clip-text text-transparent">
                  {step.num}
                </div>
                <h3 className="font-(family-name:--font-heading) font-bold text-xl text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST BLOCK — Dark slate inside soft gradient surface */}
      <section className="py-16 lg:py-20 gradient-berry-soft">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900 text-white rounded-4xl p-10 sm:p-14 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {[
              {
                icon: "🔐",
                title: "SSL 256-bit",
                desc: "Mercado Pago. Seus dados protegidos do início ao fim.",
              },
              {
                icon: "💳",
                title: "Pague como quiser",
                desc: "PIX, cartão em até 6× ou boleto. Aprovação imediata.",
              },
              {
                icon: "🚚",
                title: "Entrega rápida",
                desc: "SP em 24h. Brasil 3-7 dias. Frete grátis acima de R$ 99.",
              },
              {
                icon: "💬",
                title: "Suporte direto",
                desc: "WhatsApp seg-sáb 9h-18h. Resposta em minutos.",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-[34px] leading-none mb-2.5">
                  {item.icon}
                </div>
                <h4 className="font-(family-name:--font-heading) font-bold text-lg mb-1.5">
                  {item.title}
                </h4>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS — Editorial review cards */}
      <section className="py-16 lg:py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5">
              500+ Clientes Satisfeitas
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold text-gray-900 mb-3 font-(family-name:--font-heading) tracking-tight">
              Milhares de{" "}
              <em className="italic font-medium bg-linear-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                Clientes
              </em>{" "}
              Satisfeitas 💕
            </h2>
            <p className="text-gray-600 text-base">
              Veja por que 500+ mulheres confiam em nós.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                name: "Ana Paula",
                city: "São Paulo",
                text: "Melhor preço que já vi! Comprei 8 itens e gastei menos de R$60. Qualidade profissional mesmo.",
                stars: 5,
                verified: true,
              },
              {
                name: "Camila Santos",
                city: "Guarulhos",
                text: "Entrega em SP foi RÁPIDA demais! No mesmo dia! Recomendo demais, voltei a comprar.",
                stars: 5,
                verified: true,
              },
              {
                name: "Juliana Costa",
                city: "Osasco",
                text: "Indiquei pra 3 amigas e ganhei cupons! Paguei a última compra à metade do preço 🎉",
                stars: 5,
                verified: true,
              },
              {
                name: "Marina Lima",
                city: "Barueri",
                text: "Achei que era golpe pelos preços, mas é real! Produtos originais, entrega rápida, muito bom!",
                stars: 5,
                verified: true,
              },
              {
                name: "Fernanda Gomes",
                city: "Taboão da Serra",
                text: "O suporte resolveu meu problema em 5 minutos. Atenciosos, educados e rápidos!",
                stars: 5,
                verified: true,
              },
              {
                name: "Patricia Silva",
                city: "Diadema",
                text: "Fiz a devolução sem problema. Pegaram de volta, reembolsaram. Processo bem simples!",
                stars: 5,
                verified: true,
              },
            ].map((review, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-3xl border-2 border-rose-100 hover:border-rose-300 transition-all duration-300 hover:shadow-[0_12px_28px_-8px_rgba(155,27,90,0.15)]"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-gray-900 font-(family-name:--font-heading)">
                      {review.name}
                    </h4>
                    <p className="text-xs text-gray-400">{review.city}</p>
                  </div>
                  {review.verified && (
                    <span className="text-[10px] bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-bold flex items-center gap-1 shrink-0">
                      ✓ Verificada
                    </span>
                  )}
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array(review.stars)
                    .fill(0)
                    .map((_, j) => (
                      <span key={j} className="text-base">
                        ⭐
                      </span>
                    ))}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed italic">
                  &ldquo;{review.text}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5">
              Dúvidas? Respondemos
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 font-(family-name:--font-heading) tracking-tight">
              Perguntas{" "}
              <em className="italic font-medium bg-linear-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                Frequentes
              </em>{" "}
              ✨
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Como confio em um site com preços tão baixos?",
                a: "Trabalhamos direto com fabricantes e distribuímos em volume, reduzindo custos. Sem intermediários = preço menor pra você! 1000+ clientes satisfeitas confirmam a qualidade.",
              },
              {
                q: "É seguro colocar meu cartão?",
                a: "100% seguro! Usamos Mercado Pago com criptografia SSL 256-bit. Seus dados nunca passam por nossos servidores.",
              },
              {
                q: "E se o produto não chegar?",
                a: "Nunca aconteceu! Usamos transportadoras com rastreamento. Você acompanha tudo em tempo real. Garantia contra perda.",
              },
              {
                q: "Posso devolver se não gostar?",
                a: "Sim! 30 dias para devolver. Reembolso integral. Sem pegadinhas. Somos confiantes na qualidade!",
              },
              {
                q: "Quanto tempo chega?",
                a: "Em SP: 24h. Resto do Brasil: 3-7 dias via transportadora. Enviamos no mesmo dia após confirmação do pagamento.",
              },
              {
                q: "Vocês entregam pra todo Brasil?",
                a: "Sim! Entregamos em qualquer lugar do Brasil via Correios, Sedex ou Transportadoras. Você escolhe na hora.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white border-2 border-rose-100 rounded-2xl hover:border-rose-300 hover:shadow-[0_8px_16px_-4px_rgba(155,27,90,0.10)] transition-all"
              >
                <summary className="flex items-center gap-3 p-5 cursor-pointer font-bold text-gray-900 text-sm">
                  <span className="text-berry-600 group-open:rotate-90 transition-transform">
                    →
                  </span>
                  {faq.q}
                </summary>
                <div className="px-5 pb-5 text-gray-700 text-sm border-t border-rose-100 pt-4 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA — gradient block panel inside light bg */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-4xl gradient-berry text-white text-center px-6 sm:px-12 py-14 sm:py-16">
            {/* Decorative blobs */}
            <div className="absolute -top-24 -right-12 w-72 h-72 rounded-full bg-white/10 pointer-events-none" />
            <div className="absolute -bottom-20 -left-10 w-60 h-60 rounded-full bg-white/10 pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-(family-name:--font-heading) tracking-tight leading-tight mb-4">
                Não deixe pra{" "}
                <em className="italic font-medium text-gold-100">depois</em> 🔥
              </h2>
              <p className="text-base sm:text-[17px] opacity-95 mb-7">
                500+ clientes já garantiram suas favoritas com até 63% OFF.
                Estoques acabando hoje.
              </p>
              <a
                href="#produtos"
                className="inline-flex items-center gap-2.5 bg-white text-rose-600 font-black px-8 sm:px-10 py-4 sm:py-4.5 rounded-full shadow-[0_12px_28px_-6px_rgba(0,0,0,0.3)] hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 text-base sm:text-[18px]"
              >
                Aproveitar Oferta Agora
                <span className="text-2xl">🚀</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <ContactFormSection />

      {/* Floating cart button (mobile) */}
      {totalQuantity > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 md:hidden gradient-cta text-white p-4 rounded-full shadow-2xl shadow-rose-600/50 flex items-center gap-2 active:scale-95 transition-transform font-bold hover:shadow-2xl hover:shadow-rose-600/70"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
          <span>{totalQuantity}</span>
        </button>
      )}
    </>
  );
}
