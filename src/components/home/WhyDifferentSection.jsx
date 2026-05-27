import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Users, TrendingUp, Settings } from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "No Traditional Buyer's Premium",
    description: "A clear service fee replaces hidden premium structures.",
  },
  {
    icon: Users,
    title: "Demand Before the Sale",
    description: "1stBid$ captures buyer interest before the price begins to move.",
  },
  {
    icon: TrendingUp,
    title: "Live Price Discovery",
    description: "PRI$OMETER lets price and demand converge in real time.",
  },
  {
    icon: Settings,
    title: "Seller Control",
    description: "Sellers define reserves, fulfillment terms, and approval thresholds.",
  },
];

export default function WhyDifferentSection() {
  return (
    <section className="py-14 md:py-20 px-6 md:px-12 bg-background">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <p className="text-[10px] tracking-[0.28em] uppercase font-semibold text-primary mb-3">
              Our Approach
            </p>
            <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground leading-tight max-w-2xl mx-auto">
              Why Everything Valuable Is Different
            </h2>
            <p className="text-neutral-600 mt-4 text-sm md:text-base max-w-2xl mx-auto">
              A marketplace built on transparency, fairness, and real-time price discovery.
            </p>
          </motion.div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.55, delay: index * 0.1 }}
                className="flex flex-col p-6 bg-white border border-neutral-200 hover:border-neutral-300 hover:shadow-lg transition-all duration-300"
              >
                <div className="mb-4">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-2.5 text-sm md:text-base">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}