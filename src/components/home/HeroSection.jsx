import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const heroImage = "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=90&fit=crop";

export default function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-stretch overflow-hidden bg-[hsl(40,33%,97%)]">
      {/* Split layout */}
      <div className="relative flex w-full flex-col lg:flex-row">

        {/* Left — Text Panel */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="flex flex-col justify-center px-8 md:px-16 lg:px-20 py-20 lg:py-0 w-full lg:w-[52%] z-10 bg-[hsl(40,33%,97%)]"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-px bg-primary" />
            <span className="text-xs tracking-[0.2em] uppercase font-display font-semibold text-primary">
              Fine Art · Antiques · Jewelry
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.05] tracking-tight text-foreground mb-6">
            A New Standard<br />
            For <span className="italic text-primary">Valuable</span><br />
            Things
          </h1>

          {/* Subhead */}
          <p className="font-sans text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mb-10">
            Discover art, antiques, jewelry, and rare objects through a marketplace designed for transparent pricing, elegant presentation, and modern collecting.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            <Link to="/browse">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-8 text-sm font-semibold rounded-none tracking-wide"
              >
                Discover Objects
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <button className="text-sm font-medium text-foreground underline underline-offset-4 decoration-primary/40 hover:decoration-primary transition-all">
                Learn About PRI$OMETER™
              </button>
            </Link>
          </div>

          {/* Micro-line */}
          <p className="text-xs text-muted-foreground/60 tracking-wide uppercase font-display">
            Live Auctions · Private Listings · PRI$OMETER™ Sales
          </p>
        </motion.div>

        {/* Right — Image Panel */}
        <motion.div
          initial={{ opacity: 0, scale: 1.03 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
          className="relative w-full lg:w-[48%] min-h-[55vw] lg:min-h-0"
        >
          <img
            src={heroImage}
            alt="Fine jewelry on display"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Subtle left-edge blend into the text panel */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[hsl(40,33%,97%)] to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}