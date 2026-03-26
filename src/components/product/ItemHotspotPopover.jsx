import React, { useState, useEffect } from "react";
import { X, Heart, Clock, TrendingDown, ChevronLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

const statusConfig = {
  first_bids: { label: "1stBid$™ Preview", icon: Clock, color: "bg-primary/10 text-primary border-primary/20" },
  prisometer: { label: "PRI$OMETER™ Live", icon: TrendingDown, color: "bg-red-50 text-red-600 border-red-200" },
};

export default function ItemHotspotPopover({ hotspot, item, onClose, listingId }) {
  const [isSaved, setIsSaved] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const navigate = useNavigate();

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

  const handleViewListing = () => {
    navigate(`/item/${item.id}`);
  };

  const handleBackToProperty = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20" onClick={onClose}>
      <div
        className="bg-card rounded-xl shadow-2xl max-w-sm w-full border border-border overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with back button */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button
            onClick={handleBackToProperty}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Property
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Status badge */}
          {status.label && (
            <Badge className={`${status.color} text-xs font-medium`}>
              {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
              {status.label}
            </Badge>
          )}

          {/* Title */}
          <h2 className="font-serif text-lg font-semibold text-foreground line-clamp-2">
            {item.title}
          </h2>

          {/* Currently Available Badge */}
          <div className="inline-flex items-center px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
            <div className="w-2 h-2 bg-green-600 rounded-full mr-2" />
            <span className="text-xs font-medium text-green-700">Currently Available</span>
          </div>

          {/* Actions */}
          <div className="pt-3 space-y-2">
            <Button 
              onClick={handleViewListing}
              className="w-full h-10 gap-2"
            >
              View Listing
              <ExternalLink className="w-3.5 h-3.5" />
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
        </div>
      </div>
    </div>
  );
  }