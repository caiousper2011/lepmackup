import { prisma } from "@/lib/prisma";

const DEFAULT_SETTINGS_ID = "default";

const DEFAULT_SHIPPING_SETTINGS = {
  pickupEnabled: false,
  pickupAddress: "Retirada no endereço da loja",
  pickupInstructions: null as string | null,
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
