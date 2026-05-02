const RecommendationCard = ({ summary, fullData }) => {
  if (!summary) return null;

  const saveFavorite = () => {
    let favs = [];
    try {
      favs = JSON.parse(localStorage.getItem("favorites")) || [];
    } catch {
      favs = [];
    }

    favs.unshift({
      data: fullData,
      date: new Date().toISOString()
    });

    localStorage.setItem("favorites", JSON.stringify(favs.slice(0, 10)));

    alert("Saved ❤️");
  };

  const text =
    summary.safe ||
    summary.warning ||
    summary.avoid ||
    "No recommendation available.";

  return (
    <section className="bg-indigo-50/50 rounded-3xl p-lg border border-indigo-100 mt-lg">

      {/* Header */}
      <div className="flex items-center gap-sm mb-md">
        <div className="bg-primary-container p-2 rounded-xl">
          <span
            className="material-symbols-outlined text-on-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lightbulb
          </span>
        </div>
        <h2 className="text-headline-md text-on-surface">
          Recommendation
        </h2>
      </div>

      {/* Content */}
      <div className="bg-surface-container-lowest p-md rounded-2xl flex items-start gap-lg shadow-sm border border-indigo-100/50">
        <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
          <span
            className="material-symbols-outlined text-green-600 text-3xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            eco
          </span>
        </div>

        <div className="flex-1">
          <p className="text-label-md text-on-surface mb-1">
            Health Insight
          </p>

          <p className="text-body-md text-on-surface-variant">
            {text}
          </p>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={saveFavorite}
        className="mt-md w-full bg-primary text-on-primary py-3 rounded-xl text-label-md shadow-[0_8px_24px_rgba(53,37,205,0.25)] active:scale-[0.98] transition-all"
      >
        Save to Favorites
      </button>

    </section>
  );
};

export default RecommendationCard;