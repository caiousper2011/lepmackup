-- AlterTable
ALTER TABLE "shipping_settings" ADD COLUMN IF NOT EXISTS "freeShippingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "shipping_settings" ADD COLUMN IF NOT EXISTS "freeShippingThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "shipping_settings" ADD COLUMN IF NOT EXISTS "freeShippingTiers" JSONB;
