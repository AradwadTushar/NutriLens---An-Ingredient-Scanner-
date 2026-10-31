import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Nutrilens logo white.png";

export default function Register({ setIsLoggedIn }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    email: "",
    phone: "",
    password: "",
    cpassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.cpassword) {
      setError("Passwords do not match. Please re-enter your password.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        data = {};
      }

      if (res.status === 201) {
        if (data.token) {
          localStorage.setItem("token", data.token);
          const profile = {
            email: formData.email,
            role: data.role || "user",
            scansLimit: data.scansLimit || 2,
            scansUsed: 0,
            scansRemaining: data.role === "admin" ? -1 : (data.scansLimit || 2),
          };
          try {
            localStorage.setItem("user_profile", JSON.stringify(profile));
          } catch (e) {
            console.error("Failed to store profile on register:", e);
          }
          setIsLoggedIn(true);
        }
        navigate("/landing");
      } else {
        setError(data.message || "Registration failed. Please try a different email.");
      }
    } catch (err) {
      console.error("Register Error:", err);
      setError("Cannot connect to server. Please verify backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-surface font-manrope flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      {/* ── Ambient Background Lighting ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-100px] left-[-80px] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* ── Responsive Registration Card ─────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-outline-variant/30 overflow-hidden grid grid-cols-1 md:grid-cols-12 animate-fadeIn">

        {/* Left Side: Brand Highlights & Perks (5 cols on md+) */}
        <div className="md:col-span-5 bg-gradient-to-br from-primary to-indigo-800 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
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
                Join Free & Start Auditing Food Labels.
              </h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Create your account to unlock free scans, save clinical dossiers, and get personalized allergy alerts.
              </p>
            </div>

            <div className="space-y-3 pt-4 text-xs">
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-emerald-300 text-[18px]">verified</span>
                <span>2 Free High-Precision Scans Included</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-cyan-300 text-[18px]">favorite</span>
                <span>Personalized Allergen Warning Radar</span>
              </div>
              <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-xs p-2.5 rounded-xl border border-white/10">
                <span className="material-symbols-outlined text-amber-300 text-[18px]">shield</span>
                <span>Private & Encrypted Health Profile</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-8 text-[11px] text-white/60">
            Zero spam. No credit card required.
          </div>
        </div>

        {/* Right Side: Form (7 cols on md+) */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center space-y-5">
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold text-on-surface tracking-tight">
              Create Free Account
            </h1>
            <p className="text-sm text-on-surface-variant">
              Quick setup to start scanning your food labels.
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

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="companyName" className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">person</span>
                <span>Full Name</span>
              </label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                placeholder="Alex Morgan"
                value={formData.companyName}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">mail</span>
                <span>Email Address</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Phone (Optional) */}
            <div className="space-y-1">
              <label htmlFor="phone" className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px] text-primary">call</span>
                <span>Phone Number (Optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 555-0199"
                value={formData.phone}
                onChange={handleChange}
                className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
              />
            </div>

            {/* Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-primary">lock</span>
                  <span>Password</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full h-11 pl-4 pr-10 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors p-1"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="cpassword" className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-primary">lock_reset</span>
                  <span>Confirm Password</span>
                </label>
                <input
                  id="cpassword"
                  name="cpassword"
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.cpassword}
                  onChange={handleChange}
                  required
                  className="w-full h-11 px-4 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-white text-sm transition-all"
                />
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Create Free Account</span>
                </>
              )}
            </button>
          </form>

          {/* Bottom Switcher */}
          <div className="pt-1 text-center text-xs text-on-surface-variant">
            Already registered?{" "}
            <NavLink to="/login" className="font-bold text-primary hover:underline">
              Sign In here →
            </NavLink>
          </div>
        </div>

      </div>
    </div>
  );
}
