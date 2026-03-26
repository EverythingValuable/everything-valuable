import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Trash2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";

const FAKE_LISTINGS = {
  "re-001": { id: "re-001", title: "Historic Federal-Style Manor, Hudson Valley", images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80"] },
  "re-002": { id: "re-002", title: "Modernist Waterfront Retreat", images: ["https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80"] },
  "re-003": { id: "re-003", title: "19th Century Limestone Farmstead", images: ["https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=1200&q=80", "https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg"] },
};

export default function HotspotManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedListing, setSelectedListing] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [itemSearch, setItemSearch] = useState("");

  // Fetch all items
  const { data: items = [] } = useQuery({
    queryKey: ["items"],
    queryFn: () => base44.entities.Item.list()
  });

  // Fetch existing hotspots for selected listing/image
  const { data: hotspots = [] } = useQuery({
    queryKey: ["hotspots", selectedListing?.id, selectedImageIndex],
    queryFn: () => selectedListing ? base44.entities.ItemHotspot.filter({
      listing_id: selectedListing.id,
      image_index: selectedImageIndex
    }) : Promise.resolve([]),
    enabled: !!selectedListing
  });

  // Add hotspot mutation
  const addHotspotMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.ItemHotspot.create({
        listing_id: selectedListing.id,
        listing_type: "real_estate",
        image_index: selectedImageIndex,
        linked_item_id: data.item_id,
        x_percent: data.x,
        y_percent: data.y,
        label: data.label
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotspots"] });
      setSelectedItemId(null);
      toast({ title: "Hotspot added successfully" });
    }
  });

  // Delete hotspot mutation
  const deleteHotspotMutation = useMutation({
    mutationFn: async (id) => {
      return await base44.entities.ItemHotspot.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hotspots"] });
      toast({ title: "Hotspot removed" });
    }
  });

  const handleImageClick = (e) => {
    if (!selectedItemId || !selectedListing) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const selectedItem = items.find(i => i.id === selectedItemId);
    addHotspotMutation.mutate({
      item_id: selectedItemId,
      x,
      y,
      label: selectedItem?.title
    });
  };

  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const currentListing = selectedListing ? FAKE_LISTINGS[selectedListing.id] : null;
  const currentImage = currentListing?.images[selectedImageIndex];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="font-serif text-3xl font-semibold text-foreground mb-8">Tag Items on Listings</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Listings */}
          <div className="space-y-4">
            <h2 className="font-semibold text-foreground">Properties</h2>
            <div className="space-y-2">
              {Object.values(FAKE_LISTINGS).map(listing => (
                <button
                  key={listing.id}
                  onClick={() => {
                    setSelectedListing(listing);
                    setSelectedImageIndex(0);
                  }}
                  className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                    selectedListing?.id === listing.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{listing.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{listing.images.length} images</p>
                </button>
              ))}
            </div>
          </div>

          {/* Center: Image + Hotspots */}
          <div className="space-y-4">
            {currentListing ? (
              <>
                <h2 className="font-semibold text-foreground">Images</h2>
                
                {/* Image display */}
                <div className="relative aspect-[3/4] bg-muted rounded-lg overflow-hidden cursor-crosshair group border-2 border-dashed border-border"
                  onClick={handleImageClick}>
                  <img src={currentImage} alt="Property" className="w-full h-full object-cover" />
                  
                  {/* Hotspots */}
                  <div className="absolute inset-0 pointer-events-none">
                    {hotspots.map((hotspot) => (
                      <div
                        key={hotspot.id}
                        className="absolute w-6 h-6 -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                        style={{
                          left: `${hotspot.x_percent}%`,
                          top: `${hotspot.y_percent}%`,
                        }}
                      >
                        <div className="w-full h-full rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 hover:scale-125 transition-all relative">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteHotspotMutation.mutate(hotspot.id);
                            }}
                            className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {!selectedItemId && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-sm font-medium">Select an item and click to tag</p>
                    </div>
                  )}
                </div>

                {/* Image thumbnails */}
                <div className="flex gap-2">
                  {currentListing.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={`w-12 h-12 rounded border-2 overflow-hidden transition-colors ${
                        selectedImageIndex === i ? "border-primary" : "border-border"
                      }`}
                    >
                      <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>

                {/* Instructions */}
                {selectedItemId && (
                  <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 text-xs text-foreground">
                    <p>Click on the image to place a hotspot for the selected item.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="aspect-[3/4] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                Select a property
              </div>
            )}
          </div>

          {/* Right: Items */}
          <div className="space-y-4">
            <h2 className="font-semibold text-foreground">Items</h2>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search items..."
                value={itemSearch}
                onChange={(e) => setItemSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Item list */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredItems.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No items found</p>
              ) : (
                filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItemId(selectedItemId === item.id ? null : item.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all group ${
                      selectedItemId === item.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    {item.images && item.images.length > 0 && (
                      <div className="w-full h-16 bg-muted rounded mb-2 overflow-hidden">
                        <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <p className="text-xs font-medium text-foreground line-clamp-2">{item.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {item.category?.replace(/_/g, " ")}
                      </Badge>
                      {selectedItemId === item.id && (
                        <CheckCircle className="w-3.5 h-3.5 text-primary" />
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}