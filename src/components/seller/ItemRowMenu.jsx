import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { MoreHorizontal, Copy, ExternalLink, Trash2, RefreshCw, Archive } from "lucide-react";

export default function ItemRowMenu({ item }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDuplicate = async () => {
    setOpen(false);
    const { id, created_date, updated_date, created_by, status, bid_count, highest_bid,
      highest_bidder_email, current_price, sold_price, sold_to_email, sold_via,
      view_count, watcher_count, ...rest } = item;
    await base44.entities.Item.create({ ...rest, title: `${item.title} (Copy)`, status: "draft" });
    queryClient.invalidateQueries({ queryKey: ["seller-items"] });
  };

  const handleDelete = async () => {
    setOpen(false);
    if (!window.confirm(`Delete "${item.title}"? This cannot be undone.`)) return;
    await base44.entities.Item.delete(item.id);
    queryClient.invalidateQueries({ queryKey: ["seller-items"] });
  };

  const menuItems = [
    item.status !== "sold" && {
      label: "Edit Listing",
      href: `/seller/studio?edit=${item.id}`,
      icon: null,
    },
    {
      label: "View Public Page",
      href: `/item/${item.id}`,
      icon: ExternalLink,
      external: true,
    },
    { divider: true },
    {
      label: "Duplicate as Draft",
      icon: Copy,
      onClick: handleDuplicate,
    },
    item.status === "unsold" && {
      label: "Relist Item",
      href: `/seller/studio?edit=${item.id}&relist=1`,
      icon: RefreshCw,
    },
    { divider: true },
    {
      label: "Delete Listing",
      icon: Trash2,
      onClick: handleDelete,
      danger: true,
    },
  ].filter(Boolean);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-50 w-48 bg-white border border-border rounded-xl shadow-lg py-1 text-sm">
          {menuItems.map((mi, i) => {
            if (mi.divider) return <div key={i} className="my-1 border-t border-border/50" />;
            const Icon = mi.icon;
            const inner = (
              <span className={`flex items-center gap-2.5 px-3 py-2 w-full text-left transition-colors ${
                mi.danger
                  ? "text-destructive hover:bg-destructive/5"
                  : "text-foreground hover:bg-secondary"
              }`}>
                {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
                {mi.label}
              </span>
            );
            if (mi.href) return (
              <Link key={i} to={mi.href} onClick={() => setOpen(false)}>{inner}</Link>
            );
            return (
              <button key={i} onClick={mi.onClick} className="w-full">{inner}</button>
            );
          })}
        </div>
      )}
    </div>
  );
}