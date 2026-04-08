"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { getWhatsAppHref } from "@/lib/whatsapp-config";

interface HomeClientProps {
  products: Product[];
  categories: string[];
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

  const [timeLeft, setTimeLeft] = useState(getTimeLeft);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {[
        { value: timeLeft.hours, label: "h" },
        { value: timeLeft.minutes, label: "m" },
        { value: timeLeft.seconds, label: "s" },
      ].map((t, i) => (
        <span
          key={i}
          className="bg-gray-900 text-white font-mono font-bold text-lg px-2.5 py-1 rounded-lg min-w-[44px] text-center"
        >
          {String(t.value).padStart(2, "0")}
          <span className="text-xs text-rose-300">{t.label}</span>
        </span>
      ))}
    </div>
  );
}

export default function HomeClient({ products, categories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { setIsOpen, totalQuantity } = useCart();

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <>
      {/* Urgency top bar */}
      <div className="bg-gray-900 text-white py-2 px-4 text-center text-xs sm:text-sm font-medium">
        🔥 <span className="text-rose-400 font-bold">ÚLTIMA CHANCE</span> —
        Promoção acaba hoje! Frete grátis perto de SP
      </div>

      {/* Hero Section - More aggressive */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
        <div className="absolute top-10 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 lg:py-28">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-red-600 text-white rounded-full px-4 py-1.5 mb-5 shadow-lg animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Oferta ao vivo — vagas limitadas
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight mb-3">
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                Maquiagem Profissional
              </span>
              <br />
              <span className="text-gray-900">a partir de</span>{" "}
              <span className="relative inline-block">
                <span className="text-rose-600">R$6,99</span>
                <span className="absolute -top-3 -right-8 bg-yellow-400 text-gray-900 text-xs font-bold px-2 py-0.5 rounded-full rotate-12 shadow">
                  -63%
                </span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-xl mx-auto leading-relaxed">
              <span className="line-through text-gray-400">De R$18,99</span> por
              apenas{" "}
              <span className="font-extrabold text-rose-600 text-2xl">
                R$7,99
              </span>
              . Leve 4+ e pague{" "}
              <span className="font-extrabold text-rose-600 text-2xl">
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
                className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold px-10 py-4.5 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 text-lg relative overflow-hidden group"
              >
                <span className="relative z-10">Comprar Agora</span>
                <span className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </a>
              <a
                href={getWhatsAppHref()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-white hover:bg-green-50 text-green-600 font-bold px-8 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all border-2 border-green-200 flex items-center justify-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Dúvidas? WhatsApp
              </a>
            </div>

            {/* Social proof + trust */}
            <div className="mt-8 space-y-4">
              <div className="flex items-center justify-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <svg
                    key={s}
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-yellow-400"
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
                    className="h-5 w-5 text-blue-500"
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
                    className="h-5 w-5 text-amber-500"
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
      <section
        id="promo"
        className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 py-6"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-white text-center md:text-left">
              <h2 className="text-xl sm:text-2xl font-bold">
                🔥 Quanto mais leva, mais economiza
              </h2>
              <p className="text-rose-100 text-sm mt-1">
                Todos por R$7,99 — Leve 4+ e pague R$6,99 cada! PIX, cartão e
                boleto.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl px-6 py-3 text-center">
                <div className="text-3xl font-extrabold text-white">
                  R$ 7,99
                </div>
                <div className="text-xs text-rose-100">por item</div>
              </div>
              <div className="text-white text-2xl font-bold">→</div>
              <div className="bg-white rounded-xl px-6 py-3 text-center shadow-lg">
                <div className="text-3xl font-extrabold text-rose-600">
                  R$ 6,99
                </div>
                <div className="text-xs text-gray-500">4+ itens</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof testimonials */}
      <section className="py-10 bg-white">
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
              <div
                key={i}
                className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100"
              >
                <div className="flex gap-0.5 mb-2">
                  {[...Array(t.stars)].map((_, j) => (
                    <svg
                      key={j}
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-gray-600 italic">
                  &quot;{t.text}&quot;
                </p>
                <p className="text-xs font-semibold text-gray-900 mt-2">
                  — {t.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section id="categorias" className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Categorias
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Encontre exatamente o que você procura
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                !activeCategory
                  ? "bg-rose-600 text-white shadow-lg"
                  : "bg-rose-50 text-rose-600 hover:bg-rose-100"
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
                  className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === cat
                      ? "bg-rose-600 text-white shadow-lg"
                      : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  }`}
                >
                  {emoji} {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section
        id="produtos"
        className="py-12 lg:py-16 bg-gradient-to-b from-white to-rose-50/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
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
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Compre em 3 Passos Rápidos
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Simples, rápido e seguro — sem complicação
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                desc: "Enviamos em até 24h após pagamento. Perto de SP? Frete grátis até 1km ou a partir de R$12!",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center p-6 bg-gradient-to-b from-rose-50 to-white rounded-2xl border border-rose-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-rose-600 text-white text-xs font-bold mb-3">
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
      <section className="py-16 bg-gradient-to-b from-rose-50/30 to-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Perguntas Frequentes
            </h2>
          </div>
          <div className="space-y-4">
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
                a: "Entregamos em São Paulo (frete grátis até 1km, a partir de R$12 localmente) e para todo o Brasil via transportadoras. Enviamos em até 24h após confirmação do pagamento!",
              },
              {
                q: "Como funciona a indicação de amigas?",
                a: "Compartilhe seu link de indicação com suas amigas. Quando elas fizerem a primeira compra, vocês duas ganham um cupom de desconto! Acesse Minha Conta → Indicar Amigas.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white rounded-xl border border-rose-100 hover:border-rose-200 transition-colors"
              >
                <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                  <span className="font-medium text-gray-900 text-sm">
                    {faq.q}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-rose-400 group-open:rotate-180 transition-transform"
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
          className="fixed bottom-6 right-6 z-40 md:hidden bg-gradient-to-r from-rose-500 to-pink-600 text-white p-4 rounded-full shadow-2xl pulse-glow flex items-center gap-2"
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
