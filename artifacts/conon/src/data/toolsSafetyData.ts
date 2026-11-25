export interface ToolsSafetyProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subCategory: "Power Tools" | "Hand & Measuring Tools" | "Site Safety & PPE";
  toolSubcategory: "POWER_TOOL" | "HAND_TOOL" | "SITE_SAFETY";
  sellingUnit: string;
  unit: string;
  price: number;
  exGstPrice: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  hsnCode: string;
  deliveryVehicleType: "2-Wheeler";
  powerWatts?: number | null;
  chuckOrDiscSpec?: string | null;
  safetyStandard?: string | null;
  keySpecBadge: string;
  brandTier: 1 | 2;
  image: string;
  images: string[];
  shortTagline: string;
  specChips: string[];
  description: string;
  highlights: string[];
  specifications: { label: string; value: string }[];
  variants: {
    id: string;
    label: string;
    unit: string;
    price: number;
    mrp: number;
    discountPercent: number;
    stock: number;
    image: string;
  }[];
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  deliveryEta: string;
  vendor: string;
  crossSellSkus: string[];
}

export const ALL_9_TOOLS_SAFETY_PRODUCTS: ToolsSafetyProduct[] = [
  // ── 4.1 Power Tools (3 SKUs | HSN 8467 | 18% GST) ──
  {
    id: "prod-tools-bosch-gws-600",
    slug: "bosch-gws-600-angle-grinder-4-inch-670w",
    name: "Bosch GWS 600 670W 4-Inch (100mm) Angle Grinder (11000 RPM)",
    title: "Bosch — GWS 600 670W 4-Inch (100mm) Angle Grinder (11,000 RPM)",
    brand: "Bosch",
    categorySlug: "power-tools-safety",
    categoryName: "Power Tools, Hand Tools & Site Safety",
    subCategory: "Power Tools",
    toolSubcategory: "POWER_TOOL",
    sellingUnit: "Piece",
    unit: "Piece",
    price: 2400,
    exGstPrice: 2034,
    mrp: 3600,
    discountPercent: 33,
    gstPercent: 18,
    hsnCode: "8467",
    deliveryVehicleType: "2-Wheeler",
    powerWatts: 670,
    chuckOrDiscSpec: "100mm (4-Inch) M10 Spindle",
    safetyStandard: "Burst-Proof Guard / Double Insulated",
    keySpecBadge: "670W · 100mm · 11,000 RPM",
    brandTier: 1,
    image: "/images/products/power-tools-safety/bosch-gws-600-angle-grinder-4-inch-670w.webp",
    images: ["/images/products/power-tools-safety/bosch-gws-600-angle-grinder-4-inch-670w.webp"],
    shortTagline: "670W High-Torque Motor · Ultra-Slim Grip · 11,000 RPM Cutting Speed",
    specChips: ["670W Motor", "100mm / 4-Inch", "11,000 RPM", "Burst-Proof Guard", "18% GST HSN 8467"],
    description: "Bosch GWS 600 Professional is Lucknow's #1 contractor-grade 4-inch angle grinder for rebar slicing, masonry chasing, granite grinding, and weld deburring. Equipped with a compact, ultra-slim barrel grip and heat-resistant copper armature.",
    highlights: [
      "High performance 670W motor delivers 11,000 RPM for effortless slicing of TMT steel and masonry",
      "Slim, ergonomic barrel housing fits comfortably in the palm for single-hand overhead control",
      "Spindle lock button enables rapid, safe disc changes with standard 2-pin spanner",
      "Burst-proof safety guard deflects sparks away from operator in case of disc failure",
      "Labyrinth air intakes prevent abrasive mortar, marble dust, and metal grit from entering motor windings"
    ],
    specifications: [
      { label: "Brand", value: "Bosch Power Tools" },
      { label: "Model", value: "GWS 600 Professional" },
      { label: "Rated Power Input", value: "670 Watts (230V AC)" },
      { label: "Disc Diameter", value: "100 mm (4 Inch)" },
      { label: "No-Load Speed", value: "11,000 RPM" },
      { label: "Spindle Thread", value: "M10" },
      { label: "HSN Code", value: "8467" },
      { label: "GST Rate", value: "18% Standard GST" },
      { label: "Ex-GST Base Price", value: "₹2,034" },
      { label: "Delivery Vehicle", value: "2-Wheeler (60-Min Express)" }
    ],
    variants: [
      {
        id: "var-gws600-bare",
        label: "Machine Only (Carton Box)",
        unit: "Piece",
        price: 2400,
        mrp: 3600,
        discountPercent: 33,
        stock: 50,
        image: "/images/products/power-tools-safety/bosch-gws-600-angle-grinder-4-inch-670w.webp"
      }
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 184,
    deliveryEta: "60 Mins",
    vendor: "Bosch Authorized Tools Depot (Latouche Road)",
    crossSellSkus: [
      "3m-fahrenheit-7136013-chemical-resistant-safety-goggles",
      "stanley-5m-x-19mm-tylon-measuring-tape-lock-stht37519-812"
    ]
  },
  {
    id: "prod-tools-bosch-gbh-2-26-re",
    slug: "bosch-gbh-2-26-re-800w-sds-plus-rotary-hammer",
    name: "Bosch GBH 2-26 RE 800W SDS-Plus Rotary Hammer Drill",
    title: "Bosch — GBH 2-26 RE 800W SDS-Plus Rotary Hammer Drill",
    brand: "Bosch",
    categorySlug: "power-tools-safety",
    categoryName: "Power Tools, Hand Tools & Site Safety",
    subCategory: "Power Tools",
    toolSubcategory: "POWER_TOOL",
    sellingUnit: "Piece",
    unit: "Piece",
    price: 14987,
    exGstPrice: 12701,
    mrp: 19500,
    discountPercent: 23,
    gstPercent: 18,
    hsnCode: "8467",
    deliveryVehicleType: "2-Wheeler",
    powerWatts: 800,
    chuckOrDiscSpec: "SDS-Plus (26mm Concrete)",
    safetyStandard: "Overload Safety Clutch / IS 60745",
    keySpecBadge: "800W · SDS-Plus · 0–900 RPM",
    brandTier: 1,
    image: "/images/products/power-tools-safety/bosch-gbh-2-26-re-800w-sds-plus-rotary-hammer.webp",
    images: ["/images/products/power-tools-safety/bosch-gbh-2-26-re-800w-sds-plus-rotary-hammer.webp"],
    shortTagline: "800W High Drilling Rate · 0–2.7J Impact Energy · Reversible Rotation",
    specChips: ["800W Motor", "SDS-Plus 26mm", "0–2.7J Impact", "Forward/Reverse", "18% GST HSN 8467"],
    description: "Bosch GBH 2-26 RE is the heavy-duty civil contractor hammer drill engineered for fast drilling through high-grade M25/M30 RCC slabs, brick lintels, and stone foundation walls. Equipped with an overload safety clutch that disengages drive if the bit catches on rebar.",
    highlights: [
      "Robust 800W copper motor delivers 2.7 Joules of pneumatic impact force for continuous drilling",
      "Overload safety clutch protects operator wrist from sudden torque recoil if rebar jams the bit",
      "SDS-Plus toolholder allows instant one-handed bit changes without keys or chuck adaptors",
      "Rotating brush plate ensures equal forward and reverse torque for smooth bit retrieval",
      "Soft-grip main handle and 360-degree auxiliary handle dampen heavy vibration"
    ],
    specifications: [
      { label: "Brand", value: "Bosch Power Tools" },
      { label: "Model", value: "GBH 2-26 RE Professional" },
      { label: "Rated Power Input", value: "800 Watts" },
      { label: "Impact Energy", value: "2.7 Joules" },
      { label: "Rated Speed", value: "0 - 900 RPM" },
      { label: "Impact Rate", value: "0 - 4,000 BPM" },
      { label: "Drilling Capacity", value: "Concrete: 26mm, Masonry Core: 68mm, Steel: 13mm" },
      { label: "HSN Code", value: "8467" },
      { label: "GST Rate", value: "18% Standard GST" },
      { label: "Ex-GST Base Price", value: "₹12,701" },
      { label: "Delivery Vehicle", value: "2-Wheeler (60-Min Express)" }
    ],
    variants: [
      {
        id: "var-gbh226re-kit",
        label: "Carry Case Kit with Depth Stop & Handle",
        unit: "Piece",
        price: 14987,
        mrp: 19500,
        discountPercent: 23,
        stock: 25,
        image: "/images/products/power-tools-safety/bosch-gbh-2-26-re-800w-sds-plus-rotary-hammer.webp"
      }
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 96,
    deliveryEta: "60 Mins",
    vendor: "Bosch Authorized Tools Depot (Latouche Road)",
    crossSellSkus: [
      "karam-pn501-isi-shelmet-safety-helmet-grey",
      "taparia-tk-052-insulated-screwdriver-set"
    ]
  },
  {
    id: "prod-tools-bosch-gbh-2-26-dre",
    slug: "bosch-gbh-2-26-dre-800w-3-mode-sds-plus-rotary-hammer",
    name: "Bosch GBH 2-26 DRE 800W 3-Mode SDS-Plus Rotary Hammer Drill",
    title: "Bosch — GBH 2-26 DRE 800W 3-Mode SDS-Plus Rotary Hammer Drill",
    brand: "Bosch",
    categorySlug: "power-tools-safety",
    categoryName: "Power Tools, Hand Tools & Site Safety",
    subCategory: "Power Tools",
    toolSubcategory: "POWER_TOOL",
    sellingUnit: "Piece",
    unit: "Piece",
    price: 13550,
    exGstPrice: 11483,
    mrp: 17800,
    discountPercent: 24,
    gstPercent: 18,
    hsnCode: "8467",
    deliveryVehicleType: "2-Wheeler",
    powerWatts: 800,
    chuckOrDiscSpec: "SDS-Plus 3-Mode (Rotary, Hammer, Chisel)",
    safetyStandard: "Rotation Stop / Overload Clutch / IS 60745",
    keySpecBadge: "800W · SDS-Plus · 0–3J Impact",
    brandTier: 1,
    image: "/images/products/power-tools-safety/bosch-gbh-2-26-dre-800w-3-mode-sds-plus-rotary-hammer.webp",
    images: ["/images/products/power-tools-safety/bosch-gbh-2-26-dre-800w-3-mode-sds-plus-rotary-hammer.webp"],
    shortTagline: "3-Mode Selector with Rotation Stop · Light Chiseling & Tile Stripping · 800W",
    specChips: ["800W Motor", "3-Mode Versatility", "SDS-Plus Chisel", "Rotation Stop", "18% GST HSN 8467"],
    description: "Bosch GBH 2-26 DRE is Lucknow's most versatile contractor hammer drill featuring 3 operating modes: hammer drilling, straight drilling without impact, and dedicated rotation-stop chiseling for removing old bathroom floor tiles and masonry wall channels.",
    highlights: [
      "Versatile 3-mode selector: Hammer Drilling, Plain Rotary Drilling, and Rotation-Stop Chiseling",
      "Delivers 2.7–3.0 Joules impact energy for high-speed demolition chiseling and concrete drilling",
      "Vario-Lock mechanism positions flat chisels in 36 different angles for comfortable ergonomics",
      "Integrated mechanical clutch prevents dangerous kickback when encountering hidden steel rebars",
      "Sturdy ball grommet cable mount prevents power cord fraying on rugged job sites"
    ],
    specifications: [
      { label: "Brand", value: "Bosch Power Tools" },
      { label: "Model", value: "GBH 2-26 DRE Professional" },
      { label: "Rated Power Input", value: "800 Watts" },
      { label: "Impact Energy", value: "2.7 - 3.0 Joules" },
      { label: "Operating Modes", value: "Drilling, Hammer Drilling, Chiseling" },
      { label: "Max Drilling Concrete", value: "26 mm Diameter" },
      { label: "HSN Code", value: "8467" },
      { label: "GST Rate", value: "18% Standard GST" },
      { label: "Ex-GST Base Price", value: "₹11,483" },
      { label: "Delivery Vehicle", value: "2-Wheeler (60-Min Express)" }
    ],
    variants: [
      {
        id: "var-gbh226dre-kit",
        label: "Carry Case with Auxiliary Handle & Depth Stop",
        unit: "Piece",
        price: 13550,
        mrp: 17800,
        discountPercent: 24,
        stock: 30,
        image: "/images/products/power-tools-safety/bosch-gbh-2-26-dre-800w-3-mode-sds-plus-rotary-hammer.webp"
      }
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 112,
    deliveryEta: "60 Mins",
    vendor: "Bosch Authorized Tools Depot (Latouche Road)",
    crossSellSkus: [
      "karam-pn501-isi-shelmet-safety-helmet-grey",
      "taparia-tk-052-insulated-screwdriver-set"
    ]
  },

  // ── 4.2 Hand & Measuring Tools (2 SKUs | 18% GST) ──
  {
    id: "prod-tools-taparia-tk-052",
    slug: "taparia-tk-052-insulated-screwdriver-set",
    name: "Taparia TK-052 (822I, 936I, 824I) Insulated Screwdriver Set",
    title: "Taparia — TK-052 (822I, 936I, 824I) Insulated Screwdriver Set",
    brand: "Taparia",
    categorySlug: "power-tools-safety",
    categoryName: "Power Tools, Hand Tools & Site Safety",
    subCategory: "Hand & Measuring Tools",
    toolSubcategory: "HAND_TOOL",
    sellingUnit: "Set",
    unit: "Set",
    price: 249,
    exGstPrice: 211,
    mrp: 340,
    discountPercent: 27,
    gstPercent: 18,
    hsnCode: "8205",
    deliveryVehicleType: "2-Wheeler",
    powerWatts: null,
    chuckOrDiscSpec: "822I, 936I, 824I Blades",
    safetyStandard: "1000V Insulated / IS 5571",
    keySpecBadge: "1000V Insulated · 3-in-1 Blade Set",
    brandTier: 1,
    image: "/images/products/power-tools-safety/taparia-tk-052-insulated-screwdriver-set.webp",
    images: ["/images/products/power-tools-safety/taparia-tk-052-insulated-screwdriver-set.webp"],
    shortTagline: "High-Grade Alloy Steel · 1000V Shock Protection · Precision Ground Tips",
    specChips: ["1000V Insulated", "Alloy Steel", "3-in-1 Blade Set", "Shockproof Handle", "18% GST HSN 8205"],
    description: "Taparia TK-052 is an electrician-certified 1000V insulated interchangeable screwdriver set containing three running blade models (822I, 936I, and 824I). Manufactured from high-tensile chrome vanadium alloy steel hardened to 55–58 HRC.",
    highlights: [
      "1000V AC dielectric insulation sleeve shields electricians against accidental live-circuit shocks",
      "Drop-forged silicon-manganese alloy steel blades resist twisting and rounding under heavy torque",
      "Includes 3 precision running blades: slotted 822I, Phillips cross-point 936I, and long reach 824I",
      "Ergonomic cellulose acetate high-impact handle provides firm, non-slip grip",
      "Tested and certified in accordance with Indian Standard IS 5571 for electrical maintenance safety"
    ],
    specifications: [
      { label: "Brand", value: "Taparia Tools Limited" },
      { label: "Model Code", value: "TK-052 Insulated Set" },
      { label: "Blade Configurations", value: "822I (Flat 3.25mm), 936I (Phillips No.1), 824I (Flat 4mm)" },
      { label: "Insulation Rating", value: "1000 Volts AC / 1500 Volts DC" },
      { label: "Hardness", value: "55 - 58 HRC Hardened Tips" },
      { label: "HSN Code", value: "8205" },
      { label: "GST Rate", value: "18% Standard GST" },
      { label: "Ex-GST Base Price", value: "₹211" },
      { label: "Delivery Vehicle", value: "2-Wheeler (60-Min Express)" }
    ],
    variants: [
      {
        id: "var-taparia-tk052",
        label: "3-Blade Insulated Set in Blister Pack",
        unit: "Set",
        price: 249,
        mrp: 340,
        discountPercent: 27,
        stock: 120,
        image: "/images/products/power-tools-safety/taparia-tk-052-insulated-screwdriver-set.webp"
      }
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 164,
    deliveryEta: "60 Mins",
    vendor: "Taparia Authorized Wholesale Hub (Aminabad)",
    crossSellSkus: [
      "stanley-5m-x-19mm-tylon-measuring-tape-lock-stht37519-812",
      "karam-pn501-isi-shelmet-safety-helmet-grey"
    ]
  },
  {
    id: "prod-tools-stanley-tylon-5m",
    slug: "stanley-5m-x-19mm-tylon-measuring-tape-lock-stht37519-812",
    name: "Stanley 5m x 19mm Tylon Measuring Tape with Lock (STHT37519-812)",
    title: "Stanley — 5m x 19mm Tylon Measuring Tape with Lock (STHT37519-812)",
    brand: "Stanley",
    categorySlug: "power-tools-safety",
    categoryName: "Power Tools, Hand Tools & Site Safety",
    subCategory: "Hand & Measuring Tools",
    toolSubcategory: "HAND_TOOL",
    sellingUnit: "Piece",
    unit: "Piece",
    price: 100,
    exGstPrice: 85,
    mrp: 180,
    discountPercent: 44,
    gstPercent: 18,
    hsnCode: "9017",
    deliveryVehicleType: "2-Wheeler",
    powerWatts: null,
    chuckOrDiscSpec: "19mm Blade Width · 5m Length",
    safetyStandard: "Class II Accuracy / Tylon Anti-Glare Coat",
    keySpecBadge: "5m x 19mm · Tylon Coated · Lock",
    brandTier: 1,
    image: "/images/products/power-tools-safety/stanley-5m-x-19mm-tylon-measuring-tape-lock-stht37519-812.webp",
    images: ["/images/products/power-tools-safety/stanley-5m-x-19mm-tylon-measuring-tape-lock-stht37519-812.webp"],
    shortTagline: "Tylon Matt Finish Blade · Class II Accuracy · Tru-Zero Hook",
    specChips: ["5m Length", "19mm Width", "Tylon Anti-Glare", "Tru-Zero Hook", "18% GST HSN 9017"],
    description: "Stanley 5m x 19mm Tylon Measuring Tape (STHT37519-812) is the benchmark job site tape for civil engineers, site foremen, and interior designers. Features a non-glare matte Tylon nylon blade coating for 1.5x enhanced blade life and crisp numeric readability.",
    highlights: [
      "Exclusive Tylon polymer coating provides superior wear resistance and eliminates sun glare",
      "True Class-II precision accuracy calibrated in both metric (cm/m) and imperial (inches/feet)",
      "Tru-Zero 3-rivet dynamic end hook moves automatically to compensate for inside and outside measurements",
      "Ergonomic shock-absorbing bi-material case protects internal spring against accidental drops",
      "Smooth slide lock holds blade firmly in position for precise marking on walls and boards"
    ],
    specifications: [
      { label: "Brand", value: "Stanley (Stanley Black & Decker)" },
      { label: "Model Number", value: "STHT37519-812" },
      { label: "Blade Length", value: "5 Meters (16 Feet)" },
      { label: "Blade Width", value: "19 mm" },
      { label: "Coating Type", value: "Tylon Matt Nylon Polymer" },
      { label: "HSN Code", value: "9017" },
      { label: "GST Rate", value: "18% Standard GST" },
      { label: "Ex-GST Base Price", value: "₹85" },
      { label: "Delivery Vehicle", value: "2-Wheeler (60-Min Express)" }
    ],
    variants: [
      {
        id: "var-stanley-5m",
        label: "5m x 19mm Tylon Tape",
        unit: "Piece",
        price: 100,
        mrp: 180,
        discountPercent: 44,
        stock: 200,
        image: "/images/products/power-tools-safety/stanley-5m-x-19mm-tylon-measuring-tape-lock-stht37519-812.webp"
      }
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 320,
    deliveryEta: "60 Mins",
    vendor: "Stanley Authorized Dealer (Hewett Road)",
    crossSellSkus: [
      "bosch-gws-600-angle-grinder-4-inch-670w",
      "taparia-tk-052-insulated-screwdriver-set"
    ]
  },

  // ── 4.3 Site Safety & PPE (4 SKUs | 18% GST) ──
  {
    id: "prod-safety-karam-pn501",
    slug: "karam-pn501-isi-shelmet-safety-helmet-grey",
    name: "Karam PN501 ISI Marked Shelmet Safety Helmet (Plastic Cradle, Grey)",
    title: "Karam — PN501 ISI Marked Shelmet Safety Helmet (Plastic Cradle, Grey)",
    brand: "Karam",
    categorySlug: "power-tools-safety",
    categoryName: "Power Tools, Hand Tools & Site Safety",
    subCategory: "Site Safety & PPE",
    toolSubcategory: "SITE_SAFETY",
    sellingUnit: "Piece",
    unit: "Piece",
    price: 261,
    exGstPrice: 221,
    mrp: 375,
    discountPercent: 30,
    gstPercent: 18,
    hsnCode: "6506",
    deliveryVehicleType: "2-Wheeler",
    powerWatts: null,
    chuckOrDiscSpec: "Nape Type Plastic Cradle Harness",
    safetyStandard: "IS 2925:1984 BIS Certified",
    keySpecBadge: "ISI Marked · PN501 · Polyethylene",
    brandTier: 2,
    image: "/images/products/power-tools-safety/karam-pn501-isi-shelmet-safety-helmet-grey.webp",
    images: ["/images/products/power-tools-safety/karam-pn501-isi-shelmet-safety-helmet-grey.webp"],
    shortTagline: "IS 2925 BIS Certified · High Density Polymer Shell · Nape Strap Adjustment",
    specChips: ["ISI Marked", "IS 2925 Certified", "High Density Polymer", "Grey Shell", "18% GST HSN 6506"],
    description: "Karam Shelmet PN501 is the official BIS IS 2925:1984 certified industrial hard hat designed for site engineers, technicians, and project supervisors. Molded from premium UV-stabilized virgin polymer with reinforced deflection ridges.",
    highlights: [
      "Rigid triple-crown deflection crest disperses falling stone and brick impact force away from cranium",
      "High density polyethylene polymer shell offers high dielectric insulation up to 2,000 Volts",
      "Ergonomic nape-type suspension cradle with manual adjustment dial fits head sizes 54cm to 59cm",
      "Integrated non-allergenic cotton sweatband keeps brow dry in Lucknow's extreme summer heat",
      "Lateral slots support clip-on ear defenders and face shield attachments"
    ],
    specifications: [
      { label: "Brand", value: "Karam Safety" },
      { label: "Model", value: "Shelmet PN501" },
      { label: "Shell Material", value: "UV-Stabilized High Density Polymer" },
      { label: "Standard", value: "IS 2925:1984 BIS Marked" },
      { label: "Color", value: "Grey (Site Engineers / Project Managers)" },
      { label: "HSN Code", value: "6506" },
      { label: "GST Rate", value: "18% Standard GST" },
      { label: "Ex-GST Base Price", value: "₹221" },
      { label: "Delivery Vehicle", value: "2-Wheeler (60-Min Express)" }
    ],
    variants: [
      {
        id: "var-karam-pn501-gry",
        label: "Grey Helmet (Engineers / Supervisors)",
        unit: "Piece",
        price: 261,
        mrp: 375,
        discountPercent: 30,
        stock: 150,
        image: "/images/products/power-tools-safety/karam-pn501-isi-shelmet-safety-helmet-grey.webp"
      }
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 215,
    deliveryEta: "60 Mins",
    vendor: "Karam Authorized Safety Distributor (Latouche Road)",
    crossSellSkus: [
      "3m-fahrenheit-7136013-chemical-resistant-safety-goggles",
      "karam-ki01-pn-351-isi-full-body-safety-harness-lanyard-2-hooks"
    ]
  },
  {
    id: "prod-safety-karam-ki01-pn351",
    slug: "karam-ki01-pn-351-isi-full-body-safety-harness-lanyard-2-hooks",
    name: "Karam KI01 PN 351 ISI Full Body Safety Harness w/ Lanyard & 2 Hooks",
    title: "Karam — KI01 PN 351 ISI Full Body Safety Harness w/ Lanyard & 2 Hooks",
    brand: "Karam",
    categorySlug: "power-tools-safety",
    categoryName: "Power Tools, Hand Tools & Site Safety",
    subCategory: "Site Safety & PPE",
    toolSubcategory: "SITE_SAFETY",
    sellingUnit: "Set",
    unit: "Set",
    price: 1800,
    exGstPrice: 1525,
    mrp: 2650,
    discountPercent: 32,
    gstPercent: 18,
    hsnCode: "6307",
    deliveryVehicleType: "2-Wheeler",
    powerWatts: null,
    chuckOrDiscSpec: "2m Twin Lanyard + 2 Steel Scaffold Hooks",
    safetyStandard: "IS 3521:1999 & EN 361 Certified",
    keySpecBadge: "ISI Full Body · 2m Lanyard · 2 Hooks",
    brandTier: 2,
    image: "/images/products/power-tools-safety/karam-ki01-pn-351-isi-full-body-safety-harness-lanyard-2-hooks.webp",
    images: ["/images/products/power-tools-safety/karam-ki01-pn-351-isi-full-body-safety-harness-lanyard-2-hooks.webp"],
    shortTagline: "Dorsal D-Ring · 2m Twin Twisted Lanyard · 2 Scaffold Hooks (50mm Opening)",
    specChips: ["ISI Marked", "IS 3521:1999", "2 Scaffold Hooks", "2m Twin Lanyard", "18% GST HSN 6307"],
    description: "Karam KI01 PN 351 is an industrial full-body fall-arrest harness with integrated twin 2-meter shock lanyard and two high-strength steel scaffold hooks. Mandatory for scaffolding erection, exterior tower plastering, and high-rise roof work.",
    highlights: [
      "Certified under IS 3521:1999 and European EN 361 for guaranteed fall-arrest protection",
      "Equipped with twin 2-meter high-tenacity lanyards and two forged steel scaffold hooks with 50mm gate openings",
      "Dual color-coded 44mm polyester webbing allows instant identification of shoulder and leg straps",
      "Forged high-strength alloy steel dorsal D-ring anchors fall forces smoothly across torso",
      "Adjustable chest, shoulder, and thigh straps provide snug contractor fit for continuous 8-hour wear"
    ],
    specifications: [
      { label: "Brand", value: "Karam Safety" },
      { label: "Kit Model", value: "KI01 with PN 351 Harness" },
      { label: "Webbing Width", value: "44 mm High Tenacity Polyester" },
      { label: "Breaking Strength", value: "> 2300 kg (23 kN)" },
      { label: "Lanyard & Hooks", value: "2m Twin Rope with 2 Scaffold Hooks (PN 131)" },
      { label: "Standard", value: "IS 3521:1999 / EN 361" },
      { label: "HSN Code", value: "6307" },
      { label: "GST Rate", value: "18% Standard GST" },
      { label: "Ex-GST Base Price", value: "₹1,525" },
      { label: "Delivery Vehicle", value: "2-Wheeler (60-Min Express)" }
    ],
    variants: [
      {
        id: "var-karam-ki01-pn351",
        label: "Complete Harness + Twin Lanyard + 2 Hooks Kit",
        unit: "Set",
        price: 1800,
        mrp: 2650,
        discountPercent: 32,
        stock: 45,
        image: "/images/products/power-tools-safety/karam-ki01-pn-351-isi-full-body-safety-harness-lanyard-2-hooks.webp"
      }
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 142,
    deliveryEta: "60 Mins",
    vendor: "Karam Authorized Safety Distributor (Latouche Road)",
    crossSellSkus: [
      "karam-pn501-isi-shelmet-safety-helmet-grey",
      "smasys-high-visibility-6-in-1-reflective-safety-jacket"
    ]
  },
  {
    id: "prod-safety-3m-fahrenheit",
    slug: "3m-fahrenheit-7136013-chemical-resistant-safety-goggles",
    name: "3M Fahrenheit 7136013 Chemical Resistant Safety Goggles (Clear)",
    title: "3M — Fahrenheit 7136013 Chemical Resistant Safety Goggles (Clear)",
    brand: "3M",
    categorySlug: "power-tools-safety",
    categoryName: "Power Tools, Hand Tools & Site Safety",
    subCategory: "Site Safety & PPE",
    toolSubcategory: "SITE_SAFETY",
    sellingUnit: "Piece",
    unit: "Piece",
    price: 4077,
    exGstPrice: 3455,
    mrp: 5800,
    discountPercent: 30,
    gstPercent: 18,
    hsnCode: "9004",
    deliveryVehicleType: "2-Wheeler",
    powerWatts: null,
    chuckOrDiscSpec: "Indirect Venting / Acetate Anti-Fog Lens",
    safetyStandard: "EN 166 1.F / ANSI Z87.1 Splash Guard",
    keySpecBadge: "Anti-Fog · Chemical Splash · EN 166",
    brandTier: 2,
    image: "/images/products/power-tools-safety/3m-fahrenheit-7136013-chemical-resistant-safety-goggles.webp",
    images: ["/images/products/power-tools-safety/3m-fahrenheit-7136013-chemical-resistant-safety-goggles.webp"],
    shortTagline: "Acetate Anti-Fog Lens · Chemical Splash & Flying Particle Proof · EN 166 Certified",
    specChips: ["3M Optical Class 1", "Anti-Fog Acetate", "Chemical Splash", "EN 166 1.F", "18% GST HSN 9004"],
    description: "3M Fahrenheit 7136013 is the industry benchmark wide-vision chemical and high-impact safety goggle. Built with an aerodynamic clear acetate lens featuring premium anti-fog coating and indirect liquid venting for acid washing and angle grinding.",
    highlights: [
      "Optical Class-1 distortion-free clear acetate lens delivers 180-degree panoramic vision",
      "Superior chemical splash resistance protects eyes during concrete etching, acid tile washing, and epoxy grouting",
      "Advanced anti-fog interior coating prevents condensation in humid Lucknow summers",
      "Soft, crystal-clear PVC goggle body molds comfortably around face and over prescription eyeglasses",
      "Complies with rigorous European EN 166 Class 1.F and ANSI Z87.1 impact standards"
    ],
    specifications: [
      { label: "Brand", value: "3M Personal Safety Division" },
      { label: "Model Number", value: "Fahrenheit 7136013" },
      { label: "Lens Material", value: "Optical Grade Acetate with Anti-Fog Treatment" },
      { label: "Frame Type", value: "Soft Flexible PVC with Indirect Aerodynamic Vents" },
      { label: "Standard", value: "EN 166 1.F / ANSI Z87.1" },
      { label: "HSN Code", value: "9004" },
      { label: "GST Rate", value: "18% Standard GST" },
      { label: "Ex-GST Base Price", value: "₹3,455" },
      { label: "Delivery Vehicle", value: "2-Wheeler (60-Min Express)" }
    ],
    variants: [
      {
        id: "var-3m-fahrenheit-clr",
        label: "Clear Acetate Anti-Fog Goggle",
        unit: "Piece",
        price: 4077,
        mrp: 5800,
        discountPercent: 30,
        stock: 35,
        image: "/images/products/power-tools-safety/3m-fahrenheit-7136013-chemical-resistant-safety-goggles.webp"
      }
    ],
    inStock: true,
    rating: 4.9,
    reviewsCount: 88,
    deliveryEta: "60 Mins",
    vendor: "3M Authorized Industrial Distributor (Aminabad)",
    crossSellSkus: [
      "bosch-gws-600-angle-grinder-4-inch-670w",
      "karam-pn501-isi-shelmet-safety-helmet-grey"
    ]
  },
  {
    id: "prod-safety-smasys-jacket",
    slug: "smasys-high-visibility-6-in-1-reflective-safety-jacket",
    name: "SMASYS High-Visibility 6-in-1 Reflective Safety Jacket (Class 2/3)",
    title: "SMASYS — High-Visibility 6-in-1 Reflective Safety Jacket (Class 2/3)",
    brand: "SMASYS",
    categorySlug: "power-tools-safety",
    categoryName: "Power Tools, Hand Tools & Site Safety",
    subCategory: "Site Safety & PPE",
    toolSubcategory: "SITE_SAFETY",
    sellingUnit: "Piece",
    unit: "Piece",
    price: 27600,
    exGstPrice: 23390,
    mrp: 35000,
    discountPercent: 21,
    gstPercent: 18,
    hsnCode: "6211",
    deliveryVehicleType: "2-Wheeler",
    powerWatts: null,
    chuckOrDiscSpec: "6-in-1 Convertible Reversible Fleece Lining",
    safetyStandard: "ANSI/ISEA 107-2020 Class 3 / EN ISO 20471",
    keySpecBadge: "ANSI Class 3 · 6-in-1 Multi-Weather · 360° Reflective",
    brandTier: 2,
    image: "/images/products/power-tools-safety/smasys-high-visibility-6-in-1-reflective-safety-jacket.webp",
    images: ["/images/products/power-tools-safety/smasys-high-visibility-6-in-1-reflective-safety-jacket.webp"],
    shortTagline: "All-Weather Waterproof · 360° High-Vis Reflective Band · ANSI Class 3 Certified",
    specChips: ["ANSI Class 3", "6-in-1 Multi-Configuration", "360° Reflective", "Waterproof Oxford", "18% GST HSN 6211"],
    description: "SMASYS High-Visibility 6-in-1 Parka is the premium executive safety jacket for highway concessionaires, bridge project managers, and night-shift civil supervisors. Features 6 wearable configurations with removable inner reversible high-vis fleece jacket and detachable sleeves.",
    highlights: [
      "Meets ANSI/ISEA 107-2020 Class 3 and EN ISO 20471 Class 3 standards for maximum night visibility",
      "6-in-1 modular configuration: Full Parka, Light Windbreaker, Reversible Fleece Jacket, or High-Vis Vest",
      "300D PU-coated waterproof fluorescent Oxford polyester shell with sealed waterproof seams",
      "2-inch premium silver reflective tapes provide 360-degree reflectivity up to 400 meters under headlights",
      "Multiple tactical pockets: clear ID badge pocket, heavy-duty radio loop, and concealed storm hood"
    ],
    specifications: [
      { label: "Brand", value: "SMASYS Safety Apparel" },
      { label: "Model", value: "6-in-1 Executive High-Vis Parka" },
      { label: "Fabric", value: "300D Heavy-Duty Waterproof Oxford with PU Coating" },
      { label: "Lining", value: "Removable Anti-Pilling Heavyweight Fleece" },
      { label: "Safety Standard", value: "ANSI/ISEA 107-2020 Class 3 / EN ISO 20471" },
      { label: "HSN Code", value: "6211" },
      { label: "GST Rate", value: "18% Standard GST" },
      { label: "Ex-GST Base Price", value: "₹23,390" },
      { label: "Delivery Vehicle", value: "2-Wheeler (60-Min Express)" }
    ],
    variants: [
      {
        id: "var-smasys-l",
        label: "Large (Chest 42-44 in)",
        unit: "Piece",
        price: 27600,
        mrp: 35000,
        discountPercent: 21,
        stock: 15,
        image: "/images/products/power-tools-safety/smasys-high-visibility-6-in-1-reflective-safety-jacket.webp"
      },
      {
        id: "var-smasys-xl",
        label: "XL (Chest 46-48 in)",
        unit: "Piece",
        price: 27600,
        mrp: 35000,
        discountPercent: 21,
        stock: 20,
        image: "/images/products/power-tools-safety/smasys-high-visibility-6-in-1-reflective-safety-jacket.webp"
      }
    ],
    inStock: true,
    rating: 5.0,
    reviewsCount: 42,
    deliveryEta: "60 Mins",
    vendor: "SMASYS Safety Depot (Latouche Road)",
    crossSellSkus: [
      "karam-pn501-isi-shelmet-safety-helmet-grey",
      "karam-ki01-pn-351-isi-full-body-safety-harness-lanyard-2-hooks"
    ]
  }
];
