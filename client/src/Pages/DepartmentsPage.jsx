import { useState, useEffect } from "react";
import api from "../Services/api";
import { Building2, Plus, Edit2, Trash2 } from "lucide-react";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: "", code: "", description: "" });
  const [alert, setAlert] = useState(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/departments");
      setDepartments(res.data?.departments || res.data?.data || []);
    } catch (err) {
      console.error(err);
      setDepartments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (dept = null) => {
    setEditingDept(dept);
    setFormData(
      dept
        ? { name: dept.name, code: dept.code, description: dept.description || "" }
        : { name: "", code: "", description: "" }
    );
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await api.put(`/departments/${editingDept._id}`, formData);
        setAlert({ type: "success", text: "বিভাগের তথ্য আপডেট হয়েছে" });
      } else {
        await api.post("/departments", formData);
        setAlert({ type: "success", text: "নতুন বিভাগ যুক্ত হয়েছে" });
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setAlert({ type: "error", text: err.response?.data?.message || "ব্যর্থ হয়েছে" });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি এই বিভাগটি মুছে ফেলতে চান?")) return;
    try {
      await api.delete(`/departments/${id}`);
      setAlert({ type: "success", text: "বিভাগ মুছে ফেলা হয়েছে" });
      fetchDepartments();
    } catch (err) {
      setAlert({ type: "error", text: err.response?.data?.message || "মুছে ফেলা সম্ভব হয়নি" });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Building2 size={28} className="text-emerald-600" />
            পৌরসভা বিভাগসমূহ (Departments)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            চুয়াডাঙ্গা পৌরসভার প্রশাসনিক ও কারিগরী শাখা/বিভাগ ম্যানেজমেন্ট
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          নতুন বিভাগ যোগ করুন
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
                  <th>বিভাগের নাম</th>
                  <th>বিবরণ</th>
                  <th className="text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {departments && departments.length > 0 ? (
                  departments.map((d) => (
                    <tr key={d._id} className="hover:bg-slate-50/80">
                      <td className="font-mono font-bold text-emerald-700">{d.code}</td>
                      <td className="font-bold text-slate-800">{d.name}</td>
                      <td className="text-slate-500">{d.description || "N/A"}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(d)}
                            className="btn btn-ghost btn-xs text-blue-600"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(d._id)}
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
                    <td colSpan={4} className="text-center py-10 text-slate-400">
                      কোন বিভাগের তথ্য পাওয়া যায়নি
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
              {editingDept ? "বিভাগ সংশোধন করুন" : "নতুন বিভাগ যোগ করুন"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">বিভাগের কোড *</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="ENG, HLT, ADM"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">বিভাগের নাম *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Engineering Department"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">বিবরণ</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">
                  বাতিল
                </button>
                <button type="submit" className="btn bg-emerald-600 text-white hover:bg-emerald-700">
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

export default DepartmentsPage;
