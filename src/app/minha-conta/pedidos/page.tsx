"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { name: string; shortName: string; slug: string; images: string[] };
}

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  total: number;
  trackingCode: string | null;
  trackingUrl: string | null;
  createdAt: string;
  items: OrderItem[];
}

const statusLabels: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  PROCESSING: "Processando",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-700",
};

export default function MeusPedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders);
        }
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const canViewDetails = (order: Order) =>
    order.paymentStatus === "APPROVED" ||
    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "REFUNDED"].includes(
      order.status,
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/minha-conta"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Minha Conta
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Meus Pedidos</h1>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">
            Você ainda não fez nenhum pedido.
          </p>
          <Link
            href="/"
            className="inline-block gradient-berry text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            Ir às Compras
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-2xl border border-gray-200 p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Pedido #{order.orderNumber}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100"}`}
                  >
                    {statusLabels[order.status] || order.status}
                  </span>
                  <p className="text-sm font-bold text-berry-600 mt-1">
                    {fmt(order.total)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <Link
                      href={`/produto/${item.product.slug}`}
                      className="text-gray-600 hover:text-berry-600 transition-colors"
                    >
                      {item.product.shortName}{" "}
                      <span className="text-gray-400">x{item.quantity}</span>
                    </Link>
                    <span className="text-gray-500">
                      {fmt(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                ))}
              </div>

              {order.trackingCode && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-500">
                    Código de rastreio:{" "}
                    <span className="font-mono font-medium text-gray-700">
                      {order.trackingCode}
                    </span>
                  </p>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Acompanhar encomenda ↗
                    </a>
                  )}
                </div>
              )}

              {canViewDetails(order) && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                  <Link
                    href={`/minha-conta/pedidos/${order.id}`}
                    className="text-sm font-medium text-berry-600 hover:text-berry-700"
                  >
                    Ver detalhes do pedido
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
