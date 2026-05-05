"use client";

import { useEffect, useState } from "react";

interface ViewerCounterProps {
  productId: string;
  variant?: "compact" | "default" | "hero";
  tone?: "light" | "dark";
  className?: string;
}

const MIN_VIEWERS = 95;
const MAX_INITIAL_RANGE = 156;

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialFor(productId: string): number {
  return MIN_VIEWERS + (hashString(productId) % MAX_INITIAL_RANGE);
}

function nextDelta(): number {
  const r = Math.random();
  if (r < 0.06) return Math.floor(Math.random() * 5) + 3;
  if (r < 0.18) return -(Math.floor(Math.random() * 4) + 2);
  return Math.floor(Math.random() * 5) - 2;
}

export default function ViewerCounter({
  productId,
  variant = "default",
  tone = "light",
  className = "",
}: ViewerCounterProps) {
  const [count, setCount] = useState(() => initialFor(productId));
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    let pulseTimeout: ReturnType<typeof setTimeout>;
    const baseline = initialFor(productId);
    const ceiling = baseline + 92;

    const tick = () => {
      setCount((prev) => {
        const next = prev + nextDelta();
        if (next < MIN_VIEWERS) return MIN_VIEWERS;
        if (next > ceiling) return ceiling - 1;
        return next;
      });
      setPulse(true);
      clearTimeout(pulseTimeout);
      pulseTimeout = setTimeout(() => setPulse(false), 420);
      timeout = setTimeout(tick, 2200 + Math.random() * 2800);
    };

    timeout = setTimeout(tick, 1800 + Math.random() * 2200);
    return () => {
      clearTimeout(timeout);
      clearTimeout(pulseTimeout);
    };
  }, [productId]);

  const sizeClasses =
    variant === "compact"
      ? "px-2 py-[3px] text-[10px] gap-1.5"
      : variant === "hero"
        ? "px-3.5 py-1.5 text-[12px] gap-2"
        : "px-3 py-1.5 text-[11px] gap-2";

  const dotSize = variant === "compact" ? "h-1.5 w-1.5" : "h-2 w-2";

  const toneClasses =
    tone === "dark"
      ? "bg-white/15 backdrop-blur-md border border-white/30 text-white shadow-[0_4px_12px_-4px_rgba(0,0,0,0.35)]"
      : "bg-white/95 backdrop-blur border border-rose-100 text-berry-700 shadow-[0_4px_10px_-4px_rgba(155,27,90,0.18)]";

  const dotColor = tone === "dark" ? "bg-rose-300" : "bg-rose-500";
  const dotPing = tone === "dark" ? "bg-rose-300/70" : "bg-rose-500/70";
  const numberColor = tone === "dark" ? "text-white" : "text-berry-600";

  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold whitespace-nowrap select-none ${sizeClasses} ${toneClasses} ${className}`}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-label={`${count} pessoas visualizando este produto agora`}
      title={`${count} pessoas visualizando agora`}
    >
      <span className={`relative inline-flex ${dotSize}`} aria-hidden="true">
        <span
          className={`absolute inline-flex h-full w-full rounded-full ${dotPing} opacity-75 animate-ping`}
        />
        <span
          className={`relative inline-flex rounded-full ${dotSize} ${dotColor}`}
        />
      </span>
      <span className="tabular-nums leading-none flex items-baseline gap-1">
        <span
          className={`font-black tracking-tight ${numberColor} transition-transform duration-200 ${
            pulse ? "scale-110" : "scale-100"
          }`}
        >
          {count}
        </span>
        <span className="opacity-90 font-medium">
          {variant === "compact" ? "vendo agora" : "pessoas vendo agora"}
        </span>
      </span>
    </span>
  );
}
