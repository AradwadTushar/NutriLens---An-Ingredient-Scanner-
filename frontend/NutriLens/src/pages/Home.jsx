import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Nurilens Logo Colored.png";

export default function Home() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("spread"); // "spread" | "cereal" | "drink"

  // Simulated demo products for the interactive scanner showcase
  const demoProducts = {
    spread: {
      name: "Hazelnut Cocoa Spread",
      brand: "SweetDelight Co.",
      healthScore: 38,
      verdict: "High Risk (Ultra-Processed)",
      verdictColor: "text-red-700 bg-red-100 border-red-200",
      sugar: "56.8g",
      sugarWarning: "Over 70% above WHO daily sugar limit",
      flagged: [
        { name: "Palm Oil (INS 471)", risk: "High Saturated Fat" },
        { name: "Synthetic Vanillin", risk: "Artificial Flavoring" },
        { name: "Emulsifier Soy Lecithin", risk: "Allergen Alert" },
      ],
      hiddenSugar: "Refined Sucrose & Invert Sugar Syrup",
    },
    cereal: {
      name: "Honey Crunch Energy Clusters",
      brand: "VitalGrain Foods",
      healthScore: 54,
      verdict: "Moderate Caution",
      verdictColor: "text-amber-700 bg-amber-100 border-amber-200",
      sugar: "28.4g",
      sugarWarning: "Marketed as health food, high glycemic impact",
      flagged: [
        { name: "Maltodextrin", risk: "High Glycemic Spike (GI: 110)" },
        { name: "Caramel Color (INS 150d)", risk: "Processed Ammonia Sulfite" },
        { name: "Gluten / Wheat Flakes", risk: "Gluten Warning" },
      ],
      hiddenSugar: "Malt Extract, High Fructose Syrup",
    },
    drink: {
      name: "Electrolyte Recovery Citrus",
      brand: "HydraPlus Lab",
      healthScore: 88,
      verdict: "Safe & Wholesome",
      verdictColor: "text-emerald-700 bg-emerald-100 border-emerald-200",
      sugar: "3.2g",
      sugarWarning: "Low sugar, naturally derived electrolyte salts",
      flagged: [
        { name: "Steviol Glycosides (INS 960)", risk: "Natural Low-Cal Sweetener" },
        { name: "Citric Acid (INS 330)", risk: "Safe Acidity Regulator" },
      ],
      hiddenSugar: "No synthetic or hidden sugars detected",
    },
  };

  const currentDemo = demoProducts[activeTab];

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

        {/* ── Section 1: Hero Split ────────────────────────────────────────── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center pt-2 sm:pt-6">

          {/* Left Column: Value Proposition & CTAs (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-bold tracking-wide shadow-xs">
              <span className="material-symbols-outlined text-[18px]">biotech</span>
              <span>Next-Gen Food Intelligence & Safety Engine</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-on-surface tracking-tight leading-[1.12]">
              Know Exactly What You Eat.{" "}
              <span className="bg-gradient-to-r from-primary via-indigo-600 to-secondary bg-clip-text text-transparent">
                Before You Swallow It.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-on-surface-variant max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Don’t let confusing chemical names and deceptive packaging jeopardize your family’s health.
              NutriLens decodes obscure INS numbers, calculates hidden sugars, flags sneaky allergens,
              and evaluates ultra-processed foods against global dietary standards.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
              <button
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto px-7 py-4 bg-primary text-white rounded-2xl font-bold text-base shadow-[0_8px_24px_rgba(53,37,205,0.25)] hover:bg-primary/90 hover:shadow-[0_12px_32px_rgba(53,37,205,0.35)] active:scale-95 transition-all flex items-center justify-center gap-2 group"
              >
                <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">
                  document_scanner
                </span>
                <span>Scan Food Label Free</span>
              </button>

              <button
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto px-7 py-4 bg-white hover:bg-surface-container-low border border-outline-variant/40 text-on-surface rounded-2xl font-bold text-base shadow-xs active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Create Free Account</span>
                <span className="material-symbols-outlined text-[18px] text-primary">arrow_forward</span>
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="pt-4 border-t border-outline-variant/30 grid grid-cols-3 gap-3 sm:gap-6 text-center lg:text-left">
              <div>
                <p className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">12,000+</p>
                <p className="text-xs text-on-surface-variant font-medium">Labels Audited</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">99.4%</p>
                <p className="text-xs text-on-surface-variant font-medium">OCR Recognition</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-black text-on-surface tracking-tight">FDA & FSSAI</p>
                <p className="text-xs text-on-surface-variant font-medium">Cross-Referenced</p>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Simulated Scanner Card (5 cols) */}
          <div className="lg:col-span-5 relative">
            {/* Ambient card halo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-indigo-500/10 to-transparent rounded-3xl blur-2xl -z-10" />

            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-outline-variant/30 space-y-5">
              {/* Card Header & Product Selector Tabs */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black">
                    <span className="material-symbols-outlined text-[18px]">science</span>
                  </div>
                  <div>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      Live Simulation
                    </h2>
                    <p className="text-sm font-extrabold text-on-surface">Interactive Label Audit</p>
                  </div>
                </div>
                <div className="flex gap-1 bg-surface-container-high p-1 rounded-xl">
                  {Object.keys(demoProducts).map((key) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        activeTab === key
                          ? "bg-white text-primary shadow-xs"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      {key.charAt(0).toUpperCase() + key.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Simulated Label Scanner Viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-950 text-white p-4 space-y-3 border border-slate-800 shadow-inner">
                {/* Laser scan line overlay */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px] animate-scan pointer-events-none" />

                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest">
                      [OCR LOCK: 99.8%]
                    </p>
                    <h3 className="font-bold text-base text-white tracking-tight">{currentDemo.name}</h3>
                    <p className="text-xs text-slate-400">{currentDemo.brand}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full border ${currentDemo.verdictColor}`}
                  >
                    Score: {currentDemo.healthScore}/100
                  </span>
                </div>

                {/* Simulated Nutrition Snippet */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-xs font-mono">
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Sugar per 100g:</span>
                    <span className="text-amber-400 font-bold">{currentDemo.sugar}</span>
                  </div>
                  <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Safety Verdict:</span>
                    <span className="font-bold text-white truncate block">{currentDemo.verdict}</span>
                  </div>
                </div>

                {/* Flagged Additives */}
                <div className="space-y-1.5 pt-1">
                  <p className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">
                    Critical Findings:
                  </p>
                  {currentDemo.flagged.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs"
                    >
                      <span className="text-slate-200 font-medium">{item.name}</span>
                      <span className="text-[11px] text-red-400 font-bold">{item.risk}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Banner */}
              <div className="p-3 bg-primary/5 rounded-xl border border-primary/15 flex items-center justify-between">
                <div className="text-xs text-on-surface-variant">
                  <span className="font-bold text-primary">Hidden Additive Alert:</span>{" "}
                  {currentDemo.hiddenSugar}
                </div>
                <button
                  onClick={() => navigate("/login")}
                  className="px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all shrink-0 ml-2"
                >
                  Analyze Real Label
                </button>
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
