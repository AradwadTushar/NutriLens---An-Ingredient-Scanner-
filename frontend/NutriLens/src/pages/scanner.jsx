import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Cropper from "react-easy-crop";

export default function Scanner({ setExtractedData, setShowResult }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrStatus, setOcrStatus] = useState('');
  const [preferences, setPreferences] = useState({
    diet: '', allergies: [], healthGoal: '', warnings: [], region: '', sustainability: ''
  });
  const [extractedData, setLocalExtractedData] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [aspect, setAspect] = useState(4 / 3);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera Error:", err);
        setCameraError(true);
      }
    };
    startCamera();
  }, []);

  const previewImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    // NO crop for upload
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setLoading(true);
    setOcrStatus('');
    const token = localStorage.getItem('token');
    try {
      const res = await fetch("/api/upload", { method: "POST", headers: { "Authorization": `Bearer ${token}` }, body: formData });
      if (res.status === 401) { alert("Session expired."); navigate('/login'); return; }
      const data = await res.json();
      setLocalExtractedData(data);
      setOcrStatus("Data scanned! Click Analyze.");
    } catch (err) {
      setOcrStatus("Failed to scan.");
    } finally {
      setLoading(false);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      setImagePreview(URL.createObjectURL(blob));
      setShowCrop(true); // crop only for capture
    }, 'image/jpeg');
  };

  const getCroppedImg = async (imageSrc, cropPixels) => {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((resolve) => { image.onload = resolve; });
    const canvas = document.createElement("canvas");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    canvas.getContext("2d").drawImage(image, cropPixels.x, cropPixels.y, cropPixels.width, cropPixels.height, 0, 0, cropPixels.width, cropPixels.height);
    return new Promise((resolve) => { canvas.toBlob((blob) => resolve(blob), "image/jpeg"); });
  };

  const handleCropConfirm = async () => {
    const blob = await getCroppedImg(imagePreview, croppedAreaPixels);
    const formData = new FormData();
    formData.append("image", blob, "cropped.jpg");
    setShowCrop(false);
    setLoading(true);
    setOcrStatus('');
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
      if (res.status === 401) { alert("Session expired."); navigate('/login'); return; }
      const data = await res.json();
      setLocalExtractedData(data);
      setOcrStatus("Cropped & scanned! Click Analyze.");
    } catch (err) {
      setOcrStatus("Failed after crop.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = async () => {
    if (!extractedData) return alert("Upload or capture something first!");
    const payload = { ingredients: extractedData.ingredients, preferences, merged_text_lines: extractedData.merged_text_lines, cleaned_text: extractedData.cleaned_text };
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (res.status === 401) { alert("Session expired."); navigate('/login'); return; }
      const result = await res.json();
      const analysis = result;
      navigate("/result", {
        state: {
          extractedData: {
            ingredients: analysis.ingredients || [],
            nutrition: analysis.nutrition || {},
            summary: analysis.summary || {},
            verdict: analysis.verdict || "Caution"
          }
        }
      });
    } catch (err) {
      console.error("Analyze Error:", err);
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showCrop && imagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
          <h2 className="text-white text-lg font-semibold mb-2 text-center">Crop to focus on the ingredients label</h2>
          <div className="flex gap-2 mb-3 flex-wrap justify-center">
            {[{ label: "Square", value: 1 }, { label: "4:3", value: 4/3 }, { label: "16:9", value: 16/9 }, { label: "9:16", value: 9/16 }, { label: "Free", value: null }].map((item) => (
              <button key={item.label} onClick={() => setAspect(item.value)}
                className={`px-3 py-1 rounded-full text-sm ${aspect === item.value ? "bg-green-500 text-white" : "bg-gray-700 text-white"}`}>
                {item.label}
              </button>
            ))}
          </div>
          <div className="relative w-full max-w-sm h-80 bg-black rounded-xl overflow-hidden shadow-lg">
            <Cropper image={imagePreview} crop={crop} zoom={zoom} aspect={aspect || undefined} showGrid={true}
              onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)} />
          </div>
          <div className="w-full max-w-sm mt-4">
            <label className="text-white text-sm mb-1 block">Zoom</label>
            <input type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full accent-green-500" />
          </div>
          <div className="mt-5 flex gap-4">
            <button onClick={() => { setShowCrop(false); setImagePreview(null); }} className="px-5 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition">Cancel</button>
            <button onClick={handleCropConfirm} className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition shadow-md">Crop & Scan</button>
          </div>
        </div>
      )}

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 p-6">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-6xl w-full space-y-8">
          <h1 className="text-4xl font-bold text-center text-gray-800 font-poppins mb-6 tracking-wide">
            Nutri<span className="text-indigo-500">Lens</span> Scanner
          </h1>

          <div className="flex flex-col md:flex-row justify-between space-y-6 md:space-y-0 md:space-x-8">
            {/* Upload Card — NO crop */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-center text-gray-700">Upload an Image</h2>
              <form onSubmit={handleUpload} className="space-y-3">
                <label className="border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer block hover:bg-gray-50 transition">
                  <input type="file" name="image" accept="image/*" className="hidden" onChange={previewImage} required />
                  <p className="text-gray-500 text-center">Drag & drop or <span className="text-indigo-500 underline">Browse</span></p>
                </label>
                <button type="submit" className="w-full bg-indigo-500 text-white py-2 rounded-full hover:bg-indigo-600 transition">📤 Scan This Image</button>
              </form>
              {imagePreview && !showCrop && (
                <div className="mt-3 text-center">
                  <img src={imagePreview} alt="Preview" className="mx-auto max-h-40 rounded-lg shadow-md border" />
                </div>
              )}
            </div>

            {/* Live Capture Card — WITH crop */}
            <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100">
              <h2 className="text-lg font-semibold text-center text-gray-700">Live Capture</h2>
              {!cameraError ? (
                <video ref={videoRef} width="100%" height="240" autoPlay muted playsInline className="border rounded-lg mx-auto shadow" />
              ) : (
                <p className="text-red-500 text-center text-sm">📵 Camera not available. Please upload an image instead.</p>
              )}
              {!cameraError && (
                <button onClick={captureImage} className="w-full bg-indigo-500 text-white py-2 rounded-full hover:bg-indigo-600 transition">📸 Capture & Crop</button>
              )}
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100">
            <h2 className="text-lg font-bold mb-4 text-gray-700 font-poppins">Your Preferences</h2>
            <div>
              <label className="font-semibold text-gray-600">Diet Type:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {["Vegetarian","Vegan","Keto","Low Carb","High Protein","Gluten-Free"].map((diet) => (
                  <button key={diet} type="button"
                    className={`border px-3 py-1 rounded-full text-sm ${preferences.diet === diet ? "bg-indigo-500 text-white" : "text-gray-600"} hover:bg-indigo-100 transition`}
                    onClick={() => setPreferences({ ...preferences, diet })}>{diet}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-semibold text-gray-600">Allergies:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {["Dairy-Free","Nut-Free","Soy-Free","Shellfish-Free","Egg-Free"].map((allergy) => (
                  <button key={allergy} type="button"
                    className={`border px-3 py-1 rounded-full text-sm ${preferences.allergies?.includes(allergy) ? "bg-red-500 text-white" : "text-gray-600"} hover:bg-red-100 transition`}
                    onClick={() => {
                      const updated = preferences.allergies?.includes(allergy) ? preferences.allergies.filter((a) => a !== allergy) : [...(preferences.allergies || []), allergy];
                      setPreferences({ ...preferences, allergies: updated });
                    }}>{allergy}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-semibold text-gray-600">Health Goals:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {["Weight Loss","Muscle Gain","Maintain Weight","Diabetic Friendly","Heart Healthy"].map((goal) => (
                  <button key={goal} type="button"
                    className={`border px-3 py-1 rounded-full text-sm ${preferences.healthGoal === goal ? "bg-green-500 text-white" : "text-gray-600"} hover:bg-green-100 transition`}
                    onClick={() => setPreferences({ ...preferences, healthGoal: goal })}>{goal}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-semibold text-gray-600">Ingredient Warnings:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {["Artificial Sweeteners","Preservatives","High Sugar","High Salt","Processed Meat"].map((warn) => (
                  <button key={warn} type="button"
                    className={`border px-3 py-1 rounded-full text-sm ${preferences.warnings?.includes(warn) ? "bg-yellow-500 text-white" : "text-gray-600"} hover:bg-yellow-100 transition`}
                    onClick={() => {
                      const updated = preferences.warnings?.includes(warn) ? preferences.warnings.filter((w) => w !== warn) : [...(preferences.warnings || []), warn];
                      setPreferences({ ...preferences, warnings: updated });
                    }}>{warn}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-gray-600">Region Specific:</label>
                <select className="border rounded-lg p-2 w-full mt-2" value={preferences.region} onChange={(e) => setPreferences({ ...preferences, region: e.target.value })}>
                  <option value="">None</option>
                  <option value="FSSAI">FSSAI Approved</option>
                  <option value="Halal">Halal</option>
                  <option value="Kosher">Kosher</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-gray-600">Sustainability:</label>
                <select className="border rounded-lg p-2 w-full mt-2" value={preferences.sustainability} onChange={(e) => setPreferences({ ...preferences, sustainability: e.target.value })}>
                  <option value="">None</option>
                  <option value="Eco-Friendly">Eco-Friendly Products</option>
                  <option value="Palm Oil">Flag Palm Oil Usage</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button onClick={analyzeData} disabled={loading}
              className="bg-green-500 text-white px-10 py-3 rounded-full shadow-xl hover:bg-green-600 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              Submit to Analyze
            </button>
          </div>

          {loading && (
            <div className="text-center space-y-2">
              <div className="inline-block w-6 h-6 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-blue-600">Scanning... Please wait.</p>
            </div>
          )}
          {ocrStatus && <p className="text-center text-sm">{ocrStatus}</p>}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
      </div>
    </>
  );
}