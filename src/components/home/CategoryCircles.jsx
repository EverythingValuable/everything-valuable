import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell, BellOff,
  Palette, Gem, Watch, Sofa, FlaskConical, Globe, Shirt, Archive
} from "lucide-react";

const categories = [
  {
    key: "fine_art",
    label: "Fine Art",
    count: "4",
    icon: Palette,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80&fit=crop",
  },
  {
    key: "jewelry",
    label: "Jewelry",
    count: "2",
    icon: Gem,
    image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/b0f841fcb_Screenshot2026-04-30at10709PM.JPG",
  },
  {
    key: "watches_clocks",
    label: "Watches",
    count: "1",
    icon: Watch,
    image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=600&q=80&fit=crop",
  },
  {
    key: "furniture",
    label: "Furniture",
    count: "2",
    icon: Sofa,
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80&fit=crop",
  },
  {
    key: "decorative_art",
    label: "Decorative Art",
    count: "1",
    icon: FlaskConical,
    image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/b1b4cc42b_Screenshot2026-04-30at11135PM.jpg",
  },
  {
    key: "asian_antiques",
    label: "Asian Art",
    count: "0",
    icon: Globe,
    image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/989e3552b_Screenshot2026-04-30at10825PM.jpg",
  },
  {
    key: "fashion_accessories",
    label: "Fashion",
    count: "0",
    icon: Shirt,
    image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/2955b40d6_90013264_Catalog_G4g1RR5nKs.jpg",
  },
  {
    key: "collectibles",
    label: "Collectibles",
    count: "1",
    icon: Archive,
    image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/2e269e108_Screenshot2026-04-30at11320PM.jpg",
  },
];

function FollowButton({ cat, user, follows }) {
  const queryClient = useQueryClient();
  const existing = follows?.find(f => f.category === cat.key);
  const isFollowing = !!existing;

  const followMutation = useMutation({
    mutationFn: () => base44.entities.CategoryFollow.create({
      user_email: user.email,
      category: cat.key,
      category_label: cat.label,
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["category-follows", user.email] }),
  });

  const unfollowMutation = useMutation({
    mutationFn: () => base44.entities.CategoryFollow.delete(existing.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["category-follows", user.email] }),
  });

  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
      return;
    }
    if (isFollowing) unfollowMutation.mutate();
    else followMutation.mutate();
  };

  const isPending = followMutation.isPending || unfollowMutation.isPending;

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all border ${
        isFollowing
          ? "bg-primary text-white border-primary"
          : "bg-white text-neutral-500 border-neutral-300 hover:border-neutral-500 hover:text-neutral-700"
      }`}
    >
      {isFollowing ? <BellOff className="w-2.5 h-2.5" /> : <Bell className="w-2.5 h-2.5" />}
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}

export default function CategoryCircles() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: () => base44.auth.me(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: follows = [] } = useQuery({
    queryKey: ["category-follows", user?.email],
    queryFn: () => base44.entities.CategoryFollow.filter({ user_email: user.email }),
    enabled: !!user?.email,
    staleTime: 60000,
  });

  return (
    <section className="pt-8 md:pt-10 pb-0 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="mb-8">
          <p className="text-[10px] tracking-[0.28em] uppercase font-semibold text-primary mb-2">
            Browse by Category
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground leading-tight">
            What are you looking for?
          </h2>
        </div>

        {/* Cards — horizontal scroll on mobile, grid on desktop */}
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory md:grid md:grid-cols-8 md:overflow-visible md:snap-none">
          {categories.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <motion.div
                key={cat.key}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05, duration: 0.45, ease: "easeOut" }}
                className="flex-shrink-0 snap-start w-[155px] md:w-auto group"
              >
                <Link
                  to={`/browse?category=${cat.key}`}
                  className="block bg-white border border-[#e5e5e5] rounded-2xl cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-400"
                >
                  {/* Image area */}
                  <div className="relative h-[120px] md:h-[140px] overflow-hidden bg-neutral-100 rounded-t-2xl">
                    <img
                      src={cat.image}
                      alt={cat.label}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </div>

                  {/* Icon badge — sits between image and content, not clipped */}
                  <div className="flex justify-center -mt-4 relative z-10">
                    <div className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center border border-neutral-200">
                      <Icon className="w-4 h-4 text-neutral-800" />
                    </div>
                  </div>

                  {/* Content area */}
                  <div className="pt-2 pb-3.5 px-3.5">
                    <p className="font-semibold text-[13px] text-neutral-900 leading-tight">{cat.label}</p>
                    <p className="text-[11px] text-neutral-400 mt-0.5 mb-2.5">{cat.count} items</p>
                    <FollowButton cat={cat} user={user} follows={follows} />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}