import React from "react";

// Maps common country keywords (and US state abbreviations) to flag emojis
const COUNTRY_FLAGS = {
  // United States
  "united states": "🇺🇸", "usa": "🇺🇸", " us": "🇺🇸",
  // US states (abbreviations that appear at end of "City, ST" strings)
  " al": "🇺🇸", " ak": "🇺🇸", " az": "🇺🇸", " ar": "🇺🇸", " ca": "🇺🇸",
  " co": "🇺🇸", " ct": "🇺🇸", " de": "🇺🇸", " fl": "🇺🇸", " ga": "🇺🇸",
  " hi": "🇺🇸", " id": "🇺🇸", " il": "🇺🇸", " in": "🇺🇸", " ia": "🇺🇸",
  " ks": "🇺🇸", " ky": "🇺🇸", " la": "🇺🇸", " me": "🇺🇸", " md": "🇺🇸",
  " ma": "🇺🇸", " mi": "🇺🇸", " mn": "🇺🇸", " ms": "🇺🇸", " mo": "🇺🇸",
  " mt": "🇺🇸", " ne": "🇺🇸", " nv": "🇺🇸", " nh": "🇺🇸", " nj": "🇺🇸",
  " nm": "🇺🇸", " ny": "🇺🇸", " nc": "🇺🇸", " nd": "🇺🇸", " oh": "🇺🇸",
  " ok": "🇺🇸", " or": "🇺🇸", " pa": "🇺🇸", " ri": "🇺🇸", " sc": "🇺🇸",
  " sd": "🇺🇸", " tn": "🇺🇸", " tx": "🇺🇸", " ut": "🇺🇸", " vt": "🇺🇸",
  " va": "🇺🇸", " wa": "🇺🇸", " wv": "🇺🇸", " wi": "🇺🇸", " wy": "🇺🇸",
  " dc": "🇺🇸",
  // Other countries
  "canada": "🇨🇦", " canada": "🇨🇦",
  "united kingdom": "🇬🇧", "uk": "🇬🇧", "england": "🇬🇧", "scotland": "🇬🇧", "wales": "🇬🇧",
  "france": "🇫🇷", "paris": "🇫🇷",
  "germany": "🇩🇪",
  "italy": "🇮🇹",
  "spain": "🇪🇸",
  "netherlands": "🇳🇱", "holland": "🇳🇱",
  "belgium": "🇧🇪",
  "switzerland": "🇨🇭",
  "austria": "🇦🇹",
  "sweden": "🇸🇪",
  "norway": "🇳🇴",
  "denmark": "🇩🇰",
  "finland": "🇫🇮",
  "portugal": "🇵🇹",
  "japan": "🇯🇵",
  "china": "🇨🇳",
  "australia": "🇦🇺",
  "new zealand": "🇳🇿",
  "brazil": "🇧🇷",
  "mexico": "🇲🇽",
  "israel": "🇮🇱",
  "india": "🇮🇳",
  "singapore": "🇸🇬",
  "hong kong": "🇭🇰",
  "hungary": "🇭🇺",
  "poland": "🇵🇱",
  "czech": "🇨🇿",
  "romania": "🇷🇴",
  "greece": "🇬🇷",
  "turkey": "🇹🇷",
  "russia": "🇷🇺",
  "ukraine": "🇺🇦",
  "south korea": "🇰🇷",
  "argentina": "🇦🇷",
  "chile": "🇨🇱",
  "colombia": "🇨🇴",
  "south africa": "🇿🇦",
};

function detectFlag(location) {
  if (!location) return null;
  const lower = " " + location.toLowerCase().trim();

  // Check full keywords
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (lower.includes(key)) return flag;
  }
  return null;
}

export default function LocationFlag({ location, className = "" }) {
  if (!location) return null;
  const flag = detectFlag(location);

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {flag && (
        <span
          className="inline-flex items-center justify-center w-5 h-5 rounded-full overflow-hidden text-sm leading-none border border-border/50 bg-white shadow-sm"
          title={location}
          style={{ fontSize: "14px", lineHeight: "20px" }}
        >
          {flag}
        </span>
      )}
      <span>{location}</span>
    </span>
  );
}