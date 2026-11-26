// Master Dataset for Modular Kitchen Systems & Fittings (All 26 Verified Lucknow SKUs)
export interface ModularKitchenProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subCategory: string;
  modularSubcategory: "TANDEM_BOX" | "PULLOUT_CORNER_PANTRY" | "BASKET_ORGANIZER" | "SHUTTER_LIFT_GOLA";
  carcassFitBadge: string;
  inclusionsBadge: string | null;
  carcassWidthMm: number | null;
  depthMm: number | null;
  heightMm: number | null;
  loadCapacityKg: number | null;
  finishColor: string;
  oemModelCode: string | null;
  sellingUnit: string;
  unit: string;
  price: number;
  exGstPrice: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  hsnCode: string;
  deliveryVehicleType: "2-Wheeler" | "E-Loader" | "E-Loader / Pickup";
  brandTier: 1 | 2;
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

export const ALL_26_MODULAR_KITCHEN_PRODUCTS: ModularKitchenProduct[] = [
  {
    "id": "prod-mod-ebco-slim-s3-500-122",
    "slug": "ebco-slim-s3-pro-motion-tandem-box-500mm-122mm-black",
    "name": "Ebco Slim S3 Pro-Motion Tandem Box 500mm / 122mm (6 in, 50kg Black)",
    "title": "Ebco — Slim S3 Pro-Motion Tandem Box 500mm / 122mm (50kg Black)",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Tandem Box Drawer Systems",
    "modularSubcategory": "TANDEM_BOX",
    "carcassFitBadge": "Fits 500mm Depth Drawer",
    "inclusionsBadge": "Hardware Kit Only — Wood Base & Front Fascia Made On-Site",
    "carcassWidthMm": 600,
    "depthMm": 500,
    "heightMm": 122,
    "loadCapacityKg": 50,
    "finishColor": "Black",
    "oemModelCode": "SLIMS3-122-500",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 2700,
    "exGstPrice": 2288,
    "mrp": 3450,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Slim 13mm straight double-walled metal drawer system with synchronized soft close",
    "specChips": [
      "500mm Depth",
      "122mm Height",
      "50kg Capacity",
      "Synchronized Soft Close"
    ],
    "description": "Ebco Slim S3 Pro-Motion tandem drawer system features ultra-thin 13mm straight inner side walls to maximize usable internal drawer width. Synchronized rack-and-pinion runner with integrated hydraulic damper guarantees feather-light motion.",
    "highlights": [
      "Ultra-slim 13mm double-walled sides increase internal drawer volume by 18%",
      "Synchronized rack-and-pinion undermount runner rated for 50kg dynamic load",
      "Integrated Pro-Motion hydraulic soft closing action absorbs sudden impacts",
      "Includes 2 side panels, 2 undermount runners, rear brackets and front fascia connectors"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Nominal Length",
        "value": "500 mm"
      },
      {
        "label": "Side Height",
        "value": "122 mm (approx 5 in)"
      },
      {
        "label": "Load Capacity",
        "value": "50 kg"
      },
      {
        "label": "Finish",
        "value": "Matte Black"
      },
      {
        "label": "Runner Mechanism",
        "value": "Synchronized Undermount Soft Close"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-slims3-500",
        "label": "500mm / 122mm - Black",
        "unit": "Set",
        "price": 2700,
        "mrp": 3450,
        "discountPercent": 22,
        "stock": 45,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 132,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-hettich-orgatray-560-cutlery",
      "prod-mod-hettich-gola-profile-3000mm-black"
    ]
  },
  {
    "id": "prod-mod-hettich-innotech-cutlery-70mm",
    "slug": "hettich-innotech-tandem-box-cutlery-height-m-70mm-500mm",
    "name": "Hettich InnoTech Tandem Box Cutlery Height-M 70mm (500mm, 30kg Quadro)",
    "title": "Hettich — InnoTech Tandem Box Cutlery Height-M 70mm (500mm, 30kg)",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Tandem Box Drawer Systems",
    "modularSubcategory": "TANDEM_BOX",
    "carcassFitBadge": "Fits 500mm Depth Drawer",
    "inclusionsBadge": "Hardware Kit Only — Wood Base & Front Fascia Made On-Site",
    "carcassWidthMm": 600,
    "depthMm": 500,
    "heightMm": 70,
    "loadCapacityKg": 30,
    "finishColor": "Silver Grey",
    "oemModelCode": "INNOTECH-M-70",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 2850,
    "exGstPrice": 2415,
    "mrp": 3600,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Low profile 70mm height double-walled drawer kit with precision Quadro undermount runners",
    "specChips": [
      "70mm Height (M)",
      "500mm Length",
      "Quadro Silent System",
      "30kg Dynamic"
    ],
    "description": "Hettich InnoTech Height-M (70mm) is Lucknow's industry standard for upper cutlery and spoon drawers in modular kitchens. Features German Quadro steel ball runners with Silent System hydraulic cushioning.",
    "highlights": [
      "Low 70mm side profile tailored specifically for cutlery insert trays",
      "Quadro V6 full extension runner with Silent System soft closure",
      "Toolless front panel tilt and height adjustment for perfectly aligned cabinet reveals",
      "Double-walled steel construction powder coated in durable German Silver Grey"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Series",
        "value": "InnoTech"
      },
      {
        "label": "Drawer Height",
        "value": "Height M (70 mm)"
      },
      {
        "label": "Nominal Length",
        "value": "500 mm"
      },
      {
        "label": "Load Rating",
        "value": "30 kg Quadro"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-hettich-innotech-70",
        "label": "500mm / 70mm (Cutlery)",
        "unit": "Set",
        "price": 2850,
        "mrp": 3600,
        "discountPercent": 21,
        "stock": 50,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 168,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-orgatray-560-cutlery",
      "prod-mod-hettich-gola-profile-3000mm-black"
    ]
  },
  {
    "id": "prod-mod-hettich-innotech-cup-144mm",
    "slug": "hettich-innotech-tandem-box-cup-saucer-height-d-144mm-500mm",
    "name": "Hettich InnoTech Tandem Box Cup & Saucer Height-D 144mm (500mm, 30kg)",
    "title": "Hettich — InnoTech Tandem Box Cup & Saucer Height-D 144mm (500mm, 30kg)",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Tandem Box Drawer Systems",
    "modularSubcategory": "TANDEM_BOX",
    "carcassFitBadge": "Fits 500mm Depth Drawer",
    "inclusionsBadge": "Hardware Kit Only — Wood Base & Front Fascia Made On-Site",
    "carcassWidthMm": 600,
    "depthMm": 500,
    "heightMm": 144,
    "loadCapacityKg": 30,
    "finishColor": "Silver Grey",
    "oemModelCode": "INNOTECH-D-144",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 3099,
    "exGstPrice": 2626,
    "mrp": 3950,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Mid-height 144mm tandem drawer with longitudinal gallery rails for cups and bowls",
    "specChips": [
      "144mm Height (D)",
      "500mm Depth",
      "Includes Gallery Rails",
      "30kg Load"
    ],
    "description": "Hettich InnoTech Height-D (144mm) comes complete with round longitudinal railing bars to prevent cups, glassware, and small spice containers from tumbling during rapid drawer extension.",
    "highlights": [
      "144mm total side height with coordinated steel gallery rails",
      "Precision German Quadro ball bearing runners with Silent System soft closing",
      "Smooth glide under full 30kg tableware load",
      "Front fascia rapid click-fit assembly"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Series",
        "value": "InnoTech"
      },
      {
        "label": "Height",
        "value": "Height D (144 mm)"
      },
      {
        "label": "Depth",
        "value": "500 mm"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-hettich-innotech-144",
        "label": "500mm / 144mm (Cup & Saucer)",
        "unit": "Set",
        "price": 3099,
        "mrp": 3950,
        "discountPercent": 22,
        "stock": 40,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 110,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-gola-profile-3000mm-black",
      "prod-mod-hettich-orgatray-560-cutlery"
    ]
  },
  {
    "id": "prod-mod-hettich-atira-pot-pan-176mm",
    "slug": "hettich-innotech-atira-pot-pan-tandem-box-176mm-500mm-50kg-9249744",
    "name": "Hettich InnoTech Atira Pot & Pan Tandem Box 176mm (500mm, 50kg, 9249744)",
    "title": "Hettich — InnoTech Atira Pot & Pan Tandem Box 176mm (50kg, 9249744)",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Tandem Box Drawer Systems",
    "modularSubcategory": "TANDEM_BOX",
    "carcassFitBadge": "Fits 500mm Depth Drawer",
    "inclusionsBadge": "Hardware Kit Only — Wood Base & Front Fascia Made On-Site",
    "carcassWidthMm": 900,
    "depthMm": 500,
    "heightMm": 176,
    "loadCapacityKg": 50,
    "finishColor": "Silver Grey",
    "oemModelCode": "9249744",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 3544,
    "exGstPrice": 3003,
    "mrp": 4490,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Heavy 50kg Quadro V6 rated deep pot and pan tandem drawer with square designer railings",
    "specChips": [
      "176mm Height",
      "50kg Dynamic Load",
      "Square Gallery Rails",
      "Model 9249744"
    ],
    "description": "Hettich InnoTech Atira 176mm Pot & Pan drawer system (OEM Model 9249744) features distinctive crisp rectangular side contours and square railing bars. Heavy-duty Quadro V6 runners easily handle 50kg of pressure cookers and cast-iron cookware.",
    "highlights": [
      "Heavy-duty Quadro V6 runner certified for 50kg dynamic loads",
      "Square top gallery rail provides a contemporary architectural silhouette",
      "Integrated Silent System damper prevents heavy pots from rattling on closing",
      "Genuine German Hettich Model 9249744 packaging"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "OEM Part Number",
        "value": "9249744"
      },
      {
        "label": "Side Height",
        "value": "176 mm"
      },
      {
        "label": "Nominal Length",
        "value": "500 mm"
      },
      {
        "label": "Load Capacity",
        "value": "50 kg"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-hettich-atira-176",
        "label": "500mm / 176mm (50kg)",
        "unit": "Set",
        "price": 3544,
        "mrp": 4490,
        "discountPercent": 21,
        "stock": 35,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 142,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-gola-profile-3000mm-black",
      "prod-mod-hettich-orgatray-560-cutlery"
    ]
  },
  {
    "id": "prod-mod-hettich-atira-6in-anthracite",
    "slug": "hettich-innotech-atira-tandem-box-6in-anthracite-soft-close",
    "name": "Hettich InnoTech Atira Tandem Box 6 in Height Anthracite (Soft Close)",
    "title": "Hettich — InnoTech Atira Tandem Box 6 in Anthracite (Soft Close)",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Tandem Box Drawer Systems",
    "modularSubcategory": "TANDEM_BOX",
    "carcassFitBadge": "Fits 500mm Depth Drawer",
    "inclusionsBadge": "Hardware Kit Only — Wood Base & Front Fascia Made On-Site",
    "carcassWidthMm": 600,
    "depthMm": 500,
    "heightMm": 150,
    "loadCapacityKg": 30,
    "finishColor": "Anthracite Grey",
    "oemModelCode": "ATIRA-6IN-ANTHRA",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 4034,
    "exGstPrice": 3419,
    "mrp": 5100,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Designer dark anthracite double-walled drawer for contemporary modular kitchens",
    "specChips": [
      "6\" Height (150mm)",
      "Anthracite Matt",
      "Quadro Silent System",
      "German Engineered"
    ],
    "description": "Hettich InnoTech Atira in luxury Anthracite finish brings dark interior refinement to modern Lucknow modular kitchens. Features crisp angular lines and seamless Silent System motion damping.",
    "highlights": [
      "Deep anthracite powder coating resists grease spots and kitchen stains",
      "Linear, square aesthetic favored by luxury interior architects",
      "Quadro full extension runners ensure smooth effortless drawer travel",
      "Includes double-walled side panels, Quadro runners, and rear connectors"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Series",
        "value": "InnoTech Atira"
      },
      {
        "label": "Finish",
        "value": "Anthracite Grey"
      },
      {
        "label": "Nominal Length",
        "value": "500 mm"
      },
      {
        "label": "Height",
        "value": "6 in (150 mm)"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-atira-6in-anthra",
        "label": "500mm / 6\" - Anthracite",
        "unit": "Set",
        "price": 4034,
        "mrp": 5100,
        "discountPercent": 21,
        "stock": 30,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 84,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-gola-profile-3000mm-black",
      "prod-mod-ebco-waste-bin-40l"
    ]
  },
  {
    "id": "prod-mod-hettich-atira-thali-pantry-200mm",
    "slug": "hettich-innotech-atira-heavy-thali-pantry-tandem-box-200mm-500mm",
    "name": "Hettich InnoTech Atira Heavy Thali/Pantry Tandem Box 200mm (500mm, 50kg)",
    "title": "Hettich — InnoTech Atira Heavy Thali/Pantry Tandem Box 200mm (50kg)",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Tandem Box Drawer Systems",
    "modularSubcategory": "TANDEM_BOX",
    "carcassFitBadge": "Fits 500mm Depth Drawer",
    "inclusionsBadge": "Hardware Kit Only — Wood Base & Front Fascia Made On-Site",
    "carcassWidthMm": 900,
    "depthMm": 500,
    "heightMm": 200,
    "loadCapacityKg": 50,
    "finishColor": "Silver Grey",
    "oemModelCode": "ATIRA-200-50KG",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 4250,
    "exGstPrice": 3602,
    "mrp": 5400,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Deep 200mm extra-high tandem drawer for heavy Indian stainless steel thalis and grocery sacks",
    "specChips": [
      "200mm Extra Deep",
      "50kg Heavy Dynamic",
      "Quadro V6 Runner",
      "Thali Specialist"
    ],
    "description": "Engineered specifically for heavy Indian kitchen essentials, this 200mm tall Hettich Atira tandem box holds tall thalis, atta storage containers, and pantry grocery jars without tipping over.",
    "highlights": [
      "Extra-tall 200mm side configuration prevents tall kitchen utensils from falling over",
      "50kg dynamic load rated Quadro V6 undermount runner",
      "Silent System fluid deceleration protects delicate porcelain dinnerware",
      "Toolless 3D front adjustment enables razor-sharp modular gap alignment"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Series",
        "value": "InnoTech Atira"
      },
      {
        "label": "Side Height",
        "value": "200 mm"
      },
      {
        "label": "Depth",
        "value": "500 mm"
      },
      {
        "label": "Payload Capacity",
        "value": "50 kg"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-atira-200mm",
        "label": "500mm / 200mm (Thali)",
        "unit": "Set",
        "price": 4250,
        "mrp": 5400,
        "discountPercent": 21,
        "stock": 25,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 96,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-gola-profile-3000mm-black",
      "prod-mod-ebco-waste-bin-40l"
    ]
  },
  {
    "id": "prod-mod-hafele-matrixbox-slim-ss-500-88",
    "slug": "hafele-matrixbox-slim-ss-tandem-drawer-500mm-88mm-40kg",
    "name": "Hafele Matrixbox Slim SS Tandem Drawer 500mm / 88mm (40kg Soft Close)",
    "title": "Hafele — Matrixbox Slim SS Tandem Drawer 500mm / 88mm (40kg)",
    "brand": "Hafele",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Tandem Box Drawer Systems",
    "modularSubcategory": "TANDEM_BOX",
    "carcassFitBadge": "Fits 500mm Depth Drawer",
    "inclusionsBadge": "Hardware Kit Only — Wood Base & Front Fascia Made On-Site",
    "carcassWidthMm": 600,
    "depthMm": 500,
    "heightMm": 88,
    "loadCapacityKg": 40,
    "finishColor": "Brushed Stainless Steel",
    "oemModelCode": "MATRIX-SLIM-SS-88",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 10808,
    "exGstPrice": 9159,
    "mrp": 13500,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "German luxury 13mm slimline tandem drawer finished in authentic brushed stainless steel",
    "specChips": [
      "88mm Slim Height",
      "Solid Stainless Steel",
      "40kg Soft Close",
      "Hafele German Luxury"
    ],
    "description": "Hafele Matrixbox Slim is the pinnacle of architectural kitchen hardware. Crafted with authentic grade 304 brushed stainless steel side walls, delivering unmatched durability, hygiene, and timeless elegance.",
    "highlights": [
      "Pure brushed stainless steel side panels guarantee zero rust or paint degradation",
      "Ultra-slim 13mm straight profile maximizes usable storage interior",
      "Synchronized full-extension undermount slides rated for 40kg dynamic weight",
      "Toolless 3D front panel calibration with whisper-quiet hydraulic damping"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hafele"
      },
      {
        "label": "Series",
        "value": "Matrixbox Slim"
      },
      {
        "label": "Material",
        "value": "Grade 304 Brushed Stainless Steel"
      },
      {
        "label": "Nominal Length",
        "value": "500 mm"
      },
      {
        "label": "Height",
        "value": "88 mm"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-hafele-matrix-ss",
        "label": "500mm / 88mm - SS 304",
        "unit": "Set",
        "price": 10808,
        "mrp": 13500,
        "discountPercent": 20,
        "stock": 15,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 42,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-gola-profile-3000mm-black",
      "prod-mod-hettich-orgatray-560-cutlery"
    ]
  },
  {
    "id": "prod-mod-ebco-frameless-side-pullout-150mm",
    "slug": "ebco-frameless-side-pull-out-2-tier-ss-304-150mm",
    "name": "Ebco Frameless Side Pull-Out 2-Tier SS 304 (150mm, HSN 7323)",
    "title": "Ebco — Frameless Side Pull-Out 2-Tier SS 304 150mm",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Bottle Pull-Outs, Corner Units & Tall Pantry",
    "modularSubcategory": "PULLOUT_CORNER_PANTRY",
    "carcassFitBadge": "Fits 150mm Carcass",
    "inclusionsBadge": null,
    "carcassWidthMm": 150,
    "depthMm": 450,
    "heightMm": 480,
    "loadCapacityKg": 15,
    "finishColor": "SS 304 Chrome",
    "oemModelCode": "FPO-150",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 1767,
    "exGstPrice": 1497,
    "mrp": 2350,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "7323",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Economical 2-tier side mounted bottle & spice basket in genuine 304 grade stainless steel",
    "specChips": [
      "150mm Carcass",
      "SS 304 Grade",
      "2-Tier Wire Baskets",
      "60-Min 2-Wheeler"
    ],
    "description": "Ebco Frameless 150mm pullout provides affordable compact spice and oil bottle storage for narrow kitchen base cabinets. Genuine AISI 304 stainless steel wire frame with universal left/right side mount.",
    "highlights": [
      "Pure SS 304 stainless steel resists turmeric stains and cooking vinegar corrosion",
      "Universal mounting brackets fit either left or right inner carcass side gables",
      "Supplied with ball bearing side runners for smooth manual pullout",
      "Express 60-min delivery on 2-wheeler fleet across Lucknow"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Fits Carcass",
        "value": "150 mm external width"
      },
      {
        "label": "Material",
        "value": "AISI 304 Stainless Steel"
      },
      {
        "label": "Tier Count",
        "value": "2 Tiers"
      },
      {
        "label": "HSN Code",
        "value": "7323"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-fpo-150",
        "label": "150mm - SS 304",
        "unit": "Unit",
        "price": 1767,
        "mrp": 2350,
        "discountPercent": 25,
        "stock": 45,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.7,
    "reviewsCount": 154,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-hettich-cargoplus-ss304-thali",
      "prod-mod-ebco-pro-lift-100n-gas-spring"
    ]
  },
  {
    "id": "prod-mod-ebco-bpo2sc2-150mm",
    "slug": "ebco-bottle-pullout-soft-close-2-tier-150mm-bpo2sc2-150",
    "name": "Ebco Bottle Pullout Soft Close 2-Tier 150mm (Fits 200mm Cab, BPO2SC2-150, HSN 7323)",
    "title": "Ebco — Bottle Pullout Soft Close 2-Tier 150mm (BPO2SC2-150)",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Bottle Pull-Outs, Corner Units & Tall Pantry",
    "modularSubcategory": "PULLOUT_CORNER_PANTRY",
    "carcassFitBadge": "Fits 200mm Cabinet",
    "inclusionsBadge": null,
    "carcassWidthMm": 200,
    "depthMm": 500,
    "heightMm": 520,
    "loadCapacityKg": 25,
    "finishColor": "Chrome Plated SS",
    "oemModelCode": "BPO2SC2-150",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 6176,
    "exGstPrice": 5234,
    "mrp": 7800,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "7323",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Bottom undermount soft-close bottle pull-out for 200mm modular kitchen base cabinets",
    "specChips": [
      "Fits 200mm Cabinet",
      "Model BPO2SC2-150",
      "Bottom Undermount",
      "Soft Close"
    ],
    "description": "Ebco BPO2SC2-150 bottle pullout operates on heavy undermount slides with synchronized soft closure. The 150mm wide wire basket assembly fits standard 200mm modular cabinets with zero door wobble.",
    "highlights": [
      "Rigid bottom undermount runner eliminates sideways door tilt during pullout",
      "Built-in hydraulic damper smoothly decelerates fully loaded oil bottles",
      "Supplied with 3-way adjustable front door fixing brackets",
      "Dispatched via 3-Wheeler E-Loader to protect slide geometry"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Model Number",
        "value": "BPO2SC2-150"
      },
      {
        "label": "Carcass Width",
        "value": "Fits 200 mm cabinet"
      },
      {
        "label": "Basket Width",
        "value": "150 mm"
      },
      {
        "label": "Capacity",
        "value": "25 kg"
      },
      {
        "label": "HSN Code",
        "value": "7323"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-bpo-150",
        "label": "Fits 200mm Cabinet",
        "unit": "Unit",
        "price": 6176,
        "mrp": 7800,
        "discountPercent": 21,
        "stock": 25,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 88,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-ebco-waste-bin-40l",
      "prod-mod-hettich-cargoplus-ss304-thali"
    ]
  },
  {
    "id": "prod-mod-ebco-bpo2sc2-200mm",
    "slug": "ebco-bottle-pullout-soft-close-2-tier-200mm-bpo2sc2-200",
    "name": "Ebco Bottle Pullout Soft Close 2-Tier 200mm (Fits 250mm Cab, BPO2SC2-200, HSN 7323)",
    "title": "Ebco — Bottle Pullout Soft Close 2-Tier 200mm (BPO2SC2-200)",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Bottle Pull-Outs, Corner Units & Tall Pantry",
    "modularSubcategory": "PULLOUT_CORNER_PANTRY",
    "carcassFitBadge": "Fits 250mm Cabinet",
    "inclusionsBadge": null,
    "carcassWidthMm": 250,
    "depthMm": 500,
    "heightMm": 520,
    "loadCapacityKg": 25,
    "finishColor": "Chrome Plated SS",
    "oemModelCode": "BPO2SC2-200",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 6681,
    "exGstPrice": 5662,
    "mrp": 8400,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "7323",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "200mm wide 2-tier bottle & condiment pullout for 250mm external modular cabinets",
    "specChips": [
      "Fits 250mm Cabinet",
      "Model BPO2SC2-200",
      "Soft Close Undermount",
      "25kg Payload"
    ],
    "description": "Ebco BPO2SC2-200 provides generous storage for taller soy sauce bottles, ghee tins, and oil dispensers. Rigid undermount slides prevent liquid spillage during opening and closing.",
    "highlights": [
      "200mm basket width fits standard 250mm modular kitchen base carcasses",
      "Heavy chrome-plated stainless steel wire frame with anti-slip bottom dividers",
      "Smooth silent hydraulic soft-closing runner tested for 50,000 cycles",
      "Dispatched safely via 3-Wheeler E-Loader fleet"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Model Number",
        "value": "BPO2SC2-200"
      },
      {
        "label": "Carcass Width",
        "value": "Fits 250 mm cabinet"
      },
      {
        "label": "Basket Width",
        "value": "200 mm"
      },
      {
        "label": "HSN Code",
        "value": "7323"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-bpo-200",
        "label": "Fits 250mm Cabinet",
        "unit": "Unit",
        "price": 6681,
        "mrp": 8400,
        "discountPercent": 20,
        "stock": 22,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 65,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-ebco-waste-bin-40l",
      "prod-mod-ebco-pro-lift-100n-gas-spring"
    ]
  },
  {
    "id": "prod-mod-ebco-bpo2sc2-250mm",
    "slug": "ebco-bottle-pullout-soft-close-2-tier-250mm-bpo2sc2-250",
    "name": "Ebco Bottle Pullout Soft Close 2-Tier 250mm (Fits 300mm Cab, BPO2SC2-250, HSN 7323)",
    "title": "Ebco — Bottle Pullout Soft Close 2-Tier 250mm (BPO2SC2-250)",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Bottle Pull-Outs, Corner Units & Tall Pantry",
    "modularSubcategory": "PULLOUT_CORNER_PANTRY",
    "carcassFitBadge": "Fits 300mm Cabinet",
    "inclusionsBadge": null,
    "carcassWidthMm": 300,
    "depthMm": 500,
    "heightMm": 520,
    "loadCapacityKg": 30,
    "finishColor": "Chrome Plated SS",
    "oemModelCode": "BPO2SC2-250",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 7223,
    "exGstPrice": 6121,
    "mrp": 9100,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "7323",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Wide-format 250mm 2-tier bottle & sauce pullout for 300mm modular kitchen base units",
    "specChips": [
      "Fits 300mm Cabinet",
      "Model BPO2SC2-250",
      "Heavy 30kg Capacity",
      "Soft Close Undermount"
    ],
    "description": "Ebco BPO2SC2-250 is the largest under-counter bottle organizer in Ebco's lineup. Accommodates bulky 5-liter oil jugs, vinegar bottles, and kitchen cleaners with bottom-mount stability.",
    "highlights": [
      "250mm basket width tailored for 300mm external base cabinet modules",
      "Heavy-duty undermount slides rated for 30kg total payload",
      "Supplied with door fascia brackets and floor template for rapid carpenter installation",
      "Delivered safely on Lucknow site via E-Loader fleet"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Model Number",
        "value": "BPO2SC2-250"
      },
      {
        "label": "Carcass Width",
        "value": "Fits 300 mm cabinet"
      },
      {
        "label": "Basket Width",
        "value": "250 mm"
      },
      {
        "label": "HSN Code",
        "value": "7323"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-bpo-250",
        "label": "Fits 300mm Cabinet",
        "unit": "Unit",
        "price": 7223,
        "mrp": 9100,
        "discountPercent": 21,
        "stock": 18,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 52,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-ebco-waste-bin-40l",
      "prod-mod-ebco-livsmart-wicker-450"
    ]
  },
  {
    "id": "prod-mod-ebco-corner-carousel-polymer",
    "slug": "ebco-corner-carousel-polymer-white-2-shelf-rotating-unit",
    "name": "Ebco Corner Carousel Polymer White 2-Shelf Rotating Unit (HSN 8302)",
    "title": "Ebco — Corner Carousel Polymer White 2-Shelf Rotating Unit",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Bottle Pull-Outs, Corner Units & Tall Pantry",
    "modularSubcategory": "PULLOUT_CORNER_PANTRY",
    "carcassFitBadge": "Fits 900×900mm L-Corner Cabinet",
    "inclusionsBadge": null,
    "carcassWidthMm": 900,
    "depthMm": 900,
    "heightMm": 750,
    "loadCapacityKg": 40,
    "finishColor": "Polymer White",
    "oemModelCode": "CC-90",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 11119,
    "exGstPrice": 9423,
    "mrp": 14000,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "270-degree three-quarter revolving carousel for 900×900mm L-shaped corner kitchen cabinets",
    "specChips": [
      "Fits 900×900mm Corner",
      "270° Revolving",
      "Durable Polymer Trays",
      "Height Adjustable Pole"
    ],
    "description": "Ebco 270° Corner Carousel maximizes dead space in L-shaped modular kitchen corners. Features heavy-duty food-grade white polymer trays that spin independently on an adjustable central steel spindle.",
    "highlights": [
      "Three-quarter 270° design fits standard 900x900mm diagonal corner cabinets",
      "Stain-resistant textured white polymer trays wipe clean in seconds",
      "Telescopic center axle height adjusts from 650mm to 750mm internal cabinet height",
      "Each tray holds up to 20kg of pots, mixing bowls, and pans"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Rotation",
        "value": "270° Revolving"
      },
      {
        "label": "Cabinet Dimensions",
        "value": "900 mm × 900 mm L-Corner"
      },
      {
        "label": "Material",
        "value": "High-Density Polymer + Steel Spindle"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-carousel-90",
        "label": "900×900mm Corner Carousel",
        "unit": "Unit",
        "price": 11119,
        "mrp": 14000,
        "discountPercent": 21,
        "stock": 16,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 71,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-ebco-pro-lift-100n-gas-spring",
      "prod-mod-ebco-waste-bin-40l"
    ]
  },
  {
    "id": "prod-mod-ebco-magic-corner-mcdp90",
    "slug": "ebco-magic-corner-double-pullout-anthracite-fits-850-910mm-mcdp90",
    "name": "Ebco Magic Corner Double Pullout Anthracite Fits 850–910mm (MCDP90, HSN 8302)",
    "title": "Ebco — Magic Corner Double Pullout Anthracite Fits 850–910mm (MCDP90)",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Bottle Pull-Outs, Corner Units & Tall Pantry",
    "modularSubcategory": "PULLOUT_CORNER_PANTRY",
    "carcassFitBadge": "Fits 850–910mm Blind Corner",
    "inclusionsBadge": null,
    "carcassWidthMm": 900,
    "depthMm": 500,
    "heightMm": 560,
    "loadCapacityKg": 35,
    "finishColor": "Anthracite",
    "oemModelCode": "MCDP90",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 23778,
    "exGstPrice": 20151,
    "mrp": 29800,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Synchronized dual-stage magic corner mechanism pulling hidden rear baskets forward into full view",
    "specChips": [
      "Fits 850–910mm Blind Corner",
      "Model MCDP90",
      "Anthracite Baskets",
      "Soft Close Action"
    ],
    "description": "Ebco MCDP90 Magic Corner solves the inaccessible blind corner dilemma. Opening the cabinet door effortlessly glides the front baskets out while drawing the rear concealed baskets directly to the cabinet opening.",
    "highlights": [
      "Engineered for 850mm to 910mm straight blind corner modular kitchen carcasses",
      "Includes 4 heavy anthracite wire baskets with solid anti-slip wooden-look bases",
      "Soft-closing damping mechanism on both forward and return travels",
      "Delivered exclusively via 3-Wheeler E-Loader"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Model Number",
        "value": "MCDP90"
      },
      {
        "label": "Carcass Clearance",
        "value": "850 mm to 910 mm"
      },
      {
        "label": "Door Width Required",
        "value": "Min 450 mm"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-mcdp90",
        "label": "Fits 850–910mm Corner",
        "unit": "Unit",
        "price": 23778,
        "mrp": 29800,
        "discountPercent": 20,
        "stock": 12,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 48,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-hettich-atira-pot-pan-176mm",
      "prod-mod-ebco-roll-top-pro-shutter-600mm"
    ]
  },
  {
    "id": "prod-mod-hettich-magic-corner-iron-grey",
    "slug": "hettich-magic-corner-soft-close-iron-grey-fits-900-1000mm-cabinet",
    "name": "Hettich Magic Corner Soft Close Iron Grey Fits 900–1000mm Cabinet (HSN 8302)",
    "title": "Hettich — Magic Corner Soft Close Iron Grey Fits 900–1000mm Cabinet",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Bottle Pull-Outs, Corner Units & Tall Pantry",
    "modularSubcategory": "PULLOUT_CORNER_PANTRY",
    "carcassFitBadge": "Fits 900–1000mm Corner Cabinet",
    "inclusionsBadge": null,
    "carcassWidthMm": 1000,
    "depthMm": 500,
    "heightMm": 580,
    "loadCapacityKg": 40,
    "finishColor": "Iron Grey",
    "oemModelCode": "MC-IG-900",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 24016,
    "exGstPrice": 20353,
    "mrp": 30500,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "German luxury iron grey blind corner pullout with synchronized Silent System motion",
    "specChips": [
      "Fits 900–1000mm Cabinet",
      "Iron Grey Powder Coat",
      "Silent System Cushion",
      "German Precision"
    ],
    "description": "Hettich Magic Corner in premium Iron Grey transforms deep blind corners into prime organized space. Smoothly pulls both front and rear basket arrays forward in one fluid, synchronized motion.",
    "highlights": [
      "Precision German mechanical levers rated for 40kg total kitchen cookware load",
      "Sophisticated Iron Grey finish coordinates with dark modular cabinet themes",
      "Silent System damping ensures no sudden clang when closing heavy cast-iron pots",
      "Heavy steel sub-frame dispatched safely via E-Loader"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Fits Carcass",
        "value": "900 mm to 1000 mm"
      },
      {
        "label": "Door Opening Required",
        "value": "Min 450 mm"
      },
      {
        "label": "Finish",
        "value": "Iron Grey"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-hettich-mc-900",
        "label": "Fits 900–1000mm Corner",
        "unit": "Unit",
        "price": 24016,
        "mrp": 30500,
        "discountPercent": 21,
        "stock": 14,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 39,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-atira-thali-pantry-200mm",
      "prod-mod-hettich-gola-profile-3000mm-black"
    ]
  },
  {
    "id": "prod-mod-kings-nimbus-tall-pantry-600mm",
    "slug": "kings-nimbus-6-layer-12-basket-glass-tall-pantry-unit-600mm-60kg",
    "name": "KINGS Nimbus 6-Layer 12-Basket Glass Tall Pantry Unit 600mm 60kg Soft Close (HSN 8302)",
    "title": "KINGS Nimbus — 6-Layer 12-Basket Glass Tall Pantry Unit 600mm 60kg",
    "brand": "KINGS Nimbus",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Bottle Pull-Outs, Corner Units & Tall Pantry",
    "modularSubcategory": "PULLOUT_CORNER_PANTRY",
    "carcassFitBadge": "Fits 600mm Tall Cabinet (Min 564mm Internal)",
    "inclusionsBadge": null,
    "carcassWidthMm": 600,
    "depthMm": 500,
    "heightMm": 1950,
    "loadCapacityKg": 60,
    "finishColor": "Toughened Glass / Anthracite",
    "oemModelCode": "KN-TP-600G",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 14990,
    "exGstPrice": 12703,
    "mrp": 19500,
    "discountPercent": 23,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "E-Loader / Pickup",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Grand 6-layer dual-shelf tall pantry mechanism with 12 tempered glass-rim baskets and soft close",
    "specChips": [
      "Fits 600mm Tall Cabinet",
      "12 Glass-Rim Baskets",
      "60kg Total Payload",
      "E-Loader / Pickup"
    ],
    "description": "KINGS Nimbus 600mm Tall Pantry features an interconnected dual-motion frame: 6 internal door baskets swing forward while 6 main deep baskets glide gracefully forward into the kitchen light. Smoked tempered glass inserts.",
    "highlights": [
      "12 total storage baskets (6 on main frame + 6 on door frame) for maximum grocery organization",
      "Smoked tempered glass basket sides provide a luxury European showroom appearance",
      "Synchronized heavy-duty floor and ceiling slides rated for 60kg dynamic weight",
      "Dispatched exclusively via E-Loader / Pickup Truck with protective crating"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "KINGS Nimbus"
      },
      {
        "label": "Fits Carcass",
        "value": "600 mm external (Min 564 mm internal width)"
      },
      {
        "label": "Height Range",
        "value": "1850 mm to 2150 mm adjustable"
      },
      {
        "label": "Baskets",
        "value": "12 Baskets (Tempered Glass Sides)"
      },
      {
        "label": "Weight Rating",
        "value": "60 kg"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-kings-tp-600",
        "label": "600mm (12 Baskets Glass)",
        "unit": "Unit",
        "price": 14990,
        "mrp": 19500,
        "discountPercent": 23,
        "stock": 10,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 61,
    "deliveryEta": "60 Mins",
    "vendor": "Chinhat Hardware Aggregator Hub",
    "crossSellSkus": [
      "prod-mod-ebco-pro-lift-100n-gas-spring",
      "prod-mod-ebco-waste-bin-40l"
    ]
  },
  {
    "id": "prod-mod-hettich-cargoplus-ss304-thali",
    "slug": "hettich-cargoplus-ss-304-modular-kitchen-thali-utility-basket",
    "name": "Hettich CargoPlus SS 304 Modular Kitchen Thali/Utility Basket (HSN 7323)",
    "title": "Hettich — CargoPlus SS 304 Modular Kitchen Thali Basket",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS 304 Baskets, Wicker & Organizers",
    "modularSubcategory": "BASKET_ORGANIZER",
    "carcassFitBadge": "Fits 450mm (18 in) Drawer Carcass",
    "inclusionsBadge": null,
    "carcassWidthMm": 450,
    "depthMm": 500,
    "heightMm": 150,
    "loadCapacityKg": 30,
    "finishColor": "SS 304 Mirror Polish",
    "oemModelCode": "CARGO-THALI-450",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 1445,
    "exGstPrice": 1225,
    "mrp": 1850,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "7323",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Heavy gauge genuine 304 stainless steel wire partition basket for upright Indian thalis",
    "specChips": [
      "Fits 450mm (18\") Carcass",
      "AISI 304 SS Wire",
      "Thali Partitions",
      "60-Min Bike Delivery"
    ],
    "description": "Hettich CargoPlus SS 304 wire thali basket incorporates precision-spaced wire dividers that hold steel dinner thalis and quarter plates vertically upright without tipping. Authentic 304 grade mirror polished stainless steel.",
    "highlights": [
      "Pure AISI 304 grade stainless steel will never pit or rust in humid kitchen climates",
      "Heavy 5mm outer perimeter wire with 2.5mm inner dividers for rigid stability",
      "Compatible with standard 20-inch telescopic drawer channels or soft-close runners",
      "Express 60-min delivery on 2-wheeler fleet"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Series",
        "value": "CargoPlus"
      },
      {
        "label": "Material",
        "value": "AISI 304 Stainless Steel"
      },
      {
        "label": "Carcass Width",
        "value": "450 mm (18 in)"
      },
      {
        "label": "Height",
        "value": "150 mm (6 in)"
      },
      {
        "label": "HSN Code",
        "value": "7323"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-cargoplus-thali",
        "label": "450×500×150mm - SS 304",
        "unit": "Piece",
        "price": 1445,
        "mrp": 1850,
        "discountPercent": 22,
        "stock": 60,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 180,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-quba-symetry-plain-basket-ss304",
      "prod-mod-hettich-orgatray-560-cutlery"
    ]
  },
  {
    "id": "prod-mod-quba-symetry-plain-basket-ss304",
    "slug": "quba-symetry-plain-kitchen-basket-ss-304-15x20x4-in",
    "name": "Quba Symetry Plain Kitchen Basket SS 304 15×20×4 in (HSN 7323)",
    "title": "Quba — Symetry Plain Kitchen Basket SS 304 15×20×4 in",
    "brand": "Quba",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS 304 Baskets, Wicker & Organizers",
    "modularSubcategory": "BASKET_ORGANIZER",
    "carcassFitBadge": "Fits 15×20 in (380×500mm) Carcass",
    "inclusionsBadge": null,
    "carcassWidthMm": 380,
    "depthMm": 500,
    "heightMm": 100,
    "loadCapacityKg": 25,
    "finishColor": "SS 304 Mirror Polish",
    "oemModelCode": "SYM-PL-15204",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 1677,
    "exGstPrice": 1421,
    "mrp": 2150,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "7323",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Flat base stainless steel wire basket for bowls, utensils, and general food prep storage",
    "specChips": [
      "15×20×4 in (380×500×100mm)",
      "SS 304 Grade",
      "Plain Flat Base",
      "Quba Architectural"
    ],
    "description": "Quba Symetry plain basket provides versatile flat storage for bowls, tiffin boxes, and kitchen tools. Manufactured from 304 grade austenitic stainless steel with heavy-duty TIG welded wire joins.",
    "highlights": [
      "Flat open wire mesh allows unhindered storage of assorted cookware sizes",
      "Mirror electro-polished 304 stainless steel resists tarnishing",
      "Standard 15x20x4 inch size fits 380-400mm modular carcass sections",
      "Side screw holes ready for instant drawer slide mounting"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Quba"
      },
      {
        "label": "Dimensions",
        "value": "15 in × 20 in × 4 in (380 × 500 × 100 mm)"
      },
      {
        "label": "Material",
        "value": "AISI 304 Stainless Steel"
      },
      {
        "label": "HSN Code",
        "value": "7323"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-quba-plain-1520",
        "label": "15×20×4 in - SS 304",
        "unit": "Piece",
        "price": 1677,
        "mrp": 2150,
        "discountPercent": 22,
        "stock": 35,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 94,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-zinc-plus-perforated-thali-basket",
      "prod-mod-hettich-cargoplus-ss304-thali"
    ]
  },
  {
    "id": "prod-mod-zinc-plus-perforated-thali-basket",
    "slug": "zinc-plus-perforated-ss-plate-thali-basket-15x20x6-in",
    "name": "Zinc Plus Perforated SS Plate & Thali Basket 15×20×6 in (HSN 7323)",
    "title": "Zinc Plus — Perforated SS Plate & Thali Basket 15×20×6 in",
    "brand": "Zinc Plus",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS 304 Baskets, Wicker & Organizers",
    "modularSubcategory": "BASKET_ORGANIZER",
    "carcassFitBadge": "Fits 15×20 in (380×500mm) Carcass",
    "inclusionsBadge": null,
    "carcassWidthMm": 380,
    "depthMm": 500,
    "heightMm": 150,
    "loadCapacityKg": 30,
    "finishColor": "SS 304 Brushed",
    "oemModelCode": "ZP-PERF-15206",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 2119,
    "exGstPrice": 1796,
    "mrp": 2700,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "7323",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Laser-cut perforated stainless steel sheet base prevents water pooling on freshly washed thalis",
    "specChips": [
      "15×20×6 in",
      "Perforated SS Base",
      "Plate & Thali Grooves",
      "Hygiene Specialist"
    ],
    "description": "Zinc Plus perforated sheet basket combines solid structural stainless steel sides with a perforated sheet metal floor, preventing cutlery handles or spoons from poking through while providing superior air drying for plates.",
    "highlights": [
      "Solid perforated sheet base prevents small spoons from falling through",
      "Dedicated formed wire thali holders cradle plates upright securely",
      "Sturdy 6-inch deep basket profile holds large 12-inch Punjabi thalis",
      "Brushed satin stainless steel finish matches modern Indian kitchens"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Zinc Plus"
      },
      {
        "label": "Dimensions",
        "value": "15 in × 20 in × 6 in (380 × 500 × 150 mm)"
      },
      {
        "label": "Base Type",
        "value": "Perforated SS 304 Sheet"
      },
      {
        "label": "HSN Code",
        "value": "7323"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-zp-perf-15206",
        "label": "15×20×6 in - Perforated",
        "unit": "Piece",
        "price": 2119,
        "mrp": 2700,
        "discountPercent": 22,
        "stock": 28,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 77,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-quba-symetry-plain-basket-ss304",
      "prod-mod-hettich-cargoplus-ss304-thali"
    ]
  },
  {
    "id": "prod-mod-hettich-orgatray-560-cutlery",
    "slug": "hettich-orgatray-560-adjustable-pvc-cutlery-tray-600mm",
    "name": "Hettich OrgaTray 560 Adjustable PVC Cutlery Tray 600mm Width 520mm Depth (HSN 3924)",
    "title": "Hettich — OrgaTray 560 Adjustable PVC Cutlery Tray 600mm",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS 304 Baskets, Wicker & Organizers",
    "modularSubcategory": "BASKET_ORGANIZER",
    "carcassFitBadge": "Fits 600mm Drawer (520mm Depth)",
    "inclusionsBadge": null,
    "carcassWidthMm": 600,
    "depthMm": 520,
    "heightMm": 55,
    "loadCapacityKg": 10,
    "finishColor": "Anthracite Plastic",
    "oemModelCode": "ORGATRAY-560-600",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 2930,
    "exGstPrice": 2483,
    "mrp": 3750,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "3924",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Custom trimmable food-grade plastic cutlery organizer with partitioned compartments for spoons and knives",
    "specChips": [
      "Fits 600mm Drawer",
      "520mm Depth",
      "Trimmable Rim",
      "Food-Grade Plastic"
    ],
    "description": "Hettich OrgaTray 560 brings German order to modular kitchen cutlery drawers. Features formed compartments for forks, knives, tablespoons, teaspoons, and whisks. Flanged rim can be trimmed with a utility knife for exact interior drawer fits.",
    "highlights": [
      "Precision German molded food-safe polymer wipes clean with soapy water",
      "Trimmable rim allows exact tailored fit inside 550mm to 600mm drawer carcasses",
      "Ergonomic rounded compartment scoops allow effortless cutlery retrieval",
      "Coordinates seamlessly with Hettich InnoTech and Atira drawer systems"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Series",
        "value": "OrgaTray 560"
      },
      {
        "label": "Nominal Carcass Width",
        "value": "600 mm"
      },
      {
        "label": "Nominal Depth",
        "value": "520 mm (trimmable to 470 mm)"
      },
      {
        "label": "Material",
        "value": "Food-Grade Recyclable Plastic"
      },
      {
        "label": "HSN Code",
        "value": "3924"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-orgatray-600",
        "label": "600mm × 520mm - Anthracite",
        "unit": "Piece",
        "price": 2930,
        "mrp": 3750,
        "discountPercent": 22,
        "stock": 45,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 164,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-innotech-cutlery-70mm",
      "prod-mod-ebco-slim-s3-500-122"
    ]
  },
  {
    "id": "prod-mod-ebco-waste-bin-40l",
    "slug": "ebco-pull-out-under-sink-dual-waste-bin-40l-2x20l-anthracite",
    "name": "Ebco Pull-Out Under-Sink Dual Waste Bin 40L 2×20L Anthracite (HSN 3924)",
    "title": "Ebco — Pull-Out Under-Sink Dual Waste Bin 40L (2×20L Anthracite)",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS 304 Baskets, Wicker & Organizers",
    "modularSubcategory": "BASKET_ORGANIZER",
    "carcassFitBadge": "Fits 450mm Under-Sink Base Cabinet",
    "inclusionsBadge": null,
    "carcassWidthMm": 450,
    "depthMm": 480,
    "heightMm": 420,
    "loadCapacityKg": 20,
    "finishColor": "Anthracite",
    "oemModelCode": "POWB-40",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 5304,
    "exGstPrice": 4495,
    "mrp": 6800,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "3924",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Twin 20-liter bottom slide pull-out bins for wet and dry organic household waste segregation",
    "specChips": [
      "40L Total Capacity (2×20L)",
      "Wet & Dry Segregation",
      "Bottom Ball Runner",
      "Fits 450mm Carcass"
    ],
    "description": "Ebco 40L pull-out waste management system mounts cleanly on the floor of under-sink kitchen cabinets. Includes dual removable 20-liter color-accented buckets with carry handles for wet and dry trash segregation.",
    "highlights": [
      "Twin 20-liter removable buckets support municipal wet and dry organic waste segregation",
      "Sturdy bottom-mounted ball bearing slides pull bins smoothly clear of sink drain pipes",
      "Fixed top lid acts as an odor barrier and doubles as a storage shelf for dish soap",
      "Delivered via 3-Wheeler E-Loader"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Capacity",
        "value": "40 Liters (2 × 20 L buckets)"
      },
      {
        "label": "Carcass Clearance",
        "value": "Fits 450 mm base cabinet"
      },
      {
        "label": "Dimensions",
        "value": "Width 350 mm × Depth 480 mm × Height 420 mm"
      },
      {
        "label": "HSN Code",
        "value": "3924"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-bin-40",
        "label": "40L Dual Bin (Anthracite)",
        "unit": "Unit",
        "price": 5304,
        "mrp": 6800,
        "discountPercent": 22,
        "stock": 20,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 88,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-ebco-livsmart-wicker-450",
      "prod-mod-ebco-pro-lift-100n-gas-spring"
    ]
  },
  {
    "id": "prod-mod-ebco-livsmart-wicker-450",
    "slug": "ebco-livsmart-wicker-basket-soft-close-beech-wood-450mm-150mm",
    "name": "Ebco Livsmart Wicker Basket Soft Close Beech Wood 450mm × 150mm 6 in (HSN 8302)",
    "title": "Ebco — Livsmart Wicker Basket Soft Close Beech Wood 450mm × 150mm",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "SS 304 Baskets, Wicker & Organizers",
    "modularSubcategory": "BASKET_ORGANIZER",
    "carcassFitBadge": "Fits 450mm (18 in) Vegetable Carcass",
    "inclusionsBadge": null,
    "carcassWidthMm": 450,
    "depthMm": 500,
    "heightMm": 150,
    "loadCapacityKg": 20,
    "finishColor": "Natural Beech Wood",
    "oemModelCode": "WB-450-BW",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 5518,
    "exGstPrice": 4676,
    "mrp": 6990,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Traditional woven wicker basket with solid European steamed beech wood frame and soft-close slides",
    "specChips": [
      "Fits 450mm Carcass",
      "Solid Beech Wood",
      "Natural Breathable Wicker",
      "Soft Close Runners"
    ],
    "description": "Ebco Livsmart Wicker Basket is handcrafted from natural breathable wicker mounted in a solid European beech frame. Provides natural air circulation essential for onions, potatoes, and garlic in Indian kitchens.",
    "highlights": [
      "Natural wicker weave allows 360-degree cross-ventilation, doubling onion/potato shelf life",
      "Solid kiln-dried steamed European beech frame prevents moisture warping",
      "Includes premium concealed soft-closing undermount slides",
      "Delivered safely via E-Loader fleet to preserve woven structure"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Series",
        "value": "Livsmart"
      },
      {
        "label": "Fits Carcass Width",
        "value": "450 mm (18 in)"
      },
      {
        "label": "Height",
        "value": "150 mm (6 in)"
      },
      {
        "label": "Frame Wood",
        "value": "Steamed Beech Wood"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-wicker-450",
        "label": "450mm × 150mm - Beech Wicker",
        "unit": "Piece",
        "price": 5518,
        "mrp": 6990,
        "discountPercent": 21,
        "stock": 15,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 56,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-ebco-waste-bin-40l",
      "prod-mod-hettich-cargoplus-ss304-thali"
    ]
  },
  {
    "id": "prod-mod-ebco-pro-lift-100n-gas-spring",
    "slug": "ebco-pro-lift-hydraulic-gas-spring-100n-for-loft-cabinets-1-pair",
    "name": "Ebco Pro-Lift Hydraulic Gas Spring 100N for Loft Cabinets 1 Pair (HSN 8302)",
    "title": "Ebco — Pro-Lift Hydraulic Gas Spring 100N for Loft Cabinets (1 Pair)",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Rolling Shutters, Lift-Ups & Gola Profiles",
    "modularSubcategory": "SHUTTER_LIFT_GOLA",
    "carcassFitBadge": "Universal Loft Flap Shutter (Up to 10kg)",
    "inclusionsBadge": null,
    "carcassWidthMm": null,
    "depthMm": null,
    "heightMm": null,
    "loadCapacityKg": 10,
    "finishColor": "Nickel / Silver",
    "oemModelCode": "PL-100N",
    "sellingUnit": "Pair",
    "unit": "Pair",
    "price": 239,
    "exGstPrice": 203,
    "mrp": 320,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Pneumatic 100N nitrogen gas strut for upward-opening overhead modular kitchen loft doors",
    "specChips": [
      "100N Force (~10kg)",
      "1 Pair (2 Pcs)",
      "Nitrogen Gas Damped",
      "60-Min Bike Delivery"
    ],
    "description": "Ebco Pro-Lift 100N pneumatic gas stay holds overhead cabinet shutters open at 90 degrees for effortless access. Includes circular mounting brackets and screws for wooden and aluminium framed doors.",
    "highlights": [
      "100 Newton lifting force holds upward swinging doors up to 10kg firmly open",
      "Smooth silent pneumatic action prevents door slamming",
      "Suitable for wooden, MDF, and aluminium profile overhead loft doors",
      "Express 60-min delivery on 2-wheeler fleet"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Force Rating",
        "value": "100 N per piston"
      },
      {
        "label": "Opening Angle",
        "value": "75°, 90°, or 110° based on mount position"
      },
      {
        "label": "Quantity",
        "value": "1 Pair (2 Pcs)"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-pl100",
        "label": "100N - 1 Pair",
        "unit": "Pair",
        "price": 239,
        "mrp": 320,
        "discountPercent": 25,
        "stock": 120,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 210,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-hettich-gola-profile-3000mm-black",
      "prod-mod-ebco-waste-bin-40l"
    ]
  },
  {
    "id": "prod-mod-hettich-100n-gas-piston-0062316",
    "slug": "hettich-100n-hydraulic-gas-piston-shock-absorber-0062316",
    "name": "Hettich 100N Hydraulic Gas Piston Shock Absorber 0062316 Nickel (HSN 8302)",
    "title": "Hettich — 100N Hydraulic Gas Piston Shock Absorber (Model 0062316)",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Rolling Shutters, Lift-Ups & Gola Profiles",
    "modularSubcategory": "SHUTTER_LIFT_GOLA",
    "carcassFitBadge": "Universal Overhead Flap Stay",
    "inclusionsBadge": null,
    "carcassWidthMm": null,
    "depthMm": null,
    "heightMm": null,
    "loadCapacityKg": 10,
    "finishColor": "Nickel Plated",
    "oemModelCode": "0062316",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 7642,
    "exGstPrice": 6476,
    "mrp": 9600,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "German industrial nitrogen gas piston flap stay with multi-angle position hold",
    "specChips": [
      "Model 0062316",
      "100N Precision Force",
      "Multi-Position Stop",
      "German Engineered"
    ],
    "description": "Hettich Model 0062316 is a high-specification German hydraulic gas piston stay engineered for luxury flap fittings. Provides frictionless opening and stays securely poised at any chosen intermediate position.",
    "highlights": [
      "Authentic German engineering tested for 100,000 continuous flap cycles",
      "Multi-position stop feature allows users of any height to reach and close the door easily",
      "Corrosion-proof nickel cylinder shaft with hermetic nitrogen seals",
      "Supplied with rapid click-on cabinet mounting plate"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "OEM Part Number",
        "value": "0062316"
      },
      {
        "label": "Rating",
        "value": "100 N"
      },
      {
        "label": "Finish",
        "value": "Nickel Plated Steel"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-hettich-piston-100n",
        "label": "Model 0062316 - 100N",
        "unit": "Piece",
        "price": 7642,
        "mrp": 9600,
        "discountPercent": 20,
        "stock": 18,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 35,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-gola-profile-3000mm-black",
      "prod-mod-hafele-matrixbox-slim-ss-500-88"
    ]
  },
  {
    "id": "prod-mod-hettich-gola-profile-3000mm-black",
    "slug": "hettich-gola-profile-l-type-handleless-aluminium-3000mm-black-9299225",
    "name": "Hettich Gola Profile L-Type Handleless Aluminium 3000mm Black 9299225 (HSN 7604)",
    "title": "Hettich — Gola Profile L-Type Handleless Aluminium 3000mm Black (9299225)",
    "brand": "Hettich",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Rolling Shutters, Lift-Ups & Gola Profiles",
    "modularSubcategory": "SHUTTER_LIFT_GOLA",
    "carcassFitBadge": "3000mm Full Length Handleless Profile",
    "inclusionsBadge": null,
    "carcassWidthMm": 3000,
    "depthMm": null,
    "heightMm": null,
    "loadCapacityKg": null,
    "finishColor": "Matte Black Anodized",
    "oemModelCode": "9299225",
    "sellingUnit": "Bar",
    "unit": "Bar (3m)",
    "price": 2399,
    "exGstPrice": 2033,
    "mrp": 2990,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "7604",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "3-meter continuous L-shape anodized aluminium extrusion for seamless handleless kitchen base cabinets",
    "specChips": [
      "3000mm Length (10 ft)",
      "L-Type Upper Profile",
      "Matte Black Anodized",
      "Model 9299225"
    ],
    "description": "Hettich L-Type Gola Profile (Model 9299225) creates pure handleless modular kitchen aesthetics beneath the countertop. Premium anodized matte black aluminum extrusion provides comfortable finger recess to pull drawers.",
    "highlights": [
      "Continuous 3000mm length minimizes unsightly butt joints across long kitchen runs",
      "Deep anodized matte black coating never chips or shows oily fingerprint smears",
      "Supplied with rigid internal fixing clips and 90-degree corner brackets",
      "Dispatched exclusively via 3-Wheeler E-Loader due to full 3-meter length"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "OEM Part Number",
        "value": "9299225"
      },
      {
        "label": "Profile Shape",
        "value": "L-Type (Under Countertop)"
      },
      {
        "label": "Length",
        "value": "3000 mm (approx 10 feet)"
      },
      {
        "label": "Material",
        "value": "Extruded Aluminium"
      },
      {
        "label": "HSN Code",
        "value": "7604"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-hettich-gola-3m",
        "label": "3000mm (Matte Black)",
        "unit": "Bar (3m)",
        "price": 2399,
        "mrp": 2990,
        "discountPercent": 20,
        "stock": 40,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 128,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-atira-pot-pan-176mm",
      "prod-mod-hettich-innotech-cutlery-70mm"
    ]
  },
  {
    "id": "prod-mod-ebco-roll-top-pro-shutter-600mm",
    "slug": "ebco-roll-top-pro-vertical-rolling-shutter-600mm-anthracite-rtpv",
    "name": "Ebco Roll Top Pro Vertical Rolling Shutter 600mm Anthracite RTPV (HSN 7604)",
    "title": "Ebco — Roll Top Pro Vertical Rolling Shutter 600mm Anthracite (RTPV)",
    "brand": "Ebco",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Rolling Shutters, Lift-Ups & Gola Profiles",
    "modularSubcategory": "SHUTTER_LIFT_GOLA",
    "carcassFitBadge": "Fits 600mm Appliance Garage Carcass",
    "inclusionsBadge": null,
    "carcassWidthMm": 600,
    "depthMm": 350,
    "heightMm": 1400,
    "loadCapacityKg": null,
    "finishColor": "Anthracite Aluminium",
    "oemModelCode": "RTPV",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 12014,
    "exGstPrice": 10181,
    "mrp": 15200,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "7604",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Smooth rolling vertical aluminum tambours to conceal microwave, toaster, and coffee makers",
    "specChips": [
      "Fits 600mm Width",
      "Anthracite Aluminium Slat",
      "Spring Counterbalance",
      "Model RTPV"
    ],
    "description": "Ebco Roll Top Pro (Model RTPV) is the go-to appliance garage shutter for modern Lucknow kitchens. Features interlocking anthracite aluminum slats with a spring counterbalance mechanism for finger-touch vertical rolling.",
    "highlights": [
      "Precision interlocking aluminum slats glide smoothly on vertical guide tracks",
      "Internal spring-loaded counterbalance mechanism stops shutter at any height",
      "Conceals messy kitchen appliances (mixer, air fryer, espresso machine) instantly",
      "Dispatched via 3-Wheeler E-Loader"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Model Number",
        "value": "RTPV"
      },
      {
        "label": "External Cabinet Width",
        "value": "600 mm"
      },
      {
        "label": "Maximum Height",
        "value": "1400 mm"
      },
      {
        "label": "Slat Material",
        "value": "Anodized Aluminum"
      },
      {
        "label": "HSN Code",
        "value": "7604"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-ebco-rtpv-600",
        "label": "600mm Vertical Shutter (Anthracite)",
        "unit": "Unit",
        "price": 12014,
        "mrp": 15200,
        "discountPercent": 21,
        "stock": 14,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 59,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-mod-ebco-pro-lift-100n-gas-spring",
      "prod-mod-ebco-waste-bin-40l"
    ]
  },
  {
    "id": "prod-mod-rehau-rauvolet-vetroline-glass-shutter",
    "slug": "rehau-rauvolet-vetroline-toughened-glass-rolling-shutter-600x1500mm",
    "name": "Rehau RAUVOLET Vetroline Toughened Glass Rolling Shutter 600×1500mm (HSN 7604)",
    "title": "Rehau — RAUVOLET Vetroline Toughened Glass Rolling Shutter 600×1500mm",
    "brand": "Rehau",
    "categorySlug": "modular-kitchen-systems",
    "categoryName": "Modular Kitchen Systems & Fittings",
    "subCategory": "Rolling Shutters, Lift-Ups & Gola Profiles",
    "modularSubcategory": "SHUTTER_LIFT_GOLA",
    "carcassFitBadge": "Fits 600×1500mm Luxury Glass Carcass",
    "inclusionsBadge": null,
    "carcassWidthMm": 600,
    "depthMm": 350,
    "heightMm": 1500,
    "loadCapacityKg": null,
    "finishColor": "Metallic Black Glass",
    "oemModelCode": "RAUVOLET-VETRO-600",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 76699,
    "exGstPrice": 64999,
    "mrp": 95000,
    "discountPercent": 19,
    "gstPercent": 18,
    "hsnCode": "7604",
    "deliveryVehicleType": "E-Loader / Pickup",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "German luxury safety glass tambour door system with flush metallic black glass slats",
    "specChips": [
      "50mm Toughened Safety Glass",
      "600×1500mm Pre-Assembled",
      "Metallic Black Glass",
      "E-Loader / Pickup"
    ],
    "description": "Rehau RAUVOLET Vetroline is the pinnacle of German architectural kitchen tambour design. Formed from 50mm wide slats of genuine safety glass with high scratch resistance and translucent reflective luxury.",
    "highlights": [
      "50mm wide single-pane safety glass slats offer superior heat and scratch resistance",
      "Patented counterbalance mechanism allows effortless single-finger glide",
      "Factory pre-assembled cassette module reduces on-site carpenter installation time to 15 mins",
      "Dispatched exclusively via wooden-crated E-Loader / Pickup truck"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Rehau (Germany)"
      },
      {
        "label": "Series",
        "value": "RAUVOLET Vetroline"
      },
      {
        "label": "Cabinet Dimensions",
        "value": "600 mm width × 1500 mm height"
      },
      {
        "label": "Glass Type",
        "value": "Toughened Safety Glass (Metallic Black)"
      },
      {
        "label": "HSN Code",
        "value": "7604"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-mod-rehau-vetro-600",
        "label": "600×1500mm - Metallic Black Glass",
        "unit": "Unit",
        "price": 76699,
        "mrp": 95000,
        "discountPercent": 19,
        "stock": 6,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 28,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-mod-hettich-gola-profile-3000mm-black",
      "prod-mod-hafele-matrixbox-slim-ss-500-88"
    ]
  }
];
