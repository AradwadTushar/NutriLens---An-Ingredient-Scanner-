import { useNavigate } from "react-router-dom";

export default function Favorites() {
  const navigate = useNavigate();

  // ✅ Safe parsing
  let favs = [];
  try {
    favs = JSON.parse(localStorage.getItem("favorites")) || [];
  } catch {
    favs = [];
  }

  return (
    <div className="min-h-screen bg-background font-manrope px-container-margin py-lg max-w-2xl mx-auto">

      {/* 🔝 Header */}
      <div className="flex items-center justify-between mb-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-xs text-primary text-label-md hover:opacity-80"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </button>

        <h1 className="text-headline-md text-on-surface">
          Favorites
        </h1>

        <div className="w-10" /> {/* spacer */}
      </div>

      {/* 📭 Empty State */}
      {favs.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 space-y-md">
          <span className="material-symbols-outlined text-5xl text-on-surface-variant">
            favorite_border
          </span>
          <p className="text-body-md text-on-surface-variant">
            No favorites yet.
          </p>
        </div>
      ) : (
        <div className="space-y-md">

          {favs.map((item, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest p-md rounded-xl shadow-sm border border-outline-variant/20 hover:shadow-md transition cursor-pointer active:scale-[0.98]"
              onClick={() => {
                if (!item?.data) return;

                navigate("/result", {
                  state: { extractedData: item.data }
                });
              }}
            >
              {/* 🕒 Date */}
              <p className="text-label-sm text-on-surface-variant mb-xs">
                {new Date(item.date).toLocaleString()}
              </p>

              {/* 🧠 Summary */}
              <p className="text-body-md text-on-surface">
                {item.data?.summary?.safe ||
                 item.data?.summary?.warning ||
                 item.data?.summary?.avoid ||
                 "View Result"}
              </p>

              {/* ➡️ CTA */}
              <div className="flex justify-end mt-sm">
                <span className="text-primary text-label-sm flex items-center gap-xs">
                  View
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </span>
              </div>
            </div>
          ))}

        </div>
      )}
    </div>
  );
}