export interface SanitaryBathProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  categorySlug: "sanitary-bath-fittings";
  categoryName: "Sanitary & Bath Fittings";
  subCategory: string;
  sanitarySubcategory:
    | "WALL_HUNG_AND_ONE_PIECE_WC"
    | "CONCEALED_CISTERN_FLUSH_PLATE"
    | "COUNTERTOP_CERAMIC_BASIN"
    | "DIVERTER_SHOWER_SPOUT"
    | "FAUCET_VALVE_ACCESSORY";
  mountingType: "WALL_HUNG" | "FLOOR_MOUNT_S_TRAP" | "TABLETOP_COUNTER" | "CONCEALED_IN_WALL" | "WALL_SURFACE";
  trapOrWasteSpec: string;
  flushCapacityLiters: string | null;
  flowRateLpm: string | null;
  finishColor: string;
  materialGrade: string;
  inclusionsBadge: string | null;
  oemModelCode?: string | null;
  sellingUnit: string;
  unit: string;
  price: number;
  exGstPrice: number;
  mrp: number;
  discountPercent: number;
  gstPercent: 18;
  hsnCode: string;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "E-Loader / Pickup";
  brandTier: 1 | 2 | 3;
  image: string;
  images: string[];
  shortTagline: string;
  specChips: string[];
  description: string;
  highlights: string[];
  specifications: Array<{ label: string; value: string }>;
  variants: Array<{
    id: string;
    label: string;
    unit: string;
    price: number;
    mrp: number;
    discountPercent: number;
    stock: number;
    image: string;
  }>;
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  deliveryEta: string;
  vendor: string;
  crossSellSkus: string[];
}

export const ALL_28_SANITARY_BATH_PRODUCTS: SanitaryBathProduct[] = [
  {
    "id": "prod-san-jaquar-kubix-prime-rimless-wc",
    "slug": "jaquar-kubix-prime-rimless-wall-hung-wc-soft-close-uf-seat-white",
    "name": "Jaquar — Kubix Prime Rimless Wall-Hung WC with Soft-Close UF Seat (White)",
    "title": "Jaquar — Kubix Prime Rimless Wall-Hung WC with Soft-Close UF Seat (White)",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Wall-Hung WCs & One-Piece Commodes",
    "sanitarySubcategory": "WALL_HUNG_AND_ONE_PIECE_WC",
    "mountingType": "WALL_HUNG",
    "trapOrWasteSpec": "P-Trap 180mm",
    "flushCapacityLiters": "Dual Flush 3L / 6L",
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Includes Soft-Close UF Seat Cover & Concealed L-Brackets",
    "oemModelCode": "KWS-WHT-01",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 9450,
    "exGstPrice": 8008,
    "mrp": 12600,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Rimless Flush · Anti-Bacterial Glaze · Soft-Close UF Seat Cover",
    "specChips": [
      "Wall-Hung P-Trap",
      "Rimless 360° Flush",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Jaquar flagship Kubix Prime rimless wall-hung water closet. Engineered with blind installation technology that conceals all mounting brackets for a completely smooth exterior ceramic surface. Rimless vortex wash provides superior hygiene with 0 blind spots.",
    "highlights": [
      "Rimless hydraulic bowl design cleans every interior surface with zero splash-back",
      "Heavy-duty Urea Formaldehyde (UF) slim seat cover with silent hydraulic closing",
      "Vitreous china body fired at 1250°C with non-porous antibacterial glaze",
      "Standard 180mm P-Trap center matches all Lucknow concealed cistern frames",
      "Certified 400 kg static load capacity tested to EN 997 standards"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "KWS-WHT-01"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Hung with Concealed Brackets"
      },
      {
        "label": "Trap Distance",
        "value": "P-Trap 180mm"
      },
      {
        "label": "Flush Capacity",
        "value": "Dual Flush 3L / 6L"
      },
      {
        "label": "Finish",
        "value": "White Gloss Ceramic"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader (Crated)"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-kubix-wc",
        "label": "Pure White Set with UF Seat",
        "unit": "Set",
        "price": 9450,
        "mrp": 12600,
        "discountPercent": 25,
        "stock": 18,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 164,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-cistern-frame-tank",
      "prod-san-jaquar-kubix-flush-plate-chr",
      "prod-san-jaquar-health-faucet-abs",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-cera-victor-one-piece-s-trap",
    "slug": "cera-victor-one-piece-s-trap-300mm-ceramic-commode-white",
    "name": "Cera — Victor One-Piece S-Trap 300mm Ceramic Commode with Slow-Falling Cover",
    "title": "Cera — Victor One-Piece S-Trap 300mm Ceramic Commode with Slow-Falling Cover",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Wall-Hung WCs & One-Piece Commodes",
    "sanitarySubcategory": "WALL_HUNG_AND_ONE_PIECE_WC",
    "mountingType": "FLOOR_MOUNT_S_TRAP",
    "trapOrWasteSpec": "S-Trap 300mm Floor Outlet",
    "flushCapacityLiters": "Dual Flush 3L / 6L",
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Includes Built-in Cistern Internal Fittings & Soft-Close Seat",
    "oemModelCode": "S1013101",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 6990,
    "exGstPrice": 5924,
    "mrp": 9980,
    "discountPercent": 30,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Single Piece Floor Mount · Syphonic S-Trap 300mm · Soft Close Seat",
    "specChips": [
      "S-Trap 300mm",
      "Integrated Cistern",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Cera Victor high-efficiency single piece ceramic floor-standing commode. Seamless one-piece mold eliminates leak points between cistern and bowl. Powerful syphonic jet dual flush ensures clean evacuation on 3L liquid and 6L solid cycles.",
    "highlights": [
      "Seamless monobloc construction with zero tank-to-bowl leak paths",
      "Standard 300mm (12-inch) S-Trap rough-in fits modern Lucknow builder floor core holes",
      "Dual flush push buttons on top cistern lid with water-saving calibration",
      "Includes slow-falling hydraulic seat cover that prevents clattering noise and cracks",
      "Anti-stain glaze prevents mineral staining and yellowing from hard borewell water"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "OEM Model Code",
        "value": "S1013101"
      },
      {
        "label": "Mounting Type",
        "value": "Floor Mount S-Trap"
      },
      {
        "label": "Trap Distance",
        "value": "300mm (12 Inch) S-Trap"
      },
      {
        "label": "Flush Capacity",
        "value": "Dual Flush 3L / 6L"
      },
      {
        "label": "Finish",
        "value": "White Gloss Ceramic"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader (Crated)"
      }
    ],
    "variants": [
      {
        "id": "var-san-cera-victor-wc",
        "label": "300mm S-Trap One Piece",
        "unit": "Piece",
        "price": 6990,
        "mrp": 9980,
        "discountPercent": 30,
        "stock": 22,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 142,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Ceramic Depot",
    "crossSellSkus": [
      "prod-san-jaquar-health-faucet-abs",
      "prod-san-cera-garnet-2way-bibcock",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-parryware-cruz-wall-mounted-wc",
    "slug": "parryware-cruz-rimless-wall-mounted-ceramic-closet-slim-seat-white",
    "name": "Parryware — Cruz Rimless Wall-Mounted Ceramic Closet with Slim Seat (White)",
    "title": "Parryware — Cruz Rimless Wall-Mounted Ceramic Closet with Slim Seat (White)",
    "brand": "Parryware",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Wall-Hung WCs & One-Piece Commodes",
    "sanitarySubcategory": "WALL_HUNG_AND_ONE_PIECE_WC",
    "mountingType": "WALL_HUNG",
    "trapOrWasteSpec": "P-Trap 180mm",
    "flushCapacityLiters": "Dual Flush 3L / 6L",
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Includes Quick-Release Slim Duroplast Seat Cover",
    "oemModelCode": "C0279",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 7490,
    "exGstPrice": 6347,
    "mrp": 10700,
    "discountPercent": 30,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Rimless Clean · Slim Duroplast Cover · 180mm P-Trap Standard",
    "specChips": [
      "Wall-Hung P-Trap",
      "Slim Duroplast Seat",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Parryware Cruz contemporary rimless wall-hung ceramic commode. Features an ultra-hygienic rimless water channel that accelerates flush speed while cutting water consumption. Designed for modern luxury apartments and builder floors.",
    "highlights": [
      "Vortex rimless flushing sweeps the entire bowl with high kinetic velocity",
      "Quick-release hinge buttons allow lifting the seat cover off for effortless cleaning",
      "Stain-resistant antibacterial glaze prevents lime scale deposits",
      "Universal 180mm P-Trap connects directly to standard concealed cistern flush pipes",
      "Ergonomic contoured profile with generous 530mm projection for adult seating comfort"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Parryware (Roca Group)"
      },
      {
        "label": "OEM Model Code",
        "value": "C0279"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Hung Closet"
      },
      {
        "label": "Trap Distance",
        "value": "P-Trap 180mm"
      },
      {
        "label": "Flush Capacity",
        "value": "Dual Flush 3L / 6L"
      },
      {
        "label": "Finish",
        "value": "White Gloss Ceramic"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader (Crated)"
      }
    ],
    "variants": [
      {
        "id": "var-san-parry-cruz",
        "label": "Wall Hung with Slim Duroplast Seat",
        "unit": "Set",
        "price": 7490,
        "mrp": 10700,
        "discountPercent": 30,
        "stock": 15,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 118,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Sanitary Gallery",
    "crossSellSkus": [
      "prod-san-jaquar-cistern-frame-tank",
      "prod-san-cera-qtype-flush-plate-chr",
      "prod-san-jaquar-health-faucet-abs"
    ]
  },
  {
    "id": "prod-san-hindware-element-one-piece-wc",
    "slug": "hindware-element-one-piece-s-trap-300mm-dual-flush-commode-white",
    "name": "Hindware — Element One-Piece S-Trap 300mm Dual-Flush Vitreous China Commode",
    "title": "Hindware — Element One-Piece S-Trap 300mm Dual-Flush Vitreous China Commode",
    "brand": "Hindware",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Wall-Hung WCs & One-Piece Commodes",
    "sanitarySubcategory": "WALL_HUNG_AND_ONE_PIECE_WC",
    "mountingType": "FLOOR_MOUNT_S_TRAP",
    "trapOrWasteSpec": "S-Trap 300mm Core Fit",
    "flushCapacityLiters": "Dual Flush 3L / 6L",
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Includes Pre-Fitted Geberit Dual Flush Valve & Heavy Hinged Seat",
    "oemModelCode": "20021",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 7850,
    "exGstPrice": 6653,
    "mrp": 11215,
    "discountPercent": 30,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "360° Whirlpool Flush · Dual Flush Syphonic · Pre-fitted Valve",
    "specChips": [
      "S-Trap 300mm",
      "Dual Flush 3/6L",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Hindware Italian Collection Element single-piece floor-mounted ceramic toilet. Engineered with double syphon flushing and dual jet nozzles for 100% bowl wash. Vitreous china surface is glazed at high temperature to resist staining.",
    "highlights": [
      "Italian design styling with sleek enclosed skirted sides that prevent dust accumulation",
      "300mm S-Trap floor outlet ensures plug-and-play installation on standard plumbing collars",
      "Factory-installed dual flush valve tested to over 1,50,000 flush cycles",
      "Heavy UF antibacterial soft-close seat with stainless steel quick-release hinges",
      "Deep water seal prevents sewer gases and odors from re-entering the bathroom"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hindware Italian Collection"
      },
      {
        "label": "OEM Model Code",
        "value": "20021"
      },
      {
        "label": "Mounting Type",
        "value": "Floor Mount S-Trap"
      },
      {
        "label": "Trap Distance",
        "value": "300mm S-Trap"
      },
      {
        "label": "Flush Capacity",
        "value": "Dual Flush 3L / 6L"
      },
      {
        "label": "Finish",
        "value": "White Gloss Ceramic"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader (Crated)"
      }
    ],
    "variants": [
      {
        "id": "var-san-hind-element",
        "label": "300mm S-Trap One Piece",
        "unit": "Piece",
        "price": 7850,
        "mrp": 11215,
        "discountPercent": 30,
        "stock": 14,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 96,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-health-faucet-abs",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-kohler-veil-wall-hung-wc",
    "slug": "kohler-veil-rimless-wall-hung-toilet-quiet-close-slim-seat-white",
    "name": "Kohler — Veil Rimless Wall-Hung Toilet with Quiet-Close Slim Seat (White)",
    "title": "Kohler — Veil Rimless Wall-Hung Toilet with Quiet-Close Slim Seat (White)",
    "brand": "Kohler",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Wall-Hung WCs & One-Piece Commodes",
    "sanitarySubcategory": "WALL_HUNG_AND_ONE_PIECE_WC",
    "mountingType": "WALL_HUNG",
    "trapOrWasteSpec": "P-Trap 180mm",
    "flushCapacityLiters": "Dual Flush 3L / 4.5L",
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A+",
    "inclusionsBadge": "Includes Quick-Release Quiet-Close Seat & French Gold Accents",
    "oemModelCode": "K-21782IN",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 22990,
    "exGstPrice": 19483,
    "mrp": 28750,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader / Pickup",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Luxury Sculpted Curves · CleanCoat Glaze · Quiet-Close Slim Seat",
    "specChips": [
      "Wall-Hung P-Trap",
      "Class Five Eco-Flush",
      "18% GST / HSN 6910",
      "Padded Crate"
    ],
    "description": "Kohler Veil premium luxury wall-hung toilet. Features flowing, organically sculpted lines that create an artistic statement in upscale bathrooms. Kohler CleanCoat nano-glaze repels water and prevents hard water staining.",
    "highlights": [
      "Class Five high-efficiency flushing technology clears bowl on minimal 3L / 4.5L water",
      "CleanCoat nano-technology prevents dirt and water stains from clinging to ceramic surface",
      "Grip-Tight Quiet-Close slim seat prevents slamming and shifts during use",
      "Hidden mounting hardware preserves clean continuous external architectural curves",
      "Engineered to withstand rigorous 450 kg load tests with solid cast brass hinges"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Kohler USA"
      },
      {
        "label": "OEM Model Code",
        "value": "K-21782IN"
      },
      {
        "label": "Mounting Type",
        "value": "Concealed Wall Hung"
      },
      {
        "label": "Trap Distance",
        "value": "P-Trap 180mm"
      },
      {
        "label": "Flush Capacity",
        "value": "Dual Flush 3L / 4.5L"
      },
      {
        "label": "Finish",
        "value": "White Gloss Ceramic"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader / Pickup (Padded Crate)"
      }
    ],
    "variants": [
      {
        "id": "var-san-kohler-veil",
        "label": "Veil Wall Hung White Set",
        "unit": "Set",
        "price": 22990,
        "mrp": 28750,
        "discountPercent": 20,
        "stock": 8,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 54,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Luxury Bath Studio",
    "crossSellSkus": [
      "prod-san-jaquar-cistern-frame-tank",
      "prod-san-jaquar-alive-flush-plate-blk"
    ]
  },
  {
    "id": "prod-san-cera-calisto-rimless-wall-hung",
    "slug": "cera-calisto-rimless-wall-hung-ceramic-wc-antibacterial-seat-white",
    "name": "Cera — Calisto Rimless Wall-Hung Ceramic WC with Antibacterial Glaze (White)",
    "title": "Cera — Calisto Rimless Wall-Hung Ceramic WC with Antibacterial Glaze (White)",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Wall-Hung WCs & One-Piece Commodes",
    "sanitarySubcategory": "WALL_HUNG_AND_ONE_PIECE_WC",
    "mountingType": "WALL_HUNG",
    "trapOrWasteSpec": "P-Trap 180mm",
    "flushCapacityLiters": "Dual Flush 3L / 6L",
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Includes Antibacterial UF Soft-Close Seat & SS Mounting Anchors",
    "oemModelCode": "S1043151",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 8200,
    "exGstPrice": 6949,
    "mrp": 11700,
    "discountPercent": 30,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Rimless Hydro-Clean · Silent Vortex Wash · UF Antibacterial Seat",
    "specChips": [
      "Wall-Hung P-Trap",
      "Rimless Hydro-Clean",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Cera Calisto European design rimless wall-hung water closet. Advanced hydraulic dynamic flushing delivers whisper-quiet evacuation and zero splash. Ultra-compact 515mm depth is ideal for master bathrooms and powder rooms.",
    "highlights": [
      "Hydro-Clean rimless flushing rinses entire perimeter with zero hidden cavities",
      "Antibacterial ceramic glaze prevents bacterial multiplication by 99.9%",
      "Heavy-duty slim UF toilet seat cover with hydraulic dampeners for noiseless closing",
      "Universal 180mm P-Trap connects effortlessly to Jaquar, Geberit, and Cera concealed frames",
      "10-year manufacturer warranty on ceramic body integrity and glaze"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "OEM Model Code",
        "value": "S1043151"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Hung with L-Brackets"
      },
      {
        "label": "Trap Distance",
        "value": "P-Trap 180mm"
      },
      {
        "label": "Flush Capacity",
        "value": "Dual Flush 3L / 6L"
      },
      {
        "label": "Finish",
        "value": "White Gloss Ceramic"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader (Crated)"
      }
    ],
    "variants": [
      {
        "id": "var-san-cera-calisto",
        "label": "Calisto Wall Hung White Set",
        "unit": "Set",
        "price": 8200,
        "mrp": 11700,
        "discountPercent": 30,
        "stock": 16,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 88,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Ceramic Depot",
    "crossSellSkus": [
      "prod-san-cera-slim-cistern-tank-80mm",
      "prod-san-cera-qtype-flush-plate-chr",
      "prod-san-jaquar-health-faucet-abs"
    ]
  },
  {
    "id": "prod-san-jaquar-cistern-frame-tank",
    "slug": "jaquar-in-wall-concealed-cistern-tank-structural-mounting-frame-dual-flush",
    "name": "Jaquar — In-Wall Concealed Cistern Tank with Structural Mounting Chair Frame (Dual Flush 3/6L)",
    "title": "Jaquar — In-Wall Concealed Cistern Tank with Structural Mounting Chair Frame (Dual Flush 3/6L)",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Concealed Cisterns & Dual-Flush Plates",
    "sanitarySubcategory": "CONCEALED_CISTERN_FLUSH_PLATE",
    "mountingType": "CONCEALED_IN_WALL",
    "trapOrWasteSpec": "Fits 180mm / 230mm Wall-Hung WC Bolts",
    "flushCapacityLiters": "Dual Flush 3L / 6L",
    "flowRateLpm": null,
    "finishColor": "Blue Steel Frame / White HDPE Tank",
    "materialGrade": "Heavy Epoxy Coated Steel & Blow-Molded HDPE",
    "inclusionsBadge": "Includes Frame, Cistern Tank, Flush Pipe & WC Waste Bend",
    "oemModelCode": "JCC-WHT-01",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 4850,
    "exGstPrice": 4110,
    "mrp": 6500,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "3922",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "400kg Load Tested Chair · Seamless Blow-Molded Tank · Dual Flush 3/6L",
    "specChips": [
      "400kg Load Tested",
      "Dual Flush 3/6L",
      "18% GST / HSN 3922",
      "E-Loader Safe"
    ],
    "description": "Jaquar heavy structural steel chair frame with factory-assembled blow-molded HDPE cistern tank. Engineered to be bolted inside drywall partitions or masonry ducts. Supports up to 400kg static load without deflection.",
    "highlights": [
      "Seamless blow-molded one-piece HDPE tank with zero seam lines prevents in-wall leaks",
      "Sturdy 30x30mm powder-coated steel frame with height-adjustable zinc-plated legs",
      "Dual flush mechanical valve calibrated to 3L liquid / 6L full solid flush",
      "Pre-wrapped in EPS expanded polystyrene insulation to prevent in-wall condensation",
      "Compatible with all Jaquar mechanical and pneumatic flush actuator push plates"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "JCC-WHT-01"
      },
      {
        "label": "Mounting Type",
        "value": "In-Wall Concealed with Steel Frame"
      },
      {
        "label": "Load Capacity",
        "value": "400 kg Tested"
      },
      {
        "label": "Flush Capacity",
        "value": "Dual Flush 3L / 6L"
      },
      {
        "label": "HSN Code",
        "value": "3922"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-cistern-frame",
        "label": "Complete Frame with HDPE Tank",
        "unit": "Set",
        "price": 4850,
        "mrp": 6500,
        "discountPercent": 25,
        "stock": 25,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-kubix-flush-plate-chr",
      "prod-san-jaquar-alive-flush-plate-blk",
      "prod-san-jaquar-kubix-prime-rimless-wc"
    ]
  },
  {
    "id": "prod-san-cera-slim-cistern-tank-80mm",
    "slug": "cera-slim-80mm-concealed-cistern-tank-galvanized-steel-frame-dual-flush",
    "name": "Cera — Slim 80mm Concealed Cistern Tank with Galvanized Steel Frame",
    "title": "Cera — Slim 80mm Concealed Cistern Tank with Galvanized Steel Frame",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Concealed Cisterns & Dual-Flush Plates",
    "sanitarySubcategory": "CONCEALED_CISTERN_FLUSH_PLATE",
    "mountingType": "CONCEALED_IN_WALL",
    "trapOrWasteSpec": "Fits 180mm WC Mounting Centers",
    "flushCapacityLiters": "Dual Flush 3L / 6L",
    "flowRateLpm": null,
    "finishColor": "Galvanized Silver Frame / White Tank",
    "materialGrade": "Galvanized Steel & High Density Polyethylene",
    "inclusionsBadge": "Includes Frame, Slim Tank, Stop Valve & Drainage Elbow",
    "oemModelCode": "F8015101",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 4290,
    "exGstPrice": 3636,
    "mrp": 5950,
    "discountPercent": 28,
    "gstPercent": 18,
    "hsnCode": "3922",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Ultra Slim 80mm Depth · Fits 4-Inch Thin Brick Walls · 400kg Rated",
    "specChips": [
      "Slim 80mm Depth",
      "Fits 4-Inch Walls",
      "18% GST / HSN 3922",
      "E-Loader Safe"
    ],
    "description": "Cera Ultra-Slim 80mm concealed flushing cistern with structural galvanized steel mounting frame. Designed specifically for Indian apartment walls where recess depth is limited to 4-inch single brick walls.",
    "highlights": [
      "Super-slim 80mm body depth installs inside standard 4-inch bathroom brick wall chases",
      "Sturdy corrosion-resistant galvanized iron frame tested to 400 kg hanging weight",
      "Dual flush water-saving valve delivers rapid, powerful bowl cleansing",
      "Condensation-proof foam lining protects masonry walls from internal moisture damage",
      "Top or front access for maintenance without breaking tiles"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "OEM Model Code",
        "value": "F8015101"
      },
      {
        "label": "Mounting Type",
        "value": "Slim In-Wall Frame"
      },
      {
        "label": "Frame Depth",
        "value": "80 mm Ultra Slim"
      },
      {
        "label": "Flush Capacity",
        "value": "Dual Flush 3L / 6L"
      },
      {
        "label": "HSN Code",
        "value": "3922"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader"
      }
    ],
    "variants": [
      {
        "id": "var-san-cera-slim-cistern",
        "label": "80mm Slim Frame Set",
        "unit": "Set",
        "price": 4290,
        "mrp": 5950,
        "discountPercent": 28,
        "stock": 20,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 112,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Ceramic Depot",
    "crossSellSkus": [
      "prod-san-cera-qtype-flush-plate-chr",
      "prod-san-cera-calisto-rimless-wall-hung"
    ]
  },
  {
    "id": "prod-san-jaquar-kubix-flush-plate-chr",
    "slug": "jaquar-kubix-prime-mechanical-dual-flush-actuator-push-plate-gloss-chrome",
    "name": "Jaquar — Kubix Prime Mechanical Dual-Flush Actuator Push Plate (Gloss Chrome)",
    "title": "Jaquar — Kubix Prime Mechanical Dual-Flush Actuator Push Plate (Gloss Chrome)",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Concealed Cisterns & Dual-Flush Plates",
    "sanitarySubcategory": "CONCEALED_CISTERN_FLUSH_PLATE",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "Fits Jaquar Mechanical Concealed Cisterns",
    "flushCapacityLiters": "Dual Flush (Half / Full)",
    "flowRateLpm": null,
    "finishColor": "Mirror Chrome Gloss",
    "materialGrade": "Virgin ABS Electroplated",
    "inclusionsBadge": "Includes Actuator Rods & Wall Mounting Frame",
    "oemModelCode": "JCP-CHR-01",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 1450,
    "exGstPrice": 1229,
    "mrp": 1950,
    "discountPercent": 26,
    "gstPercent": 18,
    "hsnCode": "3922",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Kubix Geometric Lines · Mirror Chrome Finish · Smooth Mechanical Touch",
    "specChips": [
      "Mirror Chrome",
      "Dual Flush Buttons",
      "18% GST / HSN 3922",
      "60-Min Bike"
    ],
    "description": "Jaquar Kubix Prime architectural dual-flush actuator control plate. Finished in mirror-reflective electrolytic chrome that matches Kubix bathroom faucets. Features crisp rectangular buttons for intuitive eco (3L) and full (6L) flush control.",
    "highlights": [
      "Precision geometric rectangular dual-flush buttons with tactile click response",
      "Triple-layer nickel-chrome electroplating resists bathroom humidity and moisture",
      "Tool-free snap-fit assembly onto Jaquar concealed cistern frames",
      "Functions as an inspection access cover for internal flush valve servicing",
      "Smooth wipe-clean surface repels fingerprints and soap film"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "JCP-CHR-01"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Surface Snap-Fit"
      },
      {
        "label": "Finish",
        "value": "Mirror Chrome Gloss"
      },
      {
        "label": "Flush Operation",
        "value": "Mechanical Push Rod"
      },
      {
        "label": "HSN Code",
        "value": "3922"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-kubix-plate-chr",
        "label": "Gloss Chrome Finish",
        "unit": "Piece",
        "price": 1450,
        "mrp": 1950,
        "discountPercent": 26,
        "stock": 35,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 78,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-cistern-frame-tank",
      "prod-san-jaquar-kubix-prime-rimless-wc"
    ]
  },
  {
    "id": "prod-san-jaquar-alive-flush-plate-blk",
    "slug": "jaquar-alive-pneumatic-dual-flush-actuator-plate-matte-black",
    "name": "Jaquar — Alive Pneumatic Dual-Flush Actuator Plate (Matte Black)",
    "title": "Jaquar — Alive Pneumatic Dual-Flush Actuator Plate (Matte Black)",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Concealed Cisterns & Dual-Flush Plates",
    "sanitarySubcategory": "CONCEALED_CISTERN_FLUSH_PLATE",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "Fits Jaquar Pneumatic Concealed Cisterns",
    "flushCapacityLiters": "Dual Flush (Pneumatic)",
    "flowRateLpm": null,
    "finishColor": "Matte Black",
    "materialGrade": "Soft-Touch Matte ABS",
    "inclusionsBadge": "Includes Pneumatic Air Hose Lines & Fastening Screws",
    "oemModelCode": "JCP-BLM-02",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 2290,
    "exGstPrice": 1941,
    "mrp": 2990,
    "discountPercent": 23,
    "gstPercent": 18,
    "hsnCode": "3922",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Architectural Matte Black · Feather-Light Pneumatic Push · Fingerprint Free",
    "specChips": [
      "Matte Black",
      "Pneumatic Touch",
      "18% GST / HSN 3922",
      "60-Min Bike"
    ],
    "description": "Jaquar Alive luxury pneumatic actuator plate in contemporary matte black. Driven by pneumatic air pulses rather than stiff mechanical rods, providing effortless feather-touch flushing with zero mechanical wear.",
    "highlights": [
      "Effortless pneumatic push action requires 60% less finger pressure than mechanical rods",
      "Velvety matte black finish matches matte black basin faucets and shower mixers",
      "Anti-fingerprint Oleophobic coating keeps plate pristine without daily polishing",
      "Flexible pneumatic air tubes allow placing plate anywhere within 1.5m of cistern",
      "Tested to over 2,00,000 pneumatic activations with zero pressure leakage"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "JCP-BLM-02"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Surface Pneumatic"
      },
      {
        "label": "Finish",
        "value": "Matte Black"
      },
      {
        "label": "Flush Operation",
        "value": "Pneumatic Air Hose"
      },
      {
        "label": "HSN Code",
        "value": "3922"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-alive-plate-blk",
        "label": "Matte Black Finish",
        "unit": "Piece",
        "price": 2290,
        "mrp": 2990,
        "discountPercent": 23,
        "stock": 20,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 62,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Luxury Bath Studio",
    "crossSellSkus": [
      "prod-san-jaquar-cistern-frame-tank",
      "prod-san-kohler-veil-wall-hung-wc"
    ]
  },
  {
    "id": "prod-san-cera-qtype-flush-plate-chr",
    "slug": "cera-q-type-dual-flush-actuator-push-plate-mirror-chrome",
    "name": "Cera — Q-Type Dual-Flush Actuator Push Plate (Mirror Chrome)",
    "title": "Cera — Q-Type Dual-Flush Actuator Push Plate (Mirror Chrome)",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Concealed Cisterns & Dual-Flush Plates",
    "sanitarySubcategory": "CONCEALED_CISTERN_FLUSH_PLATE",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "Fits Cera Slim & Standard Concealed Cisterns",
    "flushCapacityLiters": "Dual Flush 3L / 6L",
    "flowRateLpm": null,
    "finishColor": "Mirror Chrome",
    "materialGrade": "ABS Polymer Chrome Plated",
    "inclusionsBadge": "Includes Actuator Push Rods & Sub-Frame",
    "oemModelCode": "F8020101",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 1150,
    "exGstPrice": 975,
    "mrp": 1650,
    "discountPercent": 30,
    "gstPercent": 18,
    "hsnCode": "3922",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Q-Type Circular Buttons · Mirror Chrome Plating · Fits Cera Tanks",
    "specChips": [
      "Mirror Chrome",
      "Dual Flush 3/6L",
      "18% GST / HSN 3922",
      "60-Min Bike"
    ],
    "description": "Cera Q-Type dual-flush control plate with classic circular dual actuator buttons. Designed for seamless pairing with Cera 80mm slim and standard in-wall cistern tanks.",
    "highlights": [
      "Intuitive dual concentric circular buttons for easy distinction of small and large flush",
      "Electrolytic chrome plating tested against bathroom steam and acidic cleaning vapors",
      "Simple clip-on locking mechanism allows fast tool-less installation",
      "Low profile thickness projects only 12mm off finished bathroom tiles",
      "Economical replacement plate for builder-grade and renovated bathrooms"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "OEM Model Code",
        "value": "F8020101"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Surface Clip-On"
      },
      {
        "label": "Finish",
        "value": "Mirror Chrome"
      },
      {
        "label": "Flush Operation",
        "value": "Mechanical Push Rod"
      },
      {
        "label": "HSN Code",
        "value": "3922"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-cera-qtype-plate",
        "label": "Mirror Chrome Finish",
        "unit": "Piece",
        "price": 1150,
        "mrp": 1650,
        "discountPercent": 30,
        "stock": 30,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.7,
    "reviewsCount": 71,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Ceramic Depot",
    "crossSellSkus": [
      "prod-san-cera-slim-cistern-tank-80mm",
      "prod-san-parryware-cruz-wall-mounted-wc"
    ]
  },
  {
    "id": "prod-san-cera-careo-thin-rim-basin",
    "slug": "cera-careo-sleek-rim-500mm-ceramic-tabletop-counter-wash-basin-white",
    "name": "Cera — Careo Sleek Rim 500mm Ceramic Table Top Counter Wash Basin (White)",
    "title": "Cera — Careo Sleek Rim 500mm Ceramic Table Top Counter Wash Basin (White)",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Countertop & Vanity Ceramic Basins",
    "sanitarySubcategory": "COUNTERTOP_CERAMIC_BASIN",
    "mountingType": "TABLETOP_COUNTER",
    "trapOrWasteSpec": "Fits Standard 32mm Waste Coupling",
    "flushCapacityLiters": null,
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Requires Deck-Mounted Tall Faucet or Wall-Mounted Spout",
    "oemModelCode": "S2040112",
    "sellingUnit": "Basin",
    "unit": "Basin",
    "price": 3250,
    "exGstPrice": 2754,
    "mrp": 4350,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Ultra-Thin Rim · 500×400mm Countertop · Anti-Bacterial Nano Glaze",
    "specChips": [
      "500×400mm Vessel",
      "Thin Rim Profile",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Cera Careo luxury countertop vessel wash basin. Features an ultra-thin 5mm rim profile crafted from high-density vitreous china fired at 1200°C. Nano-glazed bowl repels dirt and hard water stains for effortless maintenance.",
    "highlights": [
      "Ultra-thin contemporary rim profile brings European elegance to granite & quartz countertops",
      "Deep 140mm bowl prevents water splashing onto bathroom vanity cabinets",
      "Nano-glazed vitreous china surface maintains high gloss shine with zero yellowing",
      "Universal 32mm (1.25\") central drain hole accommodates pop-up and slotted waste couplings",
      "Seamless flat bottom sits perfectly steady on marble, granite, or wooden counter slabs"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "OEM Model Code",
        "value": "S2040112"
      },
      {
        "label": "Mounting Type",
        "value": "Countertop / Table Top Vessel"
      },
      {
        "label": "Dimensions",
        "value": "500 mm (L) × 400 mm (W) × 140 mm (H)"
      },
      {
        "label": "Material",
        "value": "Vitreous China Grade A"
      },
      {
        "label": "Finish",
        "value": "White Gloss Ceramic"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader (Padded)"
      }
    ],
    "variants": [
      {
        "id": "var-san-cera-careo-basin",
        "label": "500mm Glossy Pure White",
        "unit": "Basin",
        "price": 3250,
        "mrp": 4350,
        "discountPercent": 25,
        "stock": 25,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Ceramic Depot",
    "crossSellSkus": [
      "prod-san-cera-bottle-trap-32mm",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-jaquar-continental-thin-rim-basin",
    "slug": "jaquar-continental-thin-rim-oval-550mm-table-top-ceramic-basin-white",
    "name": "Jaquar — Continental Thin-Rim Oval 550mm Table Top Ceramic Basin (White)",
    "title": "Jaquar — Continental Thin-Rim Oval 550mm Table Top Ceramic Basin (White)",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Countertop & Vanity Ceramic Basins",
    "sanitarySubcategory": "COUNTERTOP_CERAMIC_BASIN",
    "mountingType": "TABLETOP_COUNTER",
    "trapOrWasteSpec": "Fits 32mm Pop-Up Waste Coupling",
    "flushCapacityLiters": null,
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Requires Tall Pillar Tap or Concealed Basin Spout",
    "oemModelCode": "JBS-WHT-01",
    "sellingUnit": "Basin",
    "unit": "Basin",
    "price": 4150,
    "exGstPrice": 3517,
    "mrp": 5500,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Organic Oval Form · 550×400mm Countertop · Anti-Splash Deep Bowl",
    "specChips": [
      "550×400mm Oval",
      "Thin Rim Vitreous",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Jaquar Continental thin-rim oval vessel basin. Smooth aerodynamic curvature provides generous hand washing space with modern aesthetic appeal. Fired using premium European glaze that resists micro-scratches.",
    "highlights": [
      "Soft oval profile softens linear bathroom architecture and vanity counter lines",
      "Generous 550mm length provides ample room for washing without water overflow",
      "High-density vitreous china absorbs less than 0.5% water, preventing damp odor",
      "Pairs gorgeously with Jaquar Kubix, Alive, and Florentine tall basin mixer taps",
      "Backed by Jaquar's 10-year manufacturer ceramic warranty"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "JBS-WHT-01"
      },
      {
        "label": "Mounting Type",
        "value": "Countertop Vessel"
      },
      {
        "label": "Dimensions",
        "value": "550 mm (L) × 400 mm (W) × 130 mm (H)"
      },
      {
        "label": "Material",
        "value": "Vitreous China"
      },
      {
        "label": "Finish",
        "value": "White Gloss"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-continental-basin",
        "label": "550mm Oval Table Top Basin",
        "unit": "Basin",
        "price": 4150,
        "mrp": 5500,
        "discountPercent": 25,
        "stock": 18,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 94,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-cera-bottle-trap-32mm",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-parryware-jordon-basin",
    "slug": "parryware-jordon-480mm-rectangular-tabletop-basin-with-faucet-hole-white",
    "name": "Parryware — Jordon 480mm Rectangular Table Top Basin with Faucet Hole (White)",
    "title": "Parryware — Jordon 480mm Rectangular Table Top Basin with Faucet Hole (White)",
    "brand": "Parryware",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Countertop & Vanity Ceramic Basins",
    "sanitarySubcategory": "COUNTERTOP_CERAMIC_BASIN",
    "mountingType": "TABLETOP_COUNTER",
    "trapOrWasteSpec": "Fits 32mm Waste Coupling",
    "flushCapacityLiters": null,
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Pre-Punched Single Central Faucet Hole (Fits Standard Pillar Cock)",
    "oemModelCode": "C0485",
    "sellingUnit": "Basin",
    "unit": "Basin",
    "price": 2890,
    "exGstPrice": 2449,
    "mrp": 4100,
    "discountPercent": 30,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Pre-Punched Tap Hole · 480×370mm · No Need for Tall Body Tap",
    "specChips": [
      "480×370mm Rectangular",
      "With Tap Hole",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Parryware Jordon rectangular countertop vessel basin with pre-drilled central tap hole. Eliminates the requirement for extra-tall faucets or wall drilling — mounts standard regular-height pillar cocks directly onto the ceramic deck.",
    "highlights": [
      "Integrated deck tap hole allows using regular height basin taps, saving faucet costs",
      "Crisp geometric rectangular profile fits cleanly against bathroom mirror backsplashes",
      "Smooth rounded interior corners prevent dirt trap buildup and clean with one sponge wipe",
      "Precision-milled flat bottom installs with clear silicone adhesive in 15 minutes",
      "Stain-resistant vitreous china fired to resist chips and surface hairline cracks"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Parryware"
      },
      {
        "label": "OEM Model Code",
        "value": "C0485"
      },
      {
        "label": "Mounting Type",
        "value": "Countertop with Deck Tap Hole"
      },
      {
        "label": "Dimensions",
        "value": "480 mm (L) × 370 mm (W) × 135 mm (H)"
      },
      {
        "label": "Material",
        "value": "Vitreous China"
      },
      {
        "label": "Finish",
        "value": "White Gloss"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader"
      }
    ],
    "variants": [
      {
        "id": "var-san-parry-jordon",
        "label": "480mm Rectangular with Tap Hole",
        "unit": "Basin",
        "price": 2890,
        "mrp": 4100,
        "discountPercent": 30,
        "stock": 22,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 82,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Sanitary Gallery",
    "crossSellSkus": [
      "prod-san-cera-bottle-trap-32mm",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-hindware-venice-round-basin",
    "slug": "hindware-venice-round-410mm-countertop-ceramic-vessel-basin-white",
    "name": "Hindware — Venice Round 410mm Countertop Ceramic Vessel Basin (White)",
    "title": "Hindware — Venice Round 410mm Countertop Ceramic Vessel Basin (White)",
    "brand": "Hindware",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Countertop & Vanity Ceramic Basins",
    "sanitarySubcategory": "COUNTERTOP_CERAMIC_BASIN",
    "mountingType": "TABLETOP_COUNTER",
    "trapOrWasteSpec": "Fits 32mm Waste Coupling",
    "flushCapacityLiters": null,
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Requires Tall Deck-Mounted Faucet or Wall Spout",
    "oemModelCode": "10045",
    "sellingUnit": "Basin",
    "unit": "Basin",
    "price": 3450,
    "exGstPrice": 2924,
    "mrp": 4900,
    "discountPercent": 30,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Circular Vessel · 410mm Diameter · Space-Saving Vanity Fit",
    "specChips": [
      "410mm Round",
      "Italian Collection",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Hindware Italian Collection Venice circular vessel wash basin. Symmetrical round basin designed for compact luxury bathroom vanities and guest powder rooms. Pure vitreous china body with high-gloss mirror glaze.",
    "highlights": [
      "Perfect 410mm circular form factor fits tight 18-inch vanity counters with ease",
      "High wall depth prevents water splashing even under high pressure faucet streams",
      "High-temperature glazed ceramic body prevents water seepage and yellow discoloration",
      "Sits proud on dark granite or white quartz tops for a hotel-inspired centerpiece",
      "Standard drain opening fits all Lucknow standard 32mm chrome bottle traps"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hindware Italian Collection"
      },
      {
        "label": "OEM Model Code",
        "value": "10045"
      },
      {
        "label": "Mounting Type",
        "value": "Round Countertop Vessel"
      },
      {
        "label": "Dimensions",
        "value": "410 mm Diameter × 145 mm Height"
      },
      {
        "label": "Material",
        "value": "Vitreous China"
      },
      {
        "label": "Finish",
        "value": "White Gloss"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader"
      }
    ],
    "variants": [
      {
        "id": "var-san-hind-venice",
        "label": "410mm Round Vessel Basin",
        "unit": "Basin",
        "price": 3450,
        "mrp": 4900,
        "discountPercent": 30,
        "stock": 14,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 75,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-cera-bottle-trap-32mm",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-kohler-forefront-basin",
    "slug": "kohler-forefront-580mm-rectangular-vessel-basin-with-faucet-hole-white",
    "name": "Kohler — Forefront 580mm Rectangular Vessel Basin with Faucet Hole (White)",
    "title": "Kohler — Forefront 580mm Rectangular Vessel Basin with Faucet Hole (White)",
    "brand": "Kohler",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Countertop & Vanity Ceramic Basins",
    "sanitarySubcategory": "COUNTERTOP_CERAMIC_BASIN",
    "mountingType": "TABLETOP_COUNTER",
    "trapOrWasteSpec": "Fits 32mm Pop-Up Drain",
    "flushCapacityLiters": null,
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A+",
    "inclusionsBadge": "Includes Single Pre-Drilled Faucet Hole & Overflow Cap",
    "oemModelCode": "K-2660X-1",
    "sellingUnit": "Basin",
    "unit": "Basin",
    "price": 11990,
    "exGstPrice": 10161,
    "mrp": 14990,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Designer Rectangular · Wide 580mm Deck · Integrated Overflow & Tap Hole",
    "specChips": [
      "580×460mm Luxury",
      "With Faucet Hole",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Kohler Forefront luxury architectural rectangular countertop wash basin. Wide 580mm width provides generous wash area and deck space for soap dispensers. Built with integrated overflow to prevent accidental water damage.",
    "highlights": [
      "Commanding 580mm width creates a high-end luxury focal point in master ensuites",
      "Pre-drilled single faucet hole accommodates Kohler and international monobloc mixers",
      "Integrated ceramic overflow with polished chrome trim cap prevents basin spills",
      "Fired with Kohler durable glaze that resists stains, thermal shocks, and scratches",
      "Precision leveled base ensures completely wobble-free mounting on stone vanities"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Kohler USA"
      },
      {
        "label": "OEM Model Code",
        "value": "K-2660X-1"
      },
      {
        "label": "Mounting Type",
        "value": "Countertop Vessel with Tap Hole"
      },
      {
        "label": "Dimensions",
        "value": "580 mm (L) × 460 mm (W) × 170 mm (H)"
      },
      {
        "label": "Material",
        "value": "Vitreous China Grade A+"
      },
      {
        "label": "Finish",
        "value": "White Gloss"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader"
      }
    ],
    "variants": [
      {
        "id": "var-san-kohler-forefront",
        "label": "580mm Luxury Forefront Basin",
        "unit": "Basin",
        "price": 11990,
        "mrp": 14990,
        "discountPercent": 20,
        "stock": 9,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 46,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Luxury Bath Studio",
    "crossSellSkus": [
      "prod-san-cera-bottle-trap-32mm",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-cera-victor-corner-basin",
    "slug": "cera-victor-wall-hung-compact-corner-ceramic-basin-400x300mm-white",
    "name": "Cera — Victor Wall-Hung Compact Corner Ceramic Wash Basin 400×300mm (White)",
    "title": "Cera — Victor Wall-Hung Compact Corner Ceramic Wash Basin 400×300mm (White)",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Countertop & Vanity Ceramic Basins",
    "sanitarySubcategory": "COUNTERTOP_CERAMIC_BASIN",
    "mountingType": "WALL_HUNG",
    "trapOrWasteSpec": "Fits 32mm Bottle Trap or PVC Waste Pipe",
    "flushCapacityLiters": null,
    "flowRateLpm": null,
    "finishColor": "White Gloss Ceramic",
    "materialGrade": "Vitreous China Grade A",
    "inclusionsBadge": "Includes Pre-Punched Tap Hole & Wall Hanging Rag Bolts",
    "oemModelCode": "S2010101",
    "sellingUnit": "Basin",
    "unit": "Basin",
    "price": 1490,
    "exGstPrice": 1263,
    "mrp": 2100,
    "discountPercent": 29,
    "gstPercent": 18,
    "hsnCode": "6910",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Wall-Hung Corner · 400×300mm · Perfect for Powder Rooms & Small Baths",
    "specChips": [
      "400×300mm Corner",
      "Wall-Hung Basin",
      "18% GST / HSN 6910",
      "E-Loader Safe"
    ],
    "description": "Cera Victor triangular compact corner wall-hung ceramic basin. Specifically designed to optimize corner space in guest powder rooms, office toilets, and compact bathrooms where floor area is tight.",
    "highlights": [
      "Corner wall-hung footprint turns neglected bathroom corner into functional wash area",
      "Includes corner rag bolts and wall-mounting brackets for rigid in-wall fixation",
      "Right-side tap hole accommodates standard cold water bib cocks or pillar taps",
      "Smooth curved interior basin prevents water stagnation and lime scale stains",
      "Durable vitreous china construction tested to withstand everyday residential use"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "OEM Model Code",
        "value": "S2010101"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Hung Corner Mount"
      },
      {
        "label": "Dimensions",
        "value": "400 mm (L) × 300 mm (W) × 150 mm (H)"
      },
      {
        "label": "Material",
        "value": "Vitreous China"
      },
      {
        "label": "Finish",
        "value": "White Gloss"
      },
      {
        "label": "HSN Code",
        "value": "6910"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "E-Loader"
      }
    ],
    "variants": [
      {
        "id": "var-san-cera-corner",
        "label": "400×300mm Corner Basin",
        "unit": "Basin",
        "price": 1490,
        "mrp": 2100,
        "discountPercent": 29,
        "stock": 30,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.7,
    "reviewsCount": 104,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Ceramic Depot",
    "crossSellSkus": [
      "prod-san-cera-bottle-trap-32mm",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-jaquar-highflow-diverter-body",
    "slug": "jaquar-high-flow-single-lever-concealed-diverter-rough-in-brass-body",
    "name": "Jaquar — High-Flow Single Lever Concealed Diverter Rough-In In-Wall Brass Body",
    "title": "Jaquar — High-Flow Single Lever Concealed Diverter Rough-In In-Wall Brass Body",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Shower Diverters, Rain Showers & Spouts",
    "sanitarySubcategory": "DIVERTER_SHOWER_SPOUT",
    "mountingType": "CONCEALED_IN_WALL",
    "trapOrWasteSpec": "1/2\" & 3/4\" High-Flow BSP Inlets",
    "flushCapacityLiters": null,
    "flowRateLpm": "24 LPM @ 3 Bar High Flow",
    "finishColor": "Raw Forged Brass",
    "materialGrade": "Forged Brass CW617N",
    "inclusionsBadge": "Rough-In In-Wall Brass Valve Body Only (Requires Upper Trim Kit)",
    "oemModelCode": "AQC-CHR-079N",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 3150,
    "exGstPrice": 2669,
    "mrp": 4200,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "In-Wall Rough-In · 24 LPM High Flow · Forged Brass CW617N Body",
    "specChips": [
      "In-Wall Rough-In",
      "24 LPM High Flow",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Jaquar master rough-in in-wall concealed single-lever diverter valve body. Cast from virgin forged brass CW617N to withstand hydraulic shock up to 16 bar. Controls water delivery between overhead shower and tub spout.",
    "highlights": [
      "Heavy forged brass valve body installs permanently inside wall masonry before tiling",
      "High-flow 24 LPM water volume rapidly fills soaking tubs and powers oversized rain showers",
      "Includes protective plastic tile guide cover to prevent cement mortar from fouling cartridge",
      "Compatible with all Jaquar Kubix, Alive, Opal, and Florentine exposed trim kits",
      "Tested to over 5,00,000 hot and cold mixing cycles without internal seal leakage"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "AQC-CHR-079N"
      },
      {
        "label": "Mounting Type",
        "value": "Concealed In-Wall Rough-In"
      },
      {
        "label": "Flow Rate",
        "value": "24 LPM @ 3 Bar"
      },
      {
        "label": "Body Material",
        "value": "Heavy Forged Brass CW617N"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-diverter-body",
        "label": "Concealed High Flow Brass Body",
        "unit": "Piece",
        "price": 3150,
        "mrp": 4200,
        "discountPercent": 25,
        "stock": 30,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 156,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-kubix-diverter-trim-kit",
      "prod-san-jaquar-alive-diverter-trim-kit",
      "prod-san-jaquar-rain-shower-8in",
      "prod-san-jaquar-kubix-bath-spout"
    ]
  },
  {
    "id": "prod-san-jaquar-kubix-diverter-trim-kit",
    "slug": "jaquar-kubix-prime-concealed-diverter-exposed-upper-trim-kit-joystick-chrome",
    "name": "Jaquar — Kubix Prime Concealed Diverter Exposed Upper Trim Kit with Joystick (Chrome)",
    "title": "Jaquar — Kubix Prime Concealed Diverter Exposed Upper Trim Kit with Joystick (Chrome)",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Shower Diverters, Rain Showers & Spouts",
    "sanitarySubcategory": "DIVERTER_SHOWER_SPOUT",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "Fits Jaquar High-Flow Concealed Diverter Body",
    "flushCapacityLiters": null,
    "flowRateLpm": "Matches In-Wall Body (Up to 24 LPM)",
    "finishColor": "Mirror Chrome",
    "materialGrade": "Solid Forged Brass Trim Plate & Metal Joystick",
    "inclusionsBadge": "Exposed Trim Plate & Operating Knob (Requires Concealed Brass Body)",
    "oemModelCode": "KLP-CHR-35079",
    "sellingUnit": "Kit",
    "unit": "Kit",
    "price": 2209,
    "exGstPrice": 1872,
    "mrp": 2945,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Kubix Prime Styling · Solid Brass Chrome Flange · Smooth Single Lever Joystick",
    "specChips": [
      "Exposed Trim Kit",
      "Kubix Square Styling",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Jaquar Kubix Prime architectural exposed upper trim kit for high-flow concealed single lever shower diverters. Features crisp geometric cube lines, mirror electrolytic chrome, and a smooth ceramic disc joystick handle.",
    "highlights": [
      "Crisp square wall plate with laser-engraved shower and spout flow indicator icons",
      "Heavy cast brass lever handle balances hot and cold water temperature with micro accuracy",
      "Seamless push-pull automatic diverter knob smoothly redirects water between shower and tub spout",
      "Triple-layer chrome plating exceeds 200-hour ASTM neutral salt spray corrosion testing",
      "Mounts over standard Jaquar 079N high-flow in-wall concealed diverter bodies"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "KLP-CHR-35079"
      },
      {
        "label": "Mounting Type",
        "value": "Exposed Wall Plate"
      },
      {
        "label": "Design Collection",
        "value": "Kubix Prime"
      },
      {
        "label": "Finish",
        "value": "Mirror Chrome"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-kubix-trim",
        "label": "Kubix Prime Trim Kit Chrome",
        "unit": "Kit",
        "price": 2209,
        "mrp": 2945,
        "discountPercent": 25,
        "stock": 28,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 130,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-highflow-diverter-body",
      "prod-san-jaquar-rain-shower-8in",
      "prod-san-jaquar-kubix-bath-spout"
    ]
  },
  {
    "id": "prod-san-jaquar-alive-diverter-trim-kit",
    "slug": "jaquar-alive-high-flow-concealed-diverter-upper-trim-kit-chrome",
    "name": "Jaquar — Alive High-Flow Concealed Diverter Upper Trim Kit (Chrome)",
    "title": "Jaquar — Alive High-Flow Concealed Diverter Upper Trim Kit (Chrome)",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Shower Diverters, Rain Showers & Spouts",
    "sanitarySubcategory": "DIVERTER_SHOWER_SPOUT",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "Fits Jaquar High-Flow Concealed Diverter Body",
    "flushCapacityLiters": null,
    "flowRateLpm": "Matches In-Wall Body (Up to 24 LPM)",
    "finishColor": "Mirror Chrome",
    "materialGrade": "Solid Forged Brass",
    "inclusionsBadge": "Exposed Trim Plate & Operating Knob (Requires Concealed Brass Body)",
    "oemModelCode": "ALV-CHR-34065",
    "sellingUnit": "Kit",
    "unit": "Kit",
    "price": 2490,
    "exGstPrice": 2110,
    "mrp": 3320,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Alive Fluid Curvature · Solid Brass Faceplate · Ergonomic Control",
    "specChips": [
      "Exposed Trim Kit",
      "Alive Fluid Styling",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Jaquar Alive designer upper trim kit for concealed shower diverters. Soft, organic contours and sculptured joystick create a luxurious ergonomic tactile feel.",
    "highlights": [
      "Organic sculptured curvature harmonizes beautifully with rounded modern bathroom ceramics",
      "High-precision ceramic cartridge sleeve ensures feather-touch water blending",
      "Heavy brass wall plate with watertight rubber O-ring seal prevents moisture infiltration behind tiles",
      "Clear laser-etched hot/cold temperature indicators and shower/spout diverter symbols",
      "Fits all standard Jaquar high-flow concealed diverter bodies"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "ALV-CHR-34065"
      },
      {
        "label": "Mounting Type",
        "value": "Exposed Trim Kit"
      },
      {
        "label": "Design Collection",
        "value": "Alive Series"
      },
      {
        "label": "Finish",
        "value": "Mirror Chrome"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-alive-trim",
        "label": "Alive Trim Kit Chrome",
        "unit": "Kit",
        "price": 2490,
        "mrp": 3320,
        "discountPercent": 25,
        "stock": 20,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 88,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-highflow-diverter-body",
      "prod-san-jaquar-rain-shower-8in",
      "prod-san-jaquar-kubix-bath-spout"
    ]
  },
  {
    "id": "prod-san-jaquar-maze-hand-shower-120mm",
    "slug": "jaquar-maze-120mm-square-multi-flow-abs-hand-shower-rubit-nozzles",
    "name": "Jaquar — Maze 120mm Square Multi-Flow ABS Hand Shower with Silicone Rubit Nozzles",
    "title": "Jaquar — Maze 120mm Square Multi-Flow ABS Hand Shower with Silicone Rubit Nozzles",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Shower Diverters, Rain Showers & Spouts",
    "sanitarySubcategory": "DIVERTER_SHOWER_SPOUT",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "Standard 1/2\" BSP Thread",
    "flushCapacityLiters": null,
    "flowRateLpm": "Rain, Cascade Waterfall & Jet Spray",
    "finishColor": "Mirror Chrome",
    "materialGrade": "High-Impact Engineered ABS Polymer",
    "inclusionsBadge": "Rubit Silicone Lime-Scale Self-Cleaning Nozzles",
    "oemModelCode": "MSH-CHR-120",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 1822,
    "exGstPrice": 1544,
    "mrp": 2375,
    "discountPercent": 23,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "3 Spray Patterns · Rubit Silicone De-scaling · 120mm Square Face",
    "specChips": [
      "120mm Square",
      "3 Flow Patterns",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Jaquar Maze 120mm multi-flow hand shower. Features selectable spray patterns including concentrated massage jet, gentle rain drench, and soothing cascade waterfall. Rubit flexible silicone nozzles clean lime scale with a gentle thumb rub.",
    "highlights": [
      "Three distinct flow patterns: Drenching Rain, Cascade Waterfall, and Pulsating Massage",
      "Rubit silicone nozzles instantly clear calcium deposits from hard ground water",
      "Ultra-light engineered ABS polymer prevents heavy damage if accidentally dropped on tiles",
      "Universal 1/2-inch BSP male thread connects seamlessly to all flexible shower hoses",
      "Thick electrolytic chrome plating retains mirror-like shine without peeling"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "MSH-CHR-120"
      },
      {
        "label": "Mounting Type",
        "value": "Handheld Shower"
      },
      {
        "label": "Head Size",
        "value": "120 mm Square"
      },
      {
        "label": "Material",
        "value": "Engineered ABS with Nickel-Chrome"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-maze-hand",
        "label": "120mm Square Hand Shower",
        "unit": "Piece",
        "price": 1822,
        "mrp": 2375,
        "discountPercent": 23,
        "stock": 35,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-highflow-diverter-body",
      "prod-san-jaquar-kubix-diverter-trim-kit"
    ]
  },
  {
    "id": "prod-san-jaquar-rain-shower-8in",
    "slug": "jaquar-ss-304-overhead-rain-shower-8inch-square-with-15inch-brass-arm",
    "name": "Jaquar — SS 304 Overhead Rain Shower 8\" (200mm Square) with 15\" Heavy Brass Shower Arm",
    "title": "Jaquar — SS 304 Overhead Rain Shower 8\" (200mm Square) with 15\" Heavy Brass Shower Arm",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Shower Diverters, Rain Showers & Spouts",
    "sanitarySubcategory": "DIVERTER_SHOWER_SPOUT",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "1/2\" BSP Female Swivel Ball Joint",
    "flushCapacityLiters": null,
    "flowRateLpm": "18 LPM @ 2.5 Bar",
    "finishColor": "Mirror Chrome Gloss",
    "materialGrade": "SS 304 Head & Forged Brass Arm",
    "inclusionsBadge": "Includes 8\" Rain Shower Head + 15\" (375mm) Heavy Brass Wall Arm & Flange",
    "oemModelCode": "OHS-CHR-1755",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 2850,
    "exGstPrice": 2415,
    "mrp": 3800,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "200mm SS 304 Head · 15\" Heavy Brass Arm · Rubit Descaling Nozzles",
    "specChips": [
      "200mm Square",
      "15\" Brass Arm",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Jaquar 8-inch (200mm) square overhead rain shower combo set. Made with ultra-slim mirror-polished SS 304 stainless steel and a heavy 15-inch (375mm) solid forged brass shower arm with wall flange.",
    "highlights": [
      "Ultra-slim 2mm laser-welded SS 304 shower head with high hydraulic pressure retention",
      "Includes 15-inch heavy-gauge forged brass wall arm that extends shower drench away from wall",
      "Flexible silicone Rubit nozzles prevent mineral clogging and spray deflection",
      "360° swivel brass ball joint allows angling shower spray to exact user preference",
      "Universal 1/2\" BSP connection connects directly to concealed diverter outlets"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "OHS-CHR-1755"
      },
      {
        "label": "Mounting Type",
        "value": "Overhead Wall Mounted"
      },
      {
        "label": "Head Dimensions",
        "value": "200 mm × 200 mm (8 × 8 Inch)"
      },
      {
        "label": "Arm Length",
        "value": "375 mm (15 Inch) Solid Brass"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-rain-shower-8",
        "label": "8\" Square Shower with 15\" Arm",
        "unit": "Set",
        "price": 2850,
        "mrp": 3800,
        "discountPercent": 25,
        "stock": 30,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 168,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-highflow-diverter-body",
      "prod-san-jaquar-kubix-diverter-trim-kit"
    ]
  },
  {
    "id": "prod-san-jaquar-kubix-bath-spout",
    "slug": "jaquar-kubix-prime-heavy-cast-brass-bathtub-spout-wall-flange-chrome",
    "name": "Jaquar — Kubix Prime Heavy Cast Brass Bathtub Spout with Wall Flange (Chrome)",
    "title": "Jaquar — Kubix Prime Heavy Cast Brass Bathtub Spout with Wall Flange (Chrome)",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Shower Diverters, Rain Showers & Spouts",
    "sanitarySubcategory": "DIVERTER_SHOWER_SPOUT",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "1/2\" BSP Male Thread Wall Mount",
    "flushCapacityLiters": null,
    "flowRateLpm": "Aerated Smooth Stream",
    "finishColor": "Mirror Chrome",
    "materialGrade": "Solid Forged Brass Casting",
    "inclusionsBadge": "Includes Neoperl Honeycomb Aerator & Square Wall Flange",
    "oemModelCode": "KUP-CHR-35429",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 1890,
    "exGstPrice": 1602,
    "mrp": 2520,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Kubix Geometric Form · Solid Brass Casting · Neoperl Aerator",
    "specChips": [
      "Solid Brass Spout",
      "Neoperl Aerator",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Jaquar Kubix Prime architectural bathtub and bucket spout. Cast from heavy virgin brass with crisp rectangular profiles and a Swiss Neoperl aerator for splash-free water flow.",
    "highlights": [
      "Architectural rectangular profile matches Kubix single-lever shower diverters",
      "Heavy virgin brass body resists denting and water pressure hammer",
      "Integrated Neoperl honeycomb aerator produces soft, splash-free champagne water stream",
      "Generous 175mm projection clears bucket rims and bathtub ledges easily",
      "Precision-machined 1/2-inch BSP threads screw directly into concealed wall elbows"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "KUP-CHR-35429"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Mounted Spout"
      },
      {
        "label": "Reach",
        "value": "175 mm Projection"
      },
      {
        "label": "Material",
        "value": "Solid Forged Brass"
      },
      {
        "label": "Finish",
        "value": "Mirror Chrome"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-kubix-spout",
        "label": "Kubix Bath Spout Chrome",
        "unit": "Piece",
        "price": 1890,
        "mrp": 2520,
        "discountPercent": 25,
        "stock": 25,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 92,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-highflow-diverter-body",
      "prod-san-jaquar-kubix-diverter-trim-kit"
    ]
  },
  {
    "id": "prod-san-jaquar-health-faucet-abs",
    "slug": "jaquar-health-faucet-abs-body-with-1-2m-ss-flexible-hose-wall-hook-chrome",
    "name": "Jaquar — Health Faucet ABS Body with 1.2m SS Flexible Hose & Wall Hook (Chrome)",
    "title": "Jaquar — Health Faucet ABS Body with 1.2m SS Flexible Hose & Wall Hook (Chrome)",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Health Faucets, Angle Valves & Bath Brassware",
    "sanitarySubcategory": "FAUCET_VALVE_ACCESSORY",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "1/2\" BSP Standard Thread",
    "flushCapacityLiters": null,
    "flowRateLpm": "Smooth Controlled Jet",
    "finishColor": "Mirror Chrome",
    "materialGrade": "ABS Gun Body & SS 304 Flexible Hose",
    "inclusionsBadge": "Includes 1.2m Interlocked SS Hose, Wall Hook & Fixing Screws",
    "oemModelCode": "ALD-CHR-565",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 1120,
    "exGstPrice": 949,
    "mrp": 1450,
    "discountPercent": 23,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "High-Pressure Jet · 1.2m SS Flexible Hose · Ergonomic Thumb Trigger",
    "specChips": [
      "ABS Chrome Body",
      "1.2m SS Hose",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Jaquar's best-selling health faucet spray set. Made with high-impact engineered ABS polymer that won't crack under pressure. Comes with a double-interlocked SS 304 flexible hose that resists kinking and burst pressure up to 10 bar.",
    "highlights": [
      "Ergonomic thumb trigger mechanism regulates spray intensity from gentle mist to targeted jet",
      "1.2-meter double-interlocked SS 304 flexible tube prevents twisting and kinks",
      "Internal EPDM non-toxic inner hose rated for high temperatures and water pressure",
      "Includes chrome wall hook with rawlplugs and stainless steel mounting screws",
      "Chrome plated ABS spray head remains cool to touch and resists lime scale deposits"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "ALD-CHR-565"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Hook Mount"
      },
      {
        "label": "Hose Length",
        "value": "1.2 Meter SS 304 Flexible"
      },
      {
        "label": "Material",
        "value": "Engineered ABS Body + SS Hose"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-faucet-set",
        "label": "Complete Set with 1.2m Hose",
        "unit": "Set",
        "price": 1120,
        "mrp": 1450,
        "discountPercent": 23,
        "stock": 50,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 310,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-cera-garnet-2way-bibcock",
      "prod-san-jaquar-florentine-angle-cock"
    ]
  },
  {
    "id": "prod-san-cera-garnet-2way-bibcock",
    "slug": "cera-garnet-2-way-bib-cock-with-wall-flange-chrome",
    "name": "Cera — Garnet 2-Way Bib Cock with Wall Flange for Hand Shower & Jet (Chrome)",
    "title": "Cera — Garnet 2-Way Bib Cock with Wall Flange for Hand Shower & Jet (Chrome)",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Health Faucets, Angle Valves & Bath Brassware",
    "sanitarySubcategory": "FAUCET_VALVE_ACCESSORY",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "1/2\" BSP Thread Inlet with Dual Outlets",
    "flushCapacityLiters": null,
    "flowRateLpm": "Dual Quarter-Turn Outlets",
    "finishColor": "Mirror Chrome",
    "materialGrade": "Forged Brass CW617N",
    "inclusionsBadge": "Includes Matching Round Wall Flange & Aerator Nozzle",
    "oemModelCode": "F2002153",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 1260,
    "exGstPrice": 1068,
    "mrp": 1680,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "2-Way Dual Control · Solid Forged Brass · Independent Ceramic Discs",
    "specChips": [
      "2-Way Dual Outlet",
      "Solid Brass Body",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Cera Garnet two-way bib cock tap with dual independent operating knobs. Perfect for toilet commode areas where one outlet feeds a hand health faucet while the other serves general bucket water filling.",
    "highlights": [
      "Dual quarter-turn knobs control downward spout and side health spray independently",
      "Solid forged brass body with high nickel-chrome plating prevents peeling in moist bathrooms",
      "Durable ceramic disc cartridges tested to 5,00,000 operations with zero drip",
      "Includes a snug-fitting circular chrome wall flange to conceal plumbing tile gaps",
      "Universal 1/2\" BSP thread mounts directly into concealed wall elbows"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "OEM Model Code",
        "value": "F2002153"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Mounted Bib Cock"
      },
      {
        "label": "Outlets",
        "value": "2 Independent Controlled Outlets"
      },
      {
        "label": "Material",
        "value": "Forged Brass CW617N"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-cera-2way",
        "label": "2-Way Bib Cock with Flange",
        "unit": "Piece",
        "price": 1260,
        "mrp": 1680,
        "discountPercent": 25,
        "stock": 35,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 124,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Ceramic Depot",
    "crossSellSkus": [
      "prod-san-jaquar-health-faucet-abs",
      "prod-san-cera-victor-one-piece-s-trap"
    ]
  },
  {
    "id": "prod-san-jaquar-florentine-angle-cock",
    "slug": "jaquar-florentine-prime-triangular-angular-stop-cock-with-wall-flange",
    "name": "Jaquar — Florentine Prime Triangular Angular Stop Cock with Wall Flange",
    "title": "Jaquar — Florentine Prime Triangular Angular Stop Cock with Wall Flange",
    "brand": "Jaquar",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Health Faucets, Angle Valves & Bath Brassware",
    "sanitarySubcategory": "FAUCET_VALVE_ACCESSORY",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "1/2\" BSP Male × 1/2\" BSP Male",
    "flushCapacityLiters": null,
    "flowRateLpm": "Smooth Quarter Turn",
    "finishColor": "Mirror Chrome",
    "materialGrade": "Solid Forged Brass",
    "inclusionsBadge": "Includes Triangular Metal Knob & Circular Wall Flange",
    "oemModelCode": "FLR-CHR-5053",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 850,
    "exGstPrice": 720,
    "mrp": 1135,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Triangular Knob · High-Purity Brass · Quarter-Turn Ceramic Cartridge",
    "specChips": [
      "Triangular Knob",
      "Solid Brass Body",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Jaquar Florentine Prime angular stop cock valve. Essential plumbing shutoff valve for wash basin geysers, health faucets, and toilet flush tanks. Features a quarter-turn ceramic spindle that never seizes under hard water.",
    "highlights": [
      "Iconic Florentine triangular ergonomic knob provides sure grip even with wet soapy hands",
      "High-grade forged brass casting with mirror-finish chrome plating",
      "Quarter-turn ceramic disc cartridge shuts off water completely in emergency repairs",
      "Protects bathroom from flooding by isolating individual fixtures without shutting whole house",
      "Fits all standard 1/2-inch CPVC and brass water inlet plumbing points"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Jaquar India"
      },
      {
        "label": "OEM Model Code",
        "value": "FLR-CHR-5053"
      },
      {
        "label": "Mounting Type",
        "value": "Wall Mounted Angle Valve"
      },
      {
        "label": "Thread Size",
        "value": "1/2\" BSP Male In & Out"
      },
      {
        "label": "Material",
        "value": "Forged Brass"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-jaq-angle-cock",
        "label": "Angle Cock with Flange",
        "unit": "Piece",
        "price": 850,
        "mrp": 1135,
        "discountPercent": 25,
        "stock": 60,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 220,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-health-faucet-abs",
      "prod-san-cera-careo-thin-rim-basin"
    ]
  },
  {
    "id": "prod-san-cera-bottle-trap-32mm",
    "slug": "cera-heavy-brass-32mm-chrome-wash-basin-bottle-trap-250mm-pipe",
    "name": "Cera — Heavy Brass 32mm Chrome Wash Basin Bottle Trap with 250mm Pipe",
    "title": "Cera — Heavy Brass 32mm Chrome Wash Basin Bottle Trap with 250mm Pipe",
    "brand": "Cera",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Health Faucets, Angle Valves & Bath Brassware",
    "sanitarySubcategory": "FAUCET_VALVE_ACCESSORY",
    "mountingType": "WALL_SURFACE",
    "trapOrWasteSpec": "32mm (1.25\") Standard Waste Connection",
    "flushCapacityLiters": null,
    "flowRateLpm": "Anti-Odor Water Barrier",
    "finishColor": "Mirror Chrome",
    "materialGrade": "Heavy Extruded Brass & Chrome Plating",
    "inclusionsBadge": "Includes 250mm Waste Outlet Pipe, Flange & Sealing Washers",
    "oemModelCode": "F8040101",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 2016,
    "exGstPrice": 1708,
    "mrp": 2690,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8481",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "32mm Heavy Brass · Anti-Odor Water Barrier · 250mm Outlet Pipe",
    "specChips": [
      "32mm Brass Trap",
      "250mm Tail Pipe",
      "18% GST / HSN 8481",
      "60-Min Bike"
    ],
    "description": "Cera heavy brass chrome-plated cylindrical wash basin bottle trap. Traps a permanent column of water to block sewer odors, cockroaches, and gases from rising through vanity wash basins into bathrooms.",
    "highlights": [
      "Deep water seal chamber prevents foul sewer odors and pests from entering bathroom",
      "Removable bottom cup unscrews easily by hand to retrieve dropped rings and clear hair debris",
      "Includes 250mm long brass horizontal discharge pipe with decorative wall flange",
      "Standard 32mm (1-1/4\") threaded connection fits all tabletop and counter basins",
      "Heavy brass body finished in multi-layer mirror chrome that will not corrode"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cera Sanitaryware"
      },
      {
        "label": "OEM Model Code",
        "value": "F8040101"
      },
      {
        "label": "Mounting Type",
        "value": "Under-Basin Waste Pipe Mount"
      },
      {
        "label": "Size",
        "value": "32mm (1.25\") Standard Thread"
      },
      {
        "label": "Material",
        "value": "Solid Brass"
      },
      {
        "label": "HSN Code",
        "value": "8481"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-cera-bottle-trap",
        "label": "32mm Brass Trap Set",
        "unit": "Piece",
        "price": 2016,
        "mrp": 2690,
        "discountPercent": 25,
        "stock": 30,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 88,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Ceramic Depot",
    "crossSellSkus": [
      "prod-san-cera-careo-thin-rim-basin",
      "prod-san-jaquar-continental-thin-rim-basin"
    ]
  },
  {
    "id": "prod-san-futura-linear-drain-600mm",
    "slug": "futura-ss-304-linear-floor-drain-with-tile-insert-grating-100x600mm",
    "name": "Futura — SS 304 Linear Floor Drain with Tile-Insert Grating (100×600mm)",
    "title": "Futura — SS 304 Linear Floor Drain with Tile-Insert Grating (100×600mm)",
    "brand": "Futura",
    "categorySlug": "sanitary-bath-fittings",
    "categoryName": "Sanitary & Bath Fittings",
    "subCategory": "Health Faucets, Angle Valves & Bath Brassware",
    "sanitarySubcategory": "FAUCET_VALVE_ACCESSORY",
    "mountingType": "FLOOR_MOUNT_S_TRAP",
    "trapOrWasteSpec": "50mm / 75mm SWR Drain Outlet",
    "flushCapacityLiters": null,
    "flowRateLpm": "High-Volume Shower Drainage",
    "finishColor": "Matte Brushed SS 304",
    "materialGrade": "AISI 304 Stainless Steel",
    "inclusionsBadge": "Includes Tile-Insert Reversible Tray, Hair Strainer & Lifting Key",
    "oemModelCode": "FLR-600",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 2450,
    "exGstPrice": 2076,
    "mrp": 3500,
    "discountPercent": 30,
    "gstPercent": 18,
    "hsnCode": "7324",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Tile-Insert Invisible Look · 600mm SS 304 Channel · Removable Hair Trap",
    "specChips": [
      "100×600mm SS 304",
      "Tile-Insert Grate",
      "18% GST / HSN 7324",
      "60-Min Bike"
    ],
    "description": "Futura heavy-duty SS 304 linear shower trench drain channel with reversible tile-insert top tray. Allows embedding actual bathroom floor tile directly into the drain cover for a seamless invisible drainage look.",
    "highlights": [
      "Reversible 2-in-1 top tray allows invisible tile-insert or elegant brushed stainless finish",
      "High-grade AISI 304 stainless steel resists corrosion from acid cleaners and hard water",
      "Removable stainless hair strainer captures debris before it clogs underground drainage pipes",
      "V-profile sloped internal channel ensures water drains out completely with zero standing puddles",
      "Standard 50mm central bottom outlet connects to Lucknow residential SWR drain lines"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Futura Bathware"
      },
      {
        "label": "OEM Model Code",
        "value": "FLR-600"
      },
      {
        "label": "Mounting Type",
        "value": "Floor Recessed Linear Trench"
      },
      {
        "label": "Dimensions",
        "value": "100 mm Width × 600 mm Length × 50 mm Outlet"
      },
      {
        "label": "Material",
        "value": "AISI 304 Stainless Steel"
      },
      {
        "label": "HSN Code",
        "value": "7324"
      },
      {
        "label": "Dispatch Vehicle",
        "value": "2-Wheeler"
      }
    ],
    "variants": [
      {
        "id": "var-san-futura-drain",
        "label": "100×600mm Tile Insert Drain",
        "unit": "Piece",
        "price": 2450,
        "mrp": 3500,
        "discountPercent": 30,
        "stock": 25,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 65,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Luxury Sanitary Hub",
    "crossSellSkus": [
      "prod-san-jaquar-rain-shower-8in",
      "prod-san-jaquar-highflow-diverter-body"
    ]
  }
];
