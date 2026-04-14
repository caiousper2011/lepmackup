"use client";

import { useEffect, useState } from "react";

interface ReferralStats {
  summary: {
    totalReferrals: number;
    totalRewards: number;
    totalRewardValue: number;
  };
  topReferrers: {
    id: string;
    email: string;
    name: string | null;
    referralCode: string;
    _count: { referredUsers: number };
  }[];
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/referrals");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const fmt = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  if (loading)
    return <div className="animate-pulse h-64 bg-gray-200 rounded-2xl" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Indicações</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Total Indicações
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {data?.summary.totalReferrals ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Recompensas Geradas
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {data?.summary.totalRewards ?? 0}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Valor em Recompensas
          </p>
          <p className="text-3xl font-bold text-rose-600 mt-1">
            {fmt(data?.summary.totalRewardValue ?? 0)}
          </p>
        </div>
      </div>

      {/* Top referrers */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Top Indicadoras</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-5 py-3 text-left">#</th>
              <th className="px-5 py-3 text-left">Usuária</th>
              <th className="px-5 py-3 text-left">Código</th>
              <th className="px-5 py-3 text-left">Indicações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {!data?.topReferrers.length ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-5 py-8 text-center text-sm text-gray-400"
                >
                  Nenhuma indicação registrada.
                </td>
              </tr>
            ) : (
              data.topReferrers.map((u, i) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-bold text-gray-400">
                    {i + 1}
                  </td>
                  <td className="px-5 py-3">
                    <p className="text-sm font-medium">{u.name || u.email}</p>
                    {u.name && (
                      <p className="text-xs text-gray-400">{u.email}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 text-sm font-mono text-xs text-gray-500">
                    {u.referralCode}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-sm font-bold text-rose-600">
                      {u._count.referredUsers}
                    </span>
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
