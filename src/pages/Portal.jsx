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

      {/* Two Column Portal */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-0 overflow-hidden">
        {/* Real Property */}
        <Link
          to="/real-property"
          className="group relative overflow-hidden bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center cursor-pointer transition-all duration-500 hover:shadow-2xl"
        >
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80"
            alt="Real Property"
            className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70 group-hover:opacity-60 transition-opacity duration-500" />
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-white/20 group-hover:border-white/40 transition-colors duration-500" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-white/20 group-hover:border-white/40 transition-colors duration-500" />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative text-center z-10 px-6"
          >
            <div className="text-white/40 text-xl mb-2 font-serif">◆</div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
              Real Property
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-3 max-w-xs mx-auto" />
            <p className="text-white/75 text-lg font-light">Explore premium real estate</p>
          </motion.div>
        </Link>

        {/* Personal Property */}
        <Link
          to="/personal-property"
          className="group relative overflow-hidden bg-gradient-to-bl from-amber-900 to-amber-800 flex items-center justify-center cursor-pointer transition-all duration-500 hover:shadow-2xl"
        >
          <img
            src="https://images.squarespace-cdn.com/content/62717c6c7f5a1c4dd576c1e9/6266dc1b-6783-4359-ab40-562f1ab357a5/ChatGPT+Image+Jan+28%2C+2026%2C+11_09_41+AM+copy.jpg?content-type=image%2Fjpeg"
            alt="Personal Property"
            className="absolute inset-0 w-full h-full object-cover opacity-35 group-hover:opacity-45 transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-70 group-hover:opacity-60 transition-opacity duration-500" />
          
          {/* Decorative corner accents */}
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-white/20 group-hover:border-white/40 transition-colors duration-500" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-white/20 group-hover:border-white/40 transition-colors duration-500" />
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative text-center z-10 px-6"
          >
            <div className="text-white/40 text-xl mb-2 font-serif">◆</div>
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-white mb-2 tracking-tight">
              Personal Property
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-3 max-w-xs mx-auto" />
            <p className="text-white/75 text-lg font-light">Discover fine art & collectibles</p>
          </motion.div>
        </Link>
      </div>
    </div>
  );
}