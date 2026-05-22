import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const heroImages = [
  "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg",
  "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/7a37e948-5db0-47e8-a8a7-d1e2c08fa418/081c4b5e3ad95adc50e40a0ca4965a8462872ccb195ffcc8bd5795ea499503f9.jpg?content-type=image%2Fjpeg",
  "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/cb02dc8a-bf2a-46e0-adb7-4e9421da22a4/01197f831eb8f7198b5b61c0c20dec59347cf6733a6897550df64afe07c1e0aa.jpg?content-type=image%2Fjpeg",
  "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6ad125cd-2c89-4fac-8c40-b832adc77759/ChatGPT+Image+Feb+5%2C+2026%2C+03_21_54+PM.png?content-type=image%2Fpng",
];

export default function HeroSection() {
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
      <div className="max-w-screen-2xl mx-auto flex w-full flex-col lg:flex-row px-4 md:px-6">

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
              Art · Antiques · Jewelry · Watches
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.6rem] font-semibold leading-[1.08] tracking-tight text-foreground mb-5">
            A New Standard for <em className="not-italic text-primary">Everything Valuable</em>
          </h1>

          {/* Subhead */}
          <p className="font-sans text-sm md:text-base text-muted-foreground leading-relaxed max-w-[440px] mb-8">
            A new way to buy and sell valuable personal property. Everything Valuable combines curated listings, seller-friendly fees, and our patented <span className="font-semibold text-foreground">PRI$OMETER™</span> pricing system to create a more transparent marketplace for art, antiques, design, jewelry, and rare objects.
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
                className="h-11 px-7 text-sm font-semibold rounded-none border-foreground/30 hover:border-foreground/70 tracking-wide text-foreground"
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

        {/* Right — Rotating Image */}
        <div className="hidden lg:block relative w-full lg:w-[45%] shrink-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={current}
              src={heroImages[current]}
              alt="Featured object"
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