import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Clock, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PRISOMETER_INFO = "The PRI$OMETER™ is our live declining-price engine. The price starts high and drops continuously over time. You can place a bid at any moment — or use Make It Mine to buy instantly at the current price.";

export default function PropertyPriceModule({ property }) {
  const [displayPrice, setDisplayPrice] = useState(property.prisometer_start_price);
  const [cents, setCents] = useState(0);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (property.status === "first_bids") {
      // Preview countdown
      const calculate = () => {
        const end = new Date(property.first_bids_end).getTime();
        const now = Date.now();
        const diff = end - now;

        if (diff <= 0) return;

        setCountdown({
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
        });
      };

      calculate();
      const interval = setInterval(calculate, 1000);
      return () => clearInterval(interval);
    }

    if (property.status === "prisometer" && property.prisometer_activated_at) {
      const updatePrice = () => {
        const startTime = new Date(property.prisometer_activated_at).getTime();
        const startPrice = property.prisometer_start_price;
        const reservePrice = property.reserve_price || startPrice * 0.5;
        const belowPercent = property.below_reserve_percent || 10;
        const floorPrice = reservePrice * (1 - belowPercent / 100);
        const durationMs = property.prisometer_duration_hours * 3600000;
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const price = Math.max(startPrice - (startPrice - floorPrice) * progress, floorPrice);
        setDisplayPrice(Math.floor(price));
        setCents(Math.round((price % 1) * 100));
      };

      updatePrice();
      const interval = setInterval(updatePrice, 100);
      return () => clearInterval(interval);
    }
  }, [property]);

  const formatPrice = (price) => Math.floor(price).toLocaleString("en-US");

  if (property.status === "first_bids") {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <span className="font-display text-sm font-bold uppercase tracking-wider text-primary">
            1stBid$<sup className="text-[9px] ml-0.5">™</sup> Preview
          </span>
        </div>

        <div className="text-center space-y-2 opacity-50">
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-xs font-semibold text-black uppercase tracking-wider">PRI$OMETER™ Start Price</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-black cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs leading-relaxed" side="bottom">
                  The price at which live PRI$OMETER™ bidding will begin after the preview period ends.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <motion.div
            key={Math.floor(displayPrice)}
            initial={{ scale: 1.02, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="font-sans text-4xl md:text-5xl font-bold text-muted-foreground"
          >
            ${formatPrice(displayPrice)}
          </motion.div>
          <p className="text-xs text-black italic">Activates after preview</p>
        </div>

        {property.highest_bid > 0 && (
          <div className="text-center space-y-1 pt-2 border-t border-border/50">
            <p className="text-xs text-muted-foreground">Highest Preview Bid</p>
            <p className="font-sans text-2xl font-bold text-foreground">
              ${property.highest_bid.toLocaleString("en-US")}
            </p>
          </div>
        )}
      </div>
    );
  }

  if (property.status === "prisometer") {
    return (
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        <div>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex items-center gap-1.5"
          >
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">PRI$OMETER™ Live</span>
          </motion.div>
        </div>

        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Current Price</p>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-3.5 h-3.5 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs text-xs leading-relaxed" side="bottom">
                  {PRISOMETER_INFO}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <motion.div
            key={Math.floor(displayPrice)}
            initial={{ scale: 1.02, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="font-sans text-5xl md:text-6xl font-bold text-foreground"
          >
            ${formatPrice(displayPrice)}
            <span className="font-sans text-xl text-red-500 animate-price-tick">
              .{cents.toString().padStart(2, "0")}
            </span>
          </motion.div>
        </div>

        {property.highest_bid > 0 && (
          <div className="text-center space-y-1 pt-3 border-t border-border/50">
            <p className="text-xs text-muted-foreground">Current Highest Bid</p>
            <p className="font-sans text-2xl font-bold text-foreground">
              ${property.highest_bid.toLocaleString("en-US")}
            </p>
          </div>
        )}
      </div>
    );
  }

  return null;
}