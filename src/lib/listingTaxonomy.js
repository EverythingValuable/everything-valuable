// ─── Listing Taxonomy ─────────────────────────────────────────────────────────
// Controls categories, object types, fields, styles, and title generation

export const LISTING_CATEGORIES = [
  {
    value: "fine_art",
    label: "Fine Art",
    description: "Paintings, drawings, prints, photographs, mixed media",
    examples: ["Painting", "Drawing", "Print", "Photograph"],
    icon: "🎨",
  },
  {
    value: "decorative_arts",
    label: "Decorative Arts",
    description: "Vases, boxes, trays, objects, mirrors, desk accessories",
    examples: ["Vase", "Tray", "Mirror", "Box"],
    icon: "🏺",
  },
  {
    value: "furniture",
    label: "Furniture",
    description: "Chairs, tables, cabinets, desks, mirrors, seating",
    examples: ["Chair", "Table", "Cabinet", "Desk"],
    icon: "🪑",
  },
  {
    value: "lighting",
    label: "Lighting",
    description: "Table lamps, chandeliers, sconces, pendants, lanterns",
    examples: ["Table Lamp", "Chandelier", "Sconce"],
    icon: "💡",
  },
  {
    value: "jewelry",
    label: "Jewelry",
    description: "Rings, necklaces, bracelets, brooches, earrings",
    examples: ["Ring", "Necklace", "Bracelet", "Brooch"],
    icon: "💎",
  },
  {
    value: "watches_clocks",
    label: "Watches & Clocks",
    description: "Wristwatches, pocket watches, mantel clocks, wall clocks",
    examples: ["Wristwatch", "Pocket Watch", "Mantel Clock"],
    icon: "⌚",
  },
  {
    value: "silver",
    label: "Silver",
    description: "Flatware, tea sets, trays, candlesticks, serving pieces",
    examples: ["Tea Set", "Tray", "Candlestick"],
    icon: "🥄",
  },
  {
    value: "ceramics_porcelain",
    label: "Ceramics & Porcelain",
    description: "Vases, bowls, plates, figures, tea sets",
    examples: ["Vase", "Bowl", "Figure", "Tea Set"],
    icon: "🏛️",
  },
  {
    value: "glass",
    label: "Glass",
    description: "Art glass vases, bowls, sculpture, paperweights",
    examples: ["Vase", "Bowl", "Paperweight", "Sculpture"],
    icon: "🔮",
  },
  {
    value: "sculpture",
    label: "Sculpture",
    description: "Bronze, stone, marble, terracotta, wood figures",
    examples: ["Figure", "Bust", "Relief", "Abstract"],
    icon: "🗿",
  },
  {
    value: "rugs_textiles",
    label: "Rugs & Textiles",
    description: "Oriental rugs, tapestries, quilts, needlework",
    examples: ["Persian Rug", "Tapestry", "Quilt"],
    icon: "🧶",
  },
  {
    value: "asian_works",
    label: "Asian Works of Art",
    description: "Chinese, Japanese, Korean and other Asian decorative arts",
    examples: ["Porcelain", "Bronze", "Jade", "Scroll"],
    icon: "🏯",
  },
  {
    value: "collectibles",
    label: "Collectibles",
    description: "Memorabilia, coins, stamps, vintage objects, curiosities",
    examples: ["Coin", "Stamp", "Toy", "Memorabilia"],
    icon: "📦",
  },
  {
    value: "fashion_accessories",
    label: "Fashion & Accessories",
    description: "Handbags, scarves, sunglasses, belts, luxury goods",
    examples: ["Handbag", "Scarf", "Sunglasses"],
    icon: "👜",
  },
  {
    value: "books_manuscripts",
    label: "Books & Manuscripts",
    description: "Rare books, manuscripts, maps, documents, ephemera",
    examples: ["Rare Book", "Manuscript", "Map"],
    icon: "📚",
  },
  {
    value: "other",
    label: "Other",
    description: "Items that don't fit another category",
    examples: ["Miscellaneous"],
    icon: "✦",
  },
];

// ─── Object Types by Category ──────────────────────────────────────────────────
export const OBJECT_TYPES = {
  fine_art: ["Painting", "Drawing", "Print", "Lithograph", "Etching", "Engraving", "Woodcut", "Screenprint", "Aquatint", "Drypoint", "Photograph", "Poster", "Mixed Media", "Collage", "Watercolor", "Pastel", "Charcoal Drawing", "Ink Drawing", "Sculpture", "Portfolio", "Artist Book"],
  decorative_arts: ["Vase", "Bowl", "Box", "Tray", "Mirror", "Candlestick", "Candelabra", "Clock", "Barometer", "Inkwell", "Letter Opener", "Paperweight", "Frame", "Panel", "Screen", "Jardiniere", "Urn", "Centerpiece", "Figurine", "Group"],
  furniture: ["Chair", "Armchair", "Side Chair", "Dining Chair", "Rocking Chair", "Table", "Dining Table", "Console Table", "Coffee Table", "Side Table", "Desk", "Writing Table", "Cabinet", "Chest", "Commode", "Sideboard", "Bookcase", "Étagère", "Mirror", "Sofa", "Settee", "Bench", "Stool", "Ottoman", "Bed", "Headboard", "Screen", "Vitrine", "Pedestal"],
  lighting: ["Table Lamp", "Floor Lamp", "Chandelier", "Pendant Light", "Wall Sconce", "Lantern", "Ceiling Fixture", "Desk Lamp", "Bouillotte Lamp", "Torchère", "Candelabra", "Pair of Lamps"],
  jewelry: ["Ring", "Necklace", "Bracelet", "Brooch", "Earrings", "Pendant", "Charm", "Cufflinks", "Tie Clip", "Stickpin", "Jewelry Set", "Parure", "Demi-Parure"],
  watches_clocks: ["Wristwatch", "Pocket Watch", "Mantel Clock", "Wall Clock", "Bracket Clock", "Carriage Clock", "Tall Case Clock", "Alarm Clock", "Travel Clock"],
  silver: ["Flatware Set", "Tea Set", "Coffee Set", "Tray", "Bowl", "Candlestick", "Candelabra", "Pitcher", "Creamer", "Sugar Bowl", "Goblet", "Box", "Frame", "Serving Piece", "Tureen", "Ladle", "Salt Cellar"],
  ceramics_porcelain: ["Vase", "Bowl", "Plate", "Charger", "Cup", "Saucer", "Tea Set", "Coffee Set", "Figure", "Figurine", "Jardiniere", "Urn", "Centerpiece", "Platter", "Covered Jar", "Cachepot", "Tureen", "Basket"],
  glass: ["Vase", "Bowl", "Sculpture", "Decanter", "Stemware", "Bottle", "Paperweight", "Lamp Shade", "Centerpiece", "Compote", "Perfume Bottle", "Inkwell"],
  sculpture: ["Figure", "Bust", "Relief", "Abstract", "Animal", "Portrait", "Torso", "Group"],
  rugs_textiles: ["Rug", "Carpet", "Runner", "Mat", "Tapestry", "Needlework", "Quilt", "Panel", "Hanging", "Textile"],
  asian_works: ["Vase", "Bowl", "Jar", "Figure", "Figurine", "Scroll", "Painting", "Jade Carving", "Bronze", "Lacquerware", "Panel", "Screen", "Lamp", "Censer"],
  collectibles: ["Coin", "Medal", "Stamp", "Toy", "Doll", "Poster", "Autograph", "Document", "Memorabilia", "Map", "Ephemera"],
  fashion_accessories: ["Handbag", "Clutch", "Tote", "Backpack", "Scarf", "Sunglasses", "Belt", "Hat", "Gloves", "Shoes"],
  books_manuscripts: ["Rare Book", "Manuscript", "Map", "Atlas", "Document", "Letter", "Photograph", "Ephemera"],
  other: ["Other"],
};

// ─── Styles by Category Group ─────────────────────────────────────────────────
export const STYLES = {
  fine_art: ["Abstract", "Abstract Expressionist", "Academic", "Art Deco", "Art Nouveau", "Ashcan School", "Barbizon", "Bauhaus", "Classical", "Color Field", "Contemporary", "Constructivist", "Cubist", "Dada", "Expressionist", "Fauvist", "Figurative", "Folk Art", "Harlem Renaissance", "Hudson River School", "Impressionist", "Minimalist", "Modern", "Naive Art", "Op Art", "Outsider Art", "Pop Art", "Post-Impressionist", "Post-War", "Realist", "Regionalist", "Romantic", "School Of Paris", "Social Realist", "Surrealist", "Tonalist", "WPA"],
  furniture: ["Aesthetic Movement", "Arts and Crafts", "Art Nouveau", "Art Deco", "Baroque", "Bauhaus", "Biedermeier", "Brutalist", "Chinoiserie", "Chippendale", "Directoire", "Eastlake", "Edwardian", "Empire", "Federal", "French Regency", "Georgian", "Gothic Revival", "Hollywood Regency", "Industrial", "Louis XV", "Louis XVI", "Machine Age", "Mid-Century Modern", "Mission", "Modern", "Neoclassical", "Postmodern", "Queen Anne", "Rococo", "Scandinavian Modern", "Victorian"],
  decorative_arts: ["Aesthetic Movement", "Arts and Crafts", "Art Nouveau", "Art Deco", "Baroque", "Biedermeier", "Chinoiserie", "Directoire", "Edwardian", "Empire", "Georgian", "Gothic Revival", "Hollywood Regency", "Industrial", "Jugendstil", "Louis XV", "Louis XVI", "Machine Age", "Mid-Century Modern", "Modern", "Neoclassical", "Rococo", "Scandinavian Modern", "Secessionist", "Space Age", "Victorian", "Vienna Secession"],
  asian_works: ["Arita", "Banko", "Edo", "Famille Jaune", "Famille Noire", "Famille Rose", "Famille Verte", "Han Dynasty", "Imari", "Kangxi Period", "Kutani", "Meiji", "Ming Dynasty", "Qing Dynasty", "Qianlong Period", "Republic Period", "Satsuma", "Song Dynasty", "Tang Dynasty", "Taisho", "Yongzheng Period", "Yuan Dynasty"],
  ceramics_porcelain: ["Arita", "Art Deco", "Art Nouveau", "Arts and Crafts", "Famille Rose", "Famille Verte", "Imari", "Kangxi Period", "Meiji", "Ming Dynasty", "Qing Dynasty", "Satsuma", "Studio Pottery", "Victorian"],
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
  decorative_arts: ["Bronze", "Brass", "Copper", "Pewter", "Iron", "Steel", "Wood", "Lacquer", "Enamel", "Porcelain", "Ceramic", "Glass", "Crystal", "Stone", "Marble", "Alabaster", "Resin", "Composition", "Mother-of-Pearl", "Shell", "Bone", "Leather"],
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
  decorative_arts: {
    required: ["objectType"],
    recommended: ["maker", "origin", "style", "primaryMaterial", "period"],
    optional: ["pattern", "marks"],
    titleFormula: ["maker", "origin", "style", "primaryMaterial", "objectType"],
  },
  lighting: {
    required: ["objectType"],
    recommended: ["maker", "origin", "style", "primaryMaterial", "period"],
    optional: ["shade_material"],
    titleFormula: ["maker", "origin", "style", "primaryMaterial", "objectType"],
  },
  jewelry: {
    required: ["objectType", "metal"],
    recommended: ["maker", "signatureStatus", "metalPurity", "stone", "style"],
    optional: ["ringSize", "caratWeight"],
    titleFormula: ["signatureStatus", "maker", "metalPurity", "metal", "stone", "objectType"],
  },
  ceramics_porcelain: {
    required: ["objectType"],
    recommended: ["maker", "origin", "style", "period", "pattern"],
    optional: ["marks"],
    titleFormula: ["maker", "origin", "style", "period", "objectType"],
  },
  glass: {
    required: ["objectType"],
    recommended: ["maker", "glassType", "origin", "period"],
    optional: ["marks"],
    titleFormula: ["maker", "origin", "glassType", "period", "objectType"],
  },
  silver: {
    required: ["objectType", "silverType"],
    recommended: ["maker", "origin", "period", "marks"],
    optional: ["pattern"],
    titleFormula: ["maker", "origin", "period", "silverType", "objectType"],
  },
  sculpture: {
    required: ["objectType", "primaryMaterial"],
    recommended: ["artist", "signatureStatus", "origin", "style", "period"],
    optional: ["foundry", "edition"],
    titleFormula: ["signatureStatus", "artist", "origin", "style", "primaryMaterial", "objectType"],
  },
  asian_works: {
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

  // Enforce 65 char limit by dropping fields from the end of formula (except objectType, artist, primaryMaterial)
  if (title.length > 65) {
    const safe = unique.filter(p => {
      const lower = p.toLowerCase();
      return (
        lower === (fields.objectType || "").toLowerCase() ||
        lower === (fields.artist || "").toLowerCase() ||
        lower === (fields.maker || "").toLowerCase() ||
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
    { key: "images", label: "Photos", pass: (f) => (f.images?.length || 0) >= 3, weight: 20 },
    { key: "title", label: "Title", pass: (f) => f.title?.trim()?.length > 10, weight: 15 },
    { key: "objectType", label: "Object Type", pass: (f) => !!f.objectType, weight: 10 },
    { key: "description", label: "Description", pass: (f) => (f.description?.length || 0) > 80, weight: 15 },
    { key: "condition", label: "Condition", pass: (f) => !!f.condition, weight: 10 },
    { key: "condition_notes", label: "Condition Report", pass: (f) => (f.condition_notes?.length || 0) > 20, weight: 10 },
    { key: "prisometer_start_price", label: "Pricing", pass: (f) => !!f.prisometer_start_price, weight: 10 },
    { key: "dimensions", label: "Dimensions", pass: (f) => !!f.dimensions, weight: 5 },
    { key: "customer_location", label: "Item Location", pass: (f) => !!f.customer_location, weight: 5 },
  ];

  const score = checks.reduce((sum, c) => sum + (c.pass(form) ? c.weight : 0), 0);
  const missing = checks.filter(c => !c.pass(form)).map(c => c.label);

  return { score, missing, checks };
}