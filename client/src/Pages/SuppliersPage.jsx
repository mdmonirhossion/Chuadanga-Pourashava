import { useState, useEffect } from "react";
import api from "../Services/api";
import { Truck, Plus, Edit2, Trash2 } from "lucide-react";

const SuppliersPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    supplierCode: "",
    name: "",
    company: "",
    phone: "",
    email: "",
    address: "",
  });
  const [alert, setAlert] = useState(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/suppliers");
      setSuppliers(res.data?.suppliers || res.data?.data || []);
    } catch (err) {
      console.error(err);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleOpenModal = (supplier = null) => {
    setEditingSupplier(supplier);
    setFormData(
      supplier
        ? {
            supplierCode: supplier.supplierCode,
            name: supplier.name,
            company: supplier.company || "",
            phone: supplier.phone || "",
            email: supplier.email || "",
            address: supplier.address || "",
          }
        : {
            supplierCode: `SUP-${Math.floor(100 + Math.random() * 900)}`,
            name: "",
            company: "",
            phone: "",
            email: "",
            address: "",
          }
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, formData);
        setAlert({ type: "success", text: "সরবরাহকারীর তথ্য আপডেট হয়েছে" });
      } else {
        await api.post("/suppliers", formData);
        setAlert({ type: "success", text: "নতুন সরবরাহকারী যুক্ত হয়েছে" });
      }
      setIsModalOpen(false);
      fetchSuppliers();
    } catch (err) {
      setAlert({ type: "error", text: err.response?.data?.message || "ব্যর্থ হয়েছে" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি এই সরবরাহকারী মুছে ফেলতে চান?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      setAlert({ type: "success", text: "সরবরাহকারী মুছে ফেলা হয়েছে" });
      fetchSuppliers();
    } catch (err) {
      setAlert({ type: "error", text: err.response?.data?.message || "মুছে ফেলা সম্ভব হয়নি" });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Truck size={28} className="text-emerald-600" />
            সরবরাহকারী ও ভেন্ডর (Suppliers)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            পৌরসভায় মালামাল সরবরাহকারী প্রতিষ্ঠান ও ঠিকাদারদের রেজিস্টার
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          নতুন সরবরাহকারী যোগ করুন
        </button>
      </div>

      {alert && (
        <div className={`alert ${alert.type === "success" ? "alert-success text-white" : "alert-error text-white"} rounded-2xl py-3 px-5 flex justify-between`}>
          <span>{alert.text}</span>
          <button onClick={() => setAlert(null)} className="font-bold cursor-pointer">✕</button>
        </div>
      )}

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
                  <th>কোড</th>
                  <th>সরবরাহকারীর নাম</th>
                  <th>কোম্পানি/প্রতিষ্ঠানের নাম</th>
                  <th>মোবাইল নম্বর</th>
                  <th>ঠিকানা</th>
                  <th className="text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {suppliers && suppliers.length > 0 ? (
                  suppliers.map((s) => (
                    <tr key={s._id} className="hover:bg-slate-50/80">
                      <td className="font-mono font-bold text-emerald-700">{s.supplierCode}</td>
                      <td className="font-bold text-slate-800">{s.name}</td>
                      <td className="text-slate-600">{s.company || "N/A"}</td>
                      <td className="font-mono text-slate-600">{s.phone || "N/A"}</td>
                      <td className="text-slate-500">{s.address || "N/A"}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(s)}
                            className="btn btn-ghost btn-xs text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(s._id)}
                            className="btn btn-ghost btn-xs text-rose-600"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-slate-400">
                      কোন সরবরাহকারীর তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold mb-4">
              {editingSupplier ? "সরবরাহকারী সংশোধন" : "নতুন সরবরাহকারী"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">সাপ্লায়ার কোড *</label>
                <input
                  type="text"
                  required
                  value={formData.supplierCode}
                  onChange={(e) => setFormData({ ...formData, supplierCode: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">প্রতিনিধির নাম *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">কোম্পানির নাম</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="যেমন: বাংলা ইলেকট্রনিক্স এন্ড ট্রেডার্স"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">মোবাইল নম্বর</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="01700000000"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ঠিকানা</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="ষ্টেশন রোড, চুয়াডাঙ্গা"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">
                  বাতিল
                </button>
                <button type="submit" className="btn bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-6">
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuppliersPage;
