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
        return {
          ok: false,
          message: "Produto indisponível no momento.",
        };
      }

      const existingQty = getProductQuantityInCart(product.id);
      const nextQty = Math.min(existingQty + quantity, stockLimit);

      if (nextQty <= existingQty) {
        return {
          ok: false,
          message:
            "Você já adicionou ao carrinho a quantidade máxima disponível deste produto.",
        };
      }

      setItems((prev) => {
        const existing = prev.find((item) => item.product.id === product.id);
        if (existing) {
          return prev.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: nextQty, product }
              : item,
          );
        }
        return [...prev, { product, quantity: nextQty }];
      });

      if (nextQty < existingQty + quantity) {
        return {
          ok: true,
          message:
            "A quantidade adicionada ao carrinho foi ajustada ao limite de estoque disponível.",
        };
      }

      return { ok: true };
    },
    [getProductQuantityInCart],
  );

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number): CartActionResult => {
      const currentItem = items.find((item) => item.product.id === productId);
      if (!currentItem) return { ok: false, message: "Item não encontrado." };

      if (quantity <= 0) {
        setItems((prev) =>
          prev.filter((item) => item.product.id !== productId),
        );
        return { ok: true };
      }

      const stockLimit = getProductStockQuantity(currentItem.product);
      const adjustedQuantity = Math.min(quantity, stockLimit);

      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: adjustedQuantity }
            : item,
        ),
      );

      if (adjustedQuantity < quantity) {
        return {
          ok: true,
          message:
            "A quantidade adicionada ao carrinho foi ajustada ao limite de estoque disponível.",
        };
      }

      return { ok: true };
    },
    [items],
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
