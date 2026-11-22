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

def get_electrical_products():
    prods = []
    # ─── 6. Wires, MCB & Electrical Supplies ────────────────────────────────
    prods.extend([
        make_product(
            "poly-maxima", "polycab-maxima-green-wire-hr-fr-lsh",
            "Polycab Maxima+ Green Wire HR FR-LSH LF 90m Coil", "Polycab",
            "wires-mcb-electrical", "Wires, MCB & Electrical Supplies", "Flame Retardant House Wires",
            "/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp",
            "99.97% Pure Electrolytic Copper · Heat Resistant · Low Smoke Halogen Free",
            ["99.97% Copper", "HR-FR-LSH Grade", "Lead-Free", "IS 694 Certified"],
            "Polycab Maxima+ is engineered with 99.97% pure oxygen-free high-conductivity electrolytic copper. Insulated with specialized Heat Resistant, Flame Retardant Low Smoke Zero Halogen (HR-FR-LSH) compound that prevents toxic gas emission and restricts fire propagation.",
            [
                "99.97% pure electrolytic grade copper ensures minimal electrical resistance and power savings",
                "Specially formulated flame-retardant low-smoke compound ensures visibility during fire hazards",
                "High temperature withstand capacity up to 85°C continuous operating temperature",
                "100% lead-free insulation is environmentally safe and complies with RoHS directives",
                "Certified with dual BIS ISI marking under IS 694 for guaranteed electrical safety"
            ],
            [
                {"label": "Brand", "value": "Polycab India Limited"},
                {"label": "Conductor", "value": "99.97% Pure Electrolytic Bare Copper"},
                {"label": "Insulation", "value": "HR FR-LSH Low Smoke Halogen Free"},
                {"label": "Voltage Rating", "value": "Up to and including 1100V"},
                {"label": "Standard Length", "value": "90 Meters Standard Coil"},
                {"label": "Standard", "value": "IS 694 / RoHS Compliant"},
                {"label": "Warranty", "value": "Lifetime Against Manufacturing Defects"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-poly-075", "label": "0.75 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 1240, "mrp": 2150, "discountPercent": 42, "stock": 80, "image": v("/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp")},
                {"id": "var-poly-10", "label": "1.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 1620, "mrp": 2890, "discountPercent": 44, "stock": 100, "image": v("/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp")},
                {"id": "var-poly-15", "label": "1.5 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 2093, "mrp": 3950, "discountPercent": 47, "stock": 120, "image": v("/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp")},
                {"id": "var-poly-25", "label": "2.5 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 3380, "mrp": 5990, "discountPercent": 44, "stock": 90, "image": v("/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp")},
                {"id": "var-poly-40", "label": "4.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 5120, "mrp": 8900, "discountPercent": 42, "stock": 50, "image": v("/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp")},
                {"id": "var-poly-60", "label": "6.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 7650, "mrp": 12900, "discountPercent": 41, "stock": 40, "image": v("/images/products/electrical/polycab-maxima-green-wire-hr-fr-lsh.webp")},
            ]
        ),
        make_product(
            "fino-silver", "finolex-silver-fr-wire",
            "Finolex Silver FR Flame Retardant PVC Insulated Wire, 90m", "Finolex",
            "wires-mcb-electrical", "Wires, MCB & Electrical Supplies", "Flame Retardant House Wires",
            "/images/products/electrical/finolex-silver-fr-wire.webp",
            "Flame Retardant (FR) PVC · High Oxygen Index · 100% Annealed Copper",
            ["High Oxygen Index", "100% Annealed Copper", "FR PVC", "IS 694 Certified"],
            "Finolex Silver FR wire is manufactured with 100% electrolytic annealed copper conductors and formulated with fire-retardant PVC insulation. Designed with a high oxygen index to suppress combustion and self-extinguish during accidental short-circuit flashes.",
            [
                "High oxygen and temperature index resists catching fire during heavy overloads",
                "Finely bunched annealed copper strands offer exceptional flexibility for conduit pulling",
                "High insulation resistance prevents current leakage and tripping of sensitive ELCBs",
                "Resistant to moisture, oils, greases, and standard household atmospheric chemicals",
                "IS 694 certified with genuine tamper-evident holographic packaging seal"
            ],
            [
                {"label": "Brand", "value": "Finolex Cables Limited"},
                {"label": "Conductor", "value": "High Purity Bright Annealed Copper"},
                {"label": "Insulation Grade", "value": "Flame Retardant (FR) PVC Compound"},
                {"label": "Oxygen Index", "value": "> 29% (Standard IS benchmark > 21%)"},
                {"label": "Coil Length", "value": "90 Meters (Exact Meter Marked)"},
                {"label": "Standard", "value": "IS 694:2010 Marked"},
                {"label": "Warranty", "value": "100% Genuine Brand Assurance"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-fino-075", "label": "0.75 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 1120, "mrp": 1850, "discountPercent": 39, "stock": 70, "image": v("/images/products/electrical/finolex-silver-fr-wire.webp")},
                {"id": "var-fino-10", "label": "1.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 1440, "mrp": 2350, "discountPercent": 39, "stock": 80, "image": v("/images/products/electrical/finolex-silver-fr-wire.webp")},
                {"id": "var-fino-15", "label": "1.5 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 1731, "mrp": 2840, "discountPercent": 39, "stock": 100, "image": v("/images/products/electrical/finolex-silver-fr-wire.webp")},
                {"id": "var-fino-25", "label": "2.5 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 2790, "mrp": 4500, "discountPercent": 38, "stock": 75, "image": v("/images/products/electrical/finolex-silver-fr-wire.webp")},
                {"id": "var-fino-40", "label": "4.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 4250, "mrp": 6800, "discountPercent": 38, "stock": 50, "image": v("/images/products/electrical/finolex-silver-fr-wire.webp")},
                {"id": "var-fino-60", "label": "6.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 6350, "mrp": 10200, "discountPercent": 38, "stock": 35, "image": v("/images/products/electrical/finolex-silver-fr-wire.webp")},
            ]
        ),
        make_product(
            "anchor-adv", "anchor-panasonic-advance-fr-wire",
            "Anchor Panasonic Advance FR Wire, 90m Coil", "Anchor Panasonic",
            "wires-mcb-electrical", "Wires, MCB & Electrical Supplies", "Flame Retardant House Wires",
            "/images/products/electrical/anchor-panasonic-advance-fr-wire.webp",
            "100% Electrolytic Copper · Japanese Quality Assurance · Flame Retardant",
            ["Panasonic Tech", "100% Copper", "Smooth Conduit Pull", "FR Insulation"],
            "Engineered with Japanese precision standards by Anchor Panasonic. Features high-grade electrolytic copper conductors and high-density flame-retardant insulation designed for smooth friction-free pulling through PVC conduits.",
            [
                "Manufactured with 100% virgin electrolytic copper for superior electrical efficiency",
                "Advanced flame-retardant compound limits toxic smoke and self-extinguishes fire",
                "Ultra-smooth surface coating reduces conduit pulling friction by up to 30%",
                "Exceptional aging stability ensures wires retain flexibility over 30+ years",
                "Tested and approved under rigorous Japanese Panasonic industrial standards"
            ],
            [
                {"label": "Brand", "value": "Anchor by Panasonic"},
                {"label": "Series", "value": "Advance FR Series"},
                {"label": "Conductor", "value": "Class 2 Stranded Bare Copper"},
                {"label": "Insulation", "value": "Flame Retardant Type A PVC"},
                {"label": "Length", "value": "90m Coil"},
                {"label": "Standard", "value": "IS 694 Certified"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-anc-10", "label": "1.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 1490, "mrp": 2980, "discountPercent": 50, "stock": 60, "image": v("/images/products/electrical/anchor-panasonic-advance-fr-wire.webp")},
                {"id": "var-anc-15", "label": "1.5 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 1958, "mrp": 3765, "discountPercent": 48, "stock": 80, "image": v("/images/products/electrical/anchor-panasonic-advance-fr-wire.webp")},
                {"id": "var-anc-25", "label": "2.5 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 3150, "mrp": 6200, "discountPercent": 49, "stock": 65, "image": v("/images/products/electrical/anchor-panasonic-advance-fr-wire.webp")},
                {"id": "var-anc-40", "label": "4.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 4890, "mrp": 9500, "discountPercent": 49, "stock": 40, "image": v("/images/products/electrical/anchor-panasonic-advance-fr-wire.webp")},
            ]
        ),
        make_product(
            "kei-homecab", "kei-homecab-fr-wire",
            "KEI Homecab FR Wire, 90m Coil 100% Electrolytic Copper", "KEI",
            "wires-mcb-electrical", "Wires, MCB & Electrical Supplies", "Flame Retardant House Wires",
            "/images/products/electrical/kei-homecab-fr-wire.webp",
            "Multi-Strand Flexible Conductor · 100% Conductivity · Flame Retardant",
            ["Multi-Strand", "100% Conductivity", "FR Rated", "Overload Proof"],
            "KEI Homecab is built with finely stranded high-purity copper conductors for superior current carrying capacity and energy savings. High-grade FR PVC insulation ensures safety against short-circuit overheating in residential circuits.",
            [
                "Uniform multi-strand copper bunching offers maximum conductivity with low heat build-up",
                "Advanced flame retardant insulation prevents spark spread and fire accidents",
                "Highly flexible design simplifies wiring through narrow concealed bends",
                "High dielectric strength guarantees zero current leakage across lines",
                "Certified by leading electrical inspection testing laboratories nationwide"
            ],
            [
                {"label": "Brand", "value": "KEI Industries Limited"},
                {"label": "Conductor", "value": "100% Electrolytic Grade Multi-Strand Copper"},
                {"label": "Insulation", "value": "Flame Retardant PVC (Type A)"},
                {"label": "Standard Length", "value": "90m Coil"},
                {"label": "Voltage Grade", "value": "1100 Volts"},
                {"label": "Standard", "value": "IS 694 BIS Marked"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-kei-10", "label": "1.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 1420, "mrp": 2840, "discountPercent": 50, "stock": 60, "image": v("/images/products/electrical/kei-homecab-fr-wire.webp")},
                {"id": "var-kei-15", "label": "1.5 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 1853, "mrp": 3705, "discountPercent": 50, "stock": 80, "image": v("/images/products/electrical/kei-homecab-fr-wire.webp")},
                {"id": "var-kei-25", "label": "2.5 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 2990, "mrp": 5990, "discountPercent": 50, "stock": 60, "image": v("/images/products/electrical/kei-homecab-fr-wire.webp")},
                {"id": "var-kei-40", "label": "4.0 sq.mm · 90m Coil", "unit": "Coil (90m)", "price": 4650, "mrp": 9100, "discountPercent": 49, "stock": 35, "image": v("/images/products/electrical/kei-homecab-fr-wire.webp")},
            ]
        ),
        make_product(
            "roma-switch", "anchor-roma-6a-1-way-switch",
            "Anchor Roma Classic 1-Way Modular Switches (6A/16A)", "Anchor Roma",
            "wires-mcb-electrical", "Wires, MCB & Electrical Supplies", "Modular Switches & Sockets",
            "/images/products/electrical/anchor-roma-6a-1-way-switch.webp",
            "Silver Inlay Contacts · Smooth Tactile Click · Tested for 100,000 Clicks",
            ["Silver Inlay Contacts", "100k Clicks Tested", "Flame Retardant Polycarbonate", "ISI Marked"],
            "Anchor Roma Classic is India's most popular modular switch range. Built with silver-inlay electrical contact tips for zero sparking and high durability. Tested for over 100,000 switching operations with an ultra-smooth tactile response.",
            [
                "Silver-inlay contacts provide minimal arc flashing and long switch contact life",
                "High-grade virgin polycarbonate front plate resists yellowing and discoloration",
                "Captive screw terminals prevent screw loss during electrical site installation",
                "Tested for 100,000 on/off operations exceeding standard IS specifications",
                "Snaps cleanly into all standard Anchor Roma and Roma Plus modular frames"
            ],
            [
                {"label": "Brand", "value": "Anchor Roma by Panasonic"},
                {"label": "Switch Type", "value": "Modular 1-Way Rocker Switch"},
                {"label": "Contact Material", "value": "Silver Nickel Inlay Contacts"},
                {"label": "Rated Voltage", "value": "240V AC, 50Hz"},
                {"label": "Standard", "value": "IS 3854 BIS Marked"},
                {"label": "Warranty", "value": "10 Years Replacement Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-roma-6a", "label": "6A 1-Way Switch (Light/Fan)", "unit": "Piece", "price": 42, "mrp": 65, "discountPercent": 35, "stock": 300, "image": v("/images/products/electrical/anchor-roma-6a-1-way-switch.webp")},
                {"id": "var-roma-16a", "label": "16A Heavy Switch (Geyser/AC)", "unit": "Piece", "price": 98, "mrp": 145, "discountPercent": 32, "stock": 200, "image": v("/images/products/electrical/anchor-roma-6a-1-way-switch.webp")},
                {"id": "var-roma-sock", "label": "6/16A Universal Shuttered Socket", "unit": "Piece", "price": 145, "mrp": 210, "discountPercent": 31, "stock": 150, "image": v("/images/products/electrical/anchor-roma-6a-1-way-switch.webp")},
            ]
        ),
        make_product(
            "roma-plate", "anchor-roma-modular-cover-plate",
            "Anchor Roma Classic Pure White Modular Cover Plate", "Anchor Roma",
            "wires-mcb-electrical", "Wires, MCB & Electrical Supplies", "Modular Switches & Sockets",
            "/images/products/electrical/anchor-modular-plate-8m.webp",
            "High Gloss Pure White · UV Stabilized Polycarbonate · Concealed Fixing",
            ["High Gloss White", "UV Stabilized", "Concealed Grid", "Snap-On Fit"],
            "Sleek and durable modular cover plate with concealed mounting screws. Made from high-gloss UV-stabilized engineering polycarbonate that resists scratches, dust accumulation, and discoloration over time.",
            [
                "Concealed grid design hides mounting screws for a sleek, modern wall finish",
                "UV-stabilized virgin polymer prevents yellowing caused by sunlight exposure",
                "High impact strength material resists cracking during screwdriver tightening",
                "Standard module dimensions fit universal GI concealed metal boxes",
                "Smooth high-gloss finish wipes clean effortlessly with a dry cloth"
            ],
            [
                {"label": "Brand", "value": "Anchor Roma by Panasonic"},
                {"label": "Color", "value": "Glossy Pure White"},
                {"label": "Material", "value": "Engineering Grade Polycarbonate"},
                {"label": "Mounting", "value": "Concealed Snap-On Grid Base"},
                {"label": "Standard", "value": "RoHS & IS Compliant"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-plt-2m", "label": "2 Module Plate", "unit": "Plate", "price": 48, "mrp": 75, "discountPercent": 36, "stock": 150, "image": v("/images/products/electrical/anchor-modular-plate-8m.webp")},
                {"id": "var-plt-4m", "label": "4 Module Plate", "unit": "Plate", "price": 68, "mrp": 105, "discountPercent": 35, "stock": 120, "image": v("/images/products/electrical/anchor-modular-plate-8m.webp")},
                {"id": "var-plt-6m", "label": "6 Module Plate", "unit": "Plate", "price": 85, "mrp": 130, "discountPercent": 35, "stock": 100, "image": v("/images/products/electrical/anchor-modular-plate-8m.webp")},
                {"id": "var-plt-8m", "label": "8 Module Plate", "unit": "Plate", "price": 95, "mrp": 145, "discountPercent": 34, "stock": 120, "image": v("/images/products/electrical/anchor-modular-plate-8m.webp")},
                {"id": "var-plt-12m", "label": "12 Module Plate", "unit": "Plate", "price": 140, "mrp": 210, "discountPercent": 33, "stock": 80, "image": v("/images/products/electrical/anchor-modular-plate-8m.webp")},
            ]
        ),
    ])

    # ─── 13. Home Appliances ────────────────────────────────────────────────
    prods.extend([
        make_product(
            "cromp-geyser", "crompton-arno-neo-25l-storage-water-geyser",
            "Crompton Arno Neo 25L 5-Star Storage Water Geyser", "Crompton",
            "home-appliances", "Home Appliances", "Storage Water Heaters (Geysers)",
            "/images/products/appliances/crompton-arno-neo-25l-storage-water-geyser.webp",
            "5-Star Energy Rating · Glassline Coated Tank · 8 Bar High-Rise Pressure",
            ["5-Star BEE Rated", "Glassline Tank", "8 Bar Pressure", "Magnesium Anode"],
            "High-efficiency 5-star storage water heater engineered for modern multi-story apartments. Features a corrosion-proof Nano Polybond glassline coated tank and a heavy magnesium anode rod that shields against hard water scaling.",
            [
                "5-Star BEE energy efficiency rating minimizes annual water heating electricity costs",
                "8-Bar rated pressure tank suitable for high-rise buildings and pressure booster pumps",
                "Nano Polybond glassline enamel tank withstands hard borewell water corrosion",
                "Advanced multi-function safety valve protects against overpressure and dry heating",
                "High precision capillary thermostat ensures consistent water temperature output"
            ],
            [
                {"label": "Brand", "value": "Crompton Greaves"},
                {"label": "Series", "value": "Arno Neo Storage Geyser"},
                {"label": "Capacity", "value": "25 Litres"},
                {"label": "Energy Rating", "value": "BEE 5-Star Certified"},
                {"label": "Pressure Rating", "value": "8 Bar (8 kg/cm²)"},
                {"label": "Heating Element", "value": "2000W Copper Heating Element"},
                {"label": "Warranty", "value": "5 Years Tank, 2 Years Element, 2 Years Product"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-gey-10l", "label": "10 Litres (Compact Bathroom)", "unit": "Unit", "price": 4899, "mrp": 7800, "discountPercent": 37, "stock": 25, "image": v("/images/products/appliances/crompton-arno-neo-25l-storage-water-geyser.webp")},
                {"id": "var-gey-15l", "label": "15 Litres (Standard Family)", "unit": "Unit", "price": 5499, "mrp": 8700, "discountPercent": 37, "stock": 35, "image": v("/images/products/appliances/crompton-arno-neo-25l-storage-water-geyser.webp")},
                {"id": "var-gey-25l", "label": "25 Litres (Large Bath / Rain Shower)", "unit": "Unit", "price": 6299, "mrp": 9800, "discountPercent": 36, "stock": 40, "image": v("/images/products/appliances/crompton-arno-neo-25l-storage-water-geyser.webp")},
            ]
        ),
        make_product(
            "atom-fan", "atomberg-renesa-1200mm-bldc-ceiling-fan",
            "Atomberg Renesa 1200mm BLDC Motor Energy Saving Ceiling Fan with Remote", "Atomberg",
            "home-appliances", "Home Appliances", "BLDC & Decorative Ceiling Fans",
            "/images/products/appliances/atomberg-renesa-1200mm-bldc-ceiling-fan.webp",
            "Consumes Only 28W at Full Speed · Saves ₹1500/yr · Smart Remote Control",
            ["BLDC Tech (28W)", "Saves ₹1500/year", "Smart Remote", "LED Speed Display"],
            "Revolutionary energy-efficient ceiling fan powered by an advanced Brushless DC (BLDC) motor. Consumes just 28W of electricity at top speed compared to 75W consumed by standard induction fans, delivering major power bill savings.",
            [
                "Consumes only 28 Watts at top speed (saves up to 65% electricity on every fan)",
                "Full-function smart remote with Boost mode, Sleep timer, and individual speed buttons",
                "Runs 3 times longer on home inverters due to high-efficiency motor architecture",
                "Consistent air delivery even during heavy voltage fluctuations from 165V to 285V",
                "Sleek contemporary design with LED speed indicator lights on the central hub"
            ],
            [
                {"label": "Brand", "value": "Atomberg Technologies"},
                {"label": "Model", "value": "Renesa BLDC Ceiling Fan"},
                {"label": "Sweep / Size", "value": "1200 mm (48 Inch)"},
                {"label": "Power Consumption", "value": "28 Watts at Speed 5 (Boost)"},
                {"label": "Air Delivery", "value": "235 CMM (Cubic Meters per Minute)"},
                {"label": "Motor", "value": "100% Copper BLDC Motor"},
                {"label": "Warranty", "value": "2+1 Years Comprehensive Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-fan-white", "label": "Ivory White", "unit": "Unit", "price": 3699, "mrp": 4990, "discountPercent": 26, "stock": 40, "image": v("/images/products/appliances/atomberg-renesa-1200mm-bldc-ceiling-fan.webp")},
                {"id": "var-fan-brown", "label": "Gloss Brown", "unit": "Unit", "price": 3699, "mrp": 4990, "discountPercent": 26, "stock": 35, "image": v("/images/products/appliances/atomberg-renesa-1200mm-bldc-ceiling-fan.webp")},
                {"id": "var-fan-black", "label": "Matt Black", "unit": "Unit", "price": 3899, "mrp": 5290, "discountPercent": 26, "stock": 30, "image": v("/images/products/appliances/atomberg-renesa-1200mm-bldc-ceiling-fan.webp")},
            ]
        ),
        make_product(
            "hav-exhaust", "havells-ventilair-db-230mm-exhaust-fan",
            "Havells Ventilair DB 230mm Heavy-Duty Metal Exhaust Fan", "Havells",
            "home-appliances", "Home Appliances", "High-Speed Ventilation Exhausts",
            "/images/products/appliances/havells-ventilair-db-230mm-exhaust-fan.webp",
            "Double Ball Bearings · Powder Coated Steel Blades · High Air Suction",
            ["Double Ball Bearing", "Steel Blades", "High Suction", "Low Noise Motor"],
            "Robust high-speed ventilation exhaust fan designed for kitchens and bathrooms. Built with double ball bearings and aerodynamically balanced metal blades that quickly remove cooking oil fumes, smoke, and humid bathroom steam.",
            [
                "Heavy-duty double ball bearing motor ensures smooth, silent, and vibration-free rotation",
                "Rugged powder-coated steel frame and blades resist kitchen grease and moisture rust",
                "High suction air delivery clears dense oil smoke and cooking smells rapidly",
                "Thermal overload protection prevents motor burnout during long continuous operation",
                "Includes rear automatic gravity louvers to prevent reverse air and insect entry"
            ],
            [
                {"label": "Brand", "value": "Havells India Limited"},
                {"label": "Series", "value": "Ventilair DB Heavy Exhaust"},
                {"label": "Sweep / Diameter", "value": "230 mm (9 Inch)"},
                {"label": "Speed / RPM", "value": "1400 RPM High Speed"},
                {"label": "Air Delivery", "value": "700 m³/hr"},
                {"label": "Power Consumption", "value": "45 Watts"},
                {"label": "Warranty", "value": "2 Years On-Site Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-ex-200", "label": "200mm (8 Inch) Compact", "unit": "Unit", "price": 1450, "mrp": 2050, "discountPercent": 29, "stock": 30, "image": v("/images/products/appliances/havells-ventilair-db-230mm-exhaust-fan.webp")},
                {"id": "var-ex-230", "label": "230mm (9 Inch) Standard", "unit": "Unit", "price": 1650, "mrp": 2350, "discountPercent": 30, "stock": 45, "image": v("/images/products/appliances/havells-ventilair-db-230mm-exhaust-fan.webp")},
                {"id": "var-ex-300", "label": "300mm (12 Inch) Commercial", "unit": "Unit", "price": 2150, "mrp": 3100, "discountPercent": 31, "stock": 25, "image": v("/images/products/appliances/havells-ventilair-db-230mm-exhaust-fan.webp")},
            ]
        ),
        make_product(
            "faber-chimney", "faber-60cm-curved-glass-kitchen-chimney",
            "Faber 60cm Curved Glass Auto-Clean Kitchen Chimney (1200 m3/hr)", "Faber",
            "home-appliances", "Home Appliances", "Kitchen Chimney Cooker Hoods",
            "/images/products/appliances/faber-60cm-curved-glass-kitchen-chimney.webp",
            "Thermal Auto-Clean · 1200 m³/hr Suction · Motion Sensor Touch Control",
            ["Thermal Auto-Clean", "1200 m³/hr Suction", "Gesture Control", "Baffle-Less Tech"],
            "Premium curved glass kitchen chimney engineered specifically for Indian deep frying and heavy masala cooking. Features 1200 m³/hr powerful air suction and thermal auto-clean technology that melts away internal grease into a stainless steel oil collector.",
            [
                "Powerful 1200 m³/hr suction removes heavy tadka smoke, oil vapor, and pungent odor",
                "One-touch thermal auto-clean melts stubborn grease and channels it into the oil cup",
                "Touch-free gesture motion sensor lets you turn the chimney on with a simple hand wave",
                "Energy-efficient dual LED spot lamps provide bright illumination over the cooktop",
                "12-year warranty on the heavy copper motor ensures complete peace of mind"
            ],
            [
                {"label": "Brand", "value": "Faber India"},
                {"label": "Width / Size", "value": "60 cm (Ideal for 2 - 4 Burner Stoves)"},
                {"label": "Suction Capacity", "value": "1200 m³/hr"},
                {"label": "Technology", "value": "Heat Auto-Clean (Baffle-Less Filter)"},
                {"label": "Control", "value": "Touch Control + Motion Gesture Sensor"},
                {"label": "Noise Level", "value": "< 58 dB"},
                {"label": "Warranty", "value": "5 Years Comprehensive, 12 Years Motor"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-chim-60", "label": "60 cm Width (2-4 Burners)", "unit": "Unit", "price": 11490, "mrp": 18990, "discountPercent": 39, "stock": 20, "image": v("/images/products/appliances/faber-60cm-curved-glass-kitchen-chimney.webp")},
                {"id": "var-chim-90", "label": "90 cm Width (4-5 Burners)", "unit": "Unit", "price": 14990, "mrp": 23990, "discountPercent": 38, "stock": 15, "image": v("/images/products/appliances/faber-60cm-curved-glass-kitchen-chimney.webp")},
            ]
        ),
        make_product(
            "pres-cooktop", "prestige-pic-20-induction-cooktop",
            "Prestige PIC 20 1600W Induction Cooktop with Indian Menu Presets", "Prestige",
            "home-appliances", "Home Appliances", "Induction & Gas Cooktops",
            "/images/products/appliances/prestige-pic-20-induction-cooktop.webp",
            "Indian Menu Presets · Automatic Voltage Regulator · Antimagnetic Wall",
            ["1600W Power", "Indian Menu Options", "Dual Heat Sensor", "Flame-Free Cooking"],
            "Prestige PIC 20 induction cooktop delivers fast, safe, and flame-free modern cooking. Equipped with pre-programmed Indian cooking menus for chapati, dosa, curry, and milk boiling. Built-in automatic voltage regulator protects against sudden power surges.",
            [
                "Preset Indian menu modes automatically adjust temperature and timer for perfect cooking",
                "Full glass surface with anti-magnetic wall blocks harmful magnetic radiation leakage",
                "Built-in automatic voltage regulator ensures continuous operation during supply dips",
                "Dual heat sensors monitor vessel temperature to prevent food from burning or boiling over",
                "Compact, lightweight portable design is ideal for modern apartments and rental homes"
            ],
            [
                {"label": "Brand", "value": "TTK Prestige Limited"},
                {"label": "Model", "value": "PIC 20 Induction Cooktop"},
                {"label": "Power Input", "value": "1600 Watts (230V AC)"},
                {"label": "Safety Features", "value": "Automatic Shut-Off & Voltage Regulator"},
                {"label": "Control Panel", "value": "Soft-Touch Push Button Control"},
                {"label": "Warranty", "value": "1 Year Prestige National Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-ind-1600", "label": "1600W Standard", "unit": "Unit", "price": 2199, "mrp": 3245, "discountPercent": 32, "stock": 45, "image": v("/images/products/appliances/prestige-pic-20-induction-cooktop.webp")},
                {"id": "var-ind-2000", "label": "2000W Dual Sensor Pro", "unit": "Unit", "price": 2899, "mrp": 4195, "discountPercent": 31, "stock": 30, "image": v("/images/products/appliances/prestige-pic-20-induction-cooktop.webp")},
            ]
        ),
        make_product(
            "pres-mixer", "prestige-iris-plus-750w-mixer-grinder",
            "Prestige Iris Plus 750W Heavy-Duty Mixer Grinder with 4 Jars", "Prestige",
            "home-appliances", "Home Appliances", "Induction & Gas Cooktops",
            "/images/products/appliances/prestige-iris-plus-750w-mixer-grinder.webp",
            "Powerful 750W Motor · 3 Stainless Steel Jars + 1 Transparent Juicer",
            ["750W Copper Motor", "3 SS Jars + 1 Juicer", "Ergonomic Handles", "Overload Protection"],
            "Heavy-duty 750W mixer grinder designed to grind tough Indian kitchen spices, wet idli batter, and fresh fruit juices. Comes with three robust stainless steel jars and a transparent juicer jar with sharp multi-function blades.",
            [
                "Powerful 750-watt pure copper motor handles heavy wet and dry grinding with ease",
                "Four versatile jars: Wet Grinding (1.5L), Dry Grinding (1.0L), Chutney (300ml), Juicer (1.5L)",
                "Superior grade 304 stainless steel jars with sturdy ergonomic grip handles",
                "Overload protector switch cuts power automatically to prevent motor overheating",
                "Attractive black and red modern dual-tone styling complements designer modular kitchens"
            ],
            [
                {"label": "Brand", "value": "TTK Prestige Limited"},
                {"label": "Model", "value": "Iris Plus 750W"},
                {"label": "Motor Rating", "value": "750 Watts (20,000 RPM)"},
                {"label": "Jars Included", "value": "3 Stainless Steel Jars + 1 Juicer Jar"},
                {"label": "Blade Material", "value": "Super Fine Grade 304 Stainless Steel"},
                {"label": "Warranty", "value": "2 Years Brand Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-mix-4jar", "label": "3 SS Jars + 1 Juicer Jar Set", "unit": "Unit", "price": 3299, "mrp": 6295, "discountPercent": 48, "stock": 40, "image": v("/images/products/appliances/prestige-iris-plus-750w-mixer-grinder.webp")},
            ]
        ),
    ])

    # ─── 14. Lighting ───────────────────────────────────────────────────────
    prods.extend([
        make_product(
            "wipro-round", "wipro-garnet-rimless-round-led-surface-panel-light",
            "Wipro Garnet Rimless Round LED Surface Panel Light (2 Years Warranty)", "Wipro",
            "lighting", "Lighting", "Recessed Round & Square Panels",
            "/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp",
            "Frameless Edge-to-Edge Glow · 3.5 kV Surge Protection · Eye Soft Optics",
            ["Edge-to-Edge Glow", "3.5 kV Surge Guard", "Eye Soft Tech", "100 Lumens/Watt"],
            "Wipro Garnet Rimless surface LED panel provides uniform edge-to-edge illumination without any dark perimeter borders. Features advanced Eye Soft optics that eliminate glare and high 3.5 kV surge protection against voltage spikes.",
            [
                "Rimless edgeless diffuser provides 180° wide light distribution without shadow rings",
                "High luminous efficacy delivering over 100 lumens per watt for bright energy savings",
                "Robust built-in driver withstands voltage spikes and surges up to 3.5 kV",
                "Flicker-free driver eliminates subconscious eye fatigue during reading and work",
                "Low-profile slim surface mount clips directly onto any concrete or false ceiling"
            ],
            [
                {"label": "Brand", "value": "Wipro Consumer Lighting"},
                {"label": "Series", "value": "Garnet Rimless Surface Series"},
                {"label": "Color Temperature", "value": "Cool Daylight (6500K) / Warm White (3000K)"},
                {"label": "Luminous Efficacy", "value": "> 100 lm/Watt"},
                {"label": "Surge Protection", "value": "3.5 kV Built-in Driver Protection"},
                {"label": "Operating Voltage", "value": "150V - 300V AC"},
                {"label": "Warranty", "value": "2 Years Complete Replacement Guarantee"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-wip-6w", "label": "6 Watt (Cool Daylight)", "unit": "Piece", "price": 245, "mrp": 550, "discountPercent": 55, "stock": 100, "image": v("/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp")},
                {"id": "var-wip-9w", "label": "9 Watt (Cool Daylight)", "unit": "Piece", "price": 295, "mrp": 690, "discountPercent": 57, "stock": 120, "image": v("/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp")},
                {"id": "var-wip-12w", "label": "12 Watt (Cool Daylight)", "unit": "Piece", "price": 345, "mrp": 790, "discountPercent": 56, "stock": 150, "image": v("/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp")},
                {"id": "var-wip-15w", "label": "15 Watt (Cool Daylight)", "unit": "Piece", "price": 389, "mrp": 890, "discountPercent": 56, "stock": 140, "image": v("/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp")},
                {"id": "var-wip-18w", "label": "18 Watt (Cool Daylight)", "unit": "Piece", "price": 460, "mrp": 1050, "discountPercent": 56, "stock": 90, "image": v("/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp")},
                {"id": "var-wip-22w", "label": "22 Watt High Brightness", "unit": "Piece", "price": 540, "mrp": 1250, "discountPercent": 57, "stock": 60, "image": v("/images/products/lighting/wipro-garnet-rimless-round-led-surface-panel-light.webp")},
            ]
        ),
        make_product(
            "phil-glow", "philips-full-glow-led-surface-light-round",
            "Philips Full Glow LED Surface Light, Round, Slim 2.9 cm", "Philips",
            "lighting", "Lighting", "Recessed Round & Square Panels",
            "/images/products/lighting/philips-full-glow-led-surface-light-round.webp",
            "Ultra-Slim 2.9 cm Profile · Full Glow Diffuser · EyeComfort Technology",
            ["Full Glow Diffuser", "Slim 2.9 cm Depth", "EyeComfort Tech", "Long Life 25,000 Hrs"],
            "Philips Full Glow LED surface downlight features a clean 2.9cm ultra-slim profile and edge-to-edge luminous diffuser. Certified with Philips EyeComfort criteria to reduce glare, strobe, and optical flicker.",
            [
                "Full face glow creates an expansive lighting effect that brightens ceilings and walls",
                "Ultra-slim 2.9 cm depth fits snugly without hanging down awkwardly into the room",
                "Philips EyeComfort certified to prevent glare and protect children's and elder's vision",
                "Long operating life rated for 25,000 hours with sustained lumen maintenance",
                "Integrated driver and twist-and-lock mounting bracket enables quick DIY installation"
            ],
            [
                {"label": "Brand", "value": "Philips Lighting (Signify)"},
                {"label": "Model", "value": "Full Glow Surface LED Round"},
                {"label": "CRI (Color Rendering)", "value": "> 80 (True Color Reproduction)"},
                {"label": "Thickness", "value": "2.9 cm Ultra Slim Profile"},
                {"label": "Surge Protection", "value": "2.5 kV"},
                {"label": "Lifetime", "value": "25,000 Burning Hours"},
                {"label": "Warranty", "value": "2 Years Official Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-phil-10w-cdl", "label": "10 Watt (Cool Daylight)", "unit": "Piece", "price": 440, "mrp": 650, "discountPercent": 32, "stock": 80, "image": v("/images/products/lighting/philips-full-glow-led-surface-light-round.webp")},
                {"id": "var-phil-10w-ww", "label": "10 Watt (Warm White)", "unit": "Piece", "price": 440, "mrp": 650, "discountPercent": 32, "stock": 60, "image": v("/images/products/lighting/philips-full-glow-led-surface-light-round.webp")},
                {"id": "var-phil-15w-cdl", "label": "15 Watt (Cool Daylight)", "unit": "Piece", "price": 518, "mrp": 775, "discountPercent": 33, "stock": 100, "image": v("/images/products/lighting/philips-full-glow-led-surface-light-round.webp")},
                {"id": "var-phil-15w-ww", "label": "15 Watt (Warm White)", "unit": "Piece", "price": 518, "mrp": 775, "discountPercent": 33, "stock": 70, "image": v("/images/products/lighting/philips-full-glow-led-surface-light-round.webp")},
                {"id": "var-phil-20w-cdl", "label": "20 Watt (Cool Daylight)", "unit": "Piece", "price": 670, "mrp": 990, "discountPercent": 32, "stock": 50, "image": v("/images/products/lighting/philips-full-glow-led-surface-light-round.webp")},
            ]
        ),
        make_product(
            "sturlite-lexxo", "sturlite-lexxo-trimless-surface-mount-led-downlight",
            "Sturlite LEXXO Trimless Surface Mount LED Downlight (Round)", "Sturlite",
            "lighting", "Lighting", "Recessed Round & Square Panels",
            "/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp",
            "Value Leader · Trimless Flush Design · 2-Year Warranty · High Efficacy",
            ["Trimless Design", "High Lumen Output", "2-Year Warranty", "Flicker Free"],
            "Sturlite LEXXO is an affordable high-performance trimless surface downlight engineered for homes, rental units, and builder floors. Delivers crisp, bright illumination with wide beam distribution and durable polycarbonate casing.",
            [
                "Trimless construction delivers a modern architectural aesthetic at competitive pricing",
                "High lumens output illuminates entire rooms with fewer light points",
                "Rugged thermal casing dissipates heat efficiently for extended LED chip longevity",
                "Compact mounting base fits directly over standard PVC round conduit junction boxes",
                "Full 2-year replacement warranty ensures reliable performance across daily use"
            ],
            [
                {"label": "Brand", "value": "Sturlite Lighting"},
                {"label": "Series", "value": "LEXXO Trimless Surface"},
                {"label": "Color Temperature", "value": "6500K Cool White"},
                {"label": "Beam Angle", "value": "120° Wide Flood"},
                {"label": "Power Factor", "value": "> 0.90"},
                {"label": "Warranty", "value": "2 Years Official Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-stur-7w", "label": "7 Watt Cool Daylight", "unit": "Piece", "price": 242, "mrp": 499, "discountPercent": 52, "stock": 100, "image": v("/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp")},
                {"id": "var-stur-12w", "label": "12 Watt Cool Daylight", "unit": "Piece", "price": 320, "mrp": 650, "discountPercent": 51, "stock": 90, "image": v("/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp")},
                {"id": "var-stur-18w", "label": "18 Watt Cool Daylight", "unit": "Piece", "price": 410, "mrp": 820, "discountPercent": 50, "stock": 60, "image": v("/images/products/lighting/sturlite-lexxo-trimless-surface-mount-led-downlight.webp")},
            ]
        ),
        make_product(
            "wipro-3in1", "wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel",
            "Wipro Garnet Rimless 3-in-1 CCT Surface Mounted LED Panel", "Wipro",
            "lighting", "Lighting", "Recessed Round & Square Panels",
            "/images/products/lighting/wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel.webp",
            "3 Colors in 1 Light · Cool White, Warm White & Natural · Toggle via Wall Switch",
            ["3-in-1 Color CCT", "Switch Toggle", "Rimless Glow", "Mood Lighting"],
            "Versatile 3-in-1 color tunable surface LED light that lets you change ambience on demand. Toggle between Cool White for focused study, Natural White for cozy family dining, and Warm Golden White for evening relaxation using your existing wall switch.",
            [
                "Change ambient light color seamlessly by simply flipping your existing wall switch",
                "Three color modes: 6500K Cool White, 4000K Natural Neutral, and 3000K Warm Golden",
                "Rimless outer perimeter glow maximizes light spill across ceiling corners",
                "Internal memory chip remembers your last selected color preference when powered off",
                "High power factor (>0.90) and low total harmonic distortion protects house wiring"
            ],
            [
                {"label": "Brand", "value": "Wipro Consumer Lighting"},
                {"label": "Model", "value": "Garnet Rimless 3-in-1 CCT"},
                {"label": "Tunable Colors", "value": "6500K (Cool) / 4000K (Natural) / 3000K (Warm)"},
                {"label": "Switching Mechanism", "value": "Toggled via Standard Wall Switch"},
                {"label": "Driver Protection", "value": "3.5 kV Surge Guard"},
                {"label": "Warranty", "value": "2 Years Brand Replacement"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-wip-3in1-12w", "label": "12 Watt 3-in-1 Color Tunable", "unit": "Piece", "price": 579, "mrp": 990, "discountPercent": 42, "stock": 80, "image": v("/images/products/lighting/wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel.webp")},
                {"id": "var-wip-3in1-18w", "label": "18 Watt 3-in-1 Color Tunable", "unit": "Piece", "price": 699, "mrp": 1250, "discountPercent": 44, "stock": 60, "image": v("/images/products/lighting/wipro-garnet-rimless-3in1-cct-surface-mounted-led-panel.webp")},
            ]
        ),
        make_product(
            "phil-stellar", "philips-stellar-bright-rimless-surface-downlight-15w",
            "Philips Stellar Bright Rimless Surface Downlight 15W", "Philips",
            "lighting", "Lighting", "Recessed Round & Square Panels",
            "/images/products/lighting/philips-stellar-bright-rimless-surface-downlight-15w.webp",
            "15W Ultra Bright 1500 Lumens · Rimless Edge Design · 2 Years Warranty",
            ["1500 Lumens Output", "Rimless Frame", "Wide 140° Beam", "Philips Reliability"],
            "Philips Stellar Bright 15W delivers an impressive 1500 lumens of glare-free light with a clean rimless face. Ideal for living rooms, kitchens, and corridors requiring powerful, even illumination.",
            [
                "Class-leading 1500 lumens light output brightens up large living and dining rooms",
                "Advanced optical grade polycarbonate diffuser prevents eye strain and glare",
                "Solid heat sink keeps high-power LED diodes operating at cool temperatures",
                "Simple ceiling surface bracket fixes without cutting false ceiling apertures",
                "Tested for robust operation across erratic Indian grid voltage dips"
            ],
            [
                {"label": "Brand", "value": "Philips Lighting (Signify)"},
                {"label": "Model", "value": "Stellar Bright Rimless 15W"},
                {"label": "Wattage / Lumens", "value": "15 Watts / 1500 Lumens"},
                {"label": "Efficacy", "value": "100 Lumens / Watt"},
                {"label": "Beam Spread", "value": "140° Wide Optical Diffusion"},
                {"label": "Warranty", "value": "2 Years Official Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-phil-sb-cdl", "label": "15W Cool Daylight (6500K)", "unit": "Piece", "price": 485, "mrp": 750, "discountPercent": 35, "stock": 80, "image": v("/images/products/lighting/philips-stellar-bright-rimless-surface-downlight-15w.webp")},
                {"id": "var-phil-sb-nw", "label": "15W Natural White (4000K)", "unit": "Piece", "price": 485, "mrp": 750, "discountPercent": 35, "stock": 60, "image": v("/images/products/lighting/philips-stellar-bright-rimless-surface-downlight-15w.webp")},
            ]
        ),
        make_product(
            "wipro-square", "wipro-garnet-wave-led-slim-panel-square-18w",
            "Wipro Garnet Wave LED Ultra-Slim Square Recessed Ceiling Panel 18W", "Wipro",
            "lighting", "Lighting", "Recessed Round & Square Panels",
            "/images/products/lighting/wipro-garnet-wave-led-slim-panel-square-18w.webp",
            "Sleek Square Profile · False Ceiling Spring Clips · 18W High Output",
            ["Square Profile", "Spring Mount Clips", "18W High Power", "False Ceiling Ready"],
            "Square ultra-slim LED panel designed for gypsum board, POP, and grid false ceilings. Equipped with heavy-duty spring-loaded clips for effortless flush ceiling mounting. Delivers clean architectural square geometry.",
            [
                "Modern square bezel complements contemporary modular false ceiling layouts",
                "Heavy-duty spring retention clips hold the panel firmly flush against ceiling sheets",
                "Side-lit LED guide plate creates completely uniform illumination with zero hotspots",
                "Separate high-efficiency isolated driver ensures cool running and easy serviceability",
                "Backed by Wipro's hassle-free 2-year on-site replacement guarantee"
            ],
            [
                {"label": "Brand", "value": "Wipro Consumer Lighting"},
                {"label": "Series", "value": "Garnet Wave Square Recessed"},
                {"label": "Shape", "value": "Square Form Factor"},
                {"label": "Cut-Out Size", "value": "205 mm x 205 mm (8 x 8 Inch)"},
                {"label": "Power Rating", "value": "18 Watts (1800 Lumens)"},
                {"label": "Warranty", "value": "2 Years Official Warranty"},
                {"label": "Delivery Time", "value": "60 Mins Express Dispatch"}
            ],
            [
                {"id": "var-wip-sq-12w", "label": "12W Square (6x6 inch cut)", "unit": "Piece", "price": 395, "mrp": 720, "discountPercent": 45, "stock": 70, "image": v("/images/products/lighting/wipro-garnet-wave-led-slim-panel-square-18w.webp")},
                {"id": "var-wip-sq-18w", "label": "18W Square (8x8 inch cut)", "unit": "Piece", "price": 495, "mrp": 850, "discountPercent": 42, "stock": 80, "image": v("/images/products/lighting/wipro-garnet-wave-led-slim-panel-square-18w.webp")},
            ]
        ),
    ])

    return prods

print("Electrical group ready.")
