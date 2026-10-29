import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Nurilens Logo Colored.png";

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("spread"); // "spread" | "snack" | "drink"

  // Real scans data from real lab audits (Cocoa Spread, Savoury Namkeen Snack, Raw Coconut Water)
  const realScans = {
    spread: {
      category: "Spread",
      ocrTag: "OCR LOCK 99.8%",
      ocrTitle: "Hazelnut Cocoa Spread",
      ocrLines: [
        { pre: "Sugar, ", highlight: "Palm Oil (INS 471)", post: "", type: "danger" },
        { pre: "Hazelnuts 13%, Cocoa Solids (8.5%), ", highlight: "", post: "", type: "normal" },
        { pre: "", highlight: "Synthetic Vanillin", post: ", Emulsifier ", type: "warning" },
        { pre: "", highlight: "Soy Lecithin", post: "", type: "danger" },
      ],
      name: "Hazelnut Cocoa Spread",
      brand: "SweetDelight Co.",
      healthScore: 38,
      scoreColor: "#f43f5e", // rose-500
      scoreBadge: "High Risk · Ultra-Processed",
      scoreBadgeClass: "bg-rose-50 text-rose-600 border-rose-200/60",
      metric1: { label: "Sugar per 100g", val: "56.8g", color: "text-amber-800", bg: "bg-[#fff9ee]" },
      metric2: { label: "Additives found", val: "3", color: "text-indigo-700", bg: "bg-[#f5f3ff]" },
      findings: [
        { name: "Palm Oil (INS 471)", label: "High Saturated Fat", pillClass: "bg-rose-50 text-rose-600 border border-rose-200/60" },
        { name: "Synthetic Vanillin", label: "Artificial Flavoring", pillClass: "bg-amber-50 text-amber-700 border border-amber-200/60" },
        { name: "Emulsifier Soy Lecithin", label: "Allergen Alert", pillClass: "bg-rose-50 text-rose-600 border border-rose-200/60" },
      ],
    },
    snack: {
      category: "Snack",
      ocrTag: "OCR LOCK 99.4%",
      ocrTitle: "All-in-One Savoury Namkeen",
      ocrLines: [
        { pre: "Edible Veg Oil (Palmolein), ", highlight: "Chickpea Flour (17%)", post: "", type: "normal" },
        { pre: "Sugar (11%), Rice Flakes (9%), ", highlight: "", post: "", type: "normal" },
        { pre: "", highlight: "Acidity Reg. (INS 330)", post: ", ", type: "warning" },
        { pre: "", highlight: "Raising Agent (INS 500ii)", post: "", type: "warning" },
      ],
      name: "Crispy Namkeen Mix",
      brand: "Haldiram's Traditional",
      healthScore: 42,
      scoreColor: "#f59e0b", // amber-500
      scoreBadge: "Moderate Risk · High Sodium",
      scoreBadgeClass: "bg-amber-50 text-amber-700 border-amber-200/60",
      metric1: { label: "Total Fat per 100g", val: "34.2g", color: "text-amber-800", bg: "bg-[#fff9ee]" },
      metric2: { label: "Sodium per 100g", val: "673mg", color: "text-indigo-700", bg: "bg-[#f5f3ff]" },
      findings: [
        { name: "Refined Palmolein Oil", label: "High Saturated Fat", pillClass: "bg-rose-50 text-rose-600 border border-rose-200/60" },
        { name: "Acidity Reg. (INS 330)", label: "Synthetic Additive", pillClass: "bg-amber-50 text-amber-700 border border-amber-200/60" },
        { name: "Peanuts & Wheat Maida", label: "Allergen Alert", pillClass: "bg-rose-50 text-rose-600 border border-rose-200/60" },
      ],
    },
    drink: {
      category: "Drink",
      ocrTag: "OCR LOCK 99.9%",
      ocrTitle: "100% Coconut Fruit Water",
      ocrLines: [
        { pre: "Purified Water, ", highlight: "Coconut Water Conc. (9.6%)", post: "", type: "success" },
        { pre: "Natural Electrolytes, Potassium, ", highlight: "", post: "", type: "normal" },
        { pre: "", highlight: "Preservative (INS 202)", post: "", type: "warning" },
        { pre: "", highlight: "Zero Refined Sugar", post: "", type: "success" },
      ],
      name: "Raw Coconut Fruit Water",
      brand: "BioPure Organics",
      healthScore: 84,
      scoreColor: "#10b981", // emerald-500
      scoreBadge: "Low Risk · Clean Label",
      scoreBadgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
      metric1: { label: "Total Sugars", val: "5.1g", color: "text-emerald-800", bg: "bg-[#ecfdf5]" },
      metric2: { label: "Additives found", val: "1", color: "text-indigo-700", bg: "bg-[#f5f3ff]" },
      findings: [
        { name: "Coconut Water Concentrate", label: "Natural Hydration", pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
        { name: "Potassium Sorbate (INS 202)", label: "Class II Preservative", pillClass: "bg-amber-50 text-amber-700 border border-amber-200/60" },
        { name: "Zero Synthetic Dyes", label: "Clean Formula", pillClass: "bg-emerald-50 text-emerald-700 border border-emerald-200/60" },
      ],
    },
  };

  const currentData = realScans[activeTab];

  // Circle gauge calculations
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentData.healthScore / 100) * circumference;

  return (
    <div className="min-h-screen bg-surface font-manrope overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      {/* ── Ambient Background Lighting ────────────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-[-120px] left-[-80px] w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-[40%] right-[-100px] w-[30rem] h-[30rem] bg-secondary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-[-100px] left-[20%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* ── Main Container ─────────────────────────────────────────────────── */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 space-y-20 sm:space-y-28">

        {/* ── Section 1: Hero Section (Design-Matched Double Floating Cards) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center pt-2 sm:pt-4">

          {/* Left Column: Value Proposition & CTAs (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-7 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50/90 border border-indigo-200/60 text-[#3525cd] text-xs sm:text-sm font-bold tracking-tight shadow-xs">
              <span className="material-symbols-outlined text-[16px]">biotech</span>
              <span>Next-Gen Food Intelligence & Safety Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black text-slate-900 tracking-tight leading-[1.08]">
              Know Exactly What <br className="hidden sm:inline" />
              You Eat. <br />
              <span className="text-[#3525cd]">Before You Swallow</span> <br />
              <span className="text-[#3525cd]">It.</span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
              Don’t let confusing chemical names and deceptive packaging jeopardize your family’s health.
              NutriLens decodes obscure INS numbers, calculates hidden sugars, flags sneaky allergens,
              and evaluates ultra-processed foods against global dietary standards.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
              <button
                onClick={() => navigate("/scanner")}
                className="w-full sm:w-auto px-7 py-4 bg-[#3525cd] text-white rounded-2xl font-bold text-sm sm:text-base shadow-[0_10px_25px_rgba(53,37,205,0.28)] hover:bg-[#2b1cb5] hover:shadow-[0_14px_32px_rgba(53,37,205,0.38)] active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Scan Food Label Free</span>
              </button>

              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 rounded-2xl font-bold text-sm sm:text-base shadow-sm active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <span>Create Free Account</span>
                <span className="text-slate-600 font-bold">→</span>
              </button>
            </div>
          </div>

          {/* Right Column: Layered Interactive Floating Cards (6 cols on lg) */}
          <div className="lg:col-span-6 relative flex items-center justify-center lg:justify-end min-h-[460px] sm:min-h-[500px] w-full pt-4 pb-2">
            
            {/* Ambient card halo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-transparent rounded-3xl blur-3xl -z-10 pointer-events-none" />

            {/* ── BACK CARD: Raw Optical OCR View (Tilted + Camera Reticle) ── */}
            <div className="absolute left-1/2 -translate-x-[64%] sm:-translate-x-[58%] lg:left-0 lg:translate-x-0 top-0 sm:top-2 w-[270px] sm:w-[310px] bg-white rounded-3xl p-5 border border-slate-200/80 shadow-md transform -rotate-3 transition-transform duration-500 z-10 animate-float-slow select-none">
              {/* Camera Bracket Reticle Corners */}
              <div className="absolute top-3 left-3 w-3.5 h-3.5 border-t-2 border-l-2 border-indigo-400 rounded-tl-sm pointer-events-none" />
              <div className="absolute top-3 right-3 w-3.5 h-3.5 border-t-2 border-r-2 border-indigo-400 rounded-tr-sm pointer-events-none" />
              <div className="absolute bottom-3 left-3 w-3.5 h-3.5 border-b-2 border-l-2 border-indigo-400 rounded-bl-sm pointer-events-none" />

              {/* OCR Status & Detected Header */}
              <div className="space-y-1 pl-2 pt-1 pb-2">
                <span className="inline-block text-[10px] font-mono font-bold tracking-wider text-indigo-600 bg-indigo-50/80 border border-indigo-100 px-2 py-0.5 rounded-md">
                  {currentData.ocrTag}
                </span>
                <h4 className="font-bold text-slate-800 text-sm truncate">
                  {currentData.ocrTitle}
                </h4>
              </div>

              {/* Section: INGREDIENTS */}
              <div className="pt-2 pl-2 border-t border-slate-100">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Ingredients
                </span>
                <div className="text-xs text-slate-600 space-y-1.5 font-mono leading-relaxed">
                  {currentData.ocrLines.map((line, idx) => (
                    <p key={idx} className="truncate">
                      {line.pre}
                      {line.highlight && (
                        <span
                          className={`px-1.5 py-0.5 rounded font-semibold text-[11px] ${
                            line.type === "danger"
                              ? "bg-rose-100 text-rose-700"
                              : line.type === "warning"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {line.highlight}
                        </span>
                      )}
                      {line.post}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* ── FRONT CARD: Interactive Nutritional Dossier ── */}
            <div className="relative ml-auto mr-auto lg:mr-0 w-full max-w-[340px] sm:max-w-[370px] bg-white rounded-3xl p-5 sm:p-6 shadow-[0_20px_50px_rgba(53,37,205,0.12)] border border-slate-100 z-20 space-y-4 animate-float-reverse">
              {/* Category Selector Tabs */}
              <div className="bg-slate-100/90 p-1 rounded-2xl flex items-center justify-between">
                {["spread", "snack", "drink"].map((key) => {
                  const isActive = activeTab === key;
                  const labels = { spread: "Spread", snack: "Snack", drink: "Drink" };
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-all text-center ${
                        isActive
                          ? "bg-white text-indigo-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      {labels[key]}
                    </button>
                  );
                })}
              </div>

              {/* Health Score & Product Header */}
              <div className="flex items-center gap-3.5 pt-1">
                {/* Circular Gauge */}
                <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
                  <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke="#f1f5f9"
                      strokeWidth="5"
                      fill="none"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r={radius}
                      stroke={currentData.scoreColor}
                      strokeWidth="5"
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <span className="absolute font-black text-xl text-slate-900 tracking-tight">
                    {currentData.healthScore}
                  </span>
                </div>

                {/* Product Details */}
                <div className="space-y-0.5 min-w-0">
                  <h3 className="font-extrabold text-base text-slate-900 truncate leading-snug">
                    {currentData.name}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium truncate">
                    {currentData.brand}
                  </p>
                  <div className="pt-0.5">
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentData.scoreBadgeClass}`}
                    >
                      {currentData.scoreBadge}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2-Column Metrics */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div
                  className={`p-3 rounded-2xl ${currentData.metric1.bg} border border-black/5 space-y-0.5`}
                >
                  <span className="text-[11px] text-slate-500 block font-medium">
                    {currentData.metric1.label}
                  </span>
                  <span className={`text-lg font-black ${currentData.metric1.color} block tracking-tight`}>
                    {currentData.metric1.val}
                  </span>
                </div>

                <div
                  className={`p-3 rounded-2xl ${currentData.metric2.bg} border border-black/5 space-y-0.5`}
                >
                  <span className="text-[11px] text-slate-500 block font-medium">
                    {currentData.metric2.label}
                  </span>
                  <span className={`text-lg font-black ${currentData.metric2.color} block tracking-tight`}>
                    {currentData.metric2.val}
                  </span>
                </div>
              </div>

              {/* CRITICAL FINDINGS */}
              <div className="pt-1 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Critical Findings
                </span>
                <div className="space-y-1.5">
                  {currentData.findings.map((finding, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0"
                    >
                      <span className="font-semibold text-slate-700 truncate pr-2">
                        {finding.name}
                      </span>
                      <span
                        className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${finding.pillClass}`}
                      >
                        {finding.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </section>

        {/* ── Section 2: 3-Step Diagnostic Pipeline ────────────────────────── */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              Three Rapid Steps to Total Nutritional Transparency
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant">
              From back-of-pack photo to full chemical intelligence dossier in less than 3 seconds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 space-y-4 hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center font-black text-lg">
                1
              </div>
              <h3 className="font-bold text-xl text-on-surface">1. Optical Package OCR</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Snap or upload any ingredient table, nutrition facts panel, or barcode. Our high-precision vision scanner cleans reflections and corrects low-light distortions instantly.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-primary">
                <span className="material-symbols-outlined text-[16px]">crop_free</span>
                <span>Automatic Border & Crop Detection</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 space-y-4 hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-black text-lg">
                2
              </div>
              <h3 className="font-bold text-xl text-on-surface">2. Chemical Intelligence</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                The scanner translates cryptically numbered additives (INS 621, E407, INS 150d), calculates disguised high-glycemic sugars, and flags industrial emulsifiers.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-purple-700">
                <span className="material-symbols-outlined text-[16px]">biotech</span>
                <span>Decodes 3,500+ Regulated Compounds</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-outline-variant/30 space-y-4 hover:shadow-md transition-shadow relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-lg">
                3
              </div>
              <h3 className="font-bold text-xl text-on-surface">3. Personalized Verdict</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Your report adapts directly to your custom dietary goals (diabetic friendly, keto, nut-free, vegan) and generates a downloadable PDF or Word dossier.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-bold text-emerald-700">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span>Clinical Dossier & Vector Export</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 3: "Marketing Claims vs. Reality" ──────────────────────── */}
        <section className="bg-gradient-to-br from-surface-container-low via-white to-primary/5 rounded-3xl p-6 sm:p-10 border border-outline-variant/30 space-y-8">
          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-tertiary">
              Exposing Food Marketing Tricks
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              What the Front Label Promises vs. What NutriLens Uncovers
            </h2>
            <p className="text-sm text-on-surface-variant">
              Food companies use buzzwords to hide unhealthy ingredients. Here is how NutriLens levels the playing field:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Trick 1 */}
            <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>Front Label Marketing Claim</span>
              </div>
              <h4 className="text-lg font-bold text-on-surface">"Zero Added Refined Sugars*"</h4>
              <div className="p-3 bg-red-50 text-red-900 rounded-xl text-xs space-y-1">
                <p className="font-bold">NutriLens Reality Audit:</p>
                <p>
                  Replaced table sugar with 28g of <strong>Concentrated Apple Juice & Invert Date Syrup</strong>, resulting in an identical liver fructose load and glycemic spike.
                </p>
              </div>
            </div>

            {/* Trick 2 */}
            <div className="bg-white rounded-2xl p-6 border border-outline-variant/20 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">cancel</span>
                <span>Front Label Marketing Claim</span>
              </div>
              <h4 className="text-lg font-bold text-on-surface">"Made with Wholesome Golden Oats"</h4>
              <div className="p-3 bg-red-50 text-red-900 rounded-xl text-xs space-y-1">
                <p className="font-bold">NutriLens Reality Audit:</p>
                <p>
                  Oats make up only 14% of the volume. The top two ingredients by weight are <strong>Palm Stearin (Hydrogenated Fat)</strong> and <strong>Maltodextrin</strong>.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 4: Bento Grid of Deep Capabilities ───────────────────── */}
        <section className="space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full">
              Advanced Capabilities
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-on-surface tracking-tight">
              Built for Modern Nutritional Vigilance
            </h2>
            <p className="text-sm sm:text-base text-on-surface-variant">
              Every tool you need to take control of what goes into your body.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Bento Card 1: INS & E-number Decoder (spans 2 cols on lg) */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">spellcheck</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">INS & E-Number Decoding</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Stop guessing what INS 211, INS 476, or E102 mean. NutriLens automatically translates these codes into their clinical definitions, function in food, and documented health risks.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-bold text-on-surface">
                  Preservatives (INS 200-299)
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-bold text-on-surface">
                  Antioxidants (INS 300-399)
                </span>
                <span className="px-3 py-1 rounded-full bg-surface-container-high text-xs font-bold text-on-surface">
                  Emulsifiers (INS 400-499)
                </span>
              </div>
            </div>

            {/* Bento Card 2: Allergen Early Radar */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">crisis_alert</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Allergen Radar</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Instantly identifies traces and direct ingredients for 14 major allergens: peanuts, tree nuts, gluten, milk, soy, and shellfish.
              </p>
              <div className="text-xs font-bold text-red-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">security</span>
                <span>Cross-Contamination Warnings</span>
              </div>
            </div>

            {/* Bento Card 3: Direct Server Exports */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">description</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">PDF & Word Export</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Generate clean, vector-rendered clinical reports in PDF or editable Word (.docx) format to share directly with your nutritionist.
              </p>
              <div className="text-xs font-bold text-blue-600 flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Zero Browser Print Hacks</span>
              </div>
            </div>

            {/* Bento Card 4: Hidden Sugar Math */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-outline-variant/30 shadow-sm space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px]">calculate</span>
              </div>
              <h3 className="text-xl font-bold text-on-surface">Hidden Sugar Math</h3>
              <p className="text-sm text-on-surface-variant leading-relaxed">
                Aggregates 60+ aliases of sugar (dextrose, maltodextrin, high-fructose corn syrup, barley malt) to calculate the real daily glycemic impact.
              </p>
            </div>

            {/* Bento Card 5: Ask Nutrii AI Assistant (spans 3 cols on lg) */}
            <div className="lg:col-span-3 bg-gradient-to-r from-primary to-indigo-700 rounded-3xl p-6 sm:p-8 text-white space-y-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Ask Nutrii AI Nutritionist</h3>
                  <p className="text-xs text-white/80">Interactive 24/7 conversational companion</p>
                </div>
              </div>
              <p className="text-sm text-white/90 leading-relaxed max-w-3xl">
                Have follow-up questions about a product? Ask Nutrii directly: “Is this safe for gestational diabetes?”, “Can I eat this on a strict keto diet?”, or “Suggest a healthier snack alternative available at grocery stores.”
              </p>
            </div>
          </div>
        </section>

        {/* ── Section 5: Trust & Standards Banner ────────────────────────────── */}
        <section className="bg-white rounded-3xl p-8 border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4">
            <img src={logo} alt="NutriLens Logo" className="w-14 h-14 rounded-2xl p-1 bg-primary/10 object-contain shrink-0" />
            <div className="space-y-1">
              <h3 className="font-bold text-base text-on-surface">
                Committed to Rigorous Food Safety Standards
              </h3>
              <p className="text-xs text-on-surface-variant max-w-xl">
                Our rule engine integrates recommendations from the World Health Organization (WHO), Food and Drug Administration (FDA), and Food Safety and Standards Authority of India (FSSAI).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              ✓ 100% Independent
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
              ✓ No Brand Sponsorships
            </span>
          </div>
        </section>

        {/* ── Section 6: Bottom Call To Action ──────────────────────────────── */}
        <section className="relative overflow-hidden rounded-3xl bg-primary p-8 sm:p-12 text-white text-center shadow-2xl space-y-6">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Start Making Confident Food Choices Today
            </h2>
            <p className="text-sm sm:text-base text-white/80 leading-relaxed">
              Every free account comes with instant access to the food label scanner and personalized analysis. No credit card required.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-8 py-4 bg-white text-primary font-bold text-base rounded-2xl shadow-lg hover:bg-slate-50 active:scale-95 transition-all"
              >
                Create Free Account
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-base rounded-2xl active:scale-95 transition-all"
              >
                Sign In to Existing Account
              </button>
            </div>
          </div>
        </section>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="border-t border-outline-variant/30 pt-8 pb-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-on-surface-variant">
          <div className="flex items-center gap-2">
            <span className="font-bold text-primary text-sm">NutriLens</span>
            <span>© {new Date().getFullYear()} NutriLens Food Intelligence. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <button onClick={() => navigate("/about")} className="hover:text-primary transition-colors">
              About & Team
            </button>
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
          </div>
        </footer>

      </main>
    </div>
  );
}
