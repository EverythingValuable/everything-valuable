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

        {/* Visual Mobile Mockup */}
        <div className="flex justify-center">
          <img 
            src="https://media.base44.com/images/public/69beac1c3231aaeb891946d5/485f64f2c_680F99DC-F429-4F97-91AE-A2AB2C37AF08.png" 
            alt="Prisometer Mobile Experience" 
            className="max-w-full h-auto rounded-xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}