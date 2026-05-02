import { useNavigate } from "react-router-dom";

export default function History() {
  const navigate = useNavigate();
  const history = JSON.parse(localStorage.getItem("history") || "[]");

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">

      <div className="flex items-center justify-between">
        <button onClick={() => navigate("/landing")} className="text-sm bg-gray-200 px-3 py-1 rounded-lg">
          ⬅ Back
        </button>
        <h1 className="text-xl font-bold">History</h1>
        <div />
      </div>

      {history.length === 0 ? (
        <p className="text-gray-500 text-sm text-center">No scans yet.</p>
      ) : (
        history.map((item, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow cursor-pointer"
            onClick={() =>
              navigate("/result", {
                state: { extractedData: item.data }
              })
            }
          >
            <p className="text-sm text-gray-500 mb-1">
              {new Date(item.date).toLocaleString()}
            </p>

            <p className="font-medium">
              {item.data?.verdict || "View Result"}
            </p>
          </div>
        ))
      )}
    </div>
  );
}