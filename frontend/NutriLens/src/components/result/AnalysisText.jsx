const AnalysisText = ({ analysis }) => {
  if (!analysis) return null;

  return (
    <div
      className="text-gray-800 leading-relaxed space-y-2"
      dangerouslySetInnerHTML={{
        __html: analysis
          .replace(/\*\*(.*?)\*\*/g, "<b class='text-indigo-700'>$1</b>")
          .replace(/\n/g, "<br/>")
      }}
    />
  );
};

export default AnalysisText;