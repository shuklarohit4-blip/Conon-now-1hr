import React from "react";
import { ProductCard, type Product } from "./ProductCard";
import imgAsianApex20L from "@assets/ai-image-bd4c0997-9b86-4a2a-b506-ab27622c806c_1781772871513.png";
import imgHavellsWire from "@assets/brands/havells-wire.png";
import imgPolycabWire from "@assets/brands/polycab-wire.png";
import imgAstralPipe from "@assets/brands/astral-pipe.png";
import imgAshirvadPipe from "@assets/brands/ashirvad-pipe.png";
import imgKajariaTile from "@assets/brands/kajaria-tile.png";
import imgSomanyTile from "@assets/brands/somany-tile.png";
import imgHettichHinge from "@assets/brands/hettich-hinge.png";

/* Real local product photo aliases. Some product cards reference gallery names
   that were intended to match the visual category but the on-disk files use
   different slugs. Map them to the actual files so category items render 2–3
   valid photos instead of broken image URLs. */
const PRODUCT_PHOTO_ALIASES: Record<string, string> = {
  "electrical-wire": "wire",
  switchboard: "switch",
  "mcb-panel": "mcb",
  "cpvc-pipe": "pipe",
  "water-pipe": "pipe",
  "pp-fittings": "pipe-fittings",
  tiles: "floor-tile",
  "marble-tile": "marble",
};
const PROD = (slug: string) => {
  const actual = PRODUCT_PHOTO_ALIASES[slug] ?? slug;
  return `${import.meta.env.BASE_URL}products/${actual}.jpg`;
};

const CATEGORY_GALLERIES: Record<string, string[]> = {
  Cement: ["ultratech-weatherplus", "white-cement", "cement-bag"],
  "TMT Steel": ["tmt-bars", "binding-wire", "nails"],
  Bricks: ["red-brick", "aac-block", "aggregate"],
  Paint: [imgAsianApex20L, "paint-bucket", "paint-gloss"],
  Sand: ["sand", "aggregate", "cement-bag"],
  Tiles: [imgKajariaTile, "floor-tile", "marble"],
  Hardware: [imgHettichHinge, "door-hardware", "door-lock"],
  Electrical: [imgPolycabWire, imgHavellsWire, "mcb"],
  Plumbing: [imgAstralPipe, imgAshirvadPipe, "pipe"],
  Adhesives: ["adhesive", "tile-adhesive", "putty"],
  Waterproofing: ["waterproofing", "putty", "white-cement"],
  "Marble & Flooring": ["marble", "floor-tile", "tile-cleaner"],
};

const galleryFor = (category: string, overrides?: string[]) => {
  const source = overrides && overrides.length > 0 ? overrides : CATEGORY_GALLERIES[category] ?? ["cement-bag"];
  return source.map((item) => {
    if (item.startsWith("/") || item.startsWith("data:") || item.includes("://")) return item;
    return PROD(item);
  });
};

/* Dummy construction-materials catalog so the layout is fully visible. */
export const DUMMY_PRODUCTS: Product[] = [
  {
    id: "ultratech-weatherplus-50kg",
    images: galleryFor("Cement"),
    features: [
      "IS 12269 certified OPC 53 grade cement",
      "High early compressive strength for slabs & pillars",
      "Advanced waterproofing for monsoon-resistant builds",
    ],
    tag: "Conon Assured",
    materialTag: "Cement",
    image: PROD("ultratech-weatherplus"),
    title: "UltraTech Premium Cement 50kg Bag, Weather Plus, Waterproofing, Solid Build",
    description:
      "UltraTech Weather Plus is a premium waterproofing cement engineered for monsoon-resistant, crack-free structures. Its dense particle packing reduces water seepage and delivers high early strength, making it ideal for foundations, columns, slabs and exterior plaster in all weather conditions.",
    rating: 4.5,
    reviews: 991,
    price: 380,
    mrp: 450,
    bankOfferPrice: 360,
    bankOfferLabel: "Conon Khata or HDFC Bank",
    deliveryEta: "Today, 2:00 PM (1-Hour)",
    service: "Free Unloading / Labour",
    variantsLabel: "+2 other grades (43 / 53)",
    unit: "50kg bag",
    vendor: "UltraTech",
    hasOptions: true,
  },
  {
    id: "tata-tiscon-tmt-12mm",
    images: galleryFor("TMT Steel"),
    features: [
      "Fe 550SD earthquake-resistant grade",
      "Superior ductility with strong rib bonding",
      "High corrosion resistance for long structural life",
    ],
    tag: "Sponsored",
    materialTag: "TMT Steel",
    image: PROD("tmt-bars"),
    title: "Tata Tiscon 550SD TMT Steel Bars 12mm, Earthquake Resistant, High Strength",
    description:
      "Tata Tiscon 550SD TMT bars offer superior ductility and earthquake resistance with a consistent rib pattern for strong concrete bonding. Manufactured to Fe 550D grade, they provide high tensile strength and excellent corrosion resistance for columns, beams and load-bearing RCC work.",
    rating: 4.7,
    reviews: 2143,
    price: 62000,
    mrp: 71500,
    bankOfferPrice: 60500,
    bankOfferLabel: "Conon Khata",
    deliveryEta: "Tomorrow, 9:00 AM",
    service: "Free Crane Unloading",
    variantsLabel: "+4 other thicknesses (8–25mm)",
    unit: "per tonne",
    vendor: "Tata Steel",
    hasOptions: true,
  },
  {
    id: "red-clay-bricks-1000",
    images: galleryFor("Bricks"),
    features: [
      "First-class kiln-fired, uniform size",
      "Low water absorption, high compressive strength",
      "Sharp edges for clean, mortar-saving masonry",
    ],
    tag: "Conon Assured",
    materialTag: "Bricks",
    image: PROD("red-brick"),
    title: "First-Class Red Clay Bricks, Kiln Fired, Uniform Size — Pack of 1000",
    description:
      "First-class kiln-fired red clay bricks with uniform size, sharp edges and a deep red finish. Low water absorption and high compressive strength make them ideal for durable load-bearing walls, partitions and boundary work with minimal mortar wastage.",
    rating: 4.3,
    reviews: 564,
    price: 7800,
    mrp: 9200,
    deliveryEta: "Today, 6:00 PM",
    service: "Free Site Stacking",
    unit: "per 1000",
    vendor: "CONON Marketplace",
  },
  {
    id: "asian-paints-apex-20l",
    images: galleryFor("Paint", ["paint-bucket", "paint-roller", "paint-gloss"]),
    features: [
      "Weatherproof exterior emulsion",
      "Dust, algae & fungus resistant",
      "Excellent colour retention for years",
    ],
    tag: "Sponsored",
    materialTag: "Paint",
    image: imgAsianApex20L,
    title: "Asian Paints Apex Weatherproof Exterior Emulsion 20L, Dust & Algae Guard",
    description:
      "Asian Paints Apex is a weatherproof exterior emulsion that protects walls against rain, dust and algae for years. It delivers a rich matt finish, excellent colour retention and superior coverage, keeping building exteriors fresh through harsh sun and heavy monsoons.",
    rating: 4.6,
    reviews: 1287,
    price: 6450,
    mrp: 7900,
    bankOfferPrice: 6100,
    bankOfferLabel: "HDFC Bank",
    deliveryEta: "Today, 4:00 PM (1-Hour)",
    service: "Free Tinting",
    variantsLabel: "+12 other shades",
    unit: "20L bucket",
    vendor: "Asian Paints",
    hasOptions: true,
  },
  {
    id: "river-sand-cum",
    images: galleryFor("Sand"),
    features: [
      "Silt-washed, screened plaster grade",
      "Fine rounded grains for a smooth finish",
      "Strong adhesion for crack-free plaster",
    ],
    tag: "Conon Assured",
    materialTag: "Sand",
    image: PROD("sand"),
    title: "Screened River Sand (M-Sand Alternative), Silt-Washed, Plaster Grade",
    description:
      "Screened, silt-washed river sand graded for smooth plastering and masonry. Its fine, well-rounded particles ensure a workable mix, strong adhesion and crack-free finishes — a reliable plaster-grade alternative to M-Sand for walls and ceilings.",
    rating: 4.2,
    reviews: 318,
    price: 1450,
    mrp: 1700,
    deliveryEta: "Tomorrow, 8:00 AM",
    service: "Free Tipper Unloading",
    unit: "per ton",
    vendor: "CONON Marketplace",
  },
  {
    id: "kajaria-vitrified-tiles",
    images: galleryFor("Tiles"),
    features: [
      "Glossy, stain-resistant vitrified surface",
      "Anti-skid base for safe flooring",
      "Scratch & water resistant, low maintenance",
    ],
    tag: "Sponsored",
    materialTag: "Tiles",
    image: PROD("floor-tile"),
    title: "Kajaria Vitrified Floor Tiles 600x600mm, Glossy Finish, Anti-Skid — Box of 4",
    description:
      "Kajaria 600x600mm vitrified floor tiles combine a glossy, stain-resistant surface with an anti-skid base for safe, low-maintenance flooring. Their high density resists scratches and water absorption, making them ideal for living rooms, lobbies and commercial spaces.",
    rating: 4.4,
    reviews: 742,
    price: 1180,
    mrp: 1560,
    bankOfferPrice: 1120,
    bankOfferLabel: "Conon Khata",
    deliveryEta: "Today, 5:00 PM",
    service: "Free Carry-Up",
    variantsLabel: "+8 other designs",
    unit: "box of 4",
    vendor: "Kajaria",
    hasOptions: true,
  },
  {
    id: "acc-gold-watershield-50kg",
    images: galleryFor("Cement", ["ultratech-weatherplus", "cement-bag", "putty"]),
    features: [
      "Damp-proof PPC, moisture resistant",
      "Smooth workability, superior plaster finish",
      "Resists salt attack for durable walls",
    ],
    tag: "Conon Assured",
    materialTag: "Cement",
    image: PROD("ultratech-weatherplus"),
    title: "ACC Gold Water Shield 50kg Bag, PPC, Damp-Proof, High Durability",
    description:
      "ACC Gold Water Shield is a damp-proof PPC cement that resists moisture and salt attack for long-lasting, durable structures. Its smooth workability gives a superior plaster finish and reduced cracking, ideal for masonry, plastering and general construction.",
    rating: 4.4,
    reviews: 612,
    price: 372,
    mrp: 440,
    deliveryEta: "Today, 3:00 PM (1-Hour)",
    service: "Free Unloading",
    unit: "50kg bag",
    vendor: "ACC",
    brand: "ACC",
    specs: [
      { label: "Weight", value: "50 kg" },
      { label: "Grade", value: "PPC" },
      { label: "Type", value: "Water Shield" },
      { label: "Usage", value: "Plaster & Masonry" },
    ],
  },
  {
    id: "jsw-neosteel-550d-16mm",
    images: galleryFor("TMT Steel"),
    features: [
      "Fe 550D high yield strength",
      "Excellent bendability for complex shapes",
      "Double-rib design for strong concrete grip",
    ],
    tag: "Sponsored",
    materialTag: "TMT Steel",
    image: PROD("tmt-bars"),
    title: "JSW Neosteel 550D TMT Steel Bars 16mm, Corrosion Resistant",
    description:
      "JSW Neosteel 550D 16mm TMT bars deliver high yield strength with excellent bendability and corrosion resistance. The double-rib design ensures strong concrete grip, making them well suited for columns, beams and heavy structural RCC work.",
    rating: 4.6,
    reviews: 1340,
    price: 63500,
    mrp: 72800,
    deliveryEta: "Tomorrow, 10:00 AM",
    service: "Free Crane Unloading",
    unit: "per tonne",
    vendor: "JSW Steel",
    brand: "JSW Steel",
    specs: [
      { label: "Diameter", value: "16 mm" },
      { label: "Grade", value: "Fe 550D" },
      { label: "Material", value: "Mild Steel" },
      { label: "Usage", value: "Columns & Beams" },
    ],
  },
  {
    id: "fly-ash-bricks-500",
    images: galleryFor("Bricks", ["red-brick", "aac-block", "sand"]),
    features: [
      "Lightweight, reduces structural load",
      "Thermally insulated for cooler interiors",
      "Precise size speeds up construction",
    ],
    tag: "Conon Assured",
    materialTag: "Bricks",
    image: PROD("red-brick"),
    title: "AAC Fly Ash Bricks, Lightweight, Thermal Insulated — Pack of 500",
    description:
      "AAC fly ash bricks are lightweight, thermally insulated blocks that reduce structural load and keep interiors cooler. Their precise size and smooth surface speed up construction and lower mortar use — ideal for partition and non-load-bearing walls.",
    rating: 4.2,
    reviews: 289,
    price: 5400,
    mrp: 6300,
    deliveryEta: "Today, 6:30 PM",
    service: "Free Site Stacking",
    unit: "per 500",
    vendor: "CONON Marketplace",
    brand: "CONON",
    specs: [
      { label: "Quantity", value: "500 bricks" },
      { label: "Type", value: "AAC Fly Ash" },
      { label: "Size", value: "230×110×75 mm" },
      { label: "Usage", value: "Partition Walls" },
    ],
  },
  {
    id: "berger-weathercoat-20l",
    images: galleryFor("Paint", ["paint-bucket", "paint-roller", "primer"]),
    features: [
      "Self-cleaning, dust-resistant finish",
      "Long-life rain & UV protection",
      "Retains colour on building facades",
    ],
    tag: "Sponsored",
    materialTag: "Paint",
    image: imgAsianApex20L,
    title: "Berger WeatherCoat Anti-Dustt Exterior Emulsion 20L, Long Life",
    description:
      "Berger WeatherCoat Anti-Dust is a long-life exterior emulsion with a self-cleaning, dust-resistant finish. It withstands rain and UV exposure while retaining colour, keeping building facades clean and vibrant for years.",
    rating: 4.5,
    reviews: 873,
    price: 6180,
    mrp: 7600,
    deliveryEta: "Today, 5:00 PM (1-Hour)",
    service: "Free Tinting",
    unit: "20L bucket",
    vendor: "Berger",
    brand: "Berger Paints",
    specs: [
      { label: "Volume", value: "20 L" },
      { label: "Finish", value: "Matt" },
      { label: "Coverage", value: "~90 sq.ft/L" },
      { label: "Usage", value: "Exterior Walls" },
    ],
  },
  {
    id: "manufactured-msand-ton",
    images: galleryFor("Sand"),
    features: [
      "Zone-II concrete grade, zero silt content",
      "Angular grains for stronger bonding",
      "Consistent gradation for economical concrete",
    ],
    tag: "Conon Assured",
    materialTag: "Sand",
    image: PROD("sand"),
    title: "Construction M-Sand (Manufactured), Zone-II, Concrete Grade",
    description:
      "Manufactured Zone-II M-Sand engineered for concrete and RCC work with consistent grading and zero silt. Its angular particles improve bonding and compressive strength, delivering stronger, more economical concrete than natural sand.",
    rating: 4.3,
    reviews: 256,
    price: 1320,
    mrp: 1550,
    deliveryEta: "Tomorrow, 8:30 AM",
    service: "Free Tipper Unloading",
    unit: "per ton",
    vendor: "CONON Marketplace",
    brand: "CONON",
    specs: [
      { label: "Quantity", value: "1 ton" },
      { label: "Zone", value: "Zone II" },
      { label: "Type", value: "M-Sand" },
      { label: "Usage", value: "Concrete & RCC" },
    ],
  },
  {
    id: "somany-wall-tiles-300x600",
    images: galleryFor("Tiles", ["floor-tile", "tile-adhesive", "marble"]),
    features: [
      "Glossy, water-resistant ceramic glaze",
      "Easy to clean, stain-proof surface",
      "Ideal for bathrooms & kitchen walls",
    ],
    tag: "Sponsored",
    materialTag: "Tiles",
    image: PROD("floor-tile"),
    title: "Somany Ceramic Wall Tiles 300x600mm, Glossy, Bathroom Grade — Box of 6",
    description:
      "Somany 300x600mm ceramic wall tiles feature a glossy, water-resistant glaze that's easy to clean and stain-proof. Designed for bathrooms and kitchens, they resist moisture and humidity while adding a bright, modern finish to walls.",
    rating: 4.4,
    reviews: 498,
    price: 940,
    mrp: 1280,
    deliveryEta: "Today, 5:30 PM",
    service: "Free Carry-Up",
    unit: "box of 6",
    vendor: "Somany",
    brand: "Somany",
    specs: [
      { label: "Size", value: "300×600 mm" },
      { label: "Coverage", value: "1.08 sq.m/box" },
      { label: "Finish", value: "Glossy" },
      { label: "Usage", value: "Bathroom Walls" },
    ],
  },
];

/* ── Builder Picks — completely different categories from DUMMY_PRODUCTS ──
   Hardware, Electrical, Plumbing, Adhesives, Waterproofing, Marble/Flooring.
   Shown in the second home-feed so no category appears twice.            */
export const BUILDER_PICKS: Product[] = [
  {
    id: "hettich-soft-close-hinge",
    images: galleryFor("Hardware"),
    features: [
      "Soft-close dampening — silent, slam-free cabinets",
      "Full overlay & half overlay compatible, 110° opening",
      "Nickel-plated for rust-free, long-lasting performance",
    ],
    tag: "Conon Assured",
    materialTag: "Hardware",
    image: PROD("door-hardware"),
    title: "Hettich Soft-Close Concealed Hinges 35mm Cup, Cabinet & Wardrobe — Pack of 10",
    description:
      "Hettich 35mm soft-close concealed hinges deliver silent, slam-free operation for kitchen cabinets, wardrobes and furniture doors. Nickel-plated steel resists corrosion; the built-in hydraulic damper absorbs the closing impact for smooth, long-lasting use.",
    rating: 4.6,
    reviews: 1247,
    price: 580,
    mrp: 820,
    bankOfferPrice: 550,
    bankOfferLabel: "Conon Khata",
    deliveryEta: "Today, 4:00 PM",
    service: "Free Delivery",
    variantsLabel: "+3 variants (full/half/inset overlay)",
    unit: "pack of 10",
    vendor: "Hettich",
    hasOptions: true,
    specs: [
      { label: "Cup Size",   value: "35mm" },
      { label: "Opening",    value: "110°" },
      { label: "Finish",     value: "Nickel Plated" },
      { label: "Type",       value: "Soft-Close" },
    ],
  },
  {
    id: "polycab-fr-wire-1sqmm",
    images: galleryFor("Electrical"),
    features: [
      "FR (Flame Retardant) PVC insulation — BIS IS:694 certified",
      "Oxygen-free electrolytic copper conductor",
      "Safe up to 70°C continuous, ideal for home wiring",
    ],
    tag: "Conon Assured",
    materialTag: "Electrical",
    image: PROD("electrical-wire"),
    title: "Polycab FR House Wire 1.5 sq.mm, 90m Coil — BIS Certified, Flame Retardant",
    description:
      "Polycab FR house wire uses oxygen-free copper with flame-retardant PVC insulation. BIS IS:694 certified for safe residential wiring — light points, fans and socket circuits. 90m coil covers a 2BHK electrical layout end to end.",
    rating: 4.7,
    reviews: 3892,
    price: 1480,
    mrp: 1900,
    bankOfferPrice: 1410,
    bankOfferLabel: "Conon Khata or HDFC Bank",
    deliveryEta: "Today, 3:30 PM",
    service: "Free Delivery",
    variantsLabel: "+4 sizes (1–6 sq.mm)",
    unit: "90m coil",
    vendor: "Polycab",
    hasOptions: true,
    specs: [
      { label: "Size",       value: "1.5 sq.mm" },
      { label: "Length",     value: "90m coil" },
      { label: "Type",       value: "FR PVC" },
      { label: "Standard",   value: "BIS IS:694" },
    ],
  },
  {
    id: "astral-cpvc-pipe-1inch",
    images: galleryFor("Plumbing"),
    features: [
      "CPVC — handles hot & cold water up to 93°C",
      "Lead-free, food-safe, corrosion & scale resistant",
      "FlowGuard Gold® CPVC for long, leak-free life",
    ],
    tag: "Conon Assured",
    materialTag: "Plumbing",
    image: PROD("cpvc-pipe"),
    title: "Astral CPVC FlowGuard Gold Pipe 1-Inch, 3m Length — Hot & Cold Water Supply",
    description:
      "Astral FlowGuard Gold CPVC pipe is rated for hot water up to 93°C — ideal for kitchen and bathroom plumbing. Lead-free, food-grade material prevents scale and corrosion for a lifespan exceeding 50 years. Approved by WRAS and NSF.",
    rating: 4.5,
    reviews: 2106,
    price: 320,
    mrp: 420,
    deliveryEta: "Today, 5:00 PM",
    service: "Free Delivery",
    variantsLabel: "+5 sizes (½–2 inch)",
    unit: "3m length",
    vendor: "Astral",
    hasOptions: true,
    specs: [
      { label: "Diameter",   value: "1 inch" },
      { label: "Length",     value: "3m" },
      { label: "Material",   value: "CPVC" },
      { label: "Temp. Rating", value: "Up to 93°C" },
    ],
  },
  {
    id: "fevicol-sh-50kg",
    images: galleryFor("Adhesives"),
    features: [
      "D3 grade — strong bond for plywood, MDF, laminates",
      "Solvent-free, non-toxic, water-resistant white glue",
      "Industry #1 — trusted by carpenters across India",
    ],
    tag: "Conon Assured",
    materialTag: "Adhesives",
    image: PROD("adhesive"),
    title: "Fevicol SH 50kg Drum — Synthetic Resin Wood Adhesive, Pidilite",
    description:
      "Fevicol SH is India's most trusted wood adhesive — a D3-grade synthetic resin glue for bonding plywood, MDF, laminates and decorative veneers. Water-resistant, solvent-free and non-toxic. The 50kg drum is the contractor's choice for site-level joinery and furniture work.",
    rating: 4.8,
    reviews: 5640,
    price: 6800,
    mrp: 7800,
    bankOfferPrice: 6500,
    bankOfferLabel: "Conon Khata",
    deliveryEta: "Tomorrow, 9:00 AM",
    service: "Free Unloading",
    variantsLabel: "+4 pack sizes (1–20kg)",
    unit: "50kg drum",
    vendor: "Pidilite",
    hasOptions: true,
    specs: [
      { label: "Grade",      value: "D3 Synthetic Resin" },
      { label: "Pack",       value: "50kg drum" },
      { label: "Bond Type",  value: "Wood / MDF / Laminate" },
      { label: "Type",       value: "Water Resistant" },
    ],
  },
  {
    id: "dr-fixit-pidifin-2k",
    images: galleryFor("Waterproofing"),
    features: [
      "2-component polymer-modified cementitious coating",
      "Bridges hairline cracks up to 0.2mm",
      "Certified for terrace, bathroom & basement applications",
    ],
    tag: "Conon Assured",
    materialTag: "Waterproofing",
    image: PROD("waterproofing"),
    title: "Dr. Fixit Pidifin 2K 20kg Kit — 2-Component Waterproofing Coating for Terrace & Bathroom",
    description:
      "Dr. Fixit Pidifin 2K is a two-component, polymer-modified cementitious waterproofing coating. It bridges hairline cracks, bonds strongly to concrete and plaster, and remains elastic to handle thermal movement. Suitable for terraces, bathrooms, water tanks and basements. UV stable, non-toxic.",
    rating: 4.6,
    reviews: 1874,
    price: 2200,
    mrp: 2800,
    bankOfferPrice: 2100,
    bankOfferLabel: "Conon Khata",
    deliveryEta: "Today, 4:30 PM",
    service: "Free Delivery",
    variantsLabel: "+2 sizes (5kg / 20kg)",
    unit: "20kg kit",
    vendor: "Dr. Fixit",
    hasOptions: true,
    specs: [
      { label: "Type",       value: "2-Component Cementitious" },
      { label: "Coverage",   value: "~12 sq.m / kit" },
      { label: "Application", value: "Terrace / Bath / Tank" },
      { label: "Crack Bridge", value: "Up to 0.2mm" },
    ],
  },
  {
    id: "kajaria-marble-look-tile",
    images: galleryFor("Marble & Flooring"),
    features: [
      "Marble-look GVT (Glazed Vitrified Tile) — full-body",
      "Double charge pressed, 8–9mm thickness",
      "Anti-skid rating R9 — slip resistant for floors",
    ],
    tag: "Sponsored",
    materialTag: "Marble & Flooring",
    image: PROD("marble-tile"),
    title: "Kajaria Marble-Look GVT Floor Tiles 800×800mm, Anti-Skid, Premium Grade — Box of 3",
    description:
      "Kajaria 800×800mm GVT tiles replicate Italian marble veining with full-body glazing for a luxurious, high-gloss floor finish. Double-charge pressed for superior hardness; anti-skid R9 surface for safe, low-maintenance residential and commercial flooring.",
    rating: 4.5,
    reviews: 2210,
    price: 1650,
    mrp: 2200,
    bankOfferPrice: 1570,
    bankOfferLabel: "Conon Khata or HDFC Bank",
    deliveryEta: "Today, 6:00 PM",
    service: "Free Carry-Up",
    variantsLabel: "+6 marble patterns",
    unit: "box of 3 (1.92 sq.m)",
    vendor: "Kajaria",
    hasOptions: true,
    specs: [
      { label: "Size",       value: "800×800 mm" },
      { label: "Finish",     value: "High Gloss GVT" },
      { label: "Thickness",  value: "8–9 mm" },
      { label: "Anti-Skid",  value: "R9 rated" },
    ],
  },
];

export type ProductFeedProps = {
  /** Override the dummy data with real products. */
  products?: Product[];
  /** Add-to-cart handler wired to the host page's cart mutation. */
  onAddToCart?: (product: Product) => void;
  /** Set the cart quantity (enables the −/+ stepper on each card). */
  onSetQty?: (product: Product, qty: number) => void;
  /** See-options handler for variation products. */
  onSeeOptions?: (product: Product) => void;
  /** Tapping the "+N other sizes/grades" link on a card. */
  onVariants?: (product: Product) => void;
  /** Tapping the AR / 3D view button on a card. */
  onArView?: (product: Product) => void;
  /** Tapping the image/title — opens the product detail bottom sheet. */
  onOpenDetail?: (product: Product) => void;
  /** Returns the quantity already in cart for a product. */
  getCartQty?: (product: Product) => number;
  /** Disables CTAs while a mutation is pending. */
  isAdding?: boolean;
};

/**
 * ProductFeed — a stacked, mobile-first list of premium ProductCards.
 * Defaults to a dummy construction-materials catalog so the exact layout
 * is visible without a backend.
 */
export function ProductFeed({
  products = DUMMY_PRODUCTS,
  onAddToCart,
  onSetQty,
  onSeeOptions,
  onVariants,
  onArView,
  onOpenDetail,
  getCartQty,
  isAdding = false,
}: ProductFeedProps) {
  return (
    <div className="space-y-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onAddToCart={onAddToCart}
          onSetQty={onSetQty}
          onSeeOptions={onSeeOptions}
          onVariants={onVariants}
          onArView={onArView}
          onOpenDetail={onOpenDetail}
          cartQty={getCartQty?.(p) ?? 0}
          isAdding={isAdding}
        />
      ))}
    </div>
  );
}
