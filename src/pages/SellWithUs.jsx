import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  TrendingDown, Shield, DollarSign, Users, Star,
  CheckCircle2, ChevronRight, Award, Globe, Clock
} from "lucide-react";

const WHY_ITEMS = [
  {
    icon: TrendingDown,
    title: "PRI$OMETER™ Technology",
    desc: "Our proprietary descending-price engine creates urgency and maximizes realized prices — often above traditional auction estimates."
  },
  {
    icon: Users,
    title: "Qualified Buyer Network",
    desc: "Every buyer on Everything Valuable is vetted. You sell to serious collectors, not browsers."
  },
  {
    icon: DollarSign,
    title: "Transparent, Seller-Friendly Fees",
    desc: "No upfront listing fees. Our commission is only charged on successful sales. You keep the majority of every sale."
  },
  {
    icon: Shield,
    title: "Secure & Insured",
    desc: "Every transaction is secured end-to-end. Shipments are fully insured. You're covered at every step."
  },
  {
    icon: Globe,
    title: "Global Reach",
    desc: "Your items are discovered by collectors worldwide. No geographic limitations, no local auction house constraints."
  },
  {
    icon: Clock,
    title: "You Control the Timeline",
    desc: "Set your own 1stBid$ preview window and PRI$OMETER duration. Your item sells on your schedule."
  },
];

const STATS = [
  { value: "$2.4M+", label: "In sales processed" },
  { value: "3,200+", label: "Registered collectors" },
  { value: "98%", label: "Seller satisfaction" },
  { value: "48hrs", label: "Avg. time to sale" },
];

const SELLER_TYPES = [
  { value: "individual", label: "Individual" },
  { value: "gallery", label: "Gallery" },
  { value: "dealer", label: "Dealer" },
  { value: "auction_house", label: "Auction House" },
  { value: "estate", label: "Estate" },
  { value: "other", label: "Other" },
];

export default function SellWithUs() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", seller_type: "", specialty: "", message: "" });
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

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative overflow-hidden bg-foreground text-background py-24 px-6">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1400')",
          backgroundSize: "cover", backgroundPosition: "center"
        }} />
        <div className="relative max-w-3xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-background/20 text-xs text-background/70 mb-2">
            <Award className="w-3.5 h-3.5" />
            Invite-Only Seller Platform
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold leading-tight">
            Sell What Others<br />Can't Value Properly
          </h1>
          <p className="text-lg text-background/70 leading-relaxed max-w-xl mx-auto">
            Everything Valuable was built for sellers of extraordinary objects. Our PRI$OMETER™ technology consistently outperforms traditional auction estimates.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="#apply">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 text-base gap-2">
                Apply to Sell <ChevronRight className="w-4 h-4" />
              </Button>
            </a>
            <Link to="/how-it-works">
              <Button variant="outline" className="border-background/30 text-background hover:bg-background/10 h-12 px-8 text-base bg-transparent">
                How It Works
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* Why sell here */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold">Why Sell with Everything Valuable?</h2>
          <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
            We've reimagined every part of the selling experience — from pricing to payment to protection.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WHY_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-border bg-card p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works (condensed) */}
      <section className="bg-secondary/40 border-y border-border py-16 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold text-center mb-10">The Selling Process</h2>
          <div className="space-y-4">
            {[
              ["Apply & Verify", "Submit your inquiry. Our team reviews your application and verifies your identity within 48 hours."],
              ["List in the Studio", "Upload photos, write your description, and configure your PRI$OMETER settings using our guided Listing Studio."],
              ["1stBid$™ Preview", "Buyers place advance bids during your preview window, building interest before the live phase."],
              ["PRI$OMETER™ Goes Live", "Price descends live from your start price toward the floor. The first buyer to claim it — wins it."],
              ["Sale & Payout", "When a transaction is initiated, the sale remains directly between buyer and seller. Everything Valuable provides the tools to generate invoices and support the payment process. The platform allows you to issue an invoice and collect payment on your own terms."],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="font-medium text-sm">{title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section id="apply" className="max-w-2xl mx-auto px-6 py-20">
        <div className="text-center mb-10">
          <h2 className="font-serif text-3xl font-semibold">Apply to Sell</h2>
          <p className="text-muted-foreground mt-2">Tell us a little about yourself. Our team will be in touch within 2 business days.</p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-12 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h3 className="font-serif text-2xl font-semibold">Application Received</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Thank you for your interest. Our team will review your application and reach out within 2 business days.
            </p>
            <Link to="/browse">
              <Button variant="outline" className="mt-2">Explore the Marketplace</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-8 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Full Name *</label>
                <Input placeholder="Your name" value={form.full_name} onChange={e => set("full_name", e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Email Address *</label>
                <Input type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Phone (optional)</label>
                <Input placeholder="+1 (555) 000-0000" value={form.phone} onChange={e => set("phone", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Seller Type</label>
                <select value={form.seller_type} onChange={e => set("seller_type", e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                  <option value="">Select…</option>
                  {SELLER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">What do you specialize in?</label>
              <Input placeholder="e.g. Post-War European painting, Victorian jewelry, Studio ceramics…" value={form.specialty} onChange={e => set("specialty", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Tell us about yourself</label>
              <Textarea placeholder="A brief background, notable pieces you've sold, or why you'd like to sell with Everything Valuable…" value={form.message} onChange={e => set("message", e.target.value)} className="h-28" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-12 text-base gap-2">
              {loading ? "Submitting…" : "Submit Application"}
              <ChevronRight className="w-4 h-4" />
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Already approved? <Link to="/seller/onboarding" className="text-primary hover:underline">Complete your seller setup →</Link>
            </p>
          </form>
        )}
      </section>
    </div>
  );
}