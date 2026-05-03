import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
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

function AppWrapper() {
  const location = useLocation();

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

  const hideNavbar = location.pathname === "/";

  if (loading) return null;

  return (
    <>
      {/* Navbar */}
      {!hideNavbar && (
        <Navbar
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={setIsLoggedIn}
          setShowChatbot={setShowChatbot}
        />
      )}

      <div className={!hideNavbar ? "pt-16" : ""}>
        <Routes>
          {/* ✅ Public routes (blocked if logged in) */}
          <Route
            path="/"
            element={isLoggedIn ? <Navigate to="/landing" /> : <Home />}
          />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/landing" />
              ) : (
                <Login setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />
          <Route
            path="/register"
            element={
              isLoggedIn ? (
                <Navigate to="/landing" />
              ) : (
                <Register setIsLoggedIn={setIsLoggedIn} />
              )
            }
          />

          {/* Always accessible */}
          <Route path="/logout" element={<Logout setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/team" element={<AboutTeam />} />
          <Route path="/about" element={<AboutTeam />} />

          {/* ✅ Protected routes */}
          {isLoggedIn ? (
            <>
              <Route path="/landing" element={<Landing />} />
              <Route path="/scanner" element={<Scanner />} />
              <Route path="/result" element={<Result />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/history" element={<History />} />
            </>
          ) : (
            <>
              <Route path="/landing" element={<Navigate to="/" />} />
              <Route path="/scanner" element={<Navigate to="/" />} />
              <Route path="/result" element={<Navigate to="/" />} />
              <Route path="/favorites" element={<Navigate to="/" />} />
              <Route path="/history" element={<Navigate to="/" />} />
            </>
          )}
        </Routes>
      </div>

      {/* Chatbot Modal */}
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