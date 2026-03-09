import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Menu, X, Instagram, Mail } from "lucide-react";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import { cn } from "./utils";

function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [about, setAbout] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    fetch("/api/settings/about_content")
      .then(res => res.json())
      .then(data => setAbout(data));
  }, []);

  const navLinks = [
    { name: "Projects", path: "/projects" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#FFFDF0]/80 backdrop-blur-sm border-b border-black/5">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="text-xl font-medium tracking-tighter">
          {about?.name || "Eunpyo"}
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex space-x-12">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                "text-sm uppercase tracking-widest transition-colors hover:text-black/50",
                location.pathname === link.path ? "text-black font-semibold" : "text-black/60"
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Mobile Nav Toggle */}
        <button className="md:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-20 left-0 w-full bg-[#FFFDF0] border-b border-black/5 md:hidden"
          >
            <div className="flex flex-col p-6 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className="text-lg uppercase tracking-widest text-black/60 hover:text-black"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

function Footer() {
  const [about, setAbout] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings/about_content")
      .then(res => res.json())
      .then(data => setAbout(data));
  }, []);

  return (
    <footer className="py-20 px-6 border-t border-black/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center space-y-8 md:space-y-0 text-black/40 text-xs uppercase tracking-widest">
        <div>© {new Date().getFullYear()} {about?.name || "Eunpyo"}. ALL RIGHTS RESERVED.</div>
        <div className="flex space-x-8">
          <Link to="/admin" className="hover:text-black transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#FFFDF0] font-sans text-black selection:bg-black selection:text-white">
        <Navigation />
        <main className="pt-20">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/projects/:id" element={<ProjectDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </Router>
  );
}
