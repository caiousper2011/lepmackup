"use client";

import { useCallback, useEffect, useState } from "react";

interface ShippingRule {
  id: string;
  name: string;
  maxItems: number;
  widthCm: number;
  heightCm: number;
  lengthCm: number;
  active: boolean;
}

interface ShippingSettings {
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupInstructions: string;
}

export default function AdminFretePage() {
  const [rules, setRules] = useState<ShippingRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [error, setError] = useState("");

  const [settings, setSettings] = useState<ShippingSettings>({
    pickupEnabled: false,
    pickupAddress: "Retirada no endereço da loja",
    pickupInstructions: "",
  });

  const emptyForm = {
    name: "",
    maxItems: "",
    widthCm: "",
    lengthCm: "",
    heightCm: "",
    active: true,
  };

  const [form, setForm] = useState(emptyForm);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [rulesRes, settingsRes] = await Promise.all([
        fetch("/api/admin/shipping-rules"),
        fetch("/api/admin/shipping-settings"),
      ]);
      const data = await rulesRes.json();

      if (!rulesRes.ok) {
        throw new Error(data.error || "Erro ao buscar regras.");
      }

      const settingsData = settingsRes.ok ? await settingsRes.json() : null;

      setRules(data.rules || []);

      if (settingsData?.settings) {
        setSettings({
          pickupEnabled: settingsData.settings.pickupEnabled,
          pickupAddress: settingsData.settings.pickupAddress,
          pickupInstructions: settingsData.settings.pickupInstructions || "",
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar regras.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (rule: ShippingRule) => {
    setForm({
      name: rule.name,
      maxItems: String(rule.maxItems),
      widthCm: String(rule.widthCm),
      lengthCm: String(rule.lengthCm),
      heightCm: String(rule.heightCm),
      active: rule.active,
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        maxItems: parseInt(form.maxItems || "0", 10),
        widthCm: parseInt(form.widthCm || "0", 10),
        lengthCm: parseInt(form.lengthCm || "0", 10),
        heightCm: parseInt(form.heightCm || "0", 10),
        active: form.active,
      };

      const url = editingId
        ? `/api/admin/shipping-rules/${editingId}`
        : "/api/admin/shipping-rules";
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar regra.");
      }

      setShowForm(false);
      setEditingId(null);
      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar regra.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = window.confirm("Deseja excluir esta regra de pacote?");
    if (!ok) return;

    setError("");
    try {
      const res = await fetch(`/api/admin/shipping-rules/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao excluir regra.");
      }

      await fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao excluir regra.");
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setError("");

    try {
      const res = await fetch("/api/admin/shipping-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupEnabled: settings.pickupEnabled,
          pickupAddress: settings.pickupAddress,
          pickupInstructions: settings.pickupInstructions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Erro ao salvar configuração.");
      }

      setSettings({
        pickupEnabled: data.settings.pickupEnabled,
        pickupAddress: data.settings.pickupAddress,
        pickupInstructions: data.settings.pickupInstructions || "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao salvar configuração.",
      );
    } finally {
      setSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Regras de Frete</h1>
          <p className="text-sm text-gray-500 mt-1">
            Defina qual pacote será usado por faixa de itens no carrinho.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          + Nova Regra
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3">
          {error}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Retirada no Endereço
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Permita que clientes retirem o pedido no endereço configurado.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.pickupEnabled}
            onChange={(e) =>
              setSettings({ ...settings, pickupEnabled: e.target.checked })
            }
          />
          Ativar retirada no endereço
        </label>

        <Input
          label="Endereço de retirada"
          value={settings.pickupAddress}
          onChange={(v) => setSettings({ ...settings, pickupAddress: v })}
          required
        />

        <div>
          <label className="block text-xs text-gray-500 mb-1">
            Instruções (opcional)
          </label>
          <textarea
            value={settings.pickupInstructions}
            onChange={(e) =>
              setSettings({ ...settings, pickupInstructions: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="Ex.: Retirada das 09h às 18h, apresentar número do pedido."
          />
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {savingSettings ? "Salvando..." : "Salvar Configuração"}
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">
              {editingId ? "Editar regra de pacote" : "Nova regra de pacote"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nome"
                value={form.name}
                onChange={(v) => setForm({ ...form, name: v })}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Até X itens"
                  type="number"
                  value={form.maxItems}
                  onChange={(v) => setForm({ ...form, maxItems: v })}
                  required
                />
                <Input
                  label="Largura (cm)"
                  type="number"
                  value={form.widthCm}
                  onChange={(v) => setForm({ ...form, widthCm: v })}
                  required
                />
                <Input
                  label="Comprimento (cm)"
                  type="number"
                  value={form.lengthCm}
                  onChange={(v) => setForm({ ...form, lengthCm: v })}
                  required
                />
                <Input
                  label="Altura (cm)"
                  type="number"
                  value={form.heightCm}
                  onChange={(v) => setForm({ ...form, heightCm: v })}
                  required
                />
              </div>

              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({ ...form, active: e.target.checked })
                  }
                />
                Regra ativa
              </label>

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
                      : "Criar regra"}
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
              <th className="px-5 py-3 text-left">Regra</th>
              <th className="px-5 py-3 text-left">Até itens</th>
              <th className="px-5 py-3 text-left">Pacote (cm)</th>
              <th className="px-5 py-3 text-left">Status</th>
              <th className="px-5 py-3 text-left">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-sm text-gray-400"
                >
                  Carregando...
                </td>
              </tr>
            ) : rules.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-5 py-8 text-center text-sm text-gray-400"
                >
                  Nenhuma regra cadastrada.
                </td>
              </tr>
            ) : (
              rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">
                    {rule.name}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700">
                    {rule.maxItems}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-700">
                    {rule.widthCm}×{rule.lengthCm}×{rule.heightCm}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        rule.active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {rule.active ? "Ativa" : "Inativa"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(rule)}
                        className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Excluir
                      </button>
                    </div>
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

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-gray-500 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  );
}
