// Master Dataset for Furniture, Wardrobe & Bed Hardware (All 20 Verified Lucknow SKUs)
export interface FurnitureHardwareProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subCategory: string;
  furnitureSubcategory: "TELESCOPIC_CHANNEL" | "HINGE_SLIDING" | "BED_WARDROBE_LIFT" | "PIPE_HANDLE";
  fitSpecBadge: string;
  lengthOrPitchSpec: string;
  loadCapacityLabel: string;
  closingType: "SOFT_CLOSE" | "REGULAR_CLOSE" | "N/A";
  overlayOrMountSpec: string;
  price: number;
  exGstPrice: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  hsnCode: string;
  deliveryVehicleType: "2-Wheeler" | "E-Loader";
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
  unit: string;
}

export const ALL_20_FURNITURE_HARDWARE_PRODUCTS: FurnitureHardwareProduct[] = [
  {
    "id": "prod-fur-ebco-stds-i-35-20in",
    "slug": "ebco-regular-drawer-channel-stds-i-35-20in",
    "name": "Ebco Regular Drawer Channel STDS-I-35 20 in (500mm, 35kg, 1 Pair)",
    "title": "Ebco — Regular Drawer Channel STDS-I-35 20 in (35kg, 1 Pair)",
    "brand": "Ebco",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Telescopic Channels",
    "furnitureSubcategory": "TELESCOPIC_CHANNEL",
    "fitSpecBadge": "20\" (500mm) · 35kg · Regular Close",
    "lengthOrPitchSpec": "20 in (500mm)",
    "loadCapacityLabel": "35kg",
    "closingType": "REGULAR_CLOSE",
    "overlayOrMountSpec": "Side Mount Ball Bearing",
    "price": 350,
    "exGstPrice": 297,
    "mrp": 490,
    "discountPercent": 29,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "High-grade cold rolled steel telescopic slide for modular drawers",
    "specChips": [
      "20\" (500mm)",
      "35kg Rated",
      "Precision Ball Bearings",
      "1 Pair (Left+Right)"
    ],
    "description": "Ebco STDS-I-35 20-inch drawer runner features heavy-gauge cold rolled steel construction with precision carbon steel ball bearings for friction-free drawer glide. Standard running line across Lucknow modular kitchen and wardrobe projects.",
    "highlights": [
      "Tested for 50,000 smooth cycles under 35kg dynamic payload",
      "Detachable lever mechanism for quick drawer removal during cleaning",
      "Corrosion-resistant electro-zinc plating suitable for humid Indian weather",
      "Full extension allows 100% drawer access right to the rear wall"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Model",
        "value": "STDS-I-35"
      },
      {
        "label": "Nominal Length",
        "value": "20 in / 500 mm"
      },
      {
        "label": "Load Rating",
        "value": "35 kg dynamic"
      },
      {
        "label": "Closing Action",
        "value": "Regular Close"
      },
      {
        "label": "Material",
        "value": "Cold Rolled Steel (Electro-Zinc)"
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
        "id": "var-fur-ebco-stds-20in",
        "label": "20 in (500mm) - 1 Pair",
        "unit": "1 Pair (2 Pcs)",
        "price": 350,
        "mrp": 490,
        "discountPercent": 29,
        "stock": 65,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 184,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-160mm-zblack",
      "prod-fur-hw-depot-handle-96mm-black",
      "prod-fur-hettich-onsys-0crank-105"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-ebco-sleek-reg-20in",
    "slug": "ebco-sleek-telescopic-channel-20in-regular-close",
    "name": "Ebco Sleek Telescopic Channel 20 in (500mm, 35kg Regular Close, 1 Pair)",
    "title": "Ebco — Sleek Telescopic Channel 20 in (35kg Regular Close, 1 Pair)",
    "brand": "Ebco",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Telescopic Channels",
    "furnitureSubcategory": "TELESCOPIC_CHANNEL",
    "fitSpecBadge": "20\" (500mm) · 35kg · Regular Close",
    "lengthOrPitchSpec": "20 in (500mm)",
    "loadCapacityLabel": "35kg",
    "closingType": "REGULAR_CLOSE",
    "overlayOrMountSpec": "Side Mount Ball Bearing",
    "price": 518,
    "exGstPrice": 439,
    "mrp": 690,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Slim profile 12.7mm clearance runner with silent solid ball bearings",
    "specChips": [
      "20\" (500mm)",
      "Sleek 12.7mm Gap",
      "35kg Capacity",
      "Full Travel"
    ],
    "description": "Ebco Sleek series provides an ultra-compact 12.7mm side gap profile enabling wider drawer carcass width without sacrificing heavy 35kg weight rating. Ideal for bedroom dressers and study tables in Lucknow modern homes.",
    "highlights": [
      "Slim 12.7mm side clearance maximizes internal drawer width",
      "Hardened steel ball cages eliminate drawer rack and play",
      "Positive stop bumper prevents drawer bounce-back on rapid closure",
      "Precision punched mounting holes for 32mm system screw alignment"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Series",
        "value": "Sleek"
      },
      {
        "label": "Nominal Length",
        "value": "20 in / 500 mm"
      },
      {
        "label": "Load Capacity",
        "value": "35 kg"
      },
      {
        "label": "Side Gap",
        "value": "12.7 mm"
      },
      {
        "label": "Finish",
        "value": "Bright Zinc Plated"
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
        "id": "var-fur-ebco-sleek-reg-20in",
        "label": "20 in - Sleek Regular",
        "unit": "1 Pair (2 Pcs)",
        "price": 518,
        "mrp": 690,
        "discountPercent": 25,
        "stock": 45,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.7,
    "reviewsCount": 112,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-160mm-zblack",
      "prod-fur-hw-depot-handle-224mm-zblack"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-ebco-sleek-soft-20in",
    "slug": "ebco-sleek-telescopic-channel-20in-soft-close",
    "name": "Ebco Sleek Telescopic Channel 20 in (500mm, 35kg Soft Close, 1 Pair)",
    "title": "Ebco — Sleek Telescopic Channel 20 in (35kg Soft Close, 1 Pair)",
    "brand": "Ebco",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Telescopic Channels",
    "furnitureSubcategory": "TELESCOPIC_CHANNEL",
    "fitSpecBadge": "20\" (500mm) · 35kg · Soft Close",
    "lengthOrPitchSpec": "20 in (500mm)",
    "loadCapacityLabel": "35kg",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Side Mount Ball Bearing",
    "price": 1074,
    "exGstPrice": 910,
    "mrp": 1390,
    "discountPercent": 23,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Hydraulic damper cushion for silent, slam-proof soft drawer closure",
    "specChips": [
      "20\" (500mm)",
      "Integrated Damper",
      "Silent Soft Close",
      "35kg Tested"
    ],
    "description": "Ebco Sleek Soft Close channel incorporates an integrated hydraulic piston that automatically captures the drawer 40mm prior to full closing, silently drawing it shut without rattles or bangs.",
    "highlights": [
      "Twin-spring fluid hydraulic damper for smooth, slam-free deceleration",
      "Full extension allows convenient overhead visibility of pots and pans",
      "Certified 40,000 cycle soft-close endurance",
      "Standard 12.7mm side mounting clearance"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ebco"
      },
      {
        "label": "Series",
        "value": "Sleek Soft Close"
      },
      {
        "label": "Length",
        "value": "20 in / 500 mm"
      },
      {
        "label": "Capacity",
        "value": "35 kg"
      },
      {
        "label": "Closing Action",
        "value": "Hydraulic Soft Close"
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
        "id": "var-fur-ebco-sleek-soft-20in",
        "label": "20 in - Sleek Soft Close",
        "unit": "1 Pair (2 Pcs)",
        "price": 1074,
        "mrp": 1390,
        "discountPercent": 23,
        "stock": 40,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 167,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-160mm-zblack",
      "prod-fur-hettich-onsys-0crank-105"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-hettich-ka4532-18in-zinc",
    "slug": "hettich-ka-4532-telescopic-channel-18in-soft-close-zinc",
    "name": "Hettich KA 4532 Telescopic Channel 18 in (450mm, 35kg Soft Close Zinc)",
    "title": "Hettich — KA 4532 Telescopic Channel 18 in (35kg Soft Close Zinc)",
    "brand": "Hettich",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Telescopic Channels",
    "furnitureSubcategory": "TELESCOPIC_CHANNEL",
    "fitSpecBadge": "18\" (450mm) · 35kg · Soft Close Zinc",
    "lengthOrPitchSpec": "18 in (450mm)",
    "loadCapacityLabel": "35kg",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Side Mount Ball Bearing",
    "price": 985,
    "exGstPrice": 835,
    "mrp": 1250,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "German engineered ball bearing slide with integrated Silent System cushion",
    "specChips": [
      "18\" (450mm)",
      "KA 4532 German Line",
      "Silent System Soft Close",
      "Zinc Plated"
    ],
    "description": "Hettich KA 4532 18-inch full-extension ball bearing drawer runner is engineered to German DIN standards. Features integrated Silent System fluid damping for whispering quiet drawer motion.",
    "highlights": [
      "Original German-designed Silent System soft-closing technology",
      "Hold-in detent prevents accidental roll-out when unlatched",
      "Side installation with release latch for effortless uncoupling",
      "Corrosion-resistant galvanized zinc finish with self-cleaning ball tracks"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Model",
        "value": "KA 4532"
      },
      {
        "label": "Length",
        "value": "18 in / 450 mm"
      },
      {
        "label": "Load Capacity",
        "value": "35 kg (EN 15338 Level 3)"
      },
      {
        "label": "Closing Action",
        "value": "Silent System (Soft Close)"
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
        "id": "var-fur-hettich-ka4532-18in",
        "label": "18 in - Zinc Soft Close",
        "unit": "1 Pair (2 Pcs)",
        "price": 985,
        "mrp": 1250,
        "discountPercent": 21,
        "stock": 55,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 204,
    "deliveryEta": "60 Mins",
    "vendor": "Hewett Road / Shivaji Marg Depot",
    "crossSellSkus": [
      "prod-fur-hettich-onsys-0crank-105",
      "prod-fur-hw-depot-handle-160mm-zblack"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-hettich-ka4732-18in-black",
    "slug": "hettich-ka-4732-telescopic-channel-18in-soft-close-black",
    "name": "Hettich KA-4732 Telescopic Channel 18 in (450mm, 35kg Soft Close Black)",
    "title": "Hettich — KA-4732 Telescopic Channel 18 in (35kg Soft Close Black)",
    "brand": "Hettich",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Telescopic Channels",
    "furnitureSubcategory": "TELESCOPIC_CHANNEL",
    "fitSpecBadge": "18\" (450mm) · 35kg · Soft Close Black",
    "lengthOrPitchSpec": "18 in (450mm)",
    "loadCapacityLabel": "35kg",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Side Mount Ball Bearing",
    "price": 1150,
    "exGstPrice": 975,
    "mrp": 1450,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Luxury black electrophoretic coating for dark interior modular cabinetry",
    "specChips": [
      "18\" (450mm)",
      "Electrophoretic Black",
      "Silent System",
      "35kg Rated"
    ],
    "description": "Hettich KA-4732 in designer black finish blends seamlessly with dark charcoal, walnut, and smoked oak cabinetry in upscale Lucknow residences. Integrated hydraulic damping ensures silent motion.",
    "highlights": [
      "Premium deep matte black electrophoretic coating resists scuffs",
      "Seamless aesthetic match for dark carcasses and luxury wardrobe drawers",
      "Precision ball track with steel bearings for fluid glide",
      "35kg dynamic load rating with smooth Silent System retraction"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Model",
        "value": "KA 4732"
      },
      {
        "label": "Length",
        "value": "18 in / 450 mm"
      },
      {
        "label": "Finish",
        "value": "Black Electrophoretic"
      },
      {
        "label": "Closing Action",
        "value": "Soft Close"
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
        "id": "var-fur-hettich-ka4732-18in",
        "label": "18 in - Black Soft Close",
        "unit": "1 Pair (2 Pcs)",
        "price": 1150,
        "mrp": 1450,
        "discountPercent": 21,
        "stock": 35,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 88,
    "deliveryEta": "60 Mins",
    "vendor": "Hewett Road / Shivaji Marg Depot",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-160mm-zblack",
      "prod-fur-hw-depot-handle-224mm-zblack"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-hettich-ka4732-20in-black",
    "slug": "hettich-ka-4732-telescopic-channel-20in-soft-close-black",
    "name": "Hettich KA-4732 Telescopic Channel 20 in (500mm, 35kg Soft Close Black)",
    "title": "Hettich — KA-4732 Telescopic Channel 20 in (35kg Soft Close Black)",
    "brand": "Hettich",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Telescopic Channels",
    "furnitureSubcategory": "TELESCOPIC_CHANNEL",
    "fitSpecBadge": "20\" (500mm) · 35kg · Soft Close Black",
    "lengthOrPitchSpec": "20 in (500mm)",
    "loadCapacityLabel": "35kg",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Side Mount Ball Bearing",
    "price": 1194,
    "exGstPrice": 1012,
    "mrp": 1520,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "20-inch deep drawer luxury runner in matte black with fluid deceleration",
    "specChips": [
      "20\" (500mm)",
      "Full Extension",
      "Matte Black",
      "Silent System"
    ],
    "description": "Hettich KA-4732 20-inch runner delivers maximum storage depth for 550mm standard kitchen modular base cabinets. High-tensile steel build coated in scratch-resistant matte black.",
    "highlights": [
      "Full 500mm drawer travel brings rear contents directly to hand",
      "Factory calibrated hydraulic damper eliminates drawer bounce",
      "Matches dark hardware trends preferred by Gomti Nagar architects",
      "35kg payload rating under European EN 15338 certification"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Model",
        "value": "KA 4732"
      },
      {
        "label": "Length",
        "value": "20 in / 500 mm"
      },
      {
        "label": "Finish",
        "value": "Matte Black"
      },
      {
        "label": "Closing Action",
        "value": "Soft Close"
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
        "id": "var-fur-hettich-ka4732-20in",
        "label": "20 in - Black Soft Close",
        "unit": "1 Pair (2 Pcs)",
        "price": 1194,
        "mrp": 1520,
        "discountPercent": 21,
        "stock": 40,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 134,
    "deliveryEta": "60 Mins",
    "vendor": "Hewett Road / Shivaji Marg Depot",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-224mm-zblack",
      "prod-fur-hw-depot-handle-160mm-zblack"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-hettich-onsys-0crank-105",
    "slug": "hettich-onsys-4447i-soft-close-hinge-105-0-crank",
    "name": "Hettich Onsys 4447i Soft Close Hinge 105° 0 Crank (Full Overlay, 1 Pair)",
    "title": "Hettich — Onsys 4447i Soft Close Hinge 105° 0 Crank (Full Overlay, 1 Pair)",
    "brand": "Hettich",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Soft-Close Hinges & Sliding Track",
    "furnitureSubcategory": "HINGE_SLIDING",
    "fitSpecBadge": "105° · 0 Crank · Full Overlay",
    "lengthOrPitchSpec": "105° Opening",
    "loadCapacityLabel": "Standard Cabinet Door",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Full Overlay (0 Crank)",
    "price": 209,
    "exGstPrice": 177,
    "mrp": 280,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "0-Crank full overlay concealed hinge with integrated hydraulic soft-close",
    "specChips": [
      "105° Opening",
      "0 Crank (Full Overlay)",
      "35mm Cup",
      "Soft Close Built-In"
    ],
    "description": "Hettich Onsys 4447i 0-Crank hinge is the industry benchmark for standard full-overlay cabinet doors where the door completely covers the cabinet gable. Fitted with integrated hydraulic damper for silent, slam-free closure.",
    "highlights": [
      "Zero-crank straight arm design fully overlays 18mm or 19mm cabinet carcass side gables",
      "Standard 35mm cup boring diameter with 11.5mm cup depth",
      "Integrated hydraulic damper inside the hinge cup for zero-maintenance operation",
      "Tool-less height and depth adjustment screws on mounting plate"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Series",
        "value": "Onsys 4447i"
      },
      {
        "label": "Crank Type",
        "value": "0 Crank (Full Overlay)"
      },
      {
        "label": "Opening Angle",
        "value": "105°"
      },
      {
        "label": "Cup Diameter",
        "value": "35 mm"
      },
      {
        "label": "Door Thickness",
        "value": "14 mm to 24 mm"
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
        "id": "var-fur-hettich-onsys-0crank",
        "label": "1 Pair (2 Pcs) - 0 Crank",
        "unit": "1 Pair (2 Pcs)",
        "price": 209,
        "mrp": 280,
        "discountPercent": 25,
        "stock": 120,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 310,
    "deliveryEta": "60 Mins",
    "vendor": "Hewett Road / Shivaji Marg Depot",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-160mm-zblack",
      "prod-fur-ebco-stds-i-35-20in"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-hettich-onsys-8crank-105",
    "slug": "hettich-onsys-4447i-soft-close-hinge-105-8-crank",
    "name": "Hettich Onsys 4447i Soft Close Hinge 105° 8 Crank (Half Overlay, 1 Pair)",
    "title": "Hettich — Onsys 4447i Soft Close Hinge 105° 8 Crank (Half Overlay, 1 Pair)",
    "brand": "Hettich",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Soft-Close Hinges & Sliding Track",
    "furnitureSubcategory": "HINGE_SLIDING",
    "fitSpecBadge": "105° · 8 Crank · Half Overlay",
    "lengthOrPitchSpec": "105° Opening",
    "loadCapacityLabel": "Standard Cabinet Door",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Half Overlay (8 Crank)",
    "price": 222,
    "exGstPrice": 188,
    "mrp": 295,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "8-Crank cranked arm hinge for twin doors meeting on a shared center partition",
    "specChips": [
      "105° Opening",
      "8 Crank (Half Overlay)",
      "Twin-Door Partition",
      "Soft Close"
    ],
    "description": "Hettich Onsys 4447i 8-Crank (Half Overlay) hinge features an offset cranked hinge arm designed specifically for cabinets where two opposite opening doors mount on a single 18mm center partition wall.",
    "highlights": [
      "8-Crank offset arm allows two doors to share a single 18mm center partition",
      "Integrated hydraulic soft-closing damper prevents door slamming",
      "Nickel-plated steel ensures high resistance against household humidity",
      "Proven German reliability tested for 40,000 door openings"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Series",
        "value": "Onsys 4447i"
      },
      {
        "label": "Crank Type",
        "value": "8 Crank (Half Overlay)"
      },
      {
        "label": "Opening Angle",
        "value": "105°"
      },
      {
        "label": "Cup Diameter",
        "value": "35 mm"
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
        "id": "var-fur-hettich-onsys-8crank",
        "label": "1 Pair (2 Pcs) - 8 Crank",
        "unit": "1 Pair (2 Pcs)",
        "price": 222,
        "mrp": 295,
        "discountPercent": 25,
        "stock": 85,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Hewett Road / Shivaji Marg Depot",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-160mm-zblack",
      "prod-fur-hettich-onsys-0crank-105"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-hafele-metalla-110-full",
    "slug": "hafele-metalla-110-clip-on-full-overlay-soft-close-hinge-315-07-075",
    "name": "Hafele Metalla 110° Clip-On Full Overlay Soft Close Hinge (315.07.075, 1 Pair)",
    "title": "Hafele — Metalla 110° Clip-On Full Overlay Soft Close Hinge (315.07.075)",
    "brand": "Hafele",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Soft-Close Hinges & Sliding Track",
    "furnitureSubcategory": "HINGE_SLIDING",
    "fitSpecBadge": "110° · Clip-On · Full Overlay",
    "lengthOrPitchSpec": "110° Opening",
    "loadCapacityLabel": "Premium Cabinet Door",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Full Overlay (Clip-On)",
    "price": 3628,
    "exGstPrice": 3075,
    "mrp": 4490,
    "discountPercent": 19,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "German luxury architectural clip-on hinge with wider 110° clear access",
    "specChips": [
      "110° Wide Angle",
      "Clip-On Toolless",
      "Full Overlay",
      "Ref: 315.07.075"
    ],
    "description": "Hafele Metalla 110° Clip-On Full Overlay Hinge (SKU 315.07.075) is the gold standard for luxury kitchen and wardrobe installations. Features instant toolless clip-on assembly and an extra wide 110-degree opening.",
    "highlights": [
      "Wide 110° opening provides unobstructed access for internal pull-out drawers",
      "Instant clip-on hinge-to-plate connection reduces carpenter installation time by 50%",
      "Engineered fluid damper ensures feather-soft, silent closing every single time",
      "Premium triple-nickel plating certified to withstand 96 hours neutral salt spray"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hafele"
      },
      {
        "label": "Catalog Code",
        "value": "315.07.075"
      },
      {
        "label": "Opening Angle",
        "value": "110°"
      },
      {
        "label": "Mount Type",
        "value": "Toolless Clip-On"
      },
      {
        "label": "Overlay",
        "value": "Full Overlay"
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
        "id": "var-fur-hafele-315-075",
        "label": "1 Pair (2 Pcs) - Full Overlay",
        "unit": "1 Pair (2 Pcs)",
        "price": 3628,
        "mrp": 4490,
        "discountPercent": 19,
        "stock": 25,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 76,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-160mm-zblack",
      "prod-fur-hw-depot-handle-224mm-zblack"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-hafele-metalla-110-half",
    "slug": "hafele-metalla-110-clip-on-half-overlay-soft-close-hinge-315-07-076",
    "name": "Hafele Metalla 110° Clip-On Half Overlay Soft Close Hinge (315.07.076, 1 Pair)",
    "title": "Hafele — Metalla 110° Clip-On Half Overlay Soft Close Hinge (315.07.076)",
    "brand": "Hafele",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Soft-Close Hinges & Sliding Track",
    "furnitureSubcategory": "HINGE_SLIDING",
    "fitSpecBadge": "110° · Clip-On · Half Overlay",
    "lengthOrPitchSpec": "110° Opening",
    "loadCapacityLabel": "Premium Cabinet Door",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Half Overlay (Clip-On)",
    "price": 3676,
    "exGstPrice": 3115,
    "mrp": 4550,
    "discountPercent": 19,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Luxury clip-on half-overlay hinge for shared middle cabinet partition gables",
    "specChips": [
      "110° Wide Angle",
      "Clip-On System",
      "Half Overlay",
      "Ref: 315.07.076"
    ],
    "description": "Hafele Metalla 110° Half Overlay Hinge (SKU 315.07.076) is crafted for premium cabinetry where dual doors mount onto a shared central carcass divider. Quick clip-on mechanism simplifies carpenter alignment.",
    "highlights": [
      "Engineered offset arm allows precise half-overlay on 18mm center gables",
      "Clip-on mounting plate with eccentric 3-way height, depth, and side calibration",
      "Concealed hydraulic damper prevents impact wear on luxury lacquered shutters",
      "German quality standards guaranteed for lifetime kitchen performance"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hafele"
      },
      {
        "label": "Catalog Code",
        "value": "315.07.076"
      },
      {
        "label": "Opening Angle",
        "value": "110°"
      },
      {
        "label": "Overlay",
        "value": "Half Overlay"
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
        "id": "var-fur-hafele-315-076",
        "label": "1 Pair (2 Pcs) - Half Overlay",
        "unit": "1 Pair (2 Pcs)",
        "price": 3676,
        "mrp": 4550,
        "discountPercent": 19,
        "stock": 20,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 62,
    "deliveryEta": "60 Mins",
    "vendor": "Gomti Nagar Premium Architectural Depot",
    "crossSellSkus": [
      "prod-fur-hafele-metalla-110-full",
      "prod-fur-hw-depot-handle-160mm-zblack"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-decoranddecor-sliding-12m",
    "slug": "decoranddecor-sliding-wardrobe-door-track-kit-2-doors-1-2m",
    "name": "Decoranddecor Sliding Wardrobe Door Track Kit 2 Doors 1.2m (75kg/door)",
    "title": "Decoranddecor — Sliding Wardrobe Door Track Kit 2 Doors 1.2m (75kg/door)",
    "brand": "Decoranddecor",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Soft-Close Hinges & Sliding Track",
    "furnitureSubcategory": "HINGE_SLIDING",
    "fitSpecBadge": "1.2m Track · 2 Doors · 75kg/Door",
    "lengthOrPitchSpec": "1.2m Track",
    "loadCapacityLabel": "75kg/Door",
    "closingType": "REGULAR_CLOSE",
    "overlayOrMountSpec": "Top & Bottom Track Kit",
    "price": 11493,
    "exGstPrice": 9740,
    "mrp": 14500,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Heavy-duty aluminum sliding door system for 2-door wardrobe closets up to 75kg/door",
    "specChips": [
      "1.2 Meter Track",
      "2-Door Complete Kit",
      "75kg Per Shutter",
      "E-Loader Delivery"
    ],
    "description": "Decoranddecor 1.2m sliding wardrobe track system includes heavy anodized aluminum double top and bottom rails, ball bearing roller carriages, anti-jump stoppers, and floor guides. Designed for heavy plywood doors up to 75kg per leaf.",
    "highlights": [
      "Rigid extruded aluminum top and bottom dual-channel tracks (1.2m long)",
      "High-tensile nylon roller wheels with sealed ball bearings for whisper glide",
      "Supports 18mm to 25mm thick wooden/plywood wardrobe sliding shutters",
      "Requires 3-Wheeler E-Loader delivery due to 1.2m solid track length"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Decoranddecor"
      },
      {
        "label": "Track Length",
        "value": "1.2 m (4 feet)"
      },
      {
        "label": "Capacity",
        "value": "75 kg per door (150 kg total)"
      },
      {
        "label": "Door Leaves",
        "value": "2 Doors"
      },
      {
        "label": "Delivery Mode",
        "value": "E-Loader Only"
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
        "id": "var-fur-decoranddecor-12m",
        "label": "1.2m Track - 2 Doors Kit",
        "unit": "Complete Kit",
        "price": 11493,
        "mrp": 14500,
        "discountPercent": 21,
        "stock": 15,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.7,
    "reviewsCount": 44,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-heavy-duty-ss-closet-rod-36in",
      "prod-fur-hettich-wardrobe-lift-540-690"
    ],
    "unit": "Kit"
  },
  {
    "id": "prod-fur-hydraulic-lift-ottoman-1200n",
    "slug": "hydraulic-lift-ottoman-bed-mechanism-1200n-gas-strut-set",
    "name": "Hydraulic Lift Ottoman Bed Lift Mechanism + 1200N Gas Strut Set (2x Pair)",
    "title": "Hydraulic Lift — Ottoman Bed Lift Mechanism + 1200N Gas Strut Set (2x Pair)",
    "brand": "Hydraulic Lift",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Hydraulic Bed & Wardrobe Lifts",
    "furnitureSubcategory": "BED_WARDROBE_LIFT",
    "fitSpecBadge": "1200N Gas Struts · Heavy Ottoman Set",
    "lengthOrPitchSpec": "1200N Struts",
    "loadCapacityLabel": "1200N Force (~120kg Box)",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Side Bed Carcass Mounting",
    "price": 13700,
    "exGstPrice": 11610,
    "mrp": 17500,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Heavy pneumatic gas spring ottoman bed lifting mechanism for effortless mattress storage access",
    "specChips": [
      "1200N High Pressure",
      "Twin Strut Mechanism",
      "Queen/King Bed Access",
      "E-Loader Delivery"
    ],
    "description": "Hydraulic Lift heavy-duty ottoman bed mechanism incorporates 1200N industrial gas springs to effortlessly lift heavy wooden bed frames topped with 8-inch pocket spring mattresses. Safely stays open at 45 degrees.",
    "highlights": [
      "Twin 1200N high-pressure gas springs lift up to 120kg mattress assemblies effortlessly",
      "Heavy steel bracket arms with reinforced pivot rivets for wobble-free stability",
      "Hands-free open hold allows easy loading of winter quilts and luggage",
      "Dispatched exclusively via 3-Wheeler E-Loader to protect strut alignment"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hydraulic Lift"
      },
      {
        "label": "Gas Spring Force",
        "value": "1200 N per strut"
      },
      {
        "label": "Bed Suitability",
        "value": "Queen Size (5×6.5 ft) & King Size (6×6.5 ft)"
      },
      {
        "label": "Material",
        "value": "Heavy-Gauge Powder Coated Steel"
      },
      {
        "label": "Delivery Mode",
        "value": "E-Loader Only"
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
        "id": "var-fur-ottoman-1200n",
        "label": "1200N Strut Kit (2x Pair)",
        "unit": "Set",
        "price": 13700,
        "mrp": 17500,
        "discountPercent": 22,
        "stock": 18,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 89,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-heavy-duty-ss-closet-rod-36in",
      "prod-fur-hettich-wardrobe-lift-540-690"
    ],
    "unit": "Set"
  },
  {
    "id": "prod-fur-pneumatic-bed-lift-900mm",
    "slug": "pneumatic-lift-heavy-duty-hydraulic-bed-storage-lifter-900mm",
    "name": "Pneumatic Lift Heavy-Duty Hydraulic Bed Storage Lid Lifter 900mm (1 Pair)",
    "title": "Pneumatic Lift — Heavy-Duty Hydraulic Bed Storage Lid Lifter 900mm (1 Pair)",
    "brand": "Pneumatic Lift",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Hydraulic Bed & Wardrobe Lifts",
    "furnitureSubcategory": "BED_WARDROBE_LIFT",
    "fitSpecBadge": "900mm Lift Mechanism · 1 Pair",
    "lengthOrPitchSpec": "900mm Length",
    "loadCapacityLabel": "Heavy-Duty Bed Storage",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Under-Lid Bed Lift",
    "price": 15680,
    "exGstPrice": 13288,
    "mrp": 19800,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "900mm heavy-duty hydraulic bed frame lifter for single and queen box beds",
    "specChips": [
      "900mm Frame Length",
      "Heavy-Duty Lift",
      "1 Pair (Left+Right)",
      "E-Loader Dispatch"
    ],
    "description": "Pneumatic Lift 900mm bed storage mechanism provides sturdy opening assistance for mid-sized storage bed boxes. Constructed from cold-drawn thick gauge steel channels with dual gas damper arms.",
    "highlights": [
      "900mm mechanism frame ideal for 3ft single, 4ft diwan, and 5ft queen storage boxes",
      "Gas dampers absorb closure impact to protect wooden bed edges and laminates",
      "Includes complete mounting hardware and heavy-duty angle brackets",
      "Delivered safely on Lucknow site via E-Loader fleet"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Pneumatic Lift"
      },
      {
        "label": "Frame Length",
        "value": "900 mm"
      },
      {
        "label": "Configuration",
        "value": "1 Pair (Left & Right)"
      },
      {
        "label": "Bed Types",
        "value": "Single, Diwan & Compact Queen"
      },
      {
        "label": "Delivery Mode",
        "value": "E-Loader Only"
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
        "id": "var-fur-pneumatic-900mm",
        "label": "900mm Bed Lift - 1 Pair",
        "unit": "1 Pair (2 Pcs)",
        "price": 15680,
        "mrp": 19800,
        "discountPercent": 21,
        "stock": 14,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 52,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-heavy-duty-ss-closet-rod-36in",
      "prod-fur-hettich-wardrobe-lift-540-690"
    ],
    "unit": "Pair"
  },
  {
    "id": "prod-fur-pneumatic-bed-lift-1500mm",
    "slug": "pneumatic-lift-heavy-duty-hydraulic-bed-lift-kit-1500mm",
    "name": "Pneumatic Lift Heavy-Duty Hydraulic Bed Lift & Gas Strut Kit 1500mm (2 Pcs)",
    "title": "Pneumatic Lift — Heavy-Duty Hydraulic Bed Lift & Gas Strut Kit 1500mm (2 Pcs)",
    "brand": "Pneumatic Lift",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Hydraulic Bed & Wardrobe Lifts",
    "furnitureSubcategory": "BED_WARDROBE_LIFT",
    "fitSpecBadge": "1500mm Lift Mechanism · King Size Bed",
    "lengthOrPitchSpec": "1500mm Length",
    "loadCapacityLabel": "King Size Heavy Lid",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "King Storage Bed Carcass",
    "price": 41570,
    "exGstPrice": 35229,
    "mrp": 52000,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "E-Loader",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "1500mm full-length master king bed storage lift mechanism with dual high-tonnage gas dampers",
    "specChips": [
      "1500mm Master Length",
      "King Size (6×6.5 ft)",
      "High-Tonnage Gas Kit",
      "E-Loader Dispatch"
    ],
    "description": "The ultimate 1500mm full-length hydraulic bed lifter engineered for heavy master bedroom king-size storage beds. Made from 4mm thick structural steel with dual nitrogen gas struts for effortless one-hand lifting.",
    "highlights": [
      "1500mm span lifts 6x6.5 ft king size bed tops with 10-inch heavy latex mattresses",
      "Heavy 4mm cold rolled steel framework prevents lateral frame twisting",
      "Smooth controlled ascent and descent with zero sudden drop hazard",
      "Essential choice for master bedroom modular bed woodwork in Lucknow villas"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Pneumatic Lift"
      },
      {
        "label": "Frame Length",
        "value": "1500 mm (5 feet)"
      },
      {
        "label": "Bed Classification",
        "value": "Master King Size"
      },
      {
        "label": "Kit Contents",
        "value": "2x 1500mm Frame Brackets + 2x Nitrogen Gas Cylinders"
      },
      {
        "label": "Delivery Fleet",
        "value": "E-Loader Truck"
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
        "id": "var-fur-pneumatic-1500mm",
        "label": "1500mm King Lift Kit",
        "unit": "Kit (2 Pcs)",
        "price": 41570,
        "mrp": 52000,
        "discountPercent": 20,
        "stock": 10,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 38,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-heavy-duty-ss-closet-rod-36in",
      "prod-fur-rigwell-closet-rod-850-1150"
    ],
    "unit": "Kit"
  },
  {
    "id": "prod-fur-hettich-wardrobe-lift-540-690",
    "slug": "hettich-hydraulic-pull-down-wardrobe-garment-lift-540-690mm-grey",
    "name": "Hettich Hydraulic Pull-Down Wardrobe Garment Lift 540–690mm (Grey)",
    "title": "Hettich — Hydraulic Pull-Down Wardrobe Garment Lift 540–690mm (Grey)",
    "brand": "Hettich",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Hydraulic Bed & Wardrobe Lifts",
    "furnitureSubcategory": "BED_WARDROBE_LIFT",
    "fitSpecBadge": "540–690mm · 12kg · Hydraulic Drop",
    "lengthOrPitchSpec": "540–690mm Width",
    "loadCapacityLabel": "12kg Garment Load",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Side Wardrobe Wall Mount",
    "price": 3942,
    "exGstPrice": 3341,
    "mrp": 4990,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "",
    "images": [],
    "shortTagline": "Telescopic pull-down wardrobe hanger lift brings high hanging clothes down to eye level",
    "specChips": [
      "540–690mm Width",
      "12kg Capacity",
      "Hydraulic Soft Drop",
      "German Hettich"
    ],
    "description": "Hettich Pull-Down Garment Lift maximizes vertical wardrobe storage right up to ceiling height. Simply pull the ergonomic center handle to bring hanging shirts, suits, and dresses comfortably down to eye level.",
    "highlights": [
      "Adjustable telescopic hanging rail spans internal cabinet widths from 540mm to 690mm",
      "Hydraulic shock absorbing cylinder ensures smooth, controlled drop and return",
      "12kg maximum payload easily supports heavy blazers, coats, and formal wear",
      "Durable powder-coated steel arms with sleek Anthracite Grey accents"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hettich"
      },
      {
        "label": "Internal Width Range",
        "value": "540 mm to 690 mm"
      },
      {
        "label": "Load Capacity",
        "value": "12 kg"
      },
      {
        "label": "Mechanism",
        "value": "Hydraulic Damped Arm"
      },
      {
        "label": "Color",
        "value": "Anthracite Grey"
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
        "id": "var-fur-hettich-lift-540",
        "label": "540–690mm (Grey)",
        "unit": "Set",
        "price": 3942,
        "mrp": 4990,
        "discountPercent": 21,
        "stock": 22,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 114,
    "deliveryEta": "60 Mins",
    "vendor": "Hewett Road / Shivaji Marg Depot",
    "crossSellSkus": [
      "prod-fur-heavy-duty-ss-closet-rod-36in",
      "prod-fur-hw-depot-handle-160mm-zblack"
    ],
    "unit": "Set"
  },
  {
    "id": "prod-fur-rigwell-closet-rod-850-1150",
    "slug": "rigwell-soft-close-pull-down-closet-rod-850-1150mm-15kg-silver",
    "name": "Rigwell Soft Close Pull-Down Closet Rod 850–1150mm (15kg Silver)",
    "title": "Rigwell — Soft Close Pull-Down Closet Rod 850–1150mm (15kg Silver)",
    "brand": "Rigwell",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Hydraulic Bed & Wardrobe Lifts",
    "furnitureSubcategory": "BED_WARDROBE_LIFT",
    "fitSpecBadge": "850–1150mm · 15kg · Soft Close",
    "lengthOrPitchSpec": "850–1150mm Width",
    "loadCapacityLabel": "15kg Load Capacity",
    "closingType": "SOFT_CLOSE",
    "overlayOrMountSpec": "Side Wardrobe Wall Mount",
    "price": 4400,
    "exGstPrice": 3729,
    "mrp": 5600,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Wide-span 850–1150mm heavy-duty pull-down wardrobe rod with soft-closing return",
    "specChips": [
      "850–1150mm Extra Wide",
      "15kg Heavy Load",
      "Soft Return Damper",
      "Silver Chrome"
    ],
    "description": "Rigwell premium pull-down closet lift is designed for wide wardrobe sections between 850mm and 1150mm. Features a heavy-duty hydraulic damper that softly pulls the hanging rail back up without jarring.",
    "highlights": [
      "Extra wide adjustable span from 850mm to 1150mm fits full 3-ft and 4-ft wardrobe carcasses",
      "High 15kg load rating comfortably accommodates up to 35 hung garments",
      "Dual hydraulic dampening cylinders ensure whisper-quiet return to top position",
      "Heavy anodized aluminum rod resists hanger friction scratches and tarnishing"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Rigwell"
      },
      {
        "label": "Width Adjustment",
        "value": "850 mm to 1150 mm"
      },
      {
        "label": "Weight Capacity",
        "value": "15 kg"
      },
      {
        "label": "Finish",
        "value": "Anodized Silver / Chrome"
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
        "id": "var-fur-rigwell-850-1150",
        "label": "850–1150mm (Silver)",
        "unit": "Set",
        "price": 4400,
        "mrp": 5600,
        "discountPercent": 21,
        "stock": 28,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 79,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-heavy-duty-ss-closet-rod-36in",
      "prod-fur-hw-depot-handle-224mm-zblack"
    ],
    "unit": "Set"
  },
  {
    "id": "prod-fur-heavy-duty-ss-closet-rod-36in",
    "slug": "heavy-duty-ss-304-stainless-steel-32mm-closet-rod-flanges-36in-set-of-2",
    "name": "Heavy Duty SS 304 Stainless Steel 32mm Closet Rod w/ Flanges 36 in (Set of 2)",
    "title": "Heavy Duty SS — 304 Stainless Steel 32mm Closet Rod w/ Flanges 36 in (Set of 2)",
    "brand": "Heavy Duty SS",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Wardrobe Pipes & SS 304 Handles",
    "furnitureSubcategory": "PIPE_HANDLE",
    "fitSpecBadge": "32mm Dia · 36 in · SS-304 w/ Flanges",
    "lengthOrPitchSpec": "36 in (915mm)",
    "loadCapacityLabel": "50kg Heavy Load",
    "closingType": "N/A",
    "overlayOrMountSpec": "End Flange Screwed Mount",
    "price": 7431,
    "exGstPrice": 6297,
    "mrp": 9200,
    "discountPercent": 19,
    "gstPercent": 18,
    "hsnCode": "7306",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Solid 32mm AISI-304 heavy-gauge closet hanging rod kit with cast heavy wall flanges",
    "specChips": [
      "32mm Outer Diameter",
      "36 in (915mm)",
      "Pure SS-304 Grade",
      "Set of 2 Rods + 4 Flanges"
    ],
    "description": "Heavy Duty SS 32mm wardrobe pipe kit is manufactured from genuine non-magnetic AISI 304 stainless steel tubing with heavy 1.5mm wall thickness. Zero sag under heavy winter coats; includes 4 solid cast SS-304 end brackets.",
    "highlights": [
      "Solid 32mm diameter with 1.5mm wall thickness guarantees zero deflection over 36 inches",
      "Authentic AISI 304 stainless steel never rusts, pits or peels even in humid bathrooms/closets",
      "Kit includes 2 rods (36 in each) plus 4 heavy-duty cast mounting flanges with SS screws",
      "Easily trimmed with standard hacksaw on site to match custom closet openings"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Heavy Duty SS"
      },
      {
        "label": "Pipe Diameter",
        "value": "32 mm (1-1/4 in)"
      },
      {
        "label": "Length",
        "value": "36 in / 915 mm"
      },
      {
        "label": "Material Grade",
        "value": "AISI 304 Stainless Steel"
      },
      {
        "label": "Quantity",
        "value": "Set of 2 Rods + 4 Flanges"
      },
      {
        "label": "HSN Code",
        "value": "7306"
      },
      {
        "label": "GST Rate",
        "value": "18%"
      }
    ],
    "variants": [
      {
        "id": "var-fur-ss304-pipe-36in",
        "label": "36 in (Set of 2) w/ Flanges",
        "unit": "Set of 2",
        "price": 7431,
        "mrp": 9200,
        "discountPercent": 19,
        "stock": 30,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 95,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-hettich-onsys-0crank-105",
      "prod-fur-hw-depot-handle-160mm-zblack"
    ],
    "unit": "Set"
  },
  {
    "id": "prod-fur-hw-depot-handle-96mm-black",
    "slug": "hardware-depot-luxury-knurled-pvd-cabinet-handle-96mm-ss-304-matte-black-9409",
    "name": "Hardware Depot Luxury Knurled PVD Cabinet Handle 96mm SS-304 (Matte Black, 9409)",
    "title": "Hardware Depot — Luxury Knurled PVD Cabinet Handle 96mm SS-304 (Matte Black, 9409)",
    "brand": "Hardware Depot",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Wardrobe Pipes & SS 304 Handles",
    "furnitureSubcategory": "PIPE_HANDLE",
    "fitSpecBadge": "96mm C.C. · Knurled SS-304 PVD",
    "lengthOrPitchSpec": "96mm C.C. Pitch",
    "loadCapacityLabel": "Solid SS-304 Knurled",
    "closingType": "N/A",
    "overlayOrMountSpec": "Rear Screw Mount (M4)",
    "price": 554,
    "exGstPrice": 469,
    "mrp": 750,
    "discountPercent": 26,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Diamond knurled tactile grip with industrial matte black PVD coating",
    "specChips": [
      "96mm Hole Pitch (C.C.)",
      "Diamond Knurled Grip",
      "SS 304 Solid Core",
      "PVD Matte Black"
    ],
    "description": "Hardware Depot Model 9409 features precision diamond knurling inspired by luxury watch bezels. Machined from solid AISI 304 stainless steel bar stock with ultra-durable Physical Vapor Deposition (PVD) matte black finish.",
    "highlights": [
      "Standard 96mm hole-to-hole center pitch (C.C.) fits standard modular drawer pre-drills",
      "Machined from solid AISI 304 grade stainless steel with substantial hand weight",
      "Diamond cross-knurled pattern provides non-slip grip even with wet kitchen hands",
      "PVD titanium coating provides 10x greater scratch resistance than conventional lacquer"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hardware Depot"
      },
      {
        "label": "Model Number",
        "value": "9409"
      },
      {
        "label": "Center-to-Center Pitch",
        "value": "96 mm"
      },
      {
        "label": "Overall Length",
        "value": "135 mm"
      },
      {
        "label": "Material",
        "value": "Solid AISI 304 Stainless Steel"
      },
      {
        "label": "Finish",
        "value": "PVD Matte Black"
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
        "id": "var-fur-hw-96mm",
        "label": "96mm C.C. - Matte Black",
        "unit": "1 Pc (w/ Screws)",
        "price": 554,
        "mrp": 750,
        "discountPercent": 26,
        "stock": 90,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 142,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-160mm-zblack",
      "prod-fur-hettich-onsys-0crank-105",
      "prod-fur-ebco-stds-i-35-20in"
    ],
    "unit": "Piece"
  },
  {
    "id": "prod-fur-hw-depot-handle-160mm-zblack",
    "slug": "hardware-depot-luxury-pvd-cabinet-handle-160mm-ss-304-z-black-9401",
    "name": "Hardware Depot Luxury PVD Cabinet Handle 160mm SS-304 (Z Black, 9401)",
    "title": "Hardware Depot — Luxury PVD Cabinet Handle 160mm SS-304 (Z Black, 9401)",
    "brand": "Hardware Depot",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Wardrobe Pipes & SS 304 Handles",
    "furnitureSubcategory": "PIPE_HANDLE",
    "fitSpecBadge": "160mm C.C. · SS-304 Z-Black PVD",
    "lengthOrPitchSpec": "160mm C.C. Pitch",
    "loadCapacityLabel": "Solid SS-304 Profile",
    "closingType": "N/A",
    "overlayOrMountSpec": "Rear Screw Mount (M4)",
    "price": 640,
    "exGstPrice": 542,
    "mrp": 860,
    "discountPercent": 26,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "160mm C.C. sleek minimalist bar handle in deep Z-Black PVD finish",
    "specChips": [
      "160mm Hole Pitch (C.C.)",
      "Deep Z-Black Finish",
      "Solid 304 Stainless",
      "Modern Minimalist"
    ],
    "description": "Hardware Depot Model 9401 in 160mm pitch is Lucknow's most specified luxury handle for modular kitchen pot drawers and full-height wardrobe shutters. Solid SS 304 construction with mirror-smooth chamfered edges.",
    "highlights": [
      "Standard 160mm center-to-center hole pitch for versatile horizontal or vertical mounting",
      "Architectural Z-Black PVD coating does not show fingerprints or oil smudges",
      "Forged from solid 304 stainless steel offering heavy, premium ergonomic hand feel",
      "Supplied with both 25mm and 45mm breakaway M4 screws for 18mm or 36mm panel fronts"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hardware Depot"
      },
      {
        "label": "Model Number",
        "value": "9401"
      },
      {
        "label": "Center-to-Center Pitch",
        "value": "160 mm"
      },
      {
        "label": "Overall Length",
        "value": "200 mm"
      },
      {
        "label": "Material",
        "value": "Solid AISI 304 Stainless Steel"
      },
      {
        "label": "Finish",
        "value": "Z-Black PVD"
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
        "id": "var-fur-hw-160mm",
        "label": "160mm C.C. - Z Black",
        "unit": "1 Pc (w/ Screws)",
        "price": 640,
        "mrp": 860,
        "discountPercent": 26,
        "stock": 110,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 198,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-224mm-zblack",
      "prod-fur-hettich-onsys-0crank-105",
      "prod-fur-ebco-stds-i-35-20in"
    ],
    "unit": "Piece"
  },
  {
    "id": "prod-fur-hw-depot-handle-224mm-zblack",
    "slug": "hardware-depot-luxury-pvd-cabinet-handle-224mm-ss-304-z-black-9401",
    "name": "Hardware Depot Luxury PVD Cabinet Handle 224mm SS-304 (Z Black, 9401)",
    "title": "Hardware Depot — Luxury PVD Cabinet Handle 224mm SS-304 (Z Black, 9401)",
    "brand": "Hardware Depot",
    "categorySlug": "furniture-wardrobe-bed-hardware",
    "categoryName": "Furniture, Wardrobe & Bed Hardware",
    "subCategory": "Wardrobe Pipes & SS 304 Handles",
    "furnitureSubcategory": "PIPE_HANDLE",
    "fitSpecBadge": "224mm C.C. · SS-304 Z-Black PVD",
    "lengthOrPitchSpec": "224mm C.C. Pitch",
    "loadCapacityLabel": "Solid SS-304 Profile",
    "closingType": "N/A",
    "overlayOrMountSpec": "Rear Screw Mount (M4)",
    "price": 822,
    "exGstPrice": 697,
    "mrp": 1100,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "",
    "images": [],
    "shortTagline": "Long 224mm C.C. grand pull handle for 7-foot and 8-foot wardrobe shutters",
    "specChips": [
      "224mm Hole Pitch (C.C.)",
      "Grand 270mm Length",
      "Z-Black PVD",
      "Solid SS-304"
    ],
    "description": "Hardware Depot Model 9401 in 224mm pitch offers grand proportions for tall wardrobe doors, large pantry larders, and heavy drawer banks. Solid stainless steel build with sleek Z-Black satin finish.",
    "highlights": [
      "Extended 224mm center pitch provides commanding leverage for full-height wardrobe doors",
      "Manufactured from solid 304 grade stainless steel for lifetime durability without warping",
      "PVD vacuum-bonded black finish will never chip, flake or discolor",
      "Generous 35mm finger projection clearance for comfortable, natural hand grip"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hardware Depot"
      },
      {
        "label": "Model Number",
        "value": "9401"
      },
      {
        "label": "Center-to-Center Pitch",
        "value": "224 mm"
      },
      {
        "label": "Overall Length",
        "value": "270 mm"
      },
      {
        "label": "Projection",
        "value": "35 mm"
      },
      {
        "label": "Material",
        "value": "Solid AISI 304 Stainless Steel"
      },
      {
        "label": "Finish",
        "value": "Z-Black PVD"
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
        "id": "var-fur-hw-224mm",
        "label": "224mm C.C. - Z Black",
        "unit": "1 Pc (w/ Screws)",
        "price": 822,
        "mrp": 1100,
        "discountPercent": 25,
        "stock": 80,
        "image": ""
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 165,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Hub",
    "crossSellSkus": [
      "prod-fur-hw-depot-handle-160mm-zblack",
      "prod-fur-heavy-duty-ss-closet-rod-36in",
      "prod-fur-hettich-onsys-0crank-105"
    ],
    "unit": "Piece"
  }
];
