import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, TrendingDown, ShoppingBag, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    icon: Clock,
    title: "1stBid$™ Preview",
    description: "Place early bids during the preview period. Like a traditional auction preview, but smarter — building transparency and competitive bidding before the live phase.",
    accent: "bg-primary/10 text-primary",
  },
  {
    icon: TrendingDown,
    title: "PRI$OMETER™ Live",
    description: "Our patented price engine activates. Watch the price descend in real time. When it meets the highest qualified bid, the sale executes automatically.",
    accent: "bg-red-50 text-red-600",
  },
  {
    icon: ShoppingBag,
    title: "Make It Mine™",
    description: "Can't wait? Secure any item instantly during the PRI$OMETER phase. Pay a transparent service fee — half credited back to your invoice. No buyer's premium.",
    accent: "bg-emerald-50 text-emerald-600",
  },
];

export default function HowItWorksPreview() {
  return (
    <section className="py-20 md:py-28 bg-muted/50">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our Innovation</span>
          <h2 className="font-serif text-3xl md:text-5xl font-semibold mt-3 text-foreground">
            A Smarter Way to Buy & Sell
          </h2>
          <p className="text-muted-foreground mt-4 text-sm md:text-base leading-relaxed">
            Every item is its own dynamic sale event. Two proprietary phases work together 
            to find the true value of extraordinary objects.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-card rounded-2xl p-8 border border-border hover:shadow-lg transition-shadow duration-500"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.accent} mb-6`}>
                <step.icon className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-xl font-semibold mb-3 text-foreground">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/how-it-works">
            <Button variant="outline" className="gap-2 rounded-full px-8 h-11">
              Learn More <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}