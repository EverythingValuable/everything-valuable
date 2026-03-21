import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Pricing() {
  return (
    <div>
      <section className="py-20 md:py-28 text-center bg-muted/30 border-b border-border">
        <div className="max-w-3xl mx-auto px-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Transparent Pricing</span>
          <h1 className="font-serif text-4xl md:text-6xl font-semibold mt-4 text-foreground">
            No Buyer's Premium. Ever.
          </h1>
          <p className="text-muted-foreground mt-6 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
            We've eliminated the traditional auction buyer's premium. Our innovative fee structure 
            is transparent, fair, and designed to benefit both buyers and sellers.
          </p>
        </div>
      </section>

      {/* For Buyers */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-2 gap-12 md:gap-20">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-serif text-3xl font-semibold mb-6">For Buyers</h2>
            <div className="space-y-4">
              {[
                "No buyer's premium on any purchase",
                "Transparent service fee only on Make It Mine™ purchases",
                "Service fee formula: 10% of item price + $30 flat",
                "50% of the service fee is credited back to your final invoice",
                "Shipping, taxes, and duties billed separately and clearly",
                "Full buyer protection on every transaction",
                "Secure, encrypted payment processing",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <h2 className="font-serif text-3xl font-semibold mb-6">For Sellers</h2>
            <div className="space-y-4">
              {[
                "Free listing creation and photo uploads",
                "Full control over start price, reserve, and timing",
                "Proprietary PRI$OMETER™ technology finds true value",
                "1stBid$™ preview builds competitive bidding",
                "Review and approve below-reserve offers",
                "Dashboard analytics and performance tracking",
                "Invoice management and payout support",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Fee breakdown visual */}
      <section className="py-16 md:py-24 bg-foreground text-background">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mb-4">How the Fee Works</h2>
          <p className="text-background/60 mb-12 max-w-lg mx-auto text-sm">
            Our innovative split-fee model ensures fairness. Half the processing fee comes back to you.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Make It Mine", desc: "Click at the current PRI$OMETER price to secure the item instantly." },
              { step: "2", title: "Service Fee Charged", desc: "A transparent fee of 10% + $30 is charged upfront. No hidden costs." },
              { step: "3", title: "50% Credited Back", desc: "Half of the fee is applied as a credit to your final invoice." },
            ].map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl border border-background/10 bg-background/5"
              >
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-serif text-xl font-bold mx-auto mb-4">
                  {s.step}
                </div>
                <h3 className="font-serif text-lg font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-background/60">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="font-serif text-3xl font-semibold">Start Today</h2>
          <p className="text-muted-foreground mt-3 text-sm">
            Join a marketplace built on transparency and trust.
          </p>
          <div className="flex justify-center gap-4 mt-8">
            <Link to="/browse">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 rounded-full px-8 h-11">
                Browse Now <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/seller">
              <Button variant="outline" className="rounded-full px-8 h-11">Become a Seller</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}