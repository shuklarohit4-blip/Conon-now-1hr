import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const outputPath = path.join(rootDir, "artifacts/conon/src/data/kitchenSinksData.ts");

export interface KitchenSinkProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subCategory: string;
  kitchenSubcategory: "SS_PRESSED_SINK" | "HANDMADE_SS_SINK" | "QUARTZ_SINK" | "SINK_COCK" | "SINK_MIXER_PULLOUT" | "SINK_ACCESSORY";
  materialGrade: string;
  sinkConstruction: string;
  overallDimensionsInch: string | null;
  minCabinetWidthMm: number | null;
  mountType: "WALL_MOUNTED" | "TABLE_DECK_MOUNTED" | null;
  waterSupplyType: "COLD_ONLY" | "HOT_AND_COLD" | null;
  finishColor: string;
  oemModelCode: string;
  sellingUnit: string;
  unit: string;
  price: number;
  exGstPrice: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  hsnCode: string;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "E-Loader / Pickup";
  brandTier: 1 | 2 | 3;
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

// Complete 38-Product Raw Master Dataset
const RAW_PRODUCTS = [
  // 4.1 SS Pressed Sinks (9 SKUs | HSN 7324)
  {
    id: "prod-sink-nirali-grace-plain-21x18",
    slug: "nirali-bg-grace-plain-single-bowl-ss-304-21x18",
    name: "Nirali BG Grace Plain Single Bowl SS 304 Kitchen Sink (21×18 in)",
    title: "Nirali — BG Grace Plain Single Bowl SS 304 Sink 21×18 in",
    brand: "Nirali",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "SS Pressed Sinks",
    kitchenSubcategory: "SS_PRESSED_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: "21x18 in",
    minCabinetWidthMm: 600,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Satin",
    oemModelCode: "BG Grace Plain 21x18",
    price: 3990,
    mrp: 4690,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Compact 21x18\" Single Bowl · AISI 304 Grade · 600mm Base Fit",
    specChips: ["AISI 304 Steel", "Min Cabinet 600mm", "Deep 8\" Bowl", "Sound-Deadening Pad"],
    description: "Nirali BG Grace Plain single bowl kitchen sink is hydraulic pressed from authentic 304-grade food-grade stainless steel. Engineered for compact kitchens requiring a 600mm base cabinet.",
    highlights: [
      "Authentic AISI 304 (18/8 Chrome-Nickel) surgical-grade stainless steel",
      "Overall size 21x18 in (533x457mm) with generous 8-inch deep bowl",
      "Perfect fit for 600mm (2ft) standard modular base cabinets",
      "Thick bottom sound-deadening rubber pads to minimize dishwashing noise",
      "Anti-condensation undercoating prevents under-sink cabinet moisture & fungal growth"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-fauc-jaquar-florentine-wall-5347pm"]
  },
  {
    id: "prod-sink-nirali-orra-straight-satin-24x18",
    slug: "nirali-bg-orra-rectangular-straight-ss-304-24x18-satin",
    name: "Nirali BG Orra Rectangular Straight SS 304 Sink 24×18 in (Satin)",
    title: "Nirali — BG Orra Rectangular Straight SS 304 Sink 24×18 in (Satin)",
    brand: "Nirali",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "SS Pressed Sinks",
    kitchenSubcategory: "SS_PRESSED_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: "24x18 in",
    minCabinetWidthMm: 700,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Satin",
    oemModelCode: "BG Orra Straight Satin 24x18",
    price: 4735,
    mrp: 5580,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Popular 24x18\" Straight Bowl · Satin Finish · 700mm Base Fit",
    specChips: ["24x18 Inch Size", "Satin Matt", "Min Cabinet 700mm", "AISI 304 Grade"],
    description: "Nirali BG Orra Rectangular Straight is India's most popular modular kitchen sink dimension (24x18 inches). Features clean straight geometric bowl lines and scratch-resistant satin texture.",
    highlights: [
      "Standard 24x18 in (610x457mm) size fitting all standard 700mm modular cabinets",
      "Laser-straight bowl corners maximize internal usable volume for large Indian utensils",
      "Pressed from 1.0mm heavy gauge SS 304 for maximum dent resistance",
      "Anti-scratch fine satin hairline brush finish hides micro-abrasions",
      "Full rubber pad undercoating for whisper-quiet water impact"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-acc-fossa-soap-dispenser-300ml"]
  },
  {
    id: "prod-sink-nirali-orra-straight-glossy-24x18",
    slug: "nirali-bg-orra-rectangular-straight-ss-304-24x18-glossy",
    name: "Nirali BG Orra Rectangular Straight SS 304 Sink 24×18×8.5 in (Glossy)",
    title: "Nirali — BG Orra Rectangular Straight SS 304 Sink 24×18×8.5 in (Glossy)",
    brand: "Nirali",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "SS Pressed Sinks",
    kitchenSubcategory: "SS_PRESSED_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: "24x18 in",
    minCabinetWidthMm: 700,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Glossy",
    oemModelCode: "BG Orra Straight Glossy 24x18x8.5",
    price: 6443,
    mrp: 7590,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Mirror Glossy Finish · Extra Deep 8.5\" Bowl · 700mm Base Fit",
    specChips: ["Mirror Glossy", "8.5\" Deep Bowl", "Min Cabinet 700mm", "SS 304 Surgical"],
    description: "Nirali BG Orra Glossy model features an ultra-buffed mirror finish that repels food grime and provides an extra deep 8.5-inch bowl depth for washing heavy kadhais and cookers.",
    highlights: [
      "Ultra-reflective high-mirror glossy polish that stays spotless with minimal cleaning",
      "Extra deep 8.5\" (216mm) bowl depth prevents splash-out during high pressure washing",
      "Fits standard 700mm base cabinets with smooth top-mount drop-in installation",
      "Precision-molded drain slope ensures zero stagnant water pooling",
      "Backed by Nirali's authentic manufacturer warranty"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-fauc-jaquar-florentine-wall-5347pm"]
  },
  {
    id: "prod-sink-parryware-eco-single-bowl-24x18",
    slug: "parryware-eco-single-bowl-flat-edge-ss-304-sink",
    name: "Parryware Eco Single Bowl Flat Edge SS 304 Kitchen Sink",
    title: "Parryware — Eco Single Bowl Flat Edge SS 304 Sink 24×18 in",
    brand: "Parryware",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "SS Pressed Sinks",
    kitchenSubcategory: "SS_PRESSED_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: "24x18 in",
    minCabinetWidthMm: 700,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Satin",
    oemModelCode: "Parryware Eco Flat Edge",
    price: 5522,
    mrp: 6500,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Flat Edge Profile · Top/Flush Mount · 700mm Base Cabinet",
    specChips: ["Flat Edge Lip", "Top/Flush Mount", "Min Cabinet 700mm", "Parryware Assured"],
    description: "Parryware Eco single bowl sink features a precision laser-flattened outer rim that enables near flush countertop integration on granite or quartz slabs.",
    highlights: [
      "Laser-flattened rim allows seamless flush or clean drop-in installation",
      "Manufactured from heavy gauge 304-grade stainless steel with anti-rust guarantee",
      "Generous 24x18 inch footprint accommodates standard 700mm kitchen modular carcass",
      "Factory fitted with sound-dampening insulation pads and undercoating",
      "Corrosion-proof in hard groundwater areas of Lucknow"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-fauc-parryware-claret-wall-cock"]
  },
  {
    id: "prod-sink-carysil-elegance-esm-24x18",
    slug: "carysil-elegance-esm-single-bowl-ss-304-24x18x8-matt",
    name: "Carysil Elegance ESM Single Bowl SS 304 Sink 24×18×8 in (Matt)",
    title: "Carysil — Elegance ESM Single Bowl SS 304 Sink 24×18×8 in (Matt)",
    brand: "Carysil",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "SS Pressed Sinks",
    kitchenSubcategory: "SS_PRESSED_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: "24x18 in",
    minCabinetWidthMm: 700,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Matt",
    oemModelCode: "Carysil Elegance ESM Matt",
    price: 6800,
    mrp: 8000,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "German-Design Matt SS 304 · Premium Hydraulic Press · 700mm Base",
    specChips: ["German Design", "Matt Finish", "Min Cabinet 700mm", "SS 304 Food-Grade"],
    description: "Carysil Elegance ESM brings German precision pressing to stainless steel sinks. Features a velvety micro-matt finish that eliminates water spot reflections.",
    highlights: [
      "Precision German tooling produces ultra-consistent 1mm uniform wall thickness",
      "Micro-matt bead-blasted surface finish resists oil and hard-water staining",
      "24x18x8 inch dimensions optimized for 700mm modular cabinets",
      "Includes sound absorbing pads and condensation protection layer",
      "100% recyclable, lead-free food-safe material"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-acc-backline-ro-faucet-304"]
  },
  {
    id: "prod-sink-parryware-new-coral-drainboard-34x20",
    slug: "parryware-new-coral-single-bowl-drainboard-ss-304",
    name: "Parryware New Coral Single Bowl with Drainboard SS 304 Sink",
    title: "Parryware — New Coral Single Bowl with Drainboard SS 304 34×20 in",
    brand: "Parryware",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "SS Pressed Sinks",
    kitchenSubcategory: "SS_PRESSED_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: "34x20 in",
    minCabinetWidthMm: 900,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Satin",
    oemModelCode: "New Coral Drainboard 34x20",
    price: 8708,
    mrp: 10250,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Integrated Sloped Drainboard · Reversible Setup · 900mm Base Fit",
    specChips: ["With Drainboard", "34x20 Inch", "Min Cabinet 900mm", "Sloped Drainage"],
    description: "Parryware New Coral features an integrated grooved stainless drainboard for drying washed dishes directly into the sink bowl. Requires 900mm base cabinet.",
    highlights: [
      "34x20 in (864x508mm) overall size with integrated sloped drying drainboard",
      "Grooved drainage channels guide excess water back into bowl without pooling",
      "Reversible design allows left-hand or right-hand drainboard orientation",
      "Requires 900mm (3ft) modular sink cabinet",
      "Crafted from premium AISI 304 steel for lifetime rust protection"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-fauc-parryware-claret-wall-cock"]
  },
  {
    id: "prod-sink-carysil-vogue-drainboard-36x20",
    slug: "carysil-vogue-single-bowl-drainboard-ss-304-36x20x8-matt",
    name: "Carysil Vogue Single Bowl with Drainboard SS 304 Sink 36×20×8 in (Matt)",
    title: "Carysil — Vogue Single Bowl with Drainboard SS 304 36×20×8 in (Matt)",
    brand: "Carysil",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "SS Pressed Sinks",
    kitchenSubcategory: "SS_PRESSED_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: "36x20 in",
    minCabinetWidthMm: 1000,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Matt",
    oemModelCode: "Carysil Vogue Drainboard Matt",
    price: 10150,
    mrp: 11950,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Full-Sized 36x20\" Drainboard Sink · Architectural Matt · 1000mm Base",
    specChips: ["36x20 Large Sink", "Architectural Matt", "Min Cabinet 1000mm", "Drainboard Included"],
    description: "Carysil Vogue is a full-sized 36x20 inch stainless sink featuring an expansive prep and drying wing, engineered for upscale kitchens with 1000mm cabinet spacing.",
    highlights: [
      "Expansive 36x20 in (915x508mm) surface with heavy-gauge 304 steel construction",
      "Requires minimum 1000mm base cabinet carcass",
      "Velvet matt finish resists hard water deposits prevalent in Gomti Nagar & Chinhat",
      "Includes sound dampening underpads across both bowl and drainboard areas",
      "Precision flat rim for clean silicone bead waterproofing on granite tops"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-acc-fossa-soap-dispenser-300ml"]
  },
  {
    id: "prod-sink-futura-dura-double-bowl-37x18",
    slug: "futura-dura-double-bowl-ss-304-37x18x8-satin",
    name: "Futura Dura Double Bowl SS 304 Sink 37×18×8 in (Satin)",
    title: "Futura — Dura Double Bowl SS 304 Sink 37×18×8 in (Satin)",
    brand: "Futura",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "SS Pressed Sinks",
    kitchenSubcategory: "SS_PRESSED_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: "37x18 in",
    minCabinetWidthMm: 1000,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Satin",
    oemModelCode: "Futura Dura DB 37x18",
    price: 10360,
    mrp: 12200,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Twin Equal Bowls · Multi-Task Washing · 1000mm Base Cabinet",
    specChips: ["Double Bowl", "37x18 Inch", "Min Cabinet 1000mm", "Requires 2 Couplings"],
    description: "Futura Dura double bowl sink allows simultaneous soaking and rinsing. Two full-sized equal compartments pressed from 1.0mm 304-grade stainless steel.",
    highlights: [
      "Twin equal compartments enable hygienic multi-tasking (washing vs sanitizing/rinsing)",
      "Overall dimensions: 37x18 in (940x457mm); requires 1000mm base cabinet",
      "Standard 3.5\" drain holes in both bowls (requires 2 waste couplings)",
      "Anti-vibration sound muffling pads on both bowl undersides",
      "Satin brush finish hides micro-scratches from stainless steel cutlery"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-fauc-jaquar-florentine-wall-5347pm"]
  },
  {
    id: "prod-sink-nirali-popular-master-double-bowl-37x18",
    slug: "nirali-bg-popular-master-double-bowl-ss-304-37x18-glossy",
    name: "Nirali BG Popular Master Double Bowl SS 304 Sink 37×18 in (Glossy)",
    title: "Nirali — BG Popular Master Double Bowl SS 304 Sink 37×18 in (Glossy)",
    brand: "Nirali",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "SS Pressed Sinks",
    kitchenSubcategory: "SS_PRESSED_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: "37x18 in",
    minCabinetWidthMm: 1000,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Glossy",
    oemModelCode: "BG Popular Master DB Glossy",
    price: 13410,
    mrp: 15800,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Flagship Nirali Double Bowl · Mirror Glossy · 1000mm Base Fit",
    specChips: ["Nirali Flagship", "Mirror Glossy", "Min Cabinet 1000mm", "Double Bowl"],
    description: "Nirali BG Popular Master is the benchmark double bowl stainless sink across Lucknow's master bungalows and villas. High-gloss mirror polish with heavy-duty construction.",
    highlights: [
      "Twin spacious bowls pressed from high-nickel 304 stainless steel",
      "High-luster mirror finish brightens kitchen countertops and cleans effortlessly",
      "37x18 in footprint requires 1000mm modular carcass",
      "Dual waste outlets compatible with food waste disposers or standard 3.5\" couplings",
      "Reinforced center divider bridge prevents flexing during heavy pot movement"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-mix-jaquar-florentine-wall-black-5166pm"]
  },

  // 4.2 Handmade Heavy-Gauge SS Sinks (6 SKUs | HSN 7324)
  {
    id: "prod-sink-nirali-evan-bg-handmade-21x18",
    slug: "nirali-evan-bg-handmade-single-bowl-ss-304-21x18",
    name: "Nirali Evan BG Handmade Single Bowl SS 304 21×18 in",
    title: "Nirali — Evan BG Handmade Single Bowl SS 304 21×18 in",
    brand: "Nirali",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Handmade SS Sinks",
    kitchenSubcategory: "HANDMADE_SS_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "HANDMADE_FABRICATED",
    overallDimensionsInch: "21x18 in",
    minCabinetWidthMm: 600,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Matt",
    oemModelCode: "Evan BG Handmade 21x18",
    price: 7290,
    mrp: 8590,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "1.2mm Heavy-Gauge Handmade · R10 Tight Radius · 600mm Base",
    specChips: ["1.2mm Heavy Gauge", "R10 Tight Radius", "Min Cabinet 600mm", "Handmade Fabricated"],
    description: "Nirali Evan BG Handmade sink is individually fabricated from 1.2mm thick surgical SS 304 plates with precision-welded R10 tight radius corners that combine contemporary square aesthetics with effortless cleaning.",
    highlights: [
      "1.2mm heavy gauge surgical-grade SS 304 provides rock-solid rigidity",
      "R10 tight radius corners maximize flat basin floor space while allowing easy sponge wipe-downs",
      "Compact 21x18 in size engineered for 600mm modular cabinets",
      "Full perimeter multi-layer rubber acoustic pads for silent operation",
      "Channel grooves pressed into the basin floor direct every drop towards drain"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-fauc-jaquar-florentine-wall-5347pm"]
  },
  {
    id: "prod-sink-nirali-evan-handmade-24x18",
    slug: "nirali-evan-handmade-single-bowl-ss-304-24x18x9",
    name: "Nirali Evan Handmade Single Bowl SS 304 24×18×9 in",
    title: "Nirali — Evan Handmade Single Bowl SS 304 24×18×9 in",
    brand: "Nirali",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Handmade SS Sinks",
    kitchenSubcategory: "HANDMADE_SS_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "HANDMADE_FABRICATED",
    overallDimensionsInch: "24x18 in",
    minCabinetWidthMm: 700,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Matt",
    oemModelCode: "Evan Handmade 24x18x9",
    price: 8600,
    mrp: 10150,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "1.2mm Fabricated SS 304 · Extra Deep 9\" Basin · 700mm Base Fit",
    specChips: ["1.2mm Heavy Plate", "Extra Deep 9\"", "Min Cabinet 700mm", "Square Contemporary"],
    description: "Nirali Evan 24x18x9 inch handmade sink delivers an extra-deep 9-inch basin that effortlessly accommodates high-volume Indian cooking pots and large pans.",
    highlights: [
      "Heavy 1.2mm plate fabrication resists thermal shock and denting from heavy dropped utensils",
      "Extra deep 9-inch (228mm) basin prevents high-flow water splash onto countertops",
      "700mm base cabinet compatible with top, flush, or undermount granite installation",
      "X-line diagonal water channel drainage floor",
      "Includes heavy sound deadening pads on all 5 exterior faces"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-mix-kohler-atom-pulldown-chrome-25981in"]
  },
  {
    id: "prod-sink-ruhe-handmade-24x18",
    slug: "ruhe-handmade-1-2mm-ss-304-single-bowl-24x18x10-matt-basket",
    name: "Ruhe Handmade 1.2mm SS 304 Single Bowl 24×18×10 in (Matt + Basket)",
    title: "Ruhe — Handmade 1.2mm SS 304 Sink 24×18×10 in (Matt + Basket)",
    brand: "Ruhe",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Handmade SS Sinks",
    kitchenSubcategory: "HANDMADE_SS_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "HANDMADE_FABRICATED",
    overallDimensionsInch: "24x18 in",
    minCabinetWidthMm: 700,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Matt",
    oemModelCode: "Ruhe HM 24x18x10 Basket",
    price: 10268,
    mrp: 12100,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Jumbo 10\" Deep Bowl · Includes SS Colander Basket · 700mm Base",
    specChips: ["10\" Deep Basin", "Colander Basket Incl.", "1.2mm SS 304", "Min Cabinet 700mm"],
    description: "Ruhe handmade sink features an ultra-deep 10-inch bowl and includes a matching sliding stainless steel colander basket for washing fruits and draining pasta.",
    highlights: [
      "Jumbo 10\" (254mm) deep basin completely conceals dirty dishes from kitchen view",
      "Includes heavy-gauge 304 stainless sliding colander drainer basket",
      "1.2mm real thick stainless steel sheet with precision brushed matt finish",
      "Engineered for 700mm modular kitchen cabinets",
      "Full coverage sound insulation pads and non-toxic protective undercoat"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-acc-fossa-soap-dispenser-300ml"]
  },
  {
    id: "prod-sink-ruhe-handmade-32x18",
    slug: "ruhe-handmade-1-2mm-ss-304-single-bowl-32x18x10-matt-basket",
    name: "Ruhe Handmade 1.2mm SS 304 Single Bowl 32×18×10 in (Matt + Basket)",
    title: "Ruhe — Handmade 1.2mm SS 304 Sink 32×18×10 in (Matt + Basket)",
    brand: "Ruhe",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Handmade SS Sinks",
    kitchenSubcategory: "HANDMADE_SS_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "HANDMADE_FABRICATED",
    overallDimensionsInch: "32x18 in",
    minCabinetWidthMm: 900,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Matt",
    oemModelCode: "Ruhe HM 32x18x10 Basket",
    price: 12241,
    mrp: 14450,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Expansive 32x18\" Single Bowl · 10\" Depth · 900mm Base Fit",
    specChips: ["32x18\" Wide Basin", "10\" Deep", "Min Cabinet 900mm", "Includes Basket"],
    description: "Ruhe 32x18 inch single bowl sink provides a massive continuous basin workspace that accommodates baking trays, large biryani pots, and oversized cookers. Requires 900mm base cabinet.",
    highlights: [
      "Huge 32x18 in (813x457mm) single bowl allows washing massive cookware without angle tilting",
      "10-inch bowl depth with built-in stainless steel colander accessory",
      "Requires 900mm modular sink cabinet unit",
      "Heavy 1.2mm thick AISI 304 material with R10 easy-clean corners",
      "Pre-drilled for standard 3.5\" waste coupling and optional RO/soap dispenser"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-acc-backline-ro-faucet-304"]
  },
  {
    id: "prod-sink-kohler-strive-21in",
    slug: "kohler-strive-21-inch-top-flush-undermount-ss-sink-38778in-na",
    name: "Kohler Strive 21-Inch Top/Flush/Undermount SS Sink (38778IN-NA)",
    title: "Kohler — Strive 21-Inch SS Sink (38778IN-NA)",
    brand: "Kohler",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Handmade SS Sinks",
    kitchenSubcategory: "HANDMADE_SS_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "HANDMADE_FABRICATED",
    overallDimensionsInch: "21x18 in",
    minCabinetWidthMm: 600,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Satin",
    oemModelCode: "38778IN-NA",
    price: 13019,
    mrp: 15350,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Kohler SilentShield Sound Absorber · Triple Mount · 600mm Base",
    specChips: ["Kohler Global", "SilentShield Tech", "Triple Mount", "Min Cabinet 600mm"],
    description: "Kohler Strive features precision-engineered corners and Kohler's proprietary SilentShield sound-absorption technology that drastically dampens disposal noise and vibration.",
    highlights: [
      "Kohler SilentShield sound-deadening system delivers industry-leading acoustic dampening",
      "Triple mounting compatibility: Top mount, flush mount, or undermount under granite/quartz",
      "Compact 21-inch footprint designed for 600mm luxury apartment base units",
      "Fabricated from premium 16-gauge (1.2mm) surgical stainless steel",
      "Kohler global design warranty and technical authenticity"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-mix-kohler-atom-pulldown-chrome-25981in"]
  },
  {
    id: "prod-sink-nirali-monet-double-bowl-37x18",
    slug: "nirali-monet-sound-proof-double-bowl-square-ss-304-37x18-matt",
    name: "Nirali Monet Sound-Proof Double Bowl Square SS 304 37×18 in (Matt)",
    title: "Nirali — Monet Sound-Proof Double Bowl Square SS 304 37×18 in",
    brand: "Nirali",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Handmade SS Sinks",
    kitchenSubcategory: "HANDMADE_SS_SINK",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "HANDMADE_FABRICATED",
    overallDimensionsInch: "37x18 in",
    minCabinetWidthMm: 1000,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Matt",
    oemModelCode: "Monet Square DB Matt 37x18",
    price: 23045,
    mrp: 27150,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "E-Loader / Pickup",
    brandTier: 1,
    shortTagline: "Flagship Luxury Handmade Double Bowl · Extra Heavy Sound-Proof · 1000mm Base",
    specChips: ["Heavy Sound-Proof", "Square Double Bowl", "Min Cabinet 1000mm", "E-Loader / Pickup"],
    description: "Nirali Monet is an ultra-premium handmade double bowl sink fabricated from thick gauge stainless steel with full-surround soundproof armor. Shipped via E-Loader / Pickup for structural safety.",
    highlights: [
      "Twin square handmade compartments with 9\" depth for master chef kitchen workflows",
      "Full-surround soundproof armor reduces vibration and drum resonance by over 80%",
      "Overall size: 37x18 in (940x457mm) requiring a 1000mm (3.3ft) base cabinet",
      "Hand-polished satin matt finish matches luxury built-in kitchen appliances",
      "Heavy package (16+ kg) dispatched via E-Loader / Pickup truck with protective wooden crate packaging"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-mix-jaquar-florentine-pullout-black-5177bpm"]
  },

  // 4.3 Quartz Sinks (4 SKUs | HSN 6810)
  {
    id: "prod-sink-carysil-big-bowl-champagne-24x18",
    slug: "carysil-big-bowl-single-bowl-quartz-sink-24x18x8-champagne",
    name: "Carysil Big Bowl Single Bowl Quartz Sink 24×18×8 in (Champagne)",
    title: "Carysil — Big Bowl Single Bowl Quartz Sink 24×18×8 in (Champagne)",
    brand: "Carysil",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Quartz Sinks",
    kitchenSubcategory: "QUARTZ_SINK",
    materialGrade: "Quartz Granite Composite",
    sinkConstruction: "MOLDED_COMPOSITE",
    overallDimensionsInch: "24x18 in",
    minCabinetWidthMm: 700,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Champagne",
    oemModelCode: "Big Bowl Champagne 24x18",
    price: 7512,
    mrp: 8850,
    gstPercent: 18,
    hsnCode: "6810",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "German Quartz Composite (80% Granite) · Warm Champagne · 700mm Base",
    specChips: ["80% Natural Quartz", "Heat Resistant 280°C", "Min Cabinet 700mm", "Champagne Finish"],
    description: "Carysil Big Bowl Quartz Sink is molded using 80% natural granite quartz and 20% high-grade acrylic resins. Heat resistant up to 280°C and stain proof against turmeric and wine.",
    highlights: [
      "80% natural quartz composite gives stone-solid scratch resistance and durability",
      "Heat resistant up to 280°C — hot pans directly from stove will not damage surface",
      "Warm Champagne hue complements beige and off-white modular kitchen shutters",
      "Non-porous hygienic antibacterial surface prevents food odor absorption",
      "700mm base cabinet compatible with top mount or undermount installation"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-fauc-jaquar-florentine-wall-5347pm"]
  },
  {
    id: "prod-sink-carysil-big-bowl-nera-black-24x18",
    slug: "carysil-big-bowl-single-bowl-quartz-sink-24x18x8-nera-black",
    name: "Carysil Big Bowl Single Bowl Quartz Sink 24×18×8 in (Nera Black)",
    title: "Carysil — Big Bowl Single Bowl Quartz Sink 24×18×8 in (Nera Black)",
    brand: "Carysil",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Quartz Sinks",
    kitchenSubcategory: "QUARTZ_SINK",
    materialGrade: "Quartz Granite Composite",
    sinkConstruction: "MOLDED_COMPOSITE",
    overallDimensionsInch: "24x18 in",
    minCabinetWidthMm: 700,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Nera Black",
    oemModelCode: "Big Bowl Nera Black 24x18",
    price: 9592,
    mrp: 11300,
    gstPercent: 18,
    hsnCode: "6810",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Signature Nera Metallic Black · Turmeric Proof · 700mm Base Fit",
    specChips: ["Nera Black Finish", "80% Quartz Granite", "Min Cabinet 700mm", "Stain & Acid Proof"],
    description: "Carysil Nera Black Big Bowl is Lucknow's #1 chosen quartz sink for modern dark-themed and granite countertops. Zero water staining and 100% resistant to Indian curry stains.",
    highlights: [
      "Signature Nera Black finish creates a stunning centerpiece on light granite or quartz counters",
      "Completely immune to haldi (turmeric), lemon juice, tea, and red wine discoloration",
      "Ultra-dense stone composition naturally deadens water impact sound without pads",
      "Standard 24x18 in (610x457mm) dimensions fitting 700mm base cabinets",
      "Includes Carysil genuine packaging and template cutout guide"
    ],
    crossSellSkus: ["prod-fauc-jaquar-florentine-wall-black-5347pm", "prod-mix-jaquar-florentine-wall-black-5166pm", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-sink-carysil-new-ascend-arena-34x20",
    slug: "carysil-new-ascend-single-bowl-quartz-sink-34x20x8-arena",
    name: "Carysil New Ascend Single Bowl Quartz Sink 34×20×8 in (Arena)",
    title: "Carysil — New Ascend Single Bowl Quartz Sink 34×20×8 in (Arena)",
    brand: "Carysil",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Quartz Sinks",
    kitchenSubcategory: "QUARTZ_SINK",
    materialGrade: "Quartz Granite Composite",
    sinkConstruction: "MOLDED_COMPOSITE",
    overallDimensionsInch: "34x20 in",
    minCabinetWidthMm: 900,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Arena",
    oemModelCode: "New Ascend Arena 34x20",
    price: 13690,
    mrp: 16120,
    gstPercent: 18,
    hsnCode: "6810",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "34x20\" Wide Quartz Basin · Earthy Arena Grey · 900mm Base Cabinet",
    specChips: ["34x20 Large Basin", "Arena Grey Stone", "Min Cabinet 900mm", "Scratch Resistant"],
    description: "Carysil New Ascend in Arena grey provides an oversized single bowl quartz basin for open-plan kitchens, offering abundant room for washing large woks and trays.",
    highlights: [
      "Massive 34x20 in (864x508mm) single bowl basin for seamless food preparation",
      "Modern Arena matte grey texture coordinates with grey cementitious floor tiles",
      "Requires 900mm (3ft) modular sink cabinet unit",
      "80% natural quartz matrix delivers scratch-proof durability against steel scrubbers",
      "UV stable pigment does not fade even under direct window sunlight"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in", "prod-mix-kohler-atom-pulldown-chrome-25981in"]
  },
  {
    id: "prod-sink-carysil-big-bowl-plus-nera-24x18",
    slug: "carysil-big-bowl-plus-noise-reduction-quartz-sink-24x18x8-nera",
    name: "Carysil Big Bowl Plus Noise-Reduction Quartz Sink 24×18×8 in (Nera)",
    title: "Carysil — Big Bowl Plus Noise-Reduction Quartz Sink 24×18×8 in",
    brand: "Carysil",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Quartz Sinks",
    kitchenSubcategory: "QUARTZ_SINK",
    materialGrade: "Quartz Granite Composite",
    sinkConstruction: "MOLDED_COMPOSITE",
    overallDimensionsInch: "24x18 in",
    minCabinetWidthMm: 700,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Nera Black",
    oemModelCode: "Big Bowl Plus Nera",
    price: 14890,
    mrp: 17550,
    gstPercent: 18,
    hsnCode: "6810",
    deliveryVehicleType: "E-Loader",
    brandTier: 1,
    shortTagline: "Reinforced Heavy Rim · Advanced Acoustic Dampening · 700mm Base",
    specChips: ["Big Bowl Plus", "Enhanced Rim", "Min Cabinet 700mm", "Deep Nera Black"],
    description: "Carysil Big Bowl Plus features extra-reinforced rim thickness and acoustic composite molding for ultimate silence and heavy granite slab integration.",
    highlights: [
      "Heavy-duty reinforced rim structure provides extreme stability under heavy countertop loads",
      "Engineered acoustic composite formulation reduces water impact noise to a gentle whisper",
      "Stain-proof Nera Black mineral finish with lifetime color-lock technology",
      "Fits standard 700mm base cabinets with undermount or topmount mounting clips included",
      "Factory tested against thermal shocks up to 280°C"
    ],
    crossSellSkus: ["prod-mix-jaquar-florentine-pullout-black-5177bpm", "prod-acc-plantex-coupling-304", "prod-acc-fossa-soap-dispenser-300ml"]
  },

  // 4.4 Kitchen Sink Cocks — Single Cold Supply (11 SKUs | HSN 8481)
  {
    id: "prod-fauc-essco-cosmo-wall-cock",
    slug: "essco-cosmo-wall-mounted-sink-cock-swinging-spout-cos-chr-103347n",
    name: "Essco Cosmo Wall-Mounted Sink Cock Swinging Spout (COS-CHR-103347N)",
    title: "Essco — Cosmo Wall-Mounted Sink Cock (COS-CHR-103347N)",
    brand: "Essco",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "COS-CHR-103347N",
    price: 1460,
    mrp: 1720,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 2,
    shortTagline: "360° Swivel Spout · 10-Year Warranty · Wall Mounted Cold Supply",
    specChips: ["Wall Mounted", "Cold Only", "360° Swivel Spout", "Jaquar Group Assurance"],
    description: "Essco by Jaquar Group Cosmo sink cock is designed for wall installation over kitchen sinks. Features a high-arching swinging spout that easily cleans across standard bowls.",
    highlights: [
      "Smooth 360-degree horizontal swivel spout reaches every corner of 21\" and 24\" sinks",
      "Cast from virgin grade solid brass with multi-layer mirror chrome plating",
      "Half-turn ceramic inner cartridge rated for 500,000 drip-free on/off cycles",
      "Standard 1/2\" BSP thread for direct wall plumbing inlet connection",
      "Backed by Jaquar Group's 10-year reliable service network in Lucknow"
    ],
    crossSellSkus: ["prod-sink-nirali-grace-plain-21x18", "prod-sink-nirali-orra-straight-satin-24x18", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-fauc-parryware-claret-wall-cock",
    slug: "parryware-claret-wall-mounted-brass-sink-cock-chrome",
    name: "Parryware Claret Wall-Mounted Brass Sink Cock (Chrome)",
    title: "Parryware — Claret Wall-Mounted Brass Sink Cock (Chrome)",
    brand: "Parryware",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "Parryware Claret Wall",
    price: 1365,
    mrp: 1610,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 2,
    shortTagline: "Ergonomic Fluted Handle · Wall Mount · Aerated Water Stream",
    specChips: ["Wall Mounted", "Cold Only", "Solid Brass", "Foam Flow Aerator"],
    description: "Parryware Claret wall-mounted sink tap combines timeless design with heavy-duty brass construction, delivering a splash-free aerated water stream.",
    highlights: [
      "Smooth swivel gooseneck neck provides ample clearance for tall pressure cookers",
      "Integrated honeycomb aerator mixes air with water stream to prevent counter splashes",
      "Heavy brass body tested under 16-bar water pressure for zero porosity leaks",
      "Wall-mounted configuration saves valuable countertop and sink edge space",
      "Easy-grip ergonomic quarter-turn lever operable even with wet or soapy hands"
    ],
    crossSellSkus: ["prod-sink-parryware-eco-single-bowl-24x18", "prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in"]
  },
  {
    id: "prod-fauc-jaquar-darc-wall-cock-37347",
    slug: "jaquar-darc-half-inch-wall-mounted-sink-cock-drc-37347",
    name: "Jaquar D'Arc 1/2-Inch Wall-Mounted Sink Cock (DRC-37347)",
    title: "Jaquar — D'Arc 1/2-Inch Wall-Mounted Sink Cock (DRC-37347)",
    brand: "Jaquar",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "DRC-37347",
    price: 1622,
    mrp: 1910,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 1,
    shortTagline: "Jaquar Architectural Series · Soft Contour Swivel · 10-Yr Warranty",
    specChips: ["Wall Mounted", "Cold Supply", "Jaquar D'Arc", "10-Year Warranty"],
    description: "Jaquar D'Arc series features softened rectangular contours and a high-flow swivel spout for modern kitchen wash spaces.",
    highlights: [
      "Architectural D'Arc styling with seamless robotic chrome electroplating",
      "High-neck swivel arm allows effortless filling of deep vessels and water jugs",
      "Wall mount installation eliminates countertop cutouts and under-sink leaks",
      "High performance ceramic disc cartridge ensures silky smooth control",
      "Authentic Jaquar 10-year manufacturer warranty supported across Lucknow"
    ],
    crossSellSkus: ["prod-sink-nirali-orra-straight-satin-24x18", "prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in"]
  },
  {
    id: "prod-fauc-jaquar-florentine-wall-5347pm",
    slug: "jaquar-florentine-prime-wall-mounted-sink-tap-flp-5347pm-chrome",
    name: "Jaquar Florentine Prime Wall-Mounted Sink Tap (FLP-5347PM, Chrome)",
    title: "Jaquar — Florentine Prime Wall-Mounted Sink Tap (FLP-5347PM)",
    brand: "Jaquar",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "FLP-5347PM",
    price: 1850,
    mrp: 2180,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 1,
    shortTagline: "India's #1 Kitchen Faucet · Florentine Prime Chrome · 360° Swivel",
    specChips: ["Wall Mounted", "Cold Only", "Florentine Prime", "Highest Selling"],
    description: "Jaquar Florentine Prime is India's most recognized and reliable kitchen sink tap. Features a heavy brass body, high-arch cast spout, and quarter-turn control.",
    highlights: [
      "India's best-selling kitchen tap with unmatched longevity and spare part availability",
      "Extra tall arched spout allows washing 10-liter pressure cookers with ease",
      "Wall mounted with standard 1/2\" BSP thread for direct pipeline threading",
      "Advanced aerator with lime-cleaning technology prevents hard water scaling",
      "Jaquar authentic 10-year warranty with on-site technician service in Lucknow"
    ],
    crossSellSkus: ["prod-sink-nirali-orra-straight-satin-24x18", "prod-sink-carysil-elegance-esm-24x18", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-fauc-jaquar-continental-wall-cock-347knm",
    slug: "jaquar-continental-wall-mounted-sink-cock-con-347knm-chrome",
    name: "Jaquar Continental Wall-Mounted Sink Cock (CON-347KNM, Chrome)",
    title: "Jaquar — Continental Wall-Mounted Sink Cock (CON-347KNM)",
    brand: "Jaquar",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "CON-347KNM",
    price: 1965,
    mrp: 2315,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 1,
    shortTagline: "Classic Round Form · Cast Brass Body · 10-Year Warranty",
    specChips: ["Wall Mounted", "Cold Only", "Classic Round", "Jaquar Continental"],
    description: "Jaquar Continental features round tubular ergonomics and smooth quarter-turn brass spindle mechanisms, built to withstand continuous daily household use.",
    highlights: [
      "Solid forged brass body with high-durability nickel-chrome coating",
      "360-degree swivel spout reaches every corner of double or single sinks",
      "Wall mount design saves counter workspace and prevents sink rim grime",
      "Neoperl foam-flow aerator cuts water wastage by 30% while maintaining pressure",
      "Tested for over 500,000 cycles for leak-proof peace of mind"
    ],
    crossSellSkus: ["prod-sink-nirali-grace-plain-21x18", "prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in"]
  },
  {
    id: "prod-fauc-cera-crayon-wall-cock-f2008251",
    slug: "cera-crayon-wall-mounted-sink-cock-170mm-spout-f2008251",
    name: "CERA Crayon Wall-Mounted Sink Cock 170mm Spout (F2008251)",
    title: "CERA — Crayon Wall-Mounted Sink Cock 170mm Spout (F2008251)",
    brand: "CERA",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "F2008251",
    price: 2079,
    mrp: 2450,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 2,
    shortTagline: "170mm Projection Spout · Quarter Turn · CERA Ceramic Cartridge",
    specChips: ["Wall Mounted", "Cold Only", "170mm Spout", "CERA Assured"],
    description: "CERA Crayon series kitchen sink cock offers an extended 170mm projection spout, directing the water stream precisely to the center of standard single bowl sinks.",
    highlights: [
      "Extended 170mm horizontal spout projection delivers water directly into center of bowl",
      "Quarter-turn high-alumina ceramic disc for instantaneous shutoff",
      "Solid brass body with CERA mirror shine anti-corrosion chrome finish",
      "Wall-mount thread connection with decorative wall flange included",
      "Tested against 10-bar hydraulic testing pressure"
    ],
    crossSellSkus: ["prod-sink-nirali-orra-straight-satin-24x18", "prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in"]
  },
  {
    id: "prod-fauc-jaquar-florentine-table-5357pm",
    slug: "jaquar-florentine-prime-table-mounted-sink-tap-flp-5357pm-chrome",
    name: "Jaquar Florentine Prime Table-Mounted Sink Tap (FLP-5357PM, Chrome)",
    title: "Jaquar — Florentine Prime Table-Mounted Sink Tap (FLP-5357PM)",
    brand: "Jaquar",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "TABLE_DECK_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "FLP-5357PM",
    price: 2275,
    mrp: 2680,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 1,
    shortTagline: "Deck Mounted on Sink Rim · Requires Under-Sink Angle Valve · Chrome",
    specChips: ["Table / Deck Mounted", "Requires Countertop Hole", "Cold Supply", "Angle Valve Req."],
    description: "Jaquar Florentine Prime table-mounted sink tap installs directly onto sink corner faucet holes or granite countertops. Requires under-sink angle valve connection.",
    highlights: [
      "Table/Deck mounted installation directly onto sink rim hole (35mm standard)",
      "Requires countertop hole plus under-sink angle valve and braided connection hose",
      "Tall elegant gooseneck spout swivels 360 degrees smoothly",
      "Solid cast brass construction with thick protective chrome plating",
      "10-year on-site Jaquar warranty across all Lucknow pin codes"
    ],
    crossSellSkus: ["prod-sink-ruhe-handmade-24x18", "prod-sink-carysil-elegance-esm-24x18", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-fauc-cera-titanium-wall-cock-f1003261",
    slug: "cera-titanium-wall-mounted-sink-cock-200mm-spout-f1003261",
    name: "CERA Titanium Wall-Mounted Sink Cock 200mm Spout (F1003261)",
    title: "CERA — Titanium Wall-Mounted Sink Cock 200mm Spout (F1003261)",
    brand: "CERA",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "F1003261",
    price: 2576,
    mrp: 3035,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 2,
    shortTagline: "Extra-Long 200mm Spout · Ideal for 24\" Sinks · CERA Premium",
    specChips: ["Wall Mounted", "Cold Only", "200mm Long Spout", "Brass Heavy Body"],
    description: "CERA Titanium series offers an extra-long 200mm swinging spout, ideal for deep 24\" sinks and drainboard setups where standard spouts fall short.",
    highlights: [
      "Long 200mm (8\") spout extension ensures water stream hits center of deep kitchen basins",
      "Cast brass heavy body with thick chrome plating that withstands aggressive hard water",
      "Smooth 360-degree rotation enables full sink and countertop reach",
      "Quarter turn ceramic cartridge with effortless operation",
      "Includes premium metal wall flange for clean tile coverage"
    ],
    crossSellSkus: ["prod-sink-nirali-orra-straight-satin-24x18", "prod-sink-parryware-new-coral-drainboard-34x20", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-fauc-jaquar-florentine-wall-black-5347pm",
    slug: "jaquar-florentine-prime-wall-mounted-sink-cock-black-matt-flp-blm-5347pm",
    name: "Jaquar Florentine Prime Wall-Mounted Sink Cock Black Matt (FLP-BLM-5347PM)",
    title: "Jaquar — Florentine Prime Wall Sink Cock Black Matt (FLP-BLM-5347PM)",
    brand: "Jaquar",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Black Matt",
    oemModelCode: "FLP-BLM-5347PM",
    price: 2933,
    mrp: 3450,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 1,
    shortTagline: "Architectural Black Matt · Perfect for Nera Quartz Sinks · Wall Mounted",
    specChips: ["Wall Mounted", "Cold Only", "Black Matt Finish", "Quartz Match"],
    description: "Jaquar Florentine Prime Black Matt is electro-coated with a matte black finish, specifically designed to pair with black granite and Carysil Nera Quartz sinks.",
    highlights: [
      "Sophisticated Black Matt electro-deposition finish that resists fingerprint marks",
      "Ideal aesthetic match for Carysil Nera Black quartz sinks and dark granite countertops",
      "Wall mounted configuration keeping sink decks clear and clean",
      "High arch 360-degree swivel spout for versatile pot washing",
      "10-year warranty with Jaquar authentic service"
    ],
    crossSellSkus: ["prod-sink-carysil-big-bowl-nera-black-24x18", "prod-sink-carysil-big-bowl-plus-nera-24x18", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-fauc-hindware-contessa-neo-wall-cock",
    slug: "hindware-contessa-neo-wall-mounted-sink-cock-swivel-spout",
    name: "Hindware Contessa Neo Wall-Mounted Sink Cock with Swivel Spout",
    title: "Hindware — Contessa Neo Wall-Mounted Sink Cock",
    brand: "Hindware",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "Contessa Neo Wall",
    price: 2990,
    mrp: 3520,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 2,
    shortTagline: "Contessa Classic Cross Handle · Solid Cast Brass · 12-Yr Warranty",
    specChips: ["Wall Mounted", "Cold Only", "Cross Head Handle", "Hindware Star"],
    description: "Hindware Contessa Neo brings traditional cross-head styling with updated ceramic disc valves, offering a classic aesthetic for retro or traditional Lucknow kitchens.",
    highlights: [
      "Heritage 4-arm cross handle provides high tactile grip even with oily kitchen hands",
      "Heavy cast brass body engineered for continuous high-pressure usage",
      "360-degree swivel gooseneck spout for full sink access",
      "12-year manufacturer warranty from Hindware Italian Collection",
      "Precision aerator delivers a soft bubbly water stream with zero splashing"
    ],
    crossSellSkus: ["prod-sink-nirali-grace-plain-21x18", "prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in"]
  },
  {
    id: "prod-fauc-hindware-flora-wall-cock",
    slug: "hindware-flora-wall-mounted-sink-cock-swivel-spout",
    name: "Hindware Flora Wall-Mounted Sink Cock with Swivel Spout",
    title: "Hindware — Flora Wall-Mounted Sink Cock",
    brand: "Hindware",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Kitchen Sink Cocks",
    kitchenSubcategory: "SINK_COCK",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Chrome",
    oemModelCode: "Flora Wall Cock",
    price: 3800,
    mrp: 4470,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 2,
    shortTagline: "Sculpted Floral Lever · High Arc Spout · Hindware Italian Collection",
    specChips: ["Wall Mounted", "Cold Only", "Sculpted Lever", "Premium Brass"],
    description: "Hindware Flora represents the pinnacle of Hindware's single lever kitchen taps, featuring sculpted lever contours and a tall cast gooseneck spout.",
    highlights: [
      "Sculpted single-piece lever offers silky smooth water volume adjustment",
      "High arch spout clearance accommodates largest milk pots and pressure cookers",
      "Solid virgin brass casting ensures lifetime zero corrosion guarantee",
      "Neoperl Swiss aerator reduces water splash and filters fine pipeline sediments",
      "Wall mount installation compatible with standard 1/2\" plumbing points"
    ],
    crossSellSkus: ["prod-sink-carysil-elegance-esm-24x18", "prod-acc-plantex-coupling-304", "prod-acc-ruhe-waste-pipe-35in"]
  },

  // 4.5 Sink Mixers & Pull-Out Faucets (4 SKUs | HSN 8481)
  {
    id: "prod-mix-jaquar-single-lever-wall-chrome",
    slug: "jaquar-single-lever-wall-mounted-kitchen-sink-mixer-chrome",
    name: "Jaquar Single Lever Wall-Mounted Kitchen Sink Mixer (Chrome)",
    title: "Jaquar — Single Lever Wall-Mounted Kitchen Sink Mixer (Chrome)",
    brand: "Jaquar",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Sink Mixers & Pull-Out Faucets",
    kitchenSubcategory: "SINK_MIXER_PULLOUT",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "HOT_AND_COLD",
    finishColor: "Chrome",
    oemModelCode: "Jaquar SL Wall Mixer",
    price: 6400,
    mrp: 7550,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 1,
    shortTagline: "Hot & Cold Single Lever · Wall Mount (Twin Inlets) · Swivel Spout",
    specChips: ["Hot & Cold Mixer", "Wall Mounted", "Single Lever", "Twin 150mm Inlets"],
    description: "Jaquar Single Lever Wall-Mounted Sink Mixer connects to dual hot and cold wall inlets (150mm standard center distance). Features single lever temperature and flow adjustment with swivel spout.",
    highlights: [
      "Dual inlet wall mixer connects to solar, geyser, or instant water heater line and cold water line",
      "Single lever joy-stick operation allows one-touch temperature blending from cold to hot",
      "Standard 150mm wall inlet centers with adjustable S-unions included for easy retrofit",
      "Cast brass high-rise swinging spout swivels effortlessly across double or single sinks",
      "Jaquar 10-year complete warranty across Lucknow"
    ],
    crossSellSkus: ["prod-sink-futura-dura-double-bowl-37x18", "prod-sink-nirali-orra-straight-satin-24x18", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-mix-kohler-atom-pulldown-chrome-25981in",
    slug: "kohler-atom-pull-down-2-function-kitchen-faucet-chrome-25981in-4-cp",
    name: "Kohler Atom Pull-Down 2-Function Kitchen Faucet Chrome (25981IN-4-CP)",
    title: "Kohler — Atom Pull-Down 2-Function Kitchen Faucet (25981IN-4-CP)",
    brand: "Kohler",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Sink Mixers & Pull-Out Faucets",
    kitchenSubcategory: "SINK_MIXER_PULLOUT",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "TABLE_DECK_MOUNTED",
    waterSupplyType: "HOT_AND_COLD",
    finishColor: "Chrome",
    oemModelCode: "25981IN-4-CP",
    price: 7559,
    mrp: 8900,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 1,
    shortTagline: "Retractable Pull-Down Sprayer · Stream & Sweep Spray · Table Mount",
    specChips: ["Table / Deck Mounted", "Pull-Down Sprayer", "Hot & Cold", "2-Function Spray"],
    description: "Kohler Atom Pull-Down faucet features an extendable flexible braided spray head with dual functions: aerated stream for gentle filling and powerful sweep spray for scraping food scraps off plates.",
    highlights: [
      "Extendable pull-down spray head reaches outside the sink bowl to fill tall buckets or pots",
      "2-Function spray: Aerated stream for everyday filling + high-velocity blade spray for food rinsing",
      "Counterweight docking system automatically retracts spray head firmly back into spout",
      "Deck mounted on countertop or sink hole (requires 2x under-sink angle valves for hot & cold)",
      "Kohler premium polished chrome finish resists corrosion and tarnishing 2x longer than industry standards"
    ],
    crossSellSkus: ["prod-sink-kohler-strive-21in", "prod-sink-ruhe-handmade-24x18", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-mix-jaquar-florentine-wall-black-5166pm",
    slug: "jaquar-florentine-prime-wall-mounted-elbow-sink-mixer-black-flp-blm-5166pm",
    name: "Jaquar Florentine Prime Wall-Mounted Elbow Sink Mixer Black (FLP-BLM-5166PM)",
    title: "Jaquar — Florentine Prime Wall Elbow Mixer Black (FLP-BLM-5166PM)",
    brand: "Jaquar",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Sink Mixers & Pull-Out Faucets",
    kitchenSubcategory: "SINK_MIXER_PULLOUT",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "WALL_MOUNTED",
    waterSupplyType: "HOT_AND_COLD",
    finishColor: "Black Matt",
    oemModelCode: "FLP-BLM-5166PM",
    price: 8925,
    mrp: 10500,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 1,
    shortTagline: "Hot & Cold Wall Mixer · Black Matt Finish · Elbow Action Handles",
    specChips: ["Wall Mounted", "Hot & Cold Mixer", "Black Matt", "Dual Elbow Handles"],
    description: "Jaquar Florentine Prime Wall-Mounted Elbow Mixer in Black Matt provides twin hot & cold ceramic handles and a central swivel spout, tailored for luxury dark modular kitchens.",
    highlights: [
      "Dual hot & cold handles for precise water mixing and temperature control",
      "Deep Black Matt powder-bonded electro-coat finish matches black quartz sinks perfectly",
      "Twin wall-mounted inlet points (150mm center) keep granite counters clean and dry",
      "Heavy forged brass structure designed for lifetime structural durability",
      "Jaquar 10-year comprehensive warranty coverage"
    ],
    crossSellSkus: ["prod-sink-carysil-big-bowl-nera-black-24x18", "prod-sink-carysil-big-bowl-plus-nera-24x18", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-mix-jaquar-florentine-pullout-black-5177bpm",
    slug: "jaquar-florentine-prime-table-mounted-pull-out-mixer-black-flp-blm-5177bpm",
    name: "Jaquar Florentine Prime Table-Mounted Pull-Out Mixer Black (FLP-BLM-5177BPM)",
    title: "Jaquar — Florentine Prime Table Pull-Out Mixer Black (FLP-BLM-5177BPM)",
    brand: "Jaquar",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Sink Mixers & Pull-Out Faucets",
    kitchenSubcategory: "SINK_MIXER_PULLOUT",
    materialGrade: "Solid Brass",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "TABLE_DECK_MOUNTED",
    waterSupplyType: "HOT_AND_COLD",
    finishColor: "Black Matt",
    oemModelCode: "FLP-BLM-5177BPM",
    price: 9390,
    mrp: 11050,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 1,
    shortTagline: "Flagship Pull-Out Spray Faucet · Black Matt · Table Mounted Hot & Cold",
    specChips: ["Table / Deck Mounted", "Pull-Out Spray", "Black Matt", "Hot & Cold Mixer"],
    description: "Jaquar's flagship kitchen faucet: Table-mounted pull-out mixer in ultra-durable Black Matt finish with extendable spray wand and single lever hot/cold blending.",
    highlights: [
      "Top-tier pull-out spray hose with smooth braided retraction system",
      "Exquisite Black Matt architectural finish engineered for luxury designer kitchen sinks",
      "Single lever control regulates temperature and stream power with one finger",
      "Requires countertop/sink hole plus 2x under-sink angle valves for hot and cold plumbing",
      "Jaquar 10-year complete warranty with on-site technician response in Lucknow"
    ],
    crossSellSkus: ["prod-sink-carysil-big-bowl-nera-black-24x18", "prod-sink-carysil-big-bowl-plus-nera-24x18", "prod-acc-fossa-soap-dispenser-300ml"]
  },

  // 4.6 Sink Accessories & RO Add-Ons (4 SKUs)
  {
    id: "prod-acc-ruhe-waste-pipe-35in",
    slug: "ruhe-pvc-flexible-waste-pipe-35-inch-white-pack-of-2",
    name: "Ruhe PVC Flexible Waste Pipe 35-Inch White (Pack of 2)",
    title: "Ruhe — PVC Flexible Waste Pipe 35-Inch (Pack of 2)",
    brand: "Ruhe",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Sink Accessories & RO Add-Ons",
    kitchenSubcategory: "SINK_ACCESSORY",
    materialGrade: "PVC",
    sinkConstruction: "EXTRUDED_PVC",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: null,
    waterSupplyType: null,
    finishColor: "White",
    oemModelCode: "Ruhe 35\" Waste Pipe Pk2",
    price: 285,
    mrp: 350,
    gstPercent: 18,
    hsnCode: "3917",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 3,
    shortTagline: "35\" Expandable Flexible Pipe · Odor-Trap P-Bend · Pack of 2",
    specChips: ["Pack of 2", "35\" Length", "Flexible Corrugated", "Odor Prevention"],
    description: "Ruhe 35-inch flexible corrugated waste pipe connects kitchen sink couplings to wall drain sockets. Easily forms a P-trap to block sewer gases.",
    highlights: [
      "Extra long 35-inch (890mm) expandable pipe easily reaches awkward or low wall drain points",
      "Universal threaded rubber inlet collar creates leak-proof seal with all 3.5\" sink couplings",
      "Bendable design can be shaped into an S-trap or P-trap to permanently stop foul odors",
      "Pack of 2 pipes provides immediate spare or dual connection for double bowl sinks",
      "High grade flexible PVC resists boiling water, acids, and dishwashing chemicals"
    ],
    crossSellSkus: ["prod-acc-plantex-coupling-304", "prod-sink-nirali-orra-straight-satin-24x18", "prod-sink-carysil-big-bowl-nera-black-24x18"]
  },
  {
    id: "prod-acc-plantex-coupling-304",
    slug: "plantex-304-grade-ss-round-kitchen-sink-waste-coupling-matt",
    name: "Plantex 304-Grade SS Round Kitchen Sink Waste Coupling (Matt)",
    title: "Plantex — 304 SS Round Kitchen Sink Waste Coupling (Matt)",
    brand: "Plantex",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Sink Accessories & RO Add-Ons",
    kitchenSubcategory: "SINK_ACCESSORY",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: null,
    waterSupplyType: null,
    finishColor: "Matt",
    oemModelCode: "Plantex 304 Waste Coupling",
    price: 339,
    mrp: 420,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 3,
    shortTagline: "Universal 3.5\" Waste Coupling · Removable Strainer Basket · SS 304",
    specChips: ["Universal 3.5\"", "Removable Basket", "AISI 304 Steel", "Anti-Clogging"],
    description: "Plantex 304 stainless steel waste coupling features a deep removable strainer basket that captures rice grains and food waste without slowing drainage.",
    highlights: [
      "Standard 3.5\" (114mm) flange diameter fits 100% of Indian & imported kitchen sinks",
      "Deep perforated stainless basket catches food scraps and peels with ease",
      "Center pull-up stem acts as an airtight water stopper for bowl filling",
      "Solid brass lock nut and double EPDM silicone seals guarantee permanent zero-leak fitting",
      "Full surgical SS 304 grade construction with satin matt polish"
    ],
    crossSellSkus: ["prod-acc-ruhe-waste-pipe-35in", "prod-sink-nirali-orra-straight-satin-24x18", "prod-sink-carysil-big-bowl-nera-black-24x18"]
  },
  {
    id: "prod-acc-fossa-soap-dispenser-300ml",
    slug: "fossa-brushed-nickel-built-in-kitchen-soap-dispenser-300-ml",
    name: "Fossa Brushed Nickel Built-In Kitchen Soap Dispenser 300 ml",
    title: "Fossa — Brushed Nickel Built-In Kitchen Soap Dispenser 300 ml",
    brand: "Fossa",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Sink Accessories & RO Add-Ons",
    kitchenSubcategory: "SINK_ACCESSORY",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "PRESSED_HYDRAULIC",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "TABLE_DECK_MOUNTED",
    waterSupplyType: null,
    finishColor: "Matt",
    oemModelCode: "Fossa Dispenser 300ml",
    price: 557,
    mrp: 690,
    gstPercent: 18,
    hsnCode: "7324",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 3,
    shortTagline: "Deck-Mounted Built-In Pump · Refill From Above · 300ml Under Bottle",
    specChips: ["Built-In Countertop", "Top Refillable", "300ml Bottle", "Brushed Nickel"],
    description: "Fossa Built-In Soap Dispenser installs neatly into countertop or sink corner hole. Features top-refill pump mechanism so you never crawl under the sink to refill dish soap.",
    highlights: [
      "Installs into standard 25-35mm countertop or sink accessory pre-drilled hole",
      "Top-refill convenience: simply pull out the pump head from above and pour in dish liquid",
      "Spacious 300ml translucent under-counter container minimizes refill frequency",
      "Brushed nickel 304 stainless pump head resists corrosion from concentrated detergents",
      "Keeps kitchen countertops completely clutter-free of unsightly plastic soap bottles"
    ],
    crossSellSkus: ["prod-sink-nirali-orra-straight-satin-24x18", "prod-sink-carysil-big-bowl-nera-black-24x18", "prod-acc-plantex-coupling-304"]
  },
  {
    id: "prod-acc-backline-ro-faucet-304",
    slug: "backline-304-ss-under-sink-ro-drinking-water-faucet-360-swivel",
    name: "Backline 304 SS Under-Sink RO Drinking Water Faucet 360° Swivel",
    title: "Backline — 304 SS Under-Sink RO Water Faucet 360° Swivel",
    brand: "Backline",
    categorySlug: "kitchen-sinks-faucets",
    categoryName: "Kitchen Sinks & Faucets",
    subCategory: "Sink Accessories & RO Add-Ons",
    kitchenSubcategory: "SINK_ACCESSORY",
    materialGrade: "SS 304 (18/8)",
    sinkConstruction: "CAST_BRASS",
    overallDimensionsInch: null,
    minCabinetWidthMm: null,
    mountType: "TABLE_DECK_MOUNTED",
    waterSupplyType: "COLD_ONLY",
    finishColor: "Satin",
    oemModelCode: "Backline RO 304 Swivel",
    price: 999,
    mrp: 1250,
    gstPercent: 18,
    hsnCode: "8481",
    deliveryVehicleType: "2-Wheeler",
    brandTier: 3,
    shortTagline: "Food-Safe Lead-Free RO Tap · 1/4\" Push Fit · 360° Swivel Gooseneck",
    specChips: ["100% Lead-Free", "1/4\" RO Push Fit", "Food-Grade SS 304", "Table Mounted"],
    description: "Backline 304 Stainless Steel RO Faucet connects directly to under-sink reverse osmosis water purifiers. 100% lead-free interior tube protects purified drinking water from heavy metal leaching.",
    highlights: [
      "100% lead-free food-grade 304 stainless steel fluid path guarantees pure tasting drinking water",
      "Connects to all standard under-sink RO water purifiers via quick 1/4\" push-fit fitting",
      "Elegant tall gooseneck spout easily fills tall water bottles and copper carafes",
      "Deck mounted directly into sink accessory hole or granite slab",
      "Precision quarter-turn ceramic disc valve prevents post-dispense dripping"
    ],
    crossSellSkus: ["prod-sink-nirali-orra-straight-satin-24x18", "prod-sink-ruhe-handmade-24x18", "prod-acc-plantex-coupling-304"]
  }
];

// Helper to assemble full product records
const ALL_38_KITCHEN_PRODUCTS: KitchenSinkProduct[] = RAW_PRODUCTS.map((p) => {
  const discountPercent = Math.round(((p.mrp - p.price) / p.mrp) * 100);
  const exGstPrice = Math.round(p.price / 1.18);
  const imageFilename = `${p.slug}.webp`;
  const imagePath = `/images/products/kitchen-sinks-faucets/${imageFilename}`;

  const specifications: { label: string; value: string }[] = [
    { label: "Brand", value: p.brand },
    { label: "Model / Code", value: p.oemModelCode },
    { label: "Material Grade", value: p.materialGrade },
    { label: "Construction", value: p.sinkConstruction.replace(/_/g, " ") },
    { label: "Finish / Color", value: p.finishColor },
  ];

  if (p.overallDimensionsInch) {
    specifications.push({ label: "Dimensions", value: p.overallDimensionsInch });
  }
  if (p.minCabinetWidthMm) {
    specifications.push({ label: "Min Base Cabinet", value: `${p.minCabinetWidthMm} mm` });
  }
  if (p.mountType) {
    specifications.push({ label: "Mounting Type", value: p.mountType.replace(/_/g, " ") });
  }
  if (p.waterSupplyType) {
    specifications.push({ label: "Water Supply", value: p.waterSupplyType.replace(/_/g, " ") });
  }
  specifications.push({ label: "GST Rate", value: `${p.gstPercent}% (HSN ${p.hsnCode})` });
  specifications.push({ label: "Delivery Fleet", value: p.deliveryVehicleType });

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    title: p.title,
    brand: p.brand,
    categorySlug: p.categorySlug,
    categoryName: p.categoryName,
    subCategory: p.subCategory,
    kitchenSubcategory: p.kitchenSubcategory as any,
    materialGrade: p.materialGrade,
    sinkConstruction: p.sinkConstruction,
    overallDimensionsInch: p.overallDimensionsInch,
    minCabinetWidthMm: p.minCabinetWidthMm,
    mountType: p.mountType as any,
    waterSupplyType: p.waterSupplyType as any,
    finishColor: p.finishColor,
    oemModelCode: p.oemModelCode,
    sellingUnit: "Piece",
    unit: "Piece",
    price: p.price,
    exGstPrice,
    mrp: p.mrp,
    discountPercent,
    gstPercent: p.gstPercent,
    hsnCode: p.hsnCode,
    deliveryVehicleType: p.deliveryVehicleType as any,
    brandTier: p.brandTier as any,
    image: imagePath,
    images: [imagePath],
    shortTagline: p.shortTagline,
    specChips: p.specChips,
    description: p.description,
    highlights: p.highlights,
    specifications,
    variants: [
      {
        id: `var-${p.id}`,
        label: p.finishColor ? `Standard (${p.finishColor})` : "Standard",
        unit: "Piece",
        price: p.price,
        mrp: p.mrp,
        discountPercent,
        stock: 45,
        image: imagePath,
      },
    ],
    inStock: true,
    rating: 4.8,
    reviewsCount: 140,
    deliveryEta: p.deliveryVehicleType === "2-Wheeler" ? "60 Mins Express" : "Same Day Scheduled",
    vendor: "Lucknow Central Sanitary & Kitchen Supply Hub",
    crossSellSkus: p.crossSellSkus,
  };
});

const fileHeader = `// Master Dataset for Kitchen Sinks & Faucets (All 38 Verified Lucknow SKUs)
export interface KitchenSinkProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subCategory: string;
  kitchenSubcategory: "SS_PRESSED_SINK" | "HANDMADE_SS_SINK" | "QUARTZ_SINK" | "SINK_COCK" | "SINK_MIXER_PULLOUT" | "SINK_ACCESSORY";
  materialGrade: string;
  sinkConstruction: string;
  overallDimensionsInch: string | null;
  minCabinetWidthMm: number | null;
  mountType: "WALL_MOUNTED" | "TABLE_DECK_MOUNTED" | null;
  waterSupplyType: "COLD_ONLY" | "HOT_AND_COLD" | null;
  finishColor: string;
  oemModelCode: string;
  sellingUnit: string;
  unit: string;
  price: number;
  exGstPrice: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  hsnCode: string;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "E-Loader / Pickup";
  brandTier: 1 | 2 | 3;
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

export const ALL_38_KITCHEN_PRODUCTS: KitchenSinkProduct[] = ${JSON.stringify(ALL_38_KITCHEN_PRODUCTS, null, 2)};
`;

fs.writeFileSync(outputPath, fileHeader, "utf-8");
console.log(`Generated ${outputPath} with all 38 verified products!`);
