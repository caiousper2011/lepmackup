"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useState } from "react";

export default function Header() {
  const { totalQuantity, setIsOpen } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-rose-100">
      {/* Promo banner */}
      <div className="shimmer-bg text-white text-center py-1.5 text-xs font-semibold tracking-wide">
        🔥 MEGA PROMOÇÃO — Todos os produtos por R$ 7,99 | Acima de 4 itens: R$
        6,99 cada! 🔥
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <span className="text-white font-bold text-sm">L&P</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                L&PMakeUp
              </span>
              <span className="text-[10px] text-rose-400 -mt-1 tracking-widest uppercase">
                Beauty Store
              </span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
            >
              Início
            </Link>
            <Link
              href="/#produtos"
              className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
            >
              Produtos
            </Link>
            <Link
              href="/#categorias"
              className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors"
            >
              Categorias
            </Link>
            <Link
              href="/#promo"
              className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              🔥 Promoção
            </Link>
          </nav>

          {/* Cart button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors group"
              aria-label="Abrir carrinho"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-rose-600 group-hover:scale-110 transition-transform"
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
              {totalQuantity > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center pulse-glow">
                  {totalQuantity}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-rose-50 transition-colors"
              aria-label="Menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="md:hidden pb-4 border-t border-rose-50 pt-3 flex flex-col gap-3">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-rose-600 px-2 py-1"
            >
              Início
            </Link>
            <Link
              href="/#produtos"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-rose-600 px-2 py-1"
            >
              Produtos
            </Link>
            <Link
              href="/#categorias"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-gray-700 hover:text-rose-600 px-2 py-1"
            >
              Categorias
            </Link>
            <Link
              href="/#promo"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 px-2 py-1"
            >
              🔥 Promoção
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
