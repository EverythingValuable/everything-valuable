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
    <section className="py-16 md:py-24 bg-[#f5f0ed]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Text Content */}
          <div>
            <p className="text-accent font-bold text-sm tracking-widest mb-4">
              OUR INNOVATION
            </p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground mb-6 leading-tight">
              A New Way to Discover Market Value
            </h2>
            <div className="w-12 h-1 bg-primary mb-8"></div>
            <p className="text-foreground leading-relaxed mb-8">
              Every item moves through a transparent two-phase sale process. Early demand is captured first, then the PRISOMETER™ activates and lets price meet the market in real time.
            </p>

            {/* Timeline Steps */}
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

          {/* Right: Card Example */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden p-8 space-y-6">
            {/* Watch Image */}
            <div className="flex justify-center">
              <img
                src="https://media.base44.com/images/public/69beac1c3231aaeb891946d5/5de356bd3_IMG_2529.jpg"
                alt="Piaget Automatic watch"
                className="max-w-xs h-auto object-contain"
              />
            </div>

            {/* Price Timeline */}
            <div className="space-y-6">
              <div>
                <p className="text-xs font-bold tracking-widest text-accent mb-2">
                  EXAMPLE: VINTAGE CHRONOGRAPH
                </p>
                <p className="text-sm text-muted-foreground mb-2">Starting Price</p>
                <p className="font-serif text-4xl font-semibold text-foreground">
                  $4,800
                </p>
              </div>

              {/* Price Points */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold tracking-widest text-accent">
                      1STBIDS™ PREVIEW
                    </p>
                    <p className="text-sm text-muted-foreground">Early bids coming in</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                    $4,800
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold tracking-widest text-accent">
                      PRISOMETER™ LIVE
                    </p>
                    <p className="text-sm text-muted-foreground">Price descending</p>
                  </div>
                  <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                    $4,250
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-border shrink-0"></div>
                  <div className="flex-1"></div>
                  <p className="text-sm font-semibold text-foreground whitespace-nowrap">
                    $3,900
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-accent shrink-0"></div>
                  <div className="flex-1">
                    <p className="text-xs font-bold tracking-widest text-accent">
                      SALE TRIGGER
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Price meets highest qualified bid
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-accent">$3,600</p>
                    <p className="text-xs font-bold tracking-widest text-accent">SOLD</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-start gap-4">
                  <div className="w-8 h-8 border-2 border-primary rounded-full flex items-center justify-center text-xs text-primary font-bold shrink-0">
                    ?
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold tracking-widest text-accent">
                      MAKE IT MINE
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Buy it now during the live phase
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Instant Purchase</p>
                    <p className="text-xs text-muted-foreground">Transparent Fee</p>
                  </div>
                </div>
              </div>

              {/* Bottom note */}
              <div className="pt-4 border-t border-border flex items-start gap-2">
                <span className="text-xs text-primary font-bold shrink-0">→</span>
                <p className="text-xs text-muted-foreground">
                  Secure. Transparent. Fair. Built for collectors. Powered by innovation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}