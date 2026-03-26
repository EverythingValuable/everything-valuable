import React, { useState, useEffect } from "react";
import { X, Heart, Clock, TrendingDown, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  first_bids: { label: "1stBid$™ Preview", icon: Clock, color: "bg-primary/10 text-primary border-primary/20" },
  prisometer: { label: "PRI$OMETER™ Live", icon: TrendingDown, color: "bg-red-50 text-red-600 border-red-200" },
};

export default function ItemHotspotPopover({ hotspot, item, onClose }) {
  const [isSaved, setIsSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");

  if (!item) return null;

  // Calculate countdown
  useEffect(() => {
    if (!item.first_bids_end && !item.prisometer_duration_hours) return;

    const updateTimer = () => {
      let endTime;
      if (item.status === "first_bids" && item.first_bids_end) {
        endTime = new Date(item.first_bids_end);
      } else if (item.status === "prisometer" && item.prisometer_activated_at && item.prisometer_duration_hours) {
        endTime = new Date(new Date(item.prisometer_activated_at).getTime() + item.prisometer_duration_hours * 3600000);
      }
      
      if (endTime) {
        setTimeLeft(formatDistanceToNow(endTime, { addSuffix: true }));
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [item]);

  const status = statusConfig[item.status] || {};
  const StatusIcon = status.icon;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/20" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-2xl max-w-sm w-full border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-border">
          <div>
            <h3 className="font-serif text-lg font-semibold text-foreground line-clamp-2">
              {item.title}
            </h3>
            {hotspot.label && (
              <p className="text-xs text-muted-foreground mt-1">{hotspot.label}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image */}
        {item.images && item.images.length > 0 && (
          <div className="aspect-video bg-muted overflow-hidden">
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Details */}
        <div className="p-4 space-y-4">
          {/* Status badge */}
          {status.label && (
            <div>
              <Badge className={`${status.color} text-xs font-medium`}>
                {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                {status.label}
              </Badge>
            </div>
          )}

          {/* Category */}
          {item.category && (
            <div className="text-xs">
              <span className="text-muted-foreground">Category:</span>
              <span className="ml-2 font-medium text-foreground capitalize">
                {item.category.replace(/_/g, " ")}
              </span>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="text-sm text-muted-foreground line-clamp-3">
              {item.description}
            </p>
          )}

          {/* Price & Countdown */}
          <div className="pt-2 border-t border-border space-y-3">
            {item.status === "first_bids" && (
              <div className="text-sm">
                <span className="text-muted-foreground">Preview Price:</span>
                <p className="font-price text-xl font-semibold text-foreground mt-1">
                  ${item.prisometer_start_price?.toLocaleString()}
                </p>
              </div>
            )}
            {item.status === "prisometer" && (
              <div className="text-sm">
                <span className="text-muted-foreground">Current Price:</span>
                <p className="font-price text-xl font-semibold text-foreground mt-1">
                  ${item.current_price?.toLocaleString()}
                </p>
              </div>
            )}

            {/* Countdown */}
            {timeLeft && (
              <div className="text-xs bg-primary/5 border border-primary/15 rounded p-2 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                <span className="text-muted-foreground">Ends <span className="font-medium text-foreground">{timeLeft}</span></span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-red-500 text-red-500" : ""}`} />
              {isSaved ? "Saved" : "Save"}
            </Button>
            <Button size="sm" className="flex-1">
              {item.status === "first_bids" ? "Bid" : "Bid / Make Offer"}
            </Button>
          </div>

          {/* Hotspot Info */}
          <div className="mt-4 p-3 bg-secondary/30 rounded-lg border border-border/50 flex gap-2">
            <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              This item is featured on the property listing photos. Click on the hotspot to learn more about included items.
            </p>
          </div>
          </div>
          </div>
          </div>
          );
          }