export type KitStageFilter =
  | "ALL"
  | "EMERGENCY"
  | "ELECTRICAL"
  | "PAINT"
  | "PLUMBING"
  | "SOLAR";

export type KitVisualType = "blade" | "wheel" | "drill-bit" | "tape" | "wire" | "conduit" | "roller" | "brush" | "pipe" | "faucet" | "solar-box" | "cable";

export interface SiteKitItem {
  id: string;
  name: string;
  brand: string;
  spec: string;
  unit: string;
  qty: number;
  price: number;
  mrp: number;
  category: string;
  visualType: KitVisualType;
}

export interface SiteKitBundle {
  id: string;
  title: string;
  stage: Exclude<KitStageFilter, "ALL">;
  stageLabel: string;
  previewSummary: string;
  kitPrice: number;
  mrp: number;
  discountPct: number;
  deliveryEta: string;
  categoryTag: string;
  items: SiteKitItem[];
}

export const KIT_STAGE_FILTERS: { id: KitStageFilter; label: string }[] = [
  { id: "ALL", label: "All Kits" },
  { id: "EMERGENCY", label: "⚡ 60-Min Emergency" },
  { id: "ELECTRICAL", label: "🔌 Electrical & Lighting" },
  { id: "PAINT", label: "🎨 Paint & Finish" },
  { id: "PLUMBING", label: "🚿 Plumbing Rescue" },
  { id: "SOLAR", label: "☀️ Solar BOS" },
];

export const LUCKNOW_SITE_KITS: SiteKitBundle[] = [
  {
    id: "kit-mistri-emergency",
    title: "Mistri Site Emergency Kit",
    stage: "EMERGENCY",
    stageLabel: "⚡ 60-Min Emergency",
    previewSummary: '4" Diamond Blade • 10 Metal Cutting Wheels • 6/8/10mm SDS Bits • Steelgrip Tape',
    kitPrice: 899,
    mrp: 1180,
    discountPct: 24,
    deliveryEta: "60 Mins",
    categoryTag: "tools",
    items: [
      {
        id: "kit-item-diamond-blade",
        name: 'Bosch 4" Continuous Diamond Blade (110mm)',
        brand: "Bosch",
        spec: "Tile & Granite wet/dry cut",
        unit: "pc",
        qty: 1,
        price: 265,
        mrp: 350,
        category: "tools",
        visualType: "blade",
      },
      {
        id: "kit-item-norton-wheels",
        name: 'Norton 4" Metal Cutting Wheel (Pack of 10)',
        brand: "Norton",
        spec: "105x1.0mm SS/MS bar chop",
        unit: "pack",
        qty: 1,
        price: 299,
        mrp: 390,
        category: "tools",
        visualType: "wheel",
      },
      {
        id: "kit-item-sds-bits",
        name: "Bosch SDS-Plus 6/8/10mm Concrete Bit Set",
        brand: "Bosch",
        spec: "Carbide tip • 3-pc masonry pack",
        unit: "set",
        qty: 1,
        price: 280,
        mrp: 365,
        category: "tools",
        visualType: "drill-bit",
      },
      {
        id: "kit-item-steelgrip",
        name: "Pidilite Steelgrip PVC Insulation Tape (Pack of 2)",
        brand: "Steelgrip",
        spec: "Flame retardant 18mm × 7m",
        unit: "pack",
        qty: 1,
        price: 55,
        mrp: 75,
        category: "electrical",
        visualType: "tape",
      },
    ],
  },
  {
    id: "kit-room-rewiring",
    title: "1-Room Rewiring Essentials",
    stage: "ELECTRICAL",
    stageLabel: "🔌 Electrical & Lighting",
    previewSummary: "1.5 sq.mm FR Coil • 20mm HMS PVC Conduits • 18G GI Modular Boxes • Insulation Tapes",
    kitPrice: 2499,
    mrp: 3120,
    discountPct: 20,
    deliveryEta: "60 Mins",
    categoryTag: "electrical",
    items: [
      {
        id: "kit-item-polycab-wire",
        name: "Polycab Maxima+ 1.5 sq.mm FR-LSH Copper Coil (90m)",
        brand: "Polycab",
        spec: "ISI IS 694 • 99.97% pure Cu",
        unit: "coil",
        qty: 1,
        price: 1620,
        mrp: 2040,
        category: "electrical",
        visualType: "wire",
      },
      {
        id: "kit-item-hms-conduit",
        name: "AKG 20mm HMS Heavy PVC Conduit Pipe (Pack of 5)",
        brand: "AKG",
        spec: "3m each • Impact resistant wall chase",
        unit: "bundle",
        qty: 1,
        price: 410,
        mrp: 510,
        category: "electrical",
        visualType: "conduit",
      },
      {
        id: "kit-item-gi-boxes",
        name: "18-Gauge GI Modular Concealed Boxes (Set of 4)",
        brand: "Conon Pro",
        spec: "12M / 6M / 3M heavy galvanized",
        unit: "set",
        qty: 1,
        price: 389,
        mrp: 470,
        category: "electrical",
        visualType: "solar-box",
      },
      {
        id: "kit-item-tapes-elec",
        name: "FR PVC Insulation Tapes (Pack of 4 Assorted)",
        brand: "Steelgrip",
        spec: "Red, Yellow, Blue, Black phase coding",
        unit: "pack",
        qty: 1,
        price: 80,
        mrp: 100,
        category: "electrical",
        visualType: "tape",
      },
    ],
  },
  {
    id: "kit-room-repaint",
    title: "1-Room Quick Repaint Kit",
    stage: "PAINT",
    stageLabel: "🎨 Paint & Finish",
    previewSummary: '9" Paint Roller + Tray • 2" Brush • Masking Tape • Emery Sheets • Plastic Drop Sheet',
    kitPrice: 1649,
    mrp: 2010,
    discountPct: 18,
    deliveryEta: "60 Mins",
    categoryTag: "paint",
    items: [
      {
        id: "kit-item-roller-tray",
        name: 'Asian Paints TruCare 9" Microfiber Roller + Tray',
        brand: "Asian Paints",
        spec: "Lint-free smooth emulsion finish",
        unit: "set",
        qty: 1,
        price: 540,
        mrp: 670,
        category: "paint",
        visualType: "roller",
      },
      {
        id: "kit-item-cutting-brush",
        name: '2" & 4" Pro Bristle Painting Brush Combo',
        brand: "Asian Paints",
        spec: "Corner cutting & border precision",
        unit: "combo",
        qty: 1,
        price: 349,
        mrp: 430,
        category: "paint",
        visualType: "brush",
      },
      {
        id: "kit-item-masking-emery",
        name: "ABRO 24mm Masking Tape (x2) + 8-pc Emery Paper",
        brand: "ABRO",
        spec: "180 & 320 grit wall sanding sheets",
        unit: "pack",
        qty: 1,
        price: 420,
        mrp: 500,
        category: "paint",
        visualType: "tape",
      },
      {
        id: "kit-item-drop-sheet",
        name: "Heavy-Duty Poly Floor Drop Sheet (12×9 ft, Pack of 2)",
        brand: "Conon Shield",
        spec: "Protects tiles & furniture from splashes",
        unit: "pack",
        qty: 1,
        price: 340,
        mrp: 410,
        category: "paint",
        visualType: "cable",
      },
    ],
  },
  {
    id: "kit-bathroom-leakage",
    title: "Bathroom Fitting & Leakage Rescue",
    stage: "PLUMBING",
    stageLabel: "🚿 Plumbing Rescue",
    previewSummary: "CPVC Solvent • Teflon Pack • Brass Angle Cock • Health Faucet • Anti-Fungal Silicone",
    kitPrice: 1299,
    mrp: 1665,
    discountPct: 22,
    deliveryEta: "60 Mins",
    categoryTag: "plumbing",
    items: [
      {
        id: "kit-item-cpvc-solvent",
        name: "Astral / Ashirvad Heavy-Duty CPVC Solvent (118ml)",
        brand: "Astral",
        spec: "ASTM D2846 hot/cold fast cure",
        unit: "tin",
        qty: 1,
        price: 215,
        mrp: 270,
        category: "plumbing",
        visualType: "pipe",
      },
      {
        id: "kit-item-teflon-pack",
        name: "PTFE High-Density Teflon Tape (Pack of 5 Rolls)",
        brand: "Jaquar Pro",
        spec: "Zero-drip thread sealing",
        unit: "pack",
        qty: 1,
        price: 110,
        mrp: 150,
        category: "plumbing",
        visualType: "tape",
      },
      {
        id: "kit-item-angle-cock-faucet",
        name: "Brass Quarter-Turn Angle Cock + SS Health Faucet",
        brand: "Hindware / Cera",
        spec: "1.2m braided SS hose + wall hook",
        unit: "combo",
        qty: 1,
        price: 724,
        mrp: 925,
        category: "plumbing",
        visualType: "faucet",
      },
      {
        id: "kit-item-silicone-antifungal",
        name: "Dr. Fixit Anti-Fungal Bath Silicone Cartridge (280ml)",
        brand: "Dr. Fixit",
        spec: "Mold-proof basin & WC joint seal",
        unit: "cartridge",
        qty: 1,
        price: 250,
        mrp: 320,
        category: "adhesives",
        visualType: "pipe",
      },
    ],
  },
  {
    id: "kit-solar-3kw-bos",
    title: "3kW Solar BOS Rescue Pack",
    stage: "SOLAR",
    stageLabel: "☀️ Solar BOS",
    previewSummary: "1-Phase ACDB/DCDB Combo • 4 sq.mm Red/Black DC Cable • IP68 MC4 Pairs • Earthing Backfill",
    kitPrice: 4950,
    mrp: 6110,
    discountPct: 19,
    deliveryEta: "60 Mins",
    categoryTag: "solar-rooftop-power",
    items: [
      {
        id: "kit-item-acdb-dcdb",
        name: "Havells IP65 1-Phase ACDB + 1-in-1-out DCDB (With SPD)",
        brand: "Havells",
        spec: "1000V DC SPD + MCB + Type-2 AC Surge",
        unit: "combo",
        qty: 1,
        price: 2650,
        mrp: 3250,
        category: "solar-rooftop-power",
        visualType: "solar-box",
      },
      {
        id: "kit-item-dc-cable",
        name: "Polycab 4 sq.mm UV Solar DC Cable (20m Red + 20m Black)",
        brand: "Polycab",
        spec: "EN 50618 TUV certified tinned copper",
        unit: "pair",
        qty: 1,
        price: 1580,
        mrp: 1960,
        category: "solar-rooftop-power",
        visualType: "cable",
      },
      {
        id: "kit-item-mc4-pairs",
        name: "IP68 MC4 Connectors (Pack of 4 Pairs + Spanner)",
        brand: "Luminous",
        spec: "30A 1500V DC crimp waterproof latch",
        unit: "pack",
        qty: 1,
        price: 290,
        mrp: 380,
        category: "solar-rooftop-power",
        visualType: "wire",
      },
      {
        id: "kit-item-earthing-backfill",
        name: "Chemical Earthing Compound Bag (15 kg High-Conductive)",
        brand: "Ashlok Pro",
        spec: "Low soil resistance • MVVNL net-meter compliant",
        unit: "bag",
        qty: 1,
        price: 430,
        mrp: 520,
        category: "solar-rooftop-power",
        visualType: "solar-box",
      },
    ],
  },
];
