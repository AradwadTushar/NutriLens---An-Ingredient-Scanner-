import React, { useState, useEffect, useRef } from "react";

const QUICK_PROMPTS = [
  { icon: "🥑", label: "Is this healthy?" },
  { icon: "🔬", label: "Check INS additives" },
  { icon: "🍎", label: "Suggest a clean snack" },
  { icon: "🔥", label: "Calculate glycemic impact" },
  { icon: "⚠️", label: "Flag hidden allergens" },
];

function renderMarkdown(text = "") {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function NutriiChat({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      {
        sender: "ai",
        type: "text",
        content:
          "Hi! I'm **Nutrii** — your personal clinical nutrition & health companion.\n\nI can help you evaluate packaged food ingredients, decode confusing E/INS numbers, estimate hidden sugars, and suggest healthier alternatives. What food item would you like to explore?",
        time: getTime(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, WEBP).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const sendMessage = async (text = inputMessage) => {
    const trimmed = text.trim();
    if (!trimmed && !selectedFile) return;

    setMessages((prev) => [
      ...prev,
      {
        sender: "user",
        type: "text",
        text: trimmed,
        imageUrl: filePreview,
        time: getTime(),
      },
    ]);
    setInputMessage("");
    const fileCopy = selectedFile;
    clearFile();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("message", trimmed);
      if (fileCopy) formData.append("image", fileCopy);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }

      const result = await response.json();
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          type: "html",
          content: result.reply || "I couldn't process that query. Please try rephrasing.",
          time: getTime(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          type: "text",
          content: "Sorry, I encountered an issue connecting to the AI nutrition engine. Please check your connection.",
          time: getTime(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[620px] max-h-[85vh] w-full bg-white rounded-3xl shadow-2xl border border-outline-variant/30 overflow-hidden font-manrope">
      {/* ── TOP HEADER ── */}
      <header className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-primary/10 via-white to-secondary/10 border-b border-outline-variant/20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[20px]">smart_toy</span>
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-extrabold text-on-surface tracking-tight">Nutrii AI</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                Nutritionist
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant font-medium">
              24/7 Food Safety & Diet Companion
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-surface-container hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
            title="Close Assistant"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </header>

      {/* ── MESSAGES LIST ── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5 bg-surface-container-lowest/50">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 items-start ${
              msg.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            {/* Avatar */}
            {msg.sender === "ai" && (
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">biotech</span>
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[82%] px-4 py-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                msg.sender === "ai"
                  ? "bg-white border border-outline-variant/30 text-on-surface rounded-tl-xs"
                  : "bg-primary text-white rounded-tr-xs"
              }`}
            >
              {msg.type === "html" ? (
                <div
                  className="prose-xs text-on-surface"
                  dangerouslySetInnerHTML={{ __html: msg.content }}
                />
              ) : (
                <div
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(msg.content || msg.text || ""),
                  }}
                />
              )}

              {msg.imageUrl && (
                <div className="mt-2 rounded-xl overflow-hidden border border-white/20 max-w-xs shadow-xs">
                  <img src={msg.imageUrl} alt="attachment" className="w-full h-auto block" />
                </div>
              )}

              <p
                className={`text-[10px] mt-1 text-right ${
                  msg.sender === "ai" ? "text-on-surface-variant/70" : "text-white/70"
                }`}
              >
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {/* Loading / Typing wave */}
        {isLoading && (
          <div className="flex gap-2.5 items-start">
            <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <span className="material-symbols-outlined text-[18px]">biotech</span>
            </div>
            <div className="bg-white border border-outline-variant/30 rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
              <span className="text-xs text-on-surface-variant mr-1 font-medium">Nutrii is evaluating</span>
              {[0, 150, 300].map((delay, i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── QUICK SUGGESTION PILLS ── */}
      <div className="px-4 py-2 bg-white border-t border-outline-variant/15 flex gap-1.5 overflow-x-auto shrink-0 no-scrollbar">
        {QUICK_PROMPTS.map((p) => (
          <button
            key={p.label}
            onClick={() => sendMessage(p.label)}
            className="whitespace-nowrap flex items-center gap-1 px-3 py-1.5 rounded-full border border-outline-variant/30 bg-surface-container-low hover:bg-primary/10 hover:border-primary text-on-surface-variant hover:text-primary text-xs font-semibold transition-all shrink-0 active:scale-95 shadow-2xs"
          >
            <span>{p.icon}</span>
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* ── ATTACHMENT PREVIEW ── */}
      {filePreview && (
        <div className="px-4 py-2 bg-surface-container-low border-t border-outline-variant/20 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <img src={filePreview} alt="preview" className="w-8 h-8 rounded-lg object-cover border" />
            <span className="text-xs text-on-surface truncate font-medium">
              {selectedFile?.name || "Image attached"}
            </span>
          </div>
          <button
            onClick={clearFile}
            className="w-6 h-6 rounded-full hover:bg-surface-container flex items-center justify-center text-on-surface-variant"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* ── INPUT ROW ── */}
      <div className="p-3 bg-white border-t border-outline-variant/20 shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Attach label photo"
            className="w-10 h-10 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-primary border border-outline-variant/30 flex items-center justify-center transition-all active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">attach_file</span>
          </button>

          <input
            type="text"
            placeholder="Ask Nutrii about ingredients, calories, additives..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 h-10 px-4 rounded-xl border border-outline-variant/40 bg-surface-container-low text-xs sm:text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:bg-white transition-all"
          />

          <button
            onClick={() => sendMessage()}
            disabled={(!inputMessage.trim() && !selectedFile) || isLoading}
            className="w-10 h-10 rounded-xl bg-primary hover:bg-primary/90 text-white flex items-center justify-center transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-xs shrink-0"
            title="Send"
          >
            <span className="material-symbols-outlined text-[18px]">send</span>
          </button>
        </div>
      </div>
    </div>
  );
}
