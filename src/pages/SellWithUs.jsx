import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { cn } from "@/lib/utils";
import { CheckCircle2, ChevronRight, ArrowRight, Check } from "lucide-react";

// ─── Inline primitives ────────────────────────────────────────────────────────

function Label({ children }) {
  return (
    <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-neutral-400 mb-3">{children}</p>
  );
}

function SectionHeading({ children, center }) {
  return (
    <h2 className={cn("text-2xl md:text-3xl font-bold text-neutral-900 leading-tight tracking-tight", center && "text-center")}>
      {children}
    </h2>
  );
}

function PrimaryBtn({ children, href, onClick, type = "button", disabled }) {
  const cls = "inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold tracking-[0.15em] uppercase px-6 h-11 transition-colors disabled:opacity-40";
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls}>{children}</button>;
}

function OutlineBtn({ children, href, to, onClick }) {
  const cls = "inline-flex items-center gap-2 border border-neutral-300 text-neutral-700 hover:border-neutral-700 hover:text-neutral-900 text-xs font-bold tracking-[0.15em] uppercase px-6 h-11 transition-colors";
  if (to) return <Link to={to} className={cls}>{children}</Link>;
  if (href) return <a href={href} className={cls}>{children}</a>;
  return <button type="button" onClick={onClick} className={cls}>{children}</button>;
}

// ─── Section: Hero ────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section id="top" className="bg-neutral-900 text-white pt-20 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div className="space-y-7">
          <Label>Everything Valuable — Seller Platform</Label>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight tracking-tight">
            A Smarter Way To Sell<br />Valuable Personal Property
          </h1>
          <p className="text-neutral-300 text-lg leading-relaxed max-w-lg">
            Everything Valuable gives sellers a more transparent, more engaging way to bring art, antiques, design, jewelry, and other valuable objects to market through our 1stBid$ preview and PRI$OMETER™ selling system.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <PrimaryBtn href="#apply">Start Selling <ChevronRight className="w-3.5 h-3.5" /></PrimaryBtn>
            <a href="#how-it-works" className="inline-flex items-center gap-2 border border-white/30 text-white/80 hover:border-white/60 hover:text-white text-xs font-bold tracking-[0.15em] uppercase px-6 h-11 transition-colors">
              How It Works
            </a>
          </div>
          <p className="text-xs text-neutral-500 leading-relaxed max-w-sm">
            Built for sellers who want more control, stronger buyer engagement, and a modern alternative to traditional auction selling.
          </p>
        </div>

        {/* Right side: simplified PRI$OMETER mockup */}
        <div className="hidden lg:block">
          <div className="border border-white/10 bg-white/5 p-8 space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-500">PRI$OMETER™ Live</p>
                <p className="text-lg font-bold text-white mt-1">Signed French Impressionist Oil On Canvas</p>
              </div>
              <span className="text-[10px] font-bold tracking-widest uppercase border border-green-500/40 text-green-400 px-2.5 py-1">Active</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Start Price</span>
                <span className="font-mono text-white font-bold">$12,000</span>
              </div>
              <div className="h-2 bg-white/10 w-full overflow-hidden">
                <div className="h-full bg-primary w-2/3 transition-all" />
              </div>
              <div className="flex items-center justify-between text-xs text-neutral-400">
                <span>Current Price</span>
                <span className="font-mono text-primary font-bold text-lg">$8,400</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
              {[["14", "Bids"], ["3", "Watchers"], ["7d", "Remaining"]].map(([val, lbl]) => (
                <div key={lbl} className="text-center">
                  <p className="text-lg font-bold text-white">{val}</p>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wider">{lbl}</p>
                </div>
              ))}
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-3 text-xs text-neutral-400 leading-relaxed">
              Hidden reserve active. Seller review required if sale is below reserve.
            </div>
          </div>
        </div>
      </div>

      {/* Anchor nav */}
      <div className="max-w-6xl mx-auto mt-16 border-t border-white/10 pt-8 flex flex-wrap gap-6">
        {[
          ["Why Sell Here", "#why"],
          ["How It Works", "#how-it-works"],
          ["PRI$OMETER™", "#prisometer"],
          ["Seller Control", "#control"],
          ["What We Accept", "#categories"],
          ["Start Selling", "#apply"],
        ].map(([label, href]) => (
          <a key={href} href={href} className="text-xs font-bold tracking-[0.15em] uppercase text-neutral-500 hover:text-white transition-colors">
            {label}
          </a>
        ))}
      </div>
    </section>
  );
}

// ─── Section: Value Cards ─────────────────────────────────────────────────────
function WhySellHere() {
  const cards = [
    {
      title: "Built-In Buyer Urgency",
      body: "The PRI$OMETER™ creates a live pricing event where buyers can watch the price move, place bids, or act immediately before someone else does.",
    },
    {
      title: "Demand Before The Sale Begins",
      body: "With 1stBid$, buyers can place early bids during the preview phase, helping establish market interest before the PRI$OMETER™ goes live.",
    },
    {
      title: "Reserve Protection",
      body: "Set a hidden reserve and choose how far below it the PRI$OMETER™ may fall. Sales at or above reserve happen automatically; below-reserve results are reviewed by you.",
    },
    {
      title: "Lower-Friction Selling",
      body: "A structured listing process with guided item intake and a selling format designed to turn buyer interest into action.",
    },
  ];

  return (
    <section id="why" className="max-w-6xl mx-auto px-6 py-20 space-y-12">
      <div className="space-y-3">
        <Label>Seller Value</Label>
        <SectionHeading>Why Sellers Use Everything Valuable</SectionHeading>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-neutral-200">
        {cards.map((c, i) => (
          <div key={i} className="bg-white px-8 py-8 space-y-3">
            <span className="font-mono text-[11px] font-bold text-neutral-300 tracking-widest">0{i + 1}</span>
            <h3 className="text-base font-bold text-neutral-900">{c.title}</h3>
            <p className="text-sm text-neutral-500 leading-relaxed">{c.body}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-neutral-100 pt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1">
          <p className="text-base font-semibold text-neutral-800">Ready To List Your First Item?</p>
          <p className="text-sm text-neutral-500 mt-1">Start the seller application — it takes under five minutes.</p>
        </div>
        <PrimaryBtn href="#apply">Start Seller Sign-Up <ChevronRight className="w-3.5 h-3.5" /></PrimaryBtn>
      </div>
    </section>
  );
}

// ─── Section: How It Works ────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      title: "Apply To Sell",
      body: "Create a seller account and submit basic information for approval. This keeps the marketplace curated and protects buyer confidence.",
      cta: { label: "Request Seller Approval", href: "#apply" },
    },
    {
      title: "Submit Your Item",
      body: "Upload photos, item details, dimensions, condition notes, provenance, and any known maker or artist information. The listing studio guides you through the process.",
    },
    {
      title: "We Build A Better Listing",
      body: "Structured fields help create a clean title, stronger description, category-specific details, and buyer confidence prompts automatically.",
    },
    {
      title: "1stBid$ Preview Begins",
      body: "Your item enters a preview phase where buyers place early bids before the PRI$OMETER™ starts. This helps measure demand before the live pricing phase.",
    },
    {
      title: "PRI$OMETER™ Goes Live",
      body: "The item enters a live declining-price phase. Buyers can place bids or use Make It Mine to purchase at the current price.",
    },
    {
      title: "Sale Or Seller Review",
      body: "If the price meets the highest bid at or above reserve, the item sells automatically. If the result is below reserve, the seller can review and decide whether to accept.",
    },
    {
      title: "Settlement",
      body: "After the transaction is completed, the seller receives settlement according to the platform terms. Invoicing is handled directly through the seller dashboard.",
    },
  ];

  return (
    <section id="how-it-works" className="bg-neutral-50 border-y border-neutral-200 py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-3">
          <Label>Process</Label>
          <SectionHeading>How Selling Works</SectionHeading>
        </div>

        <div className="space-y-0">
          {steps.map((step, i) => (
            <div key={i} className="flex gap-6 sm:gap-10 py-7 border-b border-neutral-200 last:border-0">
              <div className="shrink-0 flex flex-col items-center">
                <span className="w-8 h-8 flex items-center justify-center border-2 border-neutral-900 bg-white text-xs font-bold text-neutral-900 shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {i < steps.length - 1 && <div className="w-px flex-1 bg-neutral-200 mt-2 min-h-[24px]" />}
              </div>
              <div className="space-y-2 pb-2">
                <h3 className="text-base font-bold text-neutral-900">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed max-w-xl">{step.body}</p>
                {step.cta && (
                  <a href={step.cta.href} className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.12em] uppercase text-neutral-900 hover:text-primary transition-colors mt-1 underline underline-offset-4">
                    {step.cta.label} <ArrowRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border border-neutral-200 bg-white px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-lg font-bold text-neutral-900">Have Items Ready To Sell?</p>
            <p className="text-sm text-neutral-500 mt-1">Apply for a seller account and begin the intake process today.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryBtn href="#apply">Start Selling</PrimaryBtn>
            <OutlineBtn href="#apply">Talk To Us First</OutlineBtn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: PRI$OMETER Explanation ─────────────────────────────────────────
function PrisometerSection() {
  return (
    <section id="prisometer" className="max-w-6xl mx-auto px-6 py-20 space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-6">
          <div>
            <Label>The Mechanism</Label>
            <SectionHeading>The PRI$OMETER™ Is Designed To Create Action</SectionHeading>
          </div>
          <p className="text-sm text-neutral-500 leading-relaxed">
            Traditional listings often sit still. The PRI$OMETER™ creates movement. The price begins at a set starting point and declines over time, while buyer bids create upward demand. When price and demand meet, the sale can happen.
          </p>
          <ul className="space-y-3">
            {[
              "Buyers can bid early during the 1stBid$ preview phase",
              "Buyers can act instantly with Make It Mine at any current price",
              "Sellers keep hidden reserve protection throughout",
              "Below-reserve results can require explicit seller review before closing",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-600">
                <Check className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <PrimaryBtn href="#apply">See If Your Item Qualifies <ChevronRight className="w-3.5 h-3.5" /></PrimaryBtn>
        </div>

        {/* Visual diagram */}
        <div className="space-y-3">
          <div className="border border-neutral-200 bg-white p-8 space-y-6">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Price Movement Over Time</p>
            {/* Simplified chart representation */}
            <div className="relative h-48">
              <svg viewBox="0 0 300 150" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                <line x1="0" y1="37" x2="300" y2="37" stroke="#f0f0f0" strokeWidth="1" />
                <line x1="0" y1="75" x2="300" y2="75" stroke="#f0f0f0" strokeWidth="1" />
                <line x1="0" y1="112" x2="300" y2="112" stroke="#f0f0f0" strokeWidth="1" />
                {/* Reserve line */}
                <line x1="0" y1="90" x2="300" y2="90" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,4" />
                {/* Declining price line */}
                <polyline points="0,10 60,30 120,55 180,80 240,105 300,125" fill="none" stroke="#1a1a1a" strokeWidth="2" />
                {/* Rising bid line */}
                <polyline points="0,140 60,132 120,118 180,100 240,85 300,75" fill="none" stroke="#d63859" strokeWidth="2" />
                {/* Convergence dot */}
                <circle cx="248" cy="87" r="5" fill="#d63859" />
              </svg>
              <div className="absolute top-0 right-0 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] text-neutral-600">
                  <span className="inline-block w-6 h-0.5 bg-neutral-900" /> PRI$OMETER™ Price
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-600">
                  <span className="inline-block w-6 h-0.5 bg-primary" /> Highest Bid
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                  <span className="inline-block w-6 border-t border-dashed border-neutral-400" /> Hidden Reserve
                </div>
              </div>
            </div>
            <p className="text-xs text-neutral-400 border-t border-neutral-100 pt-4">
              When the PRI$OMETER™ price meets the highest bid at or above the reserve, the sale can close automatically.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Seller Control ──────────────────────────────────────────────────
function SellerControl() {
  const points = [
    "Set a hidden reserve that is never disclosed to buyers",
    "Choose the 1stBid$ preview duration",
    "Choose the PRI$OMETER™ live duration",
    "Set a below-reserve drop allowance (10%, 15%, or 20%)",
    "Review and accept or decline below-reserve outcomes",
    "Add provenance, condition notes, and shipping information",
    "Track interest, bids, and watchers from the seller dashboard",
  ];

  return (
    <section id="control" className="bg-neutral-50 border-y border-neutral-200 py-20 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        <div className="space-y-6">
          <div>
            <Label>Seller Control</Label>
            <SectionHeading>You Stay In Control Where It Matters</SectionHeading>
          </div>
          <ul className="space-y-3">
            {points.map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-neutral-700 py-3 border-b border-neutral-200 last:border-0">
                <Check className="w-4 h-4 text-neutral-900 shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
          <p className="text-xs text-neutral-400 border-l-2 border-neutral-300 pl-4 leading-relaxed">
            The platform is designed to create momentum without forcing sellers to give up reasonable reserve protection.
          </p>
          <PrimaryBtn href="#apply">Create Seller Account <ChevronRight className="w-3.5 h-3.5" /></PrimaryBtn>
        </div>

        <div className="space-y-4">
          <div className="border border-neutral-200 bg-white p-6 space-y-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-400">Listing Studio Preview</p>
            <div className="space-y-3">
              {[
                ["1stBid$ Preview Duration", "14 days"],
                ["PRI$OMETER™ Duration", "21 days"],
                ["Start Price", "$9,500"],
                ["Hidden Reserve", "Protected"],
                ["Below-Reserve Allowance", "15%"],
                ["Price Floor", "$8,075"],
                ["Make It Mine", "Active"],
              ].map(([label, val]) => (
                <div key={label} className="flex items-center justify-between text-sm border-b border-neutral-100 pb-2.5 last:border-0">
                  <span className="text-neutral-500">{label}</span>
                  <span className={cn("font-semibold", val === "Protected" ? "text-neutral-400 italic" : "text-neutral-900")}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Categories ──────────────────────────────────────────────────────
function CategoriesSection() {
  const cats = [
    "Fine Art", "Decorative Arts", "Furniture", "Jewelry", "Silver",
    "Lighting", "Ceramics & Porcelain", "Glass", "Sculpture",
    "Rugs & Textiles", "Clocks & Watches", "Books & Manuscripts",
    "Fashion & Accessories", "Collectibles & Memorabilia",
  ];

  const abbrevs = {
    "Fine Art": "FA", "Decorative Arts": "DA", "Furniture": "FU",
    "Jewelry": "JW", "Silver": "SV", "Lighting": "LT",
    "Ceramics & Porcelain": "CP", "Glass": "GL", "Sculpture": "SC",
    "Rugs & Textiles": "RT", "Clocks & Watches": "CW",
    "Books & Manuscripts": "BM", "Fashion & Accessories": "FA",
    "Collectibles & Memorabilia": "CO",
  };

  return (
    <section id="categories" className="max-w-6xl mx-auto px-6 py-20 space-y-10">
      <div className="space-y-3">
        <Label>What We Accept</Label>
        <SectionHeading>Built For Valuable Personal Property</SectionHeading>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-px bg-neutral-200">
        {cats.map(cat => (
          <div key={cat} className="bg-white px-4 py-5 space-y-2 group hover:bg-neutral-50 transition-colors">
            <span className="font-mono text-[11px] font-bold text-neutral-300">{abbrevs[cat]}</span>
            <p className="text-xs font-semibold text-neutral-700 leading-snug">{cat}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 border-t border-neutral-100 pt-8">
        <p className="text-sm text-neutral-500 max-w-md leading-relaxed">
          If you are unsure where your item fits, start the seller application and we will guide you through the listing process.
        </p>
        <PrimaryBtn href="#apply">Submit An Item For Review <ChevronRight className="w-3.5 h-3.5" /></PrimaryBtn>
      </div>
    </section>
  );
}

// ─── Section: Comparison Table ────────────────────────────────────────────────
function ComparisonSection() {
  const rows = [
    {
      label: "Timing",
      trad: "Fixed sale date",
      market: "Passive listing",
      ev: "Preview phase + live PRI$OMETER™ event",
    },
    {
      label: "Buyer Behavior",
      trad: "Buyers wait until sale day",
      market: "Buyers browse casually",
      ev: "Bid early, watch price movement, or act instantly",
    },
    {
      label: "Seller Protection",
      trad: "Reserve may apply",
      market: "Seller controls price but lacks urgency",
      ev: "Hidden reserve, price floor, and seller review options",
    },
    {
      label: "Listing Quality",
      trad: "Handled by auction house",
      market: "Seller-created",
      ev: "Guided studio with structured fields and title generation",
    },
    {
      label: "Engagement",
      trad: "Concentrated during auction",
      market: "Often passive",
      ev: "Designed for active buyer participation",
    },
  ];

  return (
    <section className="bg-neutral-50 border-y border-neutral-200 py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="space-y-3">
          <Label>Comparison</Label>
          <SectionHeading>A Modern Alternative To Traditional Selling</SectionHeading>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left py-4 pr-6 text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 w-36">Aspect</th>
                <th className="text-left py-4 px-4 text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Traditional Auction</th>
                <th className="text-left py-4 px-4 text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400">Standard Marketplace</th>
                <th className="text-left py-4 px-4 text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-900 bg-neutral-100">Everything Valuable</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-neutral-100">
                  <td className="py-4 pr-6 text-xs font-bold text-neutral-500 uppercase tracking-wide align-top">{row.label}</td>
                  <td className="py-4 px-4 text-neutral-500 leading-relaxed align-top">{row.trad}</td>
                  <td className="py-4 px-4 text-neutral-500 leading-relaxed align-top">{row.market}</td>
                  <td className="py-4 px-4 text-neutral-900 font-semibold leading-relaxed align-top bg-neutral-100">{row.ev}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-center pt-4">
          <PrimaryBtn href="#apply">Start Selling With Everything Valuable <ChevronRight className="w-3.5 h-3.5" /></PrimaryBtn>
        </div>
      </div>
    </section>
  );
}

// ─── Section: Sign-Up Form ────────────────────────────────────────────────────
const SELLER_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "gallery", label: "Gallery" },
  { value: "dealer", label: "Dealer" },
  { value: "auction_house", label: "Auction House" },
  { value: "estate", label: "Estate" },
  { value: "other", label: "Other" },
];

const VALUE_RANGES = [
  "Under $1,000", "$1,000–$5,000", "$5,000–$25,000",
  "$25,000–$100,000", "Over $100,000", "Not Sure",
];

const lineInput = "w-full h-11 bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 text-sm text-neutral-800 placeholder:text-neutral-400 transition-colors";

function ApplyForm() {
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", seller_type: "",
    specialty: "", message: "", value_range: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.entities.SellerInquiry.create(form);
    setLoading(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto text-center py-16 space-y-5">
        <CheckCircle2 className="w-10 h-10 text-neutral-900 mx-auto" />
        <h3 className="text-xl font-bold text-neutral-900">Application Received</h3>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-sm mx-auto">
          Thank you for your interest. Our team will review your application and reach out within two business days.
        </p>
        <Link to="/browse" className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.15em] uppercase text-neutral-600 hover:text-neutral-900 underline underline-offset-4">
          Explore the Marketplace
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 block mb-2">Full Name *</label>
          <input className={lineInput} placeholder="Your full name" value={form.full_name} onChange={e => set("full_name", e.target.value)} required />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 block mb-2">Email Address *</label>
          <input type="email" className={lineInput} placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} required />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 block mb-2">Phone</label>
          <input className={lineInput} placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set("phone", e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 block mb-2">Seller Type</label>
          <select value={form.seller_type} onChange={e => set("seller_type", e.target.value)}
            className="w-full h-11 bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 text-sm text-neutral-800 transition-colors">
            <option value="">Select…</option>
            {SELLER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 block mb-2">Item Specialty</label>
          <input className={lineInput} placeholder="e.g. Post-War painting, Victorian jewelry…" value={form.specialty} onChange={e => set("specialty", e.target.value)} />
        </div>
        <div>
          <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 block mb-2">Estimated Value Range</label>
          <select value={form.value_range} onChange={e => set("value_range", e.target.value)}
            className="w-full h-11 bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 text-sm text-neutral-800 transition-colors">
            <option value="">Select…</option>
            {VALUE_RANGES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold tracking-[0.18em] uppercase text-neutral-400 block mb-2">Tell Us About Yourself</label>
        <textarea rows={4} className="w-full bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 text-sm text-neutral-800 placeholder:text-neutral-400 resize-none py-2 leading-relaxed transition-colors"
          placeholder="Background, notable items you've sold, or what you'd like to list…"
          value={form.message} onChange={e => set("message", e.target.value)} />
      </div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
        <PrimaryBtn type="submit" disabled={loading}>
          {loading ? "Submitting…" : "Request Seller Approval"} <ChevronRight className="w-3.5 h-3.5" />
        </PrimaryBtn>
        <Link to="/how-it-works" className="text-xs text-neutral-500 hover:text-neutral-800 underline underline-offset-4 transition-colors">
          Not Ready Yet? Learn How It Works
        </Link>
      </div>
      <p className="text-xs text-neutral-400 border-l-2 border-neutral-200 pl-4">
        Seller accounts are reviewed before approval to help maintain marketplace quality.
      </p>
      <p className="text-xs text-neutral-400">
        Already approved?{" "}
        <Link to="/seller/onboarding" className="text-neutral-700 hover:text-neutral-900 underline underline-offset-4">
          Complete your seller setup →
        </Link>
      </p>
    </form>
  );
}

function ApplySection() {
  return (
    <section id="apply" className="max-w-6xl mx-auto px-6 py-20 space-y-12">
      <div className="space-y-3">
        <Label>Seller Sign-Up</Label>
        <SectionHeading>Ready To Bring Your Items To Market?</SectionHeading>
        <p className="text-sm text-neutral-500 leading-relaxed max-w-lg">
          Create a seller account, submit your item details, and begin the approval process.
        </p>
      </div>
      <ApplyForm />
    </section>
  );
}

// ─── Section: Final CTA Band ──────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="bg-neutral-900 text-white py-20 px-6">
      <div className="max-w-3xl mx-auto text-center space-y-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
          Sell Smarter. Create Urgency.<br />Keep Control.
        </h2>
        <p className="text-neutral-400 text-base leading-relaxed max-w-xl mx-auto">
          Everything Valuable is designed for sellers who want a more dynamic way to sell valuable personal property without relying on passive listings or outdated auction formats.
        </p>
        <div className="flex flex-wrap gap-3 justify-center pt-2">
          <PrimaryBtn href="#apply">Start Selling <ChevronRight className="w-3.5 h-3.5" /></PrimaryBtn>
          <a href="#apply" className="inline-flex items-center gap-2 border border-white/30 text-white/80 hover:border-white/60 hover:text-white text-xs font-bold tracking-[0.15em] uppercase px-6 h-11 transition-colors">
            Submit An Item For Review
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Sticky CTA ───────────────────────────────────────────────────────────────
function StickyCTA() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Desktop sticky */}
      <div className={cn(
        "fixed bottom-8 right-8 z-50 transition-all duration-300 hidden md:block",
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      )}>
        <a href="#apply" className="flex items-center gap-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold tracking-[0.15em] uppercase px-6 h-11 shadow-lg transition-colors">
          Start Selling <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
      {/* Mobile sticky bar */}
      <div className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 safe-area-bottom",
        show ? "opacity-100 translate-y-0" : "opacity-100 translate-y-0"
      )}>
        <a href="#apply" className="flex items-center justify-center gap-2 bg-neutral-900 text-white text-xs font-bold tracking-[0.15em] uppercase h-14 transition-colors w-full">
          Request Seller Approval <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SellWithUs() {
  return (
    <div className="min-h-screen bg-white pb-14 md:pb-0">
      <StickyCTA />
      <Hero />
      <WhySellHere />
      <HowItWorks />
      <PrisometerSection />
      <SellerControl />
      <CategoriesSection />
      <ComparisonSection />
      <ApplySection />
      <FinalCTA />
    </div>
  );
}