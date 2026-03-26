import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Star, Award } from "lucide-react";
import { motion } from "framer-motion";
import REHeroSection from "../components/realestate/REHeroSection";
import RealEstateSearchBar from "../components/realestate/RealEstateSearchBar";
import REFeaturedListings from "../components/realestate/REFeaturedListings";
import RECategoryGrid from "../components/realestate/RECategoryGrid";
import REHowItWorksPreview from "../components/realestate/REHowItWorksPreview";

export default function RealEstateHome() {
  return (
    <div>
      <REHeroSection />

      {/* Search Bar */}
      <RealEstateSearchBar />

      {/* Featured listings */}
      <REFeaturedListings />

      {/* How it works */}
      <REHowItWorksPreview />

      {/* Property Types */}
      <RECategoryGrid />

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
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Why Everything Valuable Real Estate</span>
              <h2 className="font-serif text-3xl md:text-5xl font-semibold leading-tight">
                Real Estate Deserves<br />a Better Process
              </h2>
              <p className="text-background/70 leading-relaxed">
                Normal listings sit, weaken, and invite lowball offers. Everything Valuable replaces 
                that with a structured, transparent process — qualified buyer interest first, 
                then a controlled live pricing phase that aligns the market without manufactured urgency or distress.
              </p>
              <Link to="/how-it-works">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-full h-11 px-8 mt-4">
                  Discover Our Approach <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, title: "Qualified Buyers Only", desc: "Verified identity, proof of funds or pre-approval required before bidding" },
                { icon: Star, title: "Seller-Controlled Terms", desc: "Preview length, reserve, disclosures, and contract terms set by you" },
                { icon: Award, title: "No Stale Listings", desc: "Dynamic pricing replaces passive waiting — demand is visible and active" },
                { icon: Shield, title: "Deposit & Contract Workflow", desc: "Winners move immediately to earnest money and contract execution" },
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
            Sell Property With Everything Valuable
          </h2>
          <p className="text-muted-foreground mt-4 mb-8 leading-relaxed">
            Join brokers, estate sellers, and private owners using Everything Valuable 
            to reach a global audience of discerning buyers.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/sell">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-full h-12 px-8">
                Become a Seller <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/real-property">
              <Button size="lg" variant="outline" className="gap-2 rounded-full h-12 px-8">
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}