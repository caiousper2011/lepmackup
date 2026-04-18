"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface CategoryLink {
  name: string;
  href: string;
}

interface HomeClientProps {
  products: Product[];
  categories: string[];
  categoryLinks?: CategoryLink[];
}

function CountdownTimer() {
  function getTimeLeft() {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    const diff = endOfDay.getTime() - now.getTime();
    return {
      hours: Math.floor(diff / (1000 * 60 * 60)),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    };
  }

  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft());
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  const display = timeLeft ?? { hours: 0, minutes: 0, seconds: 0 };

  return (
    <div className="flex items-center gap-2">
      {[
        { value: display.hours, label: "h" },
        { value: display.minutes, label: "m" },
        { value: display.seconds, label: "s" },
      ].map((t, i) => (
        <span
          key={i}
          className="bg-gray-900/90 backdrop-blur-sm text-white font-mono font-bold text-lg px-3 py-1.5 rounded-xl min-w-[48px] text-center shadow-lg"
        >
          {String(t.value).padStart(2, "0")}
          <span className="text-xs text-gold-400 ml-0.5">{t.label}</span>
        </span>
      ))}
    </div>
  );
}

export default function HomeClient({
  products,
  categories,
  categoryLinks,
}: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { setIsOpen, totalQuantity } = useCart();

  const categoryHrefMap = new Map(
    (categoryLinks ?? []).map((c) => [c.name, c.href]),
  );

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <>
      {/* Urgency top bar */}
      <div className="bg-gray-900 text-white py-2.5 px-4 text-center text-xs sm:text-sm font-medium">
        <span className="inline-flex items-center gap-2">
          🔥 <span className="text-gold-400 font-bold">ÚLTIMA CHANCE</span> —
          Promoção acaba hoje! Frete grátis perto de SP
        </span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blush-50 via-rose-50 to-nude-50">
        <div className="absolute top-10 left-10 w-72 h-72 bg-rose-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-berry-600/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-100/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-berry-600 to-rose-500 text-white rounded-full px-5 py-2 mb-6 shadow-lg shadow-berry-600/25">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Oferta ao vivo
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-4 font-[family-name:var(--font-heading)]">
              <span className="bg-gradient-to-r from-berry-600 via-rose-500 to-berry-700 bg-clip-text text-transparent">
                Maquiagem Profissional
              </span>
              <br />
              <span className="text-gray-900">a partir de</span>{" "}
              <span className="relative inline-block">
                <span className="text-berry-600">R$6,99</span>
                <span className="absolute -top-3 -right-8 bg-gold-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full rotate-12 shadow-lg">
                  -63%
                </span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-xl mx-auto leading-relaxed">
              <span className="line-through text-gray-400">De R$18,99</span> por
              apenas{" "}
              <span className="font-extrabold text-berry-600 text-2xl">
                R$7,99
              </span>
              . Leve 4+ e pague{" "}
              <span className="font-extrabold text-berry-600 text-2xl">
                R$6,99
              </span>{" "}
              cada!
            </p>

            {/* Countdown */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <span className="text-sm font-medium text-gray-500">
                Acaba em:
              </span>
              <CountdownTimer />
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#produtos"
                className="w-full sm:w-auto gradient-cta text-white font-bold px-10 py-4.5 rounded-2xl shadow-xl shadow-berry-600/25 hover:shadow-2xl hover:shadow-berry-600/30 transition-all active:scale-[0.97] text-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Comprar Agora ✨</span>
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
            </div>

            {/* Social proof + trust */}
            <div className="mt-10 space-y-4">
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gold-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                  </svg>
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  4.9/5 — mais de 500 clientes satisfeitas
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-green-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  Pagamento Seguro via Mercado Pago
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-berry-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Entrega pra SP e todo Brasil
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gold-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Envio em até 24h após pagamento
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section id="promo" className="gradient-berry py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-bold font-[family-name:var(--font-heading)]">
                ✨ Quanto mais leva, mais economiza
              </h2>
              <p className="text-rose-100 text-sm mt-1.5">
                Todos por R$7,99 — Leve 4+ e pague R$6,99 cada! PIX, cartão e
                boleto.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/15 backdrop-blur-sm rounded-2xl px-6 py-3.5 text-center border border-white/20">
                <div className="text-3xl font-extrabold text-white">
                  R$ 7,99
                </div>
                <div className="text-xs text-rose-200">por item</div>
              </div>
              <div className="text-white text-2xl font-bold">→</div>
              <div className="bg-white rounded-2xl px-6 py-3.5 text-center shadow-xl shadow-berry-800/20">
                <div className="text-3xl font-extrabold text-berry-600">
                  R$ 6,99
                </div>
                <div className="text-xs text-gray-500">4+ itens</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof testimonials */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                name: "Ana P.",
                text: "Melhor custo-benefício! Comprei 6 produtos e paguei menos de R$42. Qualidade incrível!",
                stars: 5,
              },
              {
                name: "Camila S.",
                text: "Entrega super rápida aqui em SP. Maquiagem linda e pagamento pelo Mercado Pago muito prático.",
                stars: 5,
              },
              {
                name: "Juliana R.",
                text: "Indiquei pra 3 amigas e já ganhei 3 cupons de desconto! Amando essa loja 💕",
                stars: 5,
              },
            ].map((t, i) => (
              <div key={i} className="glass-card rounded-2xl p-6">
                <div className="flex gap-0.5 mb-3">
                  {[...Array(t.stars)].map((_, j) => (
                    <svg
                      key={j}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-gold-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic leading-relaxed">
                  &quot;{t.text}&quot;
                </p>
                <p className="text-xs font-semibold text-berry-600 mt-3">
                  — {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Categorias
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Encontre exatamente o que você procura
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                !activeCategory
                  ? "gradient-berry text-white shadow-lg shadow-berry-600/25"
                  : "bg-blush-50 text-berry-600 hover:bg-rose-100 border border-rose-200/60"
              }`}
            >
              Todos
            </button>
            {categories.map((cat) => {
              const emoji =
                cat === "Olhos"
                  ? "👁️"
                  : cat === "Lábios"
                    ? "💋"
                    : cat === "Rosto"
                      ? "✨"
                      : cat === "Sobrancelhas"
                        ? "✏️"
                        : cat === "Acessórios"
                          ? "🧽"
                          : "💄";
              return (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCategory(cat === activeCategory ? null : cat)
                  }
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === cat
                      ? "gradient-berry text-white shadow-lg shadow-berry-600/25"
                      : "bg-blush-50 text-berry-600 hover:bg-rose-100 border border-rose-200/60"
                  }`}
                >
                  {emoji} {cat}
                </button>
              );
            })}
          </div>

          {/* Links reais para SEO — crawlers seguem âncoras <a>, não botões */}
          <nav
            aria-label="Categorias de maquiagem"
            className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-gray-400"
          >
            <span>Explore por categoria:</span>
            {categories.map((cat, i) => {
              const href = categoryHrefMap.get(cat);
              if (!href) return null;
              return (
                <span key={cat} className="inline-flex items-center gap-2">
                  <Link
                    href={href}
                    className="text-berry-600 hover:underline font-medium"
                  >
                    {cat}
                  </Link>
                  {i < categories.length - 1 && <span>·</span>}
                </span>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Products Grid */}
      <section
        id="produtos"
        className="py-14 lg:py-20 bg-gradient-to-b from-white via-blush-50/30 to-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              {activeCategory ? `${activeCategory}` : "Todos os Produtos"}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {filtered.length}{" "}
              {filtered.length === 1
                ? "produto disponível"
                : "produtos disponíveis"}{" "}
              — por apenas R$ 7,99
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Compre em 3 Passos Rápidos
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Simples, rápido e seguro — sem complicação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                icon: "🛒",
                title: "Escolha e adicione ao carrinho",
                desc: "Navegue pelo catálogo, adicione seus favoritos e leve 4+ itens para pagar apenas R$6,99 cada!",
              },
              {
                step: "2",
                icon: "💳",
                title: "Pague com Mercado Pago",
                desc: "PIX, cartão de crédito ou boleto — pagamento 100% seguro pelo Mercado Pago. Sem complicação!",
              },
              {
                step: "3",
                icon: "📦",
                title: "Receba na sua casa",
                desc: "Enviamos em até 24h após pagamento. Perto de SP? Frete grátis até 1km! Para todo o Brasil via transportadoras.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-6 bg-gradient-to-b from-blush-50 to-white rounded-2xl border border-rose-100/60 hover:shadow-lg hover:shadow-berry-600/5 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-100 to-blush-50 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full gradient-berry text-white text-xs font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gradient-to-b from-blush-50/30 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Perguntas Frequentes
            </h2>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Como faço para comprar?",
                a: "Adicione os produtos ao carrinho, clique em Finalizar Compra, escolha seu endereço e pague diretamente pelo Mercado Pago — aceita PIX, cartão e boleto!",
              },
              {
                q: "Quais formas de pagamento vocês aceitam?",
                a: "Aceitamos PIX (aprovação instantânea), Cartão de Crédito (com parcelamento) e Boleto Bancário — tudo pelo Mercado Pago com total segurança.",
              },
              {
                q: "Como funciona o desconto para 4+ itens?",
                a: "Quando você adiciona 4 ou mais itens ao carrinho, o valor de cada item automaticamente muda de R$ 7,99 para R$ 6,99. O desconto é aplicado em todos os itens!",
              },
              {
                q: "Os produtos são originais?",
                a: "Sim! Trabalhamos apenas com marcas confiáveis e produtos de qualidade profissional como Vivai, Ruby Rose, Maxlove, Bellafeme, Dapop e Fenzza.",
              },
              {
                q: "Como funciona a entrega?",
                a: "Frete grátis para endereços até 1km da loja! Para outras regiões, calculamos o frete em tempo real com as melhores transportadoras (Correios, Jadlog e mais). Enviamos em até 24h após confirmação do pagamento!",
              },
              {
                q: "Como funciona a indicação de amigas?",
                a: "Compartilhe seu link de indicação com suas amigas. Quando elas fizerem a primeira compra, vocês duas ganham um cupom de desconto! Acesse Minha Conta → Indicar Amigas.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-2xl border border-rose-100/60 hover:border-berry-600/20 hover:shadow-md hover:shadow-berry-600/5 transition-all"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-gray-800 text-sm pr-4">
                    {faq.q}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-berry-600/50 group-open:rotate-180 transition-transform flex-shrink-0"
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
                <div className="px-5 pb-5 text-sm text-gray-600 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Floating cart button (mobile) */}
      {totalQuantity > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 md:hidden gradient-cta text-white p-4 rounded-full shadow-2xl shadow-berry-600/30 flex items-center gap-2 active:scale-95 transition-transform"
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
          <span className="font-bold text-sm">{totalQuantity}</span>
        </button>
      )}
    </>
  );
}
