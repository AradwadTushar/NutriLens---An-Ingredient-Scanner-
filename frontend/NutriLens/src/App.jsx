import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Logout from "./components/Logout";
import AboutTeam from "./components/AboutTeam";
import Scanner from "./pages/scanner";
import Result from "./pages/result";
import Landing from "./pages/Landing";
import GeminiBot from "./components/GeminiChatbot";
import Favorites from "./pages/Favorites";
import History from "./pages/History";
import AdminDashboard from "./pages/AdminDashboard";

function AppWrapper() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
    setLoading(false);
  }, []);

  if (loading) return null;

  return (
    <>
      {/* Global Navbar */}
      <Navbar
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        setShowChatbot={setShowChatbot}
      />

      <div className="pt-16">
        <Routes>
          {/* Public routes (redirect to /landing if already logged in) */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/landing" replace /> : <Home />}
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/landing" replace />
              ) : (
                <Login setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/landing" replace />
              ) : (
                <Register setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />

          {/* Always accessible */}
          <Route path="/logout" element={<Logout setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/about" element={<AboutTeam />} />
          {/* Legacy /team redirect to /about */}
          <Route path="/team" element={<Navigate to="/about" replace />} />

          {/* Protected routes */}
          {isLoggedIn ? (
            <>
              <Route path="/landing" element={<Landing />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/result" element={<Result />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/history" element={<History />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </>
          ) : (
            <>
              <Route path="/landing" element={<Navigate to="/login" replace />} />
              <Route path="/scanner" element={<Navigate to="/login" replace />} />
              <Route path="/result" element={<Navigate to="/login" replace />} />
              <Route path="/favorites" element={<Navigate to="/login" replace />} />
              <Route path="/history" element={<Navigate to="/login" replace />} />
              <Route path="/admin" element={<Navigate to="/login" replace />} />
            </>
          )}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4"
          onClick={() => setShowChatbot(false)}
        >
          <div
            className="relative max-w-xl w-full animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <GeminiBot onClose={() => setShowChatbot(false)} />
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
