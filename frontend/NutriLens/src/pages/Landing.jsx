import { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import logo from "../assets/Nurilens Logo Colored.png";
import heroImage from "../assets/Gemini_Generated_Image_pqm1cwpqm1cwpqm1.png";
import ProductTour from "../components/ui/ProductTour";

export default function Landing() {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const cached = localStorage.getItem("user_profile");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [recentFavorites, setRecentFavorites] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/api/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setUserProfile(data);
            try {
              localStorage.setItem("user_profile", JSON.stringify(data));
            } catch (e) {
              console.error("Failed to cache user profile in Landing:", e);
            }
          }
        })
        .catch((err) => console.error("Dashboard profile fetch error:", err));
    }

    // Load local favorites/recent dossiers
    try {
      const favs = JSON.parse(localStorage.getItem("nutrilens_favorites") || "[]");
      setRecentFavorites(favs.slice(0, 3));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    setSubscribed(true);
    setNewsletterEmail("");
  };

  const isAdmin = userProfile?.role === "admin";
  const scansRemaining = userProfile?.scansRemaining;
  const scansLimit = userProfile?.scansLimit ?? 2;

  // Onboarding Guided Tour Steps
  const tourSteps = [
    {
      selector: "#tour-welcome",
      title: "Your Intelligence Dashboard",
      content:
        "Welcome to NutriLens! Here you can check your active plan, monitor remaining complimentary scans, and initiate a new food audit.",
    },
    {
      selector: "#tour-scanner",
      title: "Food Label Scanner",
      content:
        "Upload any back-of-pack grocery photo or use your device camera. Our optical AI extracts text lines and uncovers hidden ingredients.",
    },
    {
      selector: "#tour-hero-preview",
      title: "Live Vision Model & Score",
      content:
        "See how our computer vision algorithms lock onto nutritional tables and compute holistic health scores in under 2 seconds.",
    },
    {
      selector: "#tour-substitutions",
      title: "Smart Dietary Substitutions",
      content:
        "Scanned an ultra-processed snack? NutriLens automatically recommends clean, low-glycemic, or additive-free alternatives.",
    },
    {
      selector: "#tour-saved",
      title: "Saved Clinical Dossiers",
      content:
        "Access bookmarked grocery analyses, review allergen profiles, and export vector PDF or Word (.docx) clinical reports.",
    },
    {
      selector: "#tour-nav-nutrii",
      title: "Nutrii AI Companion",
      content:
        "Need instant dietary advice? Tap the Nutrii icon anytime for 24/7 scientific answers to your nutrition and food safety questions.",
    },
  ];

  return (
    <div className="min-h-screen bg-surface font-manrope overflow-x-hidden pb-12">
      {/* ── Ambient Background Lighting ─────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-100px] right-[-80px] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-[-100px] left-[-60px] w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      {/* ── Main Container (Expansive Responsive Grid) ──────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-10 sm:space-y-12">

        {/* ── Section 1: Dashboard Header & Quota Card ───────────────────── */}
        <section
          id="tour-welcome"
          className="bg-gradient-to-r from-primary/10 via-white to-secondary/10 rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                dashboard
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Food Intelligence Dashboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-on-surface tracking-tight">
              Welcome Back, {userProfile?.email ? userProfile.email.split("@")[0] : "Health Explorer"}!
            </h1>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Your personalized AI nutrition lab is ready. Scan food packaging, audit chemical additives, and generate clinical safety dossiers.
            </p>
          </div>

          {/* Quota & Quick Action Badge */}
          <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <div className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-xs flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isAdmin
                    ? "bg-purple-100 text-purple-700"
                    : !userProfile
                    ? "bg-slate-100 text-slate-700"
                    : (scansRemaining ?? 0) <= 0
                    ? "bg-red-100 text-red-700"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isAdmin ? "admin_panel_settings" : !userProfile ? "hourglass_empty" : (scansRemaining ?? 0) <= 0 ? "lock" : "bolt"}
                </span>
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface">
                  {isAdmin
                    ? "Admin Plan (Unlimited)"
                    : !userProfile
                    ? "Loading Account Tier..."
                    : `${scansRemaining ?? 0} of ${scansLimit} Scans Remaining`}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {isAdmin
                    ? "Full administrative privileges"
                    : !userProfile
                    ? "Syncing quota details..."
                    : (scansRemaining ?? 0) <= 0
                    ? "Quota reached. Top up to scan."
                    : "Complimentary preview tier"}
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate("/scanner")}
              className="px-5 py-3.5 bg-primary text-white rounded-2xl font-bold text-sm shadow-md hover:bg-primary/90 hover:shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">document_scanner</span>
              <span>Start New Scan</span>
            </button>
          </div>
        </section>

        {/* ── Section 2: Quick Diagnostic Action Cards ───────────────────── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Scanner */}
          <div
            id="tour-scanner"
            onClick={() => navigate("/scanner")}
            className="group bg-white rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:border-primary/40 relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">camera_alt</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface group-hover:text-primary transition-colors">
                Food Label Scanner
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Take a photo or upload back-of-pack nutrition labels. Identifies micro-ingredients and computes safety scores in 2 seconds.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-primary">
              <span>Open Scanner</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>

          {/* Card 2: Favorites & Dossiers */}
          <div
            onClick={() => navigate("/favorites")}
            className="group bg-white rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:border-primary/40 relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">favorite</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface group-hover:text-red-600 transition-colors">
                Saved Food Dossiers
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Revisit previously analyzed grocery items, export vector PDF reports, and monitor personal consumption patterns.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-red-600">
              <span>View Saved Favorites</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>

          {/* Card 3: Scan History */}
          <div
            onClick={() => navigate("/history")}
            className="group bg-white rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:border-primary/40 relative overflow-hidden"
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-[24px]">history</span>
              </div>
              <h2 className="text-xl font-bold text-on-surface group-hover:text-indigo-700 transition-colors">
                Audit Timeline
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Complete chronological log of all analyzed packaged foods, calculated macro distributions, and identified risks.
              </p>
            </div>
            <div className="pt-2 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>Open History</span>
              <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </div>
          </div>
        </section>

        {/* ── Section 3: Visual Showcase & Smart Substitutions (Old Hero Re-Engineered) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Interactive Label Scanner Mockup Image (7 cols) */}
          <div
            id="tour-hero-preview"
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-xs flex flex-col justify-between space-y-4 relative overflow-hidden group"
          >
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  center_focus_strong
                </span>
                <h3 className="font-bold text-base text-on-surface">Live Computer Vision Model</h3>
              </div>
              <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                Real-Time Recognition
              </span>
            </div>

            {/* Visual Image with Laser Scan Line & Health Score Card */}
            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-outline-variant/20 bg-slate-950">
              <img
                src={heroImage}
                alt="Scanning nutrition label with NutriLens"
                className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700 brightness-95"
              />

              {/* Animated Laser Scan Bar */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px] animate-scan pointer-events-none" />

              {/* Central Target Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-36 h-36 border-2 border-cyan-400/50 rounded-2xl flex items-center justify-center">
                  <div className="w-full h-px bg-cyan-400/80 shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
                </div>
              </div>

              {/* Health Score Glass Card */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md p-3.5 rounded-2xl shadow-xl border border-white/60 space-y-1.5 max-w-[210px]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">
                    check_circle
                  </span>
                  <span className="font-bold text-on-surface text-xs">Optimal Health Score</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-bold text-on-surface-variant">
                  <span>85 / 100</span>
                  <span className="text-emerald-700">Clean Ingredients</span>
                </div>
                <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[85%] rounded-full" />
                </div>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed pt-1">
              NutriLens automatically corrects lens glare, aligns curved cylindrical packaging, and isolates obscured chemical text across 3,500+ commercial food standards.
            </p>
          </div>

          {/* Right Column: Smart Dietary Substitutions & Mini Analytics (5 cols) */}
          <div
            id="tour-substitutions"
            className="lg:col-span-5 flex flex-col justify-between gap-6"
          >
            {/* Smart Substitutions Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-outline-variant/30 shadow-xs space-y-4 flex-1">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-emerald-600 text-[20px]">
                    swap_horizontal_circle
                  </span>
                  <h3 className="font-bold text-base text-on-surface">Smart Substitutions</h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Clean Alternatives
                </span>
              </div>

              <p className="text-xs text-on-surface-variant leading-relaxed">
                Found unwholesome emulsifiers or added sugars? We automatically recommend cleaner alternatives available in retail stores:
              </p>

              {/* Substitution Pairs */}
              <div className="space-y-2.5">
                <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                      Recommended Swap
                    </span>
                    <span className="font-bold text-emerald-700">Unsweetened Almond Milk</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant line-through">
                    Condensed Dairy Cream
                  </span>
                </div>

                <div className="bg-surface-container-low p-3 rounded-2xl border border-outline-variant/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-on-surface-variant block">
                      Recommended Swap
                    </span>
                    <span className="font-bold text-emerald-700">Raw Cacao + Monk Fruit</span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant line-through">
                    Milk Choc with Palm Stearin
                  </span>
                </div>
              </div>
            </div>

            {/* Deep Analytics Mini-Chart Card */}
            <div className="bg-gradient-to-br from-primary to-indigo-800 rounded-3xl p-6 text-white space-y-3 shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-cyan-300">
                    insights
                  </span>
                  <h4 className="font-bold text-sm">Glycemic & Caloric Tracking</h4>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold bg-white/20 px-2 py-0.5 rounded-full">
                  Real-time
                </span>
              </div>
              <p className="text-xs text-white/80 leading-relaxed">
                Visual distribution of total calories, refined carbohydrates, and healthy fats across your grocery basket.
              </p>

              {/* Mini Bar Chart */}
              <div className="flex items-end gap-2 h-12 pt-2">
                {[40, 70, 95, 60, 45, 80, 55].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-md transition-all duration-500"
                      style={{
                        height: `${h}%`,
                        backgroundColor: i === 2 || i === 5 ? "#38bdf8" : "rgba(255,255,255,0.35)",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Saved Dossiers Preview & Additive Spotlight ──────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Recent Saved Dossiers (7 cols) */}
          <div
            id="tour-saved"
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-xs space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  bookmarks
                </span>
                <h3 className="text-lg font-bold text-on-surface">Recent Saved Dossiers</h3>
              </div>
              <NavLink to="/favorites" className="text-xs font-bold text-primary hover:underline">
                View All →
              </NavLink>
            </div>

            {recentFavorites.length > 0 ? (
              <div className="space-y-3">
                {recentFavorites.map((fav, idx) => (
                  <div
                    key={idx}
                    onClick={() =>
                      navigate("/result", { state: { extractedData: fav.data } })
                    }
                    className="p-4 rounded-2xl bg-surface-container-low hover:bg-surface-container transition-all cursor-pointer border border-outline-variant/20 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-on-surface">
                          Dossier #{fav.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            fav.verdict === "Safe"
                              ? "bg-emerald-100 text-emerald-800"
                              : fav.verdict === "Caution"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {fav.verdict}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant">
                        {fav.ingredientsCount || 0} Ingredients Audited • {fav.date}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-primary font-bold text-xs shrink-0">
                      <span>Inspect Dossier</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-surface-container-low/60 border border-outline-variant/20 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                  <span className="material-symbols-outlined text-[24px]">qr_code_scanner</span>
                </div>
                <h4 className="font-bold text-base text-on-surface">No Saved Dossiers Yet</h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Scan any packaged food label using your mobile camera or upload an image to generate your first dossier.
                </p>
                <div className="pt-1">
                  <button
                    onClick={() => navigate("/scanner")}
                    className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
                  >
                    Scan a Product Now
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Additive Spotlight & Daily Benchmarks (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Additive Spotlight */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-6 border border-amber-200/80 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2.5 py-0.5 rounded-full border border-amber-200">
                  Additive Spotlight
                </span>
                <span className="material-symbols-outlined text-amber-700 text-[20px]">
                  warning
                </span>
              </div>
              <h4 className="font-bold text-base text-amber-950">
                INS 407 (Carrageenan): Gut Inflammation Risk
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                Extracted from red seaweed and used as a thickener in plant milks, deli meats, and yogurts. European food safety agencies caution that degraded carrageenan can trigger intestinal permeability and IBS symptoms.
              </p>
            </div>

            {/* WHO Nutritional Thresholds */}
            <div className="bg-white rounded-3xl p-6 border border-outline-variant/30 space-y-3 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-[20px]">
                  health_and_safety
                </span>
                <h4 className="font-bold text-sm text-on-surface">Daily Safety Benchmarks (WHO)</h4>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant">Free Added Sugars</span>
                  <span className="font-bold text-on-surface">&lt; 25g / day</span>
                </div>
                <div className="flex justify-between py-1 border-b border-outline-variant/10">
                  <span className="text-on-surface-variant">Daily Sodium</span>
                  <span className="font-bold text-on-surface">&lt; 2,000mg (&lt; 5g salt)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-on-surface-variant">Trans Fatty Acids</span>
                  <span className="font-bold text-on-surface">&lt; 1% of total energy</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: Top Harmful Additives Quick Reference Grid ───────── */}
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/30 space-y-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
            <div>
              <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider">
                Vigilance Reference
              </span>
              <h3 className="text-lg font-extrabold text-on-surface tracking-tight">
                Top Common Chemical Additives Flagged by NutriLens
              </h3>
            </div>
            <span className="hidden sm:inline-block text-xs text-on-surface-variant">
              Cross-checked with EU/FDA lists
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1.5">
              <span className="text-xs font-mono font-bold text-red-600 block">INS 102 / E102</span>
              <h5 className="font-bold text-sm text-on-surface">Tartrazine (Yellow #5)</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                A synthetic azo dye linked to hyperactivity in children and severe hives in aspirin-sensitive individuals.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1.5">
              <span className="text-xs font-mono font-bold text-red-600 block">INS 250 / E250</span>
              <h5 className="font-bold text-sm text-on-surface">Sodium Nitrite</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Curing agent for deli meats that forms carcinogenic nitrosamines when cooked at high heat.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1.5">
              <span className="text-xs font-mono font-bold text-amber-600 block">INS 211 / E211</span>
              <h5 className="font-bold text-sm text-on-surface">Sodium Benzoate</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Common soft drink preservative that can form trace benzene when combined with Vitamin C (Ascorbic Acid).
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1.5">
              <span className="text-xs font-mono font-bold text-amber-600 block">INS 951 / E951</span>
              <h5 className="font-bold text-sm text-on-surface">Aspartame</h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                Artificial sweetener classified as possibly carcinogenic (Group 2B) by IARC / WHO in 2023.
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 6: Weekly Newsletter / Consumer Digest ─────────────── */}
        <section className="bg-gradient-to-r from-primary via-indigo-700 to-primary rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-10 [background-size:16px_16px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              <span>NutriLens Consumer Intelligence Digest</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Stay Ahead of Misleading Supermarket Additives
            </h3>

            <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
              Get our monthly breakdown of deceptive food marketing, newly flagged chemical additives, and dietician-approved supermarket alternatives delivered directly to your inbox.
            </p>

            {subscribed ? (
              <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white text-sm font-bold flex items-center justify-center gap-2 animate-fadeIn">
                <span className="material-symbols-outlined text-emerald-300 text-[20px]">check_circle</span>
                <span>You're subscribed! Check your inbox for our Supermarket Additives Guide.</span>
              </div>
            ) : (
              <form
                onSubmit={handleNewsletterSubmit}
                className="flex flex-col sm:flex-row items-center gap-3 pt-2 max-w-md mx-auto"
              >
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  required
                  className="w-full h-12 px-4 rounded-2xl bg-white text-on-surface placeholder:text-outline text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-300 shadow-sm"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 h-12 bg-white text-primary hover:bg-slate-50 font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95 shrink-0"
                >
                  Subscribe Free
                </button>
              </form>
            )}

            <p className="text-[11px] text-white/60">
              No sponsored brand promos. Unsubscribe with 1-click anytime.
            </p>
          </div>
        </section>

        {/* ── Section 7: Comprehensive Global Dashboard Footer ─────────────── */}
        <footer className="border-t border-outline-variant/30 pt-10 pb-6 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2.5">
                <img src={logo} alt="NutriLens" className="w-8 h-8 rounded-lg" />
                <span className="font-extrabold text-lg text-primary tracking-tight">
                  NutriLens
                </span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Automated optical nutrition OCR and additive intelligence engine. Built to give consumers clinical transparency in grocery aisles.
              </p>
              <div className="flex items-center gap-2 pt-1 text-xs text-emerald-700 font-bold">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Independent Consumer Lab</span>
              </div>
            </div>

            {/* Quick Tools */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider">
                Diagnostic Tools
              </h5>
              <ul className="space-y-2 text-xs text-on-surface-variant">
                <li>
                  <NavLink to="/scanner" className="hover:text-primary transition-colors">
                    Food Label Scanner
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/favorites" className="hover:text-primary transition-colors">
                    Saved Food Dossiers
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/history" className="hover:text-primary transition-colors">
                    Audit Timeline
                  </NavLink>
                </li>
                <li>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("start-nutrilens-tour"))}
                    className="hover:text-primary transition-colors text-left"
                  >
                    Take Guided Product Tour
                  </button>
                </li>
              </ul>
            </div>

            {/* Regulatory References */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider">
                Safety Standards
              </h5>
              <ul className="space-y-2 text-xs text-on-surface-variant">
                <li>
                  <span className="text-on-surface">WHO</span>: Daily Added Sugar &lt; 25g
                </li>
                <li>
                  <span className="text-on-surface">FDA</span>: GRAS & Food Color Additives
                </li>
                <li>
                  <span className="text-on-surface">FSSAI</span>: Mandatory Packaging Declarations
                </li>
                <li>
                  <span className="text-on-surface">EFSA</span>: Titanium Dioxide (E171) Ban
                </li>
              </ul>
            </div>

            {/* Legal & Medical Disclaimer */}
            <div className="space-y-2.5">
              <h5 className="font-bold text-xs text-on-surface uppercase tracking-wider">
                Clinical Disclaimer
              </h5>
              <p className="text-[11px] text-on-surface-variant leading-relaxed">
                NutriLens outputs are algorithmic evaluations based on optical OCR of package labels and public dietary databases. Not intended as direct medical or allergen diagnosis.
              </p>
              <div className="flex gap-3 text-xs pt-1">
                <NavLink to="/about" className="hover:text-primary transition-colors">
                  About Developer
                </NavLink>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-primary transition-colors">
                  Terms
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-outline-variant/15 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-on-surface-variant">
            <span>© {new Date().getFullYear()} NutriLens AI. All rights reserved.</span>
            <span>Developed by Aradwad Tushar • Built for human wellness</span>
          </div>
        </footer>

      </main>

      {/* ── Guided Product Tour Overlay Component ─────────────────────────── */}
      <ProductTour steps={tourSteps} />
    </div>
  );
}
