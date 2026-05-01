import { useState } from "react";

const statusColors = {
  Good: "border-green-500 text-green-600",
  Moderate: "border-yellow-500 text-yellow-600",
  Risky: "border-red-500 text-red-600",
};

const IngredientCard = ({ name, status, description }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`border-l-4 bg-white rounded-xl shadow p-4 transition ${
        statusColors[status]
      }`}
    >
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <span className="text-sm">{status}</span>
        </div>
        <span>{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <p className="mt-3 text-sm text-gray-700">{description}</p>
      )}
    </div>
  );
};

export default IngredientCard;