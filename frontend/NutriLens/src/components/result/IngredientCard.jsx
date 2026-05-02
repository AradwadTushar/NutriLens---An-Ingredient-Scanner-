import { useState } from "react";
import Badge from "../ui/Badge";

const borderMap = {
  Good: "border-green-500",
  Moderate: "border-amber-400",
  Risky: "border-red-500",
};

const IngredientCard = ({ name, status, description }) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`bg-surface-container-lowest rounded-2xl p-md shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-l-4 transition-all hover:shadow-md ${
        borderMap[status] || "border-outline-variant"
      }`}
    >
      <div
        className="flex justify-between items-start cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <div className="space-y-1">
          <h3 className="text-headline-sm text-on-surface">{name}</h3>
          <Badge label={status} />
        </div>

        {/* ✅ FIXED BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
          className="p-2 text-on-surface-variant"
        >
          <span className="material-symbols-outlined">
            {open ? "expand_less" : "expand_more"}
          </span>
        </button>
      </div>

      {open && description && (
        <div className="mt-md pt-md border-t border-surface-container text-body-md text-on-surface-variant">
          {description}
        </div>
      )}
    </div>
  );
};

export default IngredientCard;