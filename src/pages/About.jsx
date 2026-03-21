import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown, Shield, Lock, Award, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What is the PRI$OMETER?",
    a: "The PRI$OMETER is our proprietary, patented descending-price engine. After the 1stBid$ preview period ends, the PRI$OMETER activates at a seller-defined start price and descends over time. When it reaches the highest qualified bid at or above the reserve, the item sells automatically. It's a transparent, fair, and exciting way to discover an item's true market value.",
  },
  {
    q: "What is 1stBid$?",
    a: "1stBid$ is our preview bidding phase — similar to a traditional auction preview, but digital. Buyers can inspect listings, place competitive bids, and follow items before the PRI$OMETER live phase begins. It builds competitive intelligence and gives buyers time to make informed decisions.",
  },
  {
    q: "What is Make It Mine?",
    a: "Make It Mine is a premium instant-purchase option available during the PRI$OMETER phase. Click it to secure an item at the current descending price. A transparent service fee applies (10% of price + $30), with 50% of that fee credited back to your final invoice. There's a 60-second confirmation window.",
  },
  {
    q: "Is there a buyer's premium?",
    a: "No. Everything Valuable has eliminated the traditional buyer's premium entirely. The only fee a buyer may encounter is the transparent service fee when using Make It Mine — and half of that is credited back.",
  },
  {
    q: "How are sellers vetted?",
    a: "All sellers undergo a verification process before listing on Everything Valuable. We review identity, business credentials, and transaction history to ensure our marketplace maintains the highest standards of trust and quality.",
  },
  {
    q: "What happens if a bid is below reserve?",
    a: "If the PRI$OMETER descends to the highest bid but that bid is below the seller's hidden reserve, the sale becomes pending seller review. The seller can choose to accept or decline the offer. If declined, no sale occurs.",
  },
  {
    q: "Is shipping insured?",
    a: "Full-value shipping insurance is available on all transactions. Shipping costs, insurance, taxes, and duties are billed separately from the purchase price and clearly itemized.",
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border">
      <button
        className="w-full flex items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-medium text-sm text-foreground pr-4">{faq.q}</span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform flex-shrink-0 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="text-sm text-muted-foreground leading-relaxed pb-5">{faq.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="py-20 md:py-28 text-center bg-muted/30 border-b border-border">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">About Us</span>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold mt-4 text-foreground leading-tight">
            Redefining Luxury Commerce
          </h1>
          <p className="text-muted-foreground mt-6 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            Everything Valuable was founded on a simple belief: extraordinary objects deserve 
            an extraordinary selling experience — one that's transparent, intelligent, and fair.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-3xl font-semibold mb-6">Our Mission</h2>
            <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                The world of art, antiques, and luxury objects has operated on the same model for centuries. 
                Opaque pricing, hefty buyer's premiums, and limited access have kept the market exclusive — 
                but not always fair.
              </p>
              <p>
                Everything Valuable changes that. Our proprietary PRI$OMETER™ technology introduces 
                real-time price discovery that benefits both buyers and sellers. Our 1stBid$™ preview 
                system builds transparent competition. And our Make It Mine™ feature gives buyers 
                the power to act decisively.
              </p>
              <p>
                The result? A marketplace where true value emerges naturally, fees are transparent, 
                and every participant — from seasoned collectors to first-time buyers — feels confident.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Shield, title: "Trust First", desc: "Every seller is vetted. Every transaction is protected." },
              { icon: Lock, title: "Secure by Design", desc: "End-to-end encryption on all payments and data." },
              { icon: Award, title: "No Buyer's Premium", desc: "We've eliminated the most painful fee in the industry." },
              { icon: Globe, title: "Global Reach", desc: "Connect with collectors and sellers worldwide." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-xl bg-muted/50 border border-border"
              >
                <item.icon className="w-5 h-5 text-primary mb-3" />
                <h4 className="font-medium text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-24 bg-muted/30 border-t border-border">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="font-serif text-3xl md:text-4xl font-semibold">Frequently Asked Questions</h2>
          </div>
          <div>
            {faqs.map((faq, i) => (
              <FAQItem key={i} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 md:py-24 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-semibold">Have Questions?</h2>
          <p className="text-muted-foreground mt-3 text-sm">
            Our concierge team is here to help. We're available Monday through Saturday.
          </p>
          <p className="text-primary font-medium mt-4">concierge@everythingvaluable.com</p>
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/browse">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-full px-8 h-11">
                Explore <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}