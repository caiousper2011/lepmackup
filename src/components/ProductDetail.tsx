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
  const remainingSlots = Math.max(0, maxItemsPerOrder - totalQuantity);
  const availableToAdd = Math.min(
    Math.max(0, stockLimit - quantityInCart),
    remainingSlots + quantityInCart,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center gap-2 text-sm text-gray-500 mb-6"
      >
        <Link href="/" className="hover:text-berry-600 transition-colors">
          Início
        </Link>
        <span aria-hidden="true">/</span>
        <Link
          href={categoryHref ?? "/#categorias"}
          className="hover:text-berry-600 transition-colors"
        >
          {product.category}
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-gray-900 font-medium truncate">
          {product.shortName}
        </span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image gallery */}
        <div className="space-y-4">
          {/* Main image */}
          <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-blush-50 to-nude-50 relative shadow-lg shadow-berry-600/5">
            <Image
              src={product.images[selectedImage]}
              alt={`${product.name} - Imagem ${selectedImage + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
            {/* Discount badge */}
            <div className="absolute top-4 left-4 bg-gradient-to-r from-berry-600 to-rose-500 text-white text-sm font-bold px-3 py-1.5 rounded-full shadow-lg shadow-berry-600/25">
              {discount}% OFF
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                    selectedImage === i
                      ? "border-berry-600 shadow-md scale-105"
                      : "border-transparent opacity-70 hover:opacity-100"
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
          {/* Category & Brand */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-blush-50 text-berry-600 text-xs font-medium px-3 py-1 rounded-full border border-rose-100/60">
              {product.category}
            </span>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500">{product.brand}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight font-[family-name:var(--font-heading)]">
            {product.name}
          </h1>

          {/* Price section */}
          <div className="bg-gradient-to-r from-blush-50 to-nude-50 rounded-2xl p-5 mb-6 border border-rose-100/60">
            <div className="flex items-end gap-3 mb-2">
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
              <span className="text-3xl font-extrabold text-berry-600">
                {formatPrice(currentPrice)}
              </span>
            </div>
            {willHaveBulk ? (
              <p className="text-xs text-green-700 font-semibold bg-green-50 inline-block px-3 py-1 rounded-full">
                ✅ Desconto de quantidade ativado!
              </p>
            ) : (
              <p className="text-xs text-amber-700 font-medium">
                🔥 Adicione{" "}
                {4 - totalQuantity - quantity > 0
                  ? 4 - totalQuantity - quantity
                  : 0}{" "}
                itens a mais para pagar R$ 6,99 cada!
              </p>
            )}
          </div>

          {/* Description */}
          <p className="text-gray-700 leading-relaxed mb-6">
            {product.description}
          </p>

          {/* Details */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">
              Características
            </h3>
            <ul className="space-y-2">
              {product.details.map((detail, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 text-sm text-gray-600"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-berry-600 mt-0.5 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {detail}
                </li>
              ))}
            </ul>
          </div>

          {/* Quantity & Add to cart */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center border border-rose-100/60 rounded-xl overflow-hidden">
              <button
                onClick={decreaseQuantity}
                className="w-10 h-10 flex items-center justify-center text-berry-600 hover:bg-blush-50 transition-colors text-lg"
              >
                −
              </button>
              <span className="w-12 h-10 flex items-center justify-center font-semibold text-gray-900 border-x border-rose-100/60">
                {quantity}
              </span>
              <button
                onClick={increaseQuantity}
                disabled={isOutOfStock || quantity >= availableToAdd}
                className="w-10 h-10 flex items-center justify-center text-berry-600 hover:bg-blush-50 transition-colors text-lg"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || availableToAdd <= 0}
              className="flex-1 gradient-cta text-white font-bold py-3 rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-berry-600/20 hover:shadow-xl hover:shadow-berry-600/30 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isOutOfStock
                ? "Produto indisponível"
                : `Adicionar ao Carrinho — ${formatPrice(quantity * currentPrice)}`}
            </button>
          </div>
          {cartMessage && (
            <p className="text-xs text-amber-700 mb-4">{cartMessage}</p>
          )}

          {/* Share */}
          <div className="flex items-center gap-3">
            <ShareButton
              title={product.name}
              text={`Olha esse produto incrível por apenas R$ 7,99!`}
              url={
                typeof window !== "undefined"
                  ? window.location.href
                  : `/produto/${product.slug}`
              }
            />
          </div>

          {/* Badges */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-rose-100/60">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-green-500"
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
              Compra segura
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
              PIX ou Cartão
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-amber-500"
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
              Qualidade profissional
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-berry-600"
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
              Resposta rápida
            </div>
          </div>
        </div>
      </div>

      {/* FAQ específica do produto — Featured Snippets + GEO/IA */}
      {faqs && faqs.length > 0 && (
        <section
          aria-labelledby="produto-faq-titulo"
          className="mt-16 pt-12 border-t border-rose-100/60 max-w-3xl mx-auto"
        >
          <h2
            id="produto-faq-titulo"
            className="text-xl sm:text-2xl font-bold text-gray-900 text-center mb-6 font-[family-name:var(--font-heading)]"
          >
            Perguntas frequentes sobre {product.shortName}
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
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
        </section>
      )}

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 pt-12 border-t border-rose-100/60">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center font-[family-name:var(--font-heading)]">
            Produtos Relacionados
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
