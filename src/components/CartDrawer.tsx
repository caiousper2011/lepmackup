"use client";

import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import { useAuth } from "@/context/AuthContext";
import { useLoginModal } from "@/components/LoginModal";
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
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100/60">
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-[family-name:var(--font-heading)]">
              Seu Carrinho
            </h2>
            <p className="text-xs text-gray-500">
              {totalQuantity} {totalQuantity === 1 ? "item" : "itens"}
              {isBulkPricing && (
                <span className="text-berry-600 font-semibold ml-1">
                  • Desconto ativado!
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
            }}
            className="p-2 rounded-full hover:bg-blush-50 transition-colors"
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
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-medium text-amber-800">
                    🔥 Adicione mais {4 - totalQuantity}{" "}
                    {4 - totalQuantity === 1 ? "item" : "itens"} e pague apenas{" "}
                    <span className="font-bold text-berry-600">R$ 6,99</span>{" "}
                    cada!
                  </p>
                </div>
              )}

              {isBulkPricing && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-green-700">
                    ✅ Desconto ativado! Cada item por apenas R$ 6,99
                  </p>
                </div>
              )}

              {isAtLimit && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-medium text-rose-700">
                    Limite de {maxItemsPerOrder} itens por pedido atingido. Para
                    comprar mais itens, finalize este pedido e faça um novo.
                  </p>
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 bg-blush-50/50 rounded-xl p-3"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 relative">
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.shortName}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                      {item.product.shortName}
                    </h4>
                    <p className="text-xs text-gray-500">
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
                          className="w-6 h-6 rounded-full bg-white border border-rose-100/60 flex items-center justify-center text-berry-600 text-xs hover:bg-blush-50 transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
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
                          className={`w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs transition-colors ${
                            isAtLimit
                              ? "border-gray-200 text-gray-300 cursor-not-allowed"
                              : "border-rose-100/60 text-berry-600 hover:bg-blush-50"
                          }`}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-berry-600">
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
          <div className="border-t border-rose-100/60 px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-600">Total</span>
              <span className="text-xl font-bold text-berry-600">
                {formatPrice(totalPrice)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full gradient-cta text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.97] shadow-lg shadow-berry-600/20 hover:shadow-xl hover:shadow-berry-600/30"
            >
              Finalizar Compra
            </button>
            <p className="text-[10px] text-center text-gray-400 mt-2">
              Pagamento seguro via Mercado Pago
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
