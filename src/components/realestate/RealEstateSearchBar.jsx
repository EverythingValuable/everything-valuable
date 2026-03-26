import React, { useState } from "react";
import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function RealEstateSearchBar() {
  const [location, setLocation] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality can be implemented when needed
    console.log("Searching for:", location);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-gradient-to-r from-primary/5 to-primary/10 py-8"
    >
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">
        <form onSubmit={handleSearch} className="flex gap-3 max-w-md">
          <div className="flex-1 relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by location, address, or ZIP code"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2 h-11 px-6"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </Button>
        </form>
      </div>
    </motion.div>
  );
}