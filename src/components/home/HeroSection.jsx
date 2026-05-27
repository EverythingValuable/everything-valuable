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
    <section className="py-14 md:py-20 relative overflow-hidden">
      {/* Dark base */}
      <div className="absolute inset-0 bg-[hsl(30,15%,14%)]" />
      {/* Background image on top of dark base, low opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://media.base44.com/images/public/69beac1c3231aaeb891946d5/3e367c567_Banner2.jpg')",
          opacity: 0.18
        }}
      />

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 flex flex-col md:flex-row md:items-center gap-10 md:gap-16 relative z-10">

        {/* Left — Text */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="space-y-5 flex-1"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-3">
            <div className="w-5 h-px bg-primary" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-primary">
              Art · Antiques · Jewelry · Watches
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-white">
            A New Standard for{" "}
            <em className="not-italic text-primary">Everything Valuable</em>
          </h1>

          {/* Subhead */}
          <p className="text-sm md:text-[15px] text-white/55 leading-relaxed max-w-[460px]">
            Every lot begins in <span className="text-white/80 font-medium">1stBid$™</span> preview, then enters live{" "}
            <span className="text-white/80 font-medium">PRI$OMETER™</span> pricing — a smarter, more transparent path to purchase.
          </p>

          {/* CTA */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link to="/browse">
              <Button
                size="sm"
                className="bg-primary text-white hover:bg-primary/90 gap-2 text-xs font-semibold rounded-none tracking-wide px-5 h-10"
              >
                Discover Objects
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs font-semibold rounded-none text-white/90 hover:text-white hover:bg-white/10 tracking-wide h-10 underline underline-offset-4 decoration-white/40"
              >
                How It Works
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Right — Search */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.18 }}
          className="w-full md:w-96 lg:w-[440px] shrink-0 space-y-3"
        >
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/75 font-semibold">
            Search the Marketplace
          </p>
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-0 bg-white/10 border border-white/30 hover:border-white/50 focus-within:border-primary transition-all group"
          >
            <Search className="w-4 h-4 text-white/70 group-focus-within:text-primary transition-colors flex-shrink-0 ml-4" />
            <input
              type="text"
              placeholder="Search art, antiques, jewelry, watches…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm text-white placeholder:text-white/60 outline-none px-3 py-4"
            />
            <button
              type="submit"
              className="h-full px-5 py-4 bg-primary text-white text-xs font-bold tracking-wide hover:bg-primary/90 transition-colors shrink-0"
            >
              Search
            </button>
          </form>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2 pt-1">
            {["Fine Art", "Jewelry", "Watches", "Asian Antiques"].map((tag) => (
              <button
                key={tag}
                onClick={() => navigate(`/browse?search=${encodeURIComponent(tag)}`)}
                className="text-[10px] px-3 py-1 border border-white/35 text-white/70 hover:border-white/60 hover:text-white transition-colors tracking-wide"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}