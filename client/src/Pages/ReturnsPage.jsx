import { useState, useEffect } from "react";
import api from "../Services/api";
import { ArrowDownToLine, Plus } from "lucide-react";

const ReturnsPage = () => {
  const [returns, setReturns] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeLedger, setEmployeeLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    returnNumber: "",
    employee: "",
    returnDate: new Date().toISOString().split("T")[0],
    remarks: "",
    items: [{ item: "", quantity: 1, condition: "good" }],
  });

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [retRes, empRes] = await Promise.all([
        api.get("/returns"),
        api.get("/employees"),
      ]);
      setReturns(retRes.data?.returns || retRes.data?.data || []);
      setEmployees(empRes.data?.employees || empRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch returns data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEmployeeSelect = async (empId) => {
    setFormData({ ...formData, employee: empId, items: [{ item: "", quantity: 1, condition: "good" }] });
    if (!empId) {
      setEmployeeLedger([]);
      return;
    }
    try {
      const res = await api.get(`/employee-ledger/${empId}`);
      if (res.data) {
        setEmployeeLedger(res.data.holdings || res.data.ledger || []);
      }
    } catch (err) {
      console.error("Error fetching employee ledger:", err);
    }
  };

  const handleOpenAddModal = () => {
    setFormData({
      returnNumber: `RET-${Date.now().toString().slice(-6)}`,
      employee: "",
      returnDate: new Date().toISOString().split("T")[0],
      remarks: "",
      items: [{ item: "", quantity: 1, condition: "good" }],
    });
    setEmployeeLedger([]);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee) {
      setAlert({ type: "error", text: "কর্মকর্তা নির্বাচন করুন" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/returns", formData);
      setAlert({ type: "success", text: "মালামাল ফেরত গ্রহণ সফলভাবে জমা হয়েছে" });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({
        type: "error",
        text: err.response?.data?.message || "মালামাল ফেরত গ্রহণ সম্ভব হয়নি",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <ArrowDownToLine size={28} className="text-emerald-600" />
            মালামাল ফেরত গ্রহণ রেজিস্টার (Return Store Items)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            কর্মকর্তা/কর্মচারীদের নিকট হতে ফেরতপ্রাপ্ত ফেরতযোগ্য মালামালের হিসাব ও স্টক পুনরায় জমাকরণ
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          ফেরত মালামাল গ্রহণ করুন
        </button>
      </div>

      {alert && (
        <div
          className={`alert ${
            alert.type === "success" ? "alert-success text-white" : "alert-error text-white"
          } rounded-2xl shadow-xs py-3 px-5 flex justify-between`}
        >
          <span>{alert.text}</span>
          <button onClick={() => setAlert(null)} className="font-bold cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Returns Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <span className="loading loading-spinner loading-lg text-emerald-600"></span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase">
                  <th>ফেরত নম্বর</th>
                  <th>তারিখ</th>
                  <th>ফেরত প্রদানকারী কর্মকর্তা</th>
                  <th>ফেরতকৃত মালামাল</th>
                  <th>পরিমাণ</th>
                  <th>অবস্থা (Condition)</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {returns && returns.length > 0 ? (
                  returns.map((ret) => (
                    <tr key={ret._id} className="hover:bg-slate-50/80 transition">
                      <td className="font-mono text-xs font-bold text-emerald-700">
                        {ret.returnNumber || ret.returnNo}
                      </td>
                      <td className="text-slate-700 font-medium">
                        {new Date(ret.returnDate || ret.createdAt).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="font-bold text-slate-800">
                        {ret.employee?.name || "N/A"}
                      </td>
                      <td className="font-medium text-slate-800">
                        {ret.items?.map((i) => i.item?.name).join(", ") || "N/A"}
                      </td>
                      <td className="font-bold text-slate-800">
                        {ret.items?.reduce((a, b) => a + (b.quantity || 0), 0)} টি
                      </td>
                      <td>
                        <span className="badge badge-success text-white font-medium text-xs">
                          ভালো অবস্থায় ফেরত
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      কোন মালামাল ফেরতের তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Return Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              কর্মকর্তার নিকট হতে মালামাল ফেরত গ্রহণ
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ফেরত নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.returnNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, returnNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ফেরতের তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.returnDate}
                    onChange={(e) =>
                      setFormData({ ...formData, returnDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ফেরত প্রদানকারী কর্মকর্তা *
                </label>
                <select
                  required
                  value={formData.employee}
                  onChange={(e) => handleEmployeeSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">নির্বাচন করুন</option>
                  {employees?.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.designation})
                    </option>
                  ))}
                </select>
              </div>

              {/* Display returnable items held by this employee */}
              {formData.employee && (
                <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200/60">
                  <label className="block text-xs font-bold text-emerald-800 mb-2 uppercase">
                    কর্মকর্তার নিকট থাকা ফেরতযোগ্য মালামালের তালিকা
                  </label>
                  {employeeLedger && employeeLedger.length > 0 ? (
                    <div className="space-y-2">
                      {employeeLedger.map((row, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 text-xs"
                        >
                          <div>
                            <span className="font-bold text-slate-800">
                              {row.item?.name}
                            </span>
                            <span className="text-slate-400 block">
                              বর্তমান হাতে আছে: {row.currentHolding ?? row.balanceQuantity ?? 0} টি
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                items: [
                                  {
                                    item: row.item._id,
                                    quantity: row.currentHolding ?? row.balanceQuantity ?? 1,
                                    condition: "good",
                                  },
                                ],
                              })
                            }
                            className="btn btn-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer"
                          >
                            ফেরত নির্বাচন করুন
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      এই কর্মকর্তার কাছে বর্তমানে কোন ফেরতযোগ্য মালামাল জমা নেই।
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost rounded-xl cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting || !formData.items[0]?.item}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6 cursor-pointer"
                >
                  {submitting ? "সংরক্ষণ হচ্ছে..." : "ফেরত গ্রহণ সম্পন্ন করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnsPage;
