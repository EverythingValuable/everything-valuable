import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import HeroSection from "../components/home/HeroSection";
import FeaturedItems from "../components/home/FeaturedItems";
import CategoryCircles from "../components/home/CategoryCircles";
import HowItWorksPreview from "../components/home/HowItWorksPreview";
import RecentlyViewed from "../components/home/RecentlyViewed";
import PrisometerExplainer from "../components/home/PrisometerExplainer";
import SellersSection from "../components/home/SellersSection";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const navigate = useNavigate();

  const { data: liveItems = [], isLoading: loadingLive } = useQuery({
    queryKey: ["items-live"],
    queryFn: () => base44.entities.Item.filter({ status: "prisometer" }, "-created_date", 10),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const { data: previewItems = [], isLoading: loadingPreview } = useQuery({
    queryKey: ["items-preview"],
    queryFn: () => base44.entities.Item.filter({ status: "first_bids" }, "-created_date", 10),
    refetchInterval: 60000,
    staleTime: 30000,
  });

  const allFeatured = [...(liveItems || []), ...(previewItems || [])].slice(0, 10);
  const featuredLoading = loadingLive || loadingPreview;

  return (
    <div>
      <HeroSection />
      <CategoryCircles />
      <RecentlyViewed />

      {/* Featured items */}
      <FeaturedItems
        liveItems={liveItems}
        previewItems={previewItems}
        title="Featured Live Sales"
        isLoading={featuredLoading}
      />

      {/* Prisometer Explainer */}
      <PrisometerExplainer />

      {/* Sellers Section */}
      <SellersSection />


    </div>
  );
}