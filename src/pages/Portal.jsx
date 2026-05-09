import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeDollarSign,
  Building2,
  CheckCircle2,
  Gem,
  Home,
  ShieldCheck,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const personalImage =
  "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg";

const realImage =
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=85";

const estateImage =
  "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1800&q=85";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

const paths = [
  {
    title: "Personal Property",
    eyebrow: "Fine art, jewelry, design, antiques",
    description: "Browse and sell valuable objects with transparent fees, verified listings, and live market pricing.",
    href: "/personal-property",
    image: personalImage,
    icon: Gem,
    action: "Enter Personal Property",
    stats: ["Fine Art", "Jewelry", "Furniture", "Collectibles"],
  },
  {
    title: "Real Property",
    eyebrow: "Homes, estates, investment property",
    description: "Explore select property listings and estate opportunities as the real-property marketplace expands.",
    href: "/real-property",
    image: realImage,
    icon: Home,
    action: "Enter Real Property",
    stats: ["Residential", "Estate", "Land", "Investment"],
  },
];

const proofPoints = [
  {
    icon: BadgeDollarSign,
    title: "No Buyer Premium",
    description: "Pricing stays clear so buyers and sellers know the real transaction cost.",
  },
  {
    icon: TrendingDown,
    title: "Dynamic Market Pricing",
    description: "1stBid$ and PRI$OMETER help value surface through buyer demand.",
  },
  {
    icon: ShieldCheck,
    title: "Seller-Led Control",
    description: "Sellers manage listings, reserves, terms, invoices, and buyer communication in one place.",
  },
];

export default function Portal() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <section
        className="relative min-h-[calc(100vh-88px)] overflow-hidden border-b border-border/60 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.72), rgba(0,0,0,0.64)), url(${estateImage})`,
        }}
      >
        <div className="absolute inset-x-0 bottom-0 z-10 h-44 bg-gradient-to-t from-background to-transparent" />

        <motion.div
          className="relative z-20 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl flex-col justify-center px-5 py-10 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="max-w-3xl pt-6 [text-shadow:0_2px_24px_rgba(0,0,0,0.65)]">
            <p className="mb-4 text-[12px] font-bold uppercase tracking-[0.22em] text-white/70">
              Everything Valuable
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[0.98] text-white md:text-6xl lg:text-7xl">
              Choose the marketplace for the asset in front of you.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg">
              Move between personal property and real property with a cleaner starting point for buying, selling, and discovering value.
            </p>
          </motion.div>

          <motion.div variants={containerVariants} className="mt-8 grid gap-4 lg:grid-cols-2">
            {paths.map((path) => {
              const Icon = path.icon;
              return (
                <motion.div key={path.title} variants={itemVariants}>
                  <Link
                    to={path.href}
                    className="group block overflow-hidden rounded-lg border border-white/20 bg-black/35 shadow-2xl backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-white/40 hover:bg-black/30"
                  >
                    <div className="grid min-h-[310px] md:grid-cols-[0.95fr_1.05fr]">
                      <div className="relative min-h-[190px] overflow-hidden md:min-h-full">
                        <img
                          src={path.image}
                          alt={path.title}
                          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                      <div className="flex flex-col justify-between p-5 md:p-6">
                        <div>
                          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-foreground">
                            <Icon className="h-5 w-5" />
                          </div>
                          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/80">
                            {path.eyebrow}
                          </p>
                          <h2 className="mt-2 font-display text-2xl font-extrabold text-white md:text-3xl">
                            {path.title}
                          </h2>
                          <p className="mt-3 text-sm leading-6 text-white">
                            {path.description}
                          </p>
                        </div>
                        <div>
                          <div className="mt-5 flex flex-wrap gap-1.5">
                            {path.stats.map((stat) => (
                              <span key={stat} className="border-b border-white/35 pb-0.5 text-[11px] font-semibold text-white">
                                {stat}
                              </span>
                            ))}
                          </div>
                          <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-white">
                            {path.action}
                            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      <section className="border-b border-border/60 bg-background py-14 md:py-18">
        <motion.div
          className="mx-auto max-w-7xl px-5 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={itemVariants} className="mb-7">
            <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-primary">
              One platform, two asset paths
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold leading-tight md:text-4xl">
              Start with the kind of property. Keep the value process connected.
            </h2>
          </motion.div>
          <motion.div variants={containerVariants} className="grid gap-4 lg:grid-cols-3">
            {proofPoints.map((point) => {
              const Icon = point.icon;
              return (
                <motion.div key={point.title} variants={itemVariants} className="flex gap-3 rounded-lg border border-border bg-white p-6 shadow-sm">
                  <Icon className="h-6 w-6 shrink-0 text-primary" />
                  <div>
                    <h3 className="font-display text-base font-extrabold">{point.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{point.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-[hsl(40,22%,96%)] py-14 md:py-18">
        <motion.div
          className="mx-auto max-w-7xl px-5 lg:px-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          <motion.div variants={itemVariants} className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-primary">How value moves</p>
              <h2 className="mt-3 font-display text-3xl font-extrabold md:text-4xl">
                Modern selling tools without the old auction fog.
              </h2>
            </div>
            <Link to="/how-it-works">
              <Button variant="outline" className="h-10 rounded-lg gap-2">
                How It Works <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid gap-4 lg:grid-cols-3">
            <motion.div variants={itemVariants} className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-6 w-6 text-primary" />
                <h3 className="font-display text-xl font-extrabold">List with context</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Sellers add photos, provenance, condition, location, reserves, and terms so buyers can act with confidence.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <Building2 className="h-6 w-6 text-primary" />
                <h3 className="font-display text-xl font-extrabold">Match the asset</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                Personal property and real property stay distinct, while estate and collection value can be discovered from one entry point.
              </p>
            </motion.div>
            <motion.div variants={itemVariants} className="rounded-lg border border-border bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-6 w-6 text-primary" />
                <h3 className="font-display text-xl font-extrabold">Let demand speak</h3>
              </div>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">
                1stBid$ and PRI$OMETER create an active price-discovery path instead of a static listing that sits untouched.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}