const RecommendationCard = () => {
  return (
    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5 mt-6">
      <h2 className="text-lg font-semibold text-purple-700 mb-3">
        💡 Recommendation
      </h2>

      <div className="bg-white rounded-lg p-3 shadow-sm">
        <p className="font-medium text-gray-800">Healthier Choice</p>
        <p className="text-sm text-gray-600 mt-1">
          Try fresh fruits or minimally processed snacks instead of high sugar products.
        </p>
      </div>

      <button className="mt-4 w-full bg-indigo-600 text-white py-2 rounded-lg">
        Save to Favorites
      </button>
    </div>
  );
};

export default RecommendationCard;