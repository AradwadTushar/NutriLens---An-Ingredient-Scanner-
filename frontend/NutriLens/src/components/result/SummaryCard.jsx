const SummaryCard = ({ summary }) => {
  if (!summary) return null;

  const { safe, warning, avoid } = summary;

  return (
    <div className="bg-white rounded-xl shadow-md p-5 space-y-3 border">

      {safe && (
        <div className="flex items-start gap-2">
          <span className="text-green-600">✔</span>
          <p className="text-sm text-gray-700">{safe}</p>
        </div>
      )}

      {warning && (
        <div className="flex items-start gap-2">
          <span className="text-yellow-500">⚠</span>
          <p className="text-sm text-gray-700">{warning}</p>
        </div>
      )}

      {avoid && (
        <div className="flex items-start gap-2">
          <span className="text-red-600">❌</span>
          <p className="text-sm text-gray-700">{avoid}</p>
        </div>
      )}

    </div>
  );
};

export default SummaryCard;