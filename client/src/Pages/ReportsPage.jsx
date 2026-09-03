import { useState, useEffect } from "react";
import api from "../Services/api";
import { FileSpreadsheet, Printer, Download, Filter } from "lucide-react";

const ReportsPage = () => {
  const [activeTab, setActiveTab] = useState("stock");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      let endpoint = `/reports/${activeTab}`;
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await api.get(endpoint, { params });
      if (res.data && res.data.success) {
        const list =
          res.data.items ||
          res.data.purchases ||
          res.data.issues ||
          res.data.returns ||
          res.data.damagedItems ||
          res.data.report ||
          res.data.data ||
          (Array.isArray(res.data) ? res.data : []);
        setReportData(list);
      } else {
        setReportData([]);
      }
    } catch (err) {
      console.error("Report fetch error:", err);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!reportData || reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).join(",");
    const rows = reportData.map((row) =>
      Object.values(row)
        .map((v) => `"${typeof v === "object" ? v?.name || JSON.stringify(v) : v}"`)
        .join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `chuadanga_store_${activeTab}_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <FileSpreadsheet size={28} className="text-emerald-600" />
            পৌরসভা স্টোর রিপোর্ট ও স্টেটমেন্ট (Reports)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            মজুদ, ক্রয়, ইস্যু, ফেরত এবং ক্ষয়ক্ষতির বিস্তারিত রিপোর্ট তৈরি ও প্রিন্ট করুন
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="btn bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-none rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download size={16} />
            CSV ডাউনলোড
          </button>
          <button
            onClick={handlePrint}
            className="btn bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer size={16} />
            প্রিন্ট করুন
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap gap-2 print:hidden">
        {[
          { id: "stock", label: "মালামালের মজুদ রিপোর্ট (Stock Balance)" },
          { id: "purchases", label: "ক্রয় রেজিস্টার (Purchases)" },
          { id: "issues", label: "ইস্যু রেজিস্টার (Issues)" },
          { id: "returns", label: "ফেরত রেজিস্টার (Returns)" },
          { id: "damaged-lost", label: "ক্ষতিগ্রস্ত/বিনষ্ট মালামাল (Damaged)" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === tab.id
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center gap-4 print:hidden">
        <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
          <Filter size={15} /> ফিল্টার:
        </span>
        <div className="flex items-center gap-2 text-xs">
          <span>শুরুর তারিখ:</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          />
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span>শেষ তারিখ:</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
          />
        </div>
        <button
          onClick={fetchReport}
          className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-4 cursor-pointer"
        >
          রিপোর্ট দেখুন
        </button>
      </div>

      {/* Report Table Display */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 md:p-8">
        <div className="text-center border-b border-slate-200 pb-4 mb-6">
          <img
            src="/logo.png"
            alt="চুয়াডাঙ্গা পৌরসভা লোগো"
            className="w-14 h-14 object-contain mx-auto mb-2"
          />
          <h2 className="text-2xl font-extrabold text-slate-900">চুয়াডাঙ্গা পৌরসভা কার্যালয়</h2>
          <p className="text-xs text-slate-500 font-medium">
            স্টোর শাখা — {activeTab.toUpperCase()} রিপোর্ট
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            রিপোর্ট তৈরির সময়: {new Date().toLocaleString("bn-BD")}
          </p>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <span className="loading loading-spinner loading-lg text-emerald-600"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full border border-slate-200 rounded-2xl text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold">
                  {activeTab === "stock" && (
                    <>
                      <th>কোড</th>
                      <th>মালামালের নাম</th>
                      <th>ক্যাটাগরি</th>
                      <th>একক</th>
                      <th>টাইপ</th>
                      <th>বর্তমান মজুদ (Current Stock)</th>
                    </>
                  )}
                  {activeTab === "purchases" && (
                    <>
                      <th>ইনভয়েস</th>
                      <th>তারিখ</th>
                      <th>সরবরাহকারী</th>
                      <th>মালামালের বিবরণ</th>
                      <th>মোট মূল্য (৳)</th>
                    </>
                  )}
                  {activeTab === "issues" && (
                    <>
                      <th>ইস্যু নং</th>
                      <th>তারিখ</th>
                      <th>গ্রহীতা কর্মকর্তা</th>
                      <th>বিভাগ</th>
                      <th>রিকুইজিশন নং</th>
                    </>
                  )}
                  {activeTab === "returns" && (
                    <>
                      <th>ফেরত নং</th>
                      <th>তারিখ</th>
                      <th>কর্মকর্তার নাম</th>
                      <th>ফেরতকৃত মালামাল</th>
                    </>
                  )}
                  {activeTab === "damaged-lost" && (
                    <>
                      <th>তারিখ</th>
                      <th>মালামাল</th>
                      <th>পরিমাণ</th>
                      <th>অবস্থা</th>
                      <th>মন্তব্য</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {reportData && reportData.length > 0 ? (
                  reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {activeTab === "stock" && (
                        <>
                          <td className="font-mono font-bold">{row.itemCode}</td>
                          <td className="font-bold">{row.name}</td>
                          <td>{row.category?.name || "N/A"}</td>
                          <td>{row.unit}</td>
                          <td className="capitalize">{row.itemType}</td>
                          <td className="font-extrabold text-emerald-700">{row.currentStock}</td>
                        </>
                      )}
                      {activeTab === "purchases" && (
                        <>
                          <td className="font-mono font-bold">{row.invoiceNumber}</td>
                          <td>{new Date(row.purchaseDate || row.createdAt).toLocaleDateString("bn-BD")}</td>
                          <td className="font-bold">{row.supplier?.name}</td>
                          <td>{row.items?.length || 0} টি আইটেম</td>
                          <td className="font-bold">৳ {row.totalAmount}</td>
                        </>
                      )}
                      {activeTab === "issues" && (
                        <>
                          <td className="font-mono font-bold">{row.issueNumber || row.issueNo}</td>
                          <td>{new Date(row.issueDate || row.createdAt).toLocaleDateString("bn-BD")}</td>
                          <td className="font-bold">{row.employee?.name}</td>
                          <td>{row.employee?.department?.name}</td>
                          <td className="font-mono">{row.requisitionNo}</td>
                        </>
                      )}
                      {activeTab === "returns" && (
                        <>
                          <td className="font-mono font-bold">{row.returnNumber || row.returnNo}</td>
                          <td>{new Date(row.returnDate || row.createdAt).toLocaleDateString("bn-BD")}</td>
                          <td className="font-bold">{row.employee?.name}</td>
                          <td>{row.items?.map((i) => i.item?.name).join(", ")}</td>
                        </>
                      )}
                      {activeTab === "damaged-lost" && (
                        <>
                          <td>{new Date(row.createdAt || Date.now()).toLocaleDateString("bn-BD")}</td>
                          <td className="font-bold">{row.item?.name || "N/A"}</td>
                          <td className="font-bold text-rose-600">{row.quantity}</td>
                          <td>
                            <span className="badge badge-error text-white font-bold">
                              {row.condition || "Damaged"}
                            </span>
                          </td>
                          <td>{row.remarks || "N/A"}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      কোন রিপোর্টের ডাটা পাওয়া যায়নি
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

export default ReportsPage;
