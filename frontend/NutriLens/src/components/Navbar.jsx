import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Nutrilens logo white.png";

const Navbar = ({ isLoggedIn, setIsLoggedIn, setShowChatbot }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(() => {
    try {
      const cached = localStorage.getItem("user_profile");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  // Fetch current user quota & role
  useEffect(() => {
    if (!isLoggedIn) {
      setUserProfile(null);
      return;
    }

    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await fetch("/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user_profile");
          setIsLoggedIn(false);
          navigate("/login");
          return;
        }

        if (res.ok) {
          const data = await res.json();
          setUserProfile(data);
          try {
            localStorage.setItem("user_profile", JSON.stringify(data));
          } catch (e) {
            console.error("Failed to cache user profile in Navbar:", e);
          }
        }
      } catch (err) {
        console.error("Failed to fetch user profile in Navbar:", err);
      }
    };

    fetchProfile();
  }, [isLoggedIn, navigate, setIsLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_profile");
    setIsLoggedIn(false);
    setMenuOpen(false);
    setProfileOpen(false);
    setUserProfile(null);
    navigate("/login");
  };

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const isAdmin = userProfile?.role === "admin";

  // Navigation links — clean & focused (Admin moved to right utility section)
  const navLinks = isLoggedIn
    ? [
        { to: "/landing", label: "Dashboard", icon: "dashboard" },
        { to: "/scanner", label: "Scanner", icon: "document_scanner" },
        { to: "/favorites", label: "Favorites", icon: "favorite" },
        { to: "/history", label: "History", icon: "history" },
        { to: "/about", label: "About", icon: "info" },
      ]
    : [
        { to: "/about", label: "About NutriLens", icon: "info" },
      ];

  // Refined Quota indicator
  const renderQuotaBadge = () => {
    if (!isLoggedIn) return null;

    if (isAdmin) {
      return (
        <NavLink
          id="tour-nav-quota"
          to="/admin"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 hover:bg-purple-100 hover:border-purple-300 transition-all shadow-sm active:scale-95"
          title="Admin Access: Unlimited Scans Active"
        >
          <span className="material-symbols-outlined text-[16px] text-purple-600">
            admin_panel_settings
          </span>
          <span>Admin Console</span>
        </NavLink>
      );
    }

    if (!userProfile) {
      return (
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/60 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          <span>Verifying access...</span>
        </div>
      );
    }

    const remaining = userProfile?.scansRemaining ?? 0;
    const limit = userProfile?.scansLimit ?? 2;
    const isExhausted = remaining <= 0;

    return (
      <NavLink
        id="tour-nav-quota"
        to="/scanner"
        className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all shadow-sm active:scale-95 ${
          isExhausted
            ? "bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
            : remaining === 1
            ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
        }`}
        title={`${remaining} free scans left`}
      >
        <span className="material-symbols-outlined text-[15px]">
          {isExhausted ? "lock" : "bolt"}
        </span>
        <span>
          {isExhausted ? "0 Scans • Limit Reached" : `${remaining}/${limit} Free Scans`}
        </span>
      </NavLink>
    );
  };

  return (
    <>
      {/* ── Top Fixed Navigation Bar ────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-b border-outline-variant/30 shadow-xs font-manrope">
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 max-w-7xl mx-auto">
          {/* Brand Logo */}
          <NavLink
            to={isLoggedIn ? "/landing" : "/"}
            className="flex items-center gap-2.5 group"
            onClick={closeAll}
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center p-1.5 shadow-sm group-hover:scale-105 transition-transform">
              <img src={logo} alt="NutriLens Logo" className="h-full w-auto object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg tracking-tight text-primary leading-none">
                NutriLens
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium tracking-wider uppercase">
                Food Intelligence
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "text-primary bg-primary/10 font-bold"
                      : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high/60"
                  }`
                }
              >
                <span className="material-symbols-outlined text-[18px]">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Right Utility Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isLoggedIn ? (
              <>
                {/* Quota Badge or Admin Console button */}
                {renderQuotaBadge()}

                {/* Nutrii AI Chatbot Icon */}
                <button
                  id="tour-nav-nutrii"
                  onClick={() => setShowChatbot(true)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-surface-container-high hover:bg-primary/10 text-on-surface hover:text-primary transition-all active:scale-95 border border-outline-variant/30"
                  title="Ask Nutrii AI Nutritionist"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    smart_toy
                  </span>
                </button>

                {/* Profile Avatar & Desktop Dropdown */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 rounded-xl overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all active:scale-95 flex items-center justify-center bg-primary text-white font-bold text-sm shadow-xs"
                    title="Account options"
                  >
                    {userProfile?.email
                      ? userProfile.email.charAt(0).toUpperCase()
                      : "U"}
                  </button>

                  {profileOpen && (
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-outline-variant/20 py-2 z-20 animate-scaleUp">
                        {/* User Identity info */}
                        <div className="px-4 py-3 border-b border-outline-variant/15">
                          <p className="text-xs font-bold text-on-surface truncate">
                            {userProfile?.email || "Signed in"}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                                isAdmin
                                  ? "bg-purple-100 text-purple-700"
                                  : !userProfile
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-emerald-100 text-emerald-800"
                              }`}
                            >
                              {isAdmin ? "Admin Account" : !userProfile ? "Loading..." : "Free Preview Tier"}
                            </span>
                            {!isAdmin && userProfile && (
                              <span className="text-[11px] text-on-surface-variant font-medium">
                                {userProfile?.scansRemaining ?? 0} left
                              </span>
                            )}
                          </div>
                        </div>

                        {isAdmin && (
                          <NavLink
                            to="/admin"
                            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-700 font-semibold hover:bg-purple-50 transition-colors"
                            onClick={() => setProfileOpen(false)}
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              admin_panel_settings
                            </span>
                            <span>Admin Console</span>
                          </NavLink>
                        )}

                        <NavLink
                          to="/landing"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">dashboard</span>
                          <span>Dashboard</span>
                        </NavLink>

                        <NavLink
                          to="/scanner"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">document_scanner</span>
                          <span>Food Scanner</span>
                        </NavLink>

                        <NavLink
                          to="/favorites"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">favorite</span>
                          <span>Saved Favorites</span>
                        </NavLink>

                        <NavLink
                          to="/history"
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low transition-colors"
                          onClick={() => setProfileOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">history</span>
                          <span>Scan History</span>
                        </NavLink>

                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            window.dispatchEvent(new CustomEvent("start-nutrilens-tour"));
                          }}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary font-bold hover:bg-primary/5 transition-colors w-full text-left"
                        >
                          <span className="material-symbols-outlined text-[18px]">explore</span>
                          <span>Restart Product Tour</span>
                        </button>

                        <div className="border-t border-outline-variant/15 my-1" />

                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-error hover:bg-error-container/30 transition-colors font-medium"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Mobile Menu Hamburger */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl hover:bg-surface-container-high transition-colors active:scale-95 border border-outline-variant/30"
                  aria-label="Toggle navigation menu"
                >
                  <span className="material-symbols-outlined text-on-surface">
                    {menuOpen ? "close" : "menu"}
                  </span>
                </button>
              </>
            ) : (
              /* Public visitors: Login & Register */
              <div className="flex gap-2 items-center">
                <NavLink
                  to="/login"
                  className="text-xs sm:text-sm font-bold text-on-surface hover:text-primary px-3 sm:px-4 py-2 rounded-xl hover:bg-surface-container-high transition-colors"
                >
                  Sign In
                </NavLink>
                <NavLink
                  to="/register"
                  className="text-xs sm:text-sm font-bold text-white bg-primary hover:bg-primary/90 px-3.5 sm:px-4 py-2 rounded-xl transition-all shadow-sm hover:shadow active:scale-95"
                >
                  Get Started
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Slide-Out Drawer ───────────────────────────────────────── */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs md:hidden animate-fadeIn"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 bg-white shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-out font-manrope ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center p-1">
              <img src={logo} alt="NutriLens" className="h-full w-auto object-contain" />
            </div>
            <span className="font-extrabold text-primary text-base">NutriLens</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
          </button>
        </div>

        {/* User Identity inside drawer */}
        {isLoggedIn && (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-outline-variant/20 bg-surface-container-low/60">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white bg-primary shrink-0 shadow-xs">
              {userProfile?.email
                ? userProfile.email.charAt(0).toUpperCase()
                : "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-on-surface text-xs truncate">
                {userProfile?.email || "My Account"}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isAdmin
                      ? "bg-purple-100 text-purple-700"
                      : !userProfile
                      ? "bg-slate-100 text-slate-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {isAdmin
                    ? "Admin • Unlimited"
                    : !userProfile
                    ? "Verifying access..."
                    : `${userProfile?.scansRemaining ?? 0} Scans Left`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Nav Links */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-purple-100 text-purple-800 font-bold"
                    : "text-purple-700 hover:bg-purple-50 font-semibold"
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">
                admin_panel_settings
              </span>
              <span className="text-sm">Admin Console</span>
            </NavLink>
          )}

          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-on-surface hover:bg-surface-container-high font-medium"
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]">
                {link.icon}
              </span>
              <span className="text-sm">{link.label}</span>
            </NavLink>
          ))}

          {isLoggedIn && (
            <>
              <button
                onClick={() => {
                  setShowChatbot(true);
                  setMenuOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-on-surface hover:bg-surface-container-high w-full font-medium"
              >
                <span className="material-symbols-outlined text-[20px] text-primary">
                  smart_toy
                </span>
                <span className="text-sm">Ask Nutrii AI</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.dispatchEvent(new CustomEvent("start-nutrilens-tour"));
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-primary hover:bg-primary/10 w-full font-bold"
              >
                <span className="material-symbols-outlined text-[20px]">
                  explore
                </span>
                <span className="text-sm">Take Product Tour</span>
              </button>
            </>
          )}
        </nav>

        {/* Bottom Drawer Actions */}
        {isLoggedIn ? (
          <div className="p-4 border-t border-outline-variant/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-error/30 text-error hover:bg-error-container/20 transition-all active:scale-95 text-xs font-bold"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <div className="p-4 border-t border-outline-variant/20 space-y-2">
            <NavLink
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center justify-center h-11 rounded-xl border border-outline-variant text-on-surface font-bold text-xs"
            >
              Sign In
            </NavLink>
            <NavLink
              to="/register"
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center justify-center h-11 rounded-xl bg-primary text-white font-bold text-xs"
            >
              Create Free Account
            </NavLink>
          </div>
        )}
      </div>
    </>
  );
};

export default Navbar;
