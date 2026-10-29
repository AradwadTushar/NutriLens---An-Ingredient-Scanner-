import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();

  let history = [];
  try {
    history = JSON.parse(localStorage.getItem("nutrilens_history") || localStorage.getItem("history") || "[]");
  } catch {
    history = [];
  }

  return (
    <div className="min-h-screen bg-surface font-manrope py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20">
        <button
          onClick={() => navigate("/landing")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-[18px] text-primary">arrow_back</span>
          <span>Dashboard</span>
        </button>

        <div className="text-center">
          <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface">
            Audit Timeline
          </h1>
          <p className="text-xs text-on-surface-variant">
            {history.length} historical {history.length === 1 ? "scan" : "scans"}
          </p>
        </div>

        <div className="w-16" />
      </div>

      {/* Empty State */}
      {history.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-outline-variant/30 shadow-xs space-y-3 max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[24px]">history</span>
          </div>
          <h3 className="font-bold text-base text-on-surface">No Scans Recorded</h3>
          <p className="text-xs text-on-surface-variant">
            Your recent scans will be tracked here so you can review ingredient evaluations over time.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate("/scanner")}
              className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all"
            >
              Start First Scan
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map((item, i) => {
            const data = item.data || item;
            const verdict = item.verdict || data?.verdict || "Audited";
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
                  <span className="text-xs font-bold text-on-surface">Scan #{history.length - i}</span>
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

                <p className="text-xs text-on-surface-variant line-clamp-2">
                  {data?.summary?.safe ||
                    data?.summary?.warning ||
                    data?.summary?.avoid ||
                    "Tap to review complete chemical analysis and nutrition facts."}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-outline-variant/15 text-[11px] text-on-surface-variant">
                  <span>{dateStr}</span>
                  <span className="text-primary font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Inspect</span>
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
