import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Portal() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="pt-8 px-6 pb-2 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground tracking-wide mb-2">
          Everything Valuable
        </h1>
        <p className="text-muted-foreground text-base">
          Discover what's important to you
        </p>
      </div>

      {/* Cards Section */}
      <div className="flex items-center justify-center px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
          {/* Real Property Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <div className="rounded-lg overflow-hidden bg-muted mb-4 shadow-md">
              <img
                src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80"
                alt="Real Property"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            {/* Icon Circle */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-secondary/20 flex items-center justify-center border border-secondary/30">
                <Home className="w-7 h-7 text-secondary-foreground" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-5 text-center flex-1 flex flex-col">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                Real Property
              </h3>
              <p className="text-xs text-muted-foreground mb-4 flex-1">
                Explore premium real estate
              </p>
              <Link to="/real-property">
                <Button variant="outline" className="w-full text-sm">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Personal Property Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            <div className="rounded-lg overflow-hidden bg-muted mb-4 shadow-md">
              <img
                src="https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg"
                alt="Personal Property"
                className="w-full aspect-[4/3] object-cover"
              />
            </div>
            
            {/* Icon Circle */}
            <div className="flex justify-center mb-3">
              <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                <Gem className="w-7 h-7 text-accent" />
              </div>
            </div>

            <div className="bg-card rounded-lg border border-border p-5 text-center flex-1 flex flex-col">
              <h3 className="font-serif text-lg font-semibold text-foreground mb-1">
                Personal Property
              </h3>
              <p className="text-xs text-muted-foreground mb-4 flex-1">
                Discover fine art & collectibles
              </p>
              <Link to="/personal-property">
                <Button variant="outline" className="w-full text-sm bg-accent/10 border-accent/20 text-foreground hover:bg-accent/20">
                  Browse Collections
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}