"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ShareButton from "@/components/ShareButton";
import ProductCard from "@/components/ProductCard";

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
  categoryHref?: string;
  faqs?: { q: string; a: string }[];
}

export default function ProductDetail({
  product,
  relatedProducts,
  categoryHref,
  faqs,
}: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const {
    addToCart,
    totalQuantity,
    setIsOpen,
    getProductQuantityInCart,
    maxItemsPerOrder,
  } = useCart();

  const quantityInCart = getProductQuantityInCart(product.id);
  const stockLimit = Math.max(0, product.stockQuantity ?? 0);
  const productMaxPerOrder =
    typeof product.maxPerOrder === "number" && product.maxPerOrder > 0
      ? product.maxPerOrder
      : Number.MAX_SAFE_INTEGER;
  const hasProductLimit = productMaxPerOrder !== Number.MAX_SAFE_INTEGER;
  const remainingSlots = Math.max(0, maxItemsPerOrder - totalQuantity);
  const availableToAdd = Math.min(
    Math.max(0, stockLimit - quantityInCart),
    remainingSlots + quantityInCart,
    Math.max(0, productMaxPerOrder - quantityInCart),
  );
  const isOutOfStock = stockLimit <= 0;

  const willHaveBulk = totalQuantity + quantity >= 4;
  const currentPrice = willHaveBulk ? product.bulkPrice : product.promoPrice;
  const discount = Math.round(
    ((product.originalPrice - product.promoPrice) / product.originalPrice) *
      100,
  );

  const handleAddToCart = () => {
    const result = addToCart(product, quantity);
    if (!result.ok) {
      setCartMessage(
        result.message || "Não foi possível adicionar ao carrinho.",
      );
      return;
    }
    setCartMessage(result.message || "");
    setIsOpen(true);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const increaseQuantity = () => {
    if (totalQuantity + quantity >= maxItemsPerOrder) {
      setCartMessage(
        `Limite de ${maxItemsPerOrder} itens por pedido. Para comprar mais, faça um novo pedido.`,
      );
      return;
    }
    if (
      hasProductLimit &&
      quantityInCart + quantity >= productMaxPerOrder
    ) {
      setCartMessage(
        `Limite de ${productMaxPerOrder} ${
          productMaxPerOrder === 1 ? "unidade" : "unidades"
        } deste produto por pedido.`,
      );
      return;
    }
    if (quantity >= availableToAdd) {
      setCartMessage(
        "A quantidade adicionada ao carrinho foi ajustada ao limite de estoque disponível.",
      );
      return;
    }
    setCartMessage("");
    setQuantity((prev) => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-gray-500 mb-6"
      >
        <Link href="/" className="hover:text-berry-600 transition-colors">
          Início
        </Link>
        <span aria-hidden="true" className="text-rose-200">
          /
        </span>
        <Link
          href={categoryHref ?? "/#produtos"}
          className="hover:text-berry-600 transition-colors"
        >
          {product.category}
        </Link>
        <span aria-hidden="true" className="text-rose-200">
          /
        </span>
        <span className="text-gray-900 font-medium truncate">
          {product.shortName}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
        {/* Image gallery */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-square rounded-[32px] overflow-hidden bg-gradient-to-br from-blush-50 to-rose-50 relative shadow-[0_12px_28px_-8px_rgba(155,27,90,0.18)] border border-rose-100">
            <Image
              src={product.images[selectedImage]}
              alt={`${product.name} - Imagem ${selectedImage + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {/* Discount badge */}
            <div className="absolute top-5 left-5 z-10 inline-flex items-center rounded-full bg-linear-to-r from-berry-600 to-rose-500 px-4 py-2 text-xs font-black tracking-[0.04em] text-white shadow-[0_8px_20px_-6px_rgba(155,27,90,0.4)]">
              -{discount}% OFF
            </div>
            {/* Category pill */}
            <div className="absolute top-5 right-5 z-10 inline-flex items-center rounded-full border border-rose-200 bg-white/95 px-4 py-2 text-[11px] font-semibold text-berry-600 shadow-[0_8px_20px_-8px_rgba(155,27,90,0.22)] backdrop-blur-sm">
              {product.category}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === i
                      ? "border-berry-600 shadow-[0_8px_16px_-4px_rgba(155,27,90,0.18)] scale-105"
                      : "border-rose-100 opacity-70 hover:opacity-100 hover:border-rose-300"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Miniatura ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col">
          {/* Eyebrow */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500">
              {product.brand}
            </span>
            <span className="text-rose-200">·</span>
            <span className="text-[11px] font-semibold text-gray-500">
              {product.category}
            </span>
            {!isOutOfStock && (
              <span className="lp-badge-verified">✓ Pronta entrega</span>
            )}
          </div>

          <h1 className="font-[family-name:var(--font-heading)] font-black text-3xl sm:text-4xl lg:text-[44px] leading-[1.1] tracking-tight text-gray-900 mb-5">
            {product.name}
          </h1>

          {/* Price block */}
          <div className="lp-panel-soft rounded-[32px] p-6 sm:p-7 mb-6">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="lp-badge-discount">-{discount}% OFF</span>
              <span className="lp-badge-gold">🎁 Leve 4+ R$ 6,99</span>
              <span className="lp-badge-glass">💳 PIX · cartão · boleto</span>
            </div>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-sm text-gray-500 line-through font-medium">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="font-[family-name:var(--font-heading)] font-black text-4xl sm:text-5xl text-berry-600 tracking-tight leading-none">
                {formatPrice(currentPrice)}
              </span>
              <span className="text-[11px] font-black tracking-[0.04em] gradient-cta text-white px-3 py-[5px] rounded-full shadow-[0_4px_10px_-2px_rgba(155,27,90,0.4)]">
                -{discount}% OFF
              </span>
            </div>
            {willHaveBulk ? (
              <p className="text-xs text-green-700 font-semibold bg-green-50 inline-block px-3 py-1.5 rounded-full border border-green-200">
                ✅ Desconto de quantidade ativado!
              </p>
            ) : (
              <p className="text-xs text-berry-700 font-semibold leading-relaxed">
                🔥 Adicione{" "}
                {4 - totalQuantity - quantity > 0
                  ? 4 - totalQuantity - quantity
                  : 0}{" "}
                itens a mais e pague R$ 6,99 cada!
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed mb-6 text-[15px] sm:text-base">
            {product.description}
          </p>

          {/* Details */}
          <div className="mb-6">
            <h3 className="font-bold font-[family-name:var(--font-heading)] text-gray-900 mb-3 text-base">
              Características
            </h3>
            <ul className="space-y-2">
              {product.details.map((detail, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2.5 text-[14px] text-gray-700"
                >
                  <span className="mt-[3px] flex-shrink-0 w-4 h-4 rounded-full gradient-cta flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-2.5 w-2.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity & Add to cart */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-3">
            <div className="flex items-center overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-[0_8px_18px_-12px_rgba(155,27,90,0.18)]">
              <button
                onClick={decreaseQuantity}
                aria-label="Diminuir quantidade"
                className="inline-flex h-11 w-11 items-center justify-center bg-white text-[22px] font-black leading-none text-berry-600 transition-colors hover:bg-rose-50 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 disabled:text-rose-200"
              >
                −
              </button>
              <span className="flex h-11 w-12 items-center justify-center border-x border-rose-200 bg-rose-50/40 font-bold text-gray-900">
                {quantity}
              </span>
              <button
                onClick={increaseQuantity}
                disabled={isOutOfStock || quantity >= availableToAdd}
                aria-label="Aumentar quantidade"
                className="inline-flex h-11 w-11 items-center justify-center bg-white text-[22px] font-black leading-none text-berry-600 transition-colors hover:bg-rose-50 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-200 disabled:cursor-not-allowed disabled:text-rose-200 disabled:hover:bg-white"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || availableToAdd <= 0}
              className="lp-btn-primary flex-1 text-sm sm:text-base disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isOutOfStock
                ? "Produto indisponível"
                : `Adicionar — ${formatPrice(quantity * currentPrice)}`}
            </button>
          </div>
          {cartMessage && (
            <p className="text-xs text-amber-700 mb-4">{cartMessage}</p>
          )}

          {/* Share */}
          <div className="flex items-center gap-3 mt-2">
            <ShareButton
              title={product.name}
              text="Olha esse produto incrível por apenas R$ 7,99!"
              url={
                typeof window !== "undefined"
                  ? window.location.href
                  : `/produto/${product.slug}`
              }
            />
          </div>

          {/* Trust pills */}
          <div className="grid grid-cols-2 gap-2.5 mt-7 pt-6 border-t border-rose-100">
            {[
              { icon: "🔒", label: "Compra segura · Mercado Pago" },
              { icon: "💳", label: "PIX, cartão ou boleto" },
              { icon: "🚚", label: "Frete em 24h em SP" },
              { icon: "💬", label: "WhatsApp 9h-18h" },
            ].map((t, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-[12px] text-gray-700 bg-white border border-rose-100 rounded-2xl px-3 py-3 shadow-[0_2px_6px_rgba(155,27,90,0.06)]"
              >
                <span className="text-base">{t.icon}</span>
                <span className="font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ específica do produto */}
      {faqs && faqs.length > 0 && (
        <section
          aria-labelledby="produto-faq-titulo"
          className="mt-16 lg:mt-20 pt-12 border-t border-rose-100 max-w-3xl mx-auto"
        >
          <div className="text-center mb-8">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5">
              Dúvidas comuns
            </p>
            <h2
              id="produto-faq-titulo"
              className="font-[family-name:var(--font-heading)] font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight"
            >
              Perguntas frequentes sobre{" "}
              <em className="italic font-medium bg-gradient-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                {product.shortName}
              </em>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
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
                    className="h-5 w-5 text-berry-600 group-open:rotate-180 transition-transform flex-shrink-0"
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
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 lg:mt-20 pt-12 border-t border-rose-100">
          <div className="text-center mb-8">
            <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5">
              Combinam com este
            </p>
            <h2 className="font-[family-name:var(--font-heading)] font-extrabold text-2xl sm:text-3xl lg:text-4xl text-gray-900 tracking-tight">
              Produtos{" "}
              <em className="italic font-medium bg-gradient-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                Relacionados
              </em>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
