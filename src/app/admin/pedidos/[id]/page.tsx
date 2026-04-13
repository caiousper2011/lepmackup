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
  trackingUrl: string | null;
  shippingLabelUrl: string | null;
  melhorEnvioShipmentId: string | null;
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
  webhookLogs?: {
    id: string;
    eventType: string;
    processed: boolean;
    error: string | null;
    createdAt: string;
  }[];
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
  const [trackingUrl, setTrackingUrl] = useState("");
  const [shippingLabelUrl, setShippingLabelUrl] = useState("");
  const [melhorEnvioShipmentId, setMelhorEnvioShipmentId] = useState("");
  const [printingLabel, setPrintingLabel] = useState(false);
  const [cancellingShipping, setCancellingShipping] = useState(false);
  const [melhorEnvioBalance, setMelhorEnvioBalance] = useState<number | null>(
    null,
  );

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/admin/orders/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
          setNewStatus(data.order.status);
          setTrackingCode(data.order.trackingCode || "");
          setTrackingUrl(data.order.trackingUrl || "");
          setShippingLabelUrl(data.order.shippingLabelUrl || "");
          setMelhorEnvioShipmentId(data.order.melhorEnvioShipmentId || "");
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [params.id]);

  useEffect(() => {
    fetch("/api/admin/shipping-settings/balance")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.balance != null) setMelhorEnvioBalance(data.balance);
      })
      .catch(() => {});
  }, []);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const body: Record<string, string> = {};
      if (newStatus !== order?.status) body.status = newStatus;
      if (trackingCode !== (order?.trackingCode || ""))
        body.trackingCode = trackingCode;
      if (trackingUrl !== (order?.trackingUrl || ""))
        body.trackingUrl = trackingUrl;
      if (shippingLabelUrl !== (order?.shippingLabelUrl || "")) {
        body.shippingLabelUrl = shippingLabelUrl;
      }
      if (melhorEnvioShipmentId !== (order?.melhorEnvioShipmentId || "")) {
        body.melhorEnvioShipmentId = melhorEnvioShipmentId;
      }

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

  const handleCancelOrder = async (forceCancel = false) => {
    const isPaid = ["PAID", "PROCESSING"].includes(order?.status || "");
    const msg = forceCancel
      ? "Deseja cancelar este pedido SEM reembolso automático? O estoque será devolvido, mas o reembolso precisará ser feito manualmente no MercadoPago."
      : isPaid
        ? "Deseja cancelar este pedido pago? O valor será reembolsado automaticamente via MercadoPago."
        : "Deseja cancelar este pedido pendente? O estoque será devolvido automaticamente.";

    const confirmed = window.confirm(msg);
    if (!confirmed) return;

    setSaving(true);
    try {
      const payload: Record<string, unknown> = { status: "CANCELLED" };
      if (forceCancel) payload.forceCancel = true;

      const res = await fetch(`/api/admin/orders/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setOrder((prev) => (prev ? { ...prev, ...data.order } : prev));
        setNewStatus(data.order.status);
      } else {
        const data = await res.json();
        const errorMsg = data.error || "Erro ao cancelar pedido.";

        // If refund failed, offer force-cancel option
        if (res.status === 502 || res.status === 409) {
          const retry = window.confirm(
            `${errorMsg}\n\nDeseja cancelar mesmo assim SEM reembolso automático?`,
          );
          if (retry) {
            await handleCancelOrder(true);
            return;
          }
        } else {
          window.alert(errorMsg);
        }
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const handleCancelShipping = async () => {
    if (!order?.melhorEnvioShipmentId) return;

    const confirmed = window.confirm(
      "Deseja cancelar o envio no Melhor Envio? A etiqueta será removida.",
    );
    if (!confirmed) return;

    setCancellingShipping(true);
    try {
      const res = await fetch(
        `/api/admin/orders/${params.id}/cancel-shipping`,
        { method: "POST", headers: { "Content-Type": "application/json" } },
      );

      if (res.ok) {
        setMelhorEnvioShipmentId("");
        setShippingLabelUrl("");
        setOrder((prev) =>
          prev
            ? {
                ...prev,
                melhorEnvioShipmentId: null,
                shippingLabelUrl: null,
              }
            : prev,
        );
        window.alert("Envio cancelado com sucesso no Melhor Envio.");
      } else {
        const data = await res.json();
        window.alert(data.error || "Erro ao cancelar envio.");
      }
    } catch {
      window.alert("Erro ao cancelar envio no Melhor Envio.");
    } finally {
      setCancellingShipping(false);
    }
  };

  const handlePrintLabel = async () => {
    setPrintingLabel(true);
    try {
      const res = await fetch(`/api/admin/orders/${params.id}/shipping-label`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        window.alert(data.error || "Não foi possível gerar a etiqueta.");
        return;
      }

      const nextLabelUrl = data.labelUrl || "";
      const nextTrackingCode = data.trackingCode || "";
      const nextTrackingUrl = data.trackingUrl || "";

      setShippingLabelUrl(nextLabelUrl);
      setTrackingCode(nextTrackingCode);
      setTrackingUrl(nextTrackingUrl);

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              shippingLabelUrl: nextLabelUrl,
              trackingCode: nextTrackingCode,
              trackingUrl: nextTrackingUrl,
            }
          : prev,
      );

      if (nextLabelUrl) {
        window.open(nextLabelUrl, "_blank", "noopener,noreferrer");
      }
    } catch {
      window.alert("Erro ao gerar etiqueta do Melhor Envio.");
    } finally {
      setPrintingLabel(false);
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
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Link de rastreio
                </label>
                <input
                  type="url"
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Shipment ID (Melhor Envio)
                </label>
                <input
                  type="text"
                  value={melhorEnvioShipmentId}
                  onChange={(e) => setMelhorEnvioShipmentId(e.target.value)}
                  placeholder="ID do envio no Melhor Envio"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Link da etiqueta (manual)
                </label>
                <input
                  type="url"
                  value={shippingLabelUrl}
                  onChange={(e) => setShippingLabelUrl(e.target.value)}
                  placeholder="https://...pdf"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <button
                onClick={handlePrintLabel}
                disabled={printingLabel || saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {printingLabel
                  ? "Gerando etiqueta..."
                  : "Gerar / Imprimir etiqueta Melhor Envio"}
              </button>
              {(shippingLabelUrl || order.shippingLabelUrl) && (
                <a
                  href={shippingLabelUrl || order.shippingLabelUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm text-indigo-700 hover:text-indigo-800 font-medium"
                >
                  Abrir etiqueta para impressão ↗
                </a>
              )}
              {(trackingUrl || order.trackingUrl) && (
                <a
                  href={trackingUrl || order.trackingUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  Abrir link de rastreio ↗
                </a>
              )}
              <button
                onClick={handleUpdate}
                disabled={saving}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
              {["PENDING", "PAID", "PROCESSING"].includes(order.status) && (
                <button
                  onClick={handleCancelOrder}
                  disabled={saving}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {saving
                    ? "Cancelando..."
                    : order.status === "PENDING"
                      ? "Cancelar Pedido Pendente"
                      : "Cancelar e Reembolsar Pedido"}
                </button>
              )}
              {order.melhorEnvioShipmentId && (
                <button
                  onClick={handleCancelShipping}
                  disabled={cancellingShipping || saving}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {cancellingShipping
                    ? "Cancelando envio..."
                    : "Cancelar Envio Melhor Envio"}
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
                <span className="text-xs truncate max-w-30">
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

          {/* Webhook diagnostics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Melhor Envio</h2>
            <div className="space-y-2 text-sm">
              {melhorEnvioBalance !== null && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Saldo carteira</span>
                  <span className="font-medium text-green-600">
                    {melhorEnvioBalance.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Shipment ID</span>
                <span className="text-xs truncate max-w-30">
                  {order.melhorEnvioShipmentId || "—"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ambiente</span>
                <span className="text-xs">
                  {process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
                    ? "PRODUCTION"
                    : "SANDBOX"}
                </span>
              </div>
            </div>
          </div>

          {/* Webhook diagnostics */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Webhook MP</h2>
            {order.webhookLogs && order.webhookLogs.length > 0 ? (
              <div className="space-y-2">
                {order.webhookLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-gray-100 p-3 text-xs"
                  >
                    <p className="font-medium text-gray-800">{log.eventType}</p>
                    <p className="text-gray-500">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </p>
                    {!log.processed && (
                      <p className="text-amber-600">Aguardando processamento</p>
                    )}
                    {log.error && <p className="text-red-600">{log.error}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Nenhuma notificação de webhook registrada para este pedido.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
