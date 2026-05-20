import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Globe,
  Gavel,
  HeadphonesIcon,
} from "lucide-react";

const fade = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } };

const PERSONAL_IMG = "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg";
const REAL_IMG     = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85";
const ABOUT_IMG    = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80";
const HERO_REAL_IMG = "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1400&q=85";

const trustItems = [
  { icon: ShieldCheck, title: "Trusted & Verified", desc: "Every seller is verified. Every auction is secure." },
  { icon: Globe, title: "Global Reach", desc: "Connecting buyers and sellers worldwide." },
  { icon: Gavel, title: "Live & Timed Auctions", desc: "Real-time bidding with transparent results." },
  { icon: HeadphonesIcon, title: "Exceptional Service", desc: "Dedicated support every step of the way." },
];

export default function Portal() {
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden min-h-[92vh] flex items-center">
        {/* Split background */}
        <div className="absolute inset-0 flex">
          <div
            className="w-1/2 bg-cover bg-center"
            style={{ backgroundImage: `url(${PERSONAL_IMG})` }}
          />
          <div
            className="w-1/2 bg-cover bg-center"
            style={{ backgroundImage: `url(${HERO_REAL_IMG})` }}
          />
        </div>
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/60" />

        <motion.div
          className="relative z-10 mx-auto max-w-7xl w-full px-6 lg:px-10 py-20 grid lg:grid-cols-2 gap-12 items-center"
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Left copy */}
          <div>
            <motion.p variants={fade} className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60 mb-5">
              Welcome to Everything Valuable
            </motion.p>
            <motion.h1 variants={fade} className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[0.95] mb-6">
              Exceptional assets. Trusted auctions. Extraordinary results.
            </motion.h1>
            <motion.p variants={fade} className="text-white/70 text-base leading-relaxed max-w-md mb-8">
              Discover rare art, collectibles, luxury items, and premier real estate from trusted sellers in curated, live auctions.
            </motion.p>
            <motion.div variants={fade} className="flex flex-wrap gap-3">
              <Link to="/personal-property">
                <button className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-sm px-5 py-3 hover:bg-primary/90 transition-colors">
                  Explore Personal Property <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link to="/real-property">
                <button className="inline-flex items-center gap-2 border border-white/50 text-white font-semibold text-sm px-5 py-3 hover:bg-white/10 transition-colors">
                  Explore Real Property <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Right stat cards */}
          <motion.div variants={fade} className="hidden lg:flex flex-col gap-4 items-end">
            <div className="bg-white/95 backdrop-blur-sm p-6 w-60 shadow-xl">
              <p className="font-display text-4xl font-extrabold text-foreground">180°</p>
              <p className="text-sm text-muted-foreground mt-2 leading-snug">Curated selection of exceptional assets across categories.</p>
            </div>
            <div className="bg-white/95 backdrop-blur-sm p-6 w-60 shadow-xl">
              <p className="font-display text-4xl font-extrabold text-foreground">100%</p>
              <p className="text-sm text-muted-foreground mt-2 leading-snug">Trusted experience with verified sellers and secure transactions.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── ABOUT ────────────────────────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-background border-b border-border/50">
        <motion.div
          className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-14 items-center"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div>
            <motion.p variants={fade} className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary mb-3">
              02 · About Us
            </motion.p>
            <motion.h2 variants={fade} className="font-display text-4xl md:text-5xl font-extrabold leading-tight mb-6">
              A marketplace built on trust, passion, and unmatched expertise.
            </motion.h2>
            <motion.p variants={fade} className="text-muted-foreground text-base leading-relaxed mb-4">
              Everything Valuable connects buyers and sellers through transparent, live auctions featuring the world's most desirable personal property and real estate.
            </motion.p>
            <motion.p variants={fade} className="text-muted-foreground text-sm leading-relaxed mb-8">
              Whether you're collecting, investing, or searching for your next opportunity, we're here to help you find what truly matters.
            </motion.p>
            <motion.div variants={fade}>
              <Link to="/about">
                <button className="inline-flex items-center gap-2 border border-border text-foreground font-semibold text-sm px-5 py-2.5 hover:bg-secondary transition-colors">
                  Learn More About Us <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>

          <motion.div variants={fade} className="relative">
            <img src={ABOUT_IMG} alt="Interior" className="w-full h-[420px] object-cover shadow-2xl" />
            <div className="absolute bottom-5 right-5 bg-white/95 backdrop-blur-sm p-4 flex items-start gap-3 shadow-lg max-w-[230px]">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm text-foreground">Verified & Secure</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-snug">All sellers are verified and transactions are protected from start to finish.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── TWO WORLDS ───────────────────────────────────────────────────────── */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Dark forest / moody bg */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=80)` }}
        />
        <div className="absolute inset-0 bg-black/70" />

        <motion.div
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-[1fr_1fr_1fr] gap-10 items-center"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="lg:col-span-1">
            <motion.p variants={fade} className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/50 mb-3">
              03 · Explore Categories
            </motion.p>
            <motion.h2 variants={fade} className="font-display text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4">
              Two worlds of exceptional value.
            </motion.h2>
            <motion.p variants={fade} className="text-white/60 text-sm leading-relaxed">
              Choose your path and explore what inspires you.
            </motion.p>
          </div>

          {/* Personal Property card */}
          <motion.div variants={fade}>
            <Link to="/personal-property" className="group block relative overflow-hidden h-72 shadow-2xl">
              <img src={PERSONAL_IMG} alt="Personal Property" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl font-extrabold text-white mb-1">Personal Property</h3>
                <p className="text-white/70 text-sm mb-4">Art, antiques, jewelry, collectibles, furniture and more.</p>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center group-hover:bg-primary transition-colors">
                  <ArrowRight className="w-4 h-4 text-foreground group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Real Property card */}
          <motion.div variants={fade}>
            <Link to="/real-property" className="group block relative overflow-hidden h-72 shadow-2xl">
              <img src={REAL_IMG} alt="Real Property" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl font-extrabold text-white mb-1">Real Property</h3>
                <p className="text-white/70 text-sm mb-4">Residential, commercial, land and investment opportunities.</p>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center group-hover:bg-primary transition-colors">
                  <ArrowRight className="w-4 h-4 text-foreground group-hover:text-white transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── TRUST BAR ────────────────────────────────────────────────────────── */}
      <section className="py-16 bg-background border-t border-border/50">
        <motion.div
          className="mx-auto max-w-7xl px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-8"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {trustItems.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fade} className="flex flex-col items-start gap-3">
              <div className="w-10 h-10 rounded-full border border-primary/30 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-display text-sm font-extrabold text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
}