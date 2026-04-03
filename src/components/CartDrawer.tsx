"use client";

import {
  useCart,
  buildWhatsAppMessage,
  getWhatsAppURL,
} from "@/context/CartContext";
import { formatPrice } from "@/data/products";
import Image from "next/image";
import { useState } from "react";

export default function CartDrawer() {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalQuantity,
    unitPrice,
    totalPrice,
    isOpen,
    setIsOpen,
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<"pix" | "cartao">("pix");
  const [showCheckout, setShowCheckout] = useState(false);

  const handleCheckout = () => {
    const message = buildWhatsAppMessage(
      items,
      unitPrice,
      totalPrice,
      paymentMethod,
    );
    const url = getWhatsAppURL(message);
    window.open(url, "_blank", "noopener,noreferrer");
    clearCart();
    setIsOpen(false);
    setShowCheckout(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity"
        onClick={() => {
          setIsOpen(false);
          setShowCheckout(false);
        }}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Seu Carrinho</h2>
            <p className="text-xs text-gray-500">
              {totalQuantity} {totalQuantity === 1 ? "item" : "itens"}
              {totalQuantity >= 4 && (
                <span className="text-rose-600 font-semibold ml-1">
                  • Desconto ativado!
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              setShowCheckout(false);
            }}
            className="p-2 rounded-full hover:bg-rose-50 transition-colors"
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
              <div className="w-24 h-24 rounded-full bg-rose-50 flex items-center justify-center mb-4">
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
              {totalQuantity < 4 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-medium text-amber-800">
                    🔥 Adicione mais {4 - totalQuantity}{" "}
                    {4 - totalQuantity === 1 ? "item" : "itens"} e pague apenas{" "}
                    <span className="font-bold text-rose-600">R$ 6,99</span>{" "}
                    cada!
                  </p>
                </div>
              )}

              {totalQuantity >= 4 && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3 text-center">
                  <p className="text-xs font-semibold text-green-700">
                    ✅ Desconto ativado! Cada item por apenas R$ 6,99
                  </p>
                </div>
              )}

              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex gap-3 bg-rose-50/50 rounded-xl p-3"
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
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          className="w-6 h-6 rounded-full bg-white border border-rose-200 flex items-center justify-center text-rose-600 text-xs hover:bg-rose-50 transition-colors"
                        >
                          −
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          className="w-6 h-6 rounded-full bg-white border border-rose-200 flex items-center justify-center text-rose-600 text-xs hover:bg-rose-50 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-rose-600">
                          {formatPrice(item.quantity * unitPrice)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-gray-400 hover:text-rose-500 transition-colors"
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
          <div className="border-t border-rose-100 px-6 py-4">
            {!showCheckout ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Total</span>
                  <span className="text-xl font-bold text-rose-600">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg"
                >
                  Finalizar Compra
                </button>
              </>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Forma de Pagamento
                </h3>

                {/* Payment options */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setPaymentMethod("pix");
                      setInstallments(1);
                    }}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === "pix" ? "border-green-500 bg-green-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  >
                    <span className="text-lg">🟢</span>
                    <p className="text-xs font-semibold mt-1">PIX</p>
                    <p className="text-[10px] text-gray-500">
                      Pagamento instantâneo
                    </p>
                  </button>
                  <button
                    onClick={() => setPaymentMethod("cartao")}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === "cartao" ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  >
                    <span className="text-lg">💳</span>
                    <p className="text-xs font-semibold mt-1">Crédito</p>
                    <p className="text-[10px] text-gray-500">
                      À vista (link de pagamento)
                    </p>
                  </button>
                </div>

                {/* Credit card info */}
                {paymentMethod === "cartao" && (
                  <div className="bg-blue-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-blue-700 font-medium">
                      💳 O link de pagamento será enviado pelo WhatsApp
                    </p>
                  </div>
                )}

                {/* Summary */}
                <div className="bg-rose-50 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>
                      {totalQuantity} itens × {formatPrice(unitPrice)}
                    </span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-rose-700 pt-1 border-t border-rose-200">
                    <span>Total</span>
                    <span>{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* Checkout buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-all active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    Enviar Pedido
                  </button>
                </div>

                <p className="text-[10px] text-center text-gray-400">
                  O link de pagamento será enviado pelo WhatsApp
                </p>
              </div>
            )}
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
