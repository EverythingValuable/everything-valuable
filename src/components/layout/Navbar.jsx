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

  // Determine current section: real-property or personal-property
  const isRealProperty = location.pathname.startsWith("/real-property");
  const isPersonalProperty = location.pathname.startsWith("/personal-property") || 
                             location.pathname.startsWith("/browse") ||
                             location.pathname.startsWith("/item");

  // Home link redirects to appropriate section home
  const homeLink = isRealProperty ? "/real-property" : (isPersonalProperty ? "/personal-property" : "/");

  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ["seller-profile-nav", user?.email],
    queryFn: () => base44.entities.SellerProfile.filter({ user_email: user?.email }),
    select: d => d[0],
    enabled: !!user?.email,
  });

  // Close profile dropdown on outside click
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

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="hidden md:flex items-center justify-between px-8 py-1.5 text-xs text-muted-foreground border-b border-border/50">
        <div className="flex gap-6">
          <Link to="/how-it-works" className="hover:text-foreground transition-colors">How It Works</Link>
          <Link to="/pricing" className="hover:text-foreground transition-colors">Pricing & Fees</Link>
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

      {/* Main nav */}
      <div className="flex items-center justify-between px-6 md:px-8 h-16 md:h-20">
        <div className="flex items-center gap-8">
          <button className="hidden p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to={homeLink} className="flex items-center gap-2">
            <img src="https://media.base44.com/images/public/69beac1c3231aaeb891946d5/3a2676053_LOGOEV.png" alt="Everything Valuable Logo" className="h-8 md:h-10 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {/* Real Property Link */}
            <Link to="/real-property" className={`text-sm font-medium transition-colors ${isRealProperty ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Real Property
            </Link>

            {/* Personal Property - Categories */}
            {isPersonalProperty && (
              <div className="relative" onMouseEnter={() => setCategoriesOpen(true)} onMouseLeave={() => setCategoriesOpen(false)}>
                <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  Categories <ChevronDown className="w-3.5 h-3.5" />
                </button>
                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}
                      className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-xl py-2 z-50">
                      {categories.map(cat => (
                        <Link key={cat.path} to={cat.path}
                          className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          onClick={() => setCategoriesOpen(false)}>
                          {cat.label}
                        </Link>
                      ))}
                      <div className="border-t border-border mt-1 pt-1">
                        <Link to="/browse" className="block px-4 py-2.5 text-sm font-medium text-primary hover:bg-muted transition-colors"
                          onClick={() => setCategoriesOpen(false)}>
                          View All
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Personal Property Link */}
            <Link to="/personal-property" className={`text-sm font-medium transition-colors ${isPersonalProperty ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
              Personal Property
            </Link>

            {isPersonalProperty && (
              <>
                <Link to="/browse?status=prisometer" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                  Live Now
                </Link>
                <Link to="/dealers" className={`text-sm font-medium transition-colors ${location.pathname === "/dealers" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}>
                  Dealers
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/browse" className="p-2 rounded-full hover:bg-muted transition-colors hidden md:flex">
            <Search className="w-4 h-4 text-muted-foreground" />
          </Link>
          <Link to="/buyer" className="p-2 rounded-full hover:bg-muted transition-colors hidden md:flex">
            <Heart className="w-4 h-4 text-muted-foreground" />
          </Link>

          {/* Sell With Us — approved sellers go to dashboard, others go to apply */}
          <Link to={isSeller ? "/seller" : "/seller-access"} className="hidden md:inline-flex">
            <Button variant="outline" size="sm" className="text-xs font-medium border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
              {isSeller ? "Seller Dashboard" : "Sell With Us"}
            </Button>
          </Link>

          {/* Sign in / Join — shown when not authenticated */}
          {!user && (
            <button
              onClick={() => base44.auth.redirectToLogin(window.location.href)}
              className="hidden md:inline-flex items-center justify-center h-8 px-4 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Sign In / Join
            </button>
          )}

          {/* Profile dropdown — only shown when authenticated */}
          <div className="relative" ref={profileRef}>
            {user && <button onClick={() => setProfileOpen(p => !p)}
              className="p-2 rounded-full hover:bg-muted transition-colors flex items-center gap-1">
              <User className="w-4 h-4 text-muted-foreground" />
            </button>}
            {!user && <button onClick={() => setProfileOpen(p => !p)}
              className="p-2 rounded-full hover:bg-muted transition-colors md:hidden">
              <User className="w-4 h-4 text-muted-foreground" />
            </button>}

            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.15 }}
                  className="absolute top-full right-0 mt-2 w-52 bg-card border border-border rounded-xl shadow-xl py-2 z-50">

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
                      <button onClick={() => { base44.auth.logout(); setProfileOpen(false); }}
                        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-destructive hover:bg-muted transition-colors">
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
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="md:hidden overflow-hidden border-t border-border">
            <nav className="px-6 py-4 space-y-1">
              <Link to="/real-property" className="block py-3 text-sm font-medium border-b border-border/50" onClick={() => setMobileOpen(false)}>Real Property</Link>
              <Link to="/personal-property" className="block py-3 text-sm font-medium border-b border-border/50" onClick={() => setMobileOpen(false)}>Personal Property</Link>
              <Link to="/dealers" className="block py-3 text-sm font-medium border-b border-border/50" onClick={() => setMobileOpen(false)}>Dealers</Link>
              {isPersonalProperty && categories.map(cat => (
                <Link key={cat.path} to={cat.path} className="block py-2.5 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>
                  {cat.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-border/50 space-y-2">
                <Link to="/how-it-works" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>How It Works</Link>
                <Link to="/pricing" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Pricing & Fees</Link>
                <Link to="/sell" className="block py-2 text-sm font-medium text-primary" onClick={() => setMobileOpen(false)}>Sell With Us</Link>
                <Link to="/buyer?view=saves" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>My Saves</Link>
                <Link to="/buyer?view=won" className="block py-2 text-sm text-muted-foreground" onClick={() => setMobileOpen(false)}>Won Items</Link>
                {isSeller && <Link to="/seller" className="block py-2 text-sm font-medium text-primary" onClick={() => setMobileOpen(false)}>Seller Dashboard</Link>}
                {isAdmin && <Link to="/admin" className="block py-2 text-sm font-medium text-purple-700" onClick={() => setMobileOpen(false)}>Admin Dashboard</Link>}
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
    <Link to={to} onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-muted ${highlight ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}>
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}