"use client";

import { useEffect, useState, type MouseEvent } from "react";
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
  paymentId: string | null;
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
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    phone: string | null;
    referralCode: string;
    createdAt: string;
  };
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

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendente",
  PAID: "Pago",
  PROCESSING: "Em processamento",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
  REFUNDED: "bg-gray-100 text-gray-600",
};

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Aguardando",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  REFUNDED: "Reembolsado",
  CANCELLED: "Cancelado",
};

function InfoRow({
  label,
  value,
  mono,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500 shrink-0">{label}</span>
      <span
        className={`text-sm text-gray-800 text-right break-all ${mono ? "font-mono text-xs" : ""}`}
      >
        {value || <span className="text-gray-300">—</span>}
      </span>
    </div>
  );
}

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
      if (shippingLabelUrl !== (order?.shippingLabelUrl || ""))
        body.shippingLabelUrl = shippingLabelUrl;
      if (melhorEnvioShipmentId !== (order?.melhorEnvioShipmentId || ""))
        body.melhorEnvioShipmentId = melhorEnvioShipmentId;

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

  const handleCancelOrder = async (
    forceCancelOrEvent?: boolean | MouseEvent<HTMLButtonElement>,
  ) => {
    const forceCancel =
      typeof forceCancelOrEvent === "boolean" ? forceCancelOrEvent : false;

    const isPaid = ["PAID", "PROCESSING"].includes(order?.status || "");
    const msg = forceCancel
      ? "Deseja cancelar este pedido SEM reembolso automático? O estoque será devolvido, mas o reembolso precisará ser feito manualmente no MercadoPago."
      : isPaid
        ? "Deseja cancelar este pedido pago? O valor será reembolsado automaticamente via MercadoPago."
        : "Deseja cancelar este pedido pendente? O estoque será devolvido automaticamente.";

    if (!window.confirm(msg)) return;

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
        if (res.status === 502 || res.status === 409) {
          if (
            window.confirm(
              `${errorMsg}\n\nDeseja cancelar mesmo assim SEM reembolso automático?`,
            )
          ) {
            await handleCancelOrder(true);
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
    if (
      !window.confirm(
        "Deseja cancelar o envio no Melhor Envio? A etiqueta será removida.",
      )
    )
      return;

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
            ? { ...prev, melhorEnvioShipmentId: null, shippingLabelUrl: null }
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

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading)
    return <div className="animate-pulse h-96 bg-gray-200 rounded-2xl" />;
  if (!order)
    return (
      <p className="text-center text-gray-500 py-8">Pedido não encontrado.</p>
    );

  const statusColor = STATUS_COLORS[order.status] || "bg-gray-100 text-gray-600";
  const paymentLabel =
    PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
        >
          ← Voltar
        </button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">
            Pedido #{order.orderNumber}
          </h1>
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor}`}
          >
            {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
        <span className="text-sm text-gray-400 ml-auto">
          Criado em {fmtDate(order.createdAt)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Coluna principal ────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">
          {/* Itens do pedido */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">Itens do Pedido</h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  {item.product.images?.[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.product.images[0]}
                      alt={item.product.shortName}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-100 shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {fmt(item.unitPrice)} × {item.quantity} un.
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-800 shrink-0">
                    {fmt(item.quantity * item.unitPrice)}
                  </span>
                </div>
              ))}
            </div>

            <hr className="my-4 border-gray-100" />

            <div className="space-y-1.5 text-sm max-w-xs ml-auto">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>{fmt(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Frete ({order.shippingMethod || "—"})</span>
                <span>{fmt(order.shipping)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>
                    Desconto{order.coupon ? ` (${order.coupon.code})` : ""}
                  </span>
                  <span>-{fmt(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-gray-100 pt-2 mt-1">
                <span>Total</span>
                <span className="text-rose-600">{fmt(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Dados do cliente */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Dados do Cliente
            </h2>
            <div className="divide-y divide-gray-50">
              <InfoRow label="Nome" value={order.user.name} />
              <InfoRow label="E-mail" value={order.user.email} />
              <InfoRow label="Telefone" value={order.user.phone} />
              <InfoRow
                label="Código de indicação"
                value={order.user.referralCode}
                mono
              />
              <InfoRow
                label="Cliente desde"
                value={fmtDate(order.user.createdAt)}
              />
              <InfoRow label="ID do usuário" value={order.user.id} mono />
            </div>
          </div>

          {/* Endereço de entrega */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Endereço de Entrega
            </h2>
            {order.addressSnapshot ? (
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-medium">
                  {order.addressSnapshot.street},{" "}
                  {order.addressSnapshot.number}
                  {order.addressSnapshot.complement
                    ? ` — ${order.addressSnapshot.complement}`
                    : ""}
                </p>
                <p className="text-gray-500">
                  {order.addressSnapshot.neighborhood}
                </p>
                <p className="text-gray-500">
                  {order.addressSnapshot.city} / {order.addressSnapshot.state}
                </p>
                <p className="text-gray-500">CEP: {order.addressSnapshot.cep}</p>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Endereço não registrado.
              </p>
            )}
          </div>
        </div>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <div className="space-y-6">
          {/* Gerenciar pedido */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Gerenciar Pedido
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
                      {STATUS_LABELS[s] || s}
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
                  placeholder="ID do envio"
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
                  ? "Gerando..."
                  : "Gerar / Imprimir Etiqueta Melhor Envio"}
              </button>

              {(shippingLabelUrl || order.shippingLabelUrl) && (
                <a
                  href={shippingLabelUrl || order.shippingLabelUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-indigo-700 hover:text-indigo-800 font-medium"
                >
                  Abrir etiqueta ↗
                </a>
              )}
              {(trackingUrl || order.trackingUrl) && (
                <a
                  href={trackingUrl || order.trackingUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-sm text-blue-700 hover:text-blue-800 font-medium"
                >
                  Abrir rastreio ↗
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
                      ? "Cancelar Pedido"
                      : "Cancelar e Reembolsar"}
                </button>
              )}

              {order.melhorEnvioShipmentId && (
                <button
                  onClick={handleCancelShipping}
                  disabled={cancellingShipping || saving}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2.5 rounded-xl text-sm transition-colors disabled:opacity-50"
                >
                  {cancellingShipping ? "Cancelando..." : "Cancelar Envio ME"}
                </button>
              )}
            </div>
          </div>

          {/* Informações do pedido */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-2">
              Informações do Pedido
            </h2>
            <div className="divide-y divide-gray-50">
              <InfoRow label="Nº do pedido" value={`#${order.orderNumber}`} />
              <InfoRow
                label="Status do pedido"
                value={
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor}`}
                  >
                    {STATUS_LABELS[order.status] || order.status}
                  </span>
                }
              />
              <InfoRow
                label="Pagamento"
                value={`${order.paymentMethod || "—"} — ${paymentLabel}`}
              />
              <InfoRow
                label="ID pagamento"
                value={order.paymentId || order.mercadoPagoId}
                mono
              />
              <InfoRow
                label="Método de envio"
                value={order.shippingMethod}
              />
              {order.coupon && (
                <InfoRow
                  label="Cupom"
                  value={
                    <span className="text-green-600 font-medium">
                      {order.coupon.code}
                    </span>
                  }
                />
              )}
              <InfoRow label="Criado em" value={fmtDate(order.createdAt)} />
              <InfoRow
                label="Atualizado em"
                value={fmtDate(order.updatedAt)}
              />
            </div>
          </div>

          {/* Melhor Envio */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-2">Melhor Envio</h2>
            <div className="divide-y divide-gray-50">
              {melhorEnvioBalance !== null && (
                <InfoRow
                  label="Saldo carteira"
                  value={
                    <span className="text-green-600 font-medium">
                      {melhorEnvioBalance.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  }
                />
              )}
              <InfoRow
                label="Shipment ID"
                value={order.melhorEnvioShipmentId}
                mono
              />
              <InfoRow
                label="Ambiente"
                value={
                  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
                    ? "PRODUÇÃO"
                    : "SANDBOX"
                }
              />
            </div>
          </div>

          {/* Webhook MP */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Webhooks MP</h2>
            {order.webhookLogs && order.webhookLogs.length > 0 ? (
              <div className="space-y-2">
                {order.webhookLogs.slice(0, 5).map((log) => (
                  <div
                    key={log.id}
                    className="rounded-xl border border-gray-100 p-3 text-xs"
                  >
                    <p className="font-medium text-gray-800">{log.eventType}</p>
                    <p className="text-gray-400">
                      {new Date(log.createdAt).toLocaleString("pt-BR")}
                    </p>
                    {!log.processed && (
                      <p className="text-amber-600 mt-0.5">
                        Aguardando processamento
                      </p>
                    )}
                    {log.error && (
                      <p className="text-red-600 mt-0.5">{log.error}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Nenhuma notificação registrada.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
