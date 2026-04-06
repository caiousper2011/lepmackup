"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao alterar senha.");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Erro de conexão.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">Trocar Senha</h1>
            <p className="text-sm text-gray-500 mt-1">
              Você precisa criar uma nova senha para continuar.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl p-3 mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="new-pw"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nova Senha
              </label>
              <input
                id="new-pw"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Mín. 8 caracteres, com maiúscula, minúscula, número e caractere
                especial.
              </p>
            </div>
            <div>
              <label
                htmlFor="confirm-pw"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Confirmar Senha
              </label>
              <input
                id="confirm-pw"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              {loading ? "Salvando..." : "Salvar Nova Senha"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
