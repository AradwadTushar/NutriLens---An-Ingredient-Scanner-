import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Nutrilens logo white.png";

export default function Login({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (!res.ok) {
        if (!data.message && (res.status === 500 || res.status === 502 || res.status === 504)) {
          setError("Cannot connect to backend server. Please verify the Flask backend is running on port 5000.");
          return;
        }
        setError(data.message || "Invalid email or password. Please try again.");
        return;
      }

      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      navigate("/landing");
    } catch (err) {
      console.error("Login failed:", err);
      setError("Cannot reach the backend server. Please ensure Flask is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface font-manrope flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* ── Ambient Background Lighting ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-100px] right-[-80px] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-100px] left-[-60px] w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* ── Responsive Authentication Card ───────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-outline-variant/30 overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-fadeIn">

        {/* Left Side: Brand Highlights & Trust Showcase (5 cols on md+) */}
        <div className="md:col-span-5 bg-gradient-to-br from-primary to-indigo-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background circuit watermark */}
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center p-2 shadow-sm">
                <img src={logo} alt="NutriLens" className="h-full w-auto object-contain" />
              </div>
              <div>
                <h2 className="font-extrabold text-lg tracking-tight">NutriLens</h2>
                <p className="text-[11px] text-white/70 uppercase tracking-wider font-semibold">
                  Food Intelligence
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-4">
              <h3 className="text-2xl font-bold tracking-tight leading-snug">
                Welcome to Smart, Transparent Nutrition.
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Sign in to access your personalized scanner, scan history, and custom health dietary profiles.
              </p>
            </div>

            {/* Feature bullets */}
            <div className="space-y-3 pt-4 text-xs">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-cyan-300 text-[18px]">verified_user</span>
                <span>Encrypted & Private Health Data</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-amber-300 text-[18px]">bolt</span>
                <span>Instant INS / E-Number Decoder</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-emerald-300 text-[18px]">file_download</span>
                <span>Direct Vector PDF & Word Reports</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 text-[11px] text-white/60">
            © {new Date().getFullYear()} NutriLens. Backed by WHO & FDA Reference Standards.
          </div>
        </div>

        {/* Right Side: Form View (7 cols on md+) */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              Sign In to Your Account
            </h1>
            <p className="text-sm text-on-surface-variant">
              Enter your credentials to continue to your dashboard.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-error-container/60 border border-error/30 text-xs text-on-error-container">
              <span className="material-symbols-outlined text-error text-[18px] shrink-0">
                error
              </span>
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-primary">mail</span>
                <span>Email Address</span>
              </label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                className="w-full h-12 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label htmlFor="password" className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[15px] text-primary">lock</span>
                  <span>Password</span>
                </label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  required
                  className="w-full h-12 pl-4 pr-11 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors p-1"
                  title={showPass ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPass ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-primary text-white font-bold text-sm rounded-xl shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">login</span>
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="pt-2 text-center text-xs text-on-surface-variant">
            Don't have an account yet?{" "}
            <NavLink to="/register" className="font-bold text-primary hover:underline">
              Create Free Account →
            </NavLink>
          </div>
        </div>

      </div>
    </div>
  );
}
