"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";
import { Product, BULK_THRESHOLD, getProductUnitPrice } from "@/data/products";
import { getWhatsAppHref } from "@/lib/whatsapp-config";

const DEFAULT_MAX_ITEMS = 6;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartActionResult {
  ok: boolean;
  message?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => CartActionResult;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => CartActionResult;
  clearCart: () => void;
  totalItems: number;
  totalQuantity: number;
  isBulkPricing: boolean;
  getItemUnitPrice: (product: Product) => number;
  getProductQuantityInCart: (productId: string) => number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  maxItemsPerOrder: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "lp-makeup-cart";

function getProductStockQuantity(product: Product): number {
  if (typeof product.stockQuantity !== "number") {
    return Number.MAX_SAFE_INTEGER;
  }
  return Math.max(0, product.stockQuantity);
}

function readCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];

  const saved = localStorage.getItem(CART_STORAGE_KEY);
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readCartFromStorage());
  const [isOpen, setIsOpen] = useState(false);
  const [maxItemsPerOrder, setMaxItemsPerOrder] = useState(DEFAULT_MAX_ITEMS);

  // Busca o limite de itens configurado pelo admin
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (typeof data.maxItemsPerOrder === "number" && data.maxItemsPerOrder > 0) {
          setMaxItemsPerOrder(data.maxItemsPerOrder);
        }
      })
      .catch(() => {
        // mantém o padrão se a API falhar
      });
  }, []);

  const hasHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const effectiveItems = useMemo(
    () => (hasHydrated ? items : []),
    [hasHydrated, items],
  );

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalQuantity = effectiveItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const isBulkPricing = totalQuantity >= BULK_THRESHOLD;

  const getItemUnitPrice = useCallback(
    (product: Product) => getProductUnitPrice(product, totalQuantity),
    [totalQuantity],
  );

  const totalPrice = effectiveItems.reduce(
    (sum, item) => sum + item.quantity * getItemUnitPrice(item.product),
    0,
  );

  const getProductQuantityInCart = useCallback(
    (productId: string) =>
      effectiveItems.find((item) => item.product.id === productId)?.quantity ??
      0,
    [effectiveItems],
  );

  const addToCart = useCallback(
    (product: Product, quantity = 1): CartActionResult => {
      if (quantity <= 0) {
        return { ok: false, message: "Quantidade inválida." };
      }

      const stockLimit = getProductStockQuantity(product);
      if (stockLimit <= 0) {
        return { ok: false, message: "Produto indisponível no momento." };
      }

      // Usa updater funcional para SEMPRE ter o estado mais recente
      // (evita stale closure quando o usuário clica rápido em vários produtos)
      let result: CartActionResult = { ok: true };

      setItems((prev) => {
        const currentTotal = prev.reduce((sum, it) => sum + it.quantity, 0);
        const existing = prev.find((it) => it.product.id === product.id);
        const existingQty = existing?.quantity ?? 0;
        const otherItemsTotal = currentTotal - existingQty;
        const availableSlots = maxItemsPerOrder - otherItemsTotal;

        if (availableSlots <= 0) {
          result = {
            ok: false,
            message: `Limite de ${maxItemsPerOrder} itens por pedido atingido. Para comprar mais, finalize este pedido e faça um novo.`,
          };
          return prev; // não modifica o carrinho
        }

        const nextQty = Math.min(
          existingQty + quantity,
          stockLimit,
          existingQty + availableSlots,
        );

        if (nextQty <= existingQty) {
          result = {
            ok: false,
            message:
              "Você já adicionou ao carrinho a quantidade máxima disponível deste produto.",
          };
          return prev;
        }

        if (nextQty < existingQty + quantity) {
          const limitedByOrder =
            nextQty === existingQty + availableSlots &&
            availableSlots < quantity;
          result = {
            ok: true,
            message: limitedByOrder
              ? `Quantidade ajustada: limite de ${maxItemsPerOrder} itens por pedido. Para comprar mais, faça um novo pedido.`
              : "A quantidade foi ajustada ao limite de estoque disponível.",
          };
        }

        if (existing) {
          return prev.map((it) =>
            it.product.id === product.id
              ? { ...it, quantity: nextQty, product }
              : it,
          );
        }
        return [...prev, { product, quantity: nextQty }];
      });

      return result;
    },
    [maxItemsPerOrder],
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number): CartActionResult => {
      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((item) => item.product.id !== productId),
        );
        return { ok: true };
      }

      let result: CartActionResult = { ok: true };

      setItems((prev) => {
        const currentItem = prev.find((it) => it.product.id === productId);
        if (!currentItem) {
          result = { ok: false, message: "Item não encontrado." };
          return prev;
        }

        const stockLimit = getProductStockQuantity(currentItem.product);
        const otherItemsTotal = prev
          .filter((it) => it.product.id !== productId)
          .reduce((sum, it) => sum + it.quantity, 0);
        const maxAllowed = Math.min(
          stockLimit,
          maxItemsPerOrder - otherItemsTotal,
        );
        const adjustedQuantity = Math.min(quantity, maxAllowed);

        if (adjustedQuantity <= 0) {
          result = {
            ok: false,
            message: `Limite de ${maxItemsPerOrder} itens por pedido atingido.`,
          };
          return prev;
        }

        if (adjustedQuantity < quantity) {
          const limitedByOrder =
            adjustedQuantity === maxItemsPerOrder - otherItemsTotal;
          result = {
            ok: true,
            message: limitedByOrder
              ? `Limite de ${maxItemsPerOrder} itens por pedido. Para comprar mais, faça um novo pedido.`
              : "Quantidade ajustada ao limite de estoque disponível.",
          };
        }

        return prev.map((it) =>
          it.product.id === productId
            ? { ...it, quantity: adjustedQuantity }
            : it,
        );
      });

      return result;
    },
    [maxItemsPerOrder],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items: effectiveItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems: effectiveItems.length,
        totalQuantity,
        isBulkPricing,
        getItemUnitPrice,
        getProductQuantityInCart,
        totalPrice,
        isOpen,
        setIsOpen,
        maxItemsPerOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function buildWhatsAppMessage(
  items: CartItem[],
  unitPrice: number,
  totalPrice: number,
  paymentMethod: "pix" | "cartao",
): string {
  let msg = "🛍️ *Novo Pedido — L&PMakeUp*\n\n";
  msg += "━━━━━━━━━━━━━━━━━━\n";

  items.forEach((item) => {
    const itemTotal = item.quantity * unitPrice;
    msg += `▸ ${item.product.shortName}\n`;
    msg += `  Qtd: ${item.quantity} × R$ ${unitPrice.toFixed(2)} = R$ ${itemTotal.toFixed(2)}\n\n`;
  });

  msg += "━━━━━━━━━━━━━━━━━━\n";
  msg += `📦 Total de itens: ${items.reduce((s, i) => s + i.quantity, 0)}\n`;
  msg += `💰 *TOTAL: R$ ${totalPrice.toFixed(2)}*\n\n`;

  if (paymentMethod === "pix") {
    msg += "💳 Forma de pagamento: *PIX*\n";
  } else {
    msg += "💳 Forma de pagamento: *Crédito à Vista (link de pagamento)*\n";
  }

  msg += "\n⏳ Aguardo o link de pagamento. Obrigada! 💖";

  return msg;
}

export function getWhatsAppURL(message: string): string {
  return getWhatsAppHref(message);
}
