const DEFAULT_WHATSAPP_NUMBER = "5511952875150";

export function normalizeWhatsAppNumber(value: string | undefined): string {
  return (value || "").replace(/\D/g, "");
}

export const WHATSAPP_NUMBER =
  normalizeWhatsAppNumber(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) ||
  DEFAULT_WHATSAPP_NUMBER;

export function getWhatsAppHref(message?: string): string {
  const baseUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
  if (!message) return baseUrl;

  return `${baseUrl}?text=${encodeURIComponent(message)}`;
}
