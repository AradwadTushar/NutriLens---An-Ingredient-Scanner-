import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";

export default function Scanner({ setExtractedData, setShowResult }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrStatus, setOcrStatus] = useState("");
  const [preferences, setPreferences] = useState({
    diet: "", allergies: [], healthGoal: "", warnings: [], region: "", sustainability: "",
  });
  const [extractedData, setLocalExtractedData] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [aspect, setAspect] = useState(4 / 3);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "camera"
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (activeTab !== "camera") return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraError(false);
      } catch (err) {
        console.error("Camera Error:", err);
        setCameraError(true);
      }
    };
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, [activeTab]);

  const previewImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setLocalExtractedData(null);
    setOcrStatus("");
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    setLoading(true);
    setOcrStatus("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.status === 401) { alert("Session expired."); navigate("/login"); return; }
      const data = await res.json();
      setLocalExtractedData(data);
      setOcrStatus("success");
    } catch (err) {
      setOcrStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      setImagePreview(URL.createObjectURL(blob));
      setShowCrop(true);
    }, "image/jpeg");
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
    setOcrStatus("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      if (res.status === 401) { alert("Session expired."); navigate("/login"); return; }
      const data = await res.json();
      setLocalExtractedData(data);
      setOcrStatus("success");
    } catch (err) {
      setOcrStatus("error");
    } finally {
      setLoading(false);
    }
  };

  const analyzeData = async () => {
    if (!extractedData) return alert("Upload or capture something first!");
    const payload = {
      ingredients: extractedData.ingredients,
      preferences,
      merged_text_lines: extractedData.merged_text_lines,
      cleaned_text: extractedData.cleaned_text,
    };
    setAnalyzing(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { alert("Session expired."); navigate("/login"); return; }
      const result = await res.json();
      navigate("/result", {
        state: {
          extractedData: {
            ingredients: result.ingredients || [],
            nutrition: result.nutrition || {},
            summary: result.summary || {},
            verdict: result.verdict || "Caution",
          },
        },
      });
    } catch (err) {
      console.error("Analyze Error:", err);
      alert("Analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  const toggleAllergy = (allergy) => {
    const updated = preferences.allergies?.includes(allergy)
      ? preferences.allergies.filter((a) => a !== allergy)
      : [...(preferences.allergies || []), allergy];
    setPreferences({ ...preferences, allergies: updated });
  };

  const toggleWarning = (warn) => {
    const updated = preferences.warnings?.includes(warn)
      ? preferences.warnings.filter((w) => w !== warn)
      : [...(preferences.warnings || []), warn];
    setPreferences({ ...preferences, warnings: updated });
  };

  // ── Crop Modal ────────────────────────────────────────────────────────────
  if (showCrop && imagePreview) {
    return (
      <div className="fixed inset-0 bg-black text-white font-manrope overflow-hidden flex flex-col">
        {/* Header */}
        <header className="flex justify-between items-center px-5 h-16 shrink-0">
          <button
            onClick={() => { setShowCrop(false); setImagePreview(null); }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className="font-headline-sm text-headline-sm">Edit Scan</h1>
          <div className="w-10" />
        </header>

        {/* Crop area */}
        <div className="relative flex-1 bg-black">
          <Cropper
            image={imagePreview}
            crop={crop}
            zoom={zoom}
            aspect={aspect || undefined}
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          />
        </div>

        {/* Tooling */}
        <div className="bg-black/90 backdrop-blur-md px-container-margin py-md space-y-md shrink-0">
          {/* Zoom */}
          <div className="space-y-xs">
            <label className="font-label-sm text-label-sm text-white/70 uppercase tracking-wider">Zoom</label>
            <input
              type="range" min={1} max={3} step={0.1} value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          {/* Aspect ratios */}
          <div className="flex gap-sm flex-wrap">
            {[{ label: "1:1", value: 1 }, { label: "4:3", value: 4 / 3 }, { label: "16:9", value: 16 / 9 }, { label: "9:16", value: 9 / 16 }, { label: "Free", value: null }].map((item) => (
              <button
                key={item.label}
                onClick={() => setAspect(item.value)}
                className={`px-md py-1.5 rounded-full font-label-sm transition-all active:scale-95 ${aspect === item.value ? "bg-primary text-on-primary" : "bg-white/10 text-white/70 hover:bg-white/20"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <button
            onClick={handleCropConfirm}
            className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-sm shadow-[0_8px_24px_rgba(53,37,205,0.35)] active:scale-[0.98] transition-all flex items-center justify-center gap-sm"
          >
            <span className="material-symbols-outlined">crop</span>
            Crop & Scan
          </button>
        </div>
      </div>
    );
  }

  // ── Analyzing Loading Screen ───────────────────────────────────────────────
  if (analyzing) {
    return (
      <div className="min-h-screen bg-background font-manrope flex flex-col items-center justify-center px-container-margin text-center space-y-lg">
        <div className="relative flex items-center justify-center w-64 h-64">
          <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-pulse-ring" />
          <div className="absolute inset-4 rounded-full border-2 border-primary/20 animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
          <div className="relative z-10 w-40 h-40 bg-surface-container-lowest rounded-3xl shadow-xl flex items-center justify-center overflow-hidden border border-primary/10">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 to-white opacity-50" />
            <div
              className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent blur-[1px] animate-scan"
            />
            <div className="flex flex-col items-center gap-2 z-10">
              <span className="material-symbols-outlined text-5xl text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
              <div className="flex gap-1">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${delay}s` }} />
                ))}
              </div>
            </div>
          </div>
          {/* Floating indicators */}
          <div className="absolute top-0 right-4 p-3 bg-white shadow-lg rounded-2xl border border-outline-variant/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm">search</span>
            <span className="font-label-sm text-on-surface-variant">Scanning Macros</span>
          </div>
          <div className="absolute bottom-4 left-0 p-3 bg-white shadow-lg rounded-2xl border border-outline-variant/20 flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-sm">warning</span>
            <span className="font-label-sm text-on-surface-variant">Checking Additives</span>
          </div>
        </div>

        <div className="space-y-sm max-w-xs">
          <h2 className="font-headline-md text-headline-md text-on-surface">Analyzing ingredients...</h2>
          <p className="font-body-md text-on-surface-variant">Our AI is identifying potential health risks and additives.</p>
        </div>

        <div className="w-full max-w-xs bg-surface-container-low p-md rounded-xl flex items-start gap-md text-left border border-white/50">
          <div className="bg-white p-2 rounded-lg shadow-sm shrink-0">
            <span className="material-symbols-outlined text-primary">verified_user</span>
          </div>
          <div>
            <h4 className="font-label-md text-on-surface">Privacy First</h4>
            <p className="text-label-sm text-on-surface-variant">Your photo is processed securely and never shared.</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Scanner Page ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background font-manrope pb-32">


      <main className="pt-4 px-container-margin max-w-2xl mx-auto space-y-lg">

        {/* Page title */}
        <section className="space-y-xs pt-sm">
          <h2 className="font-headline-md text-headline-md text-on-surface">Scan Label</h2>
          <p className="font-body-md text-on-surface-variant">Upload or capture a nutrition label to analyze it instantly.</p>
        </section>

        {/* Tab switcher */}
        <div className="flex bg-surface-container-high rounded-xl p-xs gap-xs">
          {["upload", "camera"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 flex items-center justify-center gap-xs py-2 rounded-lg font-label-md transition-all ${activeTab === tab ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab === "upload" ? "upload_file" : "camera_alt"}</span>
              {tab === "upload" ? "Upload" : "Camera"}
            </button>
          ))}
        </div>

        {/* Upload panel */}
        {activeTab === "upload" && (
          <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 space-y-md">
            <form onSubmit={handleUpload} className="space-y-md">
              <label className="border-2 border-dashed border-outline-variant rounded-xl p-lg cursor-pointer flex flex-col items-center gap-sm hover:bg-surface-container-low transition-colors">
                <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
                <span className="font-label-md text-on-surface">Drop image here or <span className="text-primary underline">browse</span></span>
                <span className="font-label-sm text-on-surface-variant">JPEG, PNG, WEBP supported</span>
                <input type="file" name="image" accept="image/*" className="hidden" onChange={previewImage} required />
              </label>

              {imagePreview && (
                <div className="rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm">
                  <img src={imagePreview} alt="Preview" className="w-full max-h-48 object-contain bg-surface-container-low" />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-on-primary rounded-xl font-label-md shadow-[0_8px_24px_rgba(53,37,205,0.2)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin" />
                    Scanning...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                    Scan This Image
                  </>
                )}
              </button>
            </form>

            {/* Status feedback */}
            {ocrStatus === "success" && (
              <div className="flex items-center gap-sm p-sm rounded-xl bg-green-50 border border-green-200">
                <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-label-md text-green-700">Label scanned! Set preferences below, then analyze.</span>
              </div>
            )}
            {ocrStatus === "error" && (
              <div className="flex items-center gap-sm p-sm rounded-xl bg-red-50 border border-red-200">
                <span className="material-symbols-outlined text-red-600" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
                <span className="font-label-md text-red-700">Scan failed. Please try again.</span>
              </div>
            )}
          </div>
        )}

        {/* Camera panel */}
        {activeTab === "camera" && (
          <div className="bg-surface-container-lowest rounded-2xl p-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-outline-variant/20 space-y-md">
            {!cameraError ? (
              <>
                <div className="rounded-xl overflow-hidden border border-outline-variant/20 shadow-sm bg-black">
                  <video ref={videoRef} width="100%" height="240" autoPlay muted playsInline className="w-full max-h-60 object-cover" />
                </div>
                <button
                  onClick={captureImage}
                  className="w-full h-12 bg-primary text-on-primary rounded-xl font-label-md shadow-[0_8px_24px_rgba(53,37,205,0.2)] active:scale-[0.98] transition-all flex items-center justify-center gap-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                  Capture & Crop
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center py-lg gap-md text-center">
                <span className="material-symbols-outlined text-5xl text-on-surface-variant">no_photography</span>
                <p className="font-label-md text-on-surface-variant">Camera not available. Please use the Upload tab instead.</p>
              </div>
            )}
            {ocrStatus === "success" && (
              <div className="flex items-center gap-sm p-sm rounded-xl bg-green-50 border border-green-200">
                <span className="material-symbols-outlined text-green-600" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                <span className="font-label-md text-green-700">Label scanned! Set preferences below, then analyze.</span>
              </div>
            )}
          </div>
        )}

        {/* ── Preferences ──────────────────────────────────────────────────── */}
        <section className="space-y-lg">
          <div className="space-y-xs">
            <h2 className="font-headline-md text-headline-md text-on-surface">Preferences</h2>
            <p className="font-body-md text-on-surface-variant">Personalize your nutritional experience for better AI recommendations.</p>
          </div>

          {/* Dietary Patterns — Bento Cards */}
          <div className="space-y-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>restaurant</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Dietary Patterns</h3>
            </div>
            <div className="grid grid-cols-2 gap-sm">
              {[
                { label: "Vegetarian", icon: "eco" },
                { label: "Vegan", icon: "spa" },
                { label: "Keto", icon: "bolt" },
                { label: "Low Carb", icon: "grain" },
                { label: "High Protein", icon: "fitness_center" },
                { label: "Gluten-Free", icon: "do_not_disturb" },
              ].map(({ label, icon }) => {
                const active = preferences.diet === label;
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setPreferences({ ...preferences, diet: active ? "" : label })}
                    className={`bg-surface-container-lowest p-md rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-2 flex flex-col gap-sm transition-all active:scale-[0.98] cursor-pointer
                      ${active ? "border-primary" : "border-transparent hover:border-outline-variant"}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className={`material-symbols-outlined ${active ? "text-primary" : "text-on-surface-variant"}`}>{icon}</span>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${active ? "bg-primary" : "border-2 border-outline-variant"}`}>
                        {active && <span className="material-symbols-outlined text-white text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
                      </div>
                    </div>
                    <span className="font-label-md text-label-md text-on-surface text-left">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Allergies — Chip style */}
          <div className="space-y-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Allergies</h3>
            </div>
            <div className="flex flex-wrap gap-sm">
              {["Dairy-Free", "Nut-Free", "Soy-Free", "Shellfish-Free", "Egg-Free", "Gluten-Free"].map((allergy) => {
                const active = preferences.allergies?.includes(allergy);
                return (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`flex items-center gap-xs px-md py-2 rounded-full font-label-md transition-all active:scale-95
                      ${active ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"}`}
                  >
                    <span>{allergy}</span>
                    <span className="material-symbols-outlined text-[16px]">{active ? "close" : "add"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Health Goals — Toggle List */}
          <div className="space-y-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>ads_click</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Health Goals</h3>
            </div>
            <div className="space-y-sm">
              {[
                { label: "Weight Loss", icon: "monitor_weight", color: "text-green-700", bg: "bg-green-100", sub: "Calorie deficit approach" },
                { label: "Muscle Gain", icon: "fitness_center", color: "text-indigo-700", bg: "bg-indigo-100", sub: "Focus on protein intake" },
                { label: "Diabetic Friendly", icon: "water_drop", color: "text-blue-700", bg: "bg-blue-100", sub: "Limit daily sugar < 25g" },
                { label: "Heart Healthy", icon: "favorite", color: "text-red-700", bg: "bg-red-100", sub: "Low sodium & trans fats" },
                { label: "Maintain Weight", icon: "balance", color: "text-amber-700", bg: "bg-amber-100", sub: "Balanced macro approach" },
              ].map(({ label, icon, color, bg, sub }) => {
                const active = preferences.healthGoal === label;
                return (
                  <label
                    key={label}
                    className="flex items-center justify-between p-md bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] cursor-pointer active:scale-[0.98] transition-all"
                  >
                    <div className="flex items-center gap-md">
                      <div className={`p-2 ${bg} rounded-lg`}>
                        <span className={`material-symbols-outlined ${color}`} style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
                      </div>
                      <div>
                        <p className="font-label-md text-on-surface">{label}</p>
                        <p className="text-label-sm text-on-surface-variant">{sub}</p>
                      </div>
                    </div>
                    <div className="relative inline-flex items-center">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={active}
                        onChange={() => setPreferences({ ...preferences, healthGoal: active ? "" : label })}
                      />
                      <div className="w-11 h-6 bg-outline-variant rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Ingredient Warnings */}
          <div className="space-y-md">
            <div className="flex items-center gap-sm">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>report</span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Ingredient Warnings</h3>
            </div>
            <div className="flex flex-wrap gap-sm">
              {["Artificial Sweeteners", "Preservatives", "High Sugar", "High Salt", "Processed Meat"].map((warn) => {
                const active = preferences.warnings?.includes(warn);
                return (
                  <button
                    key={warn}
                    type="button"
                    onClick={() => toggleWarning(warn)}
                    className={`flex items-center gap-xs px-md py-2 rounded-full font-label-md transition-all active:scale-95
                      ${active ? "bg-amber-500 text-white" : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"}`}
                  >
                    <span>{warn}</span>
                    <span className="material-symbols-outlined text-[16px]">{active ? "close" : "add"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Region & Sustainability */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="space-y-xs">
              <label className="font-label-md text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">language</span>
                Region / Certification
              </label>
              <select
                className="w-full border border-outline-variant rounded-xl px-md py-3 bg-surface-container-lowest font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                value={preferences.region}
                onChange={(e) => setPreferences({ ...preferences, region: e.target.value })}
              >
                <option value="">None</option>
                <option value="FSSAI">FSSAI Approved</option>
                <option value="Halal">Halal</option>
                <option value="Kosher">Kosher</option>
              </select>
            </div>
            <div className="space-y-xs">
              <label className="font-label-md text-on-surface flex items-center gap-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">park</span>
                Sustainability
              </label>
              <select
                className="w-full border border-outline-variant rounded-xl px-md py-3 bg-surface-container-lowest font-body-md text-on-surface focus:outline-none focus:border-primary transition-colors"
                value={preferences.sustainability}
                onChange={(e) => setPreferences({ ...preferences, sustainability: e.target.value })}
              >
                <option value="">None</option>
                <option value="Eco-Friendly">Eco-Friendly Products</option>
                <option value="Palm Oil">Flag Palm Oil Usage</option>
              </select>
            </div>
          </div>

          {/* AI Insights ambient card */}
          <div className="relative overflow-hidden rounded-2xl bg-primary-container h-32 flex items-center px-lg shadow-lg group">
            <div className="z-10 text-on-primary max-w-[60%]">
              <p className="font-headline-sm text-headline-sm">AI Insights</p>
              <p className="text-label-sm opacity-90">NutriLens adapts its scanning engine based on your choices.</p>
            </div>
            <div className="absolute right-0 top-0 h-full w-[40%] flex items-center justify-center opacity-30 group-hover:opacity-50 transition-opacity">
              <span className="material-symbols-outlined text-white text-[80px]" style={{ fontVariationSettings: "'FILL' 1" }}>nutrition</span>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary-container to-transparent opacity-60" />
          </div>
        </section>
      </main>

      {/* Fixed bottom Analyze button */}
      <div className="fixed bottom-0 left-0 right-0 px-container-margin py-md bg-white/90 backdrop-blur-xl border-t border-outline-variant/30 z-50 max-w-2xl mx-auto">
        <button
          onClick={analyzeData}
          disabled={!extractedData || analyzing}
          className="w-full h-14 bg-primary text-on-primary rounded-xl font-headline-sm shadow-[0_8px_24px_rgba(53,37,205,0.25)] active:scale-[0.98] transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-sm"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>analytics</span>
          {extractedData ? "Analyze Now" : "Scan a label first"}
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
