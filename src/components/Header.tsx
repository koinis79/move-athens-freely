import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, ShoppingCart } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();

  const displayName =
    user?.user_metadata?.full_name ||
    user?.email?.split("@")[0] ||
    "Account";

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      role="banner"
      className={`sticky top-0 z-50 w-full bg-background/95 transition-shadow duration-300 ${
        !menuOpen ? "backdrop-blur-sm" : ""
      } ${scrolled ? "shadow-md" : "shadow-none"}`}
    >
      <div className="container flex h-[var(--header-height)] items-center justify-between">
        <Link to="/" className="font-heading text-xl font-extrabold text-primary tracking-tight" aria-label="Moveability — Home">
          Moveability
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-muted focus-visible:bg-muted ${
                location.pathname.startsWith(link.to) ? "text-primary font-semibold" : "text-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setLang(lang === "EN" ? "GR" : "EN")}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label={`Switch language to ${lang === "EN" ? "Greek" : "English"}`}
          >
            {lang === "EN" ? "EN" : "GR"} | {lang === "EN" ? "GR" : "EN"}
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="max-w-[120px] truncate text-foreground/80">{displayName}</span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="gap-2"><LayoutDashboard className="h-4 w-4" /> My Bookings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="gap-2"><User className="h-4 w-4" /> Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="gap-2 text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Sign In
            </Link>
          )}

          <Link
            to="/cart"
            className="relative p-2 rounded-lg border border-border hover:bg-muted transition-colors"
            aria-label={`Cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          <Link
            to="/equipment"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Book Now
          </Link>
        </div>

        {/* Mobile cart icon */}
        <Link
          to="/cart"
          className="lg:hidden relative p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label={`Cart${itemCount > 0 ? `, ${itemCount} item${itemCount !== 1 ? "s" : ""}` : ""}`}
        >
          <ShoppingCart className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {itemCount > 9 ? "9+" : itemCount}
            </span>
          )}
        </Link>

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
        className={`fixed inset-y-0 right-0 z-50 w-72 bg-background shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setMenuOpen(false)} className="p-2 rounded-lg hover:bg-muted" aria-label="Close menu">
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="flex flex-col px-6 gap-1" aria-label="Mobile navigation">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-3 rounded-lg font-medium transition-colors hover:bg-muted ${
                location.pathname.startsWith(link.to) ? "text-primary font-semibold" : "text-foreground/80"
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
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="px-3 py-3 text-left rounded-lg font-medium hover:bg-muted transition-colors flex items-center gap-2"
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>

          <Link to="/cart" className="px-3 py-3 rounded-lg font-medium hover:bg-muted transition-colors flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Cart
            {itemCount > 0 && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {itemCount > 9 ? "9+" : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/dashboard" className="px-3 py-3 rounded-lg font-medium hover:bg-muted transition-colors">
                My Bookings
              </Link>
              <button
                onClick={signOut}
                className="px-3 py-3 text-left rounded-lg font-medium text-destructive hover:bg-muted transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" className="px-3 py-3 rounded-lg font-medium hover:bg-muted transition-colors">
              Sign In
            </Link>
          )}

          <Link
            to="/equipment"
            className="mt-2 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors"
          >
            Book Now
          </Link>
        </nav>
      </div>

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
