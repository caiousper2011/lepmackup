"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Product, formatPrice } from "@/data/products";

const SLIDE_DURATION_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;
const TRANSITION_MS = 800;

interface HeroCarouselProps {
  products: Product[];
}

function useCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      const diff = endOfDay.getTime() - now.getTime();
      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    // Defer first tick out of effect body to avoid cascading render.
    const initial = setTimeout(tick, 0);
    const id = setInterval(tick, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(id);
    };
  }, []);

  return timeLeft ?? { hours: 0, minutes: 0, seconds: 0 };
}

function CountdownBlocks() {
  const t = useCountdown();
  return (
    <div className="flex items-center gap-1.5">
      {[
        { value: t.hours, label: "h" },
        { value: t.minutes, label: "m" },
        { value: t.seconds, label: "s" },
      ].map((u, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="bg-gradient-to-br from-rose-500 to-pink-600 text-white font-mono font-black text-2xl sm:text-3xl w-12 h-12 sm:w-14 sm:h-14 rounded-lg flex items-center justify-center shadow-lg shadow-rose-600/40">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-xs font-bold text-rose-600 mt-1">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function CountdownCard() {
  return (
    <div className="mb-8 p-6 bg-white/80 backdrop-blur-lg rounded-3xl border-2 border-rose-200 shadow-2xl shadow-rose-200/50 w-fit mx-auto">
      <p className="text-xs sm:text-sm text-gray-600 font-bold mb-3 uppercase tracking-wider">
        ⏰ Oferta termina em:
      </p>
      <CountdownBlocks />
    </div>
  );
}

function TrustBadges() {
  return (
    <div className="mb-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
      <div className="flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full border border-green-200">
        <span className="text-2xl">✓</span>
        <span className="text-sm font-semibold text-gray-700">100% Seguro</span>
      </div>
      <div className="flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full border border-blue-200">
        <span className="text-2xl">🚚</span>
        <span className="text-sm font-semibold text-gray-700">Entrega 24h</span>
      </div>
      <div className="flex items-center gap-2 bg-white/70 backdrop-blur px-4 py-2 rounded-full border border-purple-200">
        <span className="text-2xl">↩️</span>
        <span className="text-sm font-semibold text-gray-700">
          Devolução 30d
        </span>
      </div>
    </div>
  );
}

function ShopeeLink({ tabIndex }: { tabIndex: number }) {
  return (
    <a
      href="https://shopee.com.br/leticia.guardian?entryPoint=ShopByPDP&tab=product"
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      className="inline-flex items-center gap-2.5 text-white font-bold px-7 sm:px-8 py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center text-sm sm:text-base"
      style={{ backgroundColor: "#EE4D2D" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D63D1A")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EE4D2D")}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/shopee-logo.svg" alt="Shopee" className="w-6 h-6" />
      <span>Veja também nossa loja na Shopee</span>
    </a>
  );
}

function MainHeroSlide({ isActive }: { isActive: boolean }) {
  const tab = isActive ? 0 : -1;
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-rose-50 via-pink-50 to-white pt-8 pb-12 sm:pt-12 sm:pb-16">
      <div className="absolute top-0 left-[5%] w-96 h-96 bg-gradient-to-br from-rose-200/40 to-pink-200/20 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-[5%] w-80 h-80 bg-gradient-to-tl from-purple-200/30 to-pink-100/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/3 right-20 w-64 h-64 bg-gradient-to-bl from-gold-100/30 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-4 leading-tight font-[family-name:var(--font-heading)]">
            <span className="block">Maquiagem Profissional</span>
            <span className="block bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Por Preços Imbatíveis
            </span>
          </h1>

          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="text-base sm:text-xl text-gray-600 line-through">
              De R$18,99
            </span>
            <span className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              R$ 6,99
            </span>
            <span className="text-sm sm:text-base font-bold bg-gold-400 text-rose-900 px-3 py-1 rounded-full animate-bounce">
              -63% OFF
            </span>
          </div>

          <p className="text-lg sm:text-xl text-gray-700 mb-6 max-w-2xl mx-auto font-medium">
            Leve <span className="font-black text-rose-600">4+ itens</span> e
            pague ainda <span className="font-black text-rose-600">menos</span>
          </p>

          <CountdownCard />

          <TrustBadges />

          <div className="flex flex-col gap-4 items-center justify-center mt-8">
            <a
              href="#produtos"
              tabIndex={tab}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black px-8 sm:px-12 py-5 rounded-2xl shadow-2xl shadow-rose-600/40 hover:shadow-2xl hover:shadow-rose-600/60 transition-all transform hover:scale-105 active:scale-95 text-lg sm:text-xl w-full sm:w-auto justify-center"
            >
              <span>Ver Oferta Especial</span>
              <span className="text-2xl animate-pulse">→</span>
            </a>
            <ShopeeLink tabIndex={tab} />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-2xl">
                  ⭐
                </span>
              ))}
            </div>
            <p className="text-gray-700 font-semibold">
              <span className="text-rose-600 font-black">4.9/5</span> —{" "}
              <span className="text-gray-600">+500 clientes</span>
            </p>
            <p className="text-xs text-gray-500">
              ✓ Pagamento 100% Seguro | ✓ Entrega Rastreada | ✓ Suporte 24/7
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProductSlideTheme {
  surface: string;
  pill: string;
  blob1: string;
  blob2: string;
  blob3: string;
  headlineGradient: string;
  headlineSolid: string;
  body: string;
  imageRing: string;
  priceGradient: string;
  offBadge: string;
  imageGlow: string;
  starsTone: string;
  starsLabel: string;
}

const THEME_RUBY: ProductSlideTheme = {
  surface: "bg-gradient-to-b from-rose-50 via-pink-50 to-white text-gray-900",
  pill: "bg-gradient-to-r from-rose-600 to-pink-600 text-white",
  blob1: "bg-gradient-to-br from-rose-200/40 to-pink-200/20",
  blob2: "bg-gradient-to-tl from-purple-200/30 to-pink-100/20",
  blob3: "bg-gradient-to-bl from-gold-100/30",
  headlineGradient:
    "bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 bg-clip-text text-transparent",
  headlineSolid: "text-gray-900",
  body: "text-gray-700",
  imageRing: "ring-white/70",
  priceGradient:
    "bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent",
  offBadge: "bg-gold-400 text-rose-900",
  imageGlow: "from-rose-300/40 via-transparent to-pink-300/40",
  starsTone: "text-rose-600",
  starsLabel: "text-gray-700",
};

const THEME_NOIR: ProductSlideTheme = {
  surface:
    "bg-gradient-to-br from-gray-950 via-rose-900 to-gray-900 text-white",
  pill: "bg-white/15 backdrop-blur-md text-white border border-white/30",
  blob1: "bg-rose-700/40",
  blob2: "bg-gold-500/15",
  blob3: "bg-purple-700/20",
  headlineGradient:
    "bg-gradient-to-r from-white via-rose-100 to-gold-200 bg-clip-text text-transparent",
  headlineSolid: "text-white",
  body: "text-rose-100/90",
  imageRing: "ring-white/20",
  priceGradient:
    "bg-gradient-to-r from-rose-200 via-white to-gold-200 bg-clip-text text-transparent",
  offBadge: "bg-gold-400 text-gray-900",
  imageGlow: "from-rose-500/40 via-transparent to-gold-400/30",
  starsTone: "text-gold-300",
  starsLabel: "text-rose-100/90",
};

const THEME_GOLD: ProductSlideTheme = {
  surface: "bg-gradient-to-b from-gold-50 via-rose-50 to-white text-gray-900",
  pill: "bg-gradient-to-r from-gold-500 to-rose-600 text-white",
  blob1: "bg-gradient-to-br from-gold-200/40 to-rose-100/20",
  blob2: "bg-gradient-to-tl from-rose-200/30 to-gold-100/20",
  blob3: "bg-gradient-to-bl from-gold-300/30",
  headlineGradient:
    "bg-gradient-to-r from-rose-600 via-gold-600 to-rose-700 bg-clip-text text-transparent",
  headlineSolid: "text-gray-900",
  body: "text-gray-700",
  imageRing: "ring-white/70",
  priceGradient:
    "bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent",
  offBadge: "bg-gradient-to-r from-rose-600 to-pink-600 text-white",
  imageGlow: "from-gold-300/40 via-transparent to-rose-300/30",
  starsTone: "text-gold-500",
  starsLabel: "text-gray-700",
};

interface ProductSlideProps {
  product: Product;
  theme: ProductSlideTheme;
  pillLabel: string;
  headlinePrefix: string;
  tagline: string;
  isActive: boolean;
}

function ProductSlide({
  product,
  theme,
  pillLabel,
  headlinePrefix,
  tagline,
  isActive,
}: ProductSlideProps) {
  const tab = isActive ? 0 : -1;
  const offPercent = Math.round(
    ((product.originalPrice - product.bulkPrice) / product.originalPrice) * 100,
  );

  return (
    <div
      className={`relative overflow-hidden ${theme.surface} pt-8 pb-12 sm:pt-12 sm:pb-16`}
    >
      <div
        className={`absolute top-0 left-[5%] w-96 h-96 ${theme.blob1} rounded-full blur-3xl animate-pulse`}
      />
      <div
        className={`absolute bottom-0 right-[5%] w-80 h-80 ${theme.blob2} rounded-full blur-3xl animate-pulse`}
        style={{ animationDelay: "1s" }}
      />
      <div
        className={`absolute top-1/3 right-20 w-64 h-64 ${theme.blob3} rounded-full blur-3xl animate-pulse`}
        style={{ animationDelay: "2s" }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span
            className={`inline-flex items-center gap-2 ${theme.pill} rounded-full px-5 py-2 mb-5 shadow-lg text-xs sm:text-sm font-black uppercase tracking-wider`}
          >
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {pillLabel}
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tighter mb-4 leading-tight font-[family-name:var(--font-heading)]">
            <span className={`block ${theme.headlineSolid}`}>
              {headlinePrefix}
            </span>
            <span className={`block ${theme.headlineGradient}`}>
              {product.shortName}
            </span>
          </h1>

          {/* Product image medallion */}
          <Link href={`/produto/${product.slug}`} tabIndex={tab} className="relative mx-auto mb-6 w-40 h-40 sm:w-48 sm:h-48 block group/img">
            <div
              className={`absolute inset-0 -m-4 bg-gradient-to-br ${theme.imageGlow} rounded-full blur-2xl`}
            />
            <div
              className={`relative w-full h-full rounded-full overflow-hidden shadow-2xl ring-4 ${theme.imageRing} bg-white/40 backdrop-blur-sm group-hover/img:ring-rose-400 transition-all duration-300`}
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority={isActive}
                sizes="(max-width: 640px) 160px, 192px"
                className="object-cover group-hover/img:scale-110 transition-transform duration-300"
              />
            </div>
            <div
              className={`absolute -top-2 -right-2 ${theme.offBadge} text-xs font-extrabold px-3 py-1.5 rounded-full rotate-6 shadow-xl animate-bounce`}
            >
              -{offPercent}% OFF
            </div>
          </Link>

          {/* Price block */}
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className={`text-base sm:text-xl line-through ${theme.body}`}>
              De {formatPrice(product.originalPrice)}
            </span>
            <span
              className={`text-4xl sm:text-5xl font-black ${theme.priceGradient}`}
            >
              {formatPrice(product.bulkPrice)}
            </span>
            <span
              className={`text-sm sm:text-base font-bold ${theme.offBadge} px-3 py-1 rounded-full animate-bounce`}
            >
              -{offPercent}% OFF
            </span>
          </div>

          <p
            className={`text-base sm:text-lg ${theme.body} mb-3 max-w-2xl mx-auto font-medium`}
          >
            {tagline}
          </p>
          <p
            className={`text-base sm:text-lg ${theme.body} mb-6 max-w-2xl mx-auto font-medium`}
          >
            Leve <span className="font-black text-rose-500">4+ itens</span> e
            pague ainda{" "}
            <span className="font-black text-rose-500">menos</span>
          </p>

          <CountdownCard />

          <TrustBadges />

          <div className="flex flex-col gap-4 items-center justify-center mt-8">
            <Link
              href={`/produto/${product.slug}`}
              tabIndex={tab}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-black px-8 sm:px-12 py-5 rounded-2xl shadow-2xl shadow-rose-600/40 hover:shadow-2xl hover:shadow-rose-600/60 transition-all transform hover:scale-105 active:scale-95 text-lg sm:text-xl w-full sm:w-auto justify-center"
            >
              <span>Ver Oferta Especial</span>
              <span className="text-2xl animate-pulse">→</span>
            </Link>
            <ShopeeLink tabIndex={tab} />
          </div>

          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-2xl">
                  ⭐
                </span>
              ))}
            </div>
            <p className={`font-semibold ${theme.starsLabel}`}>
              <span className={`${theme.starsTone} font-black`}>4.9/5</span> —{" "}
              <span className="opacity-80">+500 clientes</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface SlideConfig {
  key: string;
  label: string;
  render: (isActive: boolean) => React.ReactNode;
}

export default function HeroCarousel({ products }: HeroCarouselProps) {
  const productMap = useMemo(
    () => new Map(products.map((p) => [p.slug, p])),
    [products],
  );

  const slides = useMemo<SlideConfig[]>(() => {
    const ruby = productMap.get("sombra-sobrancelha");
    const vivai = productMap.get("delineador-vivai-ultra-black");
    const banana = productMap.get("po-de-banana");

    const items: SlideConfig[] = [];

    if (ruby) {
      items.push({
        key: "ruby",
        label: "Paleta Ruby Rose em oferta",
        render: (isActive) => (
          <ProductSlide
            isActive={isActive}
            product={ruby}
            theme={THEME_RUBY}
            pillLabel="✨ Destaque Ruby Rose"
            headlinePrefix="Em Oferta:"
            tagline="Sobrancelhas marcantes e bem desenhadas. Tons versáteis para corrigir falhas e definir com acabamento profissional."
          />
        ),
      });
    }

    items.push({
      key: "main",
      label: "Maquiagem profissional por preços imbatíveis",
      render: (isActive) => <MainHeroSlide isActive={isActive} />,
    });

    if (vivai) {
      items.push({
        key: "vivai",
        label: "Delineador Vivai Ultra Black em oferta",
        render: (isActive) => (
          <ProductSlide
            isActive={isActive}
            product={vivai}
            theme={THEME_NOIR}
            pillLabel="🖤 Destaque Vivai"
            headlinePrefix="Traço Marcante:"
            tagline="Pigmentação ultra black, secagem rápida e ultra fixação. O delineado preciso que dura o dia inteiro sem borrar."
          />
        ),
      });
    }

    if (banana) {
      items.push({
        key: "banana",
        label: "Pó Banana Fenzza em oferta",
        render: (isActive) => (
          <ProductSlide
            isActive={isActive}
            product={banana}
            theme={THEME_GOLD}
            pillLabel="🍌 Destaque Fenzza"
            headlinePrefix="Acabamento Matte:"
            tagline="Sela base e corretivo, controla a oleosidade e deixa a pele lisa e iluminada por horas. Fórmula translúcida."
          />
        ),
      });
    }

    return items;
  }, [productMap]);

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const total = slides.length;
  const safeCurrent = total > 0 ? current % total : 0;

  const goTo = useCallback(
    (i: number) => {
      if (total === 0) return;
      setCurrent(((i % total) + total) % total);
    },
    [total],
  );

  const next = useCallback(() => goTo(safeCurrent + 1), [goTo, safeCurrent]);
  const prev = useCallback(() => goTo(safeCurrent - 1), [goTo, safeCurrent]);

  // Auto-advance
  useEffect(() => {
    if (total <= 1 || paused) return;
    const id = setTimeout(() => next(), SLIDE_DURATION_MS);
    return () => clearTimeout(id);
  }, [safeCurrent, paused, next, total]);

  // Pause when tab is hidden
  useEffect(() => {
    function onVisibility() {
      setPaused(document.hidden);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    function onKey(e: KeyboardEvent) {
      if (!node?.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }
  function onTouchMove(e: React.TouchEvent) {
    touchEndX.current = e.touches[0].clientX;
  }
  function onTouchEnd() {
    if (touchStartX.current == null || touchEndX.current == null) return;
    const dx = touchStartX.current - touchEndX.current;
    if (Math.abs(dx) > SWIPE_THRESHOLD_PX) {
      if (dx > 0) next();
      else prev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  }

  if (total === 0) return null;

  return (
    <section
      ref={containerRef}
      className="relative isolate"
      aria-roledescription="carousel"
      aria-label="Ofertas em destaque"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* CSS grid stacking: all slides share the same cell, tallest drives height */}
      <div className="grid">
        {slides.map((slide, i) => {
          const isActive = i === safeCurrent;
          return (
            <div
              key={slide.key}
              role="group"
              aria-roledescription="slide"
              aria-label={`${slide.label} (${i + 1} de ${total})`}
              aria-hidden={!isActive}
              className={`[grid-area:1/1] transition-opacity ease-in-out ${
                isActive
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              }`}
              style={{ transitionDuration: `${TRANSITION_MS}ms` }}
            >
              {slide.render(isActive)}
            </div>
          );
        })}
      </div>

      {/* Dots navigation — in normal flow below slides, never overlaps content */}
      {total > 1 && (
        <div className="relative z-20 flex justify-center py-5">
          <div className="flex items-center gap-2.5 bg-white/80 backdrop-blur-md rounded-full px-3 py-2 shadow-xl border-2 border-rose-200">
            {slides.map((slide, i) => {
              const isActive = i === safeCurrent;
              return (
                <button
                  key={slide.key}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ir para slide ${i + 1}: ${slide.label}`}
                  aria-current={isActive ? "true" : "false"}
                  className={`relative h-2 rounded-full overflow-hidden transition-all duration-500 ${
                    isActive
                      ? "w-10 bg-rose-100"
                      : "w-2 bg-rose-300/60 hover:bg-rose-400/80"
                  }`}
                >
                  {isActive && !paused && (
                    <span
                      key={`progress-${safeCurrent}`}
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-600 to-pink-600 carousel-progress"
                    />
                  )}
                  {isActive && paused && (
                    <span className="absolute inset-0 bg-gradient-to-r from-rose-600 to-pink-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Arrow buttons — positioned relative to the whole section */}
      {total > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            aria-label="Slide anterior"
            className="hidden sm:flex absolute left-3 lg:left-5 top-[45%] -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-rose-600 shadow-2xl border-2 border-rose-200 hover:bg-white hover:scale-110 hover:shadow-2xl transition-all active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            aria-label="Próximo slide"
            className="hidden sm:flex absolute right-3 lg:right-5 top-[45%] -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-rose-600 shadow-2xl border-2 border-rose-200 hover:bg-white hover:scale-110 hover:shadow-2xl transition-all active:scale-95"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}
