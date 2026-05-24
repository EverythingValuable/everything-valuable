import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Clock, TrendingDown, Zap, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  {
    number: "1",
    icon: Clock,
    title: "1stBid$ Preview",
    description: "Buyers place early bids before the PRI$OMETER activates.",
    accent: "text-primary border-primary/30 bg-primary/5",
    iconColor: "text-primary",
  },
  {
    number: "2",
    icon: TrendingDown,
    title: "PRI$OMETER Live",
    description: "If early bids do not meet or exceed the starting price, the price begins to drop.",
    accent: "text-red-600 border-red-200 bg-red-50",
    iconColor: "text-red-600",
  },
  {
    number: "3",
    icon: Zap,
    title: "Sale Trigger",
    description: "When price and demand meet, the item sells.",
    accent: "text-emerald-600 border-emerald-200 bg-emerald-50",
    iconColor: "text-emerald-600",
  },
];

export default function HowItWorksPreview() {
  return (
    <section className="py-20 md:py-28 bg-background border-t border-border/40">
      <div className="max-w-6xl mx-auto px-6 md:px-8">

        {/* Header */}
        <div className="max-w-2xl mb-12 md:mb-16">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Our Innovation</span>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold mt-3 text-foreground leading-tight">
            A New Way to Discover Market Value
          </h2>
          <div className="w-10 h-0.5 bg-primary mt-4 mb-5" />
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
            Every item begins with a short <strong className="text-foreground font-semibold">1stBid$ Preview</strong>, where buyers can place early bids before the PRI$OMETER activates. If early demand meets or exceeds the PRI$OMETER starting price, the item can sell before live pricing begins.
          </p>
          <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-3">
            If not, the <strong className="text-foreground font-semibold">PRI$OMETER</strong> goes live and the asking price begins to move downward. When the live price meets qualified buyer demand, the item sells automatically.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.45 }}
              className={`border rounded-2xl p-7 ${step.accent}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="font-price text-3xl font-bold opacity-30">{step.number}</span>
                <step.icon className={`w-5 h-5 ${step.iconColor}`} />
              </div>
              <h3 className="font-display text-sm font-bold uppercase tracking-wider mb-2 text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="mt-10">
          <Link to="/how-it-works">
            <Button variant="outline" className="gap-2 px-7 h-10 text-sm">
              Learn More <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

      </div>
    </section>
  );
}