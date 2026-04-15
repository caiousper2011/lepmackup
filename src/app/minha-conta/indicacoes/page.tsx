"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface ReferralStats {
  referralCode: string;
  totalReferred: number;
  rewards: {
    id: string;
    type: string;
    amount: number;
    couponCode: string | null;
    createdAt: string;
  }[];
  generatedCoupons: {
    id: string;
    code: string;
    type: string;
    value: number;
    usedCount: number;
    maxUses: number | null;
    expiresAt: string | null;
  }[];
}

export default function IndicacoesPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/referrals/my-stats");
        if (res.ok) setStats(await res.json());
      } catch {
        /* ignore */
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const shareLink =
    typeof window !== "undefined" && stats
      ? `${window.location.origin}?ref=${stats.referralCode}`
      : "";

  const copy = async () => {
    if (!shareLink) return;
    await navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Amiga, olha essa loja incrível de maquiagem com precinho! 🥰💄 Use meu link e ganhe desconto: ${shareLink}`,
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (loading)
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse h-64 bg-gray-200 rounded-2xl" />
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/minha-conta"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Minha Conta
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Indicar Amigas</h1>
      </div>

      {/* Hero referral card */}
      <div className="bg-gradient-to-br from-berry-600 to-rose-500 rounded-2xl p-6 text-white">
        <h2 className="text-xl font-bold">Indique e Ganhe! 🎁</h2>
        <p className="text-white/80 text-sm mt-2">
          Compartilhe seu link com suas amigas. Quando elas fizerem a primeira
          compra, vocês duas ganham um cupom de desconto!
        </p>
        <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-xl p-3">
          <p className="text-xs text-white/80 mb-1">Seu código de indicação</p>
          <p className="text-2xl font-mono font-bold">
            {stats?.referralCode || user?.referralCode || "—"}
          </p>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={copy}
            className="flex-1 bg-white text-berry-600 font-medium py-2.5 rounded-xl text-sm hover:bg-blush-50 transition-colors"
          >
            {copied ? "✓ Copiado!" : "Copiar Link"}
          </button>
          <button
            onClick={shareWhatsApp}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white font-medium py-2.5 rounded-xl text-sm transition-colors"
          >
            Enviar WhatsApp
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Amigas Indicadas
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {stats?.totalReferred ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Recompensas Ganhas
          </p>
          <p className="text-3xl font-bold text-berry-600 mt-1">
            {stats?.rewards.length ?? 0}
          </p>
        </div>
      </div>

      {/* Generated coupons */}
      {stats?.generatedCoupons && stats.generatedCoupons.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">
            Seus Cupons de Indicação
          </h3>
          <div className="space-y-2">
            {stats.generatedCoupons.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-mono font-bold text-berry-600">{c.code}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {c.type === "PERCENTAGE"
                      ? `${c.value}% de desconto`
                      : `R$${c.value.toFixed(2)} de desconto`}
                    {c.expiresAt &&
                      ` • Expira em ${new Date(c.expiresAt).toLocaleDateString("pt-BR")}`}
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {c.usedCount}
                  {c.maxUses ? `/${c.maxUses}` : ""} usos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="bg-gray-50 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 mb-3">Como funciona?</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl mb-1">📲</div>
            <p className="font-medium text-gray-900">1. Compartilhe</p>
            <p className="text-gray-500 text-xs">
              Envie seu link para suas amigas
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🛒</div>
            <p className="font-medium text-gray-900">2. Ela compra</p>
            <p className="text-gray-500 text-xs">
              Sua amiga faz a primeira compra
            </p>
          </div>
          <div className="text-center">
            <div className="text-2xl mb-1">🎉</div>
            <p className="font-medium text-gray-900">3. Vocês ganham</p>
            <p className="text-gray-500 text-xs">
              As duas recebem cupom de desconto!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
