"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface OrderDetail {
  id: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  trackingCode: string | null;
  trackingUrl: string | null;
  shippingMethod: string | null;
  addressSnapshot: {
    pickupAddress?: string;
    pickupInstructions?: string;
    street?: string;
    number?: string;
    complement?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    cep?: string;
  } | null;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: { shortName: string; slug: string };
  }[];
}

const STATUS_FLOW = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando pagamento",
  PAID: "Pagamento aprovado",
  PROCESSING: "Pedido em preparação",
  SHIPPED: "Pedido enviado",
  DELIVERED: "Pedido entregue",
  CANCELLED: "Pedido cancelado",
  REFUNDED: "Pedido reembolsado",
};

export default function MeuPedidoDetalhePage() {
  const params = useParams();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId =
    typeof params.id === "string"
      ? params.id
      : Array.isArray(params.id)
        ? params.id[0]
        : "";

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId]);

  const isPickup = order?.shippingMethod === "PICKUP_STORE";

  const fmt = (value: number) =>
    value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const currentStepIndex = useMemo(() => {
    if (!order) return -1;
    return STATUS_FLOW.findIndex((step) => step === order.status);
  }, [order]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse h-72 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-gray-500">Pedido não encontrado.</p>
        <Link
          href="/minha-conta/pedidos"
          className="mt-4 inline-flex text-sm font-medium text-berry-600 hover:text-berry-700"
        >
          Voltar para meus pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/minha-conta/pedidos"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Meus Pedidos
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          Pedido #{order.orderNumber}
        </h1>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
        <p className="text-sm text-gray-500">
          Realizado em{" "}
          {new Date(order.createdAt).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </p>
        <p className="text-sm">
          <span className="text-gray-500">Status atual:</span>{" "}
          <span className="font-semibold text-gray-900">
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </p>

        {order.status === "CANCELLED" && (
          <p className="text-sm text-red-600">Este pedido foi cancelado.</p>
        )}

        {order.status === "REFUNDED" && (
          <p className="text-sm text-gray-600">
            O pagamento deste pedido foi reembolsado.
          </p>
        )}

        {order.trackingCode && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs text-blue-700">Código de rastreio</p>
            <p className="font-mono font-semibold text-blue-900 mt-1">
              {order.trackingCode}
            </p>
            {order.trackingUrl && (
              <a
                href={order.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex mt-2 text-sm font-medium text-blue-700 hover:text-blue-800"
              >
                Acompanhar encomenda ↗
              </a>
            )}
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">
          Progresso do pedido
        </h2>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {STATUS_FLOW.map((step, index) => {
            const completed = currentStepIndex >= index;
            const isCurrent = order.status === step;

            return (
              <div
                key={step}
                className={`rounded-xl border p-3 ${
                  completed
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                <p
                  className={`text-xs ${completed ? "text-emerald-700" : "text-gray-500"}`}
                >
                  Etapa {index + 1}
                </p>
                <p
                  className={`text-sm font-medium ${completed ? "text-emerald-800" : "text-gray-700"}`}
                >
                  {STATUS_LABELS[step]}
                </p>
                {isCurrent && (
                  <p className="text-xs text-emerald-700 mt-1">Status atual</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Itens do pedido</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/produto/${item.product.slug}`}
                  className="text-gray-700 hover:text-berry-600"
                >
                  {item.product.shortName}
                  <span className="text-gray-400 ml-2">x{item.quantity}</span>
                </Link>
                <span className="font-medium">
                  {fmt(item.quantity * item.unitPrice)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span>{fmt(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Frete</span>
              <span>{fmt(order.shipping)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto</span>
                <span>-{fmt(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold pt-1 border-t border-gray-100">
              <span>Total</span>
              <span className="text-berry-600">{fmt(order.total)}</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 space-y-1 text-sm">
            <p className="text-gray-500">Entrega</p>
            {isPickup ? (
              <>
                <p className="font-medium text-gray-800">
                  {order.addressSnapshot?.pickupAddress ||
                    "Retirada no endereço da loja"}
                </p>
                {order.addressSnapshot?.pickupInstructions && (
                  <p className="text-gray-500 text-xs">
                    {order.addressSnapshot.pickupInstructions}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="font-medium text-gray-800">
                  {order.addressSnapshot?.street},{" "}
                  {order.addressSnapshot?.number}
                </p>
                <p className="text-gray-500 text-xs">
                  {order.addressSnapshot?.neighborhood} —{" "}
                  {order.addressSnapshot?.city}/{order.addressSnapshot?.state}
                </p>
                <p className="text-gray-500 text-xs">
                  CEP {order.addressSnapshot?.cep}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
