import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {

  return (
    <section className="bg-[hsl(40,33%,97%)] py-12 md:py-16">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5">
            <div className="w-6 h-px bg-primary" />
            <span className="text-[10px] tracking-[0.25em] uppercase font-display font-semibold text-primary">
              Art · Antiques · Jewelry · Watches
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-3xl md:text-4xl font-semibold leading-tight text-foreground">
            A New Standard for <em className="not-italic text-primary">Everything Valuable</em>
          </h1>

          {/* Subhead */}
          <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-[500px]">
            Discover exceptional objects through a marketplace reimagined for transparency. Every lot begins in our exclusive <span className="font-semibold text-foreground">1stBid$™</span> preview phase, then enters live <span className="font-semibold text-foreground">PRI$OMETER™</span> pricing for a more dynamic and engaging path to purchase.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/browse">
              <Button
                size="sm"
                className="bg-foreground text-background hover:bg-foreground/85 gap-2 text-xs font-semibold rounded-none tracking-wide"
              >
                Discover Objects
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-semibold rounded-none border-foreground/30 hover:border-foreground/70 tracking-wide text-foreground"
              >
                How PRI$OMETER™ Works
              </Button>
            </Link>
          </div>

          {/* Micro-line */}
          <p className="text-[10px] text-muted-foreground/50 tracking-[0.18em] uppercase font-display pt-1">
            Live Auctions · 1stBid$™ Preview · PRI$OMETER™ Sales
          </p>
        </motion.div>
      </div>
    </section>
  );
}