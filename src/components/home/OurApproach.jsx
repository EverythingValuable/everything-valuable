import React from "react";
import { Link } from "react-router-dom";
import { TrendingUp, Eye, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

export default function OurApproach() {
  const features = [
    {
      icon: TrendingUp,
      title: "Transparent Price Path",
      description: "Watch the price move in real time with full context on where it's headed and why.",
    },
    {
      icon: Eye,
      title: "Visible High Bid",
      description: "Always know where the market stands with visible high bids and live demand signals.",
    },
    {
      icon: Zap,
      title: "Make It Mine Option",
      description: "Act immediately at the current price rather than risk losing the item to another buyer.",
    },
    {
      icon: Target,
      title: "Lower Transaction Friction",
      description: "A modern, mobile-first experience with clear fees and fewer friction points from start to finish.",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[hsl(30,15%,14%)] relative overflow-hidden">
      {/* Background image overlay */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('https://media.base44.com/images/public/69beac1c3231aaeb891946d5/3e367c567_Banner2.jpg')",
          opacity: 0.12,
        }}
      />

      <div className="max-w-screen-2xl mx-auto px-6 md:px-12 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Left — Headline & Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex flex-col justify-start space-y-6"
          >
            {/* Eyebrow */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-0.5 bg-primary" />
                <span className="text-[10px] tracking-[0.3em] uppercase font-semibold text-primary">
                  Our Approach
                </span>
              </div>
            </div>

            {/* Headline */}
            <h2 className="font-serif text-3xl md:text-4xl font-semibold leading-tight text-white">
              A More Transparent Way to Buy and Sell What's Valuable
            </h2>

            {/* Description */}
            <p className="text-sm md:text-[15px] text-white/70 leading-relaxed max-w-md">
              Everything Valuable replaces the uncertainty of traditional auctions with real insight and more control. Our model gives buyers and sellers the clarity they need to act with confidence.
            </p>

            {/* CTA */}
            <Link
              to="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all tracking-wide pt-2"
            >
              How It Works
              <span className="text-primary">→</span>
            </Link>
          </motion.div>

          {/* Right — Feature Grid */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-5"
          >
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.15 + i * 0.08 }}
                  className="p-5 md:p-6 border border-white/15 rounded-lg backdrop-blur-sm hover:border-primary/50 transition-all duration-300 group"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-4 group-hover:border-primary/60 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-white text-sm md:text-base mb-2 leading-snug">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs md:text-sm text-white/60 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}