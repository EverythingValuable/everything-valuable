import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ArtistPicker({ value, onChange, placeholder = "Search artists, makers, studios…" }) {
  const [query, setQuery] = useState(value || "");
  const [artists, setArtists] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    base44.entities.Artist.list("name", 500).then(setArtists).catch(() => {});
  }, []);

  useEffect(() => {
    if (!query.trim()) { setFiltered([]); return; }
    const q = query.toLowerCase();
    setFiltered(artists.filter(a => a.name.toLowerCase().includes(q)).slice(0, 12));
  }, [query, artists]);

  // Sync external value
  useEffect(() => {
    if (value !== undefined && value !== query) setQuery(value || "");
  }, [value]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const select = (name) => {
    setQuery(name);
    onChange(name);
    setOpen(false);
  };

  const clear = () => {
    setQuery("");
    onChange("");
    setOpen(false);
  };

  const addNew = async () => {
    if (!query.trim()) return;
    setAdding(true);
    const created = await base44.entities.Artist.create({ name: query.trim(), active: true });
    setArtists(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    onChange(query.trim());
    setOpen(false);
    setAdding(false);
  };

  const showAddNew = query.trim().length > 0 && !artists.some(a => a.name.toLowerCase() === query.trim().toLowerCase());

  return (
    <div ref={ref} className="relative">
      <div className="relative flex items-center">
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); onChange(e.target.value); }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="w-full bg-transparent border-0 border-b border-neutral-200 focus:outline-none focus:border-neutral-700 transition-colors duration-200 text-neutral-800 placeholder:text-neutral-400 h-11 text-base pr-8"
        />
        {value ? (
          <button type="button" onClick={clear} className="absolute right-0 top-1/2 -translate-y-1/2 text-neutral-300 hover:text-neutral-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        ) : (
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300 pointer-events-none" />
        )}
      </div>

      {open && (query.trim().length > 0) && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 shadow-lg max-h-64 overflow-y-auto">
          {filtered.length === 0 && !showAddNew && (
            <p className="px-4 py-3 text-xs text-neutral-400">No matches found</p>
          )}
          {filtered.map(artist => (
            <button
              key={artist.id}
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={() => select(artist.name)}
              className="w-full text-left px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50 flex items-center justify-between group"
            >
              <span>{artist.name}</span>
              {artist.category && (
                <span className="text-[10px] text-neutral-400 tracking-wide uppercase">{artist.category}</span>
              )}
            </button>
          ))}
          {showAddNew && (
            <button
              type="button"
              onMouseDown={e => e.preventDefault()}
              onClick={addNew}
              disabled={adding}
              className="w-full text-left px-4 py-2.5 text-sm text-primary hover:bg-primary/5 flex items-center gap-2 border-t border-neutral-100"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              {adding ? "Adding…" : `Add "${query.trim()}" to database`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}