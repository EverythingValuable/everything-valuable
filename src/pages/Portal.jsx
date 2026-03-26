import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Portal() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Decorative top border */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      
      {/* Header */}
      <div className="pt-12 px-6 pb-20 text-center">
        {/* Decorative ornament */}
        <div className="flex justify-center mb-6">
          <div className="text-primary/40 text-2xl font-serif">◆</div>
        </div>
        
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground tracking-wide">
          Everything Valuable
        </h1>
        
        <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mt-5 mb-5 max-w-xs mx-auto" />
        
        <p className="text-muted-foreground mt-4 text-lg font-light">
          Explore what you're looking for
        </p>
      </div>

      {/* Cards Section */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">
          {/* Real Property Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link
              to="/real-property"
              className="group relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-500 hover:shadow-2xl hover:border-primary/30 block h-full"
            >
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=500&q=80"
                  alt="Real Property"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="text-primary/60 text-lg font-serif">◆</div>
                <h3 className="font-serif text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  Real Property
                </h3>
                <div className="h-px bg-gradient-to-r from-primary/20 to-transparent" />
                <p className="text-muted-foreground text-sm font-light">
                  Explore premium real estate
                </p>
              </div>
            </Link>
          </motion.div>

          {/* Personal Property Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              to="/personal-property"
              className="group relative overflow-hidden rounded-lg bg-card border border-border transition-all duration-500 hover:shadow-2xl hover:border-primary/30 block h-full"
            >
              <div className="aspect-[3/4] overflow-hidden bg-muted">
                <img
                  src="https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg"
                  alt="Personal Property"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 space-y-3">
                <div className="text-primary/60 text-lg font-serif">◆</div>
                <h3 className="font-serif text-2xl font-semibold text-foreground group-hover:text-primary transition-colors">
                  Personal Property
                </h3>
                <div className="h-px bg-gradient-to-r from-primary/20 to-transparent" />
                <p className="text-muted-foreground text-sm font-light">
                  Discover fine art & collectibles
                </p>
              </div>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}