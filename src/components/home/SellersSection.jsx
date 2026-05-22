import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function SellersSection() {
  return (
    <section className="py-16 md:py-24 bg-foreground text-background relative overflow-hidden">
      {/* Background image with low opacity */}
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <img
          src="https://media.base44.com/images/public/69beac1c3231aaeb891946d5/4df491702_Banner5.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div>
          {/* Text Content */}
          <p className="text-accent font-bold text-sm tracking-widest mb-4">
            FOR SELLERS
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-background mb-6 leading-tight">
            Bring Exceptional Property to a Better Market
          </h2>
          <p className="text-background/80 leading-relaxed mb-8 text-lg">
            Everything Valuable gives galleries, dealers, collectors, and estates a more controlled, transparent, and cost-effective way to present and sell important personal property online.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/sell">
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 rounded-full h-12 px-6 whitespace-nowrap">
                Apply to Sell <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/browse">
              <Button
                className="bg-background text-foreground hover:bg-background/90 gap-2 rounded-full h-12 px-6 whitespace-nowrap"
              >
                Explore the Marketplace <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}