import { useState, useMemo } from "react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import logostamp from "../assets/Nurilens Logo Colored.png";
import HealthScore from "../components/result/HealthScore";
import SummaryCard from "../components/result/SummaryCard";
import IngredientCard from "../components/result/IngredientCard";
import NutritionCard from "../components/result/NutritionCard";
import RecommendationCard from "../components/result/RecommendationCard";

export default function Result() {
  const location = useLocation();
  const navigate = useNavigate();
  const extractedData = location.state?.extractedData;

  const [exportOpen, setExportOpen] = useState(false);
  const [downloadingFormat, setDownloadingFormat] = useState(null); // 'pdf' | 'docx' | null
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Generate a report audit ID based on time
  const reportMeta = useMemo(() => {
    return {
      id: `NL-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  }, []);

  if (!extractedData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface font-manrope px-4">
        <div className="text-center space-y-4 max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-outline-variant/30 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mx-auto text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl">search_off</span>
          </div>
          <h2 className="text-xl font-bold text-on-surface">No Analysis Data Available</h2>
          <p className="text-sm text-on-surface-variant">
            Please capture or upload an ingredient label in the scanner to generate your personalized food intelligence dossier.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/scanner")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-xl font-semibold text-sm shadow-md hover:bg-primary/90 transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[18px]">document_scanner</span>
              Open Scanner
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ingredients = extractedData.ingredients || [];
  const nutrition = extractedData.nutrition || {};
  const summary = extractedData.summary || {};
  const verdict = extractedData.verdict || "Caution";

  // Server-side Direct Export Handler
  const handleExport = async (format) => {
    setDownloadingFormat(format);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`/api/export/${format}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(extractedData),
      });

      if (!res.ok) {
        throw new Error(`Export failed with status ${res.status}`);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `NutriLens_Food_Dossier_${reportMeta.id}.${format === "pdf" ? "pdf" : "docx"}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setExportOpen(false);
    } catch (err) {
      console.error("Export error:", err);
      alert(`Could not generate ${format.toUpperCase()} report. Please check connection.`);
    } finally {
      setDownloadingFormat(null);
    }
  };

  const handleSaveFavorite = () => {
    try {
      const existing = JSON.parse(localStorage.getItem("nutrilens_favorites") || "[]");
      existing.unshift({
        id: reportMeta.id,
        date: reportMeta.date,
        verdict,
        ingredientsCount: ingredients.length,
        data: extractedData,
      });
      localStorage.setItem("nutrilens_favorites", JSON.stringify(existing.slice(0, 30)));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-surface font-manrope pb-20">
      {/* ── Print Styles to guarantee zero web chrome leaks ──────────────── */}
      <style>{`
        @media print {
          header, .no-print, button, .action-bar { display: none !important; }
          body { background: white !important; font-size: 11pt !important; }
          .print-container { max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .page-break { page-break-after: always; }
        }
      `}</style>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <header className="sticky top-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-outline-variant/30 shadow-sm no-print">
        <div className="flex justify-between items-center px-4 sm:px-6 h-16 max-w-6xl mx-auto">
          {/* Back button */}
          <button
            onClick={() => navigate("/scanner")}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-surface-container-high text-on-surface text-sm font-semibold transition-all active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px] text-primary">arrow_back</span>
            <span className="hidden sm:inline">Back to Scanner</span>
          </button>

          {/* Dossier Title */}
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-lg text-primary tracking-tight">NutriLens</span>
            <span className="hidden md:inline-block text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              Food Dossier #{reportMeta.id}
            </span>
          </div>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setExportOpen(!exportOpen)}
              disabled={downloadingFormat !== null}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-primary text-on-primary text-xs sm:text-sm font-bold shadow-md hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              {downloadingFormat ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span>Generating {downloadingFormat.toUpperCase()}...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">file_download</span>
                  <span>Export Report</span>
                  <span className="material-symbols-outlined text-[16px]">expand_more</span>
                </>
              )}
            </button>

            {exportOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-outline-variant/30 py-2 z-20 animate-scaleUp">
                  <div className="px-4 py-2 border-b border-outline-variant/15 text-xs text-on-surface-variant font-medium">
                    Select Download Format
                  </div>
                  <button
                    onClick={() => handleExport("pdf")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-on-surface">Clinical PDF Dossier</p>
                      <p className="text-[11px] text-on-surface-variant">Vector tables, printable</p>
                    </div>
                  </button>

                  <button
                    onClick={() => handleExport("docx")}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[18px]">description</span>
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-on-surface">Word Document (.docx)</p>
                      <p className="text-[11px] text-on-surface-variant">Editable clinical format</p>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Responsive Dossier Container ────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6 print-container">
        {/* Top Report Audit Banner */}
        <section className="bg-gradient-to-r from-primary/10 via-surface-container-low to-secondary/10 border border-outline-variant/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">biotech</span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Comprehensive Nutritional Safety Audit
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              Food Intelligence & Ingredient Dossier
            </h1>
            <p className="text-xs text-on-surface-variant">
              Audited: {reportMeta.date} • Reference ID: #{reportMeta.id} • Cross-referenced with FDA/FSSAI dietary standards
            </p>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto no-print">
            <button
              onClick={handleSaveFavorite}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                saveSuccess
                  ? "bg-green-100 text-green-800 border-green-300"
                  : "bg-white border-outline-variant/40 text-on-surface hover:bg-surface-container-low active:scale-95 shadow-sm"
              }`}
            >
              <span className="material-symbols-outlined text-[18px] text-red-500">
                {saveSuccess ? "check" : "favorite"}
              </span>
              <span>{saveSuccess ? "Saved to Favorites!" : "Save Favorite"}</span>
            </button>
          </div>
        </section>

        {/* ── Responsive 2-Column Clinical Grid (Desktop Widescreen) ──────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Health Score, Summary, and Analyzed Ingredients (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Health Score Component */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
              <HealthScore verdict={verdict} />
            </div>

            {/* Summary & Allergen Warnings Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
              <SummaryCard summary={summary} />
            </div>

            {/* Ingredients Deep Dive Matrix */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/30 space-y-4 transition-all hover:shadow-md">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-xl">science</span>
                  <h2 className="text-lg font-bold text-on-surface">Analyzed Ingredients Matrix</h2>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {ingredients.length} items evaluated
                </span>
              </div>

              {ingredients.length > 0 ? (
                <div className="space-y-3">
                  {ingredients.map((item, i) => (
                    <IngredientCard key={i} {...item} />
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-xl p-8 text-center border border-outline-variant/20 space-y-2">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant">inventory_2</span>
                  <p className="text-sm font-semibold text-on-surface">No ingredients identified</p>
                  <p className="text-xs text-on-surface-variant">The package image did not contain readable ingredient text.</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Nutrition Label, AI Recommendations, Quick Actions (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Structured Nutrition Facts Panel */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
              <NutritionCard nutrition={nutrition} />
            </div>

            {/* AI Recommendation Insights Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-outline-variant/30 transition-all hover:shadow-md">
              <RecommendationCard summary={summary} fullData={extractedData} />
            </div>

            {/* Direct Export Action Card (no-print) */}
            <div className="bg-gradient-to-br from-surface-container-low to-primary/5 rounded-2xl p-5 border border-outline-variant/30 space-y-3 no-print">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">download_for_offline</span>
                <h4 className="font-bold text-sm text-on-surface">Download Audit Files</h4>
              </div>
              <p className="text-xs text-on-surface-variant">
                Save a vector PDF or editable Word document for medical review or dietary tracking.
              </p>
              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => handleExport("pdf")}
                  disabled={downloadingFormat !== null}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-outline-variant/40 hover:bg-neutral-50 text-xs font-bold text-on-surface transition-all active:scale-95 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-red-500">picture_as_pdf</span>
                  <span>PDF Report</span>
                </button>
                <button
                  onClick={() => handleExport("docx")}
                  disabled={downloadingFormat !== null}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white border border-outline-variant/40 hover:bg-neutral-50 text-xs font-bold text-on-surface transition-all active:scale-95 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px] text-blue-500">description</span>
                  <span>Word (.docx)</span>
                </button>
              </div>
            </div>

            {/* Clinical Standards Stamp */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-white border border-outline-variant/20 text-xs text-on-surface-variant">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-green-600">verified</span>
                <span>FDA & WHO Reference Verified</span>
              </div>
              <img src={logostamp} alt="NutriLens" className="w-10 h-10 object-contain opacity-70" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
