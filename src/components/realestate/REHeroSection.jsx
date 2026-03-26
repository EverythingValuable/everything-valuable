import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const heroImages = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80",
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
];

export default function REHeroSection() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative flex items-stretch overflow-hidden bg-[hsl(40,33%,97%)]"
      style={{ minHeight: "44vh", maxHeight: "520px" }}
    >
      <div className="flex w-full flex-col lg:flex-row">

        {/* Left — Text Panel */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col justify-center px-8 md:px-12 lg:px-16 py-10 lg:py-0 w-full z-10"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-6 h-px bg-primary" />
            <span className="text-[10px] tracking-[0.25em] uppercase font-display font-semibold text-primary">
              Residential · Commercial · Estates · Land
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.6rem] font-semibold leading-[1.08] tracking-tight text-foreground mb-5">
            A New Standard for <em className="not-italic text-primary">Real Estate</em>
          </h1>

          {/* Subhead */}
          <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-[420px] mb-8">
            Extraordinary properties deserve a better process. Qualified buyers establish real demand during the <span className="font-semibold text-foreground">1stBid$™ Preview</span>, then our <span className="font-semibold text-foreground">PRI$OMETER™</span> gradually aligns live price with market interest — transparently, credibly, and on a timeline that respects the weight of the transaction.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-5 mb-8">
            <Link to="/real-estate/browse">
              <Button
                size="lg"
                className="bg-foreground text-background hover:bg-foreground/85 gap-2 h-11 px-7 text-sm font-semibold rounded-none tracking-wide"
              >
                Discover Properties
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button
                variant="outline"
                size="lg"
                className="h-11 px-7 text-sm font-semibold rounded-none border-foreground/30 hover:border-foreground/70 tracking-wide text-foreground"
              >
                How PRI$OMETER™ Works
              </Button>
            </Link>
          </div>

          {/* Micro-line */}
          <p className="text-[10px] text-muted-foreground/50 tracking-[0.18em] uppercase font-display">
            Qualified Buyer Preview · Live Market Alignment · Deposit & Contract Workflow
          </p>
        </motion.div>

        {/* Right — Rotating Image */}
        <div className="hidden lg:block relative w-full lg:w-[45%] shrink-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={heroImages[current]}
              alt="Featured property"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.9, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {heroImages.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${i === current ? "bg-white scale-125" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}