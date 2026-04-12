"use client";

import { useEffect, useState, useCallback } from "react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  appliesTo: string;
  value: number;
  minValue: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    code: "",
    type: "PERCENT" as "PERCENT" | "FIXED",
    appliesTo: "TOTAL" as "PRODUCT" | "SHIPPING" | "TOTAL",
    value: "",
    minValue: "",
    maxUses: "",
    expiresAt: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/coupons");
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (c: Coupon) => {
    setForm({
      code: c.code,
      type: c.type as "PERCENT" | "FIXED",
      appliesTo: (c.appliesTo || "TOTAL") as "PRODUCT" | "SHIPPING" | "TOTAL",
      value: c.value.toString(),
      minValue: c.minValue?.toString() || "",
      maxUses: c.maxUses?.toString() || "",
      expiresAt: c.expiresAt ? c.expiresAt.split("T")[0] : "",
    });
    setEditingId(c.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        code: form.code.toUpperCase(),
        type: form.type,
        appliesTo: form.appliesTo,
        value: parseFloat(form.value),
      };
      if (form.minValue) body.minValue = parseFloat(form.minValue);
      if (form.maxUses) body.maxUses = parseInt(form.maxUses);
      if (form.expiresAt)
        body.expiresAt = new Date(form.expiresAt).toISOString();

      const url = editingId
        ? `/api/admin/coupons/${editingId}`
        : "/api/admin/coupons";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowForm(false);
        fetchCoupons();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    if (c.active) {
      await fetch(`/api/admin/coupons/${c.id}`, { method: "DELETE" });
    } else {
      await fetch(`/api/admin/coupons/${c.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
    }
    fetchCoupons();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Cupons</h1>
        <button
          onClick={openCreate}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          + Novo Cupom
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold mb-4">
              {editingId ? "Editar Cupom" : "Novo Cupom"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Código
                </label>
                <input
                  type="text"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm uppercase focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Tipo
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        type: e.target.value as "PERCENT" | "FIXED",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="PERCENT">Porcentagem (%)</option>
                    <option value="FIXED">Valor Fixo (R$)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Aplica em
                  </label>
                  <select
                    value={form.appliesTo}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        appliesTo: e.target.value as
                          | "PRODUCT"
                          | "SHIPPING"
                          | "TOTAL",
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="TOTAL">Valor Total</option>
                    <option value="PRODUCT">Somente Produto</option>
                    <option value="SHIPPING">Somente Frete</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.value}
                    onChange={(e) =>
                      setForm({ ...form, value: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Pedido mínimo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.minValue}
                    onChange={(e) =>
                      setForm({ ...form, minValue: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Usos máximos
                  </label>
                  <input
                    type="number"
                    value={form.maxUses}
                    onChange={(e) =>
                      setForm({ ...form, maxUses: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Expira em
                </label>
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-gray-900 hover:bg-gray-800 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
                >
                  {saving
                    ? "Salvando..."
                    : editingId
                      ? "Atualizar"
                      : "Criar Cupom"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Código</th>
              <th className="px-5 py-3 text-left">Tipo</th>
              <th className="px-5 py-3 text-left">Aplica em</th>
              <th className="px-5 py-3 text-left">Valor</th>
              <th className="px-5 py-3 text-left">Mín.</th>
              <th className="px-5 py-3 text-left">Usos</th>
              <th className="px-5 py-3 text-left">Expira</th>
              <th className="px-5 py-3 text-left">Ativo</th>
              <th className="px-5 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-8 text-center text-sm text-gray-400"
                >
                  Carregando...
                </td>
              </tr>
            ) : coupons.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-8 text-center text-sm text-gray-400"
                >
                  Nenhum cupom cadastrado.
                </td>
              </tr>
            ) : (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-mono font-medium">
                    {c.code}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {c.type === "PERCENT" ? "%" : "R$"}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {c.appliesTo === "PRODUCT"
                      ? "Produto"
                      : c.appliesTo === "SHIPPING"
                        ? "Frete"
                        : "Total"}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium">
                    {c.type === "PERCENT"
                      ? `${c.value}%`
                      : `R$${c.value.toFixed(2)}`}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {c.minValue ? `R$${c.minValue.toFixed(2)}` : "—"}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {c.usedCount}
                    {c.maxUses ? `/${c.maxUses}` : ""}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {c.expiresAt
                      ? new Date(c.expiresAt).toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(c)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${c.active ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${c.active ? "left-5" : "left-0.5"}`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => openEdit(c)}
                      className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
