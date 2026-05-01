const HealthScore = ({ verdict }) => {
  if (!verdict) return null;

  let score = 8;
  let status = "Safe";
  let color = "text-green-500";
  let bg = "bg-green-100 text-green-700";
  let border = "border-green-500";

  if (verdict === "Not recommended") {
    score = 3;
    status = "Risky";
    color = "text-red-500";
    bg = "bg-red-100 text-red-700";
    border = "border-red-500";
  } else if (verdict === "Caution") {
    score = 5.5;
    status = "Moderate";
    color = "text-yellow-500";
    bg = "bg-yellow-100 text-yellow-700";
    border = "border-yellow-500";
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 text-center mb-6">

      {/* Circle */}
      <div className={`w-40 h-40 mx-auto rounded-full border-[10px] ${border} flex items-center justify-center`}>
        <div>
          <p className={`text-3xl font-bold ${color}`}>
            {score}/10
          </p>
          <p className="text-gray-500 text-sm">Health Score</p>
        </div>
      </div>

      {/* Status */}
      <div className={`mt-4 py-2 rounded-lg font-medium ${bg}`}>
        {status}
      </div>

    </div>
  );
};

export default HealthScore;