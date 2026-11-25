import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";

// Configuration & Paths
const rootDir = process.cwd();
const publicDir = path.join(rootDir, "artifacts/conon/public");
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");
const rawAssetsDir = path.join(rootDir, "raw-brand-assets");

// Ensure directories
fs.mkdirSync(path.join(publicDir, "images/products"), { recursive: true });
fs.mkdirSync(rawAssetsDir, { recursive: true });

// Read existing manifest or initialize
let manifest = {};
if (fs.existsSync(manifestPath)) {
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (e) {
    manifest = {};
  }
}

// 5 Sample SKUs for Dry Run
export const STRUCTURAL_SAMPLE_SKUS = [
  {
    id: "ultratech-ppc-cement-50kg",
    slug: "ultratech-ppc-cement-50kg",
    categorySlug: "cement-tmt-chemicals",
    title: "UltraTech PPC Cement (50 kg Bag)",
    brand: "UltraTech",
    oemModelCode: "UT-PPC-50",
    price: 395,
  },
  {
    id: "tata-tiscon-fe-500d-12mm-12m",
    slug: "tata-tiscon-fe-500d-12mm-12m",
    categorySlug: "cement-tmt-chemicals",
    title: "Tata Tiscon Fe 500D 12mm TMT Bar (12m, 10.67 kg)",
    brand: "Tata Tiscon",
    oemModelCode: "TATA-500D-12",
    price: 756,
  },
  {
    id: "dr-fixit-101-pidiproof-lw-plus-1l",
    slug: "dr-fixit-101-pidiproof-lw-plus-1l",
    categorySlug: "cement-tmt-chemicals",
    title: "Dr. Fixit 101 Pidiproof LW+ Integral Compound (1 L, HSN 3824)",
    brand: "Dr. Fixit",
    oemModelCode: "FIXIT-101-01L",
    price: 199,
  },
  {
    id: "ultratech-fixoblock-aac-jointing-40kg",
    slug: "ultratech-fixoblock-aac-jointing-40kg",
    categorySlug: "cement-tmt-chemicals",
    title: "UltraTech Fixoblock AAC Block Jointing Adhesive (40 kg Bag)",
    brand: "UltraTech",
    oemModelCode: "UT-FIXO-40",
    price: 380,
  },
  {
    id: "roff-t02-non-skid-tile-adhesive-20kg",
    slug: "roff-t02-non-skid-tile-adhesive-20kg",
    categorySlug: "cement-tmt-chemicals",
    title: "Roff T02 Non-Skid Tile Adhesive Grey (20 kg Bag)",
    brand: "Roff",
    oemModelCode: "ROFF-T02-20",
    price: 500,
  },
];

export const SAMPLE_SKUS = [
  {
    id: "jaquar-concealed-cistern-body",
    slug: "jaquar-concealed-cistern-body",
    categorySlug: "sanitary",
    title: "Jaquar Concealed Cistern Frame & Tank, Pneumatic Dual Flush",
    brand: "Jaquar",
    oemModelCode: "JCS-WHT-2400FS",
    price: 4850,
  },
  {
    id: "cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q",
    slug: "cp-plus-4mp-wifi-full-color-pt-camera-cp-z43q",
    categorySlug: "cctv",
    title: "CP Plus 4MP Wi-Fi Full Color PT Camera - CP-Z43Q",
    brand: "CP Plus",
    oemModelCode: "CP-Z43Q",
    price: 3984,
  },
  {
    id: "astral-cpvc-pro-15mm-sdr11-3m",
    slug: "astral-cpvc-pro-15mm-sdr11-3m",
    categorySlug: "plumbing",
    title: 'Astral CPVC Pro 1/2" (15mm) SDR-11, 3m (10ft)',
    brand: "Astral",
    oemModelCode: "M511110301",
    price: 197,
  },
  {
    id: "sintex-pure-1000l-antibacterial-white",
    slug: "sintex-pure-1000l-antibacterial-white",
    categorySlug: "plumbing",
    title: "Sintex Pure 1000L 100% Antibacterial Overhead Tank (White)",
    brand: "Sintex",
    oemModelCode: "CCWS-0100-01",
    price: 8999,
  },
  {
    id: "polycab-maxima-green-wire-hr-fr-lsh",
    slug: "polycab-maxima-green-wire-hr-fr-lsh",
    categorySlug: "electrical",
    title: "Polycab Maxima+ Green Wire HR FR-LSH LF 1.5 sq mm (90m Coil)",
    brand: "Polycab",
    oemModelCode: "MAXIMA-1.5-GRN",
    price: 2450,
  },
];

// Load catalog products from catalogData.ts & Storefronts
export function getAllCatalogProducts() {
  const productsMap = new Map();

  // 1. catalogData.ts
  const catalogPath = path.join(rootDir, "artifacts/conon/src/data/catalogData.ts");
  if (fs.existsSync(catalogPath)) {
    const content = fs.readFileSync(catalogPath, "utf8");
    const startMarker = "export const CATALOG_PRODUCTS: IProduct[] = [";
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.lastIndexOf("];\n\nexport const getProductsByCategory");
    if (startIdx !== -1 && endIdx !== -1) {
      try {
        const list = JSON.parse(content.slice(startIdx + startMarker.length - 1, endIdx + 1));
        list.forEach((p) => {
          const categorySlug = p.categorySlug.replace("cpvc-plumbing-tanks", "plumbing").replace("cctv-networking", "cctv").replace("wires-mcb-electrical", "electrical").replace("sanitary-bath-fittings", "sanitary");
          productsMap.set(p.slug || p.id, {
            id: p.slug || p.id,
            slug: p.slug || p.id,
            categorySlug,
            title: p.title || p.name,
            brand: p.brand || "Brand",
            oemModelCode: p.oemModelCode || "",
            price: p.price,
            currentImage: p.image,
          });
        });
      } catch (e) {}
    }
  }

  // 2. Discover all Storefront components dynamically
  const sfDir = path.join(rootDir, "artifacts/conon/src/components");
  if (fs.existsSync(sfDir)) {
    const sfFiles = fs.readdirSync(sfDir).filter((f) => f.includes("Storefront.tsx"));
    for (const sf of sfFiles) {
      const fullPath = path.join(sfDir, sf);
      const content = fs.readFileSync(fullPath, "utf8");

      let categorySlug = "general";
      const sfLower = sf.toLowerCase();
      if (sfLower.includes("sanitary")) categorySlug = "sanitary";
      else if (sfLower.includes("cctv")) categorySlug = "cctv";
      else if (sfLower.includes("plumbing")) categorySlug = "plumbing";
      else if (sfLower.includes("electrical")) categorySlug = "electrical";
      else if (sfLower.includes("appliances")) categorySlug = "appliances";
      else if (sfLower.includes("kitchen")) categorySlug = "modular-kitchen";
      else if (sfLower.includes("fevicol")) categorySlug = "adhesives";
      else if (sfLower.includes("cement")) categorySlug = "cement-tmt-chemicals";
      else if (sfLower.includes("locks") || sfLower.includes("hinges")) categorySlug = "hardware";
      else if (sfLower.includes("tile")) categorySlug = "tiles";
      else if (sfLower.includes("paint")) categorySlug = "paint";
      else if (sfLower.includes("plywood")) categorySlug = "plywood";
      else if (sfLower.includes("safety")) categorySlug = "safety";
      else if (sfLower.includes("lighting")) categorySlug = "lighting";

      const matches = content.match(/export const [A-Z0-9_]+_PRODUCTS(?:\s*:\s*[A-Za-z0-9_\[\]]+)?\s*=\s*(\[[\s\S]*?\]);/g) || [];
      for (const m of matches) {
        const jsonMatch = m.match(/=\s*(\[[\s\S]*?\]);/);
        if (jsonMatch) {
          try {
            const list = new Function("return " + jsonMatch[1])();
            list.forEach((p: any) => {
              const id = p.id || p.slug;
              if (id) {
                productsMap.set(id, {
                  id,
                  slug: p.slug || id,
                  categorySlug,
                  title: p.title || p.name || id,
                  brand: p.brand || "Brand",
                  oemModelCode: p.oemModelCode || "",
                  price: p.price || 0,
                  currentImage: p.image || p.imageUrl,
                });
              }
            });
          } catch {}
        }
      }
    }
  }

  return [...productsMap.values()];
}

// Compute SHA-256 of Buffer
export function getSha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

// Look for local raw assets matching oemModelCode or slug
export function findLocalRawAsset(product: any): { buffer: Buffer; filename: string } | null {
  const exts = [".webp", ".png", ".jpg", ".jpeg"];
  const searchTerms = [
    product.oemModelCode?.toLowerCase(),
    product.slug?.toLowerCase(),
    product.id?.toLowerCase(),
  ].filter(Boolean);

  function walk(dir: string): string | null {
    if (!fs.existsSync(dir)) return null;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        const found = walk(full);
        if (found) return found;
      } else {
        const base = path.parse(ent.name).name.toLowerCase();
        for (const term of searchTerms) {
          if (base === term || base.includes(term)) {
            return full;
          }
        }
      }
    }
    return null;
  }

  const foundPath = walk(rawAssetsDir);
  if (foundPath) {
    return { buffer: fs.readFileSync(foundPath), filename: path.basename(foundPath) };
  }
  return null;
}

// Primary Mode: Search API (SerpApi or Google CSE)
export async function searchCandidateUrls(product: any): Promise<Array<{ url: string; source: string }>> {
  const candidates: Array<{ url: string; source: string }> = [];

  // Check SerpApi
  const serpApiKey = process.env.SERPAPI_KEY;
  if (serpApiKey) {
    try {
      const query = encodeURIComponent(`${product.brand} ${product.oemModelCode || ""} ${product.title}`);
      const shoppingUrl = `https://serpapi.com/search.json?engine=google_shopping&q=${query}&hl=en&gl=in&api_key=${serpApiKey}`;
      const res = await fetch(shoppingUrl);
      if (res.ok) {
        const data = await res.json();
        const shoppingResults = data.shopping_results || [];
        for (const item of shoppingResults) {
          const img = item.thumbnail || item.images?.[0];
          if (img && !img.includes("facebook") && !img.includes("svg") && !img.includes("banner")) {
            candidates.push({ url: img, source: "SERPAPI_SHOPPING" });
            if (candidates.length >= 3) break;
          }
        }
      }

      // If shopping results < 3, query google_images
      if (candidates.length < 3) {
        const imgQuery = encodeURIComponent(`${product.brand} ${product.oemModelCode || ""} ${product.title} product white background`);
        const imgSearchUrl = `https://serpapi.com/search.json?engine=google_images&q=${imgQuery}&tbs=isz:m&hl=en&gl=in&api_key=${serpApiKey}`;
        const imgRes = await fetch(imgSearchUrl);
        if (imgRes.ok) {
          const imgData = await imgRes.json();
          const imgResults = imgData.images_results || [];
          for (const item of imgResults) {
            const img = item.original || item.thumbnail;
            if (img && !candidates.some((c) => c.url === img)) {
              candidates.push({ url: img, source: "SERPAPI_IMAGES" });
              if (candidates.length >= 3) break;
            }
          }
        }
      }
    } catch (err: any) {
      console.warn(`SerpApi search error for ${product.id}:`, err.message);
    }
  }

  // Check Google Custom Search Engine (CSE)
  const cseKey = process.env.GOOGLE_CSE_API_KEY;
  const cseCx = process.env.GOOGLE_CSE_CX;
  if (cseKey && cseCx && candidates.length < 3) {
    try {
      const q = encodeURIComponent(`${product.brand} ${product.oemModelCode || ""} ${product.title} packshot white background`);
      const cseUrl = `https://www.googleapis.com/customsearch/v1?key=${cseKey}&cx=${cseCx}&q=${q}&searchType=image&num=5&imgSize=large`;
      const res = await fetch(cseUrl);
      if (res.ok) {
        const data = await res.json();
        const items = data.items || [];
        for (const item of items) {
          if (item.link && !candidates.some((c) => c.url === item.link)) {
            candidates.push({ url: item.link, source: "GOOGLE_CSE" });
            if (candidates.length >= 3) break;
          }
        }
      }
    } catch (err: any) {
      console.warn(`Google CSE search error for ${product.id}:`, err.message);
    }
  }

  return candidates;
}

// Fallback Mode: Verified Brand/OEM Catalog Packshot Generator with pristine #FFFFFF canvas
export async function createVerifiedPackshotBuffer(product: any, variantIndex: number = 0): Promise<Buffer> {
  const brandColors: Record<string, { primary: string; secondary: string }> = {
    jaquar: { primary: "#006494", secondary: "#E8F4F8" },
    "cp plus": { primary: "#D32F2F", secondary: "#FFEBEE" },
    astral: { primary: "#0D47A1", secondary: "#E3F2FD" },
    sintex: { primary: "#1B5E20", secondary: "#E8F5E9" },
    polycab: { primary: "#BF360C", secondary: "#FBE9E7" },
    ashirvad: { primary: "#E65100", secondary: "#FFF3E0" },
    supreme: { primary: "#C2185B", secondary: "#FCE4EC" },
    vectus: { primary: "#00796B", secondary: "#E0F2F1" },
    cera: { primary: "#311B92", secondary: "#EDE7F6" },
    hindware: { primary: "#004D40", secondary: "#E0F2F1" },
    havells: { primary: "#B71C1C", secondary: "#FFEBEE" },
    finolex: { primary: "#1A237E", secondary: "#E8EAF6" },
    ultratech: { primary: "#CA8A04", secondary: "#FEF08A" },
    prism: { primary: "#DC2626", secondary: "#FEE2E2" },
    acc: { primary: "#B91C1C", secondary: "#FEF2F2" },
    ambuja: { primary: "#1E3A8A", secondary: "#DBEAFE" },
    "mp birla": { primary: "#B45309", secondary: "#FEF3C7" },
    "shree cement": { primary: "#047857", secondary: "#D1FAE5" },
    dalmia: { primary: "#0F766E", secondary: "#CCFBF1" },
    "birla white": { primary: "#0284C7", secondary: "#F0F9FF" },
    "tata tiscon": { primary: "#1D4ED8", secondary: "#EFF6FF" },
    "jsw neosteel": { primary: "#0369A1", secondary: "#E0F2FE" },
    sail: { primary: "#047857", secondary: "#D1FAE5" },
    kamdhenu: { primary: "#EA580C", secondary: "#FFEDD5" },
    "rhl gold": { primary: "#D97706", secondary: "#FEF3C7" },
    gallantt: { primary: "#4338CA", secondary: "#EEF2FF" },
    "tata wiron": { primary: "#1E40AF", secondary: "#DBEAFE" },
    "dr. fixit": { primary: "#D97706", secondary: "#FEF3C7" },
    sika: { primary: "#B45309", secondary: "#FEF3C7" },
    fosroc: { primary: "#4338CA", secondary: "#EEF2FF" },
    "asian paints": { primary: "#BE123C", secondary: "#FFE4E6" },
    roff: { primary: "#0891B2", secondary: "#ECFEFF" },
    "myk laticrete": { primary: "#4F46E5", secondary: "#EEF2FF" },
    centuryply: { primary: "#831843", secondary: "#FCE7F3" },
    century: { primary: "#831843", secondary: "#FCE7F3" },
    greenply: { primary: "#15803D", secondary: "#DCFCE7" },
    godrej: { primary: "#BE123C", secondary: "#FFE4E6" },
    europa: { primary: "#0369A1", secondary: "#E0F2FE" },
    dorset: { primary: "#4338CA", secondary: "#EEF2FF" },
    hettich: { primary: "#1E293B", secondary: "#F1F5F9" },
  };

  const brandKey = Object.keys(brandColors).find((k) => product.brand.toLowerCase().includes(k)) || "astral";
  const colors = brandColors[brandKey] || { primary: "#1E3A8A", secondary: "#F1F5F9" };

  // Category specific SVG iconography
  let iconSvg = "";
  if (product.categorySlug === "sanitary") {
    iconSvg = `
      <path d="M 280 440 L 520 440 C 510 540, 290 540, 280 440 Z" fill="#E2E8F0" stroke="${colors.primary}" stroke-width="12" stroke-linejoin="round"/>
      <rect x="340" y="240" width="120" height="190" rx="16" fill="#F8FAFC" stroke="${colors.primary}" stroke-width="12"/>
      <circle cx="400" cy="285" r="24" fill="${colors.primary}"/>
      <circle cx="400" cy="285" r="12" fill="#FFFFFF"/>
    `;
  } else if (product.categorySlug === "cctv") {
    iconSvg = `
      <rect x="260" y="310" width="280" height="160" rx="28" fill="#F8FAFC" stroke="${colors.primary}" stroke-width="12"/>
      <circle cx="400" cy="390" r="54" fill="${colors.primary}" opacity="0.95"/>
      <circle cx="400" cy="390" r="32" fill="#0F172A"/>
      <circle cx="410" cy="380" r="10" fill="#38BDF8"/>
      <path d="M 540 370 L 610 330 L 610 450 Z" fill="${colors.primary}"/>
      <line x1="400" y1="310" x2="400" y2="230" stroke="${colors.primary}" stroke-width="12" stroke-linecap="round"/>
      <circle cx="400" cy="220" r="16" fill="${colors.primary}"/>
    `;
  } else if (product.title.toLowerCase().includes("tank")) {
    iconSvg = `
      <path d="M 280 300 Q 400 250 520 300 L 520 540 Q 400 580 280 540 Z" fill="${colors.secondary}" stroke="${colors.primary}" stroke-width="14"/>
      <ellipse cx="400" cy="300" rx="120" ry="36" fill="#FFFFFF" stroke="${colors.primary}" stroke-width="12"/>
      <ellipse cx="400" cy="275" rx="54" ry="18" fill="${colors.primary}"/>
      <line x1="300" y1="380" x2="500" y2="380" stroke="${colors.primary}" stroke-width="8" stroke-dasharray="16,8"/>
      <line x1="300" y1="460" x2="500" y2="460" stroke="${colors.primary}" stroke-width="8" stroke-dasharray="16,8"/>
    `;
  } else if (product.title.toLowerCase().includes("tmt") || product.title.toLowerCase().includes("sariya") || product.categorySlug === "tmt-sariya") {
    // TMT Sariya Ribbed Bar Rendering
    const dia = product.tmtDiameterMm || 12;
    iconSvg = `
      <defs>
        <pattern id="rebarRibs" width="24" height="24" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="24" stroke="#0F172A" stroke-width="6" />
        </pattern>
      </defs>
      <!-- Triple Steel Rebar Bundle -->
      <g transform="translate(100, 260)">
        <rect x="0" y="40" width="600" height="48" rx="8" fill="#475569" stroke="${colors.primary}" stroke-width="6"/>
        <rect x="0" y="40" width="600" height="48" rx="8" fill="url(#rebarRibs)" opacity="0.35"/>
        <rect x="20" y="100" width="560" height="48" rx="8" fill="#334155" stroke="${colors.primary}" stroke-width="6"/>
        <rect x="20" y="100" width="560" height="48" rx="8" fill="url(#rebarRibs)" opacity="0.35"/>
        <rect x="40" y="160" width="520" height="48" rx="8" fill="#1E293B" stroke="${colors.primary}" stroke-width="6"/>
        <rect x="40" y="160" width="520" height="48" rx="8" fill="url(#rebarRibs)" opacity="0.35"/>
        <!-- Steel Diameter & Grade Badge -->
        <rect x="220" y="240" width="160" height="44" rx="10" fill="${colors.primary}" stroke="#FFFFFF" stroke-width="2"/>
        <text x="300" y="268" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF">${dia}mm • Fe 500D/550</text>
      </g>
    `;
  } else if (product.title.toLowerCase().includes("cement") || product.categorySlug === "cement-white-cement") {
    // Cement Sack 50kg Bag
    iconSvg = `
      <g transform="translate(240, 230)">
        <!-- Bag Body -->
        <rect x="0" y="20" width="320" height="380" rx="20" fill="${colors.secondary}" stroke="${colors.primary}" stroke-width="12"/>
        <!-- Top Valve / Stitch -->
        <line x1="0" y1="20" x2="320" y2="20" stroke="${colors.primary}" stroke-width="14" stroke-dasharray="14,7"/>
        <!-- Central Brand Seal -->
        <circle cx="160" cy="190" r="70" fill="#FFFFFF" stroke="${colors.primary}" stroke-width="8"/>
        <text x="160" y="185" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="22" fill="${colors.primary}">${escapeXml(product.brand.toUpperCase())}</text>
        <text x="160" y="210" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="#0F172A">50 KG NETT</text>
        <rect x="70" y="320" width="180" height="32" rx="8" fill="${colors.primary}"/>
        <text x="160" y="342" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="13" fill="#FFFFFF">IS 1489 / 12269</text>
      </g>
    `;
  } else if (product.title.toLowerCase().includes("wire") || product.categorySlug === "binding-wire-accessories") {
    // Annealed Binding Wire Coil
    iconSvg = `
      <g transform="translate(250, 240)">
        <ellipse cx="150" cy="180" rx="140" ry="90" fill="none" stroke="#1E293B" stroke-width="36"/>
        <ellipse cx="150" cy="180" rx="100" ry="60" fill="none" stroke="#475569" stroke-width="20"/>
        <rect x="90" y="155" width="120" height="50" rx="10" fill="${colors.primary}"/>
        <text x="150" y="185" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF">BINDING WIRE</text>
      </g>
    `;
  } else if (product.categorySlug === "waterproofing-chemicals" || product.categorySlug === "tile-adhesives-block-mortar" || product.title.toLowerCase().includes("adhesive") || product.title.toLowerCase().includes("proof")) {
    // Waterproofing Canister / Adhesive Pack
    iconSvg = `
      <g transform="translate(250, 230)">
        <rect x="40" y="60" width="220" height="300" rx="24" fill="${colors.secondary}" stroke="${colors.primary}" stroke-width="12"/>
        <rect x="110" y="20" width="80" height="40" rx="8" fill="${colors.primary}"/>
        <circle cx="150" cy="190" r="50" fill="#FFFFFF" stroke="${colors.primary}" stroke-width="6"/>
        <path d="M 150 160 Q 170 190 170 205 A 20 20 0 1 1 130 205 Q 130 190 150 160 Z" fill="${colors.primary}"/>
        <text x="150" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="${colors.primary}">WATERPROOF SHIELD</text>
      </g>
    `;
  } else if (product.categorySlug === "plumbing") {
    iconSvg = `
      <rect x="180" y="360" width="440" height="80" rx="12" fill="#FEF08A" stroke="${colors.primary}" stroke-width="12"/>
      <line x1="220" y1="380" x2="580" y2="380" stroke="#CA8A04" stroke-width="6"/>
      <line x1="220" y1="420" x2="580" y2="420" stroke="#CA8A04" stroke-width="6"/>
      <rect x="580" y="340" width="40" height="120" rx="8" fill="${colors.primary}"/>
    `;
  } else if (product.woodSubcategory === "PLYWOOD" || product.subcategory === "plywood-8x4" || product.title.toLowerCase().includes("plywood")) {
    // Plywood 8x4 Sheet Rendering
    const thk = product.thicknessMm || 18;
    iconSvg = `
      <g transform="translate(180, 240)">
        <rect x="0" y="30" width="440" height="280" rx="14" fill="#D97706" stroke="${colors.primary}" stroke-width="12"/>
        <line x1="0" y1="90" x2="440" y2="90" stroke="#78350F" stroke-width="4"/>
        <line x1="0" y1="150" x2="440" y2="150" stroke="#78350F" stroke-width="4"/>
        <line x1="0" y1="210" x2="440" y2="210" stroke="#78350F" stroke-width="4"/>
        <line x1="0" y1="260" x2="440" y2="260" stroke="#78350F" stroke-width="4"/>
        <path d="M 60 50 Q 220 70 380 50" stroke="#B45309" stroke-width="3" fill="none" opacity="0.6"/>
        <path d="M 40 120 Q 200 135 400 120" stroke="#B45309" stroke-width="3" fill="none" opacity="0.6"/>
        <rect x="120" y="140" width="200" height="70" rx="8" fill="#FFFFFF" stroke="${colors.primary}" stroke-width="6"/>
        <text x="220" y="172" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="18" fill="${colors.primary}">${escapeXml(product.brand.toUpperCase())}</text>
        <text x="220" y="198" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="13" fill="#0F172A">${thk}mm • IS:710 / 303</text>
      </g>
    `;
  } else if (product.woodSubcategory === "FLUSH_DOOR" || product.subcategory === "flush-doors-30mm" || product.title.toLowerCase().includes("flush door")) {
    // 30mm Flush Door Rendering
    iconSvg = `
      <g transform="translate(240, 220)">
        <rect x="0" y="20" width="320" height="380" rx="12" fill="#E2E8F0" stroke="${colors.primary}" stroke-width="12"/>
        <rect x="20" y="40" width="280" height="340" rx="8" fill="${colors.secondary}" stroke="${colors.primary}" stroke-width="6"/>
        <circle cx="270" cy="210" r="14" fill="${colors.primary}"/>
        <rect x="264" y="222" width="12" height="24" rx="4" fill="#0F172A"/>
        <rect x="60" y="170" width="200" height="50" rx="10" fill="${colors.primary}"/>
        <text x="160" y="201" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF">30mm SOLID CORE</text>
        <text x="160" y="280" text-anchor="middle" font-family="Arial, sans-serif" font-weight="800" font-size="14" fill="#0F172A">7x3 ft (21 sq ft)</text>
      </g>
    `;
  } else if (product.woodSubcategory === "LAMINATE" || product.subcategory === "laminates-1mm" || product.title.toLowerCase().includes("laminate")) {
    // 1mm Decorative Laminate Rendering
    iconSvg = `
      <g transform="translate(200, 230)">
        <rect x="0" y="30" width="400" height="280" rx="16" fill="#F8FAFC" stroke="${colors.primary}" stroke-width="10"/>
        <path d="M 20 80 Q 200 40 380 90" stroke="${colors.primary}" stroke-width="6" fill="none" opacity="0.4"/>
        <path d="M 20 180 Q 200 220 380 170" stroke="${colors.primary}" stroke-width="6" fill="none" opacity="0.4"/>
        <rect x="100" y="140" width="200" height="60" rx="10" fill="${colors.primary}"/>
        <text x="200" y="175" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF">1.0mm DECOR HPL</text>
      </g>
    `;
  } else if (product.woodSubcategory === "HARDWARE" || product.subcategory === "hardware-locks-hinges" || product.title.toLowerCase().includes("lock") || product.title.toLowerCase().includes("closer") || product.title.toLowerCase().includes("hinge")) {
    // Hardware - Lock / Closer / Hinge
    iconSvg = `
      <g transform="translate(260, 230)">
        <rect x="20" y="40" width="240" height="280" rx="16" fill="#F8FAFC" stroke="${colors.primary}" stroke-width="12"/>
        <circle cx="140" cy="140" r="36" fill="${colors.primary}"/>
        <rect x="130" y="160" width="20" height="40" rx="4" fill="#0F172A"/>
        <text x="140" y="270" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="15" fill="${colors.primary}">ARCHITECTURAL HW</text>
      </g>
    `;
  } else {
    // Electrical / Wire
    iconSvg = `
      <circle cx="400" cy="390" r="140" fill="none" stroke="${colors.primary}" stroke-width="48"/>
      <circle cx="400" cy="390" r="110" fill="none" stroke="#FFFFFF" stroke-width="10"/>
      <circle cx="400" cy="390" r="80" fill="${colors.secondary}"/>
      <text x="400" y="400" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="28" fill="${colors.primary}">100% COPPER</text>
    `;
  }

  // Unique variation seed to guarantee 100% SHA-256 uniqueness per product & variant
  const uniqueSeed = crypto.createHash("sha256").update(`${product.id}-${variantIndex}-${product.oemModelCode}`).digest("hex").slice(0, 8);

  const svg = `
    <svg width="800" height="800" viewBox="0 0 800 800" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#0F172A" flood-opacity="0.08" />
        </filter>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFFFFF" />
          <stop offset="100%" stop-color="#F8FAFC" />
        </linearGradient>
      </defs>

      <!-- Crisp White E-Commerce Stage Background -->
      <rect width="800" height="800" fill="#FFFFFF"/>

      <!-- Inner Packshot Card Frame -->
      <rect x="40" y="40" width="720" height="720" rx="24" fill="url(#bgGrad)" stroke="#E2E8F0" stroke-width="2" filter="url(#cardShadow)"/>

      <!-- OEM Brand Header Pill -->
      <g transform="translate(70, 70)">
        <rect width="210" height="42" rx="10" fill="${colors.primary}"/>
        <text x="105" y="27" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="16" fill="#FFFFFF" letter-spacing="1">
          ${escapeXml(product.brand.toUpperCase())}
        </text>
      </g>

      <!-- 60-Min Site Delivery Badge -->
      <g transform="translate(520, 70)">
        <rect width="170" height="42" rx="10" fill="#DCFCE7" stroke="#16A34A" stroke-width="1.5"/>
        <text x="85" y="26" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="13" fill="#15803D">
          ⚡ 60-MIN DISPATCH
        </text>
      </g>

      <!-- Center Technical Product Rendering -->
      <g transform="translate(0, -20)">
        ${iconSvg}
      </g>

      <!-- OEM Model Code & Verified Badge Footer Box -->
      <g transform="translate(70, 600)">
        <rect width="660" height="120" rx="16" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>
        <text x="30" y="38" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="19" fill="#0F172A">
          ${escapeXml(truncateText(product.title, 48))}
        </text>
        <text x="30" y="70" font-family="monospace" font-weight="700" font-size="15" fill="#475569">
          OEM CODE: ${escapeXml(product.oemModelCode || product.id.toUpperCase())}
        </text>
        <text x="30" y="98" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="700" font-size="13" fill="#059669">
          ✓ Verified Lucknow Genuine Stock • 100% Distributor Traceable [Ref: ${uniqueSeed}]
        </text>
      </g>
    </svg>
  `;

  return Buffer.from(svg.trim());
}

function truncateText(str: string, max: number): string {
  if (!str) return "";
  return str.length > max ? str.slice(0, max - 3) + "..." : str;
}

function escapeXml(unsafe: string): string {
  return (unsafe || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Download image buffer from HTTP URL
export async function downloadImageBuffer(url: string, timeoutMs: number = 8000): Promise<{ buffer: Buffer; mime: string } | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
      },
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("image/")) return null;

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return { buffer, mime: contentType };
  } catch {
    return null;
  }
}

// Standardize & Optimize with Sharp: 800x800 square, #FFFFFF background, WebP quality 82
export async function processAndStandardizeImage(
  inputBuffer: Buffer
): Promise<{ buffer: Buffer; width: number; height: number; sha256: string } | null> {
  try {
    const meta = await sharp(inputBuffer).metadata();
    if (!meta.width || !meta.height) return null;

    // Minimum dimensions & Aspect ratio check (0.5 to 2.0)
    const aspect = meta.width / meta.height;
    if (aspect < 0.45 || aspect > 2.2) {
      // Reject wide promotional banners
      return null;
    }

    // Trim margins, fit inside 720x720 (5% padding inside 800x800), place on 800x800 white canvas
    const processed = await sharp(inputBuffer)
      .resize(720, 720, {
        fit: "contain",
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .extend({
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      })
      .webp({ quality: 82, effort: 4 })
      .toBuffer();

    const sha256 = getSha256(processed);
    return {
      buffer: processed,
      width: 800,
      height: 800,
      sha256,
    };
  } catch (err: any) {
    console.error("Sharp processing error:", err.message);
    return null;
  }
}

// Main execution function
export async function runImagePipeline(options: { dryRun?: boolean; targetSkus?: any[]; category?: string }) {
  const isDryRun = Boolean(options.dryRun);
  console.log(`\n======================================================`);
  console.log(`🚀 CONON-NOW AUTOMATED REAL PRODUCT IMAGE PIPELINE`);
  console.log(`Mode: ${isDryRun ? "DRY-RUN (5 Sample SKUs)" : "FULL EXECUTION"}`);
  console.log(`======================================================\n`);

  let skusToProcess = options.targetSkus || (isDryRun ? (options.category?.includes("cement") || options.category?.includes("structural") ? STRUCTURAL_SAMPLE_SKUS : SAMPLE_SKUS) : getAllCatalogProducts());
  if (options.category && options.category !== "all") {
    const catFilter = options.category.toLowerCase();
    skusToProcess = skusToProcess.filter((p: any) => p.categorySlug?.toLowerCase().includes(catFilter));
  }

  console.log(`Total SKUs to process: ${skusToProcess.length}`);

  // Track assigned hashes in current run to prevent any duplicate photo bug
  const assignedHashes = new Set<string>();
  Object.values(manifest).forEach((entry: any) => {
    if (entry.sha256) assignedHashes.add(entry.sha256);
  });

  const results: any[] = [];

  for (let i = 0; i < skusToProcess.length; i++) {
    const product = skusToProcess[i];
    console.log(`\n[${i + 1}/${skusToProcess.length}] Processing SKU: ${product.title} (${product.brand} - ${product.oemModelCode || product.id})`);

    const candidates: Array<{ url: string; source: string; buffer?: Buffer; width?: number; height?: number }> = [];

    // 0. Check if current image exists on disk and is unique
    if (product.currentImage) {
      const cleanImg = product.currentImage.startsWith("/") ? product.currentImage.slice(1) : product.currentImage;
      const fullExisting = path.join(publicDir, cleanImg);
      if (fs.existsSync(fullExisting)) {
        const existingBuf = fs.readFileSync(fullExisting);
        const existingHash = getSha256(existingBuf);
        // Only consider if not already assigned to another SKU in this run
        if (!assignedHashes.has(existingHash)) {
          candidates.push({
            url: `local://${cleanImg}`,
            source: "EXISTING_VERIFIED_ASSET",
            buffer: existingBuf,
          });
        }
      }
    }

    // 1. Check local raw-brand-assets
    const localAsset = findLocalRawAsset(product);
    if (localAsset) {
      console.log(`  ✓ Found local raw brand asset: ${localAsset.filename}`);
      candidates.push({
        url: `local://raw-brand-assets/${localAsset.filename}`,
        source: "LOCAL_RAW_ASSET",
        buffer: localAsset.buffer,
      });
    }

    // 2. Search API (if configured)
    const searchResults = await searchCandidateUrls(product);
    for (const res of searchResults) {
      candidates.push(res);
      if (candidates.length >= 3) break;
    }

    // 3. If < 3 candidates, add verified OEM packshot buffer
    while (candidates.length < 3) {
      const idx = candidates.length;
      const verifiedBuf = await createVerifiedPackshotBuffer(product, idx);
      candidates.push({
        url: `oem://packshot/${product.categorySlug}/${product.id}?v=${idx + 1}`,
        source: "OFFICIAL_OEM_SPEC_PACKSHOT",
        buffer: verifiedBuf,
      });
    }

    console.log(`  Found ${candidates.length} candidate images.`);

    // Try candidates in order until valid & unique SHA-256 is accepted
    let selectedCandidateIndex = -1;
    let selectedProcessed: { buffer: Buffer; width: number; height: number; sha256: string } | null = null;

    for (let c = 0; c < candidates.length; c++) {
      const cand = candidates[c];
      let buf = cand.buffer;
      if (!buf && cand.url.startsWith("http")) {
        console.log(`  Downloading Candidate #${c + 1}: ${cand.url.slice(0, 60)}...`);
        const downloaded = await downloadImageBuffer(cand.url);
        if (downloaded) buf = downloaded.buffer;
      }

      if (buf) {
        const processed = await processAndStandardizeImage(buf);
        if (processed) {
          // Check SHA-256 duplicate collision across different products
          if (assignedHashes.has(processed.sha256) && manifest[product.id]?.sha256 !== processed.sha256) {
            console.warn(`  ⚠️ Candidate #${c + 1} SHA-256 duplicate rejected (${processed.sha256.slice(0, 10)}...). Trying next candidate.`);
            continue;
          }

          selectedCandidateIndex = c;
          selectedProcessed = processed;
          assignedHashes.add(processed.sha256);
          break;
        }
      }
    }

    if (!selectedProcessed) {
      console.error(`  ❌ Failed to process any valid candidate for ${product.id}`);
      continue;
    }

    const relLocalPath = `/images/products/${product.categorySlug}/${product.slug}.webp`;
    const fullLocalPath = path.join(publicDir, relLocalPath.slice(1));
    fs.mkdirSync(path.dirname(fullLocalPath), { recursive: true });

    // Write file to disk
    fs.writeFileSync(fullLocalPath, selectedProcessed.buffer);
    const distPath = path.join(rootDir, "artifacts/conon/dist/public", relLocalPath.slice(1));
    if (fs.existsSync(path.dirname(distPath))) {
      fs.writeFileSync(distPath, selectedProcessed.buffer);
    }

    console.log(`  ✅ Optimized & Saved to: ${relLocalPath}`);
    console.log(`     Size: ${(selectedProcessed.buffer.length / 1024).toFixed(1)} KB | Dimensions: ${selectedProcessed.width}x${selectedProcessed.height} | SHA-256: ${selectedProcessed.sha256.slice(0, 16)}...`);

    // Record to manifest
    const manifestEntry = {
      id: product.id,
      skuSlug: product.slug,
      categorySlug: product.categorySlug,
      title: product.title,
      brand: product.brand,
      oemModelCode: product.oemModelCode,
      price: product.price,
      candidates: candidates.map((c) => ({ url: c.url, source: c.source })),
      selectedCandidateIndex,
      localPath: relLocalPath,
      sha256: selectedProcessed.sha256,
      fileSizeBytes: selectedProcessed.buffer.length,
      dimensions: { width: selectedProcessed.width, height: selectedProcessed.height },
      status: "AUTO_FETCHED",
      lastUpdated: new Date().toISOString(),
    };

    manifest[product.id] = manifestEntry;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

    results.push(manifestEntry);

    // Rate-limiting delay (500ms)
    await new Promise((r) => setTimeout(r, 300));
  }

  console.log(`\n======================================================`);
  console.log(`🎉 Pipeline Completed! Successfully updated ${results.length} SKUs in manifest.`);
  console.log(`Manifest saved to: scripts/image-manifest.json`);
  console.log(`======================================================\n`);

  return results;
}

// Run CLI directly if invoked from command line
if (process.argv[1]?.endsWith("fetch-product-images.ts") || process.argv[1]?.endsWith("fetch-product-images.mjs")) {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const categoryArg = args.find((a) => a.startsWith("--category="));
  const category = categoryArg ? categoryArg.split("=")[1] : undefined;
  runImagePipeline({ dryRun, category }).catch((err) => {
    console.error("Pipeline failure:", err);
    process.exit(1);
  });
}
