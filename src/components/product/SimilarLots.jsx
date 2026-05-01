import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const statusConfig = {
  first_bids: { label: "1stBid$™", className: "bg-primary/10 text-primary" },
  prisometer: { label: "PRI$OMETER™ Live", className: "bg-red-50 text-red-600" },
  scheduled: { label: "Upcoming", className: "bg-blue-50 text-blue-600" },
  sold: { label: "Sold", className: "bg-muted text-muted-foreground" },
};

function SimilarLotCard({ item }) {
  const status = statusConfig[item.status];
  const image = item.images?.[0];

  return (
    <Link to={`/item/${item.id}`} className="group block">
      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-muted mb-3">
        {image ? (
          <img
            src={image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
        )}
      </div>
      <div className="space-y-1">
        {status && (
          <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.className}`}>
            {status.label}
          </span>
        )}
        <p className="text-sm font-medium text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-snug">
          {item.title}
        </p>
        {item.prisometer_start_price && (
          <p className="text-xs text-muted-foreground">
            Starting at ${item.prisometer_start_price.toLocaleString("en-US")}
          </p>
        )}
      </div>
    </Link>
  );
}

export default function SimilarLots({ item }) {
  const { data: similarItems } = useQuery({
    queryKey: ["similar-lots", item?.category, item?.id],
    queryFn: () =>
      base44.entities.Item.filter({ category: item.category }, "-created_date", 9).then(
        (items) => items.filter((i) => i.id !== item.id).slice(0, 8)
      ),
    enabled: !!item?.category && !!item?.id,
  });

  if (!similarItems || similarItems.length === 0) return null;

  return (
    <div className="w-full border-t border-border pt-10 mt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Discover Also</p>
          <h2 className="font-serif text-2xl font-semibold text-foreground">Similar Lots</h2>
        </div>
        <Link
          to={`/browse?category=${item.category}`}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {similarItems.map((similar) => (
          <SimilarLotCard key={similar.id} item={similar} />
        ))}
      </div>
    </div>
  );
}