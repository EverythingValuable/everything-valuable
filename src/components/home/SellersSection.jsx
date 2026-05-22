import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function SellersSection() {
  return (
    <section className="py-16 md:py-24 bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text Content */}
          <div>
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
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 rounded-full h-12 px-8">
                  Apply to Sell <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/browse">
                <Button
                  variant="outline"
                  className="border-background/30 text-background hover:bg-background/10 gap-2 rounded-full h-12 px-8"
                >
                  Explore the Marketplace <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Image Gallery */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              {/* Large sculpture image */}
              <div className="col-span-1 row-span-2">
                <img
                  src="https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=400&h=600&q=80&fit=crop"
                  alt="Marble sculpture"
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                />
              </div>

              {/* Smaller painting image */}
              <div className="col-span-1">
                <img
                  src="https://images.unsplash.com/photo-1578301978162-7aae4d755744?w=400&h=300&q=80&fit=crop"
                  alt="Classical painting"
                  className="w-full h-full object-cover rounded-lg shadow-xl"
                />
              </div>

              {/* Decorative space */}
              <div className="col-span-1 bg-background/10 rounded-lg flex items-center justify-center min-h-[140px]">
                <div className="text-center">
                  <p className="text-background/60 text-sm font-semibold">
                    Premium Artwork
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}