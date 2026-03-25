import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import ItemCard from "../shared/ItemCard";

export default function FeaturedItems({ items, title = "Featured Live Sales", subtitle }) {
  if (!items?.length) return null;

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">{title}</h2>
            {subtitle && <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>}
          </div>
          <Link to="/browse">
            <Button variant="ghost" className="gap-2 text-sm text-muted-foreground hover:text-foreground hidden md:flex">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {items.slice(0, 15).map((item, i) => (
            <ItemCard key={item.id} item={item} index={i} />
          ))}
        </div>

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