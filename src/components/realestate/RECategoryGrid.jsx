import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  {
    key: "residential",
    label: "Residential",
    subtitle: "Single-family homes & condos",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600&q=80",
  },
  {
    key: "luxury",
    label: "Luxury Estates",
    subtitle: "Premier properties & compounds",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80",
  },
  {
    key: "commercial",
    label: "Commercial",
    subtitle: "Office, retail & mixed-use",
    image: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80",
  },
  {
    key: "land",
    label: "Land & Lots",
    subtitle: "Acreage, lots & development parcels",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80",
  },
  {
    key: "waterfront",
    label: "Waterfront",
    subtitle: "Lakefront, oceanfront & river",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80",
  },
  {
    key: "historic",
    label: "Historic & Estate",
    subtitle: "Landmark & architecturally significant",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=80",
  },
];

export default function RECategoryGrid() {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
            Explore by Property Type
          </h2>
          <p className="text-muted-foreground mt-2 text-sm">
            Curated listings across every category
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
                to={`/real-estate/browse?category=${cat.key}`}
                className="group relative aspect-[3/2] md:aspect-[4/3] overflow-hidden rounded-xl block"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-muted to-secondary group-hover:from-muted/80 transition-all duration-500" />
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
                />
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