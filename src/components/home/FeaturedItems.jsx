import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ItemCard from "../shared/ItemCard";

export default function FeaturedItems({ liveItems = [], previewItems = [], title = "Featured Live Sales", subtitle, isLoading }) {
  const [activeTab, setActiveTab] = useState("all");

  const allItems = [...liveItems, ...previewItems].slice(0, 10);
  const displayItems = (activeTab === "prisometer" ? liveItems : activeTab === "first_bids" ? previewItems : allItems).slice(0, 10);

  if (!isLoading && !allItems.length) return null;

  if (isLoading) return (
    <section className="py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-10" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="aspect-[4/5] rounded-lg bg-muted" />
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle tabs */}
            <div className="flex items-center bg-secondary rounded-full p-1 text-sm">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 rounded-full font-medium transition-colors ${activeTab === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab("first_bids")}
                className={`px-4 py-1.5 rounded-full font-medium transition-colors ${activeTab === "first_bids" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                1stBid$™
              </button>
              <button
                onClick={() => setActiveTab("prisometer")}
                className={`px-4 py-1.5 rounded-full font-medium transition-colors ${activeTab === "prisometer" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                PRI$OMETER™
              </button>
            </div>
            <Link to="/browse">
              <Button variant="ghost" className="gap-2 text-sm text-muted-foreground hover:text-foreground hidden md:flex">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {displayItems.length === 0 ? (
          <p className="text-muted-foreground text-sm py-8 text-center">No items in this phase right now.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {displayItems.slice(0, 15).map((item, i) => (
              <ItemCard key={item.id} item={item} index={i} />
            ))}
          </div>
        )}

        <div className="mt-8 text-center md:hidden">
          <Link to="/browse">
            <Button variant="outline" className="gap-2 rounded-full">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}