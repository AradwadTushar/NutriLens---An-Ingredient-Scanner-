import React, { useState, useEffect, useRef } from 'react';

const QUICK_PROMPTS = [
  { icon: '🥑', label: 'Is this healthy?' },
  { icon: '🔬', label: 'Check ingredients' },
  { icon: '🍎', label: 'Suggest a snack' },
  { icon: '🔥', label: 'Count calories' },
];

function renderMarkdown(text = '') {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br/>');
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function NutriiChat() {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([{
      sender: 'ai',
      type: 'text',
      content: "Hi! I'm **Nutrii** — your personal nutrition & health companion.\n\nI can help you analyze food labels, check ingredients, estimate calories, and give diet advice. What would you like to explore today?",
      time: getTime(),
    }]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select an image file.');
    if (file.size > 4 * 1024 * 1024) return alert('File size exceeds 4MB.');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFilePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const sendMessage = async (text = inputMessage) => {
    if (!text.trim() && !selectedFile) return;

    setMessages(prev => [...prev, {
      sender: 'user',
      type: 'text',
      text,
      imageUrl: filePreview,
      time: getTime(),
    }]);
    setInputMessage('');
    const fileCopy = selectedFile;
    clearFile();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('message', text);
      if (fileCopy) formData.append('image', fileCopy);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });

      if (response.status === 401) {
  alert('Session expired. Please log in again.');

  localStorage.removeItem("token");
  window.location.href = '/login';

  return;
}
      const result = await response.json();
      setMessages(prev => [...prev, {
        sender: 'ai',
        type: 'html',
        content: result.reply || "Sorry, I couldn't get a response.",
        time: getTime(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        type: 'text',
        content: `Error: ${err.message}`,
        time: getTime(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-surface font-manrope text-on-surface">

      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-5 py-4 bg-surface-container-lowest border-b border-outline-variant flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-container flex items-center justify-center text-2xl flex-shrink-0 shadow-md">
            🌿
          </div>
          <div>
            <h1 className="text-label-md font-semibold text-on-surface">Nutrii</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-label-sm text-primary">Health Companion · Online</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => window.history.back()}
          className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors text-base"
        >
          ✕
        </button>
      </header>

      {/* ── MESSAGES ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-surface">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-2.5 animate-fadeIn ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* AI avatar */}
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-sm flex-shrink-0 mt-1">
                🌿
              </div>
            )}

            {/* Bubble */}
            <div
              className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                ${msg.sender === 'ai'
                  ? 'bg-surface-container border border-outline-variant rounded-tl-sm text-on-surface'
                  : 'bg-primary-container rounded-tr-sm text-on-secondary-container'
                }`}
            >
              {msg.type === 'html'
                ? <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                : <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content || msg.text || '') }} />
              }
              {msg.imageUrl && (
                <img
                  src={msg.imageUrl}
                  alt="attachment"
                  className="mt-2 rounded-xl max-w-full h-auto block"
                />
              )}
              <p className={`text-xs mt-1.5 ${msg.sender === 'ai' ? 'text-outline' : 'text-primary-fixed-dim'}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex gap-2.5 animate-fadeIn">
            <div className="w-8 h-8 rounded-xl bg-primary-container flex items-center justify-center text-sm flex-shrink-0 mt-1">
              🌿
            </div>
            <div className="bg-surface-container border border-outline-variant rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              {[0, 150, 300].map((delay, i) => (
                <span
                  key={i}
                  className="w-2 h-2 rounded-full bg-primary animate-bounce"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── INPUT SECTION ── */}
      <div className="px-4 pt-3 pb-5 bg-surface-container-lowest border-t border-outline-variant flex-shrink-0 space-y-3">

        {/* Quick prompts */}
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p.label}
              onClick={() => sendMessage(p.label)}
              className="whitespace-nowrap flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-outline-variant bg-surface-container text-on-surface-variant text-xs font-semibold hover:bg-primary-fixed hover:text-primary hover:border-primary transition-colors"
            >
              <span>{p.icon}</span>
              {p.label}
            </button>
          ))}
        </div>

        {/* File preview bar */}
        {filePreview && (
          <div className="flex items-center gap-3 px-3 py-2 bg-surface-container border border-primary rounded-xl">
            <img src={filePreview} alt="preview" className="w-10 h-10 rounded-lg object-cover" />
            <span className="flex-1 text-xs text-on-surface-variant truncate">{selectedFile?.name}</span>
            <button
              onClick={clearFile}
              className="text-outline hover:text-error transition-colors text-sm px-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Text input row */}
        <div className="flex items-center gap-2">
          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current.click()}
            title="Attach image"
            className="w-11 h-11 rounded-xl bg-surface-container border border-outline-variant text-on-surface-variant hover:bg-surface-container-high hover:text-primary transition-colors flex items-center justify-center text-base flex-shrink-0"
          >
            📎
          </button>

          {/* Input pill */}
          <div className="flex-1 flex items-center bg-surface-container border border-outline-variant rounded-full px-4 focus-within:border-primary transition-colors">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask Nutrii about your food…"
              className="flex-1 bg-transparent border-none outline-none text-on-surface text-sm py-3 placeholder:text-outline font-manrope"
            />
            <button className="text-outline hover:text-on-surface-variant transition-colors text-base ml-1">
              🎤
            </button>
          </div>

          {/* Send button */}
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || (!inputMessage.trim() && !selectedFile)}
            className="w-11 h-11 rounded-full bg-primary text-on-primary flex items-center justify-center text-base shadow-md hover:bg-secondary active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}