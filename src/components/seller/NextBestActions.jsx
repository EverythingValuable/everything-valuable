import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Plus, UserCheck, ClipboardList, Tag } from "lucide-react";

const actions = [
  {
    icon: UserCheck,
    title: "Complete Seller Profile",
    desc: "Add your bio, specialties, logo, and payment details. A complete profile builds buyer confidence.",
    href: "/seller?view=profile",
    cta: "Edit Profile",
    accent: "bg-amber-50 border-amber-100 text-amber-700",
    iconBg: "bg-amber-100 text-amber-700",
  },
  {
    icon: ClipboardList,
    title: "Review Pending Listings",
    desc: "You have items awaiting platform review. Check for any notes or required updates.",
    href: "/seller?view=pending_review",
    cta: "View Pending",
    accent: "bg-blue-50 border-blue-100 text-blue-700",
    iconBg: "bg-blue-100 text-blue-700",
  },
  {
    icon: Plus,
    title: "Add a New Listing",
    desc: "Upload photos and configure your PRI$OMETER pricing in the guided listing studio.",
    href: "/seller/studio",
    cta: "Open Studio",
    accent: "bg-primary/5 border-primary/10 text-primary",
    iconBg: "bg-primary/10 text-primary",
  },
  {
    icon: Tag,
    title: "Link Personal Property to Real Estate",
    desc: "Tag furniture, art, and decorative objects directly inside your property listing photos — so buyers browsing your real estate can discover and bid on individual pieces.",
    href: "/hotspot-manager",
    cta: "Open Tag Manager",
    accent: "bg-emerald-50 border-emerald-100 text-emerald-700",
    iconBg: "bg-emerald-100 text-emerald-700",
  },
];

export default function NextBestActions() {
  return (
    <div>
      <h2 className="font-serif text-base font-semibold text-foreground mb-3">Next Best Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {actions.map(action => {
          const Icon = action.icon;
          return (
            <Link
              key={action.title}
              to={action.href}
              className={`group flex flex-col gap-3 rounded-2xl border p-5 hover:shadow-sm transition-all duration-200 ${action.accent}`}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${action.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold leading-snug mb-1">{action.title}</p>
                <p className="text-[11px] opacity-70 leading-relaxed">{action.desc}</p>
              </div>
              <span className="flex items-center gap-1 text-[11px] font-semibold opacity-60 group-hover:opacity-100 transition-opacity">
                {action.cta} <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}