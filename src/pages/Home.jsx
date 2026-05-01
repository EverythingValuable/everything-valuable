import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "../components/home/HeroSection";
import FeaturedItems from "../components/home/FeaturedItems";
import CategoryCircles from "../components/home/CategoryCircles";
import HowItWorksPreview from "../components/home/HowItWorksPreview";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Award, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const { data: liveItems = [] } = useQuery({
    queryKey: ["items-live"],
    queryFn: () => base44.entities.Item.filter({ status: "prisometer" }, "-created_date", 8),
    initialData: [],
  });

  const { data: previewItems = [] } = useQuery({
    queryKey: ["items-preview"],
    queryFn: () => base44.entities.Item.filter({ status: "first_bids" }, "-created_date", 10),
    initialData: [],
  });

  const allFeatured = [...liveItems, ...previewItems].slice(0, 16);

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
      />

      {/* View All Button */}
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 py-6 text-center">
        <Link to="/browse">
          <Button variant="outline" className="gap-2 rounded-full h-11 px-8">
            View All <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>

      {/* How it works */}
      <HowItWorksPreview />

      {/* Editorial / Trust block */}
      <section className="py-20 md:py-28 bg-foreground text-background">
        <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why Everything Valuable</span>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold leading-tight">
                The Future of<br />Luxury Commerce
              </h2>
              <p className="text-background/70 leading-relaxed">
                We've reimagined how extraordinary objects change hands. No buyer's premium. 
                No hidden fees. Just our proprietary PRI$OMETER™ technology finding the true 
                value — transparently.
              </p>
              <Link to="/how-it-works">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-full h-11 px-8 mt-4">
                  Discover Our Approach <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Seller-Defined Terms", desc: "Shipping, payment, and fulfillment set by each seller" },
                { icon: Star, title: "Verified Sellers", desc: "Sellers are reviewed and approved before listing" },
                { icon: Award, title: "No Buyer's Premium", desc: "Transparent service fee with a built-in credit" },
                { icon: Shield, title: "Platform-Facilitated", desc: "Tools to support invoicing and the transaction process" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 rounded-xl border border-background/10 bg-background/5"
                >
                  <item.icon className="w-5 h-5 text-primary mb-3" />
                  <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                  <p className="text-xs text-background/50">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

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