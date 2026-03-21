import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection({ heroImage = "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/2a97ae510_generated_667cc82e.png" }) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {heroImage ? (
          <img src={heroImage} alt="Luxury collectibles" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-secondary via-background to-muted" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/60 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 md:px-8 py-20 md:py-32 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-gold" />
            Live Sales Happening Now
          </div>

          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-semibold leading-[0.9] tracking-tight text-foreground">
            Where Value
            <br />
            <span className="italic text-primary">Finds Its</span>
            <br />
            Owner
          </h1>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-lg">
            The next-generation marketplace for art, antiques, jewelry, and extraordinary objects. 
            Powered by our proprietary PRI$OMETER™ technology.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <Link to="/browse">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-8 text-sm font-semibold rounded-full">
                Explore the Marketplace
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="ghost" size="lg" className="gap-2 h-12 px-6 text-sm font-medium text-muted-foreground hover:text-foreground rounded-full">
                <Play className="w-4 h-4" />
                How It Works
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-8 pt-8 border-t border-border/50">
            <div>
              <p className="font-serif text-2xl font-bold text-foreground">50K+</p>
              <p className="text-xs text-muted-foreground">Rare Objects</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-foreground">12K+</p>
              <p className="text-xs text-muted-foreground">Verified Sellers</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-bold text-foreground">$2.4B</p>
              <p className="text-xs text-muted-foreground">In Transactions</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}