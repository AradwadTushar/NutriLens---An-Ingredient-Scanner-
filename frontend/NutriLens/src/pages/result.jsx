import logostamp from '../assets/Nurilens Logo Colored.png';

export default function Result({ extractedData }) {
  if (!extractedData) return <p>No analysis data found.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white flex justify-center items-center p-4 relative">
      
      {/* Make this container relative */}
      <div className="max-w-3xl w-full bg-white shadow-2xl rounded-2xl p-8 space-y-6 relative">
        
        <h1 className="text-3xl font-extrabold text-indigo-600 text-center mb-4">
          NutriLens Analysis
        </h1>

        <div
          className="text-gray-800 leading-relaxed space-y-2"
          dangerouslySetInnerHTML={{
            __html: extractedData.analysis
              .replace(/\*\*(.*?)\*\*/g, "<b class='text-indigo-700'>$1</b>")
              .replace(/\n/g, "<br/>")
          }}
        />

        {/* Verdict Color Example */}
        {extractedData.analysis.includes("✅ Healthy") && (
          <p className="text-green-600 font-bold text-xl text-center mt-4">
            ✅ This Product is Healthy!
          </p>
        )}
        {extractedData.analysis.includes("⚠️ Caution") && (
          <p className="text-yellow-500 font-bold text-xl text-center mt-4">
            ⚠️ Consume with Caution
          </p>
        )}
        {extractedData.analysis.includes("❌ Not recommended") && (
          <p className="text-red-600 font-bold text-xl text-center mt-4">
            ❌ Not Recommended
          </p>
        )}

        {/* Download Button Left */}
        <div className="flex justify-start mt-6">
          <button
            onClick={() => window.print()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-md transition"
          >
            📄 Download/Print Report
          </button>
        </div>

        {/* Stamp Logo INSIDE the card, bottom right */}
<img
  src={logostamp}
  alt="NutriLens"
  className="absolute bottom-4 right-4 w-[130px] h-[130px] opacity-80 hover:opacity-100 transition rotate-3"
/>


      </div>

      {/* Back to Scanner Button Floating Bottom Right */}
      <button
        onClick={() => window.location.href = "/scanner"}
        className="fixed bottom-6 right-6 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-full shadow-lg transition"
      >
        🔄 Back to Scanner
      </button>
    </div>
  );
}
