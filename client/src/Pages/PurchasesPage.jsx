import { useState, useEffect } from "react";
import api from "../Services/api";
import { ShoppingCart, Plus, Trash2, Eye } from "lucide-react";

const PurchasesPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewingPurchase, setViewingPurchase] = useState(null);

  const [formData, setFormData] = useState({
    invoiceNumber: "",
    supplier: "",
    purchaseDate: new Date().toISOString().split("T")[0],
    remarks: "",
    items: [{ item: "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
  });

  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [purRes, supRes, itmRes] = await Promise.all([
        api.get("/purchases"),
        api.get("/suppliers"),
        api.get("/items"),
      ]);
      setPurchases(purRes.data?.purchases || purRes.data?.data || []);
      setSuppliers(supRes.data?.suppliers || supRes.data?.data || []);
      setItems(itmRes.data?.items || itmRes.data?.data || []);
    } catch (err) {
      console.error("Failed to fetch purchases:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setFormData({
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
      supplier: suppliers[0]?._id || "",
      purchaseDate: new Date().toISOString().split("T")[0],
      remarks: "",
      items: [{ item: items[0]?._id || "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
    });
    setIsModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    if (field === "quantity" || field === "unitPrice") {
      const q = parseFloat(updatedItems[index].quantity) || 0;
      const p = parseFloat(updatedItems[index].unitPrice) || 0;
      updatedItems[index].totalPrice = q * p;
    }
    setFormData({ ...formData, items: updatedItems });
  };

  const addRow = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { item: items[0]?._id || "", quantity: 1, unitPrice: 0, totalPrice: 0 }],
    });
  };

  const removeRow = (index) => {
    if (formData.items.length === 1) return;
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  const grandTotal = formData.items.reduce((acc, i) => acc + (i.totalPrice || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.supplier) {
      setAlert({ type: "error", text: "সরবরাহকারী নির্বাচন করুন" });
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/purchases", {
        ...formData,
        totalAmount: grandTotal,
      });
      setAlert({ type: "success", text: "নতুন স্টক সাফল্যজনকভাবে গ্রিহীত ও যুক্ত হয়েছে" });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({
        type: "error",
        text: err.response?.data?.message || "স্টক এন্ট্রি সম্পন্ন করা সম্ভব হয়নি",
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
            <ShoppingCart size={28} className="text-emerald-600" />
            স্টক রিসিভ ও ইনভয়েস এন্ট্রি (Purchases)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            সরবরাহকারীর কাছ থেকে মালামাল গ্রহণ এবং গোডাউন স্টকে জমা করার রেজিস্টার
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          নতুন স্টক গ্রহণ করুন
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

      {/* History Table */}
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
                  <th>ইনভয়েস নম্বর</th>
                  <th>তারিখ</th>
                  <th>সরবরাহকারী (Supplier)</th>
                  <th>মোট মালামালের ধরন</th>
                  <th>মোট খরচ (৳)</th>
                  <th className="text-right">ভাউচার</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {purchases && purchases.length > 0 ? (
                  purchases.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/80 transition">
                      <td className="font-mono text-xs font-bold text-emerald-700">
                        {p.invoiceNumber}
                      </td>
                      <td className="text-slate-700 font-medium">
                        {new Date(p.purchaseDate).toLocaleDateString("bn-BD")}
                      </td>
                      <td className="font-bold text-slate-800">
                        {p.supplier?.name || "N/A"}
                      </td>
                      <td>{p.items?.length || 0} টি আইটেম</td>
                      <td className="font-extrabold text-slate-900">
                        ৳ {(p.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => setViewingPurchase(p)}
                          className="btn btn-ghost btn-xs text-emerald-700 font-bold flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Eye size={15} />
                          ভাউচার দেখুন
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      কোন স্টক এন্ট্রির তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              নতুন স্টক গ্রহণ ইনভয়েস এন্ট্রি
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    মেমো / ইনভয়েস নম্বর *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, invoiceNumber: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সরবরাহকারী নির্বাচন *
                  </label>
                  <select
                    required
                    value={formData.supplier}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {suppliers?.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name} ({s.company})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ক্রয়ের তারিখ *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.purchaseDate}
                    onChange={(e) =>
                      setFormData({ ...formData, purchaseDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Items Dynamic Rows */}
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-700 mb-2 uppercase">
                  মালামালের বিবরণ
                </label>
                <div className="space-y-3">
                  {formData.items.map((row, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-3 rounded-2xl border border-slate-200/80"
                    >
                      <div className="col-span-5">
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
                              {itm.name} ({itm.itemCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="1"
                          required
                          placeholder="পরিমাণ"
                          value={row.quantity}
                          onChange={(e) =>
                            handleItemChange(idx, "quantity", e.target.value)
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm text-center"
                        />
                      </div>

                      <div className="col-span-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="একক দর (৳)"
                          value={row.unitPrice}
                          onChange={(e) =>
                            handleItemChange(idx, "unitPrice", e.target.value)
                          }
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm text-center"
                        />
                      </div>

                      <div className="col-span-2 font-bold text-sm text-right pr-2">
                        ৳ {row.totalPrice || 0}
                      </div>

                      <div className="col-span-1 text-center">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRow(idx)}
                            className="text-rose-500 hover:text-rose-700 cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addRow}
                  className="mt-3 btn btn-sm btn-ghost text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Plus size={16} /> আরো আইটেম যোগ করুন
                </button>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-lg font-extrabold text-slate-800">
                  সর্বমোট: <span className="text-emerald-700">৳ {grandTotal}</span>
                </div>

                <div className="flex items-center gap-3">
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
                    {submitting ? "সংরক্ষণ হচ্ছে..." : "ইনভয়েস সেভ করুন"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Voucher Detail Modal */}
      {viewingPurchase && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="border-b border-slate-200 pb-4 mb-4 text-center">
              <h2 className="text-xl font-bold text-slate-800">চুয়াডাঙ্গা পৌরসভা কার্যালয়</h2>
              <p className="text-xs text-slate-500">স্টোর রিসিভ ভাউচার (Stock Receipt)</p>
              <div className="mt-2 text-xs font-mono font-bold text-emerald-700">
                ইনভয়েস: {viewingPurchase.invoiceNumber}
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-4">
              <p>
                <strong>সরবরাহকারী:</strong> {viewingPurchase.supplier?.name} ({viewingPurchase.supplier?.company})
              </p>
              <p>
                <strong>তারিখ:</strong>{" "}
                {new Date(viewingPurchase.purchaseDate).toLocaleDateString("bn-BD")}
              </p>
            </div>

            <table className="table w-full text-xs border border-slate-200 rounded-xl mb-4">
              <thead>
                <tr className="bg-slate-100">
                  <th>আইটেম</th>
                  <th>পরিমাণ</th>
                  <th>একক দর</th>
                  <th>মোট</th>
                </tr>
              </thead>
              <tbody>
                {viewingPurchase.items?.map((it, idx) => (
                  <tr key={idx}>
                    <td>{it.item?.name || "N/A"}</td>
                    <td>{it.quantity}</td>
                    <td>৳ {it.unitPrice}</td>
                    <td>৳ {it.totalPrice}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="font-extrabold text-slate-800">
                মোট খরচ: ৳ {viewingPurchase.totalAmount}
              </span>
              <button
                onClick={() => setViewingPurchase(null)}
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

export default PurchasesPage;
