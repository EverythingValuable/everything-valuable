import React from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Truck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      {/* Trust bar */}
      <div className="border-b border-background/10">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-serif text-sm font-medium">Verified Sellers</span>
            <span className="text-xs text-background/60">Sellers are reviewed and approved before listing</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            <span className="font-serif text-sm font-medium">Transparent Fees</span>
            <span className="text-xs text-background/60">No buyer's premium — clear service fee with built-in credit</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Truck className="w-5 h-5 text-primary" />
            <span className="font-serif text-sm font-medium">Seller-Defined Fulfillment</span>
            <span className="text-xs text-background/60">Shipping and payment terms set by each seller</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <h3 className="font-serif text-xl font-semibold mb-4">Everything Valuable</h3>
            <p className="text-sm text-background/60 leading-relaxed">
              The next-generation marketplace for art, antiques, jewelry, and extraordinary objects.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-background/40">Marketplace</h4>
            <ul className="space-y-2.5">
              <li><Link to="/browse" className="text-sm text-background/70 hover:text-background transition-colors">Browse</Link></li>
              <li><Link to="/browse?category=fine_art" className="text-sm text-background/70 hover:text-background transition-colors">Fine Art</Link></li>
              <li><Link to="/browse?category=jewelry" className="text-sm text-background/70 hover:text-background transition-colors">Jewelry</Link></li>
              <li><Link to="/browse?category=watches" className="text-sm text-background/70 hover:text-background transition-colors">Watches</Link></li>
              <li><Link to="/browse?category=furniture" className="text-sm text-background/70 hover:text-background transition-colors">Furniture</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-background/40">Platform</h4>
            <ul className="space-y-2.5">
              <li><Link to="/how-it-works" className="text-sm text-background/70 hover:text-background transition-colors">How It Works</Link></li>
              <li><Link to="/pricing" className="text-sm text-background/70 hover:text-background transition-colors">Pricing & Fees</Link></li>
              <li><Link to="/sell" className="text-sm text-background/70 hover:text-background transition-colors">Sell With Us</Link></li>
              <li><Link to="/about" className="text-sm text-background/70 hover:text-background transition-colors">About</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-4 text-background/40">Support</h4>
            <ul className="space-y-2.5">
              <li><Link to="/about" className="text-sm text-background/70 hover:text-background transition-colors">FAQ</Link></li>
              <li><Link to="/about" className="text-sm text-background/70 hover:text-background transition-colors">Contact</Link></li>
              <li><Link to="/about" className="text-sm text-background/70 hover:text-background transition-colors">Trust & Safety</Link></li>
              <li><Link to="/about" className="text-sm text-background/70 hover:text-background transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        {/* Seller Sign In */}
        <div className="mt-10 pt-8 border-t border-background/10 flex justify-center">
          <Link to="/seller" className="text-sm text-background/50 hover:text-background transition-colors flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />
            Seller Sign In
          </Link>
        </div>

        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-background/40">
            © 2026 Everything Valuable. All rights reserved. PRI$OMETER™ and 1stBid$™ are proprietary technologies.
          </p>
          <div className="flex gap-6">
            <span className="text-xs text-background/40">Privacy Policy</span>
            <span className="text-xs text-background/40">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}