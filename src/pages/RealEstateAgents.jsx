import React, { useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Star, Phone, Mail, Globe, MapPin, Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const DEMO_AGENTS = [
  {
    id: "ag-001", name: "Catherine Whitmore", title: "Senior Broker & Estate Specialist",
    photo_url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
    brokerage: "Whitmore Private Realty", email: "c.whitmore@example.com", phone: "(845) 555-0192",
    years_experience: 18, total_sales_volume: 185000000, closed_transactions: 94, rating: 4.9, review_count: 41,
    specialties: ["Luxury Estates", "Historic Properties", "Hudson Valley"],
    licensed_states: ["NY", "CT"],
    service_areas: ["Rhinebeck", "Millbrook", "Hudson", "Woodstock"],
    bio: "Catherine has built a distinguished 18-year career specializing in exceptional Hudson Valley estates and historic properties. Her deep knowledge of the region and white-glove service have earned her a reputation as the go-to advisor for discerning buyers and sellers.",
    featured: true, active: true,
  },
  {
    id: "ag-002", name: "James Harrington", title: "Licensed Real Estate Broker",
    photo_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
    brokerage: "Harrington & Associates", email: "j.harrington@example.com", phone: "(212) 555-0341",
    years_experience: 22, total_sales_volume: 340000000, closed_transactions: 178, rating: 4.8, review_count: 89,
    specialties: ["Manhattan Luxury", "Penthouse", "Investment Properties"],
    licensed_states: ["NY", "NJ", "CT"],
    service_areas: ["Tribeca", "SoHo", "Upper East Side", "Greenwich Village"],
    bio: "James is one of Manhattan's most decorated real estate professionals, with over $340M in lifetime sales. He specializes in landmark co-ops, penthouses, and discreet off-market transactions for ultra-high-net-worth clients.",
    featured: true, active: true,
  },
  {
    id: "ag-003", name: "Sophia Delacroix", title: "Waterfront & Coastal Specialist",
    photo_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
    brokerage: "Coastal Luxury Realty", email: "s.delacroix@example.com", phone: "(631) 555-0774",
    years_experience: 12, total_sales_volume: 220000000, closed_transactions: 63, rating: 4.9, review_count: 28,
    specialties: ["Waterfront", "Hamptons", "Coastal Estates"],
    licensed_states: ["NY"],
    service_areas: ["Southampton", "East Hampton", "Sag Harbor", "Montauk"],
    bio: "Sophia has earned a stellar reputation as the leading waterfront specialist in the Hamptons. Her extensive knowledge of South Fork's most coveted properties — from oceanfront compounds to private dockside retreats — makes her an indispensable resource.",
    featured: true, active: true,
  },
  {
    id: "ag-004", name: "Robert Pemberton", title: "Commercial & Mixed-Use Advisor",
    photo_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
    brokerage: "Pemberton Commercial Partners", email: "r.pemberton@example.com", phone: "(212) 555-0556",
    years_experience: 15, total_sales_volume: 410000000, closed_transactions: 52, rating: 4.7, review_count: 17,
    specialties: ["Commercial", "Mixed-Use", "Development Sites"],
    licensed_states: ["NY", "NJ"],
    service_areas: ["NYC Metro", "Hudson Valley", "Connecticut"],
    bio: "Robert brings 15 years of commercial real estate expertise to every transaction. He has brokered some of the region's most complex mixed-use and development transactions, and serves developers, family offices, and institutional investors.",
    featured: false, active: true,
  },
];

function AgentCard({ agent, index }) {
  const [showContact, setShowContact] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      {agent.featured && (
        <div className="bg-primary/10 border-b border-primary/20 px-4 py-1.5 flex items-center gap-1.5">
          <Award className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Featured Advisor</span>
        </div>
      )}

      <div className="p-6">
        <div className="flex gap-4 mb-4">
          {agent.photo_url ? (
            <img src={agent.photo_url} alt={agent.name} className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-border" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center shrink-0 text-2xl font-serif font-semibold text-muted-foreground">
              {agent.name[0]}
            </div>
          )}
          <div className="min-w-0">
            <h3 className="font-serif text-lg font-semibold leading-tight">{agent.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{agent.title}</p>
            {agent.brokerage && <p className="text-xs text-primary font-medium mt-0.5">{agent.brokerage}</p>}
            {agent.rating && (
              <div className="flex items-center gap-1 mt-1">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-semibold">{agent.rating}</span>
                <span className="text-xs text-muted-foreground">({agent.review_count} reviews)</span>
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs font-bold text-foreground">{agent.years_experience}yr</p>
            <p className="text-[10px] text-muted-foreground">Experience</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs font-bold text-foreground">{agent.closed_transactions}</p>
            <p className="text-[10px] text-muted-foreground">Closed</p>
          </div>
          <div className="bg-muted/50 rounded-lg p-2">
            <p className="text-xs font-bold text-foreground">${(agent.total_sales_volume / 1000000).toFixed(0)}M</p>
            <p className="text-[10px] text-muted-foreground">Volume</p>
          </div>
        </div>

        {/* Specialties */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.specialties?.map(s => (
            <Badge key={s} variant="outline" className="text-[10px] px-2 py-0.5">{s}</Badge>
          ))}
        </div>

        {/* Service areas */}
        {agent.service_areas?.length > 0 && (
          <div className="flex items-start gap-1.5 mb-4">
            <MapPin className="w-3 h-3 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-xs text-muted-foreground">{agent.service_areas.join(", ")}</p>
          </div>
        )}

        {/* Bio */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-4">{agent.bio}</p>

        {/* Licensed states */}
        <div className="flex gap-1 flex-wrap mb-4">
          {agent.licensed_states?.map(s => (
            <span key={s} className="text-[10px] font-semibold bg-secondary text-secondary-foreground px-2 py-0.5 rounded">{s}</span>
          ))}
        </div>

        {!showContact ? (
          <Button onClick={() => setShowContact(true)} className="w-full h-9 text-sm gap-2">
            Contact Agent
          </Button>
        ) : (
          <div className="space-y-2">
            {agent.phone && (
              <a href={`tel:${agent.phone}`} className="flex items-center gap-2 w-full h-9 px-4 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                <Phone className="w-3.5 h-3.5 text-primary" />{agent.phone}
              </a>
            )}
            {agent.email && (
              <a href={`mailto:${agent.email}`} className="flex items-center gap-2 w-full h-9 px-4 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                <Mail className="w-3.5 h-3.5 text-primary" />{agent.email}
              </a>
            )}
            {agent.website && (
              <a href={agent.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 w-full h-9 px-4 rounded-lg border border-border hover:bg-muted transition-colors text-sm">
                <Globe className="w-3.5 h-3.5 text-primary" />Website
              </a>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function RealEstateAgents() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("");

  const { data: dbAgents = [] } = useQuery({
    queryKey: ["re-agents"],
    queryFn: () => base44.entities.RealEstateAgent.filter({ active: true }),
    staleTime: 120000,
  });

  const agents = dbAgents.length > 0 ? dbAgents : DEMO_AGENTS;

  const allSpecialties = useMemo(() => {
    const s = new Set();
    agents.forEach(a => a.specialties?.forEach(sp => s.add(sp)));
    return Array.from(s).sort();
  }, [agents]);

  const filtered = useMemo(() => agents.filter(a => {
    if (search && !a.name?.toLowerCase().includes(search.toLowerCase()) && !a.service_areas?.join(" ").toLowerCase().includes(search.toLowerCase())) return false;
    if (specialty && !a.specialties?.includes(specialty)) return false;
    return true;
  }), [agents, search, specialty]);

  const featured = filtered.filter(a => a.featured);
  const others = filtered.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-foreground text-background py-16 md:py-20 px-4 md:px-8">
        <div className="max-w-screen-xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3">Curated Advisor Network</p>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold mb-4">Real Estate Advisors</h1>
          <p className="text-background/70 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Connect with our hand-selected network of licensed specialists — each experienced in high-value, structured sale transactions.
          </p>

          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name or location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-64 h-11 pl-9 pr-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={specialty}
              onChange={e => setSpecialty(e.target.value)}
              className="h-11 px-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none"
            >
              <option value="">All Specialties</option>
              {allSpecialties.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-8 py-12">
        {featured.length > 0 && (
          <div className="mb-12">
            <h2 className="font-serif text-2xl font-semibold mb-6">Featured Advisors</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((a, i) => <AgentCard key={a.id} agent={a} index={i} />)}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div>
            {featured.length > 0 && <h2 className="font-serif text-2xl font-semibold mb-6">All Advisors</h2>}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {others.map((a, i) => <AgentCard key={a.id} agent={a} index={i} />)}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <TrendingUp className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
            <p className="font-serif text-xl text-muted-foreground">No advisors match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}