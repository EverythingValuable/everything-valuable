import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Lock, Globe } from "lucide-react";

const personalImage =
  "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg";

const realImage =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85";

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "Curated Excellence",
    description: "Only exceptional listings.",
  },
  {
    icon: Lock,
    title: "Trust & Discretion",
    description: "Privacy. Integrity. Peace of mind.",
  },
  {
    icon: Globe,
    title: "Global Perspective",
    description: "Connecting value, worldwide.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay: i * 0.1 },
  }),
};

export default function Portal() {
  return (
    <div className="min-h-screen bg-[#F7F5F0] text-foreground flex flex-col">

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pt-16 pb-10 md:pt-20 md:pb-12">

        {/* Headline */}
        <motion.div
          className="text-center mb-10 md:mb-12"
          initial="hidden"
          animate="visible"
        >
          <motion.h1
            custom={0}
            variants={fadeUp}
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight text-foreground"
          >
            Two Worlds of Value.
          </motion.h1>
          <motion.div
            custom={1}
            variants={fadeUp}
            className="mx-auto mt-4 h-px w-10 bg-primary"
          />
          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-4 text-[11px] font-bold uppercase tracking-[0.22em] text-foreground/50"
          >
            Choose your path: Personal Property or Real Property.
          </motion.p>
        </motion.div>

        {/* Two Cards */}
        <motion.div
          className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
          initial="hidden"
          animate="visible"
        >
          {/* Personal Property */}
          <motion.div custom={3} variants={fadeUp}>
            <Link
              to="/personal-property"
              className="group relative block overflow-hidden aspect-[3/4] md:aspect-[4/5]"
            >
              <img
                src={personalImage}
                alt="Personal Property"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
              <div className="absolute inset-0 p-7 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                    Personal Property
                  </h2>
                  <div className="mt-3 h-px w-8 bg-primary" />
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                    Antiques, Art,<br />Jewelry & Design
                  </p>
                </div>
                <div className="inline-flex items-center gap-3 border border-white/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-white hover:text-foreground transition-colors w-fit">
                  Enter
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>

          {/* Real Property */}
          <motion.div custom={4} variants={fadeUp}>
            <Link
              to="/real-property"
              className="group relative block overflow-hidden aspect-[3/4] md:aspect-[4/5]"
            >
              <img
                src={realImage}
                alt="Real Property"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />
              <div className="absolute inset-0 p-7 flex flex-col justify-between">
                <div>
                  <h2 className="font-display text-3xl md:text-4xl font-bold text-white leading-tight">
                    Real Property
                  </h2>
                  <div className="mt-3 h-px w-8 bg-primary" />
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
                    Homes, Estates<br />& Land
                  </p>
                </div>
                <div className="inline-flex items-center gap-3 border border-white/60 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white hover:bg-white hover:text-foreground transition-colors w-fit">
                  Enter
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </Link>
          </motion.div>
        </motion.div>
      </main>

      {/* Trust Bar */}
      <motion.footer
        className="border-t border-border/40 bg-[#F7F5F0] py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <div className="mx-auto max-w-5xl px-5 grid grid-cols-1 md:grid-cols-3 gap-6 md:divide-x divide-border/40">
          {trustPoints.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex items-start gap-4 md:px-8 first:pl-0 last:pr-0">
              <Icon className="h-5 w-5 text-foreground/40 shrink-0 mt-0.5" strokeWidth={1.5} />
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-foreground/50">{title}</p>
                <p className="mt-0.5 text-sm text-foreground/60">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.footer>

    </div>
  );
}