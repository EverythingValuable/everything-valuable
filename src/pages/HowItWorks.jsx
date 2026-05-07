import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, TrendingDown, ShoppingBag, FileText, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import AuctionSimulator from "../components/hiw/AuctionSimulator";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stepData = [
  {
    num: "01",
    title: "Seller Creates the Listing",
    description: "A verified seller lists an item with photographs, description, condition details, provenance when available, and seller-specific terms. The seller sets a PRI$OMETER start price, hidden reserve, and sale timing.",
  },
  {
    num: "02",
    title: "1stBid$™ Preview Opens",
    description: "The item enters a preview bidding period. Buyers can review the listing, ask questions when available, and place early bids before live pricing begins.",
  },
  {
    num: "03",
    title: "Buyers Compete During Preview",
    description: "Preview bids help reveal demand before the live phase. The highest preview bid is visible, allowing buyers to understand where the market is forming.",
  },
  {
    num: "04",
    title: "Preview Result Is Checked",
    description: "When the preview countdown ends, the system checks the highest bid against the PRI$OMETER start price. If the high bid meets or exceeds the start price, the item may sell without entering the PRI$OMETER phase.",
  },
  {
    num: "05",
    title: "PRI$OMETER™ Activates If Needed",
    description: "If the preview high bid is below the PRI$OMETER start price, the PRI$OMETER begins. The visible price descends in real time, moving closer to the strongest market bid.",
  },
  {
    num: "06",
    title: "Buyers Can Bid or Make It Mine™",
    description: "During the PRI$OMETER phase, buyers can continue placing bids or use Make It Mine™ to purchase immediately at the current displayed price.",
  },
  {
    num: "07",
    title: "Sale Is Completed or Reviewed",
    description: "If the PRI$OMETER price meets the highest qualifying bid at or above reserve, the item sells automatically. If the match is below reserve, the seller may review and decide whether to accept.",
  },
  {
    num: "08",
    title: "Invoice, Payment, and Fulfillment",
    description: "Everything Valuable provides marketplace tools, invoicing support, and payment coordination. The sale remains directly between buyer and seller. Shipping, taxes, duties, pickup, and fulfillment terms are set by the seller.",
  },
];

const phaseCards = [
  {
    icon: Zap,
    title: "1stBid$™ Preview",
    description: "A digital preview and early bidding phase where buyers compete before live pricing begins.",
  },
  {
    icon: TrendingDown,
    title: "PRI$OMETER™ Pricing",
    description: "A live descending price designed to move toward the market instead of relying on a fixed asking price.",
  },
  {
    icon: ShoppingBag,
    title: "Make It Mine™",
    description: "An instant-purchase action that lets a buyer claim the item at the current PRI$OMETER price.",
  },
];

const buyerBenefits = [
  "Place early bids during the 1stBid$™ preview.",
  "Watch the PRI$OMETER price move in real time.",
  "Use Make It Mine™ to claim an item instantly.",
  "See clearer pricing without a traditional buyer's premium.",
  "Review seller terms before committing.",
];

const sellerBenefits = [
  "Set a start price, reserve, and sale duration.",
  "Use preview bidding to measure early demand.",
  "Let PRI$OMETER pricing move toward the market.",
  "Review below-reserve outcomes when needed.",
  "Sell through a more transparent marketplace structure.",
];

export default function HowItWorks() {
  return (
    <div className="bg-background">
      {/* ===== HERO ===== */}
      <section className="py-20 md:py-32 border-b border-border/50">
        <motion.div className="max-w-4xl mx-auto px-6 text-center" variants={containerVariants} initial="hidden" animate="visible">
          <motion.h1 variants={itemVariants} className="font-serif text-4xl md:text-6xl font-semibold text-foreground leading-tight">
            How Everything Valuable Works
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg md:text-xl text-muted-foreground mt-6 leading-relaxed max-w-2xl mx-auto">
            A smarter way to discover market value for art, antiques, collectibles, design, jewelry, and other valuable objects.
          </motion.p>
          <motion.p variants={itemVariants} className="text-base text-muted-foreground mt-5 max-w-xl mx-auto leading-relaxed">
            Everything Valuable combines preview bidding, live descending pricing, and instant-purchase technology to create a more transparent selling experience — without the confusion of traditional auction premiums.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link to="/browse">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-8 rounded-lg">
                Browse Items <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/sell">
              <Button variant="outline" className="h-12 px-8 rounded-lg">
                Sell With Us
              </Button>
            </Link>
          </motion.div>
          <motion.p variants={itemVariants} className="text-xs text-muted-foreground mt-8 italic">
            Preview. Bid. Watch the market move. Buy with confidence.
          </motion.p>
        </motion.div>
      </section>

      {/* ===== INTERACTIVE DEMO ===== */}
      <section className="py-20 md:py-28 border-b border-border/50 bg-muted/20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Interactive Demo</span>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mt-3">
              Try It Yourself
            </h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto text-base leading-relaxed">
              Set the prices, place bids, and watch the PRI$OMETER™ activate in real time. No account needed.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <AuctionSimulator />
          </motion.div>
        </div>
      </section>

      {/* ===== THE BIG IDEA ===== */}
      <section className="py-24 md:py-32 border-b border-border/50">
        <motion.div className="max-w-5xl mx-auto px-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="text-center mb-14">
            <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              Two Phases. One Clear Market Signal.
            </motion.h2>
            <motion.div variants={itemVariants} className="mt-8 space-y-5 max-w-3xl mx-auto text-base text-muted-foreground leading-relaxed">
              <p>
                Every listing begins with a preview bidding period called <span className="font-semibold text-foreground">1stBid$™</span>. Buyers can place early bids, see the current high bid, and signal demand before live pricing begins. If bidding reaches or exceeds the PRI$OMETER™ start price before the preview ends, the item can sell without needing the PRI$OMETER phase.
              </p>
              <p>
                If the highest preview bid is below the PRI$OMETER start price, the <span className="font-semibold text-foreground">PRI$OMETER activates</span>. The visible price begins descending in real time until a buyer chooses <span className="font-semibold text-foreground">Make It Mine™</span>, or until the descending price meets the highest qualifying bid.
              </p>
            </motion.div>
          </div>

          {/* Three Phase Cards */}
          <motion.div variants={containerVariants} className="grid md:grid-cols-3 gap-6 mt-12">
            {phaseCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <motion.div key={i} variants={itemVariants} className="bg-card rounded-xl border border-border/50 p-8 hover:shadow-lg hover:border-border transition-all duration-300">
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-3">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== HOW THE SALE FLOWS ===== */}
      <section className="py-24 md:py-32 border-b border-border/50 bg-muted/20">
        <motion.div className="max-w-5xl mx-auto px-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">How the Sale Flows</h2>
          </motion.div>

          <motion.div variants={containerVariants} className="space-y-6">
            {stepData.map((step, i) => (
              <motion.div key={step.num} variants={itemVariants} className="flex gap-6 md:gap-8">
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <span className="font-serif text-lg font-semibold text-primary">{step.num}</span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ===== SIMPLE FEE STRUCTURE ===== */}
      <section className="py-24 md:py-32 border-b border-border/50">
        <motion.div className="max-w-4xl mx-auto px-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <div className="text-center mb-12">
            <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
              Simple Fee Structure
            </motion.h2>
            <motion.p variants={itemVariants} className="text-base text-muted-foreground mt-4 max-w-2xl mx-auto leading-relaxed">
              Everything Valuable does not use a traditional buyer's premium. Instead, buyers pay a clear service fee when they commit to a purchase. A portion of that fee is credited back on the final invoice.
            </motion.p>
          </div>

          {/* Fee Example Card */}
          <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border/50 p-8 md:p-10 max-w-2xl mx-auto shadow-sm hover:shadow-md transition-shadow">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-8">Example: Item Purchased at $1,000</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Item Price</span>
                <span className="font-semibold text-foreground">$1,000</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Service Fee Paid Upfront</span>
                <span className="font-semibold text-foreground">$130</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/50 bg-primary/5 px-3 rounded">
                <span className="text-sm text-foreground font-medium">Fee Credit Applied to Invoice</span>
                <span className="font-semibold text-primary">-$65</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/50">
                <span className="text-sm text-foreground font-medium">Final Invoice Before Shipping/Taxes</span>
                <span className="font-semibold text-foreground">$1,065</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border/50 text-muted-foreground">
                <span className="text-sm">Amount Already Paid</span>
                <span className="font-medium">-$130</span>
              </div>
              <div className="flex justify-between items-center py-4 bg-muted/30 px-3 rounded-lg">
                <span className="text-sm font-semibold text-foreground">Remaining Balance Due</span>
                <span className="font-serif text-lg font-semibold text-foreground">$935</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center pt-6 border-t border-border/50 mt-6">
              In this example, the buyer pays the service fee upfront when committing to the item. Half of that fee is credited back on the final invoice, reducing the remaining balance due.
            </p>
            <p className="text-xs text-muted-foreground text-center pt-4 italic">
              Shipping, taxes, duties, storage, pickup, and seller-specific charges are not included in this example and may vary by listing.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FOR BUYERS / FOR SELLERS ===== */}
      <section className="py-24 md:py-32 border-b border-border/50 bg-muted/20">
        <motion.div className="max-w-5xl mx-auto px-6" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.div variants={itemVariants} className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">What You'll Experience</h2>
          </motion.div>

          <motion.div variants={containerVariants} className="grid md:grid-cols-2 gap-8">
            {/* For Buyers */}
            <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border/50 p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-foreground">For Buyers</h3>
              </div>
              <ul className="space-y-3">
                {buyerBenefits.map((benefit, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* For Sellers */}
            <motion.div variants={itemVariants} className="bg-card rounded-xl border border-border/50 p-8 md:p-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-2xl font-semibold text-foreground">For Sellers</h3>
              </div>
              <ul className="space-y-3">
                {sellerBenefits.map((benefit, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                    <span className="text-sm text-muted-foreground">{benefit}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 md:py-32">
        <motion.div className="max-w-3xl mx-auto px-6 text-center" variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true }}>
          <motion.h2 variants={itemVariants} className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Discover Value in Motion
          </motion.h2>
          <motion.p variants={itemVariants} className="text-base text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed">
            Everything Valuable is built for sellers who want stronger market feedback and buyers who want a clearer way to compete for exceptional objects.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 mt-10">
            <Link to="/browse">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-12 px-8 rounded-lg">
                Browse Items <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/sell">
              <Button variant="outline" className="h-12 px-8 rounded-lg">
                Start Selling
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}