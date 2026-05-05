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

interface FreeShippingTier {
  minValue: number;
  discountPercent: number;
  label?: string | null;
}

interface ShippingSettings {
  pickupEnabled: boolean;
  pickupAddress: string;
  pickupInstructions: string;
  maxItemsPerOrder: number;
  freeShippingEnabled: boolean;
  freeShippingThreshold: number;
  freeShippingTiers: FreeShippingTier[];
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
    maxItemsPerOrder: 6,
    freeShippingEnabled: false,
    freeShippingThreshold: 0,
    freeShippingTiers: [],
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
          maxItemsPerOrder: settingsData.settings.maxItemsPerOrder ?? 6,
          freeShippingEnabled:
            settingsData.settings.freeShippingEnabled ?? false,
          freeShippingThreshold:
            settingsData.settings.freeShippingThreshold ?? 0,
          freeShippingTiers: Array.isArray(
            settingsData.settings.freeShippingTiers,
          )
            ? settingsData.settings.freeShippingTiers
            : [],
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
      const sanitizedTiers = settings.freeShippingTiers
        .map((tier) => ({
          minValue: Number(tier.minValue) || 0,
          discountPercent: Number(tier.discountPercent) || 0,
          label: tier.label?.trim() || null,
        }))
        .filter(
          (tier) =>
            tier.minValue > 0 &&
            tier.discountPercent > 0 &&
            tier.discountPercent <= 100,
        );

      const res = await fetch("/api/admin/shipping-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupEnabled: settings.pickupEnabled,
          pickupAddress: settings.pickupAddress,
          pickupInstructions: settings.pickupInstructions,
          maxItemsPerOrder: settings.maxItemsPerOrder,
          freeShippingEnabled: settings.freeShippingEnabled,
          freeShippingThreshold: settings.freeShippingThreshold,
          freeShippingTiers: sanitizedTiers,
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
        maxItemsPerOrder: data.settings.maxItemsPerOrder ?? 6,
        freeShippingEnabled: data.settings.freeShippingEnabled ?? false,
        freeShippingThreshold: data.settings.freeShippingThreshold ?? 0,
        freeShippingTiers: Array.isArray(data.settings.freeShippingTiers)
          ? data.settings.freeShippingTiers
          : [],
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

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Frete Grátis
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Defina um valor mínimo para frete grátis e/ou faixas escalonadas com
            desconto progressivo no frete. Não acumula com cupons de desconto em
            frete.
          </p>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={settings.freeShippingEnabled}
            onChange={(e) =>
              setSettings({
                ...settings,
                freeShippingEnabled: e.target.checked,
              })
            }
          />
          Ativar programa de frete grátis
        </label>

        <div className="max-w-xs">
          <Input
            label="Valor mínimo para frete grátis (R$)"
            type="number"
            value={String(settings.freeShippingThreshold)}
            onChange={(v) =>
              setSettings({
                ...settings,
                freeShippingThreshold: Math.max(0, parseFloat(v || "0") || 0),
              })
            }
          />
          <p className="text-xs text-gray-400 mt-1">
            Use 0 para desativar a meta principal (apenas faixas escalonadas).
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Faixas escalonadas (desconto no frete)
            </p>
            <button
              type="button"
              onClick={() =>
                setSettings({
                  ...settings,
                  freeShippingTiers: [
                    ...settings.freeShippingTiers,
                    { minValue: 0, discountPercent: 50, label: "" },
                  ],
                })
              }
              className="text-sm text-rose-600 hover:text-rose-700 font-medium"
            >
              + Adicionar faixa
            </button>
          </div>

          {settings.freeShippingTiers.length === 0 ? (
            <p className="text-xs text-gray-400">
              Nenhuma faixa cadastrada. Adicione faixas para conceder descontos
              progressivos no frete (ex.: a partir de R$ 100, 50% off no frete).
            </p>
          ) : (
            <div className="space-y-2">
              {settings.freeShippingTiers.map((tier, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end bg-gray-50 border border-gray-100 rounded-xl p-3"
                >
                  <div className="sm:col-span-3">
                    <Input
                      label="Valor mínimo (R$)"
                      type="number"
                      value={String(tier.minValue)}
                      onChange={(v) => {
                        const newTiers = [...settings.freeShippingTiers];
                        newTiers[index] = {
                          ...newTiers[index],
                          minValue: Math.max(0, parseFloat(v || "0") || 0),
                        };
                        setSettings({
                          ...settings,
                          freeShippingTiers: newTiers,
                        });
                      }}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Input
                      label="Desconto frete (%)"
                      type="number"
                      value={String(tier.discountPercent)}
                      onChange={(v) => {
                        const newTiers = [...settings.freeShippingTiers];
                        newTiers[index] = {
                          ...newTiers[index],
                          discountPercent: Math.min(
                            100,
                            Math.max(0, parseFloat(v || "0") || 0),
                          ),
                        };
                        setSettings({
                          ...settings,
                          freeShippingTiers: newTiers,
                        });
                      }}
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <Input
                      label="Rótulo (opcional)"
                      value={tier.label || ""}
                      onChange={(v) => {
                        const newTiers = [...settings.freeShippingTiers];
                        newTiers[index] = {
                          ...newTiers[index],
                          label: v,
                        };
                        setSettings({
                          ...settings,
                          freeShippingTiers: newTiers,
                        });
                      }}
                    />
                  </div>
                  <div className="sm:col-span-1 flex sm:justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const newTiers = settings.freeShippingTiers.filter(
                          (_, i) => i !== index,
                        );
                        setSettings({
                          ...settings,
                          freeShippingTiers: newTiers,
                        });
                      }}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={savingSettings}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
        >
          {savingSettings ? "Salvando..." : "Salvar Configuração"}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Limite de Itens por Pedido
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Número máximo de itens (soma das quantidades) que um cliente pode incluir em um único pedido.
          </p>
        </div>

        <div className="max-w-xs">
          <Input
            label="Máximo de itens por pedido"
            type="number"
            value={String(settings.maxItemsPerOrder)}
            onChange={(v) =>
              setSettings({
                ...settings,
                maxItemsPerOrder: Math.max(1, parseInt(v || "1", 10)),
              })
            }
            required
          />
        </div>

        <p className="text-xs text-gray-400">
          Ao atingir o limite, o cliente verá uma mensagem informando que não pode adicionar mais itens.
        </p>

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
