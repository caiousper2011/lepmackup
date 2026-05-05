"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/data/products";

interface FreeShippingTier {
  minValue: number;
  discountPercent: number;
  label?: string | null;
}

interface FreeShippingConfig {
  enabled: boolean;
  threshold: number;
  tiers: FreeShippingTier[];
}

let cachedConfig: FreeShippingConfig | null = null;
let cachedConfigPromise: Promise<FreeShippingConfig | null> | null = null;

async function fetchFreeShippingConfig(): Promise<FreeShippingConfig | null> {
  if (cachedConfig) return cachedConfig;
  if (cachedConfigPromise) return cachedConfigPromise;

  cachedConfigPromise = (async () => {
    try {
      const res = await fetch("/api/settings");
      if (!res.ok) return null;
      const data = await res.json();
      const fs = data.freeShipping;
      if (!fs) return null;
      const config: FreeShippingConfig = {
        enabled: !!fs.enabled,
        threshold: Number(fs.threshold) || 0,
        tiers: Array.isArray(fs.tiers)
          ? fs.tiers
              .map((t: { minValue: unknown; discountPercent: unknown; label?: unknown }) => ({
                minValue: Number(t.minValue) || 0,
                discountPercent: Number(t.discountPercent) || 0,
                label: typeof t.label === "string" ? t.label : null,
              }))
              .filter(
                (t: FreeShippingTier) =>
                  t.minValue > 0 &&
                  t.discountPercent > 0 &&
                  t.discountPercent <= 100,
              )
          : [],
      };
      cachedConfig = config;
      return config;
    } catch {
      return null;
    }
  })();

  return cachedConfigPromise;
}

interface Milestone {
  value: number;
  discountPercent: number;
  label: string;
}

function buildMilestones(config: FreeShippingConfig): Milestone[] {
  const milestones: Milestone[] = config.tiers
    .filter((tier) => tier.minValue > 0)
    .map((tier) => ({
      value: tier.minValue,
      discountPercent: tier.discountPercent,
      label: tier.label?.trim() || `${tier.discountPercent}% off frete`,
    }));

  if (config.threshold > 0) {
    milestones.push({
      value: config.threshold,
      discountPercent: 100,
      label: "Frete grátis",
    });
  }

  return milestones.sort((a, b) => a.value - b.value);
}

export default function FreeShippingProgress({
  subtotal,
  variant = "drawer",
}: {
  subtotal: number;
  variant?: "drawer" | "checkout";
}) {
  const [config, setConfig] = useState<FreeShippingConfig | null>(cachedConfig);

  useEffect(() => {
    let mounted = true;
    if (!config) {
      fetchFreeShippingConfig().then((c) => {
        if (mounted) setConfig(c);
      });
    }
    return () => {
      mounted = false;
    };
  }, [config]);

  if (!config || !config.enabled) return null;

  const milestones = buildMilestones(config);
  if (milestones.length === 0) return null;

  const finalMilestone = milestones[milestones.length - 1];
  const totalGoal = finalMilestone.value;
  const progressPercent = Math.min(
    100,
    Math.max(0, (subtotal / totalGoal) * 100),
  );

  // Highest milestone reached
  const reachedMilestone = [...milestones]
    .reverse()
    .find((m) => subtotal >= m.value);

  // Next milestone to motivate
  const nextMilestone = milestones.find((m) => subtotal < m.value);

  const reachedFull = reachedMilestone?.discountPercent === 100;

  const containerClass =
    variant === "checkout"
      ? "bg-gradient-to-r from-green-50 to-blush-50 border border-rose-100 rounded-2xl p-4"
      : "gradient-berry-soft border border-rose-100 rounded-2xl p-3.5";

  return (
    <div className={containerClass}>
      {reachedFull ? (
        <p className="text-[12px] sm:text-sm font-semibold text-green-700 text-center">
          🎉 Você ganhou frete grátis!
        </p>
      ) : reachedMilestone ? (
        <p className="text-[12px] sm:text-sm font-semibold text-berry-700 text-center">
          ✅ {reachedMilestone.discountPercent}% de desconto no frete ativado!
          {nextMilestone && (
            <>
              {" "}
              Faltam{" "}
              <span className="font-black text-berry-600">
                {formatPrice(nextMilestone.value - subtotal)}
              </span>{" "}
              para {nextMilestone.label.toLowerCase()}.
            </>
          )}
        </p>
      ) : nextMilestone ? (
        <p className="text-[12px] sm:text-sm font-medium text-berry-700 text-center">
          Faltam{" "}
          <span className="font-black text-berry-600">
            {formatPrice(nextMilestone.value - subtotal)}
          </span>{" "}
          para {nextMilestone.label.toLowerCase()}!
        </p>
      ) : null}

      <div className="relative mt-2.5 h-2 bg-white/70 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-berry-500 to-rose-500 transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        />
        {milestones.map((m) => {
          const left = Math.min(100, (m.value / totalGoal) * 100);
          const reached = subtotal >= m.value;
          return (
            <div
              key={m.value}
              className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full border ${
                reached
                  ? "bg-berry-600 border-berry-600"
                  : "bg-white border-rose-300"
              }`}
              style={{ left: `${left}%` }}
              title={`${formatPrice(m.value)} — ${m.label}`}
            />
          );
        })}
      </div>

      {milestones.length > 1 && (
        <div className="mt-2 flex justify-between text-[10px] text-gray-500 font-medium">
          {milestones.map((m) => (
            <span key={m.value} className="flex-1 text-center">
              {formatPrice(m.value)}
              <span className="block text-[9px] text-berry-700 font-semibold">
                {m.discountPercent === 100
                  ? "Frete grátis"
                  : `-${m.discountPercent}%`}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
