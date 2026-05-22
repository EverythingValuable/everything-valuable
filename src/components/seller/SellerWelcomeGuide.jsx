import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp, CheckCircle2, ArrowRight, Settings, User, Plus, Tag, FileText, Gavel, DollarSign, Package } from "lucide-react";

const SETUP_STEPS = [
  {
    number: "01",
    icon: Settings,
    title: "Configure Your Settings First",
    description: "Before creating any listings, set up your account defaults. This saves you time on every listing.",
    href: "/seller?view=settings",
    linkLabel: "Go to Settings →",
    items: [
      { label: "Display Name", detail: "The name buyers see on your listings and seller page." },
      { label: "Bid Increment Tiers", detail: "Define how much the price steps up at each bid range (e.g. $50 below $1k, $100 from $1k–$5k)." },
      { label: "Default Below-Reserve %", detail: "The maximum percentage a buyer can offer below your hidden reserve." },
      { label: "Payment Instructions", detail: "Wire transfer details, PayPal, Zelle — auto-filled on every invoice." },
      { label: "Terms & Conditions", detail: "Your standard sale terms. Automatically applied to each listing." },
      { label: "Default Shipping Info", detail: "Shipping policy text that pre-fills on every new item." },
      { label: "Default 1stBids & PRI$OMETER Durations", detail: "Set your preferred auction window lengths so you don't have to change them each time." },
    ],
  },
  {
    number: "02",
    icon: User,
    title: "Build Your Seller Profile",
    description: "Your public profile is your storefront on Everything Valuable. Make it compelling.",
    href: "/seller?view=profile",
    linkLabel: "Go to Seller Profile →",
    items: [
      { label: "Logo & Banner", detail: "Upload your business logo and a banner image for your public profile page." },
      { label: "Bio & About", detail: "Tell buyers who you are — your specialty, your history, what makes your inventory special." },
      { label: "Specialties", detail: "Tag the categories you focus on so buyers can find you through discovery." },
      { label: "Website & Instagram", detail: "Link your external presence to build trust and drive follow-on traffic." },
      { label: "Location", detail: "Your default item location shown to buyers for shipping estimates." },
    ],
  },
  {
    number: "03",
    icon: Plus,
    title: "Create Your First Listing",
    description: "Use the Listing Studio to craft a complete, compelling listing. Quality listings sell faster.",
    href: "/seller/studio",
    linkLabel: "Open Listing Studio →",
    items: [
      { label: "Photos First", detail: "Add 5–10 high-quality images. The first photo is your cover shot — use your strongest image." },
      { label: "Title", detail: "Lead with the maker or artist name. Include medium, period, and style for searchability." },
      { label: "Condition & Provenance", detail: "Be honest and precise. Buyers rely on your condition report to bid with confidence." },
      { label: "Pricing", detail: "Set your PRI$OMETER™ starting price, hidden reserve, and estimate range. Use the below-reserve drop % to control the floor." },
      { label: "1stBids™ Duration", detail: "Choose how long your item previews before going live. 7, 14, or 30 days." },
      { label: "Custom Tracking Fields", detail: "Add internal fields like 'Purchase Price', 'Acquired From', or 'Storage Location' — only visible to you." },
    ],
  },
  {
    number: "04",
    icon: Gavel,
    title: "Understand the Auction Flow",
    description: "Everything Valuable uses a unique two-phase model. Here's how your item moves from listing to sale.",
    href: "/how-it-works",
    linkLabel: "Full How It Works →",
    items: [
      { label: "Draft → 1stBids™", detail: "Publish your listing directly into the 1stBids™ preview phase — no review required." },
      { label: "1stBids™ Preview Phase", detail: "Buyers can watch, follow, and submit opening bids. No price is visible — just interest. This builds an audience before your item goes live." },
      { label: "PRI$OMETER™ Live Phase", detail: "The live auction clock starts. Buyers bid openly. The price moves in real-time based on your increment tiers." },
      { label: "Make It Mine™", detail: "At any point, a buyer can purchase at your asking price — always on by default." },
      { label: "Hidden Reserve", detail: "Your reserve is never shown to buyers. The price can drop to a floor (your reserve minus the drop %), but never below." },
      { label: "Sold / Unsold", detail: "When the auction ends, your item is marked sold (invoice generated) or unsold (relist anytime)." },
    ],
  },
  {
    number: "05",
    icon: DollarSign,
    title: "Managing Invoices & Payments",
    description: "After a sale, generate and send invoices directly from the platform.",
    href: "/seller?view=invoices",
    linkLabel: "Go to Invoices →",
    items: [
      { label: "Auto-Generated Invoices", detail: "When an item sells, an invoice draft is created automatically with buyer details." },
      { label: "Customize Before Sending", detail: "Add shipping charges, taxes, discounts, or custom line items before sending." },
      { label: "Mark as Paid / Shipped", detail: "Track payment and fulfillment status for every sale." },
      { label: "Invoice Templates", detail: "Set up reusable templates in Settings to speed up your invoicing workflow." },
    ],
  },
  {
    number: "06",
    icon: Package,
    title: "Consignments",
    description: "Selling on behalf of a client? Use the Consignors module to track commissions and payouts.",
    href: "/seller?view=consignors",
    linkLabel: "Go to Consignors →",
    items: [
      { label: "Add a Consignor", detail: "Create a contact record with their name, email, address, and default commission %." },
      { label: "Link Items", detail: "When creating a listing, set ownership to 'Consignment' and select or fill in the consignor." },
      { label: "Commission Tracking", detail: "The system calculates the estimated consignor payout at any price point." },
      { label: "Contract Mailing", detail: "Mark when a consignment contract has been sent for your records." },
    ],
  },
];

const FAQ = [
  {
    q: "When does my item become visible to buyers?",
    a: "As soon as you publish a listing, it enters the 1stBids™ preview phase. Buyers can watch it and submit opening bids, but no price is shown. It becomes fully live in PRI$OMETER™ mode after the preview period ends.",
  },
  {
    q: "What is the hidden reserve and how does it work?",
    a: "Your reserve is a private minimum price you set. It's never disclosed to buyers. During the PRI$OMETER™ phase, the price can descend toward a floor (your reserve minus the below-reserve drop %). If no bid meets the reserve, you can relist or accept the highest offer.",
  },
  {
    q: "Can I edit a listing after it's live?",
    a: "Yes, but with restrictions. Once an item is live (in 1stBids™ or PRI$OMETER™), you can update photos, description, condition notes, and category. Pricing and auction settings are locked to protect bidder trust.",
  },
  {
    q: "How do bid increment tiers work?",
    a: "You define ranges in Settings — for example: $50 increments below $1,000, $100 increments from $1,000–$5,000, and $250 above. These automatically govern how the price moves with each bid.",
  },
  {
    q: "What does 'Make It Mine™' mean?",
    a: "Make It Mine™ is always-on and allows a buyer to immediately purchase your item at your PRI$OMETER™ asking price — no bidding required. It's on by default and cannot be turned off.",
  },
  {
    q: "How do I get paid?",
    a: "After an item sells, you generate and send an invoice through the platform. Payment is handled directly between you and the buyer based on your payment instructions (wire, Zelle, PayPal, etc.) set in your Settings.",
  },
  {
    q: "Can I relist an unsold item?",
    a: "Yes. Go to your Unsold Items view, open the listing in the Listing Studio, and click 'Relist Listing'. You can adjust pricing or details before re-publishing.",
  },
  {
    q: "What's the difference between Seller Profile and Settings?",
    a: "Seller Profile is your public-facing page — logo, bio, specialties, social links. Settings is your private operational configuration — bid increments, invoice defaults, payment instructions, and auction durations.",
  },
];

function SetupStep({ step, index }) {
  const [open, setOpen] = useState(index === 0);
  const Icon = step.icon;

  return (
    <div className="border border-border bg-white rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-5 p-6 text-left hover:bg-muted/20 transition-colors"
      >
        <span className="font-serif text-4xl leading-none text-muted-foreground/20 tabular-nums shrink-0 mt-1">{step.number}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Icon className="w-4 h-4 text-primary shrink-0" />
            <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
        </div>
        <div className="shrink-0 mt-1">
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </button>

      {open && (
        <div className="px-6 pb-6 border-t border-border pt-5 space-y-4">
          <ul className="space-y-3">
            {step.items.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                  <span className="text-sm text-muted-foreground ml-2">— {item.detail}</span>
                </div>
              </li>
            ))}
          </ul>
          <Link
            to={step.href}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-2"
          >
            {step.linkLabel} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function FAQItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border bg-white rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-muted/20 transition-colors"
      >
        <span className="text-sm font-semibold text-foreground leading-snug">{item.q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />}
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border pt-4">
          <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
        </div>
      )}
    </div>
  );
}

export default function SellerWelcomeGuide() {
  return (
    <div className="max-w-3xl space-y-10">

      {/* Hero */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 px-8 py-8">
        <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary/70 mb-2">Getting Started</p>
        <h2 className="font-serif text-3xl font-semibold text-foreground mb-3">Welcome to Everything Valuable</h2>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Follow the steps below to configure your account, build your seller profile, and create your first listing. 
          We recommend completing Setup Steps 1 and 2 before adding any items — it will save you significant time.
        </p>
        <div className="flex flex-wrap gap-3 mt-5">
          <Link to="/seller?view=settings">
            <button className="flex items-center gap-2 bg-primary text-white text-xs font-semibold tracking-wide px-4 h-9 rounded-lg hover:bg-primary/90 transition-colors">
              <Settings className="w-3.5 h-3.5" /> Start with Settings
            </button>
          </Link>
          <Link to="/seller?view=profile">
            <button className="flex items-center gap-2 border border-border bg-white text-foreground text-xs font-semibold tracking-wide px-4 h-9 rounded-lg hover:bg-muted/50 transition-colors">
              <User className="w-3.5 h-3.5" /> Set Up Your Profile
            </button>
          </Link>
          <Link to="/seller/studio">
            <button className="flex items-center gap-2 border border-border bg-white text-foreground text-xs font-semibold tracking-wide px-4 h-9 rounded-lg hover:bg-muted/50 transition-colors">
              <Plus className="w-3.5 h-3.5" /> Create a Listing
            </button>
          </Link>
        </div>
      </div>

      {/* Setup Steps */}
      <div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-1">Setup Walkthrough</h3>
        <p className="text-sm text-muted-foreground mb-5">Complete these steps in order for the smoothest experience.</p>
        <div className="space-y-3">
          {SETUP_STEPS.map((step, i) => (
            <SetupStep key={step.number} step={step} index={i} />
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="font-serif text-xl font-semibold text-foreground mb-1">Frequently Asked Questions</h3>
        <p className="text-sm text-muted-foreground mb-5">Answers to the most common seller questions.</p>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <FAQItem key={i} item={item} />
          ))}
        </div>
      </div>

    </div>
  );
}