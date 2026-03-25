import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "../components/home/HeroSection";
import FeaturedItems from "../components/home/FeaturedItems";
import CategoryGrid from "../components/home/CategoryGrid";
import HowItWorksPreview from "../components/home/HowItWorksPreview";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: liveItems = [] } = useQuery({
    queryKey: ["items-live"],
    queryFn: () => base44.entities.Item.filter({ status: "prisometer" }, "-created_date", 8),
    initialData: [],
  });

  const { data: previewItems = [] } = useQuery({
    queryKey: ["items-preview"],
    queryFn: () => base44.entities.Item.filter({ status: "first_bids" }, "-created_date", 8),
    initialData: [],
  });

  const allFeatured = [...liveItems, ...previewItems].slice(0, 8);

  return (
    <div>
      <HeroSection />

      {/* Featured items */}
      <FeaturedItems
        items={allFeatured}
        title="Featured Live Sales"
        subtitle="Extraordinary objects with active bidding and live PRI$OMETER pricing"
      />

      {/* How it works */}
      <HowItWorksPreview />

      {/* Categories */}
      <CategoryGrid categoryImages={{
        fine_art: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/6d666716e_generated_9a429800.png",
        jewelry: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/c894b9de2_generated_3f9f3e97.png",
        watches: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/f02dc2c2e_generated_8f5e1cef.png",
        furniture: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/f8e1d8b42_generated_de31f2d3.png",
        decorative_arts: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/ed9fee0f0_generated_c17be360.png",
        antiques: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/12b23eaea_generated_2e276788.png",
      }} />

      {/* Editorial / Trust block */}
      <section className="py-20 md:py-28 bg-foreground text-background">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
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
                { icon: Shield, title: "Buyer Protection", desc: "Every purchase backed by our guarantee" },
                { icon: Star, title: "Vetted Sellers", desc: "Rigorously verified gallery partners" },
                { icon: Award, title: "No Buyer's Premium", desc: "Transparent fees, no hidden costs" },
                { icon: Shield, title: "Secure Payments", desc: "End-to-end encrypted transactions" },
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