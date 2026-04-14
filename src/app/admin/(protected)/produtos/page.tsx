"use client";

import { useEffect, useState, useCallback } from "react";

interface Product {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  brand: string;
  category: string;
  originalPrice: number;
  promoPrice: number;
  stockQuantity: number;
  shippingWeightGrams: number;
  active: boolean;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    slug: "",
    name: "",
    shortName: "",
    brand: "",
    category: "",
    description: "",
    details: ["", "", "", "", "", ""],
    originalPrice: "",
    promoPrice: "",
    bulkPrice: "",
    stockQuantity: "",
    shippingWeightGrams: "50",
    tags: "",
  };
  const [form, setForm] = useState(emptyForm);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}`);
      if (res.ok) {
        const { product } = await res.json();
        const details = [...(product.details || [])];
        while (details.length < 6) details.push("");
        setForm({
          slug: product.slug,
          name: product.name,
          shortName: product.shortName,
          brand: product.brand,
          category: product.category,
          description: product.description,
          details,
          originalPrice: product.originalPrice.toString(),
          promoPrice: product.promoPrice.toString(),
          bulkPrice: product.bulkPrice.toString(),
          stockQuantity: (product.stockQuantity ?? 0).toString(),
          shippingWeightGrams: (product.shippingWeightGrams ?? 50).toString(),
          tags: (product.tags || []).join(", "),
        });
        setEditingId(id);
        setShowForm(true);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        ...form,
        originalPrice: parseFloat(form.originalPrice),
        promoPrice: parseFloat(form.promoPrice),
        bulkPrice: parseFloat(form.bulkPrice),
        stockQuantity: parseInt(form.stockQuantity || "0", 10),
        shippingWeightGrams: parseInt(form.shippingWeightGrams || "50", 10),
        details: form.details.filter(Boolean),
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const url = editingId
        ? `/api/admin/products/${editingId}`
        : "/api/admin/products";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setShowForm(false);
        fetchProducts();
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (product: Product) => {
    if (!product.active) {
      // reactivate
      await fetch(`/api/admin/products/${product.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
    } else {
      // soft delete
      await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    }
    fetchProducts();
  };

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
        <button
          onClick={openCreate}
          className="bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
        >
          + Novo Produto
        </button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-lg font-bold mb-4">
              {editingId ? "Editar Produto" : "Novo Produto"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nome"
                  value={form.name}
                  onChange={(v) => setForm({ ...form, name: v })}
                  required
                />
                <Input
                  label="Nome curto"
                  value={form.shortName}
                  onChange={(v) => setForm({ ...form, shortName: v })}
                  required
                />
                <Input
                  label="Slug"
                  value={form.slug}
                  onChange={(v) => setForm({ ...form, slug: v })}
                  required
                />
                <Input
                  label="Marca"
                  value={form.brand}
                  onChange={(v) => setForm({ ...form, brand: v })}
                  required
                />
                <Input
                  label="Categoria"
                  value={form.category}
                  onChange={(v) => setForm({ ...form, category: v })}
                  required
                />
                <Input
                  label="Preço Original"
                  type="number"
                  value={form.originalPrice}
                  onChange={(v) => setForm({ ...form, originalPrice: v })}
                  required
                />
                <Input
                  label="Preço Promo"
                  type="number"
                  value={form.promoPrice}
                  onChange={(v) => setForm({ ...form, promoPrice: v })}
                  required
                />
                <Input
                  label="Preço Atacado"
                  type="number"
                  value={form.bulkPrice}
                  onChange={(v) => setForm({ ...form, bulkPrice: v })}
                  required
                />
                <Input
                  label="Estoque"
                  type="number"
                  value={form.stockQuantity}
                  onChange={(v) => setForm({ ...form, stockQuantity: v })}
                  required
                />
                <Input
                  label="Peso para frete (g)"
                  type="number"
                  value={form.shippingWeightGrams}
                  onChange={(v) => setForm({ ...form, shippingWeightGrams: v })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Descrição
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Detalhes (6 bullets)
                </label>
                {form.details.map((d, i) => (
                  <input
                    key={i}
                    type="text"
                    value={d}
                    onChange={(e) => {
                      const arr = [...form.details];
                      arr[i] = e.target.value;
                      setForm({ ...form, details: arr });
                    }}
                    placeholder={`Detalhe ${i + 1}`}
                    className="w-full px-3 py-2 mb-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                ))}
              </div>
              <Input
                label="Tags (separadas por vírgula)"
                value={form.tags}
                onChange={(v) => setForm({ ...form, tags: v })}
              />
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
                      : "Criar Produto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">Produto</th>
              <th className="px-5 py-3 text-left">Marca</th>
              <th className="px-5 py-3 text-left">Categoria</th>
              <th className="px-5 py-3 text-left">Preço</th>
              <th className="px-5 py-3 text-left">Promo</th>
              <th className="px-5 py-3 text-left">Estoque</th>
              <th className="px-5 py-3 text-left">Peso (g)</th>
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
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan={9}
                  className="px-5 py-8 text-center text-sm text-gray-400"
                >
                  Nenhum produto cadastrado.
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium truncate max-w-[180px]">
                      {p.shortName}
                    </p>
                    <p className="text-xs text-gray-400">{p.slug}</p>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">{p.brand}</td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {p.category}
                  </td>
                  <td className="px-5 py-3 text-sm line-through text-gray-400">
                    {fmt(p.originalPrice)}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium text-rose-600">
                    {fmt(p.promoPrice)}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {p.stockQuantity ?? 0}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {p.shippingWeightGrams ?? 50}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => toggleActive(p)}
                      className={`w-10 h-5 rounded-full transition-colors relative ${p.active ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${p.active ? "left-5" : "left-0.5"}`}
                      />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => openEdit(p.id)}
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
        step={type === "number" ? "0.01" : undefined}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      />
    </div>
  );
}
