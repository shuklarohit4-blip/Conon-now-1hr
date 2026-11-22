// Unified Single-Source-of-Truth Catalog Data
// 18 Categories and 108 Rich Verified Brand Products

export interface IProductSpecification {
  label: string;
  value: string;
}

export interface IProductVariant {
  id: string;
  label: string;
  unit: string;
  price: number;
  mrp: number;
  discountPercent: number;
  stock: number;
  image?: string;
}

export interface IProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subCategory?: string;
  image: string;
  images: string[];
  shortTagline?: string;
  specChips: string[];
  description: string;
  highlights: string[];
  specifications: IProductSpecification[];
  variants: IProductVariant[];
  price: number;
  mrp: number;
  discountPercent: number;
  unit: string;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  deliveryEta: string;
  vendor?: string;
}

export interface ICategorySubcategory {
  name: string;
  slug: string;
  itemCount: number;
}

export interface ICategory {
  id?: string;
  catId: number;
  slug: string;
  title: string;
  department: string;
  image: string;
  dbCategory: string;
  route: string;
  badge?: string;
  subcategories: ICategorySubcategory[];
}

export const CATALOG_CATEGORIES: ICategory[] = [
  {
    "catId": 1,
    "slug": "cctv-networking",
    "title": "CCTV & Networking",
    "department": "Electrical",
    "image": "/images/home-categories/cctv-networking.webp",
    "dbCategory": "electrical",
    "route": "/collections/cctv-networking",
    "badge": "New Tech",
    "subcategories": [
      {
        "name": "Dome Cameras",
        "slug": "dome-cameras",
        "itemCount": 18
      },
      {
        "name": "Bullet Cameras",
        "slug": "bullet-cameras",
        "itemCount": 24
      },
      {
        "name": "DVR & NVR Units",
        "slug": "dvr-nvr",
        "itemCount": 12
      },
      {
        "name": "Wi-Fi Routers & Extenders",
        "slug": "wifi-routers",
        "itemCount": 16
      },
      {
        "name": "CAT6 & Patch Cables",
        "slug": "cat6-cables",
        "itemCount": 30
      }
    ]
  },
  {
    "catId": 2,
    "slug": "cpvc-plumbing-tanks",
    "title": "CPVC Plumbing & Overhead Tanks",
    "department": "Plumbing, Sanitary & Bath",
    "image": "/images/home-categories/cpvc-plumbing-tanks.webp",
    "dbCategory": "plumbing",
    "route": "/collections/cpvc-plumbing-tanks",
    "badge": "Bulk Rates",
    "subcategories": [
      {
        "name": "Overhead Water Tanks",
        "slug": "water-tanks",
        "itemCount": 14
      },
      {
        "name": "CPVC Pipes SDR 11",
        "slug": "cpvc-pipes",
        "itemCount": 28
      },
      {
        "name": "CPVC Elbows, Tees & Couplers",
        "slug": "cpvc-fittings",
        "itemCount": 56
      },
      {
        "name": "Solvent Cements & Primers",
        "slug": "solvent-cements",
        "itemCount": 10
      },
      {
        "name": "Brass Insert Fittings",
        "slug": "brass-fittings",
        "itemCount": 32
      }
    ]
  },
  {
    "catId": 3,
    "slug": "cement-civil-works",
    "title": "Cement & Civil Works",
    "department": "Civil & Interiors",
    "image": "/images/home-categories/cement-civil-works.webp",
    "dbCategory": "cement",
    "route": "/collections/cement-1",
    "badge": "Bulk Prices",
    "subcategories": [
      {
        "name": "OPC 53 Grade Cement",
        "slug": "opc-53",
        "itemCount": 12
      },
      {
        "name": "PPC Waterproofing Cement",
        "slug": "ppc-waterproofing",
        "itemCount": 16
      },
      {
        "name": "First Class Red Bricks",
        "slug": "red-bricks",
        "itemCount": 8
      },
      {
        "name": "Magicrete AAC Blocks",
        "slug": "aac-blocks",
        "itemCount": 10
      },
      {
        "name": "Screened River Sand & M-Sand",
        "slug": "sand-aggregates",
        "itemCount": 14
      }
    ]
  },
  {
    "catId": 4,
    "slug": "plywood-boards",
    "title": "Plywood & Boards",
    "department": "Civil & Interiors",
    "image": "/images/home-categories/plywood-boards.webp",
    "dbCategory": "wood",
    "route": "/collections/plywood-blockboard",
    "subcategories": [
      {
        "name": "BWP Marine 710 Plywood",
        "slug": "bwp-marine-plywood",
        "itemCount": 22
      },
      {
        "name": "Action TESA HDHMR",
        "slug": "hdhmr-boards",
        "itemCount": 18
      },
      {
        "name": "Commercial MR Plywood",
        "slug": "mr-plywood",
        "itemCount": 26
      },
      {
        "name": "Boilo Water Resistant Boards",
        "slug": "boilo-boards",
        "itemCount": 10
      },
      {
        "name": "Blockboards & Flush Doors",
        "slug": "blockboards-doors",
        "itemCount": 15
      }
    ]
  },
  {
    "catId": 5,
    "slug": "fevicol-adhesives-sealants",
    "title": "Fevicol, Adhesives & Sealants",
    "department": "Furniture & Architectural Hardware",
    "image": "/images/home-categories/fevicol-adhesives-sealants.webp",
    "dbCategory": "adhesives",
    "route": "/collections/wood-adhesives",
    "subcategories": [
      {
        "name": "Fevicol SH Synthetic Resin",
        "slug": "fevicol-sh",
        "itemCount": 12
      },
      {
        "name": "Fevicol Marine Waterproof",
        "slug": "fevicol-marine",
        "itemCount": 8
      },
      {
        "name": "Fevicol HeatX Fast Heat Proof",
        "slug": "fevicol-heatx",
        "itemCount": 6
      },
      {
        "name": "Silicone Sealants & Acrylic",
        "slug": "silicone-sealants",
        "itemCount": 14
      },
      {
        "name": "M-Seal & Epoxy Compounds",
        "slug": "m-seal-epoxy",
        "itemCount": 10
      }
    ]
  },
  {
    "catId": 6,
    "slug": "wires-mcb-electrical",
    "title": "Wires, MCB & Electrical Supplies",
    "department": "Electrical",
    "image": "/images/home-categories/wires-mcb-electrical.webp",
    "dbCategory": "electrical",
    "route": "/collections/electrical-wires",
    "badge": "ISI Certified",
    "subcategories": [
      {
        "name": "Flame Retardant House Wires",
        "slug": "fr-house-wires",
        "itemCount": 42
      },
      {
        "name": "MCB & Distribution Boards",
        "slug": "mcb-db-boards",
        "itemCount": 28
      },
      {
        "name": "Modular Switches & Sockets",
        "slug": "modular-switches",
        "itemCount": 64
      },
      {
        "name": "Conduits, Bends & Metal Boxes",
        "slug": "conduits-boxes",
        "itemCount": 36
      },
      {
        "name": "Earth Bar & Industrial Glands",
        "slug": "earthing-glands",
        "itemCount": 16
      }
    ]
  },
  {
    "catId": 7,
    "slug": "kitchen-sinks-faucets",
    "title": "Kitchen Sinks & Faucets",
    "department": "Plumbing, Sanitary & Bath",
    "image": "/images/home-categories/kitchen-sinks-faucets.webp",
    "dbCategory": "hardware",
    "route": "/collections/ss-sinks",
    "subcategories": [
      {
        "name": "SS 304 Single Bowl Sinks",
        "slug": "ss-single-bowl",
        "itemCount": 20
      },
      {
        "name": "SS Sinks with Drainboard",
        "slug": "ss-drainboard-sinks",
        "itemCount": 16
      },
      {
        "name": "Composite Quartz Sinks",
        "slug": "quartz-sinks",
        "itemCount": 14
      },
      {
        "name": "Pull-Out Gooseneck Faucets",
        "slug": "kitchen-faucets",
        "itemCount": 24
      },
      {
        "name": "Sink Waste Strainers & Traps",
        "slug": "sink-accessories",
        "itemCount": 12
      }
    ]
  },
  {
    "catId": 8,
    "slug": "furniture-wardrobe-bed-hardware",
    "title": "Furniture, Wardrobe & Bed Hardware",
    "department": "Furniture & Architectural Hardware",
    "image": "/images/home-categories/furniture-wardrobe-bed-hardware.webp",
    "dbCategory": "hardware",
    "route": "/collections/hinges",
    "subcategories": [
      {
        "name": "Soft-Close Concealed Hinges",
        "slug": "soft-close-hinges",
        "itemCount": 26
      },
      {
        "name": "Telescopic Drawer Slides",
        "slug": "drawer-slides",
        "itemCount": 32
      },
      {
        "name": "Hydraulic Bed Lift Mechanisms",
        "slug": "bed-lift-hydraulics",
        "itemCount": 8
      },
      {
        "name": "Wardrobe Sliding Systems",
        "slug": "sliding-systems",
        "itemCount": 14
      },
      {
        "name": "Furniture Legs & Levelers",
        "slug": "furniture-legs",
        "itemCount": 18
      }
    ]
  },
  {
    "catId": 9,
    "slug": "modular-kitchen-systems",
    "title": "Modular Kitchen Systems & Fittings",
    "department": "Furniture & Architectural Hardware",
    "image": "/images/home-categories/modular-kitchen-systems.webp",
    "dbCategory": "hardware",
    "route": "/collections/modular-kitchen-systems",
    "subcategories": [
      {
        "name": "SS Wire Cutlery & Grain Baskets",
        "slug": "ss-wire-baskets",
        "itemCount": 28
      },
      {
        "name": "Tall Pantry Pull-Out Units",
        "slug": "tall-pantry-units",
        "itemCount": 10
      },
      {
        "name": "Magic Corner & Carousel Units",
        "slug": "corner-units",
        "itemCount": 12
      },
      {
        "name": "Under-Sink Waste Bins",
        "slug": "waste-bins",
        "itemCount": 8
      },
      {
        "name": "Spice Racks & Bottle Pull-Outs",
        "slug": "spice-pullouts",
        "itemCount": 16
      }
    ]
  },
  {
    "catId": 10,
    "slug": "door-hardware-locks",
    "title": "Door Hardware & Locks",
    "department": "Furniture & Architectural Hardware",
    "image": "/images/home-categories/door-hardware-locks.webp",
    "dbCategory": "hardware",
    "route": "/collections/mechanical-locks",
    "subcategories": [
      {
        "name": "Mortise Lever Handles & Locks",
        "slug": "mortise-handles",
        "itemCount": 34
      },
      {
        "name": "Main Door Rim & Tribolt Locks",
        "slug": "main-door-locks",
        "itemCount": 22
      },
      {
        "name": "Hydraulic Overhead Door Closers",
        "slug": "door-closers",
        "itemCount": 12
      },
      {
        "name": "Heavy SS Bearing Butt Hinges",
        "slug": "ss-butt-hinges",
        "itemCount": 24
      },
      {
        "name": "Digital Smart Fingerprint Locks",
        "slug": "smart-door-locks",
        "itemCount": 8
      }
    ]
  },
  {
    "catId": 11,
    "slug": "sanitary-bath-fittings",
    "title": "Sanitary & Bath Fittings",
    "department": "Plumbing, Sanitary & Bath",
    "image": "/images/home-categories/sanitary-bath-fittings.webp",
    "dbCategory": "plumbing",
    "route": "/collections/mixers-diverters-shower",
    "subcategories": [
      {
        "name": "Wall-Hung Ceramic WC",
        "slug": "wall-hung-wc",
        "itemCount": 22
      },
      {
        "name": "Concealed Cisterns & Push Plates",
        "slug": "concealed-cisterns",
        "itemCount": 16
      },
      {
        "name": "Countertop Ceramic Basins",
        "slug": "countertop-basins",
        "itemCount": 28
      },
      {
        "name": "Diverters & Overhead Showers",
        "slug": "diverters-showers",
        "itemCount": 36
      },
      {
        "name": "Health Faucets & Angle Valves",
        "slug": "health-faucets",
        "itemCount": 30
      }
    ]
  },
  {
    "catId": 12,
    "slug": "tile-stone-installation",
    "title": "Tile & Stone Installation",
    "department": "Civil & Interiors",
    "image": "/images/home-categories/tile-stone-installation.webp",
    "dbCategory": "tiles",
    "route": "/collections/tile-adhesives",
    "badge": "Bulk Rates",
    "subcategories": [
      {
        "name": "Polymer-Modified Tile Adhesives",
        "slug": "tile-adhesives",
        "itemCount": 24
      },
      {
        "name": "Waterproof Epoxy Tile Grouts",
        "slug": "epoxy-grouts",
        "itemCount": 18
      },
      {
        "name": "Tile Leveling Clips & Spacers",
        "slug": "tile-spacers-clips",
        "itemCount": 14
      },
      {
        "name": "Notched Trowels & Grout Floats",
        "slug": "tiling-tools",
        "itemCount": 16
      },
      {
        "name": "Tile Cleaners & Stone Sealers",
        "slug": "cleaners-sealers",
        "itemCount": 12
      }
    ]
  },
  {
    "catId": 13,
    "slug": "home-appliances",
    "title": "Home Appliances",
    "department": "Electrical",
    "image": "/images/home-categories/home-appliances.webp",
    "dbCategory": "electrical",
    "route": "/collections/home-appliances",
    "subcategories": [
      {
        "name": "Kitchen Chimney Cooker Hoods",
        "slug": "kitchen-chimneys",
        "itemCount": 18
      },
      {
        "name": "Storage Water Heaters (Geysers)",
        "slug": "water-geysers",
        "itemCount": 22
      },
      {
        "name": "BLDC & Decorative Ceiling Fans",
        "slug": "ceiling-fans",
        "itemCount": 32
      },
      {
        "name": "High-Speed Ventilation Exhausts",
        "slug": "exhaust-fans",
        "itemCount": 16
      },
      {
        "name": "Induction & Gas Cooktops",
        "slug": "cooktops",
        "itemCount": 14
      }
    ]
  },
  {
    "catId": 14,
    "slug": "lighting",
    "title": "Lighting",
    "department": "Electrical",
    "image": "/images/home-categories/lighting.webp",
    "dbCategory": "electrical",
    "route": "/collections/ceiling-panel-lights",
    "subcategories": [
      {
        "name": "Slim LED Battens & Tubes",
        "slug": "led-battens",
        "itemCount": 24
      },
      {
        "name": "Recessed Round & Square Panels",
        "slug": "panel-lights",
        "itemCount": 38
      },
      {
        "name": "COB Focus & Spotlights",
        "slug": "cob-spotlights",
        "itemCount": 26
      },
      {
        "name": "Outdoor LED Flood Lights",
        "slug": "flood-lights",
        "itemCount": 14
      },
      {
        "name": "Profile & Strip Lights",
        "slug": "strip-lights",
        "itemCount": 20
      }
    ]
  },
  {
    "catId": 15,
    "slug": "painting",
    "title": "Painting",
    "department": "Civil & Interiors",
    "image": "/images/home-categories/painting.webp",
    "dbCategory": "paint",
    "route": "/collections/interior-emulsions",
    "subcategories": [
      {
        "name": "Interior Luxury Emulsions",
        "slug": "interior-emulsion",
        "itemCount": 34
      },
      {
        "name": "Weatherproof Exterior Emulsions",
        "slug": "exterior-emulsion",
        "itemCount": 28
      },
      {
        "name": "Waterproof Wall Putty 40kg",
        "slug": "wall-putty",
        "itemCount": 12
      },
      {
        "name": "Acrylic Wall Primers",
        "slug": "wall-primers",
        "itemCount": 18
      },
      {
        "name": "Paint Rollers, Brushes & Trays",
        "slug": "painting-tools",
        "itemCount": 26
      }
    ]
  },
  {
    "catId": 16,
    "slug": "safety-workwear",
    "title": "Safety & Workwear",
    "department": "Tools",
    "image": "/images/home-categories/safety-workwear.webp",
    "dbCategory": "safety",
    "route": "/collections/shoes-gloves",
    "subcategories": [
      {
        "name": "ISI Construction Helmets",
        "slug": "safety-helmets",
        "itemCount": 16
      },
      {
        "name": "High-Vis Reflective Safety Vests",
        "slug": "safety-vests",
        "itemCount": 14
      },
      {
        "name": "Full-Body Fall Arrest Harness",
        "slug": "safety-harnesses",
        "itemCount": 10
      },
      {
        "name": "Industrial Work Gloves",
        "slug": "safety-gloves",
        "itemCount": 20
      },
      {
        "name": "Protective Goggles & Dust Masks",
        "slug": "goggles-masks",
        "itemCount": 18
      }
    ]
  },
  {
    "catId": 17,
    "slug": "tools-hardware",
    "title": "Tools, Power Tools & General Hardware",
    "department": "Tools",
    "image": "/images/home-categories/tools-hardware.webp",
    "dbCategory": "tools",
    "route": "/collections/tools-hardware",
    "subcategories": [
      {
        "name": "Professional Impact Drills",
        "slug": "impact-drills",
        "itemCount": 16
      },
      {
        "name": "Heavy-Duty Angle Grinders",
        "slug": "angle-grinders",
        "itemCount": 14
      },
      {
        "name": "Spanners, Wrenches & Pliers",
        "slug": "hand-tools-wrenches",
        "itemCount": 38
      },
      {
        "name": "Stanley Measuring Tapes & Levels",
        "slug": "measuring-tapes",
        "itemCount": 18
      },
      {
        "name": "Fasteners, Screws & Wall Plugs",
        "slug": "screws-fasteners",
        "itemCount": 44
      }
    ]
  },
  {
    "catId": 18,
    "slug": "waterproofing-repairing",
    "title": "Waterproofing & Repairing",
    "department": "Civil & Interiors",
    "image": "/images/home-categories/waterproofing-repairing.webp",
    "dbCategory": "adhesives",
    "route": "/collections/waterproofing-repairing",
    "badge": "Site Tested",
    "subcategories": [
      {
        "name": "Integral Liquid Waterproofing",
        "slug": "integral-waterproofing",
        "itemCount": 12
      },
      {
        "name": "Polymer Bonding Agents (URP)",
        "slug": "bonding-agents",
        "itemCount": 14
      },
      {
        "name": "Elastomeric Terrace Coatings",
        "slug": "terrace-coatings",
        "itemCount": 10
      },
      {
        "name": "Crack Sealants & Putty",
        "slug": "crack-sealants",
        "itemCount": 16
      },
      {
        "name": "Damp-Proof Surface Barriers",
        "slug": "damp-proof-barriers",
        "itemCount": 8
      }
    ]
  }
];

export const CATALOG_PRODUCTS: IProduct[] = [
  {
    "id": "prod-cctv-networking-cp-z43q",
    "slug": "cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q",
    "name": "CP Plus 4MP Wi-Fi Full Color PT Camera - CP-Z43Q",
    "title": "CP Plus 4MP Wi-Fi Full Color PT Camera - CP-Z43Q",
    "brand": "CP PLUS",
    "categorySlug": "cctv-networking",
    "categoryName": "CCTV & Networking",
    "subCategory": "Cameras",
    "image": "/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp",
    "images": [
      "/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp"
    ],
    "shortTagline": "360\u00b0 Pan-Tilt \u00b7 4MP Full Color Night Vision \u00b7 Two-Way Talk",
    "specChips": [
      "4MP Ultra HD",
      "360\u00b0 Pan Tilt",
      "Color Night Vision",
      "Two-Way Audio"
    ],
    "description": "High-definition 4MP PT camera engineered for residential and commercial site surveillance. Delivers vivid full-color video streaming day and night with intelligent motion tracking and instant smartphone alerts. Built with robust weatherproof casing and dual-band Wi-Fi for uninterrupted monitoring.",
    "highlights": [
      "4MP Quad HD resolution with crystal clear zoom details",
      "360\u00b0 horizontal pan and 90\u00b0 vertical tilt motorized control",
      "Smart full-color night vision with dual high-power white LEDs",
      "Full duplex two-way audio with built-in noise cancelling microphone",
      "Supports up to 256GB MicroSD card and secure cloud storage"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CP PLUS"
      },
      {
        "label": "Model / Series",
        "value": "CP-Z43Q Wi-Fi PT Series"
      },
      {
        "label": "Resolution",
        "value": "4 Megapixel (2560 x 1440)"
      },
      {
        "label": "Connectivity",
        "value": "2.4GHz Wi-Fi + RJ45 Ethernet Port"
      },
      {
        "label": "Night Vision Range",
        "value": "Up to 30 Meters Full Color"
      },
      {
        "label": "Audio",
        "value": "Two-Way Audio with Noise Cancellation"
      },
      {
        "label": "Storage Support",
        "value": "MicroSD up to 256GB / Cloud Storage"
      },
      {
        "label": "Warranty",
        "value": "2 Years Manufacturer Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-cp-z43q-1",
        "label": "Single Camera Unit",
        "unit": "Piece",
        "price": 3984,
        "mrp": 7200,
        "discountPercent": 45,
        "stock": 50,
        "image": "/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp"
      },
      {
        "id": "var-cp-z43q-2",
        "label": "Dual Pack (2 Cameras)",
        "unit": "Pack of 2",
        "price": 7800,
        "mrp": 14400,
        "discountPercent": 46,
        "stock": 25,
        "image": "/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp"
      },
      {
        "id": "var-cp-z43q-4",
        "label": "Site Quad Kit (4 Cameras)",
        "unit": "Pack of 4",
        "price": 15200,
        "mrp": 28800,
        "discountPercent": 47,
        "stock": 15,
        "image": "/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp"
      }
    ],
    "price": 3984,
    "mrp": 7200,
    "discountPercent": 45,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CP PLUS Authorized Depot"
  },
  {
    "id": "prod-cctv-networking-ez-r33t",
    "slug": "cp-plus-3mp-4g-sim-camera-ez-r33t",
    "name": "CP Plus 3MP 4G Sim Camera - EZ-R33T",
    "title": "CP Plus 3MP 4G Sim Camera - EZ-R33T",
    "brand": "CP PLUS",
    "categorySlug": "cctv-networking",
    "categoryName": "CCTV & Networking",
    "subCategory": "Cameras",
    "image": "/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp",
    "images": [
      "/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp"
    ],
    "shortTagline": "Direct 4G SIM Slot \u00b7 No Wi-Fi Needed \u00b7 Outdoor Waterproof IP66",
    "specChips": [
      "4G SIM Connectivity",
      "3MP 2K Video",
      "IP66 Weatherproof",
      "Human Detection"
    ],
    "description": "Stand-alone 4G SIM card surveillance camera ideal for active construction sites, farmhouses, and remote projects without broadband. Provides direct 4G LTE cellular connectivity for live streaming to your phone. Features heavy-duty IP66 weatherproof housing and infrared night illumination.",
    "highlights": [
      "Works with all major 4G SIM cards (Jio, Airtel, Vi) without Wi-Fi",
      "3MP 2K crystal-clear video streaming with wide angle field of view",
      "IP66 rated waterproof and dustproof exterior for outdoor longevity",
      "AI human shape detection with active light and siren deterrence",
      "Low data consumption mode optimized for continuous monitoring"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CP PLUS"
      },
      {
        "label": "Model / Series",
        "value": "EZ-R33T 4G Outdoor Bullet"
      },
      {
        "label": "Resolution",
        "value": "3 Megapixel (2304 x 1296)"
      },
      {
        "label": "Network Support",
        "value": "4G LTE Nano SIM (Jio / Airtel / Vi)"
      },
      {
        "label": "Ingress Protection",
        "value": "IP66 Weatherproof Standard"
      },
      {
        "label": "IR Distance",
        "value": "Up to 30 Meters Night Vision"
      },
      {
        "label": "Storage",
        "value": "TF Card up to 256GB"
      },
      {
        "label": "Warranty",
        "value": "2 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-ez-r33t-1",
        "label": "Standalone Camera",
        "unit": "Piece",
        "price": 2784,
        "mrp": 5200,
        "discountPercent": 46,
        "stock": 40,
        "image": "/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp"
      },
      {
        "id": "var-ez-r33t-sd",
        "label": "With 64GB High-Endurance Card",
        "unit": "Kit",
        "price": 3199,
        "mrp": 5999,
        "discountPercent": 47,
        "stock": 30,
        "image": "/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp"
      },
      {
        "id": "var-ez-r33t-128",
        "label": "With 128GB High-Endurance Card",
        "unit": "Kit",
        "price": 3599,
        "mrp": 6699,
        "discountPercent": 46,
        "stock": 20,
        "image": "/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp"
      }
    ],
    "price": 2784,
    "mrp": 5200,
    "discountPercent": 46,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CP PLUS Authorized Depot"
  },
  {
    "id": "prod-cctv-networking-cp-unc-da21l3c-q",
    "slug": "cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q",
    "name": "CP Plus 2MP IP Dome Camera - CP-UNC-DA21L3C-Q",
    "title": "CP Plus 2MP IP Dome Camera - CP-UNC-DA21L3C-Q",
    "brand": "CP PLUS",
    "categorySlug": "cctv-networking",
    "categoryName": "CCTV & Networking",
    "subCategory": "Cameras",
    "image": "/images/products/cctv/cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q.webp",
    "images": [
      "/images/products/cctv/cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q.webp"
    ],
    "shortTagline": "PoE Powered \u00b7 Commercial Ceiling Dome \u00b7 H.265+ Compression",
    "specChips": [
      "2MP Full HD",
      "Power over Ethernet",
      "H.265+ Codec",
      "Vandal Proof"
    ],
    "description": "Enterprise-grade ceiling dome camera designed for offices, commercial hallways, and apartment stairwells. Supports Power over Ethernet (PoE) for effortless single-cable data and power deployment. Delivers sharp 1080p surveillance with low-bandwidth H.265+ video encoding.",
    "highlights": [
      "2MP Full HD CMOS sensor for clean, distortion-free indoor video",
      "PoE (802.3af) support reduces cabling clutter and installation cost",
      "H.265+ video compression saves up to 70% storage and bandwidth",
      "True Day/Night ICR filter with intelligent smart IR LEDs",
      "Vandal-resistant compact dome form factor fits any modern ceiling"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CP PLUS"
      },
      {
        "label": "Model / Series",
        "value": "CP-UNC-DA21L3C-Q Coral Series"
      },
      {
        "label": "Sensor Type",
        "value": "1/2.8\" 2MP Progressive Scan CMOS"
      },
      {
        "label": "Lens",
        "value": "3.6mm Fixed Focal Length (88\u00b0 Field of View)"
      },
      {
        "label": "Power Input",
        "value": "12V DC / PoE (802.3af)"
      },
      {
        "label": "Compression",
        "value": "H.265+ / H.265 / H.264"
      },
      {
        "label": "IR Range",
        "value": "30 Meters Smart IR"
      },
      {
        "label": "Warranty",
        "value": "2 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-unc-da21-28",
        "label": "2.8mm Wide Angle (105\u00b0)",
        "unit": "Piece",
        "price": 3505,
        "mrp": 7300,
        "discountPercent": 52,
        "stock": 35,
        "image": "/images/products/cctv/cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q.webp"
      },
      {
        "id": "var-unc-da21-36",
        "label": "3.6mm Standard (88\u00b0)",
        "unit": "Piece",
        "price": 3505,
        "mrp": 7300,
        "discountPercent": 52,
        "stock": 40,
        "image": "/images/products/cctv/cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q.webp"
      }
    ],
    "price": 3505,
    "mrp": 7300,
    "discountPercent": 52,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CP PLUS Authorized Depot"
  },
  {
    "id": "prod-cctv-networking-cp-e38q",
    "slug": "cp-plus-3mp-wifi-pt-camera-cp-e38q",
    "name": "CP Plus 3MP Wi-Fi PT Camera - CP-E38Q",
    "title": "CP Plus 3MP Wi-Fi PT Camera - CP-E38Q",
    "brand": "CP PLUS",
    "categorySlug": "cctv-networking",
    "categoryName": "CCTV & Networking",
    "subCategory": "Cameras",
    "image": "/images/products/cctv/cp-plus-3mp-wifi-pt-camera-cp-e38q.webp",
    "images": [
      "/images/products/cctv/cp-plus-3mp-wifi-pt-camera-cp-e38q.webp"
    ],
    "shortTagline": "3MP 2K Smart Home & Office Pan-Tilt Camera with Auto-Tracking",
    "specChips": [
      "3MP 2K Resolution",
      "Auto-Tracking",
      "Privacy Mode",
      "Alexa & Google Home"
    ],
    "description": "Compact robotic pan-tilt camera with intelligent motion auto-tracking for home interiors, retail counters, and office rooms. Captures 3MP 2K high-resolution feeds with responsive 360-degree rotation. Features private one-touch lens sleep mode and two-way audio.",
    "highlights": [
      "High resolution 3MP 2K video clarity with vivid color contrast",
      "Motorized pan & tilt with smart auto-tracking follows moving subjects",
      "Physical privacy shutter mode for complete personal comfort at home",
      "Crystal clear two-way communication for talking to family or staff",
      "Seamless compatibility with Alexa and Google Assistant smart displays"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CP PLUS"
      },
      {
        "label": "Model / Series",
        "value": "EzyKam+ CP-E38Q"
      },
      {
        "label": "Resolution",
        "value": "3 Megapixel (2304 x 1296)"
      },
      {
        "label": "Pan / Tilt Range",
        "value": "355\u00b0 Pan / 85\u00b0 Tilt"
      },
      {
        "label": "Audio",
        "value": "Built-in Mic & Speaker (2-Way Audio)"
      },
      {
        "label": "Smart Home",
        "value": "Alexa & Google Assistant Enabled"
      },
      {
        "label": "Storage",
        "value": "MicroSD Slot up to 256GB"
      },
      {
        "label": "Warranty",
        "value": "2 Years Brand Replacement"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-e38q-1",
        "label": "Single Camera Unit",
        "unit": "Piece",
        "price": 2350,
        "mrp": 4200,
        "discountPercent": 44,
        "stock": 60,
        "image": "/images/products/cctv/cp-plus-3mp-wifi-pt-camera-cp-e38q.webp"
      },
      {
        "id": "var-e38q-2",
        "label": "Dual Pack (2 Cameras)",
        "unit": "Pack of 2",
        "price": 4599,
        "mrp": 8400,
        "discountPercent": 45,
        "stock": 30,
        "image": "/images/products/cctv/cp-plus-3mp-wifi-pt-camera-cp-e38q.webp"
      }
    ],
    "price": 2350,
    "mrp": 4200,
    "discountPercent": 44,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CP PLUS Authorized Depot"
  },
  {
    "id": "prod-cctv-networking-cp-vac-t24l2",
    "slug": "cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2",
    "name": "CP Plus 2.4MP Full HD IR Bullet Camera CP-VAC-T24L2",
    "title": "CP Plus 2.4MP Full HD IR Bullet Camera CP-VAC-T24L2",
    "brand": "CP PLUS",
    "categorySlug": "cctv-networking",
    "categoryName": "CCTV & Networking",
    "subCategory": "Cameras",
    "image": "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2.webp",
    "images": [
      "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2.webp"
    ],
    "shortTagline": "Outdoor Heavy Weatherproof Bullet \u00b7 20m IR \u00b7 Metal-Polymer Body",
    "specChips": [
      "2.4MP HD Clarity",
      "20m IR Night Vision",
      "IP66 Rugged",
      "DWDR & BLC"
    ],
    "description": "Reliable outdoor bullet surveillance camera built for heavy weather durability. Provides crisp 2.4MP high-definition video through coaxial cables with universal compatibility across HDx, AHD, TVI, and CVBS DVR formats. Includes smart infrared LEDs for crisp nighttime capture.",
    "highlights": [
      "2.4MP high-performance sensor delivers vivid daylight and night footage",
      "Universal 4-in-1 switchable video output for seamless DVR integration",
      "High-grade IP66 weatherproofing protects against monsoon rain and dust",
      "Digital Wide Dynamic Range (DWDR) compensates for harsh backlighting",
      "3-axis mounting bracket supports flexible ceiling or wall installation"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CP PLUS"
      },
      {
        "label": "Model / Series",
        "value": "CP-VAC-T24L2 Astro Series"
      },
      {
        "label": "Resolution",
        "value": "2.4MP (1920 x 1080 Full HD)"
      },
      {
        "label": "Signal System",
        "value": "AHD / HDCVI / HDTVI / CVBS Switchable"
      },
      {
        "label": "IR Distance",
        "value": "20 Meters Smart Infrared"
      },
      {
        "label": "Enclosure Rating",
        "value": "IP66 Water & Dust Resistant"
      },
      {
        "label": "Operating Temp",
        "value": "-20\u00b0C to +60\u00b0C"
      },
      {
        "label": "Warranty",
        "value": "2 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-t24l2-1",
        "label": "Single Camera Unit",
        "unit": "Piece",
        "price": 1450,
        "mrp": 2600,
        "discountPercent": 44,
        "stock": 45,
        "image": "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2.webp"
      },
      {
        "id": "var-t24l2-4",
        "label": "Pack of 4 Cameras",
        "unit": "Pack of 4",
        "price": 5600,
        "mrp": 10400,
        "discountPercent": 46,
        "stock": 20,
        "image": "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2.webp"
      }
    ],
    "price": 1450,
    "mrp": 2600,
    "discountPercent": 44,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CP PLUS Authorized Depot"
  },
  {
    "id": "prod-cctv-networking-cp-vac-d24l2",
    "slug": "cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2",
    "name": "CP Plus 2.4MP Full HD IR Dome Camera CP-VAC-D24L2",
    "title": "CP Plus 2.4MP Full HD IR Dome Camera CP-VAC-D24L2",
    "brand": "CP PLUS",
    "categorySlug": "cctv-networking",
    "categoryName": "CCTV & Networking",
    "subCategory": "Cameras",
    "image": "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2.webp",
    "images": [
      "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2.webp"
    ],
    "shortTagline": "Indoor Ceiling Dome Camera \u00b7 2.4MP 1080p \u00b7 Smart Night Vision",
    "specChips": [
      "2.4MP Full HD",
      "Smart IR 20m",
      "4-in-1 Switchable",
      "Low Light ICR"
    ],
    "description": "Sleek indoor dome camera tailored for residential lobbies, offices, and retail showrooms. Engineered with a 2.4MP sensor and 3.6mm wide angle lens for complete room coverage. Supports all standard DVR systems with plug-and-play installation.",
    "highlights": [
      "Crisp 2.4MP 1080p resolution with accurate color reproduction",
      "Smart IR illumination prevents whitewash on close foreground objects",
      "Universal 4-in-1 output compatible with all popular DVR brands",
      "Discreet and compact dome design blends into finished ceilings",
      "Tested for continuous 24/7 non-stop surveillance operation"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CP PLUS"
      },
      {
        "label": "Model / Series",
        "value": "CP-VAC-D24L2 Astro Series"
      },
      {
        "label": "Sensor Type",
        "value": "1/2.7\" 2.4MP HQIS Pro Sensor"
      },
      {
        "label": "Focal Length",
        "value": "3.6mm Wide Angle Lens"
      },
      {
        "label": "Night Vision",
        "value": "20 Meters Infrared Range"
      },
      {
        "label": "Power Input",
        "value": "12V DC \u00b1 10%"
      },
      {
        "label": "Mounting",
        "value": "Ceiling / Wall Surface Mount"
      },
      {
        "label": "Warranty",
        "value": "2 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-d24l2-1",
        "label": "Single Camera Unit",
        "unit": "Piece",
        "price": 1390,
        "mrp": 2500,
        "discountPercent": 44,
        "stock": 50,
        "image": "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2.webp"
      },
      {
        "id": "var-d24l2-4",
        "label": "Pack of 4 Cameras",
        "unit": "Pack of 4",
        "price": 5350,
        "mrp": 10000,
        "discountPercent": 46,
        "stock": 25,
        "image": "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2.webp"
      }
    ],
    "price": 1390,
    "mrp": 2500,
    "discountPercent": 44,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CP PLUS Authorized Depot"
  },
  {
    "id": "prod-cpvc-plumbing-tanks-cpvc-pipe",
    "slug": "ashirvad-cpvc-flowguard-plus-pipe",
    "name": "Ashirvad CPVC Flowguard Plus Pipe, SDR-11, 5m Length",
    "title": "Ashirvad CPVC Flowguard Plus Pipe, SDR-11, 5m Length",
    "brand": "Ashirvad",
    "categorySlug": "cpvc-plumbing-tanks",
    "categoryName": "CPVC Plumbing & Overhead Tanks",
    "subCategory": "CPVC Pipes SDR 11",
    "image": "/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp",
    "images": [
      "/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp"
    ],
    "shortTagline": "SDR 11 \u00b7 93\u00b0C Hot & Cold Water \u00b7 NSF/ANSI 61 Certified",
    "specChips": [
      "SDR-11 Standard",
      "Hot & Cold 93\u00b0C",
      "Lead-Free",
      "50-Yr Design Life"
    ],
    "description": "High-performance CPVC plumbing pipe manufactured using Lubrizol FlowGuard Plus compound. Engineered to withstand continuous hot and cold water pressure up to 93\u00b0C without scaling or corrosion. 100% lead-free, non-toxic, and NSF 61 certified for safe drinking water.",
    "highlights": [
      "FlowGuard Plus specialized compound ensures zero microbial bacterial growth",
      "Rated for high working pressure of 28.1 kg/cm\u00b2 at 23\u00b0C and 8.79 kg/cm\u00b2 at 82\u00b0C",
      "100% corrosion proof and chemical resistant against hard borewell water",
      "Low thermal conductivity keeps hot water temperature steady with less energy loss",
      "Lightweight and simple one-step solvent weld installation ensures leak-free joints"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ashirvad by Aliaxis"
      },
      {
        "label": "Material Grade",
        "value": "CPVC FlowGuard Plus Compound"
      },
      {
        "label": "Standard / Class",
        "value": "IS 15778 / ASTM D2846 (SDR 11)"
      },
      {
        "label": "Standard Length",
        "value": "5.0 Meters (16.4 Feet)"
      },
      {
        "label": "Temperature Rating",
        "value": "Up to 93\u00b0C (200\u00b0F)"
      },
      {
        "label": "Certifications",
        "value": "NSF/ANSI 61, BIS ISI Marked"
      },
      {
        "label": "Expected Life",
        "value": "50+ Years Service Life"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-cpvc-half",
        "label": "1/2 Inch (15mm) \u00b7 5m Length",
        "unit": "Piece (5m)",
        "price": 305,
        "mrp": 635,
        "discountPercent": 52,
        "stock": 100,
        "image": "/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp"
      },
      {
        "id": "var-cpvc-34",
        "label": "3/4 Inch (20mm) \u00b7 5m Length",
        "unit": "Piece (5m)",
        "price": 445,
        "mrp": 890,
        "discountPercent": 50,
        "stock": 100,
        "image": "/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp"
      },
      {
        "id": "var-cpvc-1in",
        "label": "1.0 Inch (25mm) \u00b7 5m Length",
        "unit": "Piece (5m)",
        "price": 680,
        "mrp": 1280,
        "discountPercent": 47,
        "stock": 80,
        "image": "/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp"
      },
      {
        "id": "var-cpvc-125in",
        "label": "1.25 Inch (32mm) \u00b7 5m Length",
        "unit": "Piece (5m)",
        "price": 990,
        "mrp": 1850,
        "discountPercent": 46,
        "stock": 50,
        "image": "/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp"
      }
    ],
    "price": 305,
    "mrp": 635,
    "discountPercent": 52,
    "unit": "Piece (5m)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ashirvad Authorized Depot"
  },
  {
    "id": "prod-cpvc-plumbing-tanks-cpvc-cement",
    "slug": "ashirvad-flowguard-plus-solvent-cement",
    "name": "Ashirvad Flowguard Plus 1 Step CPVC Yellow Medium Solvent Cement",
    "title": "Ashirvad Flowguard Plus 1 Step CPVC Yellow Medium Solvent Cement",
    "brand": "Ashirvad",
    "categorySlug": "cpvc-plumbing-tanks",
    "categoryName": "CPVC Plumbing & Overhead Tanks",
    "subCategory": "Solvent Cements & Primers",
    "image": "/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp",
    "images": [
      "/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp"
    ],
    "shortTagline": "Fast 1-Step Chemical Fusion \u00b7 Zero Leaks \u00b7 Low VOC",
    "specChips": [
      "1-Step Fast Fusion",
      "Cures in 24 Hrs",
      "Yellow Medium Viscosity",
      "Low VOC Formula"
    ],
    "description": "Specially formulated one-step yellow medium-bodied CPVC solvent cement for permanent chemical fusion of pipes and fittings. Eliminates the need for a separate primer on pipes up to 2 inches. Creates a monolithic molecular joint stronger than the pipe itself.",
    "highlights": [
      "One-step application saves installation labor and eliminates primer step",
      "Yellow marker color provides clear visual verification of complete joint coverage",
      "Fast-acting chemical bond handles test pressure in as little as 15 minutes",
      "Certified safe for hot and cold potable drinking water plumbing lines",
      "Sealed airtight metal tin with convenient built-in dauber applicator"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ashirvad by Aliaxis"
      },
      {
        "label": "Viscosity Grade",
        "value": "Medium Bodied (Yellow)"
      },
      {
        "label": "Applicable Pipe",
        "value": "CPVC SDR 11 / SDR 13.5 up to 2\""
      },
      {
        "label": "Standard",
        "value": "ASTM F493 & NSF 14/61"
      },
      {
        "label": "Cure Time",
        "value": "Initial Set: 15 mins, Full Cure: 24 hrs"
      },
      {
        "label": "Shelf Life",
        "value": "24 Months from Packaging"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-sol-50ml",
        "label": "50 ml Tin",
        "unit": "Tin (50ml)",
        "price": 90,
        "mrp": 147,
        "discountPercent": 39,
        "stock": 120,
        "image": "/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp"
      },
      {
        "id": "var-sol-100ml",
        "label": "100 ml Tin",
        "unit": "Tin (100ml)",
        "price": 160,
        "mrp": 260,
        "discountPercent": 38,
        "stock": 100,
        "image": "/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp"
      },
      {
        "id": "var-sol-250ml",
        "label": "250 ml Tin with Dauber",
        "unit": "Tin (250ml)",
        "price": 340,
        "mrp": 540,
        "discountPercent": 37,
        "stock": 80,
        "image": "/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp"
      },
      {
        "id": "var-sol-500ml",
        "label": "500 ml Pro Can with Dauber",
        "unit": "Tin (500ml)",
        "price": 620,
        "mrp": 980,
        "discountPercent": 37,
        "stock": 50,
        "image": "/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp"
      }
    ],
    "price": 90,
    "mrp": 147,
    "discountPercent": 39,
    "unit": "Tin (50ml)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ashirvad Authorized Depot"
  },
  {
    "id": "prod-cpvc-plumbing-tanks-metal-clamp",
    "slug": "ashirvad-flowguard-metal-pipe-clamp",
    "name": "Ashirvad Flowguard Plus Metal Pipe Clamp/Strap",
    "title": "Ashirvad Flowguard Plus Metal Pipe Clamp/Strap",
    "brand": "Ashirvad",
    "categorySlug": "cpvc-plumbing-tanks",
    "categoryName": "CPVC Plumbing & Overhead Tanks",
    "subCategory": "CPVC Elbows, Tees & Couplers",
    "image": "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp",
    "images": [
      "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp"
    ],
    "shortTagline": "Powder Coated Metal Strap \u00b7 Prevents Pipe Sagging \u00b7 Heavy Gauge",
    "specChips": [
      "Heavy Gauge Metal",
      "Powder Coated",
      "Prevents Sagging",
      "Vibration Free"
    ],
    "description": "Durable powder-coated metal pipe saddle clamps designed to securely fix CPVC pipelines to walls and ceilings. Absorbs pipe vibration and prevents pipe sagging during high-pressure water flow. Resistant to rust and indoor humidity.",
    "highlights": [
      "Heavy-duty stamped steel bracket with protective anti-rust powder coat",
      "Maintains straight pipe alignment and prevents pressure hammer displacement",
      "Smooth rounded edges safeguard outer pipe walls from friction scratches",
      "Pre-drilled screw holes accommodate standard 1.5\" wall plugs and screws",
      "Engineered for both horizontal ceiling runs and vertical wall risers"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ashirvad by Aliaxis"
      },
      {
        "label": "Material",
        "value": "Heavy Gauge Mild Steel"
      },
      {
        "label": "Finish",
        "value": "Corrosion-Resistant Powder Coating"
      },
      {
        "label": "Fixing Type",
        "value": "Double-Ear Saddle Clamp"
      },
      {
        "label": "Application",
        "value": "Surface Mounted Water Pipelines"
      },
      {
        "label": "Packaging",
        "value": "Loose / Box of 50 Pieces"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-clamp-half",
        "label": "1/2 Inch (15mm)",
        "unit": "Piece",
        "price": 8,
        "mrp": 14,
        "discountPercent": 43,
        "stock": 300,
        "image": "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp"
      },
      {
        "id": "var-clamp-34",
        "label": "3/4 Inch (20mm)",
        "unit": "Piece",
        "price": 12,
        "mrp": 20,
        "discountPercent": 40,
        "stock": 300,
        "image": "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp"
      },
      {
        "id": "var-clamp-1in",
        "label": "1.0 Inch (25mm)",
        "unit": "Piece",
        "price": 16,
        "mrp": 26,
        "discountPercent": 38,
        "stock": 200,
        "image": "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp"
      },
      {
        "id": "var-clamp-125in",
        "label": "1.25 Inch (32mm)",
        "unit": "Piece",
        "price": 22,
        "mrp": 36,
        "discountPercent": 39,
        "stock": 150,
        "image": "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp"
      },
      {
        "id": "var-clamp-150in",
        "label": "1.50 Inch (40mm)",
        "unit": "Piece",
        "price": 28,
        "mrp": 45,
        "discountPercent": 38,
        "stock": 100,
        "image": "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp"
      },
      {
        "id": "var-clamp-200in",
        "label": "2.00 Inch (50mm)",
        "unit": "Piece",
        "price": 36,
        "mrp": 58,
        "discountPercent": 38,
        "stock": 80,
        "image": "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp"
      }
    ],
    "price": 8,
    "mrp": 14,
    "discountPercent": 43,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ashirvad Authorized Depot"
  },
  {
    "id": "prod-cpvc-plumbing-tanks-m-seal",
    "slug": "pidilite-m-seal-phataphat-90g",
    "name": "Pidilite M-Seal Phataphat 90g, Multi-Purpose Waterproof Sealant, Grey",
    "title": "Pidilite M-Seal Phataphat 90g, Multi-Purpose Waterproof Sealant, Grey",
    "brand": "Pidilite",
    "categorySlug": "cpvc-plumbing-tanks",
    "categoryName": "CPVC Plumbing & Overhead Tanks",
    "subCategory": "Solvent Cements & Primers",
    "image": "/images/products/plumbing/pidilite-m-seal-phataphat-90g.webp",
    "images": [
      "/images/products/plumbing/pidilite-m-seal-phataphat-90g.webp"
    ],
    "shortTagline": "Fast Setting Epoxy Putty \u00b7 Seals Leaks in 30 Mins \u00b7 High Adhesion",
    "specChips": [
      "30 Mins Setting",
      "Waterproof Seal",
      "Epoxy Putty",
      "Metal/PVC/Concrete"
    ],
    "description": "Two-part multi-purpose epoxy putty that seals leaks, repairs cracks, and fills joint gaps in plumbing, sanitation, and overhead tanks. Sets rock-hard in 30 minutes even on damp surfaces. Can be drilled, filed, tapped, and painted after curing.",
    "highlights": [
      "Sets in 30 minutes for quick, dependable emergency leak fixes",
      "Bonds tenaciously to metal, PVC, CPVC, ceramic, stone, and concrete",
      "100% waterproof and moisture resistant once hardened",
      "Resistant to hot water, mild acids, alkalis, and household chemicals",
      "Convenient 90g pack with resin and hardener bars for easy kneading"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Pidilite Industries"
      },
      {
        "label": "Type",
        "value": "2-Component Fast Curing Epoxy Putty"
      },
      {
        "label": "Net Weight",
        "value": "90 Grams (Resin + Hardener)"
      },
      {
        "label": "Color",
        "value": "Industrial Grey"
      },
      {
        "label": "Setting Time",
        "value": "Initial Set: 30 Mins, Full Cure: 3 Hours"
      },
      {
        "label": "Shelf Life",
        "value": "12 Months from Manufacturing"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-mseal-90g",
        "label": "90g Single Pack",
        "unit": "Pack (90g)",
        "price": 30,
        "mrp": 35,
        "discountPercent": 14,
        "stock": 250,
        "image": "/images/products/plumbing/pidilite-m-seal-phataphat-90g.webp"
      }
    ],
    "price": 30,
    "mrp": 35,
    "discountPercent": 14,
    "unit": "Pack (90g)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Pidilite Authorized Depot"
  },
  {
    "id": "prod-cpvc-plumbing-tanks-water-tank",
    "slug": "ashirvad-3-layer-water-tank",
    "name": "Ashirvad 3-Layer Anti-Bacterial Overhead Water Tank",
    "title": "Ashirvad 3-Layer Anti-Bacterial Overhead Water Tank",
    "brand": "Ashirvad",
    "categorySlug": "cpvc-plumbing-tanks",
    "categoryName": "CPVC Plumbing & Overhead Tanks",
    "subCategory": "Overhead Water Tanks",
    "image": "/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp",
    "images": [
      "/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp"
    ],
    "shortTagline": "100% Virgin Food-Grade HDPE \u00b7 UV Protected \u00b7 Anti-Bacterial Inner Layer",
    "specChips": [
      "3-Layer Construction",
      "Food-Grade Virgin HDPE",
      "UV Stabilized",
      "Anti-Algal"
    ],
    "description": "Triple-layer rotational molded overhead water storage tank made with 100% food-grade virgin raw material. Features an outer UV reflective shield, a middle foam insulation layer to maintain cooler water temperatures, and a white anti-bacterial inner lining that prevents algae formation.",
    "highlights": [
      "Food-grade 100% virgin polymer ensures odorless, hygienic drinking water",
      "UV stabilized outer layer shields against intense tropical sunlight and degradation",
      "Thermal insulation layer keeps tank water noticeably cooler in peak summer",
      "Smooth seamless inner layer inhibits algae growth and cleans effortlessly",
      "Heavy threaded screw lid keeps airborne dust, insects, and rain out"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ashirvad by Aliaxis"
      },
      {
        "label": "Layer Tech",
        "value": "Triple-Layer Rotomolded Polyethylene"
      },
      {
        "label": "Raw Material",
        "value": "100% Virgin Food Grade LLDPE"
      },
      {
        "label": "UV Stabilization",
        "value": "UV-20 Standard Outdoor Resistance"
      },
      {
        "label": "Warranty",
        "value": "10 Years Replacement Guarantee"
      },
      {
        "label": "Lid Type",
        "value": "Heavy-Duty Threaded Air-Tight Lid"
      },
      {
        "label": "Delivery Time",
        "value": "Same Day Truck Delivery (60-90 Mins)"
      }
    ],
    "variants": [
      {
        "id": "var-tank-500",
        "label": "500 Litres (Compact)",
        "unit": "Tank",
        "price": 3450,
        "mrp": 4600,
        "discountPercent": 25,
        "stock": 20,
        "image": "/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp"
      },
      {
        "id": "var-tank-1000",
        "label": "1000 Litres (Standard Home)",
        "unit": "Tank",
        "price": 5850,
        "mrp": 7800,
        "discountPercent": 25,
        "stock": 18,
        "image": "/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp"
      },
      {
        "id": "var-tank-2000",
        "label": "2000 Litres (Large Residential)",
        "unit": "Tank",
        "price": 11500,
        "mrp": 15500,
        "discountPercent": 26,
        "stock": 10,
        "image": "/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp"
      }
    ],
    "price": 3450,
    "mrp": 4600,
    "discountPercent": 25,
    "unit": "Tank",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ashirvad Authorized Depot"
  },
  {
    "id": "prod-cpvc-plumbing-tanks-cpvc-elbow",
    "slug": "ashirvad-cpvc-elbow-half-inch",
    "name": "Ashirvad CPVC 90 Degree Elbow SDR-11",
    "title": "Ashirvad CPVC 90 Degree Elbow SDR-11",
    "brand": "Ashirvad",
    "categorySlug": "cpvc-plumbing-tanks",
    "categoryName": "CPVC Plumbing & Overhead Tanks",
    "subCategory": "CPVC Elbows, Tees & Couplers",
    "image": "/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp",
    "images": [
      "/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp"
    ],
    "shortTagline": "Precision Molded 90\u00b0 Elbow \u00b7 SDR 11 Class \u00b7 Leak Proof Fusion",
    "specChips": [
      "90\u00b0 Angle Turn",
      "SDR-11 Rated",
      "Zero Flow Resistance",
      "Heavy Wall"
    ],
    "description": "Precision injection molded 90-degree CPVC elbow for sharp, reliable direction changes in hot and cold water plumbing lines. Engineered with smooth internal radii to minimize friction loss and prevent pressure drop across turns.",
    "highlights": [
      "High dimensional accuracy provides snug interference fit with CPVC pipes",
      "Smooth hydraulic internal bore minimizes water turbulence and noise",
      "Withstands repeated thermal shock up to 93\u00b0C without softening",
      "Chemical fusion bond eliminates mechanical joints and future leaks",
      "Meets all ASTM D2846 and BIS IS 15778 plumbing standards"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ashirvad by Aliaxis"
      },
      {
        "label": "Fitting Type",
        "value": "90\u00b0 Socket Weld Elbow"
      },
      {
        "label": "Standard",
        "value": "ASTM D2846 (SDR 11)"
      },
      {
        "label": "Material",
        "value": "Chlorinated Polyvinyl Chloride (CPVC)"
      },
      {
        "label": "Working Temp",
        "value": "Continuous 82\u00b0C / Peak 93\u00b0C"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-elb-half",
        "label": "1/2 Inch (15mm)",
        "unit": "Piece",
        "price": 18,
        "mrp": 28,
        "discountPercent": 36,
        "stock": 250,
        "image": "/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp"
      },
      {
        "id": "var-elb-34",
        "label": "3/4 Inch (20mm)",
        "unit": "Piece",
        "price": 26,
        "mrp": 42,
        "discountPercent": 38,
        "stock": 250,
        "image": "/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp"
      },
      {
        "id": "var-elb-1in",
        "label": "1.0 Inch (25mm)",
        "unit": "Piece",
        "price": 42,
        "mrp": 68,
        "discountPercent": 38,
        "stock": 180,
        "image": "/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp"
      }
    ],
    "price": 18,
    "mrp": 28,
    "discountPercent": 36,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ashirvad Authorized Depot"
  },
  {
    "id": "prod-cement-civil-works-ultra-wp",
    "slug": "ultratech-weather-plus-cement-50kg",
    "name": "UltraTech Weather Plus Cement 50kg Bag",
    "title": "UltraTech Weather Plus Cement 50kg Bag",
    "brand": "UltraTech",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement & Civil Works",
    "subCategory": "PPC Waterproofing Cement",
    "image": "/images/products/cement/ultratech-premium-cement-50kg-bag-weather-plus-waterproofing-solid-build.webp",
    "images": [
      "/images/products/cement/ultratech-premium-cement-50kg-bag-weather-plus-waterproofing-solid-build.webp"
    ],
    "shortTagline": "Engineered Water-Repellent Particles \u00b7 Dense Hydration Matrix",
    "specChips": [
      "Water Repellent",
      "OPC/PPC Blend",
      "Anti-Efflorescence",
      "Corrosion Guard"
    ],
    "description": "UltraTech Weather Plus is an advanced engineered water-repellent cement. Formulated with unique micro-particle packing that fills internal concrete voids and prevents capillary water ingress. Ideal for roof slabs, external plastering, basements, and coastal construction.",
    "highlights": [
      "Unique water-repellent technology shields concrete from dampness and seepage",
      "Significantly reduces efflorescence and salt-blooming on finished plaster",
      "Protects structural TMT steel rebars against chloride-induced rust",
      "Produces high early strength with exceptionally dense concrete compaction",
      "BIS ISI marked with rigorous quality control batch testing"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "UltraTech Cement Limited"
      },
      {
        "label": "Cement Type",
        "value": "Engineered Water-Repellent Blend (IS 1489)"
      },
      {
        "label": "Pack Size",
        "value": "50 kg Polypropylene Moisture-Proof Bag"
      },
      {
        "label": "Initial Setting Time",
        "value": "Minimum 30 Minutes"
      },
      {
        "label": "Final Setting Time",
        "value": "Maximum 600 Minutes"
      },
      {
        "label": "Key Standard",
        "value": "IS 1489 Part 1 Certified"
      },
      {
        "label": "Shelf Life",
        "value": "3 Months in Dry Covered Storage"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-wp-1",
        "label": "1 Bag (50kg)",
        "unit": "50kg Bag",
        "price": 420,
        "mrp": 480,
        "discountPercent": 13,
        "stock": 500,
        "image": "/images/products/cement/ultratech-premium-cement-50kg-bag-weather-plus-waterproofing-solid-build.webp"
      },
      {
        "id": "var-wp-10",
        "label": "10 Bags Pack",
        "unit": "10 Bags (500kg)",
        "price": 4150,
        "mrp": 4800,
        "discountPercent": 14,
        "stock": 50,
        "image": "/images/products/cement/ultratech-premium-cement-50kg-bag-weather-plus-waterproofing-solid-build.webp"
      },
      {
        "id": "var-wp-50",
        "label": "50 Bags Wholesale Lot",
        "unit": "50 Bags (2.5 Tons)",
        "price": 20500,
        "mrp": 24000,
        "discountPercent": 15,
        "stock": 20,
        "image": "/images/products/cement/ultratech-premium-cement-50kg-bag-weather-plus-waterproofing-solid-build.webp"
      }
    ],
    "price": 420,
    "mrp": 480,
    "discountPercent": 12,
    "unit": "50kg Bag",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "UltraTech Authorized Depot"
  },
  {
    "id": "prod-cement-civil-works-acc-gold",
    "slug": "acc-gold-water-shield-cement-50kg",
    "name": "ACC Gold Water Shield Water Repellent Cement 50kg",
    "title": "ACC Gold Water Shield Water Repellent Cement 50kg",
    "brand": "ACC",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement & Civil Works",
    "subCategory": "PPC Waterproofing Cement",
    "image": "/images/products/cement/acc-gold-water-shield.webp",
    "images": [
      "/images/products/cement/acc-gold-water-shield.webp"
    ],
    "shortTagline": "Water Shield Formula \u00b7 Damp Proof \u00b7 High Compressive Strength",
    "specChips": [
      "Water Shield Formula",
      "Damp Proof",
      "Dense Matrix",
      "Tamper Proof Bag"
    ],
    "description": "Premium quality water-repellent cement featuring ACC's specialized water shield formula. Specially developed to resist moisture penetration through roofs, external brick joints, and foundations. Packed in tamper-proof moisture-resistant bags.",
    "highlights": [
      "Forms an impenetrable water-shield layer inside the concrete structure",
      "Eliminates capillary moisture rising in ground floors and foundation footings",
      "Provides higher 28-day compressive strength exceeding standard IS benchmarks",
      "Silky smooth consistency delivers effortless workability for site masons",
      "Tamper-proof sealed laminated bag prevents atmospheric moisture absorption"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "ACC Limited (Adani Group)"
      },
      {
        "label": "Product Series",
        "value": "ACC Gold Water Shield"
      },
      {
        "label": "Grade / Standard",
        "value": "IS 1489 PPC Special Blend"
      },
      {
        "label": "Packaging",
        "value": "50kg Laminated Tamper-Proof Bag"
      },
      {
        "label": "Compressive Strength (28D)",
        "value": "Exceeds 53 MPa"
      },
      {
        "label": "Recommended Use",
        "value": "RCC Roof Slabs, Beams & External Plaster"
      },
      {
        "label": "Warranty / Assurance",
        "value": "100% Factory Fresh Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-acc-1",
        "label": "1 Bag (50kg)",
        "unit": "50kg Bag",
        "price": 435,
        "mrp": 495,
        "discountPercent": 12,
        "stock": 400,
        "image": "/images/products/cement/acc-gold-water-shield.webp"
      },
      {
        "id": "var-acc-25",
        "label": "25 Bags Half Pallet",
        "unit": "25 Bags (1.25 Tons)",
        "price": 10750,
        "mrp": 12375,
        "discountPercent": 13,
        "stock": 30,
        "image": "/images/products/cement/acc-gold-water-shield.webp"
      },
      {
        "id": "var-acc-50",
        "label": "50 Bags Full Pallet",
        "unit": "50 Bags (2.5 Tons)",
        "price": 21250,
        "mrp": 24750,
        "discountPercent": 14,
        "stock": 15,
        "image": "/images/products/cement/acc-gold-water-shield.webp"
      }
    ],
    "price": 435,
    "mrp": 495,
    "discountPercent": 12,
    "unit": "50kg Bag",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "ACC Authorized Depot"
  },
  {
    "id": "prod-cement-civil-works-red-bricks",
    "slug": "first-class-red-clay-brick",
    "name": "First Class Kiln-Fired Red Clay Construction Bricks",
    "title": "First Class Kiln-Fired Red Clay Construction Bricks",
    "brand": "CONON Assured",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement & Civil Works",
    "subCategory": "First Class Red Bricks",
    "image": "/images/products/bricks/first-class-red-brick.webp",
    "images": [
      "/images/products/bricks/first-class-red-brick.webp"
    ],
    "shortTagline": "Table-Moulded \u00b7 Kiln-Fired \u00b7 Sharp Edges \u00b7 High Crushing Load",
    "specChips": [
      "Table Moulded",
      "Kiln Fired",
      "Sharp Edges",
      "Sound Metallic Ring"
    ],
    "description": "Traditional first-class table-moulded red clay bricks burnt in continuous kilns for uniform hardness and deep cherry-red color. Delivers exceptional crushing strength with sharp, well-defined arrises and minimum water absorption for load-bearing walls.",
    "highlights": [
      "Uniform standard size (9 x 4.25 x 2.75 inches) with clean sharp edges",
      "High compressive strength above 10.5 N/mm\u00b2 for multi-story load bearing masonry",
      "Water absorption strictly under 15% by dry weight after 24 hours soaking",
      "Emits a distinct clear metallic ringing sound upon impact with another brick",
      "Direct truckload delivery directly to site with careful tipping"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CONON Assured Kilns"
      },
      {
        "label": "Brick Class",
        "value": "Class 10.5 / Grade A First Class"
      },
      {
        "label": "Manufacturing Method",
        "value": "Table Moulded, Coal Kiln Fired"
      },
      {
        "label": "Nominal Dimensions",
        "value": "9\" x 4.25\" x 2.75\" (228 x 108 x 70 mm)"
      },
      {
        "label": "Water Absorption",
        "value": "< 15% per IS 3495"
      },
      {
        "label": "Compressive Strength",
        "value": "10.5 - 12.5 N/mm\u00b2"
      },
      {
        "label": "Standard",
        "value": "IS 1077 Compliant"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-brick-500",
        "label": "500 Bricks (Mini Load)",
        "unit": "500 Pieces",
        "price": 5000,
        "mrp": 6500,
        "discountPercent": 23,
        "stock": 100,
        "image": "/images/products/bricks/first-class-red-brick.webp"
      },
      {
        "id": "var-brick-1000",
        "label": "1000 Bricks (Standard Tipper)",
        "unit": "1000 Pieces",
        "price": 9800,
        "mrp": 13000,
        "discountPercent": 25,
        "stock": 80,
        "image": "/images/products/bricks/first-class-red-brick.webp"
      },
      {
        "id": "var-brick-3000",
        "label": "3000 Bricks (Full Truckload)",
        "unit": "3000 Pieces",
        "price": 28500,
        "mrp": 39000,
        "discountPercent": 27,
        "stock": 30,
        "image": "/images/products/bricks/first-class-red-brick.webp"
      }
    ],
    "price": 5000,
    "mrp": 6500,
    "discountPercent": 23,
    "unit": "500 Pieces",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CONON Assured Authorized Depot"
  },
  {
    "id": "prod-cement-civil-works-aac-blocks",
    "slug": "magicrete-aac-blocks-600x200",
    "name": "Magicrete Lightweight Thermal AAC Blocks (600x200x150mm)",
    "title": "Magicrete Lightweight Thermal AAC Blocks (600x200x150mm)",
    "brand": "Magicrete",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement & Civil Works",
    "subCategory": "Magicrete AAC Blocks",
    "image": "/images/products/bricks/aac-block-600-200-150mm.webp",
    "images": [
      "/images/products/bricks/aac-block-600-200-150mm.webp"
    ],
    "shortTagline": "Autoclaved Aerated Concrete \u00b7 3x Lighter Than Red Bricks \u00b7 Thermal Insulated",
    "specChips": [
      "Autoclaved Aerated",
      "Lightweight (1/3 wt)",
      "Thermal Insulated",
      "Fire Resistant 4hr"
    ],
    "description": "Precision-engineered Autoclaved Aerated Concrete (AAC) blocks engineered for modern high-rise framing. Weighs one-third of conventional clay bricks, drastically reducing structural dead load. Provides superior thermal insulation and 4-hour fire resistance.",
    "highlights": [
      "Saves up to 20% in structural steel and foundation concrete requirements",
      "Superb thermal insulation cuts indoor air conditioning power bills by 25%",
      "Precision dimensional tolerance (\u00b11.5mm) minimizes joint mortar thickness",
      "Non-combustible mineral composition offers 4-hour fire barrier protection",
      "Significantly speeds up masonry construction compared to traditional bricks"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Magicrete Building Solutions"
      },
      {
        "label": "Material Type",
        "value": "Autoclaved Aerated Concrete (AAC)"
      },
      {
        "label": "Dimensions",
        "value": "600 mm (L) x 200 mm (H) x 150 mm (W)"
      },
      {
        "label": "Dry Density",
        "value": "550 - 650 kg/m\u00b3"
      },
      {
        "label": "Compressive Strength",
        "value": "3.5 - 4.5 N/mm\u00b2 (IS 2185 Part 3)"
      },
      {
        "label": "Thermal Conductivity",
        "value": "0.16 W/m-K (IS 3792)"
      },
      {
        "label": "Standard",
        "value": "IS 2185 (Part 3) Certified"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-aac-100",
        "label": "100 mm Thickness (Partition Wall)",
        "unit": "Block",
        "price": 52,
        "mrp": 68,
        "discountPercent": 24,
        "stock": 400,
        "image": "/images/products/bricks/aac-block-600-200-150mm.webp"
      },
      {
        "id": "var-aac-150",
        "label": "150 mm Thickness (Standard Wall)",
        "unit": "Block",
        "price": 68,
        "mrp": 85,
        "discountPercent": 20,
        "stock": 500,
        "image": "/images/products/bricks/aac-block-600-200-150mm.webp"
      },
      {
        "id": "var-aac-200",
        "label": "200 mm Thickness (Exterior Wall)",
        "unit": "Block",
        "price": 88,
        "mrp": 115,
        "discountPercent": 23,
        "stock": 350,
        "image": "/images/products/bricks/aac-block-600-200-150mm.webp"
      }
    ],
    "price": 52,
    "mrp": 68,
    "discountPercent": 24,
    "unit": "Block",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Magicrete Authorized Depot"
  },
  {
    "id": "prod-cement-civil-works-m-sand",
    "slug": "construction-m-sand-zone-ii",
    "name": "Manufactured M-Sand Zone-II Concrete Grade",
    "title": "Manufactured M-Sand Zone-II Concrete Grade",
    "brand": "CONON Assured",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement & Civil Works",
    "subCategory": "Screened River Sand & M-Sand",
    "image": "/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp",
    "images": [
      "/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp"
    ],
    "shortTagline": "Triple-Washed \u00b7 VSI Machine Crushed \u00b7 Zero Silt \u00b7 Zone-II Certified",
    "specChips": [
      "Zone-II Graded",
      "VSI Machine Crushed",
      "Silt < 1%",
      "Triple Washed"
    ],
    "description": "High-grade manufactured sand (M-Sand) produced by 3-stage VSI (Vertical Shaft Impactor) granite crushing. Meets strict IS 383 Zone-II concrete grading requirements with cubical grain shapes and less than 1% silt. Produces higher concrete strength with lower cement consumption.",
    "highlights": [
      "Free from silt, organic impurities, and clay lumps commonly found in river sand",
      "Cubical grain geometry maximizes concrete compaction and reduces water demand",
      "Guaranteed consistent quality and grading from foundation through casting",
      "100% eco-friendly legal substitute for depleted riverbed sand",
      "Accurate weighed billing directly via electronic weighbridge receipt"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CONON Assured Aggregates"
      },
      {
        "label": "Grading Zone",
        "value": "Zone-II as per IS 383:2016"
      },
      {
        "label": "Silt Content",
        "value": "< 1.0% (Laboratory Certified)"
      },
      {
        "label": "Fineness Modulus",
        "value": "2.60 - 2.90"
      },
      {
        "label": "Specific Gravity",
        "value": "2.65 - 2.70"
      },
      {
        "label": "Recommended Use",
        "value": "RCC Slabs, Columns, Beams & Foundation"
      },
      {
        "label": "Weighment",
        "value": "Electronic Weighbridge Slip Provided"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-sand-1ton",
        "label": "1 Ton Loose Bagged",
        "unit": "Ton",
        "price": 1450,
        "mrp": 1800,
        "discountPercent": 19,
        "stock": 200,
        "image": "/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp"
      },
      {
        "id": "var-sand-3ton",
        "label": "3 Tons Mini-Tipper",
        "unit": "3 Tons Tipper",
        "price": 4200,
        "mrp": 5400,
        "discountPercent": 22,
        "stock": 40,
        "image": "/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp"
      },
      {
        "id": "var-sand-10ton",
        "label": "10 Tons Heavy Dumper",
        "unit": "10 Tons Dumper",
        "price": 13500,
        "mrp": 18000,
        "discountPercent": 25,
        "stock": 20,
        "image": "/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp"
      }
    ],
    "price": 1450,
    "mrp": 1800,
    "discountPercent": 19,
    "unit": "Ton",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CONON Assured Authorized Depot"
  },
  {
    "id": "prod-cement-civil-works-stone-aggregate",
    "slug": "machine-crushed-20mm-stone-aggregate",
    "name": "Machine Crushed 20mm Blue Stone Aggregate (Gitti)",
    "title": "Machine Crushed 20mm Blue Stone Aggregate (Gitti)",
    "brand": "CONON Assured",
    "categorySlug": "cement-civil-works",
    "categoryName": "Cement & Civil Works",
    "subCategory": "Screened River Sand & M-Sand",
    "image": "/images/products/aggregate/20mm-crusher-gitti.webp",
    "images": [
      "/images/products/aggregate/20mm-crusher-gitti.webp"
    ],
    "shortTagline": "Hard Black Trap Basalt \u00b7 20mm Graded \u00b7 High Impact Resistance",
    "specChips": [
      "20mm Graded",
      "Basalt Stone",
      "Low Flakiness",
      "High Impact Value"
    ],
    "description": "Heavy-duty machine-crushed 20mm blue metal stone aggregate (Gitti) quarried from dense black basalt rock. Sieve-screened to ensure angular, cubical particle distribution with minimal flakiness index for RCC structural concrete works.",
    "highlights": [
      "High crushing value (> 300 MPa rock strength) ensures robust RCC structural framing",
      "Low flakiness and elongation index (< 15%) per IS 2386 testing standards",
      "Machine washed to remove stone dust and crusher flour before site delivery",
      "Forms ideal aggregate interlocking for M20, M25, and M30 grade concrete mixes",
      "Supplied directly from certified quarry crushers with weighbridge slips"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CONON Assured Quarries"
      },
      {
        "label": "Nominal Size",
        "value": "20 mm (Graded 20mm - 4.75mm)"
      },
      {
        "label": "Rock Origin",
        "value": "Hard Dense Black Trap Basalt"
      },
      {
        "label": "Aggregate Crushing Value",
        "value": "< 20% (High Strength)"
      },
      {
        "label": "Aggregate Impact Value",
        "value": "< 18%"
      },
      {
        "label": "Standard",
        "value": "IS 383:2016 Compliant"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-agg-1ton",
        "label": "1 Ton Loose Bagged",
        "unit": "Ton",
        "price": 1550,
        "mrp": 1950,
        "discountPercent": 21,
        "stock": 180,
        "image": "/images/products/aggregate/20mm-crusher-gitti.webp"
      },
      {
        "id": "var-agg-3ton",
        "label": "3 Tons Mini-Tipper",
        "unit": "3 Tons Tipper",
        "price": 4500,
        "mrp": 5850,
        "discountPercent": 23,
        "stock": 35,
        "image": "/images/products/aggregate/20mm-crusher-gitti.webp"
      },
      {
        "id": "var-agg-10ton",
        "label": "10 Tons Heavy Dumper",
        "unit": "10 Tons Dumper",
        "price": 14500,
        "mrp": 19500,
        "discountPercent": 26,
        "stock": 20,
        "image": "/images/products/aggregate/20mm-crusher-gitti.webp"
      }
    ],
    "price": 1550,
    "mrp": 1950,
    "discountPercent": 21,
    "unit": "Ton",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CONON Assured Authorized Depot"
  },
  {
    "id": "prod-plywood-boards-century-marine",
    "slug": "centuryply-club-prime-bwp-marine",
    "name": "CenturyPly Club Prime BWP Marine Grade Waterproof Plywood (8x4 ft)",
    "title": "CenturyPly Club Prime BWP Marine Grade Waterproof Plywood (8x4 ft)",
    "brand": "CenturyPly",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood & Boards",
    "subCategory": "BWP Marine 710 Plywood",
    "image": "/images/products/wood/centuryply-marine-ply-19mm.webp",
    "images": [
      "/images/products/wood/centuryply-marine-ply-19mm.webp"
    ],
    "shortTagline": "IS 710 BWP Marine \u00b7 30-Year Warranty \u00b7 Boiling Water Proof",
    "specChips": [
      "IS 710 BWP",
      "Calibrated Core",
      "Termite Borer Proof",
      "30-Yr Warranty"
    ],
    "description": "CenturyPly Club Prime is an authentic IS:710 certified Boiling Waterproof (BWP) marine plywood. Built with high-density hardwood core veneers and bonded under intense hydraulic pressure with synthetic phenol formaldehyde resin. Guaranteed 100% borer and termite proof for kitchens and bathrooms.",
    "highlights": [
      "Boiling Water Proof (BWP) passes 72 hours continuous boiling test without delamination",
      "Pre-pressed quadruple-layer calibration gives uniform sheet thickness (zero waviness)",
      "GLP (Glue Line Protection) technology ensures total immunity against subterranean termites",
      "Selected hardwood timber veneers yield high nail and screw holding strength",
      "Backed by CenturyPly's landmark 30-year manufacturer replacement warranty"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CenturyPly Limited"
      },
      {
        "label": "Grade / Standard",
        "value": "IS 710 Marine BWP Grade"
      },
      {
        "label": "Dimensions",
        "value": "8 Feet x 4 Feet (2440 x 1220 mm)"
      },
      {
        "label": "Timber Core",
        "value": "100% Selected Hardwood Species"
      },
      {
        "label": "Bonding Resin",
        "value": "Phenol Formaldehyde Synthetic Resin"
      },
      {
        "label": "Borer / Termite",
        "value": "Chemically Treated (Termite & Borer Proof)"
      },
      {
        "label": "Warranty",
        "value": "30 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-ply-6mm",
        "label": "6 mm Sheet (8x4 ft)",
        "unit": "Sheet",
        "price": 1450,
        "mrp": 1850,
        "discountPercent": 22,
        "stock": 50,
        "image": "/images/products/wood/centuryply-marine-ply-19mm.webp"
      },
      {
        "id": "var-ply-12mm",
        "label": "12 mm Sheet (8x4 ft)",
        "unit": "Sheet",
        "price": 2150,
        "mrp": 2750,
        "discountPercent": 22,
        "stock": 60,
        "image": "/images/products/wood/centuryply-marine-ply-19mm.webp"
      },
      {
        "id": "var-ply-16mm",
        "label": "16 mm Sheet (8x4 ft)",
        "unit": "Sheet",
        "price": 2550,
        "mrp": 3250,
        "discountPercent": 22,
        "stock": 45,
        "image": "/images/products/wood/centuryply-marine-ply-19mm.webp"
      },
      {
        "id": "var-ply-19mm",
        "label": "19 mm Heavy Sheet (8x4 ft)",
        "unit": "Sheet",
        "price": 2850,
        "mrp": 3600,
        "discountPercent": 21,
        "stock": 70,
        "image": "/images/products/wood/centuryply-marine-ply-19mm.webp"
      }
    ],
    "price": 1450,
    "mrp": 1850,
    "discountPercent": 22,
    "unit": "Sheet",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CenturyPly Authorized Depot"
  },
  {
    "id": "prod-plywood-boards-tesa-hdhmr",
    "slug": "action-tesa-hdhmr-board",
    "name": "Action TESA High Density High Moisture Resistance (HDHMR) Board (8x4 ft)",
    "title": "Action TESA High Density High Moisture Resistance (HDHMR) Board (8x4 ft)",
    "brand": "Action TESA",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood & Boards",
    "subCategory": "Action TESA HDHMR",
    "image": "/images/products/wood/action-tesa-hdhmr-18mm.webp",
    "images": [
      "/images/products/wood/action-tesa-hdhmr-18mm.webp"
    ],
    "shortTagline": "High Density 850+ kg/m\u00b3 \u00b7 Extreme Moisture Resistance \u00b7 Perfectly Flat",
    "specChips": [
      "Density > 850 kg/m\u00b3",
      "Water Resistant",
      "Zero Chipping",
      "CNC Routing Ready"
    ],
    "description": "Action TESA HDHMR is an ultra-dense engineered wood panel designed to outperform traditional plywood in modular kitchens and wardrobes. Manufactured with hardwood fibers and advanced moisture-resistant resins for an ultra-smooth finish ready for high-gloss PU paint and CNC routing.",
    "highlights": [
      "High density exceeding 850 kg/m\u00b3 provides superior core screw holding capability",
      "Moisture resistance prevents swelling and edge expansion in humid kitchen areas",
      "Homogeneous core allows intricate 3D CNC routing and sharp profiling without chipping",
      "Mirror-flat surface saves sanding labor and provides flawless laminate and acrylic bonding",
      "Borer and termite resistant with uniform density throughout the panel"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Action TESA (Balaji Action Buildwell)"
      },
      {
        "label": "Board Type",
        "value": "HDHMR (High Density High Moisture Resistance)"
      },
      {
        "label": "Standard Dimensions",
        "value": "8 Feet x 4 Feet (2440 x 1220 mm)"
      },
      {
        "label": "Density",
        "value": "850 - 900 kg/m\u00b3"
      },
      {
        "label": "Internal Bond Strength",
        "value": "0.90 N/mm\u00b2"
      },
      {
        "label": "Screw Withdrawal (Face)",
        "value": "> 2200 N"
      },
      {
        "label": "Eco-Standard",
        "value": "E1 / Carb Phase II Certified"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-hdhmr-12mm",
        "label": "12 mm (8x4 ft)",
        "unit": "Sheet",
        "price": 1850,
        "mrp": 2350,
        "discountPercent": 21,
        "stock": 40,
        "image": "/images/products/wood/action-tesa-hdhmr-18mm.webp"
      },
      {
        "id": "var-hdhmr-16mm",
        "label": "16.75 mm (8x4 ft)",
        "unit": "Sheet",
        "price": 2250,
        "mrp": 2850,
        "discountPercent": 21,
        "stock": 40,
        "image": "/images/products/wood/action-tesa-hdhmr-18mm.webp"
      },
      {
        "id": "var-hdhmr-18mm",
        "label": "18 mm Standard (8x4 ft)",
        "unit": "Sheet",
        "price": 2450,
        "mrp": 3100,
        "discountPercent": 21,
        "stock": 55,
        "image": "/images/products/wood/action-tesa-hdhmr-18mm.webp"
      }
    ],
    "price": 1850,
    "mrp": 2350,
    "discountPercent": 21,
    "unit": "Sheet",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Action TESA Authorized Depot"
  },
  {
    "id": "prod-plywood-boards-green-mr",
    "slug": "greenply-ecotec-mr-303-plywood",
    "name": "Greenply Ecotec Commercial MR Moisture Resistant Plywood (8x4 ft)",
    "title": "Greenply Ecotec Commercial MR Moisture Resistant Plywood (8x4 ft)",
    "brand": "Greenply",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood & Boards",
    "subCategory": "Commercial MR Plywood",
    "image": "/images/products/wood/greenply-ecotec-mr-303-plywood.webp",
    "images": [
      "/images/products/wood/greenply-ecotec-mr-303-plywood.webp"
    ],
    "shortTagline": "IS 303 MR Grade \u00b7 Calibrated Surface \u00b7 Bedroom & Living Furniture",
    "specChips": [
      "IS 303 MR Grade",
      "Commercial Plywood",
      "Borer Proof",
      "Calibrated Core"
    ],
    "description": "Greenply Ecotec is an authentic IS:303 Moisture Resistant (MR) grade commercial plywood engineered for bedroom wardrobes, living room credenzas, and wall paneling. Built with selected hardwood veneers bonded with melamine-fortified urea formaldehyde resin.",
    "highlights": [
      "IS:303 certified moisture resistant grade suitable for all dry interior furniture",
      "Special chemical preservation treatment protects veneers against wood borers",
      "Uniform core assembly eliminates internal gaps and hollow overlapping pockets",
      "Smooth machine-sanded exterior facilitates clean manual or press laminate gluing",
      "Reliable brand guarantee from Greenply with batch barcode tracking"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Greenply Industries Limited"
      },
      {
        "label": "Grade / Standard",
        "value": "IS 303 Commercial MR Grade"
      },
      {
        "label": "Dimensions",
        "value": "8 Feet x 4 Feet (2440 x 1220 mm)"
      },
      {
        "label": "Core Material",
        "value": "Seasoned Hardwood Veneers"
      },
      {
        "label": "Resin",
        "value": "Melamine Urea Formaldehyde (MUF)"
      },
      {
        "label": "Resistance",
        "value": "Moisture & Borer Resistant"
      },
      {
        "label": "Warranty",
        "value": "10 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-mr-6mm",
        "label": "6 mm (8x4 ft)",
        "unit": "Sheet",
        "price": 980,
        "mrp": 1250,
        "discountPercent": 22,
        "stock": 45,
        "image": "/images/products/wood/greenply-ecotec-mr-303-plywood.webp"
      },
      {
        "id": "var-mr-9mm",
        "label": "9 mm (8x4 ft)",
        "unit": "Sheet",
        "price": 1320,
        "mrp": 1680,
        "discountPercent": 21,
        "stock": 40,
        "image": "/images/products/wood/greenply-ecotec-mr-303-plywood.webp"
      },
      {
        "id": "var-mr-12mm",
        "label": "12 mm (8x4 ft)",
        "unit": "Sheet",
        "price": 1550,
        "mrp": 1980,
        "discountPercent": 22,
        "stock": 50,
        "image": "/images/products/wood/greenply-ecotec-mr-303-plywood.webp"
      },
      {
        "id": "var-mr-18mm",
        "label": "18 mm (8x4 ft)",
        "unit": "Sheet",
        "price": 1850,
        "mrp": 2350,
        "discountPercent": 21,
        "stock": 60,
        "image": "/images/products/wood/greenply-ecotec-mr-303-plywood.webp"
      }
    ],
    "price": 980,
    "mrp": 1250,
    "discountPercent": 22,
    "unit": "Sheet",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Greenply Authorized Depot"
  },
  {
    "id": "prod-plywood-boards-tesa-hdf",
    "slug": "action-tesa-hdf-board",
    "name": "Action TESA Premium High Density Fiberboard HDF Board (8x4 ft)",
    "title": "Action TESA Premium High Density Fiberboard HDF Board (8x4 ft)",
    "brand": "Action TESA",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood & Boards",
    "subCategory": "Boilo Water Resistant Boards",
    "image": "/images/products/wood/action-tesa-hdf-6mm-8-4.webp",
    "images": [
      "/images/products/wood/action-tesa-hdf-6mm-8-4.webp"
    ],
    "shortTagline": "High Density Fiberboard \u00b7 Ultra-Smooth Face \u00b7 Ideal for Back Panels & Partitions",
    "specChips": [
      "Density > 900 kg/m\u00b3",
      "Ultra Smooth",
      "Uniform Thickness",
      "Paint Ready"
    ],
    "description": "Precision-engineered High Density Fiberboard (HDF) with a rock-solid density over 900 kg/m\u00b3. Ideal for wardrobe backings, drawer bottoms, speaker enclosures, and decorative door skins. Delivers an ultra-smooth surface for direct spray painting.",
    "highlights": [
      "High density over 900 kg/m\u00b3 ensures high tensile strength and puncture resistance",
      "Perfect calibrated thickness eliminates wobbling in thin drawer bases and back panels",
      "Silk-smooth surface requires zero sanding prior to primer and lacquer coating",
      "100% knot-free and void-free homogeneous wood fiber composition",
      "Termite and borer treated for extended durability inside wardrobes"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Action TESA"
      },
      {
        "label": "Type",
        "value": "High Density Fiberboard (HDF)"
      },
      {
        "label": "Sheet Dimensions",
        "value": "8 Feet x 4 Feet (2440 x 1220 mm)"
      },
      {
        "label": "Density",
        "value": "900 - 950 kg/m\u00b3"
      },
      {
        "label": "Moisture Content",
        "value": "5 - 8%"
      },
      {
        "label": "Application",
        "value": "Wardrobe Backing, Drawer Bottoms & Skins"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-hdf-3mm",
        "label": "3 mm Backing (8x4 ft)",
        "unit": "Sheet",
        "price": 750,
        "mrp": 980,
        "discountPercent": 23,
        "stock": 60,
        "image": "/images/products/wood/action-tesa-hdf-6mm-8-4.webp"
      },
      {
        "id": "var-hdf-55mm",
        "label": "5.5 mm Sturdy (8x4 ft)",
        "unit": "Sheet",
        "price": 1150,
        "mrp": 1550,
        "discountPercent": 26,
        "stock": 50,
        "image": "/images/products/wood/action-tesa-hdf-6mm-8-4.webp"
      },
      {
        "id": "var-hdf-8mm",
        "label": "8 mm Solid (8x4 ft)",
        "unit": "Sheet",
        "price": 1480,
        "mrp": 1950,
        "discountPercent": 24,
        "stock": 40,
        "image": "/images/products/wood/action-tesa-hdf-6mm-8-4.webp"
      }
    ],
    "price": 750,
    "mrp": 980,
    "discountPercent": 23,
    "unit": "Sheet",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Action TESA Authorized Depot"
  },
  {
    "id": "prod-plywood-boards-century-bb",
    "slug": "century-block-board-19mm",
    "name": "CenturyPine Pine-Wood Core Heavy Blockboard 19mm (8x4 ft)",
    "title": "CenturyPine Pine-Wood Core Heavy Blockboard 19mm (8x4 ft)",
    "brand": "CenturyPly",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood & Boards",
    "subCategory": "Blockboards & Flush Doors",
    "image": "/images/products/wood/century-block-board-19mm-8-4.webp",
    "images": [
      "/images/products/wood/century-block-board-19mm-8-4.webp"
    ],
    "shortTagline": "Solid Pine Wood Battens \u00b7 Zero Bending / Warping \u00b7 Heavy Wardrobe Shutters",
    "specChips": [
      "Seasoned Pine Battens",
      "Zero Sagging",
      "IS 1659 Certified",
      "Screw Holding"
    ],
    "description": "CenturyPine heavy blockboard constructed with seasoned, chemically treated New Zealand pine battens sandwiched between selected hardwood face veneers. Does not bend, warp, or sag over long spans, making it the premier choice for tall wardrobe shutter doors.",
    "highlights": [
      "High-temperature vacuum pressure seasoned pine wood battens ensure zero warp",
      "High modulus of rupture resists sagging under heavy wardrobe door loads",
      "Edge-to-edge batten joinery provides rock-solid screw bite for hinges and locks",
      "IS 1659 compliant blockboard with superior flat dimensional stability",
      "Dual-side calibrated hardwood veneers for smooth laminate pressing"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CenturyPly Limited"
      },
      {
        "label": "Core Material",
        "value": "100% Seasoned Pine Wood Battens"
      },
      {
        "label": "Dimensions",
        "value": "8 Feet x 4 Feet (2440 x 1220 mm)"
      },
      {
        "label": "Thickness",
        "value": "19 mm Heavy Grade"
      },
      {
        "label": "Standard",
        "value": "IS 1659 Certified"
      },
      {
        "label": "Warranty",
        "value": "15 Years Brand Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-bb-mr",
        "label": "19mm Commercial MR (8x4 ft)",
        "unit": "Sheet",
        "price": 2750,
        "mrp": 3450,
        "discountPercent": 20,
        "stock": 40,
        "image": "/images/products/wood/century-block-board-19mm-8-4.webp"
      },
      {
        "id": "var-bb-bwp",
        "label": "19mm BWP Waterproof (8x4 ft)",
        "unit": "Sheet",
        "price": 3250,
        "mrp": 4100,
        "discountPercent": 21,
        "stock": 35,
        "image": "/images/products/wood/century-block-board-19mm-8-4.webp"
      }
    ],
    "price": 2750,
    "mrp": 3450,
    "discountPercent": 20,
    "unit": "Sheet",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CenturyPly Authorized Depot"
  },
  {
    "id": "prod-plywood-boards-century-flush",
    "slug": "century-flush-door-bwp",
    "name": "CenturyPly Club Prime BWP Waterproof Flush Door (7x3 ft, 32mm)",
    "title": "CenturyPly Club Prime BWP Waterproof Flush Door (7x3 ft, 32mm)",
    "brand": "CenturyPly",
    "categorySlug": "plywood-boards",
    "categoryName": "Plywood & Boards",
    "subCategory": "Blockboards & Flush Doors",
    "image": "/images/products/wood/century-flush-door-7-3-ft-bwp.webp",
    "images": [
      "/images/products/wood/century-flush-door-7-3-ft-bwp.webp"
    ],
    "shortTagline": "Solid Hardwood Core \u00b7 100% BWP Waterproof \u00b7 Calibrated Double Skin",
    "specChips": [
      "Solid Core Flush Door",
      "BWP Waterproof",
      "IS 2202 Certified",
      "25-Yr Warranty"
    ],
    "description": "Heavy-duty solid core flush door engineered with kiln-seasoned hardwood internal rails and stiles. Hot-pressed with high-pressure phenol formaldehyde resin to meet IS:2202 BWP specifications. Provides sound isolation, thermal stability, and lasting elegance.",
    "highlights": [
      "Solid block core eliminates hollow knocking sound and dampens room noise",
      "100% Boiling Water Proof (BWP) resin bonding withstands bathroom moisture",
      "Precision square-cut edges and double-face calibration ready for veneer or paint",
      "Reinforced lock rails on both vertical edges for flexible lock mortising",
      "Backed by 25 years warranty against warping and core delamination"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "CenturyPly Limited"
      },
      {
        "label": "Product",
        "value": "Club Prime BWP Flush Door"
      },
      {
        "label": "Standard Dimensions",
        "value": "7 Feet x 3 Feet (2100 x 900 mm)"
      },
      {
        "label": "Thickness",
        "value": "32 mm Heavy Thickness"
      },
      {
        "label": "Standard",
        "value": "IS 2202 (Part 1) Certified"
      },
      {
        "label": "Timber",
        "value": "Kiln Seasoned Solid Hardwood"
      },
      {
        "label": "Warranty",
        "value": "25 Years Replacement Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-door-30mm",
        "label": "30mm Standard (7x3 ft)",
        "unit": "Door",
        "price": 3800,
        "mrp": 4900,
        "discountPercent": 22,
        "stock": 25,
        "image": "/images/products/wood/century-flush-door-7-3-ft-bwp.webp"
      },
      {
        "id": "var-door-32mm",
        "label": "32mm Heavy Duty (7x3 ft)",
        "unit": "Door",
        "price": 4200,
        "mrp": 5400,
        "discountPercent": 22,
        "stock": 30,
        "image": "/images/products/wood/century-flush-door-7-3-ft-bwp.webp"
      },
      {
        "id": "var-door-35mm",
        "label": "35mm Premium Acoustic (7x3 ft)",
        "unit": "Door",
        "price": 4750,
        "mrp": 6100,
        "discountPercent": 22,
        "stock": 20,
        "image": "/images/products/wood/century-flush-door-7-3-ft-bwp.webp"
      }
    ],
    "price": 3800,
    "mrp": 4900,
    "discountPercent": 22,
    "unit": "Door",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "CenturyPly Authorized Depot"
  },
  {
    "id": "prod-fevicol-adhesives-sealants-fev-sh",
    "slug": "fevicol-sh-synthetic-resin-adhesive",
    "name": "Fevicol SH Synthetic Resin D3 Wood Adhesive",
    "title": "Fevicol SH Synthetic Resin D3 Wood Adhesive",
    "brand": "Fevicol",
    "categorySlug": "fevicol-adhesives-sealants",
    "categoryName": "Fevicol, Adhesives & Sealants",
    "subCategory": "Fevicol SH Synthetic Resin",
    "image": "/images/products/adhesives/fevicol-sh-50kg-drum.webp",
    "images": [
      "/images/products/adhesives/fevicol-sh-50kg-drum.webp"
    ],
    "shortTagline": "India's #1 Wood Adhesive \u00b7 Unbeatable Bond Strength \u00b7 Fast Curing",
    "specChips": [
      "D3 Water Resistant",
      "Superior Grip",
      "Zero Bubble Risk",
      "Trusted Since 1959"
    ],
    "description": "Fevicol SH is India's most trusted synthetic resin adhesive for carpentry, wood joinery, and decorative laminate pressing. Formulated with high-solids PVAc resin to deliver unbreakable bonds between wood, plywood, MDF, and laminates.",
    "highlights": [
      "High solid content delivers exceptional tensile and shear bonding strength",
      "Forms invisible, transparent glue lines that do not discolor fine veneers",
      "Excellent spreadability allows masons to coat large laminates quickly and evenly",
      "Resists ambient humidity and prevents edge-delamination over decades",
      "Non-toxic, low odor, and safe for indoor carpenter handling"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Pidilite Industries (Fevicol)"
      },
      {
        "label": "Adhesive Type",
        "value": "Polyvinyl Acetate (PVAc) Emulsion"
      },
      {
        "label": "Bond Strength",
        "value": "> 280 kg/cm\u00b2 on Hardwood"
      },
      {
        "label": "Setting Time",
        "value": "Handling: 2-3 Hrs, Full Bond: 24 Hrs"
      },
      {
        "label": "Coverage",
        "value": "45 - 50 sq.ft per kg on plywood"
      },
      {
        "label": "Shelf Life",
        "value": "12 Months from Packaging"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-sh-1kg",
        "label": "1 kg Tub",
        "unit": "Tub",
        "price": 285,
        "mrp": 330,
        "discountPercent": 14,
        "stock": 100,
        "image": "/images/products/adhesives/fevicol-sh-50kg-drum.webp"
      },
      {
        "id": "var-sh-2kg",
        "label": "2 kg Tub",
        "unit": "Tub",
        "price": 540,
        "mrp": 630,
        "discountPercent": 14,
        "stock": 80,
        "image": "/images/products/adhesives/fevicol-sh-50kg-drum.webp"
      },
      {
        "id": "var-sh-5kg",
        "label": "5 kg Bucket",
        "unit": "Bucket",
        "price": 1280,
        "mrp": 1500,
        "discountPercent": 15,
        "stock": 60,
        "image": "/images/products/adhesives/fevicol-sh-50kg-drum.webp"
      },
      {
        "id": "var-sh-10kg",
        "label": "10 kg Bucket",
        "unit": "Bucket",
        "price": 2450,
        "mrp": 2900,
        "discountPercent": 16,
        "stock": 40,
        "image": "/images/products/adhesives/fevicol-sh-50kg-drum.webp"
      },
      {
        "id": "var-sh-50kg",
        "label": "50 kg Pro Drum",
        "unit": "50kg Drum",
        "price": 10500,
        "mrp": 12600,
        "discountPercent": 17,
        "stock": 25,
        "image": "/images/products/adhesives/fevicol-sh-50kg-drum.webp"
      }
    ],
    "price": 285,
    "mrp": 330,
    "discountPercent": 14,
    "unit": "Tub",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Fevicol Authorized Depot"
  },
  {
    "id": "prod-fevicol-adhesives-sealants-fev-marine",
    "slug": "fevicol-marine-waterproof-adhesive",
    "name": "Fevicol Marine Waterproof Wood Adhesive",
    "title": "Fevicol Marine Waterproof Wood Adhesive",
    "brand": "Fevicol",
    "categorySlug": "fevicol-adhesives-sealants",
    "categoryName": "Fevicol, Adhesives & Sealants",
    "subCategory": "Fevicol Marine Waterproof",
    "image": "/images/products/adhesives/fevicol-marine-5kg.webp",
    "images": [
      "/images/products/adhesives/fevicol-marine-5kg.webp"
    ],
    "shortTagline": "Specialized Waterproof Adhesive \u00b7 48-Hour Water Immersion Resistance",
    "specChips": [
      "Waterproof Polymer",
      "Kitchen & Bath Tested",
      "Boiling Proof",
      "No Delamination"
    ],
    "description": "Fevicol Marine is specially formulated with synthetic waterproof cross-linking polymers for areas exposed to water, steam, and dampness. Ideal for modular kitchen cabinets, bathroom vanities, and coastal furniture.",
    "highlights": [
      "Withstands 48 hours continuous cold water soaking without losing adhesion",
      "Withstands 1 hour boiling water immersion test with zero edge peeling",
      "Prevents fungal staining and mildew growth along glue joints in damp rooms",
      "Forms tough elastomeric joints that absorb wood expansion and contraction",
      "Recommended for bonding mica and laminates on BWP marine plywood"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Pidilite Industries (Fevicol)"
      },
      {
        "label": "Classification",
        "value": "Waterproof Cross-Linking Synthetic Resin"
      },
      {
        "label": "Water Resistance",
        "value": "Exceeds IS 4835 Standard"
      },
      {
        "label": "Clamping Time",
        "value": "Minimum 4 - 6 Hours"
      },
      {
        "label": "Full Cure",
        "value": "24 Hours"
      },
      {
        "label": "Shelf Life",
        "value": "12 Months in Cool Storage"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-mar-1kg",
        "label": "1 kg Pack",
        "unit": "Pack",
        "price": 340,
        "mrp": 395,
        "discountPercent": 14,
        "stock": 90,
        "image": "/images/products/adhesives/fevicol-marine-5kg.webp"
      },
      {
        "id": "var-mar-5kg",
        "label": "5 kg Bucket",
        "unit": "Bucket",
        "price": 1550,
        "mrp": 1820,
        "discountPercent": 15,
        "stock": 50,
        "image": "/images/products/adhesives/fevicol-marine-5kg.webp"
      },
      {
        "id": "var-mar-10kg",
        "label": "10 kg Bucket",
        "unit": "Bucket",
        "price": 2950,
        "mrp": 3500,
        "discountPercent": 16,
        "stock": 35,
        "image": "/images/products/adhesives/fevicol-marine-5kg.webp"
      },
      {
        "id": "var-mar-20kg",
        "label": "20 kg Bucket",
        "unit": "Bucket",
        "price": 5650,
        "mrp": 6750,
        "discountPercent": 16,
        "stock": 25,
        "image": "/images/products/adhesives/fevicol-marine-5kg.webp"
      }
    ],
    "price": 340,
    "mrp": 395,
    "discountPercent": 14,
    "unit": "Pack",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Fevicol Authorized Depot"
  },
  {
    "id": "prod-fevicol-adhesives-sealants-fev-heatx",
    "slug": "fevicol-heatx-fast-heatproof-adhesive",
    "name": "Fevicol HeatX Fast Grabbing Heat Proof Adhesive",
    "title": "Fevicol HeatX Fast Grabbing Heat Proof Adhesive",
    "brand": "Fevicol",
    "categorySlug": "fevicol-adhesives-sealants",
    "categoryName": "Fevicol, Adhesives & Sealants",
    "subCategory": "Fevicol HeatX Fast Heat Proof",
    "image": "/images/products/adhesives/fevicol-heatx-1kg.webp",
    "images": [
      "/images/products/adhesives/fevicol-heatx-1kg.webp"
    ],
    "shortTagline": "Heat Proof up to 170\u00b0C \u00b7 Fast Grabbing \u00b7 No Clamping Needed",
    "specChips": [
      "Heat Proof 170\u00b0C",
      "No Clamping Required",
      "Instant Grab",
      "Kitchen Chimney Area"
    ],
    "description": "Fevicol HeatX is an advanced synthetic rubber contact adhesive engineered to withstand extreme heat up to 170\u00b0C. Ideal for fixing laminates around kitchen gas stoves, microwave recesses, dining tables, and curved surfaces without clamps.",
    "highlights": [
      "Heat resistance up to 170\u00b0C prevents bubbling and peeling near cooktops",
      "Instant tack and grab eliminates the need for heavy masking tape or C-clamps",
      "Fast 10-15 minute flash-off time dramatically reduces project turnaround time",
      "High initial bond strength holds bent laminates securely around sharp curves",
      "Resists thermal cycling between cold AC air and cooking steam"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Pidilite Industries (Fevicol)"
      },
      {
        "label": "Base Polymer",
        "value": "Synthetic Polychloroprene Rubber"
      },
      {
        "label": "Heat Resistance",
        "value": "Continuous up to 170\u00b0C"
      },
      {
        "label": "Drying Time",
        "value": "10 - 15 Minutes Flash Off"
      },
      {
        "label": "Coverage",
        "value": "35 - 40 sq.ft per Litre (Both Surfaces)"
      },
      {
        "label": "Application",
        "value": "Dining Tops, Stove Surrounds, Vertical Facings"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-heatx-500g",
        "label": "500 g Can",
        "unit": "Can",
        "price": 265,
        "mrp": 310,
        "discountPercent": 15,
        "stock": 80,
        "image": "/images/products/adhesives/fevicol-heatx-1kg.webp"
      },
      {
        "id": "var-heatx-1l",
        "label": "1 Litre Can",
        "unit": "Can",
        "price": 490,
        "mrp": 580,
        "discountPercent": 16,
        "stock": 70,
        "image": "/images/products/adhesives/fevicol-heatx-1kg.webp"
      },
      {
        "id": "var-heatx-2l",
        "label": "2 Litres Can",
        "unit": "Can",
        "price": 920,
        "mrp": 1100,
        "discountPercent": 16,
        "stock": 45,
        "image": "/images/products/adhesives/fevicol-heatx-1kg.webp"
      },
      {
        "id": "var-heatx-5l",
        "label": "5 Litres Pro Can",
        "unit": "Can",
        "price": 2150,
        "mrp": 2580,
        "discountPercent": 17,
        "stock": 30,
        "image": "/images/products/adhesives/fevicol-heatx-1kg.webp"
      }
    ],
    "price": 265,
    "mrp": 310,
    "discountPercent": 15,
    "unit": "Can",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Fevicol Authorized Depot"
  },
  {
    "id": "prod-fevicol-adhesives-sealants-araldite-std",
    "slug": "araldite-standard-epoxy-adhesive",
    "name": "Araldite Standard Heavy Duty Epoxy Adhesive",
    "title": "Araldite Standard Heavy Duty Epoxy Adhesive",
    "brand": "Araldite",
    "categorySlug": "fevicol-adhesives-sealants",
    "categoryName": "Fevicol, Adhesives & Sealants",
    "subCategory": "M-Seal & Epoxy Compounds",
    "image": "/images/products/adhesives/araldite-standard-90g.webp",
    "images": [
      "/images/products/adhesives/araldite-standard-90g.webp"
    ],
    "shortTagline": "High-Strength 2-Part Epoxy \u00b7 Bonds Metal, Glass, Stone, Ceramic",
    "specChips": [
      "Heavy Duty Epoxy",
      "High Tensile Strength",
      "Chemical Resistant",
      "Rock Solid"
    ],
    "description": "Araldite Standard is the benchmark two-component epoxy adhesive known for extreme mechanical strength and long-term durability. Bonds dissimilar materials including metal, marble, granite, ceramic, glass, and rigid plastics.",
    "highlights": [
      "High tensile shear strength exceeding 150 kg/cm\u00b2 for load-bearing joints",
      "Slow curing allows generous time for precise component alignment and clamping",
      "100% waterproof and resistant to grease, oil, solvents, and temperature extremes",
      "Does not shrink or deform upon hardening, leaving a stable structural weld",
      "Ideal for repairing broken marble tops, metal brackets, and ceramic fixtures"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Araldite (Huntsman / Pidilite)"
      },
      {
        "label": "Chemistry",
        "value": "Two-Part Bisphenol-A Epoxy + Polyamide"
      },
      {
        "label": "Color",
        "value": "Light Amber Transparent"
      },
      {
        "label": "Pot Life",
        "value": "90 Minutes at 25\u00b0C"
      },
      {
        "label": "Full Cure",
        "value": "14 - 18 Hours"
      },
      {
        "label": "Standard",
        "value": "ISO 9001 Certified Quality"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-aral-36g",
        "label": "36g Small Pack",
        "unit": "Pack",
        "price": 110,
        "mrp": 130,
        "discountPercent": 15,
        "stock": 100,
        "image": "/images/products/adhesives/araldite-standard-90g.webp"
      },
      {
        "id": "var-aral-90g",
        "label": "90g Standard Pack",
        "unit": "Pack",
        "price": 195,
        "mrp": 230,
        "discountPercent": 15,
        "stock": 120,
        "image": "/images/products/adhesives/araldite-standard-90g.webp"
      },
      {
        "id": "var-aral-180g",
        "label": "180g Workshop Pack",
        "unit": "Pack",
        "price": 360,
        "mrp": 425,
        "discountPercent": 15,
        "stock": 60,
        "image": "/images/products/adhesives/araldite-standard-90g.webp"
      }
    ],
    "price": 110,
    "mrp": 130,
    "discountPercent": 15,
    "unit": "Pack",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Araldite Authorized Depot"
  },
  {
    "id": "prod-fevicol-adhesives-sealants-araldite-rapid",
    "slug": "araldite-rapid-high-speed-epoxy",
    "name": "Araldite Rapid 5-Minute High Strength Epoxy Adhesive",
    "title": "Araldite Rapid 5-Minute High Strength Epoxy Adhesive",
    "brand": "Araldite",
    "categorySlug": "fevicol-adhesives-sealants",
    "categoryName": "Fevicol, Adhesives & Sealants",
    "subCategory": "M-Seal & Epoxy Compounds",
    "image": "/images/products/adhesives/araldite-rapid-36ml.webp",
    "images": [
      "/images/products/adhesives/araldite-rapid-36ml.webp"
    ],
    "shortTagline": "Sets in 5 Minutes \u00b7 Fast Emergency Fixes \u00b7 Clear Epoxy Gel",
    "specChips": [
      "Sets in 5 Mins",
      "Clear Transparent",
      "High Shear Grip",
      "Fast Repair"
    ],
    "description": "Araldite Rapid is a fast-setting 5-minute two-part epoxy adhesive designed for quick repairs where long clamping is impossible. Reaches handling strength in just 15 minutes, bonding glass, stone, metal, and ceramics with crystal clarity.",
    "highlights": [
      "Sets rock-hard in 5 minutes for rapid on-site carpentry and plumbing fixes",
      "Clear transparent glue line matches glass, acrylic, and light-colored stones",
      "Equal 1:1 mixing ratio between resin and hardener for foolproof blending",
      "Resists water, household detergents, and ambient humidity",
      "Packaged in dual squeeze tubes for precise pinpoint dispensing"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Araldite"
      },
      {
        "label": "Type",
        "value": "Fast-Setting 2-Part Epoxy"
      },
      {
        "label": "Set Time",
        "value": "Initial Set: 5 Mins, Full Handling: 15 Mins"
      },
      {
        "label": "Appearance",
        "value": "Clear Colorless Gel"
      },
      {
        "label": "Shear Strength",
        "value": "> 100 kg/cm\u00b2"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-rap-18g",
        "label": "18g Pocket Tube",
        "unit": "Pack",
        "price": 85,
        "mrp": 105,
        "discountPercent": 19,
        "stock": 90,
        "image": "/images/products/adhesives/araldite-rapid-36ml.webp"
      },
      {
        "id": "var-rap-36ml",
        "label": "36ml Standard Pack",
        "unit": "Pack",
        "price": 140,
        "mrp": 165,
        "discountPercent": 15,
        "stock": 80,
        "image": "/images/products/adhesives/araldite-rapid-36ml.webp"
      },
      {
        "id": "var-rap-90g",
        "label": "90g Workshop Pack",
        "unit": "Pack",
        "price": 260,
        "mrp": 310,
        "discountPercent": 16,
        "stock": 50,
        "image": "/images/products/adhesives/araldite-rapid-36ml.webp"
      }
    ],
    "price": 85,
    "mrp": 105,
    "discountPercent": 19,
    "unit": "Pack",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Araldite Authorized Depot"
  },
  {
    "id": "prod-fevicol-adhesives-sealants-drf-lw-adh",
    "slug": "dr-fixit-lw-plus-integral-waterproofing",
    "name": "Dr. Fixit 101 LW+ Integral Liquid Waterproofing Compound",
    "title": "Dr. Fixit 101 LW+ Integral Liquid Waterproofing Compound",
    "brand": "Dr. Fixit",
    "categorySlug": "fevicol-adhesives-sealants",
    "categoryName": "Fevicol, Adhesives & Sealants",
    "subCategory": "Silicone Sealants & Acrylic",
    "image": "/images/products/adhesives/dr-fixit-lw-plus-5l.webp",
    "images": [
      "/images/products/adhesives/dr-fixit-lw-plus-5l.webp"
    ],
    "shortTagline": "Integral Waterproofing for Cement & Concrete \u00b7 Improves Workability",
    "specChips": [
      "Integral Liquid",
      "Corrosion Inhibitor",
      "IS 2645 Certified",
      "Zero Voids"
    ],
    "description": "Dr. Fixit 101 LW+ is a specially formulated integral liquid waterproofing compound composed of surface-active plasticizing agents and active waterproofing polymers. Added to concrete and mortar during mixing to eliminate capillary pores and safeguard rebars from corrosion.",
    "highlights": [
      "Significantly reduces water permeability in concrete and brick-joint mortar",
      "Improves slump workability of fresh cement mortar without adding excess water",
      "Prevents segregation and bleeding in heavy concrete casting",
      "Passes IS 2645 integral waterproofing testing with high durability margins",
      "Economical dosing: only 200ml required per 50kg bag of cement"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dr. Fixit (Pidilite)"
      },
      {
        "label": "Product Code",
        "value": "101 LW+"
      },
      {
        "label": "Standard",
        "value": "IS 2645:2003 & IS 9103:2000"
      },
      {
        "label": "Dosage",
        "value": "200 ml per 50 kg bag of cement"
      },
      {
        "label": "Chloride Content",
        "value": "Nil (Zero Corrosion Risk)"
      },
      {
        "label": "Shelf Life",
        "value": "24 Months from Manufacturing"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-lw-1l",
        "label": "1 Litre Bottle",
        "unit": "Bottle",
        "price": 175,
        "mrp": 210,
        "discountPercent": 17,
        "stock": 100,
        "image": "/images/products/adhesives/dr-fixit-lw-plus-5l.webp"
      },
      {
        "id": "var-lw-5l",
        "label": "5 Litres Can",
        "unit": "Can",
        "price": 720,
        "mrp": 890,
        "discountPercent": 19,
        "stock": 70,
        "image": "/images/products/adhesives/dr-fixit-lw-plus-5l.webp"
      },
      {
        "id": "var-lw-10l",
        "label": "10 Litres Can",
        "unit": "Can",
        "price": 1380,
        "mrp": 1720,
        "discountPercent": 20,
        "stock": 40,
        "image": "/images/products/adhesives/dr-fixit-lw-plus-5l.webp"
      },
      {
        "id": "var-lw-20l",
        "label": "20 Litres Drum",
        "unit": "Drum",
        "price": 2600,
        "mrp": 3250,
        "discountPercent": 20,
        "stock": 25,
        "image": "/images/products/adhesives/dr-fixit-lw-plus-5l.webp"
      }
    ],
    "price": 175,
    "mrp": 210,
    "discountPercent": 17,
    "unit": "Bottle",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dr. Fixit Authorized Depot"
  },
  {
    "id": "prod-wires-mcb-electrical-poly-maxima",
    "slug": "polycab-maxima-green-wire-hr-fr-lsh",
    "name": "Polycab Maxima+ Green Wire HR FR-LSH LF 90m Coil",
    "title": "Polycab Maxima+ Green Wire HR FR-LSH LF 90m Coil",
    "brand": "Polycab",
    "categorySlug": "wires-mcb-electrical",
    "categoryName": "Wires, MCB & Electrical Supplies",
    "subCategory": "Flame Retardant House Wires",
    "image": "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp",
    "images": [
      "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp"
    ],
    "shortTagline": "99.97% Pure Electrolytic Copper \u00b7 Heat Resistant \u00b7 Low Smoke Halogen Free",
    "specChips": [
      "99.97% Copper",
      "HR-FR-LSH Grade",
      "Lead-Free",
      "IS 694 Certified"
    ],
    "description": "Polycab Maxima+ is engineered with 99.97% pure oxygen-free high-conductivity electrolytic copper. Insulated with specialized Heat Resistant, Flame Retardant Low Smoke Zero Halogen (HR-FR-LSH) compound that prevents toxic gas emission and restricts fire propagation.",
    "highlights": [
      "99.97% pure electrolytic grade copper ensures minimal electrical resistance and power savings",
      "Specially formulated flame-retardant low-smoke compound ensures visibility during fire hazards",
      "High temperature withstand capacity up to 85\u00b0C continuous operating temperature",
      "100% lead-free insulation is environmentally safe and complies with RoHS directives",
      "Certified with dual BIS ISI marking under IS 694 for guaranteed electrical safety"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Polycab India Limited"
      },
      {
        "label": "Conductor",
        "value": "99.97% Pure Electrolytic Bare Copper"
      },
      {
        "label": "Insulation",
        "value": "HR FR-LSH Low Smoke Halogen Free"
      },
      {
        "label": "Voltage Rating",
        "value": "Up to and including 1100V"
      },
      {
        "label": "Standard Length",
        "value": "90 Meters Standard Coil"
      },
      {
        "label": "Standard",
        "value": "IS 694 / RoHS Compliant"
      },
      {
        "label": "Warranty",
        "value": "Lifetime Against Manufacturing Defects"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-poly-075",
        "label": "0.75 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 1240,
        "mrp": 2150,
        "discountPercent": 42,
        "stock": 80,
        "image": "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp"
      },
      {
        "id": "var-poly-10",
        "label": "1.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 1620,
        "mrp": 2890,
        "discountPercent": 44,
        "stock": 100,
        "image": "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp"
      },
      {
        "id": "var-poly-15",
        "label": "1.5 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 2093,
        "mrp": 3950,
        "discountPercent": 47,
        "stock": 120,
        "image": "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp"
      },
      {
        "id": "var-poly-25",
        "label": "2.5 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 3380,
        "mrp": 5990,
        "discountPercent": 44,
        "stock": 90,
        "image": "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp"
      },
      {
        "id": "var-poly-40",
        "label": "4.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 5120,
        "mrp": 8900,
        "discountPercent": 42,
        "stock": 50,
        "image": "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp"
      },
      {
        "id": "var-poly-60",
        "label": "6.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 7650,
        "mrp": 12900,
        "discountPercent": 41,
        "stock": 40,
        "image": "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp"
      }
    ],
    "price": 1240,
    "mrp": 2150,
    "discountPercent": 42,
    "unit": "Coil (90m)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Polycab Authorized Depot"
  },
  {
    "id": "prod-wires-mcb-electrical-fino-silver",
    "slug": "finolex-silver-fr-wire",
    "name": "Finolex Silver FR Flame Retardant PVC Insulated Wire, 90m",
    "title": "Finolex Silver FR Flame Retardant PVC Insulated Wire, 90m",
    "brand": "Finolex",
    "categorySlug": "wires-mcb-electrical",
    "categoryName": "Wires, MCB & Electrical Supplies",
    "subCategory": "Flame Retardant House Wires",
    "image": "/images/products/electrical/finolex-silver-fr-wire.webp",
    "images": [
      "/images/products/electrical/finolex-silver-fr-wire.webp"
    ],
    "shortTagline": "Flame Retardant (FR) PVC \u00b7 High Oxygen Index \u00b7 100% Annealed Copper",
    "specChips": [
      "High Oxygen Index",
      "100% Annealed Copper",
      "FR PVC",
      "IS 694 Certified"
    ],
    "description": "Finolex Silver FR wire is manufactured with 100% electrolytic annealed copper conductors and formulated with fire-retardant PVC insulation. Designed with a high oxygen index to suppress combustion and self-extinguish during accidental short-circuit flashes.",
    "highlights": [
      "High oxygen and temperature index resists catching fire during heavy overloads",
      "Finely bunched annealed copper strands offer exceptional flexibility for conduit pulling",
      "High insulation resistance prevents current leakage and tripping of sensitive ELCBs",
      "Resistant to moisture, oils, greases, and standard household atmospheric chemicals",
      "IS 694 certified with genuine tamper-evident holographic packaging seal"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Finolex Cables Limited"
      },
      {
        "label": "Conductor",
        "value": "High Purity Bright Annealed Copper"
      },
      {
        "label": "Insulation Grade",
        "value": "Flame Retardant (FR) PVC Compound"
      },
      {
        "label": "Oxygen Index",
        "value": "> 29% (Standard IS benchmark > 21%)"
      },
      {
        "label": "Coil Length",
        "value": "90 Meters (Exact Meter Marked)"
      },
      {
        "label": "Standard",
        "value": "IS 694:2010 Marked"
      },
      {
        "label": "Warranty",
        "value": "100% Genuine Brand Assurance"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-fino-075",
        "label": "0.75 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 1120,
        "mrp": 1850,
        "discountPercent": 39,
        "stock": 70,
        "image": "/images/products/electrical/finolex-silver-fr-wire.webp"
      },
      {
        "id": "var-fino-10",
        "label": "1.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 1440,
        "mrp": 2350,
        "discountPercent": 39,
        "stock": 80,
        "image": "/images/products/electrical/finolex-silver-fr-wire.webp"
      },
      {
        "id": "var-fino-15",
        "label": "1.5 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 1731,
        "mrp": 2840,
        "discountPercent": 39,
        "stock": 100,
        "image": "/images/products/electrical/finolex-silver-fr-wire.webp"
      },
      {
        "id": "var-fino-25",
        "label": "2.5 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 2790,
        "mrp": 4500,
        "discountPercent": 38,
        "stock": 75,
        "image": "/images/products/electrical/finolex-silver-fr-wire.webp"
      },
      {
        "id": "var-fino-40",
        "label": "4.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 4250,
        "mrp": 6800,
        "discountPercent": 38,
        "stock": 50,
        "image": "/images/products/electrical/finolex-silver-fr-wire.webp"
      },
      {
        "id": "var-fino-60",
        "label": "6.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 6350,
        "mrp": 10200,
        "discountPercent": 38,
        "stock": 35,
        "image": "/images/products/electrical/finolex-silver-fr-wire.webp"
      }
    ],
    "price": 1120,
    "mrp": 1850,
    "discountPercent": 39,
    "unit": "Coil (90m)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Finolex Authorized Depot"
  },
  {
    "id": "prod-wires-mcb-electrical-anchor-adv",
    "slug": "anchor-panasonic-advance-fr-wire",
    "name": "Anchor Panasonic Advance FR Wire, 90m Coil",
    "title": "Anchor Panasonic Advance FR Wire, 90m Coil",
    "brand": "Anchor Panasonic",
    "categorySlug": "wires-mcb-electrical",
    "categoryName": "Wires, MCB & Electrical Supplies",
    "subCategory": "Flame Retardant House Wires",
    "image": "/images/products/electrical/anchor-panasonic-advance-fr-wire.webp",
    "images": [
      "/images/products/electrical/anchor-panasonic-advance-fr-wire.webp"
    ],
    "shortTagline": "100% Electrolytic Copper \u00b7 Japanese Quality Assurance \u00b7 Flame Retardant",
    "specChips": [
      "Panasonic Tech",
      "100% Copper",
      "Smooth Conduit Pull",
      "FR Insulation"
    ],
    "description": "Engineered with Japanese precision standards by Anchor Panasonic. Features high-grade electrolytic copper conductors and high-density flame-retardant insulation designed for smooth friction-free pulling through PVC conduits.",
    "highlights": [
      "Manufactured with 100% virgin electrolytic copper for superior electrical efficiency",
      "Advanced flame-retardant compound limits toxic smoke and self-extinguishes fire",
      "Ultra-smooth surface coating reduces conduit pulling friction by up to 30%",
      "Exceptional aging stability ensures wires retain flexibility over 30+ years",
      "Tested and approved under rigorous Japanese Panasonic industrial standards"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Anchor by Panasonic"
      },
      {
        "label": "Series",
        "value": "Advance FR Series"
      },
      {
        "label": "Conductor",
        "value": "Class 2 Stranded Bare Copper"
      },
      {
        "label": "Insulation",
        "value": "Flame Retardant Type A PVC"
      },
      {
        "label": "Length",
        "value": "90m Coil"
      },
      {
        "label": "Standard",
        "value": "IS 694 Certified"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-anc-10",
        "label": "1.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 1490,
        "mrp": 2980,
        "discountPercent": 50,
        "stock": 60,
        "image": "/images/products/electrical/anchor-panasonic-advance-fr-wire.webp"
      },
      {
        "id": "var-anc-15",
        "label": "1.5 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 1958,
        "mrp": 3765,
        "discountPercent": 48,
        "stock": 80,
        "image": "/images/products/electrical/anchor-panasonic-advance-fr-wire.webp"
      },
      {
        "id": "var-anc-25",
        "label": "2.5 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 3150,
        "mrp": 6200,
        "discountPercent": 49,
        "stock": 65,
        "image": "/images/products/electrical/anchor-panasonic-advance-fr-wire.webp"
      },
      {
        "id": "var-anc-40",
        "label": "4.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 4890,
        "mrp": 9500,
        "discountPercent": 49,
        "stock": 40,
        "image": "/images/products/electrical/anchor-panasonic-advance-fr-wire.webp"
      }
    ],
    "price": 1490,
    "mrp": 2980,
    "discountPercent": 50,
    "unit": "Coil (90m)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Anchor Panasonic Authorized Depot"
  },
  {
    "id": "prod-wires-mcb-electrical-kei-homecab",
    "slug": "kei-homecab-fr-wire",
    "name": "KEI Homecab FR Wire, 90m Coil 100% Electrolytic Copper",
    "title": "KEI Homecab FR Wire, 90m Coil 100% Electrolytic Copper",
    "brand": "KEI",
    "categorySlug": "wires-mcb-electrical",
    "categoryName": "Wires, MCB & Electrical Supplies",
    "subCategory": "Flame Retardant House Wires",
    "image": "/images/products/electrical/kei-homecab-fr-wire.webp",
    "images": [
      "/images/products/electrical/kei-homecab-fr-wire.webp"
    ],
    "shortTagline": "Multi-Strand Flexible Conductor \u00b7 100% Conductivity \u00b7 Flame Retardant",
    "specChips": [
      "Multi-Strand",
      "100% Conductivity",
      "FR Rated",
      "Overload Proof"
    ],
    "description": "KEI Homecab is built with finely stranded high-purity copper conductors for superior current carrying capacity and energy savings. High-grade FR PVC insulation ensures safety against short-circuit overheating in residential circuits.",
    "highlights": [
      "Uniform multi-strand copper bunching offers maximum conductivity with low heat build-up",
      "Advanced flame retardant insulation prevents spark spread and fire accidents",
      "Highly flexible design simplifies wiring through narrow concealed bends",
      "High dielectric strength guarantees zero current leakage across lines",
      "Certified by leading electrical inspection testing laboratories nationwide"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "KEI Industries Limited"
      },
      {
        "label": "Conductor",
        "value": "100% Electrolytic Grade Multi-Strand Copper"
      },
      {
        "label": "Insulation",
        "value": "Flame Retardant PVC (Type A)"
      },
      {
        "label": "Standard Length",
        "value": "90m Coil"
      },
      {
        "label": "Voltage Grade",
        "value": "1100 Volts"
      },
      {
        "label": "Standard",
        "value": "IS 694 BIS Marked"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-kei-10",
        "label": "1.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 1420,
        "mrp": 2840,
        "discountPercent": 50,
        "stock": 60,
        "image": "/images/products/electrical/kei-homecab-fr-wire.webp"
      },
      {
        "id": "var-kei-15",
        "label": "1.5 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 1853,
        "mrp": 3705,
        "discountPercent": 50,
        "stock": 80,
        "image": "/images/products/electrical/kei-homecab-fr-wire.webp"
      },
      {
        "id": "var-kei-25",
        "label": "2.5 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 2990,
        "mrp": 5990,
        "discountPercent": 50,
        "stock": 60,
        "image": "/images/products/electrical/kei-homecab-fr-wire.webp"
      },
      {
        "id": "var-kei-40",
        "label": "4.0 sq.mm \u00b7 90m Coil",
        "unit": "Coil (90m)",
        "price": 4650,
        "mrp": 9100,
        "discountPercent": 49,
        "stock": 35,
        "image": "/images/products/electrical/kei-homecab-fr-wire.webp"
      }
    ],
    "price": 1420,
    "mrp": 2840,
    "discountPercent": 50,
    "unit": "Coil (90m)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "KEI Authorized Depot"
  },
  {
    "id": "prod-wires-mcb-electrical-roma-switch",
    "slug": "anchor-roma-6a-1-way-switch",
    "name": "Anchor Roma Classic 1-Way Modular Switches (6A/16A)",
    "title": "Anchor Roma Classic 1-Way Modular Switches (6A/16A)",
    "brand": "Anchor Roma",
    "categorySlug": "wires-mcb-electrical",
    "categoryName": "Wires, MCB & Electrical Supplies",
    "subCategory": "Modular Switches & Sockets",
    "image": "/images/products/electrical/anchor-roma-6a-1-way-switch.webp",
    "images": [
      "/images/products/electrical/anchor-roma-6a-1-way-switch.webp"
    ],
    "shortTagline": "Silver Inlay Contacts \u00b7 Smooth Tactile Click \u00b7 Tested for 100,000 Clicks",
    "specChips": [
      "Silver Inlay Contacts",
      "100k Clicks Tested",
      "Flame Retardant Polycarbonate",
      "ISI Marked"
    ],
    "description": "Anchor Roma Classic is India's most popular modular switch range. Built with silver-inlay electrical contact tips for zero sparking and high durability. Tested for over 100,000 switching operations with an ultra-smooth tactile response.",
    "highlights": [
      "Silver-inlay contacts provide minimal arc flashing and long switch contact life",
      "High-grade virgin polycarbonate front plate resists yellowing and discoloration",
      "Captive screw terminals prevent screw loss during electrical site installation",
      "Tested for 100,000 on/off operations exceeding standard IS specifications",
      "Snaps cleanly into all standard Anchor Roma and Roma Plus modular frames"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Anchor Roma by Panasonic"
      },
      {
        "label": "Switch Type",
        "value": "Modular 1-Way Rocker Switch"
      },
      {
        "label": "Contact Material",
        "value": "Silver Nickel Inlay Contacts"
      },
      {
        "label": "Rated Voltage",
        "value": "240V AC, 50Hz"
      },
      {
        "label": "Standard",
        "value": "IS 3854 BIS Marked"
      },
      {
        "label": "Warranty",
        "value": "10 Years Replacement Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-roma-6a",
        "label": "6A 1-Way Switch (Light/Fan)",
        "unit": "Piece",
        "price": 42,
        "mrp": 65,
        "discountPercent": 35,
        "stock": 300,
        "image": "/images/products/electrical/anchor-roma-6a-1-way-switch.webp"
      },
      {
        "id": "var-roma-16a",
        "label": "16A Heavy Switch (Geyser/AC)",
        "unit": "Piece",
        "price": 98,
        "mrp": 145,
        "discountPercent": 32,
        "stock": 200,
        "image": "/images/products/electrical/anchor-roma-6a-1-way-switch.webp"
      },
      {
        "id": "var-roma-sock",
        "label": "6/16A Universal Shuttered Socket",
        "unit": "Piece",
        "price": 145,
        "mrp": 210,
        "discountPercent": 31,
        "stock": 150,
        "image": "/images/products/electrical/anchor-roma-6a-1-way-switch.webp"
      }
    ],
    "price": 42,
    "mrp": 65,
    "discountPercent": 35,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Anchor Roma Authorized Depot"
  },
  {
    "id": "prod-wires-mcb-electrical-roma-plate",
    "slug": "anchor-roma-modular-cover-plate",
    "name": "Anchor Roma Classic Pure White Modular Cover Plate",
    "title": "Anchor Roma Classic Pure White Modular Cover Plate",
    "brand": "Anchor Roma",
    "categorySlug": "wires-mcb-electrical",
    "categoryName": "Wires, MCB & Electrical Supplies",
    "subCategory": "Modular Switches & Sockets",
    "image": "/images/products/electrical/anchor-modular-plate-8m.webp",
    "images": [
      "/images/products/electrical/anchor-modular-plate-8m.webp"
    ],
    "shortTagline": "High Gloss Pure White \u00b7 UV Stabilized Polycarbonate \u00b7 Concealed Fixing",
    "specChips": [
      "High Gloss White",
      "UV Stabilized",
      "Concealed Grid",
      "Snap-On Fit"
    ],
    "description": "Sleek and durable modular cover plate with concealed mounting screws. Made from high-gloss UV-stabilized engineering polycarbonate that resists scratches, dust accumulation, and discoloration over time.",
    "highlights": [
      "Concealed grid design hides mounting screws for a sleek, modern wall finish",
      "UV-stabilized virgin polymer prevents yellowing caused by sunlight exposure",
      "High impact strength material resists cracking during screwdriver tightening",
      "Standard module dimensions fit universal GI concealed metal boxes",
      "Smooth high-gloss finish wipes clean effortlessly with a dry cloth"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Anchor Roma by Panasonic"
      },
      {
        "label": "Color",
        "value": "Glossy Pure White"
      },
      {
        "label": "Material",
        "value": "Engineering Grade Polycarbonate"
      },
      {
        "label": "Mounting",
        "value": "Concealed Snap-On Grid Base"
      },
      {
        "label": "Standard",
        "value": "RoHS & IS Compliant"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-plt-2m",
        "label": "2 Module Plate",
        "unit": "Plate",
        "price": 48,
        "mrp": 75,
        "discountPercent": 36,
        "stock": 150,
        "image": "/images/products/electrical/anchor-modular-plate-8m.webp"
      },
      {
        "id": "var-plt-4m",
        "label": "4 Module Plate",
        "unit": "Plate",
        "price": 68,
        "mrp": 105,
        "discountPercent": 35,
        "stock": 120,
        "image": "/images/products/electrical/anchor-modular-plate-8m.webp"
      },
      {
        "id": "var-plt-6m",
        "label": "6 Module Plate",
        "unit": "Plate",
        "price": 85,
        "mrp": 130,
        "discountPercent": 35,
        "stock": 100,
        "image": "/images/products/electrical/anchor-modular-plate-8m.webp"
      },
      {
        "id": "var-plt-8m",
        "label": "8 Module Plate",
        "unit": "Plate",
        "price": 95,
        "mrp": 145,
        "discountPercent": 34,
        "stock": 120,
        "image": "/images/products/electrical/anchor-modular-plate-8m.webp"
      },
      {
        "id": "var-plt-12m",
        "label": "12 Module Plate",
        "unit": "Plate",
        "price": 140,
        "mrp": 210,
        "discountPercent": 33,
        "stock": 80,
        "image": "/images/products/electrical/anchor-modular-plate-8m.webp"
      }
    ],
    "price": 48,
    "mrp": 75,
    "discountPercent": 36,
    "unit": "Plate",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Anchor Roma Authorized Depot"
  },
  {
    "id": "prod-home-appliances-cromp-geyser",
    "slug": "crompton-arno-neo-25l-storage-water-geyser",
    "name": "Crompton Arno Neo 25L 5-Star Storage Water Geyser",
    "title": "Crompton Arno Neo 25L 5-Star Storage Water Geyser",
    "brand": "Crompton",
    "categorySlug": "home-appliances",
    "categoryName": "Home Appliances",
    "subCategory": "Storage Water Heaters (Geysers)",
    "image": "/images/products/appliances/crompton-arno-neo-25l-storage-water-geyser.webp",
    "images": [
      "/images/products/appliances/crompton-arno-neo-25l-storage-water-geyser.webp"
    ],
    "shortTagline": "5-Star Energy Rating \u00b7 Glassline Coated Tank \u00b7 8 Bar High-Rise Pressure",
    "specChips": [
      "5-Star BEE Rated",
      "Glassline Tank",
      "8 Bar Pressure",
      "Magnesium Anode"
    ],
    "description": "High-efficiency 5-star storage water heater engineered for modern multi-story apartments. Features a corrosion-proof Nano Polybond glassline coated tank and a heavy magnesium anode rod that shields against hard water scaling.",
    "highlights": [
      "5-Star BEE energy efficiency rating minimizes annual water heating electricity costs",
      "8-Bar rated pressure tank suitable for high-rise buildings and pressure booster pumps",
      "Nano Polybond glassline enamel tank withstands hard borewell water corrosion",
      "Advanced multi-function safety valve protects against overpressure and dry heating",
      "High precision capillary thermostat ensures consistent water temperature output"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Crompton Greaves"
      },
      {
        "label": "Series",
        "value": "Arno Neo Storage Geyser"
      },
      {
        "label": "Capacity",
        "value": "25 Litres"
      },
      {
        "label": "Energy Rating",
        "value": "BEE 5-Star Certified"
      },
      {
        "label": "Pressure Rating",
        "value": "8 Bar (8 kg/cm\u00b2)"
      },
      {
        "label": "Heating Element",
        "value": "2000W Copper Heating Element"
      },
      {
        "label": "Warranty",
        "value": "5 Years Tank, 2 Years Element, 2 Years Product"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-gey-10l",
        "label": "10 Litres (Compact Bathroom)",
        "unit": "Unit",
        "price": 4899,
        "mrp": 7800,
        "discountPercent": 37,
        "stock": 25,
        "image": "/images/products/appliances/crompton-arno-neo-25l-storage-water-geyser.webp"
      },
      {
        "id": "var-gey-15l",
        "label": "15 Litres (Standard Family)",
        "unit": "Unit",
        "price": 5499,
        "mrp": 8700,
        "discountPercent": 37,
        "stock": 35,
        "image": "/images/products/appliances/crompton-arno-neo-25l-storage-water-geyser.webp"
      },
      {
        "id": "var-gey-25l",
        "label": "25 Litres (Large Bath / Rain Shower)",
        "unit": "Unit",
        "price": 6299,
        "mrp": 9800,
        "discountPercent": 36,
        "stock": 40,
        "image": "/images/products/appliances/crompton-arno-neo-25l-storage-water-geyser.webp"
      }
    ],
    "price": 4899,
    "mrp": 7800,
    "discountPercent": 37,
    "unit": "Unit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Crompton Authorized Depot"
  },
  {
    "id": "prod-home-appliances-atom-fan",
    "slug": "atomberg-renesa-1200mm-bldc-ceiling-fan",
    "name": "Atomberg Renesa 1200mm BLDC Motor Energy Saving Ceiling Fan with Remote",
    "title": "Atomberg Renesa 1200mm BLDC Motor Energy Saving Ceiling Fan with Remote",
    "brand": "Atomberg",
    "categorySlug": "home-appliances",
    "categoryName": "Home Appliances",
    "subCategory": "BLDC & Decorative Ceiling Fans",
    "image": "/images/products/appliances/atomberg-renesa-1200mm-bldc-ceiling-fan.webp",
    "images": [
      "/images/products/appliances/atomberg-renesa-1200mm-bldc-ceiling-fan.webp"
    ],
    "shortTagline": "Consumes Only 28W at Full Speed \u00b7 Saves \u20b91500/yr \u00b7 Smart Remote Control",
    "specChips": [
      "BLDC Tech (28W)",
      "Saves \u20b91500/year",
      "Smart Remote",
      "LED Speed Display"
    ],
    "description": "Revolutionary energy-efficient ceiling fan powered by an advanced Brushless DC (BLDC) motor. Consumes just 28W of electricity at top speed compared to 75W consumed by standard induction fans, delivering major power bill savings.",
    "highlights": [
      "Consumes only 28 Watts at top speed (saves up to 65% electricity on every fan)",
      "Full-function smart remote with Boost mode, Sleep timer, and individual speed buttons",
      "Runs 3 times longer on home inverters due to high-efficiency motor architecture",
      "Consistent air delivery even during heavy voltage fluctuations from 165V to 285V",
      "Sleek contemporary design with LED speed indicator lights on the central hub"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Atomberg Technologies"
      },
      {
        "label": "Model",
        "value": "Renesa BLDC Ceiling Fan"
      },
      {
        "label": "Sweep / Size",
        "value": "1200 mm (48 Inch)"
      },
      {
        "label": "Power Consumption",
        "value": "28 Watts at Speed 5 (Boost)"
      },
      {
        "label": "Air Delivery",
        "value": "235 CMM (Cubic Meters per Minute)"
      },
      {
        "label": "Motor",
        "value": "100% Copper BLDC Motor"
      },
      {
        "label": "Warranty",
        "value": "2+1 Years Comprehensive Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-fan-white",
        "label": "Ivory White",
        "unit": "Unit",
        "price": 3699,
        "mrp": 4990,
        "discountPercent": 26,
        "stock": 40,
        "image": "/images/products/appliances/atomberg-renesa-1200mm-bldc-ceiling-fan.webp"
      },
      {
        "id": "var-fan-brown",
        "label": "Gloss Brown",
        "unit": "Unit",
        "price": 3699,
        "mrp": 4990,
        "discountPercent": 26,
        "stock": 35,
        "image": "/images/products/appliances/atomberg-renesa-1200mm-bldc-ceiling-fan.webp"
      },
      {
        "id": "var-fan-black",
        "label": "Matt Black",
        "unit": "Unit",
        "price": 3899,
        "mrp": 5290,
        "discountPercent": 26,
        "stock": 30,
        "image": "/images/products/appliances/atomberg-renesa-1200mm-bldc-ceiling-fan.webp"
      }
    ],
    "price": 3699,
    "mrp": 4990,
    "discountPercent": 26,
    "unit": "Unit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Atomberg Authorized Depot"
  },
  {
    "id": "prod-home-appliances-hav-exhaust",
    "slug": "havells-ventilair-db-230mm-exhaust-fan",
    "name": "Havells Ventilair DB 230mm Heavy-Duty Metal Exhaust Fan",
    "title": "Havells Ventilair DB 230mm Heavy-Duty Metal Exhaust Fan",
    "brand": "Havells",
    "categorySlug": "home-appliances",
    "categoryName": "Home Appliances",
    "subCategory": "High-Speed Ventilation Exhausts",
    "image": "/images/products/appliances/havells-ventilair-db-230mm-exhaust-fan.webp",
    "images": [
      "/images/products/appliances/havells-ventilair-db-230mm-exhaust-fan.webp"
    ],
    "shortTagline": "Double Ball Bearings \u00b7 Powder Coated Steel Blades \u00b7 High Air Suction",
    "specChips": [
      "Double Ball Bearing",
      "Steel Blades",
      "High Suction",
      "Low Noise Motor"
    ],
    "description": "Robust high-speed ventilation exhaust fan designed for kitchens and bathrooms. Built with double ball bearings and aerodynamically balanced metal blades that quickly remove cooking oil fumes, smoke, and humid bathroom steam.",
    "highlights": [
      "Heavy-duty double ball bearing motor ensures smooth, silent, and vibration-free rotation",
      "Rugged powder-coated steel frame and blades resist kitchen grease and moisture rust",
      "High suction air delivery clears dense oil smoke and cooking smells rapidly",
      "Thermal overload protection prevents motor burnout during long continuous operation",
      "Includes rear automatic gravity louvers to prevent reverse air and insect entry"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Havells India Limited"
      },
      {
        "label": "Series",
        "value": "Ventilair DB Heavy Exhaust"
      },
      {
        "label": "Sweep / Diameter",
        "value": "230 mm (9 Inch)"
      },
      {
        "label": "Speed / RPM",
        "value": "1400 RPM High Speed"
      },
      {
        "label": "Air Delivery",
        "value": "700 m\u00b3/hr"
      },
      {
        "label": "Power Consumption",
        "value": "45 Watts"
      },
      {
        "label": "Warranty",
        "value": "2 Years On-Site Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-ex-200",
        "label": "200mm (8 Inch) Compact",
        "unit": "Unit",
        "price": 1450,
        "mrp": 2050,
        "discountPercent": 29,
        "stock": 30,
        "image": "/images/products/appliances/havells-ventilair-db-230mm-exhaust-fan.webp"
      },
      {
        "id": "var-ex-230",
        "label": "230mm (9 Inch) Standard",
        "unit": "Unit",
        "price": 1650,
        "mrp": 2350,
        "discountPercent": 30,
        "stock": 45,
        "image": "/images/products/appliances/havells-ventilair-db-230mm-exhaust-fan.webp"
      },
      {
        "id": "var-ex-300",
        "label": "300mm (12 Inch) Commercial",
        "unit": "Unit",
        "price": 2150,
        "mrp": 3100,
        "discountPercent": 31,
        "stock": 25,
        "image": "/images/products/appliances/havells-ventilair-db-230mm-exhaust-fan.webp"
      }
    ],
    "price": 1450,
    "mrp": 2050,
    "discountPercent": 29,
    "unit": "Unit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Havells Authorized Depot"
  },
  {
    "id": "prod-home-appliances-faber-chimney",
    "slug": "faber-60cm-curved-glass-kitchen-chimney",
    "name": "Faber 60cm Curved Glass Auto-Clean Kitchen Chimney (1200 m3/hr)",
    "title": "Faber 60cm Curved Glass Auto-Clean Kitchen Chimney (1200 m3/hr)",
    "brand": "Faber",
    "categorySlug": "home-appliances",
    "categoryName": "Home Appliances",
    "subCategory": "Kitchen Chimney Cooker Hoods",
    "image": "/images/products/appliances/faber-60cm-curved-glass-kitchen-chimney.webp",
    "images": [
      "/images/products/appliances/faber-60cm-curved-glass-kitchen-chimney.webp"
    ],
    "shortTagline": "Thermal Auto-Clean \u00b7 1200 m\u00b3/hr Suction \u00b7 Motion Sensor Touch Control",
    "specChips": [
      "Thermal Auto-Clean",
      "1200 m\u00b3/hr Suction",
      "Gesture Control",
      "Baffle-Less Tech"
    ],
    "description": "Premium curved glass kitchen chimney engineered specifically for Indian deep frying and heavy masala cooking. Features 1200 m\u00b3/hr powerful air suction and thermal auto-clean technology that melts away internal grease into a stainless steel oil collector.",
    "highlights": [
      "Powerful 1200 m\u00b3/hr suction removes heavy tadka smoke, oil vapor, and pungent odor",
      "One-touch thermal auto-clean melts stubborn grease and channels it into the oil cup",
      "Touch-free gesture motion sensor lets you turn the chimney on with a simple hand wave",
      "Energy-efficient dual LED spot lamps provide bright illumination over the cooktop",
      "12-year warranty on the heavy copper motor ensures complete peace of mind"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Faber India"
      },
      {
        "label": "Width / Size",
        "value": "60 cm (Ideal for 2 - 4 Burner Stoves)"
      },
      {
        "label": "Suction Capacity",
        "value": "1200 m\u00b3/hr"
      },
      {
        "label": "Technology",
        "value": "Heat Auto-Clean (Baffle-Less Filter)"
      },
      {
        "label": "Control",
        "value": "Touch Control + Motion Gesture Sensor"
      },
      {
        "label": "Noise Level",
        "value": "< 58 dB"
      },
      {
        "label": "Warranty",
        "value": "5 Years Comprehensive, 12 Years Motor"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-chim-60",
        "label": "60 cm Width (2-4 Burners)",
        "unit": "Unit",
        "price": 11490,
        "mrp": 18990,
        "discountPercent": 39,
        "stock": 20,
        "image": "/images/products/appliances/faber-60cm-curved-glass-kitchen-chimney.webp"
      },
      {
        "id": "var-chim-90",
        "label": "90 cm Width (4-5 Burners)",
        "unit": "Unit",
        "price": 14990,
        "mrp": 23990,
        "discountPercent": 38,
        "stock": 15,
        "image": "/images/products/appliances/faber-60cm-curved-glass-kitchen-chimney.webp"
      }
    ],
    "price": 11490,
    "mrp": 18990,
    "discountPercent": 39,
    "unit": "Unit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Faber Authorized Depot"
  },
  {
    "id": "prod-home-appliances-pres-cooktop",
    "slug": "prestige-pic-20-induction-cooktop",
    "name": "Prestige PIC 20 1600W Induction Cooktop with Indian Menu Presets",
    "title": "Prestige PIC 20 1600W Induction Cooktop with Indian Menu Presets",
    "brand": "Prestige",
    "categorySlug": "home-appliances",
    "categoryName": "Home Appliances",
    "subCategory": "Induction & Gas Cooktops",
    "image": "/images/products/appliances/prestige-pic-20-induction-cooktop.webp",
    "images": [
      "/images/products/appliances/prestige-pic-20-induction-cooktop.webp"
    ],
    "shortTagline": "Indian Menu Presets \u00b7 Automatic Voltage Regulator \u00b7 Antimagnetic Wall",
    "specChips": [
      "1600W Power",
      "Indian Menu Options",
      "Dual Heat Sensor",
      "Flame-Free Cooking"
    ],
    "description": "Prestige PIC 20 induction cooktop delivers fast, safe, and flame-free modern cooking. Equipped with pre-programmed Indian cooking menus for chapati, dosa, curry, and milk boiling. Built-in automatic voltage regulator protects against sudden power surges.",
    "highlights": [
      "Preset Indian menu modes automatically adjust temperature and timer for perfect cooking",
      "Full glass surface with anti-magnetic wall blocks harmful magnetic radiation leakage",
      "Built-in automatic voltage regulator ensures continuous operation during supply dips",
      "Dual heat sensors monitor vessel temperature to prevent food from burning or boiling over",
      "Compact, lightweight portable design is ideal for modern apartments and rental homes"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "TTK Prestige Limited"
      },
      {
        "label": "Model",
        "value": "PIC 20 Induction Cooktop"
      },
      {
        "label": "Power Input",
        "value": "1600 Watts (230V AC)"
      },
      {
        "label": "Safety Features",
        "value": "Automatic Shut-Off & Voltage Regulator"
      },
      {
        "label": "Control Panel",
        "value": "Soft-Touch Push Button Control"
      },
      {
        "label": "Warranty",
        "value": "1 Year Prestige National Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-ind-1600",
        "label": "1600W Standard",
        "unit": "Unit",
        "price": 2199,
        "mrp": 3245,
        "discountPercent": 32,
        "stock": 45,
        "image": "/images/products/appliances/prestige-pic-20-induction-cooktop.webp"
      },
      {
        "id": "var-ind-2000",
        "label": "2000W Dual Sensor Pro",
        "unit": "Unit",
        "price": 2899,
        "mrp": 4195,
        "discountPercent": 31,
        "stock": 30,
        "image": "/images/products/appliances/prestige-pic-20-induction-cooktop.webp"
      }
    ],
    "price": 2199,
    "mrp": 3245,
    "discountPercent": 32,
    "unit": "Unit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Prestige Authorized Depot"
  },
  {
    "id": "prod-home-appliances-pres-mixer",
    "slug": "prestige-iris-plus-750w-mixer-grinder",
    "name": "Prestige Iris Plus 750W Heavy-Duty Mixer Grinder with 4 Jars",
    "title": "Prestige Iris Plus 750W Heavy-Duty Mixer Grinder with 4 Jars",
    "brand": "Prestige",
    "categorySlug": "home-appliances",
    "categoryName": "Home Appliances",
    "subCategory": "Induction & Gas Cooktops",
    "image": "/images/products/appliances/prestige-iris-plus-750w-mixer-grinder.webp",
    "images": [
      "/images/products/appliances/prestige-iris-plus-750w-mixer-grinder.webp"
    ],
    "shortTagline": "Powerful 750W Motor \u00b7 3 Stainless Steel Jars + 1 Transparent Juicer",
    "specChips": [
      "750W Copper Motor",
      "3 SS Jars + 1 Juicer",
      "Ergonomic Handles",
      "Overload Protection"
    ],
    "description": "Heavy-duty 750W mixer grinder designed to grind tough Indian kitchen spices, wet idli batter, and fresh fruit juices. Comes with three robust stainless steel jars and a transparent juicer jar with sharp multi-function blades.",
    "highlights": [
      "Powerful 750-watt pure copper motor handles heavy wet and dry grinding with ease",
      "Four versatile jars: Wet Grinding (1.5L), Dry Grinding (1.0L), Chutney (300ml), Juicer (1.5L)",
      "Superior grade 304 stainless steel jars with sturdy ergonomic grip handles",
      "Overload protector switch cuts power automatically to prevent motor overheating",
      "Attractive black and red modern dual-tone styling complements designer modular kitchens"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "TTK Prestige Limited"
      },
      {
        "label": "Model",
        "value": "Iris Plus 750W"
      },
      {
        "label": "Motor Rating",
        "value": "750 Watts (20,000 RPM)"
      },
      {
        "label": "Jars Included",
        "value": "3 Stainless Steel Jars + 1 Juicer Jar"
      },
      {
        "label": "Blade Material",
        "value": "Super Fine Grade 304 Stainless Steel"
      },
      {
        "label": "Warranty",
        "value": "2 Years Brand Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-mix-4jar",
        "label": "3 SS Jars + 1 Juicer Jar Set",
        "unit": "Unit",
        "price": 3299,
        "mrp": 6295,
        "discountPercent": 48,
        "stock": 40,
        "image": "/images/products/appliances/prestige-iris-plus-750w-mixer-grinder.webp"
      }
    ],
    "price": 3299,
    "mrp": 6295,
    "discountPercent": 48,
    "unit": "Unit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Prestige Authorized Depot"
  },
  {
    "id": "prod-lighting-wipro-round",
    "slug": "wipro-garnet-rimless-round-led-surface-panel-light",
    "name": "Wipro Garnet Rimless Round LED Surface Panel Light (2 Years Warranty)",
    "title": "Wipro Garnet Rimless Round LED Surface Panel Light (2 Years Warranty)",
    "brand": "Wipro",
    "categorySlug": "lighting",
    "categoryName": "Lighting",
    "subCategory": "Recessed Round & Square Panels",
    "image": "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp",
    "images": [
      "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp"
    ],
    "shortTagline": "Frameless Edge-to-Edge Glow \u00b7 3.5 kV Surge Protection \u00b7 Eye Soft Optics",
    "specChips": [
      "Edge-to-Edge Glow",
      "3.5 kV Surge Guard",
      "Eye Soft Tech",
      "100 Lumens/Watt"
    ],
    "description": "Wipro Garnet Rimless surface LED panel provides uniform edge-to-edge illumination without any dark perimeter borders. Features advanced Eye Soft optics that eliminate glare and high 3.5 kV surge protection against voltage spikes.",
    "highlights": [
      "Rimless edgeless diffuser provides 180\u00b0 wide light distribution without shadow rings",
      "High luminous efficacy delivering over 100 lumens per watt for bright energy savings",
      "Robust built-in driver withstands voltage spikes and surges up to 3.5 kV",
      "Flicker-free driver eliminates subconscious eye fatigue during reading and work",
      "Low-profile slim surface mount clips directly onto any concrete or false ceiling"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Wipro Consumer Lighting"
      },
      {
        "label": "Series",
        "value": "Garnet Rimless Surface Series"
      },
      {
        "label": "Color Temperature",
        "value": "Cool Daylight (6500K) / Warm White (3000K)"
      },
      {
        "label": "Luminous Efficacy",
        "value": "> 100 lm/Watt"
      },
      {
        "label": "Surge Protection",
        "value": "3.5 kV Built-in Driver Protection"
      },
      {
        "label": "Operating Voltage",
        "value": "150V - 300V AC"
      },
      {
        "label": "Warranty",
        "value": "2 Years Complete Replacement Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-wip-6w",
        "label": "6 Watt (Cool Daylight)",
        "unit": "Piece",
        "price": 245,
        "mrp": 550,
        "discountPercent": 55,
        "stock": 100,
        "image": "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp"
      },
      {
        "id": "var-wip-9w",
        "label": "9 Watt (Cool Daylight)",
        "unit": "Piece",
        "price": 295,
        "mrp": 690,
        "discountPercent": 57,
        "stock": 120,
        "image": "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp"
      },
      {
        "id": "var-wip-12w",
        "label": "12 Watt (Cool Daylight)",
        "unit": "Piece",
        "price": 345,
        "mrp": 790,
        "discountPercent": 56,
        "stock": 150,
        "image": "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp"
      },
      {
        "id": "var-wip-15w",
        "label": "15 Watt (Cool Daylight)",
        "unit": "Piece",
        "price": 389,
        "mrp": 890,
        "discountPercent": 56,
        "stock": 140,
        "image": "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp"
      },
      {
        "id": "var-wip-18w",
        "label": "18 Watt (Cool Daylight)",
        "unit": "Piece",
        "price": 460,
        "mrp": 1050,
        "discountPercent": 56,
        "stock": 90,
        "image": "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp"
      },
      {
        "id": "var-wip-22w",
        "label": "22 Watt High Brightness",
        "unit": "Piece",
        "price": 540,
        "mrp": 1250,
        "discountPercent": 57,
        "stock": 60,
        "image": "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp"
      }
    ],
    "price": 245,
    "mrp": 550,
    "discountPercent": 55,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Wipro Authorized Depot"
  },
  {
    "id": "prod-lighting-phil-glow",
    "slug": "philips-full-glow-led-surface-light-round",
    "name": "Philips Full Glow LED Surface Light, Round, Slim 2.9 cm",
    "title": "Philips Full Glow LED Surface Light, Round, Slim 2.9 cm",
    "brand": "Philips",
    "categorySlug": "lighting",
    "categoryName": "Lighting",
    "subCategory": "Recessed Round & Square Panels",
    "image": "/images/products/lighting/philips-full-glow-led-surface-light-round.webp",
    "images": [
      "/images/products/lighting/philips-full-glow-led-surface-light-round.webp"
    ],
    "shortTagline": "Ultra-Slim 2.9 cm Profile \u00b7 Full Glow Diffuser \u00b7 EyeComfort Technology",
    "specChips": [
      "Full Glow Diffuser",
      "Slim 2.9 cm Depth",
      "EyeComfort Tech",
      "Long Life 25,000 Hrs"
    ],
    "description": "Philips Full Glow LED surface downlight features a clean 2.9cm ultra-slim profile and edge-to-edge luminous diffuser. Certified with Philips EyeComfort criteria to reduce glare, strobe, and optical flicker.",
    "highlights": [
      "Full face glow creates an expansive lighting effect that brightens ceilings and walls",
      "Ultra-slim 2.9 cm depth fits snugly without hanging down awkwardly into the room",
      "Philips EyeComfort certified to prevent glare and protect children's and elder's vision",
      "Long operating life rated for 25,000 hours with sustained lumen maintenance",
      "Integrated driver and twist-and-lock mounting bracket enables quick DIY installation"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Philips Lighting (Signify)"
      },
      {
        "label": "Model",
        "value": "Full Glow Surface LED Round"
      },
      {
        "label": "CRI (Color Rendering)",
        "value": "> 80 (True Color Reproduction)"
      },
      {
        "label": "Thickness",
        "value": "2.9 cm Ultra Slim Profile"
      },
      {
        "label": "Surge Protection",
        "value": "2.5 kV"
      },
      {
        "label": "Lifetime",
        "value": "25,000 Burning Hours"
      },
      {
        "label": "Warranty",
        "value": "2 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-phil-10w-cdl",
        "label": "10 Watt (Cool Daylight)",
        "unit": "Piece",
        "price": 440,
        "mrp": 650,
        "discountPercent": 32,
        "stock": 80,
        "image": "/images/products/lighting/philips-full-glow-led-surface-light-round.webp"
      },
      {
        "id": "var-phil-10w-ww",
        "label": "10 Watt (Warm White)",
        "unit": "Piece",
        "price": 440,
        "mrp": 650,
        "discountPercent": 32,
        "stock": 60,
        "image": "/images/products/lighting/philips-full-glow-led-surface-light-round.webp"
      },
      {
        "id": "var-phil-15w-cdl",
        "label": "15 Watt (Cool Daylight)",
        "unit": "Piece",
        "price": 518,
        "mrp": 775,
        "discountPercent": 33,
        "stock": 100,
        "image": "/images/products/lighting/philips-full-glow-led-surface-light-round.webp"
      },
      {
        "id": "var-phil-15w-ww",
        "label": "15 Watt (Warm White)",
        "unit": "Piece",
        "price": 518,
        "mrp": 775,
        "discountPercent": 33,
        "stock": 70,
        "image": "/images/products/lighting/philips-full-glow-led-surface-light-round.webp"
      },
      {
        "id": "var-phil-20w-cdl",
        "label": "20 Watt (Cool Daylight)",
        "unit": "Piece",
        "price": 670,
        "mrp": 990,
        "discountPercent": 32,
        "stock": 50,
        "image": "/images/products/lighting/philips-full-glow-led-surface-light-round.webp"
      }
    ],
    "price": 440,
    "mrp": 650,
    "discountPercent": 32,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Philips Authorized Depot"
  },
  {
    "id": "prod-lighting-sturlite-lexxo",
    "slug": "sturlite-lexxo-trimless-surface-mount-led-downlight",
    "name": "Sturlite LEXXO Trimless Surface Mount LED Downlight (Round)",
    "title": "Sturlite LEXXO Trimless Surface Mount LED Downlight (Round)",
    "brand": "Sturlite",
    "categorySlug": "lighting",
    "categoryName": "Lighting",
    "subCategory": "Recessed Round & Square Panels",
    "image": "/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp",
    "images": [
      "/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp"
    ],
    "shortTagline": "Value Leader \u00b7 Trimless Flush Design \u00b7 2-Year Warranty \u00b7 High Efficacy",
    "specChips": [
      "Trimless Design",
      "High Lumen Output",
      "2-Year Warranty",
      "Flicker Free"
    ],
    "description": "Sturlite LEXXO is an affordable high-performance trimless surface downlight engineered for homes, rental units, and builder floors. Delivers crisp, bright illumination with wide beam distribution and durable polycarbonate casing.",
    "highlights": [
      "Trimless construction delivers a modern architectural aesthetic at competitive pricing",
      "High lumens output illuminates entire rooms with fewer light points",
      "Rugged thermal casing dissipates heat efficiently for extended LED chip longevity",
      "Compact mounting base fits directly over standard PVC round conduit junction boxes",
      "Full 2-year replacement warranty ensures reliable performance across daily use"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Sturlite Lighting"
      },
      {
        "label": "Series",
        "value": "LEXXO Trimless Surface"
      },
      {
        "label": "Color Temperature",
        "value": "6500K Cool White"
      },
      {
        "label": "Beam Angle",
        "value": "120\u00b0 Wide Flood"
      },
      {
        "label": "Power Factor",
        "value": "> 0.90"
      },
      {
        "label": "Warranty",
        "value": "2 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-stur-7w",
        "label": "7 Watt Cool Daylight",
        "unit": "Piece",
        "price": 242,
        "mrp": 499,
        "discountPercent": 52,
        "stock": 100,
        "image": "/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp"
      },
      {
        "id": "var-stur-12w",
        "label": "12 Watt Cool Daylight",
        "unit": "Piece",
        "price": 320,
        "mrp": 650,
        "discountPercent": 51,
        "stock": 90,
        "image": "/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp"
      },
      {
        "id": "var-stur-18w",
        "label": "18 Watt Cool Daylight",
        "unit": "Piece",
        "price": 410,
        "mrp": 820,
        "discountPercent": 50,
        "stock": 60,
        "image": "/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp"
      }
    ],
    "price": 242,
    "mrp": 499,
    "discountPercent": 52,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Sturlite Authorized Depot"
  },
  {
    "id": "prod-lighting-wipro-3in1",
    "slug": "wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel",
    "name": "Wipro Garnet Rimless 3-in-1 CCT Surface Mounted LED Panel",
    "title": "Wipro Garnet Rimless 3-in-1 CCT Surface Mounted LED Panel",
    "brand": "Wipro",
    "categorySlug": "lighting",
    "categoryName": "Lighting",
    "subCategory": "Recessed Round & Square Panels",
    "image": "/images/products/lighting/wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel.webp",
    "images": [
      "/images/products/lighting/wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel.webp"
    ],
    "shortTagline": "3 Colors in 1 Light \u00b7 Cool White, Warm White & Natural \u00b7 Toggle via Wall Switch",
    "specChips": [
      "3-in-1 Color CCT",
      "Switch Toggle",
      "Rimless Glow",
      "Mood Lighting"
    ],
    "description": "Versatile 3-in-1 color tunable surface LED light that lets you change ambience on demand. Toggle between Cool White for focused study, Natural White for cozy family dining, and Warm Golden White for evening relaxation using your existing wall switch.",
    "highlights": [
      "Change ambient light color seamlessly by simply flipping your existing wall switch",
      "Three color modes: 6500K Cool White, 4000K Natural Neutral, and 3000K Warm Golden",
      "Rimless outer perimeter glow maximizes light spill across ceiling corners",
      "Internal memory chip remembers your last selected color preference when powered off",
      "High power factor (>0.90) and low total harmonic distortion protects house wiring"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Wipro Consumer Lighting"
      },
      {
        "label": "Model",
        "value": "Garnet Rimless 3-in-1 CCT"
      },
      {
        "label": "Tunable Colors",
        "value": "6500K (Cool) / 4000K (Natural) / 3000K (Warm)"
      },
      {
        "label": "Switching Mechanism",
        "value": "Toggled via Standard Wall Switch"
      },
      {
        "label": "Driver Protection",
        "value": "3.5 kV Surge Guard"
      },
      {
        "label": "Warranty",
        "value": "2 Years Brand Replacement"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-wip-3in1-12w",
        "label": "12 Watt 3-in-1 Color Tunable",
        "unit": "Piece",
        "price": 579,
        "mrp": 990,
        "discountPercent": 42,
        "stock": 80,
        "image": "/images/products/lighting/wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel.webp"
      },
      {
        "id": "var-wip-3in1-18w",
        "label": "18 Watt 3-in-1 Color Tunable",
        "unit": "Piece",
        "price": 699,
        "mrp": 1250,
        "discountPercent": 44,
        "stock": 60,
        "image": "/images/products/lighting/wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel.webp"
      }
    ],
    "price": 579,
    "mrp": 990,
    "discountPercent": 42,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Wipro Authorized Depot"
  },
  {
    "id": "prod-lighting-phil-stellar",
    "slug": "philips-stellar-bright-rimless-surface-downlight-15w",
    "name": "Philips Stellar Bright Rimless Surface Downlight 15W",
    "title": "Philips Stellar Bright Rimless Surface Downlight 15W",
    "brand": "Philips",
    "categorySlug": "lighting",
    "categoryName": "Lighting",
    "subCategory": "Recessed Round & Square Panels",
    "image": "/images/products/lighting/philips-stellar-bright-rimless-surface-downlight-15w.webp",
    "images": [
      "/images/products/lighting/philips-stellar-bright-rimless-surface-downlight-15w.webp"
    ],
    "shortTagline": "15W Ultra Bright 1500 Lumens \u00b7 Rimless Edge Design \u00b7 2 Years Warranty",
    "specChips": [
      "1500 Lumens Output",
      "Rimless Frame",
      "Wide 140\u00b0 Beam",
      "Philips Reliability"
    ],
    "description": "Philips Stellar Bright 15W delivers an impressive 1500 lumens of glare-free light with a clean rimless face. Ideal for living rooms, kitchens, and corridors requiring powerful, even illumination.",
    "highlights": [
      "Class-leading 1500 lumens light output brightens up large living and dining rooms",
      "Advanced optical grade polycarbonate diffuser prevents eye strain and glare",
      "Solid heat sink keeps high-power LED diodes operating at cool temperatures",
      "Simple ceiling surface bracket fixes without cutting false ceiling apertures",
      "Tested for robust operation across erratic Indian grid voltage dips"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Philips Lighting (Signify)"
      },
      {
        "label": "Model",
        "value": "Stellar Bright Rimless 15W"
      },
      {
        "label": "Wattage / Lumens",
        "value": "15 Watts / 1500 Lumens"
      },
      {
        "label": "Efficacy",
        "value": "100 Lumens / Watt"
      },
      {
        "label": "Beam Spread",
        "value": "140\u00b0 Wide Optical Diffusion"
      },
      {
        "label": "Warranty",
        "value": "2 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-phil-sb-cdl",
        "label": "15W Cool Daylight (6500K)",
        "unit": "Piece",
        "price": 485,
        "mrp": 750,
        "discountPercent": 35,
        "stock": 80,
        "image": "/images/products/lighting/philips-stellar-bright-rimless-surface-downlight-15w.webp"
      },
      {
        "id": "var-phil-sb-nw",
        "label": "15W Natural White (4000K)",
        "unit": "Piece",
        "price": 485,
        "mrp": 750,
        "discountPercent": 35,
        "stock": 60,
        "image": "/images/products/lighting/philips-stellar-bright-rimless-surface-downlight-15w.webp"
      }
    ],
    "price": 485,
    "mrp": 750,
    "discountPercent": 35,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Philips Authorized Depot"
  },
  {
    "id": "prod-lighting-wipro-square",
    "slug": "wipro-garnet-wave-led-slim-panel-square-18w",
    "name": "Wipro Garnet Wave LED Ultra-Slim Square Recessed Ceiling Panel 18W",
    "title": "Wipro Garnet Wave LED Ultra-Slim Square Recessed Ceiling Panel 18W",
    "brand": "Wipro",
    "categorySlug": "lighting",
    "categoryName": "Lighting",
    "subCategory": "Recessed Round & Square Panels",
    "image": "/images/products/lighting/wipro-garnet-wave-led-slim-panel-square-18w.webp",
    "images": [
      "/images/products/lighting/wipro-garnet-wave-led-slim-panel-square-18w.webp"
    ],
    "shortTagline": "Sleek Square Profile \u00b7 False Ceiling Spring Clips \u00b7 18W High Output",
    "specChips": [
      "Square Profile",
      "Spring Mount Clips",
      "18W High Power",
      "False Ceiling Ready"
    ],
    "description": "Square ultra-slim LED panel designed for gypsum board, POP, and grid false ceilings. Equipped with heavy-duty spring-loaded clips for effortless flush ceiling mounting. Delivers clean architectural square geometry.",
    "highlights": [
      "Modern square bezel complements contemporary modular false ceiling layouts",
      "Heavy-duty spring retention clips hold the panel firmly flush against ceiling sheets",
      "Side-lit LED guide plate creates completely uniform illumination with zero hotspots",
      "Separate high-efficiency isolated driver ensures cool running and easy serviceability",
      "Backed by Wipro's hassle-free 2-year on-site replacement guarantee"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Wipro Consumer Lighting"
      },
      {
        "label": "Series",
        "value": "Garnet Wave Square Recessed"
      },
      {
        "label": "Shape",
        "value": "Square Form Factor"
      },
      {
        "label": "Cut-Out Size",
        "value": "205 mm x 205 mm (8 x 8 Inch)"
      },
      {
        "label": "Power Rating",
        "value": "18 Watts (1800 Lumens)"
      },
      {
        "label": "Warranty",
        "value": "2 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-wip-sq-12w",
        "label": "12W Square (6x6 inch cut)",
        "unit": "Piece",
        "price": 395,
        "mrp": 720,
        "discountPercent": 45,
        "stock": 70,
        "image": "/images/products/lighting/wipro-garnet-wave-led-slim-panel-square-18w.webp"
      },
      {
        "id": "var-wip-sq-18w",
        "label": "18W Square (8x8 inch cut)",
        "unit": "Piece",
        "price": 495,
        "mrp": 850,
        "discountPercent": 42,
        "stock": 80,
        "image": "/images/products/lighting/wipro-garnet-wave-led-slim-panel-square-18w.webp"
      }
    ],
    "price": 395,
    "mrp": 720,
    "discountPercent": 45,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Wipro Authorized Depot"
  },
  {
    "id": "prod-kitchen-sinks-faucets-futura-dura",
    "slug": "futura-dura-ss-sink",
    "name": "Futura Dura SS 304 Single Bowl Kitchen Sink",
    "title": "Futura Dura SS 304 Single Bowl Kitchen Sink",
    "brand": "Futura",
    "categorySlug": "kitchen-sinks-faucets",
    "categoryName": "Kitchen Sinks & Faucets",
    "subCategory": "SS 304 Single Bowl Sinks",
    "image": "/images/products/kitchen/futura-dura-ss-sink.webp",
    "images": [
      "/images/products/kitchen/futura-dura-ss-sink.webp"
    ],
    "shortTagline": "1.2mm Heavy Gauge AISI 304 Stainless Steel \u00b7 Sound Deadening Pads",
    "specChips": [
      "AISI 304 Steel",
      "1.2mm Heavy Gauge",
      "Sound Deadening",
      "Anti-Condensation"
    ],
    "description": "Futura Dura kitchen sink is precision crafted from 1.2mm heavy gauge AISI 304 food-grade stainless steel. Features a spacious deep bowl with anti-condensation undercoating and thick rubber sound-dampening pads that eliminate noisy dish clatter.",
    "highlights": [
      "1.2mm thick surgical-grade AISI 304 stainless steel resists dents and corrosion",
      "Deep 9-inch bowl accommodates large Indian kadhais, pressure cookers, and thalis",
      "Heavy-duty sound deadening rubber pads absorb noise from high-pressure water streams",
      "Anti-condensation undercoating prevents cabinet humidity and mold under the counter",
      "Sleek satin hairline finish resists hard water stains and cleans effortlessly"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Futura Sinks India"
      },
      {
        "label": "Material Grade",
        "value": "AISI 304 Food-Grade Stainless Steel"
      },
      {
        "label": "Bowl Depth",
        "value": "9.0 Inches (230 mm)"
      },
      {
        "label": "Sheet Thickness",
        "value": "1.2 mm Heavy Gauge"
      },
      {
        "label": "Drain Hole",
        "value": "3.5 Inch Rapid Waste Hole"
      },
      {
        "label": "Installation",
        "value": "Top Mount / Flush Mount Compatible"
      },
      {
        "label": "Warranty",
        "value": "10 Years Limited Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-dura-2418",
        "label": "24 x 18 x 9 Inch (Standard Kitchen)",
        "unit": "Sink",
        "price": 3996,
        "mrp": 4995,
        "discountPercent": 20,
        "stock": 40,
        "image": "/images/products/kitchen/futura-dura-ss-sink.webp"
      },
      {
        "id": "var-dura-2118",
        "label": "21 x 18 x 8 Inch (Compact Kitchen)",
        "unit": "Sink",
        "price": 3450,
        "mrp": 4350,
        "discountPercent": 21,
        "stock": 30,
        "image": "/images/products/kitchen/futura-dura-ss-sink.webp"
      },
      {
        "id": "var-dura-1816",
        "label": "18 x 16 x 8 Inch (Bar / Island Sink)",
        "unit": "Sink",
        "price": 2950,
        "mrp": 3750,
        "discountPercent": 21,
        "stock": 25,
        "image": "/images/products/kitchen/futura-dura-ss-sink.webp"
      }
    ],
    "price": 3996,
    "mrp": 4995,
    "discountPercent": 20,
    "unit": "Sink",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Futura Authorized Depot"
  },
  {
    "id": "prod-kitchen-sinks-faucets-futura-drain",
    "slug": "futura-dura-ss-sink-drainboard",
    "name": "Futura Dura SS Sink with Drainboard (37 x 18 x 8 Inch)",
    "title": "Futura Dura SS Sink with Drainboard (37 x 18 x 8 Inch)",
    "brand": "Futura",
    "categorySlug": "kitchen-sinks-faucets",
    "categoryName": "Kitchen Sinks & Faucets",
    "subCategory": "SS Sinks with Drainboard",
    "image": "/images/products/kitchen/futura-dura-ss-sink-drainboard.webp",
    "images": [
      "/images/products/kitchen/futura-dura-ss-sink-drainboard.webp"
    ],
    "shortTagline": "Sloped Drying Drainboard \u00b7 Seamless Deep Draw \u00b7 Food Grade SS 304",
    "specChips": [
      "Integrated Drainboard",
      "SS 304 Stainless",
      "Sloped Run-Off",
      "Waste Coupling Included"
    ],
    "description": "Futura Dura sink with integrated side drainboard provides a convenient drying station for washed dishes, vegetables, and pots. Water drains automatically back into the main sink bowl via the sloped grooved drainboard.",
    "highlights": [
      "Full-length grooved drainboard allows washed utensils to drip dry without water pooling",
      "Deep single bowl paired with drainboard for efficient multitasking in busy kitchens",
      "Seamless pressed bowl eliminates corner seams where grease and bacteria gather",
      "Includes heavy brass pop-up waste coupling and flexible corrugated drain pipe",
      "Reversible design allows left-hand or right-hand drainboard countertop orientation"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Futura Sinks India"
      },
      {
        "label": "Overall Dimensions",
        "value": "37\" x 18\" x 8\" (940 x 457 x 203 mm)"
      },
      {
        "label": "Bowl Size",
        "value": "18\" x 16\" x 8\" Deep Bowl"
      },
      {
        "label": "Material",
        "value": "Grade 304 Stainless Steel"
      },
      {
        "label": "Finish",
        "value": "Brushed Satin Matt"
      },
      {
        "label": "Included In Box",
        "value": "Sink, 3.5\" Waste Coupling, Drain Pipe"
      },
      {
        "label": "Warranty",
        "value": "10 Years Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-dr-std",
        "label": "Standard Satin Finish (37x18x8 in)",
        "unit": "Sink",
        "price": 7452,
        "mrp": 9315,
        "discountPercent": 20,
        "stock": 25,
        "image": "/images/products/kitchen/futura-dura-ss-sink-drainboard.webp"
      },
      {
        "id": "var-dr-kit",
        "label": "With Waste Coupling & Pipe Kit",
        "unit": "Complete Kit",
        "price": 7850,
        "mrp": 9900,
        "discountPercent": 21,
        "stock": 20,
        "image": "/images/products/kitchen/futura-dura-ss-sink-drainboard.webp"
      }
    ],
    "price": 7452,
    "mrp": 9315,
    "discountPercent": 20,
    "unit": "Sink",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Futura Authorized Depot"
  },
  {
    "id": "prod-kitchen-sinks-faucets-futura-undermount",
    "slug": "futura-undermount-series-ss-sink",
    "name": "Futura Undermount Series SS Sink, FS 503 (31 x 18 x 9 Inch)",
    "title": "Futura Undermount Series SS Sink, FS 503 (31 x 18 x 9 Inch)",
    "brand": "Futura",
    "categorySlug": "kitchen-sinks-faucets",
    "categoryName": "Kitchen Sinks & Faucets",
    "subCategory": "Composite Quartz Sinks",
    "image": "/images/products/kitchen/futura-undermount-series-ss-sink.webp",
    "images": [
      "/images/products/kitchen/futura-undermount-series-ss-sink.webp"
    ],
    "shortTagline": "Undermount Seamless Granite Fit \u00b7 Zero Overhanging Lip \u00b7 Premium Kitchens",
    "specChips": [
      "Undermount Fit",
      "Seamless Granite Edge",
      "R10 Easy Clean Corners",
      "1.2mm SS304"
    ],
    "description": "Architectural undermount kitchen sink engineered to mount seamlessly below granite, quartz, or marble countertops. Eliminates top rim edges, allowing countertop crumbs and spills to be wiped directly into the sink bowl.",
    "highlights": [
      "Undermount installation creates an uninterrupted seamless luxury granite countertop look",
      "Tight R10 rounded internal corners combine modern square look with easy sponge cleaning",
      "Heavy 1.2mm thick SS 304 steel prevents flex and supports heavy waste disposal units",
      "Full undercoating and dense acoustic sound dampening pads on all four sides and base",
      "Includes undermount mounting brackets, cutout template, and stainless steel basket strainer"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Futura Sinks India"
      },
      {
        "label": "Model",
        "value": "FS 503 Undermount Series"
      },
      {
        "label": "Outer Dimensions",
        "value": "31\" x 18\" x 9\" (787 x 457 x 230 mm)"
      },
      {
        "label": "Corner Radius",
        "value": "R10 Smooth Curved Corners"
      },
      {
        "label": "Steel Spec",
        "value": "18/8 AISI 304 Stainless Steel"
      },
      {
        "label": "Counter Compatibility",
        "value": "Granite, Quartz, Marble, Solid Surface"
      },
      {
        "label": "Warranty",
        "value": "10 Years Brand Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-um-3118",
        "label": "31 x 18 x 9 Inch (Granite Undermount)",
        "unit": "Sink",
        "price": 8760,
        "mrp": 10950,
        "discountPercent": 20,
        "stock": 25,
        "image": "/images/products/kitchen/futura-undermount-series-ss-sink.webp"
      },
      {
        "id": "var-um-2818",
        "label": "28 x 18 x 9 Inch (Granite Undermount)",
        "unit": "Sink",
        "price": 7950,
        "mrp": 9950,
        "discountPercent": 20,
        "stock": 20,
        "image": "/images/products/kitchen/futura-undermount-series-ss-sink.webp"
      }
    ],
    "price": 8760,
    "mrp": 10950,
    "discountPercent": 20,
    "unit": "Sink",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Futura Authorized Depot"
  },
  {
    "id": "prod-kitchen-sinks-faucets-futura-handcarved",
    "slug": "futura-hand-carved-series-ss-sink",
    "name": "Futura Hand Carved Series SS Sink, Commercial Heavy Gauge",
    "title": "Futura Hand Carved Series SS Sink, Commercial Heavy Gauge",
    "brand": "Futura",
    "categorySlug": "kitchen-sinks-faucets",
    "categoryName": "Kitchen Sinks & Faucets",
    "subCategory": "SS 304 Single Bowl Sinks",
    "image": "/images/products/kitchen/futura-hand-carved-series-ss-sink.webp",
    "images": [
      "/images/products/kitchen/futura-hand-carved-series-ss-sink.webp"
    ],
    "shortTagline": "Handcrafted Sharp Geometry \u00b7 1.5mm Ultra-Heavy Steel \u00b7 X-Channel Drainage",
    "specChips": [
      "Handmade 1.5mm",
      "X-Channel Drain",
      "Satin Polish",
      "Ultra Heavy Duty"
    ],
    "description": "Handmade luxury square kitchen sink fabricated from ultra-heavy 1.5mm gauge steel. Features laser-welded seams, precision geometric drainage grooves (X-channels), and tight corners for an industrial chef-kitchen aesthetic.",
    "highlights": [
      "Ultra-heavy 1.5mm commercial gauge steel offers extreme durability with zero vibration",
      "X-channel drainage grooves guide water directly to the center waste drain quickly",
      "Hand-polished European satin finish provides high resistance to scratches and stains",
      "Rear-set drain placement creates more usable flat storage space inside the base cabinet",
      "Dual installation design supports both flush undermount and sleek drop-in top mounting"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Futura Sinks India"
      },
      {
        "label": "Craftsmanship",
        "value": "Handcrafted Fabricated Series"
      },
      {
        "label": "Gauge Thickness",
        "value": "1.5 mm Heavy Duty Stainless Steel"
      },
      {
        "label": "Dimensions",
        "value": "24\" x 18\" x 10\" Extra Deep"
      },
      {
        "label": "Drain Type",
        "value": "X-Channel Fast Runoff Drain"
      },
      {
        "label": "Warranty",
        "value": "15 Years Brand Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-hc-2418",
        "label": "24 x 18 x 10 Inch Deep",
        "unit": "Sink",
        "price": 5200,
        "mrp": 6500,
        "discountPercent": 20,
        "stock": 30,
        "image": "/images/products/kitchen/futura-hand-carved-series-ss-sink.webp"
      },
      {
        "id": "var-hc-3018",
        "label": "30 x 18 x 10 Inch Jumbo",
        "unit": "Sink",
        "price": 6800,
        "mrp": 8500,
        "discountPercent": 20,
        "stock": 20,
        "image": "/images/products/kitchen/futura-hand-carved-series-ss-sink.webp"
      }
    ],
    "price": 5200,
    "mrp": 6500,
    "discountPercent": 20,
    "unit": "Sink",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Futura Authorized Depot"
  },
  {
    "id": "prod-kitchen-sinks-faucets-cera-sink-cock",
    "slug": "cera-garnet-gooseneck-sink-cock",
    "name": "Cera Garnet Swivel Spout Sink Cock with Flange",
    "title": "Cera Garnet Swivel Spout Sink Cock with Flange",
    "brand": "Cera",
    "categorySlug": "kitchen-sinks-faucets",
    "categoryName": "Kitchen Sinks & Faucets",
    "subCategory": "Pull-Out Gooseneck Faucets",
    "image": "/images/products/sanitary/cera-garnet-bib-cock.webp",
    "images": [
      "/images/products/sanitary/cera-garnet-bib-cock.webp"
    ],
    "shortTagline": "Solid Brass Casting \u00b7 360\u00b0 Swivel Spout \u00b7 High Arch Clearance",
    "specChips": [
      "Solid Brass Body",
      "360\u00b0 Swivel Arch",
      "Chrome Finish",
      "Ceramic Cartridge"
    ],
    "description": "High-arch gooseneck kitchen sink faucet designed for washing large pots and tall jugs. Engineered from virgin brass with mirror-finish chrome plating and a 360-degree rotating swivel spout.",
    "highlights": [
      "Solid virgin brass casting ensures lifelong durability against hard water corrosion",
      "High arch gooseneck design provides ample clearance for filling tall stockpots",
      "360-degree smooth swivel spout easily services double-bowl sink configurations",
      "German ceramic disc cartridge tested for over 500,000 drip-free switching cycles",
      "Multi-layer electrolytic chrome plating retains brilliant reflective shine for years"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware Limited"
      },
      {
        "label": "Series",
        "value": "Garnet Faucet Collection"
      },
      {
        "label": "Spout Type",
        "value": "360\u00b0 Rotating Gooseneck Spout"
      },
      {
        "label": "Body Material",
        "value": "High Purity Forged Brass"
      },
      {
        "label": "Cartridge",
        "value": "Quarter Turn Ceramic Disc"
      },
      {
        "label": "Warranty",
        "value": "7 Years Manufacturer Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-fauc-table",
        "label": "Table Mounted (Deck Mount)",
        "unit": "Piece",
        "price": 1480,
        "mrp": 1950,
        "discountPercent": 24,
        "stock": 45,
        "image": "/images/products/sanitary/cera-garnet-bib-cock.webp"
      },
      {
        "id": "var-fauc-wall",
        "label": "Wall Mounted (Overhead Sink)",
        "unit": "Piece",
        "price": 1550,
        "mrp": 2050,
        "discountPercent": 24,
        "stock": 40,
        "image": "/images/products/sanitary/cera-garnet-bib-cock.webp"
      }
    ],
    "price": 1480,
    "mrp": 1950,
    "discountPercent": 24,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Cera Authorized Depot"
  },
  {
    "id": "prod-kitchen-sinks-faucets-cera-sink-waste",
    "slug": "cera-heavy-duty-sink-waste-coupling",
    "name": "Cera SS 304 Kitchen Sink Waste Coupling & Anti-Odor Trap",
    "title": "Cera SS 304 Kitchen Sink Waste Coupling & Anti-Odor Trap",
    "brand": "Cera",
    "categorySlug": "kitchen-sinks-faucets",
    "categoryName": "Kitchen Sinks & Faucets",
    "subCategory": "Sink Waste Strainers & Traps",
    "image": "/images/products/sanitary/cera-bottle-trap.webp",
    "images": [
      "/images/products/sanitary/cera-bottle-trap.webp"
    ],
    "shortTagline": "Removable Strainer Basket \u00b7 Anti-Clog Design \u00b7 Prevents Sewer Odors",
    "specChips": [
      "Removable Basket",
      "Anti-Odor Trap",
      "SS 304 Steel",
      "Zero Clogging"
    ],
    "description": "Heavy-duty kitchen sink waste coupling with a removable deep stainless steel strainer basket that catches food particles and peels before they enter drainpipes. Includes a water-seal anti-odor trap to block sewer gas.",
    "highlights": [
      "Deep removable perforated stainless basket catches food scraps without slowing drainage",
      "Water-seal trap technology permanently blocks foul sewer gases from entering kitchen",
      "Solid brass threaded coupling lock ring ensures a permanent drip-tight connection",
      "Standard 3.5-inch flange fits all Indian and imported kitchen sink drain openings",
      "Effortless to empty and clean: simply lift the center stem handle and rinse"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "Flange Diameter",
        "value": "3.5 Inch Standard (114 mm)"
      },
      {
        "label": "Basket Material",
        "value": "Grade 304 Stainless Steel"
      },
      {
        "label": "Seal",
        "value": "Double EPDM Silicone Gaskets"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-wst-3in",
        "label": "3.5 Inch Standard Coupling",
        "unit": "Piece",
        "price": 420,
        "mrp": 590,
        "discountPercent": 29,
        "stock": 80,
        "image": "/images/products/sanitary/cera-bottle-trap.webp"
      },
      {
        "id": "var-wst-deep",
        "label": "4.0 Inch Commercial Waste System",
        "unit": "Piece",
        "price": 580,
        "mrp": 820,
        "discountPercent": 29,
        "stock": 50,
        "image": "/images/products/sanitary/cera-bottle-trap.webp"
      }
    ],
    "price": 420,
    "mrp": 590,
    "discountPercent": 29,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Cera Authorized Depot"
  },
  {
    "id": "prod-furniture-wardrobe-bed-hardware-ebco-drawer-slide",
    "slug": "ebco-telescopic-drawer-slides-channel",
    "name": "Ebco Heavy-Duty 45kg Telescopic Ball Bearing Drawer Slides",
    "title": "Ebco Heavy-Duty 45kg Telescopic Ball Bearing Drawer Slides",
    "brand": "Ebco",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Telescopic Drawer Slides",
    "image": "/images/products/furniture-hardware/ebco-telescopic-channel-18.webp",
    "images": [
      "/images/products/furniture-hardware/ebco-telescopic-channel-18.webp"
    ],
    "shortTagline": "45kg Load Capacity \u00b7 Precision Steel Ball Bearings \u00b7 Full Extension",
    "specChips": [
      "45kg Load Rated",
      "Full Extension",
      "Steel Ball Bearings",
      "50k Cycles Tested"
    ],
    "description": "Ebco telescopic drawer slides are the industry standard for smooth, silent drawer operation in modular kitchens and wardrobes. Engineered with hardened high-carbon steel ball bearings and cold-rolled steel rails supporting 45kg dynamic load.",
    "highlights": [
      "Three-fold full extension brings the entire drawer box out for effortless rear access",
      "High-precision steel ball bearings ensure silk-smooth glide with zero lateral play",
      "Cold-rolled steel rails with electroplated zinc finish resist rust in humid climates",
      "Tested for 50,000 opening and closing cycles under full 45kg payload",
      "Convenient quick-release lever allows easy drawer removal for cleaning and maintenance"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco India Private Limited"
      },
      {
        "label": "Type",
        "value": "Full Extension Telescopic Ball Bearing Slide"
      },
      {
        "label": "Load Capacity",
        "value": "45 kg Dynamic Load per Pair"
      },
      {
        "label": "Material",
        "value": "Cold-Rolled Hardened Carbon Steel"
      },
      {
        "label": "Finish",
        "value": "Zinc Plated with Protective Lacquer"
      },
      {
        "label": "Cycle Test",
        "value": "50,000 Cycles (BIFMA Compliant)"
      },
      {
        "label": "Warranty",
        "value": "5 Years Brand Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-sl-12in",
        "label": "12 Inch (300mm)",
        "unit": "Pair",
        "price": 290,
        "mrp": 380,
        "discountPercent": 24,
        "stock": 60,
        "image": "/images/products/furniture-hardware/ebco-telescopic-channel-18.webp"
      },
      {
        "id": "var-sl-14in",
        "label": "14 Inch (350mm)",
        "unit": "Pair",
        "price": 330,
        "mrp": 430,
        "discountPercent": 23,
        "stock": 60,
        "image": "/images/products/furniture-hardware/ebco-telescopic-channel-18.webp"
      },
      {
        "id": "var-sl-16in",
        "label": "16 Inch (400mm)",
        "unit": "Pair",
        "price": 360,
        "mrp": 470,
        "discountPercent": 23,
        "stock": 70,
        "image": "/images/products/furniture-hardware/ebco-telescopic-channel-18.webp"
      },
      {
        "id": "var-sl-18in",
        "label": "18 Inch (450mm)",
        "unit": "Pair",
        "price": 380,
        "mrp": 490,
        "discountPercent": 22,
        "stock": 100,
        "image": "/images/products/furniture-hardware/ebco-telescopic-channel-18.webp"
      },
      {
        "id": "var-sl-20in",
        "label": "20 Inch (500mm)",
        "unit": "Pair",
        "price": 430,
        "mrp": 560,
        "discountPercent": 23,
        "stock": 80,
        "image": "/images/products/furniture-hardware/ebco-telescopic-channel-18.webp"
      },
      {
        "id": "var-sl-22in",
        "label": "22 Inch (550mm)",
        "unit": "Pair",
        "price": 480,
        "mrp": 620,
        "discountPercent": 23,
        "stock": 40,
        "image": "/images/products/furniture-hardware/ebco-telescopic-channel-18.webp"
      }
    ],
    "price": 290,
    "mrp": 380,
    "discountPercent": 24,
    "unit": "Pair",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ebco Authorized Depot"
  },
  {
    "id": "prod-furniture-wardrobe-bed-hardware-hettich-onsys",
    "slug": "hettich-onsys-soft-close-concealed-hinge",
    "name": "Hettich OnSys Integrated Soft-Close Concealed Cabinet Hinges",
    "title": "Hettich OnSys Integrated Soft-Close Concealed Cabinet Hinges",
    "brand": "Hettich",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Soft-Close Concealed Hinges",
    "image": "/images/products/furniture-hardware/hettich-onsys-soft-close-hinge.webp",
    "images": [
      "/images/products/furniture-hardware/hettich-onsys-soft-close-hinge.webp"
    ],
    "shortTagline": "German Engineering \u00b7 Integrated Silent Hydraulic Damper \u00b7 105\u00b0 Opening",
    "specChips": [
      "Integrated Soft-Close",
      "German Engineering",
      "105\u00b0 Opening Angle",
      "Nickel Plated"
    ],
    "description": "Hettich OnSys concealed hinges feature a built-in hydraulic soft-close damper right inside the hinge arm. Shuts heavy cabinet doors silently and gently, eliminating door slamming damage in modular kitchens and wardrobes.",
    "highlights": [
      "Integrated hydraulic damper ensures silent, controlled closing motion on every door",
      "3-way cam adjustment allows effortless up/down, left/right, and depth door alignment",
      "Deep 35mm cup diameter provides rock-solid mounting in 16mm to 22mm thick door panels",
      "Triple-layer corrosion-resistant nickel plating resists tarnishing and grease",
      "Tested for 40,000 continuous door cycles meeting European EN 15570 Level 2 standards"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich Germany (India)"
      },
      {
        "label": "Series",
        "value": "OnSys Integrated Soft-Close"
      },
      {
        "label": "Cup Diameter",
        "value": "35 mm (11.5 mm Depth)"
      },
      {
        "label": "Opening Angle",
        "value": "105 Degree"
      },
      {
        "label": "Door Thickness",
        "value": "16 mm to 24 mm"
      },
      {
        "label": "Standard",
        "value": "EN 15570 Level 2 Certified"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-hng-0c",
        "label": "0 Crank (Full Overlay)",
        "unit": "Pair",
        "price": 195,
        "mrp": 260,
        "discountPercent": 25,
        "stock": 150,
        "image": "/images/products/furniture-hardware/hettich-onsys-soft-close-hinge.webp"
      },
      {
        "id": "var-hng-8c",
        "label": "8 Crank (Half Overlay / Twin Door)",
        "unit": "Pair",
        "price": 205,
        "mrp": 275,
        "discountPercent": 25,
        "stock": 100,
        "image": "/images/products/furniture-hardware/hettich-onsys-soft-close-hinge.webp"
      },
      {
        "id": "var-hng-16c",
        "label": "16 Crank (Inset / Internal Door)",
        "unit": "Pair",
        "price": 215,
        "mrp": 290,
        "discountPercent": 26,
        "stock": 80,
        "image": "/images/products/furniture-hardware/hettich-onsys-soft-close-hinge.webp"
      }
    ],
    "price": 195,
    "mrp": 260,
    "discountPercent": 25,
    "unit": "Pair",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Hettich Authorized Depot"
  },
  {
    "id": "prod-furniture-wardrobe-bed-hardware-ebco-wardrobe-lift",
    "slug": "ebco-wardrobe-lift-hanger",
    "name": "Ebco Pull-Down Wardrobe Lift Hanger Mechanism (Hydraulic)",
    "title": "Ebco Pull-Down Wardrobe Lift Hanger Mechanism (Hydraulic)",
    "brand": "Ebco",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Hydraulic Bed Lift Mechanisms",
    "image": "/images/products/furniture-hardware/ebco-wardrobe-lift-hanger.webp",
    "images": [
      "/images/products/furniture-hardware/ebco-wardrobe-lift-hanger.webp"
    ],
    "shortTagline": "Hydraulic Soft Return \u00b7 Access Tall Wardrobe Tops \u00b7 12kg Load Capacity",
    "specChips": [
      "Hydraulic Soft Drop",
      "12kg Garment Load",
      "Chrome & Grey",
      "Width Adjustable"
    ],
    "description": "Ergonomic pull-down hydraulic wardrobe hanger that allows easy access to high wardrobe hanging rails without a ladder. Smooth hydraulic motion lowers clothes hangers to chest level and returns smoothly with assisted soft damping.",
    "highlights": [
      "Enables full-height wardrobe storage up to 9 feet without needing a step stool",
      "Internal hydraulic damper provides controlled descent and smooth upward return",
      "Telescopic width adjustment bar fits standard wardrobe internal carcass widths",
      "Strong aluminum hanging rail and reinforced fiberglass-nylon housing hold 12kg",
      "Soft padded ergonomic pull-down handle ensures comfortable one-hand operation"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco India"
      },
      {
        "label": "Mechanism",
        "value": "Hydraulic Damped Pull-Down Lift"
      },
      {
        "label": "Weight Capacity",
        "value": "12 kg Hanging Garments"
      },
      {
        "label": "Internal Cabinet Width",
        "value": "Adjustable 830 mm to 1150 mm"
      },
      {
        "label": "Finish",
        "value": "Anodized Silver / Anthracite Grey"
      },
      {
        "label": "Warranty",
        "value": "5 Years Brand Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-lift-med",
        "label": "600 - 830mm Width (Medium Wardrobe)",
        "unit": "Unit",
        "price": 2850,
        "mrp": 3600,
        "discountPercent": 21,
        "stock": 25,
        "image": "/images/products/furniture-hardware/ebco-wardrobe-lift-hanger.webp"
      },
      {
        "id": "var-lift-lge",
        "label": "830 - 1150mm Width (Wide Wardrobe)",
        "unit": "Unit",
        "price": 3200,
        "mrp": 4100,
        "discountPercent": 22,
        "stock": 30,
        "image": "/images/products/furniture-hardware/ebco-wardrobe-lift-hanger.webp"
      }
    ],
    "price": 2850,
    "mrp": 3600,
    "discountPercent": 21,
    "unit": "Unit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ebco Authorized Depot"
  },
  {
    "id": "prod-furniture-wardrobe-bed-hardware-ebco-trouser-rack",
    "slug": "ebco-wardrobe-trouser-pull-out",
    "name": "Ebco Soft-Closing Wardrobe Trouser & Saree Pull-Out Rack",
    "title": "Ebco Soft-Closing Wardrobe Trouser & Saree Pull-Out Rack",
    "brand": "Ebco",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Wardrobe Sliding Systems",
    "image": "/images/products/furniture-hardware/ebco-wardrobe-trouser-pull-out.webp",
    "images": [
      "/images/products/furniture-hardware/ebco-wardrobe-trouser-pull-out.webp"
    ],
    "shortTagline": "Soft-Close Telescopic Runner \u00b7 Anti-Slip Rubber Rings \u00b7 9 Hanger Arms",
    "specChips": [
      "Soft-Close Slide",
      "Anti-Slip Rubber Rings",
      "9 Hanger Arms",
      "Crease-Free Hanging"
    ],
    "description": "Sliding pull-out wardrobe organizer designed for wrinkle-free hanging of trousers, trousers, and sarees. Features nine anti-slip grooved rods and soft-closing telescopic drawer slides that glide out smoothly.",
    "highlights": [
      "Soft-closing ball-bearing runners pull out fully for complete visibility and access",
      "Non-slip silicone grip rings keep slippery silk trousers and sarees from falling",
      "Heavy gauge chrome-plated steel frame maintains horizontal rigidity under load",
      "Compact side or top mount installation integrates into standard wardrobe modules",
      "Keeps pressed clothes organized and crease-free without crowding conventional hangers"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco India"
      },
      {
        "label": "Type",
        "value": "Pull-Out Trouser / Saree Holder"
      },
      {
        "label": "Capacity",
        "value": "9 Hanging Arms with Anti-Slip Rings"
      },
      {
        "label": "Slide Tech",
        "value": "Under-Mount Damped Soft-Closing Runners"
      },
      {
        "label": "Cabinet Width",
        "value": "Fits 600 mm to 900 mm Wardrobes"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-tr-600",
        "label": "600mm Cabinet Unit (9 Arms)",
        "unit": "Unit",
        "price": 2450,
        "mrp": 3100,
        "discountPercent": 21,
        "stock": 35,
        "image": "/images/products/furniture-hardware/ebco-wardrobe-trouser-pull-out.webp"
      },
      {
        "id": "var-tr-900",
        "label": "900mm Cabinet Unit (14 Arms)",
        "unit": "Unit",
        "price": 3150,
        "mrp": 3990,
        "discountPercent": 21,
        "stock": 25,
        "image": "/images/products/furniture-hardware/ebco-wardrobe-trouser-pull-out.webp"
      }
    ],
    "price": 2450,
    "mrp": 3100,
    "discountPercent": 21,
    "unit": "Unit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ebco Authorized Depot"
  },
  {
    "id": "prod-furniture-wardrobe-bed-hardware-hettich-handle",
    "slug": "hettich-cabinet-handle-6-ss",
    "name": "Hettich Premium Solid SS 304 Wardrobe & Cabinet D-Handle (6 Inch)",
    "title": "Hettich Premium Solid SS 304 Wardrobe & Cabinet D-Handle (6 Inch)",
    "brand": "Hettich",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Furniture Legs & Levelers",
    "image": "/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp",
    "images": [
      "/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp"
    ],
    "shortTagline": "Solid Grade 304 Stainless Steel \u00b7 Satin Matt Finish \u00b7 Heavy Feel",
    "specChips": [
      "Solid SS 304",
      "Satin Matt",
      "Zero Rust",
      "Threaded Brass Bush"
    ],
    "description": "Architectural cabinet handle precision CNC-machined from solid stainless steel round bar. Designed for contemporary kitchen cabinets, wardrobe shutters, and bathroom drawers with an understated satin matt finish.",
    "highlights": [
      "Solid stainless steel construction provides a heavy, reassuring feel in the hand",
      "Grade 304 steel guarantees zero rust or pitting even in high-humidity kitchens",
      "Fine satin brushed finish resists fingerprint smudges and matches modern appliances",
      "Deep-threaded blind mounting holes ensure tight, wobble-free screw fastening",
      "Includes M4 breakaway mounting screws compatible with various panel thicknesses"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich Germany"
      },
      {
        "label": "Material",
        "value": "Solid AISI 304 Stainless Steel"
      },
      {
        "label": "Center-to-Center",
        "value": "128 mm (6 Inch Handle Length)"
      },
      {
        "label": "Finish",
        "value": "Brushed Satin Matt Chrome"
      },
      {
        "label": "Screw Fix",
        "value": "Rear M4 Bolt Fixation"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-hnd-4in",
        "label": "4 Inch (96mm C-to-C)",
        "unit": "Piece",
        "price": 125,
        "mrp": 175,
        "discountPercent": 29,
        "stock": 100,
        "image": "/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp"
      },
      {
        "id": "var-hnd-6in",
        "label": "6 Inch (128mm C-to-C)",
        "unit": "Piece",
        "price": 165,
        "mrp": 230,
        "discountPercent": 28,
        "stock": 120,
        "image": "/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp"
      },
      {
        "id": "var-hnd-8in",
        "label": "8 Inch (192mm C-to-C)",
        "unit": "Piece",
        "price": 215,
        "mrp": 295,
        "discountPercent": 27,
        "stock": 80,
        "image": "/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp"
      },
      {
        "id": "var-hnd-12in",
        "label": "12 Inch (256mm C-to-C Large)",
        "unit": "Piece",
        "price": 310,
        "mrp": 420,
        "discountPercent": 26,
        "stock": 50,
        "image": "/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp"
      }
    ],
    "price": 125,
    "mrp": 175,
    "discountPercent": 29,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Hettich Authorized Depot"
  },
  {
    "id": "prod-furniture-wardrobe-bed-hardware-hettich-ka5632",
    "slug": "hettich-ka-5632-heavy-channel",
    "name": "Hettich KA 5632 Precision Telescopic Ball Bearing Channel (18 Inch)",
    "title": "Hettich KA 5632 Precision Telescopic Ball Bearing Channel (18 Inch)",
    "brand": "Hettich",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Telescopic Drawer Slides",
    "image": "/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp",
    "images": [
      "/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp"
    ],
    "shortTagline": "German Heavy-Duty 45kg Slide \u00b7 Integrated Hold-In Detent \u00b7 Precision Balls",
    "specChips": [
      "Hettich KA Series",
      "45kg Heavy Duty",
      "Hold-In Detent",
      "Zero Play Movement"
    ],
    "description": "Hettich KA 5632 is an internationally renowned ball-bearing drawer runner known for silent, silky gliding accuracy. Built with high-precision steel balls and an integrated hold-in detent that prevents drawers from rolling open accidentally.",
    "highlights": [
      "Ultra-smooth ball race ensures whisper-quiet travel even under heavy 45kg loads",
      "Full extension capability provides instant view and reach to all drawer contents",
      "Integrated hold-in detent keeps drawer securely latched closed on slightly uneven floors",
      "High-grade electro-galvanized finish offers superior salt-spray corrosion protection",
      "Complies with DIN EN 15338 Level 3 standards for heavy residential and commercial use"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich Germany"
      },
      {
        "label": "Model",
        "value": "KA 5632 Telescopic Runner"
      },
      {
        "label": "Length",
        "value": "450 mm (18 Inch)"
      },
      {
        "label": "Load Capacity",
        "value": "45 kg Dynamic (EN 15338)"
      },
      {
        "label": "Extension",
        "value": "100% Full Extension"
      },
      {
        "label": "Standard",
        "value": "DIN EN 15338 Level 3"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-ka-14in",
        "label": "14 Inch (350mm)",
        "unit": "Pair",
        "price": 420,
        "mrp": 550,
        "discountPercent": 24,
        "stock": 40,
        "image": "/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp"
      },
      {
        "id": "var-ka-16in",
        "label": "16 Inch (400mm)",
        "unit": "Pair",
        "price": 470,
        "mrp": 620,
        "discountPercent": 24,
        "stock": 45,
        "image": "/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp"
      },
      {
        "id": "var-ka-18in",
        "label": "18 Inch (450mm)",
        "unit": "Pair",
        "price": 520,
        "mrp": 680,
        "discountPercent": 24,
        "stock": 60,
        "image": "/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp"
      },
      {
        "id": "var-ka-20in",
        "label": "20 Inch (500mm)",
        "unit": "Pair",
        "price": 580,
        "mrp": 750,
        "discountPercent": 23,
        "stock": 35,
        "image": "/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp"
      }
    ],
    "price": 420,
    "mrp": 550,
    "discountPercent": 24,
    "unit": "Pair",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Hettich Authorized Depot"
  },
  {
    "id": "prod-modular-kitchen-systems-ebco-plain-basket",
    "slug": "ebco-ss-kitchen-basket-plain",
    "name": "Ebco SS 304 Wire Plain Kitchen Drawer Pull-Out Basket",
    "title": "Ebco SS 304 Wire Plain Kitchen Drawer Pull-Out Basket",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS Wire Cutlery & Grain Baskets",
    "image": "/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp",
    "images": [
      "/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp"
    ],
    "shortTagline": "100% Stainless Steel 304 \u00b7 Mirror Polished Wire Mesh \u00b7 Multi-Purpose",
    "specChips": [
      "AISI 304 Steel",
      "Electro-Polished",
      "Multi-Purpose Storage",
      "Zero Rust"
    ],
    "description": "Heavy-duty plain pull-out kitchen wire basket fabricated from certified AISI 304 stainless steel wires. Ideal for storing pots, pans, dry grocery boxes, and mixing bowls in base modular cabinets.",
    "highlights": [
      "100% AISI 304 stainless steel wire construction never rusts or tarnishes",
      "Thick 6mm perimeter support frame prevents deformation under heavy cookware loads",
      "Electrolytically polished finish provides a bright chrome-like luster that cleans easily",
      "Universal side brackets mount directly onto standard telescopic drawer slides",
      "Open wire mesh design allows air circulation and prevents kitchen dust accumulation"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco India"
      },
      {
        "label": "Material",
        "value": "AISI 304 Stainless Steel Round Wires"
      },
      {
        "label": "Cabinet Depth",
        "value": "Fits 500 mm (20 Inch) Deep Carcass"
      },
      {
        "label": "Load Capacity",
        "value": "35 kg Uniform Distributed Load"
      },
      {
        "label": "Finish",
        "value": "High Gloss Electro-Polish"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-bsk-4in",
        "label": "4 Inch Height (Cups & Saucers)",
        "unit": "Basket",
        "price": 1450,
        "mrp": 1950,
        "discountPercent": 26,
        "stock": 40,
        "image": "/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp"
      },
      {
        "id": "var-bsk-6in",
        "label": "6 Inch Height (Utensils & Bowls)",
        "unit": "Basket",
        "price": 1750,
        "mrp": 2350,
        "discountPercent": 26,
        "stock": 45,
        "image": "/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp"
      },
      {
        "id": "var-bsk-8in",
        "label": "8 Inch Height (Pots & Heavy Pans)",
        "unit": "Basket",
        "price": 2100,
        "mrp": 2800,
        "discountPercent": 25,
        "stock": 35,
        "image": "/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp"
      }
    ],
    "price": 1450,
    "mrp": 1950,
    "discountPercent": 26,
    "unit": "Basket",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ebco Authorized Depot"
  },
  {
    "id": "prod-modular-kitchen-systems-ebco-grain-basket",
    "slug": "ebco-ss-kitchen-basket-grain",
    "name": "Ebco Heavy-Duty Thali & Plate Partition Kitchen Basket",
    "title": "Ebco Heavy-Duty Thali & Plate Partition Kitchen Basket",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS Wire Cutlery & Grain Baskets",
    "image": "/images/products/modular-kitchen/ebco-ss-kitchen-basket-grain.webp",
    "images": [
      "/images/products/modular-kitchen/ebco-ss-kitchen-basket-grain.webp"
    ],
    "shortTagline": "Dedicated Thali & Plate Slots \u00b7 Holds Up to 18 Large Dinner Plates",
    "specChips": [
      "Thali & Plate Racks",
      "Stainless Steel 304",
      "Rattle Free",
      "Heavy Load"
    ],
    "description": "Specialized stainless steel plate and thali storage pull-out basket. Designed with curved wire separators that hold dinner plates and large metal thalis upright without scratching or clattering when the drawer opens.",
    "highlights": [
      "Individual vertical slots securely separate plates and prevent chip damage",
      "Accommodates up to 18 dinner plates and large traditional Indian serving thalis",
      "Crafted from premium AISI 304 stainless steel for lifelong rust immunity",
      "Smooth glide motion prevents stacked plates from tumbling during rapid drawer closure",
      "Includes base drip tray groove to prevent water residue inside the wooden carcass"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco India"
      },
      {
        "label": "Type",
        "value": "Thali / Plate Organizer Basket"
      },
      {
        "label": "Material",
        "value": "AISI 304 Stainless Steel"
      },
      {
        "label": "Plate Capacity",
        "value": "18 - 24 Standard Indian Thalis"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-th-1720",
        "label": "17 x 20 x 6 Inch (Small Modular)",
        "unit": "Basket",
        "price": 1850,
        "mrp": 2450,
        "discountPercent": 24,
        "stock": 35,
        "image": "/images/products/modular-kitchen/ebco-ss-kitchen-basket-grain.webp"
      },
      {
        "id": "var-th-1920",
        "label": "19 x 20 x 8 Inch (Standard Modular)",
        "unit": "Basket",
        "price": 2250,
        "mrp": 2990,
        "discountPercent": 25,
        "stock": 40,
        "image": "/images/products/modular-kitchen/ebco-ss-kitchen-basket-grain.webp"
      },
      {
        "id": "var-th-2120",
        "label": "21 x 20 x 8 Inch (Wide Kitchen)",
        "unit": "Basket",
        "price": 2550,
        "mrp": 3390,
        "discountPercent": 25,
        "stock": 30,
        "image": "/images/products/modular-kitchen/ebco-ss-kitchen-basket-grain.webp"
      }
    ],
    "price": 1850,
    "mrp": 2450,
    "discountPercent": 24,
    "unit": "Basket",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ebco Authorized Depot"
  },
  {
    "id": "prod-modular-kitchen-systems-ebco-carousel",
    "slug": "ebco-corner-unit-carousel",
    "name": "Ebco Revolving 270-Degree Kitchen Blind Corner Carousel Unit",
    "title": "Ebco Revolving 270-Degree Kitchen Blind Corner Carousel Unit",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Magic Corner & Carousel Units",
    "image": "/images/products/modular-kitchen/ebco-corner-unit-carousel.webp",
    "images": [
      "/images/products/modular-kitchen/ebco-corner-unit-carousel.webp"
    ],
    "shortTagline": "Converts Dead Corner Space \u00b7 270\u00b0 Smooth Rotation \u00b7 Height Adjustable",
    "specChips": [
      "270\u00b0 Smooth Turn",
      "Utilizes Dead Corner",
      "Dual Chrome Trays",
      "Height Adjustable"
    ],
    "description": "Revolving corner carousel system designed to reclaim unreachable blind corner space in L-shaped and U-shaped kitchens. Dual chrome wire trays spin 270 degrees on a central telescoping stainless steel column.",
    "highlights": [
      "Transforms awkward kitchen blind corners into accessible, organized storage",
      "Smooth central pivot bearing allows effortless 360/270 degree finger-light rotation",
      "Independently height-adjustable upper and lower wire baskets hold tall oil cans",
      "High load rating of 15kg per tray handles heavy mixers, pressure cookers, and jars",
      "Heavy chrome plating with anti-slip rim wire prevents jars from sliding off"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco India"
      },
      {
        "label": "Rotation Angle",
        "value": "270 Degree Opening Angle"
      },
      {
        "label": "Shaft Material",
        "value": "Telescopic Stainless Steel Center Pole"
      },
      {
        "label": "Tray Load",
        "value": "15 kg per Tray (30 kg Total)"
      },
      {
        "label": "Cabinet Size",
        "value": "900 mm x 900 mm L-Corner Carcass"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-car-700",
        "label": "700mm Diameter (Compact Corner)",
        "unit": "Unit",
        "price": 6800,
        "mrp": 8900,
        "discountPercent": 24,
        "stock": 20,
        "image": "/images/products/modular-kitchen/ebco-corner-unit-carousel.webp"
      },
      {
        "id": "var-car-800",
        "label": "800mm Diameter (Standard Corner)",
        "unit": "Unit",
        "price": 7500,
        "mrp": 9800,
        "discountPercent": 23,
        "stock": 25,
        "image": "/images/products/modular-kitchen/ebco-corner-unit-carousel.webp"
      }
    ],
    "price": 6800,
    "mrp": 8900,
    "discountPercent": 24,
    "unit": "Unit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ebco Authorized Depot"
  },
  {
    "id": "prod-modular-kitchen-systems-ebco-pantry",
    "slug": "ebco-tall-unit-pantry-pull-out",
    "name": "Ebco 6-Layer Modular Kitchen Tall Pantry Storage Unit",
    "title": "Ebco 6-Layer Modular Kitchen Tall Pantry Storage Unit",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Tall Pantry Pull-Out Units",
    "image": "/images/products/modular-kitchen/ebco-tall-unit-pantry-pull-out.webp",
    "images": [
      "/images/products/modular-kitchen/ebco-tall-unit-pantry-pull-out.webp"
    ],
    "shortTagline": "6 Layer Storage \u00b7 100kg Heavy Damped Runners \u00b7 Supermarket-Style Pantry",
    "specChips": [
      "6 Tier Storage",
      "100kg Heavy Load",
      "Soft-Close Damping",
      "Height Adjustable Trays"
    ],
    "description": "Full-height pull-out pantry tower providing walk-in grocery convenience within a slender vertical footprint. Pulling the door brings six spacious wire storage baskets out simultaneously on heavy-duty damped 100kg runners.",
    "highlights": [
      "Organizes an entire household's monthly groceries in one accessible vertical pantry",
      "Heavy-duty bottom runners with soft-closing dampers handle up to 100kg total weight",
      "Six height-adjustable basket shelves accommodate tall cereal boxes and oil bottles",
      "Full extension mechanism brings deep items right out into natural room lighting",
      "Solid frame made from structural steel with vibration-free dual ceiling guide tracks"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco India"
      },
      {
        "label": "Number of Baskets",
        "value": "6 Adjustable SS Wire Baskets"
      },
      {
        "label": "Total Capacity",
        "value": "100 kg Distributed Payload"
      },
      {
        "label": "Height Adjustment",
        "value": "1700 mm to 2000 mm Internal Height"
      },
      {
        "label": "Warranty",
        "value": "5 Years Brand Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-pan-450",
        "label": "450mm Carcass Width (6 Baskets)",
        "unit": "System",
        "price": 18500,
        "mrp": 24500,
        "discountPercent": 24,
        "stock": 10,
        "image": "/images/products/modular-kitchen/ebco-tall-unit-pantry-pull-out.webp"
      },
      {
        "id": "var-pan-600",
        "label": "600mm Carcass Width (6 Baskets Wide)",
        "unit": "System",
        "price": 22000,
        "mrp": 29500,
        "discountPercent": 25,
        "stock": 8,
        "image": "/images/products/modular-kitchen/ebco-tall-unit-pantry-pull-out.webp"
      }
    ],
    "price": 18500,
    "mrp": 24500,
    "discountPercent": 24,
    "unit": "System",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Ebco Authorized Depot"
  },
  {
    "id": "prod-modular-kitchen-systems-hettich-innotech",
    "slug": "hettich-innotech-drawer-500mm",
    "name": "Hettich InnoTech Atira Double-Walled Soft-Close Drawer System (500mm)",
    "title": "Hettich InnoTech Atira Double-Walled Soft-Close Drawer System (500mm)",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS Wire Cutlery & Grain Baskets",
    "image": "/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp",
    "images": [
      "/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp"
    ],
    "shortTagline": "German Double-Walled Steel \u00b7 Quadro Silent System \u00b7 Minimalist Lines",
    "specChips": [
      "Double-Walled Steel",
      "Quadro Silent Runners",
      "Silver / Anthracite",
      "30kg Load"
    ],
    "description": "Hettich InnoTech Atira is a premium double-walled metal drawer system featuring crisp, sharp lines and clean surfaces. Glides on hidden Quadro runners with integrated Silent System soft-close dampers.",
    "highlights": [
      "Distinctive double-walled steel sides hide all adjustment screws behind sleek cover caps",
      "Hidden Quadro runners guarantee silk-smooth drawer action with integrated soft-closing",
      "Tool-free front panel installation with intuitive 2D adjustment for perfect door gaps",
      "30kg dynamic load capacity easily carries heavy stone cookware and dinner sets",
      "Scratch-resistant powder coating in sophisticated modern silver or anthracite grey"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich Germany"
      },
      {
        "label": "Series",
        "value": "InnoTech Atira Drawer System"
      },
      {
        "label": "Nominal Length",
        "value": "500 mm Runner Length"
      },
      {
        "label": "Side Height",
        "value": "70mm / 144mm / 176mm Options"
      },
      {
        "label": "Runner",
        "value": "Quadro V6 Full Extension with Silent System"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-inno-70",
        "label": "70mm Low Drawer (Cutlery)",
        "unit": "Set",
        "price": 3450,
        "mrp": 4500,
        "discountPercent": 23,
        "stock": 30,
        "image": "/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp"
      },
      {
        "id": "var-inno-144",
        "label": "144mm Medium Drawer (Crockery)",
        "unit": "Set",
        "price": 4100,
        "mrp": 5300,
        "discountPercent": 23,
        "stock": 35,
        "image": "/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp"
      },
      {
        "id": "var-inno-176",
        "label": "176mm Deep Pan Drawer (Pots & Pans)",
        "unit": "Set",
        "price": 4750,
        "mrp": 6200,
        "discountPercent": 23,
        "stock": 25,
        "image": "/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp"
      }
    ],
    "price": 3450,
    "mrp": 4500,
    "discountPercent": 23,
    "unit": "Set",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Hettich Authorized Depot"
  },
  {
    "id": "prod-modular-kitchen-systems-hettich-tandem",
    "slug": "hettich-tandem-box-500mm",
    "name": "Hettich Heavy-Duty Soft-Close Quadro Runner Tandem Box 500mm",
    "title": "Hettich Heavy-Duty Soft-Close Quadro Runner Tandem Box 500mm",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS Wire Cutlery & Grain Baskets",
    "image": "/images/products/modular-kitchen/hettich-tandem-box-500mm.webp",
    "images": [
      "/images/products/modular-kitchen/hettich-tandem-box-500mm.webp"
    ],
    "shortTagline": "Heavy 50kg Heavy-Load Runner \u00b7 Ultra-Stable Base \u00b7 Seamless Silent Close",
    "specChips": [
      "50kg Heavy Load",
      "Quadro V6 Soft-Close",
      "Zero Sagging",
      "Kitchen & Wardrobe"
    ],
    "description": "Heavy-capacity drawer runner system engineered to carry 50kg payloads without sagging. Features precision-matched steel ball tracks and dampening cylinders that cushion the drawer close under heavy loads.",
    "highlights": [
      "Heavy-duty 50kg load capacity designed for deep pan drawers and heavy pantry drawers",
      "Quadro precision ball track principle ensures long-term wear resistance without play",
      "Integrated Silent System damper brings even rapidly shoved drawers to a calm stop",
      "Self-cleaning ball tracks push dirt and dust out with every stroke",
      "10-year warranty against mechanical wear and hydraulic fluid leakage"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich Germany"
      },
      {
        "label": "System",
        "value": "Quadro V6 Heavy Tandem Box 500mm"
      },
      {
        "label": "Payload",
        "value": "50 kg Continuous Dynamic Load"
      },
      {
        "label": "Extension",
        "value": "100% Full Extension"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-tan-30kg",
        "label": "30kg Standard Capacity (500mm)",
        "unit": "Set",
        "price": 4200,
        "mrp": 5600,
        "discountPercent": 25,
        "stock": 25,
        "image": "/images/products/modular-kitchen/hettich-tandem-box-500mm.webp"
      },
      {
        "id": "var-tan-50kg",
        "label": "50kg Heavy Load Capacity (500mm)",
        "unit": "Set",
        "price": 5100,
        "mrp": 6800,
        "discountPercent": 25,
        "stock": 20,
        "image": "/images/products/modular-kitchen/hettich-tandem-box-500mm.webp"
      }
    ],
    "price": 4200,
    "mrp": 5600,
    "discountPercent": 25,
    "unit": "Set",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Hettich Authorized Depot"
  },
  {
    "id": "prod-door-hardware-locks-godrej-tribolt",
    "slug": "godrej-tribolt-ultra-lock",
    "name": "Godrej Tribolt Ultra High Security Rim Main Door Lock",
    "title": "Godrej Tribolt Ultra High Security Rim Main Door Lock",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim & Tribolt Locks",
    "image": "/images/products/door-hardware/godrej-tribolt-ultra-lock.webp",
    "images": [
      "/images/products/door-hardware/godrej-tribolt-ultra-lock.webp"
    ],
    "shortTagline": "3 Solid Brass Deadbolts \u00b7 Ultra XL+ Dimple Key Technology \u00b7 Crowbar Resistant",
    "specChips": [
      "3 Brass Deadbolts",
      "Ultra XL+ Dimple Keys",
      "Crowbar Proof",
      "Godrej Security"
    ],
    "description": "Godrej Tribolt Ultra is India's gold standard main entrance rim lock. Features three reinforced solid brass deadbolts and a dual-locking mechanism. Powered by Godrej's Ultra XL+ high-security dimple cylinder with over 100 million unique key combinations.",
    "highlights": [
      "Three massive solid brass deadbolts provide extreme resistance against crowbar attacks",
      "Ultra XL+ dimple cylinder with 100 million non-interchangeable key combinations",
      "Hardened steel drill-resistant plate protects the cylinder core from electric drills",
      "Free-turning deadbolt technology prevents bolt depression with credit cards",
      "Backed by Godrej's legendary 15-year warranty with 4 precision computer-cut keys"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "Lock Type",
        "value": "Rim Deadbolt Surface Main Door Lock"
      },
      {
        "label": "Deadbolts",
        "value": "3 Solid Forged Brass Bolts"
      },
      {
        "label": "Key Technology",
        "value": "Ultra XL+ High Security Dimple Key"
      },
      {
        "label": "Keys Included",
        "value": "4 Computer-Cut Brass Keys"
      },
      {
        "label": "Door Thickness",
        "value": "30 mm to 60 mm Suitable"
      },
      {
        "label": "Warranty",
        "value": "15 Years Brand Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-tri-1ck",
        "label": "1CK Inside Knob / Outside Key",
        "unit": "Lock",
        "price": 2850,
        "mrp": 3600,
        "discountPercent": 21,
        "stock": 40,
        "image": "/images/products/door-hardware/godrej-tribolt-ultra-lock.webp"
      },
      {
        "id": "var-tri-2ck",
        "label": "2CK Key Inside & Outside",
        "unit": "Lock",
        "price": 3150,
        "mrp": 3990,
        "discountPercent": 21,
        "stock": 35,
        "image": "/images/products/door-hardware/godrej-tribolt-ultra-lock.webp"
      }
    ],
    "price": 2850,
    "mrp": 3600,
    "discountPercent": 21,
    "unit": "Lock",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Godrej Authorized Depot"
  },
  {
    "id": "prod-door-hardware-locks-europa-hexabolt",
    "slug": "europa-hexabolt-h341-lock",
    "name": "Europa Hexabolt H341 Main Door Rim Lock with 6 Deadbolts",
    "title": "Europa Hexabolt H341 Main Door Rim Lock with 6 Deadbolts",
    "brand": "Europa",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim & Tribolt Locks",
    "image": "/images/products/door-hardware/europa-hexabolt-h341-lock.webp",
    "images": [
      "/images/products/door-hardware/europa-hexabolt-h341-lock.webp"
    ],
    "shortTagline": "6 Massive Deadbolts \u00b7 5 Dimple Keys \u00b7 15-Year Replacement Warranty",
    "specChips": [
      "6 Solid Deadbolts",
      "5 Dimple Keys",
      "Crowbar Resistant",
      "15-Yr Warranty"
    ],
    "description": "Europa Hexabolt H341 provides fortress-grade security with six heavy interlocking deadbolts that anchor the door directly to the jamb. Features a high-precision brass cylinder with 5 reversible dimple keys and one interior LED key for night unlocking.",
    "highlights": [
      "Six heavy-gauge steel deadbolts engage deep into a reinforced striker plate",
      "Tested against heavy crowbar prying force up to 3000 kg without yielding",
      "Includes 5 dimple keys plus 1 unique key with built-in LED flashlight",
      "Interior turn-knob with privacy lock mode prevents opening from outside even with a key",
      "15-year replacement guarantee against manufacturing defects"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Europa Locks India"
      },
      {
        "label": "Model",
        "value": "Hexabolt H341 Series"
      },
      {
        "label": "Number of Deadbolts",
        "value": "6 Steel Locking Bolts"
      },
      {
        "label": "Finish",
        "value": "Satin Nickel / Antique Brass"
      },
      {
        "label": "Warranty",
        "value": "15 Years Free Replacement"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-hexa-sn",
        "label": "Satin Nickel Finish",
        "unit": "Lock",
        "price": 2950,
        "mrp": 3850,
        "discountPercent": 23,
        "stock": 30,
        "image": "/images/products/door-hardware/europa-hexabolt-h341-lock.webp"
      },
      {
        "id": "var-hexa-ab",
        "label": "Antique Brass Finish",
        "unit": "Lock",
        "price": 3250,
        "mrp": 4200,
        "discountPercent": 23,
        "stock": 25,
        "image": "/images/products/door-hardware/europa-hexabolt-h341-lock.webp"
      }
    ],
    "price": 2950,
    "mrp": 3850,
    "discountPercent": 23,
    "unit": "Lock",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Europa Authorized Depot"
  },
  {
    "id": "prod-door-hardware-locks-europa-jemmy",
    "slug": "europa-jemmy-proof-j320-lock",
    "name": "Europa Jemmy Proof J320 High-Torque Main Door Deadbolt Lock",
    "title": "Europa Jemmy Proof J320 High-Torque Main Door Deadbolt Lock",
    "brand": "Europa",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim & Tribolt Locks",
    "image": "/images/products/door-hardware/europa-jemmy-proof-j320-lock.webp",
    "images": [
      "/images/products/door-hardware/europa-jemmy-proof-j320-lock.webp"
    ],
    "shortTagline": "Interlocking Vertical Deadbolts \u00b7 Impossible to Crowbar \u00b7 High Tensile Brass",
    "specChips": [
      "Vertical Interlock",
      "Jemmy Proof",
      "High Tensile Brass",
      "Anti-Pick Cylinder"
    ],
    "description": "Specially engineered interlocking deadbolt system where vertical brass pins drop into interlocking door jamb brackets. Prevents the door frame from being pried apart with heavy crowbars or car jacks.",
    "highlights": [
      "Vertical interlocking deadbolts physically lock door leaf and frame into one rigid unit",
      "Specifically designed to neutralize jemmy bar leverage attacks on main entrance doors",
      "High-precision pin tumbler cylinder resists picking, bumping, and impressioning",
      "High-grade brass body with scratch-proof powder-coated outer casing",
      "Ideal for front apartment doors, duplex entrance gates, and bank server rooms"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Europa Locks"
      },
      {
        "label": "Mechanism",
        "value": "Interlocking Vertical Deadbolt"
      },
      {
        "label": "Bolt Material",
        "value": "Solid Forged Brass Pins"
      },
      {
        "label": "Door Type",
        "value": "Single Leaf Timber & Steel Doors"
      },
      {
        "label": "Warranty",
        "value": "15 Years Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-jp-single",
        "label": "Single Cylinder with Inside Turn",
        "unit": "Lock",
        "price": 2450,
        "mrp": 3200,
        "discountPercent": 23,
        "stock": 35,
        "image": "/images/products/door-hardware/europa-jemmy-proof-j320-lock.webp"
      },
      {
        "id": "var-jp-double",
        "label": "Double Cylinder Key Both Sides",
        "unit": "Lock",
        "price": 2750,
        "mrp": 3600,
        "discountPercent": 24,
        "stock": 25,
        "image": "/images/products/door-hardware/europa-jemmy-proof-j320-lock.webp"
      }
    ],
    "price": 2450,
    "mrp": 3200,
    "discountPercent": 23,
    "unit": "Lock",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Europa Authorized Depot"
  },
  {
    "id": "prod-door-hardware-locks-europa-antique",
    "slug": "europa-antique-brass-lock",
    "name": "Europa Antique Brass Finish Ornamental Rim Door Lock",
    "title": "Europa Antique Brass Finish Ornamental Rim Door Lock",
    "brand": "Europa",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim & Tribolt Locks",
    "image": "/images/products/door-hardware/europa-antique-brass-lock.webp",
    "images": [
      "/images/products/door-hardware/europa-antique-brass-lock.webp"
    ],
    "shortTagline": "Classic Antique Brass Finish \u00b7 Royal Carved Face \u00b7 Heavy Security",
    "specChips": [
      "Antique Brass Finish",
      "Ornate Vintage Look",
      "Hardened Core",
      "Heavy Security"
    ],
    "description": "Combines vintage royal aesthetics with modern lock security. Finished in electro-plated antique brass with decorative bezel detailing, ideal for teakwood main doors and heritage residential bungalows.",
    "highlights": [
      "Rich antique brass patina finish complements hand-carved solid teak wood doors",
      "Triple deadbolt brass mechanism delivers high physical impact resistance",
      "Computerized reversible dimple keys provide smooth key insertion without sharp notches",
      "Protective clear electrophoretic lacquer prevents discoloration and green oxidation",
      "Complete installation kit with decorative matching antique brass striker plate"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Europa Locks"
      },
      {
        "label": "Aesthetics",
        "value": "Classic Heritage Antique Brass"
      },
      {
        "label": "Locking Bolts",
        "value": "3 Solid High-Tensile Deadbolts"
      },
      {
        "label": "Key Spec",
        "value": "4 High Security Dimple Keys"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-ant-brass",
        "label": "Antique Brass Finish",
        "unit": "Lock",
        "price": 3250,
        "mrp": 4150,
        "discountPercent": 22,
        "stock": 25,
        "image": "/images/products/door-hardware/europa-antique-brass-lock.webp"
      },
      {
        "id": "var-ant-cop",
        "label": "Antique Copper Finish",
        "unit": "Lock",
        "price": 3350,
        "mrp": 4300,
        "discountPercent": 22,
        "stock": 20,
        "image": "/images/products/door-hardware/europa-antique-brass-lock.webp"
      }
    ],
    "price": 3250,
    "mrp": 4150,
    "discountPercent": 22,
    "unit": "Lock",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Europa Authorized Depot"
  },
  {
    "id": "prod-door-hardware-locks-dorset-handle",
    "slug": "dorset-mortise-handle",
    "name": "Dorset SS 304 Solid Mortise Lever Handle with Rosette",
    "title": "Dorset SS 304 Solid Mortise Lever Handle with Rosette",
    "brand": "Dorset",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Mortise Lever Handles & Locks",
    "image": "/images/products/door-hardware/dorset-mortise-handle.webp",
    "images": [
      "/images/products/door-hardware/dorset-mortise-handle.webp"
    ],
    "shortTagline": "Solid Grade 304 Stainless Steel \u00b7 Ergonomic Lever \u00b7 High Cycle Life",
    "specChips": [
      "Solid SS 304",
      "Heavy Rosette",
      "200k Cycles Tested",
      "Contemporary Design"
    ],
    "description": "Dorset architectural mortise door handle set crafted from solid AISI 304 stainless steel. Features a balanced spring cassette mechanism that prevents lever sagging over years of heavy daily opening.",
    "highlights": [
      "Solid grade 304 stainless steel construction provides a substantial, luxurious grip",
      "Integrated spring cassette mechanism keeps lever perfectly horizontal with zero droop",
      "Tested for over 200,000 cycles exceeding European EN 1906 Category 3 standards",
      "Concealed screw rose base plate maintains a clean, flush architectural appearance",
      "Universal handing reversible for left-handed and right-handed door swings"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dorset Kaba Group"
      },
      {
        "label": "Material",
        "value": "AISI 304 Solid Stainless Steel"
      },
      {
        "label": "Mechanism",
        "value": "Heavy-Duty Spring Return Cassette"
      },
      {
        "label": "Standard",
        "value": "EN 1906 Category 3 Certified"
      },
      {
        "label": "Warranty",
        "value": "10 Years Replacement Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-dor-sc",
        "label": "Satin Chrome Finish",
        "unit": "Set",
        "price": 1850,
        "mrp": 2450,
        "discountPercent": 24,
        "stock": 45,
        "image": "/images/products/door-hardware/dorset-mortise-handle.webp"
      },
      {
        "id": "var-dor-mb",
        "label": "Matt Black Architectural",
        "unit": "Set",
        "price": 2100,
        "mrp": 2790,
        "discountPercent": 25,
        "stock": 35,
        "image": "/images/products/door-hardware/dorset-mortise-handle.webp"
      },
      {
        "id": "var-dor-rg",
        "label": "Rose Gold Metallic",
        "unit": "Set",
        "price": 2400,
        "mrp": 3200,
        "discountPercent": 25,
        "stock": 25,
        "image": "/images/products/door-hardware/dorset-mortise-handle.webp"
      }
    ],
    "price": 1850,
    "mrp": 2450,
    "discountPercent": 24,
    "unit": "Set",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dorset Authorized Depot"
  },
  {
    "id": "prod-door-hardware-locks-dorset-closer",
    "slug": "dorset-door-closer-hydraulic",
    "name": "Dorset Heavy-Duty Hydraulic Overhead Automatic Door Closer",
    "title": "Dorset Heavy-Duty Hydraulic Overhead Automatic Door Closer",
    "brand": "Dorset",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Hydraulic Overhead Door Closers",
    "image": "/images/products/door-hardware/dorset-door-closer-hydraulic.webp",
    "images": [
      "/images/products/door-hardware/dorset-door-closer-hydraulic.webp"
    ],
    "shortTagline": "Dual Valve Speed Adjustment \u00b7 500,000 Cycle Tested \u00b7 Universal Fit",
    "specChips": [
      "Hydraulic Closer",
      "Dual Speed Valves",
      "500k Cycles Tested",
      "Fire Door Rated"
    ],
    "description": "Dorset commercial overhead hydraulic door closer for residential wooden doors, office glass entrances, and fire exits. Features independent dual regulating valves for sweeping speed and latching speed control.",
    "highlights": [
      "Dual independent adjustment valves control both main sweep speed and final latch snap",
      "High-grade cast aluminum body houses thermo-constant hydraulic fluid for all seasons",
      "Tested for over 500,000 operating cycles meeting EN 1154 international standards",
      "Prevents loud door slamming, drafts, and saves air conditioning cooling energy",
      "Reversible non-handed design fits left-opening and right-opening doors effortlessly"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dorset Kaba Group"
      },
      {
        "label": "Type",
        "value": "Overhead Rack & Pinion Hydraulic Closer"
      },
      {
        "label": "Standard",
        "value": "EN 1154 / CE / UL Fire Door Rated"
      },
      {
        "label": "Adjustability",
        "value": "Dual Valve Closing & Latching Speed"
      },
      {
        "label": "Warranty",
        "value": "5 Years Brand Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-cl-std",
        "label": "Up to 60-80 kg Door Weight",
        "unit": "Piece",
        "price": 1450,
        "mrp": 1950,
        "discountPercent": 26,
        "stock": 40,
        "image": "/images/products/door-hardware/dorset-door-closer-hydraulic.webp"
      },
      {
        "id": "var-cl-heavy",
        "label": "Up to 80-120 kg Heavy Door Weight",
        "unit": "Piece",
        "price": 1950,
        "mrp": 2650,
        "discountPercent": 26,
        "stock": 30,
        "image": "/images/products/door-hardware/dorset-door-closer-hydraulic.webp"
      }
    ],
    "price": 1450,
    "mrp": 1950,
    "discountPercent": 26,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dorset Authorized Depot"
  },
  {
    "id": "prod-sanitary-bath-fittings-jaq-handshower",
    "slug": "jaquar-maze-hand-shower-120mm-square",
    "name": "Jaquar Maze Hand Shower 120mm Square Multi-Flow ABS Body with Cascade Effect",
    "title": "Jaquar Maze Hand Shower 120mm Square Multi-Flow ABS Body with Cascade Effect",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Diverters & Overhead Showers",
    "image": "/images/products/sanitary/jaquar-maze-hand-shower-square.webp",
    "images": [
      "/images/products/sanitary/jaquar-maze-hand-shower-square.webp"
    ],
    "shortTagline": "Multi-Flow Spray Modes \u00b7 Soft Silicone Rubit Descaling \u00b7 Cascade Effect",
    "specChips": [
      "Multi-Flow Spray",
      "Cascade Effect",
      "Rubit Descaling",
      "Mirror Chrome"
    ],
    "description": "Jaquar Maze overhead hand shower delivers an indulgent shower experience with selectable multi-flow water patterns and a soothing cascade waterfall effect. Fitted with Rubit silicone nozzles that clean lime scale deposits with a simple finger rub.",
    "highlights": [
      "Multi-flow spray modes: Rain shower, Concentrated massage jet, and Cascade waterfall",
      "Advanced Rubit silicone nozzles prevent hard water calcium buildup and clogging",
      "Mirror-finish electrolytic chrome plating exceeds 200 hours salt-spray testing",
      "Ergonomic square head design provides generous 120mm drenching water spray coverage",
      "Universal 1/2-inch BSP thread connects seamlessly to all standard flexible shower hoses"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "Series",
        "value": "Maze Hand Shower Collection"
      },
      {
        "label": "Head Size",
        "value": "120 mm Square Form Factor"
      },
      {
        "label": "Body Material",
        "value": "High-Impact Engineered ABS Polymer"
      },
      {
        "label": "Plating",
        "value": "Triple-Layer Nickel-Chrome Mirror Finish"
      },
      {
        "label": "Warranty",
        "value": "10 Years Jaquar Brand Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-shw-sq",
        "label": "120mm Square Chrome",
        "unit": "Piece",
        "price": 1822,
        "mrp": 2375,
        "discountPercent": 23,
        "stock": 45,
        "image": "/images/products/sanitary/jaquar-maze-hand-shower-square.webp"
      },
      {
        "id": "var-shw-rect",
        "label": "120mm Rectangular Chrome",
        "unit": "Piece",
        "price": 1728,
        "mrp": 2250,
        "discountPercent": 23,
        "stock": 40,
        "image": "/images/products/sanitary/jaquar-maze-hand-shower-square.webp"
      }
    ],
    "price": 1822,
    "mrp": 2375,
    "discountPercent": 23,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Jaquar Authorized Depot"
  },
  {
    "id": "prod-sanitary-bath-fittings-jaq-diverter",
    "slug": "jaquar-kubix-prime-high-flow-diverter",
    "name": "Jaquar Kubix Prime High-Flow Single Lever Concealed Diverter Exposed Kit",
    "title": "Jaquar Kubix Prime High-Flow Single Lever Concealed Diverter Exposed Kit",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Diverters & Overhead Showers",
    "image": "/images/products/sanitary/jaquar-kubix-prime-diverter-exposed-kit.webp",
    "images": [
      "/images/products/sanitary/jaquar-kubix-prime-diverter-exposed-kit.webp"
    ],
    "shortTagline": "High Flow Rate \u00b7 Crisp Geometric Cube Styling \u00b7 Smooth Ceramic Joystick",
    "specChips": [
      "High Flow Rate",
      "Solid Brass Casting",
      "Smooth Ceramic Cartridge",
      "Kubix Prime"
    ],
    "description": "Architectural single-lever concealed diverter trim kit from Jaquar's flagship Kubix Prime collection. Effortlessly switches water flow between rain shower and bathtub spout with precise temperature blending.",
    "highlights": [
      "High-flow ceramic cartridge delivers rapid bathtub filling and luxurious shower pressure",
      "Precision square wall flange with clear hot/cold and shower/spout laser engravings",
      "Smooth single-lever joystick control balances water temperature with micro accuracy",
      "Heavy forged brass faceplate and lever finished in high-reflection chrome",
      "Engineered to withstand up to 16 bar hydraulic water line pressure tests"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "Collection",
        "value": "Kubix Prime Architectural Series"
      },
      {
        "label": "Flow Rate",
        "value": "High Flow (Up to 45 L/min at 3 Bar)"
      },
      {
        "label": "Cartridge",
        "value": "Ceramic Disc Cartridge (46mm)"
      },
      {
        "label": "Pressure Rating",
        "value": "Tested up to 16 Bar (232 PSI)"
      },
      {
        "label": "Warranty",
        "value": "10 Years On-Site Brand Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-div-trim",
        "label": "Exposed Trim Kit Only",
        "unit": "Kit",
        "price": 2209,
        "mrp": 2825,
        "discountPercent": 22,
        "stock": 40,
        "image": "/images/products/sanitary/jaquar-kubix-prime-diverter-exposed-kit.webp"
      },
      {
        "id": "var-div-comp",
        "label": "Complete (Exposed Kit + Concealed Brass Body)",
        "unit": "Full Set",
        "price": 4850,
        "mrp": 6200,
        "discountPercent": 22,
        "stock": 25,
        "image": "/images/products/sanitary/jaquar-kubix-prime-diverter-exposed-kit.webp"
      }
    ],
    "price": 2209,
    "mrp": 2825,
    "discountPercent": 22,
    "unit": "Kit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Jaquar Authorized Depot"
  },
  {
    "id": "prod-sanitary-bath-fittings-cera-trap",
    "slug": "cera-bottle-trap",
    "name": "Cera Heavy Brass Chrome Finish Wash Basin Bottle Trap (32mm)",
    "title": "Cera Heavy Brass Chrome Finish Wash Basin Bottle Trap (32mm)",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Wash Basins & Taps",
    "image": "/images/products/sanitary/cera-bottle-trap.webp",
    "images": [
      "/images/products/sanitary/cera-bottle-trap.webp"
    ],
    "shortTagline": "Solid Brass Casting \u00b7 Removable Cleaning Cup \u00b7 Prevents Drain Smells",
    "specChips": [
      "Solid Brass Body",
      "Removable Base Cup",
      "Mirror Chrome",
      "Universal 32mm"
    ],
    "description": "Cera commercial-grade washbasin bottle trap crafted from solid forged brass. Features a water-seal barrier that stops drain odors from entering bathrooms and an unscrewable bottom cup for clearing hair clogs without plumbing tools.",
    "highlights": [
      "Solid brass construction guarantees zero pinhole corrosion under bathroom vanities",
      "Standing water seal stops sewer gases and bathroom insects from emerging via the basin",
      "Unscrewable bottom maintenance cup allows effortless DIY removal of dropped rings or hair",
      "Universal 32mm (1.25\") inlet and outlet connects to all ceramic countertop basins",
      "Heavy-gauge brass wall pipe with decorative chrome flange covers drain wall cutouts"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "Material",
        "value": "Heavy Forged Virgin Brass"
      },
      {
        "label": "Pipe Diameter",
        "value": "32 mm (1.25 Inch Standard)"
      },
      {
        "label": "Wall Pipe Length",
        "value": "190 mm (Cut-to-Fit)"
      },
      {
        "label": "Warranty",
        "value": "7 Years Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-bt-190",
        "label": "190mm Wall Pipe (Standard Vanity)",
        "unit": "Piece",
        "price": 2016,
        "mrp": 2640,
        "discountPercent": 24,
        "stock": 50,
        "image": "/images/products/sanitary/cera-bottle-trap.webp"
      },
      {
        "id": "var-bt-300",
        "label": "300mm Extended Pipe (Deep Counter)",
        "unit": "Piece",
        "price": 2350,
        "mrp": 3100,
        "discountPercent": 24,
        "stock": 35,
        "image": "/images/products/sanitary/cera-bottle-trap.webp"
      }
    ],
    "price": 2016,
    "mrp": 2640,
    "discountPercent": 24,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Cera Authorized Depot"
  },
  {
    "id": "prod-sanitary-bath-fittings-cera-bibcock",
    "slug": "cera-garnet-bib-cock",
    "name": "Cera Garnet Bib Cock with Wall Flange and Nozzle F2002153",
    "title": "Cera Garnet Bib Cock with Wall Flange and Nozzle F2002153",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Health Faucets & Angle Valves",
    "image": "/images/products/sanitary/cera-garnet-bib-cock.webp",
    "images": [
      "/images/products/sanitary/cera-garnet-bib-cock.webp"
    ],
    "shortTagline": "Quarter Turn Ceramic Head \u00b7 Solid Brass Casting \u00b7 Hose Pipe Connector Nozzle",
    "specChips": [
      "Quarter Turn Ceramic",
      "Solid Brass",
      "Washing Hose Nozzle",
      "Mirror Chrome"
    ],
    "description": "Heavy brass quarter-turn bib cock equipped with a serrated nozzle for garden pipes, washing machine inlets, and utility cleaning areas. Built with a ceramic disc spindle for effortless finger-touch shutoff.",
    "highlights": [
      "Precision ceramic spindle provides smooth quarter-turn water activation without stiffness",
      "Serrated metal nozzle tip holds flexible washing machine and garden hoses tightly",
      "Forged brass body handles continuous municipal water pressures without leakage",
      "Includes matching chrome wall flange to hide rough plumbing wall tile holes",
      "Backed by Cera's hassle-free 7-year company on-site service warranty"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "Product Code",
        "value": "F2002153 (Garnet Series)"
      },
      {
        "label": "Inlet Thread",
        "value": "1/2 Inch (15mm) BSP Male Thread"
      },
      {
        "label": "Working Pressure",
        "value": "0.5 to 5.0 Bar Recommended"
      },
      {
        "label": "Warranty",
        "value": "7 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-bib-std",
        "label": "Standard Single Way Bib Cock",
        "unit": "Piece",
        "price": 1260,
        "mrp": 1650,
        "discountPercent": 24,
        "stock": 60,
        "image": "/images/products/sanitary/cera-garnet-bib-cock.webp"
      },
      {
        "id": "var-bib-2way",
        "label": "2-Way Bib Cock (Shower + Tap)",
        "unit": "Piece",
        "price": 1680,
        "mrp": 2250,
        "discountPercent": 25,
        "stock": 45,
        "image": "/images/products/sanitary/cera-garnet-bib-cock.webp"
      }
    ],
    "price": 1260,
    "mrp": 1650,
    "discountPercent": 24,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Cera Authorized Depot"
  },
  {
    "id": "prod-sanitary-bath-fittings-jaq-towelring",
    "slug": "jaquar-towel-ring-chrome",
    "name": "Jaquar Continental Solid Brass Circular Towel Ring Chrome",
    "title": "Jaquar Continental Solid Brass Circular Towel Ring Chrome",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Bathroom Fittings & Accessories",
    "image": "/images/products/sanitary/jaquar-towel-ring-chrome.webp",
    "images": [
      "/images/products/sanitary/jaquar-towel-ring-chrome.webp"
    ],
    "shortTagline": "Solid Brass Bar \u00b7 Concealed Stainless Fasteners \u00b7 Mirror Chrome Finish",
    "specChips": [
      "Solid Brass Bar",
      "Mirror Chrome",
      "Concealed Wall Mounting",
      "Rust Proof"
    ],
    "description": "Jaquar Continental circular towel ring designed for hand towel hanging near bathroom washbasins. Built from thick solid brass with concealed stainless steel wall anchor screws that prevent wobbling.",
    "highlights": [
      "Solid brass circular ring will never rust, pit, or flake in steamy bathroom environments",
      "Concealed wall bracket mechanism keeps mounting screws completely hidden from view",
      "Triple-layer chrome plating maintains a bright jewel-like reflective sheen over years",
      "Smooth swinging action holds towels without pulling or snagging delicate fabric fibers",
      "Includes stainless steel wall anchors, rawlplugs, and allen key for fast mounting"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "Collection",
        "value": "Continental Accessories Series"
      },
      {
        "label": "Dimensions",
        "value": "210 mm Height x 160 mm Ring Diameter"
      },
      {
        "label": "Material",
        "value": "Solid Forged Brass"
      },
      {
        "label": "Warranty",
        "value": "10 Years Manufacturer Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-tr-chr",
        "label": "Mirror Chrome Finish",
        "unit": "Piece",
        "price": 1026,
        "mrp": 1350,
        "discountPercent": 24,
        "stock": 70,
        "image": "/images/products/sanitary/jaquar-towel-ring-chrome.webp"
      },
      {
        "id": "var-tr-blk",
        "label": "Matt Black Architectural",
        "unit": "Piece",
        "price": 1290,
        "mrp": 1690,
        "discountPercent": 24,
        "stock": 40,
        "image": "/images/products/sanitary/jaquar-towel-ring-chrome.webp"
      }
    ],
    "price": 1026,
    "mrp": 1350,
    "discountPercent": 24,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Jaquar Authorized Depot"
  },
  {
    "id": "prod-sanitary-bath-fittings-cera-basin",
    "slug": "cera-careo-tabletop-washbasin",
    "name": "Cera Careo Sleek Rim Ceramic Table Top Counter Wash Basin",
    "title": "Cera Careo Sleek Rim Ceramic Table Top Counter Wash Basin",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Countertop Ceramic Basins",
    "image": "/images/products/sanitary/cera-careo-tabletop-washbasin.webp",
    "images": [
      "/images/products/sanitary/cera-careo-tabletop-washbasin.webp"
    ],
    "shortTagline": "Vitreous China \u00b7 Ultra-Thin Rim Design \u00b7 Anti-Bacterial Glaze",
    "specChips": [
      "Vitreous China",
      "Thin Rim Aesthetics",
      "Anti-Bacterial Glaze",
      "Stain Resistant"
    ],
    "description": "Luxury countertop ceramic washbasin from Cera's designer Careo series. Features an ultra-thin contemporary rim profile and high-density vitreous china fired at 1200\u00b0C with an anti-bacterial self-cleaning glaze.",
    "highlights": [
      "Vitreous china body fired at 1200\u00b0C achieves near-zero water absorption (< 0.5%)",
      "Ultra-thin rim design brings clean European minimalism to bathroom granite vanity slabs",
      "Nano-glazed surface prevents hard water dirt particles from adhering to the ceramic bowl",
      "Spacious washing area with generous depth prevents water splash-back onto countertops",
      "Compatible with tall gooseneck deck-mounted faucets or sleek wall-mounted spout mixers"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "Series",
        "value": "Careo Table Top Wash Basin"
      },
      {
        "label": "Dimensions",
        "value": "500 mm (L) x 400 mm (W) x 140 mm (H)"
      },
      {
        "label": "Mounting",
        "value": "Counter Top / Vanity Top Vessel"
      },
      {
        "label": "Glaze",
        "value": "Self-Cleaning Anti-Microbial Ceramic Glaze"
      },
      {
        "label": "Warranty",
        "value": "10 Years Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-bsn-wht",
        "label": "Glossy Pure White",
        "unit": "Basin",
        "price": 3250,
        "mrp": 4350,
        "discountPercent": 25,
        "stock": 35,
        "image": "/images/products/sanitary/cera-careo-tabletop-washbasin.webp"
      },
      {
        "id": "var-bsn-ivy",
        "label": "Satin Ivory Luxury",
        "unit": "Basin",
        "price": 3600,
        "mrp": 4800,
        "discountPercent": 25,
        "stock": 25,
        "image": "/images/products/sanitary/cera-careo-tabletop-washbasin.webp"
      }
    ],
    "price": 3250,
    "mrp": 4350,
    "discountPercent": 25,
    "unit": "Basin",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Cera Authorized Depot"
  },
  {
    "id": "prod-tile-stone-installation-laticrete-303",
    "slug": "myk-laticrete-303-grey-tile-adhesive-20kg",
    "name": "MYK Laticrete 303 Grey Tile Adhesive, 20kg Bag",
    "title": "MYK Laticrete 303 Grey Tile Adhesive, 20kg Bag",
    "brand": "MYK Laticrete",
    "categorySlug": "tile-stone-installation",
    "categoryName": "Tile & Stone Installation",
    "subCategory": "Polymer-Modified Tile Adhesives",
    "image": "/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp",
    "images": [
      "/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp"
    ],
    "shortTagline": "Factory Prepared Polymer Modified Tile Adhesive \u00b7 Interior Floors & Walls",
    "specChips": [
      "Polymer Modified",
      "Interior Dry & Wet",
      "High Shear Adhesion",
      "IS 15477 Type 1"
    ],
    "description": "Factory-prepared polymer-modified cementitious tile adhesive for fixing ceramic, semi-vitrified, and terracotta tiles on internal floors and walls. Eliminates tile hollow sounds and debonding caused by traditional cement slurry.",
    "highlights": [
      "Polymer-modified formula provides reliable shear bond strength far exceeding cement mortar",
      "Pre-mixed single component: simply add clean water and mix for smooth buttery troweling",
      "Non-shrink formulation prevents hollow spots and tile cracking under point loads",
      "Long open time of 20 minutes allows masons to adjust and level tiles accurately",
      "IS 15477:2019 Type 1 compliant for interior floors, kitchens, and residential bathrooms"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "MYK Laticrete India"
      },
      {
        "label": "Product Code",
        "value": "303 Ceramic Tile Adhesive"
      },
      {
        "label": "Standard",
        "value": "IS 15477:2019 (Type 1 Certified)"
      },
      {
        "label": "Pot Life",
        "value": "Approx. 2 Hours at 27\u00b0C"
      },
      {
        "label": "Open Time",
        "value": "20 - 25 Minutes"
      },
      {
        "label": "Coverage",
        "value": "50 - 60 sq.ft per 20kg bag at 3mm bed"
      },
      {
        "label": "Shelf Life",
        "value": "12 Months in Dry Storage"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-lat-20kg",
        "label": "20kg Bag",
        "unit": "20kg Bag",
        "price": 255,
        "mrp": 300,
        "discountPercent": 15,
        "stock": 200,
        "image": "/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp"
      },
      {
        "id": "var-lat-50kg",
        "label": "50kg Jumbo Bag",
        "unit": "50kg Bag",
        "price": 590,
        "mrp": 700,
        "discountPercent": 16,
        "stock": 100,
        "image": "/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp"
      },
      {
        "id": "var-lat-bulk",
        "label": "Bulk Pallet (50 Bags x 20kg)",
        "unit": "50 Bags (1 Ton)",
        "price": 12250,
        "mrp": 15000,
        "discountPercent": 18,
        "stock": 20,
        "image": "/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp"
      }
    ],
    "price": 255,
    "mrp": 300,
    "discountPercent": 15,
    "unit": "20kg Bag",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "MYK Laticrete Authorized Depot"
  },
  {
    "id": "prod-tile-stone-installation-roff-t01",
    "slug": "roff-t01-nca-tile-adhesive-grey-30kg",
    "name": "Roff T01 NCA Tile Adhesive, Grey, 30 Kg Bag",
    "title": "Roff T01 NCA Tile Adhesive, Grey, 30 Kg Bag",
    "brand": "Roff (Pidilite)",
    "categorySlug": "tile-stone-installation",
    "categoryName": "Tile & Stone Installation",
    "subCategory": "Polymer-Modified Tile Adhesives",
    "image": "/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp",
    "images": [
      "/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp"
    ],
    "shortTagline": "Non-Skid Ceramic Adhesive \u00b7 Fast Spreading \u00b7 Pidilite Technology",
    "specChips": [
      "Pidilite Roff",
      "Non-Skid Formula",
      "IS 15477 Type 1",
      "Interior Floor/Wall"
    ],
    "description": "Roff T01 Non-Skid Ceramic Adhesive (NCA) is a polymer-modified cement-based tile adhesive from Pidilite. Specifically designed for fixing ceramic and clay tiles on new or renovated indoor floors and walls without hacking.",
    "highlights": [
      "Polymer-fortified matrix provides high grip that stops wall tiles from slipping down",
      "Saves time: requires no pre-soaking of tiles in water before fixing",
      "Excellent water retention ensures complete cement hydration and maximum strength",
      "Smooth creamy consistency spreads effortlessly with standard notched trowels",
      "Formulated by Pidilite with certified quality control for professional tilers"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Roff by Pidilite Industries"
      },
      {
        "label": "Grade",
        "value": "T01 NCA (Non-Skid Ceramic Adhesive)"
      },
      {
        "label": "Classification",
        "value": "IS 15477:2019 Type 1T"
      },
      {
        "label": "Color",
        "value": "Grey Cementitious Powder"
      },
      {
        "label": "Coverage",
        "value": "75 - 85 sq.ft per 30kg bag at 3mm bed"
      },
      {
        "label": "Shelf Life",
        "value": "12 Months in Original Packing"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-roff-20kg",
        "label": "20kg Bag",
        "unit": "20kg Bag",
        "price": 295,
        "mrp": 320,
        "discountPercent": 8,
        "stock": 150,
        "image": "/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp"
      },
      {
        "id": "var-roff-30kg",
        "label": "30kg Bag",
        "unit": "30kg Bag",
        "price": 430,
        "mrp": 460,
        "discountPercent": 7,
        "stock": 180,
        "image": "/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp"
      },
      {
        "id": "var-roff-40kg",
        "label": "40kg Bag",
        "unit": "40kg Bag",
        "price": 560,
        "mrp": 610,
        "discountPercent": 8,
        "stock": 100,
        "image": "/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp"
      }
    ],
    "price": 295,
    "mrp": 320,
    "discountPercent": 8,
    "unit": "20kg Bag",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Roff (Pidilite) Authorized Depot"
  },
  {
    "id": "prod-tile-stone-installation-laticrete-305",
    "slug": "myk-laticrete-305-tile-adhesive-grey-30kg",
    "name": "MYK Laticrete 305 Tile Adhesive, Grey, 30 Kg Bag",
    "title": "MYK Laticrete 305 Tile Adhesive, Grey, 30 Kg Bag",
    "brand": "MYK Laticrete",
    "categorySlug": "tile-stone-installation",
    "categoryName": "Tile & Stone Installation",
    "subCategory": "Polymer-Modified Tile Adhesives",
    "image": "/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp",
    "images": [
      "/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp"
    ],
    "shortTagline": "Vitrified Tile Specialist \u00b7 High Tensile Bond \u00b7 IS 15477 Type 2",
    "specChips": [
      "Vitrified Specialist",
      "Type 2 Certified",
      "High Bond Grip",
      "Zero Slippage"
    ],
    "description": "MYK Laticrete 305 is a premium polymer-fortified tile adhesive formulated for vitrified, porcelain, and natural stone tiles. Engineered to grip low-porosity vitrified tile backs that standard cement mortar fails to hold.",
    "highlights": [
      "High chemical polymer adhesion bonds tightly to dense low-porosity vitrified tile backs",
      "IS 15477:2019 Type 2 certified for vitrified floor tiles and exterior covered cladding",
      "Exceptional shock and thermal vibration absorption prevents tile tenting and popping",
      "Extended pot life of 3 hours allows full batch mixing on large commercial flooring sites",
      "Can be used over existing tile flooring (tile-on-tile) without chipping out old floors"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "MYK Laticrete India"
      },
      {
        "label": "Series",
        "value": "305 Floor & Wall Thin-Set"
      },
      {
        "label": "Standard",
        "value": "IS 15477:2019 Type 2T Compliant"
      },
      {
        "label": "Tensile Adhesion",
        "value": "> 1.0 N/mm\u00b2 at 28 Days"
      },
      {
        "label": "Coverage",
        "value": "80 - 90 sq.ft per 30kg bag at 3mm bed"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-lat305-20",
        "label": "20kg Bag",
        "unit": "20kg Bag",
        "price": 290,
        "mrp": 320,
        "discountPercent": 9,
        "stock": 100,
        "image": "/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp"
      },
      {
        "id": "var-lat305-30",
        "label": "30kg Bag",
        "unit": "30kg Bag",
        "price": 420,
        "mrp": 457,
        "discountPercent": 9,
        "stock": 140,
        "image": "/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp"
      },
      {
        "id": "var-lat305-50",
        "label": "50kg Jumbo Bag",
        "unit": "50kg Bag",
        "price": 680,
        "mrp": 750,
        "discountPercent": 9,
        "stock": 80,
        "image": "/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp"
      }
    ],
    "price": 290,
    "mrp": 320,
    "discountPercent": 9,
    "unit": "20kg Bag",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "MYK Laticrete Authorized Depot"
  },
  {
    "id": "prod-tile-stone-installation-roff-t02",
    "slug": "roff-t02-nsa-tile-adhesive-grey-30kg",
    "name": "Roff T02 NSA Tile Adhesive, Grey, 30 Kg Bag",
    "title": "Roff T02 NSA Tile Adhesive, Grey, 30 Kg Bag",
    "brand": "Roff (Pidilite)",
    "categorySlug": "tile-stone-installation",
    "categoryName": "Tile & Stone Installation",
    "subCategory": "Polymer-Modified Tile Adhesives",
    "image": "/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp",
    "images": [
      "/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp"
    ],
    "shortTagline": "Non-Skid Adhesive for Large Vitrified Tiles & Natural Stone \u00b7 High Flexibility",
    "specChips": [
      "Large Vitrified Tiles",
      "Natural Stone",
      "Tile-on-Tile",
      "High Flexural Bond"
    ],
    "description": "Roff T02 Non-Skid Adhesive (NSA) is a polymer-enriched adhesive engineered for heavy, large-format vitrified tiles, granite, and marble slabs. Offers high flexural strength and zero vertical slippage during wall installation.",
    "highlights": [
      "Formulated for large-format porcelain slabs and heavy vitrified tiles (600x1200mm+)",
      "High polymer concentration allows direct tile-on-tile renovation with zero mess",
      "Non-slump formula holds heavy vertical wall tiles in place without mechanical propping",
      "Accommodates thermal expansion and contraction between substrate and large tiles",
      "Resistant to continuous water immersion in swimming pools and water bodies"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Roff by Pidilite"
      },
      {
        "label": "Grade",
        "value": "T02 NSA (Non-Skid Adhesive)"
      },
      {
        "label": "Standard",
        "value": "IS 15477:2019 Type 2T"
      },
      {
        "label": "Suitable Tiles",
        "value": "Vitrified, Granite, Marble, Porcelain"
      },
      {
        "label": "Coverage",
        "value": "75 - 85 sq.ft per 30kg at 3-4mm bed"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-roff2-20",
        "label": "20kg Bag",
        "unit": "20kg Bag",
        "price": 510,
        "mrp": 540,
        "discountPercent": 6,
        "stock": 90,
        "image": "/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp"
      },
      {
        "id": "var-roff2-30",
        "label": "30kg Bag",
        "unit": "30kg Bag",
        "price": 740,
        "mrp": 780,
        "discountPercent": 5,
        "stock": 120,
        "image": "/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp"
      },
      {
        "id": "var-roff2-40",
        "label": "40kg Bag",
        "unit": "40kg Bag",
        "price": 960,
        "mrp": 1020,
        "discountPercent": 6,
        "stock": 60,
        "image": "/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp"
      }
    ],
    "price": 510,
    "mrp": 540,
    "discountPercent": 6,
    "unit": "20kg Bag",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Roff (Pidilite) Authorized Depot"
  },
  {
    "id": "prod-tile-stone-installation-roff-grout",
    "slug": "roff-rainbow-tile-grout-1kg",
    "name": "Roff Rainbow Waterproof Tile Joint Grout, 1kg Pack",
    "title": "Roff Rainbow Waterproof Tile Joint Grout, 1kg Pack",
    "brand": "Roff (Pidilite)",
    "categorySlug": "tile-stone-installation",
    "categoryName": "Tile & Stone Installation",
    "subCategory": "Waterproof Epoxy Tile Grouts",
    "image": "/images/products/tiles/roff-rainbow-tile-grout-1kg.webp",
    "images": [
      "/images/products/tiles/roff-rainbow-tile-grout-1kg.webp"
    ],
    "shortTagline": "Water-Resistant Polymer Modified Joint Filler \u00b7 Vibrant Color Fastness",
    "specChips": [
      "Water Resistant",
      "Anti-Fungal",
      "Shrink-Proof",
      "Color Fast"
    ],
    "description": "Polymer-modified cementitious tile joint filler designed to seal gaps between tiles up to 5mm wide. Resists water absorption, fungal growth, and shrinkage cracking in kitchens, bathrooms, and living floors.",
    "highlights": [
      "Fills tile gaps seamlessly, preventing dirty water from seeping under tiles",
      "Hydrophobic polymer additives repel water droplets and household soap stains",
      "Non-shrink formula cures without cracking or powdering out of joint lines",
      "Available in aesthetic shades that match modern vitrified tile colors",
      "Formulated with fungicides that inhibit mildew growth in damp shower corners"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Roff by Pidilite"
      },
      {
        "label": "Series",
        "value": "Rainbow Tile Grout"
      },
      {
        "label": "Joint Width",
        "value": "Suitable for 1 mm to 5 mm Joint Gaps"
      },
      {
        "label": "Coverage",
        "value": "Approx. 40 - 50 running meters per kg (2mm gap)"
      },
      {
        "label": "Standard",
        "value": "EN 13888 CG1 Grade"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-grt-wht",
        "label": "Pure White (1kg)",
        "unit": "1kg Pack",
        "price": 85,
        "mrp": 110,
        "discountPercent": 23,
        "stock": 150,
        "image": "/images/products/tiles/roff-rainbow-tile-grout-1kg.webp"
      },
      {
        "id": "var-grt-ivy",
        "label": "Ivory Beige (1kg)",
        "unit": "1kg Pack",
        "price": 85,
        "mrp": 110,
        "discountPercent": 23,
        "stock": 120,
        "image": "/images/products/tiles/roff-rainbow-tile-grout-1kg.webp"
      },
      {
        "id": "var-grt-gry",
        "label": "Silver Grey (1kg)",
        "unit": "1kg Pack",
        "price": 85,
        "mrp": 110,
        "discountPercent": 23,
        "stock": 140,
        "image": "/images/products/tiles/roff-rainbow-tile-grout-1kg.webp"
      },
      {
        "id": "var-grt-slt",
        "label": "Dark Slate Black (1kg)",
        "unit": "1kg Pack",
        "price": 95,
        "mrp": 120,
        "discountPercent": 21,
        "stock": 80,
        "image": "/images/products/tiles/roff-rainbow-tile-grout-1kg.webp"
      }
    ],
    "price": 85,
    "mrp": 110,
    "discountPercent": 23,
    "unit": "1kg Pack",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Roff (Pidilite) Authorized Depot"
  },
  {
    "id": "prod-tile-stone-installation-drf-sealer",
    "slug": "dr-fixit-tile-stone-sealer-1l",
    "name": "Dr. Fixit Tile & Stone Impregnating Penetrating Sealer 1L",
    "title": "Dr. Fixit Tile & Stone Impregnating Penetrating Sealer 1L",
    "brand": "Dr. Fixit",
    "categorySlug": "tile-stone-installation",
    "categoryName": "Tile & Stone Installation",
    "subCategory": "Tile Cleaners & Stone Sealers",
    "image": "/images/products/tiles/dr-fixit-tile-stone-sealer-1l.webp",
    "images": [
      "/images/products/tiles/dr-fixit-tile-stone-sealer-1l.webp"
    ],
    "shortTagline": "Invisible Deep Penetrating Silane Sealant \u00b7 Blocks Oil & Water Stains",
    "specChips": [
      "Invisible Shield",
      "Repels Oil & Water",
      "Natural Look",
      "Marble & Granite"
    ],
    "description": "Clear penetrating impregnating sealer for porous natural stones including marble, granite, sandstone, and terracotta tiles. Penetrates micro-pores to form an invisible oil-and-water-repellent barrier without changing natural stone color or texture.",
    "highlights": [
      "Penetrates deep into stone capillary pores without forming an artificial plastic film",
      "Blocks absorption of staining liquids: turmeric, cooking oil, tea, coffee, and wine",
      "Leaves the natural breathability, texture, and natural stone color completely unaltered",
      "UV stable formula does not yellow or peel over years of outdoor terrace exposure",
      "Easy DIY sponge or brush application cures completely within 24 hours"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dr. Fixit (Pidilite)"
      },
      {
        "label": "Type",
        "value": "Siloxane / Silane Penetrating Impregnator"
      },
      {
        "label": "Coverage",
        "value": "80 - 100 sq.ft per Litre (Depends on Stone Porosity)"
      },
      {
        "label": "Appearance",
        "value": "Clear Water-Thin Liquid"
      },
      {
        "label": "Drying Time",
        "value": "Touch Dry: 2 Hrs, Full Protection: 24 Hrs"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-slr-1l",
        "label": "1 Litre Bottle",
        "unit": "Bottle",
        "price": 490,
        "mrp": 620,
        "discountPercent": 21,
        "stock": 60,
        "image": "/images/products/tiles/dr-fixit-tile-stone-sealer-1l.webp"
      },
      {
        "id": "var-slr-5l",
        "label": "5 Litres Can",
        "unit": "Can",
        "price": 2250,
        "mrp": 2850,
        "discountPercent": 21,
        "stock": 30,
        "image": "/images/products/tiles/dr-fixit-tile-stone-sealer-1l.webp"
      }
    ],
    "price": 490,
    "mrp": 620,
    "discountPercent": 21,
    "unit": "Bottle",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dr. Fixit Authorized Depot"
  },
  {
    "id": "prod-painting-ap-distemper",
    "slug": "asian-paints-tractor-uno-acrylic-distemper-paint-white-20kg",
    "name": "Asian Paints Tractor Uno Acrylic Distemper Paint White, 20kg",
    "title": "Asian Paints Tractor Uno Acrylic Distemper Paint White, 20kg",
    "brand": "Asian Paints",
    "categorySlug": "painting",
    "categoryName": "Painting",
    "subCategory": "Interior Luxury Emulsions",
    "image": "/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp",
    "images": [
      "/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp"
    ],
    "shortTagline": "Smooth Matte Finish \u00b7 Superior Whiteness \u00b7 Economical Interior Coverage",
    "specChips": [
      "Smooth Matte",
      "High Opacity",
      "Recoat in 3-4 Hrs",
      "Washable Distemper"
    ],
    "description": "Asian Paints Tractor Uno is a water-based acrylic distemper that gives interior walls a smooth, uniform matte finish. Offers superior whiteness, high opacity, and significant cost savings over traditional lime whitewash.",
    "highlights": [
      "Provides a beautiful, smooth matte finish that brightens budget interior rooms",
      "High opacity formula covers old plaster patches and stains in just 2 coats",
      "Fast drying time allows two complete wall coats to be finished in a single day",
      "Superior color retention stays bright white without chalking or flaking off",
      "Lead-free, water-thinnable formula with virtually zero solvent smell"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Asian Paints Limited"
      },
      {
        "label": "Series",
        "value": "Tractor Uno Acrylic Distemper"
      },
      {
        "label": "Color",
        "value": "Base White (Super White)"
      },
      {
        "label": "Sheen / Finish",
        "value": "Smooth Matte Finish"
      },
      {
        "label": "Drying Time",
        "value": "Touch Dry: 30 Mins, Recoat: 3 - 4 Hours"
      },
      {
        "label": "Coverage",
        "value": "65 - 75 sq.ft per kg (2 Coats)"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-uno-5kg",
        "label": "5 kg Bucket",
        "unit": "5kg Bucket",
        "price": 275,
        "mrp": 450,
        "discountPercent": 39,
        "stock": 80,
        "image": "/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp"
      },
      {
        "id": "var-uno-10kg",
        "label": "10 kg Bucket",
        "unit": "10kg Bucket",
        "price": 510,
        "mrp": 840,
        "discountPercent": 39,
        "stock": 90,
        "image": "/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp"
      },
      {
        "id": "var-uno-20kg",
        "label": "20 kg Bucket",
        "unit": "20kg Bucket",
        "price": 945,
        "mrp": 1580,
        "discountPercent": 40,
        "stock": 100,
        "image": "/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp"
      }
    ],
    "price": 275,
    "mrp": 450,
    "discountPercent": 39,
    "unit": "5kg Bucket",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Asian Paints Authorized Depot"
  },
  {
    "id": "prod-painting-ap-tractor-emul",
    "slug": "asian-paints-tractor-emulsion-base-white",
    "name": "Asian Paints Tractor Emulsion, Base White Interior Paint",
    "title": "Asian Paints Tractor Emulsion, Base White Interior Paint",
    "brand": "Asian Paints",
    "categorySlug": "painting",
    "categoryName": "Painting",
    "subCategory": "Interior Luxury Emulsions",
    "image": "/images/products/paint/asian-paints-tractor-emulsion-base-white.webp",
    "images": [
      "/images/products/paint/asian-paints-tractor-emulsion-base-white.webp"
    ],
    "shortTagline": "Smart Upgrade from Distemper \u00b7 Plastic Paint Feel \u00b7 Smooth Matte Finish",
    "specChips": [
      "Anti-Fade",
      "Plastic Paint Finish",
      "Smooth Matte",
      "1.5x Coverage of Distemper"
    ],
    "description": "The smart upgrade from distemper to authentic plastic emulsion. Tractor Emulsion provides a smooth matte plastic finish at an affordable budget. Delivers 1.5 times the coverage of distempers and stands up to light wall sponging.",
    "highlights": [
      "Plastic paint look and feel elevates interior walls above chalky distempers",
      "Wide coverage spreads up to 260 sq.ft per litre in a single coat",
      "Anti-fade technology keeps wall colors vibrant and fresh for over 3 years",
      "Resists light wet cloth wiping to remove household dust and pencil marks",
      "Available in over 1200 tintable shades via authorized Asian Paints color computers"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Asian Paints Limited"
      },
      {
        "label": "Product",
        "value": "Tractor Emulsion Interior"
      },
      {
        "label": "Finish",
        "value": "Soft Matte Plastic Finish"
      },
      {
        "label": "Coverage",
        "value": "130 - 150 sq.ft per Litre (2 Coats)"
      },
      {
        "label": "Thinning",
        "value": "Water Thinning (500ml water per 1L paint)"
      },
      {
        "label": "Warranty",
        "value": "3 Years Performance Assurance"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-trac-1l",
        "label": "1 Litre Can",
        "unit": "Litre",
        "price": 187,
        "mrp": 260,
        "discountPercent": 28,
        "stock": 70,
        "image": "/images/products/paint/asian-paints-tractor-emulsion-base-white.webp"
      },
      {
        "id": "var-trac-4l",
        "label": "4 Litres Bucket",
        "unit": "4L Bucket",
        "price": 690,
        "mrp": 960,
        "discountPercent": 28,
        "stock": 80,
        "image": "/images/products/paint/asian-paints-tractor-emulsion-base-white.webp"
      },
      {
        "id": "var-trac-10l",
        "label": "10 Litres Bucket",
        "unit": "10L Bucket",
        "price": 1580,
        "mrp": 2200,
        "discountPercent": 28,
        "stock": 60,
        "image": "/images/products/paint/asian-paints-tractor-emulsion-base-white.webp"
      },
      {
        "id": "var-trac-20l",
        "label": "20 Litres Bucket",
        "unit": "20L Bucket",
        "price": 2990,
        "mrp": 4150,
        "discountPercent": 28,
        "stock": 50,
        "image": "/images/products/paint/asian-paints-tractor-emulsion-base-white.webp"
      }
    ],
    "price": 187,
    "mrp": 260,
    "discountPercent": 28,
    "unit": "Litre",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Asian Paints Authorized Depot"
  },
  {
    "id": "prod-painting-ap-tractor-splash",
    "slug": "asian-paints-tractor-emulsion-colour-splash",
    "name": "Asian Paints Tractor Emulsion, Smooth Matte Interior Finish",
    "title": "Asian Paints Tractor Emulsion, Smooth Matte Interior Finish",
    "brand": "Asian Paints",
    "categorySlug": "painting",
    "categoryName": "Painting",
    "subCategory": "Interior Luxury Emulsions",
    "image": "/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp",
    "images": [
      "/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp"
    ],
    "shortTagline": "Smooth Matte \u00b7 Anti-Fade Tech \u00b7 Machine Tintable into 1000+ Colors",
    "specChips": [
      "Tintable Colors",
      "Smooth Texture",
      "Low Odor",
      "High Spreading"
    ],
    "description": "Vibrant interior emulsion formulated for living rooms, master bedrooms, and rental upgrades. Ready for high-precision computer tinting into pastels, neutrals, and deep designer accent wall shades.",
    "highlights": [
      "Ultra-fine pigments provide uniform color depth across entire room expanses",
      "Dries to an elegant velvety smooth matte sheen that masks minor wall undulations",
      "Zero lead and ultra-low VOC emissions allow immediate safe room occupancy",
      "Non-yellowing acrylic binders ensure white ceilings stay white indefinitely",
      "Smooth consistency rolls out effortlessly with microfiber paint rollers"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Asian Paints Limited"
      },
      {
        "label": "Type",
        "value": "Acrylic Copolymer Interior Emulsion"
      },
      {
        "label": "Washability",
        "value": "Moderate (Wipeable with Damp Cloth)"
      },
      {
        "label": "Recoat Period",
        "value": "4 Hours"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-trac-sp-1l",
        "label": "1 Litre Can",
        "unit": "Litre",
        "price": 187,
        "mrp": 260,
        "discountPercent": 28,
        "stock": 60,
        "image": "/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp"
      },
      {
        "id": "var-trac-sp-4l",
        "label": "4 Litres Bucket",
        "unit": "4L Bucket",
        "price": 690,
        "mrp": 960,
        "discountPercent": 28,
        "stock": 70,
        "image": "/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp"
      },
      {
        "id": "var-trac-sp-10l",
        "label": "10 Litres Bucket",
        "unit": "10L Bucket",
        "price": 1580,
        "mrp": 2200,
        "discountPercent": 28,
        "stock": 50,
        "image": "/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp"
      },
      {
        "id": "var-trac-sp-20l",
        "label": "20 Litres Bucket",
        "unit": "20L Bucket",
        "price": 2990,
        "mrp": 4150,
        "discountPercent": 28,
        "stock": 45,
        "image": "/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp"
      }
    ],
    "price": 187,
    "mrp": 260,
    "discountPercent": 28,
    "unit": "Litre",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Asian Paints Authorized Depot"
  },
  {
    "id": "prod-painting-ap-apcolite",
    "slug": "apcolite-premium-emulsion-20l",
    "name": "Asian Paints Apcolite Premium Emulsion Paints, Base White",
    "title": "Asian Paints Apcolite Premium Emulsion Paints, Base White",
    "brand": "Asian Paints",
    "categorySlug": "painting",
    "categoryName": "Painting",
    "subCategory": "Interior Luxury Emulsions",
    "image": "/images/products/paint/apcolite-premium-emulsion-20l.webp",
    "images": [
      "/images/products/paint/apcolite-premium-emulsion-20l.webp"
    ],
    "shortTagline": "Rich Matte Sheen \u00b7 100% Washable \u00b7 Stain Resistant \u00b7 5-Year Life",
    "specChips": [
      "100% Washable",
      "Stain Resistant",
      "Rich Matte Sheen",
      "5-Year Performance"
    ],
    "description": "Asian Paints Apcolite Premium Emulsion is India's definitive luxury washable interior paint. Infused with specialized stain-guard polymers that form a resilient barrier against stubborn household stains like tea, ketchup, and crayons.",
    "highlights": [
      "100% washable surface allows tough stains to be scrubbed off with mild soap water",
      "Rich matte sheen diffuses interior ambient light for a high-end architectural look",
      "Advanced stain-guard technology prevents deep liquid penetration into the plaster",
      "Anti-fungal shield prevents mildew formation on bathroom and kitchen ceilings",
      "Backed by Asian Paints' comprehensive 5-year interior durability assurance"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Asian Paints Limited"
      },
      {
        "label": "Series",
        "value": "Apcolite Premium Emulsion"
      },
      {
        "label": "Washability",
        "value": "High (Washable with Sponge & Mild Soap)"
      },
      {
        "label": "Sheen Level",
        "value": "Rich Matte / Low Sheen"
      },
      {
        "label": "Coverage",
        "value": "140 - 160 sq.ft per Litre (2 Coats)"
      },
      {
        "label": "Warranty",
        "value": "5 Years Brand Guarantee"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-apc-1l",
        "label": "1 Litre Can",
        "unit": "Litre",
        "price": 348,
        "mrp": 490,
        "discountPercent": 29,
        "stock": 80,
        "image": "/images/products/paint/apcolite-premium-emulsion-20l.webp"
      },
      {
        "id": "var-apc-4l",
        "label": "4 Litres Bucket",
        "unit": "4L Bucket",
        "price": 1280,
        "mrp": 1800,
        "discountPercent": 29,
        "stock": 80,
        "image": "/images/products/paint/apcolite-premium-emulsion-20l.webp"
      },
      {
        "id": "var-apc-10l",
        "label": "10 Litres Bucket",
        "unit": "10L Bucket",
        "price": 2990,
        "mrp": 4250,
        "discountPercent": 30,
        "stock": 50,
        "image": "/images/products/paint/apcolite-premium-emulsion-20l.webp"
      },
      {
        "id": "var-apc-20l",
        "label": "20 Litres Bucket",
        "unit": "20L Bucket",
        "price": 5650,
        "mrp": 8100,
        "discountPercent": 30,
        "stock": 40,
        "image": "/images/products/paint/apcolite-premium-emulsion-20l.webp"
      }
    ],
    "price": 348,
    "mrp": 490,
    "discountPercent": 29,
    "unit": "Litre",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Asian Paints Authorized Depot"
  },
  {
    "id": "prod-painting-ap-apex-ultima",
    "slug": "apex-ultima-exterior-20l",
    "name": "Asian Paints Apex Ultima Advanced Anti-Algal Weatherproof Exterior Emulsion",
    "title": "Asian Paints Apex Ultima Advanced Anti-Algal Weatherproof Exterior Emulsion",
    "brand": "Asian Paints",
    "categorySlug": "painting",
    "categoryName": "Painting",
    "subCategory": "Weatherproof Exterior Emulsions",
    "image": "/images/products/paint/apex-ultima-exterior-20l.webp",
    "images": [
      "/images/products/paint/apex-ultima-exterior-20l.webp"
    ],
    "shortTagline": "Color Stay Technology \u00b7 Advanced Anti-Algal \u00b7 7-Year Performance Warranty",
    "specChips": [
      "7-Yr Warranty",
      "Color Stay Tech",
      "Anti-Algal Formula",
      "Dirt Pick-Up Resistance"
    ],
    "description": "Asian Paints Apex Ultima is a premium 100% acrylic exterior emulsion engineered to protect external building facades from tropical monsoon downpours, scorching UV radiation, and unsightly black algae staining.",
    "highlights": [
      "Advanced silicone-acrylic cross-linking prevents fungal and black algae streaks",
      "Color Stay technology resists fading under fierce tropical sunshine for 7+ years",
      "Dirt pick-up resistance formula ensures dust washes away naturally during rainfall",
      "Excellent crack bridging stretches across minor hairline exterior plaster fissures",
      "Backed by a verified 7-year comprehensive exterior performance warranty"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Asian Paints Limited"
      },
      {
        "label": "Category",
        "value": "Apex Ultima Weatherproof Exterior"
      },
      {
        "label": "Resin",
        "value": "100% High-Performance Acrylic Latex"
      },
      {
        "label": "Weatherproofing",
        "value": "Heavy Monsoon & UV Resistant"
      },
      {
        "label": "Warranty",
        "value": "7 Years Company Exterior Warranty"
      },
      {
        "label": "Coverage",
        "value": "55 - 65 sq.ft per Litre (2 Coats)"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-ult-1l",
        "label": "1 Litre Can",
        "unit": "Litre",
        "price": 395,
        "mrp": 560,
        "discountPercent": 29,
        "stock": 60,
        "image": "/images/products/paint/apex-ultima-exterior-20l.webp"
      },
      {
        "id": "var-ult-4l",
        "label": "4 Litres Bucket",
        "unit": "4L Bucket",
        "price": 1480,
        "mrp": 2100,
        "discountPercent": 30,
        "stock": 70,
        "image": "/images/products/paint/apex-ultima-exterior-20l.webp"
      },
      {
        "id": "var-ult-10l",
        "label": "10 Litres Bucket",
        "unit": "10L Bucket",
        "price": 3450,
        "mrp": 4900,
        "discountPercent": 30,
        "stock": 45,
        "image": "/images/products/paint/apex-ultima-exterior-20l.webp"
      },
      {
        "id": "var-ult-20l",
        "label": "20 Litres Bucket",
        "unit": "20L Bucket",
        "price": 6450,
        "mrp": 9200,
        "discountPercent": 30,
        "stock": 35,
        "image": "/images/products/paint/apex-ultima-exterior-20l.webp"
      }
    ],
    "price": 395,
    "mrp": 560,
    "discountPercent": 29,
    "unit": "Litre",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Asian Paints Authorized Depot"
  },
  {
    "id": "prod-painting-birla-putty",
    "slug": "birla-white-wallcare-waterproof-putty-40kg",
    "name": "Birla White WallCare Water Resistant White Cement Based Wall Putty (40kg)",
    "title": "Birla White WallCare Water Resistant White Cement Based Wall Putty (40kg)",
    "brand": "Birla White",
    "categorySlug": "painting",
    "categoryName": "Painting",
    "subCategory": "Waterproof Wall Putty 40kg",
    "image": "/images/products/finishing/birla-white-wallcare-waterproof-putty-40kg-bag-smooth-white-finish.webp",
    "images": [
      "/images/products/finishing/birla-white-wallcare-waterproof-putty-40kg-bag-smooth-white-finish.webp"
    ],
    "shortTagline": "HP Polymers \u00b7 Extra High Whiteness \u00b7 Prevents Paint Flaking & Seepage",
    "specChips": [
      "HP Polymers",
      "Water Resistant",
      "Extra Whiteness",
      "Mirror Smooth Surface"
    ],
    "description": "Birla White WallCare is India's leading white cement-based wall putty. Enriched with specialized extra High-Performance (HP) polymers that fill masonry voids, eliminate paint flaking, and create a mirror-smooth foundation for luxury emulsion paints.",
    "highlights": [
      "White cement base bonds chemically to plaster, preventing paint flaking and peeling",
      "Advanced HP polymers form a water-resistant sub-surface barrier against dampness",
      "High whiteness index (> 94%) brings out true, glowing depth in topcoat paint shades",
      "Ultra-smooth surface reduces paint consumption by up to 25% on interior walls",
      "Does not require water curing after application, saving labor and site turnaround time"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Birla White (UltraTech Cement)"
      },
      {
        "label": "Product",
        "value": "WallCare Water Resistant Putty"
      },
      {
        "label": "Base",
        "value": "White Portland Cement + Polymers"
      },
      {
        "label": "Whiteness Index",
        "value": "> 94% on Hunter Scale"
      },
      {
        "label": "Coverage",
        "value": "18 - 22 sq.ft per kg (2 Coats at 1.5mm)"
      },
      {
        "label": "Curing",
        "value": "Self-Curing (No Post-Watering Needed)"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-put-20kg",
        "label": "20kg Bag",
        "unit": "20kg Bag",
        "price": 430,
        "mrp": 540,
        "discountPercent": 20,
        "stock": 100,
        "image": "/images/products/finishing/birla-white-wallcare-waterproof-putty-40kg-bag-smooth-white-finish.webp"
      },
      {
        "id": "var-put-40kg",
        "label": "40kg Bag",
        "unit": "40kg Bag",
        "price": 790,
        "mrp": 980,
        "discountPercent": 19,
        "stock": 150,
        "image": "/images/products/finishing/birla-white-wallcare-waterproof-putty-40kg-bag-smooth-white-finish.webp"
      }
    ],
    "price": 430,
    "mrp": 540,
    "discountPercent": 20,
    "unit": "20kg Bag",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Birla White Authorized Depot"
  },
  {
    "id": "prod-safety-workwear-pitbull-shoes",
    "slug": "pitbull-mirage-low-ankle-steel-toe-safety-shoes",
    "name": "Pitbull Mirage Low Ankle Steel Toe Construction Safety Shoes",
    "title": "Pitbull Mirage Low Ankle Steel Toe Construction Safety Shoes",
    "brand": "Pitbull",
    "categorySlug": "safety-workwear",
    "categoryName": "Safety & Workwear",
    "subCategory": "ISI Construction Helmets",
    "image": "/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp",
    "images": [
      "/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp"
    ],
    "shortTagline": "200 Joules Steel Toe Cap \u00b7 Oil & Acid Resistant PU Sole \u00b7 Anti-Slip",
    "specChips": [
      "200J Steel Toe",
      "Oil & Acid Resistant",
      "Anti-Slip PU Sole",
      "IS 15298 Certified"
    ],
    "description": "Pitbull Mirage low-ankle safety shoes are built with a certified 200 Joules impact-resistant steel toe cap and a dual-density injected polyurethane sole. Shields engineers and laborers against falling rebars, puncture hazards, and slippery site surfaces.",
    "highlights": [
      "Hardened EN 12568 compliant steel toe cap withstands 200 Joules impact energy",
      "Direct injected dual-density PU sole provides high shock absorption and anti-fatigue cushion",
      "Deep grooved cleated tread pattern ensures maximum grip on wet mud, oil, and gravel",
      "Breathable mesh lining with moisture-wicking insole keeps feet dry during long site shifts",
      "Certified under BIS IS 15298 (Part 2) for comprehensive industrial occupational safety"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Pitbull Safety Footwear"
      },
      {
        "label": "Toe Cap",
        "value": "200J Impact Resistant Steel Toe Cap"
      },
      {
        "label": "Upper Material",
        "value": "Genuine Grain Barton Leather"
      },
      {
        "label": "Sole",
        "value": "Direct Injected Dual-Density PU Sole"
      },
      {
        "label": "Standard",
        "value": "IS 15298 (Part 2) / CE Certified"
      },
      {
        "label": "Warranty",
        "value": "6 Months Sole Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-sh-uk6",
        "label": "UK Size 6 (Euro 40)",
        "unit": "Pair",
        "price": 490,
        "mrp": 950,
        "discountPercent": 48,
        "stock": 50,
        "image": "/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp"
      },
      {
        "id": "var-sh-uk7",
        "label": "UK Size 7 (Euro 41)",
        "unit": "Pair",
        "price": 490,
        "mrp": 950,
        "discountPercent": 48,
        "stock": 60,
        "image": "/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp"
      },
      {
        "id": "var-sh-uk8",
        "label": "UK Size 8 (Euro 42)",
        "unit": "Pair",
        "price": 490,
        "mrp": 950,
        "discountPercent": 48,
        "stock": 80,
        "image": "/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp"
      },
      {
        "id": "var-sh-uk9",
        "label": "UK Size 9 (Euro 43)",
        "unit": "Pair",
        "price": 490,
        "mrp": 950,
        "discountPercent": 48,
        "stock": 70,
        "image": "/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp"
      },
      {
        "id": "var-sh-uk10",
        "label": "UK Size 10 (Euro 44)",
        "unit": "Pair",
        "price": 490,
        "mrp": 950,
        "discountPercent": 48,
        "stock": 40,
        "image": "/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp"
      }
    ],
    "price": 490,
    "mrp": 950,
    "discountPercent": 48,
    "unit": "Pair",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Pitbull Authorized Depot"
  },
  {
    "id": "prod-safety-workwear-hillson-gumboots",
    "slug": "hillson-dragon-steel-toe-gumboots-15-high",
    "name": "Hillson Dragon Steel Toe Waterproof Gumboots, 15 Inch High",
    "title": "Hillson Dragon Steel Toe Waterproof Gumboots, 15 Inch High",
    "brand": "Hillson",
    "categorySlug": "safety-workwear",
    "categoryName": "Safety & Workwear",
    "subCategory": "ISI Construction Helmets",
    "image": "/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp",
    "images": [
      "/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp"
    ],
    "shortTagline": "15 Inch Tall Waterproof Shaft \u00b7 Steel Toe Protection \u00b7 Mud & Concrete Ready",
    "specChips": [
      "15-Inch Shaft",
      "100% Waterproof",
      "Steel Toe Protection",
      "Anti-Skid Sole"
    ],
    "description": "Hillson Dragon 15-inch heavy-duty gumboots provide total waterproof and toe protection for concrete pouring, basement excavation, monsoon flooding, and chemical handling. Molded with seamless virgin PVC and a protective steel toe.",
    "highlights": [
      "Tall 15-inch shaft prevents slurry, wet concrete, and muddy water from splashing in",
      "Built-in steel toe cap guards feet against falling masonry debris and heavy tools",
      "100% seamless single-shot injection molded PVC guarantees zero water seepage",
      "Deep aggressive cleated sole bites into wet clay, slush, and greasy surfaces",
      "Resistant to mild acids, alkalis, oils, and harsh concrete chemical admixtures"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hillson Footwear"
      },
      {
        "label": "Model",
        "value": "Dragon Steel Toe Gumboots"
      },
      {
        "label": "Shaft Height",
        "value": "15 Inches (380 mm)"
      },
      {
        "label": "Material",
        "value": "100% Virgin High-Grade Flexible PVC"
      },
      {
        "label": "Standard",
        "value": "IS 12254 / IS 15298 Certified"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-gum-uk7",
        "label": "UK Size 7",
        "unit": "Pair",
        "price": 550,
        "mrp": 850,
        "discountPercent": 35,
        "stock": 50,
        "image": "/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp"
      },
      {
        "id": "var-gum-uk8",
        "label": "UK Size 8",
        "unit": "Pair",
        "price": 550,
        "mrp": 850,
        "discountPercent": 35,
        "stock": 60,
        "image": "/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp"
      },
      {
        "id": "var-gum-uk9",
        "label": "UK Size 9",
        "unit": "Pair",
        "price": 550,
        "mrp": 850,
        "discountPercent": 35,
        "stock": 50,
        "image": "/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp"
      },
      {
        "id": "var-gum-uk10",
        "label": "UK Size 10",
        "unit": "Pair",
        "price": 550,
        "mrp": 850,
        "discountPercent": 35,
        "stock": 40,
        "image": "/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp"
      }
    ],
    "price": 550,
    "mrp": 850,
    "discountPercent": 35,
    "unit": "Pair",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Hillson Authorized Depot"
  },
  {
    "id": "prod-safety-workwear-karam-helmet",
    "slug": "karam-pn-521-safety-helmet-isi",
    "name": "Karam PN 521 ISI Marked Construction Hard Hat Safety Helmet",
    "title": "Karam PN 521 ISI Marked Construction Hard Hat Safety Helmet",
    "brand": "Karam",
    "categorySlug": "safety-workwear",
    "categoryName": "Safety & Workwear",
    "subCategory": "ISI Construction Helmets",
    "image": "/images/products/safety/karam-pn-521-helmet-isi.webp",
    "images": [
      "/images/products/safety/karam-pn-521-helmet-isi.webp"
    ],
    "shortTagline": "UV Stabilized Polymer Shell \u00b7 6-Point Textile Suspension \u00b7 ISI Marked",
    "specChips": [
      "6-Point Suspension",
      "UV Stabilized",
      "IS 2925 Certified",
      "Sweatband Included"
    ],
    "description": "Karam PN 521 is India's most trusted industrial construction safety helmet. Engineered from high-density UV-stabilized polymer with a 6-point textile cradle harness that absorbs and disperses overhead impact shock away from the skull.",
    "highlights": [
      "High-density polymer shell offers high impact and penetration resistance",
      "6-point textile suspension harness cushions head against heavy falling objects",
      "Adjustable nape strap mechanism fits all head circumferences smoothly",
      "Integrated absorbent cotton sweatband keeps brow dry during hot summer work",
      "BIS IS 2925 certified for electrical hazard insulation and structural safety"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Karam Safety Private Limited"
      },
      {
        "label": "Model",
        "value": "Sheltek PN 521"
      },
      {
        "label": "Standard",
        "value": "IS 2925:1984 & EN 397 Marked"
      },
      {
        "label": "Cradle",
        "value": "6-Point Webbing Suspension"
      },
      {
        "label": "Electrical Resistance",
        "value": "Voltage Proof up to 2000V"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-helm-yel",
        "label": "Yellow (Laborers / Operators)",
        "unit": "Piece",
        "price": 195,
        "mrp": 320,
        "discountPercent": 39,
        "stock": 100,
        "image": "/images/products/safety/karam-pn-521-helmet-isi.webp"
      },
      {
        "id": "var-helm-wht",
        "label": "White (Engineers / Supervisors)",
        "unit": "Piece",
        "price": 195,
        "mrp": 320,
        "discountPercent": 39,
        "stock": 100,
        "image": "/images/products/safety/karam-pn-521-helmet-isi.webp"
      },
      {
        "id": "var-helm-blu",
        "label": "Blue (Electricians / Techs)",
        "unit": "Piece",
        "price": 195,
        "mrp": 320,
        "discountPercent": 39,
        "stock": 60,
        "image": "/images/products/safety/karam-pn-521-helmet-isi.webp"
      },
      {
        "id": "var-helm-grn",
        "label": "Green (Safety Officers)",
        "unit": "Piece",
        "price": 195,
        "mrp": 320,
        "discountPercent": 39,
        "stock": 50,
        "image": "/images/products/safety/karam-pn-521-helmet-isi.webp"
      }
    ],
    "price": 195,
    "mrp": 320,
    "discountPercent": 39,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Karam Authorized Depot"
  },
  {
    "id": "prod-safety-workwear-karam-harness",
    "slug": "karam-fs-51-full-body-safety-harness",
    "name": "Karam FS-51 Full Body Fall Arrest Safety Harness with Lanyard",
    "title": "Karam FS-51 Full Body Fall Arrest Safety Harness with Lanyard",
    "brand": "Karam",
    "categorySlug": "safety-workwear",
    "categoryName": "Safety & Workwear",
    "subCategory": "Full-Body Fall Arrest Harness",
    "image": "/images/products/safety/karam-fs-51-full-harness.webp",
    "images": [
      "/images/products/safety/karam-fs-51-full-harness.webp"
    ],
    "shortTagline": "Full Body Fall Arrest \u00b7 Dorsal D-Ring \u00b7 High-Strength Polyester Webbing",
    "specChips": [
      "Dorsal D-Ring",
      "Fall Arrest System",
      "IS 3521 Certified",
      "Adjustable Straps"
    ],
    "description": "Karam FS-51 full body safety harness engineered for fall arrest during scaffolding, roofing, facade cleaning, and high-rise tower construction. Features a forged dorsal D-ring and adjustable shoulder, chest, and thigh straps.",
    "highlights": [
      "High-tenacity 44mm polyester webbing with high breaking strength (> 23 kN)",
      "Forged alloy steel dorsal D-ring anchors securely to shock-absorbing fall lanyards",
      "Fully adjustable thigh and chest straps ensure an ergonomic, snug fit for all body sizes",
      "Dual-color webbing scheme allows rapid identification of shoulder and leg straps",
      "Certified to IS 3521:1999 and European EN 361 standards for occupational safety"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Karam Safety"
      },
      {
        "label": "Model",
        "value": "FS-51 Full Body Harness"
      },
      {
        "label": "Webbing",
        "value": "44 mm High Tenacity Polyester"
      },
      {
        "label": "Breaking Strength",
        "value": "> 2300 kg (23 kN)"
      },
      {
        "label": "Standard",
        "value": "IS 3521:1999 & EN 361 Certified"
      },
      {
        "label": "Warranty",
        "value": "1 Year Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-har-single",
        "label": "Standard with Single Lanyard & Snap Hook",
        "unit": "Set",
        "price": 1250,
        "mrp": 1850,
        "discountPercent": 32,
        "stock": 40,
        "image": "/images/products/safety/karam-fs-51-full-harness.webp"
      },
      {
        "id": "var-har-double",
        "label": "Pro Double Scaffold Hook Energy Absorber",
        "unit": "Set",
        "price": 1850,
        "mrp": 2650,
        "discountPercent": 30,
        "stock": 30,
        "image": "/images/products/safety/karam-fs-51-full-harness.webp"
      }
    ],
    "price": 1250,
    "mrp": 1850,
    "discountPercent": 32,
    "unit": "Set",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Karam Authorized Depot"
  },
  {
    "id": "prod-safety-workwear-karam-goggles",
    "slug": "karam-es-01-protective-safety-goggles",
    "name": "Karam ES-01 Clear Polycarbonate Anti-Scratch Protective Safety Goggles",
    "title": "Karam ES-01 Clear Polycarbonate Anti-Scratch Protective Safety Goggles",
    "brand": "Karam",
    "categorySlug": "safety-workwear",
    "categoryName": "Safety & Workwear",
    "subCategory": "Protective Goggles & Dust Masks",
    "image": "/images/products/safety/karam-es-01-safety-goggles.webp",
    "images": [
      "/images/products/safety/karam-es-01-safety-goggles.webp"
    ],
    "shortTagline": "Hard-Coated Polycarbonate Lens \u00b7 99.9% UV Protection \u00b7 Panoramic Vision",
    "specChips": [
      "Anti-Scratch Lens",
      "Panoramic Vision",
      "99.9% UV Shield",
      "IS 5983 Certified"
    ],
    "description": "Clear wrap-around safety glasses that protect eyes from flying stone chips, metal sparks, sawdust, and chemical splashes. Hard-coated optical polycarbonate lens resists scratching and blocks 99.9% of harmful UV rays.",
    "highlights": [
      "Zero distortion optical Class-1 polycarbonate lens provides crystal-clear vision",
      "Hard-coated outer surface resists scratches during heavy angle grinding and cutting",
      "Contoured wrap-around temples provide snug lateral eye protection without blind spots",
      "Soft flexible nose bridge and lightweight frame ensure comfortable all-day wear",
      "Certified to IS 5983 and ANSI Z87.1 for high-velocity particle impact protection"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Karam Safety"
      },
      {
        "label": "Model",
        "value": "Horizon ES-01"
      },
      {
        "label": "Lens Material",
        "value": "Optical Grade Polycarbonate"
      },
      {
        "label": "Impact Resistance",
        "value": "High Velocity Steel Ball Impact Tested"
      },
      {
        "label": "Standard",
        "value": "IS 5983:1980 / ANSI Z87.1"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-gog-clr",
        "label": "Clear Lens (Grinding / Carpentry)",
        "unit": "Piece",
        "price": 95,
        "mrp": 160,
        "discountPercent": 40,
        "stock": 100,
        "image": "/images/products/safety/karam-es-01-safety-goggles.webp"
      },
      {
        "id": "var-gog-smk",
        "label": "Smoked Grey (Outdoor Sun & Glare)",
        "unit": "Piece",
        "price": 115,
        "mrp": 185,
        "discountPercent": 38,
        "stock": 80,
        "image": "/images/products/safety/karam-es-01-safety-goggles.webp"
      }
    ],
    "price": 95,
    "mrp": 160,
    "discountPercent": 41,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Karam Authorized Depot"
  },
  {
    "id": "prod-safety-workwear-karam-mask",
    "slug": "karam-dust-mask-pack-50",
    "name": "Karam ISI Certified High-Filtration Construction Dust Mask (Pack of 50)",
    "title": "Karam ISI Certified High-Filtration Construction Dust Mask (Pack of 50)",
    "brand": "Karam",
    "categorySlug": "safety-workwear",
    "categoryName": "Safety & Workwear",
    "subCategory": "Protective Goggles & Dust Masks",
    "image": "/images/products/safety/karam-dust-mask-pack-50.webp",
    "images": [
      "/images/products/safety/karam-dust-mask-pack-50.webp"
    ],
    "shortTagline": "Multi-Layer Electrostatic Filter \u00b7 Filters Fine Cement & Plaster Dust \u00b7 FFP2",
    "specChips": [
      "Multi-Layer Filter",
      "Pack of 50",
      "IS 9473 FFP2",
      "Adjustable Nose Clip"
    ],
    "description": "High-filtration particulate respirator masks engineered to filter airborne cement dust, tile cutting powder, wall putty particulates, and paint mist. Features an electrostatic melt-blown filtration layer and an aluminum nose clip for a tight seal.",
    "highlights": [
      "Melt-blown electrostatic middle layer captures over 95% of sub-micron airborne dust",
      "Protects mason and painter lungs from silicosis and hazardous cement lime inhalation",
      "Adjustable aluminum nose clip with soft foam cushion prevents safety goggle fogging",
      "Ultrasonically welded elastic headbands maintain comfortable tension without breaking",
      "Certified to IS 9473 FFP2 / N95 standards for industrial respiratory protection"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Karam Safety"
      },
      {
        "label": "Classification",
        "value": "IS 9473 FFP2 / EN 149 Class"
      },
      {
        "label": "Filtration Efficiency",
        "value": "> 95% at 0.3 Micron Particulate"
      },
      {
        "label": "Pack Quantity",
        "value": "50 Pieces Box"
      },
      {
        "label": "Standard",
        "value": "IS 9473:2002 BIS Marked"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-msk-std",
        "label": "Standard FFP2 Dust Mask (Box of 50)",
        "unit": "Box (50 pcs)",
        "price": 450,
        "mrp": 750,
        "discountPercent": 40,
        "stock": 60,
        "image": "/images/products/safety/karam-dust-mask-pack-50.webp"
      },
      {
        "id": "var-msk-carb",
        "label": "Activated Carbon Filter (Box of 50)",
        "unit": "Box (50 pcs)",
        "price": 720,
        "mrp": 1150,
        "discountPercent": 37,
        "stock": 40,
        "image": "/images/products/safety/karam-dust-mask-pack-50.webp"
      }
    ],
    "price": 450,
    "mrp": 750,
    "discountPercent": 40,
    "unit": "Box (50 pcs)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Karam Authorized Depot"
  },
  {
    "id": "prod-tools-hardware-bosch-gsb550",
    "slug": "bosch-gsb-550-professional-impact-drill",
    "name": "Bosch GSB 550 Professional 550W Impact Drill Machine with 13mm Keyed Chuck",
    "title": "Bosch GSB 550 Professional 550W Impact Drill Machine with 13mm Keyed Chuck",
    "brand": "Bosch",
    "categorySlug": "tools-hardware",
    "categoryName": "Tools, Power Tools & General Hardware",
    "subCategory": "Professional Impact Drills",
    "image": "/images/products/tools/bosch-gsb-550-professional-impact-drill-machine-550w-with-13mm-chuck.webp",
    "images": [
      "/images/products/tools/bosch-gsb-550-professional-impact-drill-machine-550w-with-13mm-chuck.webp"
    ],
    "shortTagline": "550W Powerful Copper Motor \u00b7 Forward/Reverse \u00b7 Dual Rotary & Hammer Modes",
    "specChips": [
      "550W Motor",
      "13mm Keyed Chuck",
      "Hammer & Rotary Modes",
      "Variable Speed"
    ],
    "description": "Bosch GSB 550 is the benchmark compact corded impact drill for masonry, concrete, metal, and wood drilling. Equipped with a robust 550W motor, electronic variable speed control, and smooth forward/reverse rotation for screwdriving.",
    "highlights": [
      "Powerful 550W high-torque motor drills up to 13mm in masonry and concrete",
      "Dual mode selector switches easily between impact hammer drilling and smooth rotary drilling",
      "Electronic speed trigger with pre-setting dial allows precise low-RPM screwdriving",
      "All-metal 13mm keyed chuck holds large drill bits securely without slipping under load",
      "Includes depth gauge stop and 360-degree adjustable auxiliary side handle"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Bosch Power Tools"
      },
      {
        "label": "Model",
        "value": "GSB 550 Professional"
      },
      {
        "label": "Rated Power Input",
        "value": "550 Watts (230V AC)"
      },
      {
        "label": "No-Load Speed",
        "value": "0 - 2800 RPM"
      },
      {
        "label": "Impact Rate",
        "value": "0 - 44,800 BPM"
      },
      {
        "label": "Drilling Capacity",
        "value": "Concrete: 13mm, Steel: 10mm, Wood: 25mm"
      },
      {
        "label": "Warranty",
        "value": "1 Year Official Bosch Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-gsb-tool",
        "label": "Tool Only in Carton Box",
        "unit": "Kit",
        "price": 2450,
        "mrp": 4100,
        "discountPercent": 40,
        "stock": 50,
        "image": "/images/products/tools/bosch-gsb-550-professional-impact-drill-machine-550w-with-13mm-chuck.webp"
      },
      {
        "id": "var-gsb-kit",
        "label": "With 100-Piece Accessory Kit & Case",
        "unit": "Carry Case Kit",
        "price": 3850,
        "mrp": 5990,
        "discountPercent": 36,
        "stock": 40,
        "image": "/images/products/tools/bosch-gsb-550-professional-impact-drill-machine-550w-with-13mm-chuck.webp"
      }
    ],
    "price": 2450,
    "mrp": 4100,
    "discountPercent": 40,
    "unit": "Kit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Bosch Authorized Depot"
  },
  {
    "id": "prod-tools-hardware-bosch-gws600",
    "slug": "bosch-gws-600-angle-grinder-4-inch",
    "name": "Bosch GWS 600 Heavy-Duty 670W 4-Inch Angle Grinder Machine",
    "title": "Bosch GWS 600 Heavy-Duty 670W 4-Inch Angle Grinder Machine",
    "brand": "Bosch",
    "categorySlug": "tools-hardware",
    "categoryName": "Tools, Power Tools & General Hardware",
    "subCategory": "Heavy-Duty Angle Grinders",
    "image": "/images/products/tools/bosch-gws-600-angle-grinder.webp",
    "images": [
      "/images/products/tools/bosch-gws-600-angle-grinder.webp"
    ],
    "shortTagline": "670W High Power \u00b7 Slim Barrel Grip \u00b7 Cutting Metal, Granite & Tiles",
    "specChips": [
      "670W High Power",
      "Slim Barrel Grip",
      "11,000 RPM",
      "Burst-Proof Guard"
    ],
    "description": "Bosch GWS 600 angle grinder is the contractor's choice for metal cutting, rebar slicing, weld deburring, and granite polishing. Engineered with a compact, ultra-slim barrel grip and heat-resistant copper armature.",
    "highlights": [
      "High performance 670W motor delivers 11,000 RPM for fast, effortless cutting",
      "Slim, ergonomic barrel housing fits comfortably in the palm for single-hand control",
      "Spindle lock button enables rapid, hassle-free disc changes using the two-pin spanner",
      "Burst-proof safety guard deflects sparks and protects operator in case of disc failure",
      "Specially designed labyrinth air vents keep abrasive stone and metal grit out of motor"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Bosch Power Tools"
      },
      {
        "label": "Model",
        "value": "GWS 600 Professional"
      },
      {
        "label": "Disc Diameter",
        "value": "100 mm (4 Inch)"
      },
      {
        "label": "Rated Power",
        "value": "670 Watts"
      },
      {
        "label": "No-Load Speed",
        "value": "11,000 RPM"
      },
      {
        "label": "Spindle Thread",
        "value": "M10"
      },
      {
        "label": "Warranty",
        "value": "1 Year Official Bosch Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-gws-tool",
        "label": "Machine Only in Box",
        "unit": "Piece",
        "price": 2250,
        "mrp": 3600,
        "discountPercent": 38,
        "stock": 50,
        "image": "/images/products/tools/bosch-gws-600-angle-grinder.webp"
      },
      {
        "id": "var-gws-disc",
        "label": "With 5 Cutting & Grinding Wheels",
        "unit": "Kit",
        "price": 2490,
        "mrp": 3990,
        "discountPercent": 38,
        "stock": 40,
        "image": "/images/products/tools/bosch-gws-600-angle-grinder.webp"
      }
    ],
    "price": 2250,
    "mrp": 3600,
    "discountPercent": 38,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Bosch Authorized Depot"
  },
  {
    "id": "prod-tools-hardware-bosch-gbh220",
    "slug": "bosch-gbh-220-rotary-hammer",
    "name": "Bosch GBH 220 Professional 720W SDS-Plus 3-Mode Rotary Hammer Drill",
    "title": "Bosch GBH 220 Professional 720W SDS-Plus 3-Mode Rotary Hammer Drill",
    "brand": "Bosch",
    "categorySlug": "tools-hardware",
    "categoryName": "Tools, Power Tools & General Hardware",
    "subCategory": "Professional Impact Drills",
    "image": "/images/products/tools/bosch-gbh-220-rotary-hammer.webp",
    "images": [
      "/images/products/tools/bosch-gbh-220-rotary-hammer.webp"
    ],
    "shortTagline": "720W Powerful Motor \u00b7 2.0 Joules Impact Energy \u00b7 3-Mode Versatility",
    "specChips": [
      "720W Motor",
      "2.0J Impact Energy",
      "SDS-Plus Chuck",
      "3 Operating Modes"
    ],
    "description": "Bosch GBH 220 is a powerful 720W rotary hammer designed for drilling through dense RCC beams, concrete pillars, and masonry. Features 3 operating modes: hammer drilling, rotary only, and chiseling mode for removing old floor tiles.",
    "highlights": [
      "Pneumatic hammer mechanism delivers 2.0 Joules impact energy for fast concrete drilling",
      "Three operating modes: Rotary Drilling, Hammer Drilling, and Dedicated Chiseling",
      "SDS-Plus chuck system enables one-touch bit insertion without tightening tools",
      "Overload safety clutch disengages motor automatically if drill bit jams in steel rebar",
      "Ergonomic soft-grip handle and vibration damping reduce operator forearm fatigue"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Bosch Power Tools"
      },
      {
        "label": "Model",
        "value": "GBH 220 Professional"
      },
      {
        "label": "Input Power",
        "value": "720 Watts"
      },
      {
        "label": "Impact Energy",
        "value": "2.0 Joules (EPTA)"
      },
      {
        "label": "Max Drilling Concrete",
        "value": "22 mm Diameter (Optimal 4 - 12mm)"
      },
      {
        "label": "Warranty",
        "value": "1 Year Bosch National Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-gbh-std",
        "label": "Standard Kit in Carrying Case",
        "unit": "Kit",
        "price": 4850,
        "mrp": 7200,
        "discountPercent": 33,
        "stock": 35,
        "image": "/images/products/tools/bosch-gbh-220-rotary-hammer.webp"
      },
      {
        "id": "var-gbh-bits",
        "label": "With 5 SDS-Plus Masonry Bits Set",
        "unit": "Pro Kit",
        "price": 5400,
        "mrp": 7950,
        "discountPercent": 32,
        "stock": 25,
        "image": "/images/products/tools/bosch-gbh-220-rotary-hammer.webp"
      }
    ],
    "price": 4850,
    "mrp": 7200,
    "discountPercent": 33,
    "unit": "Kit",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Bosch Authorized Depot"
  },
  {
    "id": "prod-tools-hardware-dewalt-dw801",
    "slug": "dewalt-dw801-heavy-angle-grinder",
    "name": "DeWalt DW801 850W Heavy-Duty 100mm Angle Grinder",
    "title": "DeWalt DW801 850W Heavy-Duty 100mm Angle Grinder",
    "brand": "DeWalt",
    "categorySlug": "tools-hardware",
    "categoryName": "Tools, Power Tools & General Hardware",
    "subCategory": "Heavy-Duty Angle Grinders",
    "image": "/images/products/tools/dewalt-dw801-grinder-4.webp",
    "images": [
      "/images/products/tools/dewalt-dw801-grinder-4.webp"
    ],
    "shortTagline": "850W High-Torque Motor \u00b7 Epoxy Coated Field Coils \u00b7 Metal Fabrication",
    "specChips": [
      "850W High Torque",
      "Epoxy Protected Armature",
      "11,000 RPM",
      "Metal & Masonry"
    ],
    "description": "DeWalt DW801 is an industrial-duty 850W 4-inch angle grinder engineered for continuous metal fabrication and masonry cutting. Epoxy-coated armature windings protect against abrasive dust abrasion.",
    "highlights": [
      "High power 850-watt motor handles severe loads without bogging down",
      "Epoxy-coated field coils provide extreme protection against abrasive metal shavings",
      "High-efficiency motor cooling fan keeps internal components cool during all-day use",
      "Low profile gearcase allows easy access into tight corner welds and structural frames",
      "Heavy-duty ball and roller bearings ensure long industrial tool operating life"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "DeWalt Industrial Tools"
      },
      {
        "label": "Model",
        "value": "DW801 Heavy Duty"
      },
      {
        "label": "Power Input",
        "value": "850 Watts"
      },
      {
        "label": "Wheel Diameter",
        "value": "100 mm (4 Inch)"
      },
      {
        "label": "Warranty",
        "value": "2 Years Official Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-dw801-std",
        "label": "Standard 100mm Grinder",
        "unit": "Piece",
        "price": 2750,
        "mrp": 4200,
        "discountPercent": 35,
        "stock": 35,
        "image": "/images/products/tools/dewalt-dw801-grinder-4.webp"
      },
      {
        "id": "var-dw801-hnd",
        "label": "With Guard & Auxiliary Handle",
        "unit": "Kit",
        "price": 2890,
        "mrp": 4450,
        "discountPercent": 35,
        "stock": 30,
        "image": "/images/products/tools/dewalt-dw801-grinder-4.webp"
      }
    ],
    "price": 2750,
    "mrp": 4200,
    "discountPercent": 35,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "DeWalt Authorized Depot"
  },
  {
    "id": "prod-tools-hardware-dewalt-dwd024",
    "slug": "dewalt-dwd024-rotary-impact-drill",
    "name": "DeWalt DWD024 650W 13mm Variable Speed Reversible Impact Drill",
    "title": "DeWalt DWD024 650W 13mm Variable Speed Reversible Impact Drill",
    "brand": "DeWalt",
    "categorySlug": "tools-hardware",
    "categoryName": "Tools, Power Tools & General Hardware",
    "subCategory": "Professional Impact Drills",
    "image": "/images/products/tools/dewalt-dwd024-drill-13mm.webp",
    "images": [
      "/images/products/tools/dewalt-dwd024-drill-13mm.webp"
    ],
    "shortTagline": "650W High Output \u00b7 Variable Speed Trigger \u00b7 Sealed Ball Bearings",
    "specChips": [
      "650W Motor",
      "13mm Chuck",
      "Sealed Bearings",
      "Rubber Overmould"
    ],
    "description": "DeWalt DWD024 is a durable 650W impact drill engineered for drilling concrete, masonry, wood, and steel. Built with sealed ball bearings that prevent dust entry and an ergonomic rubber grip for maximum tool control.",
    "highlights": [
      "High output 650-watt motor provides high drilling speed in tough masonry and steel",
      "Variable speed sensitive trigger allows smooth, accurate hole starting without bit walk",
      "Sealed ball bearings and heavy steel gears ensure exceptional contractor longevity",
      "Compact, well-balanced body fits easily into narrow joist and cabinet spaces",
      "Lock-on button enables continuous drilling during large batch production runs"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "DeWalt Industrial Tools"
      },
      {
        "label": "Model",
        "value": "DWD024 Impact Drill"
      },
      {
        "label": "Power Rating",
        "value": "650 Watts"
      },
      {
        "label": "Chuck Capacity",
        "value": "1.5 - 13 mm Keyed Chuck"
      },
      {
        "label": "Warranty",
        "value": "2 Years DeWalt Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-dwd-std",
        "label": "Machine in Box",
        "unit": "Piece",
        "price": 2850,
        "mrp": 4400,
        "discountPercent": 35,
        "stock": 35,
        "image": "/images/products/tools/dewalt-dwd024-drill-13mm.webp"
      },
      {
        "id": "var-dwd-hnd",
        "label": "With Auxiliary Handle & Depth Stop",
        "unit": "Kit",
        "price": 2990,
        "mrp": 4650,
        "discountPercent": 36,
        "stock": 30,
        "image": "/images/products/tools/dewalt-dwd024-drill-13mm.webp"
      }
    ],
    "price": 2850,
    "mrp": 4400,
    "discountPercent": 35,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "DeWalt Authorized Depot"
  },
  {
    "id": "prod-tools-hardware-bosch-gst650",
    "slug": "bosch-gst-650-professional-jigsaw",
    "name": "Bosch GST 650 450W Corded Professional Variable Speed Jigsaw",
    "title": "Bosch GST 650 450W Corded Professional Variable Speed Jigsaw",
    "brand": "Bosch",
    "categorySlug": "tools-hardware",
    "categoryName": "Tools, Power Tools & General Hardware",
    "subCategory": "Heavy-Duty Angle Grinders",
    "image": "/images/products/tools/bosch-gst-650-jigsaw.webp",
    "images": [
      "/images/products/tools/bosch-gst-650-jigsaw.webp"
    ],
    "shortTagline": "450W Motor \u00b7 Smooth Curve Cutting \u00b7 Adjustable Base Bevel \u00b7 Wood & Metal",
    "specChips": [
      "450W Motor",
      "Variable Speed",
      "Stroke Rate 3100 SPM",
      "Bevel 45\u00b0"
    ],
    "description": "Bosch GST 650 is an essential power tool for carpenters and interior contractors. Cuts intricate curves, circular sink cutouts in laminate countertops, and straight lines through plywood, solid wood, and sheet metal.",
    "highlights": [
      "Reliable 450-watt motor delivers up to 3,100 strokes per minute for clean cutting",
      "Stroke rate pre-selection dial optimizes cutting speed across different materials",
      "Sturdy steel base plate bevels up to 45 degrees left and right for miter cuts",
      "Compact bow-handle design with two-finger trigger ensures fatigue-free cutting",
      "Clear cutting line view with built-in dust blower that keeps pencil lines visible"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Bosch Power Tools"
      },
      {
        "label": "Model",
        "value": "GST 650 Professional"
      },
      {
        "label": "Power Input",
        "value": "450 Watts"
      },
      {
        "label": "Stroke Rate",
        "value": "800 - 3100 SPM"
      },
      {
        "label": "Cutting Depth",
        "value": "Wood: 65mm, Aluminum: 10mm, Steel: 3mm"
      },
      {
        "label": "Warranty",
        "value": "1 Year Official Bosch Warranty"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-gst-std",
        "label": "Standard Jigsaw in Box",
        "unit": "Piece",
        "price": 2950,
        "mrp": 4600,
        "discountPercent": 36,
        "stock": 30,
        "image": "/images/products/tools/bosch-gst-650-jigsaw.webp"
      },
      {
        "id": "var-gst-blades",
        "label": "With 5 T-Shank Wood Blades Pack",
        "unit": "Kit",
        "price": 3250,
        "mrp": 4990,
        "discountPercent": 35,
        "stock": 25,
        "image": "/images/products/tools/bosch-gst-650-jigsaw.webp"
      }
    ],
    "price": 2950,
    "mrp": 4600,
    "discountPercent": 36,
    "unit": "Piece",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Bosch Authorized Depot"
  },
  {
    "id": "prod-waterproofing-repairing-drf-lw-wp",
    "slug": "dr-fixit-lw-plus-waterproofing-5l",
    "name": "Dr. Fixit 101 LW+ Integral Liquid Waterproofing Compound for Concrete & Plaster",
    "title": "Dr. Fixit 101 LW+ Integral Liquid Waterproofing Compound for Concrete & Plaster",
    "brand": "Dr. Fixit",
    "categorySlug": "waterproofing-repairing",
    "categoryName": "Waterproofing & Repairing",
    "subCategory": "Integral Liquid Waterproofing",
    "image": "/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp",
    "images": [
      "/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp"
    ],
    "shortTagline": "Essential for Concrete & Plaster \u00b7 Inhibits Rusting of TMT Steel \u00b7 IS 2645",
    "specChips": [
      "Integral Waterproofing",
      "Corrosion Guard",
      "Improves Slump",
      "IS 2645 Certified"
    ],
    "description": "Dr. Fixit 101 LW+ is India's leading integral liquid waterproofing compound for site-mixed concrete and brick-joint plastering mortar. Fills micro-capillaries to eliminate water leakage, dampness, and rebar corrosion.",
    "highlights": [
      "Eliminates internal capillary voids to make concrete completely water impermeable",
      "Protects embedded TMT steel rebars against chloride attack and structural rusting",
      "Improves concrete workability without increasing water-cement ratio or sacrificing strength",
      "Significantly reduces plastic shrinkage cracking and surface crazing in external plaster",
      "Simple site dosage: 200 ml per 50 kg bag of cement mixed directly into gauging water"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dr. Fixit (Pidilite)"
      },
      {
        "label": "Code",
        "value": "101 LW+"
      },
      {
        "label": "Standard",
        "value": "IS 2645:2003 & IS 9103:2000"
      },
      {
        "label": "Application",
        "value": "Foundation Footings, Roof Slabs, Plastering"
      },
      {
        "label": "Dosage",
        "value": "200 ml per 50kg bag of cement"
      },
      {
        "label": "Shelf Life",
        "value": "2 Years in Original Sealed Packing"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-lw-wp-1l",
        "label": "1 Litre Bottle",
        "unit": "Bottle",
        "price": 175,
        "mrp": 210,
        "discountPercent": 17,
        "stock": 100,
        "image": "/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp"
      },
      {
        "id": "var-lw-wp-5l",
        "label": "5 Litres Can",
        "unit": "Can (5L)",
        "price": 720,
        "mrp": 890,
        "discountPercent": 19,
        "stock": 80,
        "image": "/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp"
      },
      {
        "id": "var-lw-wp-10l",
        "label": "10 Litres Can",
        "unit": "Can (10L)",
        "price": 1380,
        "mrp": 1720,
        "discountPercent": 20,
        "stock": 50,
        "image": "/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp"
      },
      {
        "id": "var-lw-wp-20l",
        "label": "20 Litres Drum",
        "unit": "Drum (20L)",
        "price": 2600,
        "mrp": 3250,
        "discountPercent": 20,
        "stock": 35,
        "image": "/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp"
      }
    ],
    "price": 175,
    "mrp": 210,
    "discountPercent": 17,
    "unit": "Bottle",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dr. Fixit Authorized Depot"
  },
  {
    "id": "prod-waterproofing-repairing-drf-urp",
    "slug": "dr-fixit-urp-302-bonding-agent-5kg",
    "name": "Dr. Fixit Super Latex 302 URP Universal Polymer Repair & Bonding Agent",
    "title": "Dr. Fixit Super Latex 302 URP Universal Polymer Repair & Bonding Agent",
    "brand": "Dr. Fixit",
    "categorySlug": "waterproofing-repairing",
    "categoryName": "Waterproofing & Repairing",
    "subCategory": "Polymer Bonding Agents (URP)",
    "image": "/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp",
    "images": [
      "/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp"
    ],
    "shortTagline": "SBR Latex Polymer \u00b7 Bridges Old-to-New Concrete \u00b7 Structural Repairs",
    "specChips": [
      "SBR Polymer",
      "Old-to-New Bond",
      "Structural Repair",
      "High Flexural Strength"
    ],
    "description": "Dr. Fixit Super Latex 302 URP is a high-solids styrene butadiene rubber (SBR) latex polymer. Used as a structural bonding slurry between old and new concrete, waterproof slurry coat for bathrooms, and repair mortar modifier.",
    "highlights": [
      "Creates an unbreakable chemical bond between existing old concrete and fresh repair mortar",
      "Modifies repair mortar to achieve high compressive and flexural strength with low shrinkage",
      "Excellent waterproof barrier coating for sunken bathroom slabs, chajjas, and parapets",
      "Prevents crack propagation and spalling in damaged concrete columns and beams",
      "High resistance to water penetration, salt spray, and mild atmospheric chemicals"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dr. Fixit (Pidilite)"
      },
      {
        "label": "Polymer Base",
        "value": "Styrene Butadiene Rubber (SBR) Latex"
      },
      {
        "label": "Solid Content",
        "value": "44 \u00b1 1%"
      },
      {
        "label": "Bond Strength",
        "value": "> 2.5 N/mm\u00b2 (Concrete-to-Concrete)"
      },
      {
        "label": "Usage",
        "value": "Bonding Slurry (1:1 with Cement), Repair Mortar"
      },
      {
        "label": "Shelf Life",
        "value": "18 Months"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-urp-1kg",
        "label": "1 kg Bottle",
        "unit": "Bottle",
        "price": 310,
        "mrp": 380,
        "discountPercent": 18,
        "stock": 70,
        "image": "/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp"
      },
      {
        "id": "var-urp-5kg",
        "label": "5 kg Can",
        "unit": "Can (5kg)",
        "price": 1350,
        "mrp": 1720,
        "discountPercent": 22,
        "stock": 60,
        "image": "/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp"
      },
      {
        "id": "var-urp-10kg",
        "label": "10 kg Can",
        "unit": "Can (10kg)",
        "price": 2550,
        "mrp": 3250,
        "discountPercent": 22,
        "stock": 40,
        "image": "/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp"
      },
      {
        "id": "var-urp-20kg",
        "label": "20 kg Drum",
        "unit": "Drum (20kg)",
        "price": 4850,
        "mrp": 6200,
        "discountPercent": 22,
        "stock": 25,
        "image": "/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp"
      }
    ],
    "price": 310,
    "mrp": 380,
    "discountPercent": 18,
    "unit": "Bottle",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dr. Fixit Authorized Depot"
  },
  {
    "id": "prod-waterproofing-repairing-drf-pidifin",
    "slug": "dr-fixit-pidifin-2k-20kg-kit",
    "name": "Dr. Fixit Pidifin 2K 2-Component Polymer Waterproof Coating for Terrace & Bathroom",
    "title": "Dr. Fixit Pidifin 2K 2-Component Polymer Waterproof Coating for Terrace & Bathroom",
    "brand": "Dr. Fixit",
    "categorySlug": "waterproofing-repairing",
    "categoryName": "Waterproofing & Repairing",
    "subCategory": "Elastomeric Terrace Coatings",
    "image": "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp",
    "images": [
      "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp"
    ],
    "shortTagline": "2-Part Acrylic Cementitious Elastomeric Membrane \u00b7 100% Waterproof",
    "specChips": [
      "2-Component Kit",
      "Elastomeric Membrane",
      "Water Tank Safe",
      "Bridges Micro-Cracks"
    ],
    "description": "Dr. Fixit Pidifin 2K is a two-component acrylic polymer-modified elastomeric cementitious waterproofing coating. Consists of a liquid polymer and cement-based powder that mix into a flexible waterproof membrane for terraces and water tanks.",
    "highlights": [
      "Forms a seamless, flexible elastomeric membrane that bridges thermal hairline cracks",
      "Certified non-toxic and potable water safe for overhead and underground drinking water tanks",
      "Withstands positive water pressure up to 5 bar (50m head of water)",
      "Bonds tenaciously to damp concrete surfaces without requiring a separate primer",
      "Ideal for waterproofing sunken toilet slabs before tile adhesive application"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dr. Fixit (Pidilite)"
      },
      {
        "label": "Kit Composition",
        "value": "Part A (Liquid Polymer) + Part B (Special Powder)"
      },
      {
        "label": "Elongation at Break",
        "value": "> 50% High Flexibility"
      },
      {
        "label": "Coverage",
        "value": "10 - 12 sq.ft per kg in 2 coats (1.0 mm thickness)"
      },
      {
        "label": "Water Pressure",
        "value": "Resists up to 5 Bar Positive Head"
      },
      {
        "label": "Standard",
        "value": "EN 14891 Certified Waterproofing"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-pid-9kg",
        "label": "9kg Kit (Small Bathroom)",
        "unit": "Kit (9kg)",
        "price": 1250,
        "mrp": 1600,
        "discountPercent": 22,
        "stock": 35,
        "image": "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp"
      },
      {
        "id": "var-pid-20kg",
        "label": "20kg Kit (Standard Terrace / Bath)",
        "unit": "Kit (20kg)",
        "price": 2450,
        "mrp": 3100,
        "discountPercent": 21,
        "stock": 45,
        "image": "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp"
      },
      {
        "id": "var-pid-40kg",
        "label": "40kg Jumbo Kit (Large Roof)",
        "unit": "Kit (40kg)",
        "price": 4650,
        "mrp": 5900,
        "discountPercent": 21,
        "stock": 25,
        "image": "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp"
      }
    ],
    "price": 1250,
    "mrp": 1600,
    "discountPercent": 22,
    "unit": "Kit (9kg)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dr. Fixit Authorized Depot"
  },
  {
    "id": "prod-waterproofing-repairing-drf-raincoat",
    "slug": "dr-fixit-raincoat-waterproof-coating-20l",
    "name": "Dr. Fixit Raincoat Heavy-Duty Elastomeric Waterproof Exterior Wall Coating",
    "title": "Dr. Fixit Raincoat Heavy-Duty Elastomeric Waterproof Exterior Wall Coating",
    "brand": "Dr. Fixit",
    "categorySlug": "waterproofing-repairing",
    "categoryName": "Waterproofing & Repairing",
    "subCategory": "Damp-Proof Surface Barriers",
    "image": "/images/products/waterproofing/dr-fixit-raincoat-waterproof-coating-20l.webp",
    "images": [
      "/images/products/waterproofing/dr-fixit-raincoat-waterproof-coating-20l.webp"
    ],
    "shortTagline": "110 Micron Thick Dry Film \u00b7 2x Thicker Than Exterior Paint \u00b7 10-Yr Guarantee",
    "specChips": [
      "Elastomeric Coating",
      "110 Micron Film",
      "Bridges 2mm Cracks",
      "10-Yr Guarantee"
    ],
    "description": "Dr. Fixit Raincoat is an ultra-durable elastomeric high-build waterproof coating for exterior building facades. Dries to an elastic 110-micron thick waterproof barrier that bridges exterior wall cracks up to 2mm wide.",
    "highlights": [
      "Provides a continuous elastic rubber-like shield twice as thick as standard exterior paint",
      "High elasticity bridges structural and thermal cracks up to 2mm without tearing",
      "Resists wind-driven torrential monsoon rain, extreme UV heat, and atmospheric smog",
      "Protects interior walls permanently from damp water patches and paint bubbling",
      "Backed by a verified 10-year manufacturer exterior waterproofing warranty"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dr. Fixit (Pidilite)"
      },
      {
        "label": "Type",
        "value": "High-Build Elastomeric Acrylic Polymer"
      },
      {
        "label": "Film Thickness",
        "value": "110 - 120 Microns DFT (in 2 Coats)"
      },
      {
        "label": "Crack Bridging",
        "value": "Up to 2.0 mm Active Hairline Cracks"
      },
      {
        "label": "Warranty",
        "value": "10 Years Waterproofing Guarantee"
      },
      {
        "label": "Coverage",
        "value": "35 - 40 sq.ft per Litre (2 Coats)"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-rain-4l",
        "label": "4 Litres Bucket",
        "unit": "4L Bucket",
        "price": 1150,
        "mrp": 1500,
        "discountPercent": 23,
        "stock": 40,
        "image": "/images/products/waterproofing/dr-fixit-raincoat-waterproof-coating-20l.webp"
      },
      {
        "id": "var-rain-20l",
        "label": "20 Litres Bucket",
        "unit": "20L Bucket",
        "price": 4850,
        "mrp": 6200,
        "discountPercent": 22,
        "stock": 30,
        "image": "/images/products/waterproofing/dr-fixit-raincoat-waterproof-coating-20l.webp"
      }
    ],
    "price": 1150,
    "mrp": 1500,
    "discountPercent": 23,
    "unit": "4L Bucket",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dr. Fixit Authorized Depot"
  },
  {
    "id": "prod-waterproofing-repairing-drf-crackx",
    "slug": "dr-fixit-crack-x-paste-1kg",
    "name": "Dr. Fixit Crack-X Paste Acrylic Flexible Crack Filler for Internal & External Walls",
    "title": "Dr. Fixit Crack-X Paste Acrylic Flexible Crack Filler for Internal & External Walls",
    "brand": "Dr. Fixit",
    "categorySlug": "waterproofing-repairing",
    "categoryName": "Waterproofing & Repairing",
    "subCategory": "Crack Sealants & Putty",
    "image": "/images/products/waterproofing/dr-fixit-crack-x-paste-1kg.webp",
    "images": [
      "/images/products/waterproofing/dr-fixit-crack-x-paste-1kg.webp"
    ],
    "shortTagline": "Fills Cracks up to 5mm \u00b7 Flexible & Non-Shrink \u00b7 Paintable in 24 Hrs",
    "specChips": [
      "Fills up to 5mm",
      "Flexible Acrylic",
      "Zero Shrinkage",
      "Paintable"
    ],
    "description": "Single-pack ready-to-use flexible acrylic paste formulated with glass fibers and special aggregate fillers. Seals static and dynamic plaster cracks up to 5mm width on interior and exterior walls without shrinkage.",
    "highlights": [
      "Accommodates thermal movement without popping out or cracking like brittle white cement",
      "Fills deep masonry plaster fissures up to 5mm width in a single or double pass",
      "Over-coatable with all standard interior and exterior emulsions after 24 hours",
      "Smooth buttery consistency applies cleanly using a standard painter's putty blade",
      "Resists UV degradation and atmospheric moisture in outdoor facades"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dr. Fixit (Pidilite)"
      },
      {
        "label": "Material",
        "value": "Reinforced Acrylic Polymer Paste"
      },
      {
        "label": "Max Crack Width",
        "value": "Up to 5 mm (0.2 Inch)"
      },
      {
        "label": "Elongation",
        "value": "> 100% Elastic Recovery"
      },
      {
        "label": "Drying Time",
        "value": "Touch Dry: 30 Mins, Paintable: 24 Hours"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-crk-500g",
        "label": "500g Tub",
        "unit": "Tub",
        "price": 115,
        "mrp": 150,
        "discountPercent": 23,
        "stock": 70,
        "image": "/images/products/waterproofing/dr-fixit-crack-x-paste-1kg.webp"
      },
      {
        "id": "var-crk-1kg",
        "label": "1 kg Tub",
        "unit": "Tub (1kg)",
        "price": 195,
        "mrp": 250,
        "discountPercent": 22,
        "stock": 80,
        "image": "/images/products/waterproofing/dr-fixit-crack-x-paste-1kg.webp"
      },
      {
        "id": "var-crk-5kg",
        "label": "5 kg Bucket",
        "unit": "Bucket (5kg)",
        "price": 850,
        "mrp": 1150,
        "discountPercent": 26,
        "stock": 40,
        "image": "/images/products/waterproofing/dr-fixit-crack-x-paste-1kg.webp"
      }
    ],
    "price": 115,
    "mrp": 150,
    "discountPercent": 23,
    "unit": "Tub",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dr. Fixit Authorized Depot"
  },
  {
    "id": "prod-waterproofing-repairing-drf-pidifin-terrace",
    "slug": "dr-fixit-pidifin-2k-terrace-kit",
    "name": "Dr. Fixit Pidifin 2K High-Elongation Waterproofing Slurry for Water Tanks & Sunken Slabs",
    "title": "Dr. Fixit Pidifin 2K High-Elongation Waterproofing Slurry for Water Tanks & Sunken Slabs",
    "brand": "Dr. Fixit",
    "categorySlug": "waterproofing-repairing",
    "categoryName": "Waterproofing & Repairing",
    "subCategory": "Elastomeric Terrace Coatings",
    "image": "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit-2-component-waterproofing-coating-for-terrace-bathroom.webp",
    "images": [
      "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit-2-component-waterproofing-coating-for-terrace-bathroom.webp"
    ],
    "shortTagline": "CFRI Certified Food Grade Safe \u00b7 High Hydrostatic Head \u00b7 Zero Water Leakage",
    "specChips": [
      "CFRI Food Safe",
      "Water Tank Certified",
      "Resists 50m Head",
      "Flexible Slurry"
    ],
    "description": "Specialized high-density polymer elastomeric slurry coating formulated for concrete water retaining structures, underground sumps, overhead tanks, and sunken bathroom slabs. Certified by Central Food Technological Research Institute (CFTRI) as completely safe for potable drinking water.",
    "highlights": [
      "Certified 100% safe for potable drinking water by Central Food Technological Institute",
      "Withstands extreme hydrostatic head pressure up to 50 meters in underground sumps",
      "Dense crystalline and polymer network seals micro-cracks and honeycombs in concrete",
      "Excellent adhesion to green damp concrete without blistering or peeling off",
      "Seamless continuous barrier eliminates joint weak points found in sheet membranes"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dr. Fixit (Pidilite)"
      },
      {
        "label": "Standard",
        "value": "CFTRI Certified for Potable Water Contact"
      },
      {
        "label": "Hydrostatic Resistance",
        "value": "50m Head Water Pressure"
      },
      {
        "label": "Color",
        "value": "Cementitious Slate Grey"
      },
      {
        "label": "Application Area",
        "value": "Drinking Water Tanks, Sumps, Sunken Slabs"
      },
      {
        "label": "Delivery Time",
        "value": "60 Mins Express Dispatch"
      }
    ],
    "variants": [
      {
        "id": "var-pidsump-20",
        "label": "20kg Standard Kit",
        "unit": "Kit (20kg)",
        "price": 2550,
        "mrp": 3250,
        "discountPercent": 22,
        "stock": 40,
        "image": "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit-2-component-waterproofing-coating-for-terrace-bathroom.webp"
      },
      {
        "id": "var-pidsump-40",
        "label": "40kg Commercial Heavy Kit",
        "unit": "Kit (40kg)",
        "price": 4800,
        "mrp": 6200,
        "discountPercent": 23,
        "stock": 25,
        "image": "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit-2-component-waterproofing-coating-for-terrace-bathroom.webp"
      }
    ],
    "price": 2550,
    "mrp": 3250,
    "discountPercent": 22,
    "unit": "Kit (20kg)",
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Dr. Fixit Authorized Depot"
  }
];

export const getProductsByCategory = (categorySlug: string): IProduct[] => {
  return CATALOG_PRODUCTS.filter(
    (p) => p.categorySlug === categorySlug
  );
};

export const getProductBySlug = (slug: string): IProduct | undefined => {
  return CATALOG_PRODUCTS.find((p) => p.slug === slug);
};

export const getCategoryBySlug = (slug: string): ICategory | undefined => {
  return CATALOG_CATEGORIES.find((c) => c.slug === slug);
};
