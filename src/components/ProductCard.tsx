"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product, formatPrice } from "@/data/products";
import { useCart } from "@/context/CartContext";

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, getItemUnitPrice, totalQuantity, maxItemsPerOrder } = useCart();
  const [cartMessage, setCartMessage] = useState("");
  const currentPrice = getItemUnitPrice(product);
  const isOutOfStock = (product.stockQuantity ?? 0) <= 0;
  const isAtLimit = totalQuantity >= maxItemsPerOrder;

  const handleAddToCart = () => {
    const result = addToCart(product);
    setCartMessage(result.message || "");
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:shadow-berry-600/8 transition-all duration-300 border border-rose-100/60 overflow-hidden flex flex-col card-lift">
      {/* Image */}
      <div className="relative">
        <Link href={`/produto/${product.slug}`}>
          <div className="aspect-square overflow-hidden bg-gradient-to-br from-blush-50 to-rose-50 relative">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover group-hover:scale-108 transition-transform duration-500"
            />
            {/* Quick add overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-berry-800/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>

        {/* Discount badge */}
        <div className="absolute top-3 left-3 bg-gradient-to-r from-berry-600 to-rose-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg shadow-berry-600/30">
          {Math.round(
            ((product.originalPrice - product.promoPrice) /
              product.originalPrice) *
              100,
          )}
          % OFF
        </div>

        {/* Category badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-berry-600 text-[10px] font-medium px-2.5 py-1 rounded-full shadow-sm border border-rose-100/60">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 group-hover:text-berry-600 transition-colors mb-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-gray-400 mb-3">{product.brand}</p>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
            <span className="text-lg font-bold text-berry-600">
              {formatPrice(currentPrice)}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || isAtLimit}
            className="w-full gradient-cta text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-200 active:scale-[0.97] shadow-md shadow-berry-600/20 hover:shadow-lg hover:shadow-berry-600/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isOutOfStock
              ? "Indisponível"
              : isAtLimit
                ? `Limite de ${maxItemsPerOrder} itens`
                : "Adicionar ao Carrinho 🛍️"}
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
