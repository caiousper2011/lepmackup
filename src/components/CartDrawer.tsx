"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useLoginModal } from "@/components/LoginModal";
import FreeShippingProgress from "@/components/FreeShippingProgress";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalQuantity,
    getItemUnitPrice,
    totalPrice,
    isBulkPricing,
    isOpen,
    setIsOpen,
    maxItemsPerOrder,
  } = useCart();

  const isAtLimit = totalQuantity >= maxItemsPerOrder;

  const { user } = useAuth();
  const { open: openLogin } = useLoginModal();
  const router = useRouter();
  const [cartMessage, setCartMessage] = useState("");

  const handleCheckout = () => {
    setIsOpen(false);
    if (!user) {
      openLogin("/checkout");
      return;
    }
    router.push("/checkout");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => {
          setIsOpen(false);
        }}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#fffaf8] border-l border-rose-100 z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-rose-100 bg-white/95 backdrop-blur-xl">
          <div>
            <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gold-500">
              Seu carrinho
            </p>
            <h2 className="text-xl font-extrabold text-gray-900 font-[family-name:var(--font-heading)] leading-tight">
              {totalQuantity} {totalQuantity === 1 ? "item" : "itens"}
              {isBulkPricing && (
                <span className="ml-2 text-[11px] font-bold tracking-wide text-berry-600">
                  · Desconto ativado!
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className="lp-icon-btn"
            aria-label="Fechar carrinho"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Free shipping progress */}
        {items.length > 0 && (
          <div className="px-6 pt-4">
            <FreeShippingProgress subtotal={totalPrice} variant="drawer" />
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 rounded-full bg-blush-50 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-rose-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-700 mb-1">
                Carrinho vazio
              </h3>
              <p className="text-sm text-gray-500">
                Adicione produtos incríveis por apenas R$ 7,99!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Bulk discount banner */}
              {cartMessage && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-medium text-amber-800">
                    {cartMessage}
                  </p>
                </div>
              )}

              {!isBulkPricing && (
                <div className="gradient-berry-soft border border-rose-100 rounded-2xl p-3.5 text-center">
                  <p className="text-[12px] font-medium text-berry-700">
                    🔥 Adicione mais {4 - totalQuantity}{" "}
                    {4 - totalQuantity === 1 ? "item" : "itens"} e pague apenas{" "}
                    <span className="font-black text-berry-600">R$ 6,99</span>{" "}
                    cada!
                  </p>
                </div>
              )}

              {isBulkPricing && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-3.5 text-center">
                  <p className="text-[12px] font-semibold text-green-700">
                    ✅ Desconto ativado! Cada item por apenas R$ 6,99
                  </p>
                </div>
              )}

              {isAtLimit && (
                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 text-center">
                  <p className="text-[12px] font-medium text-rose-700">
                    Limite de {maxItemsPerOrder} itens atingido. Finalize este
                    pedido e faça um novo.
                  </p>
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 bg-white border border-rose-100 rounded-2xl p-3 shadow-[0_2px_6px_rgba(155,27,90,0.06)]"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 relative bg-gradient-to-br from-blush-50 to-rose-50 border border-rose-100">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.shortName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 truncate">
                      {item.product.shortName}
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      {item.product.brand}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            const result = updateQuantity(
                              item.product.id,
                              item.quantity - 1,
                            );
                            if (result.message) setCartMessage(result.message);
                          }}
                          className="w-7 h-7 rounded-full bg-white border border-rose-100 flex items-center justify-center text-berry-600 text-sm font-bold hover:border-berry-300 hover:bg-blush-50 transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-bold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => {
                            const result = updateQuantity(
                              item.product.id,
                              item.quantity + 1,
                            );
                            if (result.message) setCartMessage(result.message);
                          }}
                          disabled={isAtLimit}
                          className={`w-7 h-7 rounded-full bg-white border flex items-center justify-center text-sm font-bold transition-colors ${
                            isAtLimit
                              ? "border-rose-100 text-gray-300 cursor-not-allowed"
                              : "border-rose-100 text-berry-600 hover:border-berry-300 hover:bg-blush-50"
                          }`}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-[family-name:var(--font-heading)] font-black text-base text-berry-600 tracking-tight">
                          {formatPrice(
                            item.quantity * getItemUnitPrice(item.product),
                          )}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-berry-600 transition-colors"
                          aria-label="Remover item"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Checkout */}
        {items.length > 0 && (
          <div className="border-t border-rose-100 px-6 py-5 bg-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500">
                Total
              </span>
              <span className="font-[family-name:var(--font-heading)] font-black text-2xl text-berry-600 tracking-tight">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button onClick={handleCheckout} className="lp-btn-primary w-full">
              Finalizar Compra
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-3 inline-flex items-center justify-center w-full gap-1">
              <span>🔒</span>
              <span>Pagamento seguro via Mercado Pago</span>
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
