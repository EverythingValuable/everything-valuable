import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, TrendingDown, Heart, Store } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

const navItems = [
  { label: "Home", icon: Home, path: "/" },
  { label: "Browse", icon: Search, path: "/browse" },
  { label: "Live", icon: TrendingDown, path: "/browse?status=prisometer" },
  { label: "Saved", icon: Heart, path: "/buyer?view=saves" },
  { label: "Sell", icon: Store, path: "/seller-access" },
];

export default function MobileBottomNav() {
  const location = useLocation();

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

  const isSeller = user?.role === "seller" || user?.role === "admin" || user?.role === "super_admin";

  const resolvedItems = navItems.map(item => {
    if (item.label === "Sell") {
      return { ...item, path: isSeller ? "/seller" : "/seller-access" };
    }
    return item;
  });

  const isActive = (path) => {
    const basePath = path.split("?")[0];
    if (basePath === "/" ) return location.pathname === "/";
    return location.pathname.startsWith(basePath);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border safe-area-bottom">
      <div className="flex items-stretch h-16">
        {resolvedItems.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={label}
              to={path}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-colors"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.5 : 1.75}
              />
              <span className={`text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
      {/* iOS safe area spacer */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
}