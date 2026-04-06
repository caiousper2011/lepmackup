"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Address {
  id: string;
  label: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  cep: string;
  isDefault: boolean;
}

export default function MinhaContaPage() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    label: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    isDefault: false,
  };
  const [form, setForm] = useState(emptyForm);

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses");
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
      }
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const lookupCep = async (cep: string) => {
    const cleaned = cep.replace(/\D/g, "");
    if (cleaned.length !== 8) return;
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleaned}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade || f.city,
          state: data.uf || f.state,
        }));
      }
    } catch {
      /* ignore */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingId ? `/api/addresses/${editingId}` : "/api/addresses";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        fetchAddresses();
      }
    } catch {
      /* ignore */
    } finally {
      setSaving(false);
    }
  };

  const deleteAddress = async (id: string) => {
    if (!confirm("Remover este endereço?")) return;
    await fetch(`/api/addresses/${id}`, { method: "DELETE" });
    fetchAddresses();
  };

  const openEdit = (a: Address) => {
    setForm({
      label: a.label,
      cep: a.cep,
      street: a.street,
      number: a.number,
      complement: a.complement || "",
      neighborhood: a.neighborhood,
      city: a.city,
      state: a.state,
      isDefault: a.isDefault,
    });
    setEditingId(a.id);
    setShowForm(true);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Minha Conta</h1>
        <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/minha-conta/pedidos"
          className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-rose-300 transition-colors"
        >
          <p className="font-semibold text-gray-900">Meus Pedidos</p>
          <p className="text-sm text-gray-500 mt-1">Acompanhe suas compras</p>
        </Link>
        <Link
          href="/minha-conta/indicacoes"
          className="bg-white rounded-2xl border border-gray-200 p-5 hover:border-rose-300 transition-colors"
        >
          <p className="font-semibold text-gray-900">Indicar Amigas</p>
          <p className="text-sm text-gray-500 mt-1">
            Ganhe descontos indicando
          </p>
        </Link>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="font-semibold text-gray-900">Código de Indicação</p>
          <p className="text-lg font-mono text-rose-600 mt-1">
            {user?.referralCode || "—"}
          </p>
        </div>
      </div>

      {/* Addresses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Meus Endereços</h2>
          <button
            onClick={() => {
              setForm(emptyForm);
              setEditingId(null);
              setShowForm(true);
            }}
            className="text-sm text-rose-600 hover:text-rose-700 font-medium"
          >
            + Novo Endereço
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-gray-200 p-5 mb-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">
                  Apelido
                </label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Casa, Trabalho..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">CEP</label>
                <input
                  type="text"
                  value={form.cep}
                  onChange={(e) => setForm({ ...form, cep: e.target.value })}
                  onBlur={(e) => lookupCep(e.target.value)}
                  placeholder="00000-000"
                  maxLength={9}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={form.number}
                  onChange={(e) => setForm({ ...form, number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">Rua</label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={form.complement}
                  onChange={(e) =>
                    setForm({ ...form, complement: e.target.value })
                  }
                  placeholder="Apto, Bloco..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={form.neighborhood}
                  onChange={(e) =>
                    setForm({ ...form, neighborhood: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
                  required
                />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({ ...form, isDefault: e.target.checked })
                }
                className="rounded"
              />
              Endereço padrão
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Salvando..." : editingId ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded-2xl" />
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">
            Nenhum endereço cadastrado.
          </p>
        ) : (
          <div className="space-y-3">
            {addresses.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-gray-200 p-4 flex items-start justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900">
                      {a.label}
                    </p>
                    {a.isDefault && (
                      <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">
                        Padrão
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {a.street}, {a.number}
                    {a.complement ? ` - ${a.complement}` : ""}
                  </p>
                  <p className="text-xs text-gray-400">
                    {a.neighborhood}, {a.city}/{a.state} — {a.cep}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(a)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => deleteAddress(a.id)}
                    className="text-xs text-gray-400 hover:text-red-600"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
