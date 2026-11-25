with open("scripts/fetch-product-images.ts") as f:
    text = f.read()

# Add structural brands to brandColors
brand_insert = """    ultratech: { primary: "#CA8A04", secondary: "#FEF08A" },
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
    "myk laticrete": { primary: "#4F46E5", secondary: "#EEF2FF" },"""

if "ultratech:" not in text:
    text = text.replace('finolex: { primary: "#1A237E", secondary: "#E8EAF6" },', 'finolex: { primary: "#1A237E", secondary: "#E8EAF6" },\n' + brand_insert)

# Add STRUCTURAL_SAMPLE_SKUS
sample_insert = """export const STRUCTURAL_SAMPLE_SKUS = [
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
"""
if "STRUCTURAL_SAMPLE_SKUS" not in text:
    text = text.replace("export const SAMPLE_SKUS = [", sample_insert + "\nexport const SAMPLE_SKUS = [")

# Add structural SVG shapes inside createVerifiedPackshotBuffer
structural_svg = """  } else if (product.title.toLowerCase().includes("tmt") || product.title.toLowerCase().includes("sariya") || product.categorySlug === "tmt-sariya") {
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
    `;"""

if "TMT Sariya Ribbed Bar Rendering" not in text:
    text = text.replace('  } else if (product.categorySlug === "plumbing") {', structural_svg + '\n  } else if (product.categorySlug === "plumbing") {')

# Update dry-run handling in runImagePipeline to check for structural category
dry_run_swap = """  let skusToProcess = options.targetSkus || (isDryRun ? (options.category?.includes("cement") || options.category?.includes("structural") ? STRUCTURAL_SAMPLE_SKUS : SAMPLE_SKUS) : getAllCatalogProducts());"""
text = text.replace("  let skusToProcess = options.targetSkus || (isDryRun ? SAMPLE_SKUS : getAllCatalogProducts());", dry_run_swap)

with open("scripts/fetch-product-images.ts", "w") as f:
    f.write(text)

print("Updated scripts/fetch-product-images.ts successfully!")
