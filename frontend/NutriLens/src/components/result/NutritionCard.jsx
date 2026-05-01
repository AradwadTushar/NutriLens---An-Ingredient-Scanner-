const NutritionCard = ({ nutrition }) => {
  if (!nutrition) return null;

  const data = [
    { label: "Calories", value: nutrition.calories },
    { label: "Protein", value: nutrition.protein },
    { label: "Carbs", value: nutrition.carbs },
    { label: "Sugar", value: nutrition.sugar },
    { label: "Fat", value: nutrition.fat },
  ];

  return (
    <div className="bg-white rounded-xl shadow p-5 mt-6">
      <h2 className="font-bold text-lg mb-3">Nutritional Info</h2>

      <div className="grid grid-cols-2 gap-3">
        {data
          .filter(item => item.value)
          .map((item, i) => (
            <div key={i} className="bg-gray-100 rounded-lg p-3 text-center">
              <p className="text-sm text-gray-500">{item.label}</p>
              <p className="font-semibold">{item.value}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default NutritionCard;