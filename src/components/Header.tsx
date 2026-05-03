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

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_0_rgba(155,27,90,0.04)]"
          : "bg-background/95 backdrop-blur-xl"
      } border-b border-rose-100/90`}
    >
      {/* Promo banner — shimmer */}
      <div className="shimmer-bg text-white text-center py-2.5 px-4 text-xs sm:text-sm font-bold tracking-wide">
        <span className="inline-flex items-center gap-1.5 flex-wrap justify-center">
          <span>⚡</span>
          <span className="font-black">OFERTA RELÂMPAGO AGORA</span>
          <span className="opacity-70">·</span>
          <span>-63% EM TUDO</span>
          <span className="opacity-70">·</span>
          <span>ESTOQUES ACABANDO 🔥</span>
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-17 md:h-19 gap-4 md:gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="lp-brand-mark relative w-12 h-12 ring-2 ring-rose-200/60 group-hover:ring-rose-300/80 transition-all duration-300 group-hover:scale-105">
              <Image
                src="/brand/logo-lp-circle.png"
                alt="L&PMakeUp"
                fill
                sizes="48px"
                className="object-cover"
                priority
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="lp-brand-wordmark text-[24px]">L&PMakeUp</span>
              <span className="lp-brand-tagline">Beauty Store</span>
            </div>
          </Link>

          {/* Nav desktop */}
          <nav
            aria-label="Principal"
            className="hidden md:flex items-center gap-1"
          >
            <Link
              href="/"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-berry-600 hover:bg-white transition-all"
            >
              Início
            </Link>
            <Link
              href="/#produtos"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-berry-600 hover:bg-white transition-all"
            >
              Ofertas
            </Link>
            <div className="relative" ref={categoriesRef}>
              <button
                type="button"
                onClick={() => setCategoriesOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={categoriesOpen}
                className="px-3.5 py-2 rounded-xl text-sm font-semibold text-gray-700 hover:text-berry-600 hover:bg-white transition-all flex items-center gap-1.5"
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
                  className="absolute left-1/2 -translate-x-1/2 mt-3 w-64 bg-white rounded-3xl shadow-[0_20px_40px_-12px_rgba(155,27,90,0.18)] border border-rose-100/60 py-2 z-50"
                >
                  {CATEGORIES.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/categoria/${c.slug}`}
                      onClick={() => setCategoriesOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-linear-to-r hover:from-rose-50 hover:to-transparent hover:text-berry-600 transition-all"
                    >
                      <span aria-hidden="true" className="text-base">
                        {c.emoji}
                      </span>
                      <span>{c.dbName}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <a
              href="https://shopee.com.br/leticia.guardian?entryPoint=ShopByPDP&tab=product"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-full text-sm font-bold text-white transition-all flex items-center gap-1 shadow-[0_8px_16px_-4px_rgba(238,77,45,0.35)] hover:shadow-[0_12px_24px_-6px_rgba(238,77,45,0.45)]"
              style={{ backgroundColor: "#EE4D2D" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#D63D1A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#EE4D2D")
              }
            >
              <Image
                src="/shopee-logo.png?v=white"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                sizes="24px"
                unoptimized
                className="h-6 w-6 object-contain shrink-0"
              />
              Shopee
            </a>
          </nav>

          {/* User & Cart buttons */}
          <div className="flex items-center gap-2">
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="lp-icon-btn"
                  aria-label="Minha conta"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-900"
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
                  <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl shadow-[0_20px_40px_-12px_rgba(155,27,90,0.18)] border border-rose-100/60 py-2 z-50">
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
                      Minha Conta
                    </Link>
                    <Link
                      href="/minha-conta/pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50/60 hover:text-berry-600 transition-all"
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
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                        />
                      </svg>
                      Meus Pedidos
                    </Link>
                    <Link
                      href="/minha-conta/indicacoes"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-rose-50/60 hover:text-berry-600 transition-all"
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
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
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
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sair
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openLogin()}
                className="hidden md:inline-flex items-center gap-1.5 px-4 h-11 rounded-full border-2 border-rose-200 bg-white hover:border-rose-300 hover:text-berry-600 text-gray-900 text-sm font-semibold transition-all"
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
              className="lp-icon-btn relative"
              aria-label="Abrir carrinho"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
                <span className="absolute -top-1.5 -right-1.5 bg-linear-to-br from-gold-500 to-gold-600 text-white text-[10px] font-black min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {totalQuantity}
                </span>
              )}
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lp-icon-btn inline-flex! md:hidden!"
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
            className="md:hidden pb-4 border-t border-rose-100/60 pt-4 px-4 sm:px-6 bg-white/95 backdrop-blur-xl flex flex-col gap-1"
          >
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-gray-700 hover:text-berry-600 hover:bg-rose-50/60 transition-all"
            >
              Início
            </Link>
            <Link
              href="/#produtos"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-semibold text-gray-700 hover:text-berry-600 hover:bg-rose-50/60 transition-all"
            >
              Ofertas
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
                    className="flex items-center gap-2 px-3 py-2.5 rounded-2xl text-sm text-gray-700 hover:text-berry-600 bg-rose-50/40 hover:bg-rose-50 transition-all"
                  >
                    <span aria-hidden="true">{c.emoji}</span>
                    <span className="truncate">{c.dbName}</span>
                  </Link>
                ))}
              </div>
            </div>
            <a
              href="https://shopee.com.br/leticia.guardian?entryPoint=ShopByPDP&tab=product"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 mx-1 px-4 py-3 rounded-full text-sm font-bold text-white transition-all shadow-[0_8px_16px_-4px_rgba(238,77,45,0.35)]"
              style={{ backgroundColor: "#EE4D2D" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#D63D1A")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#EE4D2D")
              }
            >
              <Image
                src="/shopee-logo.png?v=white"
                alt=""
                aria-hidden="true"
                width={24}
                height={24}
                sizes="24px"
                unoptimized
                className="h-6 w-6 object-contain shrink-0"
              />
              Shopee
            </a>
            {!user && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  openLogin();
                }}
                className="mt-2 mx-1 lp-btn-primary text-sm"
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
