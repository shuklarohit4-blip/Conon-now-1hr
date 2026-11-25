import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "artifacts/conon/public");
const outDir = path.join(publicDir, "images/products/paints-putty-primer");
const distDir = path.join(rootDir, "artifacts/conon/dist/public/images/products/paints-putty-primer");

fs.mkdirSync(outDir, { recursive: true });
if (fs.existsSync(path.dirname(distDir))) {
  fs.mkdirSync(distDir, { recursive: true });
}

const manifestPath = path.join(rootDir, "scripts/image-manifest.json");
let manifest: Record<string, any> = {};
if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
  } catch {}
}

const jsonPath = path.resolve(rootDir, "scratch/all_48_paints_products.json");
const products: any[] = JSON.parse(fs.readFileSync(jsonPath, "utf-8"));

const brandColors: Record<string, { primary: string; secondary: string; accent: string }> = {
  "asian paints": { primary: "#DC2626", secondary: "#FEF2F2", accent: "#991B1B" },
  berger: { primary: "#047857", secondary: "#ECFDF5", accent: "#065F46" },
  nerolac: { primary: "#0284C7", secondary: "#F0F9FF", accent: "#0369A1" },
  "birla white": { primary: "#B91C1C", secondary: "#FFF1F2", accent: "#881337" },
  "jk cement": { primary: "#C2410C", secondary: "#FFF7ED", accent: "#9A3412" },
  "birla opus": { primary: "#6B21A8", secondary: "#FAF5FF", accent: "#4C1D95" },
  dulux: { primary: "#1D4ED8", secondary: "#EFF6FF", accent: "#1E40AF" },
  "standard isi": { primary: "#334155", secondary: "#F8FAFC", accent: "#1E293B" },
};

function getColors(brand: string) {
  const bLower = brand.toLowerCase();
  const key = Object.keys(brandColors).find((k) => bLower.includes(k)) || "asian paints";
  return brandColors[key];
}

function escapeXml(unsafe: any): string {
  return String(unsafe ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function truncateText(str: string, max: number): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

export function generatePaintSvg(product: any): Buffer {
  const colors = getColors(product.brand);
  const isPutty = product.paintSubcategory === "WALL_PUTTY";
  const isPrimer = product.paintSubcategory === "PRIMER";
  const isInterior = product.paintSubcategory === "INTERIOR_PAINT";
  const isExterior = product.paintSubcategory === "EXTERIOR_PAINT";
  const isEnamelOrTool = product.paintSubcategory === "ENAMEL_AND_TOOLS";

  const isDrum20L = product.packSizeUnit === "L" && product.packSizeValue === 20;
  const isCan4L = product.packSizeUnit === "L" && product.packSizeValue === 4;
  const isTin1L = product.packSizeUnit === "L" && product.packSizeValue === 1;
  const isSack40kg = product.packSizeUnit === "kg" && product.packSizeValue === 40;
  const isSack20kg = product.packSizeUnit === "kg" && product.packSizeValue === 20;

  const isRoller = product.slug.includes("roller");
  const isBrush = product.slug.includes("brush");
  const isThinner = product.slug.includes("thinner");
  const isSandpaper = product.slug.includes("sandpaper");

  let graphicSvg = "";

  if (isPutty) {
    if (product.slug.includes("acrylic")) {
      // Acrylic putty bucket (Asian Paints TruCare 20kg)
      graphicSvg = `
        <g transform="translate(190, 180)">
          <!-- Bucket Body -->
          <path d="M 50 80 L 70 380 Q 210 400 350 380 L 370 80 Z" fill="#F8FAFC" stroke="${colors.primary}" stroke-width="8"/>
          <!-- Bucket Rim & Lid -->
          <ellipse cx="210" cy="80" rx="160" ry="24" fill="${colors.primary}" stroke="#FFFFFF" stroke-width="3"/>
          <ellipse cx="210" cy="74" rx="145" ry="18" fill="${colors.accent}"/>
          <!-- Handle Arch -->
          <path d="M 60 120 C 60 20, 360 20, 360 120" stroke="#94A3B8" stroke-width="8" fill="none"/>
          <!-- Label Banner -->
          <rect x="80" y="160" width="260" height="150" rx="12" fill="#FFFFFF" stroke="${colors.primary}" stroke-width="2"/>
          <rect x="80" y="160" width="260" height="42" rx="12" fill="${colors.primary}"/>
          <text x="210" y="188" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF">
            ACRYLIC WALL PUTTY
          </text>
          <text x="210" y="232" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="18" fill="#0F172A">
            20 KG BUCKET
          </text>
          <text x="210" y="260" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="12" fill="${colors.primary}">
            Ready-to-Use Paste • Mirror Smooth
          </text>
          <text x="210" y="290" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="13" fill="#059669">
            ₹69.00 / kg (HSN 3214)
          </text>
        </g>
      `;
    } else {
      // 40kg or 20kg Heavy Cement Sack
      const sackWeight = isSack40kg ? "40 KG SACK" : "20 KG BAG";
      const isWaterproof = product.slug.includes("waterproof") || product.slug.includes("wallseal");
      const badgeText = isWaterproof ? "WATERPROOF SILICONE" : "WHITE CEMENT PUTTY";
      const badgeBg = isWaterproof ? "#0284C7" : colors.primary;

      graphicSvg = `
        <g transform="translate(190, 170)">
          <!-- Woven Sack Body -->
          <path d="M 60 70 Q 210 50 360 70 L 380 390 Q 210 410 40 390 Z" fill="#F8FAFC" stroke="${colors.primary}" stroke-width="8"/>
          <!-- Sewn Top Stitching -->
          <line x1="50" y1="75" x2="370" y2="75" stroke="${colors.accent}" stroke-width="4" stroke-dasharray="8,6"/>
          <!-- Sack Corner Folds -->
          <path d="M 60 70 L 90 120" stroke="#CBD5E1" stroke-width="3"/>
          <path d="M 360 70 L 330 120" stroke="#CBD5E1" stroke-width="3"/>
          <!-- Brand Face Plate -->
          <rect x="75" y="140" width="270" height="180" rx="14" fill="#FFFFFF" stroke="${badgeBg}" stroke-width="3"/>
          <rect x="75" y="140" width="270" height="46" rx="14" fill="${badgeBg}"/>
          <text x="210" y="170" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF">
            ${badgeText}
          </text>
          <text x="210" y="222" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="22" fill="#0F172A">
            ${sackWeight}
          </text>
          <text x="210" y="254" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="12" fill="${colors.primary}">
            High Whiteness &gt;94% • Self-Curing
          </text>
          <text x="210" y="284" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="13" fill="#059669">
            ₹${escapeXml(product.effectiveUnitRate)} / kg (HSN 3214)
          </text>
        </g>
      `;
    }
  } else if (isPrimer) {
    if (isTin1L) {
      // 1L Red Oxide Metal Primer Tin
      graphicSvg = `
        <g transform="translate(230, 180)">
          <!-- Cylindrical Metal Tin -->
          <rect x="40" y="70" width="260" height="300" rx="18" fill="#F8FAFC" stroke="#7F1D1D" stroke-width="8"/>
          <!-- Metal Rim Top and Bottom -->
          <ellipse cx="170" cy="70" rx="130" ry="20" fill="#991B1B" stroke="#FFFFFF" stroke-width="3"/>
          <ellipse cx="170" cy="370" rx="130" ry="20" fill="#7F1D1D" opacity="0.1"/>
          <!-- Red Oxide Band -->
          <rect x="40" y="130" width="260" height="150" fill="#991B1B"/>
          <text x="170" y="175" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="17" fill="#FFFFFF">
            RED OXIDE PRIMER
          </text>
          <text x="170" y="210" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="14" fill="#FEE2E2">
            1 LITRE SYNTHETIC TIN
          </text>
          <text x="170" y="240" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="12" fill="#FEF08A">
            Anti-Rust Mild Steel Anchor
          </text>
          <rect x="85" y="300" width="170" height="36" rx="8" fill="#F1F5F9" stroke="#7F1D1D" stroke-width="1.5"/>
          <text x="170" y="324" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="13" fill="#7F1D1D">
            ₹236 / L (HSN 3208)
          </text>
        </g>
      `;
    } else {
      // 4L Can or 20L Master Primer Bucket
      const is20L = isDrum20L;
      const packLabel = is20L ? "20 LITRE MASTER DRUM" : "4 LITRE BUCKET";
      const isExt = product.surfaceType === "EXTERIOR";
      const headerColor = isExt ? "#047857" : "#0284C7";
      const titleLabel = isExt ? "EXTERIOR WALL PRIMER" : "INTERIOR WALL PRIMER";

      graphicSvg = `
        <g transform="translate(190, 180)">
          <!-- Bucket Shell -->
          <path d="M 50 80 L 70 380 Q 210 400 350 380 L 370 80 Z" fill="#F8FAFC" stroke="${headerColor}" stroke-width="8"/>
          <!-- Lid -->
          <ellipse cx="210" cy="80" rx="160" ry="24" fill="${headerColor}" stroke="#FFFFFF" stroke-width="3"/>
          <ellipse cx="210" cy="74" rx="145" ry="18" fill="#0F172A" opacity="0.2"/>
          <!-- Metal Handle -->
          <path d="M 60 120 C 60 20, 360 20, 360 120" stroke="#94A3B8" stroke-width="7" fill="none"/>
          <!-- Label Panel -->
          <rect x="80" y="150" width="260" height="160" rx="12" fill="#FFFFFF" stroke="${headerColor}" stroke-width="2"/>
          <rect x="80" y="150" width="260" height="42" rx="12" fill="${headerColor}"/>
          <text x="210" y="178" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF">
            ${titleLabel}
          </text>
          <text x="210" y="222" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="18" fill="#0F172A">
            ${packLabel}
          </text>
          <text x="210" y="252" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="12" fill="${headerColor}">
            Alkali Sealer • Water-Thinnable
          </text>
          <text x="210" y="284" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="13" fill="#059669">
            ₹${escapeXml(product.effectiveUnitRate)} / L (HSN 3209)
          </text>
        </g>
      `;
    }
  } else if (isInterior || isExterior) {
    // 4L Can or 20L Master Paint Drum
    const is20L = isDrum20L;
    const isDistemper = product.slug.includes("distemper");
    const isLuxury = product.slug.includes("royale") || product.slug.includes("ultima") || product.slug.includes("opus-one") || product.slug.includes("powerflexx");
    const isExteriorPaint = isExterior;

    const packLabel = isDistemper ? "20 KG MASTER BUCKET" : is20L ? "20 LITRE DRUM" : "4 LITRE PACK";
    const categoryTitle = isDistemper
      ? "ACRYLIC DISTEMPER"
      : isLuxury
      ? "SUPER LUXURY EMULSION"
      : isExteriorPaint
      ? "WEATHERPROOF EXTERIOR"
      : "PREMIUM INTERIOR EMULSION";

    const bannerColor = isLuxury ? "#78350F" : isExteriorPaint ? "#0369A1" : colors.primary;

    graphicSvg = `
      <g transform="translate(190, 180)">
        <!-- Bucket Outline -->
        <path d="M 50 80 L 70 380 Q 210 400 350 380 L 370 80 Z" fill="#F8FAFC" stroke="${bannerColor}" stroke-width="8"/>
        <!-- Heavy Lid -->
        <ellipse cx="210" cy="80" rx="160" ry="24" fill="${bannerColor}" stroke="#FFFFFF" stroke-width="3"/>
        <ellipse cx="210" cy="74" rx="145" ry="18" fill="#FFFFFF" opacity="0.3"/>
        <!-- Sturdy Wire Handle -->
        <path d="M 60 120 C 60 20, 360 20, 360 120" stroke="#64748B" stroke-width="8" fill="none"/>
        <circle cx="210" cy="20" r="14" fill="#0F172A"/>
        <!-- High Gloss Product Label -->
        <rect x="78" y="145" width="264" height="175" rx="14" fill="#FFFFFF" stroke="${bannerColor}" stroke-width="2.5"/>
        <rect x="78" y="145" width="264" height="46" rx="14" fill="${bannerColor}"/>
        <text x="210" y="174" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF">
          ${categoryTitle}
        </text>
        <text x="210" y="218" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="20" fill="#0F172A">
          ${packLabel}
        </text>
        <text x="210" y="248" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="12" fill="${colors.accent}">
          ${escapeXml(truncateText(product.finishType, 32))}
        </text>
        <text x="210" y="274" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="11" fill="#475569">
          ${product.isTintable ? "Color Spectra Computerized Tinting Ready" : "Pure High Opacity Base White"}
        </text>
        <text x="210" y="302" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="14" fill="#059669">
          ₹${escapeXml(product.effectiveUnitRate)} / ${escapeXml(product.packSizeUnit)} (18% GST)
        </text>
      </g>
    `;
  } else {
    // 4.5 Enamels, Thinners & Tools
    if (isRoller) {
      // 9" Roller
      graphicSvg = `
        <g transform="translate(190, 180)">
          <!-- Roller Frame Metal Rod -->
          <path d="M 210 380 L 210 260 L 320 200 L 320 120 L 100 120" stroke="#64748B" stroke-width="12" fill="none" stroke-linecap="round"/>
          <!-- Handle Grip -->
          <rect x="185" y="310" width="50" height="90" rx="10" fill="${colors.primary}" stroke="#0F172A" stroke-width="2"/>
          <line x1="185" y1="340" x2="235" y2="340" stroke="#FFFFFF" stroke-width="3"/>
          <line x1="185" y1="370" x2="235" y2="370" stroke="#FFFFFF" stroke-width="3"/>
          <!-- Roller Felt Cylinder -->
          <rect x="80" y="90" width="240" height="70" rx="18" fill="#F8FAFC" stroke="${colors.primary}" stroke-width="6"/>
          <!-- Felt Texture Stripes -->
          <line x1="120" y1="90" x2="120" y2="160" stroke="#E2E8F0" stroke-width="4"/>
          <line x1="160" y1="90" x2="160" y2="160" stroke="#E2E8F0" stroke-width="4"/>
          <line x1="200" y1="90" x2="200" y2="160" stroke="#E2E8F0" stroke-width="4"/>
          <line x1="240" y1="90" x2="240" y2="160" stroke="#E2E8F0" stroke-width="4"/>
          <line x1="280" y1="90" x2="280" y2="160" stroke="#E2E8F0" stroke-width="4"/>
          <!-- Badge -->
          <rect x="100" y="210" width="220" height="42" rx="10" fill="#0F172A"/>
          <text x="210" y="236" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF">
            9" FELT ROLLER 800
          </text>
        </g>
      `;
    } else if (isBrush) {
      // 4" Synthetic Brush
      graphicSvg = `
        <g transform="translate(230, 180)">
          <!-- Wooden Handle -->
          <path d="M 145 380 L 160 210 L 180 210 L 195 380 Z" fill="#D97706" stroke="#92400E" stroke-width="3"/>
          <circle cx="170" cy="355" r="6" fill="#FFFFFF"/>
          <!-- Stainless Steel Ferrule -->
          <rect x="90" y="160" width="160" height="60" rx="6" fill="#CBD5E1" stroke="#64748B" stroke-width="3"/>
          <!-- Bristles -->
          <path d="M 90 160 L 80 80 Q 170 70 260 80 L 250 160 Z" fill="#334155" stroke="#1E293B" stroke-width="4"/>
          <!-- Bristle details -->
          <line x1="120" y1="80" x2="120" y2="160" stroke="#475569" stroke-width="2"/>
          <line x1="170" y1="75" x2="170" y2="160" stroke="#475569" stroke-width="2"/>
          <line x1="220" y1="80" x2="220" y2="160" stroke="#475569" stroke-width="2"/>
          <!-- Badge -->
          <rect x="80" y="240" width="180" height="40" rx="8" fill="${colors.primary}"/>
          <text x="170" y="265" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF">
            4" SYNTHETIC BRUSH
          </text>
        </g>
      `;
    } else if (isThinner) {
      // 1L Mineral Turpentine Oil Bottle
      graphicSvg = `
        <g transform="translate(240, 180)">
          <!-- Solvent Bottle Neck & Cap -->
          <rect x="135" y="70" width="50" height="40" rx="4" fill="#DC2626"/>
          <path d="M 135 110 L 100 150 L 100 370 L 220 370 L 220 150 L 185 110 Z" fill="#FEF3C7" stroke="#D97706" stroke-width="6"/>
          <!-- Pure Solvent Label -->
          <rect x="106" y="170" width="108" height="150" fill="#FFFFFF" stroke="#D97706" stroke-width="2"/>
          <text x="160" y="210" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="13" fill="#B45309">
            MTO
          </text>
          <text x="160" y="235" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="11" fill="#0F172A">
            THINNER
          </text>
          <text x="160" y="265" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="10" fill="#475569">
            1 Litre Bottle
          </text>
          <text x="160" y="295" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="11" fill="#059669">
            ₹150 / L
          </text>
        </g>
      `;
    } else if (isSandpaper) {
      // 180-Grit Sandpaper Pack
      graphicSvg = `
        <g transform="translate(200, 180)">
          <!-- Stack of Sandpaper Sheets -->
          <rect x="60" y="110" width="280" height="240" rx="10" fill="#475569" stroke="#1E293B" stroke-width="4"/>
          <rect x="50" y="100" width="280" height="240" rx="10" fill="#334155" stroke="#1E293B" stroke-width="4"/>
          <rect x="40" y="90" width="280" height="240" rx="10" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
          <!-- Silicon Carbide Texture Grain -->
          <pattern id="sandgrit" width="12" height="12" patternUnits="userSpaceOnUse">
            <circle cx="3" cy="3" r="1.5" fill="#64748B"/>
            <circle cx="9" cy="9" r="1.5" fill="#475569"/>
          </pattern>
          <rect x="44" y="94" width="272" height="232" rx="8" fill="url(#sandgrit)"/>
          <!-- Center Pack Label -->
          <rect x="70" y="150" width="220" height="110" rx="10" fill="#FFFFFF" stroke="#0F172A" stroke-width="3"/>
          <text x="180" y="185" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="18" fill="#0F172A">
            180-GRIT
          </text>
          <text x="180" y="215" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="14" fill="#2563EB">
            WATERPROOF PACK OF 10
          </text>
          <text x="180" y="240" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="12" fill="#059669">
            ₹12 / Sheet (HSN 6805)
          </text>
        </g>
      `;
    } else {
      // 1L or 4L Gloss Enamel Tin
      const is4L = isCan4L;
      graphicSvg = `
        <g transform="translate(220, 180)">
          <!-- Cylindrical Enamel Tin -->
          <rect x="30" y="70" width="280" height="300" rx="16" fill="#F8FAFC" stroke="${colors.primary}" stroke-width="8"/>
          <!-- Tin Rim -->
          <ellipse cx="170" cy="70" rx="140" ry="20" fill="${colors.primary}" stroke="#FFFFFF" stroke-width="3"/>
          <!-- High Gloss Mirror Banner -->
          <rect x="30" y="130" width="280" height="150" fill="${colors.accent}"/>
          <text x="170" y="175" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF">
            PREMIUM GLOSS ENAMEL
          </text>
          <text x="170" y="210" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="18" fill="#FEF08A">
            ${is4L ? "4 LITRE PACK" : "1 LITRE TIN"}
          </text>
          <text x="170" y="240" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="12" fill="#F1F5F9">
            Mirror Sheen • Metal Grills &amp; Doors
          </text>
          <rect x="80" y="300" width="180" height="38" rx="8" fill="#F1F5F9" stroke="${colors.primary}" stroke-width="1.5"/>
          <text x="170" y="324" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="13" fill="${colors.primary}">
            ₹${escapeXml(product.effectiveUnitRate)} / L (HSN 3208)
          </text>
        </g>
      `;
    }
  }

  const svg = `
    <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="bgGlow" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF"/>
          <stop offset="60%" stop-color="#F8FAFC"/>
          <stop offset="100%" stop-color="#E2E8F0"/>
        </radialGradient>
        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0F172A" flood-opacity="0.14"/>
        </filter>
      </defs>

      <!-- Background -->
      <rect width="800" height="800" fill="url(#bgGlow)"/>

      <!-- Header Brand & Verification Badges -->
      <rect x="36" y="36" width="728" height="74" rx="14" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow)"/>
      
      <!-- Brand Logo Badge -->
      <rect x="50" y="48" width="190" height="50" rx="10" fill="${colors.primary}"/>
      <text x="145" y="80" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="17" fill="#FFFFFF">
        ${escapeXml(product.brand.toUpperCase())}
      </text>

      <!-- Subcategory / GST Badges -->
      <rect x="252" y="52" width="170" height="42" rx="8" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="1.5"/>
      <text x="337" y="78" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="12" fill="#334155">
        ${escapeXml(product.subCategory.toUpperCase())}
      </text>

      <rect x="432" y="52" width="150" height="42" rx="8" fill="#ECFDF5" stroke="#10B981" stroke-width="1.5"/>
      <text x="507" y="78" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="12" fill="#047857">
        18% GST (HSN ${escapeXml(product.hsnCode)})
      </text>

      <rect x="592" y="52" width="156" height="42" rx="8" fill="#FEF3C7" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="670" y="78" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="12" fill="#B45309">
        LKO EXPRESS 60M
      </text>

      <!-- Product Graphic Section -->
      <g filter="url(#shadow)">
        ${graphicSvg}
      </g>

      <!-- Footer Specification Card -->
      <rect x="36" y="670" width="728" height="96" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="url(#shadow)"/>
      
      <!-- Product Name -->
      <text x="56" y="704" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="19" fill="#0F172A">
        ${escapeXml(truncateText(product.name, 48))}
      </text>

      <!-- Meta Info Line -->
      <text x="56" y="734" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="700" font-size="13" fill="#64748B">
        OEM: ${escapeXml(product.oemModelCode)} • Surface: ${escapeXml(product.surfaceType)} • Vehicle: ${escapeXml(product.deliveryVehicleType)}
      </text>

      <!-- Wholesaler Line -->
      <text x="56" y="754" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="600" font-size="11" fill="#94A3B8">
        Verified Genuine Wholesaler Supply: ${escapeXml(product.vendor)}
      </text>

      <!-- Price Box in Footer -->
      <rect x="590" y="682" width="160" height="72" rx="12" fill="${colors.secondary}" stroke="${colors.primary}" stroke-width="2"/>
      <text x="670" y="714" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="900" font-size="22" fill="${colors.primary}">
        ₹${escapeXml(product.price.toLocaleString("en-IN"))}
      </text>
      <text x="670" y="740" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-weight="800" font-size="12" fill="#059669">
        ₹${escapeXml(product.effectiveUnitRate)} / ${escapeXml(product.packSizeUnit)}
      </text>
    </svg>
  `;

  return Buffer.from(svg.trim());
}

async function run() {
  const isDryRun = process.argv.includes("--dry-run");

  const targetProducts = isDryRun
    ? [
        products.find((p) => p.slug === "birla-white-wallcare-putty-40kg"),
        products.find((p) => p.slug === "asian-paints-trucare-interior-primer-4l"),
        products.find((p) => p.slug === "asian-paints-royale-luxury-emulsion-base-white-4l"),
        products.find((p) => p.slug === "berger-weathercoat-anti-dustt-exterior-20l"),
        products.find((p) => p.slug === "asian-paints-apcolite-premium-gloss-enamel-1l"),
      ].filter(Boolean)
    : products;

  console.log(`Starting packshot generation for ${targetProducts.length} items (${isDryRun ? "DRY RUN (5 SKUs)" : "FULL RUN (48 SKUs)"})...`);

  for (const product of targetProducts) {
    const filename = `${product.slug}.webp`;
    const outPath = path.join(outDir, filename);

    const svgBuffer = generatePaintSvg(product);
    await sharp(svgBuffer)
      .webp({ quality: 84 })
      .toFile(outPath);

    if (fs.existsSync(distDir)) {
      const distPath = path.join(distDir, filename);
      fs.copyFileSync(outPath, distPath);
    }

    manifest[product.slug] = {
      path: `/images/products/paints-putty-primer/${filename}`,
      brand: product.brand,
      oemModelCode: product.oemModelCode,
      subCategory: product.subCategory,
      verified: true,
      lastUpdated: new Date().toISOString(),
    };

    console.log(`✓ Generated: ${filename} (800x800 WebP)`);
  }

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`Packshot generation completed successfully! Manifest updated at ${manifestPath}`);
}

run().catch((err) => {
  console.error("Packshot generation error:", err);
  process.exit(1);
});
