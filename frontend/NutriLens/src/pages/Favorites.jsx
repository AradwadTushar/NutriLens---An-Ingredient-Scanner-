import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const navigate = useNavigate();

  // Support both key formats
  let favs = [];
  try {
    const list1 = JSON.parse(localStorage.getItem("nutrilens_favorites") || "[]");
    const list2 = JSON.parse(localStorage.getItem("favorites") || "[]");
    favs = [...list1, ...list2];
  } catch {
    favs = [];
  }

  return (
    <div className="min-h-screen bg-surface font-manrope py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">arrow_back</span>
          <span>Back</span>
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface">
            Saved Food Dossiers
          </h1>
          <p className="text-xs text-on-surface-variant">
            {favs.length} saved {favs.length === 1 ? "report" : "reports"}
          </p>
        </div>

        <div className="w-16" />
      </div>

      {/* Empty State */}
      {favs.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-outline-variant/30 shadow-xs space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">favorite_border</span>
          </div>
          <h3 className="font-bold text-base text-on-surface">No Saved Dossiers</h3>
          <p className="text-xs text-on-surface-variant">
            When you analyze a food label, click "Save Favorite" to bookmark its clinical dossier here.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/scanner")}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
            >
              Go to Scanner
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favs.map((item, i) => {
            const data = item.data || item;
            const verdict = item.verdict || data?.verdict || "Audited";
            const id = item.id || `NL-${i + 1}`;
            const dateStr = item.date || "Past scan";

            return (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl shadow-xs border border-outline-variant/30 hover:shadow-md hover:border-primary/40 transition-all cursor-pointer space-y-3 group"
                onClick={() => {
                  if (!data) return;
                  navigate("/result", {
                    state: { extractedData: data },
                  });
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary">Dossier #{id}</span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      verdict === "Safe"
                        ? "bg-emerald-100 text-emerald-800"
                        : verdict === "Caution"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {verdict}
                  </span>
                </div>

                <p className="text-xs text-on-surface line-clamp-2 leading-relaxed">
                  {data?.summary?.safe ||
                    data?.summary?.warning ||
                    data?.summary?.avoid ||
                    "Click to view full nutritional breakdown and ingredient evaluation."}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-[11px] text-on-surface-variant">
                  <span>{dateStr}</span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Dossier</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
