export type TurnkeyMode = "RESIDENTIAL" | "COMMERCIAL";

export interface TurnkeyTierSpec {
  id: "grey" | "silver" | "gold" | "platinum" | "luxury";
  name: string;
  tagline: string;
  ratePerSqFt: number;
  commercialRatePerSqFt: number;
  popular?: boolean;
  accentHex: string;
  warrantyLabel: string;
  highlights: string[];
  commercialHighlights: string[];
}

export const DEFAULT_TURNKEY_TIERS: TurnkeyTierSpec[] = [
  {
    id: "grey",
    name: "Grey Structure",
    tagline: "Core & Shell",
    ratePerSqFt: 1190,
    commercialRatePerSqFt: 1120,
    accentHex: "#475569",
    warrantyLabel: "5-Yr Structural Warranty",
    highlights: [
      "UltraTech / ACC Cement + Kamdhenu / Rathi Fe-550D TMT",
      "Banda Morang + Kabrai 20mm Gitti + Awal Bhatta Bricks / AAC",
      "RCC Frame + DPC + Inner/Outer Plaster + Concealed Conduits",
      "5-Yr Structural Warranty",
    ],
    commercialHighlights: [
      "Heavy-Load RCC Columns & PEB / Commercial Slab Design",
      "UltraTech OPC 53 + Fe-550D TMT + Kabrai 20mm Aggregate",
      "Concealed 3-Phase Electrical & High-Discharge SWR Plumbing",
      "5-Yr Structural Warranty",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    tagline: "Smart Basic",
    ratePerSqFt: 1650,
    commercialRatePerSqFt: 1550,
    accentHex: "#64748b",
    warrantyLabel: "3-Yr Structural + 1-Yr Finishing",
    highlights: [
      "UltraTech PPC + Kamdhenu Fe-550D + Astral CPVC/SWR",
      "Polycab FR Wires + Kajaria/Somany Tiles (up to ₹55/sqft)",
      "Cera Sanitary + Asian Tractor Emulsion + 2D Vastu Plan",
      "3-Yr Structural + 1-Yr Finishing Warranty",
    ],
    commercialHighlights: [
      "Commercial Showroom / Office Standard Finishes",
      "Polycab FR 3-Phase Wiring + Kajaria Heavy-Duty Tiles (₹60/sqft)",
      "Cera Commercial Sanitary + Asian Tractor Emulsion",
      "3-Yr Structural + 1-Yr Finishing Warranty",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    tagline: "Lucknow Most Popular ★",
    ratePerSqFt: 2100,
    commercialRatePerSqFt: 1980,
    popular: true,
    accentHex: "#f59e0b",
    warrantyLabel: "5-Yr Structural Warranty",
    highlights: [
      "UltraTech / Birla Perfect Plus + Tata Tiscon / JSPL Fe-550D",
      "Astral CPVC/SWR + Polycab FRLS Wires + Kajaria Vitrified (₹85/sqft)",
      "Jaquar Fittings + Asian Apcolite & Weathercoat Exterior",
      "2D + 3D Elevation + LDA / Ansal Map Submission Support",
    ],
    commercialHighlights: [
      "Tata Tiscon / JSPL Fe-550D + Jaquar Commercial Fittings",
      "Large-Format Commercial Vitrified (₹85/sqft) + Toughened Glazing",
      "3D Commercial Elevation + Fire/LDA Approval Drawings",
      "5-Yr Structural Warranty",
    ],
  },
  {
    id: "platinum",
    name: "Platinum",
    tagline: "Architect Edition",
    ratePerSqFt: 2750,
    commercialRatePerSqFt: 2580,
    accentHex: "#1848a0",
    warrantyLabel: "7-Yr Structural Warranty",
    highlights: [
      "RMC M25 Plant Concrete + Tata Tiscon SD + Finolex/Polycab FRLS",
      "Kohler / Grohe / Jaquar Artize + Large-Format Tiles (₹140/sqft)",
      "Modular Kitchen + Wardrobes + Asian Royale Luxury",
      "Dedicated Site Civil Engineer + 3D Walkthrough + 7-Yr Warranty",
    ],
    commercialHighlights: [
      "RMC M25/M30 Plant Concrete + PEB/Long-Span Banquet & Mall Option",
      "Kohler / Grohe Restrooms + ACP Cladding & Double-Glazed Facade",
      "Dedicated Civil Engineer + 3D Walkthrough + 7-Yr Warranty",
      "Fire NOC & Lift Shaft Provision Included",
    ],
  },
  {
    id: "luxury",
    name: "Luxury Mansion",
    tagline: "Bespoke Signature",
    ratePerSqFt: 3600,
    commercialRatePerSqFt: 3350,
    accentHex: "#7c3aed",
    warrantyLabel: "10-Yr Structural Warranty",
    highlights: [
      "Custom Bespoke Architecture + Smart Home Automation + Lift Provision",
      "Double-Glazed uPVC/Toughened Glass + Imported Marble/Granite",
      "Teak Main Door + VRV/AC Copper Piping + Designer Landscapes",
      "10-Yr Structural Warranty",
    ],
    commercialHighlights: [
      "Flagship Corporate HQ / Boutique Hotel / Luxury Banquet Spec",
      "Smart BMS + Lift Shaft + VRV HVAC Piping + Italian Marble Lobby",
      "Acoustic Partitioning + Full Turnkey MEP Engineering",
      "10-Yr Structural Warranty",
    ],
  },
];

export interface BrandMatrixRow {
  category: string;
  grey: string;
  silver: string;
  gold: string;
  platinum: string;
  luxury: string;
}

export const BRAND_MATRIX_ROWS: BrandMatrixRow[] = [
  {
    category: "1. Cement & RMC",
    grey: "UltraTech / ACC OPC & PPC",
    silver: "UltraTech PPC",
    gold: "UltraTech / Birla Perfect Plus",
    platinum: "RMC M25 Plant Direct Concrete",
    luxury: "RMC M25/M30 + Waterproof Admix",
  },
  {
    category: "2. TMT Sariya Steel",
    grey: "Kamdhenu / Rathi Fe-550D",
    silver: "Kamdhenu Fe-550D",
    gold: "Tata Tiscon / JSPL Fe-550D",
    platinum: "Tata Tiscon SD",
    luxury: "Tata Tiscon SD / SAIL SeQR",
  },
  {
    category: "3. Sand & Aggregates",
    grey: "Banda Morang + Kabrai 20mm Gitti",
    silver: "Washed Banda Morang + Kabrai Gitti",
    gold: "Graded Banda Morang + Kabrai 20mm",
    platinum: "Lab-Tested River Morang + Kabrai",
    luxury: "Triple-Washed Morang + Graded Gitti",
  },
  {
    category: "4. Bricks / AAC Blocks",
    grey: "Awal Bhatta Red Bricks / AAC",
    silver: "Awal Red Bricks / Magicrete AAC",
    gold: "First-Class Awal / Birla Aerocon AAC",
    platinum: "Birla Aerocon AAC + Polymer Mortar",
    luxury: "Thermal-Insulated AAC + Acoustic",
  },
  {
    category: "5. Plumbing (CPVC/SWR)",
    grey: "Concealed Sleeves Only",
    silver: "Astral CPVC / SWR",
    gold: "Astral CPVC Pro + Silencio SWR",
    platinum: "Astral / Ashirvad + Pressure Tested",
    luxury: "Astral Acoustic + Concealed Cisterns",
  },
  {
    category: "6. Electrical & Wires",
    grey: "Concealed PVC Conduits Only",
    silver: "Polycab FR Wires + Anchor Switches",
    gold: "Polycab FRLS + Legrand / Havells MCB",
    platinum: "Finolex / Polycab FRLS + Schneider",
    luxury: "FRLS + Smart Home Automation + VRV",
  },
  {
    category: "7. Flooring & Wall Tiles",
    grey: "IPS / Screed Finish",
    silver: "Kajaria / Somany (up to ₹55/sqft)",
    gold: "Kajaria Vitrified (up to ₹85/sqft)",
    platinum: "Large-Format Slab Tiles (₹140/sqft)",
    luxury: "Imported Italian Marble & Granite",
  },
  {
    category: "8. Sanitary & Kitchen",
    grey: "Inlet / Outlet Points Only",
    silver: "Cera Sanitary + SS Sink",
    gold: "Jaquar Fittings + Quartz Sink",
    platinum: "Kohler / Grohe + Modular Kitchen",
    luxury: "Jaquar Artize / Kohler + Full Island",
  },
  {
    category: "9. Doors, Windows & Grill",
    grey: "Chaukhat Frames Only",
    silver: "Flush Doors + Aluminium Sliding",
    gold: "WPC/Teak Veneer + uPVC Windows",
    platinum: "Teak Frame + Fenesta/Encraft uPVC",
    luxury: "Solid Burma Teak + Double-Glazed uPVC",
  },
  {
    category: "10. Paints & Waterproofing",
    grey: "Inner/Outer Plaster + DPC",
    silver: "Birla Putty + Asian Tractor Emulsion",
    gold: "Dr. Fixit + Asian Apcolite & Weathercoat",
    platinum: "Dr. Fixit Roofseal + Asian Royale",
    luxury: "Royale Aspira + Exterior Texture Shield",
  },
  {
    category: "11. Approvals & Warranty",
    grey: "Site Layout • 5-Yr Structural",
    silver: "2D Vastu Plan • 3-Yr Struct / 1-Yr Fin",
    gold: "2D+3D + LDA/Ansal Support • 5-Yr",
    platinum: "Dedicated Civil Eng + 3D Video • 7-Yr",
    luxury: "Bespoke Architect + Lift • 10-Yr",
  },
];

export const LUCKNOW_PLOT_PRESETS = [
  { label: "1,000 sq.ft (20×50)", sqft: 1000 },
  { label: "1,250 sq.ft (25×50)", sqft: 1250 },
  { label: "1,500 sq.ft (30×50)", sqft: 1500 },
  { label: "2,152 sq.ft (200m² LDA)", sqft: 2152 },
  { label: "3,229 sq.ft (300m² LDA)", sqft: 3229 },
];

export const TEN_STAGE_ESCROW_SCHEDULE = [
  { stage: 1, title: "Design, Vastu & LDA Map", pct: 5 },
  { stage: 2, title: "Excavation & Foundation", pct: 12 },
  { stage: 3, title: "Plinth & Anti-Termite", pct: 10 },
  { stage: 4, title: "Ground Floor Columns & Slab", pct: 15 },
  { stage: 5, title: "Upper Floor RCC", pct: 15 },
  { stage: 6, title: "Brickwork & Plumbing/Electrical Chasing", pct: 12 },
  { stage: 7, title: "Plaster & Waterproofing", pct: 10 },
  { stage: 8, title: "Flooring, Tiles & Granite", pct: 10 },
  { stage: 9, title: "Paint, Doors & Fixtures", pct: 6 },
  { stage: 10, title: "450-Point Civil Audit & Key Handover", pct: 5 },
];

export interface TurnkeyConsultationLead {
  id: string;
  name: string;
  phone: string;
  locationPincode: string;
  plotSqFt: number;
  packageName: string;
  visitType: "ON_SITE_ENGINEER" | "HQ_OFFICE_MEET";
  preferredSlot: string;
  status: "NEW" | "SITE_VISITED" | "BOQ_SENT" | "SIGNED";
  createdAt: string;
}
