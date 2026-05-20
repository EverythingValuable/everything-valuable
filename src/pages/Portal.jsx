import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  Globe,
  Gavel,
  HeadphonesIcon,
  Sofa,
  Home,
} from "lucide-react";

const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } } };

const PERSONAL_IMG  = "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg";
const REAL_IMG      = "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1400&q=85";
const ABOUT_IMG     = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80";
const FOREST_BG     = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=80";
const PERSONAL_CAT  = "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg";
const REAL_CAT      = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80";

const trustItems = [
  { icon: ShieldCheck, title: "Trusted & Verified",      desc: "Every seller is verified. Every auction is secure." },
  { icon: Globe,       title: "Global Reach",            desc: "Connecting buyers and sellers worldwide." },
  { icon: Gavel,       title: "Live & Timed Auctions",   desc: "Real-time bidding with transparent results." },
  { icon: HeadphonesIcon, title: "Exceptional Service",  desc: "Dedicated support every step of the way." },
];

export default function Portal() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* ═══════════════════════════════════════════════════════
          HERO — diagonal split image, left copy, right stat cards
      ══════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "88vh" }}>

        {/* Split background — clipped diagonal */}
        <div className="absolute inset-0 flex">
          {/* Left half — personal property */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${PERSONAL_IMG})`,
              backgroundSize: "cover",
              backgroundPosition: "center left",
              clipPath: "polygon(0 0, 58% 0, 44% 100%, 0 100%)",
            }}
          />
          {/* Right half — real property */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${REAL_IMG})`,
              backgroundSize: "cover",
              backgroundPosition: "center right",
              clipPath: "polygon(56% 0, 100% 0, 100% 100%, 42% 100%)",
            }}
          />
        </div>

        {/* Overall dark overlay */}
        <div className="absolute inset-0 bg-black/55" />

        {/* Content */}
        <motion.div
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 flex flex-col justify-center"
          style={{ minHeight: "88vh" }}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center py-20">

            {/* LEFT — headline + buttons */}
            <div className="max-w-xl">
              <motion.p variants={fade} className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60 mb-5">
                Welcome to Everything Valuable
              </motion.p>
              <motion.h1
                variants={fade}
                className="font-display font-extrabold text-white leading-[0.95] mb-6"
                style={{ fontSize: "clamp(2.6rem, 5.5vw, 4.5rem)" }}
              >
                Exceptional assets. Trusted auctions. Extraordinary results.
              </motion.h1>
              <motion.p variants={fade} className="text-white/70 text-[15px] leading-relaxed mb-8 max-w-sm">
                Discover rare art, collectibles, luxury items, and premier real estate from trusted sellers in curated, live auctions.
              </motion.p>
              <motion.div variants={fade} className="flex flex-wrap gap-3">
                <Link to="/personal-property">
                  <button className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-[13px] px-5 py-3 hover:bg-primary/85 transition-colors">
                    Explore Personal Property <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/real-property">
                  <button className="inline-flex items-center gap-2 border border-white/50 text-white font-semibold text-[13px] px-5 py-3 hover:bg-white/10 transition-colors">
                    Explore Real Property <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* RIGHT — stat cards stacked */}
            <motion.div variants={fade} className="hidden lg:flex flex-col gap-4 items-end justify-center">
              <div className="bg-white p-6 w-56 shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Sofa className="w-6 h-6 text-primary" />
                </div>
                <p className="font-display text-5xl font-extrabold text-foreground leading-none">180°</p>
                <p className="text-sm text-muted-foreground mt-2 leading-snug">Curated selection of exceptional assets across categories.</p>
              </div>
              <div className="bg-white p-6 w-56 shadow-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <Home className="w-6 h-6 text-primary" />
                </div>
                <p className="font-display text-5xl font-extrabold text-foreground leading-none">100%</p>
                <p className="text-sm text-muted-foreground mt-2 leading-snug">Trusted experience with verified sellers and secure transactions.</p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          ABOUT — left copy, right image with badge
      ══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white border-b border-border/40">
        <motion.div
          className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Copy */}
          <div className="max-w-md">
            <motion.p variants={fade} className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground/60 mb-3">
              02 · About Us
            </motion.p>
            <motion.h2 variants={fade} className="font-display font-extrabold text-foreground leading-tight mb-5" style={{ fontSize: "clamp(2rem, 3.5vw, 2.8rem)" }}>
              A marketplace built on trust, passion, and unmatched expertise.
            </motion.h2>
            <motion.p variants={fade} className="text-muted-foreground text-[14px] leading-relaxed mb-3">
              Everything Valuable connects buyers and sellers through transparent, live auctions featuring the world's most desirable personal property and real estate.
            </motion.p>
            <motion.p variants={fade} className="text-muted-foreground text-[13px] leading-relaxed mb-8">
              Whether you're collecting, investing, or searching for your next opportunity, we're here to help you find what truly matters.
            </motion.p>
            <motion.div variants={fade}>
              <Link to="/about">
                <button className="inline-flex items-center gap-2 border border-border text-foreground font-semibold text-[13px] px-5 py-2.5 hover:bg-secondary transition-colors">
                  Learn More About Us <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </motion.div>
          </div>

          {/* Image + badge */}
          <motion.div variants={fade} className="relative">
            <img
              src={ABOUT_IMG}
              alt="Interior"
              className="w-full object-cover shadow-xl"
              style={{ height: 400 }}
            />
            {/* Verified badge bottom-right */}
            <div className="absolute bottom-5 right-5 bg-white p-4 flex items-start gap-3 shadow-xl max-w-[220px]">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[13px] text-foreground">Verified &amp; Secure</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">All sellers are verified and transactions are protected from start to finish.</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TWO WORLDS — dark forest bg, left copy, two category cards
      ══════════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${FOREST_BG})` }}
        />
        <div className="absolute inset-0 bg-black/72" />

        <motion.div
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-[380px_1fr_1fr] gap-8 items-center"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Left copy */}
          <div>
            <motion.p variants={fade} className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">
              03 · Explore Categories
            </motion.p>
            <motion.h2 variants={fade} className="font-display font-extrabold text-white leading-tight mb-4" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)" }}>
              Two worlds of exceptional value.
            </motion.h2>
            <motion.p variants={fade} className="text-white/55 text-[13px] leading-relaxed">
              Choose your path and explore what inspires you.
            </motion.p>
          </div>

          {/* Personal Property card */}
          <motion.div variants={fade}>
            <Link to="/personal-property" className="group block relative overflow-hidden shadow-2xl" style={{ height: 300 }}>
              <img src={PERSONAL_CAT} alt="Personal Property" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl font-extrabold text-white mb-1">Personal Property</h3>
                <p className="text-white/65 text-[13px] mb-5 leading-snug">Art, antiques, jewelry, collectibles, furniture and more.</p>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center group-hover:bg-primary transition-colors duration-200">
                  <ArrowRight className="w-4 h-4 text-foreground group-hover:text-white transition-colors duration-200" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Real Property card */}
          <motion.div variants={fade}>
            <Link to="/real-property" className="group block relative overflow-hidden shadow-2xl" style={{ height: 300 }}>
              <img src={REAL_CAT} alt="Real Property" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl font-extrabold text-white mb-1">Real Property</h3>
                <p className="text-white/65 text-[13px] mb-5 leading-snug">Residential, commercial, land and investment opportunities.</p>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center group-hover:bg-primary transition-colors duration-200">
                  <ArrowRight className="w-4 h-4 text-foreground group-hover:text-white transition-colors duration-200" />
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          TRUST BAR — 4 icon + text columns on white
      ══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-t border-border/40">
        <motion.div
          className="mx-auto max-w-7xl px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-10"
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
        >
          {trustItems.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fade} className="flex flex-col items-start gap-3">
              <div className="w-11 h-11 rounded-full border border-primary/25 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-[13px] text-foreground">{title}</p>
                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

    </div>
  );
}