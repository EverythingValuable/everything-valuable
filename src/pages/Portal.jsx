import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Gem, CheckCircle2, TrendingDown, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function Portal() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-primary/2">
      {/* ===== HERO SECTION ===== */}
      <section className="relative py-20 md:py-28 border-b border-border/40">
        <motion.div className="max-w-6xl mx-auto px-6" variants={containerVariants} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text + Buttons */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div>
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
                  A Smarter Marketplace for Fine Art, Objects & Everything Valuable
                </h1>
              </div>
              <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                Discover and sell personal property through transparent pricing, verified sellers, and dynamic market technology — from fine art and jewelry to design, antiques, collectibles, and select real property.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/personal-property">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-8 rounded-lg text-base font-medium">
                    Explore Collections
                  </Button>
                </Link>
                <Link to="/how-it-works">
                  <Button variant="outline" className="h-12 px-8 rounded-lg text-base font-medium">
                    How It Works
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Right: Large dramatic image */}
            <motion.div variants={itemVariants} className="relative hidden lg:block">
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg"
                  alt="Fine Art & Collectibles Marketplace"
                  className="w-full aspect-[3/4] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ===== CATEGORY PILLS ===== */}
      <motion.section className="py-8 border-b border-border/40 bg-card/30 backdrop-blur-sm" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap justify-center gap-2">
          {["Fine Art", "Jewelry", "Watches", "Design", "Antiques", "Silver", "Decorative Arts", "Collectibles", "Real Property"].map((cat, i) => (
            <motion.span key={i} variants={itemVariants} className="text-sm text-muted-foreground px-3 py-1 border-b border-border/50 hover:text-foreground transition-colors cursor-pointer">
              {cat}
            </motion.span>
          ))}
        </div>
      </motion.section>

      {/* ===== PORTAL CARDS ===== */}
      <section className="py-24 md:py-32 border-b border-border/40 bg-muted/10">
        <motion.div className="max-w-6xl mx-auto px-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Browse by Asset Type</h2>
          </motion.div>

          <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-8 items-end">
            {/* Personal Property Portal — Dominant */}
            <motion.div variants={itemVariants} className="group relative rounded-2xl overflow-hidden h-96 md:col-span-2 cursor-pointer">
              <img
                src="https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg"
                alt="Fine Art & Collectibles"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-10">
                <div className="flex items-center gap-2 mb-4">
                  <Gem className="w-5 h-5 text-primary" />
                  <span className="text-xs font-semibold text-primary uppercase tracking-wide">Personal Property</span>
                </div>
                <h3 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">Fine Art, Jewelry, Design & Collections</h3>
                <p className="text-white/80 text-base mb-8">Discover valuable listings from trusted sellers — including paintings, sculpture, watches, jewelry, antiques, decorative arts, and rare objects.</p>
                <Link to="/personal-property">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90 w-fit">
                    Explore Collections →
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Real Property Portal — Secondary */}
            <motion.div variants={itemVariants} className="group relative rounded-2xl overflow-hidden h-64 cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=85"
                alt="Real Property"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-8">
                <div className="flex items-center gap-2 mb-2">
                  <Home className="w-4 h-4 text-primary/60" />
                  <span className="text-xs font-semibold text-primary/60 uppercase tracking-wide">Coming Soon</span>
                </div>
                <h3 className="font-display text-xl font-bold text-white mb-2">Select Real Property</h3>
                <p className="text-white/70 text-sm mb-4">Explore estate, residential, and investment property as this category expands.</p>
                <Link to="/real-property">
                  <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 w-fit text-sm">
                    Explore Real Estate
                  </Button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== TWO WAYS THE MARKET FINDS VALUE ===== */}
      <section className="py-24 md:py-32 border-b border-border/40">
        <motion.div className="max-w-6xl mx-auto px-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">How the Marketplace Works</h2>
            <p className="text-muted-foreground mt-2">Our proprietary pricing engine replaces outdated auction models.</p>
          </motion.div>

          <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8">
            {/* 1stBid$ */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-border/50 bg-card p-10 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">1stBid$™ Preview</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">Buyers place early bids before live pricing begins. Strong preview bidding can establish the winning result before the PRI$OMETER ever activates.</p>
            </motion.div>

            {/* PRI$OMETER */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-border/50 bg-card p-10 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">PRI$OMETER™ Dynamic Pricing</h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">When needed, the price moves in real time until buyer demand and seller expectations meet.</p>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== WHY EVERYTHING VALUABLE ===== */}
      <section className="py-24 md:py-32 border-b border-border/40">
        <motion.div className="max-w-6xl mx-auto px-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">Why Everything Valuable</h2>
            <p className="text-muted-foreground text-lg mt-3 max-w-2xl mx-auto">Buying and selling valuable property should not feel opaque, outdated, or unnecessarily expensive.</p>
          </motion.div>

          <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Lock,
                title: "Transparent Fees",
                description: "Clear pricing before you commit. No hidden charges. No buyer's premium."
              },
              {
                icon: CheckCircle2,
                title: "Verified Sellers",
                description: "Listings supported by documentation, images, provenance, and defined terms."
              },
              {
                icon: TrendingDown,
                title: "Dynamic Market Pricing",
                description: "1stBid$ and PRI$OMETER create urgency, competition, and real market discovery."
              }
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div key={i} variants={itemVariants} className="rounded-xl bg-card border border-border/50 p-8 hover:shadow-md transition-shadow">
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-display text-xl font-bold text-foreground mb-3">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== MISSION STATEMENT (SIMPLIFIED) ===== */}
      <section className="py-16 md:py-20 bg-card border-t border-border/40">
        <motion.div className="max-w-4xl mx-auto px-6 text-center" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.p variants={itemVariants} className="text-lg text-muted-foreground leading-relaxed">
            Everything Valuable is reimagining how valuable assets change hands — replacing fragmented, opaque, and costly processes with a single platform that is transparent, efficient, and designed for the 21st century.
          </motion.p>
        </motion.div>
      </section>
    </div>
  );
}