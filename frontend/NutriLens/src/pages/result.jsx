import logostamp from '../assets/Nurilens Logo Colored.png';

import HealthScore from "../components/result/HealthScore";
import SummaryCard from "../components/result/SummaryCard";
import IngredientCard from "../components/result/IngredientCard";
import NutritionCard from "../components/result/NutritionCard";
import RecommendationCard from "../components/result/RecommendationCard";

import { useLocation } from "react-router-dom";

export default function Result() {
  const location = useLocation();
  const extractedData = location.state?.extractedData;

  console.log("RESULT DATA:", extractedData); // 🔥 debug

  if (!extractedData) return <p>No analysis data found.</p>;
  // ✅ Use backend data directly
  const ingredients = extractedData.ingredients || [];
  const nutrition = extractedData.nutrition || {};
  const summary = extractedData.summary || {};

  return (
    
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex justify-center items-center p-4 relative">

      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-2xl p-8 space-y-6 relative">

        <h1 className="text-3xl font-extrabold text-indigo-600 text-center mb-4">
          NutriLens Analysis
        </h1>

        {/* Health Score */}
        <HealthScore verdict={extractedData.verdict} />

        {/* Summary */}
        <SummaryCard summary={extractedData.summary} />

        {/* Ingredients */}
        <h2 className="text-xl font-bold mt-6 mb-3">
          Analyzed Ingredients
        </h2>

        {ingredients.length > 0 ? (
          <div className="space-y-3">
            {ingredients.map((item, i) => (
              <IngredientCard key={i} {...item} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">
            No ingredients found in this product.
          </p>
        )}

        {/* Nutrition */}
        <NutritionCard nutrition={nutrition} />

        {/* Recommendation */}
        <RecommendationCard />

        {/* Download Button */}
        <div className="flex justify-start mt-6">
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            📄 Download/Print Report
          </button>
        </div>

        {/* Stamp */}
        <img
          src={logostamp}
          alt="NutriLens"
          className="absolute bottom-4 right-4 w-[130px] h-[130px] opacity-80 hover:opacity-100 transition rotate-3"
        />
      </div>

      {/* Back Button */}
      <button
        onClick={() => window.location.href = "/scanner"}
        className="fixed bottom-6 right-6 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full shadow-lg transition"
      >
        🔄 Back to Scanner
      </button>
    </div>
  );
}