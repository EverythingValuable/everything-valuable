import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Heart, User, Menu, X, ChevronDown, Bookmark, Trophy, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const categories = [
  { label: "Fine Art", path: "/browse?category=fine_art" },
  { label: "Jewelry", path: "/browse?category=jewelry" },
  { label: "Watches", path: "/browse?category=watches" },
  { label: "Furniture", path: "/browse?category=furniture" },
  { label: "Decorative Arts", path: "/browse?category=decorative_arts" },
  { label: "Design", path: "/browse?category=design" },
  { label: "Antiques", path: "/browse?category=antiques" },
  { label: "Collectibles", path: "/browse?category=collectibles" },
  { label: "Luxury Goods", path: "/browse?category=luxury_goods" },
];

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const isRealProperty = location.pathname.startsWith("/real-property");
  const isPersonalProperty =
    location.pathname.startsWith("/personal-property") ||
    location.pathname.startsWith("/browse") ||
    location.pathname.startsWith("/item");

  const homeLink = isRealProperty
    ? "/real-property"
    : isPersonalProperty
    ? "/personal-property"
    : "/";

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ["seller-profile-nav", user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user?.email }),
    select: (d) => d[0],
    enabled: !!user?.email,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isSeller = user?.role === "seller" || user?.role === "admin" || user?.role === "super_admin";
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const isLanding = location.pathname === "/";
  const showMarketplaceLinks = isLanding || isPersonalProperty;

  const headerClass = isLanding
    ? "absolute top-0 left-0 right-0 z-50 bg-transparent"
    : "sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border";

  const navLinkClass = (active = false) =>
    `text-sm font-semibold transition-colors ${
      isLanding
        ? active
          ? "text-white"
          : "text-white/80 hover:text-white"
        : active
        ? "text-primary"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const iconLinkClass = isLanding
    ? "p-2 rounded-full hover:bg-white/10 transition-colors hidden md:flex items-center text-white/80 hover:text-white"
    : "p-2 rounded-full hover:bg-muted transition-colors hidden md:flex items-center text-muted-foreground hover:text-foreground";

  return (
    <header className={headerClass}>
      {/* Top utility bar — only shown on non-landing pages */}
      {!isLanding && (
        <div className="hidden md:flex items-center justify-between px-8 py-1.5 text-xs text-muted-foreground border-b border-border/50">
          <div className="flex gap-6">
            <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
            <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing &amp; Fees</Link>
            <Link to="/about" className="hover:text-foreground transition-colors">About</Link>
          </div>
          <div className="flex gap-6">
            <span>Transparent Fees</span>
            <span>•</span>
            <span>Verified Sellers</span>
            <span>•</span>
            <span>Seller-Defined Terms</span>
          </div>
        </div>
      )}

      {/* Main nav bar */}
      <div className="flex items-center justify-between px-5 md:px-10 h-16 md:h-20">
        <div className="flex items-center gap-8">
          {/* Mobile hamburger */}
          <button
            className="md:hidden p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen
              ? <X className={`w-5 h-5 ${isLanding ? "text-white" : ""}`} />
              : <Menu className={`w-5 h-5 ${isLanding ? "text-white" : ""}`} />
            }
          </button>

          {/* Logo */}
          <Link to={homeLink} className="flex items-center gap-2 shrink-0">
            <img
              src={isLanding ? "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/0c824150a_LOGOEV.png" : "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/3a2676053_LOGOEV.png"}
              alt="Everything Valuable Logo"
              className="h-8 md:h-10 w-auto"
            />
          </Link>

          {/* Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/personal-property" className={navLinkClass(isPersonalProperty)}>
              Personal Property
            </Link>
            <Link to="/real-property" className={navLinkClass(isRealProperty)}>
              Real Property
            </Link>

            {showMarketplaceLinks && (
              <Link to="/browse?status=prisometer" className={navLinkClass(false)}>
                Live Now
              </Link>
            )}

            {showMarketplaceLinks && (
              <div
                className="relative"
                onMouseEnter={() => setCategoriesOpen(true)}
                onMouseLeave={() => setCategoriesOpen(false)}
              >
                <button className={`flex items-center gap-1 ${navLinkClass(false)}`}>
                  Categories <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl py-2 z-50"
                    >
                      {categories.map((cat) => (
                        <Link
                          key={cat.path}
                          to={cat.path}
                          className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          {cat.label}
                        </Link>
                      ))}
                      <div className="border-t border-border mt-1 pt-1">
                        <Link
                          to="/browse"
                          className="block px-4 py-2.5 text-sm font-medium text-primary hover:bg-muted transition-colors"
                          onClick={() => setCategoriesOpen(false)}
                        >
                          View All
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {showMarketplaceLinks && (
              <Link
                to="/dealers"
                className={navLinkClass(location.pathname === "/dealers")}
              >
                Dealers
              </Link>
            )}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 md:gap-3">
          <Link to="/browse" className={iconLinkClass} aria-label="Search">
            <Search className="w-4 h-4" />
          </Link>
          <Link to="/buyer" className={iconLinkClass} aria-label="Watchlist">
            <Heart className="w-4 h-4" />
          </Link>

          {/* Sell With Us */}
          <Link to={isSeller ? "/seller" : "/seller-access"} className="hidden md:inline-flex">
            <Button
              variant="outline"
              size="sm"
              className={`text-xs font-semibold transition-all ${
                isLanding
                  ? "border-white/40 text-white bg-white/10 hover:bg-white hover:text-foreground"
                  : "border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
              }`}
            >
              {isSeller ? "Seller Dashboard" : "Sell With Us"}
            </Button>
          </Link>

          {/* Sign In button — unauthenticated only */}
          {!user && (
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className={`hidden md:inline-flex items-center justify-center h-9 px-4 text-xs font-bold transition-colors ${
                isLanding
                  ? "bg-white text-foreground hover:bg-white/90"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              Sign In / Join
            </button>
          )}

          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            {user && (
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className={`p-2 rounded-full transition-colors flex items-center gap-1 ${
                  isLanding ? "hover:bg-white/10 text-white/80 hover:text-white" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="w-4 h-4" />
              </button>
            )}
            {!user && (
              <button
                onClick={() => setProfileOpen((p) => !p)}
                className="p-2 rounded-full hover:bg-muted transition-colors md:hidden"
              >
                <User className={`w-4 h-4 ${isLanding ? "text-white" : "text-muted-foreground"}`} />
              </button>
            )}

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl py-2 z-50"
                >
                  {user ? (
                    <>
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium truncate">{user.full_name || "My Account"}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="py-1">
                        <DropLink to="/buyer?view=saves" icon={Bookmark} label="My Saves" onClick={() => setProfileOpen(false)} />
                        <DropLink to="/buyer?view=won" icon={Trophy} label="Won Items" onClick={() => setProfileOpen(false)} />
                        <DropLink to="/buyer?view=profile" icon={User} label="My Profile" onClick={() => setProfileOpen(false)} />
                      </div>
                      {isSeller && (
                        <>
                          <div className="border-t border-border my-1" />
                          <div className="py-1">
                            <DropLink to="/seller" icon={LayoutDashboard} label="Seller Dashboard" onClick={() => setProfileOpen(false)} highlight />
                          </div>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <div className="border-t border-border my-1" />
                          <div className="py-1">
                            <DropLink to="/admin" icon={ShieldCheck} label="Admin Dashboard" onClick={() => setProfileOpen(false)} highlight />
                          </div>
                        </>
                      )}
                      <div className="border-t border-border my-1" />
                      <button
                        onClick={() => { base44.auth.logout(); setProfileOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-muted transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <button
                        onClick={() => { base44.auth.redirectToLogin(window.location.href); setProfileOpen(false); }}
                        className="w-full h-9 bg-foreground text-background rounded-lg text-sm font-semibold hover:bg-foreground/80 transition-colors"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={() => { base44.auth.redirectToLogin(window.location.href); setProfileOpen(false); }}
                        className="w-full h-9 border border-border text-foreground rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
                      >
                        Create Account
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className={`md:hidden overflow-hidden border-t ${isLanding ? "border-white/20 bg-black/80 backdrop-blur-md" : "border-border bg-background"}`}
          >
            <nav className="px-6 py-4 space-y-1">
              <Link to="/personal-property" className={`block py-3 text-sm font-semibold border-b ${isLanding ? "border-white/15 text-white" : "border-border/50"}`} onClick={() => setMobileOpen(false)}>Personal Property</Link>
              <Link to="/real-property" className={`block py-3 text-sm font-semibold border-b ${isLanding ? "border-white/15 text-white" : "border-border/50"}`} onClick={() => setMobileOpen(false)}>Real Property</Link>
              <Link to="/browse?status=prisometer" className={`block py-3 text-sm font-semibold border-b ${isLanding ? "border-white/15 text-white" : "border-border/50 text-primary"}`} onClick={() => setMobileOpen(false)}>Live Now</Link>
              <Link to="/dealers" className={`block py-3 text-sm font-semibold border-b ${isLanding ? "border-white/15 text-white" : "border-border/50"}`} onClick={() => setMobileOpen(false)}>Dealers</Link>
              <div className={`pt-3 border-t space-y-2 ${isLanding ? "border-white/15" : "border-border/50"}`}>
                <Link to="/how-it-works" className={`block py-2 text-sm ${isLanding ? "text-white/70" : "text-muted-foreground"}`} onClick={() => setMobileOpen(false)}>How It Works</Link>
                <Link to="/pricing" className={`block py-2 text-sm ${isLanding ? "text-white/70" : "text-muted-foreground"}`} onClick={() => setMobileOpen(false)}>Pricing &amp; Fees</Link>
                <Link to={isSeller ? "/seller" : "/seller-access"} className={`block py-2 text-sm font-semibold ${isLanding ? "text-primary" : "text-primary"}`} onClick={() => setMobileOpen(false)}>
                  {isSeller ? "Seller Dashboard" : "Sell With Us"}
                </Link>
                <Link to="/buyer?view=saves" className={`block py-2 text-sm ${isLanding ? "text-white/70" : "text-muted-foreground"}`} onClick={() => setMobileOpen(false)}>My Saves</Link>
                <Link to="/buyer?view=won" className={`block py-2 text-sm ${isLanding ? "text-white/70" : "text-muted-foreground"}`} onClick={() => setMobileOpen(false)}>Won Items</Link>
                {isSeller && <Link to="/seller" className="block py-2 text-sm font-semibold text-primary" onClick={() => setMobileOpen(false)}>Seller Dashboard</Link>}
                {isAdmin && <Link to="/admin" className="block py-2 text-sm font-semibold text-purple-700" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>}
                {!user && (
                  <button
                    onClick={() => { base44.auth.redirectToLogin(window.location.href); setMobileOpen(false); }}
                    className="w-full mt-2 h-10 bg-primary text-white text-sm font-bold"
                  >
                    Sign In / Join
                  </button>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function DropLink({ to, icon: Icon, label, onClick, highlight }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted ${
        highlight ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}