import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock, TrendingDown, ShoppingBag, CheckCircle, Gavel, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    icon: CheckCircle,
    title: "Seller Lists the Item",
    description: "A verified seller creates a detailed listing with photos, description, provenance, and condition information. They set a PRI$OMETER start price, a hidden reserve, and choose how long each phase will last.",
  },
  {
    num: "02",
    icon: Clock,
    title: "1stBid$™ Preview Opens",
    description: "The item enters a preview bidding phase — similar to a traditional auction preview, but fully digital. Buyers can inspect the listing, ask questions, and place competitive bids. A visible countdown timer shows when the preview ends.",
  },
  {
    num: "03",
    icon: Gavel,
    title: "Buyers Place Preview Bids",
    description: "During the 1stBid$ period, buyers compete with transparent bidding. The highest bid is always visible. This phase builds competitive market intelligence before the live sale activates.",
  },
  {
    num: "04",
    icon: TrendingDown,
    title: "PRI$OMETER™ Activates",
    description: "When 1stBid$ ends, our proprietary PRI$OMETER technology takes over. Starting at the seller's visible price, it descends in real time. The price moves closer to its true market value with every passing moment.",
  },
  {
    num: "05",
    icon: ShoppingBag,
    title: "Make It Mine™ or Continue Bidding",
    description: "During the PRI$OMETER phase, buyers can place additional bids or use 'Make It Mine' to purchase instantly at the current price. Make It Mine pauses the PRI$OMETER for a 60-second confirmation window.",
  },
  {
    num: "06",
    icon: CheckCircle,
    title: "Sale Completes",
    description: "If the descending PRI$OMETER meets the highest bid at or above reserve, the item sells automatically. Below-reserve matches go to seller review. The seller can accept or decline. No sale occurs if the floor is reached without a match.",
  },
  {
    num: "07",
    icon: DollarSign,
    title: "Transparent Invoice",
    description: "There is no traditional buyer's premium. Make It Mine purchases include a transparent service fee — 50% of which is credited back to the buyer's final invoice. Shipping and taxes are billed separately.",
  },
];



export default function HowItWorks() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 md:py-28 text-center bg-muted/30 border-b border-border">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our Innovation</span>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold mt-4 text-foreground leading-tight">
            How Everything Valuable Works
          </h1>
          <p className="text-muted-foreground mt-6 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            A revolutionary two-phase selling system that finds the true market value of extraordinary objects — 
            transparently, intelligently, and without buyer's premiums.
          </p>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 space-y-0">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="relative flex gap-6 md:gap-10 pb-12 last:pb-0"
            >
              {/* Timeline */}
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <step.icon className="w-5 h-5 text-primary" />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-px flex-1 bg-border mt-3" />
                )}
              </div>
              {/* Content */}
              <div className="pt-1 pb-8">
                <span className="text-xs font-mono text-primary">Step {step.num}</span>
                <h3 className="font-serif text-xl md:text-2xl font-semibold mt-1 text-foreground">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2 max-w-lg">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Fee explanation */}
      <section className="py-16 md:py-24 bg-muted/30 border-t border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">Transparent Fee Structure</h2>
            <p className="text-muted-foreground mt-3 text-sm max-w-lg mx-auto">
              No buyer's premium. Just a clear, fair service fee with a built-in credit.
            </p>
          </div>

          <div className="bg-card rounded-2xl border border-border p-8 md:p-12 max-w-2xl mx-auto">
            <h3 className="font-serif text-xl font-semibold mb-6">Example: Make It Mine at $1,000</h3>
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Item Price</span>
                <span className="font-medium">$1,000</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-sm text-muted-foreground">Service Fee (10% + $30)</span>
                <span className="font-medium">$130</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border text-primary">
                <span className="text-sm">Fee Credit (50% back)</span>
                <span className="font-medium">-$65</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border">
                <span className="text-sm font-semibold">Final Invoice Total</span>
                <span className="font-semibold">$1,065</span>
              </div>
              <div className="flex justify-between py-3 border-b border-border text-muted-foreground">
                <span className="text-sm">Upfront Service Fee Already Paid</span>
                <span className="font-medium">-$130</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-sm font-bold">Remaining Due</span>
                <span className="font-serif text-xl font-bold">$935</span>
              </div>
              <p className="text-xs text-muted-foreground text-center pt-2">
                Shipping, taxes, and duties not included
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-semibold">Ready to Begin?</h2>
          <p className="text-muted-foreground mt-3 text-sm">
            Join the marketplace that puts transparency, elegance, and true value first.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/browse">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-full px-8 h-11">
                Start Browsing <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/seller">
              <Button variant="outline" className="rounded-full px-8 h-11">Sell With Us</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}