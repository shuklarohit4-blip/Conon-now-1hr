/**
 * CONON-NOW UNIVERSAL REAL-PHOTO MEDIA RESOLVER
 *
 * Implements the 4-Tier Zero-Placeholder Resolution Engine:
 * - Tier 1: Vendor Custom Uploaded Photo / Exact Verified Real Local URL
 * - Tier 2: Exact Brand + Product-Line Semantic Matcher
 * - Tier 3: All 16 Categories Real-Photo Coverage (Zero Gaps)
 * - Tier 4: Zero-Broken-Image Shield with verified real-photo fallback
 */

import {
  utOpc53, utBuildmore, utWaterplus, utPpc, utSuperOpc,
  imgAccCement, imgAccOpc, imgAccSuraksha, imgAccRhc, imgAccConcretePlus, imgAccGoldWater,
  imgAmbujaCement, imgAmbujaPpc, imgAmbujaKawach, imgAmbujaCoolWalls,
  imgBirlaCement, imgBirlaOpc, imgBirlaUttam, imgBirlaA1, imgBirlaAdvPpc, imgBirlaWhitePutty, imgBirlaLevelplast,
  imgDalmiaCement, imgDalmiaKonark, imgDalmiaOpc, imgDalmiaSrc,
  imgJkCement, imgJkSuperOpc, imgJkLaxmiPpc, imgJkSixerOpc, imgJkSmartcrete, imgJkPutty,
  imgMycemCement, imgMycemOpc43, imgMycemOpc53,
  imgShreeCement, imgPrismCement,
  imgFirstClassBrick, imgFlyAshStandard, imgFlyAshHeavy, imgFlyAshInterlocking,
  imgHalfBlock, imgHollowBlock, imgMagicrete4, imgMagicrete6, imgMagicrete8,
  imgHavellsWire, imgPolycabWire, imgFinolexWire, imgAnchorSwitch, imgLegrandSwitch,
  imgAstralPipe, imgAshirvadPipe, imgSupremePipe, imgJaquarFaucet, imgHindwareEwc,
  imgAsianpaintsBucket, imgBergerBucket, imgNerolacBucket, imgDuluxBucket, imgIndigoBucket,
  imgDrfixitBucket, imgBirlawhitePutty, imgTrucarePutty,
  imgRoffAdhesive, imgFevicolDrum, imgMsealEpoxy, imgInstantGlue,
  imgKajariaTile, imgSomanyTile, imgNitcoVitrified, imgNitcoStep, imgNitcoTerrazzo, imgNitcoItalian,
  imgOrientGvt, imgOrientPgvt, imgOrientWall, imgOrientMosaic,
  imgKajariaVitrified, imgKajariaGvt, imgKajariaPgvt, imgKajariaWall,
  imgMakranaWhite, imgMakranaAlbeta, imgMakranaKumari, imgStatuario, imgCarrara, imgBotticino,
  imgMorwadWhite, imgOnyx, imgBlackGalaxy, imgTanBrown, imgSteelGrey, imgKashmirWhite,
  imgKotaBlue, imgKotaBrown, imgDholpurBeige, imgMintSandstone,
  imgCenturyplyPly, imgGreenplyPly, imgActiontesaMdf, imgGyprocBoard, imgLaminateSheet,
  imgHettichHinge, imgGodrejLock, imgEbcoFitting, imgDorsetHandle, imgStanleyHinge,
  imgKaramHelmet, imgBoschDrill, imgMakitaDrill, imgDewaltGrinder, imgStanleyTape,
  CATEGORY_REAL_FLAGSHIP_MAP,
} from "../data/realMediaRegistry";

export interface MediaResolvableProduct {
  id?: string;
  slug?: string;
  title?: string;
  name?: string;
  brand?: string;
  category?: string;
  categorySlug?: string;
  subcategory?: string;
  materialTag?: string;
  imageUrl?: string;
  image?: string;
  images?: string[];
  [key: string]: any;
}

/**
 * Resolves any product or category to a guaranteed, verified real studio photograph.
 * Never returns an SVG bag, placeholder diagram, cartoon graphic, or empty string.
 */
export function resolveRealProductImage(
  productOrCategory?: MediaResolvableProduct | string | null,
  optTitle?: string,
  optBrand?: string,
  optCategorySlug?: string
): string {
  // Normalize parameters
  let product: MediaResolvableProduct = {};
  let rawCategory = "";
  let rawTitle = optTitle || "";
  let rawBrand = optBrand || "";
  let rawSlug = "";
  let existingUrl = "";

  if (typeof productOrCategory === "string") {
    // Passed as string (could be category name, title, or image URL)
    if (
      productOrCategory.startsWith("/") ||
      productOrCategory.startsWith("http") ||
      productOrCategory.startsWith("data:") ||
      productOrCategory.startsWith("blob:")
    ) {
      existingUrl = productOrCategory;
    } else {
      rawCategory = productOrCategory;
    }
  } else if (productOrCategory && typeof productOrCategory === "object") {
    product = productOrCategory;
    rawTitle = product.title || product.name || optTitle || "";
    rawBrand = product.brand || optBrand || "";
    rawCategory =
      product.categorySlug ||
      product.category ||
      product.materialTag ||
      optCategorySlug ||
      "";
    rawSlug = product.slug || product.id || "";
    existingUrl =
      product.imageUrl ||
      product.image ||
      (Array.isArray(product.images) && product.images.length > 0
        ? product.images[0]
        : "");
  }

  // ── TIER 1: Vendor Custom Uploaded Photo / Exact Verified Real URL ──
  if (existingUrl) {
    // 1. Direct vendor upload in Data-URI or Blob format
    if (existingUrl.startsWith("data:image/") || existingUrl.startsWith("blob:")) {
      return existingUrl;
    }

    // 2. Reject known procedural SVGs or placeholder protocols
    const isSvg = existingUrl.toLowerCase().includes(".svg");
    const isOemProtocol = existingUrl.startsWith("oem://");
    const isPlaceholder =
      existingUrl.includes("placeholder") ||
      existingUrl.includes("via.placeholder") ||
      existingUrl.includes("pending");

    if (!isSvg && !isOemProtocol && !isPlaceholder) {
      if (
        /\.(webp|png|jpe?g)($|\?)/i.test(existingUrl) ||
        existingUrl.includes("@assets/") ||
        existingUrl.startsWith("http")
      ) {
        return existingUrl;
      }
    }
  }

  // ── TIER 2: Exact Brand + Product-Line Semantic Matcher ─────────────
  const title = (rawTitle || "").toLowerCase();
  const brand = (rawBrand || "").toLowerCase();
  const cat = (rawCategory || "").toLowerCase();
  const slug = (rawSlug || "").toLowerCase();
  const text = `${title} ${brand} ${cat} ${slug}`;

  const has = (...words: string[]) => words.some((w) => text.includes(w.toLowerCase()));

  // 1. Cement & White Cement (Real Bag Photography)
  if (has("cement") || cat.includes("cement")) {
    // UltraTech
    if (has("ultratech", "ultra tech")) {
      if (has("weatherplus", "weather plus", "waterplus", "water shield")) return utWaterplus;
      if (has("super", "super opc")) return utSuperOpc;
      if (has("buildmore", "build more")) return utBuildmore;
      if (has("opc 53", "opc-53", "53 grade", "opc")) return utOpc53;
      if (has("ppc")) return utPpc;
      return utWaterplus;
    }
    // ACC
    if (has("acc")) {
      if (has("suraksha")) return imgAccSuraksha;
      if (has("gold water", "water shield")) return imgAccGoldWater;
      if (has("concrete+", "concrete plus", "concrete")) return imgAccConcretePlus;
      if (has("f2r", "rhc", "fast to road")) return imgAccRhc;
      if (has("opc")) return imgAccOpc;
      return imgAccCement;
    }
    // Ambuja
    if (has("ambuja")) {
      if (has("kawach", "kawatch")) return imgAmbujaKawach;
      if (has("cool walls", "cool")) return imgAmbujaCoolWalls;
      if (has("ppc", "plus", "compocem")) return imgAmbujaPpc;
      return imgAmbujaCement;
    }
    // Birla
    if (has("birla", "samrat")) {
      if (has("putty", "wallcare", "white")) return imgBirlaWhitePutty;
      if (has("levelplast", "gypsum", "plaster")) return imgBirlaLevelplast;
      if (has("uttam")) return imgBirlaUttam;
      if (has("a1")) return imgBirlaA1;
      if (has("adv", "advanced")) return imgBirlaAdvPpc;
      if (has("samrat", "opc")) return imgBirlaOpc;
      return imgBirlaCement;
    }
    // Dalmia
    if (has("dalmia")) {
      if (has("dsp")) return imgDalmiaOpc;
      if (has("konark")) return imgDalmiaKonark;
      if (has("src", "infracon")) return imgDalmiaSrc;
      return imgDalmiaCement;
    }
    // JK Cement
    if (has("jk ", "jk-", "j.k", "lakshmi", "sixer", "smartcrete")) {
      if (has("putty", "wall putty")) return imgJkPutty;
      if (has("sixer")) return imgJkSixerOpc;
      if (has("smartcrete")) return imgJkSmartcrete;
      if (has("lakshmi", "laxmi")) return imgJkLaxmiPpc;
      if (has("super opc", "super")) return imgJkSuperOpc;
      return imgJkCement;
    }
    // Mycem
    if (has("mycem", "my cem")) {
      if (has("43")) return imgMycemOpc43;
      if (has("53")) return imgMycemOpc53;
      return imgMycemCement;
    }
    // Shree Cement & Bangur
    if (has("shree", "bangur", "rockstrong")) return imgShreeCement;
    // Prism
    if (has("prism", "champion")) return imgPrismCement;

    // White Cement
    if (has("white")) return imgBirlaWhitePutty;

    return utWaterplus;
  }

  // 2. TMT Steel, Sariya & Binding Wire
  if (has("steel", "sariya", "tmt", "rebar", "wire", "mesh", "binding")) {
    if (has("wire", "binding", "gi", "swg", "gauge")) {
      return "/images/products/steel/gi-binding-wire-18-gauge-25kg.webp";
    }
    if (has("jsw", "neosteel")) {
      if (has("8mm", "8 mm")) return "/images/products/steel/jsw-neosteel-8mm-tmt-fe500d.webp";
      if (has("10mm", "10 mm")) return "/images/products/steel/jsw-neosteel-10mm-tmt-fe500d.webp";
      if (has("16mm", "16 mm")) return "/images/products/steel/jsw-neosteel-16mm-tmt-fe550d.webp";
      if (has("20mm", "20 mm")) return "/images/products/steel/jsw-neosteel-20mm-tmt-fe550d.webp";
      return "/images/products/steel/jsw-neosteel-12mm-tmt-fe500d.webp";
    }
    if (has("jindal", "panther")) {
      if (has("8mm", "8 mm")) return "/images/products/steel/jindal-panther-8mm-tmt-fe500d.webp";
      if (has("10mm", "10 mm")) return "/images/products/steel/jindal-panther-10mm-tmt-fe500d.webp";
      if (has("16mm", "16 mm")) return "/images/products/steel/jindal-panther-16mm-tmt-fe550d.webp";
      return "/images/products/steel/jindal-panther-12mm-tmt-fe550d.webp";
    }
    if (has("kamdhenu")) {
      if (has("8mm", "8 mm")) return "/images/products/steel/kamdhenu-nxt-8mm-tmt-fe500d.webp";
      if (has("10mm", "10 mm")) return "/images/products/steel/kamdhenu-nxt-10mm-tmt-fe500d.webp";
      if (has("16mm", "16 mm")) return "/images/products/steel/kamdhenu-16mm-tmt-fe550d.webp";
      return "/images/products/steel/kamdhenu-nxt-12mm-tmt-fe500d.webp";
    }
    if (has("sail", "seqr")) {
      if (has("8mm", "8 mm")) return "/images/products/steel/sail-seqr-8mm-tmt-fe500.webp";
      if (has("10mm", "10 mm")) return "/images/products/steel/sail-seqr-10mm-tmt-fe500d.webp";
      if (has("16mm", "16 mm")) return "/images/products/steel/sail-seqr-16mm-tmt-fe550d.webp";
      return "/images/products/steel/sail-seqr-12mm-tmt-fe500d.webp";
    }
    // Tata Tiscon / Primary Default
    if (has("8mm", "8 mm")) return "/images/products/steel/tata-tiscon-8mm-tmt-fe500d.webp";
    if (has("10mm", "10 mm")) return "/images/products/steel/tata-tiscon-10mm-tmt-fe500d.webp";
    if (has("16mm", "16 mm")) return "/images/products/steel/tata-tiscon-16mm-tmt-fe550d.webp";
    if (has("20mm", "20 mm")) return "/images/products/steel/tata-tiscon-20mm-tmt-fe550d.webp";
    return "/images/products/steel/tata-tiscon-12mm-tmt-fe500d.webp";
  }

  // 3. Bricks, Sand, Morang & AAC Blocks
  if (has("brick", "eeta", "aac", "block", "morang", "sand", "gitti", "aggregate")) {
    if (has("fly ash", "flyash")) {
      if (has("interlocking")) return imgFlyAshInterlocking;
      if (has("heavy")) return imgFlyAshHeavy;
      return imgFlyAshStandard;
    }
    if (has("aac", "magicrete", "autoclaved")) {
      if (has("8 inch", "8inch", "200mm")) return imgMagicrete8;
      if (has("6 inch", "6inch", "150mm")) return imgMagicrete6;
      if (has("4 inch", "4inch", "100mm")) return imgMagicrete4;
      return imgMagicrete6;
    }
    if (has("half block")) return imgHalfBlock;
    if (has("hollow block")) return imgHollowBlock;
    if (has("morang", "morrum")) return "/images/products/aggregate/river-morang-coarse.webp";
    if (has("gitti", "aggregate", "stone chip", "10mm", "20mm", "40mm")) return "/images/products/aggregate/gitti-20mm-cft.webp";
    if (has("sand", "river sand", "plaster sand", "m-sand")) return "/images/products/sand/screened-river-sand-cft.webp";
    return imgFirstClassBrick;
  }

  // 4. Paints, Putty, Primers & Waterproofing
  if (has("paint", "emulsion", "primer", "putty", "waterproof", "damp", "distemper", "enamel", "varnish")) {
    if (has("putty", "wall putty")) {
      if (has("birla", "wallcare")) return imgBirlawhitePutty;
      if (has("jk")) return imgJkPutty;
      if (has("trucare")) return imgTrucarePutty;
      return imgBirlawhitePutty;
    }
    if (has("dr. fixit", "dr fixit", "fixit", "pidiproof", "urp", "roofseal", "raincoat")) {
      return imgDrfixitBucket;
    }
    if (has("berger", "weathercoat", "silk", "bison")) return imgBergerBucket;
    if (has("nerolac", "impressions", "beauty")) return imgNerolacBucket;
    if (has("dulux", "velvet", "weathershield")) return imgDuluxBucket;
    if (has("indigo")) return imgIndigoBucket;
    return imgAsianpaintsBucket;
  }

  // 5. Adhesives & Sealants (Fevicol, Roff, Epoxy)
  if (has("fevicol", "adhesive", "sealant", "glue", "epoxy", "silicone", "mseal", "probond", "araldite", "dowsil")) {
    if (has("roff", "tile adhesive", "tilefix")) return imgRoffAdhesive;
    if (has("mseal", "m-seal", "epoxy")) return imgMsealEpoxy;
    if (has("instant", "quick", "kwik", "drop")) return imgInstantGlue;
    return imgFevicolDrum;
  }

  // 6. Plywood, Doors, Boards & Laminates
  if (has("plywood", "ply", "mdf", "hdhmr", "board", "door", "laminate", "flush", "veneer", "gyproc")) {
    if (has("action tesa", "tesa", "mdf", "hdhmr", "boilo")) return imgActiontesaMdf;
    if (has("greenply", "green")) return imgGreenplyPly;
    if (has("gyproc", "gypsum")) return imgGyprocBoard;
    if (has("laminate", "mica", "sheet")) return imgLaminateSheet;
    if (has("flush door", "wooden door", "door")) return "/products/door.jpg";
    return imgCenturyplyPly;
  }

  // 7. Hardware, Locks, Hinges & Channels
  if (has("hinge", "channel", "telescopic", "lock", "handle", "fitting", "closer", "dorset", "hettich", "godrej", "ebco")) {
    if (has("godrej", "lock", "padlock", "nav-tal", "mortise")) return imgGodrejLock;
    if (has("dorset", "handle", "pull")) return imgDorsetHandle;
    if (has("ebco")) return imgEbcoFitting;
    if (has("stanley")) return imgStanleyHinge;
    return imgHettichHinge;
  }

  // 8. Electrical, Wires, MCB & Switches
  if (has("wire", "cable", "switch", "socket", "mcb", "rccb", "db", "conduit", "polycab", "havells", "finolex", "anchor", "legrand")) {
    if (has("anchor", "roma", "switch", "socket")) return imgAnchorSwitch;
    if (has("legrand", "myrius")) return imgLegrandSwitch;
    if (has("havells", "flameguard", "lifeline")) return imgHavellsWire;
    if (has("finolex")) return imgFinolexWire;
    if (has("mcb", "distribution", "isolator")) return "/products/mcb.jpg";
    if (has("conduit", "gi box", "metal box")) return "/products/conduit.jpg";
    return imgPolycabWire;
  }

  // 9. Lighting
  if (has("light", "led", "panel", "bulb", "downlight", "spotlight", "strip", "batten")) {
    return "/images/categories/lighting.webp";
  }

  // 10. CPVC Plumbing & Water Tanks
  if (has("cpvc", "upvc", "plumbing", "pipe", "tank", "astral", "ashirvad", "supreme", "sintex")) {
    if (has("tank", "overhead", "sintex")) return "/products/tank.jpg";
    if (has("ashirvad")) return imgAshirvadPipe;
    if (has("supreme")) return imgSupremePipe;
    return imgAstralPipe;
  }

  // 11. Sanitary & Bath Fittings
  if (has("sanitary", "bath", "faucet", "mixer", "shower", "ewc", "toilet", "commode", "basin", "jaquar", "hindware", "cera")) {
    if (has("ewc", "toilet", "commode", "hindware")) return imgHindwareEwc;
    if (has("basin", "sink")) return "/products/basin.jpg";
    return imgJaquarFaucet;
  }

  // 12. Kitchen Sinks & Modular Systems
  if (has("kitchen", "sink", "faucet", "pantry", "tandem", "pullout", "basket")) {
    if (has("modular", "tandem", "pantry", "basket")) {
      return "/images/home-categories/modular-kitchen-systems.webp";
    }
    return imgJaquarFaucet;
  }

  // 13. Tiles & Natural Marble
  if (has("tile", "marble", "granite", "vitrified", "gvt", "pgvt", "kajaria", "somany", "nitco", "orientbell", "makrana", "statuario")) {
    if (has("makrana", "albeta")) return imgMakranaWhite;
    if (has("statuario")) return imgStatuario;
    if (has("black galaxy", "galaxy")) return imgBlackGalaxy;
    if (has("carrara")) return imgCarrara;
    if (has("botticino")) return imgBotticino;
    if (has("tan brown")) return imgTanBrown;
    if (has("steel grey")) return imgSteelGrey;
    if (has("kashmir white")) return imgKashmirWhite;
    if (has("kota")) return imgKotaBlue;
    if (has("somany")) return imgSomanyTile;
    if (has("nitco")) return imgNitcoVitrified;
    if (has("orientbell", "orient")) return imgOrientGvt;
    return imgKajariaVitrified;
  }

  // 14. Power Tools & Site Safety
  if (has("drill", "grinder", "bosch", "makita", "dewalt", "stanley", "tool", "safety", "helmet", "shoe", "harness", "goggle", "vest", "karam")) {
    if (has("helmet", "head")) return imgKaramHelmet;
    if (has("shoe", "boot")) return "/products/safety-shoes.jpg";
    if (has("vest", "jacket")) return "/products/safety-vest.jpg";
    if (has("harness")) return "/products/safety-harness.jpg";
    if (has("goggle", "glass")) return "/products/safety-goggles.jpg";
    if (has("glove")) return "/products/gloves.jpg";
    if (has("makita")) return imgMakitaDrill;
    if (has("dewalt")) return imgDewaltGrinder;
    if (has("stanley", "tape")) return imgStanleyTape;
    return imgBoschDrill;
  }

  // 15. CCTV & Networking
  if (has("cctv", "camera", "nvr", "dvr", "surveillance", "poe", "cat6", "router")) {
    return "/images/home-categories/cctv-networking.webp";
  }

  // 16. Home Appliances
  if (has("fan", "geyser", "heater", "chimney", "inverter", "battery", "pump", "appliance")) {
    if (has("fan", "ceiling")) return "/products/fan.jpg";
    if (has("pump", "motor", "submersible")) return "/products/pump.jpg";
    return "/images/home-categories/home-appliances.webp";
  }

  // ── TIER 3: All 16 Categories Coverage (Zero Gaps) ─────────────────
  const normalizedCategory = cat.replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
  for (const [key, fallbackImg] of Object.entries(CATEGORY_REAL_FLAGSHIP_MAP)) {
    if (normalizedCategory.includes(key) || key.includes(normalizedCategory)) {
      return fallbackImg;
    }
  }

  // ── TIER 4: Zero-Broken-Image Shield ───────────────────────────────
  // Default to clean flagship UltraTech Weather Plus photo (never null / empty / broken SVG)
  return utWaterplus;
}
