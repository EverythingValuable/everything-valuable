import React from "react";
import { Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ShieldAlert } from "lucide-react";

/**
 * RoleGuard — wraps a route and blocks access unless the user has an allowed role.
 *
 * Props:
 *   allowedRoles: string[]  — e.g. ["seller","admin","super_admin"]
 *   fallback: "redirect" | "message"  — default "redirect"
 *   redirectTo: string  — default "/seller-access"
 */
export default function RoleGuard({ children, allowedRoles = [], fallback = "redirect", redirectTo = "/seller-access" }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    retry: false,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Not logged in at all
  if (!user) {
    base44.auth.redirectToLogin(window.location.href);
    return null;
  }

  // Suspended / locked accounts
  if (user.account_status && !["active", undefined, null].includes(user.account_status)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <ShieldAlert className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="font-serif text-2xl font-semibold mb-2">Account Suspended</h2>
          <p className="text-muted-foreground">Your account has been suspended. Please contact support for assistance.</p>
        </div>
      </div>
    );
  }

  const userRole = user.role || "buyer";
  const hasAccess = allowedRoles.includes(userRole);

  if (!hasAccess) {
    if (fallback === "message") {
      return (
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <ShieldAlert className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-2xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">You don't have permission to view this page.</p>
          </div>
        </div>
      );
    }
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}