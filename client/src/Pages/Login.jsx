import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight, ShieldCheck, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleSubmitting(true);
    try {
      const result = await loginWithGoogle();
      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError("Google Login failed");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail("admin@chuadanga.gov.bd");
    setPassword("admin123456");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-200/80 p-8 z-10 relative">
        <div className="text-center mb-6">
          {/* Official Chuadanga Pourashava Logo */}
          <div className="flex justify-center mb-3">
            <img
              src="/logo.png"
              alt="চুয়াডাঙ্গা পৌরসভা লোগো"
              className="w-20 h-20 object-contain drop-shadow-md hover:scale-105 transition"
            />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">চুয়াডাঙ্গা পৌরসভা</h2>
          <p className="text-emerald-700 font-semibold text-sm mt-0.5">
            স্টোর ও ইনভেন্টরি ম্যানেজমেন্ট সিস্টেম
          </p>
          <p className="text-slate-500 text-xs mt-0.5">
            Store Management Login Portal
          </p>
        </div>

        {error && (
          <div className="alert alert-error text-sm py-2.5 px-4 mb-6 rounded-xl text-white font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              ইমেইল এড্রেস (Email)
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@chuadanga.gov.bd"
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wider">
              পাসওয়ার্ড (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-400" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white text-sm outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition"
                title={showPassword ? "পাসওয়ার্ড লুকান" : "পাসওয়ার্ড দেখুন"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || googleSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition duration-200 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <span>লগইন করুন</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400 font-medium">অথবা</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={googleSubmitting || submitting}
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl text-slate-700 text-sm font-semibold flex items-center justify-center gap-3 shadow-xs transition cursor-pointer"
        >
          {googleSubmitting ? (
            <span className="loading loading-spinner loading-sm text-emerald-600"></span>
          ) : (
            <>
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Google দিয়ে প্রবেশ করুন (Google Login)</span>
            </>
          )}
        </button>

        {/* Demo Credentials Quick Fill */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <button
            type="button"
            onClick={fillAdminCredentials}
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <ShieldCheck size={16} />
            <span>ডেমো অ্যাডমিন আইডি ডায়াল করুন</span>
          </button>
          
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-center text-xs text-slate-600 space-y-1">
            <p className="font-bold text-slate-800">লগইন এড্রেস ও পাসওয়ার্ড:</p>
            <p className="font-mono"><strong>ইমেইল:</strong> admin@chuadanga.gov.bd</p>
            <p className="font-mono"><strong>পাসওয়ার্ড:</strong> admin123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
