// ─── Listing Taxonomy ─────────────────────────────────────────────────────────
// Controls categories, object types, fields, styles, and title generation

export const LISTING_CATEGORIES = [
  {
    value: "fine_art",
    label: "Fine Art",
    description: "Paintings, drawings, prints, photographs, mixed media",
    examples: ["Painting", "Drawing", "Print", "Photograph"],
  },
  {
    value: "decorative_art",
    label: "Decorative Arts",
    description: "Vases, boxes, trays, objects, mirrors, desk accessories",
    examples: ["Vase", "Tray", "Mirror", "Box"],
  },
  {
    value: "furniture",
    label: "Furniture",
    description: "Chairs, tables, cabinets, desks, mirrors, seating",
    examples: ["Chair", "Table", "Cabinet", "Desk"],
  },
  {
    value: "jewelry",
    label: "Jewelry",
    description: "Rings, necklaces, bracelets, brooches, earrings",
    examples: ["Ring", "Necklace", "Bracelet", "Brooch"],
  },
  {
    value: "watches_clocks",
    label: "Watches & Clocks",
    description: "Mantel clocks, wristwatches, pocket watches, wall clocks",
    examples: ["Mantel Clock", "Wristwatch", "Pocket Watch"],
  },
  {
    value: "asian_antiques",
    label: "Asian Antiques",
    description: "Chinese, Japanese, Korean and other Asian decorative arts",
    examples: ["Porcelain", "Bronze", "Jade", "Scroll"],
  },
  {
    value: "fashion_accessories",
    label: "Fashion & Accessories",
    description: "Handbags, scarves, sunglasses, belts, luxury goods",
    examples: ["Handbag", "Scarf", "Sunglasses"],
  },
  {
    value: "collectibles",
    label: "Collectibles",
    description: "Coins, medals, stamps, vintage objects, curiosities",
    examples: ["Coin", "Stamp", "Toy", "Memorabilia"],
  },
  {
    value: "other",
    label: "Other",
    description: "Items that don't fit another department",
    examples: ["Miscellaneous"],
  },
];

// ─── Object Types by Category ──────────────────────────────────────────────────
export const OBJECT_TYPES = {
  fine_art: ["Painting", "Drawing", "Print", "Lithograph", "Etching", "Engraving", "Woodcut", "Screenprint", "Aquatint", "Drypoint", "Photograph", "Poster", "Mixed Media", "Collage", "Watercolor", "Pastel", "Charcoal Drawing", "Ink Drawing", "Sculpture", "Portfolio", "Artist Book"],
  decorative_art: ["Vase", "Bowl", "Box", "Tray", "Mirror", "Candlestick", "Candelabra", "Clock", "Barometer", "Inkwell", "Letter Opener", "Paperweight", "Frame", "Panel", "Screen", "Jardiniere", "Urn", "Centerpiece", "Figurine", "Group", "Table Lamp", "Floor Lamp", "Chandelier", "Pendant Light", "Wall Sconce", "Lantern", "Ceiling Fixture", "Desk Lamp", "Bouillotte Lamp", "Torchère", "Pair of Lamps"],
  furniture: ["Chair", "Armchair", "Side Chair", "Dining Chair", "Rocking Chair", "Table", "Dining Table", "Console Table", "Coffee Table", "Side Table", "Desk", "Writing Table", "Cabinet", "Chest", "Commode", "Sideboard", "Bookcase", "Étagère", "Mirror", "Sofa", "Settee", "Bench", "Stool", "Ottoman", "Bed", "Headboard", "Screen", "Vitrine", "Pedestal"],
  jewelry: ["Ring", "Necklace", "Bracelet", "Brooch", "Earrings", "Pendant", "Charm", "Cufflinks", "Tie Clip", "Stickpin", "Jewelry Set", "Parure", "Demi-Parure"],
  watches_clocks: ["Wristwatch", "Pocket Watch", "Mantel Clock", "Wall Clock", "Bracket Clock", "Carriage Clock", "Tall Case Clock", "Alarm Clock", "Travel Clock"],
  asian_antiques: ["Vase", "Bowl", "Jar", "Figure", "Figurine", "Scroll", "Painting", "Jade Carving", "Bronze", "Lacquerware", "Panel", "Screen", "Lamp", "Censer"],
  collectibles: ["Coin", "Medal", "Stamp", "Toy", "Doll", "Poster", "Autograph", "Document", "Memorabilia", "Map", "Ephemera"],
  fashion_accessories: ["Handbag", "Clutch", "Tote", "Backpack", "Scarf", "Sunglasses", "Belt", "Hat", "Gloves", "Shoes"],
  other: ["Other"],
};

// ─── Styles by Category Group ─────────────────────────────────────────────────
export const STYLES = {
  fine_art: ["Abstract", "Abstract Expressionist", "Academic", "Art Deco", "Art Nouveau", "Ashcan School", "Barbizon", "Bauhaus", "Classical", "Color Field", "Contemporary", "Constructivist", "Cubist", "Dada", "Expressionist", "Fauvist", "Figurative", "Folk Art", "Harlem Renaissance", "Hudson River School", "Impressionist", "Minimalist", "Modern", "Naive Art", "Op Art", "Outsider Art", "Pop Art", "Post-Impressionist", "Post-War", "Realist", "Regionalist", "Romantic", "School Of Paris", "Social Realist", "Surrealist", "Tonalist", "WPA"],
  furniture: ["Aesthetic Movement", "Arts and Crafts", "Art Nouveau", "Art Deco", "Baroque", "Bauhaus", "Biedermeier", "Brutalist", "Chinoiserie", "Chippendale", "Directoire", "Eastlake", "Edwardian", "Empire", "Federal", "French Regency", "Georgian", "Gothic Revival", "Hollywood Regency", "Industrial", "Louis XV", "Louis XVI", "Machine Age", "Mid-Century Modern", "Mission", "Modern", "Neoclassical", "Postmodern", "Queen Anne", "Rococo", "Scandinavian Modern", "Victorian"],
  decorative_art: ["Aesthetic Movement", "Arts and Crafts", "Art Nouveau", "Art Deco", "Baroque", "Biedermeier", "Chinoiserie", "Directoire", "Edwardian", "Empire", "Georgian", "Gothic Revival", "Hollywood Regency", "Industrial", "Jugendstil", "Louis XV", "Louis XVI", "Machine Age", "Mid-Century Modern", "Modern", "Neoclassical", "Rococo", "Scandinavian Modern", "Secessionist", "Space Age", "Victorian", "Vienna Secession"],
  asian_antiques: ["Arita", "Banko", "Edo", "Famille Jaune", "Famille Noire", "Famille Rose", "Famille Verte", "Han Dynasty", "Imari", "Kangxi Period", "Kutani", "Meiji", "Ming Dynasty", "Qing Dynasty", "Qianlong Period", "Republic Period", "Satsuma", "Song Dynasty", "Tang Dynasty", "Taisho", "Yongzheng Period", "Yuan Dynasty"],
  default: ["Art Deco", "Art Nouveau", "Arts and Crafts", "Baroque", "Biedermeier", "Chinoiserie", "Edwardian", "Empire", "Georgian", "Gothic Revival", "Industrial", "Mid-Century Modern", "Modern", "Neoclassical", "Rococo", "Scandinavian Modern", "Victorian"],
};

// ─── Origins ──────────────────────────────────────────────────────────────────
export const ORIGINS = ["American", "Austrian", "Belgian", "British", "Chinese", "Danish", "Dutch", "Finnish", "Flemish", "French", "German", "Hungarian", "Indian", "Italian", "Japanese", "Korean", "Mexican", "Norwegian", "Persian", "Polish", "Portuguese", "Russian", "Scandinavian", "Spanish", "Swedish", "Swiss", "Turkish"];

// ─── Mediums (Fine Art) ───────────────────────────────────────────────────────
export const MEDIUMS = ["Oil", "Acrylic", "Watercolor", "Gouache", "Pastel", "Charcoal", "Ink", "Graphite", "Mixed Media", "Collage", "Tempera", "Encaustic", "Lithograph", "Etching", "Engraving", "Woodcut", "Screenprint", "Aquatint", "Drypoint", "Photograph", "Gelatin Silver Print", "Digital Print"];

// ─── Supports (Fine Art) ──────────────────────────────────────────────────────
export const SUPPORTS = ["Canvas", "Panel", "Board", "Paper", "Masonite", "Linen", "Cardboard", "Copper", "Silk", "Photograph Paper", "Velvet"];

// ─── Signature Statuses ───────────────────────────────────────────────────────
export const SIGNATURE_STATUSES = ["Signed", "Monogrammed", "Attributed To", "After", "Manner Of", "School Of", "Unsigned"];

// ─── Materials by Category ────────────────────────────────────────────────────
export const MATERIALS = {
  decorative_art: ["Bronze", "Brass", "Copper", "Pewter", "Iron", "Steel", "Wood", "Lacquer", "Enamel", "Porcelain", "Ceramic", "Glass", "Crystal", "Stone", "Marble", "Alabaster", "Resin", "Composition", "Mother-of-Pearl", "Shell", "Bone", "Leather"],
  furniture: ["Walnut", "Mahogany", "Oak", "Rosewood", "Teak", "Maple", "Pine", "Cherry", "Satinwood", "Kingwood", "Burl Wood", "Ebony", "Ebonized Wood", "Giltwood", "Lacquered Wood", "Cane", "Wicker", "Rattan", "Steel", "Brass", "Bronze", "Iron", "Glass", "Marble", "Leather", "Velvet", "Linen"],
  sculpture: ["Bronze", "Marble", "Terracotta", "Plaster", "Stone", "Granite", "Alabaster", "Wood", "Ivory", "Bone", "Resin", "Steel", "Iron", "Brass", "Copper", "Glass"],
  jewelry: ["Yellow Gold", "White Gold", "Rose Gold", "Platinum", "Sterling Silver", "Silver", "Vermeil", "Gold Filled", "Gold Plated", "Stainless Steel"],
  lighting: ["Brass", "Bronze", "Gilt Bronze", "Iron", "Steel", "Nickel", "Chrome", "Glass", "Crystal", "Favrile Glass", "Slag Glass", "Ceramic", "Porcelain", "Wood"],
  glass: ["Art Glass", "Blown Glass", "Cameo Glass", "Cased Glass", "Cut Glass", "Pressed Glass", "Slag Glass", "Stained Glass", "Studio Glass"],
  silver: ["Sterling Silver", "Silver Plate", "Sheffield Plate", "Britannia Silver", "800 Silver", "925 Silver"],
  default: ["Bronze", "Brass", "Wood", "Ceramic", "Glass", "Stone", "Marble", "Iron", "Steel", "Leather", "Fabric"],
};

// ─── Jewelry Stones ───────────────────────────────────────────────────────────
export const STONES = ["Diamond", "Sapphire", "Ruby", "Emerald", "Pearl", "Opal", "Amethyst", "Aquamarine", "Garnet", "Topaz", "Tourmaline", "Citrine", "Turquoise", "Coral", "Jade", "Onyx", "Lapis Lazuli", "Moonstone", "Spinel", "Tanzanite", "No Stone"];

// ─── Metal Purity ─────────────────────────────────────────────────────────────
export const METAL_PURITY = ["10K", "14K", "18K", "22K", "24K", "800 Silver", "835 Silver", "900 Silver", "925 Sterling", "950 Platinum", "Not Marked"];

// ─── Field Config by Category ─────────────────────────────────────────────────
export const CATEGORY_FIELDS = {
  fine_art: {
    required: ["objectType", "medium", "support"],
    recommended: ["artist", "signatureStatus", "style", "origin", "period", "subject", "framed"],
    optional: ["titleOfWork", "printEdition", "printPublisher"],
    titleFormula: ["signatureStatus", "artist", "origin", "style", "medium", "support", "objectType"],
  },
  furniture: {
    required: ["objectType", "style"],
    recommended: ["maker", "origin", "primaryMaterial", "period"],
    optional: ["manufacturer", "woodType", "upholsteryMaterial"],
    titleFormula: ["maker", "origin", "style", "period", "primaryMaterial", "objectType"],
  },
  decorative_art: {
    required: ["objectType"],
    recommended: ["maker", "origin", "style", "primaryMaterial", "period"],
    optional: ["pattern", "marks", "shade_material"],
    titleFormula: ["maker", "origin", "style", "primaryMaterial", "objectType"],
  },
  jewelry: {
    required: ["objectType", "metal"],
    recommended: ["maker", "signatureStatus", "metalPurity", "stone", "style"],
    optional: ["ringSize", "caratWeight"],
    titleFormula: ["signatureStatus", "maker", "metalPurity", "metal", "stone", "objectType"],
  },
  asian_antiques: {
    required: ["objectType"],
    recommended: ["origin", "style", "period"],
    optional: ["maker", "marks"],
    titleFormula: ["origin", "style", "period", "objectType"],
  },
  default: {
    required: ["objectType"],
    recommended: ["maker", "origin", "style", "primaryMaterial", "period"],
    optional: [],
    titleFormula: ["maker", "origin", "style", "primaryMaterial", "objectType"],
  },
};

// ─── Title Generation ─────────────────────────────────────────────────────────
export function generateTitle(fields, categoryKey) {
  const config = CATEGORY_FIELDS[categoryKey] || CATEGORY_FIELDS.default;
  const formula = config.titleFormula;

  const parts = formula
    .map(key => {
      const val = fields[key];
      if (!val || val === "Unsigned" || val === "No Stone" || val === "Not Marked") return null;
      return val;
    })
    .filter(Boolean);

  // Remove duplicates while preserving order
  const seen = new Set();
  const unique = parts.filter(p => {
    const lower = p.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });

  let title = unique.join(" ");

  // Title case
  title = title.replace(/\b\w/g, l => l.toUpperCase());

  // Enforce 120 char limit by dropping lowest-priority fields from the end
  if (title.length > 120) {
    const safe = unique.filter(p => {
      const lower = p.toLowerCase();
      return (
        lower === (fields.objectType || "").toLowerCase() ||
        lower === (fields.artist || "").toLowerCase() ||
        lower === (fields.maker || "").toLowerCase() ||
        lower === (fields.style || "").toLowerCase() ||
        lower === (fields.medium || "").toLowerCase() ||
        lower === (fields.primaryMaterial || "").toLowerCase() ||
        lower === (fields.metal || "").toLowerCase()
      );
    });
    title = safe.join(" ").replace(/\b\w/g, l => l.toUpperCase());
  }

  return title.trim();
}

// ─── Listing Strength ─────────────────────────────────────────────────────────
export function getListingStrength(form, categoryKey) {
  const checks = [
    { key: "images", label: "Photos added", pass: (f) => (f.images?.length || 0) >= 3, weight: 20 },
    { key: "title", label: "Title complete", pass: (f) => f.title?.trim()?.length > 10, weight: 15 },
    { key: "objectType", label: "Pricing set", pass: (f) => !!f.prisometer_start_price, weight: 15 },
    { key: "description", label: "Full description", pass: (f) => (f.description?.length || 0) > 80, weight: 15 },
    { key: "condition", label: "Condition set", pass: (f) => !!f.condition, weight: 10 },
    { key: "condition_notes", label: "Condition Report", pass: (f) => (f.condition_notes?.length || 0) > 20, weight: 10 },
    { key: "category", label: "Category selected", pass: (f) => !!f.category, weight: 10 },
    { key: "customer_location", label: "Item location", pass: (f) => !!f.customer_location, weight: 5 },
  ];

  const score = checks.reduce((sum, c) => sum + (c.pass(form) ? c.weight : 0), 0);
  const missing = checks.filter(c => !c.pass(form)).map(c => c.label);

  return { score, missing, checks };
}