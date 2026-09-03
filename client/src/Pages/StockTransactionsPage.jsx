import { useState, useEffect } from "react";
import api from "../Services/api";
import { History, Search, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";

const StockTransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get("/stock-transactions");
      const list = res.data?.transactions || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setTransactions(list);
    } catch (err) {
      console.error(err);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTx = (transactions || []).filter((tx) =>
    tx.item?.name?.toLowerCase().includes(search.toLowerCase()) ||
    tx.referenceNo?.toLowerCase().includes(search.toLowerCase()) ||
    tx.referenceId?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <History size={28} className="text-emerald-600" />
            স্টোক ট্রানজেকশন অডিট ট্রেইল (Audit Logs)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            পৌরসভার মালামাল জমা, ইস্যু, ফেরত ও সমন্বয়ের প্রতিটি অডিট হিস্টোরি
          </p>
        </div>

        <button
          onClick={fetchTransactions}
          className="btn btn-ghost border border-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw size={16} />
          রিফ্রেশ করুন
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="মালামাল অথবা রেফারেন্স নম্বর দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <span className="loading loading-spinner loading-lg text-emerald-600"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase">
                  <th>তারিখ ও সময়</th>
                  <th>লেনদেনের ধরন</th>
                  <th>মালামালের নাম</th>
                  <th>পরিবর্তনের পরিমাণ</th>
                  <th>পূর্বের স্টক</th>
                  <th>পরবর্তী স্টক</th>
                  <th>রেফারেন্স নম্বর</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {filteredTx && filteredTx.length > 0 ? (
                  filteredTx.map((tx) => (
                    <tr key={tx._id} className="hover:bg-slate-50/80">
                      <td className="text-xs text-slate-600 font-mono">
                        {new Date(tx.createdAt).toLocaleString("bn-BD")}
                      </td>
                      <td>
                        {tx.transactionType === "IN" || tx.type === "IN" ? (
                          <span className="badge badge-success text-white font-bold text-xs flex items-center gap-1">
                            <ArrowDownLeft size={12} /> জমা (IN)
                          </span>
                        ) : tx.transactionType === "OUT" || tx.type === "OUT" ? (
                          <span className="badge badge-warning text-white font-bold text-xs flex items-center gap-1">
                            <ArrowUpRight size={12} /> ইস্যু (OUT)
                          </span>
                        ) : (
                          <span className="badge badge-info text-white font-bold text-xs">
                            {tx.transactionType || tx.type || "RETURN"}
                          </span>
                        )}
                      </td>
                      <td className="font-bold text-slate-800">{tx.item?.name || "N/A"}</td>
                      <td className="font-extrabold text-slate-900">
                        {tx.transactionType === "IN" || tx.type === "IN" ? "+" : "-"}
                        {tx.quantity} {tx.item?.unit || "টি"}
                      </td>
                      <td className="text-slate-500">{tx.previousStock}</td>
                      <td className="font-bold text-emerald-700">{tx.newStock}</td>
                      <td className="font-mono text-xs text-slate-500">{tx.referenceId || tx.referenceNo || "SYS-LOG"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      কোন ট্রানজেকশন রেকর্ড পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockTransactionsPage;
