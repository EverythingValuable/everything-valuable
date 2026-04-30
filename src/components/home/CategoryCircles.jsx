import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  {
    key: "fine_art",
    label: "Fine Art",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80&fit=crop",
  },
  {
    key: "jewelry",
    label: "Jewelry",
    image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/b0f841fcb_Screenshot2026-04-30at10709PM.JPG",
  },
  {
    key: "watches_clocks",
    label: "Watches",
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80&fit=crop",
  },
  {
    key: "furniture",
    label: "Furniture",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80&fit=crop",
  },
  {
    key: "decorative_art",
    label: "Decorative Art",
    image: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80&fit=crop",
  },
  {
    key: "asian_antiques",
    label: "Asian Art",
    image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/989e3552b_Screenshot2026-04-30at10825PM.jpg",
  },
  {
    key: "fashion_accessories",
    label: "Fashion",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80&fit=crop",
  },
  {
    key: "collectibles",
    label: "Collectibles",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80&fit=crop",
  },
];

export default function CategoryCircles() {
  return (
    <section className="pt-12 md:pt-16 pb-0 bg-background">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-[10px] tracking-[0.22em] uppercase font-display font-semibold text-primary mb-1">
              Browse by Category
            </p>
            <h2 className="font-serif text-2xl md:text-3xl font-semibold text-foreground leading-tight">
              What are you looking for?
            </h2>
          </div>
        </div>

        <div className="flex gap-5 md:gap-8 overflow-x-auto pb-3 scrollbar-none">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: "easeOut" }}
              className="flex-shrink-0"
            >
              <Link
                to={`/browse?category=${cat.key}`}
                className="group flex flex-col items-center gap-3"
              >
                {/* Circle */}
                <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden border border-border/40 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover scale-100 group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  {/* Subtle overlay on hover */}
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors duration-300 rounded-full" />
                </div>

                {/* Label */}
                <span className="text-xs font-display font-medium text-foreground/80 group-hover:text-primary tracking-wide transition-colors duration-200 text-center whitespace-nowrap">
                  {cat.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}