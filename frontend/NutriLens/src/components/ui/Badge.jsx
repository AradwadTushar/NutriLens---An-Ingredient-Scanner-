const statusMap = {
  Good: "bg-green-50 text-green-700 border-green-200",
  Moderate: "bg-amber-50 text-amber-700 border-amber-200",
  Risky: "bg-red-50 text-red-700 border-red-200",
  Safe: "bg-green-50 text-green-700 border-green-200",
  Caution: "bg-amber-50 text-amber-700 border-amber-200",
  "Not recommended": "bg-red-50 text-red-700 border-red-200",
};

const Badge = ({ label = "Unknown", className = "" }) => {
  const styles =
    statusMap[label] ||
    "bg-surface-container text-on-surface-variant border-outline-variant";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full border text-label-sm font-medium ${styles} ${className}`}
    >
      {label}
    </span>
  );
};

export default Badge;