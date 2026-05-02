const SummaryCard = ({ summary }) => {
  if (!summary) return null;

  const { safe, warning, avoid } = summary;
  const hasContent = safe || warning || avoid;

  if (!hasContent) {
    return (
      <div className="bg-surface-container-lowest rounded-2xl p-lg border border-outline-variant/20 text-center text-body-md text-on-surface-variant">
        No summary available.
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] space-y-sm border border-outline-variant/20">

      <h2 className="text-headline-sm text-on-surface mb-md">
        Summary
      </h2>

      {safe && (
        <div className="flex items-start gap-md p-sm rounded-xl bg-green-50 border border-green-100">
          <span
            className="material-symbols-outlined text-green-600 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <p className="text-body-md text-on-surface">
            {safe}
          </p>
        </div>
      )}

      {warning && (
        <div className="flex items-start gap-md p-sm rounded-xl bg-amber-50 border border-amber-100">
          <span
            className="material-symbols-outlined text-amber-500 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
          <p className="text-body-md text-on-surface">
            {warning}
          </p>
        </div>
      )}

      {avoid && (
        <div className="flex items-start gap-md p-sm rounded-xl bg-red-50 border border-red-100">
          <span
            className="material-symbols-outlined text-red-600 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            cancel
          </span>
          <p className="text-body-md text-on-surface">
            {avoid}
          </p>
        </div>
      )}

    </div>
  );
};

export default SummaryCard;