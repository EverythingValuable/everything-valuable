import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <section className="bg-[hsl(40,33%,97%)] py-12 md:py-16">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6 flex flex-col md:flex-row md:items-center gap-8 md:gap-12">

        {/* Left — Text */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-4 flex-1"
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

        {/* Right — Search Bar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          className="w-full md:w-80 lg:w-96 shrink-0"
        >
          <form onSubmit={handleSearch} className="flex items-center gap-2 bg-white border border-border shadow-sm px-4 h-12 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Search Everything Valuable…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button type="submit" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors shrink-0">
              Search
            </button>
          </form>
          <p className="text-[10px] text-muted-foreground/50 tracking-wide mt-2 px-1">
            Search art, antiques, jewelry, watches and more
          </p>
        </motion.div>

      </div>
    </section>
  );
}