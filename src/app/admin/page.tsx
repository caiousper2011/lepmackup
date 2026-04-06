"use client";

import { useEffect, useState } from "react";

interface Stats {
  totalOrders: number;
  pendingOrders: number;
  paidOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalUsers: number;
  newUsersThisWeek: number;
  totalProducts: number;
}

interface RecentOrder {
  id: string;
  orderNumber: number;
  total: number;
  status: string;
  paymentStatus: string;
  customer: string;
  itemCount: number;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/admin/dashboard");
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const statusColors: Record<string, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    PAID: "bg-green-100 text-green-700",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-700",
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Receita Total
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(stats?.totalRevenue || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Receita (30 dias)
          </p>
          <p className="text-2xl font-bold text-rose-600 mt-1">
            {formatCurrency(stats?.monthlyRevenue || 0)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Pedidos Pendentes
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {stats?.pendingOrders || 0}
          </p>
          <p className="text-xs text-gray-400">
            {stats?.totalOrders || 0} total
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 uppercase tracking-wide">
            Usuários
          </p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {stats?.totalUsers || 0}
          </p>
          <p className="text-xs text-green-600">
            +{stats?.newUsersThisWeek || 0} esta semana
          </p>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-2xl border border-gray-200">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Pedidos Recentes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-5 py-3 text-left">#</th>
                <th className="px-5 py-3 text-left">Cliente</th>
                <th className="px-5 py-3 text-left">Itens</th>
                <th className="px-5 py-3 text-left">Total</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 text-sm font-medium">
                    #{order.orderNumber}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 truncate max-w-[180px]">
                    {order.customer}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {order.itemCount}
                  </td>
                  <td className="px-5 py-3 text-sm font-medium">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status] || "bg-gray-100 text-gray-600"}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-sm text-gray-400"
                  >
                    Nenhum pedido ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
