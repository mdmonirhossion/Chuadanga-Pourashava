import { useState, useEffect } from "react";
import api from "../Services/api";
import { Users, Plus } from "lucide-react";

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "storekeeper",
  });
  const [alert, setAlert] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get("/auth/users");
      const userList = res.data?.users || res.data?.data || (Array.isArray(res.data) ? res.data : []);
      setUsers(userList);
    } catch (err) {
      console.error("Failed to load users:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", formData);
      setAlert({ type: "success", text: "নতুন ব্যবহারকারী সফলভাবে রেজিস্টার হয়েছে" });
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "storekeeper" });
      fetchUsers();
    } catch (err) {
      setAlert({ type: "error", text: err.response?.data?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে" });
    }
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Users size={28} className="text-emerald-600" />
            সিস্টেম ব্যবহারকারী ও এডমিন (Users Management)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            স্টোর কিপার ও অ্যাডমিন একাউন্ট তৈরি এবং রোল নিয়ন্ত্রণ
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          নতুন ব্যবহারকারী যোগ করুন
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
                  <th>ব্যবহারকারীর নাম</th>
                  <th>ইমেইল এড্রেস</th>
                  <th>অনুমোদিত রোল (Role)</th>
                  <th>স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {users && users.length > 0 ? (
                  users.map((u) => (
                    <tr key={u._id || u.id} className="hover:bg-slate-50/80">
                      <td className="font-bold text-slate-800">{u.name}</td>
                      <td className="font-mono text-slate-600">{u.email}</td>
                      <td>
                        <span
                          className={`badge badge-sm font-bold capitalize ${
                            u.role === "admin"
                              ? "badge-primary text-white"
                              : "badge-accent text-white"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success text-white font-medium text-xs">
                          {u.status || "Active"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-10 text-slate-400">
                      কোন ব্যবহারকারীর তথ্য পাওয়া যায়নি
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
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-lg font-bold mb-4">নতুন ব্যবহারকারী যোগ করুন</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">পূর্ণ নাম *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="যেমন: মোঃ জহিরুল ইসলাম"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">ইমেইল এড্রেস *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="user@chuadanga.gov.bd"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">পাসওয়ার্ড *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1">অনুমোদিত রোল *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="storekeeper">Storekeeper (স্টোর কিপার)</option>
                  <option value="admin">Admin (সুপার অ্যাডমিন)</option>
                  <option value="staff">Staff (সাধারণ স্টাফ)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-3 border-t">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-ghost">
                  বাতিল
                </button>
                <button type="submit" className="btn bg-emerald-600 text-white hover:bg-emerald-700 font-bold px-6">
                  রেজিস্টার করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
