import React, { useState, useEffect, useRef } from 'react';

export default function GeminiBot() {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMessages, setSelectedMessages] = useState({});
    const [showPrintOptions, setShowPrintOptions] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    useEffect(() => {
        setMessages([{ sender: 'ai', type: 'text', content: "Hi, I'm Nutrii, your Nutrition and Health Assistant! Ask me anything about food, health, or ingredients." }]);
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) return alert("Please select an image file.");
            if (file.size > 4 * 1024 * 1024) return alert("File size exceeds 4MB.");
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setFilePreview(reader.result);
            reader.readAsDataURL(file);
        } else {
            setSelectedFile(null);
            setFilePreview(null);
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        setFilePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSendMessage = async () => {
        if (!inputMessage.trim() && !selectedFile) return;

        setMessages((prev) => [...prev, { sender: 'user', type: 'text', text: inputMessage, imageUrl: filePreview }]);
        setInputMessage('');
        clearSelectedFile();
        setSelectedMessages({});
        setShowPrintOptions(false);
        setIsLoading(true);

        try {
            // ✅ FIX: Send to backend instead of calling Gemini directly
            // This keeps the API key secure on the server side
            const token = localStorage.getItem('token');

            // Use FormData so we can send both text and image together
            const formData = new FormData();
            formData.append('message', inputMessage);
            if (selectedFile) formData.append('image', selectedFile);

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`  // ✅ JWT protected
                },
                body: formData
            });

            // ✅ Handle expired/missing token
            if (response.status === 401) {
                alert("Session expired. Please log in again.");
                window.location.href = '/login';
                return;
            }

            const result = await response.json();
            const aiResponseContent = result.reply || "Sorry, I couldn't get a response.";

            setMessages((prev) => [...prev, { sender: 'ai', type: 'html', content: aiResponseContent }]);
        } catch (err) {
            console.error("API Error:", err);
            setMessages((prev) => [...prev, { sender: 'ai', type: 'text', content: `Error: ${err.message}` }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMessageSelect = (index) => {
        setSelectedMessages((prev) => ({ ...prev, [index]: !prev[index] }));
    };

    const handlePrintSelected = () => {
        const content = messages.filter((_, i) => selectedMessages[i]).map(msg => {
            let html = msg.type === 'html' ? msg.content : msg.text;
            if (msg.imageUrl) html += `<br/><img src='${msg.imageUrl}' style='max-width:100%'/>`;
            return `<div><strong>${msg.sender}:</strong><br/>${html}</div><br/>`;
        }).join('');

        const win = window.open('', '', 'width=600,height=600');
        win.document.write(`<html><head><title>Print</title></head><body>${content}</body></html>`);
        win.print();
        win.close();
    };

    return (
        <div className="flex flex-col h-screen bg-gradient-to-br from-white to-indigo-100 p-4 font-sans">
            <div className="flex flex-col flex-1 max-w-2xl mx-auto w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 text-white p-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Nutrii - Your Health Companion</h2>
                    {!showPrintOptions ? (
                        <button onClick={() => setShowPrintOptions(true)} className="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm hover:bg-gray-100">Print</button>
                    ) : (
                        <button onClick={handlePrintSelected} className="bg-white text-indigo-600 px-3 py-1 rounded-full text-sm hover:bg-gray-100">Print Selected</button>
                    )}
                </div>

                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs p-3 rounded-xl shadow-md ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'}`}>
                                {msg.type === 'html' ? (
                                    <div dangerouslySetInnerHTML={{ __html: msg.content }} />
                                ) : msg.text}
                                {msg.imageUrl && <img src={msg.imageUrl} alt="attachment" className="mt-2 rounded-lg max-w-full h-auto" />}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start text-gray-500">Nutrii is typing...</div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-gray-50 flex gap-2 items-center border-t border-gray-200">
                    <input type="file" ref={fileInputRef} accept="image/*" onChange={handleFileChange} className="hidden" />
                    <button onClick={() => fileInputRef.current.click()} className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300">📎</button>
                    {filePreview && <img src={filePreview} alt="preview" className="h-10 w-10 rounded" />}

                    <input type="text" value={inputMessage} onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1 px-3 py-2 border border-gray-300 rounded-full focus:outline-none" placeholder="Ask Nutrii..." />

                    <button onClick={handleSendMessage} className="bg-indigo-500 text-white px-4 py-2 rounded-full hover:bg-indigo-600">Send</button>
                </div>
            </div>
        </div>
    );
}