// Central category configuration for the auction platform

export const MAIN_CATEGORIES = [
  { value: "fine_art",            label: "Fine Art" },
  { value: "decorative_art",      label: "Decorative Art" },
  { value: "decorative_arts",     label: "Decorative Arts" },
  { value: "jewelry",             label: "Jewelry" },
  { value: "asian_antiques",      label: "Asian Antiques" },
  { value: "asian_works",         label: "Asian Works of Art" },
  { value: "fashion_accessories", label: "Fashion & Accessories" },
  { value: "watches_clocks",      label: "Watches & Clocks" },
  { value: "furniture",           label: "Furniture" },
  { value: "lighting",            label: "Lighting" },
  { value: "silver",              label: "Silver" },
  { value: "ceramics_porcelain",  label: "Ceramics & Porcelain" },
  { value: "glass",               label: "Glass" },
  { value: "sculpture",           label: "Sculpture" },
  { value: "rugs_textiles",       label: "Rugs & Textiles" },
  { value: "books_manuscripts",   label: "Books & Manuscripts" },
  { value: "collectibles",        label: "Collectibles" },
  { value: "other",               label: "Other" },
];

export const CATEGORY_LABELS = Object.fromEntries(
  MAIN_CATEGORIES.map(c => [c.value, c.label])
);

export const SUBCATEGORIES = {
  fine_art: [
    "Paintings","Sculptures","Prints & Multiples","Photography",
    "Textiles","Drawings","Mixed Media","Other"
  ],
  decorative_art: [
    "Antiquities","Rugs & Carpets","Ceramics","Glass","Lighting",
    "Baskets","Silver & Tableware","Textiles","Other"
  ],
  jewelry: [
    "Necklaces","Bracelets","Earrings","Rings","Brooches and Pins",
    "Cufflinks","Brooches","Loose Stones","Pendants","Sets","Other"
  ],
  asian_antiques: [
    "Furniture","Decorative Arts","Artworks","Antiquities","Textiles",
    "Books, Maps, Ephemera","Architectural","Rugs & Carpets","Other"
  ],
  fashion_accessories: [
    "Women's Clothing","Bags","Eyewear","Scarves","Belts","Hats",
    "Gloves","Shoes","Furs","Accessories","Men's Clothing","Other"
  ],
  watches_clocks: [
    "Wrist Watches","Pocket Watches","Wall Clocks","Standing Clocks",
    "Mantle Clocks","Travel Clocks","Specialty Clocks","Other"
  ],
  furniture: [
    "Tables","Seating","Mirrors","Storage","Outdoor & Garden",
    "Office","Bed & Bath","Sets","Screens","Other"
  ],
  collectibles: [
    "Coins & Stamps","Books & Ephemera","Sports","Music & Instruments",
    "Toys & Games","Signs & Advertising","Autographs","Political",
    "Hollywood & Cinema","Scientific & Medical","Religious","Automobilia",
    "Air & Space","Boating","Military","Tobacco","Other"
  ],
};

export const PERIODS = [
  "Pre 1600","1600–1700","1700–1800","1800–1870",
  "1870–1900","1900–1950","1950–2000","Post 2000"
];

// Categories that use the standard period dropdown
export const CATEGORIES_WITH_PERIODS = ["fine_art","decorative_art","furniture"];

export const FINE_ART_STYLES = [
  "Abstract Art","Conceptual Art","Cubism","Dadaism","Expressionism",
  "Fauvism","Impressionism","Minimalism","Pop Art","Realism","Surrealism",
  "Symbolism","Modernism","Postmodernism","Neo-Expressionism",
  "Art Nouveau","Art Deco","Baroque","Rococo","Neo-Classicism"
];

// Field config per category — which extra fields to show
export const CATEGORY_FIELDS = {
  fine_art: {
    showSubcategory: true,
    showStyle: true,
    showPeriod: true,
    showMaker: true,        // Artist
    makerLabel: "Artist / Maker",
    showMaterials: true,
    showTechnique: true,
    showOrigin: true,
    showKeywords: true,
    keywordsPlaceholder: "e.g. signed, framed, oil on canvas, abstract, landscape, Impressionist…",
  },
  decorative_art: {
    showSubcategory: true,
    showStyle: true,
    showPeriod: true,
    showMaker: true,
    makerLabel: "Maker / Manufacturer",
    showMaterials: true,
    showTechnique: true,
    showOrigin: true,
    showKeywords: true,
    keywordsPlaceholder: "e.g. porcelain, famille rose, signed, enamel, Art Nouveau…",
  },
  jewelry: {
    showSubcategory: true,
    showStyle: false,
    showPeriod: false,
    showMaker: true,
    makerLabel: "Maker / Designer",
    showMaterials: true,    // Metal type
    showTechnique: false,
    showOrigin: false,
    showKeywords: true,
    keywordsPlaceholder: "e.g. 18k gold, diamond, sapphire, Art Deco, signed, Victorian, cocktail ring…",
    extraFields: ["metal_purity","stone_type","ring_size","length","signed_status","period_style"],
  },
  asian_antiques: {
    showSubcategory: true,
    showStyle: false,
    showPeriod: false,
    showMaker: false,
    makerLabel: "",
    showMaterials: true,
    showTechnique: true,
    showOrigin: true,
    showKeywords: true,
    keywordsPlaceholder: "e.g. Chinese, Qing, porcelain, blue and white, jade, bronze, Meiji, export…",
  },
  fashion_accessories: {
    showSubcategory: true,
    showStyle: false,
    showPeriod: false,
    showMaker: true,
    makerLabel: "Designer / Brand",
    showMaterials: true,
    showTechnique: false,
    showOrigin: true,
    showKeywords: true,
    keywordsPlaceholder: "e.g. couture, vintage, leather, silk, handbag, designer, 1970s, Hermès…",
  },
  watches_clocks: {
    showSubcategory: true,
    showStyle: false,
    showPeriod: false,
    showMaker: true,
    makerLabel: "Maker / Manufacturer",
    showMaterials: true,    // Case material
    showTechnique: false,
    showOrigin: true,
    showKeywords: true,
    keywordsPlaceholder: "e.g. automatic, manual wind, chronograph, enamel dial, gold case, running…",
    extraFields: ["model","movement_type","running_status"],
  },
  furniture: {
    showSubcategory: true,
    showStyle: true,
    showPeriod: true,
    showMaker: true,
    makerLabel: "Maker / Designer",
    showMaterials: true,
    showTechnique: true,
    showOrigin: true,
    showKeywords: true,
    keywordsPlaceholder: "e.g. mahogany, Art Deco, Louis XV, marquetry, upholstered, Mid-Century Modern…",
  },
  collectibles: {
    showSubcategory: true,
    showStyle: false,
    showPeriod: false,
    showMaker: true,
    makerLabel: "Maker / Publisher / Manufacturer",
    showMaterials: false,
    showTechnique: false,
    showOrigin: true,
    showKeywords: true,
    keywordsPlaceholder: "e.g. signed, autograph, original, poster, military, sports, Hollywood…",
  },
  other: {
    showSubcategory: false,
    showStyle: false,
    showPeriod: false,
    showMaker: true,
    makerLabel: "Maker / Artist",
    showMaterials: true,
    showTechnique: false,
    showOrigin: true,
    showKeywords: true,
    keywordsPlaceholder: "Add descriptive keywords to help buyers find this item…",
  },
};