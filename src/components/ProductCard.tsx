"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";
import ViewerCounter from "@/components/ViewerCounter";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, getItemUnitPrice, totalQuantity, maxItemsPerOrder } =
    useCart();
  const [cartMessage, setCartMessage] = useState("");
  const currentPrice = getItemUnitPrice(product);
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;
  const isAtLimit = totalQuantity >= maxItemsPerOrder;

  const discountPercent = Math.round(
    ((product.originalPrice - product.promoPrice) / product.originalPrice) *
      100,
  );

  const handleAddToCart = () => {
    const result = addToCart(product);
    setCartMessage(result.message || "");
  };

  return (
    <div className="group bg-white rounded-3xl border-2 border-rose-100 hover:border-rose-300 shadow-[0_2px_6px_rgba(155,27,90,0.06)] hover:shadow-[0_12px_28px_-8px_rgba(155,27,90,0.18)] transition-all duration-300 overflow-hidden flex flex-col card-lift">
      <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-3 bg-white">
        <span className="inline-flex items-center rounded-full bg-linear-to-r from-berry-600 to-rose-500 px-3 py-1.5 text-[11px] font-black tracking-[0.04em] text-white shadow-[0_6px_16px_-4px_rgba(155,27,90,0.35)]">
          -{discountPercent}% OFF
        </span>
        <span className="inline-flex max-w-[52%] items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-[11px] font-semibold text-berry-600 shadow-[0_4px_10px_-4px_rgba(155,27,90,0.18)] truncate">
          {product.category}
        </span>
      </div>

      {/* Image */}
      <div className="relative">
        <Link href={`/produto/${product.slug}`} className="block">
          <div className="aspect-square overflow-hidden bg-linear-to-br from-blush-50 to-rose-50 relative">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
              <ViewerCounter productId={product.id} variant="compact" />
            </div>
          </div>
        </Link>
      </div>

      {/* Body */}
      <div className="px-5 pt-4.5 pb-5 flex flex-col flex-1">
        {/* Mini badges */}
        <div className="flex gap-1.5 mb-2.5 flex-wrap">
          <span className="lp-badge-flash text-[10px]">⚡ OFERTA</span>
          <span className="lp-badge-stock text-[10px]">
            📦 Estoque limitado
          </span>
        </div>

        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-semibold text-sm text-gray-900 leading-snug line-clamp-2 group-hover:text-berry-600 transition-colors mb-1 min-h-[2.4rem]">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] text-gray-400 mb-3.5">{product.brand}</p>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3.5">
            <span className="text-[11px] text-gray-400 line-through font-medium">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="font-heading font-black text-[22px] sm:text-[24px] text-berry-600 leading-none tracking-tight">
              {formatPrice(currentPrice)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAtLimit}
            className="w-full min-h-11 px-3 gradient-cta text-white text-[13px] font-bold leading-tight rounded-xl transition-all duration-200 active:scale-[0.97] shadow-[0_6px_16px_-4px_rgba(225,29,72,0.4)] hover:shadow-[0_8px_20px_-4px_rgba(225,29,72,0.55)] disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center text-center"
          >
            {isOutOfStock
              ? "Indisponível"
              : isAtLimit
                ? `Limite de ${maxItemsPerOrder} itens`
                : "Adicionar ao Carrinho"}
          </button>
          {isAtLimit && !isOutOfStock && (
            <p className="text-[11px] text-berry-600 mt-2">
              Para comprar mais itens, finalize seu pedido atual e faça um novo.
            </p>
          )}
          {cartMessage && !isAtLimit && (
            <p className="text-[11px] text-amber-700 mt-2">{cartMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
}
