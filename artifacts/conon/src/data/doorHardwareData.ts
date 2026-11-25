// Master Dataset for Door Hardware & Locks (All 26 Verified Lucknow SKUs)
export interface DoorHardwareProduct {
  id: string;
  slug: string;
  name: string;
  title: string;
  brand: string;
  categorySlug: string;
  categoryName: string;
  subCategory: string;
  doorSubcategory: "SMART_DIGITAL_LOCK" | "MAIN_DOOR_MORTISE_PADLOCK" | "BOLT_ALDROP_STOPPER" | "HINGE_CLOSER_SPRING";
  doorThicknessRangeMm: string;
  operationType: string;
  boltOrLeverCount: string | null;
  weightCapacityKg: number | null;
  materialGrade: string;
  finishColor: string;
  oemModelCode: string | null;
  sellingUnit: string;
  unit: string;
  price: number;
  exGstPrice: number;
  mrp: number;
  discountPercent: number;
  gstPercent: number;
  hsnCode: "8301" | "8302";
  deliveryVehicleType: "2-Wheeler";
  brandTier: 1 | 2 | 3;
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

export const ALL_26_DOOR_HARDWARE_PRODUCTS: DoorHardwareProduct[] = [
  {
    "id": "prod-door-godrej-neo-prime-9686",
    "slug": "godrej-neo-prime-digital-lock-9686-titanium-grey",
    "name": "Godrej — Neo Prime 4-in-1 Digital Lock (9686, Titanium Grey)",
    "title": "Godrej — Neo Prime 4-in-1 Digital Lock (9686, Titanium Grey)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Smart Digital Locks",
    "doorSubcategory": "SMART_DIGITAL_LOCK",
    "doorThicknessRangeMm": "Requires 35–65mm Wooden Door",
    "operationType": "Biometric Fingerprint + PIN + RFID Card + Mechanical Key",
    "boltOrLeverCount": "Deadbolt Mortise with Privacy Latch",
    "weightCapacityKg": null,
    "materialGrade": "Zinc Alloy & Toughened Acrylic",
    "finishColor": "Titanium Grey",
    "oemModelCode": "9686",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 9099,
    "exGstPrice": 7711,
    "mrp": 12500,
    "discountPercent": 27,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-neo-prime-digital-lock-9686-titanium-grey.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-neo-prime-digital-lock-9686-titanium-grey.webp"
    ],
    "shortTagline": "4-in-1 Access · 35–65mm Wooden Door · Auto-Locking Mortise",
    "specChips": [
      "35–65mm Door Fit",
      "Biometric + PIN",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Neo Prime (9686) digital door lock in premium Titanium Grey finish. Features 4 access modes: optical biometric fingerprint recognition, PIN keypad with spy-code scramble, encrypted RFID smart key card, and emergency mechanical key override. Suitable for 35mm to 65mm thick wooden doors.",
    "highlights": [
      "4-in-1 versatile access: Fingerprint, Scramble PIN, RFID Keycard, Manual Override",
      "Auto-locking latchbolt with anti-tamper acoustic alarm and privacy lockout switch",
      "Low-battery warning alert with external 9V jumpstart emergency power port",
      "Precision mortise lock body with hardened anti-cut deadbolt",
      "Lucknow verified stock with 60-minute express courier delivery"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "OEM Model Code",
        "value": "9686"
      },
      {
        "label": "Door Thickness Range",
        "value": "35mm – 65mm Wooden Doors"
      },
      {
        "label": "Access Modes",
        "value": "Biometric, PIN, RFID Card, Manual Key"
      },
      {
        "label": "Finish",
        "value": "Titanium Grey"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-neo-prime",
        "label": "Standard Pack (4-in-1 Access)",
        "unit": "Unit",
        "price": 9099,
        "mrp": 12500,
        "discountPercent": 27,
        "stock": 18,
        "image": "/images/products/door-hardware-locks/godrej-neo-prime-digital-lock-9686-titanium-grey.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 76,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-godrej-hercules-closer-60kg"
    ]
  },
  {
    "id": "prod-door-yale-ydme-50nxt-brown",
    "slug": "yale-ydme-50nxt-biometric-smart-lock-brown",
    "name": "Yale — YDME 50NxT 4-in-1 Biometric Smart Lock (Brown)",
    "title": "Yale — YDME 50NxT 4-in-1 Biometric Smart Lock (Brown)",
    "brand": "Yale",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Smart Digital Locks",
    "doorSubcategory": "SMART_DIGITAL_LOCK",
    "doorThicknessRangeMm": "Requires 35–65mm Wooden Door",
    "operationType": "Biometric Fingerprint + PIN + RFID Card + Mechanical Key",
    "boltOrLeverCount": "Dual Deadbolt Motorized Mortise",
    "weightCapacityKg": null,
    "materialGrade": "High-Grade Zinc Die-Cast",
    "finishColor": "Brown Metallic",
    "oemModelCode": "YDME 50NxT",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 9282,
    "exGstPrice": 7866,
    "mrp": 13999,
    "discountPercent": 34,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/yale-ydme-50nxt-biometric-smart-lock-brown.webp",
    "images": [
      "/images/products/door-hardware-locks/yale-ydme-50nxt-biometric-smart-lock-brown.webp"
    ],
    "shortTagline": "35–65mm Door Fit · 100 Fingerprint Memory · Yale Global Security",
    "specChips": [
      "35–65mm Door Fit",
      "Yale YDME 50NxT",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Yale YDME 50NxT Smart Digital Lock engineered by ASSA ABLOY. Supports 100 fingerprints, 100 RFID cards, and master/user PIN codes. High-durability brown metallic body designed specifically for 35mm to 65mm wooden entrance doors.",
    "highlights": [
      "100 Fingerprint + 100 RFID Card registration with individual delete rights",
      "Scramble code keypad prevents onlooker password theft",
      "Mechanical key override with high-security dimple cylinder",
      "Automatic relocking when door closes; breakout alarm against forced tampering",
      "Express 60-min delivery from Shivaji Marg hardware corridor"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Yale (ASSA ABLOY)"
      },
      {
        "label": "OEM Model Code",
        "value": "YDME 50NxT"
      },
      {
        "label": "Door Thickness Range",
        "value": "35mm – 65mm Wooden Doors"
      },
      {
        "label": "Access Modes",
        "value": "Biometric, PIN, RFID, Key"
      },
      {
        "label": "Finish",
        "value": "Brown Metallic"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-yale-ydme50",
        "label": "Brown Metallic Set",
        "unit": "Unit",
        "price": 9282,
        "mrp": 13999,
        "discountPercent": 34,
        "stock": 14,
        "image": "/images/products/door-hardware-locks/yale-ydme-50nxt-biometric-smart-lock-brown.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 88,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Architectural Hardware Hub",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-dorset-dc60sm-closer"
    ]
  },
  {
    "id": "prod-door-godrej-catus-touch-plus-4200",
    "slug": "godrej-catus-touch-plus-digital-mortise-lock-4200-black",
    "name": "Godrej — Catus Touch Plus 4-in-1 Digital Mortise Lock (4200, Black)",
    "title": "Godrej — Catus Touch Plus 4-in-1 Digital Mortise Lock (4200, Black)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Smart Digital Locks",
    "doorSubcategory": "SMART_DIGITAL_LOCK",
    "doorThicknessRangeMm": "Requires 35–65mm Wooden Door",
    "operationType": "Biometric Fingerprint + PIN + RFID Card + Mechanical Key",
    "boltOrLeverCount": "High Security Multi-Deadbolt Mortise",
    "weightCapacityKg": null,
    "materialGrade": "Aluminium Alloy & Tempered Glass",
    "finishColor": "Matte Black",
    "oemModelCode": "4200",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 10900,
    "exGstPrice": 9237,
    "mrp": 14500,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-catus-touch-plus-digital-mortise-lock-4200-black.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-catus-touch-plus-digital-mortise-lock-4200-black.webp"
    ],
    "shortTagline": "Sleek Matte Black · 35–65mm Door Fit · Multi-Point Deadbolt",
    "specChips": [
      "35–65mm Door Fit",
      "Godrej 4200",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Catus Touch Plus (4200) digital mortise lock with capacitive touchscreen glass keypad. Designed for high-end residential main doors between 35mm and 65mm thickness. Equipped with high-precision optical 360-degree biometric fingerprint scanner.",
    "highlights": [
      "Rapid 0.4s fingerprint authentication with 360-degree recognition",
      "Scratch-resistant tempered touch panel with random virtual security digits",
      "Emergency micro-USB power interface and 4 computer cut brass keys",
      "Passage mode for easy party / gathering access without repeated unlocking",
      "60-min express fulfillment across Gomti Nagar and Central Lucknow"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "OEM Model Code",
        "value": "4200"
      },
      {
        "label": "Door Thickness Range",
        "value": "35mm – 65mm Wooden Doors"
      },
      {
        "label": "Access Modes",
        "value": "Fingerprint, Touch PIN, RFID, Key"
      },
      {
        "label": "Finish",
        "value": "Matte Black"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-catus-4200",
        "label": "Matte Black Set",
        "unit": "Unit",
        "price": 10900,
        "mrp": 14500,
        "discountPercent": 25,
        "stock": 12,
        "image": "/images/products/door-hardware-locks/godrej-catus-touch-plus-digital-mortise-lock-4200-black.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 52,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-godrej-butt-hinge-5in-12g-black",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-godrej-hercules-closer-60kg"
    ]
  },
  {
    "id": "prod-door-godrej-advantis-gsld1-4406",
    "slug": "godrej-advantis-gsld1-7in1-smart-lock-4406-matte-black",
    "name": "Godrej — Advantis GSLD1 7-in-1 Smart Lock (4406, Matte Black)",
    "title": "Godrej — Advantis GSLD1 7-in-1 Smart Lock (4406, Matte Black)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Smart Digital Locks",
    "doorSubcategory": "SMART_DIGITAL_LOCK",
    "doorThicknessRangeMm": "Requires 35–65mm Wooden Door",
    "operationType": "Biometric + PIN + RFID + Bluetooth BLE + Mechanical Key",
    "boltOrLeverCount": "Reinforced Triple Throw Deadbolt",
    "weightCapacityKg": null,
    "materialGrade": "Reinforced Zinc Alloy",
    "finishColor": "Matte Black",
    "oemModelCode": "4406",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 16099,
    "exGstPrice": 13643,
    "mrp": 21500,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-advantis-gsld1-7in1-smart-lock-4406-matte-black.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-advantis-gsld1-7in1-smart-lock-4406-matte-black.webp"
    ],
    "shortTagline": "7-in-1 Access · Bluetooth BLE Mobile App · 35–65mm Door Fit",
    "specChips": [
      "35–65mm Door Fit",
      "Bluetooth App",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Advantis GSLD1 (4406) flagship 7-in-1 connected smart lock. Integrates Bluetooth mobile app unlock, temporary OTP guest pass, 100 fingerprints, keypad PIN, RFID tag, and mechanical key. Fits standard 35mm to 65mm heavy wooden doors.",
    "highlights": [
      "7 access methods including Bluetooth smartphone app and remote OTP creation",
      "Heavy duty triple-deadbolt motorized mortise with high crowbar resistance",
      "Tamper alert siren, wrong code freeze lockout, and internal privacy bolt",
      "Solid zinc alloy unibody construction with matte black electroplated coating",
      "Lucknow verified distributor dispatch in 60 minutes"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "OEM Model Code",
        "value": "4406"
      },
      {
        "label": "Door Thickness Range",
        "value": "35mm – 65mm Wooden Doors"
      },
      {
        "label": "Access Modes",
        "value": "App, Biometric, PIN, RFID, OTP, Key"
      },
      {
        "label": "Finish",
        "value": "Matte Black"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-4406",
        "label": "Advantis GSLD1 Matte Black",
        "unit": "Unit",
        "price": 16099,
        "mrp": 21500,
        "discountPercent": 25,
        "stock": 10,
        "image": "/images/products/door-hardware-locks/godrej-advantis-gsld1-7in1-smart-lock-4406-matte-black.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 64,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-godrej-butt-hinge-5in-12g-black",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-godrej-hercules-closer-60kg"
    ]
  },
  {
    "id": "prod-door-yale-ydr-41a-biometric",
    "slug": "yale-ydr-41a-biometric-smart-lock-double-sliding-doors",
    "name": "Yale — YDR 41A Biometric Smart Lock (Double & Sliding Doors)",
    "title": "Yale — YDR 41A Biometric Smart Lock (Double & Sliding Doors)",
    "brand": "Yale",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Smart Digital Locks",
    "doorSubcategory": "SMART_DIGITAL_LOCK",
    "doorThicknessRangeMm": "Requires 35–65mm Wooden Door",
    "operationType": "Biometric Fingerprint + PIN Code + Smart Key",
    "boltOrLeverCount": "Dual Hook Bolt Rim Lock (Anti-Jemmy)",
    "weightCapacityKg": null,
    "materialGrade": "Die-Cast Zinc Alloy",
    "finishColor": "Matte Black & Chrome",
    "oemModelCode": "YDR 41A",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 34966,
    "exGstPrice": 29632,
    "mrp": 42000,
    "discountPercent": 17,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/yale-ydr-41a-biometric-smart-lock-double-sliding-doors.webp",
    "images": [
      "/images/products/door-hardware-locks/yale-ydr-41a-biometric-smart-lock-double-sliding-doors.webp"
    ],
    "shortTagline": "Dual Interlocking Hook Bolt · Sliding & Double Door Specialist",
    "specChips": [
      "35–65mm Door Fit",
      "Sliding & Double Doors",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Yale YDR 41A specialized biometric smart rim lock engineered with dual interlocking vertical drop hook bolts. Built specifically for sliding doors and double leaf main doors where standard horizontal latchbolts cannot interlock securely.",
    "highlights": [
      "Patented vertical hook bolt clamping mechanism eliminates sliding door levering",
      "One-touch capacitive fingerprint scanner with fast 0.3s unlocking",
      "Voice guided programming assistance in English",
      "Compatible with Yale Access Wi-Fi module for worldwide remote control",
      "Guaranteed authentic Yale ASSA ABLOY warranty and installation support"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Yale (ASSA ABLOY)"
      },
      {
        "label": "OEM Model Code",
        "value": "YDR 41A"
      },
      {
        "label": "Door Thickness Range",
        "value": "35mm – 65mm Doors"
      },
      {
        "label": "Lock Mechanism",
        "value": "Dual Hook Bolt Rim Lock"
      },
      {
        "label": "Finish",
        "value": "Matte Black & Chrome"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-yale-ydr41a",
        "label": "Hook Bolt Sliding Door Set",
        "unit": "Unit",
        "price": 34966,
        "mrp": 42000,
        "discountPercent": 17,
        "stock": 6,
        "image": "/images/products/door-hardware-locks/yale-ydr-41a-biometric-smart-lock-double-sliding-doors.webp"
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 39,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Architectural Hardware Hub",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-falna-pull-handle-ss304"
    ]
  },
  {
    "id": "prod-door-godrej-advantis-iot9",
    "slug": "godrej-advantis-iot9-wifi-nfc-smart-main-door-lock",
    "name": "Godrej — Advantis IoT 9 9-in-1 Wi-Fi/NFC Smart Main Door Lock",
    "title": "Godrej — Advantis IoT 9 9-in-1 Wi-Fi/NFC Smart Main Door Lock",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Smart Digital Locks",
    "doorSubcategory": "SMART_DIGITAL_LOCK",
    "doorThicknessRangeMm": "Requires 35–65mm Wooden Door",
    "operationType": "Wi-Fi Mobile App + Biometric + PIN + NFC + RFID + BLE + Mechanical Key",
    "boltOrLeverCount": "Fully Automatic Motorized Quad Deadbolt",
    "weightCapacityKg": null,
    "materialGrade": "Aerospace Grade Aluminium & Sapphire Glass",
    "finishColor": "Space Black & Rose Gold Accent",
    "oemModelCode": null,
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 43157,
    "exGstPrice": 36574,
    "mrp": 55000,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-advantis-iot9-wifi-nfc-smart-main-door-lock.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-advantis-iot9-wifi-nfc-smart-main-door-lock.webp"
    ],
    "shortTagline": "9-in-1 Ultra-Luxury IoT · Built-in Wi-Fi & NFC · Push-Pull Design",
    "specChips": [
      "35–65mm Door Fit",
      "Built-in Wi-Fi & NFC",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Advantis IoT 9 ultra-luxury smart lock with built-in Wi-Fi (no external gateway needed). Offers 9 access options including smartphone NFC tap, live video entry alert, push-pull ergonomic handle, and fully motorized automatic locking.",
    "highlights": [
      "Direct Wi-Fi pairing connects directly to home router for global remote unlock",
      "Ergonomic push-pull handle unlocks with a single natural motion",
      "Integrated door-bell chime with live visitor photo alert to smartphone",
      "Military grade 128-bit AES encryption across cloud communications",
      "Fast 60-min express fulfillment across all Lucknow VIP pin codes"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "Series",
        "value": "Advantis IoT Flagship"
      },
      {
        "label": "Door Thickness Range",
        "value": "35mm – 65mm Heavy Doors"
      },
      {
        "label": "Connectivity",
        "value": "Direct 2.4GHz Wi-Fi + BLE + NFC"
      },
      {
        "label": "Finish",
        "value": "Space Black & Rose Gold Accent"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-iot9",
        "label": "Push-Pull Wi-Fi Set",
        "unit": "Unit",
        "price": 43157,
        "mrp": 55000,
        "discountPercent": 22,
        "stock": 5,
        "image": "/images/products/door-hardware-locks/godrej-advantis-iot9-wifi-nfc-smart-main-door-lock.webp"
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 31,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-godrej-butt-hinge-5in-12g-black",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-godrej-hercules-closer-60kg"
    ]
  },
  {
    "id": "prod-door-godrej-vertibolt-4291",
    "slug": "godrej-vertibolt-ultra-xl-plus-1ck-rim-lock-4291-satin-nickel",
    "name": "Godrej — Vertibolt Ultra XL+ 1CK Main Door Rim Lock (4291, Satin Nickel)",
    "title": "Godrej — Vertibolt Ultra XL+ 1CK Main Door Rim Lock (4291, Satin Nickel)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits 30–60mm Wooden Door",
    "operationType": "1CK (Key Outside, Knob Inside)",
    "boltOrLeverCount": "2 Vertical Interlocking Deadbolts",
    "weightCapacityKg": null,
    "materialGrade": "High-Grade Steel & Solid Forged Brass",
    "finishColor": "Satin Nickel",
    "oemModelCode": "4291",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 2199,
    "exGstPrice": 1864,
    "mrp": 2800,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-vertibolt-ultra-xl-plus-1ck-rim-lock-4291-satin-nickel.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-vertibolt-ultra-xl-plus-1ck-rim-lock-4291-satin-nickel.webp"
    ],
    "shortTagline": "Dual Vertical Deadbolts · 1CK Key/Knob · Crowbar Resistant",
    "specChips": [
      "30–60mm Door Fit",
      "1CK (Key Outside, Knob Inside)",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Vertibolt Ultra XL+ 1CK (4291) main door lock in Satin Nickel. Features vertical interlocking deadbolts that drop into the striker plate, providing supreme resistance against jemmying and crowbar attacks. Key outside, smooth turn knob inside.",
    "highlights": [
      "Vertical interlocking deadbolt prevents door frame separation by crowbar",
      "Ultra XL+ computerized dimple cylinder with 10 crore non-interchangeable keys",
      "1CK operation: rapid interior egress via knob without searching for keys",
      "Hardened steel drill plate safeguards cylinder mechanism",
      "Lucknow express dispatch in 60 minutes from Latouche Road"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "OEM Model Code",
        "value": "4291"
      },
      {
        "label": "Operation Type",
        "value": "1CK (Key Outside, Knob Inside)"
      },
      {
        "label": "Door Thickness Range",
        "value": "30mm – 60mm Wooden Doors"
      },
      {
        "label": "Finish",
        "value": "Satin Nickel"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-vertibolt",
        "label": "1CK Satin Nickel Set",
        "unit": "Set",
        "price": 2199,
        "mrp": 2800,
        "discountPercent": 21,
        "stock": 45,
        "image": "/images/products/door-hardware-locks/godrej-vertibolt-ultra-xl-plus-1ck-rim-lock-4291-satin-nickel.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 120,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-dorset-dc60sm-closer"
    ]
  },
  {
    "id": "prod-door-godrej-tribolt-1ck-8111",
    "slug": "godrej-ultra-tribolt-1ck-latchbolt-lock-8111-antique-brass",
    "name": "Godrej — Ultra Tribolt 1CK Latchbolt Main Door Lock (8111, Antique Brass)",
    "title": "Godrej — Ultra Tribolt 1CK Latchbolt Main Door Lock (8111, Antique Brass)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits 30–60mm Wooden Door",
    "operationType": "1CK (Key Outside, Knob Inside)",
    "boltOrLeverCount": "3 Solid Brass Deadbolts + 1 Reversible Latch",
    "weightCapacityKg": null,
    "materialGrade": "Solid Extruded Brass & Heavy Steel Body",
    "finishColor": "Antique Brass",
    "oemModelCode": "8111",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 3300,
    "exGstPrice": 2797,
    "mrp": 4150,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-ultra-tribolt-1ck-latchbolt-lock-8111-antique-brass.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-ultra-tribolt-1ck-latchbolt-lock-8111-antique-brass.webp"
    ],
    "shortTagline": "3 Brass Deadbolts + Latch · 1CK Operation · Antique Brass Finish",
    "specChips": [
      "30–60mm Door Fit",
      "1CK (Key Outside, Knob Inside)",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Ultra Tribolt 1CK (8111) classic rim lock in rich Antique Brass finish. Features 3 massive solid brass deadbolts combined with a smooth spring latchbolt for everyday slam shut convenience. Controlled by interior turn knob and exterior computerized dimple key.",
    "highlights": [
      "Triple solid brass deadbolts deliver tremendous shear strength against impact",
      "Built-in spring latchbolt provides instant automatic door latching",
      "Antique Brass electroplated finish matches traditional carved wooden doors",
      "15-year Godrej warranty with 4 factory cut dimple keys",
      "Instant 60-min delivery across Lucknow from Naka Hindola"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "OEM Model Code",
        "value": "8111"
      },
      {
        "label": "Operation Type",
        "value": "1CK (Key Outside, Knob Inside)"
      },
      {
        "label": "Door Thickness Range",
        "value": "30mm – 60mm Wooden Doors"
      },
      {
        "label": "Deadbolts",
        "value": "3 Solid Brass + 1 Latchbolt"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-tribolt-8111",
        "label": "1CK Antique Brass Set",
        "unit": "Set",
        "price": 3300,
        "mrp": 4150,
        "discountPercent": 20,
        "stock": 38,
        "image": "/images/products/door-hardware-locks/godrej-ultra-tribolt-1ck-latchbolt-lock-8111-antique-brass.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 145,
    "deliveryEta": "60 Mins",
    "vendor": "Naka Hindola Hardware Distributors",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-godrej-hercules-closer-60kg"
    ]
  },
  {
    "id": "prod-door-europa-parma-v321",
    "slug": "europa-parma-v321-14pin-3deadbolt-main-door-lock-nickel-steel",
    "name": "Europa — Parma V321 14-Pin 3-Deadbolt Main Door Lock (Nickel Steel)",
    "title": "Europa — Parma V321 14-Pin 3-Deadbolt Main Door Lock (Nickel Steel)",
    "brand": "Europa",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits 30–60mm Wooden Door",
    "operationType": "1CK (Key Outside, Knob Inside)",
    "boltOrLeverCount": "14-Pin Cylinder with 3 Solid Steel Deadbolts",
    "weightCapacityKg": null,
    "materialGrade": "High Tensile Steel Plate & Brass Cylinder",
    "finishColor": "Nickel Steel",
    "oemModelCode": "V321",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 3474,
    "exGstPrice": 2944,
    "mrp": 4350,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/europa-parma-v321-14pin-3deadbolt-main-door-lock-nickel-steel.webp",
    "images": [
      "/images/products/door-hardware-locks/europa-parma-v321-14pin-3deadbolt-main-door-lock-nickel-steel.webp"
    ],
    "shortTagline": "14-Pin Dimple Technology · 3-Deadbolt Rim Lock · ₹3 Lakh Theft Cover",
    "specChips": [
      "30–60mm Door Fit",
      "14-Pin Cylinder",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Europa Parma V321 14-Pin 3-Deadbolt high security main door lock in Nickel Steel finish. Renowned for its anti-pick 14-pin brass cylinder with free-turning deadbolts that resist hacksaw cutting. Covered by Europa's signature theft insurance guarantee.",
    "highlights": [
      "14-Pin high security dimple cylinder with anti-picking mushroom pins",
      "3 solid steel deadbolts with free spinning hardened outer rollers",
      "1CK configuration with knurled interior turn knob for quick egress",
      "Includes 4 dimple keys with individual owner registration card",
      "Express 60-min door delivery from Latouche Road hub"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Europa Locks"
      },
      {
        "label": "OEM Model Code",
        "value": "V321"
      },
      {
        "label": "Operation Type",
        "value": "1CK (Key Outside, Knob Inside)"
      },
      {
        "label": "Door Thickness Range",
        "value": "30mm – 60mm Wooden Doors"
      },
      {
        "label": "Cylinder Pins",
        "value": "14 Anti-Pick Brass Pins"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-europa-v321",
        "label": "Nickel Steel 1CK Set",
        "unit": "Set",
        "price": 3474,
        "mrp": 4350,
        "discountPercent": 20,
        "stock": 26,
        "image": "/images/products/door-hardware-locks/europa-parma-v321-14pin-3deadbolt-main-door-lock-nickel-steel.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 112,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Lock Wholesalers",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-godrej-hercules-closer-60kg"
    ]
  },
  {
    "id": "prod-door-godrej-tribolt-2c-8131",
    "slug": "godrej-ultra-tribolt-2c-pin-cylinder-lock-8131-satin-nickel",
    "name": "Godrej — Ultra Tribolt 2C Pin Cylinder Main Door Lock (8131, Satin Nickel)",
    "title": "Godrej — Ultra Tribolt 2C Pin Cylinder Main Door Lock (8131, Satin Nickel)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits 30–60mm Wooden Door",
    "operationType": "2C (Key Both Sides — Grill-Gate Safe)",
    "boltOrLeverCount": "3 Heavy Brass Deadbolts",
    "weightCapacityKg": null,
    "materialGrade": "Solid Brass Deadbolts & Hardened Steel Plate",
    "finishColor": "Satin Nickel",
    "oemModelCode": "8131",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 3820,
    "exGstPrice": 3237,
    "mrp": 4800,
    "discountPercent": 20,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-ultra-tribolt-2c-pin-cylinder-lock-8131-satin-nickel.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-ultra-tribolt-2c-pin-cylinder-lock-8131-satin-nickel.webp"
    ],
    "shortTagline": "2C Key Inside & Outside · Grill-Gate Safe · Ultra XL+ Technology",
    "specChips": [
      "30–60mm Door Fit",
      "2C (Key Both Sides)",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Ultra Tribolt 2C (8131) in Satin Nickel with key operation on BOTH outside and inside. Essential for safety grill gates and glass doors where an interior knob could be reached through bars. Powered by dual Ultra XL+ dimple cylinders.",
    "highlights": [
      "2C double-cylinder: Key operated from both sides, strictly preventing grill reach-in opening",
      "Triple forged brass deadbolts with 24mm throw for maximum frame penetration",
      "Drill, pick, and crowbar resistant casing with solid strike plate",
      "Supplied with 4 computer-cut reversible dimple keys",
      "Dispatched within 60 minutes from Latouche Road security depot"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "OEM Model Code",
        "value": "8131"
      },
      {
        "label": "Operation Type",
        "value": "2C (Key Both Sides — Grill-Gate Safe)"
      },
      {
        "label": "Door Thickness Range",
        "value": "30mm – 60mm Wooden/Metal Doors"
      },
      {
        "label": "Finish",
        "value": "Satin Nickel"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-tribolt-8131",
        "label": "2C Both Sides Key Set",
        "unit": "Set",
        "price": 3820,
        "mrp": 4800,
        "discountPercent": 20,
        "stock": 30,
        "image": "/images/products/door-hardware-locks/godrej-ultra-tribolt-2c-pin-cylinder-lock-8131-satin-nickel.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 94,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-dorset-dc60sm-closer"
    ]
  },
  {
    "id": "prod-door-godrej-centaur-9143",
    "slug": "godrej-centaur-ultra-xl-plus-dual-motion-lock-9143-satin",
    "name": "Godrej — Centaur Ultra XL+ Dual Motion Double Door Lock (9143, Satin)",
    "title": "Godrej — Centaur Ultra XL+ Dual Motion Double Door Lock (9143, Satin)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits 30–60mm Wooden Door",
    "operationType": "1CK (Key Outside, Knob Inside)",
    "boltOrLeverCount": "Dual-Motion 4 Deadbolts",
    "weightCapacityKg": null,
    "materialGrade": "Forged Brass & Hardened Steel Shell",
    "finishColor": "Satin Nickel",
    "oemModelCode": "9143",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 4010,
    "exGstPrice": 3398,
    "mrp": 5100,
    "discountPercent": 21,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-centaur-ultra-xl-plus-dual-motion-lock-9143-satin.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-centaur-ultra-xl-plus-dual-motion-lock-9143-satin.webp"
    ],
    "shortTagline": "Dual-Motion 4 Deadbolts · Double Leaf Main Door Specialist",
    "specChips": [
      "30–60mm Door Fit",
      "Double Doors",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Centaur Ultra XL+ (9143) heavy-duty dual-motion lock engineered specifically for double leaf main doors. Synchronizes 4 deadbolts that lock simultaneously in opposing directions, firmly anchoring both door leaves together.",
    "highlights": [
      "Dual-motion 4 deadbolts clamp opposing door leaves securely without rebating",
      "Ultra XL+ dimple key cylinder with 100 million non-duplicable combinations",
      "Reinforced steel body prevents pry-bar separation on center meeting stiles",
      "15-year Godrej manufacturer warranty with 4 computer-cut keys",
      "Instant 60-min delivery across all Lucknow zones"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "OEM Model Code",
        "value": "9143"
      },
      {
        "label": "Door Type",
        "value": "Double Leaf Main Wooden Doors"
      },
      {
        "label": "Operation Type",
        "value": "1CK (Key Outside, Knob Inside)"
      },
      {
        "label": "Finish",
        "value": "Satin Nickel"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-centaur",
        "label": "Centaur Double Door Set",
        "unit": "Set",
        "price": 4010,
        "mrp": 5100,
        "discountPercent": 21,
        "stock": 20,
        "image": "/images/products/door-hardware-locks/godrej-centaur-ultra-xl-plus-dual-motion-lock-9143-satin.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 78,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-godrej-hercules-closer-60kg"
    ]
  },
  {
    "id": "prod-door-godrej-stella-180mm",
    "slug": "godrej-stella-180mm-6lever-mortise-door-lock-handle-set-satin",
    "name": "Godrej — Stella 180mm 6-Lever Mortise Door Lock Handle Set (Satin)",
    "title": "Godrej — Stella 180mm 6-Lever Mortise Door Lock Handle Set (Satin)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits 28–45mm Door",
    "operationType": "Double Throw Mortise (Key Both Sides)",
    "boltOrLeverCount": "6 Brass Levers",
    "weightCapacityKg": null,
    "materialGrade": "Virgin Zinc Alloy & Brass Levers",
    "finishColor": "Satin Steel",
    "oemModelCode": null,
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 1577,
    "exGstPrice": 1336,
    "mrp": 2100,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-stella-180mm-6lever-mortise-door-lock-handle-set-satin.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-stella-180mm-6lever-mortise-door-lock-handle-set-satin.webp"
    ],
    "shortTagline": "180mm Curved Handle · 6-Lever Brass Mortise · Bedroom & Balcony",
    "specChips": [
      "28–45mm Door Fit",
      "6-Lever Mortise",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Stella 180mm 6-Lever mortise door handle lockset in durable Satin Steel finish. Ideal for bedroom, study, and interior wooden doors between 28mm and 45mm thickness. Features heavy-duty brass levers and reversible latchbolt.",
    "highlights": [
      "Ergonomic 180mm curved plate handle with smooth spring return mechanism",
      "6-lever brass mortise lock body with double-throw deadbolt for interior security",
      "Reversible latchbolt allows universal installation on left and right opening doors",
      "Tested to over 200,000 handle cycles for lifelong rattle-free operation",
      "Delivered in 60 minutes from Latouche Road hardware district"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "Handle Length",
        "value": "180mm Mortise Plate"
      },
      {
        "label": "Door Thickness Range",
        "value": "28mm – 45mm Doors"
      },
      {
        "label": "Lock Mechanism",
        "value": "6-Lever Double Throw Mortise"
      },
      {
        "label": "Finish",
        "value": "Satin Steel"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-stella",
        "label": "180mm Satin Handle & Lock Set",
        "unit": "Set",
        "price": 1577,
        "mrp": 2100,
        "discountPercent": 25,
        "stock": 50,
        "image": "/images/products/door-hardware-locks/godrej-stella-180mm-6lever-mortise-door-lock-handle-set-satin.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 160,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss"
    ]
  },
  {
    "id": "prod-door-europa-mortise-rose-m516961r692ab",
    "slug": "europa-mortise-rose-handle-combo-set-m516961r692ab-antique-brass",
    "name": "Europa — Mortise Rose Handle Combo Set M516961R692AB (Antique Brass)",
    "title": "Europa — Mortise Rose Handle Combo Set M516961R692AB (Antique Brass)",
    "brand": "Europa",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits 32–45mm Door",
    "operationType": "Pin Cylinder Mortise Set (Key & Knob)",
    "boltOrLeverCount": "60mm Computerised Dimple Pin Cylinder",
    "weightCapacityKg": null,
    "materialGrade": "Forged Zinc Die-Cast & Solid Brass Cylinder",
    "finishColor": "Antique Brass",
    "oemModelCode": "M516961R692AB",
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 1990,
    "exGstPrice": 1686,
    "mrp": 2650,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/europa-mortise-rose-handle-combo-set-m516961r692ab-antique-brass.webp",
    "images": [
      "/images/products/door-hardware-locks/europa-mortise-rose-handle-combo-set-m516961r692ab-antique-brass.webp"
    ],
    "shortTagline": "Designer Round Rose Handle · 60mm Dimple Cylinder · Antique Brass",
    "specChips": [
      "32–45mm Door Fit",
      "Dimple Pin Cylinder",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Europa M516961R692AB designer round rose mortise lock combo in Antique Brass finish. Features independent escutcheon rose plates with heavy-duty solid brass computerized pin cylinder. Perfect for contemporary architectural bedroom and apartment doors.",
    "highlights": [
      "Modern minimalist round rose design with concealed screw fixing plates",
      "60mm Euro profile brass cylinder with computerized dimple keys",
      "Smooth silent sprung lever handle with zero sag guarantee",
      "Heavy brass deadbolt and reversible latch for right/left hand doors",
      "Express 60-min delivery from Aminabad hardware market"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Europa Locks"
      },
      {
        "label": "OEM Model Code",
        "value": "M516961R692AB"
      },
      {
        "label": "Door Thickness Range",
        "value": "32mm – 45mm Doors"
      },
      {
        "label": "Lock Cylinder",
        "value": "60mm Computerized Dimple Cylinder"
      },
      {
        "label": "Finish",
        "value": "Antique Brass"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-europa-rose-ab",
        "label": "Round Rose Set Antique Brass",
        "unit": "Set",
        "price": 1990,
        "mrp": 2650,
        "discountPercent": 25,
        "stock": 22,
        "image": "/images/products/door-hardware-locks/europa-mortise-rose-handle-combo-set-m516961r692ab-antique-brass.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 84,
    "deliveryEta": "60 Mins",
    "vendor": "Aminabad Architectural Hardware Hub",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss"
    ]
  },
  {
    "id": "prod-door-dorset-kaira-10in",
    "slug": "dorset-kaira-10in-mortise-handle-lockset-60mm-key-knob-antique",
    "name": "Dorset — Kaira 10\" Mortise Handle Lockset 60mm Key & Knob (Antique)",
    "title": "Dorset — Kaira 10\" Mortise Handle Lockset 60mm Key & Knob (Antique)",
    "brand": "Dorset",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits 32–45mm Door",
    "operationType": "Key Outside, Thumbturn Knob Inside",
    "boltOrLeverCount": "60mm Euro Profile Brass Pin Cylinder",
    "weightCapacityKg": null,
    "materialGrade": "Virgin Zamak & Extruded Brass Body",
    "finishColor": "Antique Brass",
    "oemModelCode": null,
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 2017,
    "exGstPrice": 1709,
    "mrp": 2690,
    "discountPercent": 25,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/dorset-kaira-10in-mortise-handle-lockset-60mm-key-knob-antique.webp",
    "images": [
      "/images/products/door-hardware-locks/dorset-kaira-10in-mortise-handle-lockset-60mm-key-knob-antique.webp"
    ],
    "shortTagline": "10-Inch Decorative Plate · 60mm Key & Thumbturn · Antique Brass",
    "specChips": [
      "32–45mm Door Fit",
      "10-Inch Handle Plate",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Dorset Kaira 10-inch mortise handle lockset in luxurious Antique Brass finish. Includes full backplate handles, 60mm Euro profile brass cylinder with external computerized keys and internal ergonomic thumbturn knob for seamless room privacy.",
    "highlights": [
      "Grand 10-inch ornate plate handle crafted from high-density virgin Zamak alloy",
      "Brass pin cylinder with thumbturn knob allows instant lock/unlock from inside",
      "Heavy duty 2-stroke mortise lock body with reversible latchbolt",
      "Corrosion-resistant multi-layer lacquer coating withstands humid monsoons",
      "Guaranteed 60-min delivery across all Lucknow neighborhoods"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dorset"
      },
      {
        "label": "Series",
        "value": "Kaira Decorative Collection"
      },
      {
        "label": "Plate Length",
        "value": "10 Inches (250mm)"
      },
      {
        "label": "Door Thickness Range",
        "value": "32mm – 45mm Doors"
      },
      {
        "label": "Finish",
        "value": "Antique Brass"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-dorset-kaira",
        "label": "10-Inch Antique Brass Set",
        "unit": "Set",
        "price": 2017,
        "mrp": 2690,
        "discountPercent": 25,
        "stock": 28,
        "image": "/images/products/door-hardware-locks/dorset-kaira-10in-mortise-handle-lockset-60mm-key-knob-antique.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 95,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Architectural Hardware Hub",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss"
    ]
  },
  {
    "id": "prod-door-godrej-cylindrical-5805",
    "slug": "godrej-cylindrical-door-lock-ss-keyless-60mm-5805",
    "name": "Godrej — Cylindrical Door Lock SS Keyless 60mm Backset (5805)",
    "title": "Godrej — Cylindrical Door Lock SS Keyless 60mm Backset (5805)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits 25–45mm Door",
    "operationType": "Privacy Push-Button Inside, Emergency Coin Slot Outside",
    "boltOrLeverCount": "1 Spring Latchbolt",
    "weightCapacityKg": null,
    "materialGrade": "SS 304 Casing & Brass Retractor",
    "finishColor": "Satin Stainless Steel",
    "oemModelCode": "5805",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 853,
    "exGstPrice": 723,
    "mrp": 1100,
    "discountPercent": 22,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-cylindrical-door-lock-ss-keyless-60mm-5805.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-cylindrical-door-lock-ss-keyless-60mm-5805.webp"
    ],
    "shortTagline": "Bathroom & Toilet Specialist · Push-Button Privacy · Emergency Coin Slot",
    "specChips": [
      "25–45mm Door Fit",
      "Bathroom Privacy",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Cylindrical Door Lock 5805 in Satin Stainless Steel. Designed specifically for bathrooms, restrooms, and privacy doors. Operated by interior push-button with exterior emergency coin slot opening.",
    "highlights": [
      "Keyless push-button privacy lock strictly engineered for bathroom doors",
      "Exterior emergency safety coin turn allows instant rescue in emergencies",
      "SS 304 stainless steel knob and roses provide complete rust immunity",
      "Standard 60mm backset fits pre-bored cylindrical door holes seamlessly",
      "Ready stock in Lucknow with 60-minute express 2-wheeler delivery"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "OEM Model Code",
        "value": "5805"
      },
      {
        "label": "Door Type",
        "value": "Bathroom / Washroom / Privacy Doors"
      },
      {
        "label": "Door Thickness Range",
        "value": "25mm – 45mm Doors"
      },
      {
        "label": "Finish",
        "value": "Satin Stainless Steel"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-5805",
        "label": "Keyless Bathroom Lock Set",
        "unit": "Unit",
        "price": 853,
        "mrp": 1100,
        "discountPercent": 22,
        "stock": 65,
        "image": "/images/products/door-hardware-locks/godrej-cylindrical-door-lock-ss-keyless-60mm-5805.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 140,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper"
    ]
  },
  {
    "id": "prod-door-godrej-navtal-65mm-brass",
    "slug": "godrej-navtal-7lever-65mm-heavy-duty-brass-padlock-4keys",
    "name": "Godrej — Nav-Tal 7-Lever 65mm Heavy Duty Brass Padlock (4 Keys)",
    "title": "Godrej — Nav-Tal 7-Lever 65mm Heavy Duty Brass Padlock (4 Keys)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Main Door Rim Locks, Mortise Sets & Padlocks",
    "doorSubcategory": "MAIN_DOOR_MORTISE_PADLOCK",
    "doorThicknessRangeMm": "Fits Standard 8–14mm Aldrop / Hasp Staples",
    "operationType": "7-Lever Key Unlock (Key Retaining)",
    "boltOrLeverCount": "7 Precision Brass Levers + Hardened Shackle",
    "weightCapacityKg": null,
    "materialGrade": "Solid Forged Brass & Hardened Electroplated Boron Steel Shackle",
    "finishColor": "Polished Golden Brass",
    "oemModelCode": null,
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 800,
    "exGstPrice": 678,
    "mrp": 990,
    "discountPercent": 19,
    "gstPercent": 18,
    "hsnCode": "8301",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-navtal-7lever-65mm-heavy-duty-brass-padlock-4keys.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-navtal-7lever-65mm-heavy-duty-brass-padlock-4keys.webp"
    ],
    "shortTagline": "7 Precision Brass Levers · Hardened Steel Shackle · 4 Keys Included",
    "specChips": [
      "8–14mm Aldrop Fit",
      "7-Lever Brass Nav-Tal",
      "18% GST / HSN 8301",
      "60-Min Bike"
    ],
    "description": "Godrej Nav-Tal 7-Lever 65mm heavy-duty brass padlock. India's most trusted padlock for securing shop rolling shutters, main door aldrops, godowns, and iron gates. Solid forged brass body with hardened steel electroplated shackle.",
    "highlights": [
      "7 precision-machined brass levers provide high resistance to duplicate picking",
      "Hacksaw-resistant case hardened boron steel shackle withstands 3-ton pull loads",
      "Solid forged brass body resists weathering, rust, and acid attacks",
      "Key retaining mechanism ensures padlock is never left unlocked accidentally",
      "Immediate 60-min delivery across all Lucknow districts"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "Model",
        "value": "Nav-Tal 7-Lever (65mm)"
      },
      {
        "label": "Body Material",
        "value": "Solid Forged Brass"
      },
      {
        "label": "Shackle",
        "value": "Hardened Electroplated Steel"
      },
      {
        "label": "Finish",
        "value": "Polished Golden Brass"
      },
      {
        "label": "HSN Code",
        "value": "8301"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-navtal-65",
        "label": "65mm Brass Padlock (4 Keys)",
        "unit": "Unit",
        "price": 800,
        "mrp": 990,
        "discountPercent": 19,
        "stock": 100,
        "image": "/images/products/door-hardware-locks/godrej-navtal-7lever-65mm-heavy-duty-brass-padlock-4keys.webp"
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 320,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-cent-style-aldrop-12in",
      "prod-door-bling-queen-aldrop-12in"
    ]
  },
  {
    "id": "prod-door-cent-style-aldrop-12in",
    "slug": "cent-style-12inch-heavy-duty-ss-aldrop-door-bolt-silver",
    "name": "Cent Style — 12-Inch Heavy-Duty SS Aldrop Door Bolt (Silver)",
    "title": "Cent Style — 12-Inch Heavy-Duty SS Aldrop Door Bolt (Silver)",
    "brand": "Cent Style",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Aldrops, Tower Bolts, Stoppers & Pull Handles",
    "doorSubcategory": "BOLT_ALDROP_STOPPER",
    "doorThicknessRangeMm": "Universal (Through-Bolt Fitting)",
    "operationType": "Sliding Latch with Padlock Hole",
    "boltOrLeverCount": "16mm Solid Stainless Steel Rod",
    "weightCapacityKg": null,
    "materialGrade": "SS 304 Stainless Steel",
    "finishColor": "Satin Silver",
    "oemModelCode": null,
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 1299,
    "exGstPrice": 1101,
    "mrp": 1699,
    "discountPercent": 24,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 3,
    "image": "/images/products/door-hardware-locks/cent-style-12inch-heavy-duty-ss-aldrop-door-bolt-silver.webp",
    "images": [
      "/images/products/door-hardware-locks/cent-style-12inch-heavy-duty-ss-aldrop-door-bolt-silver.webp"
    ],
    "shortTagline": "12-Inch Solid SS Rod · Heavy Through-Bolt Kit · Main Door Security",
    "specChips": [
      "Universal Door Fit",
      "12-Inch Solid SS",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Cent Style 12-inch heavy-duty stainless steel aldrop door kit. Features a thick 16mm solid stainless steel rod with heavy cast brackets and through-bolts for robust main door padlocking. Rust and corrosion proof.",
    "highlights": [
      "12-inch length (300mm) accommodates standard Indian double and single door gaps",
      "Thick 16mm solid SS rod provides exceptional anti-pry security",
      "Complete mounting kit with nuts, bolts, washers, and decorative end caps included",
      "Perfect pairing for Godrej Nav-Tal padlocks on main entrance doors",
      "Dispatched within 60 minutes from Latouche Road hardware district"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Cent Style"
      },
      {
        "label": "Length",
        "value": "12 Inches (300mm)"
      },
      {
        "label": "Rod Thickness",
        "value": "16mm Solid Stainless Steel"
      },
      {
        "label": "Material",
        "value": "SS 304 Grade Stainless Steel"
      },
      {
        "label": "Finish",
        "value": "Satin Silver"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-cent-aldrop-12",
        "label": "12-Inch Full Set with Bolts",
        "unit": "Set",
        "price": 1299,
        "mrp": 1699,
        "discountPercent": 24,
        "stock": 40,
        "image": "/images/products/door-hardware-locks/cent-style-12inch-heavy-duty-ss-aldrop-door-bolt-silver.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 82,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Wholesalers",
    "crossSellSkus": [
      "prod-door-godrej-navtal-65mm-brass",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-hafele-butt-hinge-5x3x3"
    ]
  },
  {
    "id": "prod-door-bling-queen-aldrop-12in",
    "slug": "bling-queen-12inch-heavy-duty-stainless-steel-main-door-aldrop",
    "name": "Bling Queen — 12-Inch Heavy-Duty Stainless Steel Main Door Aldrop",
    "title": "Bling Queen — 12-Inch Heavy-Duty Stainless Steel Main Door Aldrop",
    "brand": "Bling Queen",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Aldrops, Tower Bolts, Stoppers & Pull Handles",
    "doorSubcategory": "BOLT_ALDROP_STOPPER",
    "doorThicknessRangeMm": "Universal (Through-Bolt Fitting)",
    "operationType": "Sliding Bolt with Heavy Drop Handle & Padlock Eye",
    "boltOrLeverCount": "18mm Heavy-Gauge Stainless Steel Rod",
    "weightCapacityKg": null,
    "materialGrade": "Heavy-Gauge Stainless Steel",
    "finishColor": "Matte Brushed Steel",
    "oemModelCode": null,
    "sellingUnit": "Set",
    "unit": "Set",
    "price": 2049,
    "exGstPrice": 1736,
    "mrp": 2699,
    "discountPercent": 24,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 3,
    "image": "/images/products/door-hardware-locks/bling-queen-12inch-heavy-duty-stainless-steel-main-door-aldrop.webp",
    "images": [
      "/images/products/door-hardware-locks/bling-queen-12inch-heavy-duty-stainless-steel-main-door-aldrop.webp"
    ],
    "shortTagline": "18mm Heavy-Gauge SS Rod · Integrated Drop Handle · Premium Matte Finish",
    "specChips": [
      "Universal Door Fit",
      "18mm Heavy Gauge",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Bling Queen 12-inch heavy-gauge luxury stainless steel aldrop bolt. Engineered with an extra-thick 18mm solid rod and heavy-duty drop handle for monumental exterior entrance doors, bungalow gates, and luxury teakwood doors.",
    "highlights": [
      "Ultra-heavy 18mm solid stainless steel rod with integrated ergonomic drop handle",
      "High grade corrosion proof construction withstands direct outdoor weather exposure",
      "Precision CNC machined brackets with concealed bolt covers",
      "Seamless pairing with heavy 7-lever brass and boron padlocks",
      "Express 60-min delivery across Lucknow from Naka Hindola"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Bling Queen"
      },
      {
        "label": "Length",
        "value": "12 Inches (300mm)"
      },
      {
        "label": "Rod Thickness",
        "value": "18mm Extra Heavy Gauge"
      },
      {
        "label": "Material",
        "value": "Stainless Steel SS 304"
      },
      {
        "label": "Finish",
        "value": "Matte Brushed Steel"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-bq-aldrop-12",
        "label": "12-Inch Luxury Heavy Set",
        "unit": "Set",
        "price": 2049,
        "mrp": 2699,
        "discountPercent": 24,
        "stock": 25,
        "image": "/images/products/door-hardware-locks/bling-queen-12inch-heavy-duty-stainless-steel-main-door-aldrop.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 56,
    "deliveryEta": "60 Mins",
    "vendor": "Naka Hindola Hardware Distributors",
    "crossSellSkus": [
      "prod-door-godrej-navtal-65mm-brass",
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-hafele-butt-hinge-5x3x3"
    ]
  },
  {
    "id": "prod-door-apace-tower-bolt-8in-apstb89ss",
    "slug": "apace-apstb89ss-8inch-ss-matte-tower-bolt",
    "name": "Apace — APSTB89SS 8-Inch SS Matte Tower Bolt",
    "title": "Apace — APSTB89SS 8-Inch SS Matte Tower Bolt",
    "brand": "Apace",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Aldrops, Tower Bolts, Stoppers & Pull Handles",
    "doorSubcategory": "BOLT_ALDROP_STOPPER",
    "doorThicknessRangeMm": "Universal Flush / Surface Mount",
    "operationType": "Sliding Shoot Bolt with Knob",
    "boltOrLeverCount": "10mm Solid SS Shoot Bolt",
    "weightCapacityKg": null,
    "materialGrade": "Stainless Steel",
    "finishColor": "Matte Silver",
    "oemModelCode": "APSTB89SS",
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 98,
    "exGstPrice": 83,
    "mrp": 140,
    "discountPercent": 30,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 3,
    "image": "/images/products/door-hardware-locks/apace-apstb89ss-8inch-ss-matte-tower-bolt.webp",
    "images": [
      "/images/products/door-hardware-locks/apace-apstb89ss-8inch-ss-matte-tower-bolt.webp"
    ],
    "shortTagline": "8-Inch Stainless Steel · 10mm Solid Shoot Bolt · Interior Door Security",
    "specChips": [
      "Universal Mount",
      "8-Inch SS 10mm",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Apace APSTB89SS 8-inch stainless steel tower bolt in durable matte finish. Equipped with a 10mm solid shoot bolt and smooth brass spring detent. Standard contractor fitting for interior bedroom, bathroom, and balcony doors.",
    "highlights": [
      "8-inch (200mm) overall body with sturdy 10mm solid stainless steel shoot bolt",
      "Smooth glide track with anti-drop detent knob prevents self-sliding",
      "Surface mountable with standard wood screws on doors and frames",
      "Complete rust-proof stainless steel construction",
      "Immediate 60-min delivery by motorcycle courier in Lucknow"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Apace"
      },
      {
        "label": "OEM Model Code",
        "value": "APSTB89SS"
      },
      {
        "label": "Length",
        "value": "8 Inches (200mm)"
      },
      {
        "label": "Bolt Diameter",
        "value": "10mm Solid SS"
      },
      {
        "label": "Finish",
        "value": "Matte Silver"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-apace-tb-8in",
        "label": "8-Inch Single Piece",
        "unit": "Piece",
        "price": 98,
        "mrp": 140,
        "discountPercent": 30,
        "stock": 120,
        "image": "/images/products/door-hardware-locks/apace-apstb89ss-8inch-ss-matte-tower-bolt.webp"
      }
    ],
    "inStock": true,
    "rating": 4.7,
    "reviewsCount": 180,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Hardware Wholesalers",
    "crossSellSkus": [
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-hafele-butt-hinge-5x3x3"
    ]
  },
  {
    "id": "prod-door-met-craft-magnetic-stopper",
    "slug": "met-craft-ss304-soft-close-magnetic-door-stopper-4-25in-silver",
    "name": "Met Craft — SS 304 Soft-Close Magnetic Door Stopper 4.25 in (Silver)",
    "title": "Met Craft — SS 304 Soft-Close Magnetic Door Stopper 4.25 in (Silver)",
    "brand": "Met Craft",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Aldrops, Tower Bolts, Stoppers & Pull Handles",
    "doorSubcategory": "BOLT_ALDROP_STOPPER",
    "doorThicknessRangeMm": "Universal Floor / Baseboard Mount",
    "operationType": "Spring Damped Magnetic Catch",
    "boltOrLeverCount": "High-Coercivity Neodymium Magnet",
    "weightCapacityKg": null,
    "materialGrade": "SS 304 Stainless Steel & Rubber Damper",
    "finishColor": "Satin Silver",
    "oemModelCode": null,
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 435,
    "exGstPrice": 369,
    "mrp": 600,
    "discountPercent": 28,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 3,
    "image": "/images/products/door-hardware-locks/met-craft-ss304-soft-close-magnetic-door-stopper-4-25in-silver.webp",
    "images": [
      "/images/products/door-hardware-locks/met-craft-ss304-soft-close-magnetic-door-stopper-4-25in-silver.webp"
    ],
    "shortTagline": "SS 304 Body · Soft-Close Spring Damper · Powerful Neodymium Catch",
    "specChips": [
      "Floor / Wall Mount",
      "Neodymium Catch",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Met Craft SS 304 luxury soft-close magnetic door stopper (4.25 in). Features a spring-loaded hydraulic damper inside the magnetic receiver that silently absorbs door slamming impact while the strong neodymium magnet holds the door firmly open.",
    "highlights": [
      "Soft-close internal buffer spring completely prevents door rebound and wall cracking",
      "Powerful neodymium magnetic core holds heavy entrance doors even in windy corridors",
      "100% SS 304 solid stainless steel body with satin brushed corrosion-free surface",
      "Dual mounting options: install on floor tiles or baseboard skirting",
      "60-minute express courier delivery from Shivaji Marg"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Met Craft"
      },
      {
        "label": "Length / Height",
        "value": "4.25 Inches (108mm)"
      },
      {
        "label": "Magnet Type",
        "value": "High-Coercivity Neodymium Magnet"
      },
      {
        "label": "Material",
        "value": "SS 304 Grade Stainless Steel"
      },
      {
        "label": "Finish",
        "value": "Satin Silver"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-mc-stopper",
        "label": "SS 304 Magnetic Stopper",
        "unit": "Piece",
        "price": 435,
        "mrp": 600,
        "discountPercent": 28,
        "stock": 80,
        "image": "/images/products/door-hardware-locks/met-craft-ss304-soft-close-magnetic-door-stopper-4-25in-silver.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 135,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Architectural Hardware Hub",
    "crossSellSkus": [
      "prod-door-apace-tower-bolt-8in-apstb89ss",
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-godrej-hercules-closer-60kg"
    ]
  },
  {
    "id": "prod-door-falna-pull-handle-ss304",
    "slug": "falna-ss-main-door-pull-handle-12-18-inch-ss-304-matte-cp",
    "name": "Falna SS — SS 304 Main Door Pull Handle 12\" / 18\" (Matte/CP)",
    "title": "Falna SS — SS 304 Main Door Pull Handle 12\" / 18\" (Matte/CP)",
    "brand": "Falna SS",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "Aldrops, Tower Bolts, Stoppers & Pull Handles",
    "doorSubcategory": "BOLT_ALDROP_STOPPER",
    "doorThicknessRangeMm": "Fits 30–55mm Doors (Back-to-Back or Through-Bolt)",
    "operationType": "Fixed Rigid Pull",
    "boltOrLeverCount": "25mm Round SS Pipe with Sturdy Bosses",
    "weightCapacityKg": null,
    "materialGrade": "SS 304 Grade Stainless Steel",
    "finishColor": "Dual Tone Matte / Gloss Chrome",
    "oemModelCode": null,
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 500,
    "exGstPrice": 424,
    "mrp": 750,
    "discountPercent": 33,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 3,
    "image": "/images/products/door-hardware-locks/falna-ss-main-door-pull-handle-12-18-inch-ss-304-matte-cp.webp",
    "images": [
      "/images/products/door-hardware-locks/falna-ss-main-door-pull-handle-12-18-inch-ss-304-matte-cp.webp"
    ],
    "shortTagline": "SS 304 Architectural Pull · Dual Tone Finish · Main & Glass Doors",
    "specChips": [
      "30–55mm Doors",
      "SS 304 Dual Tone",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Falna SS heavy-gauge SS 304 architectural door pull handle. Dual-tone polished mirror chrome and matte brushed steel finish. Designed for main entrance wooden doors and commercial glass doors.",
    "highlights": [
      "SS 304 grade stainless steel tubing with zero rust pitting in outdoor conditions",
      "Sturdy 25mm diameter grip with solid CNC machined mounting bosses",
      "Dual tone finish adds a luxury architectural accent to wooden entrance doors",
      "Includes through-bolt installation hardware for doors up to 55mm thickness",
      "Dispatched within 60 minutes from Aminabad hardware market"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Falna SS"
      },
      {
        "label": "Length",
        "value": "12 / 18 Inches"
      },
      {
        "label": "Grip Diameter",
        "value": "25mm Round SS 304 Pipe"
      },
      {
        "label": "Material",
        "value": "SS 304 Stainless Steel"
      },
      {
        "label": "Finish",
        "value": "Dual Tone Matte / Gloss Chrome"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-falna-handle-12",
        "label": "12-Inch Pull Handle",
        "unit": "Piece",
        "price": 500,
        "mrp": 750,
        "discountPercent": 33,
        "stock": 45,
        "image": "/images/products/door-hardware-locks/falna-ss-main-door-pull-handle-12-18-inch-ss-304-matte-cp.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 65,
    "deliveryEta": "60 Mins",
    "vendor": "Aminabad Architectural Hardware Hub",
    "crossSellSkus": [
      "prod-door-godrej-vertibolt-4291",
      "prod-door-godrej-tribolt-1ck-8111",
      "prod-door-hafele-butt-hinge-5x3x3"
    ]
  },
  {
    "id": "prod-door-hafele-butt-hinge-5x3x3",
    "slug": "hafele-ss304-ball-bearing-butt-hinge-5x3x3in-fire-rated",
    "name": "Hafele — SS 304 Ball Bearing Butt Hinge 5×3×3 in (Fire-Rated)",
    "title": "Hafele — SS 304 Ball Bearing Butt Hinge 5×3×3 in (Fire-Rated)",
    "brand": "Hafele",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "SS 304 Hinges, Door Closers & Floor Springs",
    "doorSubcategory": "HINGE_CLOSER_SPRING",
    "doorThicknessRangeMm": "Fits 35–55mm Heavy Wooden / Metal Doors",
    "operationType": "Two Sealed Ball Bearing Heavy Duty Swivel",
    "boltOrLeverCount": "4 Two-Ball Bearings · 3mm Leaf Thickness",
    "weightCapacityKg": 80,
    "materialGrade": "Grade 304 Stainless Steel (Fire-Rated)",
    "finishColor": "Satin Stainless Steel",
    "oemModelCode": null,
    "sellingUnit": "Piece",
    "unit": "Piece",
    "price": 349,
    "exGstPrice": 296,
    "mrp": 480,
    "discountPercent": 27,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "/images/products/door-hardware-locks/hafele-ss304-ball-bearing-butt-hinge-5x3x3in-fire-rated.webp",
    "images": [
      "/images/products/door-hardware-locks/hafele-ss304-ball-bearing-butt-hinge-5x3x3in-fire-rated.webp"
    ],
    "shortTagline": "5×3×3mm Heavy Gauge · SS 304 Fire-Rated · 80kg Door Weight Capacity",
    "specChips": [
      "35–55mm Doors",
      "80kg Door Capacity",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Hafele German engineered SS 304 ball-bearing butt hinge (5 × 3 in × 3mm leaf thickness). Certified for heavy fire doors, main entrance doors, and solid teakwood doors up to 80 kg with smooth friction-free silent swinging.",
    "highlights": [
      "Genuine SS 304 grade stainless steel with high load fatigue certification",
      "3mm heavy gauge leaf thickness prevents sagging on 8ft tall entrance doors",
      "Two permanently lubricated sealed ball bearings ensure whisper quiet action",
      "Tested to over 200,000 opening cycles without hinge pin degradation",
      "Express 60-min delivery by 2-wheeler courier in Lucknow"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Hafele"
      },
      {
        "label": "Dimensions",
        "value": "5 in × 3 in × 3mm (127 × 76 × 3mm)"
      },
      {
        "label": "Weight Capacity",
        "value": "80 kg per 3 Hinges"
      },
      {
        "label": "Material",
        "value": "SS 304 Stainless Steel"
      },
      {
        "label": "Finish",
        "value": "Satin Stainless Steel"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-hafele-hinge-533",
        "label": "Single Hinge 5×3×3mm",
        "unit": "Piece",
        "price": 349,
        "mrp": 480,
        "discountPercent": 27,
        "stock": 150,
        "image": "/images/products/door-hardware-locks/hafele-ss304-ball-bearing-butt-hinge-5x3x3in-fire-rated.webp"
      }
    ],
    "inStock": true,
    "rating": 5,
    "reviewsCount": 110,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Architectural Hardware Hub",
    "crossSellSkus": [
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-godrej-hercules-closer-60kg",
      "prod-door-apace-tower-bolt-8in-apstb89ss"
    ]
  },
  {
    "id": "prod-door-godrej-butt-hinge-5in-12g-black",
    "slug": "godrej-ss304-ball-bearing-butt-hinge-5in-12g-matte-black-2pcs",
    "name": "Godrej — SS 304 Ball Bearing Butt Hinge 5 in × 12G (Matte Black, 2 Pcs)",
    "title": "Godrej — SS 304 Ball Bearing Butt Hinge 5 in × 12G (Matte Black, 2 Pcs)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "SS 304 Hinges, Door Closers & Floor Springs",
    "doorSubcategory": "HINGE_CLOSER_SPRING",
    "doorThicknessRangeMm": "Fits 35–55mm Heavy Doors",
    "operationType": "Four Stainless Steel Ball Bearings (Pair)",
    "boltOrLeverCount": "12 Gauge (2.5mm) Heavy Leaf Pair",
    "weightCapacityKg": 70,
    "materialGrade": "SS 304 Stainless Steel with PVD Coating",
    "finishColor": "Matte Black PVD",
    "oemModelCode": null,
    "sellingUnit": "Pair",
    "unit": "Pair",
    "price": 648,
    "exGstPrice": 549,
    "mrp": 850,
    "discountPercent": 24,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-ss304-ball-bearing-butt-hinge-5in-12g-matte-black-2pcs.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-ss304-ball-bearing-butt-hinge-5in-12g-matte-black-2pcs.webp"
    ],
    "shortTagline": "5-Inch 12-Gauge · Matte Black PVD · 1 Pair (2 Pcs) · 70kg Capacity",
    "specChips": [
      "35–55mm Doors",
      "Matte Black PVD",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Godrej SS 304 ball bearing butt hinge pair (5 in × 12 Gauge) in striking Matte Black PVD finish. Specifically formulated to match modern black digital locks and dark charcoal architectural doors.",
    "highlights": [
      "Advanced PVD (Physical Vapor Deposition) Matte Black coating resists scuffing",
      "SS 304 stainless steel core ensures complete corrosion immunity",
      "Four heavy stainless steel ball bearings per pair for buttery smooth door swing",
      "Supplied as a 1 Pair (2 Pieces) set with color-matched SS screws",
      "Fast 60-min express courier delivery in Lucknow"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "Dimensions",
        "value": "5 Inches × 12 Gauge (127 × 2.5mm)"
      },
      {
        "label": "Pack Contents",
        "value": "1 Pair (2 Pieces) + Screws"
      },
      {
        "label": "Material",
        "value": "SS 304 with PVD Matte Black"
      },
      {
        "label": "Finish",
        "value": "Matte Black PVD"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-hinge-blk",
        "label": "1 Pair (2 Pieces) Matte Black",
        "unit": "Pair",
        "price": 648,
        "mrp": 850,
        "discountPercent": 24,
        "stock": 45,
        "image": "/images/products/door-hardware-locks/godrej-ss304-ball-bearing-butt-hinge-5in-12g-matte-black-2pcs.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 72,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-godrej-catus-touch-plus-4200",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-godrej-hercules-closer-60kg"
    ]
  },
  {
    "id": "prod-door-dorset-dc60sm-closer",
    "slug": "dorset-dc60sm-60kg-overhead-hydraulic-door-closer-satin",
    "name": "Dorset — DC60SM 60 kg Overhead Hydraulic Door Closer (Satin)",
    "title": "Dorset — DC60SM 60 kg Overhead Hydraulic Door Closer (Satin)",
    "brand": "Dorset",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "SS 304 Hinges, Door Closers & Floor Springs",
    "doorSubcategory": "HINGE_CLOSER_SPRING",
    "doorThicknessRangeMm": "Fits up to 950mm Width Doors",
    "operationType": "Rack & Pinion Two-Speed Controlled Hydraulic Closing",
    "boltOrLeverCount": null,
    "weightCapacityKg": 60,
    "materialGrade": "Pressure Die-Cast Aluminium Body",
    "finishColor": "Silver / Satin Metallic",
    "oemModelCode": "DC60SM",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 927,
    "exGstPrice": 786,
    "mrp": 1250,
    "discountPercent": 26,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/dorset-dc60sm-60kg-overhead-hydraulic-door-closer-satin.webp",
    "images": [
      "/images/products/door-hardware-locks/dorset-dc60sm-60kg-overhead-hydraulic-door-closer-satin.webp"
    ],
    "shortTagline": "60kg Capacity · Rack & Pinion Dual Valve · Tested to 5 Lakh Cycles",
    "specChips": [
      "Up to 60kg Doors",
      "Dual Valve Speed Control",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Dorset DC60SM 60kg overhead hydraulic door closer in sleek Silver Metallic finish. High precision rack and pinion mechanism with independent dual valves for regulating closing speed (180°–15°) and latching speed (15°–0°).",
    "highlights": [
      "Engineered for doors weighing up to 60 kg and width up to 950mm",
      "Two independent regulating valves control sweep speed and latching action",
      "Non-handed design fits both left and right hand opening doors",
      "Tested to over 500,000 operating cycles for long maintenance-free service",
      "Instant delivery across Lucknow within 60 minutes"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Dorset"
      },
      {
        "label": "OEM Model Code",
        "value": "DC60SM"
      },
      {
        "label": "Door Weight Capacity",
        "value": "Up to 60 kg"
      },
      {
        "label": "Max Door Width",
        "value": "950 mm"
      },
      {
        "label": "Finish",
        "value": "Silver Metallic"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-dorset-dc60sm",
        "label": "60kg Door Closer Set",
        "unit": "Unit",
        "price": 927,
        "mrp": 1250,
        "discountPercent": 26,
        "stock": 40,
        "image": "/images/products/door-hardware-locks/dorset-dc60sm-60kg-overhead-hydraulic-door-closer-satin.webp"
      }
    ],
    "inStock": true,
    "rating": 4.8,
    "reviewsCount": 96,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Architectural Hardware Hub",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-apace-tower-bolt-8in-apstb89ss"
    ]
  },
  {
    "id": "prod-door-godrej-hercules-closer-60kg",
    "slug": "godrej-hercules-60kg-hydraulic-door-closer-en3-1lakh-cycles",
    "name": "Godrej — Hercules 60 kg Hydraulic Door Closer (EN3, 1 Lakh Cycles)",
    "title": "Godrej — Hercules 60 kg Hydraulic Door Closer (EN3, 1 Lakh Cycles)",
    "brand": "Godrej",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "SS 304 Hinges, Door Closers & Floor Springs",
    "doorSubcategory": "HINGE_CLOSER_SPRING",
    "doorThicknessRangeMm": "Fits up to 950mm Width Doors",
    "operationType": "EN3 Dual Valve Closing & Latching Speed Control",
    "boltOrLeverCount": null,
    "weightCapacityKg": 60,
    "materialGrade": "Forged Aluminium Alloy with Anti-Freeze Hydraulic Oil",
    "finishColor": "Silver Metallic",
    "oemModelCode": null,
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 1299,
    "exGstPrice": 1101,
    "mrp": 1750,
    "discountPercent": 26,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 1,
    "image": "/images/products/door-hardware-locks/godrej-hercules-60kg-hydraulic-door-closer-en3-1lakh-cycles.webp",
    "images": [
      "/images/products/door-hardware-locks/godrej-hercules-60kg-hydraulic-door-closer-en3-1lakh-cycles.webp"
    ],
    "shortTagline": "EN3 Fire-Rated Heavy Closer · 60kg Door Rating · Anti-Freeze Hydraulic Oil",
    "specChips": [
      "Up to 60kg Doors",
      "EN3 Fire-Rated",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Godrej Hercules 60kg hydraulic overhead door closer (EN3 rated). Designed for commercial and high-traffic residential doors. Filled with anti-freeze synthetic hydraulic fluid ensuring smooth closing in both scorching summer heat and cold winter mornings.",
    "highlights": [
      "EN3 fire-rated certified closing power for doors weighing up to 60 kg",
      "Two thermo-constant control valves maintain consistent closing speed across seasons",
      "Universal installation: regular arm, top jamb, or parallel arm mounting",
      "Tested to over 100,000 cycles with zero oil leakage guarantee",
      "Delivered to your jobsite in 60 minutes via 2-wheeler express"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Godrej Locking Solutions"
      },
      {
        "label": "Model",
        "value": "Hercules EN3"
      },
      {
        "label": "Door Weight Capacity",
        "value": "Up to 60 kg"
      },
      {
        "label": "Max Door Width",
        "value": "950 mm"
      },
      {
        "label": "Finish",
        "value": "Silver Metallic"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-godrej-hercules",
        "label": "Hercules 60kg Closer Set",
        "unit": "Unit",
        "price": 1299,
        "mrp": 1750,
        "discountPercent": 26,
        "stock": 35,
        "image": "/images/products/door-hardware-locks/godrej-hercules-60kg-hydraulic-door-closer-en3-1lakh-cycles.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 115,
    "deliveryEta": "60 Mins",
    "vendor": "Latouche Road Godrej Security Depot",
    "crossSellSkus": [
      "prod-door-hafele-butt-hinge-5x3x3",
      "prod-door-met-craft-magnetic-stopper",
      "prod-door-godrej-tribolt-1ck-8111"
    ]
  },
  {
    "id": "prod-door-ozone-fs8400-floor-spring",
    "slug": "ozone-fs8400-80kg-heavy-duty-double-cylinder-floor-spring-en3",
    "name": "Ozone — FS-8400 80 kg Heavy-Duty Double Cylinder Floor Spring (EN3)",
    "title": "Ozone — FS-8400 80 kg Heavy-Duty Double Cylinder Floor Spring (EN3)",
    "brand": "Ozone",
    "categorySlug": "door-hardware-locks",
    "categoryName": "Door Hardware & Locks",
    "subCategory": "SS 304 Hinges, Door Closers & Floor Springs",
    "doorSubcategory": "HINGE_CLOSER_SPRING",
    "doorThicknessRangeMm": "Fits 10–12mm Toughened Glass & 40–55mm Heavy Wooden Doors",
    "operationType": "Double Cylinder 90° Hold-Open Two-Way Swivel",
    "boltOrLeverCount": null,
    "weightCapacityKg": 80,
    "materialGrade": "High-Grade Cast Iron Body with SS 304 Mirror/Satin Cover Plate",
    "finishColor": "SS 304 Satin Cover Plate",
    "oemModelCode": "FS-8400",
    "sellingUnit": "Unit",
    "unit": "Unit",
    "price": 8847,
    "exGstPrice": 7497,
    "mrp": 11500,
    "discountPercent": 23,
    "gstPercent": 18,
    "hsnCode": "8302",
    "deliveryVehicleType": "2-Wheeler",
    "brandTier": 2,
    "image": "/images/products/door-hardware-locks/ozone-fs8400-80kg-heavy-duty-double-cylinder-floor-spring-en3.webp",
    "images": [
      "/images/products/door-hardware-locks/ozone-fs8400-80kg-heavy-duty-double-cylinder-floor-spring-en3.webp"
    ],
    "shortTagline": "80kg Double Cylinder · 90° Hold-Open · Glass & Wooden Doors",
    "specChips": [
      "80kg Door Capacity",
      "Glass & Wood Doors",
      "18% GST / HSN 8302",
      "60-Min Bike"
    ],
    "description": "Ozone FS-8400 architectural double-cylinder floor spring (EN3 rating) with SS 304 satin cover plate. Built for 10-12mm frameless toughened glass doors, heavy wooden entrance doors, and office partition doors up to 80kg weight and 1000mm width.",
    "highlights": [
      "Twin hydraulic cylinders deliver balanced closing torque and smooth two-way swivel",
      "90-degree hold-open detent holds doors open hands-free for foot traffic",
      "Adjustable cement box allows 3-dimensional alignment for perfect door leveling",
      "Corrosion-resistant SS 304 stainless steel top cover plate",
      "Lucknow verified stock with 60-minute dispatch"
    ],
    "specifications": [
      {
        "label": "Brand",
        "value": "Ozone"
      },
      {
        "label": "OEM Model Code",
        "value": "FS-8400"
      },
      {
        "label": "Max Door Weight",
        "value": "80 kg"
      },
      {
        "label": "Max Door Width",
        "value": "1000 mm"
      },
      {
        "label": "Hold Open",
        "value": "90° Hold-Open Detent"
      },
      {
        "label": "HSN Code",
        "value": "8302"
      }
    ],
    "variants": [
      {
        "id": "var-door-ozone-fs8400",
        "label": "80kg Floor Spring Set with Plate",
        "unit": "Unit",
        "price": 8847,
        "mrp": 11500,
        "discountPercent": 23,
        "stock": 15,
        "image": "/images/products/door-hardware-locks/ozone-fs8400-80kg-heavy-duty-double-cylinder-floor-spring-en3.webp"
      }
    ],
    "inStock": true,
    "rating": 4.9,
    "reviewsCount": 48,
    "deliveryEta": "60 Mins",
    "vendor": "Shivaji Marg Architectural Hardware Hub",
    "crossSellSkus": [
      "prod-door-falna-pull-handle-ss304",
      "prod-door-met-craft-magnetic-stopper"
    ]
  }
];
