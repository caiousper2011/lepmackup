"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

interface OrderData {
  id: string;
  orderNumber: number;
  total: number;
  status: string;
  paymentStatus: string;
  items: { quantity: number; productSnapshot: { name: string } }[];
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const status = (searchParams.get("status") || "pending").toLowerCase();
  const paymentIdFromQuery =
    searchParams.get("payment_id") || searchParams.get("collection_id") || "";
  const { clearCart } = useCart();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        if (paymentIdFromQuery) {
          await fetch(`/api/orders/${orderId}/confirm-payment`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentId: paymentIdFromQuery }),
          });
        }

        const res = await fetch(`/api/orders/${orderId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);

          if (data.order?.paymentStatus === "APPROVED") {
            clearCart();
          }
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();

    const pollForApproval = setInterval(async () => {
      if (!orderId) return;
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data.order?.paymentStatus === "APPROVED") {
          setOrder(data.order);
          clearCart();
          clearInterval(pollForApproval);
        }
      } catch {
        // ignore polling errors
      }
    }, 4000);

    return () => clearInterval(pollForApproval);
  }, [orderId, paymentIdFromQuery, clearCart]);

  const displayStatus = (() => {
    if (order?.paymentStatus === "APPROVED") return "approved";
    if (
      order?.paymentStatus === "REJECTED" ||
      order?.paymentStatus === "CANCELLED"
    ) {
      return "failure";
    }
    if (
      order?.paymentStatus === "IN_PROCESS" ||
      order?.paymentStatus === "PENDING"
    ) {
      return "pending";
    }
    return status;
  })();

  const statusConfig = {
    approved: {
      icon: "✅",
      title: "Pagamento Aprovado!",
      desc: "Seu pedido foi confirmado e está sendo processado.",
      color: "text-green-600",
      bg: "bg-green-50 border-green-200",
    },
    pending: {
      icon: "⏳",
      title: "Pagamento Pendente",
      desc: "Estamos aguardando a confirmação do pagamento.",
      color: "text-amber-600",
      bg: "bg-amber-50 border-amber-200",
    },
    failure: {
      icon: "❌",
      title: "Pagamento não Aprovado",
      desc: "Houve um problema com o pagamento. Tente novamente.",
      color: "text-red-600",
      bg: "bg-red-50 border-red-200",
    },
  }[displayStatus] || {
    icon: "📦",
    title: "Pedido Realizado",
    desc: "Acompanhe o status do seu pedido na área do cliente.",
    color: "text-gray-600",
    bg: "bg-gray-50 border-gray-200",
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="animate-pulse">
          <div className="w-20 h-20 rounded-full bg-gray-200 mx-auto mb-4" />
          <div className="h-6 bg-gray-200 rounded w-48 mx-auto mb-2" />
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className={`rounded-2xl border p-8 text-center ${statusConfig.bg}`}>
        <div className="text-5xl mb-4">{statusConfig.icon}</div>
        <h1 className={`text-2xl font-bold mb-2 ${statusConfig.color}`}>
          {statusConfig.title}
        </h1>
        <p className="text-gray-600">{statusConfig.desc}</p>

        {order && (
          <div className="mt-6 bg-white rounded-xl p-4 text-left">
            <p className="text-sm text-gray-500">
              Pedido{" "}
              <span className="font-bold text-gray-900">
                #{order.orderNumber}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total:{" "}
              <span className="font-bold text-rose-600">
                {order.total.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {order.items.reduce((s, i) => s + i.quantity, 0)} item(ns)
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-8 justify-center">
        <Link
          href="/minha-conta/pedidos"
          className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-xl transition-colors"
        >
          Ver Meus Pedidos
        </Link>
        <Link
          href="/"
          className="px-6 py-3 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
        >
          Continuar Comprando
        </Link>
      </div>
    </div>
  );
}
