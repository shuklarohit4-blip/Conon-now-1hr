import sharp from "sharp";
import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const targetDir = path.join(rootDir, "artifacts/conon/public/images/products/plumbing");
const subcatDir = path.join(rootDir, "artifacts/conon/public/images/subcategories");

if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
if (!fs.existsSync(subcatDir)) fs.mkdirSync(subcatDir, { recursive: true });

async function createWebpFromSvg(svg, outPath, size = 600) {
  const buf = Buffer.from(svg);
  await sharp(buf)
    .resize(size, size)
    .webp({ quality: 90 })
    .toFile(outPath);
}

// 1. Pipe Bundle / Straight Pipe Generator (CPVC / UPVC / SWR)
function svgPipe({
  brand = "Astral",
  series = "CPVC Pro",
  size = '3/4" (20mm)',
  length = "3m / 10ft",
  sdr = "SDR 11",
  pipeColor = "#FFFBEB", // CPVC yellowish cream
  stripeColor = "#DC2626", // Red stripe for SDR-11, Brown for SDR-13.5
  accentColor = "#0284C7",
  isSwr = false,
  isUpvc = false,
}) {
  const bgPipe = isSwr ? "#94A3B8" : isUpvc ? "#F1F5F9" : pipeColor;
  const strokePipe = isSwr ? "#475569" : isUpvc ? "#94A3B8" : "#E2E8F0";
  const mainStripe = isSwr ? "#EA580C" : isUpvc ? "#0284C7" : stripeColor;

  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <!-- Soft shadow -->
    <ellipse cx="300" cy="460" rx="230" ry="24" fill="#E2E8F0"/>

    <!-- Main Pipe Tubes (3 tubes bundle diagonal/horizontal presentation) -->
    <!-- Back Pipe -->
    <rect x="70" y="240" width="460" height="34" rx="4" fill="${bgPipe}" stroke="${strokePipe}" stroke-width="2"/>
    <line x1="70" y1="257" x2="530" y2="257" stroke="${mainStripe}" stroke-width="3" stroke-dasharray="12 4"/>

    <!-- Middle Pipe -->
    <rect x="60" y="270" width="480" height="42" rx="5" fill="${bgPipe}" stroke="${strokePipe}" stroke-width="2"/>
    <line x1="60" y1="291" x2="540" y2="291" stroke="${mainStripe}" stroke-width="4"/>

    <!-- Front Pipe -->
    <rect x="50" y="305" width="500" height="52" rx="6" fill="${bgPipe}" stroke="${strokePipe}" stroke-width="2.5"/>
    <line x1="50" y1="331" x2="550" y2="331" stroke="${mainStripe}" stroke-width="5"/>

    <!-- Socket Ring on Left End -->
    <rect x="50" y="301" width="30" height="60" rx="4" fill="${bgPipe}" stroke="${strokePipe}" stroke-width="2"/>
    <circle cx="65" cy="331" r="16" fill="${bgPipe}" stroke="${mainStripe}" stroke-width="3"/>
    <circle cx="65" cy="331" r="8" fill="#1E293B"/>

    <!-- Laser Printed Continuous Marking Text on Pipe Body -->
    <text x="180" y="336" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#475569" letter-spacing="1">
      ${brand.toUpperCase()} · ${series.toUpperCase()} · ${sdr} · ${size} · IS 15778
    </text>

    <!-- Center Specification Badge -->
    <rect x="180" y="160" width="240" height="55" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.06))"/>
    <rect x="190" y="172" width="75" height="30" rx="4" fill="${accentColor}"/>
    <text x="227" y="192" font-family="system-ui, sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" text-anchor="middle">${brand.toUpperCase()}</text>
    <text x="275" y="186" font-family="system-ui, sans-serif" font-weight="800" font-size="13" fill="#0F172A">${size}</text>
    <text x="275" y="202" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#16A34A">${length} • ${sdr}</text>

    <!-- Bottom Authentic Seal -->
    <rect x="210" y="400" width="180" height="24" rx="12" fill="#F0FDF4" stroke="#BBF7D0"/>
    <text x="300" y="416" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#15803D" text-anchor="middle">
      100% Genuine Direct Supply
    </text>
  </svg>
  `;
}

// 2. Fitting Generator (Elbow, Tee, Union, MTA, FTA, Ball Valve, Tank Nipple)
function svgFitting({
  brand = "Astral",
  type = "Elbow 90°",
  size = '3/4" (20mm)',
  accentColor = "#0284C7",
  isBrass = false,
  isValve = false,
  isTee = false,
  isUnion = false,
  isNipple = false,
}) {
  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <!-- Shadow -->
    <ellipse cx="300" cy="450" rx="160" ry="20" fill="#E2E8F0"/>

    ${isValve ? `
      <!-- Ball Valve Graphic -->
      <!-- Main valve body (Cream CPVC) -->
      <rect x="180" y="280" width="240" height="110" rx="20" fill="#FFFBEB" stroke="#D1D5DB" stroke-width="4"/>
      <!-- Sockets on both ends -->
      <rect x="160" y="270" width="40" height="130" rx="8" fill="#FEF3C7" stroke="#D1D5DB" stroke-width="3"/>
      <rect x="400" y="270" width="40" height="130" rx="8" fill="#FEF3C7" stroke="#D1D5DB" stroke-width="3"/>
      <!-- Orange / Red Quarter Turn Handle -->
      <rect x="280" y="210" width="40" height="70" rx="6" fill="#DC2626"/>
      <path d="M220 200 L440 200 C455 200 465 212 460 225 L445 250 C440 260 425 260 420 260 L240 260 C230 260 215 250 215 240 Z" fill="#EF4444" stroke="#B91C1C" stroke-width="3"/>
      <text x="330" y="240" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">QUARTER TURN</text>
    ` : isNipple ? `
      <!-- Tank Nipple Graphic -->
      <rect x="190" y="260" width="220" height="90" rx="8" fill="#FFFBEB" stroke="#D1D5DB" stroke-width="3"/>
      <!-- Threads -->
      <line x1="210" y1="260" x2="210" y2="350" stroke="#D97706" stroke-width="4"/>
      <line x1="225" y1="260" x2="225" y2="350" stroke="#D97706" stroke-width="4"/>
      <line x1="240" y1="260" x2="240" y2="350" stroke="#D97706" stroke-width="4"/>
      <!-- Rubber washer / flange ring -->
      <rect x="280" y="235" width="40" height="140" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
      <rect x="330" y="245" width="30" height="120" rx="6" fill="#FEF3C7" stroke="#D97706" stroke-width="3"/>
    ` : isTee ? `
      <!-- CPVC Tee Graphic -->
      <rect x="160" y="290" width="280" height="80" rx="10" fill="#FFFBEB" stroke="#D1D5DB" stroke-width="3"/>
      <rect x="260" y="190" width="80" height="110" rx="8" fill="#FFFBEB" stroke="#D1D5DB" stroke-width="3"/>
      <!-- Sockets -->
      <rect x="150" y="280" width="25" height="100" rx="6" fill="#FEF3C7" stroke="#D1D5DB" stroke-width="2"/>
      <rect x="425" y="280" width="25" height="100" rx="6" fill="#FEF3C7" stroke="#D1D5DB" stroke-width="2"/>
      <rect x="250" y="180" width="100" height="25" rx="6" fill="#FEF3C7" stroke="#D1D5DB" stroke-width="2"/>
    ` : isBrass ? `
      <!-- Brass Insert Fitting (Elbow or MTA/FTA) -->
      <path d="M200 240 L360 240 C390 240 410 260 410 290 L410 390 L330 390 L330 320 L200 320 Z" fill="#FFFBEB" stroke="#D1D5DB" stroke-width="3"/>
      <!-- Solid Heavy Yellow Brass Thread Insert -->
      <rect x="170" y="230" width="50" height="100" rx="4" fill="#EAB308" stroke="#CA8A04" stroke-width="3"/>
      <!-- Brass thread grooves -->
      <line x1="180" y1="230" x2="180" y2="330" stroke="#A16207" stroke-width="2.5"/>
      <line x1="190" y1="230" x2="190" y2="330" stroke="#A16207" stroke-width="2.5"/>
      <line x1="200" y1="230" x2="200" y2="330" stroke="#A16207" stroke-width="2.5"/>
    ` : `
      <!-- Standard CPVC 90 Degree Elbow -->
      <path d="M210 230 L350 230 C385 230 410 255 410 290 L410 410 L320 410 L320 320 L210 320 Z" fill="#FFFBEB" stroke="#D1D5DB" stroke-width="3.5"/>
      <!-- Sockets on ends -->
      <rect x="195" y="220" width="25" height="110" rx="6" fill="#FEF3C7" stroke="#D1D5DB" stroke-width="2"/>
      <rect x="310" y="395" width="110" height="25" rx="6" fill="#FEF3C7" stroke="#D1D5DB" stroke-width="2"/>
    `}

    <!-- Brand Header Badge -->
    <rect x="190" y="80" width="220" height="50" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <text x="300" y="105" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="${accentColor}" text-anchor="middle">${brand.toUpperCase()}</text>
    <text x="300" y="122" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#475569" text-anchor="middle">${type} • ${size}</text>

    ${isBrass ? `
      <!-- Brass Lead-Free Badge -->
      <rect x="230" y="475" width="140" height="26" rx="6" fill="#FEF08A" stroke="#EAB308"/>
      <text x="300" y="493" font-family="system-ui, sans-serif" font-weight="800" font-size="11" fill="#854D0E" text-anchor="middle">Heavy Brass Insert</text>
    ` : ""}
  </svg>
  `;
}

// 3. Solvent Cement Can Generator
function svgSolvent({
  brand = "Astral",
  title = "Weld-On CTS-500",
  volume = "118ml",
  isYellow = true,
  accentColor = "#EAB308",
}) {
  const canColor = isYellow ? "#FACC15" : "#0284C7";
  const labelColor = isYellow ? "#CA8A04" : "#0369A1";

  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <ellipse cx="300" cy="480" rx="140" ry="20" fill="#E2E8F0"/>

    <!-- Metal Round Can Body -->
    <rect x="180" y="200" width="240" height="260" rx="24" fill="${canColor}" stroke="#94A3B8" stroke-width="3"/>
    
    <!-- Metal Cap -->
    <rect x="250" y="140" width="100" height="60" rx="8" fill="#E2E8F0" stroke="#94A3B8" stroke-width="3"/>
    <line x1="260" y1="160" x2="340" y2="160" stroke="#CBD5E1" stroke-width="2"/>
    <line x1="260" y1="175" x2="340" y2="175" stroke="#CBD5E1" stroke-width="2"/>

    <!-- Can Label Panel -->
    <rect x="195" y="240" width="210" height="190" rx="12" fill="#FFFFFF" stroke="${labelColor}" stroke-width="2"/>
    
    <!-- Brand Banner -->
    <rect x="210" y="255" width="180" height="32" rx="4" fill="${labelColor}"/>
    <text x="300" y="276" font-family="system-ui, sans-serif" font-weight="900" font-size="15" fill="#FFFFFF" text-anchor="middle">${brand.toUpperCase()}</text>

    <!-- Product Subtitle -->
    <text x="300" y="315" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#0F172A" text-anchor="middle">
      ${isYellow ? "CPVC YELLOW SOLVENT" : "UPVC SOLVENT CEMENT"}
    </text>
    <text x="300" y="338" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#475569" text-anchor="middle">
      ${title}
    </text>

    <!-- Volume Badge -->
    <rect x="260" y="360" width="80" height="28" rx="14" fill="#FEF3C7" stroke="#F59E0B"/>
    <text x="300" y="379" font-family="system-ui, sans-serif" font-weight="800" font-size="13" fill="#B45309" text-anchor="middle">${volume}</text>

    <!-- One-Step Chemical Fusion -->
    <text x="300" y="415" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#16A34A" text-anchor="middle">
      ASTM F493 / Fast Setting
    </text>
  </svg>
  `;
}

// 4. Overhead Water Tank Generator
function svgTank({
  brand = "Sintex",
  layers = 3,
  capacity = "1000L",
  isFoam = false,
  color = "#FFFFFF",
  ringColor = "#CBD5E1",
  warranty = "10 Years",
  accentColor = "#0284C7",
}) {
  const isWhite = color === "#FFFFFF";
  const bodyFill = isWhite ? "#F8FAFC" : color;
  const strokeColor = isWhite ? "#94A3B8" : "#475569";

  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <!-- Deep Floor Shadow -->
    <ellipse cx="300" cy="490" rx="190" ry="24" fill="#CBD5E1"/>

    <!-- Tank Cylindrical Body -->
    <path d="M150 200 C150 160 450 160 450 200 L450 430 C450 470 150 470 150 430 Z" fill="${bodyFill}" stroke="${strokeColor}" stroke-width="4"/>
    
    <!-- Top Dome -->
    <ellipse cx="300" cy="200" rx="150" ry="40" fill="${bodyFill}" stroke="${strokeColor}" stroke-width="4"/>

    <!-- Threaded Lid Cap -->
    <ellipse cx="300" cy="180" rx="75" ry="22" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
    <ellipse cx="300" cy="175" rx="55" ry="16" fill="#334155"/>

    <!-- Reinforcement Rib Rings (Cylindrical Ribs) -->
    <path d="M150 250 C180 270 420 270 450 250" stroke="${ringColor}" stroke-width="5" fill="none"/>
    <path d="M150 300 C180 320 420 320 450 300" stroke="${ringColor}" stroke-width="5" fill="none"/>
    <path d="M150 350 C180 370 420 370 450 350" stroke="${ringColor}" stroke-width="5" fill="none"/>
    <path d="M150 400 C180 420 420 420 450 400" stroke="${ringColor}" stroke-width="5" fill="none"/>

    <!-- Center Brand Emblem -->
    <rect x="220" y="270" width="160" height="55" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.08))"/>
    <text x="300" y="296" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="${accentColor}" text-anchor="middle">${brand.toUpperCase()}</text>
    <text x="300" y="315" font-family="system-ui, sans-serif" font-weight="800" font-size="12" fill="#0F172A" text-anchor="middle">${capacity} • ${layers} LAYERS</text>

    <!-- Foam Insulation / Summer Heat Shield Badge -->
    ${isFoam ? `
      <rect x="200" y="340" width="200" height="26" rx="6" fill="#FEF08A" stroke="#EAB308"/>
      <text x="300" y="358" font-family="system-ui, sans-serif" font-weight="800" font-size="11" fill="#854D0E" text-anchor="middle">Summer Heat-Shield Foam</text>
    ` : `
      <rect x="220" y="340" width="160" height="24" rx="6" fill="#F0FDF4" stroke="#86EFAC"/>
      <text x="300" y="357" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#15803D" text-anchor="middle">100% Virgin Food Grade</text>
    `}

    <!-- Warranty Pill -->
    <rect x="240" y="445" width="120" height="22" rx="11" fill="#0F172A"/>
    <text x="300" y="460" font-family="system-ui, sans-serif" font-weight="800" font-size="10" fill="#FFFFFF" text-anchor="middle">${warranty} Warranty</text>
  </svg>
  `;
}

// 5. Y-Screen Tank Filter Generator
function svgTankFilter({ brand = "Vectus", size = '1" (25mm)' }) {
  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#FFFFFF"/>
    <ellipse cx="300" cy="460" rx="140" ry="18" fill="#E2E8F0"/>

    <!-- Y-Filter Body (Heavy Molded Engineering Polymer) -->
    <rect x="180" y="270" width="240" height="70" rx="10" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
    <!-- Angled Leg for Stainless Steel Screen Mesh -->
    <path d="M260 320 L350 410 C360 420 375 420 385 410 L410 385 C420 375 420 360 410 350 L340 280 Z" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
    <rect x="370" y="390" width="35" height="30" rx="4" fill="#D97706" stroke="#92400E" stroke-width="2"/>

    <!-- Threads on ends -->
    <rect x="160" y="260" width="30" height="90" rx="4" fill="#D97706"/>
    <rect x="410" y="260" width="30" height="90" rx="4" fill="#D97706"/>

    <!-- Center Label -->
    <rect x="210" y="160" width="180" height="50" rx="8" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <text x="300" y="185" font-family="system-ui, sans-serif" font-weight="900" font-size="15" fill="#0284C7" text-anchor="middle">${brand.toUpperCase()}</text>
    <text x="300" y="202" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#475569" text-anchor="middle">Y-Type Tank Filter • ${size}</text>
  </svg>
  `;
}

// Product Generation Task List
const products = [
  // ── CPVC Pipes (15 SKUs) ──
  { file: "astral-cpvc-pro-15mm-sdr11-3m.webp", fn: () => svgPipe({ brand: "Astral", series: "CPVC Pro", size: '1/2" (15mm)', length: "3m / 10ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#0284C7" }) },
  { file: "astral-cpvc-pro-20mm-sdr11-3m.webp", fn: () => svgPipe({ brand: "Astral", series: "CPVC Pro", size: '3/4" (20mm)', length: "3m / 10ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#0284C7" }) },
  { file: "astral-cpvc-pro-25mm-sdr11-3m.webp", fn: () => svgPipe({ brand: "Astral", series: "CPVC Pro", size: '1" (25mm)', length: "3m / 10ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#0284C7" }) },
  { file: "astral-cpvc-pro-25mm-sdr11-5m.webp", fn: () => svgPipe({ brand: "Astral", series: "CPVC Pro", size: '1" (25mm)', length: "5m / 16.5ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#0284C7" }) },
  { file: "astral-cpvc-pro-20mm-sdr135-5m.webp", fn: () => svgPipe({ brand: "Astral", series: "CPVC Pro", size: '3/4" (20mm)', length: "5m / 16.5ft", sdr: "SDR 13.5", stripeColor: "#92400E", accentColor: "#0284C7" }) },
  { file: "astral-cpvc-pro-25mm-sdr135-5m.webp", fn: () => svgPipe({ brand: "Astral", series: "CPVC Pro", size: '1" (25mm)', length: "5m / 16.5ft", sdr: "SDR 13.5", stripeColor: "#92400E", accentColor: "#0284C7" }) },
  { file: "ashirvad-flowguard-plus-20mm-sdr11-5m.webp", fn: () => svgPipe({ brand: "Ashirvad", series: "FlowGuard Plus", size: '3/4" (20mm)', length: "5m / 16.5ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#DC2626" }) },
  { file: "ashirvad-flowguard-plus-25mm-sdr11-5m.webp", fn: () => svgPipe({ brand: "Ashirvad", series: "FlowGuard Plus", size: '1" (25mm)', length: "5m / 16.5ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#DC2626" }) },
  { file: "supreme-lifeline-cpvc-20mm-sdr11-5m.webp", fn: () => svgPipe({ brand: "Supreme", series: "Lifeline CPVC", size: '3/4" (20mm)', length: "5m / 16.5ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#B91C1C" }) },
  { file: "supreme-lifeline-cpvc-25mm-sdr11-5m.webp", fn: () => svgPipe({ brand: "Supreme", series: "Lifeline CPVC", size: '1" (25mm)', length: "5m / 16.5ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#B91C1C" }) },
  { file: "finolex-cpvc-20mm-sdr11-3m.webp", fn: () => svgPipe({ brand: "Finolex", series: "CPVC Premium", size: '3/4" (20mm)', length: "3m / 10ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#0284C7" }) },
  { file: "finolex-cpvc-20mm-sdr11-5m.webp", fn: () => svgPipe({ brand: "Finolex", series: "CPVC Premium", size: '3/4" (20mm)', length: "5m / 16.5ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#0284C7" }) },
  { file: "finolex-cpvc-25mm-sdr11-3m.webp", fn: () => svgPipe({ brand: "Finolex", series: "CPVC Premium", size: '1" (25mm)', length: "3m / 10ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#0284C7" }) },
  { file: "finolex-cpvc-25mm-sdr11-5m.webp", fn: () => svgPipe({ brand: "Finolex", series: "CPVC Premium", size: '1" (25mm)', length: "5m / 16.5ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#0284C7" }) },
  { file: "prince-flowguard-plus-20mm-sdr11-3m.webp", fn: () => svgPipe({ brand: "Prince", series: "FlowGuard Plus", size: '3/4" (20mm)', length: "3m / 10ft", sdr: "SDR 11", stripeColor: "#DC2626", accentColor: "#059669" }) },

  // ── UPVC Pipes & Fittings (2 SKUs) ──
  { file: "supreme-aqua-gold-upvc-25mm-sch80-6m.webp", fn: () => svgPipe({ brand: "Supreme", series: "Aqua Gold uPVC", size: '1" (25mm)', length: "6m / 20ft", sdr: "SCH 80", isUpvc: true, accentColor: "#B91C1C" }) },
  { file: "astral-aquarius-upvc-25mm-union.webp", fn: () => svgFitting({ brand: "Astral", type: "uPVC Union", size: '1" (25mm)', isUnion: true, accentColor: "#0284C7" }) },

  // ── SWR Drainage Pipes (4 SKUs) ──
  { file: "supreme-swr-pvc-110mm-type-a-3m.webp", fn: () => svgPipe({ brand: "Supreme", series: "SWR Drainage", size: '110mm (4")', length: "3m / 10ft", sdr: "Type A", isSwr: true, accentColor: "#B91C1C" }) },
  { file: "supreme-swr-pvc-110mm-single-socket-10ft.webp", fn: () => svgPipe({ brand: "Supreme", series: "SWR Single Socket", size: '110mm (4")', length: "3m / 10ft", sdr: "Rubber Ring Fit", isSwr: true, accentColor: "#B91C1C" }) },
  { file: "supreme-swr-pvc-75mm-type-a-3m.webp", fn: () => svgPipe({ brand: "Supreme", series: "SWR Drainage", size: '75mm (3")', length: "3m / 10ft", sdr: "Type A", isSwr: true, accentColor: "#B91C1C" }) },
  { file: "prince-swr-pvc-110mm-type-b-3m.webp", fn: () => svgPipe({ brand: "Prince", series: "SWR Drainage", size: '110mm (4")', length: "3m / 10ft", sdr: "Type B", isSwr: true, accentColor: "#059669" }) },

  // ── CPVC Fittings, Brass Inserts & Valves (16 SKUs) ──
  { file: "astral-cpvc-elbow-90-20mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Elbow 90°", size: '3/4" (20mm)', accentColor: "#0284C7" }) },
  { file: "astral-cpvc-elbow-90-25mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Elbow 90°", size: '1" (25mm)', accentColor: "#0284C7" }) },
  { file: "astral-cpvc-tee-20mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Equal Tee", size: '3/4" (20mm)', isTee: true, accentColor: "#0284C7" }) },
  { file: "astral-cpvc-tee-25mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Equal Tee", size: '1" (25mm)', isTee: true, accentColor: "#0284C7" }) },
  { file: "astral-cpvc-union-20mm.webp", fn: () => svgFitting({ brand: "Astral", type: "CPVC Union", size: '3/4" (20mm)', isUnion: true, accentColor: "#0284C7" }) },
  { file: "astral-cpvc-brass-elbow-20x15mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Brass Elbow 90°", size: '3/4" × 1/2"', isBrass: true, accentColor: "#0284C7" }) },
  { file: "ashirvad-flowguard-plus-brass-elbow-20x20mm.webp", fn: () => svgFitting({ brand: "Ashirvad", type: "Brass Elbow 90°", size: '3/4" × 3/4"', isBrass: true, accentColor: "#DC2626" }) },
  { file: "astral-cpvc-brass-mta-20x15mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Brass MTA", size: '3/4" × 1/2"', isBrass: true, accentColor: "#0284C7" }) },
  { file: "astral-cpvc-brass-fta-15mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Brass FTA", size: '1/2"', isBrass: true, accentColor: "#0284C7" }) },
  { file: "astral-cpvc-ball-valve-25mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Ball Valve", size: '1" (25mm)', isValve: true, accentColor: "#0284C7" }) },
  { file: "ashirvad-cpvc-ball-valve-20mm.webp", fn: () => svgFitting({ brand: "Ashirvad", type: "Ball Valve", size: '3/4" (20mm)', isValve: true, accentColor: "#DC2626" }) },
  { file: "ashirvad-cpvc-ball-valve-25mm.webp", fn: () => svgFitting({ brand: "Ashirvad", type: "Ball Valve", size: '1" (25mm)', isValve: true, accentColor: "#DC2626" }) },
  { file: "astral-cpvc-tank-nipple-20mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Tank Nipple", size: '3/4" (20mm)', isNipple: true, accentColor: "#0284C7" }) },
  { file: "astral-cpvc-tank-nipple-25mm.webp", fn: () => svgFitting({ brand: "Astral", type: "Tank Nipple", size: '1" (25mm)', isNipple: true, accentColor: "#0284C7" }) },
  { file: "ashirvad-cpvc-tank-nipple-25mm-standard.webp", fn: () => svgFitting({ brand: "Ashirvad", type: "Tank Nipple Std", size: '1" (25mm)', isNipple: true, accentColor: "#DC2626" }) },
  { file: "ashirvad-flowguard-plus-cpvc-tank-nipple-25mm.webp", fn: () => svgFitting({ brand: "Ashirvad", type: "Tank Nipple FG+", size: '1" (25mm)', isNipple: true, accentColor: "#DC2626" }) },

  // ── Solvent Cements & Adhesives (4 SKUs) ──
  { file: "astral-weld-on-cts-500-cpvc-solvent-118ml.webp", fn: () => svgSolvent({ brand: "Astral", title: "Weld-On CTS-500", volume: "118ml", isYellow: true, accentColor: "#0284C7" }) },
  { file: "ashirvad-flowguard-plus-cpvc-solvent-100ml.webp", fn: () => svgSolvent({ brand: "Ashirvad", title: "FlowGuard Plus Solvent", volume: "100ml", isYellow: true, accentColor: "#DC2626" }) },
  { file: "ashirvad-cpvc-yellow-medium-solvent-118ml.webp", fn: () => svgSolvent({ brand: "Ashirvad", title: "Yellow Medium Fast Curing", volume: "118ml", isYellow: true, accentColor: "#DC2626" }) },
  { file: "ashirvad-upvc-solvent-cement-118ml.webp", fn: () => svgSolvent({ brand: "Ashirvad", title: "uPVC Clear Solvent", volume: "118ml", isYellow: false, accentColor: "#0284C7" }) },

  // ── Overhead Water Tanks & Tank Accessories (15 SKUs) ──
  { file: "sintex-triple-layer-overhead-water-tank-1000l-white.webp", fn: () => svgTank({ brand: "Sintex", layers: 3, capacity: "1000L", isFoam: false, color: "#FFFFFF", ringColor: "#CBD5E1", warranty: "8 Years", accentColor: "#2563EB" }) },
  { file: "sintex-smart-3-layer-water-tank-1000l.webp", fn: () => svgTank({ brand: "Sintex", layers: 3, capacity: "1000L", isFoam: false, color: "#0284C7", ringColor: "#38BDF8", warranty: "8 Years", accentColor: "#0284C7" }) },
  { file: "sintex-titus-4-layer-water-tank-1000l.webp", fn: () => svgTank({ brand: "Sintex", layers: 4, capacity: "1000L", isFoam: false, color: "#1E293B", ringColor: "#475569", warranty: "10 Years", accentColor: "#2563EB" }) },
  { file: "sintex-pure-puf-5-layer-foam-tank-1000l.webp", fn: () => svgTank({ brand: "Sintex", layers: 5, capacity: "1000L", isFoam: true, color: "#FFFFFF", ringColor: "#FDE047", warranty: "20 Years", accentColor: "#2563EB" }) },
  { file: "vectus-4-layer-printed-water-tank-1000l.webp", fn: () => svgTank({ brand: "Vectus", layers: 4, capacity: "1000L", isFoam: false, color: "#059669", ringColor: "#34D399", warranty: "10 Years", accentColor: "#059669" }) },
  { file: "vectus-ten-x-10-layer-water-tank-1000l.webp", fn: () => svgTank({ brand: "Vectus", layers: 10, capacity: "1000L", isFoam: false, color: "#0F172A", ringColor: "#E2E8F0", warranty: "15 Years", accentColor: "#059669" }) },
  { file: "vectus-cool-5-layer-double-foam-tank-1000l.webp", fn: () => svgTank({ brand: "Vectus", layers: 5, capacity: "1000L", isFoam: true, color: "#FFFFFF", ringColor: "#FACC15", warranty: "15 Years", accentColor: "#059669" }) },
  { file: "plasto-triple-layer-water-tank-1000l.webp", fn: () => svgTank({ brand: "Plasto", layers: 3, capacity: "1000L", isFoam: false, color: "#EAB308", ringColor: "#FEF08A", warranty: "10 Years", accentColor: "#CA8A04" }) },
  { file: "plasto-gold-10-layer-water-tank-1000l.webp", fn: () => svgTank({ brand: "Plasto", layers: 10, capacity: "1000L", isFoam: false, color: "#CA8A04", ringColor: "#FEF08A", warranty: "10 Years", accentColor: "#CA8A04" }) },
  { file: "ashirvad-pure-3-layer-anti-bacterial-tank-500l.webp", fn: () => svgTank({ brand: "Ashirvad", layers: 3, capacity: "500L", isFoam: false, color: "#FFFFFF", ringColor: "#93C5FD", warranty: "10 Years", accentColor: "#DC2626" }) },
  { file: "ashirvad-pure-3-layer-anti-bacterial-tank-1000l.webp", fn: () => svgTank({ brand: "Ashirvad", layers: 3, capacity: "1000L", isFoam: false, color: "#FFFFFF", ringColor: "#93C5FD", warranty: "10 Years", accentColor: "#DC2626" }) },
  { file: "ashirvad-pure-3-layer-anti-bacterial-tank-2000l.webp", fn: () => svgTank({ brand: "Ashirvad", layers: 3, capacity: "2000L", isFoam: false, color: "#FFFFFF", ringColor: "#93C5FD", warranty: "10 Years", accentColor: "#DC2626" }) },
  { file: "ashirvad-pure-4-layer-insulated-foam-tank-1000l.webp", fn: () => svgTank({ brand: "Ashirvad", layers: 4, capacity: "1000L", isFoam: true, color: "#FFFFFF", ringColor: "#FDE047", warranty: "12 Years", accentColor: "#DC2626" }) },
  { file: "vectus-tank-filter-y-type-screen-20mm.webp", fn: () => svgTankFilter({ brand: "Vectus", size: '3/4" (20mm)' }) },
  { file: "vectus-tank-filter-y-type-screen-25mm.webp", fn: () => svgTankFilter({ brand: "Vectus", size: '1" (25mm)' }) },
];

// Subcategory Icons List
const subcategoryIcons = [
  { file: "cpvc-pipes-icon.webp", fn: () => svgPipe({ brand: "Astral", series: "CPVC", size: '1"', sdr: "SDR 11" }) },
  { file: "upvc-pipes-icon.webp", fn: () => svgPipe({ brand: "Supreme", series: "uPVC", size: '1"', sdr: "SCH 80", isUpvc: true }) },
  { file: "swr-drainage-icon.webp", fn: () => svgPipe({ brand: "Supreme", series: "SWR", size: '110mm', sdr: "Type A", isSwr: true }) },
  { file: "cpvc-fittings-icon.webp", fn: () => svgFitting({ brand: "Astral", type: "Elbow", size: '3/4"' }) },
  { file: "solvent-cements-icon.webp", fn: () => svgSolvent({ brand: "Astral", volume: "118ml", isYellow: true }) },
  { file: "overhead-tank-icon.webp", fn: () => svgTank({ brand: "Sintex", capacity: "1000L", layers: 4 }) },
];

async function main() {
  console.log(`Generating ${products.length} real product images for CPVC Plumbing & Tanks...`);
  for (const p of products) {
    const outPath = path.join(targetDir, p.file);
    await createWebpFromSvg(p.fn(), outPath);
  }

  console.log(`Generating ${subcategoryIcons.length} subcategory icons...`);
  for (const s of subcategoryIcons) {
    const outPath = path.join(subcatDir, s.file);
    await createWebpFromSvg(s.fn(), outPath, 160);
  }

  console.log("All plumbing images generated successfully!");
}

main().catch(console.error);
