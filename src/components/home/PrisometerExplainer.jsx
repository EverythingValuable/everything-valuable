import React from "react";
import { ArrowDown } from "lucide-react";

const timelineSteps = [
  {
    number: 1,
    title: "1STBIDS™ PREVIEW",
    description: "Collectors place early bids before the live pricing phase begins.",
  },
  {
    number: 2,
    title: "PRISOMETER™ LIVE",
    description: "The asking price begins to move downward while qualified bids remain active.",
  },
  {
    number: 3,
    title: "SALE TRIGGER",
    description: "When the live price meets the highest qualified bid, the item sells automatically.",
  },
  {
    number: 4,
    title: "MAKE IT MINE",
    description: "A buyer can secure the item instantly during the live phase with a transparent service fee.",
  },
];

export default function PrisometerExplainer() {
  return (
    <section className="py-10 md:py-14 bg-[#f5f0ed]">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8 max-w-2xl">
          <p className="text-accent font-bold text-sm tracking-widest mb-2">
            OUR INNOVATION
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-tight">
            A New Way to Discover Market Value
          </h2>
          <div className="w-12 h-1 bg-primary mb-4"></div>
          <p className="text-foreground leading-relaxed text-sm">
            Every item moves through a transparent two-phase sale process. Early demand is captured first, then the PRISOMETER™ activates and lets price meet the market in real time.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {timelineSteps.map((step) => (
            <div key={step.number} className="bg-white/40 border border-foreground/10 rounded-xl p-5 backdrop-blur-sm hover:bg-white/60 transition-colors">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {step.number}
                </div>
                <p className="font-bold text-xs tracking-widest text-accent">
                  {step.title}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}