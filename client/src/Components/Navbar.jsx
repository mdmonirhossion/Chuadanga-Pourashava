import { LogOut, Bell, Building2 } from "lucide-react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar bg-base-100 border-b border-base-200 sticky top-0 z-30 px-4 lg:px-8 shadow-xs font-sans">
      <div className="flex-1 flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="btn btn-ghost btn-square lg:hidden"
          aria-label="Toggle Sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex items-center gap-3">
          {/* Official Chuadanga Pourashava Logo */}
          <img
            src="/logo.png"
            alt="চুয়াডাঙ্গা পৌরসভা লোগো"
            className="w-10 h-10 object-contain drop-shadow-xs"
          />
          <div>
            <h1 className="font-bold text-lg leading-tight text-gray-800 flex items-center gap-2">
              চুয়াডাঙ্গা পৌরসভা স্টোর
              <span className="badge badge-sm badge-emerald-100 text-emerald-800 border-emerald-300 font-normal">
                v1.0
              </span>
            </h1>
            <p className="text-xs text-gray-500 hidden sm:block">
              Chuadanga Pourashava Store & Inventory Management System
            </p>
          </div>
        </div>
      </div>

      <div className="flex-none flex items-center gap-4">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium">
          <Building2 size={15} />
          <span>পৌর ভবন, চুয়াডাঙ্গা</span>
        </div>

        {/* Notifications indicator */}
        <div className="dropdown dropdown-end">
          <button tabIndex={0} className="btn btn-ghost btn-circle btn-sm cursor-pointer">
            <div className="indicator">
              <Bell size={18} className="text-gray-600" />
              <span className="badge badge-xs badge-primary indicator-item"></span>
            </div>
          </button>
          <div tabIndex={0} className="dropdown-content z-1 card card-compact w-72 p-2 shadow-lg bg-base-100 border border-base-200 mt-3">
            <div className="card-body">
              <h3 className="font-bold text-sm">নোটিফিকেশন</h3>
              <p className="text-xs text-gray-500">ষ্টোরে স্টক সম্পর্কিত তথ্যাদি রিয়েল-টাইমে আপডেট হচ্ছে।</p>
            </div>
          </div>
        </div>

        {/* User profile dropdown */}
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
              {user?.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : "A"
              )}
            </div>
          </div>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-1 p-2 shadow-xl bg-base-100 rounded-box w-56 border border-base-200">
            <li className="menu-title border-b border-base-200 pb-2 mb-1">
              <span className="font-bold text-gray-800">{user?.name}</span>
              <span className="text-xs font-normal text-emerald-600 capitalize">{user?.email}</span>
              <span className="badge badge-sm badge-outline mt-1 capitalize">{user?.role}</span>
            </li>
            <li>
              <button onClick={handleLogout} className="text-error font-medium flex items-center gap-2 mt-1 cursor-pointer">
                <LogOut size={16} />
                লগআউট করুন
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
