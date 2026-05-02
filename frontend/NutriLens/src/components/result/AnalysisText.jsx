import DOMPurify from "dompurify";

const AnalysisText = ({ analysis }) => {
  if (!analysis) {
  return (
    <p className="text-body-md text-on-surface-variant">
      No analysis available.
    </p>
  );
}

  const formatted = analysis
    .replace(/\*\*(.*?)\*\*/g, "<b class='text-primary font-semibold'>$1</b>")
    .replace(/\n/g, "<br/>");

  const safeHTML = DOMPurify.sanitize(formatted);

  return (
    <div
      className="text-body-md text-on-surface-variant leading-relaxed space-y-2"
      dangerouslySetInnerHTML={{ __html: safeHTML }}
    />
  );
};

export default AnalysisText;