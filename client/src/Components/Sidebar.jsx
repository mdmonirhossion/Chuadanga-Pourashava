import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ArrowUpFromLine,
  ArrowDownToLine,
  BookOpen,
  Building2,
  Tags,
  Truck,
  FileSpreadsheet,
  History,
  Users,
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";

const navItems = [
  {
    title: "ড্যাশবোর্ড (Dashboard)",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "ইনভেন্টরি স্টক (Items)",
    path: "/items",
    icon: Package,
  },
  {
    title: "স্টক এন্ট্রি (Purchases)",
    path: "/purchases",
    icon: ShoppingCart,
  },
  {
    title: "মালামাল ইস্যু (Issue Store)",
    path: "/issues",
    icon: ArrowUpFromLine,
  },
  {
    title: "মালামাল ফেরত (Return Store)",
    path: "/returns",
    icon: ArrowDownToLine,
  },
  {
    title: "কর্মকর্তা লেজার (Ledger)",
    path: "/employee-ledger",
    icon: BookOpen,
  },
  {
    title: "বিভাগসমূহ (Departments)",
    path: "/departments",
    icon: Building2,
  },
  {
    title: "ক্যাটাগরি (Categories)",
    path: "/categories",
    icon: Tags,
  },
  {
    title: "সরবরাহকারী (Suppliers)",
    path: "/suppliers",
    icon: Truck,
  },
  {
    title: "প্রতিবেদন (Reports)",
    path: "/reports",
    icon: FileSpreadsheet,
  },
  {
    title: "অডিট ট্রেইল (Transactions)",
    path: "/transactions",
    icon: History,
  },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-base-100 border-r border-base-200 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand header in sidebar */}
        <div className="p-4 border-b border-base-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="চুয়াডাঙ্গা পৌরসভা লোগো"
              className="w-7 h-7 object-contain"
            />
            <span className="font-bold text-gray-800 text-xs tracking-wide uppercase">
              মেনু নির্দেশিকা
            </span>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-circle btn-xs lg:hidden"
          >
            ✕
          </button>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.title}</span>
              </NavLink>
            );
          })}

          {user?.role === "admin" && (
            <>
              <div className="pt-3 pb-1">
                <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  অ্যাডমিন কন্ট্রোল
                </p>
              </div>
              <NavLink
                to="/users"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-semibold"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`
                }
              >
                <Users size={18} />
                <span>ইউজার এডমিন (Users)</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-base-200 bg-base-200/50 text-xs text-gray-500 text-center flex flex-col items-center gap-1">
          <img
            src="/logo.png"
            alt="চুয়াডাঙ্গা পৌরসভা লোগো"
            className="w-8 h-8 object-contain opacity-80"
          />
          <p className="font-semibold text-gray-700">চুয়াডাঙ্গা পৌরসভা</p>
          <p className="text-[11px]">ডিজিটাল স্টোর রেজিস্টার © 2026</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
