import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const departments = [
  { key: "fine_art", label: "Fine Art", description: "Paintings, drawings, prints" },
  { key: "jewelry", label: "Jewelry", description: "Rings, watches, bracelets" },
  { key: "watches_clocks", label: "Watches & Clocks", description: "Timepieces and mechanical objects" },
  { key: "furniture", label: "Furniture", description: "Seating, tables, storage" },
  { key: "decorative_art", label: "Decorative Art", description: "Ceramics, glass, objects" },
  { key: "asian_antiques", label: "Asian Art", description: "Scrolls, sculptures, porcelain" },
  { key: "fashion_accessories", label: "Fashion", description: "Handbags, clothing, accessories" },
  { key: "collectibles", label: "Collectibles", description: "Rare items and memorabilia" },
];

export default function DepartmentGrid() {
  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="max-w-screen-2xl mx-auto px-6 md:px-10">
        
        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="text-xs tracking-[0.22em] uppercase font-display font-semibold text-muted-foreground mb-3">
            Browse Collections
          </p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground leading-tight max-w-2xl">
            Browse Exceptional Property
          </h2>
        </div>

        {/* Department Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                className="group flex flex-col h-full border border-border/40 bg-white hover:border-border/80 transition-all duration-300 p-6 md:p-7"
              >
                <h3 className="font-serif text-lg md:text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
                  {dept.label}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 group-hover:text-foreground/70 transition-colors duration-200">
                  {dept.description}
                </p>
                <div className="flex items-center mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span>Browse</span>
                  <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}