import { useEffect, useState } from "react";

const HealthScore = ({ verdict }) => {
  if (!verdict) return null;

  let baseScore = 8.0;
  let label = "Safe";
  let color = "text-green-500";
  let bg = "bg-green-100 text-green-800";
  let strokeColor = "#22c55e";
  let icon = "check_circle";

  if (verdict === "Not recommended") {
    baseScore = 3.0;
    label = "Risky";
    color = "text-red-500";
    bg = "bg-red-100 text-red-800";
    strokeColor = "#ef4444";
    icon = "cancel";
  } else if (verdict === "Caution") {
    baseScore = 5.5;
    label = "Moderate";
    color = "text-amber-500";
    bg = "bg-amber-100 text-amber-800";
    strokeColor = "#f59e0b";
    icon = "warning";
  }

  // ✅ Animation state
  const [score, setScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setScore(baseScore);
    }, 100);

    return () => clearTimeout(timer);
  }, [baseScore]);

  const circumference = 465;
  const offset = circumference - (score / 10) * circumference;

  return (
    <section className="flex flex-col items-center py-xl bg-surface-container-lowest rounded-3xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">

      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="74" fill="transparent" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="80"
            cy="80"
            r="74"
            fill="transparent"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>

        <div className="text-center z-10">
          <span className={`text-display-lg block ${color}`}>
            {score.toFixed(1)}
            <span className="text-headline-sm text-on-surface-variant">/10</span>
          </span>

          <span className="text-label-sm text-on-surface-variant uppercase tracking-widest">
            Health Score
          </span>
        </div>
      </div>

      <div className="mt-lg w-full px-lg">
        <div className={`${bg} py-3 rounded-xl flex items-center justify-center gap-2`}>
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {icon}
          </span>

          <span className="text-headline-sm">
            {label}
          </span>
        </div>
      </div>

    </section>
  );
};

export default HealthScore;