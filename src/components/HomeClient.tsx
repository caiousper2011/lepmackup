"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ContactFormSection from "@/components/ContactFormSection";

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
    <div className="flex items-center gap-1.5">
      {[
        { value: display.hours, label: "h" },
        { value: display.minutes, label: "m" },
        { value: display.seconds, label: "s" },
      ].map((t, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="bg-gradient-to-br from-rose-500 to-pink-600 text-white font-mono font-black text-2xl sm:text-3xl w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-lg shadow-rose-600/40">
            {String(t.value).padStart(2, "0")}
          </span>
          <span className="text-xs font-bold text-rose-600 mt-1">{t.label}</span>
        </div>
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
      {/* OFERTA RELÂMPAGO URGENCY BAR - Extremamente agressivo */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white py-3 px-4 text-center text-xs sm:text-sm font-black shadow-2xl shadow-rose-600/50">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <span className="animate-bounce">⚡</span>
          <span>OFERTA RELÂMPAGO AGORA</span>
          <span>|</span>
          <span className="text-gold-300">-63% EM TUDO</span>
          <span>|</span>
          <span className="animate-pulse">📦 ESTOQUES ACABANDO</span>
          <span className="animate-bounce">⚡</span>
        </div>
      </div>

      {/* ULTRA HERO SECTION - Bold & Feminine */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50 to-white pt-8 pb-12 sm:pt-12 sm:pb-16">
        {/* Animated background blobs */}
        <div className="absolute top-0 left-5% w-96 h-96 bg-gradient-to-br from-rose-200/40 to-pink-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-5% w-80 h-80 bg-gradient-to-tl from-purple-200/30 to-pink-100/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/3 right-20 w-64 h-64 bg-gradient-to-bl from-gold-100/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* MEGA HEADLINE */}
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-4 leading-tight font-[family-name:var(--font-heading)]">
              <span className="block">Maquiagem Profissional</span>
              <span className="block bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Por Preços Imbatíveis
              </span>
            </h1>

            {/* PRICE HIGHLIGHT */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              <span className="text-base sm:text-xl text-gray-600 line-through">
                De R$18,99
              </span>
              <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                R$ 6,99
              </span>
              <span className="text-sm sm:text-base font-bold bg-gold-400 text-rose-900 px-3 py-1 rounded-full animate-bounce">
                -63% OFF
              </span>
            </div>

            <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-2xl mx-auto font-medium">
              Leve <span className="font-black text-rose-600">4+ itens</span> e pague ainda <span className="font-black text-rose-600">menos</span>
            </p>

            {/* BIG COUNTDOWN */}
            <div className="mb-8 p-6 bg-white/80 backdrop-blur-lg rounded-3xl border-2 border-rose-200 shadow-2xl shadow-rose-200/50 w-fit mx-auto">
              <p className="text-xs sm:text-sm text-gray-600 font-bold mb-3 uppercase tracking-wider">⏰ Oferta termina em:</p>
              <CountdownTimer />
            </div>

            {/* TRUST BADGES - Right under hero */}
            <div className="mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full border border-green-200">
                <span className="text-2xl">✓</span>
                <span className="text-sm font-semibold text-gray-700">100% Seguro</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full border border-blue-200">
                <span className="text-2xl">🚚</span>
                <span className="text-sm font-semibold text-gray-700">Entrega 24h</span>
              </div>
              <div className="flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full border border-purple-200">
                <span className="text-2xl">↩️</span>
                <span className="text-sm font-semibold text-gray-700">Devolução 30d</span>
              </div>
            </div>

            {/* BUTTONS CONTAINER */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 items-center justify-center mt-8">
              {/* PRIMARY CTA - HUGE */}
              <a
                href="#produtos"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black px-8 sm:px-12 py-5 rounded-2xl shadow-2xl shadow-rose-600/40 hover:shadow-2xl hover:shadow-rose-600/60 transition-all transform hover:scale-105 active:scale-95 text-lg sm:text-xl w-full sm:w-auto justify-center"
              >
                <span>Ver Oferta Especial</span>
                <span className="text-2xl animate-pulse">→</span>
              </a>

              {/* SHOPEE BUTTON */}
              <a
                href="https://shopee.com.br/leticia.guardian?entryPoint=ShopByPDP&tab=product"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-white font-bold px-7 sm:px-8 py-5 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center"
                style={{ backgroundColor: "#EE4D2D" }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#D63D1A"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#EE4D2D"}
              >
                <svg className="w-6 h-6" viewBox="0 0 100 100" fill="currentColor">
                  <path d="M50 10C27.91 10 10 27.91 10 50s17.91 40 40 40 40-17.91 40-40S72.09 10 50 10zm15 35c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-30 0c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm15 20c-8 0-14.4-2.5-14.4-6h28.8c0 3.5-6.4 6-14.4 6z"/>
                </svg>
                <span>Nossa loja Shopee</span>
              </a>
            </div>

            {/* SOCIAL PROOF - Stars & Testimonial Count */}
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-2xl">⭐</span>
                ))}
              </div>
              <p className="text-gray-700 font-semibold">
                <span className="text-rose-600 font-black">4.9/5</span> — <span className="text-gray-600">+500 clientes</span>
              </p>
              <p className="text-xs text-gray-500">
                ✓ Pagamento 100% Seguro | ✓ Entrega Rastreada | ✓ Suporte 24/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES - Modern Pills */}
      <section className="py-8 bg-white border-b-2 border-rose-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-bold text-gray-600 uppercase tracking-wider mb-5">
            Encontre o que você procura
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                !activeCategory
                  ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/40"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-2 border-rose-200"
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
                  className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-600/40"
                      : "bg-rose-50 text-rose-700 hover:bg-rose-100 border-2 border-rose-200"
                  }`}
                >
                  {emoji} {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTS GRID - FEATURED SECTION */}
      <section
        id="produtos"
        className="py-16 lg:py-20 bg-gradient-to-b from-white via-rose-50/30 to-white"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-xs font-black mb-4 shadow-lg">
              ⚡ OFERTA RELÂMPAGO
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 mb-3 font-[family-name:var(--font-heading)]">
              {activeCategory
                ? `${activeCategory} — Exclusivo da Promoção`
                : "Maquiagem Premium Agora em Oferta"}
            </h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Apenas <span className="font-black text-rose-600">{filtered.length}</span> produtos disponíveis nesta categoria
              <br />
              <span className="text-sm text-gold-600 font-bold">
                Compre 4+ e economize ainda mais! 🎁
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* CTA BUTTON - AFTER PRODUCTS */}
          <div className="text-center mt-12">
            <a
              href="#checkout"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black px-10 py-4 rounded-2xl shadow-2xl shadow-rose-600/40 hover:shadow-2xl hover:shadow-rose-600/60 transition-all transform hover:scale-105 active:scale-95 text-lg"
            >
              Comprar Agora com Desconto
              <span className="text-xl">→</span>
            </a>
          </div>
        </div>
      </section>

      {/* TRUST & SECURITY SECTION - Build confidence */}
      <section className="py-14 bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-black text-center mb-10">
            Compre com Total Segurança 🔒
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: "🔐",
                title: "Pagamento Seguro",
                desc: "Mercado Pago com criptografia SSL 256-bit. Seus dados 100% protegidos.",
              },
              {
                icon: "✓",
                title: "Garantia 30 Dias",
                desc: "Não gostou? Devolva e receba seu dinheiro de volta.",
              },
              {
                icon: "🚚",
                title: "Entrega Rastreada",
                desc: "Acompanhe seu pedido em tempo real de SP até sua casa.",
              },
              {
                icon: "💬",
                title: "Suporte 24/7",
                desc: "Chat ao vivo, WhatsApp e email. Sempre pronto para ajudar.",
              },
            ].map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 text-center hover:bg-white/15 transition-all">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-black mb-2">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW TO BUY - SIMPLIFIED */}
      <section className="py-14 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-12 text-gray-900">
            Compre em 3 Passos Simples
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                num: "1",
                emoji: "🛍️",
                title: "Escolha seus Produtos",
                desc: "Navegue pelas categorias e adicione ao carrinho. Leve 4+ para melhor preço!",
              },
              {
                num: "2",
                emoji: "💳",
                title: "Pague com Segurança",
                desc: "PIX, Cartão ou Boleto via Mercado Pago. Pronto em segundos!",
              },
              {
                num: "3",
                emoji: "📦",
                title: "Receba em Casa",
                desc: "Entregamos em até 24h em SP. Brasil inteiro em 3-7 dias.",
              },
            ].map((item) => (
              <div key={item.num} className="relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-full flex items-center justify-center font-black text-sm">
                  {item.num}
                </div>
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-8 rounded-2xl border-2 border-rose-200 text-center h-full">
                  <div className="text-5xl mb-4">{item.emoji}</div>
                  <h3 className="font-black text-lg text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - HIGHLY VISIBLE */}
      <section className="py-16 bg-gradient-to-b from-rose-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-black text-center mb-4 text-gray-900">
            Milhares de Clientes Satisfeitas 💕
          </h2>
          <p className="text-center text-gray-600 font-semibold mb-12">
            Veja por que 500+ mulheres confiam em nós
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                className="bg-white p-6 rounded-2xl border-2 border-rose-200 hover:border-rose-400 hover:shadow-lg hover:shadow-rose-200/50 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-black text-gray-900">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.city}</p>
                  </div>
                  {review.verified && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                      ✓ Verificada
                    </span>
                  )}
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array(review.stars)
                    .fill(0)
                    .map((_, j) => (
                      <span key={j} className="text-lg">⭐</span>
                    ))}
                </div>
                <p className="text-gray-700 text-sm italic">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ - Quick answers */}
      <section className="py-14 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-black text-center text-gray-900 mb-10">
            Dúvidas? Respondemos Aqui ✨
          </h2>
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
                className="group bg-white border-2 border-rose-200 rounded-xl hover:border-rose-400 hover:shadow-md transition-all"
              >
                <summary className="flex items-center gap-3 p-5 cursor-pointer font-bold text-gray-900 text-sm">
                  <span className="text-rose-600 group-open:rotate-90 transition-transform">→</span>
                  {faq.q}
                </summary>
                <div className="px-5 pb-5 text-gray-700 text-sm border-t border-rose-100">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA - Don't miss out */}
      <section className="py-14 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-black mb-4">
            Não deixe para depois! 🔥
          </h2>
          <p className="text-lg mb-8 text-rose-100">
            A oferta termina em poucas horas. Preço normal volta depois.
          </p>
          <a
            href="#produtos"
            className="inline-flex items-center gap-2 bg-white text-rose-600 font-black px-12 py-5 rounded-2xl shadow-2xl hover:shadow-2xl hover:bg-rose-50 transition-all transform hover:scale-105 active:scale-95 text-lg"
          >
            <span>Aproveitar Oferta Agora</span>
            <span className="text-2xl">🚀</span>
          </a>
        </div>
      </section>

      {/* Contact Form Section */}
      <ContactFormSection />

      {/* Floating cart button (mobile) */}
      {totalQuantity > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 md:hidden bg-gradient-to-r from-rose-600 to-pink-600 text-white p-4 rounded-full shadow-2xl shadow-rose-600/50 flex items-center gap-2 active:scale-95 transition-transform font-bold hover:shadow-2xl hover:shadow-rose-600/70"
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
