import React, { useState, useEffect } from "react";
import { X, Heart, Clock, TrendingDown, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <div className="fixed inset-0 z-50 bg-background overflow-y-auto" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="min-h-screen">
        {/* Close button */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Item from Property</p>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-8 py-8 pb-20">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* LEFT — Image & Description */}
            <div className="lg:col-span-3 space-y-6">
              {/* Main Image */}
              {item.images && item.images.length > 0 && (
                <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                  <img
                    src={item.images[0]}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Description Section */}
              {item.description && (
                <div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">About This Item</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                </div>
              )}

              {/* Item Details */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Item Details</h3>
                <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
                  {item.category && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Category</span>
                      <span className="font-medium text-foreground capitalize">
                        {item.category.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  {item.condition && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Condition</span>
                      <span className="font-medium text-foreground capitalize">
                        {item.condition.replace(/_/g, " ")}
                      </span>
                    </div>
                  )}
                  {item.location && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Location</span>
                      <span className="font-medium text-foreground">{item.location}</span>
                    </div>
                  )}
                  {item.dimensions && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Dimensions</span>
                      <span className="font-medium text-foreground">{item.dimensions}</span>
                    </div>
                  )}
                  {item.materials && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Materials</span>
                      <span className="font-medium text-foreground">{item.materials}</span>
                    </div>
                  )}
                  {item.period && (
                    <div>
                      <span className="text-muted-foreground text-xs block mb-1">Period</span>
                      <span className="font-medium text-foreground">{item.period}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Seller Info */}
              {item.seller_name && (
                <div className="border-t border-border pt-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Seller</h3>
                  <p className="font-medium text-foreground">{item.seller_name}</p>
                </div>
              )}
            </div>

            {/* RIGHT — Price & Bidding */}
            <div className="lg:col-span-2">
              <div className="lg:sticky lg:top-24 space-y-5">
                {/* Status badges */}
                <div>
                  {status.label && (
                    <Badge className={`${status.color} text-xs font-medium`}>
                      {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                      {status.label}
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <div>
                  <h1 className="font-serif text-2xl md:text-3xl font-bold leading-tight text-foreground">
                    {item.title}
                  </h1>
                </div>

                <Separator />

                {/* Price Section */}
                <div className="space-y-3">
                  {item.status === "first_bids" && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Preview Price</p>
                      <p className="font-price text-4xl font-bold text-foreground">
                        ${item.prisometer_start_price?.toLocaleString()}
                      </p>
                      {item.highest_bid > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Highest bid: ${item.highest_bid?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {item.status === "prisometer" && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Current Price</p>
                      <p className="font-price text-4xl font-bold text-foreground animate-pulse">
                        ${item.current_price?.toLocaleString()}
                      </p>
                      {item.highest_bid > 0 && (
                        <p className="text-sm text-muted-foreground mt-2">
                          Highest bid: ${item.highest_bid?.toLocaleString()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Countdown */}
                  {timeLeft && (
                    <div className="bg-primary/5 border border-primary/15 rounded-lg p-3 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        Ends <span className="font-medium text-foreground">{timeLeft}</span>
                      </span>
                    </div>
                  )}

                  {/* Bid stats */}
                  {(item.bid_count > 0 || item.watcher_count > 0) && (
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      {item.bid_count > 0 && (
                        <div className="text-center p-2 bg-secondary/50 rounded">
                          <p className="text-xs text-muted-foreground">Bids</p>
                          <p className="text-lg font-semibold text-foreground">{item.bid_count}</p>
                        </div>
                      )}
                      {item.watcher_count > 0 && (
                        <div className="text-center p-2 bg-secondary/50 rounded">
                          <p className="text-xs text-muted-foreground">Watchers</p>
                          <p className="text-lg font-semibold text-foreground">{item.watcher_count}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <Button className="w-full h-10 gap-2">
                    {item.status === "first_bids" ? "Place Bid" : "Bid / Make Offer"}
                  </Button>
                  <Button
                    variant="outline"
                    className={`w-full h-10 gap-2 ${isSaved ? "text-red-500 border-red-200 bg-red-50" : ""}`}
                    onClick={() => setIsSaved(!isSaved)}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? "fill-red-500" : ""}`} />
                    {isSaved ? "Saved" : "Save"}
                  </Button>
                </div>

                {/* Info Box */}
                <div className="bg-secondary/30 border border-border/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      This item is featured on the property listing photos. Click on the hotspot to learn more about included items.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
          }