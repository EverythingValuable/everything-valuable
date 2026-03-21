import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

export default function FirstBidsCountdown({ endTime, compact = false }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const end = new Date(endTime).getTime();
      const now = Date.now();
      const diff = end - now;

      if (diff <= 0) {
        setIsExpired(true);
        return;
      }

      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (isExpired) {
    return (
      <div className="text-xs text-muted-foreground">Preview period ended</div>
    );
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-sm">
        <Clock className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium tabular-nums">
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3">
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4 text-primary" />
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">1stBid$ Preview</span>
      </div>
      <p className="text-xs text-muted-foreground">Preview bidding closes in:</p>
      <div className="grid grid-cols-4 gap-2 text-center">
        {[
          { val: timeLeft.days, label: "Days" },
          { val: timeLeft.hours, label: "Hrs" },
          { val: timeLeft.minutes, label: "Min" },
          { val: timeLeft.seconds, label: "Sec" },
        ].map(({ val, label }) => (
          <div key={label} className="bg-card rounded-lg p-2 border border-border">
            <span className="font-serif text-2xl font-bold tabular-nums text-foreground block">
              {val.toString().padStart(2, "0")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}