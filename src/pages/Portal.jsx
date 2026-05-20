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

const PERSONAL_IMG = "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg";
const REAL_IMG     = "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1400&q=85";
const ABOUT_IMG    = "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&q=80";
const FOREST_BG    = "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1800&q=80";
const REAL_CAT     = "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80";

const trustItems = [
  { icon: ShieldCheck,     title: "Trusted & Verified",    desc: "Every seller is verified. Every auction is secure." },
  { icon: Globe,           title: "Global Reach",          desc: "Connecting buyers and sellers worldwide." },
  { icon: Gavel,           title: "Live & Timed Auctions", desc: "Real-time bidding with transparent results." },
  { icon: HeadphonesIcon,  title: "Exceptional Service",   desc: "Dedicated support every step of the way." },
];

export default function Portal() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* ══════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden" style={{ minHeight: "88vh" }}>

        {/* Split backgrounds — diagonal clip */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${PERSONAL_IMG})`,
            clipPath: "polygon(0 0, 55% 0, 42% 100%, 0 100%)",
          }}
        />
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${REAL_IMG})`,
            clipPath: "polygon(53% 0, 100% 0, 100% 100%, 40% 100%)",
          }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/58" />

        {/* Content grid */}
        <motion.div
          className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10"
          style={{ minHeight: "88vh", display: "flex", alignItems: "center" }}
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          <div className="w-full relative py-16">

            {/* LEFT — hero text */}
            <div className="max-w-lg text-left">
              <motion.p variants={fade} className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/55 mb-5">
                Welcome to Everything Valuable
              </motion.p>
              <motion.h1
                variants={fade}
                className="font-display font-extrabold text-white leading-[0.95] mb-6"
                style={{ fontSize: "clamp(2.8rem, 5vw, 4.2rem)" }}
              >
                Exceptional assets. Trusted auctions. Extraordinary results.
              </motion.h1>
              <motion.p variants={fade} className="text-white/65 text-[14px] leading-relaxed mb-8 max-w-xs">
                Discover rare art, collectibles, luxury items, and premier real estate from trusted sellers in curated, live auctions.
              </motion.p>
              <motion.div variants={fade} className="flex flex-wrap gap-3">
                <Link to="/personal-property">
                  <button className="inline-flex items-center gap-2 bg-primary text-white font-semibold text-[13px] px-5 py-3 hover:bg-primary/85 transition-colors">
                    Explore Personal Property <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/real-property">
                  <button className="inline-flex items-center gap-2 border border-white/45 text-white font-semibold text-[13px] px-5 py-3 hover:bg-white/10 transition-colors">
                    Explore Real Property <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
              </motion.div>
            </div>

            {/* BOTTOM-RIGHT — stat cards */}
            <motion.div
              variants={fade}
              className="absolute bottom-0 right-0 hidden lg:flex flex-row gap-3 pb-6"
            >
              <div className="bg-white/80 backdrop-blur-sm p-5 w-48 shadow-xl">
                <Sofa className="w-5 h-5 text-primary mb-2" />
                <p className="font-display text-4xl font-extrabold text-foreground leading-none">180°</p>
                <p className="text-[12px] text-muted-foreground mt-2 leading-snug">Curated selection of exceptional assets across categories.</p>
              </div>
              <div className="bg-white/80 backdrop-blur-sm p-5 w-48 shadow-xl">
                <Home className="w-5 h-5 text-primary mb-2" />
                <p className="font-display text-4xl font-extrabold text-foreground leading-none">100%</p>
                <p className="text-[12px] text-muted-foreground mt-2 leading-snug">Trusted experience with verified sellers and secure transactions.</p>
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ABOUT
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28 bg-white border-b border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-2 gap-16 items-center">

          {/* Copy */}
          <motion.div
            className="max-w-md"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
          >
            <motion.p variants={fade} className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground/50 mb-3">
              02 · About Us
            </motion.p>
            <motion.h2 variants={fade} className="font-display font-extrabold text-foreground leading-tight mb-5" style={{ fontSize: "clamp(1.9rem, 3vw, 2.6rem)" }}>
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
          </motion.div>

          {/* Image + verified badge */}
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <img src={ABOUT_IMG} alt="Interior" className="w-full object-cover shadow-xl" style={{ height: 400 }} />
            <div className="absolute bottom-5 right-5 bg-white p-4 flex items-start gap-3 shadow-xl max-w-[210px]">
              <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-[13px] text-foreground">Verified &amp; Secure</p>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">All sellers are verified and transactions are protected from start to finish.</p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TWO WORLDS
      ══════════════════════════════════════════════════════ */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${FOREST_BG})` }} />
        <div className="absolute inset-0 bg-black/72" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-10 grid lg:grid-cols-[380px_1fr_1fr] gap-8 items-center">

          {/* Left copy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/40 mb-3">03 · Explore Categories</p>
            <h2 className="font-display font-extrabold text-white leading-tight mb-4" style={{ fontSize: "clamp(2rem, 3.2vw, 3rem)" }}>
              Two worlds of exceptional value.
            </h2>
            <p className="text-white/55 text-[13px] leading-relaxed">Choose your path and explore what inspires you.</p>
          </motion.div>

          {/* Personal Property card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <Link to="/personal-property" className="group block relative overflow-hidden shadow-2xl" style={{ height: 300 }}>
              <img src={PERSONAL_IMG} alt="Personal Property" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.2 }}
          >
            <Link to="/real-property" className="group block relative overflow-hidden shadow-2xl" style={{ height: 300 }}>
              <img src={REAL_CAT} alt="Real Property" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <h3 className="font-display text-2xl font-extrabold text-white mb-1">Real Property</h3>
                <p className="text-white/65 text-[13px] mb-5 leading-snug">Residential, commercial, land and investment opportunities.</p>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center group-hover:bg-primary transition-colors duration-200">
                  <ArrowRight className="w-4 h-4 text-foreground group-hover:text-white transition-colors duration-200" />
                </div>
              </div>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TRUST BAR
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 bg-white border-t border-border/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 grid grid-cols-2 md:grid-cols-4 gap-10">
          {trustItems.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              className="flex flex-col items-start gap-3"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <div className="w-11 h-11 rounded-full border border-primary/25 flex items-center justify-center">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-[13px] text-foreground">{title}</p>
                <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </div>
  );
}