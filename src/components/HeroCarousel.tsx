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
    <div className="flex items-center gap-1 sm:gap-1.5">
      {[
        { value: t.hours, label: "h" },
        { value: t.minutes, label: "m" },
        { value: t.seconds, label: "s" },
      ].map((u, i) => (
        <div key={i} className="flex flex-col items-center">
          <span className="gradient-cta text-white font-heading font-black text-xl sm:text-3xl w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shadow-[0_8px_24px_-4px_rgba(225,29,72,0.4)]">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[11px] font-black tracking-[0.18em] uppercase text-berry-600 mt-1.5">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function CountdownCard({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mb-6 sm:mb-8 p-4 sm:p-6 bg-white/85 backdrop-blur-xl rounded-[26px] sm:rounded-3xl border border-rose-100 shadow-[0_12px_28px_-8px_rgba(155,27,90,0.18)] w-fit mx-auto ${className}`}
    >
      <p className="text-[10px] sm:text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-2.5 sm:mb-3 inline-flex items-center gap-1.5">
        <span>⏰</span>
        <span>Oferta termina em</span>
      </p>
      <CountdownBlocks />
    </div>
  );
}

function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <div
      className={`mb-6 sm:mb-8 flex flex-wrap items-center justify-center gap-2 sm:gap-3 ${className}`}
    >
      <span className="inline-flex items-center gap-2 bg-white/85 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-rose-100 shadow-[0_2px_6px_rgba(155,27,90,0.06)] text-[11px] sm:text-[13px] font-semibold text-gray-700">
        <span>🔒</span> Mercado Pago SSL
      </span>
      <span className="inline-flex items-center gap-2 bg-white/85 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-rose-100 shadow-[0_2px_6px_rgba(155,27,90,0.06)] text-[11px] sm:text-[13px] font-semibold text-gray-700">
        <span>🚚</span> Frete 24h em SP
      </span>
      <span className="inline-flex items-center gap-2 bg-white/85 backdrop-blur px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-rose-100 shadow-[0_2px_6px_rgba(155,27,90,0.06)] text-[11px] sm:text-[13px] font-semibold text-gray-700">
        <span>⭐</span> 4,9/5 · 500+ clientes
      </span>
    </div>
  );
}

function ShopeeLink({
  tabIndex,
  className = "",
}: {
  tabIndex: number;
  className?: string;
}) {
  return (
    <a
      href="https://shopee.com.br/leticia.guardian?entryPoint=ShopByPDP&tab=product"
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabIndex}
      className={`inline-flex items-center gap-2.5 text-white font-bold px-7 sm:px-8 py-4 rounded-2xl shadow-lg transition-all transform hover:scale-105 active:scale-95 w-full sm:w-auto justify-center text-sm sm:text-base ${className}`}
      style={{ backgroundColor: "#EE4D2D" }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D63D1A")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#EE4D2D")}
    >
      <Image
        src="/shopee-logo.png?v=white"
        alt=""
        aria-hidden="true"
        width={28}
        height={28}
        sizes="28px"
        unoptimized
        className="h-7 w-7 object-contain shrink-0"
      />
      <span>Veja também nossa loja na Shopee</span>
    </a>
  );
}

function MainHeroSlide({
  isActive,
  featuredProduct,
}: {
  isActive: boolean;
  featuredProduct?: Product | null;
}) {
  const tab = isActive ? 0 : -1;
  const heroProduct = featuredProduct ?? null;
  const heroPrice = heroProduct
    ? formatPrice(heroProduct.bulkPrice)
    : "R$ 6,99";
  const heroStrike = heroProduct
    ? formatPrice(heroProduct.originalPrice)
    : "R$ 18,99";
  return (
    <div className="relative overflow-hidden gradient-berry-soft pt-5 pb-6 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20 h-full flex flex-col justify-center">
      <div className="absolute top-0 left-[5%] w-96 h-96 bg-linear-to-br from-rose-200/50 to-blush-50/0 rounded-full blur-3xl animate-pulse" />
      <div
        className="absolute bottom-0 right-[5%] w-80 h-80 bg-linear-to-tl from-gold-100/40 to-rose-100/20 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute top-1/3 right-20 w-64 h-64 bg-linear-to-bl from-gold-200/40 rounded-full blur-3xl animate-pulse"
        style={{ animationDelay: "2s" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-6 sm:gap-10 lg:gap-12 lg:grid-cols-[1.05fr_.95fr]">
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gold-200 shadow-[0_2px_6px_rgba(155,27,90,0.06)] mb-4 sm:mb-5 text-[11px] font-black tracking-[0.18em] uppercase text-gold-500">
              <span>⚡</span>
              <span>Oferta Relâmpago · -63% OFF</span>
            </span>

            <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-[64px] leading-[1.05] tracking-[-0.02em] mb-5 text-gray-900">
              <span className="block">Maquiagem</span>
              <em className="block italic font-medium bg-linear-to-r from-berry-600 via-rose-500 to-gold-500 bg-clip-text text-transparent">
                Profissional
              </em>
              <span className="block">a partir de R$ 6,99</span>
            </h1>

            <p className="text-base sm:text-[19px] text-[#3a1822] mb-5 sm:mb-6 max-w-2xl mx-auto lg:mx-0 leading-[1.55]">
              Cílios, gloss, paletas e mais — direto do nosso estoque em SP, pra
              todo o Brasil. Mesma qualidade dos profissionais, preço que cabe
              no seu bolso. <b>Frete em 24h em SP.</b>
            </p>

            <div className="flex flex-col sm:flex-row gap-3 items-center justify-center lg:justify-start">
              <a
                href="#produtos"
                tabIndex={tab}
                className="lp-btn-primary w-full sm:w-auto text-[17px]"
              >
                <span>Comprar Agora com Desconto</span>
                <span className="text-xl">→</span>
              </a>
              <Link
                href="/#produtos"
                tabIndex={tab}
                className="lp-btn-secondary w-full sm:w-auto"
              >
                Ver Ofertas
              </Link>
            </div>

            <CountdownCard className="mt-6 sm:mt-8 lg:mx-0" />

            <TrustBadges className="justify-center lg:justify-start mb-0" />

            <div className="mt-6 sm:mt-8 flex flex-col items-center lg:items-start gap-2">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <span key={s} className="text-lg">
                    ⭐
                  </span>
                ))}
              </div>
              <p className="text-gray-700 text-sm font-semibold">
                <span className="text-berry-600 font-black">4,9/5</span>{" "}
                <span className="text-gray-500">
                  — +500 clientes satisfeitas
                </span>
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-square rounded-4xl gradient-berry shadow-[0_32px_64px_-16px_rgba(155,27,90,0.4)] overflow-hidden flex items-center justify-center p-2 sm:p-4 lg:p-6">
              <span className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 bg-white text-rose-600 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-black tracking-[0.04em] shadow-[0_8px_20px_-4px_rgba(0,0,0,0.2)] inline-flex items-center gap-1.5 whitespace-nowrap">
                <span>⚡</span>
                <span>OFERTA RELÂMPAGO</span>
              </span>
              {heroProduct ? (
                <Image
                  src={heroProduct.images[0]}
                  alt={heroProduct.name}
                  fill
                  priority={isActive}
                  sizes="(max-width: 1024px) 80vw, 42vw"
                  className="z-0 object-contain scale-[1.45] sm:scale-[1.55] lg:scale-[1.65] p-0 sm:p-1 lg:p-2 drop-shadow-[0_16px_32px_rgba(0,0,0,0.25)]"
                />
              ) : null}

              <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 z-20 bg-white rounded-[18px] px-4 py-3 sm:px-5 sm:py-4 shadow-[0_12px_28px_-8px_rgba(0,0,0,0.25)] text-left max-w-55">
                <p className="text-[10px] font-black tracking-[0.18em] uppercase text-gold-500">
                  A partir de
                </p>
                <p className="font-heading font-black text-[32px] text-berry-600 leading-none mt-1">
                  {heroPrice}
                </p>
                <p className="text-[13px] font-semibold text-slate-400 line-through mt-2">
                  {heroStrike}
                </p>
              </div>
            </div>

            {heroProduct && (
              <div className="mt-4 flex flex-col items-center text-center">
                <p className="text-[11px] font-black tracking-[0.18em] uppercase text-gold-500 mb-1">
                  Destaque da semana
                </p>
                <p className="font-heading font-bold text-xl text-gray-900">
                  {heroProduct.shortName}
                </p>
              </div>
            )}
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
  surface: "gradient-berry-soft text-gray-900",
  pill: "gradient-cta text-white",
  blob1: "bg-linear-to-br from-rose-200/50 to-rose-100/0",
  blob2: "bg-linear-to-tl from-gold-100/40 to-rose-100/0",
  blob3: "bg-linear-to-bl from-gold-200/40",
  headlineGradient:
    "bg-linear-to-r from-berry-600 via-rose-500 to-gold-500 bg-clip-text text-transparent",
  headlineSolid: "text-gray-900",
  body: "text-gray-700",
  imageRing: "ring-white/70",
  priceGradient: "text-berry-600",
  offBadge:
    "gradient-cta text-white shadow-[0_4px_10px_-2px_rgba(155,27,90,0.4)]",
  imageGlow: "from-rose-300/40 via-transparent to-gold-300/30",
  starsTone: "text-berry-600",
  starsLabel: "text-gray-700",
};

const THEME_NOIR: ProductSlideTheme = {
  surface:
    "bg-gradient-to-br from-slate-950 via-berry-800 to-slate-900 text-white",
  pill: "bg-white/15 backdrop-blur-md text-white border border-white/30",
  blob1: "bg-berry-600/40",
  blob2: "bg-gold-500/15",
  blob3: "bg-rose-700/30",
  headlineGradient:
    "bg-linear-to-r from-white via-rose-100 to-gold-200 bg-clip-text text-transparent",
  headlineSolid: "text-white",
  body: "text-rose-100/90",
  imageRing: "ring-white/20",
  priceGradient: "text-white",
  offBadge:
    "bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-[0_4px_10px_-2px_rgba(155,27,90,0.4)]",
  imageGlow: "from-rose-500/40 via-transparent to-gold-400/30",
  starsTone: "text-gold-300",
  starsLabel: "text-rose-100/90",
};

const THEME_GOLD: ProductSlideTheme = {
  surface: "bg-gradient-to-b from-gold-100 via-blush-50 to-white text-gray-900",
  pill: "bg-linear-to-r from-gold-500 to-berry-600 text-white",
  blob1: "bg-linear-to-br from-gold-200/50 to-rose-100/20",
  blob2: "bg-linear-to-tl from-rose-200/30 to-gold-100/20",
  blob3: "bg-linear-to-bl from-gold-300/40",
  headlineGradient:
    "bg-linear-to-r from-berry-600 via-gold-500 to-berry-700 bg-clip-text text-transparent",
  headlineSolid: "text-gray-900",
  body: "text-gray-700",
  imageRing: "ring-white/70",
  priceGradient: "text-berry-600",
  offBadge:
    "gradient-cta text-white shadow-[0_4px_10px_-2px_rgba(155,27,90,0.4)]",
  imageGlow: "from-gold-300/50 via-transparent to-rose-300/30",
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
      className={`relative overflow-hidden ${theme.surface} pt-5 pb-6 sm:pt-14 sm:pb-16 lg:pt-16 lg:pb-20 h-full flex flex-col justify-center`}
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
            className={`inline-flex items-center gap-2 ${theme.pill} rounded-full px-3 py-1.5 sm:px-4 sm:py-2 mb-4 sm:mb-5 shadow-[0_8px_24px_-4px_rgba(225,29,72,0.4)] text-[10px] sm:text-[12px] font-black uppercase tracking-[0.18em]`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {pillLabel}
          </span>

          <h1 className="font-heading font-black text-4xl sm:text-5xl lg:text-7xl leading-[1.05] tracking-[-0.02em] mb-5">
            <span className={`block ${theme.headlineSolid}`}>
              {headlinePrefix}
            </span>
            <em
              className={`block italic font-medium ${theme.headlineGradient}`}
            >
              {product.shortName}
            </em>
          </h1>

          {/* Product image medallion */}
          <Link
            href={`/produto/${product.slug}`}
            tabIndex={tab}
            className="relative mx-auto mb-4 sm:mb-6 w-36 h-36 sm:w-48 sm:h-48 block group/img"
          >
            <div
              className={`absolute inset-0 -m-4 bg-linear-to-br ${theme.imageGlow} rounded-full blur-2xl`}
            />
            <div
              className={`relative w-full h-full rounded-full overflow-hidden shadow-[0_32px_64px_-16px_rgba(155,27,90,0.4)] ring-4 ${theme.imageRing} bg-white backdrop-blur-sm group-hover/img:ring-rose-300 transition-all duration-300`}
            >
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                priority={isActive}
                sizes="(max-width: 640px) 160px, 192px"
                className="object-cover object-center scale-105 group-hover/img:scale-110 transition-transform duration-300"
              />
            </div>
            <div
              className={`absolute -top-2 -right-2 ${theme.offBadge} text-[11px] font-black tracking-[0.04em] px-3 py-1.5 rounded-full rotate-6`}
            >
              -{offPercent}% OFF
            </div>
          </Link>

          {/* Price block */}
          <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className={`text-base sm:text-xl line-through ${theme.body}`}>
              De {formatPrice(product.originalPrice)}
            </span>
            <span
              className={`font-heading font-black text-4xl sm:text-5xl tracking-tight ${theme.priceGradient}`}
            >
              {formatPrice(product.bulkPrice)}
            </span>
            <span
              className={`text-[11px] sm:text-xs font-black tracking-[0.04em] ${theme.offBadge} px-3 py-1.5 rounded-full`}
            >
              -{offPercent}% OFF
            </span>
          </div>

          <p
            className={`text-base sm:text-lg ${theme.body} mb-2 sm:mb-3 max-w-2xl mx-auto leading-relaxed`}
          >
            {tagline}
          </p>
          <p
            className={`text-base sm:text-lg ${theme.body} mb-4 sm:mb-6 max-w-2xl mx-auto`}
          >
            Leve <span className="font-black text-berry-600">4+ itens</span> e
            pague ainda <span className="font-black text-berry-600">menos</span>
            .
          </p>

          <TrustBadges className="mb-4 sm:mb-6" />

          <div className="flex flex-col gap-2.5 sm:gap-3 items-center justify-center mt-6 sm:mt-8">
            <Link
              href={`/produto/${product.slug}`}
              tabIndex={tab}
              className="lp-btn-primary w-full sm:w-auto text-[17px] sm:text-lg"
            >
              <span>Ver Oferta Especial</span>
              <span className="text-xl">→</span>
            </Link>
            <ShopeeLink tabIndex={tab} />
          </div>

          <div className="mt-6 sm:mt-8 flex flex-col items-center gap-2">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className="text-lg">
                  ⭐
                </span>
              ))}
            </div>
            <p className={`text-sm font-semibold ${theme.starsLabel}`}>
              <span className={`${theme.starsTone} font-black`}>4,9/5</span>{" "}
              <span className="opacity-80">— +500 clientes satisfeitas</span>
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
    const productSlideConfigs: {
      slug: string;
      label: string;
      theme: ProductSlideTheme;
      pillLabel: string;
      headlinePrefix: string;
      tagline: string;
    }[] = [
      {
        slug: "sombra-sobrancelha",
        label: "Paleta Ruby Rose em oferta",
        theme: THEME_RUBY,
        pillLabel: "✨ Destaque Ruby Rose",
        headlinePrefix: "Em Oferta:",
        tagline:
          "Sobrancelhas marcantes e bem desenhadas. Tons versáteis para corrigir falhas e definir com acabamento profissional.",
      },
      {
        slug: "delineador-vivai-ultra-black",
        label: "Delineador Vivai Ultra Black em oferta",
        theme: THEME_NOIR,
        pillLabel: "🖤 Destaque Vivai",
        headlinePrefix: "Traço Marcante:",
        tagline:
          "Pigmentação ultra black, secagem rápida e ultra fixação. O delineado preciso que dura o dia inteiro sem borrar.",
      },
      {
        slug: "po-de-banana",
        label: "Pó Banana Fenzza em oferta",
        theme: THEME_GOLD,
        pillLabel: "🍌 Destaque Fenzza",
        headlinePrefix: "Acabamento Matte:",
        tagline:
          "Sela base e corretivo, controla a oleosidade e deixa a pele lisa e iluminada por horas. Fórmula translúcida.",
      },
      {
        slug: "cilios-posticos-aurora-5d",
        label: "Cílios Aurora 5D em oferta",
        theme: THEME_NOIR,
        pillLabel: "👁️ Destaque Aurora",
        headlinePrefix: "Olhar Marcante:",
        tagline:
          "Volume e definição com efeito 5D. Cílios cheios, alongados e leves para um olhar irresistível.",
      },
      {
        slug: "mascara-cilios-maxlove",
        label: "Máscara de Cílios Maxlove em oferta",
        theme: THEME_RUBY,
        pillLabel: "💖 Destaque Maxlove",
        headlinePrefix: "Cílios Perfeitos:",
        tagline:
          "Mega alongamento e volume com biotina e vitamina E. Fórmula que fortalece e auxilia no crescimento dos cílios.",
      },
      {
        slug: "cola-cilios-lua-neve",
        label: "Cola para Cílios Lua&Neve em oferta",
        theme: THEME_GOLD,
        pillLabel: "✨ Destaque Lua&Neve",
        headlinePrefix: "Fixação Profissional:",
        tagline:
          "Cola branca que seca transparente. Super fixação à prova d'água, mantém os cílios firmes o dia inteiro.",
      },
      {
        slug: "paleta-multifuncional",
        label: "Paleta Multifuncional Dapop em oferta",
        theme: THEME_RUBY,
        pillLabel: "🌸 Destaque Dapop",
        headlinePrefix: "Beleza Versátil:",
        tagline:
          "Contorno, blush e iluminador na mesma paleta. Textura aveludada, vegana e fácil de esfumar.",
      },
      {
        slug: "gloss-magico-bellafeme",
        label: "Gloss Mágico Bellafeme em oferta",
        theme: THEME_RUBY,
        pillLabel: "💋 Destaque Bellafeme",
        headlinePrefix: "Lábios Mágicos:",
        tagline:
          "Muda de cor ao contato com seus lábios. Hidratação com partículas douradas e brilho sofisticado.",
      },
      {
        slug: "lip-gloss-vivai-cute-gloss",
        label: "Lip Gloss Vivai Cute Gloss em oferta",
        theme: THEME_GOLD,
        pillLabel: "🦄 Destaque Vivai Cute",
        headlinePrefix: "Brilho Divertido:",
        tagline:
          "Lip gloss com personagens fofíssimos. Brilho intenso, hidratação leve e estilo único no dia a dia.",
      },
      {
        slug: "lip-oil-mahav-cereja-morango",
        label: "Lip Oil Mahav em oferta",
        theme: THEME_NOIR,
        pillLabel: "🍒 Destaque Mahav",
        headlinePrefix: "Hidratação com Brilho:",
        tagline:
          "Lip oil com aromas de cereja e morango. Brilho natural e textura leve, sem pegajoso.",
      },
      {
        slug: "esponja-maquiagem-gota",
        label: "Esponja de Maquiagem Gota em oferta",
        theme: THEME_GOLD,
        pillLabel: "🎨 Destaque Esponja",
        headlinePrefix: "Acabamento Perfeito:",
        tagline:
          "Esponja 2 em 1 chanfrada e em gota. Espalha base, corretivo e pó com precisão e maciez.",
      },
    ];

    const buildProductSlide = (cfg: (typeof productSlideConfigs)[number]) => {
      const product = productMap.get(cfg.slug);
      if (!product) return null;
      return {
        key: cfg.slug,
        label: cfg.label,
        render: (isActive: boolean) => (
          <ProductSlide
            isActive={isActive}
            product={product}
            theme={cfg.theme}
            pillLabel={cfg.pillLabel}
            headlinePrefix={cfg.headlinePrefix}
            tagline={cfg.tagline}
          />
        ),
      } as SlideConfig;
    };

    const items: SlideConfig[] = [];

    // First slide: Ruby Rose
    const ruby = buildProductSlide(productSlideConfigs[0]);
    if (ruby) items.push(ruby);

    const mainHeroProduct =
      productMap.get("paleta-multifuncional") ??
      productMap.get("gloss-magico-bellafeme") ??
      Array.from(productMap.values())[0] ??
      null;

    // Second slide: main hero
    items.push({
      key: "main",
      label: "Maquiagem profissional por preços imbatíveis",
      render: (isActive) => (
        <MainHeroSlide isActive={isActive} featuredProduct={mainHeroProduct} />
      ),
    });

    // Remaining product slides
    for (const cfg of productSlideConfigs.slice(1)) {
      const slide = buildProductSlide(cfg);
      if (slide) items.push(slide);
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
      <div
        key={slides[safeCurrent].key}
        role="group"
        aria-roledescription="slide"
        aria-label={`${slides[safeCurrent].label} (${safeCurrent + 1} de ${total})`}
        className="animate-fade-in"
        style={{ animationDuration: `${TRANSITION_MS}ms` }}
      >
        {slides[safeCurrent].render(true)}
      </div>

      {/* Dots navigation — in normal flow below slides, never overlaps content */}
      {total > 1 && (
        <div className="relative z-20 flex justify-center pt-2 pb-3 sm:py-5">
          <div className="flex items-center gap-2.5 bg-white/85 backdrop-blur-md rounded-full px-3 py-2 shadow-[0_8px_16px_-4px_rgba(155,27,90,0.10)] border border-rose-100">
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
                      : "w-2 bg-rose-200 hover:bg-rose-300"
                  }`}
                >
                  {isActive && !paused && (
                    <span
                      key={`progress-${safeCurrent}`}
                      className="absolute inset-y-0 left-0 gradient-cta carousel-progress"
                    />
                  )}
                  {isActive && paused && (
                    <span className="absolute inset-0 gradient-cta" />
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
            className="hidden sm:flex absolute left-3 lg:left-5 top-[45%] -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-berry-600 shadow-[0_12px_28px_-8px_rgba(155,27,90,0.18)] border border-rose-100 hover:bg-white hover:scale-110 transition-all active:scale-95"
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
            className="hidden sm:flex absolute right-3 lg:right-5 top-[45%] -translate-y-1/2 z-20 h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-md text-berry-600 shadow-[0_12px_28px_-8px_rgba(155,27,90,0.18)] border border-rose-100 hover:bg-white hover:scale-110 transition-all active:scale-95"
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
