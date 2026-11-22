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

from scripts.generate_complete_catalog import CATEGORIES, PRODUCTS, make_product

# ─── 3. Cement & Civil Works ────────────────────────────────────────────────
PRODUCTS.extend([
    make_product(
        "ultra-wp", "ultratech-weather-plus-cement-50kg",
        "UltraTech Weather Plus Cement 50kg Bag", "UltraTech",
        "cement-civil-works", "Cement & Civil Works", "PPC Waterproofing Cement",
        "/images/products/cement/ultratech-premium-cement-50kg-bag-weather-plus-waterproofing-solid-build.webp",
        "Engineered Water-Repellent Particles · Dense Hydration Matrix",
        ["Water Repellent", "OPC/PPC Blend", "Anti-Efflorescence", "Corrosion Guard"],
        "UltraTech Weather Plus is an advanced engineered water-repellent cement. Formulated with unique micro-particle packing that fills internal concrete voids and prevents capillary water ingress. Ideal for roof slabs, external plastering, basements, and coastal construction.",
        [
            "Unique water-repellent technology shields concrete from dampness and seepage",
            "Significantly reduces efflorescence and salt-blooming on finished plaster",
            "Protects structural TMT steel rebars against chloride-induced rust",
            "Produces high early strength with exceptionally dense concrete compaction",
            "BIS ISI marked with rigorous quality control batch testing"
        ],
        [
            {"label": "Brand", "value": "UltraTech Cement Limited"},
            {"label": "Cement Type", "value": "Engineered Water-Repellent Blend (IS 1489)"},
            {"label": "Pack Size", "value": "50 kg Polypropylene Moisture-Proof Bag"},
            {"label": "Initial Setting Time", "value": "Minimum 30 Minutes"},
            {"label": "Final Setting Time", "value": "Maximum 600 Minutes"},
            {"label": "Key Standard", "value": "IS 1489 Part 1 Certified"},
            {"label": "Shelf Life", "value": "3 Months in Dry Covered Storage"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-wp-1", "label": "1 Bag (50kg)", "unit": "50kg Bag", "price": 420, "mrp": 480, "discountPercent": 13, "stock": 500, "image": v("/images/products/cement/ultratech-premium-cement-50kg-bag-weather-plus-waterproofing-solid-build.webp")},
            {"id": "var-wp-10", "label": "10 Bags Pack", "unit": "10 Bags (500kg)", "price": 4150, "mrp": 4800, "discountPercent": 14, "stock": 50, "image": v("/images/products/cement/ultratech-premium-cement-50kg-bag-weather-plus-waterproofing-solid-build.webp")},
            {"id": "var-wp-50", "label": "50 Bags Wholesale Lot", "unit": "50 Bags (2.5 Tons)", "price": 20500, "mrp": 24000, "discountPercent": 15, "stock": 20, "image": v("/images/products/cement/ultratech-premium-cement-50kg-bag-weather-plus-waterproofing-solid-build.webp")},
        ]
    ),
    make_product(
        "acc-gold", "acc-gold-water-shield-cement-50kg",
        "ACC Gold Water Shield Water Repellent Cement 50kg", "ACC",
        "cement-civil-works", "Cement & Civil Works", "PPC Waterproofing Cement",
        "/images/products/cement/acc-gold-water-shield.webp",
        "Water Shield Formula · Damp Proof · High Compressive Strength",
        ["Water Shield Formula", "Damp Proof", "Dense Matrix", "Tamper Proof Bag"],
        "Premium quality water-repellent cement featuring ACC's specialized water shield formula. Specially developed to resist moisture penetration through roofs, external brick joints, and foundations. Packed in tamper-proof moisture-resistant bags.",
        [
            "Forms an impenetrable water-shield layer inside the concrete structure",
            "Eliminates capillary moisture rising in ground floors and foundation footings",
            "Provides higher 28-day compressive strength exceeding standard IS benchmarks",
            "Silky smooth consistency delivers effortless workability for site masons",
            "Tamper-proof sealed laminated bag prevents atmospheric moisture absorption"
        ],
        [
            {"label": "Brand", "value": "ACC Limited (Adani Group)"},
            {"label": "Product Series", "value": "ACC Gold Water Shield"},
            {"label": "Grade / Standard", "value": "IS 1489 PPC Special Blend"},
            {"label": "Packaging", "value": "50kg Laminated Tamper-Proof Bag"},
            {"label": "Compressive Strength (28D)", "value": "Exceeds 53 MPa"},
            {"label": "Recommended Use", "value": "RCC Roof Slabs, Beams & External Plaster"},
            {"label": "Warranty / Assurance", "value": "100% Factory Fresh Guarantee"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-acc-1", "label": "1 Bag (50kg)", "unit": "50kg Bag", "price": 435, "mrp": 495, "discountPercent": 12, "stock": 400, "image": v("/images/products/cement/acc-gold-water-shield.webp")},
            {"id": "var-acc-25", "label": "25 Bags Half Pallet", "unit": "25 Bags (1.25 Tons)", "price": 10750, "mrp": 12375, "discountPercent": 13, "stock": 30, "image": v("/images/products/cement/acc-gold-water-shield.webp")},
            {"id": "var-acc-50", "label": "50 Bags Full Pallet", "unit": "50 Bags (2.5 Tons)", "price": 21250, "mrp": 24750, "discountPercent": 14, "stock": 15, "image": v("/images/products/cement/acc-gold-water-shield.webp")},
        ]
    ),
    make_product(
        "red-bricks", "first-class-red-clay-brick",
        "First Class Kiln-Fired Red Clay Construction Bricks", "CONON Assured",
        "cement-civil-works", "Cement & Civil Works", "First Class Red Bricks",
        "/images/products/bricks/first-class-red-brick.webp",
        "Table-Moulded · Kiln-Fired · Sharp Edges · High Crushing Load",
        ["Table Moulded", "Kiln Fired", "Sharp Edges", "Sound Metallic Ring"],
        "Traditional first-class table-moulded red clay bricks burnt in continuous kilns for uniform hardness and deep cherry-red color. Delivers exceptional crushing strength with sharp, well-defined arrises and minimum water absorption for load-bearing walls.",
        [
            "Uniform standard size (9 x 4.25 x 2.75 inches) with clean sharp edges",
            "High compressive strength above 10.5 N/mm² for multi-story load bearing masonry",
            "Water absorption strictly under 15% by dry weight after 24 hours soaking",
            "Emits a distinct clear metallic ringing sound upon impact with another brick",
            "Direct truckload delivery directly to site with careful tipping"
        ],
        [
            {"label": "Brand", "value": "CONON Assured Kilns"},
            {"label": "Brick Class", "value": "Class 10.5 / Grade A First Class"},
            {"label": "Manufacturing Method", "value": "Table Moulded, Coal Kiln Fired"},
            {"label": "Nominal Dimensions", "value": "9\" x 4.25\" x 2.75\" (228 x 108 x 70 mm)"},
            {"label": "Water Absorption", "value": "< 15% per IS 3495"},
            {"label": "Compressive Strength", "value": "10.5 - 12.5 N/mm²"},
            {"label": "Standard", "value": "IS 1077 Compliant"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-brick-500", "label": "500 Bricks (Mini Load)", "unit": "500 Pieces", "price": 5000, "mrp": 6500, "discountPercent": 23, "stock": 100, "image": v("/images/products/bricks/first-class-red-brick.webp")},
            {"id": "var-brick-1000", "label": "1000 Bricks (Standard Tipper)", "unit": "1000 Pieces", "price": 9800, "mrp": 13000, "discountPercent": 25, "stock": 80, "image": v("/images/products/bricks/first-class-red-brick.webp")},
            {"id": "var-brick-3000", "label": "3000 Bricks (Full Truckload)", "unit": "3000 Pieces", "price": 28500, "mrp": 39000, "discountPercent": 27, "stock": 30, "image": v("/images/products/bricks/first-class-red-brick.webp")},
        ]
    ),
    make_product(
        "aac-blocks", "magicrete-aac-blocks-600x200",
        "Magicrete Lightweight Thermal AAC Blocks (600x200x150mm)", "Magicrete",
        "cement-civil-works", "Cement & Civil Works", "Magicrete AAC Blocks",
        "/images/products/bricks/aac-block-600-200-150mm.webp",
        "Autoclaved Aerated Concrete · 3x Lighter Than Red Bricks · Thermal Insulated",
        ["Autoclaved Aerated", "Lightweight (1/3 wt)", "Thermal Insulated", "Fire Resistant 4hr"],
        "Precision-engineered Autoclaved Aerated Concrete (AAC) blocks engineered for modern high-rise framing. Weighs one-third of conventional clay bricks, drastically reducing structural dead load. Provides superior thermal insulation and 4-hour fire resistance.",
        [
            "Saves up to 20% in structural steel and foundation concrete requirements",
            "Superb thermal insulation cuts indoor air conditioning power bills by 25%",
            "Precision dimensional tolerance (±1.5mm) minimizes joint mortar thickness",
            "Non-combustible mineral composition offers 4-hour fire barrier protection",
            "Significantly speeds up masonry construction compared to traditional bricks"
        ],
        [
            {"label": "Brand", "value": "Magicrete Building Solutions"},
            {"label": "Material Type", "value": "Autoclaved Aerated Concrete (AAC)"},
            {"label": "Dimensions", "value": "600 mm (L) x 200 mm (H) x 150 mm (W)"},
            {"label": "Dry Density", "value": "550 - 650 kg/m³"},
            {"label": "Compressive Strength", "value": "3.5 - 4.5 N/mm² (IS 2185 Part 3)"},
            {"label": "Thermal Conductivity", "value": "0.16 W/m-K (IS 3792)"},
            {"label": "Standard", "value": "IS 2185 (Part 3) Certified"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-aac-100", "label": "100 mm Thickness (Partition Wall)", "unit": "Block", "price": 52, "mrp": 68, "discountPercent": 24, "stock": 400, "image": v("/images/products/bricks/aac-block-600-200-150mm.webp")},
            {"id": "var-aac-150", "label": "150 mm Thickness (Standard Wall)", "unit": "Block", "price": 68, "mrp": 85, "discountPercent": 20, "stock": 500, "image": v("/images/products/bricks/aac-block-600-200-150mm.webp")},
            {"id": "var-aac-200", "label": "200 mm Thickness (Exterior Wall)", "unit": "Block", "price": 88, "mrp": 115, "discountPercent": 23, "stock": 350, "image": v("/images/products/bricks/aac-block-600-200-150mm.webp")},
        ]
    ),
    make_product(
        "m-sand", "construction-m-sand-zone-ii",
        "Manufactured M-Sand Zone-II Concrete Grade", "CONON Assured",
        "cement-civil-works", "Cement & Civil Works", "Screened River Sand & M-Sand",
        "/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp",
        "Triple-Washed · VSI Machine Crushed · Zero Silt · Zone-II Certified",
        ["Zone-II Graded", "VSI Machine Crushed", "Silt < 1%", "Triple Washed"],
        "High-grade manufactured sand (M-Sand) produced by 3-stage VSI (Vertical Shaft Impactor) granite crushing. Meets strict IS 383 Zone-II concrete grading requirements with cubical grain shapes and less than 1% silt. Produces higher concrete strength with lower cement consumption.",
        [
            "Free from silt, organic impurities, and clay lumps commonly found in river sand",
            "Cubical grain geometry maximizes concrete compaction and reduces water demand",
            "Guaranteed consistent quality and grading from foundation through casting",
            "100% eco-friendly legal substitute for depleted riverbed sand",
            "Accurate weighed billing directly via electronic weighbridge receipt"
        ],
        [
            {"label": "Brand", "value": "CONON Assured Aggregates"},
            {"label": "Grading Zone", "value": "Zone-II as per IS 383:2016"},
            {"label": "Silt Content", "value": "< 1.0% (Laboratory Certified)"},
            {"label": "Fineness Modulus", "value": "2.60 - 2.90"},
            {"label": "Specific Gravity", "value": "2.65 - 2.70"},
            {"label": "Recommended Use", "value": "RCC Slabs, Columns, Beams & Foundation"},
            {"label": "Weighment", "value": "Electronic Weighbridge Slip Provided"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-sand-1ton", "label": "1 Ton Loose Bagged", "unit": "Ton", "price": 1450, "mrp": 1800, "discountPercent": 19, "stock": 200, "image": v("/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp")},
            {"id": "var-sand-3ton", "label": "3 Tons Mini-Tipper", "unit": "3 Tons Tipper", "price": 4200, "mrp": 5400, "discountPercent": 22, "stock": 40, "image": v("/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp")},
            {"id": "var-sand-10ton", "label": "10 Tons Heavy Dumper", "unit": "10 Tons Dumper", "price": 13500, "mrp": 18000, "discountPercent": 25, "stock": 20, "image": v("/images/products/sand/construction-m-sand-manufactured-zone-ii-concrete-grade.webp")},
        ]
    ),
    make_product(
        "stone-aggregate", "machine-crushed-20mm-stone-aggregate",
        "Machine Crushed 20mm Blue Stone Aggregate (Gitti)", "CONON Assured",
        "cement-civil-works", "Cement & Civil Works", "Screened River Sand & M-Sand",
        "/images/products/aggregate/20mm-crusher-gitti.webp",
        "Hard Black Trap Basalt · 20mm Graded · High Impact Resistance",
        ["20mm Graded", "Basalt Stone", "Low Flakiness", "High Impact Value"],
        "Heavy-duty machine-crushed 20mm blue metal stone aggregate (Gitti) quarried from dense black basalt rock. Sieve-screened to ensure angular, cubical particle distribution with minimal flakiness index for RCC structural concrete works.",
        [
            "High crushing value (> 300 MPa rock strength) ensures robust RCC structural framing",
            "Low flakiness and elongation index (< 15%) per IS 2386 testing standards",
            "Machine washed to remove stone dust and crusher flour before site delivery",
            "Forms ideal aggregate interlocking for M20, M25, and M30 grade concrete mixes",
            "Supplied directly from certified quarry crushers with weighbridge slips"
        ],
        [
            {"label": "Brand", "value": "CONON Assured Quarries"},
            {"label": "Nominal Size", "value": "20 mm (Graded 20mm - 4.75mm)"},
            {"label": "Rock Origin", "value": "Hard Dense Black Trap Basalt"},
            {"label": "Aggregate Crushing Value", "value": "< 20% (High Strength)"},
            {"label": "Aggregate Impact Value", "value": "< 18%"},
            {"label": "Standard", "value": "IS 383:2016 Compliant"},
            {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
        ],
        [
            {"id": "var-agg-1ton", "label": "1 Ton Loose Bagged", "unit": "Ton", "price": 1550, "mrp": 1950, "discountPercent": 21, "stock": 180, "image": v("/images/products/aggregate/20mm-crusher-gitti.webp")},
            {"id": "var-agg-3ton", "label": "3 Tons Mini-Tipper", "unit": "3 Tons Tipper", "price": 4500, "mrp": 5850, "discountPercent": 23, "stock": 35, "image": v("/images/products/aggregate/20mm-crusher-gitti.webp")},
            {"id": "var-agg-10ton", "label": "10 Tons Heavy Dumper", "unit": "10 Tons Dumper", "price": 14500, "mrp": 19500, "discountPercent": 26, "stock": 20, "image": v("/images/products/aggregate/20mm-crusher-gitti.webp")},
        ]
    ),
])

print(f"Total products with Cement: {len(PRODUCTS)}")
