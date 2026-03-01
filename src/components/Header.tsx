import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Equipment", to: "/equipment" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Accessible Athens", to: "/accessible-athens" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [lang, setLang] = useState<"EN" | "GR">("EN");
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      role="banner"
      className={`sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "shadow-none"
      }`}
    >
      <div className="container flex h-[var(--header-height)] items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="font-heading text-xl font-extrabold text-primary tracking-tight"
          aria-label="Moveability — Home"
        >
          Moveability
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted focus-visible:bg-muted ${
                location.pathname.startsWith(link.to)
                  ? "text-primary font-semibold"
                  : "text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "EN" ? "GR" : "EN")}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label={`Switch language to ${lang === "EN" ? "Greek" : "English"}`}
          >
            {lang === "EN" ? "EN" : "GR"} | {lang === "EN" ? "GR" : "EN"}
          </button>
          <Link
            to="/login"
            className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/equipment"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile slide-in menu */}
      <div
        id="mobile-menu"
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-background shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-end p-4">
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 rounded-lg hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col px-6 gap-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-3 rounded-lg font-medium transition-colors hover:bg-muted ${
                location.pathname.startsWith(link.to)
                  ? "text-primary font-semibold"
                  : "text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <hr className="my-3 border-border" />
          <button
            onClick={() => setLang(lang === "EN" ? "GR" : "EN")}
            className="px-3 py-3 text-left rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Language: {lang}
          </button>
          <Link
            to="/login"
            className="px-3 py-3 rounded-lg font-medium hover:bg-muted transition-colors"
          >
            Sign In
          </Link>
          <Link
            to="/equipment"
            className="mt-2 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Book Now
          </Link>
        </nav>
      </div>

      {/* Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
};

export default Header;
