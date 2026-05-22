import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "../components/home/HeroSection";
import FeaturedItems from "../components/home/FeaturedItems";
import CategoryCircles from "../components/home/CategoryCircles";
import HowItWorksPreview from "../components/home/HowItWorksPreview";
import RecentlyViewed from "../components/home/RecentlyViewed";
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

      {/* Value Proposition — Buyer / Seller / Dealer */}
      <section className="py-16 md:py-20 bg-background border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                label: "For Buyers",
                copy: "Discover valuable items through a more interactive pricing experience. Watch the price move in real time, place a bid, or claim the item at the current price."
              },
              {
                label: "For Sellers",
                copy: "Reach serious buyers without the excessive costs of traditional auction platforms. Transparent fees, no buyer's premium, and tools built for the modern dealer."
              },
              {
                label: "For Dealers",
                copy: "Turn dormant inventory into active opportunities. List once, reach a curated audience, and let the PRI$OMETER™ do the work of finding the right price."
              }
            ].map(({ label, copy }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="space-y-3"
              >
                <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary">{label}</p>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{copy}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRI$OMETER Explainer */}
      <section className="py-20 md:py-28 bg-foreground text-background">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary block mb-3">What Makes Everything Valuable Different</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight max-w-xl">
              The PRI$OMETER™ — a smarter way to price.
            </h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {[
              { num: "01", title: "The price moves.", body: "The PRI$OMETER starts high and gradually descends over time — creating urgency without the chaos of a live auction room." },
              { num: "02", title: "Buyers can claim the item.", body: "At any point, a buyer can purchase at the current PRI$OMETER price. First to act wins." },
              { num: "03", title: "Bids create pressure.", body: "Buyers can place bids below the current price. A strong bid signals real intent and influences how the market responds." },
              { num: "04", title: "The market decides.", body: "When the descending price meets the highest acceptable bid, the item can sell — transparently, with no hidden reserve games." },
            ].map(({ num, title, body }, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="border-t border-background/20 pt-6 space-y-3"
              >
                <span className="text-[11px] font-bold tracking-[0.18em] text-background/30">{num}</span>
                <h4 className="font-semibold text-base text-background">{title}</h4>
                <p className="text-sm text-background/60 leading-relaxed">{body}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-12">
            <Link to="/how-it-works">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-10 px-7 text-sm font-semibold">
                See the Full Walkthrough <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured items */}
      <FeaturedItems
        items={allFeatured}
        title="Featured Live Sales"
        subtitle=""
        isLoading={featuredLoading}
      />

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