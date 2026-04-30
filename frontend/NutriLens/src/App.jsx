import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useState } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Logout from "./components/Logout";
import Team from "./components/Team";
import About from "./components/Aboutus";
import Scanner from "./pages/scanner";
import Result from "./pages/result";
import Landing from "./pages/Landing";
import GeminiBot from "./components/GeminiChatbot";

function AppWrapper() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [extractedData, setExtractedData] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const hideNavbar = location.pathname === "/";
  const hideChatbotButton = ["/", "/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/logout" element={<Logout setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/team" element={<Team />} />
        <Route path="/about" element={<About />} />

        {/* Protected Routes */}
        {isLoggedIn ? (
          <>
            <Route path="/landing" element={<Landing />} />
            <Route path="/scanner" element={<Scanner setExtractedData={setExtractedData} setShowResult={setShowResult} />} />
            <Route path="/result" element={<Result extractedData={extractedData} />} />
          </>
        ) : (
          <>
            <Route path="/landing" element={<Navigate to="/" />} />
            <Route path="/scanner" element={<Navigate to="/" />} />
            <Route path="/result" element={<Navigate to="/" />} />
          </>
        )}
      </Routes>

      {/* Floating Chat Button Only for Logged-in Users and Allowed Pages */}
      {isLoggedIn && !hideChatbotButton && (
        <button
          onClick={() => setShowChatbot(true)}
          className="fixed bottom-5 right-5 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition transform hover:scale-110 z-50"
          title="Ask Nutrii"
        >
          💬
        </button>
      )}

      {/* Popup Chatbot with Animation */}
      {showChatbot && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 animate-fadeIn">
          <div className="relative max-w-3xl w-full animate-chatbot-in">
            <button
              onClick={() => setShowChatbot(false)}
              className="absolute top-2 right-2 text-white bg-red-500 p-2 rounded-full hover:bg-red-600 z-50"
            >
              ✖
            </button>
            <GeminiBot />
          </div>
        </div>
      )}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;
