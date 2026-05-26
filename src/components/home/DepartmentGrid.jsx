import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const departments = [
  { key: "fine_art", label: "Fine Art", description: "Paintings, drawings, prints", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80&fit=crop" },
  { key: "jewelry", label: "Jewelry", description: "Rings, watches, bracelets", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/b0f841fcb_Screenshot2026-04-30at10709PM.JPG" },
  { key: "watches_clocks", label: "Watches & Clocks", description: "Timepieces and mechanical objects", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80&fit=crop" },
  { key: "furniture", label: "Furniture", description: "Seating, tables, storage", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop" },
  { key: "decorative_art", label: "Decorative Art", description: "Ceramics, glass, objects", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/b1b4cc42b_Screenshot2026-04-30at11135PM.jpg" },
  { key: "asian_antiques", label: "Asian Art", description: "Scrolls, sculptures, porcelain", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/989e3552b_Screenshot2026-04-30at10825PM.jpg" },
  { key: "fashion_accessories", label: "Fashion", description: "Handbags, clothing, accessories", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/2955b40d6_90013264_Catalog_G4g1RR5nKs.jpg" },
  { key: "collectibles", label: "Collectibles", description: "Rare items and memorabilia", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/2e269e108_Screenshot2026-04-30at11320PM.jpg" },
];

export default function DepartmentGrid() {
  return (
    <section className="py-14 md:py-18 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <div className="mb-10 md:mb-14">
          <p className="text-xs tracking-[0.22em] uppercase font-display font-semibold text-muted-foreground mb-3">
            Browse Collections
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground leading-tight max-w-2xl">
            Browse Exceptional Property
          </h2>
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {departments.map((dept, i) => (
            <motion.div
              key={dept.key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
            >
              <Link 
                to={`/browse?category=${dept.key}`}
                className="group flex flex-col h-full border border-neutral-300 bg-white hover:border-foreground/60 transition-all duration-300"
              >
                {/* Image Strip */}
                <div className="relative h-32 md:h-36 overflow-hidden bg-neutral-100 border-b border-neutral-200">
                  <img 
                    src={dept.image} 
                    alt={dept.label}
                    className="w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-500 ease-out"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 md:p-6">
                  <h3 className="font-serif text-base md:text-lg font-semibold text-foreground mb-1.5">
                    {dept.label}
                  </h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed flex-1">
                    {dept.description}
                  </p>
                  
                  {/* Explore Cue */}
                  <div className="flex items-center mt-4 text-xs font-medium text-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="group-hover:text-foreground/70">Explore Department</span>
                    <svg className="w-3 h-3 ml-1.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}