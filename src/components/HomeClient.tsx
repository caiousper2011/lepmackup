"use client";

import { useState } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

interface HomeClientProps {
  products: Product[];
  categories: string[];
}

export default function HomeClient({ products, categories }: HomeClientProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { setIsOpen, totalQuantity } = useCart();

  const filtered = activeCategory
    ? products.filter((p) => p.category === activeCategory)
    : products;

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50">
        {/* Decorative blobs */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-rose-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-100/20 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-5 py-2 mb-6 shadow-sm border border-rose-100">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-semibold text-gray-700">
                MEGA PROMOÇÃO ATIVA
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-rose-600 via-pink-600 to-fuchsia-600 bg-clip-text text-transparent">
                Maquiagem Profissional
              </span>
              <br />
              <span className="text-gray-900">por preços incríveis</span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-xl mx-auto leading-relaxed">
              Todos os produtos por apenas{" "}
              <span className="font-bold text-rose-600 text-2xl">R$ 7,99</span>.
              Leve 4 ou mais e pague só{" "}
              <span className="font-bold text-rose-600 text-2xl">R$ 6,99</span>{" "}
              cada!
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#produtos"
                className="w-full sm:w-auto bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 text-lg"
              >
                Ver Produtos
              </a>
              <a
                href="https://wa.me/5511970196558"
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
                Fale Conosco
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
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
                Compra Segura
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-rose-500"
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
                Resposta Rápida via WhatsApp
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.957z"
                  />
                </svg>
                Qualidade Profissional
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
                🔥 Promoção Especial
              </h2>
              <p className="text-rose-100 text-sm mt-1">
                Todos os produtos por R$ 7,99 — Acima de 4 itens: R$ 6,99 cada!
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
              Como Funciona
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              Compre em 3 passos simples
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                icon: "🛒",
                title: "Escolha seus produtos",
                desc: "Navegue pelo catálogo e adicione ao carrinho. Leve 4+ itens e pague R$ 6,99 cada!",
              },
              {
                step: "2",
                icon: "📱",
                title: "Finalize via WhatsApp",
                desc: "Revise o carrinho, escolha PIX ou cartão, e envie o pedido diretamente para nosso WhatsApp.",
              },
              {
                step: "3",
                icon: "💳",
                title: "Receba o link de pagamento",
                desc: "Enviaremos o link de pagamento seguro pelo WhatsApp. Pague e pronto!",
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
                a: "Adicione os produtos ao carrinho, clique em Finalizar Compra, escolha a forma de pagamento e envie o pedido para nosso WhatsApp. Enviaremos o link de pagamento na hora!",
              },
              {
                q: "Quais formas de pagamento vocês aceitam?",
                a: "PIX (pagamento instantâneo) e Cartão de Crédito (com opção de parcelamento). O link de pagamento seguro é enviado pelo WhatsApp.",
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
                a: "Após confirmação do pagamento, combinamos a entrega diretamente pelo WhatsApp, garantindo praticidade e agilidade.",
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
