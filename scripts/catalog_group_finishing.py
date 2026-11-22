import os
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

from scripts.generate_complete_catalog import make_product

def get_finishing_products():
    prods = []

    # ─── 11. Sanitary & Bath Fittings ───────────────────────────────────────
    prods.extend([
        make_product(
            "jaq-handshower", "jaquar-maze-hand-shower-120mm-square",
            "Jaquar Maze Hand Shower 120mm Square Multi-Flow ABS Body with Cascade Effect", "Jaquar",
            "sanitary-bath-fittings", "Sanitary & Bath Fittings", "Diverters & Overhead Showers",
            "/images/products/sanitary/jaquar-maze-hand-shower-square.webp",
            "Multi-Flow Spray Modes · Soft Silicone Rubit Descaling · Cascade Effect",
            ["Multi-Flow Spray", "Cascade Effect", "Rubit Descaling", "Mirror Chrome"],
            "Jaquar Maze overhead hand shower delivers an indulgent shower experience with selectable multi-flow water patterns and a soothing cascade waterfall effect. Fitted with Rubit silicone nozzles that clean lime scale deposits with a simple finger rub.",
            [
                "Multi-flow spray modes: Rain shower, Concentrated massage jet, and Cascade waterfall",
                "Advanced Rubit silicone nozzles prevent hard water calcium buildup and clogging",
                "Mirror-finish electrolytic chrome plating exceeds 200 hours salt-spray testing",
                "Ergonomic square head design provides generous 120mm drenching water spray coverage",
                "Universal 1/2-inch BSP thread connects seamlessly to all standard flexible shower hoses"
            ],
            [
                {"label": "Brand", "value": "Jaquar India"},
                {"label": "Series", "value": "Maze Hand Shower Collection"},
                {"label": "Head Size", "value": "120 mm Square Form Factor"},
                {"label": "Body Material", "value": "High-Impact Engineered ABS Polymer"},
                {"label": "Plating", "value": "Triple-Layer Nickel-Chrome Mirror Finish"},
                {"label": "Warranty", "value": "10 Years Jaquar Brand Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-shw-sq", "label": "120mm Square Chrome", "unit": "Piece", "price": 1822, "mrp": 2375, "discountPercent": 23, "stock": 45, "image": v("/images/products/sanitary/jaquar-maze-hand-shower-square.webp")},
                {"id": "var-shw-rect", "label": "120mm Rectangular Chrome", "unit": "Piece", "price": 1728, "mrp": 2250, "discountPercent": 23, "stock": 40, "image": v("/images/products/sanitary/jaquar-maze-hand-shower-square.webp")},
            ]
        ),
        make_product(
            "jaq-diverter", "jaquar-kubix-prime-high-flow-diverter",
            "Jaquar Kubix Prime High-Flow Single Lever Concealed Diverter Exposed Kit", "Jaquar",
            "sanitary-bath-fittings", "Sanitary & Bath Fittings", "Diverters & Overhead Showers",
            "/images/products/sanitary/jaquar-kubix-prime-diverter-exposed-kit.webp",
            "High Flow Rate · Crisp Geometric Cube Styling · Smooth Ceramic Joystick",
            ["High Flow Rate", "Solid Brass Casting", "Smooth Ceramic Cartridge", "Kubix Prime"],
            "Architectural single-lever concealed diverter trim kit from Jaquar's flagship Kubix Prime collection. Effortlessly switches water flow between rain shower and bathtub spout with precise temperature blending.",
            [
                "High-flow ceramic cartridge delivers rapid bathtub filling and luxurious shower pressure",
                "Precision square wall flange with clear hot/cold and shower/spout laser engravings",
                "Smooth single-lever joystick control balances water temperature with micro accuracy",
                "Heavy forged brass faceplate and lever finished in high-reflection chrome",
                "Engineered to withstand up to 16 bar hydraulic water line pressure tests"
            ],
            [
                {"label": "Brand", "value": "Jaquar India"},
                {"label": "Collection", "value": "Kubix Prime Architectural Series"},
                {"label": "Flow Rate", "value": "High Flow (Up to 45 L/min at 3 Bar)"},
                {"label": "Cartridge", "value": "Ceramic Disc Cartridge (46mm)"},
                {"label": "Pressure Rating", "value": "Tested up to 16 Bar (232 PSI)"},
                {"label": "Warranty", "value": "10 Years On-Site Brand Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-div-trim", "label": "Exposed Trim Kit Only", "unit": "Kit", "price": 2209, "mrp": 2825, "discountPercent": 22, "stock": 40, "image": v("/images/products/sanitary/jaquar-kubix-prime-diverter-exposed-kit.webp")},
                {"id": "var-div-comp", "label": "Complete (Exposed Kit + Concealed Brass Body)", "unit": "Full Set", "price": 4850, "mrp": 6200, "discountPercent": 22, "stock": 25, "image": v("/images/products/sanitary/jaquar-kubix-prime-diverter-exposed-kit.webp")},
            ]
        ),
        make_product(
            "cera-trap", "cera-bottle-trap",
            "Cera Heavy Brass Chrome Finish Wash Basin Bottle Trap (32mm)", "Cera",
            "sanitary-bath-fittings", "Sanitary & Bath Fittings", "Wash Basins & Taps",
            "/images/products/sanitary/cera-bottle-trap.webp",
            "Solid Brass Casting · Removable Cleaning Cup · Prevents Drain Smells",
            ["Solid Brass Body", "Removable Base Cup", "Mirror Chrome", "Universal 32mm"],
            "Cera commercial-grade washbasin bottle trap crafted from solid forged brass. Features a water-seal barrier that stops drain odors from entering bathrooms and an unscrewable bottom cup for clearing hair clogs without plumbing tools.",
            [
                "Solid brass construction guarantees zero pinhole corrosion under bathroom vanities",
                "Standing water seal stops sewer gases and bathroom insects from emerging via the basin",
                "Unscrewable bottom maintenance cup allows effortless DIY removal of dropped rings or hair",
                "Universal 32mm (1.25\") inlet and outlet connects to all ceramic countertop basins",
                "Heavy-gauge brass wall pipe with decorative chrome flange covers drain wall cutouts"
            ],
            [
                {"label": "Brand", "value": "Cera Sanitaryware"},
                {"label": "Material", "value": "Heavy Forged Virgin Brass"},
                {"label": "Pipe Diameter", "value": "32 mm (1.25 Inch Standard)"},
                {"label": "Wall Pipe Length", "value": "190 mm (Cut-to-Fit)"},
                {"label": "Warranty", "value": "7 Years Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-bt-190", "label": "190mm Wall Pipe (Standard Vanity)", "unit": "Piece", "price": 2016, "mrp": 2640, "discountPercent": 24, "stock": 50, "image": v("/images/products/sanitary/cera-bottle-trap.webp")},
                {"id": "var-bt-300", "label": "300mm Extended Pipe (Deep Counter)", "unit": "Piece", "price": 2350, "mrp": 3100, "discountPercent": 24, "stock": 35, "image": v("/images/products/sanitary/cera-bottle-trap.webp")},
            ]
        ),
        make_product(
            "cera-bibcock", "cera-garnet-bib-cock",
            "Cera Garnet Bib Cock with Wall Flange and Nozzle F2002153", "Cera",
            "sanitary-bath-fittings", "Sanitary & Bath Fittings", "Health Faucets & Angle Valves",
            "/images/products/sanitary/cera-garnet-bib-cock.webp",
            "Quarter Turn Ceramic Head · Solid Brass Casting · Hose Pipe Connector Nozzle",
            ["Quarter Turn Ceramic", "Solid Brass", "Washing Hose Nozzle", "Mirror Chrome"],
            "Heavy brass quarter-turn bib cock equipped with a serrated nozzle for garden pipes, washing machine inlets, and utility cleaning areas. Built with a ceramic disc spindle for effortless finger-touch shutoff.",
            [
                "Precision ceramic spindle provides smooth quarter-turn water activation without stiffness",
                "Serrated metal nozzle tip holds flexible washing machine and garden hoses tightly",
                "Forged brass body handles continuous municipal water pressures without leakage",
                "Includes matching chrome wall flange to hide rough plumbing wall tile holes",
                "Backed by Cera's hassle-free 7-year company on-site service warranty"
            ],
            [
                {"label": "Brand", "value": "Cera Sanitaryware"},
                {"label": "Product Code", "value": "F2002153 (Garnet Series)"},
                {"label": "Inlet Thread", "value": "1/2 Inch (15mm) BSP Male Thread"},
                {"label": "Working Pressure", "value": "0.5 to 5.0 Bar Recommended"},
                {"label": "Warranty", "value": "7 Years Official Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-bib-std", "label": "Standard Single Way Bib Cock", "unit": "Piece", "price": 1260, "mrp": 1650, "discountPercent": 24, "stock": 60, "image": v("/images/products/sanitary/cera-garnet-bib-cock.webp")},
                {"id": "var-bib-2way", "label": "2-Way Bib Cock (Shower + Tap)", "unit": "Piece", "price": 1680, "mrp": 2250, "discountPercent": 25, "stock": 45, "image": v("/images/products/sanitary/cera-garnet-bib-cock.webp")},
            ]
        ),
        make_product(
            "jaq-towelring", "jaquar-towel-ring-chrome",
            "Jaquar Continental Solid Brass Circular Towel Ring Chrome", "Jaquar",
            "sanitary-bath-fittings", "Sanitary & Bath Fittings", "Bathroom Fittings & Accessories",
            "/images/products/sanitary/jaquar-towel-ring-chrome.webp",
            "Solid Brass Bar · Concealed Stainless Fasteners · Mirror Chrome Finish",
            ["Solid Brass Bar", "Mirror Chrome", "Concealed Wall Mounting", "Rust Proof"],
            "Jaquar Continental circular towel ring designed for hand towel hanging near bathroom washbasins. Built from thick solid brass with concealed stainless steel wall anchor screws that prevent wobbling.",
            [
                "Solid brass circular ring will never rust, pit, or flake in steamy bathroom environments",
                "Concealed wall bracket mechanism keeps mounting screws completely hidden from view",
                "Triple-layer chrome plating maintains a bright jewel-like reflective sheen over years",
                "Smooth swinging action holds towels without pulling or snagging delicate fabric fibers",
                "Includes stainless steel wall anchors, rawlplugs, and allen key for fast mounting"
            ],
            [
                {"label": "Brand", "value": "Jaquar India"},
                {"label": "Collection", "value": "Continental Accessories Series"},
                {"label": "Dimensions", "value": "210 mm Height x 160 mm Ring Diameter"},
                {"label": "Material", "value": "Solid Forged Brass"},
                {"label": "Warranty", "value": "10 Years Manufacturer Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-tr-chr", "label": "Mirror Chrome Finish", "unit": "Piece", "price": 1026, "mrp": 1350, "discountPercent": 24, "stock": 70, "image": v("/images/products/sanitary/jaquar-towel-ring-chrome.webp")},
                {"id": "var-tr-blk", "label": "Matt Black Architectural", "unit": "Piece", "price": 1290, "mrp": 1690, "discountPercent": 24, "stock": 40, "image": v("/images/products/sanitary/jaquar-towel-ring-chrome.webp")},
            ]
        ),
        make_product(
            "cera-basin", "cera-careo-tabletop-washbasin",
            "Cera Careo Sleek Rim Ceramic Table Top Counter Wash Basin", "Cera",
            "sanitary-bath-fittings", "Sanitary & Bath Fittings", "Countertop Ceramic Basins",
            "/images/products/sanitary/cera-careo-tabletop-washbasin.webp",
            "Vitreous China · Ultra-Thin Rim Design · Anti-Bacterial Glaze",
            ["Vitreous China", "Thin Rim Aesthetics", "Anti-Bacterial Glaze", "Stain Resistant"],
            "Luxury countertop ceramic washbasin from Cera's designer Careo series. Features an ultra-thin contemporary rim profile and high-density vitreous china fired at 1200°C with an anti-bacterial self-cleaning glaze.",
            [
                "Vitreous china body fired at 1200°C achieves near-zero water absorption (< 0.5%)",
                "Ultra-thin rim design brings clean European minimalism to bathroom granite vanity slabs",
                "Nano-glazed surface prevents hard water dirt particles from adhering to the ceramic bowl",
                "Spacious washing area with generous depth prevents water splash-back onto countertops",
                "Compatible with tall gooseneck deck-mounted faucets or sleek wall-mounted spout mixers"
            ],
            [
                {"label": "Brand", "value": "Cera Sanitaryware"},
                {"label": "Series", "value": "Careo Table Top Wash Basin"},
                {"label": "Dimensions", "value": "500 mm (L) x 400 mm (W) x 140 mm (H)"},
                {"label": "Mounting", "value": "Counter Top / Vanity Top Vessel"},
                {"label": "Glaze", "value": "Self-Cleaning Anti-Microbial Ceramic Glaze"},
                {"label": "Warranty", "value": "10 Years Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-bsn-wht", "label": "Glossy Pure White", "unit": "Basin", "price": 3250, "mrp": 4350, "discountPercent": 25, "stock": 35, "image": v("/images/products/sanitary/cera-careo-tabletop-washbasin.webp")},
                {"id": "var-bsn-ivy", "label": "Satin Ivory Luxury", "unit": "Basin", "price": 3600, "mrp": 4800, "discountPercent": 25, "stock": 25, "image": v("/images/products/sanitary/cera-careo-tabletop-washbasin.webp")},
            ]
        ),
    ])

    # ─── 12. Tile & Stone Installation ──────────────────────────────────────
    prods.extend([
        make_product(
            "laticrete-303", "myk-laticrete-303-grey-tile-adhesive-20kg",
            "MYK Laticrete 303 Grey Tile Adhesive, 20kg Bag", "MYK Laticrete",
            "tile-stone-installation", "Tile & Stone Installation", "Polymer-Modified Tile Adhesives",
            "/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp",
            "Factory Prepared Polymer Modified Tile Adhesive · Interior Floors & Walls",
            ["Polymer Modified", "Interior Dry & Wet", "High Shear Adhesion", "IS 15477 Type 1"],
            "Factory-prepared polymer-modified cementitious tile adhesive for fixing ceramic, semi-vitrified, and terracotta tiles on internal floors and walls. Eliminates tile hollow sounds and debonding caused by traditional cement slurry.",
            [
                "Polymer-modified formula provides reliable shear bond strength far exceeding cement mortar",
                "Pre-mixed single component: simply add clean water and mix for smooth buttery troweling",
                "Non-shrink formulation prevents hollow spots and tile cracking under point loads",
                "Long open time of 20 minutes allows masons to adjust and level tiles accurately",
                "IS 15477:2019 Type 1 compliant for interior floors, kitchens, and residential bathrooms"
            ],
            [
                {"label": "Brand", "value": "MYK Laticrete India"},
                {"label": "Product Code", "value": "303 Ceramic Tile Adhesive"},
                {"label": "Standard", "value": "IS 15477:2019 (Type 1 Certified)"},
                {"label": "Pot Life", "value": "Approx. 2 Hours at 27°C"},
                {"label": "Open Time", "value": "20 - 25 Minutes"},
                {"label": "Coverage", "value": "50 - 60 sq.ft per 20kg bag at 3mm bed"},
                {"label": "Shelf Life", "value": "12 Months in Dry Storage"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-lat-20kg", "label": "20kg Bag", "unit": "20kg Bag", "price": 255, "mrp": 300, "discountPercent": 15, "stock": 200, "image": v("/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp")},
                {"id": "var-lat-50kg", "label": "50kg Jumbo Bag", "unit": "50kg Bag", "price": 590, "mrp": 700, "discountPercent": 16, "stock": 100, "image": v("/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp")},
                {"id": "var-lat-bulk", "label": "Bulk Pallet (50 Bags x 20kg)", "unit": "50 Bags (1 Ton)", "price": 12250, "mrp": 15000, "discountPercent": 18, "stock": 20, "image": v("/images/products/tiles/myk-laticrete-303-grey-tile-adhesive-20kg.webp")},
            ]
        ),
        make_product(
            "roff-t01", "roff-t01-nca-tile-adhesive-grey-30kg",
            "Roff T01 NCA Tile Adhesive, Grey, 30 Kg Bag", "Roff (Pidilite)",
            "tile-stone-installation", "Tile & Stone Installation", "Polymer-Modified Tile Adhesives",
            "/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp",
            "Non-Skid Ceramic Adhesive · Fast Spreading · Pidilite Technology",
            ["Pidilite Roff", "Non-Skid Formula", "IS 15477 Type 1", "Interior Floor/Wall"],
            "Roff T01 Non-Skid Ceramic Adhesive (NCA) is a polymer-modified cement-based tile adhesive from Pidilite. Specifically designed for fixing ceramic and clay tiles on new or renovated indoor floors and walls without hacking.",
            [
                "Polymer-fortified matrix provides high grip that stops wall tiles from slipping down",
                "Saves time: requires no pre-soaking of tiles in water before fixing",
                "Excellent water retention ensures complete cement hydration and maximum strength",
                "Smooth creamy consistency spreads effortlessly with standard notched trowels",
                "Formulated by Pidilite with certified quality control for professional tilers"
            ],
            [
                {"label": "Brand", "value": "Roff by Pidilite Industries"},
                {"label": "Grade", "value": "T01 NCA (Non-Skid Ceramic Adhesive)"},
                {"label": "Classification", "value": "IS 15477:2019 Type 1T"},
                {"label": "Color", "value": "Grey Cementitious Powder"},
                {"label": "Coverage", "value": "75 - 85 sq.ft per 30kg bag at 3mm bed"},
                {"label": "Shelf Life", "value": "12 Months in Original Packing"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-roff-20kg", "label": "20kg Bag", "unit": "20kg Bag", "price": 295, "mrp": 320, "discountPercent": 8, "stock": 150, "image": v("/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp")},
                {"id": "var-roff-30kg", "label": "30kg Bag", "unit": "30kg Bag", "price": 430, "mrp": 460, "discountPercent": 7, "stock": 180, "image": v("/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp")},
                {"id": "var-roff-40kg", "label": "40kg Bag", "unit": "40kg Bag", "price": 560, "mrp": 610, "discountPercent": 8, "stock": 100, "image": v("/images/products/tiles/roff-t01-nca-tile-adhesive-grey-30kg.webp")},
            ]
        ),
        make_product(
            "laticrete-305", "myk-laticrete-305-tile-adhesive-grey-30kg",
            "MYK Laticrete 305 Tile Adhesive, Grey, 30 Kg Bag", "MYK Laticrete",
            "tile-stone-installation", "Tile & Stone Installation", "Polymer-Modified Tile Adhesives",
            "/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp",
            "Vitrified Tile Specialist · High Tensile Bond · IS 15477 Type 2",
            ["Vitrified Specialist", "Type 2 Certified", "High Bond Grip", "Zero Slippage"],
            "MYK Laticrete 305 is a premium polymer-fortified tile adhesive formulated for vitrified, porcelain, and natural stone tiles. Engineered to grip low-porosity vitrified tile backs that standard cement mortar fails to hold.",
            [
                "High chemical polymer adhesion bonds tightly to dense low-porosity vitrified tile backs",
                "IS 15477:2019 Type 2 certified for vitrified floor tiles and exterior covered cladding",
                "Exceptional shock and thermal vibration absorption prevents tile tenting and popping",
                "Extended pot life of 3 hours allows full batch mixing on large commercial flooring sites",
                "Can be used over existing tile flooring (tile-on-tile) without chipping out old floors"
            ],
            [
                {"label": "Brand", "value": "MYK Laticrete India"},
                {"label": "Series", "value": "305 Floor & Wall Thin-Set"},
                {"label": "Standard", "value": "IS 15477:2019 Type 2T Compliant"},
                {"label": "Tensile Adhesion", "value": "> 1.0 N/mm² at 28 Days"},
                {"label": "Coverage", "value": "80 - 90 sq.ft per 30kg bag at 3mm bed"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-lat305-20", "label": "20kg Bag", "unit": "20kg Bag", "price": 290, "mrp": 320, "discountPercent": 9, "stock": 100, "image": v("/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp")},
                {"id": "var-lat305-30", "label": "30kg Bag", "unit": "30kg Bag", "price": 420, "mrp": 457, "discountPercent": 9, "stock": 140, "image": v("/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp")},
                {"id": "var-lat305-50", "label": "50kg Jumbo Bag", "unit": "50kg Bag", "price": 680, "mrp": 750, "discountPercent": 9, "stock": 80, "image": v("/images/products/tiles/myk-laticrete-305-tile-adhesive-grey-30kg.webp")},
            ]
        ),
        make_product(
            "roff-t02", "roff-t02-nsa-tile-adhesive-grey-30kg",
            "Roff T02 NSA Tile Adhesive, Grey, 30 Kg Bag", "Roff (Pidilite)",
            "tile-stone-installation", "Tile & Stone Installation", "Polymer-Modified Tile Adhesives",
            "/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp",
            "Non-Skid Adhesive for Large Vitrified Tiles & Natural Stone · High Flexibility",
            ["Large Vitrified Tiles", "Natural Stone", "Tile-on-Tile", "High Flexural Bond"],
            "Roff T02 Non-Skid Adhesive (NSA) is a polymer-enriched adhesive engineered for heavy, large-format vitrified tiles, granite, and marble slabs. Offers high flexural strength and zero vertical slippage during wall installation.",
            [
                "Formulated for large-format porcelain slabs and heavy vitrified tiles (600x1200mm+)",
                "High polymer concentration allows direct tile-on-tile renovation with zero mess",
                "Non-slump formula holds heavy vertical wall tiles in place without mechanical propping",
                "Accommodates thermal expansion and contraction between substrate and large tiles",
                "Resistant to continuous water immersion in swimming pools and water bodies"
            ],
            [
                {"label": "Brand", "value": "Roff by Pidilite"},
                {"label": "Grade", "value": "T02 NSA (Non-Skid Adhesive)"},
                {"label": "Standard", "value": "IS 15477:2019 Type 2T"},
                {"label": "Suitable Tiles", "value": "Vitrified, Granite, Marble, Porcelain"},
                {"label": "Coverage", "value": "75 - 85 sq.ft per 30kg at 3-4mm bed"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-roff2-20", "label": "20kg Bag", "unit": "20kg Bag", "price": 510, "mrp": 540, "discountPercent": 6, "stock": 90, "image": v("/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp")},
                {"id": "var-roff2-30", "label": "30kg Bag", "unit": "30kg Bag", "price": 740, "mrp": 780, "discountPercent": 5, "stock": 120, "image": v("/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp")},
                {"id": "var-roff2-40", "label": "40kg Bag", "unit": "40kg Bag", "price": 960, "mrp": 1020, "discountPercent": 6, "stock": 60, "image": v("/images/products/tiles/roff-t02-nsa-tile-adhesive-grey-30kg.webp")},
            ]
        ),
        make_product(
            "roff-grout", "roff-rainbow-tile-grout-1kg",
            "Roff Rainbow Waterproof Tile Joint Grout, 1kg Pack", "Roff (Pidilite)",
            "tile-stone-installation", "Tile & Stone Installation", "Waterproof Epoxy Tile Grouts",
            "/images/products/tiles/roff-rainbow-tile-grout-1kg.webp",
            "Water-Resistant Polymer Modified Joint Filler · Vibrant Color Fastness",
            ["Water Resistant", "Anti-Fungal", "Shrink-Proof", "Color Fast"],
            "Polymer-modified cementitious tile joint filler designed to seal gaps between tiles up to 5mm wide. Resists water absorption, fungal growth, and shrinkage cracking in kitchens, bathrooms, and living floors.",
            [
                "Fills tile gaps seamlessly, preventing dirty water from seeping under tiles",
                "Hydrophobic polymer additives repel water droplets and household soap stains",
                "Non-shrink formula cures without cracking or powdering out of joint lines",
                "Available in aesthetic shades that match modern vitrified tile colors",
                "Formulated with fungicides that inhibit mildew growth in damp shower corners"
            ],
            [
                {"label": "Brand", "value": "Roff by Pidilite"},
                {"label": "Series", "value": "Rainbow Tile Grout"},
                {"label": "Joint Width", "value": "Suitable for 1 mm to 5 mm Joint Gaps"},
                {"label": "Coverage", "value": "Approx. 40 - 50 running meters per kg (2mm gap)"},
                {"label": "Standard", "value": "EN 13888 CG1 Grade"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-grt-wht", "label": "Pure White (1kg)", "unit": "1kg Pack", "price": 85, "mrp": 110, "discountPercent": 23, "stock": 150, "image": v("/images/products/tiles/roff-rainbow-tile-grout-1kg.webp")},
                {"id": "var-grt-ivy", "label": "Ivory Beige (1kg)", "unit": "1kg Pack", "price": 85, "mrp": 110, "discountPercent": 23, "stock": 120, "image": v("/images/products/tiles/roff-rainbow-tile-grout-1kg.webp")},
                {"id": "var-grt-gry", "label": "Silver Grey (1kg)", "unit": "1kg Pack", "price": 85, "mrp": 110, "discountPercent": 23, "stock": 140, "image": v("/images/products/tiles/roff-rainbow-tile-grout-1kg.webp")},
                {"id": "var-grt-slt", "label": "Dark Slate Black (1kg)", "unit": "1kg Pack", "price": 95, "mrp": 120, "discountPercent": 21, "stock": 80, "image": v("/images/products/tiles/roff-rainbow-tile-grout-1kg.webp")},
            ]
        ),
        make_product(
            "drf-sealer", "dr-fixit-tile-stone-sealer-1l",
            "Dr. Fixit Tile & Stone Impregnating Penetrating Sealer 1L", "Dr. Fixit",
            "tile-stone-installation", "Tile & Stone Installation", "Tile Cleaners & Stone Sealers",
            "/images/products/tiles/dr-fixit-tile-stone-sealer-1l.webp",
            "Invisible Deep Penetrating Silane Sealant · Blocks Oil & Water Stains",
            ["Invisible Shield", "Repels Oil & Water", "Natural Look", "Marble & Granite"],
            "Clear penetrating impregnating sealer for porous natural stones including marble, granite, sandstone, and terracotta tiles. Penetrates micro-pores to form an invisible oil-and-water-repellent barrier without changing natural stone color or texture.",
            [
                "Penetrates deep into stone capillary pores without forming an artificial plastic film",
                "Blocks absorption of staining liquids: turmeric, cooking oil, tea, coffee, and wine",
                "Leaves the natural breathability, texture, and natural stone color completely unaltered",
                "UV stable formula does not yellow or peel over years of outdoor terrace exposure",
                "Easy DIY sponge or brush application cures completely within 24 hours"
            ],
            [
                {"label": "Brand", "value": "Dr. Fixit (Pidilite)"},
                {"label": "Type", "value": "Siloxane / Silane Penetrating Impregnator"},
                {"label": "Coverage", "value": "80 - 100 sq.ft per Litre (Depends on Stone Porosity)"},
                {"label": "Appearance", "value": "Clear Water-Thin Liquid"},
                {"label": "Drying Time", "value": "Touch Dry: 2 Hrs, Full Protection: 24 Hrs"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-slr-1l", "label": "1 Litre Bottle", "unit": "Bottle", "price": 490, "mrp": 620, "discountPercent": 21, "stock": 60, "image": v("/images/products/tiles/dr-fixit-tile-stone-sealer-1l.webp")},
                {"id": "var-slr-5l", "label": "5 Litres Can", "unit": "Can", "price": 2250, "mrp": 2850, "discountPercent": 21, "stock": 30, "image": v("/images/products/tiles/dr-fixit-tile-stone-sealer-1l.webp")},
            ]
        ),
    ])

    # ─── 15. Painting ───────────────────────────────────────────────────────
    prods.extend([
        make_product(
            "ap-distemper", "asian-paints-tractor-uno-acrylic-distemper-paint-white-20kg",
            "Asian Paints Tractor Uno Acrylic Distemper Paint White, 20kg", "Asian Paints",
            "painting", "Painting", "Interior Luxury Emulsions",
            "/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp",
            "Smooth Matte Finish · Superior Whiteness · Economical Interior Coverage",
            ["Smooth Matte", "High Opacity", "Recoat in 3-4 Hrs", "Washable Distemper"],
            "Asian Paints Tractor Uno is a water-based acrylic distemper that gives interior walls a smooth, uniform matte finish. Offers superior whiteness, high opacity, and significant cost savings over traditional lime whitewash.",
            [
                "Provides a beautiful, smooth matte finish that brightens budget interior rooms",
                "High opacity formula covers old plaster patches and stains in just 2 coats",
                "Fast drying time allows two complete wall coats to be finished in a single day",
                "Superior color retention stays bright white without chalking or flaking off",
                "Lead-free, water-thinnable formula with virtually zero solvent smell"
            ],
            [
                {"label": "Brand", "value": "Asian Paints Limited"},
                {"label": "Series", "value": "Tractor Uno Acrylic Distemper"},
                {"label": "Color", "value": "Base White (Super White)"},
                {"label": "Sheen / Finish", "value": "Smooth Matte Finish"},
                {"label": "Drying Time", "value": "Touch Dry: 30 Mins, Recoat: 3 - 4 Hours"},
                {"label": "Coverage", "value": "65 - 75 sq.ft per kg (2 Coats)"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-uno-5kg", "label": "5 kg Bucket", "unit": "5kg Bucket", "price": 275, "mrp": 450, "discountPercent": 39, "stock": 80, "image": v("/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp")},
                {"id": "var-uno-10kg", "label": "10 kg Bucket", "unit": "10kg Bucket", "price": 510, "mrp": 840, "discountPercent": 39, "stock": 90, "image": v("/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp")},
                {"id": "var-uno-20kg", "label": "20 kg Bucket", "unit": "20kg Bucket", "price": 945, "mrp": 1580, "discountPercent": 40, "stock": 100, "image": v("/images/products/paint/asian-paints-tractor-uno-distemper-20kg.webp")},
            ]
        ),
        make_product(
            "ap-tractor-emul", "asian-paints-tractor-emulsion-base-white",
            "Asian Paints Tractor Emulsion, Base White Interior Paint", "Asian Paints",
            "painting", "Painting", "Interior Luxury Emulsions",
            "/images/products/paint/asian-paints-tractor-emulsion-base-white.webp",
            "Smart Upgrade from Distemper · Plastic Paint Feel · Smooth Matte Finish",
            ["Anti-Fade", "Plastic Paint Finish", "Smooth Matte", "1.5x Coverage of Distemper"],
            "The smart upgrade from distemper to authentic plastic emulsion. Tractor Emulsion provides a smooth matte plastic finish at an affordable budget. Delivers 1.5 times the coverage of distempers and stands up to light wall sponging.",
            [
                "Plastic paint look and feel elevates interior walls above chalky distempers",
                "Wide coverage spreads up to 260 sq.ft per litre in a single coat",
                "Anti-fade technology keeps wall colors vibrant and fresh for over 3 years",
                "Resists light wet cloth wiping to remove household dust and pencil marks",
                "Available in over 1200 tintable shades via authorized Asian Paints color computers"
            ],
            [
                {"label": "Brand", "value": "Asian Paints Limited"},
                {"label": "Product", "value": "Tractor Emulsion Interior"},
                {"label": "Finish", "value": "Soft Matte Plastic Finish"},
                {"label": "Coverage", "value": "130 - 150 sq.ft per Litre (2 Coats)"},
                {"label": "Thinning", "value": "Water Thinning (500ml water per 1L paint)"},
                {"label": "Warranty", "value": "3 Years Performance Assurance"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-trac-1l", "label": "1 Litre Can", "unit": "Litre", "price": 187, "mrp": 260, "discountPercent": 28, "stock": 70, "image": v("/images/products/paint/asian-paints-tractor-emulsion-base-white.webp")},
                {"id": "var-trac-4l", "label": "4 Litres Bucket", "unit": "4L Bucket", "price": 690, "mrp": 960, "discountPercent": 28, "stock": 80, "image": v("/images/products/paint/asian-paints-tractor-emulsion-base-white.webp")},
                {"id": "var-trac-10l", "label": "10 Litres Bucket", "unit": "10L Bucket", "price": 1580, "mrp": 2200, "discountPercent": 28, "stock": 60, "image": v("/images/products/paint/asian-paints-tractor-emulsion-base-white.webp")},
                {"id": "var-trac-20l", "label": "20 Litres Bucket", "unit": "20L Bucket", "price": 2990, "mrp": 4150, "discountPercent": 28, "stock": 50, "image": v("/images/products/paint/asian-paints-tractor-emulsion-base-white.webp")},
            ]
        ),
        make_product(
            "ap-tractor-splash", "asian-paints-tractor-emulsion-colour-splash",
            "Asian Paints Tractor Emulsion, Smooth Matte Interior Finish", "Asian Paints",
            "painting", "Painting", "Interior Luxury Emulsions",
            "/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp",
            "Smooth Matte · Anti-Fade Tech · Machine Tintable into 1000+ Colors",
            ["Tintable Colors", "Smooth Texture", "Low Odor", "High Spreading"],
            "Vibrant interior emulsion formulated for living rooms, master bedrooms, and rental upgrades. Ready for high-precision computer tinting into pastels, neutrals, and deep designer accent wall shades.",
            [
                "Ultra-fine pigments provide uniform color depth across entire room expanses",
                "Dries to an elegant velvety smooth matte sheen that masks minor wall undulations",
                "Zero lead and ultra-low VOC emissions allow immediate safe room occupancy",
                "Non-yellowing acrylic binders ensure white ceilings stay white indefinitely",
                "Smooth consistency rolls out effortlessly with microfiber paint rollers"
            ],
            [
                {"label": "Brand", "value": "Asian Paints Limited"},
                {"label": "Type", "value": "Acrylic Copolymer Interior Emulsion"},
                {"label": "Washability", "value": "Moderate (Wipeable with Damp Cloth)"},
                {"label": "Recoat Period", "value": "4 Hours"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-trac-sp-1l", "label": "1 Litre Can", "unit": "Litre", "price": 187, "mrp": 260, "discountPercent": 28, "stock": 60, "image": v("/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp")},
                {"id": "var-trac-sp-4l", "label": "4 Litres Bucket", "unit": "4L Bucket", "price": 690, "mrp": 960, "discountPercent": 28, "stock": 70, "image": v("/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp")},
                {"id": "var-trac-sp-10l", "label": "10 Litres Bucket", "unit": "10L Bucket", "price": 1580, "mrp": 2200, "discountPercent": 28, "stock": 50, "image": v("/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp")},
                {"id": "var-trac-sp-20l", "label": "20 Litres Bucket", "unit": "20L Bucket", "price": 2990, "mrp": 4150, "discountPercent": 28, "stock": 45, "image": v("/images/products/paint/asian-paints-tractor-emulsion-colour-splash.webp")},
            ]
        ),
        make_product(
            "ap-apcolite", "apcolite-premium-emulsion-20l",
            "Asian Paints Apcolite Premium Emulsion Paints, Base White", "Asian Paints",
            "painting", "Painting", "Interior Luxury Emulsions",
            "/images/products/paint/apcolite-premium-emulsion-20l.webp",
            "Rich Matte Sheen · 100% Washable · Stain Resistant · 5-Year Life",
            ["100% Washable", "Stain Resistant", "Rich Matte Sheen", "5-Year Performance"],
            "Asian Paints Apcolite Premium Emulsion is India's definitive luxury washable interior paint. Infused with specialized stain-guard polymers that form a resilient barrier against stubborn household stains like tea, ketchup, and crayons.",
            [
                "100% washable surface allows tough stains to be scrubbed off with mild soap water",
                "Rich matte sheen diffuses interior ambient light for a high-end architectural look",
                "Advanced stain-guard technology prevents deep liquid penetration into the plaster",
                "Anti-fungal shield prevents mildew formation on bathroom and kitchen ceilings",
                "Backed by Asian Paints' comprehensive 5-year interior durability assurance"
            ],
            [
                {"label": "Brand", "value": "Asian Paints Limited"},
                {"label": "Series", "value": "Apcolite Premium Emulsion"},
                {"label": "Washability", "value": "High (Washable with Sponge & Mild Soap)"},
                {"label": "Sheen Level", "value": "Rich Matte / Low Sheen"},
                {"label": "Coverage", "value": "140 - 160 sq.ft per Litre (2 Coats)"},
                {"label": "Warranty", "value": "5 Years Brand Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-apc-1l", "label": "1 Litre Can", "unit": "Litre", "price": 348, "mrp": 490, "discountPercent": 29, "stock": 80, "image": v("/images/products/paint/apcolite-premium-emulsion-20l.webp")},
                {"id": "var-apc-4l", "label": "4 Litres Bucket", "unit": "4L Bucket", "price": 1280, "mrp": 1800, "discountPercent": 29, "stock": 80, "image": v("/images/products/paint/apcolite-premium-emulsion-20l.webp")},
                {"id": "var-apc-10l", "label": "10 Litres Bucket", "unit": "10L Bucket", "price": 2990, "mrp": 4250, "discountPercent": 30, "stock": 50, "image": v("/images/products/paint/apcolite-premium-emulsion-20l.webp")},
                {"id": "var-apc-20l", "label": "20 Litres Bucket", "unit": "20L Bucket", "price": 5650, "mrp": 8100, "discountPercent": 30, "stock": 40, "image": v("/images/products/paint/apcolite-premium-emulsion-20l.webp")},
            ]
        ),
        make_product(
            "ap-apex-ultima", "apex-ultima-exterior-20l",
            "Asian Paints Apex Ultima Advanced Anti-Algal Weatherproof Exterior Emulsion", "Asian Paints",
            "painting", "Painting", "Weatherproof Exterior Emulsions",
            "/images/products/paint/apex-ultima-exterior-20l.webp",
            "Color Stay Technology · Advanced Anti-Algal · 7-Year Performance Warranty",
            ["7-Yr Warranty", "Color Stay Tech", "Anti-Algal Formula", "Dirt Pick-Up Resistance"],
            "Asian Paints Apex Ultima is a premium 100% acrylic exterior emulsion engineered to protect external building facades from tropical monsoon downpours, scorching UV radiation, and unsightly black algae staining.",
            [
                "Advanced silicone-acrylic cross-linking prevents fungal and black algae streaks",
                "Color Stay technology resists fading under fierce tropical sunshine for 7+ years",
                "Dirt pick-up resistance formula ensures dust washes away naturally during rainfall",
                "Excellent crack bridging stretches across minor hairline exterior plaster fissures",
                "Backed by a verified 7-year comprehensive exterior performance warranty"
            ],
            [
                {"label": "Brand", "value": "Asian Paints Limited"},
                {"label": "Category", "value": "Apex Ultima Weatherproof Exterior"},
                {"label": "Resin", "value": "100% High-Performance Acrylic Latex"},
                {"label": "Weatherproofing", "value": "Heavy Monsoon & UV Resistant"},
                {"label": "Warranty", "value": "7 Years Company Exterior Warranty"},
                {"label": "Coverage", "value": "55 - 65 sq.ft per Litre (2 Coats)"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-ult-1l", "label": "1 Litre Can", "unit": "Litre", "price": 395, "mrp": 560, "discountPercent": 29, "stock": 60, "image": v("/images/products/paint/apex-ultima-exterior-20l.webp")},
                {"id": "var-ult-4l", "label": "4 Litres Bucket", "unit": "4L Bucket", "price": 1480, "mrp": 2100, "discountPercent": 30, "stock": 70, "image": v("/images/products/paint/apex-ultima-exterior-20l.webp")},
                {"id": "var-ult-10l", "label": "10 Litres Bucket", "unit": "10L Bucket", "price": 3450, "mrp": 4900, "discountPercent": 30, "stock": 45, "image": v("/images/products/paint/apex-ultima-exterior-20l.webp")},
                {"id": "var-ult-20l", "label": "20 Litres Bucket", "unit": "20L Bucket", "price": 6450, "mrp": 9200, "discountPercent": 30, "stock": 35, "image": v("/images/products/paint/apex-ultima-exterior-20l.webp")},
            ]
        ),
        make_product(
            "birla-putty", "birla-white-wallcare-waterproof-putty-40kg",
            "Birla White WallCare Water Resistant White Cement Based Wall Putty (40kg)", "Birla White",
            "painting", "Painting", "Waterproof Wall Putty 40kg",
            "/images/products/finishing/birla-white-wallcare-waterproof-putty-40kg-bag-smooth-white-finish.webp",
            "HP Polymers · Extra High Whiteness · Prevents Paint Flaking & Seepage",
            ["HP Polymers", "Water Resistant", "Extra Whiteness", "Mirror Smooth Surface"],
            "Birla White WallCare is India's leading white cement-based wall putty. Enriched with specialized extra High-Performance (HP) polymers that fill masonry voids, eliminate paint flaking, and create a mirror-smooth foundation for luxury emulsion paints.",
            [
                "White cement base bonds chemically to plaster, preventing paint flaking and peeling",
                "Advanced HP polymers form a water-resistant sub-surface barrier against dampness",
                "High whiteness index (> 94%) brings out true, glowing depth in topcoat paint shades",
                "Ultra-smooth surface reduces paint consumption by up to 25% on interior walls",
                "Does not require water curing after application, saving labor and site turnaround time"
            ],
            [
                {"label": "Brand", "value": "Birla White (UltraTech Cement)"},
                {"label": "Product", "value": "WallCare Water Resistant Putty"},
                {"label": "Base", "value": "White Portland Cement + Polymers"},
                {"label": "Whiteness Index", "value": "> 94% on Hunter Scale"},
                {"label": "Coverage", "value": "18 - 22 sq.ft per kg (2 Coats at 1.5mm)"},
                {"label": "Curing", "value": "Self-Curing (No Post-Watering Needed)"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-put-20kg", "label": "20kg Bag", "unit": "20kg Bag", "price": 430, "mrp": 540, "discountPercent": 20, "stock": 100, "image": v("/images/products/finishing/birla-white-wallcare-waterproof-putty-40kg-bag-smooth-white-finish.webp")},
                {"id": "var-put-40kg", "label": "40kg Bag", "unit": "40kg Bag", "price": 790, "mrp": 980, "discountPercent": 19, "stock": 150, "image": v("/images/products/finishing/birla-white-wallcare-waterproof-putty-40kg-bag-smooth-white-finish.webp")},
            ]
        ),
    ])

    # ─── 16. Safety & Workwear ──────────────────────────────────────────────
    prods.extend([
        make_product(
            "pitbull-shoes", "pitbull-mirage-low-ankle-steel-toe-safety-shoes",
            "Pitbull Mirage Low Ankle Steel Toe Construction Safety Shoes", "Pitbull",
            "safety-workwear", "Safety & Workwear", "ISI Construction Helmets",
            "/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp",
            "200 Joules Steel Toe Cap · Oil & Acid Resistant PU Sole · Anti-Slip",
            ["200J Steel Toe", "Oil & Acid Resistant", "Anti-Slip PU Sole", "IS 15298 Certified"],
            "Pitbull Mirage low-ankle safety shoes are built with a certified 200 Joules impact-resistant steel toe cap and a dual-density injected polyurethane sole. Shields engineers and laborers against falling rebars, puncture hazards, and slippery site surfaces.",
            [
                "Hardened EN 12568 compliant steel toe cap withstands 200 Joules impact energy",
                "Direct injected dual-density PU sole provides high shock absorption and anti-fatigue cushion",
                "Deep grooved cleated tread pattern ensures maximum grip on wet mud, oil, and gravel",
                "Breathable mesh lining with moisture-wicking insole keeps feet dry during long site shifts",
                "Certified under BIS IS 15298 (Part 2) for comprehensive industrial occupational safety"
            ],
            [
                {"label": "Brand", "value": "Pitbull Safety Footwear"},
                {"label": "Toe Cap", "value": "200J Impact Resistant Steel Toe Cap"},
                {"label": "Upper Material", "value": "Genuine Grain Barton Leather"},
                {"label": "Sole", "value": "Direct Injected Dual-Density PU Sole"},
                {"label": "Standard", "value": "IS 15298 (Part 2) / CE Certified"},
                {"label": "Warranty", "value": "6 Months Sole Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-sh-uk6", "label": "UK Size 6 (Euro 40)", "unit": "Pair", "price": 490, "mrp": 950, "discountPercent": 48, "stock": 50, "image": v("/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp")},
                {"id": "var-sh-uk7", "label": "UK Size 7 (Euro 41)", "unit": "Pair", "price": 490, "mrp": 950, "discountPercent": 48, "stock": 60, "image": v("/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp")},
                {"id": "var-sh-uk8", "label": "UK Size 8 (Euro 42)", "unit": "Pair", "price": 490, "mrp": 950, "discountPercent": 48, "stock": 80, "image": v("/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp")},
                {"id": "var-sh-uk9", "label": "UK Size 9 (Euro 43)", "unit": "Pair", "price": 490, "mrp": 950, "discountPercent": 48, "stock": 70, "image": v("/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp")},
                {"id": "var-sh-uk10", "label": "UK Size 10 (Euro 44)", "unit": "Pair", "price": 490, "mrp": 950, "discountPercent": 48, "stock": 40, "image": v("/images/products/safety/pitbull-mirage-low-ankle-steel-toe-safety-shoes.webp")},
            ]
        ),
        make_product(
            "hillson-gumboots", "hillson-dragon-steel-toe-gumboots-15-high",
            "Hillson Dragon Steel Toe Waterproof Gumboots, 15 Inch High", "Hillson",
            "safety-workwear", "Safety & Workwear", "ISI Construction Helmets",
            "/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp",
            "15 Inch Tall Waterproof Shaft · Steel Toe Protection · Mud & Concrete Ready",
            ["15-Inch Shaft", "100% Waterproof", "Steel Toe Protection", "Anti-Skid Sole"],
            "Hillson Dragon 15-inch heavy-duty gumboots provide total waterproof and toe protection for concrete pouring, basement excavation, monsoon flooding, and chemical handling. Molded with seamless virgin PVC and a protective steel toe.",
            [
                "Tall 15-inch shaft prevents slurry, wet concrete, and muddy water from splashing in",
                "Built-in steel toe cap guards feet against falling masonry debris and heavy tools",
                "100% seamless single-shot injection molded PVC guarantees zero water seepage",
                "Deep aggressive cleated sole bites into wet clay, slush, and greasy surfaces",
                "Resistant to mild acids, alkalis, oils, and harsh concrete chemical admixtures"
            ],
            [
                {"label": "Brand", "value": "Hillson Footwear"},
                {"label": "Model", "value": "Dragon Steel Toe Gumboots"},
                {"label": "Shaft Height", "value": "15 Inches (380 mm)"},
                {"label": "Material", "value": "100% Virgin High-Grade Flexible PVC"},
                {"label": "Standard", "value": "IS 12254 / IS 15298 Certified"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-gum-uk7", "label": "UK Size 7", "unit": "Pair", "price": 550, "mrp": 850, "discountPercent": 35, "stock": 50, "image": v("/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp")},
                {"id": "var-gum-uk8", "label": "UK Size 8", "unit": "Pair", "price": 550, "mrp": 850, "discountPercent": 35, "stock": 60, "image": v("/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp")},
                {"id": "var-gum-uk9", "label": "UK Size 9", "unit": "Pair", "price": 550, "mrp": 850, "discountPercent": 35, "stock": 50, "image": v("/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp")},
                {"id": "var-gum-uk10", "label": "UK Size 10", "unit": "Pair", "price": 550, "mrp": 850, "discountPercent": 35, "stock": 40, "image": v("/images/products/safety/hillson-dragon-steel-toe-gumboots-15-high.webp")},
            ]
        ),
        make_product(
            "karam-helmet", "karam-pn-521-safety-helmet-isi",
            "Karam PN 521 ISI Marked Construction Hard Hat Safety Helmet", "Karam",
            "safety-workwear", "Safety & Workwear", "ISI Construction Helmets",
            "/images/products/safety/karam-pn-521-helmet-isi.webp",
            "UV Stabilized Polymer Shell · 6-Point Textile Suspension · ISI Marked",
            ["6-Point Suspension", "UV Stabilized", "IS 2925 Certified", "Sweatband Included"],
            "Karam PN 521 is India's most trusted industrial construction safety helmet. Engineered from high-density UV-stabilized polymer with a 6-point textile cradle harness that absorbs and disperses overhead impact shock away from the skull.",
            [
                "High-density polymer shell offers high impact and penetration resistance",
                "6-point textile suspension harness cushions head against heavy falling objects",
                "Adjustable nape strap mechanism fits all head circumferences smoothly",
                "Integrated absorbent cotton sweatband keeps brow dry during hot summer work",
                "BIS IS 2925 certified for electrical hazard insulation and structural safety"
            ],
            [
                {"label": "Brand", "value": "Karam Safety Private Limited"},
                {"label": "Model", "value": "Sheltek PN 521"},
                {"label": "Standard", "value": "IS 2925:1984 & EN 397 Marked"},
                {"label": "Cradle", "value": "6-Point Webbing Suspension"},
                {"label": "Electrical Resistance", "value": "Voltage Proof up to 2000V"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-helm-yel", "label": "Yellow (Laborers / Operators)", "unit": "Piece", "price": 195, "mrp": 320, "discountPercent": 39, "stock": 100, "image": v("/images/products/safety/karam-pn-521-helmet-isi.webp")},
                {"id": "var-helm-wht", "label": "White (Engineers / Supervisors)", "unit": "Piece", "price": 195, "mrp": 320, "discountPercent": 39, "stock": 100, "image": v("/images/products/safety/karam-pn-521-helmet-isi.webp")},
                {"id": "var-helm-blu", "label": "Blue (Electricians / Techs)", "unit": "Piece", "price": 195, "mrp": 320, "discountPercent": 39, "stock": 60, "image": v("/images/products/safety/karam-pn-521-helmet-isi.webp")},
                {"id": "var-helm-grn", "label": "Green (Safety Officers)", "unit": "Piece", "price": 195, "mrp": 320, "discountPercent": 39, "stock": 50, "image": v("/images/products/safety/karam-pn-521-helmet-isi.webp")},
            ]
        ),
        make_product(
            "karam-harness", "karam-fs-51-full-body-safety-harness",
            "Karam FS-51 Full Body Fall Arrest Safety Harness with Lanyard", "Karam",
            "safety-workwear", "Safety & Workwear", "Full-Body Fall Arrest Harness",
            "/images/products/safety/karam-fs-51-full-harness.webp",
            "Full Body Fall Arrest · Dorsal D-Ring · High-Strength Polyester Webbing",
            ["Dorsal D-Ring", "Fall Arrest System", "IS 3521 Certified", "Adjustable Straps"],
            "Karam FS-51 full body safety harness engineered for fall arrest during scaffolding, roofing, facade cleaning, and high-rise tower construction. Features a forged dorsal D-ring and adjustable shoulder, chest, and thigh straps.",
            [
                "High-tenacity 44mm polyester webbing with high breaking strength (> 23 kN)",
                "Forged alloy steel dorsal D-ring anchors securely to shock-absorbing fall lanyards",
                "Fully adjustable thigh and chest straps ensure an ergonomic, snug fit for all body sizes",
                "Dual-color webbing scheme allows rapid identification of shoulder and leg straps",
                "Certified to IS 3521:1999 and European EN 361 standards for occupational safety"
            ],
            [
                {"label": "Brand", "value": "Karam Safety"},
                {"label": "Model", "value": "FS-51 Full Body Harness"},
                {"label": "Webbing", "value": "44 mm High Tenacity Polyester"},
                {"label": "Breaking Strength", "value": "> 2300 kg (23 kN)"},
                {"label": "Standard", "value": "IS 3521:1999 & EN 361 Certified"},
                {"label": "Warranty", "value": "1 Year Official Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-har-single", "label": "Standard with Single Lanyard & Snap Hook", "unit": "Set", "price": 1250, "mrp": 1850, "discountPercent": 32, "stock": 40, "image": v("/images/products/safety/karam-fs-51-full-harness.webp")},
                {"id": "var-har-double", "label": "Pro Double Scaffold Hook Energy Absorber", "unit": "Set", "price": 1850, "mrp": 2650, "discountPercent": 30, "stock": 30, "image": v("/images/products/safety/karam-fs-51-full-harness.webp")},
            ]
        ),
        make_product(
            "karam-goggles", "karam-es-01-protective-safety-goggles",
            "Karam ES-01 Clear Polycarbonate Anti-Scratch Protective Safety Goggles", "Karam",
            "safety-workwear", "Safety & Workwear", "Protective Goggles & Dust Masks",
            "/images/products/safety/karam-es-01-safety-goggles.webp",
            "Hard-Coated Polycarbonate Lens · 99.9% UV Protection · Panoramic Vision",
            ["Anti-Scratch Lens", "Panoramic Vision", "99.9% UV Shield", "IS 5983 Certified"],
            "Clear wrap-around safety glasses that protect eyes from flying stone chips, metal sparks, sawdust, and chemical splashes. Hard-coated optical polycarbonate lens resists scratching and blocks 99.9% of harmful UV rays.",
            [
                "Zero distortion optical Class-1 polycarbonate lens provides crystal-clear vision",
                "Hard-coated outer surface resists scratches during heavy angle grinding and cutting",
                "Contoured wrap-around temples provide snug lateral eye protection without blind spots",
                "Soft flexible nose bridge and lightweight frame ensure comfortable all-day wear",
                "Certified to IS 5983 and ANSI Z87.1 for high-velocity particle impact protection"
            ],
            [
                {"label": "Brand", "value": "Karam Safety"},
                {"label": "Model", "value": "Horizon ES-01"},
                {"label": "Lens Material", "value": "Optical Grade Polycarbonate"},
                {"label": "Impact Resistance", "value": "High Velocity Steel Ball Impact Tested"},
                {"label": "Standard", "value": "IS 5983:1980 / ANSI Z87.1"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-gog-clr", "label": "Clear Lens (Grinding / Carpentry)", "unit": "Piece", "price": 95, "mrp": 160, "discountPercent": 40, "stock": 100, "image": v("/images/products/safety/karam-es-01-safety-goggles.webp")},
                {"id": "var-gog-smk", "label": "Smoked Grey (Outdoor Sun & Glare)", "unit": "Piece", "price": 115, "mrp": 185, "discountPercent": 38, "stock": 80, "image": v("/images/products/safety/karam-es-01-safety-goggles.webp")},
            ]
        ),
        make_product(
            "karam-mask", "karam-dust-mask-pack-50",
            "Karam ISI Certified High-Filtration Construction Dust Mask (Pack of 50)", "Karam",
            "safety-workwear", "Safety & Workwear", "Protective Goggles & Dust Masks",
            "/images/products/safety/karam-dust-mask-pack-50.webp",
            "Multi-Layer Electrostatic Filter · Filters Fine Cement & Plaster Dust · FFP2",
            ["Multi-Layer Filter", "Pack of 50", "IS 9473 FFP2", "Adjustable Nose Clip"],
            "High-filtration particulate respirator masks engineered to filter airborne cement dust, tile cutting powder, wall putty particulates, and paint mist. Features an electrostatic melt-blown filtration layer and an aluminum nose clip for a tight seal.",
            [
                "Melt-blown electrostatic middle layer captures over 95% of sub-micron airborne dust",
                "Protects mason and painter lungs from silicosis and hazardous cement lime inhalation",
                "Adjustable aluminum nose clip with soft foam cushion prevents safety goggle fogging",
                "Ultrasonically welded elastic headbands maintain comfortable tension without breaking",
                "Certified to IS 9473 FFP2 / N95 standards for industrial respiratory protection"
            ],
            [
                {"label": "Brand", "value": "Karam Safety"},
                {"label": "Classification", "value": "IS 9473 FFP2 / EN 149 Class"},
                {"label": "Filtration Efficiency", "value": "> 95% at 0.3 Micron Particulate"},
                {"label": "Pack Quantity", "value": "50 Pieces Box"},
                {"label": "Standard", "value": "IS 9473:2002 BIS Marked"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-msk-std", "label": "Standard FFP2 Dust Mask (Box of 50)", "unit": "Box (50 pcs)", "price": 450, "mrp": 750, "discountPercent": 40, "stock": 60, "image": v("/images/products/safety/karam-dust-mask-pack-50.webp")},
                {"id": "var-msk-carb", "label": "Activated Carbon Filter (Box of 50)", "unit": "Box (50 pcs)", "price": 720, "mrp": 1150, "discountPercent": 37, "stock": 40, "image": v("/images/products/safety/karam-dust-mask-pack-50.webp")},
            ]
        ),
    ])

    # ─── 17. Tools, Power Tools & General Hardware ──────────────────────────
    prods.extend([
        make_product(
            "bosch-gsb550", "bosch-gsb-550-professional-impact-drill",
            "Bosch GSB 550 Professional 550W Impact Drill Machine with 13mm Keyed Chuck", "Bosch",
            "tools-hardware", "Tools, Power Tools & General Hardware", "Professional Impact Drills",
            "/images/products/tools/bosch-gsb-550-professional-impact-drill-machine-550w-with-13mm-chuck.webp",
            "550W Powerful Copper Motor · Forward/Reverse · Dual Rotary & Hammer Modes",
            ["550W Motor", "13mm Keyed Chuck", "Hammer & Rotary Modes", "Variable Speed"],
            "Bosch GSB 550 is the benchmark compact corded impact drill for masonry, concrete, metal, and wood drilling. Equipped with a robust 550W motor, electronic variable speed control, and smooth forward/reverse rotation for screwdriving.",
            [
                "Powerful 550W high-torque motor drills up to 13mm in masonry and concrete",
                "Dual mode selector switches easily between impact hammer drilling and smooth rotary drilling",
                "Electronic speed trigger with pre-setting dial allows precise low-RPM screwdriving",
                "All-metal 13mm keyed chuck holds large drill bits securely without slipping under load",
                "Includes depth gauge stop and 360-degree adjustable auxiliary side handle"
            ],
            [
                {"label": "Brand", "value": "Bosch Power Tools"},
                {"label": "Model", "value": "GSB 550 Professional"},
                {"label": "Rated Power Input", "value": "550 Watts (230V AC)"},
                {"label": "No-Load Speed", "value": "0 - 2800 RPM"},
                {"label": "Impact Rate", "value": "0 - 44,800 BPM"},
                {"label": "Drilling Capacity", "value": "Concrete: 13mm, Steel: 10mm, Wood: 25mm"},
                {"label": "Warranty", "value": "1 Year Official Bosch Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-gsb-tool", "label": "Tool Only in Carton Box", "unit": "Kit", "price": 2450, "mrp": 4100, "discountPercent": 40, "stock": 50, "image": v("/images/products/tools/bosch-gsb-550-professional-impact-drill-machine-550w-with-13mm-chuck.webp")},
                {"id": "var-gsb-kit", "label": "With 100-Piece Accessory Kit & Case", "unit": "Carry Case Kit", "price": 3850, "mrp": 5990, "discountPercent": 36, "stock": 40, "image": v("/images/products/tools/bosch-gsb-550-professional-impact-drill-machine-550w-with-13mm-chuck.webp")},
            ]
        ),
        make_product(
            "bosch-gws600", "bosch-gws-600-angle-grinder-4-inch",
            "Bosch GWS 600 Heavy-Duty 670W 4-Inch Angle Grinder Machine", "Bosch",
            "tools-hardware", "Tools, Power Tools & General Hardware", "Heavy-Duty Angle Grinders",
            "/images/products/tools/bosch-gws-600-angle-grinder.webp",
            "670W High Power · Slim Barrel Grip · Cutting Metal, Granite & Tiles",
            ["670W High Power", "Slim Barrel Grip", "11,000 RPM", "Burst-Proof Guard"],
            "Bosch GWS 600 angle grinder is the contractor's choice for metal cutting, rebar slicing, weld deburring, and granite polishing. Engineered with a compact, ultra-slim barrel grip and heat-resistant copper armature.",
            [
                "High performance 670W motor delivers 11,000 RPM for fast, effortless cutting",
                "Slim, ergonomic barrel housing fits comfortably in the palm for single-hand control",
                "Spindle lock button enables rapid, hassle-free disc changes using the two-pin spanner",
                "Burst-proof safety guard deflects sparks and protects operator in case of disc failure",
                "Specially designed labyrinth air vents keep abrasive stone and metal grit out of motor"
            ],
            [
                {"label": "Brand", "value": "Bosch Power Tools"},
                {"label": "Model", "value": "GWS 600 Professional"},
                {"label": "Disc Diameter", "value": "100 mm (4 Inch)"},
                {"label": "Rated Power", "value": "670 Watts"},
                {"label": "No-Load Speed", "value": "11,000 RPM"},
                {"label": "Spindle Thread", "value": "M10"},
                {"label": "Warranty", "value": "1 Year Official Bosch Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-gws-tool", "label": "Machine Only in Box", "unit": "Piece", "price": 2250, "mrp": 3600, "discountPercent": 38, "stock": 50, "image": v("/images/products/tools/bosch-gws-600-angle-grinder.webp")},
                {"id": "var-gws-disc", "label": "With 5 Cutting & Grinding Wheels", "unit": "Kit", "price": 2490, "mrp": 3990, "discountPercent": 38, "stock": 40, "image": v("/images/products/tools/bosch-gws-600-angle-grinder.webp")},
            ]
        ),
        make_product(
            "bosch-gbh220", "bosch-gbh-220-rotary-hammer",
            "Bosch GBH 220 Professional 720W SDS-Plus 3-Mode Rotary Hammer Drill", "Bosch",
            "tools-hardware", "Tools, Power Tools & General Hardware", "Professional Impact Drills",
            "/images/products/tools/bosch-gbh-220-rotary-hammer.webp",
            "720W Powerful Motor · 2.0 Joules Impact Energy · 3-Mode Versatility",
            ["720W Motor", "2.0J Impact Energy", "SDS-Plus Chuck", "3 Operating Modes"],
            "Bosch GBH 220 is a powerful 720W rotary hammer designed for drilling through dense RCC beams, concrete pillars, and masonry. Features 3 operating modes: hammer drilling, rotary only, and chiseling mode for removing old floor tiles.",
            [
                "Pneumatic hammer mechanism delivers 2.0 Joules impact energy for fast concrete drilling",
                "Three operating modes: Rotary Drilling, Hammer Drilling, and Dedicated Chiseling",
                "SDS-Plus chuck system enables one-touch bit insertion without tightening tools",
                "Overload safety clutch disengages motor automatically if drill bit jams in steel rebar",
                "Ergonomic soft-grip handle and vibration damping reduce operator forearm fatigue"
            ],
            [
                {"label": "Brand", "value": "Bosch Power Tools"},
                {"label": "Model", "value": "GBH 220 Professional"},
                {"label": "Input Power", "value": "720 Watts"},
                {"label": "Impact Energy", "value": "2.0 Joules (EPTA)"},
                {"label": "Max Drilling Concrete", "value": "22 mm Diameter (Optimal 4 - 12mm)"},
                {"label": "Warranty", "value": "1 Year Bosch National Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-gbh-std", "label": "Standard Kit in Carrying Case", "unit": "Kit", "price": 4850, "mrp": 7200, "discountPercent": 33, "stock": 35, "image": v("/images/products/tools/bosch-gbh-220-rotary-hammer.webp")},
                {"id": "var-gbh-bits", "label": "With 5 SDS-Plus Masonry Bits Set", "unit": "Pro Kit", "price": 5400, "mrp": 7950, "discountPercent": 32, "stock": 25, "image": v("/images/products/tools/bosch-gbh-220-rotary-hammer.webp")},
            ]
        ),
        make_product(
            "dewalt-dw801", "dewalt-dw801-heavy-angle-grinder",
            "DeWalt DW801 850W Heavy-Duty 100mm Angle Grinder", "DeWalt",
            "tools-hardware", "Tools, Power Tools & General Hardware", "Heavy-Duty Angle Grinders",
            "/images/products/tools/dewalt-dw801-grinder-4.webp",
            "850W High-Torque Motor · Epoxy Coated Field Coils · Metal Fabrication",
            ["850W High Torque", "Epoxy Protected Armature", "11,000 RPM", "Metal & Masonry"],
            "DeWalt DW801 is an industrial-duty 850W 4-inch angle grinder engineered for continuous metal fabrication and masonry cutting. Epoxy-coated armature windings protect against abrasive dust abrasion.",
            [
                "High power 850-watt motor handles severe loads without bogging down",
                "Epoxy-coated field coils provide extreme protection against abrasive metal shavings",
                "High-efficiency motor cooling fan keeps internal components cool during all-day use",
                "Low profile gearcase allows easy access into tight corner welds and structural frames",
                "Heavy-duty ball and roller bearings ensure long industrial tool operating life"
            ],
            [
                {"label": "Brand", "value": "DeWalt Industrial Tools"},
                {"label": "Model", "value": "DW801 Heavy Duty"},
                {"label": "Power Input", "value": "850 Watts"},
                {"label": "Wheel Diameter", "value": "100 mm (4 Inch)"},
                {"label": "Warranty", "value": "2 Years Official Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-dw801-std", "label": "Standard 100mm Grinder", "unit": "Piece", "price": 2750, "mrp": 4200, "discountPercent": 35, "stock": 35, "image": v("/images/products/tools/dewalt-dw801-grinder-4.webp")},
                {"id": "var-dw801-hnd", "label": "With Guard & Auxiliary Handle", "unit": "Kit", "price": 2890, "mrp": 4450, "discountPercent": 35, "stock": 30, "image": v("/images/products/tools/dewalt-dw801-grinder-4.webp")},
            ]
        ),
        make_product(
            "dewalt-dwd024", "dewalt-dwd024-rotary-impact-drill",
            "DeWalt DWD024 650W 13mm Variable Speed Reversible Impact Drill", "DeWalt",
            "tools-hardware", "Tools, Power Tools & General Hardware", "Professional Impact Drills",
            "/images/products/tools/dewalt-dwd024-drill-13mm.webp",
            "650W High Output · Variable Speed Trigger · Sealed Ball Bearings",
            ["650W Motor", "13mm Chuck", "Sealed Bearings", "Rubber Overmould"],
            "DeWalt DWD024 is a durable 650W impact drill engineered for drilling concrete, masonry, wood, and steel. Built with sealed ball bearings that prevent dust entry and an ergonomic rubber grip for maximum tool control.",
            [
                "High output 650-watt motor provides high drilling speed in tough masonry and steel",
                "Variable speed sensitive trigger allows smooth, accurate hole starting without bit walk",
                "Sealed ball bearings and heavy steel gears ensure exceptional contractor longevity",
                "Compact, well-balanced body fits easily into narrow joist and cabinet spaces",
                "Lock-on button enables continuous drilling during large batch production runs"
            ],
            [
                {"label": "Brand", "value": "DeWalt Industrial Tools"},
                {"label": "Model", "value": "DWD024 Impact Drill"},
                {"label": "Power Rating", "value": "650 Watts"},
                {"label": "Chuck Capacity", "value": "1.5 - 13 mm Keyed Chuck"},
                {"label": "Warranty", "value": "2 Years DeWalt Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-dwd-std", "label": "Machine in Box", "unit": "Piece", "price": 2850, "mrp": 4400, "discountPercent": 35, "stock": 35, "image": v("/images/products/tools/dewalt-dwd024-drill-13mm.webp")},
                {"id": "var-dwd-hnd", "label": "With Auxiliary Handle & Depth Stop", "unit": "Kit", "price": 2990, "mrp": 4650, "discountPercent": 36, "stock": 30, "image": v("/images/products/tools/dewalt-dwd024-drill-13mm.webp")},
            ]
        ),
        make_product(
            "bosch-gst650", "bosch-gst-650-professional-jigsaw",
            "Bosch GST 650 450W Corded Professional Variable Speed Jigsaw", "Bosch",
            "tools-hardware", "Tools, Power Tools & General Hardware", "Heavy-Duty Angle Grinders",
            "/images/products/tools/bosch-gst-650-jigsaw.webp",
            "450W Motor · Smooth Curve Cutting · Adjustable Base Bevel · Wood & Metal",
            ["450W Motor", "Variable Speed", "Stroke Rate 3100 SPM", "Bevel 45°"],
            "Bosch GST 650 is an essential power tool for carpenters and interior contractors. Cuts intricate curves, circular sink cutouts in laminate countertops, and straight lines through plywood, solid wood, and sheet metal.",
            [
                "Reliable 450-watt motor delivers up to 3,100 strokes per minute for clean cutting",
                "Stroke rate pre-selection dial optimizes cutting speed across different materials",
                "Sturdy steel base plate bevels up to 45 degrees left and right for miter cuts",
                "Compact bow-handle design with two-finger trigger ensures fatigue-free cutting",
                "Clear cutting line view with built-in dust blower that keeps pencil lines visible"
            ],
            [
                {"label": "Brand", "value": "Bosch Power Tools"},
                {"label": "Model", "value": "GST 650 Professional"},
                {"label": "Power Input", "value": "450 Watts"},
                {"label": "Stroke Rate", "value": "800 - 3100 SPM"},
                {"label": "Cutting Depth", "value": "Wood: 65mm, Aluminum: 10mm, Steel: 3mm"},
                {"label": "Warranty", "value": "1 Year Official Bosch Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-gst-std", "label": "Standard Jigsaw in Box", "unit": "Piece", "price": 2950, "mrp": 4600, "discountPercent": 36, "stock": 30, "image": v("/images/products/tools/bosch-gst-650-jigsaw.webp")},
                {"id": "var-gst-blades", "label": "With 5 T-Shank Wood Blades Pack", "unit": "Kit", "price": 3250, "mrp": 4990, "discountPercent": 35, "stock": 25, "image": v("/images/products/tools/bosch-gst-650-jigsaw.webp")},
            ]
        ),
    ])

    # ─── 18. Waterproofing & Repairing ──────────────────────────────────────
    prods.extend([
        make_product(
            "drf-lw-wp", "dr-fixit-lw-plus-waterproofing-5l",
            "Dr. Fixit 101 LW+ Integral Liquid Waterproofing Compound for Concrete & Plaster", "Dr. Fixit",
            "waterproofing-repairing", "Waterproofing & Repairing", "Integral Liquid Waterproofing",
            "/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp",
            "Essential for Concrete & Plaster · Inhibits Rusting of TMT Steel · IS 2645",
            ["Integral Waterproofing", "Corrosion Guard", "Improves Slump", "IS 2645 Certified"],
            "Dr. Fixit 101 LW+ is India's leading integral liquid waterproofing compound for site-mixed concrete and brick-joint plastering mortar. Fills micro-capillaries to eliminate water leakage, dampness, and rebar corrosion.",
            [
                "Eliminates internal capillary voids to make concrete completely water impermeable",
                "Protects embedded TMT steel rebars against chloride attack and structural rusting",
                "Improves concrete workability without increasing water-cement ratio or sacrificing strength",
                "Significantly reduces plastic shrinkage cracking and surface crazing in external plaster",
                "Simple site dosage: 200 ml per 50 kg bag of cement mixed directly into gauging water"
            ],
            [
                {"label": "Brand", "value": "Dr. Fixit (Pidilite)"},
                {"label": "Code", "value": "101 LW+"},
                {"label": "Standard", "value": "IS 2645:2003 & IS 9103:2000"},
                {"label": "Application", "value": "Foundation Footings, Roof Slabs, Plastering"},
                {"label": "Dosage", "value": "200 ml per 50kg bag of cement"},
                {"label": "Shelf Life", "value": "2 Years in Original Sealed Packing"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-lw-wp-1l", "label": "1 Litre Bottle", "unit": "Bottle", "price": 175, "mrp": 210, "discountPercent": 17, "stock": 100, "image": v("/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp")},
                {"id": "var-lw-wp-5l", "label": "5 Litres Can", "unit": "Can (5L)", "price": 720, "mrp": 890, "discountPercent": 19, "stock": 80, "image": v("/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp")},
                {"id": "var-lw-wp-10l", "label": "10 Litres Can", "unit": "Can (10L)", "price": 1380, "mrp": 1720, "discountPercent": 20, "stock": 50, "image": v("/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp")},
                {"id": "var-lw-wp-20l", "label": "20 Litres Drum", "unit": "Drum (20L)", "price": 2600, "mrp": 3250, "discountPercent": 20, "stock": 35, "image": v("/images/products/waterproofing/dr-fixit-lw-plus-waterproofing-5l.webp")},
            ]
        ),
        make_product(
            "drf-urp", "dr-fixit-urp-302-bonding-agent-5kg",
            "Dr. Fixit Super Latex 302 URP Universal Polymer Repair & Bonding Agent", "Dr. Fixit",
            "waterproofing-repairing", "Waterproofing & Repairing", "Polymer Bonding Agents (URP)",
            "/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp",
            "SBR Latex Polymer · Bridges Old-to-New Concrete · Structural Repairs",
            ["SBR Polymer", "Old-to-New Bond", "Structural Repair", "High Flexural Strength"],
            "Dr. Fixit Super Latex 302 URP is a high-solids styrene butadiene rubber (SBR) latex polymer. Used as a structural bonding slurry between old and new concrete, waterproof slurry coat for bathrooms, and repair mortar modifier.",
            [
                "Creates an unbreakable chemical bond between existing old concrete and fresh repair mortar",
                "Modifies repair mortar to achieve high compressive and flexural strength with low shrinkage",
                "Excellent waterproof barrier coating for sunken bathroom slabs, chajjas, and parapets",
                "Prevents crack propagation and spalling in damaged concrete columns and beams",
                "High resistance to water penetration, salt spray, and mild atmospheric chemicals"
            ],
            [
                {"label": "Brand", "value": "Dr. Fixit (Pidilite)"},
                {"label": "Polymer Base", "value": "Styrene Butadiene Rubber (SBR) Latex"},
                {"label": "Solid Content", "value": "44 ± 1%"},
                {"label": "Bond Strength", "value": "> 2.5 N/mm² (Concrete-to-Concrete)"},
                {"label": "Usage", "value": "Bonding Slurry (1:1 with Cement), Repair Mortar"},
                {"label": "Shelf Life", "value": "18 Months"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-urp-1kg", "label": "1 kg Bottle", "unit": "Bottle", "price": 310, "mrp": 380, "discountPercent": 18, "stock": 70, "image": v("/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp")},
                {"id": "var-urp-5kg", "label": "5 kg Can", "unit": "Can (5kg)", "price": 1350, "mrp": 1720, "discountPercent": 22, "stock": 60, "image": v("/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp")},
                {"id": "var-urp-10kg", "label": "10 kg Can", "unit": "Can (10kg)", "price": 2550, "mrp": 3250, "discountPercent": 22, "stock": 40, "image": v("/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp")},
                {"id": "var-urp-20kg", "label": "20 kg Drum", "unit": "Drum (20kg)", "price": 4850, "mrp": 6200, "discountPercent": 22, "stock": 25, "image": v("/images/products/waterproofing/dr-fixit-urp-302-bonding-agent-5kg.webp")},
            ]
        ),
        make_product(
            "drf-pidifin", "dr-fixit-pidifin-2k-20kg-kit",
            "Dr. Fixit Pidifin 2K 2-Component Polymer Waterproof Coating for Terrace & Bathroom", "Dr. Fixit",
            "waterproofing-repairing", "Waterproofing & Repairing", "Elastomeric Terrace Coatings",
            "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp",
            "2-Part Acrylic Cementitious Elastomeric Membrane · 100% Waterproof",
            ["2-Component Kit", "Elastomeric Membrane", "Water Tank Safe", "Bridges Micro-Cracks"],
            "Dr. Fixit Pidifin 2K is a two-component acrylic polymer-modified elastomeric cementitious waterproofing coating. Consists of a liquid polymer and cement-based powder that mix into a flexible waterproof membrane for terraces and water tanks.",
            [
                "Forms a seamless, flexible elastomeric membrane that bridges thermal hairline cracks",
                "Certified non-toxic and potable water safe for overhead and underground drinking water tanks",
                "Withstands positive water pressure up to 5 bar (50m head of water)",
                "Bonds tenaciously to damp concrete surfaces without requiring a separate primer",
                "Ideal for waterproofing sunken toilet slabs before tile adhesive application"
            ],
            [
                {"label": "Brand", "value": "Dr. Fixit (Pidilite)"},
                {"label": "Kit Composition", "value": "Part A (Liquid Polymer) + Part B (Special Powder)"},
                {"label": "Elongation at Break", "value": "> 50% High Flexibility"},
                {"label": "Coverage", "value": "10 - 12 sq.ft per kg in 2 coats (1.0 mm thickness)"},
                {"label": "Water Pressure", "value": "Resists up to 5 Bar Positive Head"},
                {"label": "Standard", "value": "EN 14891 Certified Waterproofing"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-pid-9kg", "label": "9kg Kit (Small Bathroom)", "unit": "Kit (9kg)", "price": 1250, "mrp": 1600, "discountPercent": 22, "stock": 35, "image": v("/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp")},
                {"id": "var-pid-20kg", "label": "20kg Kit (Standard Terrace / Bath)", "unit": "Kit (20kg)", "price": 2450, "mrp": 3100, "discountPercent": 21, "stock": 45, "image": v("/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp")},
                {"id": "var-pid-40kg", "label": "40kg Jumbo Kit (Large Roof)", "unit": "Kit (40kg)", "price": 4650, "mrp": 5900, "discountPercent": 21, "stock": 25, "image": v("/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit.webp")},
            ]
        ),
        make_product(
            "drf-raincoat", "dr-fixit-raincoat-waterproof-coating-20l",
            "Dr. Fixit Raincoat Heavy-Duty Elastomeric Waterproof Exterior Wall Coating", "Dr. Fixit",
            "waterproofing-repairing", "Waterproofing & Repairing", "Damp-Proof Surface Barriers",
            "/images/products/waterproofing/dr-fixit-raincoat-waterproof-coating-20l.webp",
            "110 Micron Thick Dry Film · 2x Thicker Than Exterior Paint · 10-Yr Guarantee",
            ["Elastomeric Coating", "110 Micron Film", "Bridges 2mm Cracks", "10-Yr Guarantee"],
            "Dr. Fixit Raincoat is an ultra-durable elastomeric high-build waterproof coating for exterior building facades. Dries to an elastic 110-micron thick waterproof barrier that bridges exterior wall cracks up to 2mm wide.",
            [
                "Provides a continuous elastic rubber-like shield twice as thick as standard exterior paint",
                "High elasticity bridges structural and thermal cracks up to 2mm without tearing",
                "Resists wind-driven torrential monsoon rain, extreme UV heat, and atmospheric smog",
                "Protects interior walls permanently from damp water patches and paint bubbling",
                "Backed by a verified 10-year manufacturer exterior waterproofing warranty"
            ],
            [
                {"label": "Brand", "value": "Dr. Fixit (Pidilite)"},
                {"label": "Type", "value": "High-Build Elastomeric Acrylic Polymer"},
                {"label": "Film Thickness", "value": "110 - 120 Microns DFT (in 2 Coats)"},
                {"label": "Crack Bridging", "value": "Up to 2.0 mm Active Hairline Cracks"},
                {"label": "Warranty", "value": "10 Years Waterproofing Guarantee"},
                {"label": "Coverage", "value": "35 - 40 sq.ft per Litre (2 Coats)"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-rain-4l", "label": "4 Litres Bucket", "unit": "4L Bucket", "price": 1150, "mrp": 1500, "discountPercent": 23, "stock": 40, "image": v("/images/products/waterproofing/dr-fixit-raincoat-waterproof-coating-20l.webp")},
                {"id": "var-rain-20l", "label": "20 Litres Bucket", "unit": "20L Bucket", "price": 4850, "mrp": 6200, "discountPercent": 22, "stock": 30, "image": v("/images/products/waterproofing/dr-fixit-raincoat-waterproof-coating-20l.webp")},
            ]
        ),
        make_product(
            "drf-crackx", "dr-fixit-crack-x-paste-1kg",
            "Dr. Fixit Crack-X Paste Acrylic Flexible Crack Filler for Internal & External Walls", "Dr. Fixit",
            "waterproofing-repairing", "Waterproofing & Repairing", "Crack Sealants & Putty",
            "/images/products/waterproofing/dr-fixit-crack-x-paste-1kg.webp",
            "Fills Cracks up to 5mm · Flexible & Non-Shrink · Paintable in 24 Hrs",
            ["Fills up to 5mm", "Flexible Acrylic", "Zero Shrinkage", "Paintable"],
            "Single-pack ready-to-use flexible acrylic paste formulated with glass fibers and special aggregate fillers. Seals static and dynamic plaster cracks up to 5mm width on interior and exterior walls without shrinkage.",
            [
                "Accommodates thermal movement without popping out or cracking like brittle white cement",
                "Fills deep masonry plaster fissures up to 5mm width in a single or double pass",
                "Over-coatable with all standard interior and exterior emulsions after 24 hours",
                "Smooth buttery consistency applies cleanly using a standard painter's putty blade",
                "Resists UV degradation and atmospheric moisture in outdoor facades"
            ],
            [
                {"label": "Brand", "value": "Dr. Fixit (Pidilite)"},
                {"label": "Material", "value": "Reinforced Acrylic Polymer Paste"},
                {"label": "Max Crack Width", "value": "Up to 5 mm (0.2 Inch)"},
                {"label": "Elongation", "value": "> 100% Elastic Recovery"},
                {"label": "Drying Time", "value": "Touch Dry: 30 Mins, Paintable: 24 Hours"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-crk-500g", "label": "500g Tub", "unit": "Tub", "price": 115, "mrp": 150, "discountPercent": 23, "stock": 70, "image": v("/images/products/waterproofing/dr-fixit-crack-x-paste-1kg.webp")},
                {"id": "var-crk-1kg", "label": "1 kg Tub", "unit": "Tub (1kg)", "price": 195, "mrp": 250, "discountPercent": 22, "stock": 80, "image": v("/images/products/waterproofing/dr-fixit-crack-x-paste-1kg.webp")},
                {"id": "var-crk-5kg", "label": "5 kg Bucket", "unit": "Bucket (5kg)", "price": 850, "mrp": 1150, "discountPercent": 26, "stock": 40, "image": v("/images/products/waterproofing/dr-fixit-crack-x-paste-1kg.webp")},
            ]
        ),
        make_product(
            "drf-pidifin-terrace", "dr-fixit-pidifin-2k-terrace-kit",
            "Dr. Fixit Pidifin 2K High-Elongation Waterproofing Slurry for Water Tanks & Sunken Slabs", "Dr. Fixit",
            "waterproofing-repairing", "Waterproofing & Repairing", "Elastomeric Terrace Coatings",
            "/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit-2-component-waterproofing-coating-for-terrace-bathroom.webp",
            "CFRI Certified Food Grade Safe · High Hydrostatic Head · Zero Water Leakage",
            ["CFRI Food Safe", "Water Tank Certified", "Resists 50m Head", "Flexible Slurry"],
            "Specialized high-density polymer elastomeric slurry coating formulated for concrete water retaining structures, underground sumps, overhead tanks, and sunken bathroom slabs. Certified by Central Food Technological Research Institute (CFTRI) as completely safe for potable drinking water.",
            [
                "Certified 100% safe for potable drinking water by Central Food Technological Institute",
                "Withstands extreme hydrostatic head pressure up to 50 meters in underground sumps",
                "Dense crystalline and polymer network seals micro-cracks and honeycombs in concrete",
                "Excellent adhesion to green damp concrete without blistering or peeling off",
                "Seamless continuous barrier eliminates joint weak points found in sheet membranes"
            ],
            [
                {"label": "Brand", "value": "Dr. Fixit (Pidilite)"},
                {"label": "Standard", "value": "CFTRI Certified for Potable Water Contact"},
                {"label": "Hydrostatic Resistance", "value": "50m Head Water Pressure"},
                {"label": "Color", "value": "Cementitious Slate Grey"},
                {"label": "Application Area", "value": "Drinking Water Tanks, Sumps, Sunken Slabs"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-pidsump-20", "label": "20kg Standard Kit", "unit": "Kit (20kg)", "price": 2550, "mrp": 3250, "discountPercent": 22, "stock": 40, "image": v("/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit-2-component-waterproofing-coating-for-terrace-bathroom.webp")},
                {"id": "var-pidsump-40", "label": "40kg Commercial Heavy Kit", "unit": "Kit (40kg)", "price": 4800, "mrp": 6200, "discountPercent": 23, "stock": 25, "image": v("/images/products/waterproofing/dr-fixit-pidifin-2k-20kg-kit-2-component-waterproofing-coating-for-terrace-bathroom.webp")},
            ]
        ),
    ])

    return prods

print("Finishing group ready.")
