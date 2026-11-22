import os
import json
import sys

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

from scripts.generate_all_products_catalog import CATEGORIES, PRODUCTS, make_product

# ─── 4. Plywood & Boards ───────────────────────────────────────────────────
PRODUCTS.extend([
    make_product(
        "century-marine", "centuryply-club-prime-bwp-marine",
        "CenturyPly Club Prime BWP Marine Grade Waterproof Plywood (8x4 ft)", "CenturyPly",
        "plywood-boards", "Plywood & Boards", "BWP Marine 710 Plywood",
        "/images/products/wood/centuryply-marine-ply-19mm.webp",
        "IS 710 BWP Marine · 30-Year Warranty · Boiling Water Proof",
        ["IS 710 BWP", "Calibrated Core", "Termite Borer Proof", "30-Yr Warranty"],
        "CenturyPly Club Prime is an authentic IS:710 certified Boiling Waterproof (BWP) marine plywood. Built with high-density hardwood core veneers and bonded under intense hydraulic pressure with synthetic phenol formaldehyde resin. Guaranteed 100% borer and termite proof for kitchens and bathrooms.",
        [
            "Boiling Water Proof (BWP) passes 72 hours continuous boiling test without delamination",
            "Pre-pressed quadruple-layer calibration gives uniform sheet thickness (zero waviness)",
            "GLP (Glue Line Protection) technology ensures total immunity against subterranean termites",
            "Selected hardwood timber veneers yield high nail and screw holding strength",
            "Backed by CenturyPly's landmark 30-year manufacturer replacement warranty"
        ],
        [
            {"label": "Brand", "value": "CenturyPly Limited"},
            {"label": "Grade / Standard", "value": "IS 710 Marine BWP Grade"},
            {"label": "Dimensions", "value": "8 Feet x 4 Feet (2440 x 1220 mm)"},
            {"label": "Timber Core", "value": "100% Selected Hardwood Species"},
            {"label": "Bonding Resin", "value": "Phenol Formaldehyde Synthetic Resin"},
            {"label": "Borer / Termite", "value": "Chemically Treated (Termite & Borer Proof)"},
            {"label": "Warranty", "value": "30 Years Official Warranty"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-ply-6mm", "label": "6 mm Sheet (8x4 ft)", "unit": "Sheet", "price": 1450, "mrp": 1850, "discountPercent": 22, "stock": 50, "image": v("/images/products/wood/centuryply-marine-ply-19mm.webp")},
            {"id": "var-ply-12mm", "label": "12 mm Sheet (8x4 ft)", "unit": "Sheet", "price": 2150, "mrp": 2750, "discountPercent": 22, "stock": 60, "image": v("/images/products/wood/centuryply-marine-ply-19mm.webp")},
            {"id": "var-ply-16mm", "label": "16 mm Sheet (8x4 ft)", "unit": "Sheet", "price": 2550, "mrp": 3250, "discountPercent": 22, "stock": 45, "image": v("/images/products/wood/centuryply-marine-ply-19mm.webp")},
            {"id": "var-ply-19mm", "label": "19 mm Heavy Sheet (8x4 ft)", "unit": "Sheet", "price": 2850, "mrp": 3600, "discountPercent": 21, "stock": 70, "image": v("/images/products/wood/centuryply-marine-ply-19mm.webp")},
        ]
    ),
    make_product(
        "tesa-hdhmr", "action-tesa-hdhmr-board",
        "Action TESA High Density High Moisture Resistance (HDHMR) Board (8x4 ft)", "Action TESA",
        "plywood-boards", "Plywood & Boards", "Action TESA HDHMR",
        "/images/products/wood/action-tesa-hdhmr-18mm.webp",
        "High Density 850+ kg/m³ · Extreme Moisture Resistance · Perfectly Flat",
        ["Density > 850 kg/m³", "Water Resistant", "Zero Chipping", "CNC Routing Ready"],
        "Action TESA HDHMR is an ultra-dense engineered wood panel designed to outperform traditional plywood in modular kitchens and wardrobes. Manufactured with hardwood fibers and advanced moisture-resistant resins for an ultra-smooth finish ready for high-gloss PU paint and CNC routing.",
        [
            "High density exceeding 850 kg/m³ provides superior core screw holding capability",
            "Moisture resistance prevents swelling and edge expansion in humid kitchen areas",
            "Homogeneous core allows intricate 3D CNC routing and sharp profiling without chipping",
            "Mirror-flat surface saves sanding labor and provides flawless laminate and acrylic bonding",
            "Borer and termite resistant with uniform density throughout the panel"
        ],
        [
            {"label": "Brand", "value": "Action TESA (Balaji Action Buildwell)"},
            {"label": "Board Type", "value": "HDHMR (High Density High Moisture Resistance)"},
            {"label": "Standard Dimensions", "value": "8 Feet x 4 Feet (2440 x 1220 mm)"},
            {"label": "Density", "value": "850 - 900 kg/m³"},
            {"label": "Internal Bond Strength", "value": "0.90 N/mm²"},
            {"label": "Screw Withdrawal (Face)", "value": "> 2200 N"},
            {"label": "Eco-Standard", "value": "E1 / Carb Phase II Certified"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-hdhmr-12mm", "label": "12 mm (8x4 ft)", "unit": "Sheet", "price": 1850, "mrp": 2350, "discountPercent": 21, "stock": 40, "image": v("/images/products/wood/action-tesa-hdhmr-18mm.webp")},
            {"id": "var-hdhmr-16mm", "label": "16.75 mm (8x4 ft)", "unit": "Sheet", "price": 2250, "mrp": 2850, "discountPercent": 21, "stock": 40, "image": v("/images/products/wood/action-tesa-hdhmr-18mm.webp")},
            {"id": "var-hdhmr-18mm", "label": "18 mm Standard (8x4 ft)", "unit": "Sheet", "price": 2450, "mrp": 3100, "discountPercent": 21, "stock": 55, "image": v("/images/products/wood/action-tesa-hdhmr-18mm.webp")},
        ]
    ),
    make_product(
        "green-mr", "greenply-ecotec-mr-303-plywood",
        "Greenply Ecotec Commercial MR Moisture Resistant Plywood (8x4 ft)", "Greenply",
        "plywood-boards", "Plywood & Boards", "Commercial MR Plywood",
        "/images/products/wood/greenply-ecotec-mr-303-plywood.webp",
        "IS 303 MR Grade · Calibrated Surface · Bedroom & Living Furniture",
        ["IS 303 MR Grade", "Commercial Plywood", "Borer Proof", "Calibrated Core"],
        "Greenply Ecotec is an authentic IS:303 Moisture Resistant (MR) grade commercial plywood engineered for bedroom wardrobes, living room credenzas, and wall paneling. Built with selected hardwood veneers bonded with melamine-fortified urea formaldehyde resin.",
        [
            "IS:303 certified moisture resistant grade suitable for all dry interior furniture",
            "Special chemical preservation treatment protects veneers against wood borers",
            "Uniform core assembly eliminates internal gaps and hollow overlapping pockets",
            "Smooth machine-sanded exterior facilitates clean manual or press laminate gluing",
            "Reliable brand guarantee from Greenply with batch barcode tracking"
        ],
        [
            {"label": "Brand", "value": "Greenply Industries Limited"},
            {"label": "Grade / Standard", "value": "IS 303 Commercial MR Grade"},
            {"label": "Dimensions", "value": "8 Feet x 4 Feet (2440 x 1220 mm)"},
            {"label": "Core Material", "value": "Seasoned Hardwood Veneers"},
            {"label": "Resin", "value": "Melamine Urea Formaldehyde (MUF)"},
            {"label": "Resistance", "value": "Moisture & Borer Resistant"},
            {"label": "Warranty", "value": "10 Years Official Warranty"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-mr-6mm", "label": "6 mm (8x4 ft)", "unit": "Sheet", "price": 980, "mrp": 1250, "discountPercent": 22, "stock": 45, "image": v("/images/products/wood/greenply-ecotec-mr-303-plywood.webp")},
            {"id": "var-mr-9mm", "label": "9 mm (8x4 ft)", "unit": "Sheet", "price": 1320, "mrp": 1680, "discountPercent": 21, "stock": 40, "image": v("/images/products/wood/greenply-ecotec-mr-303-plywood.webp")},
            {"id": "var-mr-12mm", "label": "12 mm (8x4 ft)", "unit": "Sheet", "price": 1550, "mrp": 1980, "discountPercent": 22, "stock": 50, "image": v("/images/products/wood/greenply-ecotec-mr-303-plywood.webp")},
            {"id": "var-mr-18mm", "label": "18 mm (8x4 ft)", "unit": "Sheet", "price": 1850, "mrp": 2350, "discountPercent": 21, "stock": 60, "image": v("/images/products/wood/greenply-ecotec-mr-303-plywood.webp")},
        ]
    ),
    make_product(
        "tesa-hdf", "action-tesa-hdf-board",
        "Action TESA Premium High Density Fiberboard HDF Board (8x4 ft)", "Action TESA",
        "plywood-boards", "Plywood & Boards", "Boilo Water Resistant Boards",
        "/images/products/wood/action-tesa-hdf-6mm-8-4.webp",
        "High Density Fiberboard · Ultra-Smooth Face · Ideal for Back Panels & Partitions",
        ["Density > 900 kg/m³", "Ultra Smooth", "Uniform Thickness", "Paint Ready"],
        "Precision-engineered High Density Fiberboard (HDF) with a rock-solid density over 900 kg/m³. Ideal for wardrobe backings, drawer bottoms, speaker enclosures, and decorative door skins. Delivers an ultra-smooth surface for direct spray painting.",
        [
            "High density over 900 kg/m³ ensures high tensile strength and puncture resistance",
            "Perfect calibrated thickness eliminates wobbling in thin drawer bases and back panels",
            "Silk-smooth surface requires zero sanding prior to primer and lacquer coating",
            "100% knot-free and void-free homogeneous wood fiber composition",
            "Termite and borer treated for extended durability inside wardrobes"
        ],
        [
            {"label": "Brand", "value": "Action TESA"},
            {"label": "Type", "value": "High Density Fiberboard (HDF)"},
            {"label": "Sheet Dimensions", "value": "8 Feet x 4 Feet (2440 x 1220 mm)"},
            {"label": "Density", "value": "900 - 950 kg/m³"},
            {"label": "Moisture Content", "value": "5 - 8%"},
            {"label": "Application", "value": "Wardrobe Backing, Drawer Bottoms & Skins"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-hdf-3mm", "label": "3 mm Backing (8x4 ft)", "unit": "Sheet", "price": 750, "mrp": 980, "discountPercent": 23, "stock": 60, "image": v("/images/products/wood/action-tesa-hdf-6mm-8-4.webp")},
            {"id": "var-hdf-55mm", "label": "5.5 mm Sturdy (8x4 ft)", "unit": "Sheet", "price": 1150, "mrp": 1550, "discountPercent": 26, "stock": 50, "image": v("/images/products/wood/action-tesa-hdf-6mm-8-4.webp")},
            {"id": "var-hdf-8mm", "label": "8 mm Solid (8x4 ft)", "unit": "Sheet", "price": 1480, "mrp": 1950, "discountPercent": 24, "stock": 40, "image": v("/images/products/wood/action-tesa-hdf-6mm-8-4.webp")},
        ]
    ),
    make_product(
        "century-bb", "century-block-board-19mm",
        "CenturyPine Pine-Wood Core Heavy Blockboard 19mm (8x4 ft)", "CenturyPly",
        "plywood-boards", "Plywood & Boards", "Blockboards & Flush Doors",
        "/images/products/wood/century-block-board-19mm-8-4.webp",
        "Solid Pine Wood Battens · Zero Bending / Warping · Heavy Wardrobe Shutters",
        ["Seasoned Pine Battens", "Zero Sagging", "IS 1659 Certified", "Screw Holding"],
        "CenturyPine heavy blockboard constructed with seasoned, chemically treated New Zealand pine battens sandwiched between selected hardwood face veneers. Does not bend, warp, or sag over long spans, making it the premier choice for tall wardrobe shutter doors.",
        [
            "High-temperature vacuum pressure seasoned pine wood battens ensure zero warp",
            "High modulus of rupture resists sagging under heavy wardrobe door loads",
            "Edge-to-edge batten joinery provides rock-solid screw bite for hinges and locks",
            "IS 1659 compliant blockboard with superior flat dimensional stability",
            "Dual-side calibrated hardwood veneers for smooth laminate pressing"
        ],
        [
            {"label": "Brand", "value": "CenturyPly Limited"},
            {"label": "Core Material", "value": "100% Seasoned Pine Wood Battens"},
            {"label": "Dimensions", "value": "8 Feet x 4 Feet (2440 x 1220 mm)"},
            {"label": "Thickness", "value": "19 mm Heavy Grade"},
            {"label": "Standard", "value": "IS 1659 Certified"},
            {"label": "Warranty", "value": "15 Years Brand Warranty"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-bb-mr", "label": "19mm Commercial MR (8x4 ft)", "unit": "Sheet", "price": 2750, "mrp": 3450, "discountPercent": 20, "stock": 40, "image": v("/images/products/wood/century-block-board-19mm-8-4.webp")},
            {"id": "var-bb-bwp", "label": "19mm BWP Waterproof (8x4 ft)", "unit": "Sheet", "price": 3250, "mrp": 4100, "discountPercent": 21, "stock": 35, "image": v("/images/products/wood/century-block-board-19mm-8-4.webp")},
        ]
    ),
    make_product(
        "century-flush", "century-flush-door-bwp",
        "CenturyPly Club Prime BWP Waterproof Flush Door (7x3 ft, 32mm)", "CenturyPly",
        "plywood-boards", "Plywood & Boards", "Blockboards & Flush Doors",
        "/images/products/wood/century-flush-door-7-3-ft-bwp.webp",
        "Solid Hardwood Core · 100% BWP Waterproof · Calibrated Double Skin",
        ["Solid Core Flush Door", "BWP Waterproof", "IS 2202 Certified", "25-Yr Warranty"],
        "Heavy-duty solid core flush door engineered with kiln-seasoned hardwood internal rails and stiles. Hot-pressed with high-pressure phenol formaldehyde resin to meet IS:2202 BWP specifications. Provides sound isolation, thermal stability, and lasting elegance.",
        [
            "Solid block core eliminates hollow knocking sound and dampens room noise",
            "100% Boiling Water Proof (BWP) resin bonding withstands bathroom moisture",
            "Precision square-cut edges and double-face calibration ready for veneer or paint",
            "Reinforced lock rails on both vertical edges for flexible lock mortising",
            "Backed by 25 years warranty against warping and core delamination"
        ],
        [
            {"label": "Brand", "value": "CenturyPly Limited"},
            {"label": "Product", "value": "Club Prime BWP Flush Door"},
            {"label": "Standard Dimensions", "value": "7 Feet x 3 Feet (2100 x 900 mm)"},
            {"label": "Thickness", "value": "32 mm Heavy Thickness"},
            {"label": "Standard", "value": "IS 2202 (Part 1) Certified"},
            {"label": "Timber", "value": "Kiln Seasoned Solid Hardwood"},
            {"label": "Warranty", "value": "25 Years Replacement Guarantee"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-door-30mm", "label": "30mm Standard (7x3 ft)", "unit": "Door", "price": 3800, "mrp": 4900, "discountPercent": 22, "stock": 25, "image": v("/images/products/wood/century-flush-door-7-3-ft-bwp.webp")},
            {"id": "var-door-32mm", "label": "32mm Heavy Duty (7x3 ft)", "unit": "Door", "price": 4200, "mrp": 5400, "discountPercent": 22, "stock": 30, "image": v("/images/products/wood/century-flush-door-7-3-ft-bwp.webp")},
            {"id": "var-door-35mm", "label": "35mm Premium Acoustic (7x3 ft)", "unit": "Door", "price": 4750, "mrp": 6100, "discountPercent": 22, "stock": 20, "image": v("/images/products/wood/century-flush-door-7-3-ft-bwp.webp")},
        ]
    ),
])

# ─── 5. Fevicol, Adhesives & Sealants ────────────────────────────────────────
PRODUCTS.extend([
    make_product(
        "fev-sh", "fevicol-sh-synthetic-resin-adhesive",
        "Fevicol SH Synthetic Resin D3 Wood Adhesive", "Fevicol",
        "fevicol-adhesives-sealants", "Fevicol, Adhesives & Sealants", "Fevicol SH Synthetic Resin",
        "/images/products/adhesives/fevicol-sh-50kg-drum.webp",
        "India's #1 Wood Adhesive · Unbeatable Bond Strength · Fast Curing",
        ["D3 Water Resistant", "Superior Grip", "Zero Bubble Risk", "Trusted Since 1959"],
        "Fevicol SH is India's most trusted synthetic resin adhesive for carpentry, wood joinery, and decorative laminate pressing. Formulated with high-solids PVAc resin to deliver unbreakable bonds between wood, plywood, MDF, and laminates.",
        [
            "High solid content delivers exceptional tensile and shear bonding strength",
            "Forms invisible, transparent glue lines that do not discolor fine veneers",
            "Excellent spreadability allows masons to coat large laminates quickly and evenly",
            "Resists ambient humidity and prevents edge-delamination over decades",
            "Non-toxic, low odor, and safe for indoor carpenter handling"
        ],
        [
            {"label": "Brand", "value": "Pidilite Industries (Fevicol)"},
            {"label": "Adhesive Type", "value": "Polyvinyl Acetate (PVAc) Emulsion"},
            {"label": "Bond Strength", "value": "> 280 kg/cm² on Hardwood"},
            {"label": "Setting Time", "value": "Handling: 2-3 Hrs, Full Bond: 24 Hrs"},
            {"label": "Coverage", "value": "45 - 50 sq.ft per kg on plywood"},
            {"label": "Shelf Life", "value": "12 Months from Packaging"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-sh-1kg", "label": "1 kg Tub", "unit": "Tub", "price": 285, "mrp": 330, "discountPercent": 14, "stock": 100, "image": v("/images/products/adhesives/fevicol-sh-50kg-drum.webp")},
            {"id": "var-sh-2kg", "label": "2 kg Tub", "unit": "Tub", "price": 540, "mrp": 630, "discountPercent": 14, "stock": 80, "image": v("/images/products/adhesives/fevicol-sh-50kg-drum.webp")},
            {"id": "var-sh-5kg", "label": "5 kg Bucket", "unit": "Bucket", "price": 1280, "mrp": 1500, "discountPercent": 15, "stock": 60, "image": v("/images/products/adhesives/fevicol-sh-50kg-drum.webp")},
            {"id": "var-sh-10kg", "label": "10 kg Bucket", "unit": "Bucket", "price": 2450, "mrp": 2900, "discountPercent": 16, "stock": 40, "image": v("/images/products/adhesives/fevicol-sh-50kg-drum.webp")},
            {"id": "var-sh-50kg", "label": "50 kg Pro Drum", "unit": "50kg Drum", "price": 10500, "mrp": 12600, "discountPercent": 17, "stock": 25, "image": v("/images/products/adhesives/fevicol-sh-50kg-drum.webp")},
        ]
    ),
    make_product(
        "fev-marine", "fevicol-marine-waterproof-adhesive",
        "Fevicol Marine Waterproof Wood Adhesive", "Fevicol",
        "fevicol-adhesives-sealants", "Fevicol, Adhesives & Sealants", "Fevicol Marine Waterproof",
        "/images/products/adhesives/fevicol-marine-5kg.webp",
        "Specialized Waterproof Adhesive · 48-Hour Water Immersion Resistance",
        ["Waterproof Polymer", "Kitchen & Bath Tested", "Boiling Proof", "No Delamination"],
        "Fevicol Marine is specially formulated with synthetic waterproof cross-linking polymers for areas exposed to water, steam, and dampness. Ideal for modular kitchen cabinets, bathroom vanities, and coastal furniture.",
        [
            "Withstands 48 hours continuous cold water soaking without losing adhesion",
            "Withstands 1 hour boiling water immersion test with zero edge peeling",
            "Prevents fungal staining and mildew growth along glue joints in damp rooms",
            "Forms tough elastomeric joints that absorb wood expansion and contraction",
            "Recommended for bonding mica and laminates on BWP marine plywood"
        ],
        [
            {"label": "Brand", "value": "Pidilite Industries (Fevicol)"},
            {"label": "Classification", "value": "Waterproof Cross-Linking Synthetic Resin"},
            {"label": "Water Resistance", "value": "Exceeds IS 4835 Standard"},
            {"label": "Clamping Time", "value": "Minimum 4 - 6 Hours"},
            {"label": "Full Cure", "value": "24 Hours"},
            {"label": "Shelf Life", "value": "12 Months in Cool Storage"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-mar-1kg", "label": "1 kg Pack", "unit": "Pack", "price": 340, "mrp": 395, "discountPercent": 14, "stock": 90, "image": v("/images/products/adhesives/fevicol-marine-5kg.webp")},
            {"id": "var-mar-5kg", "label": "5 kg Bucket", "unit": "Bucket", "price": 1550, "mrp": 1820, "discountPercent": 15, "stock": 50, "image": v("/images/products/adhesives/fevicol-marine-5kg.webp")},
            {"id": "var-mar-10kg", "label": "10 kg Bucket", "unit": "Bucket", "price": 2950, "mrp": 3500, "discountPercent": 16, "stock": 35, "image": v("/images/products/adhesives/fevicol-marine-5kg.webp")},
            {"id": "var-mar-20kg", "label": "20 kg Bucket", "unit": "Bucket", "price": 5650, "mrp": 6750, "discountPercent": 16, "stock": 25, "image": v("/images/products/adhesives/fevicol-marine-5kg.webp")},
        ]
    ),
    make_product(
        "fev-heatx", "fevicol-heatx-fast-heatproof-adhesive",
        "Fevicol HeatX Fast Grabbing Heat Proof Adhesive", "Fevicol",
        "fevicol-adhesives-sealants", "Fevicol, Adhesives & Sealants", "Fevicol HeatX Fast Heat Proof",
        "/images/products/adhesives/fevicol-heatx-1kg.webp",
        "Heat Proof up to 170°C · Fast Grabbing · No Clamping Needed",
        ["Heat Proof 170°C", "No Clamping Required", "Instant Grab", "Kitchen Chimney Area"],
        "Fevicol HeatX is an advanced synthetic rubber contact adhesive engineered to withstand extreme heat up to 170°C. Ideal for fixing laminates around kitchen gas stoves, microwave recesses, dining tables, and curved surfaces without clamps.",
        [
            "Heat resistance up to 170°C prevents bubbling and peeling near cooktops",
            "Instant tack and grab eliminates the need for heavy masking tape or C-clamps",
            "Fast 10-15 minute flash-off time dramatically reduces project turnaround time",
            "High initial bond strength holds bent laminates securely around sharp curves",
            "Resists thermal cycling between cold AC air and cooking steam"
        ],
        [
            {"label": "Brand", "value": "Pidilite Industries (Fevicol)"},
            {"label": "Base Polymer", "value": "Synthetic Polychloroprene Rubber"},
            {"label": "Heat Resistance", "value": "Continuous up to 170°C"},
            {"label": "Drying Time", "value": "10 - 15 Minutes Flash Off"},
            {"label": "Coverage", "value": "35 - 40 sq.ft per Litre (Both Surfaces)"},
            {"label": "Application", "value": "Dining Tops, Stove Surrounds, Vertical Facings"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-heatx-500g", "label": "500 g Can", "unit": "Can", "price": 265, "mrp": 310, "discountPercent": 15, "stock": 80, "image": v("/images/products/adhesives/fevicol-heatx-1kg.webp")},
            {"id": "var-heatx-1l", "label": "1 Litre Can", "unit": "Can", "price": 490, "mrp": 580, "discountPercent": 16, "stock": 70, "image": v("/images/products/adhesives/fevicol-heatx-1kg.webp")},
            {"id": "var-heatx-2l", "label": "2 Litres Can", "unit": "Can", "price": 920, "mrp": 1100, "discountPercent": 16, "stock": 45, "image": v("/images/products/adhesives/fevicol-heatx-1kg.webp")},
            {"id": "var-heatx-5l", "label": "5 Litres Pro Can", "unit": "Can", "price": 2150, "mrp": 2580, "discountPercent": 17, "stock": 30, "image": v("/images/products/adhesives/fevicol-heatx-1kg.webp")},
        ]
    ),
    make_product(
        "araldite-std", "araldite-standard-epoxy-adhesive",
        "Araldite Standard Heavy Duty Epoxy Adhesive", "Araldite",
        "fevicol-adhesives-sealants", "Fevicol, Adhesives & Sealants", "M-Seal & Epoxy Compounds",
        "/images/products/adhesives/araldite-standard-90g.webp",
        "High-Strength 2-Part Epoxy · Bonds Metal, Glass, Stone, Ceramic",
        ["Heavy Duty Epoxy", "High Tensile Strength", "Chemical Resistant", "Rock Solid"],
        "Araldite Standard is the benchmark two-component epoxy adhesive known for extreme mechanical strength and long-term durability. Bonds dissimilar materials including metal, marble, granite, ceramic, glass, and rigid plastics.",
        [
            "High tensile shear strength exceeding 150 kg/cm² for load-bearing joints",
            "Slow curing allows generous time for precise component alignment and clamping",
            "100% waterproof and resistant to grease, oil, solvents, and temperature extremes",
            "Does not shrink or deform upon hardening, leaving a stable structural weld",
            "Ideal for repairing broken marble tops, metal brackets, and ceramic fixtures"
        ],
        [
            {"label": "Brand", "value": "Araldite (Huntsman / Pidilite)"},
            {"label": "Chemistry", "value": "Two-Part Bisphenol-A Epoxy + Polyamide"},
            {"label": "Color", "value": "Light Amber Transparent"},
            {"label": "Pot Life", "value": "90 Minutes at 25°C"},
            {"label": "Full Cure", "value": "14 - 18 Hours"},
            {"label": "Standard", "value": "ISO 9001 Certified Quality"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-aral-36g", "label": "36g Small Pack", "unit": "Pack", "price": 110, "mrp": 130, "discountPercent": 15, "stock": 100, "image": v("/images/products/adhesives/araldite-standard-90g.webp")},
            {"id": "var-aral-90g", "label": "90g Standard Pack", "unit": "Pack", "price": 195, "mrp": 230, "discountPercent": 15, "stock": 120, "image": v("/images/products/adhesives/araldite-standard-90g.webp")},
            {"id": "var-aral-180g", "label": "180g Workshop Pack", "unit": "Pack", "price": 360, "mrp": 425, "discountPercent": 15, "stock": 60, "image": v("/images/products/adhesives/araldite-standard-90g.webp")},
        ]
    ),
    make_product(
        "araldite-rapid", "araldite-rapid-high-speed-epoxy",
        "Araldite Rapid 5-Minute High Strength Epoxy Adhesive", "Araldite",
        "fevicol-adhesives-sealants", "Fevicol, Adhesives & Sealants", "M-Seal & Epoxy Compounds",
        "/images/products/adhesives/araldite-rapid-36ml.webp",
        "Sets in 5 Minutes · Fast Emergency Fixes · Clear Epoxy Gel",
        ["Sets in 5 Mins", "Clear Transparent", "High Shear Grip", "Fast Repair"],
        "Araldite Rapid is a fast-setting 5-minute two-part epoxy adhesive designed for quick repairs where long clamping is impossible. Reaches handling strength in just 15 minutes, bonding glass, stone, metal, and ceramics with crystal clarity.",
        [
            "Sets rock-hard in 5 minutes for rapid on-site carpentry and plumbing fixes",
            "Clear transparent glue line matches glass, acrylic, and light-colored stones",
            "Equal 1:1 mixing ratio between resin and hardener for foolproof blending",
            "Resists water, household detergents, and ambient humidity",
            "Packaged in dual squeeze tubes for precise pinpoint dispensing"
        ],
        [
            {"label": "Brand", "value": "Araldite"},
            {"label": "Type", "value": "Fast-Setting 2-Part Epoxy"},
            {"label": "Set Time", "value": "Initial Set: 5 Mins, Full Handling: 15 Mins"},
            {"label": "Appearance", "value": "Clear Colorless Gel"},
            {"label": "Shear Strength", "value": "> 100 kg/cm²"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-rap-18g", "label": "18g Pocket Tube", "unit": "Pack", "price": 85, "mrp": 105, "discountPercent": 19, "stock": 90, "image": v("/images/products/adhesives/araldite-rapid-36ml.webp")},
            {"id": "var-rap-36ml", "label": "36ml Standard Pack", "unit": "Pack", "price": 140, "mrp": 165, "discountPercent": 15, "stock": 80, "image": v("/images/products/adhesives/araldite-rapid-36ml.webp")},
            {"id": "var-rap-90g", "label": "90g Workshop Pack", "unit": "Pack", "price": 260, "mrp": 310, "discountPercent": 16, "stock": 50, "image": v("/images/products/adhesives/araldite-rapid-36ml.webp")},
        ]
    ),
    make_product(
        "drf-lw-adh", "dr-fixit-lw-plus-integral-waterproofing",
        "Dr. Fixit 101 LW+ Integral Liquid Waterproofing Compound", "Dr. Fixit",
        "fevicol-adhesives-sealants", "Fevicol, Adhesives & Sealants", "Silicone Sealants & Acrylic",
        "/images/products/adhesives/dr-fixit-lw-plus-5l.webp",
        "Integral Waterproofing for Cement & Concrete · Improves Workability",
        ["Integral Liquid", "Corrosion Inhibitor", "IS 2645 Certified", "Zero Voids"],
        "Dr. Fixit 101 LW+ is a specially formulated integral liquid waterproofing compound composed of surface-active plasticizing agents and active waterproofing polymers. Added to concrete and mortar during mixing to eliminate capillary pores and safeguard rebars from corrosion.",
        [
            "Significantly reduces water permeability in concrete and brick-joint mortar",
            "Improves slump workability of fresh cement mortar without adding excess water",
            "Prevents segregation and bleeding in heavy concrete casting",
            "Passes IS 2645 integral waterproofing testing with high durability margins",
            "Economical dosing: only 200ml required per 50kg bag of cement"
        ],
        [
            {"label": "Brand", "value": "Dr. Fixit (Pidilite)"},
            {"label": "Product Code", "value": "101 LW+"},
            {"label": "Standard", "value": "IS 2645:2003 & IS 9103:2000"},
            {"label": "Dosage", "value": "200 ml per 50 kg bag of cement"},
            {"label": "Chloride Content", "value": "Nil (Zero Corrosion Risk)"},
            {"label": "Shelf Life", "value": "24 Months from Manufacturing"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-lw-1l", "label": "1 Litre Bottle", "unit": "Bottle", "price": 175, "mrp": 210, "discountPercent": 17, "stock": 100, "image": v("/images/products/adhesives/dr-fixit-lw-plus-5l.webp")},
            {"id": "var-lw-5l", "label": "5 Litres Can", "unit": "Can", "price": 720, "mrp": 890, "discountPercent": 19, "stock": 70, "image": v("/images/products/adhesives/dr-fixit-lw-plus-5l.webp")},
            {"id": "var-lw-10l", "label": "10 Litres Can", "unit": "Can", "price": 1380, "mrp": 1720, "discountPercent": 20, "stock": 40, "image": v("/images/products/adhesives/dr-fixit-lw-plus-5l.webp")},
            {"id": "var-lw-20l", "label": "20 Litres Drum", "unit": "Drum", "price": 2600, "mrp": 3250, "discountPercent": 20, "stock": 25, "image": v("/images/products/adhesives/dr-fixit-lw-plus-5l.webp")},
        ]
    ),
])

print(f"Total products through Adhesives: {len(PRODUCTS)}")
