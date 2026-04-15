"use client";

import Link from "next/link";
import Image from "next/image";
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
  const [scrolled, setScrolled] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 10);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-berry-600/5"
          : "bg-white/80 backdrop-blur-xl"
      } border-b border-rose-100/60`}
    >
      {/* Promo banner */}
      <div className="shimmer-bg text-white text-center py-2 text-xs font-semibold tracking-wide">
        <span className="inline-flex items-center gap-1.5">
          <span className="animate-pulse">✨</span>
          MEGA PROMOÇÃO — Todos por R$ 7,99 | Acima de 4 itens: R$ 6,99 cada!
          <span className="animate-pulse">✨</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-lg ring-2 ring-rose-200/50 group-hover:ring-berry-600/30 transition-all group-hover:scale-105">
              <Image
                src="/favicon.png"
                alt="L&PMakeUp"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold font-[family-name:var(--font-heading)] bg-gradient-to-r from-berry-600 to-rose-500 bg-clip-text text-transparent">
                L&PMakeUp
              </span>
              <span className="text-[10px] text-gold-500 -mt-1 tracking-[0.2em] uppercase font-medium">
                Beauty Store
              </span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav
            aria-label="Principal"
            className="hidden md:flex items-center gap-1"
          >
            <Link
              href="/"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-berry-600 hover:bg-rose-50/60 transition-all"
            >
              Início
            </Link>
            <Link
              href="/#produtos"
              className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-berry-600 hover:bg-rose-50/60 transition-all"
            >
              Produtos
            </Link>
            <div className="relative" ref={categoriesRef}>
              <button
                type="button"
                onClick={() => setCategoriesOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={categoriesOpen}
                className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-berry-600 hover:bg-rose-50/60 transition-all flex items-center gap-1"
              >
                Categorias
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-3.5 w-3.5 transition-transform duration-200 ${categoriesOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
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
                  className="absolute left-1/2 -translate-x-1/2 mt-2 w-60 bg-white rounded-2xl shadow-2xl shadow-berry-600/10 border border-rose-100/60 py-2 z-50"
                >
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/categoria/${c.slug}`}
                      onClick={() => setCategoriesOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-transparent hover:text-berry-600 transition-all"
                    >
                      <span aria-hidden="true" className="text-base">{c.emoji}</span>
                      <span>{c.dbName}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link
              href="/#promo"
              className="px-3 py-2 rounded-lg text-sm font-semibold text-berry-600 hover:bg-berry-600/5 transition-all flex items-center gap-1"
            >
              <span className="text-xs">🔥</span>
              Promoção
            </Link>
          </nav>

          {/* User & Cart buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="p-2.5 rounded-full bg-rose-50/80 hover:bg-rose-100 transition-all group"
                  aria-label="Minha conta"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-berry-600"
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
                  <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl shadow-2xl shadow-berry-600/10 border border-rose-100/60 py-2 z-50">
                    <div className="px-4 py-3 border-b border-rose-100/60">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      href="/minha-conta"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50/60 hover:text-berry-600 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      Minha Conta
                    </Link>
                    <Link
                      href="/minha-conta/pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50/60 hover:text-berry-600 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                      Meus Pedidos
                    </Link>
                    <Link
                      href="/minha-conta/indicacoes"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50/60 hover:text-berry-600 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                      Indicar Amigas
                    </Link>
                    <hr className="my-1.5 border-rose-100/60" />
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50/60 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openLogin()}
                className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-full bg-rose-50/80 hover:bg-rose-100 text-berry-600 text-sm font-medium transition-all hover:shadow-md hover:shadow-berry-600/10"
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

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2.5 rounded-full bg-gradient-to-br from-berry-600 to-rose-500 hover:from-berry-700 hover:to-rose-600 transition-all group shadow-lg shadow-berry-600/20 hover:shadow-xl hover:shadow-berry-600/30 hover:scale-105"
              aria-label="Abrir carrinho"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-white"
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
                <span className="absolute -top-1.5 -right-1.5 bg-gold-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalQuantity}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-rose-50/60 transition-all"
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
            className="md:hidden pb-4 border-t border-rose-100/60 pt-4 flex flex-col gap-1"
          >
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-berry-600 hover:bg-rose-50/60 transition-all"
            >
              Início
            </Link>
            <Link
              href="/#produtos"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:text-berry-600 hover:bg-rose-50/60 transition-all"
            >
              Produtos
            </Link>
            <div className="px-3 py-2">
              <p className="text-[10px] uppercase tracking-[0.15em] text-gold-500 font-semibold mb-2 px-1">
                Categorias
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/categoria/${c.slug}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-berry-600 bg-rose-50/40 hover:bg-rose-50 transition-all"
                  >
                    <span aria-hidden="true">{c.emoji}</span>
                    <span className="truncate">{c.dbName}</span>
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/#promo"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-berry-600 hover:bg-berry-600/5 transition-all"
            >
              🔥 Promoção
            </Link>
            {!user && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openLogin();
                }}
                className="mt-2 mx-1 gradient-cta text-white text-sm font-semibold rounded-2xl px-4 py-3 text-center shadow-lg shadow-berry-600/20 active:scale-[0.98] transition-transform"
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
