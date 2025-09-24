import { useEffect, useState, useContext } from "react";
import type React from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Dna, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./login/AuthContext";

interface User {
  name?: string;
  email?: string;
}

interface AuthContextType {
  user?: User | null;
  logout?: () => Promise<void> | void;
}

interface NavItem {
  label: string;
  id: string;
}

export default function Navigation(): JSX.Element {
  const navigate = useNavigate();
  const location = useLocation();
  // Cast the imported AuthContext to the typed context for better typing here
  const auth = useContext(AuthContext as unknown as React.Context<AuthContextType | null>);
  const user = auth?.user ?? null;
  const logoutFn = auth?.logout ?? (() => {});
  const isAuthenticated = !!user;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const sanitizeDisplayName = (raw?: string | null): string => {
    if (!raw) return "User";
    let base = raw.includes("@") ? raw.split("@")[0] : raw;
    base = base.split(" ")[0];
    base = base.replace(/[[\d_\-]+/g, "").trim();
    if (!base) return "User";
    return base.charAt(0).toUpperCase() + base.slice(1);
  };

  const resolveRawUser = (): string => {
    if (user) return user.name || user.email || "";
    try {
      const raw = localStorage.getItem("app.mock.user");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed?.name || parsed?.email || "";
      }
    } catch (e) {
      // ignore parse errors
    }
    return "";
  };

  const rawUserString = resolveRawUser();
  const displayName = sanitizeDisplayName(rawUserString);

  const navItems: NavItem[] = [
    { label: "Home", id: "hero" },
    { label: "Gallery", id: "gallery" },
    { label: "Map", id: "map" },
    { label: "Process", id: "process" },
    { label: "Data", id: "data" },
    { label: "Analysis", id: "analysis" },
  ];

  const scrollToSection = (sectionId: string): void => {
    const el = document.getElementById(sectionId);
    const navEl = document.querySelector("nav");
    const navHeight = navEl?.getBoundingClientRect().height ?? 72;

    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - navHeight - 8;
      window.scrollTo({ top, behavior: "smooth" });
      setIsMenuOpen(false);
      return;
    }

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      // If element not found on the same page, try again shortly (e.g. after navigation/render)
      setTimeout(() => scrollToSection(sectionId), 120);
    }
    setIsMenuOpen(false);
  };

  const handleNavClick = (sectionId: string): void => {
    if (sectionId === "hero") {
      if (location.pathname !== "/") {
        navigate("/", { state: { scrollTo: "top" } });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      setIsMenuOpen(false);
      return;
    }
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  const goToLogin = (): void => {
    navigate("/login", { state: { from: location.pathname } });
  };

  const handleLogout = async (): Promise<void> => {
    try {
      const maybe = logoutFn();
      if (maybe instanceof Promise) await maybe;
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-2xl backdrop-blur-sm" : "backdrop-blur-sm"}`}
      aria-label="Main navigation"
      style={{
        fontFamily: "'Poppins', Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto",
      }}
    >
      <div className="bg-white/80 border-b border-indigo-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo with full 360° rotation on hover */}
            <motion.div className="flex items-center space-x-3" whileHover={{ scale: 1.03 }}>
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.9, ease: "easeInOut" }}
                style={{ transformOrigin: "50% 50%" }}
                className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-r from-indigo-600 to-violet-600 shadow-md"
              >
                <Dna className="w-6 h-6 text-white" />
              </motion.div>

              <div className="flex flex-col leading-tight">
                <h1 className="text-2xl font-semibold text-slate-900 tracking-wide">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-violet-600">SAGITTARIUS</span>
                </h1>
                <span className="text-xs text-slate-500 -mt-0.5">Species identification & analysis</span>
              </div>
            </motion.div>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center space-x-2">
              {navItems.map((item, idx) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * idx }}
                  onClick={() => handleNavClick(item.id)}
                  className="px-3 py-2 rounded-lg font-medium transition-all duration-200 text-slate-700 hover:text-violet-700 hover:bg-violet-50 focus:outline-none focus:ring-2 focus:ring-violet-200"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* Auth & actions */}
            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <motion.div className="flex items-center space-x-3" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="text-sm text-slate-700">Welcome, <span className="font-medium text-slate-900">{displayName}</span></div>
                  <Button onClick={handleLogout} variant="outline" size="sm" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                    Logout
                  </Button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.12 }}>
                  <Button onClick={goToLogin} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm" size="sm">
                    Login
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Mobile toggle */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setIsMenuOpen((s) => !s)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </motion.button>
          </div>

          {/* Mobile menu */}
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isMenuOpen ? 1 : 0, height: isMenuOpen ? "auto" : 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden"
          >
            <div className="bg-white rounded-lg shadow mt-3 border border-indigo-50/60">
              <div className="py-4 px-5 space-y-3">
                {navItems.map((item, idx) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.03 * idx }}
                    onClick={() => { handleNavClick(item.id); }}
                    className="block w-full text-left text-slate-700 py-2 px-3 rounded-lg hover:bg-violet-50 transition"
                  >
                    {item.label}
                  </motion.button>
                ))}

                <div className="pt-3 border-t border-indigo-50/80">
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600">Welcome, <span className="font-medium text-slate-900">{displayName}</span></p>
                      <Button onClick={() => { handleLogout(); setIsMenuOpen(false); }} variant="outline" size="sm" className="w-full border-indigo-200 text-indigo-700">
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => { goToLogin(); setIsMenuOpen(false); }} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white" size="sm">
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
