import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ItemHotspotPopover from "./ItemHotspotPopover";

export default function HotspotProductGallery({ 
  images = [], 
  listingId, 
  listingType = "real_estate",
  isEditing = false,
  onHotspotAdd = null
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [editingMode, setEditingMode] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const imageRef = useRef(null);

  // Fetch hotspots for current listing
  const { data: hotspots = [] } = useQuery({
    queryKey: ["hotspots", listingId, activeIndex],
    queryFn: () => base44.entities.ItemHotspot.filter({
      listing_id: listingId,
      listing_type: listingType,
      image_index: activeIndex
    }),
    enabled: !!listingId
  });

  // Fetch item details for hotspots
  const { data: hotspotItems = {} } = useQuery({
    queryKey: ["hotspotItems", hotspots.map(h => h.linked_item_id).join(",")],
    queryFn: async () => {
      const items = {};
      for (const hotspot of hotspots) {
        const item = await base44.entities.Item.get(hotspot.linked_item_id);
        items[hotspot.id] = item;
      }
      return items;
    },
    enabled: hotspots.length > 0
  });

  const handleImageClick = (e) => {
    if (!isEditing || !editingMode) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    onHotspotAdd?.({ x_percent: x, y_percent: y });
  };

  const currentImage = images[activeIndex];

  return (
    <>
      <div className="relative bg-muted rounded-lg overflow-hidden">
        {/* Main Image */}
        <div className="relative aspect-[4/5] overflow-hidden cursor-pointer group" onClick={() => setFullscreen(true)}>
          <img
            ref={imageRef}
            src={currentImage}
            alt={`Image ${activeIndex + 1}`}
            className={`w-full h-full object-cover ${editingMode ? "cursor-crosshair" : ""}`}
            onClick={handleImageClick}
          />

          {/* Hotspots overlay */}
          <div className="absolute inset-0 pointer-events-none">
            {hotspots.map((hotspot) => (
              <button
                key={hotspot.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHotspot(hotspot);
                }}
                className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 pointer-events-auto group/dot"
                style={{
                  left: `${hotspot.x_percent}%`,
                  top: `${hotspot.y_percent}%`,
                }}
              >
                <div className="w-full h-full rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-125">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                </div>
              </button>
            ))}
          </div>

          {/* Fullscreen button */}
          <button
            onClick={() => setFullscreen(true)}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 p-2 rounded-lg"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Edit mode toggle */}
        {isEditing && (
          <div className="p-3 border-t border-border bg-background/50">
            <Button
              size="sm"
              variant={editingMode ? "default" : "outline"}
              onClick={() => setEditingMode(!editingMode)}
              className="w-full text-xs"
            >
              {editingMode ? "Stop Adding Hotspots" : "Add Hotspots"}
            </Button>
          </div>
        )}

        {/* Navigation arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}
              disabled={activeIndex === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-lg disabled:opacity-30 hover:bg-background transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveIndex(Math.min(images.length - 1, activeIndex + 1))}
              disabled={activeIndex === images.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-lg disabled:opacity-30 hover:bg-background transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                activeIndex === i ? "border-primary" : "border-border"
              }`}
            >
              <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen view */}
      {fullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
          <button
            onClick={() => setFullscreen(false)}
            className="absolute top-4 right-4 bg-background/80 p-2 rounded-lg hover:bg-background"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={currentImage} alt="Fullscreen" className="max-w-[90vw] max-h-[90vh] object-contain" />
        </div>
      )}

      {/* Hotspot popover */}
      {selectedHotspot && (
        <ItemHotspotPopover
          hotspot={selectedHotspot}
          item={hotspotItems[selectedHotspot.id]}
          onClose={() => setSelectedHotspot(null)}
        />
      )}
    </>
  );
}