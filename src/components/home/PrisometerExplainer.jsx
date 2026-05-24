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
    <section className="py-12 md:py-16 bg-[#f5f0ed]">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <p className="text-accent font-bold text-sm tracking-widest mb-3">
            OUR INNOVATION
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground mb-4 leading-tight">
            A New Way to Discover Market Value
          </h2>
          <div className="w-12 h-1 bg-primary mb-6"></div>
          <p className="text-foreground leading-relaxed text-base">
            Every item moves through a transparent two-phase sale process. Early demand is captured first, then the PRISOMETER™ activates and lets price meet the market in real time.
          </p>
        </div>

        {/* Timeline Steps in Card */}
        <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-8 md:p-10 backdrop-blur-sm">
          <div className="space-y-6">
            {timelineSteps.map((step, idx) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center text-xs font-bold text-primary">
                    {step.number}
                  </div>
                  {idx < timelineSteps.length - 1 && (
                    <div className="w-0.5 h-12 bg-border mt-2"></div>
                  )}
                </div>
                <div className="pt-1">
                  <p className="font-bold text-xs tracking-widest text-accent mb-1">
                    {step.title}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}