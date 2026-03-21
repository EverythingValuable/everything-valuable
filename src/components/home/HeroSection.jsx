import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const heroImage = "https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1400&q=85&fit=crop";

export default function HeroSection() {
  return (
    <section
      className="relative flex items-stretch overflow-hidden bg-[hsl(40,33%,97%)]"
      style={{ minHeight: "72vh", maxHeight: "820px" }}
    >
      <div className="flex w-full flex-col lg:flex-row">

        {/* Left — Text Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-14 lg:py-0 w-full lg:w-[55%] z-10"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-6 h-px bg-primary" />
            <span className="text-[10px] tracking-[0.25em] uppercase font-display font-semibold text-primary">
              Art · Antiques · Jewelry · Watches
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.6rem] font-semibold leading-[1.08] tracking-tight text-foreground mb-5">
            A New Standard for <em className="not-italic text-primary">Valuable</em> Things
          </h1>

          {/* Subhead */}
          <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-[420px] mb-8">
            Discover rare objects through a marketplace built around transparency. Every lot opens in our exclusive <span className="font-semibold text-foreground">1stBid$™</span> preview phase, then moves into live <span className="font-semibold text-foreground">PRI$OMETER™</span> pricing — where the price drops in real time until someone buys.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-5 mb-8">
            <Link to="/browse">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/85 gap-2 h-11 px-7 text-sm font-semibold rounded-none tracking-wide"
              >
                Discover Objects
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-7 text-sm font-semibold rounded-none border-foreground/30 hover:border-foreground/70 tracking-wide"
              >
                How PRI$OMETER™ Works
              </Button>
            </Link>
          </div>

          {/* Micro-line */}
          <p className="text-[10px] text-muted-foreground/50 tracking-[0.18em] uppercase font-display">
            Live Auctions · 1stBid$™ Preview · PRI$OMETER™ Sales
          </p>
        </motion.div>

        {/* Right — Image Panel */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, ease: "easeOut", delay: 0.1 }}
          className="relative w-full lg:w-[45%] min-h-[45vw] lg:min-h-0"
        >
          <img
            src={heroImage}
            alt="Luxury collectible objects at auction"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Thin left-edge blend only */}
          <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[hsl(40,33%,97%)] to-transparent" />
        </motion.div>

      </div>
    </section>
  );
}