import { useState } from "react";

const RecommendationCard = ({ summary, fullData }) => {
  const [saved, setSaved] = useState(false);

  if (!summary) return null;

  const saveFavorite = () => {
    let favs = [];
    try {
      favs = JSON.parse(localStorage.getItem("nutrilens_favorites") || "[]");
    } catch {
      favs = [];
    }

    favs.unshift({
      id: `NL-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      verdict: fullData?.verdict || "Audited",
      ingredientsCount: fullData?.ingredients?.length || 0,
      data: fullData,
    });

    localStorage.setItem("nutrilens_favorites", JSON.stringify(favs.slice(0, 30)));
    // Also sync to legacy key for backwards compatibility
    try {
      localStorage.setItem("favorites", JSON.stringify(favs.slice(0, 30)));
    } catch (e) {
      console.warn(e);
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const text =
    summary.safe ||
    summary.warning ||
    summary.avoid ||
    "Nutritional balance verified against global dietary benchmarks.";

  return (
    <section className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-outline-variant/20">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[18px]">lightbulb</span>
        </div>
        <h2 className="text-base font-bold text-on-surface">
          Clinical Dietary Recommendation
        </h2>
      </div>

      {/* Content */}
      <div className="bg-surface-container-low/60 p-4 rounded-2xl flex items-start gap-3.5 border border-outline-variant/20">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">eco</span>
        </div>

        <div className="flex-1 space-y-1">
          <p className="text-xs font-bold text-on-surface">
            Nutritional Health Insight
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            {text}
          </p>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={saveFavorite}
        className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-2 ${
          saved
            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
            : "bg-primary text-white hover:bg-primary/90 shadow-md"
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {saved ? "check_circle" : "favorite"}
        </span>
        <span>{saved ? "Saved to Favorites!" : "Save to Favorites"}</span>
      </button>
    </section>
  );
};

export default RecommendationCard;
