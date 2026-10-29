import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cropper from "react-easy-crop";
import QuotaExhaustedModal from "../components/ui/QuotaExhaustedModal";

export default function Scanner() {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [preferences, setPreferences] = useState({
    diet: "",
    allergies: [],
    healthGoal: "",
    warnings: [],
    region: "",
    sustainability: "",
  });
  const [extractedData, setLocalExtractedData] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCrop, setShowCrop] = useState(false);
  const [aspect, setAspect] = useState(4 / 3);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "camera"
  const [showQuotaModal, setShowQuotaModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const navigate = useNavigate();

  // Load user profile & quota
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUserProfile(data);
      })
      .catch((err) => console.error("Scanner quota check failed:", err));
  }, []);

  // Analysis step progression ticker
  useEffect(() => {
    let interval;
    if (analyzing) {
      setAnalysisStep(0);
      interval = setInterval(() => {
        setAnalysisStep((prev) => (prev < 3 ? prev + 1 : prev));
      }, 700);
    }
    return () => clearInterval(interval);
  }, [analyzing]);

  // Camera stream handler
  useEffect(() => {
    if (activeTab !== "camera") return;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
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
      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      if (res.status === 403) {
        setShowQuotaModal(true);
        return;
      }
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
    await new Promise((resolve) => {
      image.onload = resolve;
    });
    const canvas = document.createElement("canvas");
    canvas.width = cropPixels.width;
    canvas.height = cropPixels.height;
    canvas
      .getContext("2d")
      .drawImage(
        image,
        cropPixels.x,
        cropPixels.y,
        cropPixels.width,
        cropPixels.height,
        0,
        0,
        cropPixels.width,
        cropPixels.height
      );
    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/jpeg");
    });
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
      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      if (res.status === 403) {
        setShowQuotaModal(true);
        return;
      }
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
    if (!extractedData) return alert("Upload or capture an ingredient label first!");
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      if (res.status === 403) {
        setShowQuotaModal(true);
        return;
      }
      const result = await res.json();
      const extractedResult = {
        ingredients: result.ingredients || [],
        nutrition: result.nutrition || {},
        summary: result.summary || {},
        verdict: result.verdict || "Caution",
      };

      // Fail-Safe: Record to scan history in localStorage
      try {
        const hist = JSON.parse(localStorage.getItem("nutrilens_history") || "[]");
        hist.unshift({
          date: new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
          verdict: extractedResult.verdict,
          data: extractedResult,
        });
        localStorage.setItem("nutrilens_history", JSON.stringify(hist.slice(0, 30)));
      } catch (histErr) {
        console.warn("Could not save to history:", histErr);
      }

      navigate("/result", {
        state: {
          extractedData: extractedResult,
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
      <div className="fixed inset-0 bg-black text-white font-manrope overflow-hidden flex flex-col z-50">
        <header className="flex justify-between items-center px-5 h-16 shrink-0 border-b border-white/10">
          <button
            onClick={() => {
              setShowCrop(false);
              setImagePreview(null);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h1 className="font-bold text-base">Crop Nutrition Label</h1>
          <div className="w-10" />
        </header>

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

        <div className="bg-black/90 backdrop-blur-md px-6 py-4 space-y-4 shrink-0 max-w-xl mx-auto w-full">
          <div className="space-y-1">
            <label className="text-xs text-white/70 uppercase tracking-wider font-semibold">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-indigo-500"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { label: "1:1", value: 1 },
              { label: "4:3", value: 4 / 3 },
              { label: "16:9", value: 16 / 9 },
              { label: "Free", value: null },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => setAspect(item.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                  aspect === item.value
                    ? "bg-primary text-white"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            onClick={handleCropConfirm}
            className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">crop</span>
            <span>Confirm Crop & Scan</span>
          </button>
        </div>
      </div>
    );
  }

  // ── High-Tech Diagnostic AI Analysis Screen ────────────────────────────────
  if (analyzing) {
    const diagnosticPhases = [
      { icon: "search", label: "Optical Character Normalization", desc: "Segmenting raw text lines and isolating chemical names" },
      { icon: "science", label: "INS & E-Number Cross-Referencing", desc: "Querying 3,500+ regulated additives against WHO/FDA databases" },
      { icon: "calculate", label: "Glycemic & Hidden Sugar Calculation", desc: "Auditing maltodextrin, high-fructose corn syrup, and trans fats" },
      { icon: "verified", label: "Personalized Verdict Synthesis", desc: "Evaluating against your custom dietary goals and generating dossier" },
    ];

    return (
      <div className="min-h-screen bg-surface font-manrope flex flex-col items-center justify-center p-4 sm:p-6 text-center">
        <div className="max-w-lg w-full bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-outline-variant/30 space-y-6 animate-fadeIn">
          {/* Animated Central Scanner Lens */}
          <div className="relative flex items-center justify-center w-40 h-40 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/10 animate-ping opacity-50" />
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-primary/30 animate-spin" style={{ animationDuration: "8s" }} />
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] opacity-20 [background-size:8px_8px]" />
              <span className="material-symbols-outlined text-4xl animate-pulse">biotech</span>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-extrabold text-on-surface tracking-tight">
              Clinical Ingredient Audit in Progress
            </h2>
            <p className="text-xs text-on-surface-variant">
              Cross-referencing packaging data with clinical dietary standards...
            </p>
          </div>

          {/* Stepper Diagnostics */}
          <div className="space-y-2.5 text-left pt-2">
            {diagnosticPhases.map((phase, idx) => {
              const isDone = analysisStep > idx;
              const isCurrent = analysisStep === idx;
              return (
                <div
                  key={idx}
                  className={`flex items-start gap-3 p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? "bg-primary/5 border-primary/30 shadow-xs"
                      : isDone
                      ? "bg-emerald-50/60 border-emerald-200/60"
                      : "bg-surface-container-low/40 border-outline-variant/15 opacity-50"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                      isDone
                        ? "bg-emerald-500 text-white"
                        : isCurrent
                        ? "bg-primary text-white animate-pulse"
                        : "bg-neutral-200 text-neutral-600"
                    }`}
                  >
                    {isDone ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      <span className="material-symbols-outlined text-[16px]">{phase.icon}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold ${
                        isCurrent
                          ? "text-primary"
                          : isDone
                          ? "text-emerald-900"
                          : "text-on-surface-variant"
                      }`}
                    >
                      {phase.label}
                    </p>
                    <p className="text-[11px] text-on-surface-variant line-clamp-1">{phase.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Progress Bar */}
          <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (analysisStep + 1) * 25)}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // ── Main Responsive Scanner Page ───────────────────────────────────────────
  return (
    <div className="min-h-screen bg-surface font-manrope pb-28 lg:pb-16">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Top Header & Quota Alert */}
        <section className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
                Food Label Scanner
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant">
                Upload or capture a nutrition label to inspect ingredients and calculate your health score.
              </p>
            </div>

            {userProfile && (
              <div
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border shadow-xs ${
                  userProfile.role === "admin"
                    ? "bg-purple-50 border-purple-200 text-purple-900"
                    : userProfile.scansRemaining <= 0
                    ? "bg-red-50 border-red-200 text-red-900"
                    : userProfile.scansRemaining === 1
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {userProfile.role === "admin"
                    ? "verified"
                    : userProfile.scansRemaining <= 0
                    ? "lock"
                    : "bolt"}
                </span>
                <span>
                  {userProfile.role === "admin"
                    ? "Admin • Unlimited Scans"
                    : `${userProfile.scansRemaining}/${userProfile.scansLimit || 2} Scans Left`}
                </span>
                {userProfile.role !== "admin" && userProfile.scansRemaining <= 0 && (
                  <button
                    type="button"
                    onClick={() => setShowQuotaModal(true)}
                    className="underline hover:text-red-700 ml-1 cursor-pointer"
                  >
                    Top-up
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ── Responsive 2-Column Grid (Desktop Widescreen) ────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left Column: Input Panel (Upload / Camera) (5 cols on lg) ──────── */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xs border border-outline-variant/30 space-y-4">
              {/* Tab Switcher */}
              <div className="flex bg-surface-container-high rounded-xl p-1 gap-1">
                {["upload", "camera"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab
                        ? "bg-white text-primary shadow-xs"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {tab === "upload" ? "upload_file" : "photo_camera"}
                    </span>
                    <span>{tab === "upload" ? "Upload Photo" : "Live Camera"}</span>
                  </button>
                ))}
              </div>

              {/* Upload Tab */}
              {activeTab === "upload" && (
                <form onSubmit={handleUpload} className="space-y-4">
                  <label className="border-2 border-dashed border-outline-variant hover:border-primary/50 rounded-2xl p-6 cursor-pointer flex flex-col items-center gap-2 hover:bg-surface-container-low transition-colors text-center group">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform">
                      <span className="material-symbols-outlined text-[24px]">cloud_upload</span>
                    </div>
                    <span className="text-sm font-bold text-on-surface">
                      Drop nutrition label or <span className="text-primary underline">browse</span>
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      High resolution JPEG, PNG, WEBP
                    </span>
                    <input
                      type="file"
                      name="image"
                      accept="image/*"
                      className="hidden"
                      onChange={previewImage}
                      required
                    />
                  </label>

                  {/* Image Preview with High-Tech Optical Scanner Overlay */}
                  {imagePreview && (
                    <div className="rounded-2xl overflow-hidden border border-outline-variant/30 shadow-xs relative bg-neutral-950">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full max-h-56 object-contain"
                      />

                      {/* Optical Scanning HUD Overlay during loading */}
                      {loading && (
                        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center p-4">
                          {/* Animated laser line */}
                          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[1px] animate-scan pointer-events-none" />

                          {/* Optical HUD Target */}
                          <div className="relative border-2 border-dashed border-cyan-400/60 rounded-xl p-4 w-44 text-center space-y-1 bg-slate-900/80 shadow-2xl">
                            <div className="flex items-center justify-center gap-1.5 text-cyan-400">
                              <span className="material-symbols-outlined text-[18px] animate-spin">
                                progress_activity
                              </span>
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                                Scanning OCR
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-300">Detecting text lines...</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Extracting Ingredients...</span>
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[18px]">document_scanner</span>
                        <span>Extract Ingredients</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Camera Tab */}
              {activeTab === "camera" && (
                <div className="space-y-4">
                  {!cameraError ? (
                    <>
                      <div className="rounded-2xl overflow-hidden border border-outline-variant/30 shadow-xs bg-black">
                        <video
                          ref={videoRef}
                          autoPlay
                          muted
                          playsInline
                          className="w-full h-56 object-cover"
                        />
                      </div>
                      <button
                        onClick={captureImage}
                        className="w-full h-12 bg-primary text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                        <span>Capture Frame</span>
                      </button>
                    </>
                  ) : (
                    <div className="p-6 bg-surface-container-low rounded-2xl text-center space-y-2 border border-outline-variant/20">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant">
                        no_photography
                      </span>
                      <p className="text-xs text-on-surface-variant">
                        Camera access unavailable or blocked. Please switch to the Upload tab.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Extraction Feedback Message */}
              {ocrStatus === "success" && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600 shrink-0">
                    check_circle
                  </span>
                  <div>
                    <p className="font-bold">
                      {extractedData?.ingredients?.length || "Multiple"} Ingredients Extracted!
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Customize health goals on the right, then click Analyze below.
                    </p>
                  </div>
                </div>
              )}
              {ocrStatus === "error" && (
                <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                  <span className="material-symbols-outlined text-[20px] text-red-600 shrink-0">
                    error
                  </span>
                  <span>Could not extract text. Please ensure the label is clearly visible.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Preferences & Custom Constraints (7 cols on lg) ───── */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-outline-variant/30 space-y-6">
            <div className="border-b border-outline-variant/20 pb-4">
              <h2 className="text-lg font-bold text-on-surface">Personalize Analysis Profile</h2>
              <p className="text-xs text-on-surface-variant">
                Configure your health goals and dietary restrictions for custom warnings.
              </p>
            </div>

            {/* Dietary Patterns */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">restaurant</span>
                <span>Dietary Pattern</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
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
                      onClick={() =>
                        setPreferences({ ...preferences, diet: active ? "" : label })
                      }
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                        active
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-on-surface text-xs"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">{icon}</span>
                        <span className="text-xs">{label}</span>
                      </div>
                      {active && (
                        <span className="material-symbols-outlined text-[14px] text-primary">
                          check
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allergies Chips */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-red-500">warning</span>
                <span>Allergen Sensitivity</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Dairy-Free",
                  "Nut-Free",
                  "Soy-Free",
                  "Shellfish-Free",
                  "Egg-Free",
                  "Gluten-Free",
                ].map((allergy) => {
                  const active = preferences.allergies?.includes(allergy);
                  return (
                    <button
                      key={allergy}
                      type="button"
                      onClick={() => toggleAllergy(allergy)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                        active
                          ? "bg-red-500 text-white shadow-xs"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
                      }`}
                    >
                      <span>{allergy}</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {active ? "close" : "add"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Health Goals Switches */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">ads_click</span>
                <span>Health Goal</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: "Weight Loss", sub: "Calorie & sugar deficit", icon: "monitor_weight" },
                  { label: "Muscle Gain", sub: "Protein density prioritization", icon: "fitness_center" },
                  { label: "Diabetic Friendly", sub: "Strict daily sugar < 25g", icon: "water_drop" },
                  { label: "Heart Healthy", sub: "Low sodium & trans fats", icon: "favorite" },
                ].map(({ label, sub, icon }) => {
                  const active = preferences.healthGoal === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() =>
                        setPreferences({ ...preferences, healthGoal: active ? "" : label })
                      }
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-95 ${
                        active
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                          : "border-outline-variant/40 bg-surface-container-low hover:bg-surface-container text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[18px]">{icon}</span>
                        <div>
                          <p className="text-xs font-bold leading-tight">{label}</p>
                          <p className="text-[10px] text-on-surface-variant">{sub}</p>
                        </div>
                      </div>
                      {active && (
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ingredient Warnings */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-amber-600">report</span>
                <span>Flag Ingredients</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Artificial Sweeteners",
                  "Preservatives",
                  "High Sugar",
                  "High Salt",
                  "Processed Meat",
                ].map((warn) => {
                  const active = preferences.warnings?.includes(warn);
                  return (
                    <button
                      key={warn}
                      type="button"
                      onClick={() => toggleWarning(warn)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                        active
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-variant"
                      }`}
                    >
                      <span>{warn}</span>
                      <span className="material-symbols-outlined text-[14px]">
                        {active ? "close" : "add"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Region / Certification */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface">Region / Standard</label>
                <select
                  value={preferences.region}
                  onChange={(e) => setPreferences({ ...preferences, region: e.target.value })}
                  className="w-full h-11 px-3 rounded-xl border border-outline-variant bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">Default (Global FDA/WHO)</option>
                  <option value="FSSAI">FSSAI (India Standards)</option>
                  <option value="Halal">Halal Compliant</option>
                  <option value="Kosher">Kosher Compliant</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-on-surface">Sustainability Check</label>
                <select
                  value={preferences.sustainability}
                  onChange={(e) =>
                    setPreferences({ ...preferences, sustainability: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-xl border border-outline-variant bg-surface-container-low text-xs text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="">None</option>
                  <option value="Eco-Friendly">Eco-Friendly Packaging</option>
                  <option value="Palm Oil">Flag Palm Oil Usage</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── UNIFIED MASTER ACTION DOCK (Spans Bottom of BOTH Sections) ──── */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-5 transition-all">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-colors ${
                extractedData ? "bg-emerald-100 text-emerald-800" : "bg-primary/10 text-primary"
              }`}
            >
              <span className="material-symbols-outlined text-[28px]">
                {extractedData ? "task_alt" : "biotech"}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-on-surface">
                  {extractedData ? "Ingredients Ready for Evaluation" : "Step 2: Generate Health Dossier"}
                </h3>
                {extractedData && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {extractedData.ingredients?.length || 0} items extracted
                  </span>
                )}
              </div>
              <p className="text-xs text-on-surface-variant max-w-xl">
                {extractedData
                  ? "Your dietary preferences are linked. Run the analysis to generate your clinical food safety report."
                  : "Upload or capture a label photo above and click 'Extract Ingredients' to unlock the analysis."}
              </p>
            </div>
          </div>

          <button
            onClick={analyzeData}
            disabled={!extractedData || analyzing}
            className={`w-full md:w-auto px-9 py-4 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 transition-all shadow-md active:scale-95 shrink-0 ${
              extractedData && !analyzing
                ? "bg-primary hover:bg-primary/90 text-white shadow-primary/25 hover:shadow-lg cursor-pointer animate-pulse-subtle"
                : "bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed border border-outline-variant/30"
            }`}
          >
            <span className="material-symbols-outlined text-[22px]">
              {analyzing ? "progress_activity" : "analytics"}
            </span>
            <span>{analyzing ? "Generating Dossier..." : "Analyze Label Now"}</span>
            {extractedData && !analyzing && (
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            )}
          </button>
        </section>

      </main>

      {/* ── Mobile Sticky Bottom Action Bar (lg:hidden) ───────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 px-4 py-3 bg-white/95 backdrop-blur-md border-t border-outline-variant/30 z-40">
        <button
          onClick={analyzeData}
          disabled={!extractedData || analyzing}
          className="w-full h-13 bg-primary text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">biotech</span>
          <span>{extractedData ? "Analyze Label Now" : "Scan a label first"}</span>
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Quota Exhausted Modal */}
      <QuotaExhaustedModal
        isOpen={showQuotaModal}
        onClose={() => setShowQuotaModal(false)}
      />
    </div>
  );
}
