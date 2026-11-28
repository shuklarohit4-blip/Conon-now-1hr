export interface HomeSubcategory {
  name: string;
  slug: string;
  itemCount?: number;
}

export interface HomeCategory {
  id: number | string;
  catId?: number;
  slug: string;
  title: string;
  titleHi?: string;
  name?: string;
  nameHi?: string;
  department: string;
  image: string;
  imageUrl?: string;
  dbCategory: string;
  route: string;
  badge?: string;
  badgeColor?: string;
  categoryType?: "MATERIAL" | "RMC" | "SERVICE" | "RENTAL";
  defaultHsn?: string;
  defaultGst?: number;
  defaultGstRate?: number;
  vehicleClass?: string;
  vehicleType?: "BIKE" | "LOADER";
  displayOrder?: number;
  sortOrder?: number;
  isActive?: boolean;
  productCount?: number;
  updatedAt?: string;
  subcategories: HomeSubcategory[];
}

export interface DepartmentNav {
  id: string;
  label: string;
  hasDropdown: boolean;
  categorySlugs: string[];
}

export const HOME_DEPARTMENTS: DepartmentNav[] = [
  {
    id: "home",
    label: "Home",
    hasDropdown: false,
    categorySlugs: [],
  },
  {
    id: "civil-interiors",
    label: "Civil & Interiors",
    hasDropdown: true,
    categorySlugs: [
      "rmc-ready-mix-concrete",
      "cement-civil-works",
      "plywood-boards",
      "tile-stone-installation",
      "painting",
      "waterproofing-repairing",
      "bricks-sand-gitti-aac",
    ],
  },
  {
    id: "rmc-plant",
    label: "RMC Plant",
    hasDropdown: true,
    categorySlugs: ["rmc-ready-mix-concrete"],
  },
  {
    id: "furniture-hardware",
    label: "Furniture & Architectural Hardware",
    hasDropdown: true,
    categorySlugs: [
      "furniture-wardrobe-bed-hardware",
      "modular-kitchen-systems",
      "door-hardware-locks",
      "fevicol-adhesives-sealants",
    ],
  },
  {
    id: "electrical",
    label: "Electrical",
    hasDropdown: true,
    categorySlugs: [
      "wires-mcb-electrical",
      "lighting",
      "solar-rooftop-power",
      "cctv-networking",
      "home-appliances",
    ],
  },
  {
    id: "plumbing-sanitary",
    label: "Plumbing, Sanitary & Bath",
    hasDropdown: true,
    categorySlugs: [
      "cpvc-plumbing-tanks",
      "kitchen-sinks-faucets",
      "sanitary-bath-fittings",
    ],
  },
  {
    id: "new-launches",
    label: "New Launches",
    hasDropdown: true,
    categorySlugs: [
      "solar-rooftop-power",
      "cctv-networking",
      "lighting",
      "modular-kitchen-systems",
      "home-appliances",
      "door-hardware-locks",
    ],
  },
  {
    id: "tools",
    label: "Tools & Safety",
    hasDropdown: true,
    categorySlugs: [
      "tools-hardware",
      "safety-ppe-workwear",
    ],
  },
];

export const HOME_CATEGORIES: HomeCategory[] = [
  /* ── Row 1 ───────────────────────────────────────────────────────────── */
  {
    id: 1,
    slug: "rmc-ready-mix-concrete",
    title: "RMC (Ready Mix Concrete)",
    titleHi: "रेडी मिक्स कंक्रीट (प्लांट डायरेक्ट)",
    department: "Civil & Structural",
    image: "/images/home-categories/rmc-ready-mix-concrete.webp",
    dbCategory: "rmc",
    route: "/category/rmc-ready-mix-concrete",
    badge: "PLANT DIRECT",
    badgeColor: "#F2B705",
    categoryType: "RMC",
    defaultHsn: "38245010",
    defaultGst: 18,
    vehicleClass: "Transit Mixer (6 m³) / Loader",
    subcategories: [
      { name: "M10–M50 Structural Grades", slug: "standard-grades", itemCount: 8 },
      { name: "SCC, Waterproof & Green RMC", slug: "speciality-mixes", itemCount: 9 },
      { name: "Narrow-Lane Dry Mix Bags (40kg)", slug: "dry-mix-bags", itemCount: 1 },
      { name: "Boom Placer & Line Pumps", slug: "pumps-admixtures", itemCount: 6 },
    ],
  },
  {
    id: 101,
    slug: "cctv-networking",
    title: "CCTV & Networking",
    department: "Electrical",
    image: "/images/home-categories/cctv-networking.webp",
    dbCategory: "electrical",
    route: "/collections/cctv-networking",
    badge: "New Tech",
    subcategories: [
      { name: "CCTV Cameras", slug: "cctv-cameras", itemCount: 24 },
      { name: "DVR & NVR Recorders", slug: "dvr-nvr-recorders", itemCount: 16 },
      { name: "Surveillance Storage", slug: "surveillance-storage", itemCount: 8 },
      { name: "CCTV & LAN Cables", slug: "cctv-lan-cables", itemCount: 12 },
      { name: "Power & PoE Switches", slug: "power-poe-switches", itemCount: 14 },
      { name: "Routers, Racks & Accessories", slug: "routers-racks-accessories", itemCount: 18 },
    ],
  },
  {
    id: 2,
    slug: "cpvc-plumbing-tanks",
    title: "CPVC Plumbing & Overhead Tanks",
    department: "Plumbing, Sanitary & Bath",
    image: "/images/home-categories/cpvc-plumbing-tanks.webp",
    dbCategory: "plumbing",
    route: "/categories?cat=cpvc-plumbing-tanks",
    badge: "Bulk Rates",
    subcategories: [
      { name: "CPVC Pipes", slug: "cpvc-pipes", itemCount: 15 },
      { name: "UPVC Pipes & Fittings", slug: "upvc-pipes-fittings", itemCount: 2 },
      { name: "SWR Drainage Pipes", slug: "swr-drainage-pipes", itemCount: 4 },
      { name: "CPVC Fittings, Brass Inserts & Valves", slug: "cpvc-fittings-valves", itemCount: 16 },
      { name: "Solvent Cements & Adhesives", slug: "solvent-cements-adhesives", itemCount: 4 },
      { name: "Overhead Water Tanks & Accessories", slug: "overhead-water-tanks", itemCount: 15 },
    ],
  },
  {
    id: 3,
    slug: "cement-civil-works",
    title: "Cement, TMT Sariya & Chemicals",
    department: "Civil & Structural",
    image: "/images/home-categories/cement-civil-works.webp",
    dbCategory: "cement",
    route: "/collections/cement-1",
    badge: "Bulk Prices",
    subcategories: [
      { name: "Cement & White Cement", slug: "cement-white-cement", itemCount: 16 },
      { name: "TMT Sariya (Steel Bars)", slug: "tmt-sariya", itemCount: 20 },
      { name: "Binding Wire & Steel Accessories", slug: "binding-wire-accessories", itemCount: 4 },
      { name: "Waterproofing & Bonding Chemicals", slug: "waterproofing-chemicals", itemCount: 22 },
      { name: "Tile Adhesives & Block Mortar", slug: "tile-adhesives-block-mortar", itemCount: 8 },
    ],
  },
  {
    id: 4,
    slug: "plywood-boards",
    title: "Plywood, Doors & Hardware",
    department: "Civil & Interiors",
    image: "/images/home-categories/plywood-boards.webp",
    dbCategory: "wood",
    route: "/categories?cat=plywood-boards",
    subcategories: [
      { name: "Plywood (8x4 ft)", slug: "plywood-8x4", itemCount: 6 },
      { name: "Flush Doors (30mm)", slug: "flush-doors-30mm", itemCount: 4 },
      { name: "Laminates (1mm)", slug: "laminates-1mm", itemCount: 2 },
      { name: "Hardware (Locks, Closers & Hinges)", slug: "hardware-locks-hinges", itemCount: 4 },
    ],
  },
  {
    id: 5,
    slug: "fevicol-adhesives-sealants",
    title: "Fevicol, Adhesives & Sealants",
    department: "Furniture & Architectural Hardware",
    image: "/images/home-categories/fevicol-adhesives-sealants.webp",
    dbCategory: "adhesives",
    route: "/categories?cat=fevicol-adhesives-sealants",
    subcategories: [
      { name: "Wood & Laminate Adhesives", slug: "wood-laminate-adhesives", itemCount: 20 },
      { name: "Contact & Rubber Adhesives", slug: "contact-rubber-adhesives", itemCount: 3 },
      { name: "Epoxy, Putty & Instant Repair", slug: "epoxy-putty-instant-repair", itemCount: 10 },
      { name: "Silicone, PU Sealants & Foam", slug: "silicone-pu-sealants-foam", itemCount: 8 },
      { name: "Applicator Guns & Masking Tapes", slug: "applicator-guns-masking-tapes", itemCount: 4 },
    ],
  },
  {
    id: 6,
    slug: "wires-mcb-electrical",
    title: "Wires, MCB & Electrical Supplies",
    department: "Electrical",
    image: "/images/home-categories/wires-mcb-electrical.webp",
    dbCategory: "electrical",
    route: "/categories?cat=wires-mcb-electrical",
    badge: "ISI Certified",
    subcategories: [
      { name: "Flame Retardant House Wires", slug: "fr-house-wires", itemCount: 42 },
      { name: "MCB & Distribution Boards", slug: "mcb-db-boards", itemCount: 28 },
      { name: "Modular Switches & Sockets", slug: "modular-switches", itemCount: 64 },
      { name: "Conduits, Bends & Metal Boxes", slug: "conduits-boxes", itemCount: 36 },
      { name: "Earth Bar & Industrial Glands", slug: "earthing-glands", itemCount: 16 },
    ],
  },

  /* ── Row 2 ───────────────────────────────────────────────────────────── */
  {
    id: 7,
    slug: "kitchen-sinks-faucets",
    title: "Kitchen Sinks & Faucets",
    department: "Plumbing, Sanitary & Bath",
    image: "/images/home-categories/kitchen-sinks-faucets.webp",
    dbCategory: "hardware",
    route: "/categories?cat=kitchen-sinks-faucets",
    subcategories: [
      { name: "SS Pressed Sinks", slug: "ss-pressed-sinks", itemCount: 9 },
      { name: "Handmade SS Sinks", slug: "handmade-ss-sinks", itemCount: 6 },
      { name: "Quartz Sinks", slug: "quartz-sinks", itemCount: 4 },
      { name: "Kitchen Sink Cocks", slug: "kitchen-sink-cocks", itemCount: 11 },
      { name: "Sink Mixers & Pull-Out Faucets", slug: "sink-mixers-pullout", itemCount: 4 },
      { name: "Sink Accessories & RO Add-Ons", slug: "sink-accessories-ro", itemCount: 4 },
    ],
  },
  {
    id: 8,
    slug: "furniture-wardrobe-bed-hardware",
    title: "Furniture, Wardrobe & Bed Hardware",
    department: "Furniture & Architectural Hardware",
    image: "/images/home-categories/furniture-wardrobe-bed-hardware.webp",
    dbCategory: "hardware",
    route: "/categories?cat=furniture-wardrobe-bed-hardware",
    subcategories: [
      { name: "Telescopic Channels", slug: "telescopic-channels", itemCount: 6 },
      { name: "Soft-Close Hinges & Sliding Track", slug: "soft-close-hinges-sliding-track", itemCount: 5 },
      { name: "Hydraulic Bed & Wardrobe Lifts", slug: "hydraulic-bed-wardrobe-lifts", itemCount: 5 },
      { name: "Wardrobe Pipes & SS 304 Handles", slug: "wardrobe-pipes-ss304-handles", itemCount: 4 },
    ],
  },
  {
    id: 9,
    slug: "modular-kitchen-systems",
    title: "Modular Kitchen Systems & Fittings",
    department: "Furniture & Architectural Hardware",
    image: "/images/home-categories/modular-kitchen-systems.webp",
    dbCategory: "hardware",
    route: "/categories?cat=modular-kitchen-systems",
    subcategories: [
      { name: "Tandem Box Drawer Systems", slug: "tandem-box-drawer-systems", itemCount: 7 },
      { name: "Bottle Pull-Outs, Corner Units & Tall Pantry", slug: "bottle-pullouts-corner-pantry", itemCount: 8 },
      { name: "SS 304 Baskets, Wicker & Organizers", slug: "ss304-baskets-wicker-organizers", itemCount: 6 },
      { name: "Rolling Shutters, Lift-Ups & Gola Profiles", slug: "rolling-shutters-liftups-gola", itemCount: 5 },
    ],
  },
  {
    id: 10,
    slug: "door-hardware-locks",
    title: "Door Hardware & Locks",
    department: "Furniture & Architectural Hardware",
    image: "/images/home-categories/door-hardware-locks.webp",
    dbCategory: "hardware",
    route: "/categories?cat=door-hardware-locks",
    subcategories: [
      { name: "Smart Digital Locks", slug: "smart-digital-locks", itemCount: 6 },
      { name: "Main Door Rim Locks, Mortise Sets & Padlocks", slug: "rim-mortise-padlocks", itemCount: 10 },
      { name: "Aldrops, Tower Bolts, Stoppers & Pull Handles", slug: "aldrops-bolts-stoppers-handles", itemCount: 5 },
      { name: "SS 304 Hinges, Door Closers & Floor Springs", slug: "hinges-closers-springs", itemCount: 5 },
    ],
  },
  {
    id: 11,
    slug: "sanitary-bath-fittings",
    title: "Sanitary & Bath Fittings",
    department: "Plumbing, Sanitary & Bath",
    image: "/images/home-categories/sanitary-bath-fittings.webp",
    dbCategory: "plumbing",
    route: "/categories?cat=sanitary-bath-fittings",
    subcategories: [
      { name: "Wall-Hung WCs & One-Piece Commodes", slug: "wall-hung-and-one-piece-wc", itemCount: 6 },
      { name: "Concealed Cisterns & Dual-Flush Plates", slug: "concealed-cisterns-flush-plates", itemCount: 5 },
      { name: "Countertop & Vanity Ceramic Basins", slug: "countertop-vanity-basins", itemCount: 6 },
      { name: "Shower Diverters, Rain Showers & Spouts", slug: "shower-diverters-rain-spouts", itemCount: 6 },
      { name: "Health Faucets, Angle Valves & Bath Brassware", slug: "health-faucets-valves-brassware", itemCount: 5 },
    ],
  },
  {
    id: 12,
    slug: "tile-stone-installation",
    title: "Tiles, Marble & Granite",
    department: "Civil & Interiors",
    image: "/images/home-categories/tile-stone-installation.webp",
    dbCategory: "tiles",
    route: "/collections/tiles-marble-granite",
    badge: "Bulk Rates",
    subcategories: [
      { name: "Vitrified Floor Tiles", slug: "vitrified-floor-tiles", itemCount: 12 },
      { name: "Ceramic Wall & Parking Tiles", slug: "ceramic-wall-parking-tiles", itemCount: 6 },
      { name: "Granite Slabs", slug: "granite-slabs", itemCount: 7 },
      { name: "Marble & Natural Stones", slug: "marble-natural-stones", itemCount: 9 },
      { name: "Grouts, Epoxy, Spacers & Cutting Tools", slug: "grouts-tools", itemCount: 8 },
    ],
  },

  /* ── Row 3 ───────────────────────────────────────────────────────────── */
  {
    id: 13,
    slug: "home-appliances",
    title: "Home Appliances",
    department: "Electrical",
    image: "/images/home-categories/home-appliances.webp",
    dbCategory: "electrical",
    route: "/collections/home-appliances",
    subcategories: [
      { name: "Water Heaters & Geysers", slug: "water-heaters-geysers", itemCount: 7 },
      { name: "Modular Kitchen Chimneys", slug: "modular-kitchen-chimneys", itemCount: 4 },
      { name: "Exhaust & Ventilation Fans", slug: "exhaust-ventilation-fans", itemCount: 4 },
      { name: "Desert Air Coolers", slug: "desert-air-coolers", itemCount: 2 },
      { name: "Inverters & Tubular Batteries", slug: "inverters-tubular-batteries", itemCount: 2 },
    ],
  },
  {
    id: 14,
    slug: "lighting",
    title: "Lighting & Architectural LED",
    titleHi: "लाइटिंग और एलईडी फिक्स्चर",
    department: "Electrical",
    image: "/images/home-categories/lighting.webp",
    dbCategory: "electrical",
    route: "/collections/lighting",
    badge: "KELVIN SIMULATOR",
    badgeColor: "#1D4ED8",
    subcategories: [
      { name: 'Concealed & Junction (3" Box)', slug: "concealed-junction-lights", itemCount: 6 },
      { name: "Ceiling Panels (Rimless & 3-in-1)", slug: "ceiling-panel-lights", itemCount: 8 },
      { name: "Anti-Glare COB & Spotlights", slug: "cob-spot-lights", itemCount: 6 },
      { name: "Zero-Dot Strips, Profiles & SMPS", slug: "strip-profiles-drivers", itemCount: 7 },
      { name: "LED Battens (Tubelights)", slug: "led-battens", itemCount: 4 },
      { name: "Bulbs & Inverter Emergency", slug: "bulbs-inverter-emergency", itemCount: 5 },
      { name: "Staircase, Cabinet & Track", slug: "cabinet-track-commercial", itemCount: 6 },
      { name: "Outdoor, Flood & Gate Elevation", slug: "outdoor-flood-gate-lights", itemCount: 5 },
    ],
  },
  {
    id: 20,
    slug: "solar-rooftop-power",
    title: "Solar & Rooftop Power",
    titleHi: "सोलर पैनल और रूफटॉप पावर",
    department: "Electrical",
    image: "/images/home-categories/solar-rooftop-power.webp",
    dbCategory: "solar",
    route: "/collections/solar-rooftop-power",
    badge: "₹1.08L SUBSIDY",
    badgeColor: "#F59E0B",
    defaultHsn: "85414300",
    defaultGst: 12,
    vehicleClass: "Pickup / E-Loader",
    subcategories: [
      { name: "Solar Panels (DCR & Non-DCR)", slug: "solar-panels", itemCount: 8 },
      { name: "Complete Rooftop Kits (1kW–10kW)", slug: "rooftop-solar-kits", itemCount: 7 },
      { name: "On-Grid & Hybrid Inverters", slug: "solar-inverters", itemCount: 6 },
      { name: "Lithium & Solar Batteries", slug: "solar-batteries", itemCount: 4 },
      { name: "ACDB, DCDB & Protection", slug: "solar-acdb-dcdb", itemCount: 5 },
      { name: "DC Cables, Earthing & Site Shield", slug: "solar-cables-earthing", itemCount: 8 },
      { name: "HDGI Structures & Waterproofing", slug: "solar-structures-lights", itemCount: 7 },
    ],
  },
  {
    id: 15,
    slug: "painting",
    title: "Paints, Putty & Primer",
    department: "Civil & Interiors",
    image: "/images/home-categories/painting.webp",
    dbCategory: "paint",
    route: "/collections/paints-putty-primer",
    badge: "GST 18% Compliant",
    subcategories: [
      { name: "Wall Putty", slug: "wall-putty", itemCount: 8 },
      { name: "Wall & Metal Primers", slug: "wall-metal-primers", itemCount: 8 },
      { name: "Interior Paints & Distempers", slug: "interior-paints-distempers", itemCount: 14 },
      { name: "Exterior Paints", slug: "exterior-paints", itemCount: 10 },
      { name: "Enamels, Thinners & Painting Tools", slug: "enamels-tools", itemCount: 8 },
    ],
  },
  {
    id: 16,
    slug: "safety-ppe-workwear",
    title: "Site Safety & PPE",
    titleHi: "साइट सेफ्टी और सुरक्षा गियर",
    department: "Tools & Safety",
    image: "/images/home-categories/safety-workwear.webp",
    dbCategory: "safety",
    route: "/category/safety-ppe-workwear",
    badge: "ISI / RERA Compliant",
    defaultHsn: "6506",
    defaultGst: 18,
    subcategories: [
      { name: "Head, Eye & Face Protection", slug: "head-eye-face", itemCount: 5 },
      { name: "Safety Shoes & Gumboots", slug: "shoes-gumboots", itemCount: 5 },
      { name: "Fall Protection & Harnesses", slug: "fall-protection", itemCount: 5 },
      { name: "Industrial Hand Gloves", slug: "hand-gloves", itemCount: 5 },
      { name: "Hi-Vis Jackets & Rainwear", slug: "hivis-rainwear", itemCount: 3 },
      { name: "Respiratory & Ear Protection", slug: "respiratory-ear", itemCount: 3 },
      { name: "Site Barricading & Signboards", slug: "barricading-signs", itemCount: 3 },
      { name: "Fire, Electrical Mat & First-Aid", slug: "fire-first-aid", itemCount: 3 },
    ],
  },
  {
    id: 17,
    slug: "tools-hardware",
    title: "Tools, Power Tools & General Hardware",
    department: "Tools",
    image: "/images/home-categories/tools-hardware.webp",
    dbCategory: "tools",
    route: "/collections/tools-hardware",
    badge: "BUY OR RENT",
    badgeColor: "#1D4ED8",
    subcategories: [
      { name: "Angle Grinders & Marble Cutters", slug: "grinders-cutters", itemCount: 6 },
      { name: "Rotary Hammers & Impact Drills", slug: "rotary-drills", itemCount: 6 },
      { name: "Cutting Blades, Discs & Drill Bits", slug: "blades-discs-bits", itemCount: 8 },
      { name: "Hand Tools & Masonry Essentials", slug: "hand-masonry-tools", itemCount: 7 },
      { name: "Measuring, Levelling & Marking", slug: "measuring-levelling", itemCount: 5 },
      { name: "Fasteners, Screws & Anchors", slug: "fasteners-anchors", itemCount: 6 },
      { name: "Safety Gear & Site Utility", slug: "safety-utility", itemCount: 5 },
      { name: "Ladders, Wheelbarrows & Tapes", slug: "ladders-tapes-utility", itemCount: 4 },
    ],
  },
  {
    id: 18,
    slug: "waterproofing-repairing",
    title: "Waterproofing & Repairing",
    department: "Civil & Interiors",
    image: "/images/home-categories/waterproofing-repairing.webp",
    dbCategory: "adhesives",
    route: "/categories?cat=waterproofing-repairing",
    badge: "Site Tested",
    subcategories: [
      { name: "Integral Liquid Waterproofing", slug: "integral-waterproofing", itemCount: 12 },
      { name: "Polymer Bonding Agents (URP)", slug: "bonding-agents", itemCount: 14 },
      { name: "Elastomeric Terrace Coatings", slug: "terrace-coatings", itemCount: 10 },
      { name: "Crack Sealants & Putty", slug: "crack-sealants", itemCount: 16 },
      { name: "Damp-Proof Surface Barriers", slug: "damp-proof-barriers", itemCount: 8 },
    ],
  },
  {
    id: 19,
    slug: "bricks-sand-gitti-aac",
    title: "Bricks, Sand (Morang), Gitti & AAC Blocks",
    department: "Civil & Structural",
    image: "/images/home-categories/eeta.webp",
    dbCategory: "bricks",
    route: "/collections/bricks-sand-gitti-aac",
    badge: "Bhatta & Crusher Direct",
    subcategories: [
      { name: "Red Clay & Fly Ash Bricks", slug: "red-clay-fly-ash-bricks", itemCount: 6 },
      { name: "AAC & Concrete Blocks", slug: "aac-concrete-blocks", itemCount: 15 },
      { name: "Sand, Morang & Stone Dust", slug: "sand-morang-stone-dust", itemCount: 7 },
      { name: "Stone Aggregates (Gitti)", slug: "stone-aggregates-gitti", itemCount: 6 },
      { name: "Paver Blocks & Concrete Cover Blocks", slug: "paver-blocks-cover-blocks", itemCount: 3 },
    ],
  },
];
