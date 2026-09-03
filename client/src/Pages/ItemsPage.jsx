import { useState, useEffect } from "react";
import api from "../Services/api";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertCircle,
  Filter,
} from "lucide-react";

const ItemsPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    itemCode: "",
    name: "",
    category: "",
    unit: "Piece",
    itemType: "consumable",
    openingStock: 0,
    minimumStock: 5,
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, catRes] = await Promise.all([
        api.get("/items"),
        api.get("/categories"),
      ]);
      if (itemsRes.data) {
        setItems(itemsRes.data.items || itemsRes.data.data || []);
      }
      if (catRes.data) {
        setCategories(catRes.data.categories || catRes.data.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      itemCode: `ITM-${Math.floor(100 + Math.random() * 900)}`,
      name: "",
      category: categories[0]?._id || "",
      unit: "Piece",
      itemType: "consumable",
      openingStock: 0,
      minimumStock: 5,
      description: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      itemCode: item.itemCode,
      name: item.name,
      category: item.category?._id || item.category,
      unit: item.unit,
      itemType: item.itemType,
      openingStock: item.openingStock || 0,
      minimumStock: item.minimumStock || 5,
      description: item.description || "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingItem) {
        await api.put(`/items/${editingItem._id}`, formData);
        setAlert({ type: "success", text: "মালামালের তথ্য সফলভাবে আপডেট হয়েছে" });
      } else {
        await api.post("/items", formData);
        setAlert({ type: "success", text: "নতুন মালামাল সফলভাবে যুক্ত হয়েছে" });
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      setAlert({
        type: "error",
        text: err.response?.data?.message || "মালামাল সংরক্ষণ সম্ভব হয়নি",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("আপনি কি এই মালামালটি মুছে ফেলতে চান?")) return;
    try {
      await api.delete(`/items/${id}`);
      setAlert({ type: "success", text: "মালামাল সফলভাবে মুছে ফেলা হয়েছে" });
      fetchData();
    } catch (err) {
      setAlert({
        type: "error",
        text: err.response?.data?.message || "মুছে ফেলা সম্ভব হয়নি",
      });
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.itemCode?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory
      ? (item.category?._id || item.category) === selectedCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
            <Package size={28} className="text-emerald-600" />
            ইনভেন্টরি স্টক তালিকা (Store Items)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            চুয়াডাঙ্গা পৌরসভার ষ্টোরে রক্ষিত সকল মালামালের তালিকা ও মজুদ নিয়ন্ত্রণ
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-md font-bold text-xs flex items-center gap-2 cursor-pointer"
        >
          <Plus size={18} />
          নতুন মালামাল যুক্ত করুন
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="মালামালের নাম অথবা কোড দিয়ে খুঁজুন..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">সকল ক্যাটাগরি (All Categories)</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
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
                  <th>কোড (Item Code)</th>
                  <th>মালামালের নাম</th>
                  <th>ক্যাটাগরি</th>
                  <th>টাইপ</th>
                  <th>একক (Unit)</th>
                  <th>বর্তমান মজুদ</th>
                  <th>স্ট্যাটাস</th>
                  <th className="text-right">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-100">
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => {
                    const isLow = item.currentStock <= item.minimumStock;
                    return (
                      <tr key={item._id} className="hover:bg-slate-50/80 transition">
                        <td className="font-mono text-xs font-bold text-slate-700">
                          {item.itemCode}
                        </td>
                        <td>
                          <p className="font-bold text-slate-800">{item.name}</p>
                          {item.description && (
                            <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
                          )}
                        </td>
                        <td className="text-slate-600 font-medium">
                          {item.category?.name || "N/A"}
                        </td>
                        <td>
                          <span
                            className={`badge badge-sm font-semibold capitalize ${
                              item.itemType === "returnable"
                                ? "badge-secondary text-white"
                                : "badge-ghost text-slate-700"
                            }`}
                          >
                            {item.itemType === "returnable" ? "ফেরতযোগ্য" : "ব্যবহারযোগ্য"}
                          </span>
                        </td>
                        <td className="text-slate-600">{item.unit}</td>
                        <td className="font-extrabold text-slate-800">
                          {item.currentStock}
                        </td>
                        <td>
                          {isLow ? (
                            <span className="badge badge-error text-white font-bold text-xs flex items-center gap-1">
                              <AlertCircle size={12} />
                              ঘাটতি (Low)
                            </span>
                          ) : (
                            <span className="badge badge-success text-white font-bold text-xs">
                              পর্যাপ্ত (In Stock)
                            </span>
                          )}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEditModal(item)}
                              className="btn btn-ghost btn-xs text-blue-600 hover:bg-blue-50"
                              title="এডিট"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="btn btn-ghost btn-xs text-rose-600 hover:bg-rose-50"
                              title="মুছে ফেলুন"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-slate-400">
                      কোন মালামালের তথ্য পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-200">
            <h3 className="text-xl font-bold text-slate-800 mb-4">
              {editingItem ? "মালামাল পরিবর্তন করুন" : "নতুন মালামাল যুক্ত করুন"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    আইটেম কোড *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemCode}
                    onChange={(e) =>
                      setFormData({ ...formData, itemCode: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    ক্যাটাগরি *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">নির্বাচন করুন</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  মালামালের নাম *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="যেমন: LED Bulb 20W"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    একক (Unit) *
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Piece">Piece (পিস)</option>
                    <option value="Box">Box (বক্স)</option>
                    <option value="Packet">Packet (প্যাকেট)</option>
                    <option value="KG">KG (কেজি)</option>
                    <option value="Meter">Meter (মিটার)</option>
                    <option value="Set">Set (সেট)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    আইটেম টাইপ *
                  </label>
                  <select
                    value={formData.itemType}
                    onChange={(e) =>
                      setFormData({ ...formData, itemType: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="consumable">Consumable (ব্যবহারযোগ্য)</option>
                    <option value="returnable">Returnable (ফেরতযোগ্য)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    প্রারম্ভিক স্টক (Opening Stock)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.openingStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        openingStock: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    সর্বনিম্ন স্টক সীমা (Low Stock Limit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minimumStock}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minimumStock: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  বিবরণ (Description)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn btn-ghost rounded-xl text-slate-600"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold px-6"
                >
                  {submitting ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemsPage;
