import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Portal() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="pt-8 px-6 pb-16 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
          Everything Valuable
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Explore what you're looking for
        </p>
      </div>

      {/* Two Column Portal */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
        {/* Real Property */}
        <Link
          to="/real-property"
          className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
        >
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
            alt="Real Property"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative text-center z-10"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
              Real Property
            </h2>
            <p className="text-white/80 text-lg">Explore premium real estate</p>
          </motion.div>
        </Link>

        {/* Personal Property */}
        <Link
          to="/personal-property"
          className="group relative overflow-hidden bg-gradient-to-bl from-amber-900 to-amber-800 flex items-center justify-center cursor-pointer transition-transform hover:scale-105"
        >
          <img
            src="https://images.unsplash.com/photo-1578500494198-246f612d03b3?w=800&q=80"
            alt="Personal Property"
            className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition-opacity"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative text-center z-10"
          >
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-4">
              Personal Property
            </h2>
            <p className="text-white/80 text-lg">Discover fine art & collectibles</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}