// src/Navigation.jsx
import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Dna, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useContext(AuthContext); // uses your provided AuthContext
  const user = auth?.user ?? null;
  const logout = auth?.logout ?? (() => {});
  const isAuthenticated = !!user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // sanitize displayed name: remove digits and domain, capitalize
  const sanitizeDisplayName = (raw) => {
    if (!raw) return "User";
    let base = raw.includes("@") ? raw.split("@")[0] : raw;
    base = base.split(" ")[0]; // pick first token
    base = base.replace(/[\d_\-]+/g, "").trim();
    if (!base) return "User";
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  // raw user string (support user.name, user.email or stored mock)
  const resolveRawUser = () => {
    if (user) return user.name || user.email || "";
    try {
      const raw = localStorage.getItem("app.mock.user");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.name || parsed?.email || "";
      }
    } catch {}
    return "";
  };

  const rawUserString = resolveRawUser();
  const displayName = sanitizeDisplayName(rawUserString);

  const navItems = [
    { label: "Home", id: "hero" },
    { label: "Gallery", id: "gallery" },
    { label: "Map", id: "map" },
    { label: "Process", id: "process" },
    { label: "Data", id: "data" },
    { label: "Analysis", id: "analysis" },
  ];

  // Scroll helper: if target exists on current page -> scroll; else navigate to "/" and pass state to scroll there.
  const scrollToSection = (sectionId) => {
    const el = document.getElementById(sectionId);
    const navEl = document.querySelector("nav");
    const navHeight = navEl?.getBoundingClientRect().height ?? 72;

    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
      window.scrollTo({ top, behavior: "smooth" });
      setIsMenuOpen(false);
      return;
    }

    // Not found: navigate to home and ask it to scroll after mount
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      // maybe content mounts a tick later
      setTimeout(() => scrollToSection(sectionId), 120);
    }
    setIsMenuOpen(false);
  };

  // NEW: unified handler for nav clicks. Special-case 'hero' (Home) so it goes to the very top.
  const handleNavClick = (sectionId) => {
    // Home should go to the top of the page
    if (sectionId === "hero") {
      if (location.pathname !== "/") {
        // navigate to home and tell it to scroll to top on mount
        navigate("/", { state: { scrollTo: "top" } });
      } else {
        // already on home: scroll to top immediately
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setIsMenuOpen(false);
      return;
    }

    // otherwise use the existing logic
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  const goToLogin = () => {
    navigate("/login", { state: { from: location.pathname } });
  };

  const handleLogout = async () => {
    try {
      const maybe = logout();
      if (maybe && typeof maybe.then === "function") await maybe;
      navigate("/");
    } catch (err) {
      console.error("Logout failed", err);
      navigate("/");
    } finally {
      setIsMenuOpen(false);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-xl" : ""}`}
      aria-label="Main navigation"
    >
      <div className="bg-white/95 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.03 }}>
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.9 }} className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-r from-teal-500 to-emerald-500 shadow-lg">
                <Dna className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-slate-900">SAGITTARIUS</h1>
            </motion.div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * idx }}
                  onClick={() => handleNavClick(item.id)}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 text-slate-700 hover:text-teal-600 hover:bg-teal-50"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* Auth area */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <motion.div className="flex items-center space-x-3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                  <span className="text-sm text-slate-700">Welcome, {displayName}</span>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="transition-all duration-200 hover:scale-105">
                    Logout
                  </Button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
                  <Button onClick={goToLogin} className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg transition-all" size="sm">
                    Login
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Mobile toggle */}
            <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setIsMenuOpen((s) => !s)} className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100" aria-label="Toggle menu">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Mobile menu */}
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: isMenuOpen ? 1 : 0, height: isMenuOpen ? "auto" : 0 }} transition={{ duration: 0.2 }} className="md:hidden overflow-hidden">
            <div className="bg-white rounded-lg shadow mt-2 border border-slate-200/50">
              <div className="py-4 px-6 space-y-4">
                {navItems.map((item, idx) => (
                  <motion.button key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.04 * idx }} onClick={() => { handleNavClick(item.id); }} className="block w-full text-left text-slate-700 py-2 px-3 rounded-lg hover:bg-teal-50">
                    {item.label}
                  </motion.button>
                ))}
                <div className="pt-4 border-t border-slate-200">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600">Welcome, {displayName}</p>
                      <Button onClick={() => { handleLogout(); setIsMenuOpen(false); }} variant="outline" size="sm" className="w-full">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => { goToLogin(); setIsMenuOpen(false); }} className="w-full bg-teal-600 hover:bg-teal-700" size="sm">
                      Login
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
}
