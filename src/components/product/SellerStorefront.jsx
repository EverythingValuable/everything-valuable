import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function SellerStorefront({ item, sellerProfile }) {
  if (!item?.seller_email || !sellerProfile) return null;

  const displayName = sellerProfile.display_name || item.seller_name || "Seller";
  const logoUrl = sellerProfile.logo_url;
  const bannerUrl = sellerProfile.banner_url;

  return (
    <div className="mt-12 mb-8">
      {/* Card with banner background and gradient overlay */}
      <div
        className="relative h-48 rounded-lg overflow-hidden border border-border shadow-sm"
        style={{
          backgroundImage: bannerUrl ? `url(${bannerUrl})` : "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Content */}
        <div className="relative h-full flex items-end p-6 gap-4">
          {/* Logo */}
          {logoUrl && (
            <div className="flex-shrink-0">
              <img
                src={logoUrl}
                alt={displayName}
                className="w-24 h-24 rounded-lg bg-white object-cover border border-border shadow-md"
              />
            </div>
          )}

          {/* Text + Button */}
          <div className="flex-1 flex items-end justify-between gap-4 pb-2">
            <div className="min-w-0">
              <h3 className="text-2xl font-serif font-semibold text-white mb-1 truncate">
                {displayName}
              </h3>
              <p className="text-sm text-white/85">View their storefront</p>
            </div>

            <Link
              to={`/seller/profile?seller=${item.seller_email}`}
              className="flex-shrink-0"
            >
              <Button className="bg-white text-foreground hover:bg-white/90 gap-2 h-10 px-6 font-semibold">
                View Storefront <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}