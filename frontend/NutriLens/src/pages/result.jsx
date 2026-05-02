import { useLocation, useNavigate } from "react-router-dom";
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

  if (!extractedData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-md p-xl">
          <span className="material-symbols-outlined text-6xl text-on-surface-variant">search_off</span>
          <p className="font-headline-sm text-on-surface-variant">No analysis data found.</p>
          <button
            onClick={() => navigate("/scanner")}
            className="mt-md inline-flex items-center gap-sm bg-primary text-on-primary px-lg py-3 rounded-xl font-label-md shadow-[0_8px_24px_rgba(53,37,205,0.25)] active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Scanner
          </button>
        </div>
      </div>
    );

  const ingredients = extractedData.ingredients || [];
  const nutrition = extractedData.nutrition || {};
  const summary = extractedData.summary || {};

  return (
    <div className="min-h-screen bg-background font-manrope">
      {/* Top App Bar */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center px-container-margin h-16 max-w-2xl mx-auto">
          <button
            onClick={() => navigate("/scanner")}
            className="flex items-center gap-sm p-2 -ml-2 rounded-full hover:bg-surface-container-high transition-colors active:opacity-70"
          >
            <span className="material-symbols-outlined text-primary">arrow_back</span>
            <span className="font-label-md text-primary hidden sm:inline">Back</span>
          </button>
          <h1 className="font-manrope font-semibold text-lg tracking-tight text-primary">NutriLens</h1>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-xs p-2 rounded-full hover:bg-surface-container-high transition-colors active:opacity-70"
            title="Download/Print Report"
          >
            <span className="material-symbols-outlined text-on-surface-variant">download</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20 pb-24 px-container-margin max-w-2xl mx-auto space-y-lg">

        {/* Health Score */}
        <HealthScore verdict={extractedData.verdict} />

        {/* Summary */}
        <SummaryCard summary={summary} />

        {/* Ingredients */}
        <section className="space-y-md">
          <h2 className="font-headline-md text-headline-md text-on-surface px-1">Analyzed Ingredients</h2>
          {ingredients.length > 0 ? (
            ingredients.map((item, i) => <IngredientCard key={i} {...item} />)
          ) : (
            <div className="bg-surface-container-lowest rounded-2xl p-lg text-center border border-outline-variant/20">
              <span className="material-symbols-outlined text-3xl text-on-surface-variant">inventory_2</span>
              <p className="font-body-md text-on-surface-variant mt-sm">No ingredients found in this product.</p>
            </div>
          )}
        </section>

        {/* Nutrition */}
        <NutritionCard nutrition={nutrition} />

        {/* Recommendation */}
        <RecommendationCard summary={summary} fullData={extractedData} />

        {/* Branding stamp */}
        <div className="flex justify-end pt-sm opacity-60 hover:opacity-100 transition-opacity">
          <img src={logostamp} alt="NutriLens" className="w-20 h-20 rotate-3 drop-shadow" />
        </div>
      </main>
    </div>
  );
}
