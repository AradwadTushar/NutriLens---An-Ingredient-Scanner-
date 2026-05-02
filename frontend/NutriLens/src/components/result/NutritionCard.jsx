const NutritionCard = ({ nutrition }) => {
  if (!nutrition) return null;

  const items = [
    ["Calories", nutrition.calories],
    ["Protein", nutrition.protein],
    ["Carbs", nutrition.carbs],
    ["Sugar", nutrition.sugar],
    ["Fat", nutrition.fat],
  ];

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <h3 className="font-semibold mb-3">Nutritional Info</h3>

      <div className="grid grid-cols-2 gap-2">
        {items.map(([label, value], i) => (
          <div key={i} className="bg-white rounded-lg p-2 text-center shadow-sm">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-medium">{value || "N/A"}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NutritionCard;