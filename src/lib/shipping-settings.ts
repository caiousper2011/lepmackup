import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS_ID = "default";

export interface FreeShippingTier {
  minValue: number;
  discountPercent: number;
  label?: string | null;
}

const DEFAULT_SHIPPING_SETTINGS = {
  pickupEnabled: false,
  pickupAddress: "Retirada no endereço da loja",
  pickupInstructions: null as string | null,
  maxItemsPerOrder: 6,
  freeShippingEnabled: false,
  freeShippingThreshold: 0,
};

export async function getOrCreateShippingSettings() {
  return prisma.shippingSettings.upsert({
    where: { id: DEFAULT_SETTINGS_ID },
    update: {},
    create: {
      id: DEFAULT_SETTINGS_ID,
      ...DEFAULT_SHIPPING_SETTINGS,
    },
  });
}

export function parseFreeShippingTiers(raw: unknown): FreeShippingTier[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((entry) => {
      if (typeof entry !== "object" || entry === null) return null;
      const e = entry as Record<string, unknown>;
      const minValue = Number(e.minValue);
      const discountPercent = Number(e.discountPercent);
      if (!Number.isFinite(minValue) || minValue < 0) return null;
      if (
        !Number.isFinite(discountPercent) ||
        discountPercent <= 0 ||
        discountPercent > 100
      ) {
        return null;
      }
      const label =
        typeof e.label === "string" && e.label.trim() ? e.label.trim() : null;
      return {
        minValue,
        discountPercent,
        label,
      } as FreeShippingTier;
    })
    .filter((tier): tier is FreeShippingTier => tier !== null)
    .sort((a, b) => a.minValue - b.minValue);
}

export interface FreeShippingApplication {
  enabled: boolean;
  threshold: number;
  reachedThreshold: boolean;
  matchedTier: FreeShippingTier | null;
  discountPercent: number;
  amountToNextMilestone: number;
  nextMilestoneValue: number | null;
}

export function evaluateFreeShipping(
  subtotal: number,
  settings: {
    freeShippingEnabled: boolean;
    freeShippingThreshold: number;
    freeShippingTiers: unknown;
  },
): FreeShippingApplication {
  if (!settings.freeShippingEnabled) {
    return {
      enabled: false,
      threshold: 0,
      reachedThreshold: false,
      matchedTier: null,
      discountPercent: 0,
      amountToNextMilestone: 0,
      nextMilestoneValue: null,
    };
  }

  const tiers = parseFreeShippingTiers(settings.freeShippingTiers);
  const threshold = settings.freeShippingThreshold || 0;
  const reachedThreshold = threshold > 0 && subtotal >= threshold;

  // Find the highest tier reached
  const reachedTier = [...tiers]
    .reverse()
    .find((tier) => subtotal >= tier.minValue) || null;

  const discountPercent = reachedThreshold
    ? 100
    : reachedTier?.discountPercent ?? 0;

  // Determine next milestone (tier or final threshold)
  const allMilestones: number[] = [];
  for (const tier of tiers) {
    if (tier.minValue > subtotal) allMilestones.push(tier.minValue);
  }
  if (threshold > 0 && threshold > subtotal) {
    allMilestones.push(threshold);
  }
  const nextMilestoneValue =
    allMilestones.length > 0 ? Math.min(...allMilestones) : null;
  const amountToNextMilestone =
    nextMilestoneValue !== null
      ? Math.max(0, nextMilestoneValue - subtotal)
      : 0;

  return {
    enabled: true,
    threshold,
    reachedThreshold,
    matchedTier: reachedTier,
    discountPercent,
    amountToNextMilestone,
    nextMilestoneValue,
  };
}

export function applyFreeShippingDiscount(
  shippingPrice: number,
  application: FreeShippingApplication,
): { finalPrice: number; discountAmount: number } {
  if (!application.enabled || application.discountPercent <= 0) {
    return { finalPrice: shippingPrice, discountAmount: 0 };
  }
  const discountAmount =
    Math.round(((shippingPrice * application.discountPercent) / 100) * 100) /
    100;
  const finalPrice = Math.max(
    0,
    Math.round((shippingPrice - discountAmount) * 100) / 100,
  );
  return { finalPrice, discountAmount };
}
