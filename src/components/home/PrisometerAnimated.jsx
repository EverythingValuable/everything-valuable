import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { TrendingDown, CheckCircle } from "lucide-react";

export default function PrisometerAnimated() {
  const [iteration, setIteration] = useState(0);

  // Reset animation every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setIteration((prev) => prev + 1);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  const startPrice = 5000;
  const reservePrice = 1500;
  const finalPrice = 2200;
  const duration = 4;

  // Calculate price over time (linear descent)
  const getPriceAtProgress = (progress) => {
    return startPrice - (startPrice - reservePrice) * progress;
  };

  const benefits = [
    { icon: "📉", title: "Transparent Pricing", desc: "Watch price move in real time" },
    { icon: "⚡", title: "Fair Market Value", desc: "Price finds true market demand" },
    { icon: "🎯", title: "Smart Selling", desc: "No hidden reserves or surprises" },
  ];

  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-neutral-50 to-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              How PRI$OMETER™ Works
            </span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-4">
            Price Discovery in Real Time
          </h2>
          <p className="text-muted-foreground text-base md:text-lg leading-relaxed">
            Our innovative pricing engine lets the market find the true value of extraordinary objects. 
            Watch the price descend until it meets buyer demand—then the sale executes automatically.
          </p>
        </div>

        {/* Main Animation */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Left: Animation */}
          <motion.div
            key={iteration}
            className="bg-white border border-neutral-200 rounded-2xl p-8 md:p-10"
          >
            {/* Price Chart */}
            <div className="mb-8">
              <p className="text-xs uppercase tracking-widest font-semibold text-neutral-500 mb-6">
                Price Over Time
              </p>
              
              {/* Chart Container */}
              <div className="relative h-64 bg-gradient-to-b from-neutral-50 to-neutral-100 rounded-xl p-6 border border-neutral-100">
                {/* Grid lines */}
                <div className="absolute inset-0 grid grid-rows-4 opacity-20 pointer-events-none rounded-xl overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="border-b border-neutral-300" />
                  ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-neutral-400 font-semibold tracking-tight">
                  <span>${(startPrice / 1000).toFixed(1)}K</span>
                  <span>${((startPrice + reservePrice) / 2 / 1000).toFixed(1)}K</span>
                  <span>${(reservePrice / 1000).toFixed(1)}K</span>
                </div>

                {/* Animated price line */}
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <motion.polyline
                    points={(() => {
                      const points = [];
                      for (let i = 0; i <= 100; i += 5) {
                        const x = (i / 100) * 100;
                        const price = getPriceAtProgress(Math.min(i / 100, 1));
                        const y = 100 - ((price - reservePrice) / (startPrice - reservePrice)) * 100;
                        points.push(`${x},${y}`);
                      }
                      return points.join(" ");
                    })()}
                    fill="none"
                    stroke="#e4001b"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration, ease: "linear" }}
                  />
                </svg>

                {/* Current price dot */}
                <motion.div
                  className="absolute w-4 h-4 bg-primary rounded-full border-2 border-white shadow-lg"
                  initial={{ left: "0%", top: "85%" }}
                  animate={{
                    left: "100%",
                    top: (() => {
                      // Top starts at ~85%, goes to ~30%
                      return `${100 - ((finalPrice - reservePrice) / (startPrice - reservePrice)) * 100}%`;
                    })(),
                  }}
                  transition={{ duration, ease: "linear" }}
                />
              </div>
            </div>

            {/* Status Timeline */}
            <div className="space-y-3">
              {[
                { label: "Start Price", value: `$${startPrice.toLocaleString()}` },
                { label: "Floor (Reserve)", value: `$${reservePrice.toLocaleString()}`, highlight: true },
                { label: "Sale Price", value: `$${finalPrice.toLocaleString()}`, sold: true },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className={`flex justify-between items-center p-3 rounded-lg ${
                    item.sold
                      ? "bg-emerald-50 border border-emerald-200"
                      : item.highlight
                        ? "bg-primary/10 border border-primary/20"
                        : "bg-neutral-50 border border-neutral-100"
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.2 + duration - 0.5 }}
                >
                  <span className={`text-xs font-semibold uppercase tracking-wide ${item.sold ? "text-emerald-700" : "text-neutral-600"}`}>
                    {item.label}
                  </span>
                  <span className={`font-price font-bold text-lg tabular-nums ${item.sold ? "text-emerald-700" : "text-neutral-900"}`}>
                    {item.value}
                  </span>
                  {item.sold && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Benefits */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl md:text-3xl font-semibold text-foreground">
              Why Buyers Love It
            </h3>
            {benefits.map((benefit, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.4 }}
                className="flex gap-4 p-4 bg-white border border-neutral-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="text-3xl shrink-0">{benefit.icon}</div>
                <div>
                  <h4 className="font-semibold text-foreground text-sm">{benefit.title}</h4>
                  <p className="text-muted-foreground text-sm mt-0.5">{benefit.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid md:grid-cols-3 gap-6 bg-primary/5 border border-primary/20 rounded-2xl p-8 md:p-10">
          {[
            { stat: "100%", label: "Transparent pricing" },
            { stat: "Real-time", label: "Price discovery" },
            { stat: "0%", label: "Hidden fees or reserves" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
            >
              <p className="font-price font-bold text-3xl md:text-4xl text-primary mb-2">
                {item.stat}
              </p>
              <p className="text-muted-foreground text-sm">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}