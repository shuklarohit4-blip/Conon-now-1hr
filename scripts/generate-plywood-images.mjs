import sharp from "sharp";
import fs from "fs";
import path from "path";

const targetDir = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/products/wood";
const subcatDir = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/subcategories";

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
if (!fs.existsSync(subcatDir)) fs.mkdirSync(subcatDir, { recursive: true });

async function createWebpFromSvg(svg, outPath, size = 600) {
  const buf = Buffer.from(svg);
  await sharp(buf)
    .resize(size, size)
    .webp({ quality: 90 })
    .toFile(outPath);
  console.log("Created:", path.basename(outPath));
}

// 1. Plywood Sheet with Warranty Seal & Brand Stamps
function svgPlywoodSheet({
  woodColor = "#D97706",
  woodDark = "#B45309",
  brand = "CENTURYPLY",
  productName = "SAINIK 710",
  grade = "BWP GRADE IS:710",
  warrantyYears = "10 YEAR",
  calibrated = false,
  flexible = false,
}) {
  if (flexible) {
    return `
    <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" fill="#F8FAFC"/>
      <ellipse cx="300" cy="530" rx="180" ry="20" fill="#E2E8F0"/>
      <!-- S-Curved Flexible Plywood Sheet -->
      <path d="M160 120 C 220 80, 280 200, 360 140 C 420 100, 460 160, 460 480 C 420 440, 360 490, 300 450 C 220 410, 180 500, 160 480 Z" fill="#D97706" stroke="#92400E" stroke-width="4"/>
      <!-- Core layers visible on edge -->
      <path d="M160 120 C 220 80, 280 200, 360 140 L370 145 C 290 205, 230 85, 170 125 Z" fill="#78350F"/>
      <!-- Flexi stamp -->
      <rect x="250" y="270" width="120" height="40" rx="4" fill="#1E293B" opacity="0.85"/>
      <text x="310" y="295" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">FLEXIPLY BWP</text>
      <text x="300" y="570" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#64748B" text-anchor="middle">Greenply Club Flexiply</text>
    </svg>`;
  }

  if (calibrated) {
    return `
    <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" fill="#F8FAFC"/>
      <ellipse cx="300" cy="540" rx="160" ry="18" fill="#E2E8F0"/>
      <!-- Perfectly Calibrated Smooth Light Birch/Hardwood Board -->
      <g transform="translate(180, 70)">
        <rect x="0" y="0" width="240" height="450" rx="4" fill="#FEF3C7" stroke="#D97706" stroke-width="3"/>
        <!-- Wood fine lines -->
        <line x1="20" y1="0" x2="20" y2="450" stroke="#FDE68A" stroke-width="2"/>
        <line x1="60" y1="0" x2="60" y2="450" stroke="#FDE68A" stroke-width="1.5"/>
        <line x1="120" y1="0" x2="120" y2="450" stroke="#FDE68A" stroke-width="2"/>
        <line x1="180" y1="0" x2="180" y2="450" stroke="#FDE68A" stroke-width="1.5"/>
        <line x1="220" y1="0" x2="220" y2="450" stroke="#FDE68A" stroke-width="2"/>
        <!-- Minimalist Brand Stamp -->
        <rect x="50" y="80" width="140" height="35" rx="3" fill="#1E293B" opacity="0.8"/>
        <text x="120" y="103" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" text-anchor="middle">GREENPLY</text>
        <text x="120" y="240" font-family="system-ui, sans-serif" font-weight="800" font-size="13" fill="#78350F" text-anchor="middle">ABSOLUTE CALIBRATED</text>
        <text x="120" y="260" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#92400E" text-anchor="middle">16mm · 4-Times Pressed</text>
        <rect x="80" y="380" width="80" height="24" rx="2" fill="#D97706" opacity="0.2"/>
        <text x="120" y="396" font-family="system-ui, sans-serif" font-weight="800" font-size="10" fill="#92400E" text-anchor="middle">IS:710 BWP</text>
      </g>
      <text x="300" y="570" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#64748B" text-anchor="middle">Greenply Absolute Calibrated 16mm</text>
    </svg>`;
  }

  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <ellipse cx="300" cy="540" rx="160" ry="18" fill="#E2E8F0"/>
    <g transform="translate(180, 60)">
      <!-- Board Body -->
      <rect x="0" y="0" width="240" height="460" rx="4" fill="${woodColor}" stroke="${woodDark}" stroke-width="4"/>
      <!-- Wood Grain Texture Lines -->
      <line x1="30" y1="0" x2="30" y2="460" stroke="${woodDark}" stroke-width="1.5" stroke-dasharray="40 20"/>
      <line x1="75" y1="0" x2="75" y2="460" stroke="${woodDark}" stroke-width="1" stroke-dasharray="60 30"/>
      <line x1="165" y1="0" x2="165" y2="460" stroke="${woodDark}" stroke-width="1" stroke-dasharray="50 25"/>
      <line x1="210" y1="0" x2="210" y2="460" stroke="${woodDark}" stroke-width="1.5" stroke-dasharray="70 35"/>
      <!-- Edge ruler/stamps -->
      <line x1="12" y1="10" x2="12" y2="450" stroke="#1E293B" stroke-width="2" stroke-dasharray="4 6"/>
      <line x1="228" y1="10" x2="228" y2="450" stroke="#1E293B" stroke-width="2" stroke-dasharray="4 6"/>
      <!-- Brand & Spec Text Stamps -->
      <text x="120" y="55" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="#1E293B" text-anchor="middle" letter-spacing="1.5">${brand}</text>
      <text x="120" y="78" font-family="system-ui, sans-serif" font-weight="800" font-size="13" fill="#334155" text-anchor="middle">${productName}</text>
      <text x="120" y="98" font-family="system-ui, sans-serif" font-weight="700" font-size="10.5" fill="#475569" text-anchor="middle">${grade}</text>
      <!-- Center Red Warranty Seal (HomeRun Signature Feature) -->
      <g transform="translate(120, 240)">
        <!-- Outer jagged/scalloped star seal -->
        <circle cx="0" cy="0" r="54" fill="#DC2626" stroke="#991B1B" stroke-width="3"/>
        <circle cx="0" cy="0" r="46" fill="#B91C1C" stroke="#FEF2F2" stroke-width="2" stroke-dasharray="4 3"/>
        <text x="0" y="-8" font-family="system-ui, sans-serif" font-weight="900" font-size="17" fill="#FFFFFF" text-anchor="middle">${warrantyYears}</text>
        <text x="0" y="14" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" text-anchor="middle">WARRANTY</text>
      </g>
      <!-- Lower ISI Mark Stamp Box -->
      <g transform="translate(120, 400)">
        <rect x="-40" y="-20" width="80" height="40" fill="none" stroke="#1E293B" stroke-width="2"/>
        <text x="0" y="-4" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#1E293B" text-anchor="middle">ISI</text>
        <text x="0" y="12" font-family="system-ui, sans-serif" font-weight="800" font-size="8.5" fill="#334155" text-anchor="middle">CM/L-123456</text>
      </g>
    </g>
    <text x="300" y="570" font-family="system-ui, sans-serif" font-weight="800" font-size="15" fill="#64748B" text-anchor="middle">${brand} ${productName}</text>
  </svg>`;
}

// 2. Action TESA Board (HDHMR Green, Boilo Dark, MDF Plain & Exterior)
function svgActionTesaBoard({
  bgColor = "#065F46",
  textColor = "#FFFFFF",
  title = "HDHMR",
  subtitle = "HIGH DENSITY WATER RESISTANT",
  thickness = "18MM",
  warrantyYears = "15 YEAR",
  hasWarranty = true,
  isExterior = false,
}) {
  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <ellipse cx="300" cy="530" rx="190" ry="22" fill="#E2E8F0"/>
    <g transform="translate(120, 140)">
      <!-- Large Horizontal Perspective Board -->
      <rect x="0" y="0" width="360" height="280" rx="6" fill="${bgColor}" stroke="#1E293B" stroke-width="4"/>
      <!-- Action Tesa Brand Stamp -->
      <text x="180" y="60" font-family="system-ui, sans-serif" font-weight="900" font-size="24" fill="${textColor}" text-anchor="middle" letter-spacing="2">action TESA</text>
      <!-- Big Type Name -->
      <text x="180" y="110" font-family="system-ui, sans-serif" font-weight="900" font-size="34" fill="${textColor}" text-anchor="middle">${title}</text>
      <text x="180" y="135" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="${textColor}" opacity="0.9" text-anchor="middle">${subtitle}</text>
      <text x="310" y="170" font-family="system-ui, sans-serif" font-weight="900" font-size="15" fill="${textColor}">${thickness}</text>
      ${
        hasWarranty
          ? `
      <!-- Red Warranty Seal -->
      <g transform="translate(180, 215)">
        <circle cx="0" cy="0" r="46" fill="#DC2626" stroke="#FFFFFF" stroke-width="3"/>
        <circle cx="0" cy="0" r="40" fill="#B91C1C" stroke="#FEF2F2" stroke-width="1.5" stroke-dasharray="3 2"/>
        <text x="0" y="-6" font-family="system-ui, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF" text-anchor="middle">${warrantyYears}</text>
        <text x="0" y="13" font-family="system-ui, sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" text-anchor="middle">WARRANTY</text>
      </g>`
          : `
      <!-- ISI mark -->
      <g transform="translate(180, 210)">
        <rect x="-35" y="-18" width="70" height="36" fill="none" stroke="${textColor}" stroke-width="2"/>
        <text x="0" y="5" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="${textColor}" text-anchor="middle">CLASSIC</text>
      </g>`
      }
    </g>
    <text x="300" y="570" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#475569" text-anchor="middle">Action Tesa ${title} Board 8' X 4'</text>
  </svg>`;
}

// 3. Virgo Laminate Sheets (Fabric, Wooden Liner, Frosty White)
function svgLaminateWardrobe({
  type = "fabric",
  name = "Fabric Inner",
}) {
  let mainVisual = "";
  if (type === "fabric") {
    mainVisual = `
      <!-- Closet wardrobe structure with fabric swatches -->
      <rect x="50" y="30" width="300" height="230" fill="#E2E8F0" stroke="#64748B" stroke-width="2"/>
      <rect x="65" y="45" width="80" height="200" fill="#CBD5E1"/>
      <rect x="160" y="45" width="80" height="110" fill="#94A3B8"/>
      <rect x="160" y="165" width="80" height="80" fill="#D1D5DB"/>
      <rect x="255" y="45" width="80" height="200" fill="#E5E7EB"/>
      <!-- Lower Fabric Swatches Strip (HomeRun screenshot feature) -->
      <g transform="translate(50, 275)">
        <rect x="0" y="0" width="70" height="80" fill="#F1F5F9" stroke="#94A3B8" stroke-width="1.5"/>
        <rect x="75" y="0" width="70" height="80" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.5"/>
        <rect x="150" y="0" width="70" height="80" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1.5"/>
        <rect x="225" y="0" width="75" height="80" fill="#94A3B8" stroke="#64748B" stroke-width="1.5"/>
      </g>`;
  } else if (type === "wooden") {
    mainVisual = `
      <!-- Elegant warm wood wardrobe & storage -->
      <rect x="50" y="30" width="300" height="230" fill="#D97706" stroke="#92400E" stroke-width="2"/>
      <rect x="65" y="45" width="80" height="200" fill="#B45309"/>
      <rect x="160" y="45" width="80" height="100" fill="#92400E"/>
      <rect x="160" y="155" width="80" height="90" fill="#78350F"/>
      <rect x="255" y="45" width="80" height="200" fill="#B45309"/>
      <!-- Perspective Drawer with wood liner grain -->
      <g transform="translate(50, 275)">
        <path d="M0 20 L150 0 L300 20 L300 85 L0 85 Z" fill="#FBBF24" stroke="#B45309" stroke-width="2"/>
        <line x1="50" y1="20" x2="50" y2="85" stroke="#D97706" stroke-width="2"/>
        <line x1="150" y1="0" x2="150" y2="85" stroke="#D97706" stroke-width="2"/>
        <line x1="230" y1="20" x2="230" y2="85" stroke="#D97706" stroke-width="2"/>
      </g>`;
  } else {
    // Frosty White
    mainVisual = `
      <!-- Modern minimalist Frosty White Wardrobe -->
      <rect x="50" y="30" width="300" height="230" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="2"/>
      <rect x="65" y="45" width="80" height="200" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="160" y="45" width="80" height="100" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="160" y="155" width="80" height="90" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <rect x="255" y="45" width="80" height="200" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.5"/>
      <!-- Lower White Drawer Box -->
      <g transform="translate(50, 275)">
        <path d="M0 20 L150 0 L300 20 L300 85 L0 85 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
        <rect x="20" y="35" width="260" height="40" rx="3" fill="#F8FAFC" stroke="#E2E8F0"/>
      </g>`;
  }

  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <g transform="translate(100, 80)">
      ${mainVisual}
    </g>
    <text x="300" y="550" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">Virgo Next Premium ${name} 0.7mm</text>
  </svg>`;
}

// 4. Subcategory Icons (crisp 3D studio thumbnails)
function svgPlywoodIcon() {
  return `
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#FEF3C7"/>
    <!-- Stack of 3 plywood sheets -->
    <path d="M20 75 L70 95 L100 80 L50 60 Z" fill="#B45309" stroke="#78350F" stroke-width="2"/>
    <path d="M20 75 L20 83 L70 103 L70 95 Z" fill="#78350F"/>
    <path d="M70 103 L100 88 L100 80 L70 95 Z" fill="#92400E"/>

    <path d="M20 60 L70 80 L100 65 L50 45 Z" fill="#D97706" stroke="#92400E" stroke-width="2"/>
    <path d="M20 60 L20 68 L70 88 L70 80 Z" fill="#92400E"/>
    <path d="M70 88 L100 73 L100 65 L70 80 Z" fill="#B45309"/>

    <path d="M20 45 L70 65 L100 50 L50 30 Z" fill="#FBBF24" stroke="#B45309" stroke-width="2"/>
    <path d="M20 45 L20 53 L70 73 L70 65 Z" fill="#B45309"/>
    <path d="M70 73 L100 58 L100 50 L70 65 Z" fill="#D97706"/>
  </svg>`;
}

function svgHdhmrIcon() {
  return `
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#ECFDF5"/>
    <!-- Green HDHMR board block -->
    <rect x="25" y="35" width="70" height="50" rx="4" fill="#047857" stroke="#065F46" stroke-width="3"/>
    <text x="60" y="66" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">HDHMR</text>
  </svg>`;
}

function svgLaminatesIcon() {
  return `
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="120" height="120" rx="20" fill="#F8FAFC"/>
    <!-- 3 upright laminate color swatches -->
    <rect x="25" y="30" width="20" height="60" rx="3" fill="#D97706" stroke="#92400E" stroke-width="2"/>
    <rect x="50" y="25" width="20" height="70" rx="3" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>
    <rect x="75" y="35" width="20" height="55" rx="3" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
  </svg>`;
}

async function main() {
  console.log("Generating Plywood & Boards Assets...");

  // 1. Plywood & Blockboard products (11 items)
  await createWebpFromSvg(
    svgPlywoodSheet({ brand: "CENTURYPLY", productName: "SAINIK 710", grade: "BWP GRADE IS:710", warrantyYears: "10 YEAR" }),
    path.join(targetDir, "century-sainik-710-bwp.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ woodColor: "#D97706", brand: "GREENPLY", productName: "GOLD 710 BWP", grade: "PREMIUM BWP IS:710", warrantyYears: "30 YEAR" }),
    path.join(targetDir, "greenply-gold-710-bwp.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ calibrated: true }),
    path.join(targetDir, "greenply-absolute-calibrated.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ brand: "ARCHIDPLY", productName: "PURE CLASSIC MR", grade: "MR GRADE IS:303", warrantyYears: "7 YEAR" }),
    path.join(targetDir, "archidply-pure-classic-mr.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ brand: "ARCHIDPLY", productName: "PURE CLASSIC PLUS", grade: "FULL CORE MR IS:303", warrantyYears: "10 YEAR" }),
    path.join(targetDir, "archidply-pure-classic-plus-mr.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ brand: "GREENPLY", productName: "ECOTEC MR 303", grade: "COMMERCIAL MR", warrantyYears: "5 YEAR" }),
    path.join(targetDir, "greenply-ecotec-mr-303.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ brand: "GREENPLY", productName: "ECOTEC 710 BWP", grade: "GAP-FREE BWP", warrantyYears: "10 YEAR" }),
    path.join(targetDir, "greenply-ecotec-710-bwp.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ brand: "ARCHIDPLY", productName: "PURE CLASSIC PLUS 710", grade: "100% PF RESIN BWP", warrantyYears: "15 YEAR" }),
    path.join(targetDir, "archidply-pure-classic-plus-710.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ brand: "CENTURYPLY", productName: "CLUB PRIME BWP", grade: "100% PF RESIN IS:710", warrantyYears: "30 YEAR" }),
    path.join(targetDir, "century-club-prime-bwp.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ brand: "CENTURYPLY", productName: "SAINIK MR 303", grade: "COMMERCIAL MR IS:303", warrantyYears: "5 YEAR" }),
    path.join(targetDir, "century-sainik-mr-303.webp")
  );
  await createWebpFromSvg(
    svgPlywoodSheet({ flexible: true }),
    path.join(targetDir, "greenply-club-flexiply-bwp.webp")
  );

  // 2. HDHMR, MDF, Boilo products (4 items)
  await createWebpFromSvg(
    svgActionTesaBoard({ bgColor: "#047857", textColor: "#FFFFFF", title: "HDHMR", subtitle: "WATER RESISTANT 850+ KG/M³", warrantyYears: "15 YEAR", hasWarranty: true }),
    path.join(targetDir, "action-tesa-hdhmr-board-plain.webp")
  );
  await createWebpFromSvg(
    svgActionTesaBoard({ bgColor: "#B45309", textColor: "#FFFFFF", title: "MDF INTERIOR", subtitle: "SMOOTH SURFACE GRADE", hasWarranty: false }),
    path.join(targetDir, "action-tesa-plain-interior-mdf.webp")
  );
  await createWebpFromSvg(
    svgActionTesaBoard({ bgColor: "#991B1B", textColor: "#FFFFFF", title: "MDF EXTERIOR", subtitle: "EXTERIOR GRADE 750-800 KG/M³", hasWarranty: false }),
    path.join(targetDir, "action-tesa-plain-exterior-mdf.webp")
  );
  await createWebpFromSvg(
    svgActionTesaBoard({ bgColor: "#1E293B", textColor: "#FFFFFF", title: "BOILO", subtitle: "BOILING WATER PROOF", warrantyYears: "25 YEAR", hasWarranty: true }),
    path.join(targetDir, "action-tesa-boilo-board-plain.webp")
  );

  // 3. Laminates products (3 items)
  await createWebpFromSvg(
    svgLaminateWardrobe({ type: "fabric", name: "Fabric Inner" }),
    path.join(targetDir, "virgo-next-fabric-inner-laminate.webp")
  );
  await createWebpFromSvg(
    svgLaminateWardrobe({ type: "wooden", name: "Wooden Liner" }),
    path.join(targetDir, "virgo-next-wooden-liner-laminate.webp")
  );
  await createWebpFromSvg(
    svgLaminateWardrobe({ type: "frosty-white", name: "Frosty White" }),
    path.join(targetDir, "virgo-next-frosty-white-laminate.webp")
  );

  // 4. Subcategory icons (3 items)
  await createWebpFromSvg(svgPlywoodIcon(), path.join(subcatDir, "plywood-blockboard-icon.webp"), 240);
  await createWebpFromSvg(svgHdhmrIcon(), path.join(subcatDir, "hdhmr-mdf-icon.webp"), 240);
  await createWebpFromSvg(svgLaminatesIcon(), path.join(subcatDir, "laminates-icon.webp"), 240);

  console.log("All Plywood & Boards assets successfully generated!");
}

main().catch(console.error);
