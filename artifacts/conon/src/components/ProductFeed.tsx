import React from "react";
import productAssetManifest from "@/lib/productAssetManifest.json";
import { ProductCard, type Product } from "./ProductCard";
import {
  utWaterplus,
  utOpc53,
  utBuildmore,
  imgAccGoldWater,
  imgAccCement,
  imgAccSuraksha,
  imgAsianpaintsBucket,
  imgBergerBucket,
  imgKajariaTile,
  imgKajariaPgvt,
  imgKajariaVitrified,
  imgSomanyTile,
  imgFlyAshStandard,
  imgFlyAshHeavy,
  imgFlyAshInterlocking,
  imgFirstClassBrick,
  imgHettichHinge,
  imgPolycabWire,
  imgHavellsWire,
  imgAnchorSwitch,
  imgAstralPipe,
  imgAshirvadPipe,
  imgJaquarFaucet,
  imgHindwareEwc,
  imgFevicolDrum,
  imgDrfixitBucket,
  imgGodrejLock,
  imgDorsetHandle,
  imgBirlawhitePutty,
  imgJkPutty,
  imgBoschDrill,
  imgDewaltGrinder,
  imgMakranaWhite,
  imgBlackGalaxy,
  imgCenturyplyPly,
  PROD,
} from "@/lib/productImages";

const CATEGORY_GALLERIES: Record<string, string[]> = {
  Cement: [utWaterplus, utOpc53, imgAccCement],
  "TMT Steel": [
    "/images/products/steel/tata-tiscon-12mm-tmt-fe500d.webp",
    "/images/products/steel/jsw-neosteel-16mm-tmt-fe550d.webp",
    "/images/products/steel/gi-binding-wire-18-gauge-25kg.webp",
  ],
  Bricks: [imgFirstClassBrick, imgFlyAshStandard, PROD("aac-block")],
  Paint: [imgAsianpaintsBucket, imgBergerBucket, PROD("paint-roller")],
  Sand: [
    "/images/products/sand/screened-river-sand-cft.webp",
    "/images/products/sand/plaster-fine-sand-cft.webp",
    "/images/products/aggregate/gitti-20mm-cft.webp",
  ],
  Tiles: [imgKajariaTile, imgKajariaPgvt, imgSomanyTile],
  Hardware: [imgHettichHinge, imgGodrejLock, imgDorsetHandle],
  Electrical: [imgPolycabWire, imgHavellsWire, imgAnchorSwitch],
  Plumbing: [imgAstralPipe, imgJaquarFaucet, imgHindwareEwc],
  Adhesives: [imgFevicolDrum, PROD("adhesive"), PROD("putty")],
  Waterproofing: [imgDrfixitBucket, utWaterplus, imgBirlawhitePutty],
  Finishing: [imgBirlawhitePutty, imgJkPutty, PROD("pop")],
  Tools: [imgBoschDrill, imgDewaltGrinder, PROD("hand-tools")],
  Wood: [imgCenturyplyPly, imgFevicolDrum, PROD("plywood")],
  "Marble & Flooring": [imgKajariaPgvt, imgMakranaWhite, imgBlackGalaxy],
};

const galleryFor = (category: string, overrides?: string[]) => {
  const source = overrides && overrides.length > 0 ? overrides : CATEGORY_GALLERIES[category] ?? [utWaterplus];
  return source.map((item) => {
    if (item.startsWith("/") || item.startsWith("data:") || item.includes("://")) return item;
    return PROD(item);
  });
};

/* Primary construction-materials catalog for home feed and categories */
const RAW_DUMMY_PRODUCTS: Product[] = [
  {
    id: "ultratech-weatherplus-50kg",
    images: [utWaterplus, utOpc53, utBuildmore],
    features: [
      "IS 12269 certified OPC 53 grade cement",
      "High early compressive strength for slabs & pillars",
      "Advanced waterproofing for monsoon-resistant builds",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Cement",
    image: utWaterplus,
    title: "UltraTech Premium Cement 50kg Bag, Weather Plus, Waterproofing, Solid Build",
    description:
      "UltraTech Weather Plus is a premium waterproofing cement engineered for monsoon-resistant, crack-free structures. Its dense particle packing reduces water seepage and delivers high early strength, making it ideal for foundations, columns, slabs and exterior plaster in all weather conditions.",
    rating: 4.5,
    reviews: 991,
    price: 395,
    mrp: 440,
    bankOfferPrice: 385,
    bankOfferLabel: "CONON-NOW Khata or HDFC Bank",
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
    image: "/images/products/steel/tata-tiscon-12mm-tmt-fe500d.webp",
    title: "Tata Tiscon 550SD TMT Steel Bars 12mm, Earthquake Resistant, High Strength",
    description:
      "Tata Tiscon 550SD TMT bars offer superior ductility and earthquake resistance with a consistent rib pattern for strong concrete bonding. Manufactured to Fe 550D grade, they provide high tensile strength and excellent corrosion resistance for columns, beams and load-bearing RCC work.",
    rating: 4.7,
    reviews: 2143,
    price: 62000,
    mrp: 71500,
    bankOfferPrice: 60500,
    bankOfferLabel: "CONON-NOW Khata",
    deliveryEta: "Tomorrow, 9:00 AM",
    service: "Free Crane Unloading",
    variantsLabel: "+4 other thicknesses (8–25mm)",
    unit: "per tonne",
    vendor: "Tata Steel",
    hasOptions: true,
  },
  {
    id: "red-clay-bricks-1000",
    images: [imgFirstClassBrick, PROD("red-brick"), PROD("aggregate")],
    features: [
      "First-class kiln-fired, uniform size",
      "Low water absorption, high compressive strength",
      "Sharp edges for clean, mortar-saving masonry",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Bricks",
    image: imgFirstClassBrick,
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
    vendor: "CONON-NOW Marketplace",
  },
  {
    id: "asian-paints-apex-20l",
    images: [imgAsianpaintsBucket, PROD("paint-bucket"), PROD("paint-roller")],
    features: [
      "Weatherproof exterior emulsion",
      "Dust, algae & fungus resistant",
      "Excellent colour retention for years",
    ],
    tag: "Sponsored",
    materialTag: "Paint",
    image: imgAsianpaintsBucket,
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
    images: [
      "/images/products/sand/screened-river-sand-m-sand-alternative-silt-washed-plaster-grade.webp",
      ...galleryFor("Sand"),
    ],
    features: [
      "Silt-washed, screened plaster grade",
      "Fine rounded grains for a smooth finish",
      "Strong adhesion for crack-free plaster",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Sand",
    image: "/images/products/sand/screened-river-sand-m-sand-alternative-silt-washed-plaster-grade.webp",
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
    vendor: "CONON-NOW Marketplace",
  },
  {
    id: "kajaria-vitrified-tiles",
    images: [imgKajariaTile, imgKajariaVitrified, imgKajariaPgvt],
    features: [
      "Glossy, stain-resistant vitrified surface",
      "Anti-skid base for safe flooring",
      "Scratch & water resistant, low maintenance",
    ],
    tag: "Sponsored",
    materialTag: "Tiles",
    image: imgKajariaTile,
    title: "Kajaria Vitrified Floor Tiles 600x600mm, Glossy Finish, Anti-Skid — Box of 4",
    description:
      "Kajaria 600x600mm vitrified floor tiles combine a glossy, stain-resistant surface with an anti-skid base for safe, low-maintenance flooring. Their high density resists scratches and water absorption, making them ideal for living rooms, lobbies and commercial spaces.",
    rating: 4.4,
    reviews: 742,
    price: 1180,
    mrp: 1560,
    bankOfferPrice: 1120,
    bankOfferLabel: "CONON-NOW Khata",
    deliveryEta: "Today, 5:00 PM",
    service: "Free Carry-Up",
    variantsLabel: "+8 other designs",
    unit: "box of 4",
    vendor: "Kajaria",
    hasOptions: true,
  },
  {
    id: "acc-gold-watershield-50kg",
    images: [imgAccGoldWater, imgAccCement, imgAccSuraksha],
    features: [
      "Damp-proof PPC, moisture resistant",
      "Smooth workability, superior plaster finish",
      "Resists salt attack for durable walls",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Cement",
    image: imgAccGoldWater,
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
    image: "/images/products/steel/jsw-neosteel-16mm-tmt-fe550d.webp",
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
    images: [imgFlyAshStandard, imgFlyAshHeavy, imgFlyAshInterlocking],
    features: [
      "Lightweight, reduces structural load",
      "Thermally insulated for cooler interiors",
      "Precise size speeds up construction",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Bricks",
    image: imgFlyAshStandard,
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
    vendor: "CONON-NOW Marketplace",
    brand: "CONON-NOW",
    specs: [
      { label: "Quantity", value: "500 bricks" },
      { label: "Type", value: "AAC Fly Ash" },
      { label: "Size", value: "230×110×75 mm" },
      { label: "Usage", value: "Partition Walls" },
    ],
  },
  {
    id: "berger-weathercoat-20l",
    images: [imgBergerBucket, PROD("paint-bucket"), PROD("primer")],
    features: [
      "Self-cleaning, dust-resistant finish",
      "Long-life rain & UV protection",
      "Retains colour on building facades",
    ],
    tag: "Sponsored",
    materialTag: "Paint",
    image: imgBergerBucket,
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
    tag: "CONON-NOW Assured",
    materialTag: "Sand",
    image: "/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp",
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
    vendor: "CONON-NOW Marketplace",
    brand: "CONON-NOW",
    specs: [
      { label: "Quantity", value: "1 ton" },
      { label: "Zone", value: "Zone II" },
      { label: "Type", value: "M-Sand" },
      { label: "Usage", value: "Concrete & RCC" },
    ],
  },
  {
    id: "somany-wall-tiles-300x600",
    images: [imgSomanyTile, imgKajariaVitrified, PROD("floor-tile")],
    features: [
      "Glossy, water-resistant ceramic glaze",
      "Easy to clean, stain-proof surface",
      "Ideal for bathrooms & kitchen walls",
    ],
    tag: "Sponsored",
    materialTag: "Tiles",
    image: imgSomanyTile,
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

/* ── Builder Picks — Hardware, Electrical, Plumbing, Adhesives, Waterproofing, Marble ── */
const RAW_BUILDER_PICKS: Product[] = [
  {
    id: "hettich-soft-close-hinge",
    images: [imgHettichHinge, imgGodrejLock, imgDorsetHandle],
    features: [
      "Soft-close dampening — silent, slam-free cabinets",
      "Full overlay & half overlay compatible, 110° opening",
      "Nickel-plated for rust-free, long-lasting performance",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Hardware",
    image: imgHettichHinge,
    title: "Hettich Soft-Close Concealed Hinges 35mm Cup, Cabinet & Wardrobe — Pack of 10",
    description:
      "Hettich 35mm soft-close concealed hinges deliver silent, slam-free operation for kitchen cabinets, wardrobes and furniture doors. Nickel-plated steel resists corrosion; the built-in hydraulic damper absorbs the closing impact for smooth, long-lasting use.",
    rating: 4.6,
    reviews: 1247,
    price: 580,
    mrp: 820,
    bankOfferPrice: 550,
    bankOfferLabel: "CONON-NOW Khata",
    deliveryEta: "Today, 4:00 PM",
    service: "Free Delivery",
    variantsLabel: "+3 variants (full/half/inset overlay)",
    unit: "pack of 10",
    vendor: "Hettich",
    hasOptions: true,
    specs: [
      { label: "Cup Size", value: "35mm" },
      { label: "Opening", value: "110°" },
      { label: "Finish", value: "Nickel Plated" },
      { label: "Type", value: "Soft-Close" },
    ],
  },
  {
    id: "polycab-fr-wire-1sqmm",
    images: [imgPolycabWire, imgHavellsWire, imgAnchorSwitch],
    features: [
      "FR (Flame Retardant) PVC insulation — BIS IS:694 certified",
      "Oxygen-free electrolytic copper conductor",
      "Safe up to 70°C continuous, ideal for home wiring",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Electrical",
    image: imgPolycabWire,
    title: "Polycab FR House Wire 1.5 sq.mm, 90m Coil — BIS Certified, Flame Retardant",
    description:
      "Polycab FR house wire uses oxygen-free copper with flame-retardant PVC insulation. BIS IS:694 certified for safe residential wiring — light points, fans and socket circuits. 90m coil covers a 2BHK electrical layout end to end.",
    rating: 4.7,
    reviews: 3892,
    price: 1480,
    mrp: 1900,
    bankOfferPrice: 1410,
    bankOfferLabel: "CONON-NOW Khata or HDFC Bank",
    deliveryEta: "Today, 3:30 PM",
    service: "Free Delivery",
    variantsLabel: "+4 sizes (1–6 sq.mm)",
    unit: "90m coil",
    vendor: "Polycab",
    hasOptions: true,
    specs: [
      { label: "Size", value: "1.5 sq.mm" },
      { label: "Length", value: "90m coil" },
      { label: "Type", value: "FR PVC" },
      { label: "Standard", value: "BIS IS:694" },
    ],
  },
  {
    id: "astral-cpvc-pipe-1inch",
    images: [imgAstralPipe, imgAshirvadPipe, imgJaquarFaucet],
    features: [
      "CPVC — handles hot & cold water up to 93°C",
      "Lead-free, food-safe, corrosion & scale resistant",
      "FlowGuard Gold® CPVC for long, leak-free life",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Plumbing",
    image: imgAstralPipe,
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
      { label: "Diameter", value: "1 inch" },
      { label: "Length", value: "3m" },
      { label: "Material", value: "CPVC" },
      { label: "Temp. Rating", value: "Up to 93°C" },
    ],
  },
  {
    id: "fevicol-sh-50kg",
    images: [imgFevicolDrum, PROD("adhesive"), PROD("putty")],
    features: [
      "D3 grade — strong bond for plywood, MDF, laminates",
      "Solvent-free, non-toxic, water-resistant white glue",
      "Industry #1 — trusted by carpenters across India",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Adhesives",
    image: imgFevicolDrum,
    title: "Fevicol SH 50kg Drum — Synthetic Resin Wood Adhesive, Pidilite",
    description:
      "Fevicol SH is India's most trusted wood adhesive — a D3-grade synthetic resin glue for bonding plywood, MDF, laminates and decorative veneers. Water-resistant, solvent-free and non-toxic. The 50kg drum is the contractor's choice for site-level joinery and furniture work.",
    rating: 4.8,
    reviews: 5640,
    price: 6800,
    mrp: 7800,
    bankOfferPrice: 6500,
    bankOfferLabel: "CONON-NOW Khata",
    deliveryEta: "Tomorrow, 9:00 AM",
    service: "Free Unloading",
    variantsLabel: "+4 pack sizes (1–20kg)",
    unit: "50kg drum",
    vendor: "Pidilite",
    hasOptions: true,
    specs: [
      { label: "Grade", value: "D3 Synthetic Resin" },
      { label: "Pack", value: "50kg drum" },
      { label: "Bond Type", value: "Wood / MDF / Laminate" },
      { label: "Type", value: "Water Resistant" },
    ],
  },
  {
    id: "dr-fixit-pidifin-2k",
    images: [imgDrfixitBucket, utWaterplus, imgBirlawhitePutty],
    features: [
      "2-component polymer-modified cementitious coating",
      "Bridges hairline cracks up to 0.2mm",
      "Certified for terrace, bathroom & basement applications",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Waterproofing",
    image: imgDrfixitBucket,
    title: "Dr. Fixit Pidifin 2K 20kg Kit — 2-Component Waterproofing Coating for Terrace & Bathroom",
    description:
      "Dr. Fixit Pidifin 2K is a two-component, polymer-modified cementitious waterproofing coating. It bridges hairline cracks, bonds strongly to concrete and plaster, and remains elastic to handle thermal movement. Suitable for terraces, bathrooms, water tanks and basements. UV stable, non-toxic.",
    rating: 4.6,
    reviews: 1874,
    price: 2200,
    mrp: 2800,
    bankOfferPrice: 2100,
    bankOfferLabel: "CONON-NOW Khata",
    deliveryEta: "Today, 4:30 PM",
    service: "Free Delivery",
    variantsLabel: "+2 sizes (5kg / 20kg)",
    unit: "20kg kit",
    vendor: "Dr. Fixit",
    hasOptions: true,
    specs: [
      { label: "Type", value: "2-Component Cementitious" },
      { label: "Coverage", value: "~12 sq.m / kit" },
      { label: "Application", value: "Terrace / Bath / Tank" },
      { label: "Crack Bridge", value: "Up to 0.2mm" },
    ],
  },
  {
    id: "kajaria-marble-look-tile",
    images: [imgKajariaPgvt, imgKajariaTile, imgMakranaWhite],
    features: [
      "Marble-look GVT (Glazed Vitrified Tile) — full-body",
      "Double charge pressed, 8–9mm thickness",
      "Anti-skid rating R9 — slip resistant for floors",
    ],
    tag: "Sponsored",
    materialTag: "Marble & Flooring",
    image: imgKajariaPgvt,
    title: "Kajaria Marble-Look GVT Floor Tiles 800×800mm, Anti-Skid, Premium Grade — Box of 3",
    description:
      "Kajaria 800×800mm GVT tiles replicate Italian marble veining with full-body glazing for a luxurious, high-gloss floor finish. Double-charge pressed for superior hardness; anti-skid R9 surface for safe, low-maintenance residential and commercial flooring.",
    rating: 4.5,
    reviews: 2210,
    price: 1650,
    mrp: 2200,
    bankOfferPrice: 1570,
    bankOfferLabel: "CONON-NOW Khata or HDFC Bank",
    deliveryEta: "Today, 6:00 PM",
    service: "Free Carry-Up",
    variantsLabel: "+6 marble patterns",
    unit: "box of 3 (1.92 sq.m)",
    vendor: "Kajaria",
    hasOptions: true,
    specs: [
      { label: "Size", value: "800×800 mm" },
      { label: "Finish", value: "High Gloss GVT" },
      { label: "Thickness", value: "8–9 mm" },
      { label: "Anti-Skid", value: "R9 rated" },
    ],
  },
  {
    id: "anchor-roma-modular-switch",
    images: [imgAnchorSwitch, imgPolycabWire, imgHavellsWire],
    features: [
      "High quality flame-retardant polycarbonate",
      "Silver-inlay contacts for long electrical life",
      "Smooth click mechanism with zero sparking",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Electrical",
    image: imgAnchorSwitch,
    title: "Anchor Roma Modular Switch 6A 1-Way, White Polycarbonate — Pack of 10",
    description:
      "Anchor by Panasonic Roma modular switches feature flame-retardant polycarbonate with silver cadmium oxide contacts for durable, spark-free performance. Tested for over 100,000 clicks.",
    rating: 4.7,
    reviews: 1420,
    price: 360,
    mrp: 480,
    deliveryEta: "Today, 4:00 PM",
    service: "Free Delivery",
    unit: "pack of 10",
    vendor: "Anchor by Panasonic",
    specs: [
      { label: "Rating", value: "6 Amp, 240V" },
      { label: "Module", value: "1 Module" },
      { label: "Finish", value: "Glossy White" },
      { label: "Material", value: "Polycarbonate" },
    ],
  },
  {
    id: "jaquar-alive-basin-mixer",
    images: [imgJaquarFaucet, imgHindwareEwc, imgAstralPipe],
    features: [
      "Solid forged brass body with chrome finish",
      "High performance ceramic disc cartridge",
      "Water-saving aerator for smooth foam flow",
    ],
    tag: "Sponsored",
    materialTag: "Plumbing",
    image: imgJaquarFaucet,
    title: "Jaquar Alive Single Lever Basin Mixer Tap, Chrome Finish, Brass Body",
    description:
      "Jaquar Alive Single Lever Basin Mixer is engineered from virgin brass with a flawless mirror chrome plating. The high-precision ceramic cartridge guarantees 10 years of leak-free, silky operation.",
    rating: 4.8,
    reviews: 865,
    price: 3450,
    mrp: 4200,
    bankOfferPrice: 3250,
    bankOfferLabel: "CONON-NOW Khata",
    deliveryEta: "Today, 5:00 PM",
    service: "Free Delivery",
    unit: "piece",
    vendor: "Jaquar",
    specs: [
      { label: "Material", value: "Forged Brass" },
      { label: "Finish", value: "Chrome" },
      { label: "Type", value: "Single Lever" },
      { label: "Warranty", value: "10 Years" },
    ],
  },
  {
    id: "godrej-navtal-brass-lock",
    images: [imgGodrejLock, imgHettichHinge, imgDorsetHandle],
    features: [
      "Solid extruded brass body with hardened steel shackle",
      "7-lever precision locking mechanism",
      "Hacksaw-resistant and corrosion proof",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Hardware",
    image: imgGodrejLock,
    title: "Godrej Nav-Tal 7 Levers Hardened Brass Padlock with 3 Keys, Heavy Duty",
    description:
      "India's iconic high-security padlock from Godrej. Solid brass construction with hardened boron alloy steel shackle resistant to hacksaws and crowbars. Comes with 3 brass keys.",
    rating: 4.9,
    reviews: 4210,
    price: 490,
    mrp: 620,
    deliveryEta: "Today, 3:00 PM",
    service: "Free Delivery",
    unit: "piece",
    vendor: "Godrej",
    specs: [
      { label: "Mechanism", value: "7 Brass Levers" },
      { label: "Shackle", value: "Hardened Steel" },
      { label: "Keys", value: "3 Keys Included" },
      { label: "Body", value: "Solid Brass" },
    ],
  },
  {
    id: "birla-white-wallcare-putty-40kg",
    images: [imgBirlawhitePutty, imgJkPutty, PROD("putty")],
    features: [
      "White cement based polymer modified putty",
      "Extra HP polymers prevent flaking & seepage",
      "Smooth, bright white canvas for wall paint",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Finishing",
    image: imgBirlawhitePutty,
    title: "Birla White WallCare Waterproof Putty 40kg Bag, Smooth White Finish",
    description:
      "Birla White WallCare Putty is formulated with genuine white cement and German polymers to bond strongly with base plaster. Prevents flaking, fills hairline cracks, and creates a silky smooth base for paint.",
    rating: 4.7,
    reviews: 1980,
    price: 890,
    mrp: 1050,
    deliveryEta: "Today, 3:30 PM",
    service: "Free Unloading",
    unit: "40kg bag",
    vendor: "Birla White",
    specs: [
      { label: "Pack Size", value: "40 kg" },
      { label: "Base", value: "White Cement" },
      { label: "Pot Life", value: "2–2.5 Hours" },
      { label: "Coverage", value: "~16–18 sq.ft/kg (2 coats)" },
    ],
  },
  {
    id: "bosch-gsb-550-impact-drill",
    images: [imgBoschDrill, imgDewaltGrinder, PROD("drill-bits")],
    features: [
      "Powerful 550W motor with forward/reverse mode",
      "13mm keyed chuck for heavy masonry & steel drilling",
      "Ergonomic compact grip with auxiliary handle & depth gauge",
    ],
    tag: "Sponsored",
    materialTag: "Tools",
    image: imgBoschDrill,
    title: "Bosch GSB 550 Professional Impact Drill Machine 550W with 13mm Chuck",
    description:
      "The contractor's workhorse drill. 550 Watt robust motor handles masonry, wood and metal effortlessly. Dual-mode rotary and impact action with variable speed trigger.",
    rating: 4.8,
    reviews: 3120,
    price: 2450,
    mrp: 3200,
    bankOfferPrice: 2320,
    bankOfferLabel: "CONON-NOW Khata",
    deliveryEta: "Today, 4:30 PM",
    service: "Free Delivery",
    unit: "kit",
    vendor: "Bosch",
    specs: [
      { label: "Power", value: "550 W" },
      { label: "Chuck", value: "13 mm Keyed" },
      { label: "No-load Speed", value: "0–2700 RPM" },
      { label: "Impact Rate", value: "0–41600 BPM" },
    ],
  },
  {
    id: "makrana-white-marble-slab",
    images: [imgMakranaWhite, imgBlackGalaxy, imgKajariaPgvt],
    features: [
      "100% natural Makrana white marble slab",
      "98% calcium carbonate for lifetime crystalline shine",
      "Zero chemical treatment — natural high cooling floor",
    ],
    tag: "CONON-NOW Assured",
    materialTag: "Marble & Flooring",
    image: imgMakranaWhite,
    title: "Makrana Pure White Marble Slab 18mm Thickness — Premium Flooring Grade",
    description:
      "Authentic Makrana pure white marble mined from Rajasthan. Renowned worldwide for unmatched longevity, crystalline luster and cool surface temperature throughout hot Indian summers.",
    rating: 4.9,
    reviews: 540,
    price: 185,
    mrp: 240,
    deliveryEta: "Tomorrow, 10:00 AM",
    service: "Free Crane Unloading",
    unit: "per sq.ft",
    vendor: "CONON-NOW Natural Stone",
    specs: [
      { label: "Thickness", value: "18 mm" },
      { label: "Origin", value: "Makrana, Rajasthan" },
      { label: "Finish", value: "Mirror Polishable" },
      { label: "Grade", value: "First Selection" },
    ],
  },
];

const manifest = productAssetManifest as Record<string, string>;
function enrichProduct(p: Product): Product {
  const base = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
  const asset = manifest[p.title] || manifest[p.title.trim()];
  const finalImage = asset ? `${base}${asset}` : p.image;
  const gallery: string[] = p.images && p.images.length > 0
    ? ([finalImage, ...p.images.slice(1)].filter(Boolean) as string[])
    : finalImage ? [finalImage] : [];
  return {
    ...p,
    image: finalImage,
    images: gallery,
  };
}

export const CORE_BUILDER_PRODUCTS: Product[] = RAW_DUMMY_PRODUCTS.map(enrichProduct);
export const DUMMY_PRODUCTS: Product[] = CORE_BUILDER_PRODUCTS;
export const BUILDER_PICKS: Product[] = RAW_BUILDER_PICKS.map(enrichProduct);

/* Combined full catalog containing every authentic product across all categories */
export const ALL_CATALOG_PRODUCTS: Product[] = [...CORE_BUILDER_PRODUCTS, ...BUILDER_PICKS];

export type ProductFeedProps = {
  /** Real products to display. */
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
 * Uses the builder construction-materials catalog.
 */
export function ProductFeed({
  products = CORE_BUILDER_PRODUCTS,
  onAddToCart,
  onSetQty,
  onSeeOptions,
  onVariants,
  onArView,
  onOpenDetail,
  getCartQty,
  isAdding = false,
}: ProductFeedProps) {
  const enriched = React.useMemo(() => products.map(enrichProduct), [products]);
  return (
    <div className="space-y-4">
      {enriched.map((p) => (
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
