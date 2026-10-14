import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Search, Camera, Mic, ShieldCheck, CheckCircle2, Check,
  ChevronLeft, ChevronRight, ChevronDown, Package, Clock, RotateCcw, X,
  Zap, Droplets, Paintbrush, Layers, Wrench,
  HardHat, Hammer, Building2, FlaskConical,
  Grid3x3, Shield, Box, Mountain, Rows3, TreePine, Star,
} from "lucide-react";
import { useLocation } from "wouter";
import type { LucideIcon } from "lucide-react";
import { Layout } from "@/components/Layout";
import { VoiceOrderModal } from "@/components/VoiceOrderModal";
import { IsometricBuilding } from "@/components/IsometricBuilding";
import { OfferBanner } from "@/components/OfferBanner";
import { PromoHero } from "@/components/PromoHero";
import { DiscountBadge, deriveDiscount } from "@/components/DiscountBadge";
import { ProductFeed, DUMMY_PRODUCTS, BUILDER_PICKS } from "@/components/ProductFeed";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { CompactProductCard } from "@/components/CompactProductCard";
import type { Product, ProductSpec } from "@/components/ProductCard";
import { EquipmentRentalSlider } from "@/components/EquipmentRentalSlider";
import PromoCarousel from "@/components/PromoCarousel";
import { FeatureShortcuts } from "@/components/FeatureShortcuts";
import { onImgError } from "@/lib/imgFallback";
import { useGetMaterials, useAddToCart, useUpdateCartItem, useRemoveFromCart, useGetCart, getGetCartQueryKey, GetMaterialsStage } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import utOpc53 from "@assets/ai-image-e0c6d9a8-04e0-48f8-af5a-c9f3095bb39a_1781000536697.png";
import utBuildmore from "@assets/build_more_ppc_1781000550304.png";
import utWaterplus from "@assets/waterplus_1781000563604.png";
import utPpc from "@assets/ppc_1781000586657.png";
import utSuperOpc from "@assets/super_opc_1781000603180.png";
/* Brand-accurate flagship product photos (white-bg studio shots) */
import imgAccCement from "@assets/brands/acc-cement.png";
import imgAmbujaCement from "@assets/brands/ambuja-cement.png";
import imgShreeCement from "@assets/brands/shree-cement.png";
import imgJkCement from "@assets/brands/jk-cement.png";
import imgBirlaCement from "@assets/brands/birla-cement.png";
import imgPrismCement from "@assets/brands/prism-cement.png";
import imgDalmiaCement from "@assets/brands/dalmia-cement.png";
import imgMycemCement from "@assets/brands/mycem-cement.png";
/* Brand-specific cement product photos (real bag shots) */
import imgAccOpc from "@assets/acc_opc_1781691111056.png";
import imgAccSuraksha from "@assets/acc_suraksha_1781691111058.png";
import imgAccRhc from "@assets/acc_rhc_1781691111057.png";
import imgAccConcretePlus from "@assets/acc_concrete+_1781691111055.png";
import imgAccGoldWater from "@assets/acc_gold_water_1781691111056.png";
import imgAmbujaPpc from "@assets/ambuja_ppc_1781691111060.png";
import imgAmbujaKawach from "@assets/ambuja_kawatch_1781691111059.png";
import imgAmbujaCoolWalls from "@assets/ambuja_cool_walls_1781691111059.png";
import imgBirlaOpc from "@assets/birla_opc_1781691111061.png";
import imgBirlaUttam from "@assets/birla_uttam_ppc_1781691111062.png";
import imgBirlaA1 from "@assets/birla_a1_1781691111060.png";
import imgBirlaAdvPpc from "@assets/birla_adv_ppc_1781691111061.png";
import imgDalmiaKonark from "@assets/dalmia_konark_1781691111063.png";
import imgDalmiaOpc from "@assets/dalmia_opc_1781692393719.png";
import imgDalmiaSrc from "@assets/dalmia_src_1781692393720.png";
import imgJkSuperOpc from "@assets/jk_super_opc_1781692393724.png";
import imgJkLaxmiPpc from "@assets/jk_laxmi_ppc_1781692393723.png";
import imgJkSixerOpc from "@assets/jk_laxmi_sixer_opc_1781692393724.png";
import imgJkSmartcrete from "@assets/jk_smartcrete_1781692393724.png";
import imgMycemOpc43 from "@assets/mycem_opc43_1781692393726.png";
import imgMycemOpc53 from "@assets/mycem_opc53_1781692393727.png";
/* Brick & block product photos */
import imgFirstClassBrick from "@assets/first_class_brick_1781692393720.png";
import imgFlyAshStandard from "@assets/fly_ash_brick_standard_1781692393721.png";
import imgFlyAshHeavy from "@assets/fly_ash_heavy_1781692393721.png";
import imgFlyAshInterlocking from "@assets/fly_ash_interlocking_1781692393722.png";
import imgHalfBlock from "@assets/half_block_1781692393722.png";
import imgHollowBlock from "@assets/hollow_b_1781692393723.png";
import imgMagicrete4 from "@assets/magicrete_aac_4_inch_1781692393725.png";
import imgMagicrete6 from "@assets/magicrete_aac_6_inch_1781692393725.png";
import imgMagicrete8 from "@assets/magicrete_aac_8_inch_1781692393726.png";
import imgHavellsWire from "@assets/brands/havells-wire.png";
import imgPolycabWire from "@assets/brands/polycab-wire.png";
import imgFinolexWire from "@assets/brands/finolex-wire.png";
import imgAnchorSwitch from "@assets/brands/anchor-switch.png";
import imgLegrandSwitch from "@assets/brands/legrand-switch.png";
import imgAstralPipe from "@assets/brands/astral-pipe.png";
import imgAshirvadPipe from "@assets/brands/ashirvad-pipe.png";
import imgSupremePipe from "@assets/brands/supreme-pipe.png";
import imgJaquarFaucet from "@assets/brands/jaquar-faucet.png";
import imgHindwareEwc from "@assets/brands/hindware-ewc.png";
import imgAsianpaintsBucket from "@assets/brands/asianpaints-bucket.png";
import imgBergerBucket from "@assets/brands/berger-bucket.png";
import imgNerolacBucket from "@assets/brands/nerolac-bucket.png";
import imgDuluxBucket from "@assets/brands/dulux-bucket.png";
import imgDrfixitBucket from "@assets/brands/drfixit-bucket.png";
import imgBirlawhitePutty from "@assets/brands/birlawhite-putty.png";
import imgKajariaTile from "@assets/brands/kajaria-tile.png";
import imgSomanyTile from "@assets/brands/somany-tile.png";
/* Real brand tile faces (mapped by brand + finish/size to the exact product). */
import imgNitcoVitrified from "@assets/nitco_2ft_1782798518743.png";
import imgNitcoStep from "@assets/nitco_step_riser_1782798533109.png";
import imgNitcoTerrazzo from "@assets/nitco_terrazzo_look_1782798547454.png";
import imgNitcoItalian from "@assets/nitco_italian_marbal_1782798547454.png";
import imgOrientGvt from "@assets/orient_gvt_1782798547455.png";
import imgOrientPgvt from "@assets/orient_pgvt_1782798547455.png";
import imgOrientWall from "@assets/orient_bell_wall_tile_1782798562964.png";
import imgOrientMosaic from "@assets/orient_bell_sheet_1782798562964.png";
import imgKajariaVitrified from "@assets/kajariya_2ft_1782798562965.png";
/* NOTE: the two Kajaria 4×2 files are named opposite to their printed labels —
   the "pGVT" file actually shows GVT, the "GVT" file shows PGVT (Polished). */
import imgKajariaGvt from "@assets/Kajaria_pGVT_4×2_ft_1782798562966.png";
import imgKajariaPgvt from "@assets/Kajaria_GVT_4×2_ft_1782798562967.png";
import imgKajariaWall from "@assets/kajariya_wall_tile_1782798562967.png";
/* Real putty / plaster sacks for the finishing category. */
import imgJkPutty from "@assets/jk_wall_putty_1782798620452.png";
import imgBirlaLevelplast from "@assets/birla_25_kg_1782798620453.png";
import imgBirlaWallPutty from "@assets/birla_white_putty_1782798620454.png";
import imgTrucarePutty from "@assets/ai-image-e6930906-7434-4ddb-a824-439620f96d73_1782798620454.png";
/* Marble & Stone — photoreal slab swatches (Lucknow market demand). */
import imgMakranaWhite from "@assets/generated_images/marble-stone/makrana-white.png";
import imgMakranaAlbeta from "@assets/generated_images/marble-stone/makrana-albeta.png";
import imgMakranaKumari from "@assets/generated_images/marble-stone/makrana-kumari.png";
import imgStatuario from "@assets/generated_images/marble-stone/statuario.png";
import imgCarrara from "@assets/generated_images/marble-stone/carrara.png";
import imgBotticino from "@assets/generated_images/marble-stone/botticino.png";
import imgMorwadWhite from "@assets/generated_images/marble-stone/morwad-white.png";
import imgOnyx from "@assets/generated_images/marble-stone/onyx.png";
import imgBlackGalaxy from "@assets/generated_images/marble-stone/black-galaxy.png";
import imgTanBrown from "@assets/generated_images/marble-stone/tan-brown.png";
import imgSteelGrey from "@assets/generated_images/marble-stone/steel-grey.png";
import imgKashmirWhite from "@assets/generated_images/marble-stone/kashmir-white.png";
import imgKotaBlue from "@assets/generated_images/marble-stone/kota-blue.png";
import imgKotaBrown from "@assets/generated_images/marble-stone/kota-brown.png";
import imgDholpurBeige from "@assets/generated_images/marble-stone/dholpur-beige.png";
import imgMintSandstone from "@assets/generated_images/marble-stone/mint-sandstone.png";
import imgRoffAdhesive from "@assets/brands/roff-adhesive.png";
import imgFevicolDrum from "@assets/brands/fevicol-drum.png";
import imgHettichHinge from "@assets/brands/hettich-hinge.png";
import imgGodrejLock from "@assets/brands/godrej-lock.png";
import imgKaramHelmet from "@assets/brands/karam-helmet.png";
import imgBoschDrill from "@assets/brands/bosch-drill.png";
import imgMakitaDrill from "@assets/brands/makita-drill.png";
import imgDewaltGrinder from "@assets/brands/dewalt-grinder.png";
import imgStanleyTape from "@assets/brands/stanley-tape.png";
import imgCenturyplyPly from "@assets/brands/centuryply-ply.png";
import imgGreenplyPly from "@assets/brands/greenply-ply.png";
import imgActiontesaMdf from "@assets/brands/actiontesa-mdf.png";
import imgGyprocBoard from "@assets/brands/gyproc-board.png";
import imgMsealEpoxy from "@assets/generated_images/products/mseal-epoxy.png";
import imgInstantGlue from "@assets/generated_images/products/instant-glue.png";
import imgEbcoFitting from "@assets/generated_images/products/ebco-fitting.png";
import imgDorsetHandle from "@assets/generated_images/products/dorset-handle.png";
import imgStanleyHinge from "@assets/generated_images/products/stanley-hinge.png";
import imgLaminateSheet from "@assets/generated_images/products/laminate-sheet.png";
import imgIndigoBucket from "@assets/generated_images/products/indigo-bucket.png";

const BRAND_DARK = "#1b4366";
const BLINKIT_GREEN = "#0c831f";

const SPOTLIGHT_STORES: { name: string; tag: string; initials: string; bg: string; rating: string; eta: string }[] = [
  { name: "UltraTech Store",   tag: "Cement & Concrete", initials: "UT", bg: "linear-gradient(135deg,#1b4366,#2a7a3b)", rating: "4.6", eta: "1 hr" },
  { name: "TATA Steel Depot",  tag: "TMT & Structural",  initials: "TS", bg: "linear-gradient(135deg,#0f172a,#334155)", rating: "4.7", eta: "Today" },
  { name: "Asian Paints Hub",  tag: "Paints & Finishes", initials: "AP", bg: "linear-gradient(135deg,#7c2d12,#f59e0b)", rating: "4.5", eta: "1 hr" },
  { name: "Kajaria Tiles",     tag: "Tiles & Sanitary",  initials: "KT", bg: "linear-gradient(135deg,#0c831f,#15803d)", rating: "4.4", eta: "Today" },
  { name: "CONON Brick Yard",  tag: "Bricks & Blocks",   initials: "CB", bg: "linear-gradient(135deg,#9a3412,#c8894a)", rating: "4.3", eta: "Tomorrow" },
];
const BRAND_MID  = "#5c92b1";
const AMBER      = "#f59e0b";
const GREEN      = "#2a7a3b";

/* ── Category config ──────────────────────────────────────────────── */
/* Category → representative LOCAL product photo (bulletproof, no remote deps). */
const PROD_IMG = (slug: string) => `${import.meta.env.BASE_URL}products/${slug}.jpg`;
const CAT_PHOTO = (cat: string) =>
  PROD_IMG(
    (
      {
        cement: "cement-bag", steel: "tmt-bars", sand: "sand", aggregate: "aggregate",
        bricks: "red-brick", electrical: "wire", plumbing: "pipe", paint: "paint-bucket",
        tiles: "floor-tile", finishing: "putty", hardware: "door-hardware", safety: "helmet",
        tools: "drill", shuttering: "scaffolding", wood: "plywood",
      } as Record<string, string>
    )[cat] ?? "cement-bag",
  );

const CAT_CONFIG: Record<string, { icon: LucideIcon; bg: string; iconColor: string; label: string; hinglish: string; emoji: string; image: string }> = {
  cement:     { icon: Mountain,     bg: "#f0f9ff", iconColor: "#c8894a", label: "Cement",       hinglish: "Cement",    emoji: "📦", image: CAT_PHOTO("cement") },
  steel:      { icon: Layers,       bg: "#f0f4f8", iconColor: "#5c7a90", label: "Steel",        hinglish: "Sariya",    emoji: "🏗️", image: CAT_PHOTO("steel") },
  sand:       { icon: FlaskConical, bg: "#fff7ed", iconColor: "#b89a40", label: "Sand",         hinglish: "Baalu",     emoji: "🏖️", image: CAT_PHOTO("sand") },
  aggregate:  { icon: Grid3x3,      bg: "#f5f0ee", iconColor: "#8a6a5a", label: "Aggregate",    hinglish: "Morang",    emoji: "🪨", image: CAT_PHOTO("aggregate") },
  bricks:     { icon: Rows3,        bg: "#fef2f2", iconColor: "#c0703a", label: "Bricks",       hinglish: "Eent",      emoji: "🧱", image: CAT_PHOTO("bricks") },
  electrical: { icon: Zap,          bg: "#ecfdf5", iconColor: "#d4a010", label: "Wires",        hinglish: "Bijli",     emoji: "🔌", image: CAT_PHOTO("electrical") },
  plumbing:   { icon: Droplets,     bg: "#ecfeff", iconColor: "#3a8ab0", label: "Pipes & Bath", hinglish: "Nali",      emoji: "🚰", image: CAT_PHOTO("plumbing") },
  paint:      { icon: Paintbrush,   bg: "#f0fdf4", iconColor: "#d05050", label: "Painting",     hinglish: "Rang",      emoji: "🎨", image: CAT_PHOTO("paint") },
  tiles:      { icon: Grid3x3,      bg: "#fdf2f8", iconColor: "#5060a0", label: "Tiling",       hinglish: "Pathhar",   emoji: "🧱", image: CAT_PHOTO("tiles") },
  "marble-stone": { icon: Mountain, bg: "#f7f5f2", iconColor: "#8a7a5a", label: "Marble & Stone", hinglish: "Marble", emoji: "🪨", image: imgMakranaWhite },
  finishing:  { icon: Building2,    bg: "#eff6ff", iconColor: "#3a8a3a", label: "Finishing",    hinglish: "Finishing", emoji: "🏠", image: CAT_PHOTO("finishing") },
  hardware:   { icon: Hammer,       bg: "#f8fafc", iconColor: "#606070", label: "Hardware",     hinglish: "Saaman",    emoji: "🔩", image: CAT_PHOTO("hardware") },
  safety:     { icon: Shield,       bg: "#fffbeb", iconColor: "#c07a10", label: "Safety",       hinglish: "Suraksha",  emoji: "⛑️", image: CAT_PHOTO("safety") },
  tools:      { icon: Wrench,       bg: "#f5f3ff", iconColor: "#3060a0", label: "Tools",        hinglish: "Aujar",     emoji: "🔧", image: CAT_PHOTO("tools") },
  shuttering: { icon: Box,          bg: "#fef9f0", iconColor: "#8a6030", label: "Shuttering",   hinglish: "Shuttering",emoji: "🪵", image: CAT_PHOTO("shuttering") },
  wood:       { icon: TreePine,    bg: "#fef3e2", iconColor: "#92400e", label: "Wood & Boards",hinglish: "Lakdi",     emoji: "🪵", image: CAT_PHOTO("wood") },
  adhesives:  { icon: Droplets,     bg: "#f5f3ff", iconColor: "#7c3aed", label: "Fevicol & Adhesives", hinglish: "Fevicol", emoji: "🧴", image: imgFevicolDrum },
};

const getCatLabel = (cat: string) =>
  CAT_CONFIG[cat]?.label ?? cat.charAt(0).toUpperCase() + cat.slice(1);

/* ── HomeRun-style category panels ────────────────────────────────────
   Front-end category tiles shown on the home page. Each one maps to one
   underlying DB category so the panel shows real products from materials
   table. The label/image come from this config; the dbCategory drives
   filtering in MaterialList / BrandCatalog.                            */
type HomeRunCat = { slug: string; label: string; image: string; dbCategory: string };
const CAT_LOCAL = (slug: string) => `${import.meta.env.BASE_URL}categories/${slug}.png`;

/* Representative product photos stored locally in /public/products/.
   resolveProductImage() maps any product to the right photo by its category
   + keywords in the name, so every item shows a correct, clean image with no
   broken links. */
const PROD = PROD_IMG;
function resolveProductImage(category: string, name: string): string {
  const n = (name || "").toLowerCase();
  const c = (category || "").toLowerCase();
  const has = (...ws: string[]) => ws.some((w) => n.includes(w));
  switch (c) {
    case "cement":
      if (has("ultratech")) {
        if (has("buildmore", "build more"))      return utBuildmore;
        if (has("weatherplus", "waterplus"))     return utWaterplus;
        if (has("super"))                        return utSuperOpc;
        if (has("opc"))                          return utOpc53;
        if (has("ppc"))                          return utPpc;
      }
      if (has("acc")) {
        if (has("suraksha"))                       return imgAccSuraksha;
        if (has("water shield"))                   return imgAccGoldWater;
        if (has("concrete+", "concrete +", "concrete")) return imgAccConcretePlus;
        if (has("f2r", "fast to road", "rhc"))     return imgAccRhc;
        if (has("gold opc", "opc"))                return imgAccOpc;
        return imgAccCement;
      }
      if (has("ambuja")) {
        if (has("kawach"))               return imgAmbujaKawach;
        if (has("cool walls", "cool"))   return imgAmbujaCoolWalls;
        if (has("plus", "ppc"))          return imgAmbujaPpc;
        return imgAmbujaCement;
      }
      if (has("shree", "bangur"))      return imgShreeCement;
      if (has("jk ", "jk super", "j.k", "jaykay", "lakshmi", "sixer", "smartcrete")) {
        if (has("sixer"))              return imgJkSixerOpc;
        if (has("smartcrete"))         return imgJkSmartcrete;
        if (has("lakshmi"))            return imgJkLaxmiPpc;
        if (has("super opc", "super 53")) return imgJkSuperOpc;
        return imgJkCement;
      }
      if (has("birla", "samrat")) {
        if (has("uttam"))                return imgBirlaUttam;
        if (has("a1"))                   return imgBirlaA1;
        if (has("advanced"))             return imgBirlaAdvPpc;
        if (has("samrat", "opc"))        return imgBirlaOpc;
        return imgBirlaCement;
      }
      if (has("prism"))                return imgPrismCement;
      if (has("dalmia")) {
        if (has("konark"))               return imgDalmiaKonark;
        if (has("dsp"))                  return imgDalmiaOpc;
        if (has("infracon"))             return imgDalmiaSrc;
        return imgDalmiaCement;
      }
      if (has("mycem", "my cem")) {
        if (has("43"))                   return imgMycemOpc43;
        if (has("53"))                   return imgMycemOpc53;
        return imgMycemCement;
      }
      return PROD(has("white") ? "white-cement" : "cement-bag");
    case "steel":
      return PROD(has("binding", "wire", "mesh") ? "binding-wire" : "tmt-bars");
    case "sand":
      return PROD("sand");
    case "aggregate":
      return PROD("aggregate");
    case "bricks":
      if (has("fly ash")) {
        if (has("interlocking")) return imgFlyAshInterlocking;
        if (has("heavy"))        return imgFlyAshHeavy;
        return imgFlyAshStandard;
      }
      if (has("magicrete")) {
        if (has("8 inch", "8inch")) return imgMagicrete8;
        if (has("6 inch", "6inch")) return imgMagicrete6;
        if (has("4 inch", "4inch")) return imgMagicrete4;
        return imgMagicrete6;
      }
      if (has("half block"))   return imgHalfBlock;
      if (has("hollow block")) return imgHollowBlock;
      if (has("first class"))  return imgFirstClassBrick;
      if (has("aac", "hollow block", "solid block", "half block", "block")) return PROD("aac-block");
      return PROD("red-brick");
    case "electrical":
      if (has("led", "bulb", "tube", "panel", "downlight", "flood", "strip", "lamp")) return PROD("light");
      if (has("mcb", "rccb", "rcbo", " db ", "db ", "isolator", "changeover", "distribution", "bus bar", "earth bar", "gland", "spn", "tpn")) return PROD("mcb");
      if (has("conduit", "metal box", "fan box", "junction", "bend", "coupler", "clamp", "saddle", "gang")) return PROD("conduit");
      if (has("earth")) return PROD("earthing");
      if (has("switch", "socket", "plate", "regulator", "usb", "tv socket", "bell push", "data point", "modular")) {
        if (has("legrand", "myrius")) return imgLegrandSwitch;
        if (has("anchor", "roma")) return imgAnchorSwitch;
        return PROD("switch");
      }
      if (has("havells")) return imgHavellsWire;
      if (has("polycab")) return imgPolycabWire;
      if (has("finolex")) return imgFinolexWire;
      return PROD("wire");
    case "plumbing":
      if (has("ewc", "toilet", "commode", "orissa")) {
        if (has("hindware")) return imgHindwareEwc;
        return PROD("toilet");
      }
      if (has("mixer", "cock", "faucet", "diverter", "shower", "health faucet")) {
        if (has("jaquar")) return imgJaquarFaucet;
        return PROD("cp-fitting");
      }
      if (has("counter top basin", "wash basin", "pedestal", "basin")) return PROD("basin");
      if (has("tank")) return PROD("tank");
      if (has("pump")) return PROD("pump");
      if (has("valve", "trap")) return PROD("valve");
      if (has("elbow", "tee", "mta", "fta", "coupler", "fitting")) return PROD("pipe-fittings");
      if (has("solvent", "teflon", "tape", "seal")) return PROD("adhesive");
      if (has("pipe", "cpvc", "upvc", "pvc", "swr", "cutter")) {
        if (has("astral")) return imgAstralPipe;
        if (has("ashirvad")) return imgAshirvadPipe;
        if (has("supreme")) return imgSupremePipe;
        return PROD("pipe");
      }
      if (has("astral")) return imgAstralPipe;
      if (has("ashirvad")) return imgAshirvadPipe;
      if (has("supreme")) return imgSupremePipe;
      return PROD("pipe");
    case "paint":
      if (has("white cement")) return PROD("white-cement");
      if (has("primer", "undercoat", "sealer")) return PROD("primer");
      if (has("putty")) {
        if (has("birla", "wallcare")) return imgBirlawhitePutty;
        return PROD("putty");
      }
      if (has("gypsum", "plaster", "levelplast")) return PROD("pop");
      if (has("damp", "waterproof", "raincoat", "newcoat", "dampguard", "krystalline", "crystalline", "fastflex", "pidicrete")) {
        if (has("fixit", "dr. fixit", "dr fixit")) return imgDrfixitBucket;
        return PROD("waterproofing");
      }
      if (has("roller", "brush", "tray", "masking tape", "sand paper", "blade", "scraper")) return PROD("paint-roller");
      if (has("melamine", "pu ", "polish", "varnish", "duco", "wood finish", "wood coat", "lacquer")) return PROD("wood-finish");
      if (has("gloss", "enamel", "satin", "hi-gloss", "high gloss")) return PROD("paint-gloss");
      if (has("distemper", "utsav", "tractor acrylic")) return PROD("distemper");
      if (has("texture", "textured", "royale play", "stucco", "deco")) return PROD("texture-paint");
      if (has("asian", "royale", "apcolite", "apex", "tractor", "ace ", "premium emulsion", "ultima")) return imgAsianpaintsBucket;
      if (has("berger", "weathercoat", "silk", "easy clean", "rangoli", "bison")) return imgBergerBucket;
      if (has("nerolac", "impressions", "beauty", "excel")) return imgNerolacBucket;
      if (has("dulux", "velvet touch", "weathershield", "promise")) return imgDuluxBucket;
      if (has("indigo", "lamituff")) return imgIndigoBucket;
      return PROD("paint-bucket");
    case "tiles":
      if (has("fevicol")) return imgFevicolDrum;
      if (has("waterproof")) return PROD("waterproofing");
      if (has("spacer", "trowel", "float", "leveling", "clip", "wedge", "hole saw", "tile cutter", "manual tile")) return PROD("tile-tools");
      if (has("cleaner", "sealer", "protector", "tile polish", "stain remover")) return PROD("tile-cleaner");
      if (has("adhesive", "adh", "thin-set", "tilefix", "block grip", "tile fix", "crete", "grip")) {
        if (has("roff")) return imgRoffAdhesive;
        return PROD("tile-adhesive");
      }
      if (has("grout")) {
        if (has("roff")) return imgRoffAdhesive;
        return PROD("tile-adhesive");
      }
      if (has("nitco")) {
        if (has("italian", "marble")) return imgNitcoItalian;
        if (has("terrazzo"))          return imgNitcoTerrazzo;
        if (has("step", "riser"))     return imgNitcoStep;
        return imgNitcoVitrified;
      }
      if (has("orient")) {
        if (has("mosaic"))            return imgOrientMosaic;
        if (has("wall tile"))         return imgOrientWall;
        if (has("parking"))           return PROD("floor-tile");
        if (has("pgvt"))              return imgOrientPgvt;
        return imgOrientGvt;
      }
      if (has("kajaria")) {
        if (has("wall tile"))         return imgKajariaWall;
        if (has("vitrified"))         return imgKajariaVitrified;
        if (has("pgvt"))              return imgKajariaPgvt;
        if (has("gvt"))               return imgKajariaGvt;
        return imgKajariaTile;
      }
      if (has("marble")) return PROD("marble");
      if (has("somany")) return imgSomanyTile;
      return PROD("floor-tile");
    case "marble-stone":
      // Granite
      if (has("black galaxy"))               return imgBlackGalaxy;
      if (has("tan brown"))                  return imgTanBrown;
      if (has("steel grey", "steel gray"))   return imgSteelGrey;
      if (has("kashmir white"))              return imgKashmirWhite;
      // Marble
      if (has("albeta"))                     return imgMakranaAlbeta;
      if (has("kumari"))                     return imgMakranaKumari;
      if (has("makrana"))                    return imgMakranaWhite;
      if (has("statuario"))                  return imgStatuario;
      if (has("carrara"))                    return imgCarrara;
      if (has("botticino"))                  return imgBotticino;
      if (has("morwad", "rajnagar"))         return imgMorwadWhite;
      if (has("onyx"))                       return imgOnyx;
      // Kota & Sandstone
      if (has("dholpur"))                    return imgDholpurBeige;
      if (has("mint"))                       return imgMintSandstone;
      if (has("kota")) {
        if (has("brown"))                    return imgKotaBrown;
        return imgKotaBlue;
      }
      if (has("sandstone"))                  return imgDholpurBeige;
      if (has("granite"))                    return imgSteelGrey;
      return imgMakranaWhite;
    case "finishing":
      if (has("white cement")) return PROD("white-cement");
      if (has("primer")) return PROD("primer");
      if (has("levelplast")) return imgBirlaLevelplast;
      if (has("putty")) {
        if (has("jk")) return imgJkPutty;
        if (has("trucare", "acrylic")) return imgTrucarePutty;
        if (has("birla", "wallcare")) return imgBirlaWallPutty;
        return PROD("putty");
      }
      if (has("door")) return PROD("door");
      if (has("window")) return PROD("window");
      if (has("waterproof")) return PROD("waterproofing");
      if (has("pop", "plaster", "gypsum", "cornice", "medallion")) return PROD("pop");
      if (has("fevicol")) return imgFevicolDrum;
      if (has("m-seal", "mseal", "m seal", "araldite", "epoxy")) return imgMsealEpoxy;
      if (has("crack", "sealant", "adhesive")) return PROD("adhesive");
      return PROD("putty");
    case "adhesives":
      if (has("fevikwik", "fevi kwik", "instant", "super glue", "speedx", "speed x")) return imgInstantGlue;
      if (has("m-seal", "mseal", "m seal", "araldite", "epoxy")) return imgMsealEpoxy;
      if (has("roff", "tilefix", "tile adhesive")) return imgRoffAdhesive;
      if (has("fevicol")) return imgFevicolDrum;
      return imgFevicolDrum;
    case "hardware":
      if (has("hinge")) {
        if (has("hettich")) return imgHettichHinge;
        if (has("stanley")) return imgStanleyHinge;
        if (has("ebco")) return imgEbcoFitting;
        return PROD("door-hardware");
      }
      if (has("channel", "drawer", "tandem", "slide", "telescopic")) {
        if (has("hettich")) return imgHettichHinge;
        if (has("ebco")) return imgEbcoFitting;
        return PROD("drawer-channel");
      }
      if (has("basket", "carousel", "pull-out", "pull out", "pantry", "shoe rack", "trouser", "tie", "belt", "wardrobe lift", "rod", "bracket", "mirror")) {
        if (has("ebco")) return imgEbcoFitting;
        return PROD("kitchen-basket");
      }
      if (has("handle", "lever", "aldrop", "tower bolt", "closer", "door stopper", "floor spring", "patch fitting")) {
        if (has("dorset")) return imgDorsetHandle;
        if (has("stanley")) return imgStanleyHinge;
        if (has("hettich")) return imgHettichHinge;
        return PROD("door-hardware");
      }
      if (has("lock", "deadbolt", "latch", "padlock", "cylinder", "mortise", "rim ", "nav-tal", "night latch")) {
        if (has("godrej")) return imgGodrejLock;
        if (has("dorset")) return imgDorsetHandle;
        return PROD("door-lock");
      }
      if (has("nail", "screw")) return PROD("nails");
      if (has("hettich")) return imgHettichHinge;
      if (has("ebco")) return imgEbcoFitting;
      if (has("dorset")) return imgDorsetHandle;
      if (has("stanley")) return imgStanleyHinge;
      if (has("godrej")) return imgGodrejLock;
      return PROD("door-hardware");
    case "safety":
      if (has("harness")) return PROD("safety-harness");
      if (has("vest")) return PROD("safety-vest");
      if (has("net")) return PROD("safety-net");
      if (has("mask", "respirator")) return PROD("mask");
      if (has("goggle", "glass", "ear plug", "earplug")) return PROD("safety-goggles");
      if (has("glove")) return PROD("gloves");
      if (has("shoe", "boot", "gumboot")) return PROD("safety-shoes");
      if (has("helmet", "hard hat") && has("karam")) return imgKaramHelmet;
      if (has("karam")) return imgKaramHelmet;
      return PROD("helmet");
    case "tools":
      if (has("grinder", "cutter")) {
        if (has("dewalt")) return imgDewaltGrinder;
        return PROD("grinder");
      }
      if (has("jigsaw", "hacksaw", "saw", "planer")) return PROD("saw");
      if (has("tape")) {
        if (has("stanley")) return imgStanleyTape;
        return PROD("measuring-tape");
      }
      if (has("bit")) return PROD("drill-bits");
      if (has("hammer", "screwdriver", "plier", "spanner", "wrench", "level")) return PROD("hand-tools");
      if (has("bosch")) return imgBoschDrill;
      if (has("makita")) return imgMakitaDrill;
      return PROD("drill");
    case "shuttering":
      if (has("oil", "reebol", "separol")) return PROD("paint-bucket");
      if (has("scaffold", "prop", "frame", "cup lock", "clamp", "plate", "channel")) return PROD("scaffolding");
      if (has("centuryply", "century ply")) return imgCenturyplyPly;
      if (has("greenply", "green ply")) return imgGreenplyPly;
      return PROD("plywood");
    case "wood":
      if (has("fevicol")) return imgFevicolDrum;
      if (has("laminate", "sunmica", "merino", "edge band", "edge-band")) return imgLaminateSheet;
      if (has("door")) return PROD("door");
      if (has("polish", "melamine", "lacquer", "duco", "varnish", "pu coat")) return PROD("wood-finish");
      if (has("mdf", "hdf", "particle")) {
        if (has("action tesa", "actiontesa", "action-tesa")) return imgActiontesaMdf;
        return PROD("mdf");
      }
      if (has("gyproc")) return imgGyprocBoard;
      if (has("gypsum", "pop", "cornice", "medallion")) return PROD("pop");
      if (has("jointing", "compound")) return PROD("putty");
      if (has("greenply", "green ply")) return imgGreenplyPly;
      if (has("centuryply", "century ply", "century", "sainik")) return imgCenturyplyPly;
      return PROD("plywood");
    default:
      return PROD("cement-bag");
  }
}
const HOMERUN_CATEGORIES: HomeRunCat[] = [
  { slug: "cement",         label: "Cement",                         image: CAT_LOCAL("cement"),          dbCategory: "cement"     },
  { slug: "steel-bar",      label: "Steel Bar",                      image: CAT_LOCAL("steel-bar"),       dbCategory: "steel"      },
  { slug: "eeta",           label: "Eeta (Bricks)",                  image: CAT_LOCAL("eeta"),            dbCategory: "bricks"     },
  { slug: "morang",         label: "Morang (Aggregate)",             image: CAT_LOCAL("morang"),          dbCategory: "aggregate"  },
  { slug: "tiling",         label: "Tiling",                         image: CAT_LOCAL("tiling"),          dbCategory: "tiles"      },
  { slug: "marble-stone",   label: "Marble & Stone",                 image: imgMakranaWhite,              dbCategory: "marble-stone" },
  { slug: "painting",       label: "Painting",                       image: CAT_LOCAL("painting"),        dbCategory: "paint"      },
  { slug: "waterproofing",  label: "Water Proofing",                 image: CAT_LOCAL("waterproofing"),   dbCategory: "finishing"  },
  { slug: "plywood",        label: "Plywood, MDF & HDHMR",           image: CAT_LOCAL("plywood"),         dbCategory: "wood"       },
  { slug: "fevicol",        label: "Fevicol",                        image: CAT_LOCAL("fevicol"),         dbCategory: "adhesives"  },
  { slug: "wires",          label: "Wires",                          image: CAT_LOCAL("wires"),           dbCategory: "electrical" },
  { slug: "switches",       label: "Switches & Sockets",             image: CAT_LOCAL("switches"),        dbCategory: "electrical" },
  { slug: "hinges",         label: "Hinges, Channels & Handles",     image: CAT_LOCAL("hinges"),          dbCategory: "hardware"   },
  { slug: "kitchen-systems",label: "Kitchen Systems & Accessories",  image: CAT_LOCAL("kitchen-systems"), dbCategory: "hardware"   },
  { slug: "wardrobe",       label: "Wardrobe & Bed Fittings",        image: CAT_LOCAL("wardrobe"),        dbCategory: "hardware"   },
  { slug: "door-locks",     label: "Door Locks & Hardware",          image: CAT_LOCAL("door-locks"),      dbCategory: "hardware"   },
  { slug: "conduits",       label: "Conduits & GI Boxes",            image: CAT_LOCAL("conduits"),        dbCategory: "electrical" },
  { slug: "sanitary",       label: "Sanitary & Bath Fittings",       image: CAT_LOCAL("sanitary"),        dbCategory: "plumbing"   },
  { slug: "lighting",       label: "Lighting",                       image: CAT_LOCAL("lighting"),        dbCategory: "electrical" },
  { slug: "cpvc",           label: "CPVC Pipes & Overhead Tanks",    image: CAT_LOCAL("cpvc"),            dbCategory: "plumbing"   },
  { slug: "kitchen",        label: "Kitchen & Appliances",           image: CAT_LOCAL("kitchen"),         dbCategory: "hardware"   },
  { slug: "home-essentials",label: "Home Essentials",                image: CAT_LOCAL("home-essentials"), dbCategory: "hardware"   },
  { slug: "general",        label: "Tools",                          image: CAT_LOCAL("general"),         dbCategory: "tools"      },
];

/* ── Home category chips (horizontal filter bar) ──────────────────── */
type HomeChip = { label: string; db: string | null; icon: LucideIcon };
const HOME_CHIPS: HomeChip[] = [
  { label: "All",        db: null,         icon: Grid3x3    },
  { label: "Material",   db: "cement",     icon: Building2  },
  { label: "Tools",      db: "tools",      icon: Wrench     },
  { label: "Electrical", db: "electrical", icon: Zap        },
  { label: "Paint",      db: "paint",      icon: Paintbrush },
  { label: "Plumbing",   db: "plumbing",   icon: Droplets   },
  { label: "Tiles",      db: "tiles",      icon: Grid3x3    },
  { label: "Steel",      db: "steel",      icon: Layers     },
  { label: "Hardware",   db: "hardware",   icon: Hammer     },
];

/* ── Frequently-bought bundles & Featured cards (presentational) ───── */
const FREQUENT_BUNDLES = [
  { db: "tools",      label: "Hammer & Chisel",     extra: "+10 more", image: CAT_PHOTO("tools") },
  { db: "paint",      label: "Paint Roller & Brush", extra: "+15 more", image: CAT_PHOTO("paint") },
  { db: "electrical", label: "Wiring Essentials",   extra: "+12 more", image: CAT_PHOTO("electrical") },
  { db: "plumbing",   label: "Bathroom Fittings",   extra: "+9 more",  image: CAT_PHOTO("plumbing") },
];

const FEATURED_CARDS = [
  { db: "cement",     title: "Cement Specials",   sub: "Up to 18% off OPC/PPC", image: CAT_PHOTO("cement"), tint: "#f59e0b" },
  { db: "tools",      title: "Power Tool Deals",  sub: "Drills · Grinders · Saws", image: CAT_PHOTO("tools"), tint: "#1b4366" },
  { db: "electrical", title: "Electrical Fittings", sub: "Switches · Wires · MCBs", image: CAT_PHOTO("electrical"), tint: "#2a7a3b" },
];

/* ── AR Material Drop overlay ─────────────────────────────────────── */
/** Compute material requirements for a single wall.
 *  - Bricks: ~10 standard bricks per sq.ft (9"×4.5"×3" with ~10mm mortar)
 *  - Cement: ~0.05 bag per sq.ft for 12mm plaster (1:6) on both sides averaged
 *  - Sand:   ~0.30 cu.ft per sq.ft of brickwork & plaster
 */
function computeWallEstimate(widthFt: number, heightFt: number) {
  const area = Math.max(0, widthFt) * Math.max(0, heightFt);
  return {
    area: Math.round(area),
    bricks: Math.round(area * 10),
    cementBags: Math.max(1, Math.round(area * 0.05)),
    sandBags: Math.max(1, Math.round(area * 0.06)), // ~50kg sand bags
  };
}

function AROverlay({
  onClose,
  onAddEstimate,
}: {
  onClose: () => void;
  onAddEstimate: (est: ReturnType<typeof computeWallEstimate>) => void;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [width, setWidth]  = React.useState("12");
  const [height, setHeight] = React.useState("10");
  const w = parseFloat(width)  || 0;
  const h = parseFloat(height) || 0;
  const est = computeWallEstimate(w, h);

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    async function start() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError("Camera not available in this browser. Estimate still works below.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => { /* autoplay blocked */ });
        }
      } catch (err: any) {
        const msg = err?.name === "NotAllowedError"
          ? "Camera permission denied. You can still enter dimensions below."
          : err?.name === "NotFoundError"
          ? "No camera found on this device. You can still enter dimensions below."
          : "Couldn't start the camera. You can still enter dimensions below.";
        setCameraError(msg);
      }
    }
    start();
    return () => {
      cancelled = true;
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  return (
    <motion.div
      className="absolute inset-0 z-[100] flex flex-col bg-slate-900 p-5"
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 28, stiffness: 200 }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-white font-display font-black italic text-xl uppercase leading-tight">AR Material Drop</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mt-0.5">Point camera · enter wall size</p>
        </div>
        <button onClick={onClose} className="bg-white/10 p-3 rounded-full text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Camera viewport */}
      <div className="rounded-[28px] border-2 border-dashed border-white/15 relative overflow-hidden bg-black h-56">
        <video
          ref={videoRef}
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 ar-grid opacity-60 pointer-events-none" />
        {[["top-3 left-3","border-t-2 border-l-2"],["top-3 right-3","border-t-2 border-r-2"],["bottom-3 left-3","border-b-2 border-l-2"],["bottom-3 right-3","border-b-2 border-r-2"]].map(([pos, cls], i) => (
          <div key={i} className={`absolute w-5 h-5 ${pos} ${cls} border-amber-400 pointer-events-none`} />
        ))}
        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-6 text-amber-300 text-[10px] font-bold uppercase tracking-widest bg-black/60">
            {cameraError}
          </div>
        )}
      </div>

      {/* Dimension inputs */}
      <div className="grid grid-cols-2 gap-3 mt-4">
        <label className="bg-white/10 rounded-2xl p-3">
          <p className="text-[9px] font-black text-amber-300 uppercase tracking-widest mb-1">Wall Width (ft)</p>
          <input
            type="number" min="0" step="0.5"
            value={width}
            onChange={e => setWidth(e.target.value)}
            className="w-full bg-transparent text-white font-display font-black italic text-2xl outline-none"
          />
        </label>
        <label className="bg-white/10 rounded-2xl p-3">
          <p className="text-[9px] font-black text-amber-300 uppercase tracking-widest mb-1">Wall Height (ft)</p>
          <input
            type="number" min="0" step="0.5"
            value={height}
            onChange={e => setHeight(e.target.value)}
            className="w-full bg-transparent text-white font-display font-black italic text-2xl outline-none"
          />
        </label>
      </div>

      {/* Result card */}
      <div className="mt-4 bg-white rounded-[28px] p-5 shadow-2xl">
        <div className="flex justify-between items-center mb-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estimated Wall Area</p>
          <p className="font-display font-black italic text-xl" style={{ color: BRAND_DARK }}>{est.area} SQ.FT</p>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <p className="font-black text-base" style={{ color: BRAND_DARK }}>{est.bricks.toLocaleString("en-IN")}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase">Bricks</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <p className="font-black text-base" style={{ color: BRAND_DARK }}>{est.cementBags}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase">Cement Bags</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-2 text-center">
            <p className="font-black text-base" style={{ color: BRAND_DARK }}>{est.sandBags}</p>
            <p className="text-[8px] font-bold text-slate-400 uppercase">Sand Bags</p>
          </div>
        </div>
        <button
          disabled={est.area <= 0}
          className="w-full py-4 rounded-[20px] font-black text-[11px] uppercase tracking-widest text-white disabled:opacity-50"
          style={{ background: BRAND_DARK, boxShadow: "0 4px 20px rgba(27,67,102,0.25)" }}
          onClick={() => onAddEstimate(est)}
        >
          Add Estimated Mix to Cart →
        </button>
      </div>
    </motion.div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
export function Home() {
  const [, navigate]                    = useLocation();
  const [stage, setStage]               = useState<GetMaterialsStage>("foundation");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedPanelLabel, setSelectedPanelLabel] = useState<string | null>(null);
  const [searchTerm, setSearchTerm]     = useState("");
  const [showAR, setShowAR]             = useState(false);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const { data: materials, isLoading } = useGetMaterials({ stage: stage === "all" ? undefined : stage });
  const qc = useQueryClient();
  const addToCart = useAddToCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const updateCartItem = useUpdateCartItem({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const removeFromCart = useRemoveFromCart({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getGetCartQueryKey() }) },
  });
  const { data: cart } = useGetCart();

  /* Single canonical lookup keyed by category::name. Aggregates the total
     quantity AND every matching line id, so the displayed qty and the mutation
     target are always derived from the same structure — even in the edge case
     where the same product appears as multiple cart lines. */
  const cartItemByKey = React.useMemo(() => {
    const map: Record<string, { ids: string[]; quantity: number }> = {};
    if (!cart) return map;
    for (const c of cart.categories ?? []) {
      for (const it of c.items ?? []) {
        const key = `${(it.category || "").toLowerCase()}::${(it.name || "").toLowerCase()}`;
        const entry = map[key] ?? (map[key] = { ids: [], quantity: 0 });
        entry.ids.push(String(it.id));
        entry.quantity += Number(it.quantity) || 0;
      }
    }
    return map;
  }, [cart]);

  const getCartQty = React.useCallback(
    (category: string, name: string) =>
      cartItemByKey[`${category.toLowerCase()}::${name.toLowerCase()}`]?.quantity ?? 0,
    [cartItemByKey],
  );

  /* Parse INR-formatted prices like "₹6,500", "₹50–₹58", "₹1,050/bag" → 6500 / 50 / 1050.
     Picks the FIRST numeric run so price ranges resolve to the lower bound. */
  const parsePriceINR = (raw: string): number => {
    if (!raw) return 0;
    const m = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
    return m ? parseFloat(m[1]) : 0;
  };

  /* Slugify a name into a stable virtual material id for branded products
     (e.g. "Iron Nails 1 inch" → "brand-iron-nails-1-inch"). */
  const productSlug = (category: string, name: string) =>
    `brand-${category}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

  /* Add a branded catalog product directly to the cart with its REAL
     name/price/unit/vendor — no DB lookup, no fuzzy matching. */
  const addProductToCart = React.useCallback(
    (opts: {
      category: string;
      name: string;
      priceText: string;
      unit?: string;
      vendor?: string;
      quantity?: number;
    }) => {
      const price = parsePriceINR(opts.priceText);
      if (price <= 0) {
        toast.error("Couldn't read price", { description: "Please try a different product." });
        return;
      }
      addToCart.mutate(
        {
          data: {
            materialId: productSlug(opts.category, opts.name),
            quantity: opts.quantity ?? 1,
            name: opts.name,
            price,
            unit: opts.unit || "unit",
            vendor: opts.vendor || "CONON Marketplace",
            category: opts.category,
          },
        },
        {
          onSuccess: () => toast.success(`${opts.name} added to cart!`),
          onError:   () => toast.error("Couldn't add to cart", { description: "Please try again." }),
        }
      );
    },
    [addToCart],
  );

  /* Add a feed/detail-sheet Product to the cart with its real attributes. */
  const addFeedProduct = React.useCallback(
    (p: Product, quantity = 1) => {
      if (!(p.price > 0)) {
        toast.error("Couldn't read price", { description: "Please try a different product." });
        return;
      }
      addToCart.mutate(
        {
          data: {
            materialId: p.id,
            quantity,
            name: p.title,
            price: p.price,
            unit: p.unit || "unit",
            vendor: p.vendor || "CONON Marketplace",
            category: p.materialTag,
          },
        },
        {
          onSuccess: () => toast.success(`${p.vendor || "Product"} added to cart!`),
          onError:   () => toast.error("Couldn't add to cart", { description: "Please try again." }),
        },
      );
    },
    [addToCart],
  );

  /* Stepper handler for feed/storefront product cards: maps a desired quantity
     to the right cart mutation. New line → add; existing line → update; 0 →
     remove. Update/remove are silent (no toast) so the −/+ stepper feels fast. */
  const setProductQty = React.useCallback(
    (p: Product, qty: number) => {
      const key = `${(p.materialTag || "").toLowerCase()}::${(p.title || "").toLowerCase()}`;
      const entry = cartItemByKey[key];
      if (!entry || entry.ids.length === 0) {
        if (qty > 0) addFeedProduct(p, qty);
        return;
      }
      // Remove any extra duplicate lines so a key collapses to a single line.
      entry.ids.slice(1).forEach((extraId) => removeFromCart.mutate({ itemId: extraId }));
      const primaryId = entry.ids[0];
      if (qty <= 0) {
        removeFromCart.mutate({ itemId: primaryId });
      } else {
        updateCartItem.mutate({ itemId: primaryId, data: { quantity: qty } });
      }
    },
    [cartItemByKey, addFeedProduct, removeFromCart, updateCartItem],
  );

  const cartMutationPending =
    addToCart.isPending || updateCartItem.isPending || removeFromCart.isPending;

  /* Two non-overlapping feeds: top picks = core materials (cement/steel/…),
     builder picks = different categories (hardware/electrical/plumbing/…). */
  const topPicksProducts = React.useMemo(
    () => DUMMY_PRODUCTS.slice(0, 6),
    [],
  );
  const builderPicksProducts = React.useMemo(
    () => BUILDER_PICKS,
    [],
  );

  const categories = materials ? Array.from(new Set(materials.map(m => m.category))) : [];

  /* Quick lookup: first material id per category — used by branded catalogs
     (Cement / Steel / Brand) so their "Add" buttons hit a real DB row. */
  const categoryToMaterialId = React.useMemo(() => {
    const map: Record<string, string> = {};
    if (!materials) return map;
    for (const m of materials) {
      if (!map[m.category]) map[m.category] = m.id;
    }
    return map;
  }, [materials]);

  /* Materials grouped by category, used to find a real DB row that best
     matches the brand-catalog product the user actually clicked. */
  const materialsByCategory = React.useMemo(() => {
    const map: Record<string, typeof materials> = {};
    if (!materials) return map;
    for (const m of materials) {
      (map[m.category] ||= []).push(m);
    }
    return map;
  }, [materials]);

  /* Score-based fuzzy match: return the material in `category` whose name
     shares the most word-tokens with `label`. Falls back to first-of-category. */
  const resolveMaterialForLabel = React.useCallback(
    (category: string, label: string): string | null => {
      const pool = materialsByCategory[category];
      if (!pool || pool.length === 0) return categoryToMaterialId[category] ?? null;

      const norm = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter(Boolean);
      const labelTokens = new Set(norm(label));
      if (labelTokens.size === 0) return pool[0].id;

      let best = pool[0];
      let bestScore = -1;
      for (const m of pool) {
        const matTokens = norm(m.name);
        let score = 0;
        for (const t of matTokens) if (labelTokens.has(t)) score++;
        if (score > bestScore) { bestScore = score; best = m; }
      }
      return best.id;
    },
    [materialsByCategory, categoryToMaterialId],
  );

  const handleQuickAdd = (category: string, label: string, quantity = 1) => {
    const matId = resolveMaterialForLabel(category, label);
    if (!matId) {
      toast.error("Out of stock for your area", { description: `${label} is not available right now.` });
      return;
    }
    addToCart.mutate(
      { data: { materialId: matId, quantity } },
      {
        onSuccess: () => toast.success(`${label} added to cart!`),
        onError:   () => toast.error("Couldn't add to cart", { description: "Please try again." }),
      }
    );
  };

  /* Filtered materials for list view */
  const listMaterials = (() => {
    let base = selectedCategory ? materials?.filter(m => m.category === selectedCategory) : materials;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      base = base?.filter(m =>
        m.name.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        m.description?.toLowerCase().includes(q)
      );
    }
    return base;
  })();

  /* When searching, show flat materials list regardless of category */
  const isSearching = searchTerm.trim().length > 0;

  const handleStageSelect = (s: string) => {
    setStage(s as GetMaterialsStage);
    setSelectedCategory(null);
    setSearchTerm("");
  };


  return (
    <Layout>
      <div className="relative min-h-full">

        {/* ── Search Bar (sits in the neon-green band) ───────────── */}
        <div
          className="sticky top-0 z-20 px-5 pt-3 pb-3"
          style={{ background: "linear-gradient(180deg, #8fd61f 0%, #d6f88f 70%, #ffffff 100%)" }}
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-[18px] h-[18px]" strokeWidth={2.4} />
            <input
              type="text"
              placeholder="Search 'cement', 'bricks', 'tools'"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white py-3.5 pl-11 pr-12 rounded-[18px] text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-lime-300 shadow-[0_4px_14px_-6px_rgba(27,67,102,0.35)] transition"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              >
                <X className="w-[18px] h-[18px]" />
              </button>
            ) : (
              <button
                onClick={() => setShowVoiceModal(true)}
                aria-label="Voice search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition"
                style={{ background: BRAND_DARK }}
              >
                <Mic className="w-[16px] h-[16px] text-amber-300" strokeWidth={2.5} />
              </button>
            )}
          </div>

          {/* ── Category chips (horizontal scroll) ──────────────── */}
          {!isSearching && (
            <div className="flex gap-2.5 mt-3.5 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
              {HOME_CHIPS.map(chip => {
                const active = chip.db === null ? selectedCategory === null : selectedCategory === chip.db;
                const Icon = chip.icon;
                return (
                  <button
                    key={chip.label}
                    onClick={() => {
                      if (chip.db === null) { setSelectedCategory(null); setSelectedPanelLabel(null); }
                      else { setSelectedCategory(chip.db); setSelectedPanelLabel(chip.label); }
                    }}
                    className="flex flex-col items-center gap-1 shrink-0 active:scale-90 transition"
                  >
                    <span
                      className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all"
                      style={
                        active
                          ? { background: AMBER, borderColor: AMBER, boxShadow: `0 6px 14px -4px ${AMBER}aa` }
                          : { background: "#ffffff", borderColor: "#e2e8f0" }
                      }
                    >
                      <Icon
                        className="w-[22px] h-[22px]"
                        style={{ color: active ? "#fff" : BRAND_DARK }}
                        strokeWidth={2.2}
                      />
                    </span>
                    <span
                      className="text-[10px] font-black"
                      style={{ color: active ? "#b45309" : BRAND_DARK }}
                    >
                      {chip.label}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Search Results (override everything when searching) ─ */}
        <AnimatePresence>
          {isSearching && (
            <motion.div
              key="search-results"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="px-4 pt-4 pb-28"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">
                {listMaterials?.length ?? 0} results for "{searchTerm}"
              </p>
              <MaterialList materials={listMaterials} isLoading={isLoading} addToCart={addToCart} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Normal (non-search) UI ─────────────────────────────── */}
        {!isSearching && (
          <>
            {/* Category Grid or Material List */}
            <AnimatePresence mode="wait">
              {!selectedCategory ? (
                <motion.div
                  key="cat-grid"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="pt-3 pb-28"
                >
                  {/* ── Explore Conon — quick-access feature shortcuts ──── */}
                  <FeatureShortcuts />

                  {/* ── Shop By Category — first section in the feed ─────── */}
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 mt-1 italic px-5">
                    Shop By Category
                  </p>
                  <div className="px-4">

                  <motion.div
                      className="grid grid-cols-4 gap-x-3 gap-y-6"
                      initial="hidden" animate="show"
                      variants={{ show: { transition: { staggerChildren: 0.04 } } }}
                    >
                      {HOMERUN_CATEGORIES.map(item => (
                        <motion.button
                          key={item.slug}
                          variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            setSelectedCategory(item.dbCategory);
                            setSelectedPanelLabel(item.label);
                          }}
                          className="flex flex-col items-center gap-2 active:scale-90 transition-transform"
                        >
                          <div
                            className="w-full aspect-square rounded-2xl overflow-hidden relative flex items-center justify-center"
                            style={{ background: "#eff8fb", border: "1px solid #e0eef3" }}
                          >
                            <img
                              src={item.image}
                              alt={item.label}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const t = e.currentTarget;
                                t.style.display = "none";
                                const fb = t.nextElementSibling as HTMLElement;
                                if (fb) fb.style.display = "flex";
                              }}
                            />
                            <span
                              className="text-3xl leading-none absolute inset-0 items-center justify-center"
                              style={{ display: "none" }}
                            >
                              📦
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-center text-slate-700 leading-tight px-0.5">
                            {item.label}
                          </span>
                        </motion.button>
                      ))}
                    </motion.div>
                  </div>

                  {/* Heavy machines on rent — fleet slider, directly below categories */}
                  <EquipmentRentalSlider />

                  {/* ── Hero banner carousel ─────────────────────────── */}
                  <PromoCarousel />

                  {/* Special offer bar */}
                  <div className="px-4 mt-3">
                    <div
                      className="rounded-2xl px-4 py-3 flex items-center gap-3"
                      style={{ background: `linear-gradient(135deg, ${GREEN} 0%, #1f5e2c 100%)` }}
                    >
                      <span className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                        <Zap className="w-4 h-4 text-amber-300" strokeWidth={2.6} fill="currentColor" />
                      </span>
                      <p className="text-white text-[13px] font-black leading-tight">
                        Shop for ₹50,000 &amp; above,{" "}
                        <span className="text-amber-300">get an extra ₹5,000 OFF</span>
                      </p>
                    </div>
                  </div>

                  {/* Stores in spotlight — horizontal scroll */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between px-4 mb-3">
                      <h3 className="font-display font-black text-[15px]" style={{ color: BRAND_DARK }}>
                        Stores in spotlight
                      </h3>
                      <button
                        onClick={() => navigate("/categories")}
                        className="text-[12px] font-black flex items-center gap-0.5"
                        style={{ color: GREEN }}
                      >
                        See all <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
                      {SPOTLIGHT_STORES.map((s) => (
                        <button
                          key={s.name}
                          onClick={() => navigate("/categories")}
                          className="shrink-0 w-[136px] text-left rounded-2xl overflow-hidden bg-white border border-slate-100 shadow-[0_4px_14px_-8px_rgba(27,67,102,0.35)] active:scale-[0.97] transition"
                        >
                          <div
                            className="h-20 flex items-center justify-center"
                            style={{ background: s.bg }}
                          >
                            <span className="text-2xl font-black text-white tracking-tight">{s.initials}</span>
                          </div>
                          <div className="p-2.5">
                            <p className="text-[13px] font-black leading-tight truncate" style={{ color: BRAND_DARK }}>
                              {s.name}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400 truncate">{s.tag}</p>
                            <div className="flex items-center gap-1 mt-1.5">
                              <span
                                className="inline-flex items-center gap-0.5 text-[10px] font-black text-white px-1.5 py-0.5 rounded-md"
                                style={{ background: GREEN }}
                              >
                                <Star className="w-2.5 h-2.5" fill="currentColor" strokeWidth={0} /> {s.rating}
                              </span>
                              <span className="text-[10px] font-semibold text-slate-400">{s.eta}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Top picks — premium product feed */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between px-4 mb-3">
                      <h3 className="font-display font-black text-[15px]" style={{ color: BRAND_DARK }}>
                        Top picks for your build
                      </h3>
                    </div>
                    <div className="px-4">
                      <ProductFeed
                        products={topPicksProducts}
                        onAddToCart={addFeedProduct}
                        onSetQty={setProductQty}
                        onSeeOptions={setDetailProduct}
                        onVariants={setDetailProduct}
                        onArView={() => setShowAR(true)}
                        onOpenDetail={setDetailProduct}
                        getCartQty={(p) => getCartQty(p.materialTag, p.title)}
                        isAdding={cartMutationPending}
                      />
                    </div>
                  </div>

                  {/* Frequently bought */}
                  <div className="mt-6">
                    <div className="flex items-center justify-between px-4 mb-3">
                      <h3 className="font-display font-black text-[15px]" style={{ color: BRAND_DARK }}>
                        Frequently bought
                      </h3>
                    </div>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
                      {FREQUENT_BUNDLES.map(b => (
                        <button
                          key={b.label}
                          onClick={() => { setSelectedCategory(b.db); setSelectedPanelLabel(b.label); }}
                          className="shrink-0 w-[120px] active:scale-95 transition"
                        >
                          <div className="w-full h-[100px] rounded-2xl overflow-hidden relative border border-slate-100 bg-slate-50">
                            <img
                              src={b.image}
                              alt={b.label}
                              loading="lazy"
                              className="w-full h-full object-cover"
                              onError={onImgError}
                            />
                            <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black text-white px-1.5 py-0.5 rounded-md" style={{ background: "rgba(15,23,42,0.7)" }}>
                              {b.extra}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-700 mt-1.5 text-left leading-tight">{b.label}</p>
                        </button>
                      ))}
                    </div>
                    <div className="px-4 mt-3">
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-slate-200 bg-white active:scale-[0.98] transition"
                      >
                        <span className="text-[12px] font-black" style={{ color: BRAND_DARK }}>See all materials</span>
                        <ChevronRight className="w-4 h-4" style={{ color: BRAND_DARK }} />
                      </button>
                    </div>
                  </div>

                  {/* Featured this week */}
                  <div className="mt-6">
                    <h3 className="font-display font-black text-[15px] px-4 mb-3" style={{ color: BRAND_DARK }}>
                      Featured this week
                    </h3>
                    <div className="flex gap-3 overflow-x-auto scrollbar-hide px-4 pb-1">
                      {FEATURED_CARDS.map(card => (
                        <button
                          key={card.title}
                          onClick={() => { setSelectedCategory(card.db); setSelectedPanelLabel(card.title); }}
                          className="shrink-0 w-[170px] rounded-2xl overflow-hidden relative active:scale-95 transition text-left"
                          style={{ background: card.tint }}
                        >
                          <div className="absolute inset-0 opacity-25">
                            <img src={card.image} alt="" loading="lazy" className="w-full h-full object-cover blur-[1px]" onError={onImgError} />
                          </div>
                          <div className="relative z-10 p-3.5 h-[112px] flex flex-col">
                            <span className="self-start text-[8px] font-black uppercase tracking-widest text-white/90 bg-white/20 px-2 py-0.5 rounded-full">
                              Featured
                            </span>
                            <h4 className="font-display font-black text-white text-[15px] leading-tight mt-auto">{card.title}</h4>
                            <p className="text-[10px] font-bold text-white/80 mt-0.5">{card.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Smart tools */}
                  <div className="grid grid-cols-2 gap-3 px-4 mt-6">
                    <button
                      onClick={() => setShowAR(true)}
                      className="bg-blue-50 border-2 border-blue-100 p-3.5 rounded-[22px] flex items-center gap-3 active:scale-95 transition"
                    >
                      <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-600/25">
                        <Camera className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase" style={{ color: BRAND_DARK }}>AR Measure</p>
                        <p className="text-[8px] font-bold text-blue-400">Scan Your Wall</p>
                      </div>
                    </button>
                    <button
                      onClick={() => setShowVoiceModal(true)}
                      className="p-3.5 rounded-[22px] flex items-center gap-3 active:scale-95 transition-all shadow-xl bg-slate-900 shadow-slate-200"
                    >
                      <div className="p-2 rounded-xl bg-white/10 text-white">
                        <Mic className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-white uppercase">Voice Order</p>
                        <p className="text-[8px] font-bold text-white/50 italic">Tap &amp; Hold</p>
                      </div>
                    </button>
                  </div>

                  {/* Top picks from your builder category — bottom of feed */}
                  <div className="mt-8 mb-2">
                    <div className="flex items-center justify-between px-4 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: BRAND_DARK }}>
                          <Hammer className="w-3.5 h-3.5 text-white" />
                        </span>
                        <h3 className="font-display font-black text-[15px]" style={{ color: BRAND_DARK }}>
                          Top picks from your builder category
                        </h3>
                      </div>
                    </div>
                    <div className="px-4">
                      <ProductFeed
                        products={builderPicksProducts}
                        onAddToCart={addFeedProduct}
                        onSetQty={setProductQty}
                        onSeeOptions={setDetailProduct}
                        onVariants={setDetailProduct}
                        onArView={() => setShowAR(true)}
                        onOpenDetail={setDetailProduct}
                        getCartQty={(p) => getCartQty(p.materialTag, p.title)}
                        isAdding={cartMutationPending}
                      />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="mat-list"
                  initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
                  className="px-4 pt-5 pb-28"
                >
                  {/* Back header */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      onClick={() => { setSelectedCategory(null); setSelectedPanelLabel(null); }}
                      className="flex items-center gap-1 text-sm font-black"
                      style={{ color: BRAND_MID }}
                    >
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                    <span className="text-slate-200">|</span>
                    {(() => {
                      const cfg = CAT_CONFIG[selectedCategory];
                      const Icon = cfg?.icon ?? Package;
                      return <Icon className="w-4 h-4" style={{ color: cfg?.iconColor ?? BRAND_DARK }} strokeWidth={1.8} />;
                    })()}
                    <h4 className="font-display font-black italic" style={{ color: BRAND_DARK }}>
                      {selectedPanelLabel ?? getCatLabel(selectedCategory)}
                    </h4>
                    <span className="ml-auto text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase">
                      <Clock className="w-2.5 h-2.5" /> 60m JIT
                    </span>
                  </div>

                  {(() => {
                    const sfProducts = getCategoryProducts(selectedCategory);
                    if (sfProducts.length === 0) {
                      return <MaterialList materials={listMaterials} isLoading={isLoading} addToCart={addToCart} />;
                    }
                    return (
                      <CategoryStorefront
                        category={selectedCategory}
                        products={sfProducts}
                        getQty={getCartQty}
                        onAdd={addFeedProduct}
                        onSetQty={setProductQty}
                        onOpenDetail={setDetailProduct}
                        isAdding={cartMutationPending}
                        onSelectCategory={(cat) => { setSelectedCategory(cat); setSelectedPanelLabel(getCatLabel(cat)); }}
                      />
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        {/* AR Overlay */}
        <AnimatePresence>
          {showAR && (
            <AROverlay
              onClose={() => setShowAR(false)}
              onAddEstimate={(est) => {
                if (est.area <= 0) {
                  toast.error("Enter wall dimensions first");
                  return;
                }
                handleQuickAdd("bricks", `${est.bricks} Red Clay Bricks`,  Math.max(1, Math.ceil(est.bricks / 1000)));
                handleQuickAdd("cement", `${est.cementBags} Cement Bags`, est.cementBags);
                handleQuickAdd("sand",   `${est.sandBags} Sand Bags`,    est.sandBags);
                toast.success(`Estimated mix added — ${est.area} sq.ft wall`);
                setShowAR(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Product detail bottom sheet */}
        <ProductDetailModal
          product={detailProduct}
          open={detailProduct !== null}
          onClose={() => setDetailProduct(null)}
          onAddToCart={addFeedProduct}
          onSetQty={setProductQty}
          isAdding={cartMutationPending}
          cartQty={detailProduct ? getCartQty(detailProduct.materialTag, detailProduct.title) : 0}
        />

        {/* Reorder FAB */}
        <motion.button
          onClick={() => toast.success("Last order queued!", { description: "Your bulk order will be placed shortly." })}
          className="fixed bottom-24 right-4 flex items-center gap-2 px-4 h-10 rounded-full text-xs font-black shadow-lg z-20"
          style={{ background: BRAND_DARK, color: "#fff", boxShadow: "0 4px 16px rgba(27,67,102,0.3)" }}
          whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reorder Last
        </motion.button>
      </div>

      <VoiceOrderModal
        isOpen={showVoiceModal}
        onClose={() => setShowVoiceModal(false)}
        onAddToCart={(category, label, quantity) => handleQuickAdd(category, label, quantity)}
      />
    </Layout>
  );
}

/* ── Shared material list component ───────────────────────────────── */
function MaterialList({ materials, isLoading, addToCart }: {
  materials: any[] | undefined;
  isLoading: boolean;
  addToCart: any;
}) {
  if (isLoading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => <div key={i} className="h-28 bg-slate-100 rounded-[28px] animate-pulse" />)}
    </div>
  );

  if (!materials?.length) return (
    <div className="text-center py-12 text-slate-300">
      <Package className="w-10 h-10 mx-auto mb-3" />
      <p className="text-sm font-bold text-slate-400">No materials found</p>
    </div>
  );

  return (
    <div className="space-y-3">
      {materials.map((mat, i) => {
        const cfg = CAT_CONFIG[mat.category];
        const Icon = cfg?.icon ?? Package;
        return (
          <motion.div
            key={mat.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="bg-white rounded-[32px] p-4 flex items-center gap-4 hover:border-blue-100 transition"
            style={{ border: "1px solid #f1f5f9", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}
          >
            {(() => {
              const disc = deriveDiscount(mat.id, parseFloat(mat.price) || 0);
              return (
                <div
                  className="relative w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden"
                  style={{ background: cfg?.bg ?? "#f0f4f8" }}
                >
                  {disc && <DiscountBadge type={disc.type} value={disc.value} size="sm" />}
                  <img
                    src={resolveProductImage(mat.category, mat.name)}
                    alt={mat.name}
                    loading="lazy"
                    className="w-full h-full object-cover rounded-2xl"
                    onError={(e) => {
                      const fb = resolveProductImage(mat.category, mat.name);
                      if (e.currentTarget.src !== fb) e.currentTarget.src = fb;
                    }}
                  />
                </div>
              );
            })()}

            <div className="flex-1 min-w-0">
              <p className="text-[8px] font-black uppercase tracking-wide" style={{ color: BRAND_MID }}>{mat.category}</p>
              <h4 className="font-bold text-slate-800 text-sm leading-tight">{mat.name}</h4>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-black italic text-sm" style={{ color: BRAND_DARK }}>₹{mat.price}</span>
                <span className="text-[9px] text-slate-400">/{mat.unit}</span>
                {mat.inStock
                  ? <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase">In Stock</span>
                  : <span className="text-[8px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-full uppercase">Out</span>
                }
              </div>
            </div>

            <button
              onClick={() => addToCart.mutate({ data: { materialId: mat.id, quantity: 1 } })}
              disabled={!mat.inStock || addToCart.isPending}
              className="p-3 rounded-2xl text-white disabled:opacity-40 active:scale-90 transition"
              style={{ background: BRAND_DARK }}
            >
              <Plus className="w-5 h-5" />
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Cement Catalog ────────────────────────────────────────────────── */
const CEMENT_TYPES = [
  {
    id:       "opc",
    name:     "OPC — Ordinary Portland Cement",
    short:    "OPC",
    tag:      "Most Popular",
    tagColor: "#1b4366",
    image:    PROD("cement-bag"),
    grades:   ["Grade 33", "Grade 43", "Grade 53"],
    price:    "₹380–₹420",
    unit:     "per 50 kg bag",
    desc:     "The 'bread and butter' of construction — used for general purposes where no special properties are required.",
    specs:    [
      { label: "Compressive Strength", value: "33 / 43 / 53 MPa (28-day)" },
      { label: "Setting Time (Initial)", value: "Min. 30 minutes" },
      { label: "Fineness",             value: "≥ 225 m²/kg" },
    ],
    bestFor:  ["High-rise buildings", "Bridges", "Pavements", "General masonry"],
    keyFeat:  "High strength and fast setting time",
    featColor:"#1b4366",
  },
  {
    id:       "ppc",
    name:     "PPC — Portland Pozzolana Cement",
    short:    "PPC",
    tag:      "Eco-Friendly",
    tagColor: "#15803d",
    image:    PROD("white-cement"),
    grades:   ["IS 1489 Grade"],
    price:    "₹350–₹390",
    unit:     "per 50 kg bag",
    desc:     "Produced by grinding OPC clinker with pozzolanic materials like fly ash or volcanic ash. Better workability and durability.",
    specs:    [
      { label: "Pozzolanic Content",   value: "15%–35% fly ash / volcanic ash" },
      { label: "Compressive Strength", value: "≥ 33 MPa (28-day)" },
      { label: "Heat of Hydration",    value: "Lower than OPC" },
    ],
    bestFor:  ["Marine structures", "Sewage pipes", "Dams", "Plastering work"],
    keyFeat:  "Highly resistant to sulfate and chloride attacks",
    featColor:"#15803d",
  },
  {
    id:       "rhc",
    name:     "Rapid Hardening Cement",
    short:    "RHC",
    tag:      "Time-Saver",
    tagColor: "#d97706",
    image:    PROD("cement-bag"),
    grades:   ["IS 8041"],
    price:    "₹440–₹490",
    unit:     "per 50 kg bag",
    desc:     "Gains strength much faster than OPC. Sets at a normal pace but becomes strong very quickly — formwork can be removed earlier.",
    specs:    [
      { label: "C₃S Content",         value: "Higher than OPC (faster strength)" },
      { label: "1-Day Strength",       value: "≈ OPC 3-Day strength" },
      { label: "Setting Time",         value: "Normal (not quick-set)" },
    ],
    bestFor:  ["Road repairs", "Cold weather concreting", "Pre-cast concrete"],
    keyFeat:  "Saves time — formwork removed earlier, lower project cost",
    featColor:"#d97706",
  },
  {
    id:       "lhc",
    name:     "Low Heat Cement",
    short:    "LHC",
    tag:      "Mass Concrete",
    tagColor: "#0891b2",
    image:    PROD("cement-bag"),
    grades:   ["IS 12600"],
    price:    "₹410–₹460",
    unit:     "per 50 kg bag",
    desc:     "Engineered to reduce the heat of hydration — the chemical reaction when water hits cement. Prevents thermal cracking in massive structures.",
    specs:    [
      { label: "C₃A Content",         value: "Low (≤ 6%)" },
      { label: "C₃S Content",         value: "Low (≤ 35%)" },
      { label: "Heat of Hydration",    value: "< 65 cal/g at 7 days" },
    ],
    bestFor:  ["Gravity dams", "Large raft foundations", "Massive retaining walls"],
    keyFeat:  "Prevents thermal cracking — critical for massive concrete pours",
    featColor:"#0891b2",
  },
  {
    id:       "src",
    name:     "Sulfate Resisting Cement",
    short:    "SRC",
    tag:      "Coastal / Soil",
    tagColor: "#7c3aed",
    image:    PROD("cement-bag"),
    grades:   ["IS 12330"],
    price:    "₹420–₹470",
    unit:     "per 50 kg bag",
    desc:     "Formulated to withstand soil or groundwater with high sulfate content. Prevents 'sulfate attack' — expansion and disintegration of concrete.",
    specs:    [
      { label: "C₃A Content",         value: "Strictly < 5%" },
      { label: "C₄AF + 2C₃A",         value: "≤ 25%" },
      { label: "Compressive Strength", value: "≥ 33 MPa (28-day)" },
    ],
    bestFor:  ["Coastal foundations", "Canal linings", "Marshland structures", "Sewage treatment"],
    keyFeat:  "Stops sulfate attack — essential in aggressive soil conditions",
    featColor:"#7c3aed",
  },
];

/* ── Brand data ───────────────────────────────────────────────────── */
const CEMENT_BRANDS = [
  {
    id: "ultratech", name: "UltraTech", tagline: "The Engineer's Choice", color: "#ea580c",
    initials: "UT", rank: "#1 in India",
    products: [
      { name: "UltraTech OPC 53 Grade",     type: "OPC",  price: "₹410", pack: "50 kg bag", tag: "Best Seller" },
      { name: "UltraTech PPC",              type: "PPC",  price: "₹385", pack: "50 kg bag", tag: "Eco"         },
      { name: "UltraTech Buildmore",        type: "PPC",  price: "₹370", pack: "50 kg bag", tag: ""            },
      { name: "UltraTech Super",            type: "OPC",  price: "₹425", pack: "50 kg bag", tag: "Premium"     },
      { name: "UltraTech Weatherplus",      type: "PPC",  price: "₹395", pack: "50 kg bag", tag: "Weather Res." },
    ],
  },
  {
    id: "acc", name: "ACC", tagline: "Suraksha & F2R — Fast Setting", color: "#1d4ed8",
    initials: "ACC", rank: "#2 Legacy Brand",
    products: [
      { name: "ACC Gold OPC 53",            type: "OPC",  price: "₹405", pack: "50 kg bag", tag: "Best Seller" },
      { name: "ACC Suraksha PPC",           type: "PPC",  price: "₹375", pack: "50 kg bag", tag: "Popular"     },
      { name: "ACC F2R (Fast to Road)",     type: "RHC",  price: "₹460", pack: "50 kg bag", tag: "Fast Set"    },
      { name: "ACC Concrete+",              type: "PPC",  price: "₹380", pack: "50 kg bag", tag: ""            },
      { name: "ACC Gold Water Shield",      type: "PPC",  price: "₹415", pack: "50 kg bag", tag: "Water Res."  },
    ],
  },
  {
    id: "ambuja", name: "Ambuja", tagline: "Strength + Water Resistant", color: "#dc2626",
    initials: "AM", rank: "Adani Group",
    products: [
      { name: "Ambuja Plus",                type: "PPC",  price: "₹390", pack: "50 kg bag", tag: "Water Resist." },
      { name: "Ambuja OPC 53",              type: "OPC",  price: "₹408", pack: "50 kg bag", tag: "Best Seller"   },
      { name: "Ambuja Kawach",              type: "SRC",  price: "₹445", pack: "50 kg bag", tag: "Coastal"       },
      { name: "Ambuja Cool Walls",          type: "PPC",  price: "₹412", pack: "50 kg bag", tag: "Heat Res."     },
    ],
  },
  {
    id: "shree", name: "Shree", tagline: "Jung Rodhak & Bangur", color: "#4338ca",
    initials: "SC", rank: "Top 3 Producer",
    products: [
      { name: "Shree Jung Rodhak OPC",      type: "OPC",  price: "₹400", pack: "50 kg bag", tag: "Rust Shield"  },
      { name: "Bangur Power",               type: "PPC",  price: "₹372", pack: "50 kg bag", tag: "Popular"      },
      { name: "Bangur Premium OPC 53",      type: "OPC",  price: "₹415", pack: "50 kg bag", tag: ""             },
      { name: "Shree Ultra PPC",            type: "PPC",  price: "₹380", pack: "50 kg bag", tag: ""             },
      { name: "Bangur Duraguard",           type: "PPC",  price: "₹388", pack: "50 kg bag", tag: "Durable"      },
    ],
  },
  {
    id: "jk", name: "JK Cement", tagline: "JK Super & JK Lakshmi", color: "#16a34a",
    initials: "JK", rank: "Est. 1975",
    products: [
      { name: "JK Super OPC 53",            type: "OPC",  price: "₹402", pack: "50 kg bag", tag: "Best Seller"  },
      { name: "JK Lakshmi PPC",             type: "PPC",  price: "₹375", pack: "50 kg bag", tag: "Popular"      },
      { name: "JK Lakshmi Sixer",           type: "OPC",  price: "₹420", pack: "50 kg bag", tag: "Premium"      },
      { name: "JK SmartCrete",              type: "PPC",  price: "₹385", pack: "50 kg bag", tag: ""             },
      { name: "JK Super Strong",            type: "OPC",  price: "₹430", pack: "50 kg bag", tag: "High Strength" },
    ],
  },
  {
    id: "birla", name: "Birla", tagline: "Samrat & Uttam Brands", color: "#d97706",
    initials: "BC", rank: "Aditya Birla",
    products: [
      { name: "Birla Samrat OPC 53",        type: "OPC",  price: "₹406", pack: "50 kg bag", tag: "Best Seller"  },
      { name: "Birla Uttam PPC",            type: "PPC",  price: "₹378", pack: "50 kg bag", tag: "Eco"          },
      { name: "Birla A1 Premium",           type: "OPC",  price: "₹422", pack: "50 kg bag", tag: "Premium"      },
      { name: "Birla Samrat Advanced",      type: "PPC",  price: "₹398", pack: "50 kg bag", tag: "Multi-Use"    },
    ],
  },
  {
    id: "prism", name: "Prism", tagline: "Strong Distribution — Lucknow", color: "#0d9488",
    initials: "PC", rank: "Local Favorite",
    products: [
      { name: "Prism OPC 53 Grade",         type: "OPC",  price: "₹395", pack: "50 kg bag", tag: "Local Choice" },
      { name: "Prism Champion PPC",         type: "PPC",  price: "₹368", pack: "50 kg bag", tag: "Value"        },
      { name: "Prism Pro Cement",           type: "OPC",  price: "₹408", pack: "50 kg bag", tag: "Builder Fav." },
    ],
  },
  {
    id: "dalmia", name: "Dalmia", tagline: "Premium Quality Specialist", color: "#7c3aed",
    initials: "DC", rank: "Premium",
    products: [
      { name: "Dalmia DSP Special OPC",     type: "OPC",  price: "₹418", pack: "50 kg bag", tag: "Premium"      },
      { name: "Dalmia Infracon",            type: "SRC",  price: "₹448", pack: "50 kg bag", tag: "Coastal"      },
      { name: "Dalmia RoboX PPC",           type: "PPC",  price: "₹388", pack: "50 kg bag", tag: ""             },
      { name: "Dalmia Konark PPC",          type: "PPC",  price: "₹375", pack: "50 kg bag", tag: "Value"        },
    ],
  },
  {
    id: "mycem", name: "Mycem", tagline: "Reliable Local Market Brand", color: "#475569",
    initials: "MY", rank: "Budget Pick",
    products: [
      { name: "Mycem OPC 43 Grade",         type: "OPC",  price: "₹375", pack: "50 kg bag", tag: "Economy"      },
      { name: "Mycem OPC 53 Grade",         type: "OPC",  price: "₹392", pack: "50 kg bag", tag: ""             },
      { name: "Mycem PPC Standard",         type: "PPC",  price: "₹355", pack: "50 kg bag", tag: "Value"        },
    ],
  },
];

/* Steel / TMT bar brands actually sold in the Lucknow & wider UP market — the
   national majors (Tata Tiscon, Jindal Panther, SAIL) plus the strong regional
   names builders here ask for by brand (Gallantt, Ankur, Rathi, Kamdhenu, Goel).
   Shape mirrors CEMENT_BRANDS so getCategoryProducts() can reuse the shared
   brandVariantToProduct() mapper. Prices are ₹/kg (TMT is sold by weight). */
const STEEL_BRANDS = [
  {
    id: "tata", name: "Tata Tiscon", tagline: "India's #1 Rebar — Super Ductile", color: "#1e3a8a",
    initials: "TT", rank: "#1 Premium Brand",
    products: [
      { name: "Tata Tiscon 8mm TMT Fe500D",   type: "Fe500D", price: "₹76", pack: "per kg", tag: "Best Seller"     },
      { name: "Tata Tiscon 10mm TMT Fe500D",  type: "Fe500D", price: "₹74", pack: "per kg", tag: "Earthquake Safe" },
      { name: "Tata Tiscon 12mm TMT Fe500D",  type: "Fe500D", price: "₹73", pack: "per kg", tag: "Popular"         },
      { name: "Tata Tiscon 16mm TMT Fe550D",  type: "Fe550D", price: "₹73", pack: "per kg", tag: "High Strength"   },
    ],
  },
  {
    id: "jindal", name: "Jindal Panther", tagline: "JSPL — High Strength Fe550D", color: "#b91c1c",
    initials: "JP", rank: "Premium",
    products: [
      { name: "Jindal Panther 8mm TMT Fe500D",  type: "Fe500D", price: "₹73", pack: "per kg", tag: "Premium"     },
      { name: "Jindal Panther 10mm TMT Fe500D", type: "Fe500D", price: "₹72", pack: "per kg", tag: "Best Seller" },
      { name: "Jindal Panther 12mm TMT Fe550D", type: "Fe550D", price: "₹71", pack: "per kg", tag: ""            },
      { name: "Jindal Panther 16mm TMT Fe550D", type: "Fe550D", price: "₹71", pack: "per kg", tag: "High Strength" },
    ],
  },
  {
    id: "sail", name: "SAIL", tagline: "SAIL SeQR — PSU Trusted", color: "#0e7490",
    initials: "SL", rank: "Govt. PSU",
    products: [
      { name: "SAIL SeQR 8mm TMT Fe500",   type: "Fe500",  price: "₹68", pack: "per kg", tag: "Trusted"     },
      { name: "SAIL SeQR 10mm TMT Fe500D", type: "Fe500D", price: "₹67", pack: "per kg", tag: "Best Seller" },
      { name: "SAIL SeQR 12mm TMT Fe500D", type: "Fe500D", price: "₹66", pack: "per kg", tag: ""            },
      { name: "SAIL SeQR 16mm TMT Fe500D", type: "Fe500D", price: "₹66", pack: "per kg", tag: "Value"       },
    ],
  },
  {
    id: "kamdhenu", name: "Kamdhenu", tagline: "Kamdhenu NXT — 10000 Series", color: "#dc2626",
    initials: "KD", rank: "Widely Available",
    products: [
      { name: "Kamdhenu NXT 8mm TMT Fe500D",  type: "Fe500D", price: "₹67", pack: "per kg", tag: "Popular"     },
      { name: "Kamdhenu NXT 10mm TMT Fe500D", type: "Fe500D", price: "₹66", pack: "per kg", tag: "Best Seller" },
      { name: "Kamdhenu NXT 12mm TMT Fe500D", type: "Fe500D", price: "₹65", pack: "per kg", tag: ""            },
      { name: "Kamdhenu 16mm TMT Fe550D",     type: "Fe550D", price: "₹65", pack: "per kg", tag: "High Strength" },
    ],
  },
  {
    id: "rathi", name: "Rathi", tagline: "North India's Builder Favourite", color: "#15803d",
    initials: "RT", rank: "Builder Favourite",
    products: [
      { name: "Rathi 8mm TMT Fe500D",   type: "Fe500D", price: "₹65", pack: "per kg", tag: "Value"       },
      { name: "Rathi 10mm TMT Fe500D",  type: "Fe500D", price: "₹64", pack: "per kg", tag: "Best Seller" },
      { name: "Rathi 12mm TMT Fe500D",  type: "Fe500D", price: "₹63", pack: "per kg", tag: ""            },
      { name: "Rathi 16mm TMT Fe500D",  type: "Fe500D", price: "₹63", pack: "per kg", tag: "Popular"     },
    ],
  },
  {
    id: "gallantt", name: "Gallantt", tagline: "Gallantt TMT — Made in UP (Gorakhpur)", color: "#ea580c",
    initials: "GL", rank: "UP Regional Leader",
    products: [
      { name: "Gallantt 8mm TMT Fe500D",  type: "Fe500D", price: "₹64", pack: "per kg", tag: "Local Favorite" },
      { name: "Gallantt 10mm TMT Fe500D", type: "Fe500D", price: "₹63", pack: "per kg", tag: "Best Seller"    },
      { name: "Gallantt 12mm TMT Fe500D", type: "Fe500D", price: "₹62", pack: "per kg", tag: ""               },
      { name: "Gallantt 16mm TMT Fe550D", type: "Fe550D", price: "₹62", pack: "per kg", tag: "High Strength"  },
    ],
  },
  {
    id: "ankur", name: "Ankur", tagline: "Ankur TMT — Kanpur, UP", color: "#7c3aed",
    initials: "AK", rank: "UP Local Brand",
    products: [
      { name: "Ankur 8mm TMT Fe500D",  type: "Fe500D", price: "₹63", pack: "per kg", tag: "Local Favorite" },
      { name: "Ankur 10mm TMT Fe500D", type: "Fe500D", price: "₹62", pack: "per kg", tag: "Best Seller"    },
      { name: "Ankur 12mm TMT Fe500D", type: "Fe500D", price: "₹61", pack: "per kg", tag: "Value"          },
      { name: "Ankur 16mm TMT Fe500",  type: "Fe500",  price: "₹61", pack: "per kg", tag: ""               },
    ],
  },
  {
    id: "goel", name: "Goel TMT", tagline: "Goel — Lucknow's Local Choice", color: "#475569",
    initials: "GO", rank: "Lucknow Local",
    products: [
      { name: "Goel 8mm TMT Fe500",   type: "Fe500",  price: "₹62", pack: "per kg", tag: "Local Choice" },
      { name: "Goel 10mm TMT Fe500D", type: "Fe500D", price: "₹61", pack: "per kg", tag: "Best Seller"  },
      { name: "Goel 12mm TMT Fe500D", type: "Fe500D", price: "₹60", pack: "per kg", tag: "Value"        },
      { name: "Goel 16mm TMT Fe500D", type: "Fe500D", price: "₹60", pack: "per kg", tag: ""             },
    ],
  },
];

const TYPE_BADGE: Record<string, string> = {
  OPC: "#1b4366", PPC: "#15803d", RHC: "#d97706", SRC: "#7c3aed", LHC: "#0891b2",
};

function BrandLogo({ brand, size = 48 }: { brand: typeof CEMENT_BRANDS[0]; size?: number }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="rounded-[16px] flex items-center justify-center font-black text-white relative overflow-hidden"
        style={{
          width: size, height: size,
          background: `linear-gradient(145deg, ${brand.color}, ${brand.color}bb)`,
          fontSize: size * 0.28,
          letterSpacing: "0.05em",
          boxShadow: `0 4px 16px ${brand.color}35`,
        }}
      >
        <div className="absolute inset-0 opacity-[0.12]"
          style={{ background: "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)" }} />
        <span className="relative z-10 drop-shadow-sm">{brand.initials}</span>
      </div>
    </div>
  );
}

/* Build a full item-specific Product from a lightweight brand-sheet variant
   so tapping its image opens the shared ProductDetailModal. Cart identity
   (id / category / title) is kept in lockstep with the row's "+ Add" button. */
function brandVariantToProduct(
  category: string,
  brand: { name: string; color: string },
  prod: { name: string; price: string; pack: string; tag?: string; type?: string },
): Product {
  const slug = `brand-${category}-${prod.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const m = (prod.price || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  const price = m ? parseFloat(m[1]) : 0;
  const hero = resolveProductImage(category, prod.name);
  const catLabel = category.charAt(0).toUpperCase() + category.slice(1);
  const specs: ProductSpec[] = [
    { label: "Brand", value: brand.name },
    ...(prod.type ? [{ label: "Grade / Type", value: prod.type }] : []),
    { label: "Pack Size", value: prod.pack },
    { label: "Category", value: catLabel },
    ...(prod.tag ? [{ label: "Highlight", value: prod.tag }] : []),
  ];
  const features = [
    `${brand.name} quality assured`,
    prod.type
      ? `${prod.type} grade — engineered for strength & durability`
      : "Premium grade — engineered for strength & durability",
    `Supplied in ${prod.pack}`,
    "Delivered in 60 minutes by CONON",
  ];
  return {
    id: slug,
    image: hero,
    images: [hero],
    materialTag: category,
    title: prod.name,
    brand: brand.name,
    vendor: brand.name,
    rating: 4.5,
    reviews: 128,
    price,
    mrp: price,
    deliveryEta: "Today · 60 mins",
    unit: prod.pack,
    tag: prod.tag || undefined,
    specs,
    features,
    description:
      `${prod.name} from ${brand.name}. ${prod.type ? prod.type + " grade. " : ""}` +
      `Packed as ${prod.pack} and quality-checked for reliable on-site performance. ` +
      `Order on CONON for delivery in 60 minutes.`,
  };
}

/* Deterministic small hash so synthetic ratings / MRPs are stable per product. */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/* Layer realistic retail signals (rating, reviews, struck-through MRP) onto a
   base Product so the storefront grid shows the Blinkit-style discount, stars
   and review count. Deterministic per product id so the values never jump. */
function withRetail(p: Product): Product {
  const h = hashStr(p.id);
  const ratings = [4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8];
  const rating = ratings[h % ratings.length];
  const reviews = 45 + (h % 1180);
  const markup = 1.08 + ((h % 13) / 100); // 8%–20% above selling price
  const mrp = p.price > 0
    ? Math.max(p.price + 5, Math.round((p.price * markup) / 5) * 5)
    : p.price;
  return { ...p, rating, reviews, mrp };
}

/* Map a STEEL_TYPES entry to a storefront Product (real image + specs). */
function steelTypeToProduct(t: (typeof STEEL_TYPES)[number]): Product {
  const m = (t.price || "").replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  const price = m ? parseFloat(m[1]) : 0;
  return {
    id: `brand-steel-${t.id}`,
    image: t.image,
    images: [t.image],
    materialTag: "steel",
    title: t.name,
    brand: t.short,
    vendor: "CONON Steel",
    rating: 4.5,
    reviews: 128,
    price,
    mrp: price,
    deliveryEta: "Today · 60 mins",
    unit: t.unit,
    tag: t.tag,
    specs: t.specs,
    features: [
      t.keyFeat,
      `Available grades: ${t.grades.join(", ")}`,
      `Best for: ${t.bestFor.join(", ")}`,
    ],
    description: t.desc,
  };
}

/* All storefront-grid products for a category, each with a real local image.
   Cement → CEMENT_BRANDS, steel → STEEL_BRANDS, everything else → ALL_BRAND_DATA.
   Returns [] for categories with no rich local catalog (caller falls back). */
function getCategoryProducts(category: string): Product[] {
  let base: Product[] = [];
  if (category === "cement") {
    base = CEMENT_BRANDS.flatMap((b) => b.products.map((p) => brandVariantToProduct("cement", b, p)));
  } else if (category === "steel") {
    base = STEEL_BRANDS.flatMap((b) => b.products.map((p) => brandVariantToProduct("steel", b, p)));
  } else if (ALL_BRAND_DATA[category]) {
    base = ALL_BRAND_DATA[category].brands.flatMap((b) =>
      b.products.map((p) => brandVariantToProduct(category, b, p)),
    );
  }
  return base.filter((p) => p.price > 0).map(withRetail);
}

/* Categories shown in the storefront's left rail. Must cover every category
   getCategoryProducts() can serve (cement, steel + all ALL_BRAND_DATA keys) so
   the selected section always has an active highlight in the rail. */
const STOREFRONT_CATEGORIES = [
  "cement", "steel", "bricks", "sand", "aggregate", "tiles", "marble-stone", "paint",
  "plumbing", "electrical", "finishing", "hardware", "wood", "adhesives",
  "shuttering", "tools", "safety",
];

/* ── CategoryStorefront — Blinkit-style category browse view ───────────
   Left vertical category rail (active highlight) + right 2-column product
   grid of real items. Opens when the user taps any product section.     */
type SortKey = "relevance" | "price-asc" | "price-desc" | "rating" | "discount";
const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "relevance", label: "Relevance" },
  { key: "price-asc", label: "Price: Low to High" },
  { key: "price-desc", label: "Price: High to Low" },
  { key: "rating", label: "Customer Rating" },
  { key: "discount", label: "Discount" },
];
const PRICE_RANGES: { label: string; min: number; max: number }[] = [
  { label: "Under ₹1,000", min: 0, max: 999 },
  { label: "₹1,000 – ₹10,000", min: 1000, max: 9999 },
  { label: "₹10,000 – ₹50,000", min: 10000, max: 49999 },
  { label: "Above ₹50,000", min: 50000, max: Infinity },
];

function CategoryStorefront({
  category,
  products,
  getQty,
  onAdd,
  onSetQty,
  onOpenDetail,
  isAdding,
  onSelectCategory,
}: {
  category: string;
  products: Product[];
  getQty: (category: string, name: string) => number;
  onAdd: (product: Product) => void;
  onSetQty: (product: Product, qty: number) => void;
  onOpenDetail: (product: Product) => void;
  isAdding: boolean;
  onSelectCategory: (category: string) => void;
}) {
  const [openChip, setOpenChip] = useState<null | "Filters" | "Sort" | "Type" | "Price">(null);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [priceIdx, setPriceIdx] = useState<number | null>(null);
  const [vendors, setVendors] = useState<string[]>([]);
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [onlyAssured, setOnlyAssured] = useState(false);
  const [minRating, setMinRating] = useState(0);

  // Reset all refinements whenever the active category changes.
  React.useEffect(() => {
    setOpenChip(null); setSort("relevance"); setPriceIdx(null);
    setVendors([]); setOnlyDiscount(false); setOnlyAssured(false); setMinRating(0);
  }, [category]);

  const vendorOptions = React.useMemo(
    () => Array.from(new Set(products.map((p) => p.vendor || "CONON Marketplace"))),
    [products],
  );

  const filterCount = (onlyDiscount ? 1 : 0) + (onlyAssured ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const visibleProducts = React.useMemo(() => {
    const range = priceIdx !== null ? PRICE_RANGES[priceIdx] : null;
    const list = products.filter((p) => {
      if (onlyDiscount && !(p.mrp > p.price)) return false;
      if (onlyAssured && !(p.tag || "").toLowerCase().includes("assured")) return false;
      if (minRating > 0 && p.rating < minRating) return false;
      if (vendors.length > 0 && !vendors.includes(p.vendor || "CONON Marketplace")) return false;
      if (range && !(p.price >= range.min && p.price <= range.max)) return false;
      return true;
    });
    const discountOf = (p: Product) => (p.mrp > p.price ? (p.mrp - p.price) / p.mrp : 0);
    switch (sort) {
      case "price-asc":  list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list.sort((a, b) => b.price - a.price); break;
      case "rating":     list.sort((a, b) => b.rating - a.rating); break;
      case "discount":   list.sort((a, b) => discountOf(b) - discountOf(a)); break;
      default: break;
    }
    return list;
  }, [products, sort, priceIdx, vendors, onlyDiscount, onlyAssured, minRating]);

  const chips: { key: "Filters" | "Sort" | "Type" | "Price"; active: boolean; badge?: string }[] = [
    { key: "Filters", active: filterCount > 0, badge: filterCount > 0 ? String(filterCount) : undefined },
    { key: "Sort", active: sort !== "relevance", badge: sort !== "relevance" ? SORT_OPTIONS.find((s) => s.key === sort)?.label : undefined },
    { key: "Type", active: vendors.length > 0, badge: vendors.length > 0 ? String(vendors.length) : undefined },
    { key: "Price", active: priceIdx !== null, badge: priceIdx !== null ? PRICE_RANGES[priceIdx].label : undefined },
  ];

  const toggleVendor = (v: string) =>
    setVendors((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));

  return (
    <div className="-mx-4">
      {/* Filters / Sort / Type / Price bar (functional) */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {chips.map((c) => (
            <button
              key={c.key}
              type="button"
              aria-expanded={openChip === c.key}
              onClick={() => setOpenChip((o) => (o === c.key ? null : c.key))}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border text-[12px] font-bold active:scale-95 transition"
              style={
                c.active
                  ? { borderColor: BLINKIT_GREEN, background: "#eafaef", color: BLINKIT_GREEN }
                  : { borderColor: "#e2e8f0", background: "#fff", color: "#475569" }
              }
            >
              {c.key === "Filters" && c.badge ? `${c.key} · ${c.badge}` : c.active && c.badge ? c.badge : c.key}
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openChip === c.key ? "rotate-180" : ""}`} strokeWidth={2.4} />
            </button>
          ))}
          {(filterCount > 0 || sort !== "relevance" || vendors.length > 0 || priceIdx !== null) && (
            <button
              type="button"
              onClick={() => { setSort("relevance"); setPriceIdx(null); setVendors([]); setOnlyDiscount(false); setOnlyAssured(false); setMinRating(0); setOpenChip(null); }}
              className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold text-rose-600 active:scale-95 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Active chip panel */}
        {openChip && (
          <div className="mt-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            {openChip === "Sort" && (
              <div className="flex flex-col gap-1">
                {SORT_OPTIONS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => { setSort(s.key); setOpenChip(null); }}
                    className="flex items-center justify-between px-2 py-2 rounded-lg text-[13px] font-semibold text-slate-700 active:bg-slate-50"
                  >
                    {s.label}
                    {sort === s.key && <Check className="w-4 h-4" strokeWidth={3} style={{ color: BLINKIT_GREEN }} />}
                  </button>
                ))}
              </div>
            )}

            {openChip === "Price" && (
              <div className="flex flex-col gap-1">
                {PRICE_RANGES.map((r, i) => (
                  <button
                    key={r.label}
                    type="button"
                    onClick={() => { setPriceIdx((cur) => (cur === i ? null : i)); setOpenChip(null); }}
                    className="flex items-center justify-between px-2 py-2 rounded-lg text-[13px] font-semibold text-slate-700 active:bg-slate-50"
                  >
                    {r.label}
                    {priceIdx === i && <Check className="w-4 h-4" strokeWidth={3} style={{ color: BLINKIT_GREEN }} />}
                  </button>
                ))}
              </div>
            )}

            {openChip === "Type" && (
              <div className="flex flex-wrap gap-2">
                {vendorOptions.map((v) => {
                  const on = vendors.includes(v);
                  return (
                    <button
                      key={v}
                      type="button"
                      onClick={() => toggleVendor(v)}
                      className="px-3 py-1.5 rounded-full text-[12px] font-bold border transition active:scale-95"
                      style={on
                        ? { borderColor: BLINKIT_GREEN, background: "#eafaef", color: BLINKIT_GREEN }
                        : { borderColor: "#e2e8f0", background: "#fff", color: "#475569" }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            )}

            {openChip === "Filters" && (
              <div className="flex flex-col gap-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setOnlyDiscount((v) => !v)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-bold border transition active:scale-95"
                    style={onlyDiscount
                      ? { borderColor: BLINKIT_GREEN, background: "#eafaef", color: BLINKIT_GREEN }
                      : { borderColor: "#e2e8f0", background: "#fff", color: "#475569" }}
                  >
                    Discounted
                  </button>
                  <button
                    type="button"
                    onClick={() => setOnlyAssured((v) => !v)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-bold border transition active:scale-95"
                    style={onlyAssured
                      ? { borderColor: BLINKIT_GREEN, background: "#eafaef", color: BLINKIT_GREEN }
                      : { borderColor: "#e2e8f0", background: "#fff", color: "#475569" }}
                  >
                    CONON Assured
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-slate-500">Min rating</span>
                  {[0, 3, 4, 4.5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setMinRating(r)}
                      className="px-2.5 py-1 rounded-lg text-[12px] font-bold border transition active:scale-95"
                      style={minRating === r
                        ? { borderColor: BLINKIT_GREEN, background: "#eafaef", color: BLINKIT_GREEN }
                        : { borderColor: "#e2e8f0", background: "#fff", color: "#475569" }}
                    >
                      {r === 0 ? "Any" : `${r}★+`}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-start">
        {/* Left category rail */}
        <aside className="w-[78px] shrink-0 bg-slate-50 border-r border-slate-100 sticky top-0 self-start max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="py-1.5">
            {STOREFRONT_CATEGORIES.map((cat) => {
              const cfg = CAT_CONFIG[cat];
              const Icon = cfg?.icon ?? Package;
              const isActive = cat === category;
              return (
                <button
                  key={cat}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelectCategory(cat)}
                  className="relative w-full flex flex-col items-center gap-1 py-2.5 px-1 transition"
                  style={{ background: isActive ? "#eafaef" : "transparent" }}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1 bottom-1 w-1.5 rounded-r-full" style={{ background: BLINKIT_GREEN }} />
                  )}
                  <span
                    className="flex items-center justify-center w-11 h-11 rounded-2xl transition"
                    style={{
                      background: isActive ? "#e7f6ea" : "#ffffff",
                      border: isActive ? `1.5px solid ${BLINKIT_GREEN}` : "1px solid #eef2f6",
                    }}
                  >
                    <Icon
                      className="w-[22px] h-[22px]"
                      style={{ color: isActive ? BLINKIT_GREEN : (cfg?.iconColor ?? "#64748b") }}
                      strokeWidth={isActive ? 2.4 : 2}
                    />
                  </span>
                  <span
                    className="text-[9px] font-black leading-tight text-center"
                    style={{ color: isActive ? BRAND_DARK : "#94a3b8" }}
                  >
                    {getCatLabel(cat)}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Right product grid */}
        <main className="flex-1 min-w-0 px-3 pt-1 pb-2">
          {visibleProducts.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center px-4">
              <Package className="w-12 h-12 text-slate-300 mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-black text-slate-700">No products match</p>
              <p className="text-[12px] text-slate-400 mt-1">Try clearing a filter to see more items.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {visibleProducts.map((p) => (
                <CompactProductCard
                  key={p.id}
                  product={p}
                  onAdd={onAdd}
                  onSetQty={onSetQty}
                  onOpenDetail={onOpenDetail}
                  cartQty={getQty(p.materialTag, p.title)}
                  isAdding={isAdding}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function CementCatalog({ onAddProduct, isAdding, getQty, onOpenDetail }: {
  onAddProduct: (opts: { category: string; name: string; priceText: string; unit?: string; vendor?: string; quantity?: number }) => void;
  isAdding: boolean;
  getQty: (category: string, name: string) => number;
  onOpenDetail?: (p: Product) => void;
}) {
  const [tab, setTab]           = useState<"brand" | "type">("brand");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [activeBrand, setActiveBrand] = useState<typeof CEMENT_BRANDS[0] | null>(null);

  return (
    <div className="space-y-4">
      {/* Header banner */}
      <div
        className="p-4 rounded-[24px]"
        style={{ background: "linear-gradient(135deg, #1b2f5c 0%, #1b4366 100%)" }}
      >
        <p className="text-[8px] font-black text-amber-300 uppercase tracking-[0.2em] mb-1">Cement Guide</p>
        <p className="font-display font-black italic text-white text-base leading-tight">
          Shop by Brand or by Type
        </p>
        <p className="text-blue-200/70 text-[9px] mt-1">9 brands · 5 cement types · Full specs inside</p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-2xl">
        {[
          { key: "brand" as const, label: "🏷️ Shop by Brand" },
          { key: "type"  as const, label: "🔬 By Cement Type" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wide transition-all"
            style={{ background: tab === t.key ? BRAND_DARK : "transparent", color: tab === t.key ? "#fff" : "#94a3b8" }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── BRAND GRID ─────────────────────────────────────────────── */}
      {tab === "brand" && (
        <div className="grid grid-cols-3 gap-3">
          {CEMENT_BRANDS.map((brand, i) => (
            <motion.button
              key={brand.id}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setActiveBrand(brand)}
              className="flex flex-col overflow-hidden rounded-[20px] border text-left shadow-sm bg-white"
              style={{ borderColor: brand.color + "25" }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-full h-24 flex items-center justify-center p-3" style={{ background: brand.color + "08" }}>
                <BrandLogo brand={brand} size={56} />
                <div className="absolute top-1.5 right-1.5">
                  <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full text-white"
                    style={{ background: brand.color }}>
                    {brand.products.length}
                  </span>
                </div>
                <div className="absolute bottom-1.5 left-1.5 right-1.5">
                  <span className="text-[6px] font-black uppercase px-1.5 py-0.5 rounded-full block text-center truncate"
                    style={{ background: brand.color + "15", color: brand.color }}>
                    {brand.rank}
                  </span>
                </div>
              </div>
              <div className="p-2 border-t" style={{ borderColor: brand.color + "15" }}>
                <p className="text-[10px] font-black leading-tight text-center" style={{ color: brand.color }}>{brand.name}</p>
                <p className="text-[7px] font-bold text-slate-400 leading-tight mt-0.5 truncate text-center">{brand.tagline}</p>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      {/* ── TYPE GUIDE ─────────────────────────────────────────────── */}
      {tab === "type" && (
        <div className="space-y-3">
          {CEMENT_TYPES.map((ct, i) => {
        const isOpen = expanded === ct.id;
        return (
          <motion.div
            key={ct.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-[28px] overflow-hidden"
            style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
          >
            {/* Hero image strip */}
            <div className="relative h-28 overflow-hidden">
              <img
                src={ct.image}
                alt={ct.name}
                className="w-full h-full object-cover"
                onError={onImgError}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Grade badge */}
              <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                {ct.grades.map(g => (
                  <span key={g}
                    className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full text-white"
                    style={{ background: ct.tagColor }}
                  >
                    {g}
                  </span>
                ))}
              </div>
              <div
                className="absolute top-3 right-3 text-[8px] font-black px-2.5 py-1 rounded-full text-white"
                style={{ background: "rgba(0,0,0,0.45)" }}
              >
                {ct.tag}
              </div>
              {/* Name overlay */}
              <div className="absolute bottom-3 left-4 right-4">
                <p className="font-display font-black italic text-white text-base leading-tight drop-shadow">
                  {ct.short}
                </p>
                <p className="text-white/70 text-[9px] font-bold leading-tight">
                  {ct.name.replace(ct.short + " — ", "")}
                </p>
              </div>
            </div>

            {/* Card body */}
            <div className="p-4">
              {/* Price + CTA row */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-display font-black italic text-lg" style={{ color: BRAND_DARK }}>{ct.price}</span>
                  <span className="text-[9px] text-slate-400 ml-1">{ct.unit}</span>
                </div>
                {(() => {
                  const qty = getQty("cement", ct.short);
                  return (
                    <button
                      onClick={() => onAddProduct({ category: "cement", name: ct.short, priceText: ct.price, unit: ct.unit, vendor: "Cement Marketplace" })}
                      disabled={isAdding}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-[18px] text-white text-[10px] font-black uppercase disabled:opacity-50"
                      style={{ background: BRAND_DARK }}
                    >
                      <Plus className="w-3 h-3" /> Add{qty > 0 ? ` · ${qty}` : ""}
                    </button>
                  );
                })()}
              </div>

              {/* Description */}
              <p className="text-[10px] text-slate-500 leading-relaxed mb-3">{ct.desc}</p>

              {/* Key feature pill */}
              <div
                className="flex items-start gap-2 px-3 py-2 rounded-[14px] mb-3"
                style={{ background: ct.featColor + "12" }}
              >
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: ct.featColor }} />
                <p className="text-[9px] font-black leading-relaxed" style={{ color: ct.featColor }}>
                  {ct.keyFeat}
                </p>
              </div>

              {/* Expand / Collapse */}
              <button
                onClick={() => setExpanded(isOpen ? null : ct.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition"
                style={{ background: "#f8fafc", color: BRAND_DARK }}
              >
                {isOpen ? "Hide Specs" : "View Full Specs"} {isOpen ? "▲" : "▼"}
              </button>

              {/* Expanded section */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-3">
                      {/* Spec table */}
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Specifications</p>
                        <div className="space-y-1.5">
                          {ct.specs.map(s => (
                            <div key={s.label} className="flex justify-between items-start gap-2 py-1.5 px-3 bg-slate-50 rounded-xl">
                              <span className="text-[9px] font-bold text-slate-500 leading-tight">{s.label}</span>
                              <span className="text-[9px] font-black text-slate-800 text-right leading-tight">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Best for */}
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Best For</p>
                        <div className="flex flex-wrap gap-1.5">
                          {ct.bestFor.map(b => (
                            <span
                              key={b}
                              className="text-[8px] font-black px-2.5 py-1 rounded-full text-white"
                              style={{ background: ct.tagColor }}
                            >
                              {b}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
          );
          })}
        </div>
      )}

      {/* ── Brand Drawer ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {activeBrand && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setActiveBrand(null)}
            />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] overflow-hidden"
              style={{ maxHeight: "82vh" }}
            >
              {/* Drawer handle */}
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />

              {/* Brand header */}
              <div className="px-5 pt-2 pb-4 flex items-center justify-between"
                style={{ borderBottom: `2px solid ${activeBrand.color}20` }}>
                <div className="flex items-center gap-3">
                  <BrandLogo brand={activeBrand} size={44} />
                  <div>
                    <p className="font-display font-black italic text-xl" style={{ color: activeBrand.color }}>
                      {activeBrand.name} Cement
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">{activeBrand.tagline}</p>
                  </div>
                </div>
                <button onClick={() => setActiveBrand(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 font-black text-sm">
                  ✕
                </button>
              </div>

              {/* Product list */}
              <div className="overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: "60vh" }}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  {activeBrand.products.length} Products Available
                </p>
                {activeBrand.products.map((prod, pi) => (
                  <motion.div key={pi}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: pi * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-[18px]"
                  >
                    {/* Real product photo — tap to open item-specific details */}
                    <button type="button"
                      onClick={() => onOpenDetail?.(brandVariantToProduct("cement", activeBrand, prod))}
                      aria-label={`View ${prod.name} details`}
                      className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 bg-white border border-slate-100 relative active:scale-95 transition-transform">
                      <img src={resolveProductImage("cement", prod.name)} alt={prod.name} loading="lazy" className="w-full h-full object-cover" onError={onImgError} />
                      <span className="absolute bottom-0 left-0 right-0 text-[6px] font-black text-white text-center py-0.5"
                        style={{ background: TYPE_BADGE[prod.type] ?? "#1b4366" }}>{prod.type}</span>
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-800 leading-tight">{prod.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{prod.pack}</p>
                      {prod.tag ? (
                        <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full text-white mt-1 inline-block"
                          style={{ background: activeBrand.color }}>
                          {prod.tag}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-display font-black italic text-base" style={{ color: BRAND_DARK }}>{prod.price}</span>
                      {(() => {
                        const qty = getQty("cement", prod.name);
                        return (
                          <button
                            onClick={() => onAddProduct({ category: "cement", name: prod.name, priceText: prod.price, unit: "bag", vendor: activeBrand.name })}
                            disabled={isAdding}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-[12px] text-white text-[9px] font-black disabled:opacity-50"
                            style={{ background: activeBrand.color }}
                          >
                            <Plus className="w-2.5 h-2.5" /> Add{qty > 0 ? ` · ${qty}` : ""}
                          </button>
                        );
                      })()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   BRAND DATA FOR ALL CATEGORIES
   ══════════════════════════════════════════════════════════════════════ */

type BrandEntry = {
  id: string; name: string; tagline: string; color: string; initials: string; rank: string;
  products: { name: string; price: string; pack: string; tag: string }[];
};

const ALL_BRAND_DATA: Record<string, { title: string; subtitle: string; gradient: string; brands: BrandEntry[] }> = {

  sand: {
    title: "Sand Suppliers",
    subtitle: "River, M-Sand & Plaster — Verified Sources",
    gradient: "linear-gradient(135deg, #92400e 0%, #d97706 100%)",
    brands: [
      { id: "acc-sand", name: "ACC M-Sand", tagline: "Manufactured Sand — Consistent Grade", color: "#1d4ed8", initials: "AC", rank: "Industry Leader",
        products: [
          { name: "ACC M-Sand (Zone II)", price: "₹55", pack: "per cft", tag: "Best Seller" },
          { name: "ACC P-Sand (Plastering)", price: "₹62", pack: "per cft", tag: "Plastering" },
          { name: "ACC M-Sand (Coarse)", price: "₹50", pack: "per cft", tag: "" },
        ] },
      { id: "robo-sand", name: "Robo Sand", tagline: "Machine-Crushed — Zero Silt", color: "#16a34a", initials: "RS", rank: "Zero Silt",
        products: [
          { name: "Robo Sand Fine Grade", price: "₹52", pack: "per cft", tag: "Popular" },
          { name: "Robo Sand Coarse", price: "₹48", pack: "per cft", tag: "Concrete" },
          { name: "Robo P-Sand Plastering", price: "₹58", pack: "per cft", tag: "" },
        ] },
      { id: "river-sand", name: "River Sand", tagline: "Natural Nadi Baalu — Traditional", color: "#b45309", initials: "NS", rank: "Traditional",
        products: [
          { name: "Fine River Sand (Zone III)", price: "₹65", pack: "per cft", tag: "Premium" },
          { name: "Medium River Sand", price: "₹58", pack: "per cft", tag: "Most Used" },
          { name: "Coarse River Sand", price: "₹52", pack: "per cft", tag: "" },
        ] },
      { id: "ultratech-sand", name: "UltraTech Sand", tagline: "Branded M-Sand — ISI Graded", color: "#ea580c", initials: "UT", rank: "Branded",
        products: [
          { name: "UltraTech M-Sand Zone II", price: "₹58", pack: "per cft", tag: "ISI Graded" },
          { name: "UltraTech P-Sand", price: "₹65", pack: "per cft", tag: "Premium" },
        ] },
      { id: "local-pit", name: "Pit Sand", tagline: "Local Khandaan — Budget Mortar", color: "#78716c", initials: "PS", rank: "Budget",
        products: [
          { name: "Pit Sand (Mortar Grade)", price: "₹38", pack: "per cft", tag: "Economy" },
          { name: "Pit Sand (Fine)", price: "₹42", pack: "per cft", tag: "" },
        ] },
    ],
  },

  aggregate: {
    title: "Aggregate & Gravel",
    subtitle: "Gitti, Morang, Stone Chips — All Sizes",
    gradient: "linear-gradient(135deg, #57534e 0%, #78716c 100%)",
    brands: [
      { id: "acc-agg", name: "ACC Aggregates", tagline: "Graded Stone Chips", color: "#1d4ed8", initials: "AC", rank: "Industry Std.",
        products: [
          { name: "20mm Stone Aggregate", price: "₹42", pack: "per cft", tag: "Most Used" },
          { name: "10mm Stone Chips", price: "₹48", pack: "per cft", tag: "RCC Slab" },
          { name: "40mm Aggregate", price: "₹38", pack: "per cft", tag: "Foundation" },
        ] },
      { id: "local-gitti", name: "Local Gitti", tagline: "Crusher Run — Nearby Quarry", color: "#78716c", initials: "LG", rank: "Local Quarry",
        products: [
          { name: "20mm Crusher Gitti", price: "₹38", pack: "per cft", tag: "Popular" },
          { name: "12mm Stone Chips", price: "₹44", pack: "per cft", tag: "" },
          { name: "40mm Road Gitti", price: "₹34", pack: "per cft", tag: "Road Base" },
          { name: "Dust (Stone Powder)", price: "₹22", pack: "per cft", tag: "Filler" },
        ] },
      { id: "ultratech-agg", name: "UltraTech Aggr.", tagline: "Branded Graded Aggregate", color: "#ea580c", initials: "UT", rank: "Branded",
        products: [
          { name: "UltraTech 20mm Graded", price: "₹46", pack: "per cft", tag: "Premium" },
          { name: "UltraTech 10mm Chips", price: "₹52", pack: "per cft", tag: "" },
        ] },
      { id: "khadi-morang", name: "Morang", tagline: "Coarse Gravel — River Bed", color: "#92400e", initials: "MR", rank: "Traditional",
        products: [
          { name: "River Morang (Coarse)", price: "₹35", pack: "per cft", tag: "Foundation" },
          { name: "Washed Morang", price: "₹40", pack: "per cft", tag: "Clean Grade" },
        ] },
    ],
  },

  bricks: {
    title: "Bricks & Blocks",
    subtitle: "Red Bricks, Fly Ash, AAC Blocks — All Types",
    gradient: "linear-gradient(135deg, #991b1b 0%, #dc2626 100%)",
    brands: [
      { id: "fly-ash", name: "Fly Ash Bricks", tagline: "Eco-Friendly — Lightweight", color: "#6366f1", initials: "FA", rank: "Eco Choice",
        products: [
          { name: "Fly Ash Brick (Standard)", price: "₹7", pack: "per piece", tag: "Best Seller" },
          { name: "Fly Ash Brick (Heavy)", price: "₹9", pack: "per piece", tag: "Load Bearing" },
          { name: "Fly Ash Brick (Interlocking)", price: "₹11", pack: "per piece", tag: "No Plaster" },
        ] },
      { id: "red-brick", name: "Red Clay Brick", tagline: "Traditional Eent — Kiln Fired", color: "#dc2626", initials: "RB", rank: "Traditional",
        products: [
          { name: "First Class Red Brick", price: "₹10", pack: "per piece", tag: "Premium" },
          { name: "Second Class Red Brick", price: "₹7", pack: "per piece", tag: "Budget" },
          { name: "Table Mould Brick", price: "₹8", pack: "per piece", tag: "Most Used" },
        ] },
      { id: "aac-ultratech", name: "UltraTech AAC", tagline: "Autoclaved Aerated Concrete", color: "#ea580c", initials: "UT", rank: "Branded",
        products: [
          { name: "AAC Block 600×200×100mm", price: "₹52", pack: "per piece", tag: "Best Seller" },
          { name: "AAC Block 600×200×150mm", price: "₹72", pack: "per piece", tag: "Partition" },
          { name: "AAC Block 600×200×200mm", price: "₹95", pack: "per piece", tag: "External" },
        ] },
      { id: "magicrete", name: "Magicrete", tagline: "AAC Blocks — Nationwide", color: "#0891b2", initials: "MC", rank: "AAC Leader",
        products: [
          { name: "Magicrete AAC 4 inch", price: "₹50", pack: "per piece", tag: "Popular" },
          { name: "Magicrete AAC 6 inch", price: "₹70", pack: "per piece", tag: "" },
          { name: "Magicrete AAC 8 inch", price: "₹92", pack: "per piece", tag: "External" },
        ] },
      { id: "renacon", name: "Renacon", tagline: "AAC Blocks — Light & Strong", color: "#16a34a", initials: "RC", rank: "Premium",
        products: [
          { name: "Renacon AAC 100mm", price: "₹55", pack: "per piece", tag: "" },
          { name: "Renacon AAC 150mm", price: "₹75", pack: "per piece", tag: "Best Seller" },
          { name: "Renacon AAC 200mm", price: "₹98", pack: "per piece", tag: "Heavy Duty" },
        ] },
      { id: "hollow-block", name: "Concrete Block", tagline: "Hollow & Solid — Machine Made", color: "#475569", initials: "CB", rank: "Industrial",
        products: [
          { name: "Hollow Block 400×200×200mm", price: "₹42", pack: "per piece", tag: "Partition" },
          { name: "Solid Block 400×200×200mm", price: "₹55", pack: "per piece", tag: "Load Bearing" },
          { name: "Half Block 200×200×200mm", price: "₹28", pack: "per piece", tag: "" },
        ] },
    ],
  },

  electrical: {
    title: "Electrical & Wiring",
    subtitle: "Wires, Cables, Switches, Conduits, MCBs, LEDs & Distribution Boards",
    gradient: "linear-gradient(135deg, #854d0e 0%, #eab308 100%)",
    brands: [
      { id: "havells", name: "Havells", tagline: "Lifeline & Life Shield — #1 Wires", color: "#1d4ed8", initials: "HV", rank: "#1 Wires",
        products: [
          { name: "Havells Lifeline 1.0 sq mm", price: "₹1,350", pack: "90m coil", tag: "Lighting" },
          { name: "Havells Lifeline 1.5 sq mm", price: "₹1,850", pack: "90m coil", tag: "Best Seller" },
          { name: "Havells Lifeline 2.5 sq mm", price: "₹2,950", pack: "90m coil", tag: "Power" },
          { name: "Havells Lifeline 4 sq mm", price: "₹4,650", pack: "90m coil", tag: "AC/Geyser" },
          { name: "Havells Life Shield 6 sq mm", price: "₹6,200", pack: "90m coil", tag: "Main Line" },
          { name: "Havells Life Shield 10 sq mm", price: "₹9,800", pack: "90m coil", tag: "Heavy Duty" },
          { name: "Havells 3 Core Flat 1.5mm", price: "₹3,400", pack: "90m coil", tag: "3-Core" },
          { name: "Havells 3 Core Flat 2.5mm", price: "₹5,200", pack: "90m coil", tag: "3-Phase" },
          { name: "Havells MCB SP 16A (C-Type)", price: "₹245", pack: "per piece", tag: "Lighting" },
          { name: "Havells MCB SP 32A (C-Type)", price: "₹285", pack: "per piece", tag: "Power" },
          { name: "Havells MCB DP 40A", price: "₹520", pack: "per piece", tag: "AC Line" },
          { name: "Havells RCCB 40A 30mA DP", price: "₹1,850", pack: "per piece", tag: "Earth Leak" },
        ] },
      { id: "polycab", name: "Polycab", tagline: "Maxima+, Optima & FRLSH Wires", color: "#dc2626", initials: "PC", rank: "#2 Wires",
        products: [
          { name: "Polycab Maxima+ 1.0 sq mm", price: "₹1,450", pack: "90m coil", tag: "Premium" },
          { name: "Polycab Maxima+ 1.5 sq mm", price: "₹1,950", pack: "90m coil", tag: "Best Seller" },
          { name: "Polycab Maxima+ 2.5 sq mm", price: "₹3,100", pack: "90m coil", tag: "Power Line" },
          { name: "Polycab Maxima+ 4 sq mm", price: "₹4,800", pack: "90m coil", tag: "AC/Geyser" },
          { name: "Polycab Maxima+ 6 sq mm", price: "₹6,800", pack: "90m coil", tag: "Main Line" },
          { name: "Polycab Optima 1.5 sq mm", price: "₹1,750", pack: "90m coil", tag: "Value" },
          { name: "Polycab Optima 2.5 sq mm", price: "₹2,800", pack: "90m coil", tag: "Popular" },
          { name: "Polycab Optima 4 sq mm", price: "₹4,400", pack: "90m coil", tag: "" },
          { name: "Polycab 3 Core Flat 1.5mm", price: "₹3,200", pack: "90m coil", tag: "3-Core" },
          { name: "Polycab 3 Core Flat 2.5mm", price: "₹4,900", pack: "90m coil", tag: "3-Phase" },
          { name: "Polycab FRLSH 1.5 sq mm", price: "₹2,100", pack: "90m coil", tag: "Low Smoke" },
          { name: "Polycab Submersible Flat 3C", price: "₹5,500", pack: "100m coil", tag: "Borewell" },
        ] },
      { id: "finolex", name: "Finolex", tagline: "FR Wires — Since 1958", color: "#16a34a", initials: "FX", rank: "Trusted",
        products: [
          { name: "Finolex FR 1.0 sq mm", price: "₹1,280", pack: "90m coil", tag: "Lighting" },
          { name: "Finolex FR 1.5 sq mm", price: "₹1,680", pack: "90m coil", tag: "FR Rated" },
          { name: "Finolex FR 2.5 sq mm", price: "₹2,700", pack: "90m coil", tag: "Best Seller" },
          { name: "Finolex FR 4 sq mm", price: "₹4,200", pack: "90m coil", tag: "AC/Geyser" },
          { name: "Finolex FR 6 sq mm", price: "₹6,100", pack: "90m coil", tag: "Main Line" },
          { name: "Finolex 3 Core 1.5mm", price: "₹3,100", pack: "90m coil", tag: "3-Core" },
        ] },
      { id: "rr-kabel", name: "RR Kabel", tagline: "Superex FR & FRLSH Wires", color: "#0d9488", initials: "RR", rank: "FR Specialist",
        products: [
          { name: "RR Kabel Superex 1.5 sq mm", price: "₹1,700", pack: "90m coil", tag: "FR" },
          { name: "RR Kabel Superex 2.5 sq mm", price: "₹2,750", pack: "90m coil", tag: "Popular" },
          { name: "RR Kabel Superex 4 sq mm", price: "₹4,350", pack: "90m coil", tag: "AC/Geyser" },
          { name: "RR Kabel Superex 6 sq mm", price: "₹6,000", pack: "90m coil", tag: "Main" },
          { name: "RR Kabel FRLSH 1.5 sq mm", price: "₹2,050", pack: "90m coil", tag: "Low Smoke" },
        ] },
      { id: "anchor", name: "Anchor Roma", tagline: "Roma Plus — Switches, Sockets & Plates", color: "#7c3aed", initials: "AN", rank: "#1 Switches",
        products: [
          { name: "Anchor Roma 6A 1-Way Switch", price: "₹45", pack: "per piece", tag: "Most Used" },
          { name: "Anchor Roma 6A 2-Way Switch", price: "₹58", pack: "per piece", tag: "Staircase" },
          { name: "Anchor Roma 16A Switch", price: "₹68", pack: "per piece", tag: "AC/Geyser" },
          { name: "Anchor Roma 6A Socket (5-Pin)", price: "₹55", pack: "per piece", tag: "Standard" },
          { name: "Anchor Roma 16A Socket (3-Pin)", price: "₹72", pack: "per piece", tag: "Heavy Plug" },
          { name: "Anchor Roma USB Charger 2.1A", price: "₹280", pack: "per piece", tag: "USB" },
          { name: "Anchor Roma Fan Regulator", price: "₹220", pack: "per piece", tag: "Speed" },
          { name: "Anchor Roma TV Socket", price: "₹95", pack: "per piece", tag: "Antenna" },
          { name: "Anchor Roma Bell Push", price: "₹55", pack: "per piece", tag: "Door Bell" },
          { name: "Anchor Modular Plate 2M", price: "₹55", pack: "per piece", tag: "" },
          { name: "Anchor Modular Plate 4M", price: "₹85", pack: "per piece", tag: "Popular" },
          { name: "Anchor Modular Plate 6M", price: "₹110", pack: "per piece", tag: "Combo" },
          { name: "Anchor Modular Plate 8M", price: "₹145", pack: "per piece", tag: "Large" },
        ] },
      { id: "legrand", name: "Legrand Myrius", tagline: "Myrius — Premium Switches & MCBs", color: "#ea580c", initials: "LG", rank: "Premium",
        products: [
          { name: "Legrand Myrius 6A 1-Way Switch", price: "₹72", pack: "per piece", tag: "Premium" },
          { name: "Legrand Myrius 6A 2-Way Switch", price: "₹88", pack: "per piece", tag: "Staircase" },
          { name: "Legrand Myrius 16A Switch", price: "₹98", pack: "per piece", tag: "AC/Geyser" },
          { name: "Legrand Myrius 6A Socket (5-Pin)", price: "₹82", pack: "per piece", tag: "" },
          { name: "Legrand Myrius 16A Socket", price: "₹110", pack: "per piece", tag: "Heavy" },
          { name: "Legrand Myrius USB C Charger", price: "₹420", pack: "per piece", tag: "Type-C" },
          { name: "Legrand Myrius Fan Regulator", price: "₹350", pack: "per piece", tag: "Electronic" },
          { name: "Legrand Myrius Plate 2M", price: "₹85", pack: "per piece", tag: "" },
          { name: "Legrand Myrius Plate 4M", price: "₹125", pack: "per piece", tag: "Popular" },
          { name: "Legrand Myrius Plate 6M", price: "₹165", pack: "per piece", tag: "" },
          { name: "Legrand SP MCB 16A (C-Type)", price: "₹275", pack: "per piece", tag: "Lighting" },
          { name: "Legrand SP MCB 32A (C-Type)", price: "₹310", pack: "per piece", tag: "Power" },
          { name: "Legrand DP MCB 40A", price: "₹580", pack: "per piece", tag: "Main Line" },
          { name: "Legrand RCCB 40A 30mA DP", price: "₹1,950", pack: "per piece", tag: "Earth Leak" },
        ] },
      { id: "vip-conduit", name: "VIP / Precision", tagline: "PVC Conduit Pipes, Metal Boxes & Accessories", color: "#475569", initials: "VP", rank: "Conduit",
        products: [
          { name: "VIP PVC Conduit 20mm (3m)", price: "₹42", pack: "per 3m pipe", tag: "Most Used" },
          { name: "VIP PVC Conduit 25mm (3m)", price: "₹55", pack: "per 3m pipe", tag: "Power Line" },
          { name: "VIP PVC Conduit 32mm (3m)", price: "₹72", pack: "per 3m pipe", tag: "Main Line" },
          { name: "VIP Flexible Conduit 20mm (25m)", price: "₹280", pack: "25m roll", tag: "Flexible" },
          { name: "VIP Conduit Bend 20mm", price: "₹8", pack: "per piece", tag: "Bend" },
          { name: "VIP Conduit Coupler 20mm", price: "₹5", pack: "per piece", tag: "Jointer" },
          { name: "VIP Conduit Deep Junction Box", price: "₹28", pack: "per piece", tag: "Junction" },
          { name: "GI Metal Box 3M (Modular)", price: "₹35", pack: "per piece", tag: "Flush Mount" },
          { name: "GI Metal Box 4M (Modular)", price: "₹42", pack: "per piece", tag: "Popular" },
          { name: "GI Metal Box 6M (Modular)", price: "₹55", pack: "per piece", tag: "Combo" },
          { name: "GI Metal Box 8M (Modular)", price: "₹68", pack: "per piece", tag: "Large" },
          { name: "GI Metal Box 12M / 18M Gang", price: "₹120", pack: "per piece", tag: "Distribution" },
          { name: "PVC Fan Box (Octagonal)", price: "₹22", pack: "per piece", tag: "Ceiling Fan" },
          { name: "Conduit Clamp/Saddle 20mm (50pc)", price: "₹85", pack: "pack of 50", tag: "Fixing" },
        ] },
      { id: "led-lights", name: "LED Lighting", tagline: "Havells, Philips, Wipro & Syska LEDs", color: "#f59e0b", initials: "LD", rank: "Lighting",
        products: [
          { name: "Havells LED Bulb 9W (Cool)", price: "₹85", pack: "per piece", tag: "Best Seller" },
          { name: "Havells LED Bulb 12W (Warm)", price: "₹110", pack: "per piece", tag: "Living Room" },
          { name: "Havells LED Bulb 15W (Cool)", price: "₹135", pack: "per piece", tag: "Bright" },
          { name: "Philips LED Bulb 9W (B22)", price: "₹80", pack: "per piece", tag: "Popular" },
          { name: "Philips LED Bulb 12W (B22)", price: "₹105", pack: "per piece", tag: "" },
          { name: "Philips LED Tube 20W (4ft)", price: "₹220", pack: "per piece", tag: "Tube Light" },
          { name: "Wipro LED Panel 12W (Round)", price: "₹320", pack: "per piece", tag: "Ceiling" },
          { name: "Wipro LED Panel 18W (Square)", price: "₹450", pack: "per piece", tag: "False Ceiling" },
          { name: "Syska LED Downlight 7W", price: "₹180", pack: "per piece", tag: "Recessed" },
          { name: "Syska LED Downlight 12W", price: "₹280", pack: "per piece", tag: "" },
          { name: "Havells LED Flood 50W", price: "₹1,200", pack: "per piece", tag: "Outdoor" },
          { name: "Havells LED Flood 100W", price: "₹2,200", pack: "per piece", tag: "Site Light" },
          { name: "LED Strip Light 5m (Warm)", price: "₹350", pack: "5m roll", tag: "Decorative" },
          { name: "LED Strip Light 5m (RGB)", price: "₹580", pack: "5m roll", tag: "Color" },
        ] },
      { id: "db-boards", name: "Distribution Boards", tagline: "DB Boxes, TPN, SPN & Accessories", color: "#1e3a5f", initials: "DB", rank: "Distribution",
        products: [
          { name: "Havells SPN DB 4-Way (MCB)", price: "₹580", pack: "per piece", tag: "Small Home" },
          { name: "Havells SPN DB 8-Way (MCB)", price: "₹850", pack: "per piece", tag: "Best Seller" },
          { name: "Havells SPN DB 12-Way (MCB)", price: "₹1,200", pack: "per piece", tag: "Large Home" },
          { name: "Havells TPN DB 4-Way (3-Phase)", price: "₹1,800", pack: "per piece", tag: "3-Phase" },
          { name: "Havells TPN DB 8-Way (3-Phase)", price: "₹2,800", pack: "per piece", tag: "Commercial" },
          { name: "Legrand SPN DB 8-Way", price: "₹950", pack: "per piece", tag: "Premium" },
          { name: "Legrand TPN DB 4-Way", price: "₹2,100", pack: "per piece", tag: "" },
          { name: "Havells Changeover Switch 63A", price: "₹1,500", pack: "per piece", tag: "DG/Inverter" },
          { name: "Havells Isolator DP 40A", price: "₹420", pack: "per piece", tag: "Main Switch" },
          { name: "Bus Bar 4-Way (Copper)", price: "₹180", pack: "per piece", tag: "Connecting" },
          { name: "Earth Bar (Copper) 8-Way", price: "₹220", pack: "per piece", tag: "Earthing" },
          { name: "Cable Gland PG-21 (Pack 10)", price: "₹150", pack: "pack of 10", tag: "Gland" },
        ] },
    ],
  },

  plumbing: {
    title: "Plumbing & Sanitary",
    subtitle: "CPVC, PVC, GI Pipes, Fittings, Bath Fixtures, Tanks & Solvent",
    gradient: "linear-gradient(135deg, #155e75 0%, #0891b2 100%)",
    brands: [
      { id: "astral", name: "Astral Pipes", tagline: "CPVC & uPVC Leader — #1", color: "#1d4ed8", initials: "AS", rank: "#1 CPVC",
        products: [
          { name: "Astral CPVC ½ inch (3m)", price: "₹185", pack: "per 3m pipe", tag: "Best Seller" },
          { name: "Astral CPVC ¾ inch (3m)", price: "₹265", pack: "per 3m pipe", tag: "Hot Water" },
          { name: "Astral CPVC 1 inch (3m)", price: "₹380", pack: "per 3m pipe", tag: "Main Line" },
          { name: "Astral uPVC 4 inch SWR (3m)", price: "₹420", pack: "per 3m pipe", tag: "Drainage" },
          { name: "Astral uPVC 3 inch SWR (3m)", price: "₹295", pack: "per 3m pipe", tag: "Waste" },
          { name: "Astral CPVC Elbow ½\"", price: "₹18", pack: "per piece", tag: "Fitting" },
          { name: "Astral CPVC Tee ½\"", price: "₹22", pack: "per piece", tag: "Fitting" },
          { name: "Astral CPVC MTA ½\"", price: "₹28", pack: "per piece", tag: "Male Adapt." },
          { name: "Astral CPVC FTA ½\"", price: "₹32", pack: "per piece", tag: "Female Adapt." },
          { name: "Astral CPVC Valve ½\"", price: "₹95", pack: "per piece", tag: "Ball Valve" },
        ] },
      { id: "ashirvad", name: "Ashirvad (Aliaxis)", tagline: "CPVC FlowGuard Plus — Premium", color: "#dc2626", initials: "AV", rank: "#2 CPVC",
        products: [
          { name: "Ashirvad CPVC ½ inch (3m)", price: "₹178", pack: "per 3m pipe", tag: "Best Seller" },
          { name: "Ashirvad CPVC ¾ inch (3m)", price: "₹255", pack: "per 3m pipe", tag: "Hot Water" },
          { name: "Ashirvad CPVC 1 inch (3m)", price: "₹365", pack: "per 3m pipe", tag: "Main" },
          { name: "Ashirvad uPVC 4 inch SWR", price: "₹410", pack: "per 3m pipe", tag: "Drainage" },
          { name: "Ashirvad CPVC Elbow ½\"", price: "₹16", pack: "per piece", tag: "Fitting" },
          { name: "Ashirvad CPVC Tee ½\"", price: "₹20", pack: "per piece", tag: "Fitting" },
          { name: "Ashirvad CPVC Solvent 100ml", price: "₹85", pack: "100ml tube", tag: "Solvent" },
          { name: "Ashirvad 3-Layer Tank 500L", price: "₹3,800", pack: "per piece", tag: "Overhead" },
          { name: "Ashirvad 3-Layer Tank 1000L", price: "₹6,500", pack: "per piece", tag: "Best Seller" },
          { name: "Ashirvad 3-Layer Tank 2000L", price: "₹11,500", pack: "per piece", tag: "Large" },
        ] },
      { id: "supreme", name: "Supreme", tagline: "India's Largest Pipe Maker", color: "#16a34a", initials: "SP", rank: "#1 PVC",
        products: [
          { name: "Supreme PVC 4 inch SWR (3m)", price: "₹395", pack: "per 3m pipe", tag: "Best Seller" },
          { name: "Supreme PVC 3 inch SWR (3m)", price: "₹275", pack: "per 3m pipe", tag: "Waste" },
          { name: "Supreme CPVC ½ inch (3m)", price: "₹175", pack: "per 3m pipe", tag: "Hot Water" },
          { name: "Supreme uPVC 2 inch (3m)", price: "₹195", pack: "per 3m pipe", tag: "Waste" },
          { name: "Supreme PVC Elbow 4\"", price: "₹42", pack: "per piece", tag: "" },
          { name: "Supreme PVC Tee 4\"", price: "₹55", pack: "per piece", tag: "Junction" },
        ] },
      { id: "prince", name: "Prince Pipes", tagline: "Triple Layer — Durable", color: "#d97706", initials: "PP", rank: "Durable",
        products: [
          { name: "Prince CPVC ½ inch (3m)", price: "₹170", pack: "per 3m pipe", tag: "Value" },
          { name: "Prince CPVC ¾ inch (3m)", price: "₹250", pack: "per 3m pipe", tag: "" },
          { name: "Prince SWR 4 inch (3m)", price: "₹380", pack: "per 3m pipe", tag: "Popular" },
          { name: "Prince SWR 3 inch (3m)", price: "₹265", pack: "per 3m pipe", tag: "" },
        ] },
      { id: "finolex-pipes", name: "Finolex Pipes", tagline: "PVC & CPVC — Trusted", color: "#475569", initials: "FX", rank: "Trusted",
        products: [
          { name: "Finolex CPVC ½ inch (3m)", price: "₹168", pack: "per 3m pipe", tag: "" },
          { name: "Finolex PVC 4 inch SWR (3m)", price: "₹385", pack: "per 3m pipe", tag: "Drainage" },
          { name: "Finolex uPVC 1 inch (3m)", price: "₹145", pack: "per 3m pipe", tag: "" },
        ] },
      { id: "jaquar", name: "Jaquar", tagline: "Florentine Prime, Showers & Diverters", color: "#0d9488", initials: "JQ", rank: "Premium",
        products: [
          { name: "Jaquar Florentine Prime Basin Mixer", price: "₹5,800", pack: "per piece", tag: "Premium" },
          { name: "Jaquar Florentine Prime Diverter", price: "₹6,200", pack: "per piece", tag: "Bath/Shower" },
          { name: "Jaquar Florentine Pillar Cock", price: "₹2,400", pack: "per piece", tag: "Basin" },
          { name: "Jaquar Single Lever Basin Mixer", price: "₹4,800", pack: "per piece", tag: "Modern" },
          { name: "Jaquar Overhead Shower 200mm", price: "₹2,200", pack: "per piece", tag: "Rain" },
          { name: "Jaquar Hand Shower Set", price: "₹1,800", pack: "per set", tag: "Shower" },
          { name: "Jaquar Angular Stop Cock", price: "₹850", pack: "per piece", tag: "Best Seller" },
          { name: "Jaquar Bottle Trap (Chrome)", price: "₹1,200", pack: "per piece", tag: "Basin" },
          { name: "Jaquar Concealed Stop Cock", price: "₹1,500", pack: "per piece", tag: "Wall Mount" },
        ] },
      { id: "hindware", name: "Hindware", tagline: "Sanitaryware, EWC & Basins", color: "#7c3aed", initials: "HW", rank: "Bath Leader",
        products: [
          { name: "Hindware EWC Combo (S-Trap)", price: "₹8,500", pack: "set", tag: "Best Seller" },
          { name: "Hindware EWC Combo (P-Trap)", price: "₹8,800", pack: "set", tag: "Wall Outlet" },
          { name: "Hindware Wall Hung EWC", price: "₹12,500", pack: "per piece", tag: "Premium" },
          { name: "Hindware Counter Top Basin", price: "₹3,200", pack: "per piece", tag: "Popular" },
          { name: "Hindware Pedestal Wash Basin", price: "₹2,800", pack: "per piece", tag: "Full Set" },
          { name: "Hindware Pillar Cock (Chrome)", price: "₹1,100", pack: "per piece", tag: "" },
          { name: "Hindware Health Faucet", price: "₹650", pack: "per piece", tag: "Jet Spray" },
          { name: "Hindware Bottle Trap", price: "₹850", pack: "per piece", tag: "Basin" },
        ] },
      { id: "vip-solvent", name: "VIP / Ashirvad Solvent", tagline: "PVC/CPVC Solvent Cement & Teflon", color: "#b45309", initials: "VS", rank: "Solvent",
        products: [
          { name: "Ashirvad CPVC Solvent 100ml", price: "₹85", pack: "100ml tube", tag: "Best Seller" },
          { name: "Ashirvad CPVC Solvent 250ml", price: "₹180", pack: "250ml tin", tag: "" },
          { name: "VIP PVC Solvent 100ml", price: "₹55", pack: "100ml tube", tag: "PVC Pipes" },
          { name: "VIP PVC Solvent 500ml", price: "₹220", pack: "500ml tin", tag: "Large" },
          { name: "Teflon Tape ½\" (Pack 10)", price: "₹120", pack: "pack of 10", tag: "Essential" },
          { name: "Teflon Tape 1\" (Pack 5)", price: "₹95", pack: "pack of 5", tag: "GI Joints" },
          { name: "Pipe Cutter (PVC/CPVC)", price: "₹280", pack: "per piece", tag: "Tool" },
        ] },
    ],
  },

  paint: {
    title: "Paints & Coatings",
    subtitle: "Interior, Exterior, Primers, Putty, Texture, Waterproofing & Brushes",
    gradient: "linear-gradient(135deg, #4338ca 0%, #7c3aed 100%)",
    brands: [
      { id: "asian-paints", name: "Asian Paints", tagline: "#1 — Royale, Premium, Tractor, Ace", color: "#dc2626", initials: "AP", rank: "#1 in India",
        products: [
          { name: "Royale Luxury Emulsion 20L", price: "₹8,500", pack: "20L bucket", tag: "Ultra Premium" },
          { name: "Royale Shyne Emulsion 20L", price: "₹6,200", pack: "20L bucket", tag: "Sheen Finish" },
          { name: "Royale Health Shield 10L", price: "₹5,800", pack: "10L bucket", tag: "Anti-Bacterial" },
          { name: "Apcolite Premium Emulsion 20L", price: "₹5,400", pack: "20L bucket", tag: "Premium" },
          { name: "Apcolite Premium Gloss 20L", price: "₹5,800", pack: "20L bucket", tag: "High Gloss" },
          { name: "Tractor Emulsion 20L", price: "₹3,200", pack: "20L bucket", tag: "Best Seller" },
          { name: "Tractor Shyne Emulsion 20L", price: "₹3,800", pack: "20L bucket", tag: "Sheen" },
          { name: "Tractor Distemper 20kg", price: "₹1,400", pack: "20kg bucket", tag: "Economy" },
          { name: "Ace Exterior Emulsion 20L", price: "₹4,800", pack: "20L bucket", tag: "Exterior" },
          { name: "Ace Interior Emulsion 20L", price: "₹3,600", pack: "20L bucket", tag: "Mid Range" },
          { name: "Apex Ultima Exterior 20L", price: "₹6,900", pack: "20L bucket", tag: "Weather Guard" },
          { name: "Apex Advanced Exterior 20L", price: "₹5,200", pack: "20L bucket", tag: "Exterior" },
          { name: "Asian Primer (Decoprime) 20L", price: "₹2,200", pack: "20L bucket", tag: "Primer" },
          { name: "Asian Cement Primer 20L", price: "₹1,800", pack: "20L bucket", tag: "New Wall" },
          { name: "SmartCare Damp Proof 20kg", price: "₹6,500", pack: "20kg bucket", tag: "Waterproof" },
          { name: "SmartCare Damp Block 20L", price: "₹4,200", pack: "20L bucket", tag: "Damp Wall" },
        ] },
      { id: "birla-white-paint", name: "Birla White", tagline: "WallCare Putty, WallSeal & White Cement", color: "#ea580c", initials: "BW", rank: "Putty Leader",
        products: [
          { name: "WallCare Putty 40kg", price: "₹850", pack: "40kg bag", tag: "Best Seller" },
          { name: "WallCare Putty 20kg", price: "₹450", pack: "20kg bag", tag: "Small Pack" },
          { name: "WallCare Putty 5kg", price: "₹140", pack: "5kg bag", tag: "Touch-Up" },
          { name: "WallSeal Waterproof Putty 40kg", price: "₹1,050", pack: "40kg bag", tag: "Waterproof" },
          { name: "WallSeal Waterproof Putty 20kg", price: "₹560", pack: "20kg bag", tag: "" },
          { name: "Birla White Cement 50kg", price: "₹520", pack: "50kg bag", tag: "White Cement" },
          { name: "Birla White Cement 5kg", price: "₹80", pack: "5kg bag", tag: "Small" },
          { name: "LevelPlast Gypsum Plaster 25kg", price: "₹680", pack: "25kg bag", tag: "Levelling" },
          { name: "Birla Textura (Texture Finish)", price: "₹3,200", pack: "20kg bucket", tag: "Texture" },
        ] },
      { id: "berger", name: "Berger Paints", tagline: "Silk Glamor, WeatherCoat, Bison", color: "#1d4ed8", initials: "BP", rank: "#2 Brand",
        products: [
          { name: "Berger Silk Glamor 20L", price: "₹7,200", pack: "20L bucket", tag: "Ultra Smooth" },
          { name: "Berger Silk Emulsion 20L", price: "₹4,800", pack: "20L bucket", tag: "Smooth Finish" },
          { name: "Berger Easy Clean 20L", price: "₹5,600", pack: "20L bucket", tag: "Washable" },
          { name: "WeatherCoat All Guard 20L", price: "₹5,800", pack: "20L bucket", tag: "Ext. Premium" },
          { name: "WeatherCoat Long Life 20L", price: "₹4,500", pack: "20L bucket", tag: "Exterior" },
          { name: "WeatherCoat Anti-Dust 20L", price: "₹4,200", pack: "20L bucket", tag: "Dust Repel" },
          { name: "Berger Bison Distemper 20kg", price: "₹1,800", pack: "20kg bucket", tag: "Budget" },
          { name: "Berger PU Primer 20L", price: "₹2,400", pack: "20L bucket", tag: "Primer" },
          { name: "Berger WP Primer 20L", price: "₹2,800", pack: "20L bucket", tag: "Waterproof" },
          { name: "Berger Walmasta Putty 40kg", price: "₹880", pack: "40kg bag", tag: "Putty" },
        ] },
      { id: "nerolac", name: "Nerolac", tagline: "Kansai Nerolac — Beauty, Excel, Suraksha", color: "#16a34a", initials: "NR", rank: "#3 Brand",
        products: [
          { name: "Nerolac Beauty Smooth 20L", price: "₹4,200", pack: "20L bucket", tag: "Interior" },
          { name: "Nerolac Impressions 20L", price: "₹6,800", pack: "20L bucket", tag: "Premium" },
          { name: "Nerolac Beauty Gold 20L", price: "₹5,200", pack: "20L bucket", tag: "Rich Finish" },
          { name: "Nerolac Excel Total 20L", price: "₹5,100", pack: "20L bucket", tag: "Exterior" },
          { name: "Nerolac Excel Mica Marble 20L", price: "₹5,800", pack: "20L bucket", tag: "Texture" },
          { name: "Nerolac Suraksha Distemper 20kg", price: "₹1,600", pack: "20kg bucket", tag: "Economy" },
          { name: "Nerolac Primer 20L", price: "₹2,000", pack: "20L bucket", tag: "Base Coat" },
          { name: "Nerolac Putty (N-Sure) 40kg", price: "₹820", pack: "40kg bag", tag: "Putty" },
        ] },
      { id: "dulux", name: "Dulux", tagline: "AkzoNobel — Velvet Touch, Weathershield", color: "#7c3aed", initials: "DX", rank: "International",
        products: [
          { name: "Dulux Velvet Touch Platinum 10L", price: "₹5,200", pack: "10L bucket", tag: "Ultra Luxury" },
          { name: "Dulux Velvet Touch 10L", price: "₹4,100", pack: "10L bucket", tag: "Premium" },
          { name: "Dulux Velvet Touch Matt 10L", price: "₹3,400", pack: "10L bucket", tag: "Matt Finish" },
          { name: "Dulux Weathershield Max 10L", price: "₹3,800", pack: "10L bucket", tag: "Exterior" },
          { name: "Dulux Weathershield Pro 10L", price: "₹4,800", pack: "10L bucket", tag: "Ext. Premium" },
          { name: "Dulux Super Cover 10L", price: "₹2,600", pack: "10L bucket", tag: "Value" },
          { name: "Dulux Primer 10L", price: "₹1,600", pack: "10L bucket", tag: "Primer" },
        ] },
      { id: "indigo", name: "Indigo Paints", tagline: "Metallic, Tile Coat & Ceiling", color: "#ea580c", initials: "IP", rank: "Specialty",
        products: [
          { name: "Indigo Lamituff 20L", price: "₹5,800", pack: "20L bucket", tag: "Exterior" },
          { name: "Indigo Glitter Paint 4L", price: "₹3,200", pack: "4L tin", tag: "Glitter" },
          { name: "Indigo Metal Coat 4L", price: "₹2,200", pack: "4L tin", tag: "Metallic" },
          { name: "Indigo Tile Coat 4L", price: "₹1,800", pack: "4L tin", tag: "Tile Refresh" },
          { name: "Indigo Ceiling Coat 10L", price: "₹1,800", pack: "10L bucket", tag: "Ceiling" },
          { name: "Indigo Floor Coat 10L", price: "₹2,400", pack: "10L bucket", tag: "Floor" },
        ] },
      { id: "dr-fixit", name: "Dr. Fixit", tagline: "Waterproofing Specialist — Pidilite", color: "#0d9488", initials: "DF", rank: "Waterproof",
        products: [
          { name: "Dr. Fixit Raincoat 20L", price: "₹4,200", pack: "20L bucket", tag: "Best Seller" },
          { name: "Dr. Fixit Newcoat 20kg", price: "₹5,800", pack: "20kg bucket", tag: "Terrace" },
          { name: "Dr. Fixit Pidicrete URP 1L", price: "₹320", pack: "1L bottle", tag: "Additive" },
          { name: "Dr. Fixit Dampguard 20kg", price: "₹3,500", pack: "20kg bucket", tag: "Int. Walls" },
          { name: "Dr. Fixit Krystalline 25kg", price: "₹4,800", pack: "25kg bag", tag: "Basement" },
          { name: "Dr. Fixit Fastflex 20kg", price: "₹6,200", pack: "20kg bucket", tag: "Bathrooms" },
        ] },
      { id: "textures", name: "Texture Finishes", tagline: "Rustic, Stone, Metallic & Designer Walls", color: "#b45309", initials: "TF", rank: "Design Walls",
        products: [
          { name: "Asian Royale Play Ragging 10L", price: "₹6,800", pack: "10L kit", tag: "Ragging" },
          { name: "Asian Royale Play Safari 10L", price: "₹7,200", pack: "10L kit", tag: "Safari" },
          { name: "Asian Royale Play Stucco 10L", price: "₹7,500", pack: "10L kit", tag: "Italian" },
          { name: "Berger Silk Illusions Marble", price: "₹5,200", pack: "5L kit", tag: "Marble Look" },
          { name: "Nerolac Excel Mica Marble 10L", price: "₹4,800", pack: "10L kit", tag: "Shimmer" },
          { name: "AGL Stone Texture 25kg", price: "₹3,800", pack: "25kg bucket", tag: "Exterior" },
        ] },
      { id: "brushes-tools", name: "Brushes & Rollers", tagline: "Paint Brushes, Rollers, Trays & Tape", color: "#475569", initials: "BR", rank: "Painting Tools",
        products: [
          { name: "Premium Roller 9\" + Frame", price: "₹220", pack: "per set", tag: "Best Seller" },
          { name: "Mini Roller 4\" (Corners)", price: "₹90", pack: "per piece", tag: "Detail Work" },
          { name: "Flat Brush 4\" (Asian/Berger)", price: "₹120", pack: "per piece", tag: "Trim" },
          { name: "Flat Brush 2\" (Touch-Up)", price: "₹55", pack: "per piece", tag: "Touch-Up" },
          { name: "Paint Tray + Liner Set", price: "₹180", pack: "per set", tag: "Essential" },
          { name: "Masking Tape 1\" × 20m", price: "₹80", pack: "per roll", tag: "Taping" },
          { name: "Masking Tape 2\" × 20m", price: "₹140", pack: "per roll", tag: "Wide" },
          { name: "Sand Paper Pack (60/120/220)", price: "₹95", pack: "pack of 10", tag: "Sanding" },
          { name: "Putty Blade / Scraper 6\"", price: "₹110", pack: "per piece", tag: "Putty Tool" },
        ] },
    ],
  },

  tiles: {
    title: "Tiles, Adhesives & Grouts",
    subtitle: "Vitrified, GVT, Marble, Tile Adhesives, Grouts, Spacers & Cleaners",
    gradient: "linear-gradient(135deg, #581c87 0%, #a855f7 100%)",
    brands: [
      { id: "kajaria", name: "Kajaria", tagline: "India's #1 Tile Brand — GVT, PGVT", color: "#dc2626", initials: "KJ", rank: "#1 Tiles",
        products: [
          { name: "Kajaria Vitrified 2×2 ft", price: "₹55", pack: "per sq ft", tag: "Best Seller" },
          { name: "Kajaria GVT 4×2 ft", price: "₹72", pack: "per sq ft", tag: "Large Format" },
          { name: "Kajaria PGVT 4×2 ft (Polished)", price: "₹88", pack: "per sq ft", tag: "High Gloss" },
          { name: "Kajaria Wall Tile 1×1.5 ft", price: "₹42", pack: "per sq ft", tag: "Kitchen" },
          { name: "Kajaria Anti-Skid 1×1 ft", price: "₹48", pack: "per sq ft", tag: "Bathroom" },
          { name: "Kajaria Outdoor/Parking 1×1 ft", price: "₹38", pack: "per sq ft", tag: "Exterior" },
          { name: "Kajaria Step & Riser Set", price: "₹90", pack: "per running ft", tag: "Staircase" },
        ] },
      { id: "somany", name: "Somany", tagline: "Durastone, Grande & Slip Shield", color: "#1d4ed8", initials: "SM", rank: "#2 Tiles",
        products: [
          { name: "Somany Durastone 2×2 ft", price: "₹52", pack: "per sq ft", tag: "Durable" },
          { name: "Somany Grande GVT 4×2 ft", price: "₹68", pack: "per sq ft", tag: "Living Room" },
          { name: "Somany PGVT Marble Look 4×2", price: "₹82", pack: "per sq ft", tag: "Luxury" },
          { name: "Somany Slip Shield Bath Tile", price: "₹45", pack: "per sq ft", tag: "Anti-Skid" },
          { name: "Somany Wall Highlighter", price: "₹55", pack: "per sq ft", tag: "Accent Wall" },
        ] },
      { id: "orient-bell", name: "Orient Bell", tagline: "GVT & PGVT — Widest Range", color: "#16a34a", initials: "OB", rank: "Value Pick",
        products: [
          { name: "Orient Bell GVT 2×2 ft", price: "₹48", pack: "per sq ft", tag: "Popular" },
          { name: "Orient Bell PGVT 4×2 ft", price: "₹65", pack: "per sq ft", tag: "Polished" },
          { name: "Orient Bell Wall Tile 1×1.5", price: "₹38", pack: "per sq ft", tag: "Budget" },
          { name: "Orient Bell Parking Tile 1×1", price: "₹35", pack: "per sq ft", tag: "Outdoor" },
          { name: "Orient Bell Mosaic Sheet", price: "₹95", pack: "per sq ft", tag: "Decorative" },
        ] },
      { id: "nitco", name: "Nitco", tagline: "Natural Marble & Italian Finish", color: "#7c3aed", initials: "NT", rank: "Premium",
        products: [
          { name: "Nitco Italian Marble Tile 2×4", price: "₹120", pack: "per sq ft", tag: "Premium" },
          { name: "Nitco Vitrified 2×2 ft", price: "₹58", pack: "per sq ft", tag: "Living Room" },
          { name: "Nitco Step & Riser Set", price: "₹85", pack: "per running ft", tag: "Staircase" },
          { name: "Nitco Terrazzo Look 2×2 ft", price: "₹75", pack: "per sq ft", tag: "Designer" },
        ] },
      { id: "johnson", name: "H&R Johnson", tagline: "Endura, Marbonite & Porselano", color: "#d97706", initials: "HJ", rank: "Trusted",
        products: [
          { name: "Johnson Marbonite 2×2 ft", price: "₹50", pack: "per sq ft", tag: "Best Seller" },
          { name: "Johnson Endura 2×4 ft", price: "₹62", pack: "per sq ft", tag: "Large" },
          { name: "Johnson Porselano Wall", price: "₹45", pack: "per sq ft", tag: "Glossy" },
          { name: "Johnson Marbonite Anti-Skid", price: "₹48", pack: "per sq ft", tag: "Bathroom" },
        ] },
      { id: "roff", name: "Roff (Pidilite)", tagline: "T01 NCA, T02 NSA — #1 Tile Adhesive", color: "#0d9488", initials: "RF", rank: "#1 Adhesive",
        products: [
          { name: "Roff T01 NCA (Non-Ceramic) 20kg", price: "₹420", pack: "20kg bag", tag: "Best Seller" },
          { name: "Roff T01 NCA 40kg", price: "₹780", pack: "40kg bag", tag: "Bulk" },
          { name: "Roff T02 NSA (Natural Stone) 20kg", price: "₹520", pack: "20kg bag", tag: "Marble/Granite" },
          { name: "Roff T02 NSA 40kg", price: "₹960", pack: "40kg bag", tag: "Bulk" },
          { name: "Roff Rainbow (Tile Grout) 1kg", price: "₹95", pack: "1kg pack", tag: "Grout" },
          { name: "Roff Rainbow Grout 2kg", price: "₹175", pack: "2kg pack", tag: "Large Joints" },
          { name: "Roff Cera Clean 1L", price: "₹280", pack: "1L bottle", tag: "Tile Cleaner" },
          { name: "Roff Tilefix (Ready Mix) 5kg", price: "₹320", pack: "5kg bucket", tag: "Quick Fix" },
          { name: "Roff Hyper Floor Tile Adh. 20kg", price: "₹650", pack: "20kg bag", tag: "Heavy Duty" },
        ] },
      { id: "myk-laticrete", name: "MYK Laticrete", tagline: "305 Crete, 315 — Global Standards", color: "#1d4ed8", initials: "ML", rank: "Professional",
        products: [
          { name: "MYK 305 Crete Adh. 20kg", price: "₹580", pack: "20kg bag", tag: "Best Seller" },
          { name: "MYK 315 Thin-Set Adh. 20kg", price: "₹620", pack: "20kg bag", tag: "Large Format" },
          { name: "MYK 335 Super Flex Adh. 20kg", price: "₹850", pack: "20kg bag", tag: "Ext. Facade" },
          { name: "MYK Permacolor Grout 5kg", price: "₹480", pack: "5kg bag", tag: "Epoxy Grout" },
          { name: "MYK Permacolor Select 2kg", price: "₹250", pack: "2kg bag", tag: "Premium Grout" },
          { name: "MYK 9235 Waterproofing 20L", price: "₹3,200", pack: "20L bucket", tag: "Waterproof" },
          { name: "MYK Stonetech Sealer 1L", price: "₹650", pack: "1L bottle", tag: "Stone Sealer" },
        ] },
      { id: "asian-smartcare", name: "Asian SmartCare", tagline: "Tile Adhesive & Grout — Asian Paints", color: "#dc2626", initials: "AS", rank: "Branded",
        products: [
          { name: "SmartCare Tile Adhesive T1 20kg", price: "₹450", pack: "20kg bag", tag: "Standard" },
          { name: "SmartCare Tile Adhesive T2 20kg", price: "₹580", pack: "20kg bag", tag: "Vitrified" },
          { name: "SmartCare Tile Adhesive T3 20kg", price: "₹720", pack: "20kg bag", tag: "Heavy Tile" },
          { name: "SmartCare Tile Grout 1kg", price: "₹110", pack: "1kg pack", tag: "12 Colors" },
          { name: "SmartCare Tile Grout 2kg", price: "₹195", pack: "2kg pack", tag: "" },
          { name: "SmartCare Epoxy Grout 1kg", price: "₹380", pack: "1kg pack", tag: "Waterproof" },
        ] },
      { id: "jsw-grip", name: "JSW Block Grip", tagline: "Block Jointing & Tile Adhesive", color: "#475569", initials: "JW", rank: "JSW Group",
        products: [
          { name: "JSW Block Grip Adhesive 40kg", price: "₹320", pack: "40kg bag", tag: "AAC Block" },
          { name: "JSW Block Grip Adhesive 20kg", price: "₹180", pack: "20kg bag", tag: "Small Pack" },
          { name: "JSW Tile Fix Adhesive 20kg", price: "₹480", pack: "20kg bag", tag: "Tile Fix" },
          { name: "JSW Tile Fix Premium 20kg", price: "₹620", pack: "20kg bag", tag: "Large Format" },
        ] },
      { id: "fevicol-tile", name: "Fevicol (Pidilite)", tagline: "SH, Marine, Heatx — Wood & Tile", color: "#7c3aed", initials: "FV", rank: "Adhesives",
        products: [
          { name: "Fevicol SH 50kg", price: "₹6,800", pack: "50kg drum", tag: "Best Seller" },
          { name: "Fevicol SH 20kg", price: "₹3,200", pack: "20kg drum", tag: "Mid Pack" },
          { name: "Fevicol SH 5kg", price: "₹950", pack: "5kg drum", tag: "Small" },
          { name: "Fevicol Marine 20kg", price: "₹5,200", pack: "20kg drum", tag: "Waterproof" },
          { name: "Fevicol Marine 5kg", price: "₹1,500", pack: "5kg drum", tag: "" },
          { name: "Fevicol Heatx 5kg (Laminate)", price: "₹1,800", pack: "5kg drum", tag: "Laminate" },
          { name: "Fevicol SpeedX (Instant) 1kg", price: "₹480", pack: "1kg bottle", tag: "Quick Bond" },
          { name: "Fevicol SR-998 (Rubber) 1L", price: "₹350", pack: "1L tin", tag: "Rubber/PVC" },
        ] },
      { id: "spacers-tools", name: "Spacers & Tools", tagline: "Tile Spacers, Leveling Clips & Cutters", color: "#78716c", initials: "ST", rank: "Tiling Tools",
        products: [
          { name: "Tile Spacer 2mm (Pack 200)", price: "₹85", pack: "pack of 200", tag: "Most Used" },
          { name: "Tile Spacer 3mm (Pack 200)", price: "₹90", pack: "pack of 200", tag: "Wide Joint" },
          { name: "Tile Spacer 5mm (Pack 100)", price: "₹80", pack: "pack of 100", tag: "Outdoor" },
          { name: "Tile Leveling Clip + Wedge 100pc", price: "₹320", pack: "pack of 100", tag: "Level System" },
          { name: "Notched Trowel 6mm", price: "₹180", pack: "per piece", tag: "Adhesive" },
          { name: "Notched Trowel 10mm", price: "₹220", pack: "per piece", tag: "Large Tile" },
          { name: "Rubber Grout Float", price: "₹150", pack: "per piece", tag: "Grouting" },
          { name: "Manual Tile Cutter 24\"", price: "₹2,200", pack: "per piece", tag: "Cutting" },
          { name: "Tile Hole Saw Bit Set (6pc)", price: "₹450", pack: "set of 6", tag: "Pipe Holes" },
        ] },
      { id: "tile-cleaners", name: "Tile Cleaners", tagline: "Cleaning, Polishing & Sealing Solutions", color: "#b45309", initials: "TC", rank: "Maintenance",
        products: [
          { name: "Roff Cera Clean 1L", price: "₹280", pack: "1L bottle", tag: "Best Seller" },
          { name: "Roff Cera Clean 5L", price: "₹1,100", pack: "5L can", tag: "Bulk" },
          { name: "Pidilite Tile Clean (Acid) 1L", price: "₹195", pack: "1L bottle", tag: "Deep Clean" },
          { name: "MYK Stonetech Cleaner 1L", price: "₹520", pack: "1L bottle", tag: "Natural Stone" },
          { name: "Dr. Fixit Tile & Stone Sealer 1L", price: "₹480", pack: "1L bottle", tag: "Sealer" },
          { name: "HG Tile Protector 1L (Imported)", price: "₹850", pack: "1L bottle", tag: "Premium" },
          { name: "Tile Polish Liquid 1L", price: "₹220", pack: "1L bottle", tag: "Shine" },
        ] },
    ],
  },

  "marble-stone": {
    title: "Marble & Stone",
    subtitle: "Marble, Granite, Kota & Sandstone — Lucknow's Top Picks",
    gradient: "linear-gradient(135deg, #57534e 0%, #a8a29e 100%)",
    brands: [
      { id: "makrana-marble", name: "Makrana Marble", tagline: "Premium Rajasthan White — Taj Mahal Stone", color: "#78716c", initials: "MK", rank: "Premium",
        products: [
          { name: "Makrana White Marble", price: "₹85", pack: "per sqft", tag: "Best Seller" },
          { name: "Makrana Albeta Marble", price: "₹110", pack: "per sqft", tag: "Premium" },
          { name: "Makrana Kumari Marble", price: "₹75", pack: "per sqft", tag: "" },
        ] },
      { id: "italian-marble", name: "Italian Marble", tagline: "Imported Luxury — Statuario & Carrara", color: "#1d4ed8", initials: "IT", rank: "Luxury",
        products: [
          { name: "Statuario Italian Marble", price: "₹350", pack: "per sqft", tag: "Luxury" },
          { name: "Carrara White Marble", price: "₹280", pack: "per sqft", tag: "Imported" },
          { name: "Botticino Beige Marble", price: "₹240", pack: "per sqft", tag: "" },
        ] },
      { id: "indian-marble", name: "Indian Marble", tagline: "Rajasthan Flooring Marble — Value Picks", color: "#16a34a", initials: "IN", rank: "Most Used",
        products: [
          { name: "Morwad White Marble", price: "₹65", pack: "per sqft", tag: "Most Used" },
          { name: "Rajnagar White Marble", price: "₹70", pack: "per sqft", tag: "" },
          { name: "Onyx Marble (Backlit)", price: "₹450", pack: "per sqft", tag: "Designer" },
        ] },
      { id: "granite", name: "Granite", tagline: "Kitchen Tops & Flooring — Scratch-Proof", color: "#0f172a", initials: "GR", rank: "Best Seller",
        products: [
          { name: "Black Galaxy Granite", price: "₹180", pack: "per sqft", tag: "Best Seller" },
          { name: "Tan Brown Granite", price: "₹140", pack: "per sqft", tag: "Kitchen Top" },
          { name: "Steel Grey Granite", price: "₹95", pack: "per sqft", tag: "Popular" },
          { name: "Kashmir White Granite", price: "₹160", pack: "per sqft", tag: "" },
        ] },
      { id: "kota-sandstone", name: "Kota & Sandstone", tagline: "Durable Natural Stone — Floors & Facades", color: "#92400e", initials: "KS", rank: "Durable",
        products: [
          { name: "Kota Stone (Blue)", price: "₹45", pack: "per sqft", tag: "Most Used" },
          { name: "Kota Stone (Brown)", price: "₹42", pack: "per sqft", tag: "" },
          { name: "Dholpur Beige Sandstone", price: "₹38", pack: "per sqft", tag: "Heritage" },
          { name: "Mint Green Sandstone", price: "₹40", pack: "per sqft", tag: "Facade" },
        ] },
    ],
  },

  finishing: {
    title: "Finishing Materials",
    subtitle: "Putty, POP, White Cement, Adhesives",
    gradient: "linear-gradient(135deg, #065f46 0%, #10b981 100%)",
    brands: [
      { id: "birla-putty", name: "Birla White", tagline: "India's #1 Wall Putty", color: "#ea580c", initials: "BW", rank: "#1 Putty",
        products: [
          { name: "Birla White Wall Putty 40kg", price: "₹850", pack: "40kg bag", tag: "Best Seller" },
          { name: "Birla White Cement 50kg", price: "₹520", pack: "50kg bag", tag: "White Cement" },
          { name: "Birla White Levelplast 25kg", price: "₹680", pack: "25kg bag", tag: "Levelling" },
        ] },
      { id: "jk-putty", name: "JK Wall Putty", tagline: "Strong Bonding — Smooth Finish", color: "#16a34a", initials: "JK", rank: "#2 Putty",
        products: [
          { name: "JK Wall Putty 40kg", price: "₹820", pack: "40kg bag", tag: "Popular" },
          { name: "JK Wall Putty 20kg", price: "₹430", pack: "20kg bag", tag: "Small Pack" },
        ] },
      { id: "asian-putty", name: "Asian Trucare", tagline: "Asian Paints Wall Putty", color: "#dc2626", initials: "AP", rank: "Premium",
        products: [
          { name: "Trucare Acrylic Putty 40kg", price: "₹920", pack: "40kg bag", tag: "Premium" },
          { name: "Trucare Wall Primer 20L", price: "₹2,200", pack: "20L bucket", tag: "Primer" },
          { name: "Trucare Crack Fill 1kg", price: "₹280", pack: "1kg pack", tag: "" },
        ] },
      { id: "pidilite", name: "Pidilite", tagline: "Fevicol, M-Seal & Dr. Fixit", color: "#7c3aed", initials: "PD", rank: "Adhesives",
        products: [
          { name: "Fevicol SH 50kg", price: "₹6,800", pack: "50kg drum", tag: "Best Seller" },
          { name: "Fevicol Marine 20kg", price: "₹5,200", pack: "20kg drum", tag: "Waterproof" },
          { name: "M-Seal Epoxy 1kg", price: "₹420", pack: "1kg pack", tag: "Leak Fix" },
          { name: "Fevicol Heatx 5kg", price: "₹1,800", pack: "5kg drum", tag: "Laminate" },
        ] },
      { id: "pop", name: "POP / Gypsum", tagline: "Plaster of Paris — Local & Branded", color: "#d97706", initials: "PP", rank: "Ceiling",
        products: [
          { name: "Topcem POP 25kg", price: "₹320", pack: "25kg bag", tag: "Best Seller" },
          { name: "Gyproc Plaster 25kg (Saint-Gobain)", price: "₹480", pack: "25kg bag", tag: "Premium" },
          { name: "Local POP 25kg", price: "₹250", pack: "25kg bag", tag: "Economy" },
        ] },
    ],
  },

  hardware: {
    title: "Hardware & Fittings",
    subtitle: "Kitchen/Wardrobe Hardware, Hinges, Channels, Locks & Furniture Fittings",
    gradient: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
    brands: [
      { id: "hettich", name: "Hettich", tagline: "Onsys, InnoTech, KA Channels — German", color: "#16a34a", initials: "HT", rank: "#1 Kitchen HW",
        products: [
          { name: "Hettich Onsys Soft Close Hinge", price: "₹145", pack: "per piece", tag: "Best Seller" },
          { name: "Hettich Onsys 110° Hinge", price: "₹120", pack: "per piece", tag: "Standard" },
          { name: "Hettich Onsys 165° Hinge", price: "₹195", pack: "per piece", tag: "Wide Open" },
          { name: "Hettich KA 5632 Channel 18\"", price: "₹380", pack: "per pair", tag: "Ball Bearing" },
          { name: "Hettich KA 5632 Channel 22\"", price: "₹420", pack: "per pair", tag: "Drawer" },
          { name: "Hettich KA 5632 Channel 24\"", price: "₹450", pack: "per pair", tag: "Deep Drawer" },
          { name: "Hettich InnoTech Drawer 500mm", price: "₹3,200", pack: "per set", tag: "Premium" },
          { name: "Hettich InnoTech Drawer 600mm", price: "₹3,600", pack: "per set", tag: "Large" },
          { name: "Hettich Tandem Box 500mm", price: "₹2,800", pack: "per set", tag: "Soft Close" },
          { name: "Hettich Tandem Box 600mm", price: "₹3,100", pack: "per set", tag: "" },
          { name: "Hettich Cabinet Handle 6\" (SS)", price: "₹85", pack: "per piece", tag: "Modern" },
          { name: "Hettich Cabinet Handle 8\" (SS)", price: "₹110", pack: "per piece", tag: "" },
          { name: "Hettich Push-to-Open", price: "₹180", pack: "per piece", tag: "Handleless" },
        ] },
      { id: "ebco", name: "Ebco", tagline: "Soft Close, Telescopic & Wardrobe Systems", color: "#7c3aed", initials: "EB", rank: "Fittings",
        products: [
          { name: "Ebco Soft Close Hinge (Overlay)", price: "₹110", pack: "per piece", tag: "Popular" },
          { name: "Ebco Soft Close Hinge (Inset)", price: "₹125", pack: "per piece", tag: "Inset Door" },
          { name: "Ebco Telescopic Channel 18\"", price: "₹320", pack: "per pair", tag: "Drawer" },
          { name: "Ebco Telescopic Channel 20\"", price: "₹380", pack: "per pair", tag: "Deep" },
          { name: "Ebco Telescopic Channel 24\"", price: "₹420", pack: "per pair", tag: "" },
          { name: "Ebco SS Kitchen Basket (Plain)", price: "₹1,600", pack: "per piece", tag: "Utility" },
          { name: "Ebco SS Kitchen Basket (Grain)", price: "₹1,900", pack: "per piece", tag: "Premium" },
          { name: "Ebco Corner Unit Carousel", price: "₹4,200", pack: "per set", tag: "Kitchen" },
          { name: "Ebco Tall Unit Pantry Pull-Out", price: "₹5,800", pack: "per set", tag: "Pantry" },
          { name: "Ebco Wardrobe Trouser Pull-Out", price: "₹2,400", pack: "per piece", tag: "Wardrobe" },
          { name: "Ebco Wardrobe Tie/Belt Rack", price: "₹850", pack: "per piece", tag: "Wardrobe" },
          { name: "Ebco Wardrobe Lift (Hanger)", price: "₹3,200", pack: "per piece", tag: "Pull-Down" },
        ] },
      { id: "godrej-locks", name: "Godrej Locks", tagline: "India's Most Trusted Locks", color: "#1d4ed8", initials: "GD", rank: "#1 Locks",
        products: [
          { name: "Godrej Nav-tal 6 Lever Lock", price: "₹1,850", pack: "per piece", tag: "Best Seller" },
          { name: "Godrej Ultra XL+ Deadbolt", price: "₹2,400", pack: "per piece", tag: "Security" },
          { name: "Godrej Digi Smart Lock", price: "₹12,500", pack: "per piece", tag: "Digital" },
          { name: "Godrej Padlock 65mm (Brass)", price: "₹380", pack: "per piece", tag: "Gate" },
          { name: "Godrej Padlock 50mm (Brass)", price: "₹280", pack: "per piece", tag: "Room" },
          { name: "Godrej Night Latch", price: "₹1,200", pack: "per piece", tag: "Main Door" },
        ] },
      { id: "dorset", name: "Dorset", tagline: "Door Hardware, Handles & Closers", color: "#ea580c", initials: "DS", rank: "Handles",
        products: [
          { name: "Dorset Lever Handle (SS Matt)", price: "₹850", pack: "per pair", tag: "Modern" },
          { name: "Dorset Lever Handle (Antique)", price: "₹1,100", pack: "per pair", tag: "Classic" },
          { name: "Dorset Mortise Lock Body 60mm", price: "₹620", pack: "per piece", tag: "Best Seller" },
          { name: "Dorset Mortise Handle + Lock", price: "₹1,800", pack: "per set", tag: "Complete" },
          { name: "Dorset Door Closer (Hydraulic)", price: "₹1,400", pack: "per piece", tag: "Auto Close" },
          { name: "Dorset Tower Bolt 8\" (SS)", price: "₹180", pack: "per piece", tag: "" },
          { name: "Dorset Tower Bolt 12\" (SS)", price: "₹250", pack: "per piece", tag: "Gate" },
          { name: "Dorset Aldrop 10\" (SS)", price: "₹320", pack: "per piece", tag: "Main Door" },
        ] },
      { id: "stanley-hw", name: "Stanley", tagline: "Hinges, Floor Springs & Door Hardware", color: "#d97706", initials: "ST", rank: "Global",
        products: [
          { name: "Stanley SS Butt Hinge 4\" (Ball)", price: "₹220", pack: "per pair", tag: "Heavy Duty" },
          { name: "Stanley SS Butt Hinge 5\"", price: "₹280", pack: "per pair", tag: "Main Door" },
          { name: "Stanley Door Stopper (Magnetic)", price: "₹150", pack: "per piece", tag: "" },
          { name: "Stanley Floor Spring (Glass)", price: "₹3,200", pack: "per piece", tag: "Glass Door" },
          { name: "Stanley Patch Fitting Set", price: "₹4,500", pack: "per set", tag: "Glass Door" },
        ] },
      { id: "wardrobe-acc", name: "Wardrobe Accessories", tagline: "Channels, Baskets, Hooks & Organizers", color: "#78716c", initials: "WA", rank: "Wardrobe",
        products: [
          { name: "SS Oval Wardrobe Rod (4ft)", price: "₹280", pack: "per piece", tag: "Hanger Rod" },
          { name: "SS Oval Wardrobe Rod (6ft)", price: "₹380", pack: "per piece", tag: "" },
          { name: "Wardrobe Rod Bracket (Pair)", price: "₹85", pack: "per pair", tag: "Bracket" },
          { name: "Wardrobe Wire Basket (18\")", price: "₹650", pack: "per piece", tag: "Storage" },
          { name: "Wardrobe Shoe Rack (Pull-Out)", price: "₹1,800", pack: "per piece", tag: "Shoe" },
          { name: "Wardrobe Mirror Pull-Out", price: "₹2,200", pack: "per piece", tag: "Mirror" },
          { name: "Drawer Lock (Small) Pack 10", price: "₹220", pack: "pack of 10", tag: "Cabinet" },
          { name: "Soft Close Damper Buffer (20pc)", price: "₹280", pack: "pack of 20", tag: "Silence" },
        ] },
    ],
  },

  safety: {
    title: "Safety Equipment",
    subtitle: "Helmets, Shoes, Harness, Nets & PPE Kits",
    gradient: "linear-gradient(135deg, #92400e 0%, #f59e0b 100%)",
    brands: [
      { id: "karam", name: "Karam", tagline: "India's Leading Safety Brand", color: "#ea580c", initials: "KR", rank: "#1 Safety",
        products: [
          { name: "Karam PN-521 Helmet (ISI)", price: "₹185", pack: "per piece", tag: "Best Seller" },
          { name: "Karam FS-51 Full Harness", price: "₹2,800", pack: "per set", tag: "Fall Protect" },
          { name: "Karam HS-61 Safety Shoes", price: "₹1,450", pack: "per pair", tag: "Steel Toe" },
          { name: "Karam ES-01 Safety Goggles", price: "₹120", pack: "per piece", tag: "Eye Safety" },
          { name: "Karam Dust Mask (pack 50)", price: "₹350", pack: "pack of 50", tag: "" },
        ] },
      { id: "safari", name: "Safari Pro", tagline: "Construction PPE — Affordable", color: "#1d4ed8", initials: "SF", rank: "PPE",
        products: [
          { name: "Safari Helmet White (ISI)", price: "₹165", pack: "per piece", tag: "Budget" },
          { name: "Safari Safety Shoes (High)", price: "₹1,200", pack: "per pair", tag: "Popular" },
          { name: "Safari Hand Gloves (12 pairs)", price: "₹280", pack: "12 pairs", tag: "" },
          { name: "Safari Safety Vest Reflective", price: "₹180", pack: "per piece", tag: "Hi-Vis" },
        ] },
      { id: "udyogi", name: "Udyogi", tagline: "Industrial Safety — Since 1972", color: "#16a34a", initials: "UG", rank: "Industrial",
        products: [
          { name: "Udyogi Helmet with Chin", price: "₹210", pack: "per piece", tag: "Heavy Duty" },
          { name: "Udyogi Full Body Harness", price: "₹3,200", pack: "per set", tag: "" },
          { name: "Udyogi Gumboot (pair)", price: "₹450", pack: "per pair", tag: "Waterproof" },
          { name: "Udyogi Ear Plug (pack 50)", price: "₹220", pack: "50 pairs", tag: "" },
        ] },
      { id: "safety-nets", name: "Safety Nets", tagline: "Fall Protection & Debris Nets", color: "#7c3aed", initials: "SN", rank: "Nets",
        products: [
          { name: "Construction Safety Net (Green)", price: "₹18", pack: "per sq ft", tag: "Fall Safety" },
          { name: "Debris Net (Blue)", price: "₹12", pack: "per sq ft", tag: "Debris" },
          { name: "Scaffolding Net (Black)", price: "₹15", pack: "per sq ft", tag: "Scaffold" },
        ] },
    ],
  },

  tools: {
    title: "Power & Hand Tools",
    subtitle: "Drills, Grinders, Cutters & Hand Tools",
    gradient: "linear-gradient(135deg, #1e3a5f 0%, #3b82f6 100%)",
    brands: [
      { id: "bosch", name: "Bosch", tagline: "German Engineering — #1 Power Tools", color: "#1d4ed8", initials: "BS", rank: "#1 Power",
        products: [
          { name: "Bosch GSB 550 Impact Drill", price: "₹3,200", pack: "per piece", tag: "Best Seller" },
          { name: "Bosch GWS 600 Angle Grinder", price: "₹2,800", pack: "per piece", tag: "Grinding" },
          { name: "Bosch GBH 220 Rotary Hammer", price: "₹6,500", pack: "per piece", tag: "Concrete" },
          { name: "Bosch GST 650 Jigsaw", price: "₹4,200", pack: "per piece", tag: "Cutting" },
        ] },
      { id: "stanley-tools", name: "Stanley", tagline: "Hand Tools — Global Standard", color: "#d97706", initials: "ST", rank: "Hand Tools",
        products: [
          { name: "Stanley Measuring Tape 5m", price: "₹380", pack: "per piece", tag: "Essential" },
          { name: "Stanley Spirit Level 24\"", price: "₹650", pack: "per piece", tag: "Levelling" },
          { name: "Stanley Claw Hammer 570g", price: "₹520", pack: "per piece", tag: "Popular" },
          { name: "Stanley FatMax Screwdriver Set", price: "₹1,200", pack: "set of 6", tag: "" },
        ] },
      { id: "makita", name: "Makita", tagline: "Japanese Quality — Professional", color: "#0d9488", initials: "MK", rank: "Professional",
        products: [
          { name: "Makita HP1630 Impact Drill", price: "₹3,800", pack: "per piece", tag: "Pro" },
          { name: "Makita M9511B Grinder 5\"", price: "₹3,400", pack: "per piece", tag: "" },
          { name: "Makita MT Series Planer", price: "₹4,500", pack: "per piece", tag: "Woodwork" },
        ] },
      { id: "dewalt", name: "DeWalt", tagline: "Tough Tools — American Brand", color: "#dc2626", initials: "DW", rank: "Tough",
        products: [
          { name: "DeWalt DWD024 Drill 13mm", price: "₹4,200", pack: "per piece", tag: "Heavy Duty" },
          { name: "DeWalt DW801 Grinder 4\"", price: "₹3,600", pack: "per piece", tag: "Best Seller" },
          { name: "DeWalt DWE397 Cutter 9\"", price: "₹8,500", pack: "per piece", tag: "Pro" },
        ] },
      { id: "taparia", name: "Taparia", tagline: "Made in India — Hand Tools", color: "#16a34a", initials: "TP", rank: "Desi Tools",
        products: [
          { name: "Taparia Plier Combo Set", price: "₹650", pack: "set of 3", tag: "Essential" },
          { name: "Taparia Screwdriver Set 6pc", price: "₹380", pack: "set of 6", tag: "Popular" },
          { name: "Taparia Hacksaw Frame 12\"", price: "₹280", pack: "per piece", tag: "" },
          { name: "Taparia Ring Spanner Set", price: "₹1,100", pack: "set of 8", tag: "" },
        ] },
    ],
  },

  shuttering: {
    title: "Shuttering & Formwork",
    subtitle: "Plywood, Steel Plates, Props & Release Oil",
    gradient: "linear-gradient(135deg, #78350f 0%, #a16207 100%)",
    brands: [
      { id: "century-ply", name: "CenturyPly", tagline: "India's #1 Plywood Brand", color: "#92400e", initials: "CP", rank: "#1 Plywood",
        products: [
          { name: "CenturyPly Shuttering Ply 12mm", price: "₹65", pack: "per sq ft", tag: "Best Seller" },
          { name: "CenturyPly Shuttering Ply 18mm", price: "₹85", pack: "per sq ft", tag: "Slab" },
          { name: "CenturyPly Marine Ply 19mm", price: "₹110", pack: "per sq ft", tag: "Waterproof" },
        ] },
      { id: "greenply", name: "Greenply", tagline: "Green Gold — Trusted Plywood", color: "#16a34a", initials: "GP", rank: "#2 Plywood",
        products: [
          { name: "Greenply Shuttering 12mm", price: "₹60", pack: "per sq ft", tag: "Value" },
          { name: "Greenply Shuttering 18mm", price: "₹80", pack: "per sq ft", tag: "Slab" },
          { name: "Greenply MR Grade 19mm", price: "₹95", pack: "per sq ft", tag: "" },
        ] },
      { id: "steel-shuttering", name: "Steel Formwork", tagline: "Reusable Steel Plates & Channels", color: "#475569", initials: "SF", rank: "Reusable",
        products: [
          { name: "Steel Plate 600×300mm", price: "₹450", pack: "per piece", tag: "Column" },
          { name: "Steel Plate 600×600mm", price: "₹750", pack: "per piece", tag: "Beam" },
          { name: "Channel Plate 1200×300mm", price: "₹950", pack: "per piece", tag: "Slab Edge" },
          { name: "Steel Clamp Set", price: "₹180", pack: "per pair", tag: "" },
        ] },
      { id: "props", name: "Adjustable Props", tagline: "Acrow Props & Scaffolding", color: "#d97706", initials: "AP", rank: "Support",
        products: [
          { name: "Acrow Prop 2.4–3.9m", price: "₹1,200", pack: "per piece", tag: "Best Seller" },
          { name: "Acrow Prop 3.0–4.8m", price: "₹1,500", pack: "per piece", tag: "High Slab" },
          { name: "Cup Lock Scaffold Set", price: "₹2,800", pack: "per set", tag: "Multi-Level" },
          { name: "H-Frame Scaffold 5ft", price: "₹1,800", pack: "per set", tag: "Standard" },
        ] },
      { id: "release", name: "Shuttering Oil", tagline: "Mould Release — Clean Finish", color: "#1d4ed8", initials: "SO", rank: "Essential",
        products: [
          { name: "Fosroc Reebol 20L", price: "₹2,200", pack: "20L tin", tag: "Premium" },
          { name: "Sika Separol 20L", price: "₹2,400", pack: "20L tin", tag: "Smooth Finish" },
          { name: "Local Shuttering Oil 20L", price: "₹1,200", pack: "20L tin", tag: "Budget" },
        ] },
    ],
  },

  wood: {
    title: "Wood & Boards",
    subtitle: "Plywood (BWP/MR), MDF, Particle Board, Gypsum & POP",
    gradient: "linear-gradient(135deg, #78350f 0%, #b45309 100%)",
    brands: [
      { id: "century-sainik", name: "Century Sainik", tagline: "BWP Marine, MR — India's #1 Plywood", color: "#92400e", initials: "CS", rank: "#1 Plywood",
        products: [
          { name: "Sainik BWP Marine Ply 19mm (8×4)", price: "₹115", pack: "per sq ft", tag: "Best Seller" },
          { name: "Sainik BWP Marine Ply 12mm (8×4)", price: "₹85", pack: "per sq ft", tag: "Waterproof" },
          { name: "Sainik BWP Marine Ply 6mm (8×4)", price: "₹52", pack: "per sq ft", tag: "Backing" },
          { name: "Sainik MR Grade Ply 19mm (8×4)", price: "₹78", pack: "per sq ft", tag: "Interior" },
          { name: "Sainik MR Grade Ply 12mm (8×4)", price: "₹58", pack: "per sq ft", tag: "Shelves" },
          { name: "Century Club Prime 19mm (BWR)", price: "₹135", pack: "per sq ft", tag: "Premium BWR" },
          { name: "Century Architect Ply 19mm", price: "₹155", pack: "per sq ft", tag: "Ultra Premium" },
          { name: "Century Block Board 19mm (8×4)", price: "₹65", pack: "per sq ft", tag: "Doors" },
          { name: "Century Flush Door (7×3 ft)", price: "₹2,800", pack: "per piece", tag: "Standard" },
          { name: "Century Flush Door (7×3 ft BWP)", price: "₹4,200", pack: "per piece", tag: "Waterproof" },
        ] },
      { id: "greenply-wood", name: "Greenply", tagline: "Green Gold — BWP & MR Plywood", color: "#16a34a", initials: "GP", rank: "#2 Plywood",
        products: [
          { name: "Greenply BWP Marine 19mm (8×4)", price: "₹110", pack: "per sq ft", tag: "Best Seller" },
          { name: "Greenply BWP Marine 12mm (8×4)", price: "₹82", pack: "per sq ft", tag: "Shelves" },
          { name: "Greenply MR Grade 19mm (8×4)", price: "₹75", pack: "per sq ft", tag: "Interior" },
          { name: "Greenply MR Grade 12mm (8×4)", price: "₹55", pack: "per sq ft", tag: "" },
          { name: "Greenply Ecotec MR 19mm", price: "₹68", pack: "per sq ft", tag: "Budget" },
          { name: "Greenply Block Board 19mm", price: "₹62", pack: "per sq ft", tag: "Doors" },
          { name: "Greenply Flush Door 7×3 ft", price: "₹2,600", pack: "per piece", tag: "Standard" },
        ] },
      { id: "action-tesa", name: "Action Tesa", tagline: "MDF, HDF & Pre-Laminated Boards", color: "#1d4ed8", initials: "AT", rank: "MDF Leader",
        products: [
          { name: "Action Tesa MDF 18mm (8×4)", price: "₹45", pack: "per sq ft", tag: "Best Seller" },
          { name: "Action Tesa MDF 12mm (8×4)", price: "₹35", pack: "per sq ft", tag: "Backing" },
          { name: "Action Tesa MDF 8mm (8×4)", price: "₹28", pack: "per sq ft", tag: "Thin Panel" },
          { name: "Action Tesa HDF 6mm (8×4)", price: "₹32", pack: "per sq ft", tag: "Hard" },
          { name: "Action Tesa Pre-Lam MDF 18mm", price: "₹58", pack: "per sq ft", tag: "Ready Use" },
          { name: "Action Tesa Pre-Lam MDF 8mm", price: "₹38", pack: "per sq ft", tag: "Lining" },
          { name: "Action Tesa Particle Board 18mm", price: "₹25", pack: "per sq ft", tag: "Budget" },
          { name: "Action Tesa Particle Board 12mm", price: "₹20", pack: "per sq ft", tag: "" },
        ] },
      { id: "gyproc", name: "Saint-Gobain Gyproc", tagline: "Gypsum Boards — False Ceiling & Partitions", color: "#ea580c", initials: "SG", rank: "Gypsum #1",
        products: [
          { name: "Gyproc Regular Board 12.5mm (8×4)", price: "₹42", pack: "per sq ft", tag: "Best Seller" },
          { name: "Gyproc Regular Board 9.5mm (8×4)", price: "₹35", pack: "per sq ft", tag: "Ceiling" },
          { name: "Gyproc Moisture Resistant 12.5mm", price: "₹55", pack: "per sq ft", tag: "Bathroom" },
          { name: "Gyproc Fire Line 12.5mm", price: "₹58", pack: "per sq ft", tag: "Fire Rated" },
          { name: "Gyproc XL Board 15mm", price: "₹52", pack: "per sq ft", tag: "Partition" },
          { name: "Gyproc GI Channel (Main Runner)", price: "₹65", pack: "per 3m piece", tag: "Frame" },
          { name: "Gyproc GI Furring Channel", price: "₹45", pack: "per 3m piece", tag: "Cross" },
          { name: "Gyproc Angle (Wall Angle)", price: "₹28", pack: "per 3m piece", tag: "Edge" },
          { name: "Gyproc Jointing Compound 5kg", price: "₹280", pack: "5kg bag", tag: "Finish" },
          { name: "Gyproc Jointing Tape 75m", price: "₹120", pack: "per roll", tag: "Tape" },
        ] },
      { id: "alagar-pop", name: "Alagar / POP", tagline: "White Gypsum POP Powder & Cornices", color: "#d97706", initials: "AL", rank: "POP",
        products: [
          { name: "Alagar White POP Powder 25kg", price: "₹320", pack: "25kg bag", tag: "Best Seller" },
          { name: "Alagar White POP Powder 40kg", price: "₹480", pack: "40kg bag", tag: "Bulk" },
          { name: "Super White POP 25kg (Premium)", price: "₹380", pack: "25kg bag", tag: "Ultra White" },
          { name: "POP Cornice Mould (Plain) 8ft", price: "₹45", pack: "per piece", tag: "Ceiling" },
          { name: "POP Cornice Mould (Design) 8ft", price: "₹75", pack: "per piece", tag: "Decorative" },
          { name: "POP Medallion (Round) 2ft", price: "₹250", pack: "per piece", tag: "Chandelier" },
        ] },
      { id: "laminates", name: "Laminates", tagline: "Sunmica, Merino, Century — Decorative", color: "#7c3aed", initials: "LM", rank: "Laminate",
        products: [
          { name: "Sunmica Laminate 1mm (8×4)", price: "₹1,200", pack: "per sheet", tag: "Best Seller" },
          { name: "Sunmica Laminate 0.8mm (8×4)", price: "₹950", pack: "per sheet", tag: "Standard" },
          { name: "Merino Laminate 1mm (8×4)", price: "₹1,400", pack: "per sheet", tag: "Premium" },
          { name: "Century Laminate 1mm (8×4)", price: "₹1,100", pack: "per sheet", tag: "Value" },
          { name: "PVC Edge Band Tape 22mm (50m)", price: "₹350", pack: "50m roll", tag: "Edge Band" },
          { name: "PVC Edge Band Tape 40mm (50m)", price: "₹480", pack: "50m roll", tag: "Wide" },
          { name: "Fevicol SH for Laminate 5kg", price: "₹950", pack: "5kg drum", tag: "Adhesive" },
        ] },
    ],
  },

  adhesives: {
    title: "Fevicol & Adhesives",
    subtitle: "Fevicol SH, Marine, SpeedX, M-Seal, Fevikwik, Araldite & Epoxy",
    gradient: "linear-gradient(135deg, #5b21b6 0%, #a855f7 100%)",
    brands: [
      { id: "fevicol-wood", name: "Fevicol (Pidilite)", tagline: "SH, Marine, Heatx — #1 Wood Adhesive", color: "#7c3aed", initials: "FV", rank: "#1 Adhesive",
        products: [
          { name: "Fevicol SH 50kg", price: "₹6,800", pack: "50kg drum", tag: "Best Seller" },
          { name: "Fevicol SH 20kg", price: "₹3,200", pack: "20kg drum", tag: "Contractor" },
          { name: "Fevicol SH 5kg", price: "₹950", pack: "5kg drum", tag: "Small" },
          { name: "Fevicol SH 1kg", price: "₹210", pack: "1kg pack", tag: "Handy" },
          { name: "Fevicol Marine 20kg", price: "₹5,200", pack: "20kg drum", tag: "Waterproof" },
          { name: "Fevicol Marine 5kg", price: "₹1,500", pack: "5kg drum", tag: "" },
          { name: "Fevicol Heatx 5kg (Laminate)", price: "₹1,800", pack: "5kg drum", tag: "Laminate" },
          { name: "Fevicol Heatx 1kg", price: "₹420", pack: "1kg pack", tag: "Laminate" },
        ] },
      { id: "fevicol-instant", name: "SpeedX & Fevikwik", tagline: "Instant Bonding — Pidilite", color: "#0d9488", initials: "SX", rank: "Instant",
        products: [
          { name: "Fevikwik 0.5g (Pack of 10)", price: "₹150", pack: "pack of 10", tag: "Best Seller" },
          { name: "Fevikwik 2g Tube", price: "₹45", pack: "per tube", tag: "Handy" },
          { name: "Fevicol SpeedX 100g", price: "₹120", pack: "100g bottle", tag: "Quick Bond" },
          { name: "Fevicol SpeedX 1kg", price: "₹480", pack: "1kg bottle", tag: "Bulk" },
          { name: "Fevicol SR-998 (Rubber) 1L", price: "₹350", pack: "1L tin", tag: "Rubber/PVC" },
          { name: "Fevicol SR-505 Spray 500ml", price: "₹280", pack: "500ml can", tag: "Spray" },
        ] },
      { id: "mseal-pidilite", name: "M-Seal (Pidilite)", tagline: "Epoxy Sealant — Leak & Gap Fix", color: "#dc2626", initials: "MS", rank: "Leak Fix",
        products: [
          { name: "M-Seal Phataphat 25g", price: "₹40", pack: "25g pack", tag: "Best Seller" },
          { name: "M-Seal General Purpose 100g", price: "₹95", pack: "100g pack", tag: "GP" },
          { name: "M-Seal Epoxy Compound 1kg", price: "₹420", pack: "1kg pack", tag: "Plumbing" },
          { name: "M-Seal PV Seal (PVC) 100g", price: "₹110", pack: "100g pack", tag: "PVC Pipe" },
        ] },
      { id: "araldite", name: "Araldite", tagline: "Two-Part Epoxy — Strong Metal Bond", color: "#1d4ed8", initials: "AR", rank: "Epoxy",
        products: [
          { name: "Araldite Standard 90g", price: "₹110", pack: "90g pack", tag: "Best Seller" },
          { name: "Araldite Rapid 36ml", price: "₹135", pack: "36ml pack", tag: "5-Min Set" },
          { name: "Araldite Klear 90g", price: "₹150", pack: "90g pack", tag: "Transparent" },
        ] },
      { id: "roff-adh", name: "Roff (Pidilite)", tagline: "Tile & Stone Adhesive", color: "#0d9488", initials: "RF", rank: "Tile Fix",
        products: [
          { name: "Roff T01 NCA Tile Adhesive 20kg", price: "₹420", pack: "20kg bag", tag: "Tiles" },
          { name: "Roff Tilefix Ready Mix 5kg", price: "₹320", pack: "5kg bucket", tag: "Quick Fix" },
          { name: "Roff Rainbow Grout 1kg", price: "₹95", pack: "1kg pack", tag: "Grout" },
        ] },
    ],
  },
};

/* ── Generic Brand Catalog Component ──────────────────────────────── */
function BrandCatalog({ category, onAddProduct, isAdding, getQty, onOpenDetail }: {
  category: string;
  onAddProduct: (opts: { category: string; name: string; priceText: string; unit?: string; vendor?: string; quantity?: number }) => void;
  isAdding: boolean;
  getQty: (category: string, name: string) => number;
  onOpenDetail?: (p: Product) => void;
}) {
  const data = ALL_BRAND_DATA[category];
  const [activeBrand, setActiveBrand] = useState<BrandEntry | null>(null);

  if (!data) return null;

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-[24px]" style={{ background: data.gradient }}>
        <p className="text-[8px] font-black text-amber-300 uppercase tracking-[0.2em] mb-1">{CAT_CONFIG[category]?.label ?? category} Guide</p>
        <p className="font-display font-black italic text-white text-base leading-tight">{data.title}</p>
        <p className="text-white/60 text-[9px] mt-1">{data.subtitle} · {data.brands.length} brands</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {data.brands.map((brand, i) => (
          <motion.button
            key={brand.id}
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setActiveBrand(brand)}
            className="flex flex-col overflow-hidden rounded-[20px] border text-left shadow-sm bg-white"
            style={{ borderColor: brand.color + "25" }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-full h-24 flex items-center justify-center p-3" style={{ background: brand.color + "08" }}>
              <div className="rounded-[16px] flex items-center justify-center font-black text-white relative overflow-hidden"
                style={{
                  width: 56, height: 56,
                  background: `linear-gradient(145deg, ${brand.color}, ${brand.color}bb)`,
                  fontSize: 16, letterSpacing: "0.05em",
                  boxShadow: `0 4px 16px ${brand.color}35`,
                }}>
                <div className="absolute inset-0 opacity-[0.12]"
                  style={{ background: "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)" }} />
                <span className="relative z-10 drop-shadow-sm">{brand.initials}</span>
              </div>
              <div className="absolute top-1.5 right-1.5">
                <span className="text-[7px] font-black uppercase px-1.5 py-0.5 rounded-full text-white" style={{ background: brand.color }}>
                  {brand.products.length}
                </span>
              </div>
              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                <span className="text-[6px] font-black uppercase px-1.5 py-0.5 rounded-full block text-center truncate"
                  style={{ background: brand.color + "15", color: brand.color }}>
                  {brand.rank}
                </span>
              </div>
            </div>
            <div className="p-2 border-t" style={{ borderColor: brand.color + "15" }}>
              <p className="text-[10px] font-black leading-tight text-center" style={{ color: brand.color }}>{brand.name}</p>
              <p className="text-[7px] font-bold text-slate-400 leading-tight mt-0.5 truncate text-center">{brand.tagline}</p>
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {activeBrand && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setActiveBrand(null)} />
            <motion.div
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[32px] overflow-hidden"
              style={{ maxHeight: "82vh" }}>
              <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mt-3 mb-1" />
              <div className="px-5 pt-2 pb-4 flex items-center justify-between" style={{ borderBottom: `2px solid ${activeBrand.color}20` }}>
                <div className="flex items-center gap-3">
                  <div className="rounded-[14px] flex items-center justify-center font-black text-white relative overflow-hidden"
                    style={{ width: 44, height: 44, background: `linear-gradient(145deg, ${activeBrand.color}, ${activeBrand.color}bb)`, fontSize: 14, boxShadow: `0 4px 12px ${activeBrand.color}30` }}>
                    <div className="absolute inset-0 opacity-[0.12]"
                      style={{ background: "repeating-linear-gradient(135deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)" }} />
                    <span className="relative z-10">{activeBrand.initials}</span>
                  </div>
                  <div>
                    <p className="font-display font-black italic text-xl" style={{ color: activeBrand.color }}>{activeBrand.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{activeBrand.tagline}</p>
                  </div>
                </div>
                <button onClick={() => setActiveBrand(null)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-500 font-black text-sm">✕</button>
              </div>
              <div className="overflow-y-auto px-4 py-4 space-y-3" style={{ maxHeight: "60vh" }}>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{activeBrand.products.length} Products Available</p>
                {activeBrand.products.map((prod, pi) => (
                  <motion.div key={pi} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: pi * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-[18px]">
                    <button type="button"
                      onClick={() => onOpenDetail?.(brandVariantToProduct(category, activeBrand, prod))}
                      aria-label={`View ${prod.name} details`}
                      className="w-12 h-12 rounded-[14px] overflow-hidden shrink-0 bg-white border border-slate-100 active:scale-95 transition-transform">
                      <img src={resolveProductImage(category, prod.name)} alt={prod.name} loading="lazy" className="w-full h-full object-cover" onError={onImgError} />
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-black text-slate-800 leading-tight">{prod.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{prod.pack}</p>
                      {prod.tag ? (
                        <span className="text-[7px] font-black uppercase px-2 py-0.5 rounded-full text-white mt-1 inline-block"
                          style={{ background: activeBrand.color }}>{prod.tag}</span>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-display font-black italic text-base" style={{ color: BRAND_DARK }}>{prod.price}</span>
                      {(() => {
                        const qty = getQty(category, prod.name);
                        return (
                          <button onClick={() => onAddProduct({ category, name: prod.name, priceText: prod.price, unit: prod.pack, vendor: activeBrand.name })}
                            disabled={isAdding}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-[12px] text-white text-[9px] font-black disabled:opacity-50"
                            style={{ background: activeBrand.color }}>
                            <Plus className="w-2.5 h-2.5" /> Add{qty > 0 ? ` · ${qty}` : ""}
                          </button>
                        );
                      })()}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Steel Catalog ─────────────────────────────────────────────────── */
const STEEL_TYPES = [
  {
    id:       "tmt",
    name:     "TMT Bars — Thermo-Mechanically Treated",
    short:    "TMT",
    tag:      "Gold Standard",
    tagColor: "#b45309",
    image:    PROD("tmt-bars"),
    grades:   ["Fe415", "Fe500", "Fe550", "Fe600"],
    price:    "₹62–₹74",
    unit:     "per kg",
    desc:     "Specialized heat treatment (quenching & tempering) creates a hard outer core and a ductile soft inner core — the go-to bar for all modern construction.",
    specs:    [
      { label: "Yield Strength",    value: "415 / 500 / 550 / 600 N/mm²" },
      { label: "Elongation",        value: "≥ 14.5% (Fe500D)" },
      { label: "Bend / Re-bend",    value: "Passes IS 1786 standard" },
    ],
    bestFor:  ["Residential buildings", "High-rise structures", "Bridges", "Commercial RCC"],
    keyFeat:  "Excellent ductility, high weldability, superior earthquake resistance",
    featColor:"#b45309",
  },
  {
    id:       "tmx",
    name:     "TMX Bars — Thermex Technology",
    short:    "TMX",
    tag:      "German Tech",
    tagColor: "#1b4366",
    image:    PROD("tmt-bars"),
    grades:   ["Fe500", "Fe550", "Fe600"],
    price:    "₹68–₹80",
    unit:     "per kg",
    desc:     "Advanced version of TMT processed using German Thermex technology. Refined grain structure gives superior heat resistance and consistent mechanical properties throughout the bar.",
    specs:    [
      { label: "Technology",        value: "German Thermex quenching" },
      { label: "Thermal Stability", value: "Retains full strength at 600°C" },
      { label: "Grain Structure",   value: "More refined than standard TMT" },
    ],
    bestFor:  ["Fire-prone zones", "Extreme temperature areas", "Critical infrastructure"],
    keyFeat:  "Maintains full strength at 600°C — ideal for fire-resistant design",
    featColor:"#1b4366",
  },
  {
    id:       "hsd",
    name:     "HSD Bars — High Strength Deformed",
    short:    "HSD",
    tag:      "Cold Twisted",
    tagColor: "#374151",
    image:    PROD("tmt-bars"),
    grades:   ["Fe415"],
    price:    "₹58–₹65",
    unit:     "per kg",
    desc:     "Cold-twisted bars that increase strength through mechanical deformation. Surface ribs provide excellent mechanical bond with concrete — though internal stresses may be introduced during twisting.",
    specs:    [
      { label: "Process",           value: "Cold-twisting (not heat treated)" },
      { label: "Yield Strength",    value: "≥ 415 N/mm² (Fe415)" },
      { label: "Surface",           value: "Helical ribs for concrete bond" },
    ],
    bestFor:  ["General reinforcement", "Smaller structures", "Slabs & beams"],
    keyFeat:  "Surface ribs give superior mechanical bond with concrete",
    featColor:"#374151",
  },
  {
    id:       "crs",
    name:     "CRS — Corrosion Resistant Steel",
    short:    "CRS",
    tag:      "Coastal Safe",
    tagColor: "#0891b2",
    image:    PROD("tmt-bars"),
    grades:   ["Fe500 CRS", "Epoxy Coated"],
    price:    "₹78–₹95",
    unit:     "per kg",
    desc:     "Treated with fusion-bonded epoxy coating or chrome/copper alloy additives. Prevents the leading cause of structural failure in India — rust expanding inside concrete causing 'spalling'.",
    specs:    [
      { label: "Protection",        value: "Epoxy coating or CrCu alloy" },
      { label: "Salt Resistance",   value: "Withstands chloride & sulfate" },
      { label: "Life Expectancy",   value: "50–100 years in marine conditions" },
    ],
    bestFor:  ["Coastal foundations", "Marine structures", "Saltwater bridges", "Ports"],
    keyFeat:  "Stops spalling — rust cannot expand inside concrete",
    featColor:"#0891b2",
  },
  {
    id:       "ms",
    name:     "Mild Steel Plain Bars",
    short:    "MS",
    tag:      "Economy",
    tagColor: "#15803d",
    image:    PROD("tmt-bars"),
    grades:   ["Fe250"],
    price:    "₹50–₹58",
    unit:     "per kg",
    desc:     "Smooth surface, no ribs or lugs. Most workable and cheapest bar. Highly ductile and easy to cut or bend on-site — but bond with concrete is weaker than deformed bars.",
    specs:    [
      { label: "Yield Strength",    value: "≥ 250 N/mm² (Fe250)" },
      { label: "Surface",           value: "Smooth — no ribs" },
      { label: "Elongation",        value: "≥ 23%" },
    ],
    bestFor:  ["Small-scale projects", "Dowels in expansion joints", "Light stirrups"],
    keyFeat:  "Easiest to bend and cut on-site — lowest cost option",
    featColor:"#15803d",
  },
];

function SteelCatalog({ onAddProduct, isAdding, getQty }: {
  onAddProduct: (opts: { category: string; name: string; priceText: string; unit?: string; vendor?: string; quantity?: number }) => void;
  isAdding: boolean;
  getQty: (category: string, name: string) => number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div
        className="p-4 rounded-[24px] mb-2"
        style={{ background: "linear-gradient(135deg, #1c1917 0%, #44403c 100%)" }}
      >
        <p className="text-[8px] font-black text-amber-300 uppercase tracking-[0.2em] mb-1">Sariya Guide</p>
        <p className="font-display font-black italic text-white text-base leading-tight">
          5 Types of Steel Bars — Know Before You Buy
        </p>
        <p className="text-stone-300/60 text-[9px] mt-1">Grade selection directly affects earthquake safety. Tap a card to see full specs.</p>
      </div>

      {STEEL_TYPES.map((st, i) => {
        const isOpen = expanded === st.id;
        return (
          <motion.div
            key={st.id}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="bg-white rounded-[28px] overflow-hidden"
            style={{ border: "1px solid #f1f5f9", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}
          >
            <div className="relative h-28 overflow-hidden">
              <img src={st.image} alt={st.name} className="w-full h-full object-cover" onError={onImgError} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                {st.grades.map(g => (
                  <span key={g} className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full text-white" style={{ background: st.tagColor }}>{g}</span>
                ))}
              </div>
              <div className="absolute top-3 right-3 text-[8px] font-black px-2.5 py-1 rounded-full text-white" style={{ background: "rgba(0,0,0,0.45)" }}>
                {st.tag}
              </div>
              <div className="absolute bottom-3 left-4 right-4">
                <p className="font-display font-black italic text-white text-base leading-tight drop-shadow">{st.short}</p>
                <p className="text-white/70 text-[9px] font-bold leading-tight">{st.name.split(" — ")[1]}</p>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-display font-black italic text-lg" style={{ color: BRAND_DARK }}>{st.price}</span>
                  <span className="text-[9px] text-slate-400 ml-1">{st.unit}</span>
                </div>
                {(() => {
                  const qty = getQty("steel", st.short);
                  return (
                    <button
                      onClick={() => onAddProduct({ category: "steel", name: st.short, priceText: st.price, unit: st.unit, vendor: "Steel Marketplace" })}
                      disabled={isAdding}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-[18px] text-white text-[10px] font-black uppercase disabled:opacity-50"
                      style={{ background: BRAND_DARK }}
                    >
                      <Plus className="w-3 h-3" /> Add{qty > 0 ? ` · ${qty}` : ""}
                    </button>
                  );
                })()}
              </div>

              <p className="text-[10px] text-slate-500 leading-relaxed mb-3">{st.desc}</p>

              <div className="flex items-start gap-2 px-3 py-2 rounded-[14px] mb-3" style={{ background: st.featColor + "12" }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: st.featColor }} />
                <p className="text-[9px] font-black leading-relaxed" style={{ color: st.featColor }}>{st.keyFeat}</p>
              </div>

              <button
                onClick={() => setExpanded(isOpen ? null : st.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl"
                style={{ background: "#f8fafc", color: BRAND_DARK }}
              >
                {isOpen ? "Hide Specs ▲" : "View Full Specs ▼"}
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-4 space-y-3">
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Specifications</p>
                        <div className="space-y-1.5">
                          {st.specs.map(s => (
                            <div key={s.label} className="flex justify-between items-start gap-2 py-1.5 px-3 bg-slate-50 rounded-xl">
                              <span className="text-[9px] font-bold text-slate-500 leading-tight">{s.label}</span>
                              <span className="text-[9px] font-black text-slate-800 text-right leading-tight">{s.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Best For</p>
                        <div className="flex flex-wrap gap-1.5">
                          {st.bestFor.map(b => (
                            <span key={b} className="text-[8px] font-black px-2.5 py-1 rounded-full text-white" style={{ background: st.tagColor }}>{b}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
