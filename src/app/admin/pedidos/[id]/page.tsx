"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

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
  shippingMethod: string | null;
  paymentMethod: string | null;
  mercadoPagoId: string | null;
  addressSnapshot: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  } | null;
  createdAt: string;
  user: { email: string; name: string | null; phone: string | null };
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    product: { name: string; shortName: string; images: string[] };
  }[];
  coupon: { code: string; type: string; value: number } | null;
}

const ALL_STATUSES = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingCode, setTrackingCode] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
          setNewStatus(data.order.status);
          setTrackingCode(data.order.trackingCode || "");
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (newStatus !== order?.status) body.status = newStatus;
      if (trackingCode !== (order?.trackingCode || ""))
        body.trackingCode = trackingCode;

      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        const data = await res.json();
        setOrder((prev) => (prev ? { ...prev, ...data.order } : prev));
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleCancelPending = async () => {
    if (order?.status !== "PENDING") return;

    const confirmed = window.confirm(
      "Deseja cancelar este pedido pendente? O estoque será devolvido automaticamente.",
    );
    if (!confirmed) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrder((prev) => (prev ? { ...prev, ...data.order } : prev));
        setNewStatus("CANCELLED");
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading)
    return <div className="animate-pulse h-96 bg-gray-200 rounded-2xl" />;
  if (!order)
    return (
      <p className="text-center text-gray-500 py-8">Pedido não encontrado.</p>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Voltar
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Pedido #{order.orderNumber}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Itens</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium">
                      {item.product.shortName}
                    </span>
                    <span className="text-gray-500 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-medium">
                    {fmt(item.quantity * item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>
            <hr className="my-3 border-gray-100" />
            <div className="space-y-1 text-sm">
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
              <div className="flex justify-between font-bold text-base pt-1">
                <span>Total</span>
                <span className="text-rose-600">{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer / Address */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Cliente</h2>
            <p className="text-sm text-gray-600">{order.user.name || "—"}</p>
            <p className="text-sm text-gray-500">{order.user.email}</p>
            {order.user.phone && (
              <p className="text-sm text-gray-500">{order.user.phone}</p>
            )}
            {order.addressSnapshot && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                  Endereço
                </p>
                <p className="text-sm text-gray-600">
                  {order.addressSnapshot.street}, {order.addressSnapshot.number}
                  {order.addressSnapshot.complement
                    ? ` - ${order.addressSnapshot.complement}`
                    : ""}
                </p>
                <p className="text-sm text-gray-500">
                  {order.addressSnapshot.neighborhood},{" "}
                  {order.addressSnapshot.city}/{order.addressSnapshot.state} —{" "}
                  {order.addressSnapshot.cep}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Update status */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">
              Atualizar Pedido
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Código de rastreio
                </label>
                <input
                  type="text"
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  placeholder="Ex: NL123456789BR"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
              {order.status === "PENDING" && (
                <button
                  onClick={handleCancelPending}
                  disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {saving ? "Cancelando..." : "Cancelar Pedido Pendente"}
                </button>
              )}
            </div>
          </div>

          {/* Payment info */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Pagamento</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium">{order.paymentStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Método</span>
                <span>{order.paymentMethod || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">MP ID</span>
                <span className="text-xs truncate max-w-[120px]">
                  {order.mercadoPagoId || "—"}
                </span>
              </div>
              {order.coupon && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Cupom</span>
                  <span className="font-medium text-green-600">
                    {order.coupon.code}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
