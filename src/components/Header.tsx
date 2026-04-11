"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLoginModal } from "@/components/LoginModal";
import { useState, useRef, useEffect } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function Header() {
  const { totalQuantity, setIsOpen } = useCart();
  const { user, logout } = useAuth();
  const { open: openLogin } = useLoginModal();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setUserMenuOpen(false);
      }
      if (
        categoriesRef.current &&
        !categoriesRef.current.contains(e.target as Node)
      ) {
        setCategoriesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
          <nav
            aria-label="Principal"
            className="hidden md:flex items-center gap-8"
          >
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
            <div className="relative" ref={categoriesRef}>
              <button
                type="button"
                onClick={() => setCategoriesOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={categoriesOpen}
                className="text-sm font-medium text-gray-700 hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                Categorias
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`}
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
              </button>
              {categoriesOpen && (
                <div
                  role="menu"
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-56 bg-white rounded-xl shadow-xl border border-rose-100 py-2 z-50"
                >
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/categoria/${c.slug}`}
                      onClick={() => setCategoriesOpen(false)}
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      <span aria-hidden="true">{c.emoji}</span> {c.dbName}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/#promo"
              className="text-sm font-medium text-rose-600 hover:text-rose-700 transition-colors"
            >
              🔥 Promoção
            </Link>
          </nav>

          {/* User & Cart buttons */}
          <div className="flex items-center gap-2">
            {/* User menu */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2.5 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors group"
                  aria-label="Minha conta"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-rose-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/minha-conta"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Minha Conta
                    </Link>
                    <Link
                      href="/minha-conta/pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Meus Pedidos
                    </Link>
                    <Link
                      href="/minha-conta/indicacoes"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    >
                      Indicar Amigas
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openLogin()}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 text-sm font-medium transition-colors"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                Entrar
              </button>
            )}

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
          <nav
            aria-label="Mobile"
            className="md:hidden pb-4 border-t border-rose-50 pt-3 flex flex-col gap-3"
          >
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
            <div className="px-2 py-1">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">
                Categorias
              </p>
              <ul className="flex flex-col gap-1.5 pl-1">
                {CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/categoria/${c.slug}`}
                      onClick={() => setMobileOpen(false)}
                      className="text-sm font-medium text-gray-700 hover:text-rose-600"
                    >
                      <span aria-hidden="true">{c.emoji}</span> {c.dbName}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href="/#promo"
              onClick={() => setMobileOpen(false)}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 px-2 py-1"
            >
              🔥 Promoção
            </Link>
            {!user && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openLogin();
                }}
                className="text-sm font-medium text-rose-600 bg-rose-50 rounded-xl px-4 py-2.5 text-center hover:bg-rose-100 transition-colors"
              >
                Entrar / Criar Conta
              </button>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
