import { useState, useEffect } from "react";
import api from "../Services/api";
import { ArrowUpFromLine, Plus, Eye } from "lucide-react";

const IssuesPage = () => {
  const [issues, setIssues] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingIssue, setViewingIssue] = useState(null);

  const [formData, setFormData] = useState({
    issueNumber: "",
    employee: "",
    issueDate: new Date().toISOString().split("T")[0],
    requisitionNo: "",
    remarks: "",
    items: [{ item: "", quantity: 1 }],
  });

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issRes, empRes, itmRes] = await Promise.all([
        api.get("/issues"),
        api.get("/employees"),
        api.get("/items"),
      ]);
      setIssues(issRes.data?.issues || issRes.data?.data || []);
      setEmployees(empRes.data?.employees || empRes.data?.data || []);
      setItems(itmRes.data?.items || itmRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch issues data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      issueNumber: `ISS-${Date.now().toString().slice(-6)}`,
      employee: employees[0]?._id || "",
      issueDate: new Date().toISOString().split("T")[0],
      requisitionNo: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      remarks: "",
      items: [{ item: items[0]?._id || "", quantity: 1 }],
    });
    setIsModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData({ ...formData, items: updated });
  };

  const addRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: items[0]?._id || "", quantity: 1 }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.employee) {
      setAlert({ type: "error", text: "কর্মকর্তা/কর্মচারী নির্বাচন করুন" });
      return;
    }

    for (const row of formData.items) {
      const selectedItemObj = items.find((i) => i._id === row.item);
      if (selectedItemObj && row.quantity > selectedItemObj.currentStock) {
        setAlert({
          type: "error",
          text: `"${selectedItemObj.name}" এর পর্যাপ্ত স্টক নেই (বর্তমান মজুদ: ${selectedItemObj.currentStock})`,
        });
        return;
      }
    }

    setSubmitting(true);
    try {
      await api.post("/issues", formData);
      setAlert({ type: "success", text: "মালামাল সফলভাবে ইস্যু করা হয়েছে" });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({
        type: "error",
        text: err.response?.data?.message || "মালামাল ইস্যু করা সম্ভব হয়নি",
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
            <ArrowUpFromLine size={28} className="text-emerald-600" />
            মালামাল ইস্যু রেজিস্টার (Issue Store Items)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            পৌরসভার কর্মকর্তা/কর্মচারীদের নিকট মালামাল বিতরণের রেকর্ড ও ট্র্যাকিং
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          নতুন ইস্যু করুন
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

      {/* Issues Table */}
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
                  <th>ইস্যু নম্বর</th>
                  <th>তারিখ</th>
                  <th>কর্মকর্তা/গ্রহীতা</th>
                  <th>বিভাগ (Department)</th>
                  <th>রিকুইজিশন নং</th>
                  <th>মোট মালামাল</th>
                  <th className="text-right">রসিদ</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {issues && issues.length > 0 ? (
                  issues.map((iss) => (
                    <tr key={iss._id} className="hover:bg-slate-50/80 transition">
                      <td className="font-mono text-xs font-bold text-emerald-700">
                        {iss.issueNumber || iss.issueNo}
                      </td>
                      <td className="text-slate-700 font-medium">
                        {new Date(iss.issueDate || iss.createdAt).toLocaleDateString("bn-BD")}
                      </td>
                      <td>
                        <p className="font-bold text-slate-800">
                          {iss.employee?.name || "N/A"}
                        </p>
                        <p className="text-xs text-slate-400">
                          {iss.employee?.designation}
                        </p>
                      </td>
                      <td className="text-slate-600 font-medium">
                        {iss.employee?.department?.name || "General"}
                      </td>
                      <td className="font-mono text-xs text-slate-500">
                        {iss.requisitionNo || "N/A"}
                      </td>
                      <td className="font-semibold text-slate-800">
                        {iss.items?.length || 0} টি
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setViewingIssue(iss)}
                          className="btn btn-ghost btn-xs text-emerald-700 font-bold flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye size={15} />
                          রসিদ দেখুন
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-slate-400">
                      কোন মালামাল ইস্যুর তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Issue Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              কর্মকর্তাকে মালামাল ইস্যু ফর্ম
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ইস্যু নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.issueNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, issueNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    গ্রহীতা কর্মকর্তা/কর্মচারী *
                  </label>
                  <select
                    required
                    value={formData.employee}
                    onChange={(e) =>
                      setFormData({ ...formData, employee: e.target.value })
                    }
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

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ইস্যুর তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, issueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  রিকুইজিশন / আবেদনপত্র নম্বর
                </label>
                <input
                  type="text"
                  value={formData.requisitionNo}
                  onChange={(e) =>
                    setFormData({ ...formData, requisitionNo: e.target.value })
                  }
                  placeholder="REQ-1002"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Dynamic Items list */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  প্রদেয় মালামালের তালিকা
                </label>
                <div className="space-y-3">
                  {formData.items.map((row, idx) => {
                    const selectedItemObj = items?.find((i) => i._id === row.item);
                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-3 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200/80"
                      >
                        <div className="col-span-8">
                          <select
                            required
                            value={row.item}
                            onChange={(e) =>
                              handleItemChange(idx, "item", e.target.value)
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm"
                          >
                            {items?.map((itm) => (
                              <option key={itm._id} value={itm._id}>
                                {itm.name} (স্টক: {itm.currentStock} {itm.unit}) - {itm.itemType === "returnable" ? "ফেরতযোগ্য" : "ব্যবহারযোগ্য"}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-4">
                          <input
                            type="number"
                            min="1"
                            max={selectedItemObj?.currentStock || 999}
                            required
                            placeholder="পরিমাণ"
                            value={row.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm text-center font-bold"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={addRow}
                  className="mt-3 btn btn-sm btn-ghost text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={16} /> আরো আইটেম যোগ করুন
                </button>
              </div>

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
                  disabled={submitting}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6 cursor-pointer"
                >
                  {submitting ? "ইস্যু হচ্ছে..." : "ইস্যু সম্পন্ন করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Receipt View Modal */}
      {viewingIssue && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="border-b border-slate-200 pb-4 mb-4 text-center">
              <h2 className="text-xl font-bold text-slate-800">চুয়াডাঙ্গা পৌরসভা কার্যালয়</h2>
              <p className="text-xs text-slate-500">স্টোর ইস্যু রসিদ (Store Issue Voucher)</p>
              <div className="mt-2 text-xs font-mono font-bold text-emerald-700">
                ইস্যু নং: {viewingIssue.issueNumber || viewingIssue.issueNo}
              </div>
            </div>

            <div className="space-y-1 text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-2xl">
              <p>
                <strong>গ্রহীতা কর্মকর্তা:</strong> {viewingIssue.employee?.name}
              </p>
              <p>
                <strong>পদবী ও বিভাগ:</strong> {viewingIssue.employee?.designation} (
                {viewingIssue.employee?.department?.name})
              </p>
              <p>
                <strong>ইস্যুর তারিখ:</strong>{" "}
                {new Date(viewingIssue.issueDate || viewingIssue.createdAt).toLocaleDateString("bn-BD")}
              </p>
            </div>

            <table className="table w-full text-xs border border-slate-200 rounded-xl mb-4">
              <thead>
                <tr className="bg-slate-100">
                  <th>আইটেম</th>
                  <th>পরিমাণ</th>
                  <th>টাইপ</th>
                </tr>
              </thead>
              <tbody>
                {viewingIssue.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td className="font-bold text-slate-800">{it.item?.name || "N/A"}</td>
                    <td>{it.quantity} {it.item?.unit || "টি"}</td>
                    <td>
                      <span className="badge badge-sm font-normal">
                        {it.item?.itemType === "returnable" ? "ফেরতযোগ্য" : "ব্যবহারযোগ্য"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                onClick={() => setViewingIssue(null)}
                className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6 cursor-pointer"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
