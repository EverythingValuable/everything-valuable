import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Gavel,
  Globe2,
  HeadphonesIcon,
  Home,
  ShieldCheck,
  Sofa,
} from "lucide-react";

const PERSONAL_IMG =
  "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg";
const REAL_IMG =
  "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/7db4c466d_370977b8de8c632e2fcfe47f1bfad9d516a5050abbdb2691631738688fd4bf3d.jpg";
const ABOUT_IMG =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1400&q=85";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const trustItems = [
  {
    icon: ShieldCheck,
    title: "Trusted & Verified",
    desc: "Every seller is verified. Every auction is secure.",
  },
  {
    icon: Globe2,
    title: "Global Reach",
    desc: "Connecting buyers and sellers worldwide.",
  },
  {
    icon: Gavel,
    title: "Live & Timed Auctions",
    desc: "Real-time bidding with transparent results.",
  },
  {
    icon: HeadphonesIcon,
    title: "Exceptional Service",
    desc: "Dedicated support every step of the way.",
  },
];

const categoryCards = [
  {
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80",
    title: "Personal Property",
    desc: "Fine art, jewelry, antiques, collectibles & more",
    to: "/personal-property",
  },
  {
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
    title: "Real Property",
    desc: "Homes, estates & investment properties",
    to: "/real-property",
  },
];

export default function Portal() {
  return (
    <div className="min-h-screen bg-white text-foreground">

      {/* ── HERO: split diagonal ───────────────────────────────────────────── */}
      <section className="relative min-h-[760px] overflow-hidden lg:min-h-[88vh]">
        {/* Left panel — personal property */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${PERSONAL_IMG})`,
            clipPath: "polygon(0 0, 69% 0, 51% 100%, 0 100%)",
          }}
        />
        {/* Right panel — real property */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${REAL_IMG})`,
            clipPath: "polygon(69% 0, 100% 0, 100% 100%, 51% 100%)",
          }}
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />



        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="relative z-10 mx-auto flex min-h-[760px] max-w-[1480px] items-center px-6 pb-16 pt-28 md:px-10 lg:min-h-[88vh] lg:px-16"
        >
          <div className="grid w-full gap-12 lg:grid-cols-[minmax(420px,590px)_1fr] lg:items-end">

            {/* Left: headline + CTAs */}
            <div className="max-w-[590px]">
              <motion.p
                variants={fadeUp}
                className="mb-5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75"
              >
                Welcome to Everything Valuable
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="font-serif text-[3.45rem] font-semibold leading-[0.95] text-white sm:text-[4.6rem] lg:text-[5.25rem]"
              >
                Exceptional assets. Trusted auctions. Extraordinary results.
              </motion.h1>
              <motion.p
                variants={fadeUp}
                className="mt-7 max-w-[430px] text-base leading-8 text-white/80"
              >
                Discover rare art, collectibles, luxury items, and premier real estate from trusted sellers in curated, live auctions.
              </motion.p>
              <motion.div variants={fadeUp} className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/personal-property"
                  className="inline-flex h-14 items-center justify-center gap-3 bg-primary px-7 text-sm font-bold text-white transition-colors hover:bg-primary/90"
                >
                  Explore Personal Property <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/real-property"
                  className="inline-flex h-14 items-center justify-center gap-3 border border-white/55 bg-white/5 px-7 text-sm font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/12"
                >
                  Explore Real Property <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </div>

            {/* Right: stat cards */}
            <motion.div
              variants={fadeUp}
              className="grid max-w-[440px] grid-cols-2 gap-3 justify-self-start lg:mb-8 lg:justify-self-end"
            >
              <StatCard
                icon={Sofa}
                value="180°"
                text="Curated selection of exceptional assets across categories."
              />
              <StatCard
                icon={Home}
                value="100%"
                text="Trusted experience with verified sellers and secure transactions."
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────────── */}
      <section className="border-b border-neutral-200 bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-[1320px] items-center gap-12 px-6 md:px-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="max-w-[520px]"
          >
            <motion.p variants={fadeUp} className="mb-6 text-[11px] font-bold uppercase leading-4 tracking-[0.16em] text-neutral-500">
              <span className="block">01</span>
              About Us
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl font-semibold leading-[1.02] text-neutral-950 md:text-5xl">
              A marketplace built on trust, passion, and unmatched expertise.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-7 text-sm leading-7 text-neutral-600">
              Everything Valuable connects buyers and sellers through transparent, live auctions featuring the world's most desirable personal property and real estate.
            </motion.p>
            <motion.p variants={fadeUp} className="mt-4 text-sm leading-7 text-neutral-500">
              Whether you're collecting, investing, or searching for your next opportunity, we're here to help you find what truly matters.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link
                to="/about"
                className="mt-8 inline-flex h-11 items-center justify-center gap-3 border border-neutral-300 px-5 text-xs font-bold text-neutral-900 transition-colors hover:border-neutral-950 hover:bg-neutral-950 hover:text-white"
              >
                Learn More About Us <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.65, ease: "easeOut" }}
            className="relative"
          >
            <img
              src={ABOUT_IMG}
              alt="Luxury interior with curated furnishings"
              className="h-[340px] w-full rounded-[8px] object-cover shadow-[0_24px_70px_rgba(0,0,0,0.12)] md:h-[430px]"
            />
            <div className="absolute bottom-6 right-5 flex gap-2">
              <div className="rounded bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
                <p className="font-serif text-xl font-bold text-neutral-900">Verified & Secure</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">All sellers are verified and transactions<br />are protected from start to finish.</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────────────── */}
      <section className="bg-neutral-50 py-20 md:py-28">
        <div className="mx-auto max-w-[1320px] px-6 md:px-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="mb-12"
          >
            <motion.p variants={fadeUp} className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-neutral-500">
              <span className="block">02</span>
              Explore Categories
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-serif text-4xl font-semibold leading-[1.02] text-neutral-950 md:text-5xl">
              Two worlds of exceptional value.
            </motion.h2>
            <motion.p variants={fadeUp} className="mt-4 max-w-xl text-sm leading-7 text-neutral-500">
              Choose your path and explore what inspires you.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2">
            {categoryCards.map((card, i) => (
              <CategoryCard key={card.title} {...card} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ───────────────────────────────────────────────────── */}
      <section className="border-t border-neutral-200 bg-white py-16 md:py-20">
        <div className="mx-auto max-w-[1320px] px-6 md:px-10">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {trustItems.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp} className="flex flex-col gap-4">
                <div className="flex h-11 w-11 items-center justify-center border border-neutral-200 bg-neutral-50">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-semibold text-neutral-900">{title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-neutral-500">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, value, text }) {
  return (
    <div className="rounded-[6px] bg-white/95 p-5 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-sm">
      <Icon className="mb-3 h-6 w-6 text-primary" />
      <p className="font-serif text-3xl font-bold text-neutral-900">{value}</p>
      <p className="mt-2 text-[12px] leading-5 text-neutral-500">{text}</p>
    </div>
  );
}

function CategoryCard({ image, title, desc, to }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <Link
        to={to}
        className="group relative block h-[300px] overflow-hidden rounded-[6px] md:h-[380px]"
      >
        <img
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 p-7">
          <h3 className="font-serif text-2xl font-semibold text-white md:text-3xl">{title}</h3>
          <p className="mt-1.5 text-sm text-white/75">{desc}</p>
          <div className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
            Explore <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}