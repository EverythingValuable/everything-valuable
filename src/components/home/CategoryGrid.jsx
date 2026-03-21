import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  { key: "fine_art", label: "Fine Art", subtitle: "Paintings, prints & works on paper" },
  { key: "jewelry", label: "Jewelry", subtitle: "Diamonds, gemstones & estate pieces" },
  { key: "watches", label: "Watches", subtitle: "Timepieces & horology" },
  { key: "furniture", label: "Furniture", subtitle: "Period, modern & designer" },
  { key: "decorative_arts", label: "Decorative Arts", subtitle: "Objects of beauty & function" },
  { key: "antiques", label: "Antiques", subtitle: "Historical treasures & rarities" },
];

export default function CategoryGrid({ categoryImages = {} }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Explore by Category
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Curated collections across every discipline
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Link
                to={`/browse?category=${cat.key}`}
                className="group relative aspect-[3/2] md:aspect-[4/3] overflow-hidden rounded-xl block"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-secondary group-hover:from-muted/80 transition-all duration-500" />
                {categoryImages[cat.key] && (
                  <img
                    src={categoryImages[cat.key]}
                    alt={cat.label}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 md:p-6">
                  <h3 className="font-serif text-lg md:text-xl font-semibold text-white">{cat.label}</h3>
                  <p className="text-xs text-white/70 mt-0.5">{cat.subtitle}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}