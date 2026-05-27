import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, BellOff } from "lucide-react";

const categories = [
  { key: "fine_art", label: "Fine Art", image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80&fit=crop" },
  { key: "jewelry", label: "Jewelry", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/b0f841fcb_Screenshot2026-04-30at10709PM.JPG" },
  { key: "watches_clocks", label: "Watches", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=400&q=80&fit=crop" },
  { key: "furniture", label: "Furniture", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80&fit=crop" },
  { key: "decorative_art", label: "Decorative Art", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/b1b4cc42b_Screenshot2026-04-30at11135PM.jpg" },
  { key: "asian_antiques", label: "Asian Art", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/989e3552b_Screenshot2026-04-30at10825PM.jpg" },
  { key: "fashion_accessories", label: "Fashion", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/2955b40d6_90013264_Catalog_G4g1RR5nKs.jpg" },
  { key: "collectibles", label: "Collectibles", image: "https://media.base44.com/images/public/69beac1c3231aaeb891946d5/2e269e108_Screenshot2026-04-30at11320PM.jpg" },
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
      className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold transition-all border mt-1 ${
        isFollowing
          ? "bg-primary text-white border-primary"
          : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
      }`}
    >
      {isFollowing ? <BellOff className="w-3 h-3" /> : <Bell className="w-3 h-3" />}
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}

function CategoryCard({ cat, index, user, follows, itemCounts }) {
  const count = itemCounts?.[cat.key];

  return (
    <motion.div
      key={cat.key}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: "easeOut" }}
      className="flex-shrink-0 w-[140px] md:w-[160px]"
    >
      <Link to={`/browse?category=${cat.key}`} className="group block">
        {/* Image */}
        <div className="w-full h-[130px] md:h-[148px] overflow-hidden bg-neutral-100 border border-border/40">
          <img
            src={cat.image}
            alt={cat.label}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        </div>
        {/* Label */}
        <p className="mt-2 text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-tight">
          {cat.label}
        </p>
      </Link>

      {/* Item count */}
      {count != null && (
        <p className="text-[11px] text-muted-foreground mt-0.5">{count.toLocaleString()} items</p>
      )}

      {/* Follow button */}
      <FollowButton cat={cat} user={user} follows={follows} />
    </motion.div>
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

  // Fetch live item counts per category
  const { data: allItems = [] } = useQuery({
    queryKey: ["items-category-counts"],
    queryFn: () => base44.entities.Item.filter({ status: ["prisometer", "first_bids"] }),
    staleTime: 5 * 60 * 1000,
  });

  const itemCounts = useMemo(() => {
    const counts = {};
    allItems.forEach(item => {
      if (item.category) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    });
    return counts;
  }, [allItems]);

  return (
    <section className="pt-12 md:pt-16 pb-0 bg-background">
      <div className="max-w-screen-xl mx-auto px-6 md:px-10">

        <div className="mb-8">
          <p className="text-xs tracking-[0.22em] uppercase font-display font-semibold text-primary mb-2">
            Browse by Category
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-semibold text-foreground leading-tight">
            What are you looking for?
          </h2>
        </div>

        <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 scrollbar-hide">
          {categories.map((cat, i) => (
            <CategoryCard
              key={cat.key}
              cat={cat}
              index={i}
              user={user}
              follows={follows}
              itemCounts={itemCounts}
            />
          ))}
        </div>

      </div>
    </section>
  );
}