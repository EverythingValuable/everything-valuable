import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "../components/home/HeroSection";
import FeaturedItems from "../components/home/FeaturedItems";
import CategoryCircles from "../components/home/CategoryCircles";
import HowItWorksPreview from "../components/home/HowItWorksPreview";
import RecentlyViewed from "../components/home/RecentlyViewed";
import PrisometerExplainer from "../components/home/PrisometerExplainer";
import SellersSection from "../components/home/SellersSection";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: liveItems = [], isLoading: loadingLive } = useQuery({
    queryKey: ["items-live"],
    queryFn: () => base44.entities.Item.filter({ status: "prisometer" }, "-created_date", 8),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: previewItems = [], isLoading: loadingPreview } = useQuery({
    queryKey: ["items-preview"],
    queryFn: () => base44.entities.Item.filter({ status: "first_bids" }, "-created_date", 10),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const allFeatured = [...(liveItems || []), ...(previewItems || [])].slice(0, 16);
  const featuredLoading = loadingLive || loadingPreview;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div>
      <HeroSection />
      <CategoryCircles />
      <RecentlyViewed />

      {/* Search Bar */}
      <section className="py-2 md:py-3 bg-background">
        <div className="max-w-3xl mx-auto px-4 md:px-6">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3 md:py-4 shadow-sm hover:border-primary/40 transition-colors focus-within:ring-1 focus-within:ring-primary">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Search Everything Valuable"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm md:text-base"
              />
              <Button
                type="submit"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 h-9 shrink-0 rounded-lg"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Featured items */}
      <FeaturedItems
        items={allFeatured}
        title="Featured Live Sales"
        subtitle=""
        isLoading={featuredLoading}
      />

      {/* Prisometer Explainer */}
      <PrisometerExplainer />

      {/* Sellers Section */}
      <SellersSection />

      {/* How it works */}
      <HowItWorksPreview />

      {/* CTA */}
      <section className="py-20 md:py-28 text-center">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="font-serif text-3xl md:text-5xl font-semibold text-foreground">
            Sell With Everything Valuable
          </h2>
          <p className="text-muted-foreground mt-4 mb-8 leading-relaxed">
            Join thousands of galleries, dealers, and collectors using Everything Valuable 
            to reach a global audience of discerning buyers.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/sell">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-full h-12 px-8">
                Become a Seller <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/browse">
              <Button size="lg" variant="outline" className="gap-2 rounded-full h-12 px-8">
                Browse the Market
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}