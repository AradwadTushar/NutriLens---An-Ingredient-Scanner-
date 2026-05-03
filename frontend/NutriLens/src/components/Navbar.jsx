import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/Nutrilens logo white.png";

const Navbar = ({ isLoggedIn, setIsLoggedIn, setShowChatbot }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setMenuOpen(false);
    setProfileOpen(false);
    navigate("/login");
  };

  const closeAll = () => {
    setMenuOpen(false);
    setProfileOpen(false);
  };

  const navLinks = isLoggedIn
    ? [
        { to: "/landing", label: "Dashboard", icon: "home" },
        { to: "/scanner", label: "Scanner", icon: "document_scanner" },
        { to: "/favorites", label: "Favorites", icon: "favorite" },
        { to: "/team", label: "Team", icon: "group" },
        { to: "/about", label: "About", icon: "info" },
      ]
    : [];

  return (
    <>
      {/* ── Top Bar ─────────────────────────────────────────────────────── */}
      <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-outline-variant/30 shadow-sm font-manrope">
        <div className="flex justify-between items-center px-container-margin h-16 max-w-5xl mx-auto">

          {/* Logo */}
          <NavLink
            to={isLoggedIn ? "/landing" : "/"}
            className="flex items-center gap-sm"
            onClick={closeAll}
          >
            <img src={logo} alt="NutriLens" className="h-8 w-auto rounded-md" />
            <span className="font-bold text-lg tracking-tighter text-primary hidden sm:inline">
              NutriLens
            </span>
          </NavLink>

          {/* Desktop Nav */}
          {isLoggedIn && (
            <nav className="hidden md:flex items-center gap-md">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `text-label-md transition-colors ${
                      isActive
                        ? "text-primary font-semibold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center gap-sm">

            {isLoggedIn ? (
              <>
              <button
  onClick={() => setShowChatbot(true)}
  className="hidden md:flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors active:scale-95"
  title="Ask Nutrii"
>
  <span className="material-symbols-outlined text-on-surface">
    smart_toy
  </span>
</button>
                {/* Profile avatar — desktop dropdown */}
                <div className="relative hidden md:block">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all active:scale-95"
                  >
                    <img
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </button>

                  {profileOpen && (
                    <>
                      {/* Backdrop */}
                      <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-outline-variant/20 py-2 z-20">
                        <NavLink
                          to="/landing"
                          className="flex items-center gap-sm px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low"
                          onClick={() => setProfileOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">home</span>
                          Dashboard
                        </NavLink>
                        <NavLink
                          to="/favorites"
                          className="flex items-center gap-sm px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low"
                          onClick={() => setProfileOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">favorite</span>
                          Favorites
                        </NavLink>
                        <NavLink
                          to="/history"
                          className="flex items-center gap-sm px-4 py-2 text-sm text-on-surface hover:bg-surface-container-low"
                          onClick={() => setProfileOpen(false)}
                        >
                          <span className="material-symbols-outlined text-[16px] text-on-surface-variant">history</span>
                          History
                        </NavLink>
                        <div className="border-t border-outline-variant/20 my-1" />
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-sm w-full text-left px-4 py-2 text-sm text-error hover:bg-error-container/30"
                        >
                          <span className="material-symbols-outlined text-[16px]">logout</span>
                          Logout
                        </button>
                      </div>
                    </>
                  )}
                </div>

                {/* Hamburger — mobile only */}
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="md:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors active:scale-95"
                  aria-label="Toggle menu"
                >
                  <span className="material-symbols-outlined text-on-surface">
                    {menuOpen ? "close" : "menu"}
                  </span>
                </button>
              </>
            ) : (
              /* Not logged in — show login/register */
              <div className="flex gap-sm items-center">
                <NavLink
                  to="/login"
                  className="text-label-md text-primary font-semibold px-md py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  Login
                </NavLink>
                <NavLink
                  to="/register"
                  className="text-label-md text-on-primary bg-primary px-md py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Register
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Mobile Drawer ─────────────────────────────────────────────────── */}
      {/* Backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-72 z-50 bg-white shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-out ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-lg h-16 border-b border-outline-variant/20">
          <div className="flex items-center gap-sm">
            <img src={logo} alt="NutriLens" className="h-7 w-auto rounded-md" />
            <span className="font-bold text-primary">NutriLens</span>
          </div>
          <button
            onClick={() => setMenuOpen(false)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-on-surface-variant">close</span>
          </button>
        </div>

        {/* Profile section inside drawer */}
        {isLoggedIn && (
          <div className="flex items-center gap-md px-lg py-md border-b border-outline-variant/20 bg-surface-container-low">
            <div className="w-11 h-11 rounded-full overflow-hidden ring-2 ring-primary/20 shrink-0">
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&h=64"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="font-semibold text-on-surface text-sm">My Account</p>
              <p className="text-label-sm text-on-surface-variant">NutriLens User</p>
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-md px-sm">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-md px-md py-3 rounded-xl mb-xs transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-on-surface hover:bg-surface-container-high"
                }`
              }
            >
              <span
                className="material-symbols-outlined text-[20px]"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                {link.icon}
              </span>
              <span className="text-label-md">{link.label}</span>
            </NavLink>
          ))}

          {isLoggedIn && (
  <button
    onClick={() => {
      setShowChatbot(true);
      setMenuOpen(false);
    }}
    className="flex items-center gap-md px-md py-3 rounded-xl mb-xs transition-all text-on-surface hover:bg-surface-container-high w-full"
  >
    <span
      className="material-symbols-outlined text-[20px]"
      style={{ fontVariationSettings: "'FILL' 1" }}
    >
      smart_toy
    </span>
    <span className="text-label-md">Ask Nutrii</span>
  </button>
)}

          {/* History — extra link in drawer */}
          {isLoggedIn && (
            <NavLink
              to="/history"
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-md px-md py-3 rounded-xl mb-xs transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : "text-on-surface hover:bg-surface-container-high"
                }`
              }
            >
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                history
              </span>
              <span className="text-label-md">History</span>
            </NavLink>
          )}
        </nav>

        {/* Logout at bottom of drawer */}
        {isLoggedIn && (
          <div className="p-lg border-t border-outline-variant/20">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-sm h-12 rounded-xl border-2 border-error/30 text-error hover:bg-error-container/30 transition-all active:scale-95 font-label-md"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Logout
            </button>
          </div>
        )}
      </div>

      {/* ── Spacer ────────────────────────────────────────────────────────── */}
      <div className="h-16" />
    </>
  );
};

export default Navbar;