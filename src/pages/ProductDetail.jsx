import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import ProductDetailContent from "@/components/shared/ProductDetailContent";

export default function ProductDetail() {
  const { id: itemId } = useParams();

  const { data: item } = useQuery({
    queryKey: ["item", itemId],
    queryFn: () => base44.entities.Item.filter({ id: itemId }).then(items => items[0]),
    enabled: !!itemId,
  });

  // Track recently viewed + increment view count
  useEffect(() => {
    if (itemId) {
      const stored = localStorage.getItem("recentlyViewed");
      const arr = stored ? JSON.parse(stored) : [];
      const filtered = arr.filter(id => id !== itemId);
      const updated = [itemId, ...filtered].slice(0, 50);
      localStorage.setItem("recentlyViewed", JSON.stringify(updated));

      // Increment view_count (fire-and-forget, once per session per item)
      const sessionKey = `viewed_${itemId}`;
      if (!sessionStorage.getItem(sessionKey)) {
        sessionStorage.setItem(sessionKey, "1");
        base44.entities.Item.filter({ id: itemId }).then(items => {
          if (items[0]) {
            base44.entities.Item.update(itemId, { view_count: (items[0].view_count || 0) + 1 });
          }
        });
      }
    }
  }, [itemId]);

  const categoryLabels = {
    fine_art: "Fine Art", jewelry: "Jewelry", watches: "Watches", furniture: "Furniture",
    decorative_arts: "Decorative Arts", design: "Design", antiques: "Antiques",
    collectibles: "Collectibles", luxury_goods: "Luxury Goods", other: "Other",
  };

  return (
    <div className="w-full">
      {/* Breadcrumb */}
      <div className="w-full px-4 md:px-4 py-3">
        <nav className="flex items-center gap-2 text-xs text-muted-foreground">
          <Link to="/personal-property" className="hover:text-foreground">Home</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/browse" className="hover:text-foreground">Browse</Link>
          {item && (
            <>
              <ChevronRight className="w-3 h-3" />
              <Link to={`/browse?category=${item.category}`} className="hover:text-foreground">
                {categoryLabels[item.category] || item.category}
              </Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-foreground truncate max-w-[200px]">{item.title}</span>
            </>
          )}
        </nav>
      </div>

      <ProductDetailContent itemId={itemId} />
    </div>
  );
}