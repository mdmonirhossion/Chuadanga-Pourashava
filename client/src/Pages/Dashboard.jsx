import { useState, useEffect } from "react";
import api from "../Services/api";
import { Link } from "react-router-dom";
import {
  Package,
  AlertTriangle,
  ArrowUpFromLine,
  ArrowDownToLine,
  Users,
  Clock,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        if (response.data && response.data.success) {
          setData(response.data);
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("ড্যাশবোর্ড তথ্য লোড করা যায়নি");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <span className="loading loading-spinner loading-lg text-emerald-600"></span>
        <p className="text-gray-500 font-medium animate-pulse">ড্যাশবোর্ড ডাটা লোড হচ্ছে...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentTransactions = data?.recentTransactions || [];
  const lowStockItems = data?.lowStockItems || [];

  const kpis = [
    {
      title: "মোট মালামাল (Total Items)",
      value: stats.totalItems || 0,
      icon: Package,
      textColor: "text-emerald-700",
      lightBg: "bg-emerald-50",
    },
    {
      title: "ঘাটতি মালামাল (Low Stock)",
      value: stats.lowStockCount || 0,
      icon: AlertTriangle,
      textColor: "text-amber-700",
      lightBg: "bg-amber-50",
    },
    {
      title: "আজকের ইস্যু (Today's Issue)",
      value: stats.todayIssuesCount || 0,
      icon: ArrowUpFromLine,
      textColor: "text-blue-700",
      lightBg: "bg-blue-50",
    },
    {
      title: "আজকের ফেরত (Today's Return)",
      value: stats.todayReturnsCount || 0,
      icon: ArrowDownToLine,
      textColor: "text-purple-700",
      lightBg: "bg-purple-50",
    },
    {
      title: "কর্মকর্তা/কর্মচারী (Employees)",
      value: stats.totalEmployees || 0,
      icon: Users,
      textColor: "text-indigo-700",
      lightBg: "bg-indigo-50",
    },
    {
      title: "মোট স্টক সংখ্যা (Total Stock Qty)",
      value: stats.totalStockQty || 0,
      icon: Clock,
      textColor: "text-rose-700",
      lightBg: "bg-rose-50",
    },
  ];

  const categoryChartData = [
    { name: "মোট স্টক", stock: stats.totalStockQty || 0 },
    { name: "ঘাটতি", stock: stats.lowStockCount || 0 },
    { name: "ক্ষতিগ্রস্ত", stock: stats.totalDamagedQty || 0 },
    { name: "বিনষ্ট", stock: stats.totalLostQty || 0 },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white rounded-3xl p-6 md:p-8 shadow-xl shadow-emerald-900/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src="/logo.png"
            alt="চুয়াডাঙ্গা পৌরসভা লোগো"
            className="w-16 h-16 object-contain bg-white/10 backdrop-blur-md p-1.5 rounded-2xl shadow-md hidden sm:block"
          />
          <div>
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              চুয়াডাঙ্গা পৌরসভা কার্যালয়
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              স্টোর ও ইনভেন্টরি কন্ট্রোল ড্যাশবোর্ড
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-xl">
              পৌরসভার মালামাল ক্রয়, ইস্যু, ফেরত এবং স্টক ট্রানজেকশনের সম্পূর্ণ ডিজিটাল হিসেব।
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/issues"
            className="btn bg-white hover:bg-emerald-50 text-emerald-800 border-none rounded-xl shadow-md font-bold text-xs"
          >
            <ArrowUpFromLine size={16} />
            ইস্যু করুন
          </Link>
          <Link
            to="/purchases"
            className="btn bg-emerald-800 hover:bg-emerald-900 text-white border-none rounded-xl shadow-md font-bold text-xs"
          >
            <ShoppingCart size={16} />
            স্টক রিসিভ
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-warning rounded-2xl">
          <span>⚠️ {error}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md transition group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 line-clamp-1">
                  {kpi.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl ${kpi.lightBg} ${kpi.textColor} flex items-center justify-center transition group-hover:scale-110`}
                >
                  <Icon size={20} />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-extrabold text-slate-800">
                  {kpi.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts & Low Stock Alert Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={20} className="text-emerald-600" />
                স্টোক সারসংক্ষেপ (Stock Summary Overview)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                ইনভেন্টরি স্টকের সামগ্রিক অবস্থা
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="stock" fill="#059669" radius={[8, 8, 0, 0]} name="মালামাল সংখ্যা" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alert Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <AlertTriangle size={20} className="text-amber-500" />
              কম স্টকের মালামাল (Low Stock)
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto max-h-72 space-y-3">
            {lowStockItems.length > 0 ? (
              lowStockItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-amber-50/60 border border-amber-200/60"
                >
                  <div>
                    <p className="font-bold text-sm text-slate-800">{item.name}</p>
                    <span className="text-xs text-slate-500">
                      কোট: {item.itemCode} | সর্বনিম্ন: {item.minimumStock} {item.unit}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="badge badge-error text-white font-bold text-xs">
                      {item.currentStock} {item.unit}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
                কোন পণ্যের ঘাটতি নেই
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <Link
              to="/items"
              className="btn btn-sm btn-ghost w-full text-emerald-700 font-bold"
            >
              সকল মালামাল দেখুন →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Clock size={20} className="text-emerald-600" />
              সাম্প্রতিক স্টক লেনদেন (Recent Transactions)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              সর্বশেষ স্টক পরিবর্তন ও অডিট রেকর্ড
            </p>
          </div>
          <Link to="/transactions" className="btn btn-sm btn-outline border-emerald-300 text-emerald-700">
            সকল অডিট দেখুন
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase">
                <th>তারিখ</th>
                <th>লেনদেনের ধরন</th>
                <th>মালামালের নাম</th>
                <th>পরিমাণ</th>
                <th>রেফারেন্স নম্বর</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/80">
                    <td className="font-medium text-slate-700">
                      {new Date(tx.createdAt).toLocaleDateString("bn-BD")}
                    </td>
                    <td>
                      <span className="badge badge-neutral text-white font-medium text-xs">
                        {tx.transactionType || tx.type || "LOG"}
                      </span>
                    </td>
                    <td className="font-bold text-slate-800">{tx.item?.name || "N/A"}</td>
                    <td className="font-semibold">
                      {tx.quantity} {tx.item?.unit || "টি"}
                    </td>
                    <td className="text-xs text-slate-500 font-mono">
                      {tx.referenceId || tx.referenceNo || "SYS-LOG"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-slate-400">
                    কোন সাম্প্রতিক লেনদেন পাওয়া যায়নি
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
