import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import mascot from "../assets/Nutrilens moscot.png";

// ── Animated circuit SVG background ──────────────────────────────────────────
function CircuitBackground() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          {/* Horizontal lines */}
          <line x1="0" y1="20" x2="30" y2="20" stroke="#3525cd" strokeWidth="1" />
          <line x1="50" y1="20" x2="80" y2="20" stroke="#3525cd" strokeWidth="1" />
          <line x1="0" y1="60" x2="20" y2="60" stroke="#3525cd" strokeWidth="1" />
          <line x1="40" y1="60" x2="80" y2="60" stroke="#3525cd" strokeWidth="1" />
          {/* Vertical lines */}
          <line x1="30" y1="0" x2="30" y2="20" stroke="#3525cd" strokeWidth="1" />
          <line x1="30" y1="20" x2="30" y2="40" stroke="#3525cd" strokeWidth="1" />
          <line x1="50" y1="20" x2="50" y2="60" stroke="#3525cd" strokeWidth="1" />
          <line x1="20" y1="60" x2="20" y2="80" stroke="#3525cd" strokeWidth="1" />
          {/* Nodes */}
          <circle cx="30" cy="20" r="2.5" fill="#3525cd" />
          <circle cx="50" cy="20" r="2.5" fill="#3525cd" />
          <circle cx="20" cy="60" r="2.5" fill="#3525cd" />
          <circle cx="50" cy="60" r="2.5" fill="#3525cd" />
          {/* Small dots */}
          <circle cx="10" cy="40" r="1.5" fill="#4648d4" opacity="0.5" />
          <circle cx="65" cy="40" r="1.5" fill="#4648d4" opacity="0.5" />
          <circle cx="40" cy="10" r="1.5" fill="#4648d4" opacity="0.5" />
          <circle cx="40" cy="75" r="1.5" fill="#4648d4" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>
  );
}

// ── Floating particles ────────────────────────────────────────────────────────
function Particles({ active }) {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    size: Math.random() * 6 + 3,
    x: Math.random() * 100,
    delay: Math.random() * 3,
    duration: Math.random() * 4 + 3,
    opacity: Math.random() * 0.5 + 0.2,
  }));

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full bg-primary"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            bottom: "-10px",
            opacity: active ? p.opacity : p.opacity * 0.3,
            animation: `floatUp ${p.duration}s ${p.delay}s ease-in infinite`,
            transition: "opacity 0.5s ease",
          }}
        />
      ))}
    </div>
  );
}

// ── Mascot component with state-based animations ──────────────────────────────
function Mascot({ formState }) {
  // formState: 'idle' | 'email' | 'password' | 'error' | 'success' | 'loading'

  const getMascotStyle = () => {
    switch (formState) {
      case "email":
        return "animate-mascot-lean";
      case "password":
        return "animate-mascot-peek";
      case "error":
        return "animate-mascot-shake";
      case "success":
        return "animate-mascot-spin";
      case "loading":
        return "animate-mascot-pulse";
      default:
        return "animate-mascot-float";
    }
  };

  const getGlowColor = () => {
    switch (formState) {
      case "error": return "rgba(186,26,26,0.3)";
      case "success": return "rgba(34,197,94,0.4)";
      case "loading": return "rgba(53,37,205,0.4)";
      case "email":
      case "password": return "rgba(53,37,205,0.3)";
      default: return "rgba(53,37,205,0.15)";
    }
  };

  return (
    <div className="relative flex items-center justify-center w-40 h-40 mx-auto">
      {/* Outer pulse ring */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-700"
        style={{
          boxShadow: `0 0 0 0 ${getGlowColor()}`,
          animation: "pulseRing 2.5s ease-out infinite",
          background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
        }}
      />

      {/* Secondary ring */}
      <div
        className="absolute inset-4 rounded-full"
        style={{
          animation: "pulseRing 2.5s 0.8s ease-out infinite",
          background: `radial-gradient(circle, ${getGlowColor()} 0%, transparent 70%)`,
          opacity: 0.6,
        }}
      />

      {/* Scanning arc (visible on password state) */}
      {formState === "password" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="absolute w-36 h-36 rounded-full border-2 border-primary/30"
            style={{ animation: "rotateScan 3s linear infinite" }}
          />
          <div
            className="absolute w-28 h-28 rounded-full border border-primary/20"
            style={{ animation: "rotateScan 2s linear infinite reverse" }}
          />
        </div>
      )}

      {/* Error X marks */}
      {formState === "error" && (
        <>
          <div className="absolute top-2 right-2 text-red-400 font-bold text-lg animate-ping">✕</div>
          <div className="absolute bottom-4 left-2 text-red-300 font-bold animate-ping" style={{ animationDelay: "0.3s" }}>✕</div>
        </>
      )}

      {/* Success checkmark */}
      {formState === "success" && (
        <div className="absolute top-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg" style={{ animation: "popIn 0.4s cubic-bezier(0.68,-0.55,0.27,1.55)" }}>
          <span className="text-white text-sm font-bold">✓</span>
        </div>
      )}

      {/* Mascot image */}
      <img
        src={mascot}
        alt="NutriLens Mascot"
        className={`relative z-10 w-32 h-32 object-contain drop-shadow-2xl transition-all duration-500 ${getMascotStyle()}`}
        style={{
          filter: formState === "error"
            ? "drop-shadow(0 0 12px rgba(186,26,26,0.6))"
            : formState === "success"
            ? "drop-shadow(0 0 12px rgba(34,197,94,0.6))"
            : "drop-shadow(0 0 16px rgba(53,37,205,0.3))",
        }}
      />

      {/* Floating data chips (idle + email states) */}
      {(formState === "idle" || formState === "email") && (
        <>
          <div
            className="absolute -left-8 top-6 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg border border-outline-variant/20 flex items-center gap-1"
            style={{ animation: "floatChip 3s ease-in-out infinite" }}
          >
            <span className="text-green-500 text-xs">●</span>
            <span className="text-[10px] font-bold text-on-surface">85/100</span>
          </div>
          <div
            className="absolute -right-10 bottom-8 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-lg border border-outline-variant/20 flex items-center gap-1"
            style={{ animation: "floatChip 3s 1.5s ease-in-out infinite" }}
          >
            <span className="material-symbols-outlined text-primary text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
            <span className="text-[10px] font-bold text-on-surface">AI Ready</span>
          </div>
        </>
      )}

      {/* Password state eye-cover hands overlay */}
      {formState === "password" && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-3 py-1 flex items-center gap-1"
          style={{ animation: "slideUp 0.3s ease-out" }}
        >
          <span className="material-symbols-outlined text-primary text-[14px]">lock</span>
          <span className="text-[10px] font-semibold text-primary">Securing...</span>
        </div>
      )}
    </div>
  );
}

// ── Main Login component ──────────────────────────────────────────────────────
const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [formState, setFormState] = useState("idle");
  const [focused, setFocused] = useState(null);
  const cardRef = useRef(null);

  // Update mascot state based on form interactions
  useEffect(() => {
    if (loading) { setFormState("loading"); return; }
    if (error) { setFormState("error"); return; }
    if (focused === "email") { setFormState("email"); return; }
    if (focused === "password") { setFormState("password"); return; }
    setFormState("idle");
  }, [focused, error, loading]);

  // 3D card tilt on mouse move
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;
    cardRef.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(4px)`;
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)";
  };

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
      try { data = await res.json(); } catch { data = {}; }

      if (!res.ok) {
        setError(data.message || "Invalid email or password. Please try again.");
        return;
      }

      setFormState("success");
      localStorage.setItem("token", data.token);
      setIsLoggedIn(true);
      setTimeout(() => navigate("/landing"), 800);

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Keyframe injection ─────────────────────────────────────────────── */}
      <style>{`
        @keyframes floatUp {
          0%   { transform: translateY(0) scale(1); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.5; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(0.9); opacity: 0.8; }
          50%  { transform: scale(1.1); opacity: 0.3; }
          100% { transform: scale(0.9); opacity: 0.8; }
        }
        @keyframes rotateScan {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes floatChip {
          0%, 100% { transform: translateY(0px) rotate(-2deg); }
          50%      { transform: translateY(-8px) rotate(2deg); }
        }
        @keyframes slideUp {
          from { transform: translateX(-50%) translateY(10px); opacity: 0; }
          to   { transform: translateX(-50%) translateY(0); opacity: 1; }
        }
        @keyframes popIn {
          from { transform: scale(0); }
          to   { transform: scale(1); }
        }

        /* Mascot animations */
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33%      { transform: translateY(-8px) rotate(1deg); }
          66%      { transform: translateY(-4px) rotate(-1deg); }
        }
        @keyframes mascotLean {
          0%, 100% { transform: translateY(-4px) rotate(-3deg) scale(1.02); }
          50%      { transform: translateY(-10px) rotate(3deg) scale(1.04); }
        }
        @keyframes mascotPeek {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%      { transform: translateY(-6px) scale(1.05); }
        }
        @keyframes mascotShake {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          15%      { transform: translateX(-8px) rotate(-4deg); }
          30%      { transform: translateX(8px) rotate(4deg); }
          45%      { transform: translateX(-6px) rotate(-3deg); }
          60%      { transform: translateX(6px) rotate(3deg); }
          75%      { transform: translateX(-4px) rotate(-2deg); }
          90%      { transform: translateX(4px) rotate(2deg); }
        }
        @keyframes mascotSpin {
          0%   { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(15deg) scale(1.1); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes mascotPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.08); }
        }

        .animate-mascot-float  { animation: mascotFloat  3s ease-in-out infinite; }
        .animate-mascot-lean   { animation: mascotLean   2s ease-in-out infinite; }
        .animate-mascot-peek   { animation: mascotPeek   2s ease-in-out infinite; }
        .animate-mascot-shake  { animation: mascotShake  0.6s ease-in-out; }
        .animate-mascot-spin   { animation: mascotSpin   0.8s cubic-bezier(0.68,-0.55,0.27,1.55); }
        .animate-mascot-pulse  { animation: mascotPulse  1s ease-in-out infinite; }

        /* Card entrance */
        @keyframes cardEntrance {
          from { opacity: 0; transform: translateY(32px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-card-in {
          animation: cardEntrance 0.7s cubic-bezier(0.22,1,0.36,1) both;
        }
        @keyframes mascotEntrance {
          from { opacity: 0; transform: translateY(-20px) scale(0.8); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-mascot-in {
          animation: mascotEntrance 0.6s 0.2s cubic-bezier(0.22,1,0.36,1) both;
        }

        /* Input focus ring */
        .nutri-input:focus {
          box-shadow: 0 0 0 3px rgba(53,37,205,0.15);
        }

        /* Card transition */
        .tilt-card {
          transition: transform 0.15s ease-out;
          transform-style: preserve-3d;
        }
      `}</style>

      {/* ── Page ─────────────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-background font-manrope flex flex-col items-center justify-center px-container-margin relative overflow-hidden">

        {/* Circuit SVG background */}
        <CircuitBackground />

        {/* Ambient gradient blobs */}
        <div className="absolute top-[-100px] right-[-80px] w-80 h-80 bg-primary/8 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-80px] left-[-60px] w-72 h-72 bg-secondary/8 rounded-full blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/3 rounded-full blur-3xl pointer-events-none" />

        {/* Floating particles */}
        <Particles active={focused !== null} />

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="relative z-10 w-full max-w-sm">

          {/* Mascot — sits above card, overlaps it */}
          <div className="animate-mascot-in flex flex-col items-center mb-[-20px] relative z-20">
            <Mascot formState={formState} />
            <h1 className="text-display-lg text-on-surface mt-sm font-extrabold tracking-tight">
              {formState === "success" ? "Welcome back! 🎉" : "Welcome back"}
            </h1>
            <p className="text-body-md text-on-surface-variant text-center mt-xs">
              {formState === "password"
                ? "🔒 I won't peek, promise!"
                : formState === "error"
                ? "😬 Let's try that again"
                : formState === "loading"
                ? "⚡ Scanning your credentials..."
                : "Your health companion awaits"}
            </p>
          </div>

          {/* ── Card ───────────────────────────────────────────────────── */}
          <div
            ref={cardRef}
            className="animate-card-in tilt-card bg-surface-container-lowest rounded-[24px] pt-10 pb-lg px-lg shadow-[0_8px_40px_rgba(53,37,205,0.12)] border border-outline-variant/30 space-y-md relative overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Card inner glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-secondary/3 pointer-events-none rounded-[24px]" />

            {/* Error banner */}
            {error && (
              <div className="flex items-center gap-sm p-sm rounded-xl bg-error-container/60 border border-error/20 backdrop-blur-sm">
                <span className="material-symbols-outlined text-error text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  error
                </span>
                <p className="text-label-md text-on-error-container">{error}</p>
              </div>
            )}

            <form className="space-y-md relative z-10" onSubmit={handleSubmit}>

              {/* Email field */}
              <div className="space-y-xs">
                <label htmlFor="email" className="text-label-md text-on-surface-variant ml-xs flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[14px] text-primary">mail</span>
                  Email Address
                </label>
                <div className="relative group">
                  <input
                    id="email"
                    type="email"
                    placeholder="hello@nutrilens.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    onFocus={() => setFocused("email")}
                    onBlur={() => setFocused(null)}
                    required
                    className="nutri-input w-full h-12 pl-4 pr-4 bg-surface-container-low border-none rounded-xl font-body-md text-on-surface placeholder:text-outline focus:bg-white transition-all outline-none"
                  />
                  {/* Active underline */}
                  <div
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full transition-all duration-300"
                    style={{ opacity: focused === "email" ? 1 : 0, transform: focused === "email" ? "scaleX(1)" : "scaleX(0)" }}
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-xs">
                <div className="flex justify-between items-center px-xs">
                  <label htmlFor="password" className="text-label-md text-on-surface-variant flex items-center gap-xs">
                    <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
                    Password
                  </label>
                </div>
                <div className="relative group">
                  <input
                    id="password"
                    type={showPass ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    onFocus={() => setFocused("password")}
                    onBlur={() => setFocused(null)}
                    required
                    className="nutri-input w-full h-12 pl-4 pr-12 bg-surface-container-low border-none rounded-xl font-body-md text-on-surface placeholder:text-outline focus:bg-white transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-md top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPass ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                  <div
                    className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full transition-all duration-300"
                    style={{ opacity: focused === "password" ? 1 : 0, transform: focused === "password" ? "scaleX(1)" : "scaleX(0)" }}
                  />
                </div>
              </div>

              {/* Register link */}
              <div className="flex justify-between items-center px-xs">
                <NavLink to="/register" className="text-label-sm text-primary hover:underline">
                  New here? Register →
                </NavLink>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading || formState === "success"}
                className="w-full h-12 bg-primary text-on-primary rounded-xl font-semibold text-lg shadow-[0_8px_24px_rgba(53,37,205,0.30)] hover:shadow-[0_12px_32px_rgba(53,37,205,0.40)] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-sm relative overflow-hidden group"
              >
                {/* Shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                {loading ? (
                  <>
                    <span className="w-5 h-5 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Scanning credentials...
                  </>
                ) : formState === "success" ? (
                  <>
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    Authenticated!
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    Sign In
                  </>
                )}
              </button>
            </form>

            {/* Trust indicator */}
            <div className="flex justify-center pt-xs">
              <div className="inline-flex items-center gap-xs px-md py-1.5 bg-secondary-fixed/20 rounded-full border border-secondary-fixed-dim/20">
                <span className="material-symbols-outlined text-primary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified_user
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Secure, encrypted health data
                </span>
              </div>
            </div>

          </div>

          {/* Terms */}
          <p className="text-center text-label-sm text-on-surface-variant mt-lg px-md">
            By signing in, you agree to our{" "}
            <a href="#" className="text-primary hover:underline">Terms</a> &{" "}
            <a href="#" className="text-primary hover:underline">Privacy Policy</a>
          </p>

        </div>
      </div>
    </>
  );
};

export default Login;