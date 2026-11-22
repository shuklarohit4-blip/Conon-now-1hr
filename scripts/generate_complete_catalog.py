import os
import json

base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
public_dir = os.path.join(base_dir, "artifacts/conon/public")

def v(rel):
    full = os.path.join(public_dir, rel.lstrip("/"))
    if not os.path.exists(full):
        raise FileNotFoundError(f"Missing {full}")
    size = os.path.getsize(full)
    if size < 1000:
        raise ValueError(f"Too small {full} {size}B")
    return rel

CATEGORIES = [
  {
    "catId": 1,
    "slug": "cctv-networking",
    "title": "CCTV & Networking",
    "department": "Electrical",
    "image": v("/images/home-categories/cctv-networking.webp"),
    "dbCategory": "electrical",
    "route": "/collections/cctv-networking",
    "badge": "New Tech",
    "subcategories": [
      { "name": "Dome Cameras", "slug": "dome-cameras", "itemCount": 18 },
      { "name": "Bullet Cameras", "slug": "bullet-cameras", "itemCount": 24 },
      { "name": "DVR & NVR Units", "slug": "dvr-nvr", "itemCount": 12 },
      { "name": "Wi-Fi Routers & Extenders", "slug": "wifi-routers", "itemCount": 16 },
      { "name": "CAT6 & Patch Cables", "slug": "cat6-cables", "itemCount": 30 },
    ],
  },
  {
    "catId": 2,
    "slug": "cpvc-plumbing-tanks",
    "title": "CPVC Plumbing & Overhead Tanks",
    "department": "Plumbing, Sanitary & Bath",
    "image": v("/images/home-categories/cpvc-plumbing-tanks.webp"),
    "dbCategory": "plumbing",
    "route": "/collections/cpvc-plumbing-tanks",
    "badge": "Bulk Rates",
    "subcategories": [
      { "name": "Overhead Water Tanks", "slug": "water-tanks", "itemCount": 14 },
      { "name": "CPVC Pipes SDR 11", "slug": "cpvc-pipes", "itemCount": 28 },
      { "name": "CPVC Elbows, Tees & Couplers", "slug": "cpvc-fittings", "itemCount": 56 },
      { "name": "Solvent Cements & Primers", "slug": "solvent-cements", "itemCount": 10 },
      { "name": "Brass Insert Fittings", "slug": "brass-fittings", "itemCount": 32 },
    ],
  },
  {
    "catId": 3,
    "slug": "cement-civil-works",
    "title": "Cement & Civil Works",
    "department": "Civil & Interiors",
    "image": v("/images/home-categories/cement-civil-works.webp"),
    "dbCategory": "cement",
    "route": "/collections/cement-1",
    "badge": "Bulk Prices",
    "subcategories": [
      { "name": "OPC 53 Grade Cement", "slug": "opc-53", "itemCount": 12 },
      { "name": "PPC Waterproofing Cement", "slug": "ppc-waterproofing", "itemCount": 16 },
      { "name": "First Class Red Bricks", "slug": "red-bricks", "itemCount": 8 },
      { "name": "Magicrete AAC Blocks", "slug": "aac-blocks", "itemCount": 10 },
      { "name": "Screened River Sand & M-Sand", "slug": "sand-aggregates", "itemCount": 14 },
    ],
  },
  {
    "catId": 4,
    "slug": "plywood-boards",
    "title": "Plywood & Boards",
    "department": "Civil & Interiors",
    "image": v("/images/home-categories/plywood-boards.webp"),
    "dbCategory": "wood",
    "route": "/collections/plywood-blockboard",
    "subcategories": [
      { "name": "BWP Marine 710 Plywood", "slug": "bwp-marine-plywood", "itemCount": 22 },
      { "name": "Action TESA HDHMR", "slug": "hdhmr-boards", "itemCount": 18 },
      { "name": "Commercial MR Plywood", "slug": "mr-plywood", "itemCount": 26 },
      { "name": "Boilo Water Resistant Boards", "slug": "boilo-boards", "itemCount": 10 },
      { "name": "Blockboards & Flush Doors", "slug": "blockboards-doors", "itemCount": 15 },
    ],
  },
  {
    "catId": 5,
    "slug": "fevicol-adhesives-sealants",
    "title": "Fevicol, Adhesives & Sealants",
    "department": "Furniture & Architectural Hardware",
    "image": v("/images/home-categories/fevicol-adhesives-sealants.webp"),
    "dbCategory": "adhesives",
    "route": "/collections/wood-adhesives",
    "subcategories": [
      { "name": "Fevicol SH Synthetic Resin", "slug": "fevicol-sh", "itemCount": 12 },
      { "name": "Fevicol Marine Waterproof", "slug": "fevicol-marine", "itemCount": 8 },
      { "name": "Fevicol HeatX Fast Heat Proof", "slug": "fevicol-heatx", "itemCount": 6 },
      { "name": "Silicone Sealants & Acrylic", "slug": "silicone-sealants", "itemCount": 14 },
      { "name": "M-Seal & Epoxy Compounds", "slug": "m-seal-epoxy", "itemCount": 10 },
    ],
  },
  {
    "catId": 6,
    "slug": "wires-mcb-electrical",
    "title": "Wires, MCB & Electrical Supplies",
    "department": "Electrical",
    "image": v("/images/home-categories/wires-mcb-electrical.webp"),
    "dbCategory": "electrical",
    "route": "/collections/electrical-wires",
    "badge": "ISI Certified",
    "subcategories": [
      { "name": "Flame Retardant House Wires", "slug": "fr-house-wires", "itemCount": 42 },
      { "name": "MCB & Distribution Boards", "slug": "mcb-db-boards", "itemCount": 28 },
      { "name": "Modular Switches & Sockets", "slug": "modular-switches", "itemCount": 64 },
      { "name": "Conduits, Bends & Metal Boxes", "slug": "conduits-boxes", "itemCount": 36 },
      { "name": "Earth Bar & Industrial Glands", "slug": "earthing-glands", "itemCount": 16 },
    ],
  },
  {
    "catId": 7,
    "slug": "kitchen-sinks-faucets",
    "title": "Kitchen Sinks & Faucets",
    "department": "Plumbing, Sanitary & Bath",
    "image": v("/images/home-categories/kitchen-sinks-faucets.webp"),
    "dbCategory": "hardware",
    "route": "/collections/ss-sinks",
    "subcategories": [
      { "name": "SS 304 Single Bowl Sinks", "slug": "ss-single-bowl", "itemCount": 20 },
      { "name": "SS Sinks with Drainboard", "slug": "ss-drainboard-sinks", "itemCount": 16 },
      { "name": "Composite Quartz Sinks", "slug": "quartz-sinks", "itemCount": 14 },
      { "name": "Pull-Out Gooseneck Faucets", "slug": "kitchen-faucets", "itemCount": 24 },
      { "name": "Sink Waste Strainers & Traps", "slug": "sink-accessories", "itemCount": 12 },
    ],
  },
  {
    "catId": 8,
    "slug": "furniture-wardrobe-bed-hardware",
    "title": "Furniture, Wardrobe & Bed Hardware",
    "department": "Furniture & Architectural Hardware",
    "image": v("/images/home-categories/furniture-wardrobe-bed-hardware.webp"),
    "dbCategory": "hardware",
    "route": "/collections/hinges",
    "subcategories": [
      { "name": "Soft-Close Concealed Hinges", "slug": "soft-close-hinges", "itemCount": 26 },
      { "name": "Telescopic Drawer Slides", "slug": "drawer-slides", "itemCount": 32 },
      { "name": "Hydraulic Bed Lift Mechanisms", "slug": "bed-lift-hydraulics", "itemCount": 8 },
      { "name": "Wardrobe Sliding Systems", "slug": "sliding-systems", "itemCount": 14 },
      { "name": "Furniture Legs & Levelers", "slug": "furniture-legs", "itemCount": 18 },
    ],
  },
  {
    "catId": 9,
    "slug": "modular-kitchen-systems",
    "title": "Modular Kitchen Systems & Fittings",
    "department": "Furniture & Architectural Hardware",
    "image": v("/images/home-categories/modular-kitchen-systems.webp"),
    "dbCategory": "hardware",
    "route": "/collections/modular-kitchen-systems",
    "subcategories": [
      { "name": "SS Wire Cutlery & Grain Baskets", "slug": "ss-wire-baskets", "itemCount": 28 },
      { "name": "Tall Pantry Pull-Out Units", "slug": "tall-pantry-units", "itemCount": 10 },
      { "name": "Magic Corner & Carousel Units", "slug": "corner-units", "itemCount": 12 },
      { "name": "Under-Sink Waste Bins", "slug": "waste-bins", "itemCount": 8 },
      { "name": "Spice Racks & Bottle Pull-Outs", "slug": "spice-pullouts", "itemCount": 16 },
    ],
  },
  {
    "catId": 10,
    "slug": "door-hardware-locks",
    "title": "Door Hardware & Locks",
    "department": "Furniture & Architectural Hardware",
    "image": v("/images/home-categories/door-hardware-locks.webp"),
    "dbCategory": "hardware",
    "route": "/collections/mechanical-locks",
    "subcategories": [
      { "name": "Mortise Lever Handles & Locks", "slug": "mortise-handles", "itemCount": 34 },
      { "name": "Main Door Rim & Tribolt Locks", "slug": "main-door-locks", "itemCount": 22 },
      { "name": "Hydraulic Overhead Door Closers", "slug": "door-closers", "itemCount": 12 },
      { "name": "Heavy SS Bearing Butt Hinges", "slug": "ss-butt-hinges", "itemCount": 24 },
      { "name": "Digital Smart Fingerprint Locks", "slug": "smart-door-locks", "itemCount": 8 },
    ],
  },
  {
    "catId": 11,
    "slug": "sanitary-bath-fittings",
    "title": "Sanitary & Bath Fittings",
    "department": "Plumbing, Sanitary & Bath",
    "image": v("/images/home-categories/sanitary-bath-fittings.webp"),
    "dbCategory": "plumbing",
    "route": "/collections/mixers-diverters-shower",
    "subcategories": [
      { "name": "Wall-Hung Ceramic WC", "slug": "wall-hung-wc", "itemCount": 22 },
      { "name": "Concealed Cisterns & Push Plates", "slug": "concealed-cisterns", "itemCount": 16 },
      { "name": "Countertop Ceramic Basins", "slug": "countertop-basins", "itemCount": 28 },
      { "name": "Diverters & Overhead Showers", "slug": "diverters-showers", "itemCount": 36 },
      { "name": "Health Faucets & Angle Valves", "slug": "health-faucets", "itemCount": 30 },
    ],
  },
  {
    "catId": 12,
    "slug": "tile-stone-installation",
    "title": "Tile & Stone Installation",
    "department": "Civil & Interiors",
    "image": v("/images/home-categories/tile-stone-installation.webp"),
    "dbCategory": "tiles",
    "route": "/collections/tile-adhesives",
    "badge": "Bulk Rates",
    "subcategories": [
      { "name": "Polymer-Modified Tile Adhesives", "slug": "tile-adhesives", "itemCount": 24 },
      { "name": "Waterproof Epoxy Tile Grouts", "slug": "epoxy-grouts", "itemCount": 18 },
      { "name": "Tile Leveling Clips & Spacers", "slug": "tile-spacers-clips", "itemCount": 14 },
      { "name": "Notched Trowels & Grout Floats", "slug": "tiling-tools", "itemCount": 16 },
      { "name": "Tile Cleaners & Stone Sealers", "slug": "cleaners-sealers", "itemCount": 12 },
    ],
  },
  {
    "catId": 13,
    "slug": "home-appliances",
    "title": "Home Appliances",
    "department": "Electrical",
    "image": v("/images/home-categories/home-appliances.webp"),
    "dbCategory": "electrical",
    "route": "/collections/home-appliances",
    "subcategories": [
      { "name": "Kitchen Chimney Cooker Hoods", "slug": "kitchen-chimneys", "itemCount": 18 },
      { "name": "Storage Water Heaters (Geysers)", "slug": "water-geysers", "itemCount": 22 },
      { "name": "BLDC & Decorative Ceiling Fans", "slug": "ceiling-fans", "itemCount": 32 },
      { "name": "High-Speed Ventilation Exhausts", "slug": "exhaust-fans", "itemCount": 16 },
      { "name": "Induction & Gas Cooktops", "slug": "cooktops", "itemCount": 14 },
    ],
  },
  {
    "catId": 14,
    "slug": "lighting",
    "title": "Lighting",
    "department": "Electrical",
    "image": v("/images/home-categories/lighting.webp"),
    "dbCategory": "electrical",
    "route": "/collections/ceiling-panel-lights",
    "subcategories": [
      { "name": "Slim LED Battens & Tubes", "slug": "led-battens", "itemCount": 24 },
      { "name": "Recessed Round & Square Panels", "slug": "panel-lights", "itemCount": 38 },
      { "name": "COB Focus & Spotlights", "slug": "cob-spotlights", "itemCount": 26 },
      { "name": "Outdoor LED Flood Lights", "slug": "flood-lights", "itemCount": 14 },
      { "name": "Profile & Strip Lights", "slug": "strip-lights", "itemCount": 20 },
    ],
  },
  {
    "catId": 15,
    "slug": "painting",
    "title": "Painting",
    "department": "Civil & Interiors",
    "image": v("/images/home-categories/painting.webp"),
    "dbCategory": "paint",
    "route": "/collections/interior-emulsions",
    "subcategories": [
      { "name": "Interior Luxury Emulsions", "slug": "interior-emulsion", "itemCount": 34 },
      { "name": "Weatherproof Exterior Emulsions", "slug": "exterior-emulsion", "itemCount": 28 },
      { "name": "Waterproof Wall Putty 40kg", "slug": "wall-putty", "itemCount": 12 },
      { "name": "Acrylic Wall Primers", "slug": "wall-primers", "itemCount": 18 },
      { "name": "Paint Rollers, Brushes & Trays", "slug": "painting-tools", "itemCount": 26 },
    ],
  },
  {
    "catId": 16,
    "slug": "safety-workwear",
    "title": "Safety & Workwear",
    "department": "Tools",
    "image": v("/images/home-categories/safety-workwear.webp"),
    "dbCategory": "safety",
    "route": "/collections/shoes-gloves",
    "subcategories": [
      { "name": "ISI Construction Helmets", "slug": "safety-helmets", "itemCount": 16 },
      { "name": "High-Vis Reflective Safety Vests", "slug": "safety-vests", "itemCount": 14 },
      { "name": "Full-Body Fall Arrest Harness", "slug": "safety-harnesses", "itemCount": 10 },
      { "name": "Industrial Work Gloves", "slug": "safety-gloves", "itemCount": 20 },
      { "name": "Protective Goggles & Dust Masks", "slug": "goggles-masks", "itemCount": 18 },
    ],
  },
  {
    "catId": 17,
    "slug": "tools-hardware",
    "title": "Tools, Power Tools & General Hardware",
    "department": "Tools",
    "image": v("/images/home-categories/tools-hardware.webp"),
    "dbCategory": "tools",
    "route": "/collections/tools-hardware",
    "subcategories": [
      { "name": "Professional Impact Drills", "slug": "impact-drills", "itemCount": 16 },
      { "name": "Heavy-Duty Angle Grinders", "slug": "angle-grinders", "itemCount": 14 },
      { "name": "Spanners, Wrenches & Pliers", "slug": "hand-tools-wrenches", "itemCount": 38 },
      { "name": "Stanley Measuring Tapes & Levels", "slug": "measuring-tapes", "itemCount": 18 },
      { "name": "Fasteners, Screws & Wall Plugs", "slug": "screws-fasteners", "itemCount": 44 },
    ],
  },
  {
    "catId": 18,
    "slug": "waterproofing-repairing",
    "title": "Waterproofing & Repairing",
    "department": "Civil & Interiors",
    "image": v("/images/home-categories/waterproofing-repairing.webp"),
    "dbCategory": "adhesives",
    "route": "/collections/waterproofing-repairing",
    "badge": "Site Tested",
    "subcategories": [
      { "name": "Integral Liquid Waterproofing", "slug": "integral-waterproofing", "itemCount": 12 },
      { "name": "Polymer Bonding Agents (URP)", "slug": "bonding-agents", "itemCount": 14 },
      { "name": "Elastomeric Terrace Coatings", "slug": "terrace-coatings", "itemCount": 10 },
      { "name": "Crack Sealants & Putty", "slug": "crack-sealants", "itemCount": 16 },
      { "name": "Damp-Proof Surface Barriers", "slug": "damp-proof-barriers", "itemCount": 8 },
    ],
  },
]

def make_product(
    id_suffix,
    slug,
    name,
    brand,
    cat_slug,
    cat_name,
    sub_cat,
    img_rel,
    short_tagline,
    spec_chips,
    desc,
    highlights,
    specs,
    variants,
    rating=4.8,
    reviews=145,
    delivery="60 Mins",
    vendor=None
):
    primary_img = v(img_rel)
    price = variants[0]["price"]
    mrp = variants[0]["mrp"]
    discount = round(((mrp - price) / mrp) * 100) if mrp > price else 0
    unit = variants[0]["unit"]
    return {
        "id": f"prod-{cat_slug}-{id_suffix}",
        "slug": slug,
        "name": name,
        "title": name,
        "brand": brand,
        "categorySlug": cat_slug,
        "categoryName": cat_name,
        "subCategory": sub_cat,
        "image": primary_img,
        "images": [primary_img],
        "shortTagline": short_tagline,
        "specChips": spec_chips,
        "description": desc,
        "highlights": highlights,
        "specifications": specs,
        "variants": variants,
        "price": price,
        "mrp": mrp,
        "discountPercent": discount,
        "unit": unit,
        "inStock": True,
        "rating": rating,
        "reviewsCount": reviews,
        "deliveryEta": delivery,
        "vendor": vendor or f"{brand} Authorized Depot",
    }

PRODUCTS = []

# ─── 1. CCTV & Networking ───────────────────────────────────────────────────
PRODUCTS.extend([
    make_product(
        "cp-z43q", "cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q",
        "CP Plus 4MP Wi-Fi Full Color PT Camera - CP-Z43Q", "CP PLUS",
        "cctv-networking", "CCTV & Networking", "Cameras",
        "/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp",
        "360° Pan-Tilt · 4MP Full Color Night Vision · Two-Way Talk",
        ["4MP Ultra HD", "360° Pan Tilt", "Color Night Vision", "Two-Way Audio"],
        "High-definition 4MP PT camera engineered for residential and commercial site surveillance. Delivers vivid full-color video streaming day and night with intelligent motion tracking and instant smartphone alerts. Built with robust weatherproof casing and dual-band Wi-Fi for uninterrupted monitoring.",
        [
            "4MP Quad HD resolution with crystal clear zoom details",
            "360° horizontal pan and 90° vertical tilt motorized control",
            "Smart full-color night vision with dual high-power white LEDs",
            "Full duplex two-way audio with built-in noise cancelling microphone",
            "Supports up to 256GB MicroSD card and secure cloud storage"
        ],
        [
            {"label": "Brand", "value": "CP PLUS"},
            {"label": "Model / Series", "value": "CP-Z43Q Wi-Fi PT Series"},
            {"label": "Resolution", "value": "4 Megapixel (2560 x 1440)"},
            {"label": "Connectivity", "value": "2.4GHz Wi-Fi + RJ45 Ethernet Port"},
            {"label": "Night Vision Range", "value": "Up to 30 Meters Full Color"},
            {"label": "Audio", "value": "Two-Way Audio with Noise Cancellation"},
            {"label": "Storage Support", "value": "MicroSD up to 256GB / Cloud Storage"},
            {"label": "Warranty", "value": "2 Years Manufacturer Warranty"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-cp-z43q-1", "label": "Single Camera Unit", "unit": "Piece", "price": 3984, "mrp": 7200, "discountPercent": 45, "stock": 50, "image": v("/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp")},
            {"id": "var-cp-z43q-2", "label": "Dual Pack (2 Cameras)", "unit": "Pack of 2", "price": 7800, "mrp": 14400, "discountPercent": 46, "stock": 25, "image": v("/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp")},
            {"id": "var-cp-z43q-4", "label": "Site Quad Kit (4 Cameras)", "unit": "Pack of 4", "price": 15200, "mrp": 28800, "discountPercent": 47, "stock": 15, "image": v("/images/products/cctv/cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q.webp")},
        ]
    ),
    make_product(
        "ez-r33t", "cp-plus-3mp-4g-sim-camera-ez-r33t",
        "CP Plus 3MP 4G Sim Camera - EZ-R33T", "CP PLUS",
        "cctv-networking", "CCTV & Networking", "Cameras",
        "/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp",
        "Direct 4G SIM Slot · No Wi-Fi Needed · Outdoor Waterproof IP66",
        ["4G SIM Connectivity", "3MP 2K Video", "IP66 Weatherproof", "Human Detection"],
        "Stand-alone 4G SIM card surveillance camera ideal for active construction sites, farmhouses, and remote projects without broadband. Provides direct 4G LTE cellular connectivity for live streaming to your phone. Features heavy-duty IP66 weatherproof housing and infrared night illumination.",
        [
            "Works with all major 4G SIM cards (Jio, Airtel, Vi) without Wi-Fi",
            "3MP 2K crystal-clear video streaming with wide angle field of view",
            "IP66 rated waterproof and dustproof exterior for outdoor longevity",
            "AI human shape detection with active light and siren deterrence",
            "Low data consumption mode optimized for continuous monitoring"
        ],
        [
            {"label": "Brand", "value": "CP PLUS"},
            {"label": "Model / Series", "value": "EZ-R33T 4G Outdoor Bullet"},
            {"label": "Resolution", "value": "3 Megapixel (2304 x 1296)"},
            {"label": "Network Support", "value": "4G LTE Nano SIM (Jio / Airtel / Vi)"},
            {"label": "Ingress Protection", "value": "IP66 Weatherproof Standard"},
            {"label": "IR Distance", "value": "Up to 30 Meters Night Vision"},
            {"label": "Storage", "value": "TF Card up to 256GB"},
            {"label": "Warranty", "value": "2 Years Official Warranty"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-ez-r33t-1", "label": "Standalone Camera", "unit": "Piece", "price": 2784, "mrp": 5200, "discountPercent": 46, "stock": 40, "image": v("/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp")},
            {"id": "var-ez-r33t-sd", "label": "With 64GB High-Endurance Card", "unit": "Kit", "price": 3199, "mrp": 5999, "discountPercent": 47, "stock": 30, "image": v("/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp")},
            {"id": "var-ez-r33t-128", "label": "With 128GB High-Endurance Card", "unit": "Kit", "price": 3599, "mrp": 6699, "discountPercent": 46, "stock": 20, "image": v("/images/products/cctv/cp-plus-3mp-4g-sim-camera-ez-r33t.webp")},
        ]
    ),
    make_product(
        "cp-unc-da21l3c-q", "cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q",
        "CP Plus 2MP IP Dome Camera - CP-UNC-DA21L3C-Q", "CP PLUS",
        "cctv-networking", "CCTV & Networking", "Cameras",
        "/images/products/cctv/cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q.webp",
        "PoE Powered · Commercial Ceiling Dome · H.265+ Compression",
        ["2MP Full HD", "Power over Ethernet", "H.265+ Codec", "Vandal Proof"],
        "Enterprise-grade ceiling dome camera designed for offices, commercial hallways, and apartment stairwells. Supports Power over Ethernet (PoE) for effortless single-cable data and power deployment. Delivers sharp 1080p surveillance with low-bandwidth H.265+ video encoding.",
        [
            "2MP Full HD CMOS sensor for clean, distortion-free indoor video",
            "PoE (802.3af) support reduces cabling clutter and installation cost",
            "H.265+ video compression saves up to 70% storage and bandwidth",
            "True Day/Night ICR filter with intelligent smart IR LEDs",
            "Vandal-resistant compact dome form factor fits any modern ceiling"
        ],
        [
            {"label": "Brand", "value": "CP PLUS"},
            {"label": "Model / Series", "value": "CP-UNC-DA21L3C-Q Coral Series"},
            {"label": "Sensor Type", "value": "1/2.8\" 2MP Progressive Scan CMOS"},
            {"label": "Lens", "value": "3.6mm Fixed Focal Length (88° Field of View)"},
            {"label": "Power Input", "value": "12V DC / PoE (802.3af)"},
            {"label": "Compression", "value": "H.265+ / H.265 / H.264"},
            {"label": "IR Range", "value": "30 Meters Smart IR"},
            {"label": "Warranty", "value": "2 Years Official Warranty"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-unc-da21-28", "label": "2.8mm Wide Angle (105°)", "unit": "Piece", "price": 3505, "mrp": 7300, "discountPercent": 52, "stock": 35, "image": v("/images/products/cctv/cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q.webp")},
            {"id": "var-unc-da21-36", "label": "3.6mm Standard (88°)", "unit": "Piece", "price": 3505, "mrp": 7300, "discountPercent": 52, "stock": 40, "image": v("/images/products/cctv/cp-plus-2mp-ip-dome-camera-cp-unc-da21l3c-q.webp")},
        ]
    ),
    make_product(
        "cp-e38q", "cp-plus-3mp-wifi-pt-camera-cp-e38q",
        "CP Plus 3MP Wi-Fi PT Camera - CP-E38Q", "CP PLUS",
        "cctv-networking", "CCTV & Networking", "Cameras",
        "/images/products/cctv/cp-plus-3mp-wifi-pt-camera-cp-e38q.webp",
        "3MP 2K Smart Home & Office Pan-Tilt Camera with Auto-Tracking",
        ["3MP 2K Resolution", "Auto-Tracking", "Privacy Mode", "Alexa & Google Home"],
        "Compact robotic pan-tilt camera with intelligent motion auto-tracking for home interiors, retail counters, and office rooms. Captures 3MP 2K high-resolution feeds with responsive 360-degree rotation. Features private one-touch lens sleep mode and two-way audio.",
        [
            "High resolution 3MP 2K video clarity with vivid color contrast",
            "Motorized pan & tilt with smart auto-tracking follows moving subjects",
            "Physical privacy shutter mode for complete personal comfort at home",
            "Crystal clear two-way communication for talking to family or staff",
            "Seamless compatibility with Alexa and Google Assistant smart displays"
        ],
        [
            {"label": "Brand", "value": "CP PLUS"},
            {"label": "Model / Series", "value": "EzyKam+ CP-E38Q"},
            {"label": "Resolution", "value": "3 Megapixel (2304 x 1296)"},
            {"label": "Pan / Tilt Range", "value": "355° Pan / 85° Tilt"},
            {"label": "Audio", "value": "Built-in Mic & Speaker (2-Way Audio)"},
            {"label": "Smart Home", "value": "Alexa & Google Assistant Enabled"},
            {"label": "Storage", "value": "MicroSD Slot up to 256GB"},
            {"label": "Warranty", "value": "2 Years Brand Replacement"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-e38q-1", "label": "Single Camera Unit", "unit": "Piece", "price": 2350, "mrp": 4200, "discountPercent": 44, "stock": 60, "image": v("/images/products/cctv/cp-plus-3mp-wifi-pt-camera-cp-e38q.webp")},
            {"id": "var-e38q-2", "label": "Dual Pack (2 Cameras)", "unit": "Pack of 2", "price": 4599, "mrp": 8400, "discountPercent": 45, "stock": 30, "image": v("/images/products/cctv/cp-plus-3mp-wifi-pt-camera-cp-e38q.webp")},
        ]
    ),
    make_product(
        "cp-vac-t24l2", "cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2",
        "CP Plus 2.4MP Full HD IR Bullet Camera CP-VAC-T24L2", "CP PLUS",
        "cctv-networking", "CCTV & Networking", "Cameras",
        "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2.webp",
        "Outdoor Heavy Weatherproof Bullet · 20m IR · Metal-Polymer Body",
        ["2.4MP HD Clarity", "20m IR Night Vision", "IP66 Rugged", "DWDR & BLC"],
        "Reliable outdoor bullet surveillance camera built for heavy weather durability. Provides crisp 2.4MP high-definition video through coaxial cables with universal compatibility across HDx, AHD, TVI, and CVBS DVR formats. Includes smart infrared LEDs for crisp nighttime capture.",
        [
            "2.4MP high-performance sensor delivers vivid daylight and night footage",
            "Universal 4-in-1 switchable video output for seamless DVR integration",
            "High-grade IP66 weatherproofing protects against monsoon rain and dust",
            "Digital Wide Dynamic Range (DWDR) compensates for harsh backlighting",
            "3-axis mounting bracket supports flexible ceiling or wall installation"
        ],
        [
            {"label": "Brand", "value": "CP PLUS"},
            {"label": "Model / Series", "value": "CP-VAC-T24L2 Astro Series"},
            {"label": "Resolution", "value": "2.4MP (1920 x 1080 Full HD)"},
            {"label": "Signal System", "value": "AHD / HDCVI / HDTVI / CVBS Switchable"},
            {"label": "IR Distance", "value": "20 Meters Smart Infrared"},
            {"label": "Enclosure Rating", "value": "IP66 Water & Dust Resistant"},
            {"label": "Operating Temp", "value": "-20°C to +60°C"},
            {"label": "Warranty", "value": "2 Years Official Warranty"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-t24l2-1", "label": "Single Camera Unit", "unit": "Piece", "price": 1450, "mrp": 2600, "discountPercent": 44, "stock": 45, "image": v("/images/products/cctv/cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2.webp")},
            {"id": "var-t24l2-4", "label": "Pack of 4 Cameras", "unit": "Pack of 4", "price": 5600, "mrp": 10400, "discountPercent": 46, "stock": 20, "image": v("/images/products/cctv/cp-plus-2-4mp-full-hd-ir-bullet-camera-cp-vac-t24l2.webp")},
        ]
    ),
    make_product(
        "cp-vac-d24l2", "cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2",
        "CP Plus 2.4MP Full HD IR Dome Camera CP-VAC-D24L2", "CP PLUS",
        "cctv-networking", "CCTV & Networking", "Cameras",
        "/images/products/cctv/cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2.webp",
        "Indoor Ceiling Dome Camera · 2.4MP 1080p · Smart Night Vision",
        ["2.4MP Full HD", "Smart IR 20m", "4-in-1 Switchable", "Low Light ICR"],
        "Sleek indoor dome camera tailored for residential lobbies, offices, and retail showrooms. Engineered with a 2.4MP sensor and 3.6mm wide angle lens for complete room coverage. Supports all standard DVR systems with plug-and-play installation.",
        [
            "Crisp 2.4MP 1080p resolution with accurate color reproduction",
            "Smart IR illumination prevents whitewash on close foreground objects",
            "Universal 4-in-1 output compatible with all popular DVR brands",
            "Discreet and compact dome design blends into finished ceilings",
            "Tested for continuous 24/7 non-stop surveillance operation"
        ],
        [
            {"label": "Brand", "value": "CP PLUS"},
            {"label": "Model / Series", "value": "CP-VAC-D24L2 Astro Series"},
            {"label": "Sensor Type", "value": "1/2.7\" 2.4MP HQIS Pro Sensor"},
            {"label": "Focal Length", "value": "3.6mm Wide Angle Lens"},
            {"label": "Night Vision", "value": "20 Meters Infrared Range"},
            {"label": "Power Input", "value": "12V DC ± 10%"},
            {"label": "Mounting", "value": "Ceiling / Wall Surface Mount"},
            {"label": "Warranty", "value": "2 Years Official Warranty"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-d24l2-1", "label": "Single Camera Unit", "unit": "Piece", "price": 1390, "mrp": 2500, "discountPercent": 44, "stock": 50, "image": v("/images/products/cctv/cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2.webp")},
            {"id": "var-d24l2-4", "label": "Pack of 4 Cameras", "unit": "Pack of 4", "price": 5350, "mrp": 10000, "discountPercent": 46, "stock": 25, "image": v("/images/products/cctv/cp-plus-2-4mp-full-hd-ir-dome-camera-cp-vac-d24l2.webp")},
        ]
    ),
])

# ─── 2. CPVC Plumbing & Overhead Tanks ──────────────────────────────────────
PRODUCTS.extend([
    make_product(
        "cpvc-pipe", "ashirvad-cpvc-flowguard-plus-pipe",
        "Ashirvad CPVC Flowguard Plus Pipe, SDR-11, 5m Length", "Ashirvad",
        "cpvc-plumbing-tanks", "CPVC Plumbing & Overhead Tanks", "CPVC Pipes SDR 11",
        "/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp",
        "SDR 11 · 93°C Hot & Cold Water · NSF/ANSI 61 Certified",
        ["SDR-11 Standard", "Hot & Cold 93°C", "Lead-Free", "50-Yr Design Life"],
        "High-performance CPVC plumbing pipe manufactured using Lubrizol FlowGuard Plus compound. Engineered to withstand continuous hot and cold water pressure up to 93°C without scaling or corrosion. 100% lead-free, non-toxic, and NSF 61 certified for safe drinking water.",
        [
            "FlowGuard Plus specialized compound ensures zero microbial bacterial growth",
            "Rated for high working pressure of 28.1 kg/cm² at 23°C and 8.79 kg/cm² at 82°C",
            "100% corrosion proof and chemical resistant against hard borewell water",
            "Low thermal conductivity keeps hot water temperature steady with less energy loss",
            "Lightweight and simple one-step solvent weld installation ensures leak-free joints"
        ],
        [
            {"label": "Brand", "value": "Ashirvad by Aliaxis"},
            {"label": "Material Grade", "value": "CPVC FlowGuard Plus Compound"},
            {"label": "Standard / Class", "value": "IS 15778 / ASTM D2846 (SDR 11)"},
            {"label": "Standard Length", "value": "5.0 Meters (16.4 Feet)"},
            {"label": "Temperature Rating", "value": "Up to 93°C (200°F)"},
            {"label": "Certifications", "value": "NSF/ANSI 61, BIS ISI Marked"},
            {"label": "Expected Life", "value": "50+ Years Service Life"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-cpvc-half", "label": "1/2 Inch (15mm) · 5m Length", "unit": "Piece (5m)", "price": 305, "mrp": 635, "discountPercent": 52, "stock": 100, "image": v("/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp")},
            {"id": "var-cpvc-34", "label": "3/4 Inch (20mm) · 5m Length", "unit": "Piece (5m)", "price": 445, "mrp": 890, "discountPercent": 50, "stock": 100, "image": v("/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp")},
            {"id": "var-cpvc-1in", "label": "1.0 Inch (25mm) · 5m Length", "unit": "Piece (5m)", "price": 680, "mrp": 1280, "discountPercent": 47, "stock": 80, "image": v("/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp")},
            {"id": "var-cpvc-125in", "label": "1.25 Inch (32mm) · 5m Length", "unit": "Piece (5m)", "price": 990, "mrp": 1850, "discountPercent": 46, "stock": 50, "image": v("/images/products/plumbing/ashirvad-cpvc-flowguard-plus-pipe.webp")},
        ]
    ),
    make_product(
        "cpvc-cement", "ashirvad-flowguard-plus-solvent-cement",
        "Ashirvad Flowguard Plus 1 Step CPVC Yellow Medium Solvent Cement", "Ashirvad",
        "cpvc-plumbing-tanks", "CPVC Plumbing & Overhead Tanks", "Solvent Cements & Primers",
        "/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp",
        "Fast 1-Step Chemical Fusion · Zero Leaks · Low VOC",
        ["1-Step Fast Fusion", "Cures in 24 Hrs", "Yellow Medium Viscosity", "Low VOC Formula"],
        "Specially formulated one-step yellow medium-bodied CPVC solvent cement for permanent chemical fusion of pipes and fittings. Eliminates the need for a separate primer on pipes up to 2 inches. Creates a monolithic molecular joint stronger than the pipe itself.",
        [
            "One-step application saves installation labor and eliminates primer step",
            "Yellow marker color provides clear visual verification of complete joint coverage",
            "Fast-acting chemical bond handles test pressure in as little as 15 minutes",
            "Certified safe for hot and cold potable drinking water plumbing lines",
            "Sealed airtight metal tin with convenient built-in dauber applicator"
        ],
        [
            {"label": "Brand", "value": "Ashirvad by Aliaxis"},
            {"label": "Viscosity Grade", "value": "Medium Bodied (Yellow)"},
            {"label": "Applicable Pipe", "value": "CPVC SDR 11 / SDR 13.5 up to 2\""},
            {"label": "Standard", "value": "ASTM F493 & NSF 14/61"},
            {"label": "Cure Time", "value": "Initial Set: 15 mins, Full Cure: 24 hrs"},
            {"label": "Shelf Life", "value": "24 Months from Packaging"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-sol-50ml", "label": "50 ml Tin", "unit": "Tin (50ml)", "price": 90, "mrp": 147, "discountPercent": 39, "stock": 120, "image": v("/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp")},
            {"id": "var-sol-100ml", "label": "100 ml Tin", "unit": "Tin (100ml)", "price": 160, "mrp": 260, "discountPercent": 38, "stock": 100, "image": v("/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp")},
            {"id": "var-sol-250ml", "label": "250 ml Tin with Dauber", "unit": "Tin (250ml)", "price": 340, "mrp": 540, "discountPercent": 37, "stock": 80, "image": v("/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp")},
            {"id": "var-sol-500ml", "label": "500 ml Pro Can with Dauber", "unit": "Tin (500ml)", "price": 620, "mrp": 980, "discountPercent": 37, "stock": 50, "image": v("/images/products/plumbing/ashirvad-flowguard-plus-solvent-cement.webp")},
        ]
    ),
    make_product(
        "metal-clamp", "ashirvad-flowguard-metal-pipe-clamp",
        "Ashirvad Flowguard Plus Metal Pipe Clamp/Strap", "Ashirvad",
        "cpvc-plumbing-tanks", "CPVC Plumbing & Overhead Tanks", "CPVC Elbows, Tees & Couplers",
        "/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp",
        "Powder Coated Metal Strap · Prevents Pipe Sagging · Heavy Gauge",
        ["Heavy Gauge Metal", "Powder Coated", "Prevents Sagging", "Vibration Free"],
        "Durable powder-coated metal pipe saddle clamps designed to securely fix CPVC pipelines to walls and ceilings. Absorbs pipe vibration and prevents pipe sagging during high-pressure water flow. Resistant to rust and indoor humidity.",
        [
            "Heavy-duty stamped steel bracket with protective anti-rust powder coat",
            "Maintains straight pipe alignment and prevents pressure hammer displacement",
            "Smooth rounded edges safeguard outer pipe walls from friction scratches",
            "Pre-drilled screw holes accommodate standard 1.5\" wall plugs and screws",
            "Engineered for both horizontal ceiling runs and vertical wall risers"
        ],
        [
            {"label": "Brand", "value": "Ashirvad by Aliaxis"},
            {"label": "Material", "value": "Heavy Gauge Mild Steel"},
            {"label": "Finish", "value": "Corrosion-Resistant Powder Coating"},
            {"label": "Fixing Type", "value": "Double-Ear Saddle Clamp"},
            {"label": "Application", "value": "Surface Mounted Water Pipelines"},
            {"label": "Packaging", "value": "Loose / Box of 50 Pieces"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-clamp-half", "label": "1/2 Inch (15mm)", "unit": "Piece", "price": 8, "mrp": 14, "discountPercent": 43, "stock": 300, "image": v("/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp")},
            {"id": "var-clamp-34", "label": "3/4 Inch (20mm)", "unit": "Piece", "price": 12, "mrp": 20, "discountPercent": 40, "stock": 300, "image": v("/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp")},
            {"id": "var-clamp-1in", "label": "1.0 Inch (25mm)", "unit": "Piece", "price": 16, "mrp": 26, "discountPercent": 38, "stock": 200, "image": v("/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp")},
            {"id": "var-clamp-125in", "label": "1.25 Inch (32mm)", "unit": "Piece", "price": 22, "mrp": 36, "discountPercent": 39, "stock": 150, "image": v("/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp")},
            {"id": "var-clamp-150in", "label": "1.50 Inch (40mm)", "unit": "Piece", "price": 28, "mrp": 45, "discountPercent": 38, "stock": 100, "image": v("/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp")},
            {"id": "var-clamp-200in", "label": "2.00 Inch (50mm)", "unit": "Piece", "price": 36, "mrp": 58, "discountPercent": 38, "stock": 80, "image": v("/images/products/plumbing/ashirvad-flowguard-metal-pipe-clamp.webp")},
        ]
    ),
    make_product(
        "m-seal", "pidilite-m-seal-phataphat-90g",
        "Pidilite M-Seal Phataphat 90g, Multi-Purpose Waterproof Sealant, Grey", "Pidilite",
        "cpvc-plumbing-tanks", "CPVC Plumbing & Overhead Tanks", "Solvent Cements & Primers",
        "/images/products/plumbing/pidilite-m-seal-phataphat-90g.webp",
        "Fast Setting Epoxy Putty · Seals Leaks in 30 Mins · High Adhesion",
        ["30 Mins Setting", "Waterproof Seal", "Epoxy Putty", "Metal/PVC/Concrete"],
        "Two-part multi-purpose epoxy putty that seals leaks, repairs cracks, and fills joint gaps in plumbing, sanitation, and overhead tanks. Sets rock-hard in 30 minutes even on damp surfaces. Can be drilled, filed, tapped, and painted after curing.",
        [
            "Sets in 30 minutes for quick, dependable emergency leak fixes",
            "Bonds tenaciously to metal, PVC, CPVC, ceramic, stone, and concrete",
            "100% waterproof and moisture resistant once hardened",
            "Resistant to hot water, mild acids, alkalis, and household chemicals",
            "Convenient 90g pack with resin and hardener bars for easy kneading"
        ],
        [
            {"label": "Brand", "value": "Pidilite Industries"},
            {"label": "Type", "value": "2-Component Fast Curing Epoxy Putty"},
            {"label": "Net Weight", "value": "90 Grams (Resin + Hardener)"},
            {"label": "Color", "value": "Industrial Grey"},
            {"label": "Setting Time", "value": "Initial Set: 30 Mins, Full Cure: 3 Hours"},
            {"label": "Shelf Life", "value": "12 Months from Manufacturing"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-mseal-90g", "label": "90g Single Pack", "unit": "Pack (90g)", "price": 30, "mrp": 35, "discountPercent": 14, "stock": 250, "image": v("/images/products/plumbing/pidilite-m-seal-phataphat-90g.webp")},
        ]
    ),
    make_product(
        "water-tank", "ashirvad-3-layer-water-tank",
        "Ashirvad 3-Layer Anti-Bacterial Overhead Water Tank", "Ashirvad",
        "cpvc-plumbing-tanks", "CPVC Plumbing & Overhead Tanks", "Overhead Water Tanks",
        "/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp",
        "100% Virgin Food-Grade HDPE · UV Protected · Anti-Bacterial Inner Layer",
        ["3-Layer Construction", "Food-Grade Virgin HDPE", "UV Stabilized", "Anti-Algal"],
        "Triple-layer rotational molded overhead water storage tank made with 100% food-grade virgin raw material. Features an outer UV reflective shield, a middle foam insulation layer to maintain cooler water temperatures, and a white anti-bacterial inner lining that prevents algae formation.",
        [
            "Food-grade 100% virgin polymer ensures odorless, hygienic drinking water",
            "UV stabilized outer layer shields against intense tropical sunlight and degradation",
            "Thermal insulation layer keeps tank water noticeably cooler in peak summer",
            "Smooth seamless inner layer inhibits algae growth and cleans effortlessly",
            "Heavy threaded screw lid keeps airborne dust, insects, and rain out"
        ],
        [
            {"label": "Brand", "value": "Ashirvad by Aliaxis"},
            {"label": "Layer Tech", "value": "Triple-Layer Rotomolded Polyethylene"},
            {"label": "Raw Material", "value": "100% Virgin Food Grade LLDPE"},
            {"label": "UV Stabilization", "value": "UV-20 Standard Outdoor Resistance"},
            {"label": "Warranty", "value": "10 Years Replacement Guarantee"},
            {"label": "Lid Type", "value": "Heavy-Duty Threaded Air-Tight Lid"},
            {"label": "Delivery Time", "value": "Same Day Truck Delivery (60-90 Mins)"}
        ],
        [
            {"id": "var-tank-500", "label": "500 Litres (Compact)", "unit": "Tank", "price": 3450, "mrp": 4600, "discountPercent": 25, "stock": 20, "image": v("/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp")},
            {"id": "var-tank-1000", "label": "1000 Litres (Standard Home)", "unit": "Tank", "price": 5850, "mrp": 7800, "discountPercent": 25, "stock": 18, "image": v("/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp")},
            {"id": "var-tank-2000", "label": "2000 Litres (Large Residential)", "unit": "Tank", "price": 11500, "mrp": 15500, "discountPercent": 26, "stock": 10, "image": v("/images/products/plumbing/ashirvad-3-layer-tank-1000l.webp")},
        ]
    ),
    make_product(
        "cpvc-elbow", "ashirvad-cpvc-elbow-half-inch",
        "Ashirvad CPVC 90 Degree Elbow SDR-11", "Ashirvad",
        "cpvc-plumbing-tanks", "CPVC Plumbing & Overhead Tanks", "CPVC Elbows, Tees & Couplers",
        "/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp",
        "Precision Molded 90° Elbow · SDR 11 Class · Leak Proof Fusion",
        ["90° Angle Turn", "SDR-11 Rated", "Zero Flow Resistance", "Heavy Wall"],
        "Precision injection molded 90-degree CPVC elbow for sharp, reliable direction changes in hot and cold water plumbing lines. Engineered with smooth internal radii to minimize friction loss and prevent pressure drop across turns.",
        [
            "High dimensional accuracy provides snug interference fit with CPVC pipes",
            "Smooth hydraulic internal bore minimizes water turbulence and noise",
            "Withstands repeated thermal shock up to 93°C without softening",
            "Chemical fusion bond eliminates mechanical joints and future leaks",
            "Meets all ASTM D2846 and BIS IS 15778 plumbing standards"
        ],
        [
            {"label": "Brand", "value": "Ashirvad by Aliaxis"},
            {"label": "Fitting Type", "value": "90° Socket Weld Elbow"},
            {"label": "Standard", "value": "ASTM D2846 (SDR 11)"},
            {"label": "Material", "value": "Chlorinated Polyvinyl Chloride (CPVC)"},
            {"label": "Working Temp", "value": "Continuous 82°C / Peak 93°C"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-elb-half", "label": "1/2 Inch (15mm)", "unit": "Piece", "price": 18, "mrp": 28, "discountPercent": 36, "stock": 250, "image": v("/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp")},
            {"id": "var-elb-34", "label": "3/4 Inch (20mm)", "unit": "Piece", "price": 26, "mrp": 42, "discountPercent": 38, "stock": 250, "image": v("/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp")},
            {"id": "var-elb-1in", "label": "1.0 Inch (25mm)", "unit": "Piece", "price": 42, "mrp": 68, "discountPercent": 38, "stock": 180, "image": v("/images/products/plumbing/ashirvad-cpvc-elbow-half-inch.webp")},
        ]
    ),
])

print(f"Total products so far: {len(PRODUCTS)}")
