import React from "react";
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