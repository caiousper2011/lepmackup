"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  Product,
  PROMO_PRICE,
  BULK_PRICE,
  BULK_THRESHOLD,
  WHATSAPP_NUMBER,
} from "@/data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalQuantity: number;
  unitPrice: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("lp-makeup-cart");
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // ignore corrupt data
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("lp-makeup-cart", JSON.stringify(items));
  }, [items]);

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const unitPrice = totalQuantity >= BULK_THRESHOLD ? BULK_PRICE : PROMO_PRICE;
  const totalPrice = totalQuantity * unitPrice;

  const addToCart = useCallback((product: Product) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      ),
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems: items.length,
        totalQuantity,
        unitPrice,
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
  installments?: number,
): string {
  let msg = "🛍️ *Novo Pedido — L&P Makeup*\n\n";
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
    msg += `💳 Forma de pagamento: *Cartão de Crédito*\n`;
    if (installments && installments > 1) {
      const installmentValue = totalPrice / installments;
      msg += `📋 Parcelamento: ${installments}x de R$ ${installmentValue.toFixed(2)}\n`;
    }
  }

  msg += "\n⏳ Aguardo o link de pagamento. Obrigada! 💖";

  return msg;
}

export function getWhatsAppURL(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
