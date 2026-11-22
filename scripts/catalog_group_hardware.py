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

def get_hardware_products():
    prods = []

    # ─── 7. Kitchen Sinks & Faucets ─────────────────────────────────────────
    prods.extend([
        make_product(
            "futura-dura", "futura-dura-ss-sink",
            "Futura Dura SS 304 Single Bowl Kitchen Sink", "Futura",
            "kitchen-sinks-faucets", "Kitchen Sinks & Faucets", "SS 304 Single Bowl Sinks",
            "/images/products/kitchen/futura-dura-ss-sink.webp",
            "1.2mm Heavy Gauge AISI 304 Stainless Steel · Sound Deadening Pads",
            ["AISI 304 Steel", "1.2mm Heavy Gauge", "Sound Deadening", "Anti-Condensation"],
            "Futura Dura kitchen sink is precision crafted from 1.2mm heavy gauge AISI 304 food-grade stainless steel. Features a spacious deep bowl with anti-condensation undercoating and thick rubber sound-dampening pads that eliminate noisy dish clatter.",
            [
                "1.2mm thick surgical-grade AISI 304 stainless steel resists dents and corrosion",
                "Deep 9-inch bowl accommodates large Indian kadhais, pressure cookers, and thalis",
                "Heavy-duty sound deadening rubber pads absorb noise from high-pressure water streams",
                "Anti-condensation undercoating prevents cabinet humidity and mold under the counter",
                "Sleek satin hairline finish resists hard water stains and cleans effortlessly"
            ],
            [
                {"label": "Brand", "value": "Futura Sinks India"},
                {"label": "Material Grade", "value": "AISI 304 Food-Grade Stainless Steel"},
                {"label": "Bowl Depth", "value": "9.0 Inches (230 mm)"},
                {"label": "Sheet Thickness", "value": "1.2 mm Heavy Gauge"},
                {"label": "Drain Hole", "value": "3.5 Inch Rapid Waste Hole"},
                {"label": "Installation", "value": "Top Mount / Flush Mount Compatible"},
                {"label": "Warranty", "value": "10 Years Limited Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-dura-2418", "label": "24 x 18 x 9 Inch (Standard Kitchen)", "unit": "Sink", "price": 3996, "mrp": 4995, "discountPercent": 20, "stock": 40, "image": v("/images/products/kitchen/futura-dura-ss-sink.webp")},
                {"id": "var-dura-2118", "label": "21 x 18 x 8 Inch (Compact Kitchen)", "unit": "Sink", "price": 3450, "mrp": 4350, "discountPercent": 21, "stock": 30, "image": v("/images/products/kitchen/futura-dura-ss-sink.webp")},
                {"id": "var-dura-1816", "label": "18 x 16 x 8 Inch (Bar / Island Sink)", "unit": "Sink", "price": 2950, "mrp": 3750, "discountPercent": 21, "stock": 25, "image": v("/images/products/kitchen/futura-dura-ss-sink.webp")},
            ]
        ),
        make_product(
            "futura-drain", "futura-dura-ss-sink-drainboard",
            "Futura Dura SS Sink with Drainboard (37 x 18 x 8 Inch)", "Futura",
            "kitchen-sinks-faucets", "Kitchen Sinks & Faucets", "SS Sinks with Drainboard",
            "/images/products/kitchen/futura-dura-ss-sink-drainboard.webp",
            "Sloped Drying Drainboard · Seamless Deep Draw · Food Grade SS 304",
            ["Integrated Drainboard", "SS 304 Stainless", "Sloped Run-Off", "Waste Coupling Included"],
            "Futura Dura sink with integrated side drainboard provides a convenient drying station for washed dishes, vegetables, and pots. Water drains automatically back into the main sink bowl via the sloped grooved drainboard.",
            [
                "Full-length grooved drainboard allows washed utensils to drip dry without water pooling",
                "Deep single bowl paired with drainboard for efficient multitasking in busy kitchens",
                "Seamless pressed bowl eliminates corner seams where grease and bacteria gather",
                "Includes heavy brass pop-up waste coupling and flexible corrugated drain pipe",
                "Reversible design allows left-hand or right-hand drainboard countertop orientation"
            ],
            [
                {"label": "Brand", "value": "Futura Sinks India"},
                {"label": "Overall Dimensions", "value": "37\" x 18\" x 8\" (940 x 457 x 203 mm)"},
                {"label": "Bowl Size", "value": "18\" x 16\" x 8\" Deep Bowl"},
                {"label": "Material", "value": "Grade 304 Stainless Steel"},
                {"label": "Finish", "value": "Brushed Satin Matt"},
                {"label": "Included In Box", "value": "Sink, 3.5\" Waste Coupling, Drain Pipe"},
                {"label": "Warranty", "value": "10 Years Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-dr-std", "label": "Standard Satin Finish (37x18x8 in)", "unit": "Sink", "price": 7452, "mrp": 9315, "discountPercent": 20, "stock": 25, "image": v("/images/products/kitchen/futura-dura-ss-sink-drainboard.webp")},
                {"id": "var-dr-kit", "label": "With Waste Coupling & Pipe Kit", "unit": "Complete Kit", "price": 7850, "mrp": 9900, "discountPercent": 21, "stock": 20, "image": v("/images/products/kitchen/futura-dura-ss-sink-drainboard.webp")},
            ]
        ),
        make_product(
            "futura-undermount", "futura-undermount-series-ss-sink",
            "Futura Undermount Series SS Sink, FS 503 (31 x 18 x 9 Inch)", "Futura",
            "kitchen-sinks-faucets", "Kitchen Sinks & Faucets", "Composite Quartz Sinks",
            "/images/products/kitchen/futura-undermount-series-ss-sink.webp",
            "Undermount Seamless Granite Fit · Zero Overhanging Lip · Premium Kitchens",
            ["Undermount Fit", "Seamless Granite Edge", "R10 Easy Clean Corners", "1.2mm SS304"],
            "Architectural undermount kitchen sink engineered to mount seamlessly below granite, quartz, or marble countertops. Eliminates top rim edges, allowing countertop crumbs and spills to be wiped directly into the sink bowl.",
            [
                "Undermount installation creates an uninterrupted seamless luxury granite countertop look",
                "Tight R10 rounded internal corners combine modern square look with easy sponge cleaning",
                "Heavy 1.2mm thick SS 304 steel prevents flex and supports heavy waste disposal units",
                "Full undercoating and dense acoustic sound dampening pads on all four sides and base",
                "Includes undermount mounting brackets, cutout template, and stainless steel basket strainer"
            ],
            [
                {"label": "Brand", "value": "Futura Sinks India"},
                {"label": "Model", "value": "FS 503 Undermount Series"},
                {"label": "Outer Dimensions", "value": "31\" x 18\" x 9\" (787 x 457 x 230 mm)"},
                {"label": "Corner Radius", "value": "R10 Smooth Curved Corners"},
                {"label": "Steel Spec", "value": "18/8 AISI 304 Stainless Steel"},
                {"label": "Counter Compatibility", "value": "Granite, Quartz, Marble, Solid Surface"},
                {"label": "Warranty", "value": "10 Years Brand Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-um-3118", "label": "31 x 18 x 9 Inch (Granite Undermount)", "unit": "Sink", "price": 8760, "mrp": 10950, "discountPercent": 20, "stock": 25, "image": v("/images/products/kitchen/futura-undermount-series-ss-sink.webp")},
                {"id": "var-um-2818", "label": "28 x 18 x 9 Inch (Granite Undermount)", "unit": "Sink", "price": 7950, "mrp": 9950, "discountPercent": 20, "stock": 20, "image": v("/images/products/kitchen/futura-undermount-series-ss-sink.webp")},
            ]
        ),
        make_product(
            "futura-handcarved", "futura-hand-carved-series-ss-sink",
            "Futura Hand Carved Series SS Sink, Commercial Heavy Gauge", "Futura",
            "kitchen-sinks-faucets", "Kitchen Sinks & Faucets", "SS 304 Single Bowl Sinks",
            "/images/products/kitchen/futura-hand-carved-series-ss-sink.webp",
            "Handcrafted Sharp Geometry · 1.5mm Ultra-Heavy Steel · X-Channel Drainage",
            ["Handmade 1.5mm", "X-Channel Drain", "Satin Polish", "Ultra Heavy Duty"],
            "Handmade luxury square kitchen sink fabricated from ultra-heavy 1.5mm gauge steel. Features laser-welded seams, precision geometric drainage grooves (X-channels), and tight corners for an industrial chef-kitchen aesthetic.",
            [
                "Ultra-heavy 1.5mm commercial gauge steel offers extreme durability with zero vibration",
                "X-channel drainage grooves guide water directly to the center waste drain quickly",
                "Hand-polished European satin finish provides high resistance to scratches and stains",
                "Rear-set drain placement creates more usable flat storage space inside the base cabinet",
                "Dual installation design supports both flush undermount and sleek drop-in top mounting"
            ],
            [
                {"label": "Brand", "value": "Futura Sinks India"},
                {"label": "Craftsmanship", "value": "Handcrafted Fabricated Series"},
                {"label": "Gauge Thickness", "value": "1.5 mm Heavy Duty Stainless Steel"},
                {"label": "Dimensions", "value": "24\" x 18\" x 10\" Extra Deep"},
                {"label": "Drain Type", "value": "X-Channel Fast Runoff Drain"},
                {"label": "Warranty", "value": "15 Years Brand Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-hc-2418", "label": "24 x 18 x 10 Inch Deep", "unit": "Sink", "price": 5200, "mrp": 6500, "discountPercent": 20, "stock": 30, "image": v("/images/products/kitchen/futura-hand-carved-series-ss-sink.webp")},
                {"id": "var-hc-3018", "label": "30 x 18 x 10 Inch Jumbo", "unit": "Sink", "price": 6800, "mrp": 8500, "discountPercent": 20, "stock": 20, "image": v("/images/products/kitchen/futura-hand-carved-series-ss-sink.webp")},
            ]
        ),
        make_product(
            "cera-sink-cock", "cera-garnet-gooseneck-sink-cock",
            "Cera Garnet Swivel Spout Sink Cock with Flange", "Cera",
            "kitchen-sinks-faucets", "Kitchen Sinks & Faucets", "Pull-Out Gooseneck Faucets",
            "/images/products/sanitary/cera-garnet-bib-cock.webp",
            "Solid Brass Casting · 360° Swivel Spout · High Arch Clearance",
            ["Solid Brass Body", "360° Swivel Arch", "Chrome Finish", "Ceramic Cartridge"],
            "High-arch gooseneck kitchen sink faucet designed for washing large pots and tall jugs. Engineered from virgin brass with mirror-finish chrome plating and a 360-degree rotating swivel spout.",
            [
                "Solid virgin brass casting ensures lifelong durability against hard water corrosion",
                "High arch gooseneck design provides ample clearance for filling tall stockpots",
                "360-degree smooth swivel spout easily services double-bowl sink configurations",
                "German ceramic disc cartridge tested for over 500,000 drip-free switching cycles",
                "Multi-layer electrolytic chrome plating retains brilliant reflective shine for years"
            ],
            [
                {"label": "Brand", "value": "Cera Sanitaryware Limited"},
                {"label": "Series", "value": "Garnet Faucet Collection"},
                {"label": "Spout Type", "value": "360° Rotating Gooseneck Spout"},
                {"label": "Body Material", "value": "High Purity Forged Brass"},
                {"label": "Cartridge", "value": "Quarter Turn Ceramic Disc"},
                {"label": "Warranty", "value": "7 Years Manufacturer Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-fauc-table", "label": "Table Mounted (Deck Mount)", "unit": "Piece", "price": 1480, "mrp": 1950, "discountPercent": 24, "stock": 45, "image": v("/images/products/sanitary/cera-garnet-bib-cock.webp")},
                {"id": "var-fauc-wall", "label": "Wall Mounted (Overhead Sink)", "unit": "Piece", "price": 1550, "mrp": 2050, "discountPercent": 24, "stock": 40, "image": v("/images/products/sanitary/cera-garnet-bib-cock.webp")},
            ]
        ),
        make_product(
            "cera-sink-waste", "cera-heavy-duty-sink-waste-coupling",
            "Cera SS 304 Kitchen Sink Waste Coupling & Anti-Odor Trap", "Cera",
            "kitchen-sinks-faucets", "Kitchen Sinks & Faucets", "Sink Waste Strainers & Traps",
            "/images/products/sanitary/cera-bottle-trap.webp",
            "Removable Strainer Basket · Anti-Clog Design · Prevents Sewer Odors",
            ["Removable Basket", "Anti-Odor Trap", "SS 304 Steel", "Zero Clogging"],
            "Heavy-duty kitchen sink waste coupling with a removable deep stainless steel strainer basket that catches food particles and peels before they enter drainpipes. Includes a water-seal anti-odor trap to block sewer gas.",
            [
                "Deep removable perforated stainless basket catches food scraps without slowing drainage",
                "Water-seal trap technology permanently blocks foul sewer gases from entering kitchen",
                "Solid brass threaded coupling lock ring ensures a permanent drip-tight connection",
                "Standard 3.5-inch flange fits all Indian and imported kitchen sink drain openings",
                "Effortless to empty and clean: simply lift the center stem handle and rinse"
            ],
            [
                {"label": "Brand", "value": "Cera Sanitaryware"},
                {"label": "Flange Diameter", "value": "3.5 Inch Standard (114 mm)"},
                {"label": "Basket Material", "value": "Grade 304 Stainless Steel"},
                {"label": "Seal", "value": "Double EPDM Silicone Gaskets"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-wst-3in", "label": "3.5 Inch Standard Coupling", "unit": "Piece", "price": 420, "mrp": 590, "discountPercent": 29, "stock": 80, "image": v("/images/products/sanitary/cera-bottle-trap.webp")},
                {"id": "var-wst-deep", "label": "4.0 Inch Commercial Waste System", "unit": "Piece", "price": 580, "mrp": 820, "discountPercent": 29, "stock": 50, "image": v("/images/products/sanitary/cera-bottle-trap.webp")},
            ]
        ),
    ])

    # ─── 8. Furniture, Wardrobe & Bed Hardware ──────────────────────────────
    prods.extend([
        make_product(
            "ebco-drawer-slide", "ebco-telescopic-drawer-slides-channel",
            "Ebco Heavy-Duty 45kg Telescopic Ball Bearing Drawer Slides", "Ebco",
            "furniture-wardrobe-bed-hardware", "Furniture, Wardrobe & Bed Hardware", "Telescopic Drawer Slides",
            "/images/products/furniture-hardware/ebco-telescopic-channel-18.webp",
            "45kg Load Capacity · Precision Steel Ball Bearings · Full Extension",
            ["45kg Load Rated", "Full Extension", "Steel Ball Bearings", "50k Cycles Tested"],
            "Ebco telescopic drawer slides are the industry standard for smooth, silent drawer operation in modular kitchens and wardrobes. Engineered with hardened high-carbon steel ball bearings and cold-rolled steel rails supporting 45kg dynamic load.",
            [
                "Three-fold full extension brings the entire drawer box out for effortless rear access",
                "High-precision steel ball bearings ensure silk-smooth glide with zero lateral play",
                "Cold-rolled steel rails with electroplated zinc finish resist rust in humid climates",
                "Tested for 50,000 opening and closing cycles under full 45kg payload",
                "Convenient quick-release lever allows easy drawer removal for cleaning and maintenance"
            ],
            [
                {"label": "Brand", "value": "Ebco India Private Limited"},
                {"label": "Type", "value": "Full Extension Telescopic Ball Bearing Slide"},
                {"label": "Load Capacity", "value": "45 kg Dynamic Load per Pair"},
                {"label": "Material", "value": "Cold-Rolled Hardened Carbon Steel"},
                {"label": "Finish", "value": "Zinc Plated with Protective Lacquer"},
                {"label": "Cycle Test", "value": "50,000 Cycles (BIFMA Compliant)"},
                {"label": "Warranty", "value": "5 Years Brand Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-sl-12in", "label": "12 Inch (300mm)", "unit": "Pair", "price": 290, "mrp": 380, "discountPercent": 24, "stock": 60, "image": v("/images/products/furniture-hardware/ebco-telescopic-channel-18.webp")},
                {"id": "var-sl-14in", "label": "14 Inch (350mm)", "unit": "Pair", "price": 330, "mrp": 430, "discountPercent": 23, "stock": 60, "image": v("/images/products/furniture-hardware/ebco-telescopic-channel-18.webp")},
                {"id": "var-sl-16in", "label": "16 Inch (400mm)", "unit": "Pair", "price": 360, "mrp": 470, "discountPercent": 23, "stock": 70, "image": v("/images/products/furniture-hardware/ebco-telescopic-channel-18.webp")},
                {"id": "var-sl-18in", "label": "18 Inch (450mm)", "unit": "Pair", "price": 380, "mrp": 490, "discountPercent": 22, "stock": 100, "image": v("/images/products/furniture-hardware/ebco-telescopic-channel-18.webp")},
                {"id": "var-sl-20in", "label": "20 Inch (500mm)", "unit": "Pair", "price": 430, "mrp": 560, "discountPercent": 23, "stock": 80, "image": v("/images/products/furniture-hardware/ebco-telescopic-channel-18.webp")},
                {"id": "var-sl-22in", "label": "22 Inch (550mm)", "unit": "Pair", "price": 480, "mrp": 620, "discountPercent": 23, "stock": 40, "image": v("/images/products/furniture-hardware/ebco-telescopic-channel-18.webp")},
            ]
        ),
        make_product(
            "hettich-onsys", "hettich-onsys-soft-close-concealed-hinge",
            "Hettich OnSys Integrated Soft-Close Concealed Cabinet Hinges", "Hettich",
            "furniture-wardrobe-bed-hardware", "Furniture, Wardrobe & Bed Hardware", "Soft-Close Concealed Hinges",
            "/images/products/furniture-hardware/hettich-onsys-soft-close-hinge.webp",
            "German Engineering · Integrated Silent Hydraulic Damper · 105° Opening",
            ["Integrated Soft-Close", "German Engineering", "105° Opening Angle", "Nickel Plated"],
            "Hettich OnSys concealed hinges feature a built-in hydraulic soft-close damper right inside the hinge arm. Shuts heavy cabinet doors silently and gently, eliminating door slamming damage in modular kitchens and wardrobes.",
            [
                "Integrated hydraulic damper ensures silent, controlled closing motion on every door",
                "3-way cam adjustment allows effortless up/down, left/right, and depth door alignment",
                "Deep 35mm cup diameter provides rock-solid mounting in 16mm to 22mm thick door panels",
                "Triple-layer corrosion-resistant nickel plating resists tarnishing and grease",
                "Tested for 40,000 continuous door cycles meeting European EN 15570 Level 2 standards"
            ],
            [
                {"label": "Brand", "value": "Hettich Germany (India)"},
                {"label": "Series", "value": "OnSys Integrated Soft-Close"},
                {"label": "Cup Diameter", "value": "35 mm (11.5 mm Depth)"},
                {"label": "Opening Angle", "value": "105 Degree"},
                {"label": "Door Thickness", "value": "16 mm to 24 mm"},
                {"label": "Standard", "value": "EN 15570 Level 2 Certified"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-hng-0c", "label": "0 Crank (Full Overlay)", "unit": "Pair", "price": 195, "mrp": 260, "discountPercent": 25, "stock": 150, "image": v("/images/products/furniture-hardware/hettich-onsys-soft-close-hinge.webp")},
                {"id": "var-hng-8c", "label": "8 Crank (Half Overlay / Twin Door)", "unit": "Pair", "price": 205, "mrp": 275, "discountPercent": 25, "stock": 100, "image": v("/images/products/furniture-hardware/hettich-onsys-soft-close-hinge.webp")},
                {"id": "var-hng-16c", "label": "16 Crank (Inset / Internal Door)", "unit": "Pair", "price": 215, "mrp": 290, "discountPercent": 26, "stock": 80, "image": v("/images/products/furniture-hardware/hettich-onsys-soft-close-hinge.webp")},
            ]
        ),
        make_product(
            "ebco-wardrobe-lift", "ebco-wardrobe-lift-hanger",
            "Ebco Pull-Down Wardrobe Lift Hanger Mechanism (Hydraulic)", "Ebco",
            "furniture-wardrobe-bed-hardware", "Furniture, Wardrobe & Bed Hardware", "Hydraulic Bed Lift Mechanisms",
            "/images/products/furniture-hardware/ebco-wardrobe-lift-hanger.webp",
            "Hydraulic Soft Return · Access Tall Wardrobe Tops · 12kg Load Capacity",
            ["Hydraulic Soft Drop", "12kg Garment Load", "Chrome & Grey", "Width Adjustable"],
            "Ergonomic pull-down hydraulic wardrobe hanger that allows easy access to high wardrobe hanging rails without a ladder. Smooth hydraulic motion lowers clothes hangers to chest level and returns smoothly with assisted soft damping.",
            [
                "Enables full-height wardrobe storage up to 9 feet without needing a step stool",
                "Internal hydraulic damper provides controlled descent and smooth upward return",
                "Telescopic width adjustment bar fits standard wardrobe internal carcass widths",
                "Strong aluminum hanging rail and reinforced fiberglass-nylon housing hold 12kg",
                "Soft padded ergonomic pull-down handle ensures comfortable one-hand operation"
            ],
            [
                {"label": "Brand", "value": "Ebco India"},
                {"label": "Mechanism", "value": "Hydraulic Damped Pull-Down Lift"},
                {"label": "Weight Capacity", "value": "12 kg Hanging Garments"},
                {"label": "Internal Cabinet Width", "value": "Adjustable 830 mm to 1150 mm"},
                {"label": "Finish", "value": "Anodized Silver / Anthracite Grey"},
                {"label": "Warranty", "value": "5 Years Brand Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-lift-med", "label": "600 - 830mm Width (Medium Wardrobe)", "unit": "Unit", "price": 2850, "mrp": 3600, "discountPercent": 21, "stock": 25, "image": v("/images/products/furniture-hardware/ebco-wardrobe-lift-hanger.webp")},
                {"id": "var-lift-lge", "label": "830 - 1150mm Width (Wide Wardrobe)", "unit": "Unit", "price": 3200, "mrp": 4100, "discountPercent": 22, "stock": 30, "image": v("/images/products/furniture-hardware/ebco-wardrobe-lift-hanger.webp")},
            ]
        ),
        make_product(
            "ebco-trouser-rack", "ebco-wardrobe-trouser-pull-out",
            "Ebco Soft-Closing Wardrobe Trouser & Saree Pull-Out Rack", "Ebco",
            "furniture-wardrobe-bed-hardware", "Furniture, Wardrobe & Bed Hardware", "Wardrobe Sliding Systems",
            "/images/products/furniture-hardware/ebco-wardrobe-trouser-pull-out.webp",
            "Soft-Close Telescopic Runner · Anti-Slip Rubber Rings · 9 Hanger Arms",
            ["Soft-Close Slide", "Anti-Slip Rubber Rings", "9 Hanger Arms", "Crease-Free Hanging"],
            "Sliding pull-out wardrobe organizer designed for wrinkle-free hanging of trousers, trousers, and sarees. Features nine anti-slip grooved rods and soft-closing telescopic drawer slides that glide out smoothly.",
            [
                "Soft-closing ball-bearing runners pull out fully for complete visibility and access",
                "Non-slip silicone grip rings keep slippery silk trousers and sarees from falling",
                "Heavy gauge chrome-plated steel frame maintains horizontal rigidity under load",
                "Compact side or top mount installation integrates into standard wardrobe modules",
                "Keeps pressed clothes organized and crease-free without crowding conventional hangers"
            ],
            [
                {"label": "Brand", "value": "Ebco India"},
                {"label": "Type", "value": "Pull-Out Trouser / Saree Holder"},
                {"label": "Capacity", "value": "9 Hanging Arms with Anti-Slip Rings"},
                {"label": "Slide Tech", "value": "Under-Mount Damped Soft-Closing Runners"},
                {"label": "Cabinet Width", "value": "Fits 600 mm to 900 mm Wardrobes"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-tr-600", "label": "600mm Cabinet Unit (9 Arms)", "unit": "Unit", "price": 2450, "mrp": 3100, "discountPercent": 21, "stock": 35, "image": v("/images/products/furniture-hardware/ebco-wardrobe-trouser-pull-out.webp")},
                {"id": "var-tr-900", "label": "900mm Cabinet Unit (14 Arms)", "unit": "Unit", "price": 3150, "mrp": 3990, "discountPercent": 21, "stock": 25, "image": v("/images/products/furniture-hardware/ebco-wardrobe-trouser-pull-out.webp")},
            ]
        ),
        make_product(
            "hettich-handle", "hettich-cabinet-handle-6-ss",
            "Hettich Premium Solid SS 304 Wardrobe & Cabinet D-Handle (6 Inch)", "Hettich",
            "furniture-wardrobe-bed-hardware", "Furniture, Wardrobe & Bed Hardware", "Furniture Legs & Levelers",
            "/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp",
            "Solid Grade 304 Stainless Steel · Satin Matt Finish · Heavy Feel",
            ["Solid SS 304", "Satin Matt", "Zero Rust", "Threaded Brass Bush"],
            "Architectural cabinet handle precision CNC-machined from solid stainless steel round bar. Designed for contemporary kitchen cabinets, wardrobe shutters, and bathroom drawers with an understated satin matt finish.",
            [
                "Solid stainless steel construction provides a heavy, reassuring feel in the hand",
                "Grade 304 steel guarantees zero rust or pitting even in high-humidity kitchens",
                "Fine satin brushed finish resists fingerprint smudges and matches modern appliances",
                "Deep-threaded blind mounting holes ensure tight, wobble-free screw fastening",
                "Includes M4 breakaway mounting screws compatible with various panel thicknesses"
            ],
            [
                {"label": "Brand", "value": "Hettich Germany"},
                {"label": "Material", "value": "Solid AISI 304 Stainless Steel"},
                {"label": "Center-to-Center", "value": "128 mm (6 Inch Handle Length)"},
                {"label": "Finish", "value": "Brushed Satin Matt Chrome"},
                {"label": "Screw Fix", "value": "Rear M4 Bolt Fixation"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-hnd-4in", "label": "4 Inch (96mm C-to-C)", "unit": "Piece", "price": 125, "mrp": 175, "discountPercent": 29, "stock": 100, "image": v("/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp")},
                {"id": "var-hnd-6in", "label": "6 Inch (128mm C-to-C)", "unit": "Piece", "price": 165, "mrp": 230, "discountPercent": 28, "stock": 120, "image": v("/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp")},
                {"id": "var-hnd-8in", "label": "8 Inch (192mm C-to-C)", "unit": "Piece", "price": 215, "mrp": 295, "discountPercent": 27, "stock": 80, "image": v("/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp")},
                {"id": "var-hnd-12in", "label": "12 Inch (256mm C-to-C Large)", "unit": "Piece", "price": 310, "mrp": 420, "discountPercent": 26, "stock": 50, "image": v("/images/products/furniture-hardware/hettich-cabinet-handle-6-ss.webp")},
            ]
        ),
        make_product(
            "hettich-ka5632", "hettich-ka-5632-heavy-channel",
            "Hettich KA 5632 Precision Telescopic Ball Bearing Channel (18 Inch)", "Hettich",
            "furniture-wardrobe-bed-hardware", "Furniture, Wardrobe & Bed Hardware", "Telescopic Drawer Slides",
            "/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp",
            "German Heavy-Duty 45kg Slide · Integrated Hold-In Detent · Precision Balls",
            ["Hettich KA Series", "45kg Heavy Duty", "Hold-In Detent", "Zero Play Movement"],
            "Hettich KA 5632 is an internationally renowned ball-bearing drawer runner known for silent, silky gliding accuracy. Built with high-precision steel balls and an integrated hold-in detent that prevents drawers from rolling open accidentally.",
            [
                "Ultra-smooth ball race ensures whisper-quiet travel even under heavy 45kg loads",
                "Full extension capability provides instant view and reach to all drawer contents",
                "Integrated hold-in detent keeps drawer securely latched closed on slightly uneven floors",
                "High-grade electro-galvanized finish offers superior salt-spray corrosion protection",
                "Complies with DIN EN 15338 Level 3 standards for heavy residential and commercial use"
            ],
            [
                {"label": "Brand", "value": "Hettich Germany"},
                {"label": "Model", "value": "KA 5632 Telescopic Runner"},
                {"label": "Length", "value": "450 mm (18 Inch)"},
                {"label": "Load Capacity", "value": "45 kg Dynamic (EN 15338)"},
                {"label": "Extension", "value": "100% Full Extension"},
                {"label": "Standard", "value": "DIN EN 15338 Level 3"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-ka-14in", "label": "14 Inch (350mm)", "unit": "Pair", "price": 420, "mrp": 550, "discountPercent": 24, "stock": 40, "image": v("/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp")},
                {"id": "var-ka-16in", "label": "16 Inch (400mm)", "unit": "Pair", "price": 470, "mrp": 620, "discountPercent": 24, "stock": 45, "image": v("/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp")},
                {"id": "var-ka-18in", "label": "18 Inch (450mm)", "unit": "Pair", "price": 520, "mrp": 680, "discountPercent": 24, "stock": 60, "image": v("/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp")},
                {"id": "var-ka-20in", "label": "20 Inch (500mm)", "unit": "Pair", "price": 580, "mrp": 750, "discountPercent": 23, "stock": 35, "image": v("/images/products/furniture-hardware/hettich-ka-5632-channel-18.webp")},
            ]
        ),
    ])

    # ─── 9. Modular Kitchen Systems ─────────────────────────────────────────
    prods.extend([
        make_product(
            "ebco-plain-basket", "ebco-ss-kitchen-basket-plain",
            "Ebco SS 304 Wire Plain Kitchen Drawer Pull-Out Basket", "Ebco",
            "modular-kitchen-systems", "Modular Kitchen Systems & Fittings", "SS Wire Cutlery & Grain Baskets",
            "/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp",
            "100% Stainless Steel 304 · Mirror Polished Wire Mesh · Multi-Purpose",
            ["AISI 304 Steel", "Electro-Polished", "Multi-Purpose Storage", "Zero Rust"],
            "Heavy-duty plain pull-out kitchen wire basket fabricated from certified AISI 304 stainless steel wires. Ideal for storing pots, pans, dry grocery boxes, and mixing bowls in base modular cabinets.",
            [
                "100% AISI 304 stainless steel wire construction never rusts or tarnishes",
                "Thick 6mm perimeter support frame prevents deformation under heavy cookware loads",
                "Electrolytically polished finish provides a bright chrome-like luster that cleans easily",
                "Universal side brackets mount directly onto standard telescopic drawer slides",
                "Open wire mesh design allows air circulation and prevents kitchen dust accumulation"
            ],
            [
                {"label": "Brand", "value": "Ebco India"},
                {"label": "Material", "value": "AISI 304 Stainless Steel Round Wires"},
                {"label": "Cabinet Depth", "value": "Fits 500 mm (20 Inch) Deep Carcass"},
                {"label": "Load Capacity", "value": "35 kg Uniform Distributed Load"},
                {"label": "Finish", "value": "High Gloss Electro-Polish"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-bsk-4in", "label": "4 Inch Height (Cups & Saucers)", "unit": "Basket", "price": 1450, "mrp": 1950, "discountPercent": 26, "stock": 40, "image": v("/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp")},
                {"id": "var-bsk-6in", "label": "6 Inch Height (Utensils & Bowls)", "unit": "Basket", "price": 1750, "mrp": 2350, "discountPercent": 26, "stock": 45, "image": v("/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp")},
                {"id": "var-bsk-8in", "label": "8 Inch Height (Pots & Heavy Pans)", "unit": "Basket", "price": 2100, "mrp": 2800, "discountPercent": 25, "stock": 35, "image": v("/images/products/modular-kitchen/ebco-ss-kitchen-basket-plain.webp")},
            ]
        ),
        make_product(
            "ebco-grain-basket", "ebco-ss-kitchen-basket-grain",
            "Ebco Heavy-Duty Thali & Plate Partition Kitchen Basket", "Ebco",
            "modular-kitchen-systems", "Modular Kitchen Systems & Fittings", "SS Wire Cutlery & Grain Baskets",
            "/images/products/modular-kitchen/ebco-ss-kitchen-basket-grain.webp",
            "Dedicated Thali & Plate Slots · Holds Up to 18 Large Dinner Plates",
            ["Thali & Plate Racks", "Stainless Steel 304", "Rattle Free", "Heavy Load"],
            "Specialized stainless steel plate and thali storage pull-out basket. Designed with curved wire separators that hold dinner plates and large metal thalis upright without scratching or clattering when the drawer opens.",
            [
                "Individual vertical slots securely separate plates and prevent chip damage",
                "Accommodates up to 18 dinner plates and large traditional Indian serving thalis",
                "Crafted from premium AISI 304 stainless steel for lifelong rust immunity",
                "Smooth glide motion prevents stacked plates from tumbling during rapid drawer closure",
                "Includes base drip tray groove to prevent water residue inside the wooden carcass"
            ],
            [
                {"label": "Brand", "value": "Ebco India"},
                {"label": "Type", "value": "Thali / Plate Organizer Basket"},
                {"label": "Material", "value": "AISI 304 Stainless Steel"},
                {"label": "Plate Capacity", "value": "18 - 24 Standard Indian Thalis"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-th-1720", "label": "17 x 20 x 6 Inch (Small Modular)", "unit": "Basket", "price": 1850, "mrp": 2450, "discountPercent": 24, "stock": 35, "image": v("/images/products/modular-kitchen/ebco-ss-kitchen-basket-grain.webp")},
                {"id": "var-th-1920", "label": "19 x 20 x 8 Inch (Standard Modular)", "unit": "Basket", "price": 2250, "mrp": 2990, "discountPercent": 25, "stock": 40, "image": v("/images/products/modular-kitchen/ebco-ss-kitchen-basket-grain.webp")},
                {"id": "var-th-2120", "label": "21 x 20 x 8 Inch (Wide Kitchen)", "unit": "Basket", "price": 2550, "mrp": 3390, "discountPercent": 25, "stock": 30, "image": v("/images/products/modular-kitchen/ebco-ss-kitchen-basket-grain.webp")},
            ]
        ),
        make_product(
            "ebco-carousel", "ebco-corner-unit-carousel",
            "Ebco Revolving 270-Degree Kitchen Blind Corner Carousel Unit", "Ebco",
            "modular-kitchen-systems", "Modular Kitchen Systems & Fittings", "Magic Corner & Carousel Units",
            "/images/products/modular-kitchen/ebco-corner-unit-carousel.webp",
            "Converts Dead Corner Space · 270° Smooth Rotation · Height Adjustable",
            ["270° Smooth Turn", "Utilizes Dead Corner", "Dual Chrome Trays", "Height Adjustable"],
            "Revolving corner carousel system designed to reclaim unreachable blind corner space in L-shaped and U-shaped kitchens. Dual chrome wire trays spin 270 degrees on a central telescoping stainless steel column.",
            [
                "Transforms awkward kitchen blind corners into accessible, organized storage",
                "Smooth central pivot bearing allows effortless 360/270 degree finger-light rotation",
                "Independently height-adjustable upper and lower wire baskets hold tall oil cans",
                "High load rating of 15kg per tray handles heavy mixers, pressure cookers, and jars",
                "Heavy chrome plating with anti-slip rim wire prevents jars from sliding off"
            ],
            [
                {"label": "Brand", "value": "Ebco India"},
                {"label": "Rotation Angle", "value": "270 Degree Opening Angle"},
                {"label": "Shaft Material", "value": "Telescopic Stainless Steel Center Pole"},
                {"label": "Tray Load", "value": "15 kg per Tray (30 kg Total)"},
                {"label": "Cabinet Size", "value": "900 mm x 900 mm L-Corner Carcass"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-car-700", "label": "700mm Diameter (Compact Corner)", "unit": "Unit", "price": 6800, "mrp": 8900, "discountPercent": 24, "stock": 20, "image": v("/images/products/modular-kitchen/ebco-corner-unit-carousel.webp")},
                {"id": "var-car-800", "label": "800mm Diameter (Standard Corner)", "unit": "Unit", "price": 7500, "mrp": 9800, "discountPercent": 23, "stock": 25, "image": v("/images/products/modular-kitchen/ebco-corner-unit-carousel.webp")},
            ]
        ),
        make_product(
            "ebco-pantry", "ebco-tall-unit-pantry-pull-out",
            "Ebco 6-Layer Modular Kitchen Tall Pantry Storage Unit", "Ebco",
            "modular-kitchen-systems", "Modular Kitchen Systems & Fittings", "Tall Pantry Pull-Out Units",
            "/images/products/modular-kitchen/ebco-tall-unit-pantry-pull-out.webp",
            "6 Layer Storage · 100kg Heavy Damped Runners · Supermarket-Style Pantry",
            ["6 Tier Storage", "100kg Heavy Load", "Soft-Close Damping", "Height Adjustable Trays"],
            "Full-height pull-out pantry tower providing walk-in grocery convenience within a slender vertical footprint. Pulling the door brings six spacious wire storage baskets out simultaneously on heavy-duty damped 100kg runners.",
            [
                "Organizes an entire household's monthly groceries in one accessible vertical pantry",
                "Heavy-duty bottom runners with soft-closing dampers handle up to 100kg total weight",
                "Six height-adjustable basket shelves accommodate tall cereal boxes and oil bottles",
                "Full extension mechanism brings deep items right out into natural room lighting",
                "Solid frame made from structural steel with vibration-free dual ceiling guide tracks"
            ],
            [
                {"label": "Brand", "value": "Ebco India"},
                {"label": "Number of Baskets", "value": "6 Adjustable SS Wire Baskets"},
                {"label": "Total Capacity", "value": "100 kg Distributed Payload"},
                {"label": "Height Adjustment", "value": "1700 mm to 2000 mm Internal Height"},
                {"label": "Warranty", "value": "5 Years Brand Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-pan-450", "label": "450mm Carcass Width (6 Baskets)", "unit": "System", "price": 18500, "mrp": 24500, "discountPercent": 24, "stock": 10, "image": v("/images/products/modular-kitchen/ebco-tall-unit-pantry-pull-out.webp")},
                {"id": "var-pan-600", "label": "600mm Carcass Width (6 Baskets Wide)", "unit": "System", "price": 22000, "mrp": 29500, "discountPercent": 25, "stock": 8, "image": v("/images/products/modular-kitchen/ebco-tall-unit-pantry-pull-out.webp")},
            ]
        ),
        make_product(
            "hettich-innotech", "hettich-innotech-drawer-500mm",
            "Hettich InnoTech Atira Double-Walled Soft-Close Drawer System (500mm)", "Hettich",
            "modular-kitchen-systems", "Modular Kitchen Systems & Fittings", "SS Wire Cutlery & Grain Baskets",
            "/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp",
            "German Double-Walled Steel · Quadro Silent System · Minimalist Lines",
            ["Double-Walled Steel", "Quadro Silent Runners", "Silver / Anthracite", "30kg Load"],
            "Hettich InnoTech Atira is a premium double-walled metal drawer system featuring crisp, sharp lines and clean surfaces. Glides on hidden Quadro runners with integrated Silent System soft-close dampers.",
            [
                "Distinctive double-walled steel sides hide all adjustment screws behind sleek cover caps",
                "Hidden Quadro runners guarantee silk-smooth drawer action with integrated soft-closing",
                "Tool-free front panel installation with intuitive 2D adjustment for perfect door gaps",
                "30kg dynamic load capacity easily carries heavy stone cookware and dinner sets",
                "Scratch-resistant powder coating in sophisticated modern silver or anthracite grey"
            ],
            [
                {"label": "Brand", "value": "Hettich Germany"},
                {"label": "Series", "value": "InnoTech Atira Drawer System"},
                {"label": "Nominal Length", "value": "500 mm Runner Length"},
                {"label": "Side Height", "value": "70mm / 144mm / 176mm Options"},
                {"label": "Runner", "value": "Quadro V6 Full Extension with Silent System"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-inno-70", "label": "70mm Low Drawer (Cutlery)", "unit": "Set", "price": 3450, "mrp": 4500, "discountPercent": 23, "stock": 30, "image": v("/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp")},
                {"id": "var-inno-144", "label": "144mm Medium Drawer (Crockery)", "unit": "Set", "price": 4100, "mrp": 5300, "discountPercent": 23, "stock": 35, "image": v("/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp")},
                {"id": "var-inno-176", "label": "176mm Deep Pan Drawer (Pots & Pans)", "unit": "Set", "price": 4750, "mrp": 6200, "discountPercent": 23, "stock": 25, "image": v("/images/products/modular-kitchen/hettich-innotech-drawer-500mm.webp")},
            ]
        ),
        make_product(
            "hettich-tandem", "hettich-tandem-box-500mm",
            "Hettich Heavy-Duty Soft-Close Quadro Runner Tandem Box 500mm", "Hettich",
            "modular-kitchen-systems", "Modular Kitchen Systems & Fittings", "SS Wire Cutlery & Grain Baskets",
            "/images/products/modular-kitchen/hettich-tandem-box-500mm.webp",
            "Heavy 50kg Heavy-Load Runner · Ultra-Stable Base · Seamless Silent Close",
            ["50kg Heavy Load", "Quadro V6 Soft-Close", "Zero Sagging", "Kitchen & Wardrobe"],
            "Heavy-capacity drawer runner system engineered to carry 50kg payloads without sagging. Features precision-matched steel ball tracks and dampening cylinders that cushion the drawer close under heavy loads.",
            [
                "Heavy-duty 50kg load capacity designed for deep pan drawers and heavy pantry drawers",
                "Quadro precision ball track principle ensures long-term wear resistance without play",
                "Integrated Silent System damper brings even rapidly shoved drawers to a calm stop",
                "Self-cleaning ball tracks push dirt and dust out with every stroke",
                "10-year warranty against mechanical wear and hydraulic fluid leakage"
            ],
            [
                {"label": "Brand", "value": "Hettich Germany"},
                {"label": "System", "value": "Quadro V6 Heavy Tandem Box 500mm"},
                {"label": "Payload", "value": "50 kg Continuous Dynamic Load"},
                {"label": "Extension", "value": "100% Full Extension"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-tan-30kg", "label": "30kg Standard Capacity (500mm)", "unit": "Set", "price": 4200, "mrp": 5600, "discountPercent": 25, "stock": 25, "image": v("/images/products/modular-kitchen/hettich-tandem-box-500mm.webp")},
                {"id": "var-tan-50kg", "label": "50kg Heavy Load Capacity (500mm)", "unit": "Set", "price": 5100, "mrp": 6800, "discountPercent": 25, "stock": 20, "image": v("/images/products/modular-kitchen/hettich-tandem-box-500mm.webp")},
            ]
        ),
    ])

    # ─── 10. Door Hardware & Locks ──────────────────────────────────────────
    prods.extend([
        make_product(
            "godrej-tribolt", "godrej-tribolt-ultra-lock",
            "Godrej Tribolt Ultra High Security Rim Main Door Lock", "Godrej",
            "door-hardware-locks", "Door Hardware & Locks", "Main Door Rim & Tribolt Locks",
            "/images/products/door-hardware/godrej-tribolt-ultra-lock.webp",
            "3 Solid Brass Deadbolts · Ultra XL+ Dimple Key Technology · Crowbar Resistant",
            ["3 Brass Deadbolts", "Ultra XL+ Dimple Keys", "Crowbar Proof", "Godrej Security"],
            "Godrej Tribolt Ultra is India's gold standard main entrance rim lock. Features three reinforced solid brass deadbolts and a dual-locking mechanism. Powered by Godrej's Ultra XL+ high-security dimple cylinder with over 100 million unique key combinations.",
            [
                "Three massive solid brass deadbolts provide extreme resistance against crowbar attacks",
                "Ultra XL+ dimple cylinder with 100 million non-interchangeable key combinations",
                "Hardened steel drill-resistant plate protects the cylinder core from electric drills",
                "Free-turning deadbolt technology prevents bolt depression with credit cards",
                "Backed by Godrej's legendary 15-year warranty with 4 precision computer-cut keys"
            ],
            [
                {"label": "Brand", "value": "Godrej Locking Solutions"},
                {"label": "Lock Type", "value": "Rim Deadbolt Surface Main Door Lock"},
                {"label": "Deadbolts", "value": "3 Solid Forged Brass Bolts"},
                {"label": "Key Technology", "value": "Ultra XL+ High Security Dimple Key"},
                {"label": "Keys Included", "value": "4 Computer-Cut Brass Keys"},
                {"label": "Door Thickness", "value": "30 mm to 60 mm Suitable"},
                {"label": "Warranty", "value": "15 Years Brand Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-tri-1ck", "label": "1CK Inside Knob / Outside Key", "unit": "Lock", "price": 2850, "mrp": 3600, "discountPercent": 21, "stock": 40, "image": v("/images/products/door-hardware/godrej-tribolt-ultra-lock.webp")},
                {"id": "var-tri-2ck", "label": "2CK Key Inside & Outside", "unit": "Lock", "price": 3150, "mrp": 3990, "discountPercent": 21, "stock": 35, "image": v("/images/products/door-hardware/godrej-tribolt-ultra-lock.webp")},
            ]
        ),
        make_product(
            "europa-hexabolt", "europa-hexabolt-h341-lock",
            "Europa Hexabolt H341 Main Door Rim Lock with 6 Deadbolts", "Europa",
            "door-hardware-locks", "Door Hardware & Locks", "Main Door Rim & Tribolt Locks",
            "/images/products/door-hardware/europa-hexabolt-h341-lock.webp",
            "6 Massive Deadbolts · 5 Dimple Keys · 15-Year Replacement Warranty",
            ["6 Solid Deadbolts", "5 Dimple Keys", "Crowbar Resistant", "15-Yr Warranty"],
            "Europa Hexabolt H341 provides fortress-grade security with six heavy interlocking deadbolts that anchor the door directly to the jamb. Features a high-precision brass cylinder with 5 reversible dimple keys and one interior LED key for night unlocking.",
            [
                "Six heavy-gauge steel deadbolts engage deep into a reinforced striker plate",
                "Tested against heavy crowbar prying force up to 3000 kg without yielding",
                "Includes 5 dimple keys plus 1 unique key with built-in LED flashlight",
                "Interior turn-knob with privacy lock mode prevents opening from outside even with a key",
                "15-year replacement guarantee against manufacturing defects"
            ],
            [
                {"label": "Brand", "value": "Europa Locks India"},
                {"label": "Model", "value": "Hexabolt H341 Series"},
                {"label": "Number of Deadbolts", "value": "6 Steel Locking Bolts"},
                {"label": "Finish", "value": "Satin Nickel / Antique Brass"},
                {"label": "Warranty", "value": "15 Years Free Replacement"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-hexa-sn", "label": "Satin Nickel Finish", "unit": "Lock", "price": 2950, "mrp": 3850, "discountPercent": 23, "stock": 30, "image": v("/images/products/door-hardware/europa-hexabolt-h341-lock.webp")},
                {"id": "var-hexa-ab", "label": "Antique Brass Finish", "unit": "Lock", "price": 3250, "mrp": 4200, "discountPercent": 23, "stock": 25, "image": v("/images/products/door-hardware/europa-hexabolt-h341-lock.webp")},
            ]
        ),
        make_product(
            "europa-jemmy", "europa-jemmy-proof-j320-lock",
            "Europa Jemmy Proof J320 High-Torque Main Door Deadbolt Lock", "Europa",
            "door-hardware-locks", "Door Hardware & Locks", "Main Door Rim & Tribolt Locks",
            "/images/products/door-hardware/europa-jemmy-proof-j320-lock.webp",
            "Interlocking Vertical Deadbolts · Impossible to Crowbar · High Tensile Brass",
            ["Vertical Interlock", "Jemmy Proof", "High Tensile Brass", "Anti-Pick Cylinder"],
            "Specially engineered interlocking deadbolt system where vertical brass pins drop into interlocking door jamb brackets. Prevents the door frame from being pried apart with heavy crowbars or car jacks.",
            [
                "Vertical interlocking deadbolts physically lock door leaf and frame into one rigid unit",
                "Specifically designed to neutralize jemmy bar leverage attacks on main entrance doors",
                "High-precision pin tumbler cylinder resists picking, bumping, and impressioning",
                "High-grade brass body with scratch-proof powder-coated outer casing",
                "Ideal for front apartment doors, duplex entrance gates, and bank server rooms"
            ],
            [
                {"label": "Brand", "value": "Europa Locks"},
                {"label": "Mechanism", "value": "Interlocking Vertical Deadbolt"},
                {"label": "Bolt Material", "value": "Solid Forged Brass Pins"},
                {"label": "Door Type", "value": "Single Leaf Timber & Steel Doors"},
                {"label": "Warranty", "value": "15 Years Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-jp-single", "label": "Single Cylinder with Inside Turn", "unit": "Lock", "price": 2450, "mrp": 3200, "discountPercent": 23, "stock": 35, "image": v("/images/products/door-hardware/europa-jemmy-proof-j320-lock.webp")},
                {"id": "var-jp-double", "label": "Double Cylinder Key Both Sides", "unit": "Lock", "price": 2750, "mrp": 3600, "discountPercent": 24, "stock": 25, "image": v("/images/products/door-hardware/europa-jemmy-proof-j320-lock.webp")},
            ]
        ),
        make_product(
            "europa-antique", "europa-antique-brass-lock",
            "Europa Antique Brass Finish Ornamental Rim Door Lock", "Europa",
            "door-hardware-locks", "Door Hardware & Locks", "Main Door Rim & Tribolt Locks",
            "/images/products/door-hardware/europa-antique-brass-lock.webp",
            "Classic Antique Brass Finish · Royal Carved Face · Heavy Security",
            ["Antique Brass Finish", "Ornate Vintage Look", "Hardened Core", "Heavy Security"],
            "Combines vintage royal aesthetics with modern lock security. Finished in electro-plated antique brass with decorative bezel detailing, ideal for teakwood main doors and heritage residential bungalows.",
            [
                "Rich antique brass patina finish complements hand-carved solid teak wood doors",
                "Triple deadbolt brass mechanism delivers high physical impact resistance",
                "Computerized reversible dimple keys provide smooth key insertion without sharp notches",
                "Protective clear electrophoretic lacquer prevents discoloration and green oxidation",
                "Complete installation kit with decorative matching antique brass striker plate"
            ],
            [
                {"label": "Brand", "value": "Europa Locks"},
                {"label": "Aesthetics", "value": "Classic Heritage Antique Brass"},
                {"label": "Locking Bolts", "value": "3 Solid High-Tensile Deadbolts"},
                {"label": "Key Spec", "value": "4 High Security Dimple Keys"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-ant-brass", "label": "Antique Brass Finish", "unit": "Lock", "price": 3250, "mrp": 4150, "discountPercent": 22, "stock": 25, "image": v("/images/products/door-hardware/europa-antique-brass-lock.webp")},
                {"id": "var-ant-cop", "label": "Antique Copper Finish", "unit": "Lock", "price": 3350, "mrp": 4300, "discountPercent": 22, "stock": 20, "image": v("/images/products/door-hardware/europa-antique-brass-lock.webp")},
            ]
        ),
        make_product(
            "dorset-handle", "dorset-mortise-handle",
            "Dorset SS 304 Solid Mortise Lever Handle with Rosette", "Dorset",
            "door-hardware-locks", "Door Hardware & Locks", "Mortise Lever Handles & Locks",
            "/images/products/door-hardware/dorset-mortise-handle.webp",
            "Solid Grade 304 Stainless Steel · Ergonomic Lever · High Cycle Life",
            ["Solid SS 304", "Heavy Rosette", "200k Cycles Tested", "Contemporary Design"],
            "Dorset architectural mortise door handle set crafted from solid AISI 304 stainless steel. Features a balanced spring cassette mechanism that prevents lever sagging over years of heavy daily opening.",
            [
                "Solid grade 304 stainless steel construction provides a substantial, luxurious grip",
                "Integrated spring cassette mechanism keeps lever perfectly horizontal with zero droop",
                "Tested for over 200,000 cycles exceeding European EN 1906 Category 3 standards",
                "Concealed screw rose base plate maintains a clean, flush architectural appearance",
                "Universal handing reversible for left-handed and right-handed door swings"
            ],
            [
                {"label": "Brand", "value": "Dorset Kaba Group"},
                {"label": "Material", "value": "AISI 304 Solid Stainless Steel"},
                {"label": "Mechanism", "value": "Heavy-Duty Spring Return Cassette"},
                {"label": "Standard", "value": "EN 1906 Category 3 Certified"},
                {"label": "Warranty", "value": "10 Years Replacement Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-dor-sc", "label": "Satin Chrome Finish", "unit": "Set", "price": 1850, "mrp": 2450, "discountPercent": 24, "stock": 45, "image": v("/images/products/door-hardware/dorset-mortise-handle.webp")},
                {"id": "var-dor-mb", "label": "Matt Black Architectural", "unit": "Set", "price": 2100, "mrp": 2790, "discountPercent": 25, "stock": 35, "image": v("/images/products/door-hardware/dorset-mortise-handle.webp")},
                {"id": "var-dor-rg", "label": "Rose Gold Metallic", "unit": "Set", "price": 2400, "mrp": 3200, "discountPercent": 25, "stock": 25, "image": v("/images/products/door-hardware/dorset-mortise-handle.webp")},
            ]
        ),
        make_product(
            "dorset-closer", "dorset-door-closer-hydraulic",
            "Dorset Heavy-Duty Hydraulic Overhead Automatic Door Closer", "Dorset",
            "door-hardware-locks", "Door Hardware & Locks", "Hydraulic Overhead Door Closers",
            "/images/products/door-hardware/dorset-door-closer-hydraulic.webp",
            "Dual Valve Speed Adjustment · 500,000 Cycle Tested · Universal Fit",
            ["Hydraulic Closer", "Dual Speed Valves", "500k Cycles Tested", "Fire Door Rated"],
            "Dorset commercial overhead hydraulic door closer for residential wooden doors, office glass entrances, and fire exits. Features independent dual regulating valves for sweeping speed and latching speed control.",
            [
                "Dual independent adjustment valves control both main sweep speed and final latch snap",
                "High-grade cast aluminum body houses thermo-constant hydraulic fluid for all seasons",
                "Tested for over 500,000 operating cycles meeting EN 1154 international standards",
                "Prevents loud door slamming, drafts, and saves air conditioning cooling energy",
                "Reversible non-handed design fits left-opening and right-opening doors effortlessly"
            ],
            [
                {"label": "Brand", "value": "Dorset Kaba Group"},
                {"label": "Type", "value": "Overhead Rack & Pinion Hydraulic Closer"},
                {"label": "Standard", "value": "EN 1154 / CE / UL Fire Door Rated"},
                {"label": "Adjustability", "value": "Dual Valve Closing & Latching Speed"},
                {"label": "Warranty", "value": "5 Years Brand Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-cl-std", "label": "Up to 60-80 kg Door Weight", "unit": "Piece", "price": 1450, "mrp": 1950, "discountPercent": 26, "stock": 40, "image": v("/images/products/door-hardware/dorset-door-closer-hydraulic.webp")},
                {"id": "var-cl-heavy", "label": "Up to 80-120 kg Heavy Door Weight", "unit": "Piece", "price": 1950, "mrp": 2650, "discountPercent": 26, "stock": 30, "image": v("/images/products/door-hardware/dorset-door-closer-hydraulic.webp")},
            ]
        ),
    ])

    return prods

print("Hardware group ready.")
