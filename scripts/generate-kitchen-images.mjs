import sharp from "sharp";
import fs from "fs";
import path from "path";

const targetDir = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/products/modular-kitchen";
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

// 1. Ebco Pro Motion Tandem Box Anthracite
const svgTandemBox = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <rect x="50" y="480" width="500" height="40" rx="20" fill="#E2E8F0" opacity="0.6"/>
  <!-- Tandem Box 3D perspective -->
  <g transform="translate(60, 100)">
    <!-- Back interior -->
    <path d="M120 180 L360 180 L420 220 L60 220 Z" fill="#1E293B"/>
    <!-- Left outer side anthracite -->
    <path d="M60 220 L60 380 L120 340 L120 180 Z" fill="#334155"/>
    <path d="M60 220 L120 180 L130 185 L70 225 Z" fill="#475569"/>
    <!-- Right outer side anthracite -->
    <path d="M360 180 L420 220 L420 380 L360 340 Z" fill="#1E293B"/>
    <!-- Drawer Bottom Base -->
    <path d="M60 380 L420 380 L360 340 L120 340 Z" fill="#0F172A"/>
    <!-- Front glass / fascia panel -->
    <path d="M60 220 L420 220 L420 380 L60 380 Z" fill="#283548" stroke="#475569" stroke-width="3"/>
    <!-- Highlight & handle -->
    <rect x="180" y="240" width="120" height="10" rx="5" fill="#64748B"/>
    <!-- Branding logo & series text -->
    <text x="75" y="365" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="#94A3B8">ebco S3 PRO-MOTION 50KG</text>
    <!-- Drawer Runner Rail metallic -->
    <rect x="40" y="375" width="400" height="15" rx="3" fill="url(#metalGrad)" stroke="#CBD5E1"/>
  </g>
  <defs>
    <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#94A3B8"/>
      <stop offset="50%" stop-color="#F1F5F9"/>
      <stop offset="100%" stop-color="#64748B"/>
    </linearGradient>
  </defs>
</svg>`;

// 2. Cutlery Insert Tray
const svgCutlery = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <g transform="translate(70, 90)">
    <!-- Tray body -->
    <rect x="0" y="0" width="460" height="420" rx="16" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="4"/>
    <rect x="15" y="15" width="430" height="390" rx="10" fill="#F1F5F9"/>
    <!-- Compartments -->
    <rect x="35" y="35" width="90" height="240" rx="8" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="3"/>
    <rect x="145" y="35" width="90" height="240" rx="8" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="3"/>
    <rect x="255" y="35" width="90" height="240" rx="8" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="3"/>
    <rect x="365" y="35" width="65" height="350" rx="8" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="3"/>
    <rect x="35" y="295" width="310" height="90" rx="8" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="3"/>
    <!-- Cutlery silhouettes in metallic silver -->
    <path d="M75 60 C75 110 85 110 85 180 L75 250" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>
    <circle cx="80" cy="80" r="14" fill="#94A3B8"/>
    <path d="M185 60 C185 110 195 110 195 180 L185 250" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>
    <path d="M180 60 L180 90 M185 60 L185 90 M190 60 L190 90" stroke="#94A3B8" stroke-width="2"/>
    <text x="40" y="415" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="#64748B">Hettich OrgaTray 440 Trimmable</text>
  </g>
</svg>`;

// 3. Swing Out Waste Bin
const svgSwingBin = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <!-- Cabinet door open context -->
  <path d="M80 80 L350 40 L350 540 L80 500 Z" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="3"/>
  <g transform="translate(240, 140)">
    <!-- Swing bracket -->
    <path d="M0 240 L160 200 L160 240 L0 280 Z" fill="#475569"/>
    <!-- Outer Cylinder Bin -->
    <ellipse cx="160" cy="80" rx="110" ry="40" fill="#94A3B8"/>
    <rect x="50" y="80" width="220" height="240" fill="url(#binGrad)"/>
    <ellipse cx="160" cy="320" rx="110" ry="40" fill="#475569"/>
    <!-- Lid auto open -->
    <ellipse cx="160" cy="40" rx="115" ry="40" fill="#E2E8F0" stroke="#94A3B8" stroke-width="4"/>
    <rect x="140" y="10" width="40" height="14" rx="7" fill="#64748B"/>
    <!-- Stainless steel highlights -->
    <line x1="90" y1="90" x2="90" y2="310" stroke="#FFFFFF" stroke-width="12" stroke-linecap="round" opacity="0.6"/>
  </g>
  <defs>
    <linearGradient id="binGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#64748B"/>
      <stop offset="40%" stop-color="#E2E8F0"/>
      <stop offset="70%" stop-color="#94A3B8"/>
      <stop offset="100%" stop-color="#475569"/>
    </linearGradient>
  </defs>
</svg>`;

// 4. Pull Out Dual Waste Bin (40L)
const svgDualBin = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <g transform="translate(80, 100)">
    <!-- Base slide frame -->
    <rect x="40" y="340" width="360" height="40" rx="6" fill="#334155"/>
    <rect x="20" y="360" width="400" height="15" rx="3" fill="#94A3B8"/>
    <!-- Bin 1 (Dark Grey 20L) -->
    <path d="M70 120 L210 120 L195 340 L85 340 Z" fill="#334155" stroke="#1E293B" stroke-width="4"/>
    <rect x="90" y="135" width="100" height="8" rx="4" fill="#64748B"/>
    <text x="115" y="240" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="#64748B">20 L</text>
    <!-- Bin 2 (Dark Grey 20L) -->
    <path d="M230 120 L370 120 L355 340 L245 340 Z" fill="#475569" stroke="#1E293B" stroke-width="4"/>
    <rect x="250" y="135" width="100" height="8" rx="4" fill="#94A3B8"/>
    <text x="275" y="240" font-family="system-ui, sans-serif" font-weight="900" font-size="22" fill="#94A3B8">20 L</text>
    <!-- Top lid frame -->
    <rect x="50" y="90" width="340" height="25" rx="5" fill="#1E293B"/>
    <!-- Handle -->
    <rect x="170" y="75" width="100" height="15" rx="7" fill="#0284C7"/>
  </g>
</svg>`;

// 5. Aristo Wheel Waste Bin (Pedal 65L & 120L)
function svgWheelBin(color = "#0284C7", cap = "65L") {
  return `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <g transform="translate(130, 80)">
    <!-- Bin body -->
    <path d="M50 80 L290 80 L250 420 L90 420 Z" fill="${color}" stroke="#0F172A" stroke-width="4"/>
    <!-- Lid -->
    <rect x="30" y="55" width="280" height="35" rx="10" fill="${color}" stroke="#0F172A" stroke-width="4"/>
    <rect x="120" y="40" width="100" height="18" rx="8" fill="#1E293B"/>
    <!-- Wheel left -->
    <circle cx="70" cy="425" r="32" fill="#0F172A" stroke="#E2E8F0" stroke-width="8"/>
    <circle cx="70" cy="425" r="10" fill="#E2E8F0"/>
    <!-- Wheel right -->
    <circle cx="270" cy="425" r="32" fill="#0F172A" stroke="#E2E8F0" stroke-width="8"/>
    <circle cx="270" cy="425" r="10" fill="#E2E8F0"/>
    <!-- Axle -->
    <rect x="70" y="420" width="200" height="10" fill="#64748B"/>
    <!-- Label -->
    <rect x="110" y="160" width="120" height="70" rx="8" fill="#FFFFFF" opacity="0.9"/>
    <text x="135" y="195" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#0F172A">ARISTO</text>
    <text x="150" y="218" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="#0284C7">${cap}</text>
  </g>
</svg>`;
}

// 6. Skirting Plinth & Joint
const svgSkirtingPlinth = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <g transform="translate(180, 90)">
    <!-- Top circular mounting plate -->
    <ellipse cx="120" cy="60" rx="110" ry="30" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
    <circle cx="60" cy="60" r="8" fill="#FFFFFF"/>
    <circle cx="180" cy="60" r="8" fill="#FFFFFF"/>
    <!-- Leg column -->
    <rect x="80" y="70" width="80" height="260" fill="url(#legGrad)" stroke="#0F172A" stroke-width="3"/>
    <!-- Threaded height adjustment ring -->
    <rect x="70" y="270" width="100" height="30" rx="4" fill="#334155" stroke="#0F172A" stroke-width="2"/>
    <!-- Bottom base foot -->
    <ellipse cx="120" cy="340" rx="90" ry="25" fill="#0F172A"/>
    <!-- Plinth Clip -->
    <path d="M165 140 L230 140 L230 180 L165 180 Z" fill="#0F172A"/>
    <path d="M225 125 L245 125 L245 195 L225 195 Z" fill="#334155"/>
    <text x="50" y="410" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#475569">EBCO Q-PLINTH 100MM</text>
  </g>
  <defs>
    <linearGradient id="legGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="50%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
</svg>`;

const svgSkirtingJoint = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <g transform="translate(100, 100)">
    <!-- Vertical corner profile -->
    <rect x="260" y="40" width="60" height="320" rx="4" fill="#0F172A" stroke="#334155" stroke-width="3"/>
    <!-- Horizontal skirting section 100mm -->
    <rect x="40" y="240" width="220" height="120" fill="url(#pvcGrad)" stroke="#1E293B" stroke-width="3"/>
    <!-- Aluminium / PVC finish strip -->
    <rect x="40" y="240" width="220" height="15" fill="#94A3B8"/>
    <rect x="40" y="345" width="220" height="15" fill="#0F172A"/>
    <text x="50" y="420" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#475569">Ebco PVC Skirting 100mm Joint</text>
  </g>
  <defs>
    <linearGradient id="pvcGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="50%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
  </defs>
</svg>`;

// 7. Wire Kitchen Basket (Plate / Thali / Cutlery)
function svgWireBasket(type = "Thali") {
  return `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <g transform="translate(70, 110)">
    <!-- Top outer frame wire -->
    <rect x="20" y="40" width="420" height="260" rx="12" fill="none" stroke="#64748B" stroke-width="8"/>
    <!-- Bottom outer frame wire -->
    <rect x="50" y="100" width="360" height="220" rx="8" fill="none" stroke="#94A3B8" stroke-width="6"/>
    <!-- Vertical wire tines -->
    ${Array.from({ length: 14 }).map((_, i) => `<line x1="${45 + i * 28}" y1="45" x2="${60 + i * 24}" y2="310" stroke="#CBD5E1" stroke-width="4"/>`).join("")}
    <!-- Horizontal ribs -->
    <line x1="25" y1="120" x2="435" y2="120" stroke="#94A3B8" stroke-width="5"/>
    <line x1="35" y1="200" x2="425" y2="200" stroke="#94A3B8" stroke-width="5"/>
    <!-- Thali / Plate dividers -->
    ${Array.from({ length: 7 }).map((_, i) => `<path d="M${90 + i * 45} 290 C${85 + i * 45} 120, ${125 + i * 45} 120, ${120 + i * 45} 290" fill="none" stroke="#64748B" stroke-width="5"/>`).join("")}
    <text x="60" y="380" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#334155">Ebco SS304 ${type.replace(/&/g, "&amp;")} Kitchen Basket</text>
  </g>
</svg>`;
}

// 8. Wicker Basket
const svgWickerBasket = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <!-- Cabinet surround -->
  <rect x="60" y="60" width="480" height="480" rx="8" fill="#FDFBF7" stroke="#E2D9CC" stroke-width="6"/>
  <g transform="translate(100, 130)">
    <!-- Solid beech wooden runners -->
    <rect x="0" y="20" width="30" height="300" rx="4" fill="#D97706"/>
    <rect x="370" y="20" width="30" height="300" rx="4" fill="#D97706"/>
    <!-- Wicker basket body -->
    <rect x="25" y="40" width="350" height="270" rx="16" fill="#B45309" stroke="#78350F" stroke-width="4"/>
    <!-- Woven texture pattern -->
    ${Array.from({ length: 8 }).map((_, r) => `
      <line x1="30" y1="${65 + r * 30}" x2="370" y2="${65 + r * 30}" stroke="#FDE68A" stroke-width="5" stroke-dasharray="14 10"/>
    `).join("")}
    <!-- Basket rim -->
    <rect x="20" y="35" width="360" height="16" rx="8" fill="#78350F"/>
    <text x="70" y="360" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#78350F">Hettich Wicker Basket Beech Runners</text>
  </g>
</svg>`;

// 9. Tall Pantry Unit & Magic Corner
const svgPantryUnit = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <g transform="translate(150, 40)">
    <!-- Tall frame -->
    <rect x="30" y="20" width="240" height="490" rx="6" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
    <!-- 6 Tiers of baskets -->
    ${[60, 140, 220, 300, 380, 440].map((y) => `
      <g transform="translate(45, ${y})">
        <rect x="0" y="0" width="210" height="50" rx="4" fill="#334155" stroke="#94A3B8" stroke-width="2"/>
        <line x1="10" y1="25" x2="200" y2="25" stroke="#CBD5E1" stroke-width="2"/>
        <!-- Items in pantry -->
        <rect x="20" y="10" width="24" height="30" rx="2" fill="#E2E8F0"/>
        <rect x="60" y="8" width="20" height="34" rx="2" fill="#F59E0B"/>
        <rect x="100" y="12" width="28" height="26" rx="2" fill="#10B981"/>
        <rect x="150" y="6" width="35" height="38" rx="2" fill="#3B82F6"/>
      </g>
    `).join("")}
    <!-- Soft close heavy runner -->
    <rect x="20" y="515" width="260" height="15" rx="3" fill="#64748B"/>
  </g>
</svg>`;

const svgMagicCorner = `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="600" height="600" fill="#F8FAFC"/>
  <g transform="translate(90, 80)">
    <!-- Corner cabinet carcass -->
    <path d="M40 40 L380 40 L380 420 L40 420 Z" fill="#F1F5F9" stroke="#CBD5E1" stroke-width="4"/>
    <!-- Rear baskets inside corner -->
    <rect x="70" y="80" width="140" height="110" rx="6" fill="#334155" stroke="#64748B" stroke-width="3"/>
    <rect x="70" y="240" width="140" height="110" rx="6" fill="#334155" stroke="#64748B" stroke-width="3"/>
    <!-- Articulated mechanical arm -->
    <path d="M210 135 L260 180 L310 240" stroke="#0F172A" stroke-width="8" stroke-linecap="round"/>
    <circle cx="210" cy="135" r="8" fill="#E2E8F0"/>
    <circle cx="260" cy="180" r="8" fill="#E2E8F0"/>
    <!-- Front pull-out baskets swing out -->
    <rect x="240" y="120" width="160" height="110" rx="6" fill="#1E293B" stroke="#94A3B8" stroke-width="3"/>
    <rect x="240" y="270" width="160" height="110" rx="6" fill="#1E293B" stroke="#94A3B8" stroke-width="3"/>
    <text x="50" y="445" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B">Hettich Universal Magic Corner 900mm</text>
  </g>
</svg>`;

// 10. Subcategory Icons
const iconTandem = `
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="16" fill="#F1F5F9"/>
  <rect x="15" y="30" width="90" height="60" rx="6" fill="#334155" stroke="#1E293B" stroke-width="4"/>
  <line x1="15" y1="55" x2="105" y2="55" stroke="#64748B" stroke-width="3"/>
  <rect x="45" y="40" width="30" height="6" rx="3" fill="#E2E8F0"/>
  <rect x="45" y="68" width="30" height="6" rx="3" fill="#E2E8F0"/>
</svg>`;

const iconBasket = `
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="16" fill="#F1F5F9"/>
  <rect x="20" y="35" width="80" height="50" rx="6" fill="none" stroke="#475569" stroke-width="5"/>
  <line x1="35" y1="35" x2="35" y2="85" stroke="#94A3B8" stroke-width="3"/>
  <line x1="50" y1="35" x2="50" y2="85" stroke="#94A3B8" stroke-width="3"/>
  <line x1="65" y1="35" x2="65" y2="85" stroke="#94A3B8" stroke-width="3"/>
  <line x1="80" y1="35" x2="80" y2="85" stroke="#94A3B8" stroke-width="3"/>
  <line x1="95" y1="35" x2="95" y2="85" stroke="#94A3B8" stroke-width="3"/>
</svg>`;

const iconWasteBin = `
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="16" fill="#F1F5F9"/>
  <path d="M30 40 L40 95 L80 95 L90 40 Z" fill="#334155" stroke="#1E293B" stroke-width="4"/>
  <rect x="25" y="30" width="70" height="12" rx="4" fill="#0284C7"/>
  <line x1="50" y1="50" x2="52" y2="85" stroke="#94A3B8" stroke-width="3"/>
  <line x1="70" y1="50" x2="68" y2="85" stroke="#94A3B8" stroke-width="3"/>
</svg>`;

const iconPantry = `
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="16" fill="#F1F5F9"/>
  <rect x="35" y="15" width="50" height="90" rx="4" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
  <line x1="35" y1="35" x2="85" y2="35" stroke="#64748B" stroke-width="3"/>
  <line x1="35" y1="55" x2="85" y2="55" stroke="#64748B" stroke-width="3"/>
  <line x1="35" y1="75" x2="85" y2="75" stroke="#64748B" stroke-width="3"/>
</svg>`;

const iconSkirting = `
<svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="120" height="120" rx="16" fill="#F1F5F9"/>
  <ellipse cx="60" cy="30" rx="35" ry="10" fill="#1E293B"/>
  <rect x="48" y="32" width="24" height="60" fill="#334155"/>
  <ellipse cx="60" cy="94" rx="28" ry="8" fill="#0F172A"/>
  <rect x="80" y="50" width="22" height="45" fill="#475569"/>
</svg>`;

async function run() {
  await createWebpFromSvg(svgTandemBox, path.join(targetDir, "ebco-pro-motion-tandem-box.webp"));
  await createWebpFromSvg(svgCutlery, path.join(targetDir, "hettich-orgatray-440.webp"));
  await createWebpFromSvg(svgSwingBin, path.join(targetDir, "ebco-swing-out-waste-bin.webp"));
  await createWebpFromSvg(svgDualBin, path.join(targetDir, "ebco-pull-out-waste-bin-40l.webp"));
  await createWebpFromSvg(svgWheelBin("#0284C7", "65L"), path.join(targetDir, "aristo-wheel-bin-65l.webp"));
  await createWebpFromSvg(svgWheelBin("#16A34A", "120L"), path.join(targetDir, "aristo-wheel-bin-120l-green.webp"));
  await createWebpFromSvg(svgWheelBin("#2563EB", "120L"), path.join(targetDir, "aristo-wheel-bin-120l-blue.webp"));
  await createWebpFromSvg(svgSwingBin, path.join(targetDir, "hettich-waste-bin-classic.webp"));
  await createWebpFromSvg(svgDualBin, path.join(targetDir, "ebco-auto-waste-bin.webp"));
  await createWebpFromSvg(svgSkirtingPlinth, path.join(targetDir, "ebco-skirting-plinth.webp"));
  await createWebpFromSvg(svgSkirtingJoint, path.join(targetDir, "ebco-skirting-joint.webp"));
  await createWebpFromSvg(svgSkirtingJoint, path.join(targetDir, "ebco-fascia-bracket.webp"));
  await createWebpFromSvg(svgWireBasket("Plate & Glass"), path.join(targetDir, "ebco-kitchen-plate-glass-tray.webp"));
  await createWebpFromSvg(svgWireBasket("Thali"), path.join(targetDir, "ebco-thali-kitchen-basket.webp"));
  await createWebpFromSvg(svgWireBasket("Drip Tray"), path.join(targetDir, "ebco-kitchen-drip-tray.webp"));
  await createWebpFromSvg(svgWireBasket("Cutlery"), path.join(targetDir, "ebco-cutlery-basket.webp"));
  await createWebpFromSvg(svgWireBasket("Plate"), path.join(targetDir, "ebco-plate-basket.webp"));
  await createWebpFromSvg(svgWireBasket("Cup & Saucer"), path.join(targetDir, "ebco-cup-saucer-basket.webp"));
  await createWebpFromSvg(svgWickerBasket, path.join(targetDir, "hettich-wicker-basket.webp"));
  await createWebpFromSvg(svgWickerBasket, path.join(targetDir, "ebco-wicker-basket.webp"));
  await createWebpFromSvg(svgWireBasket("Bottle"), path.join(targetDir, "hettich-pull-out-2-tier.webp"));
  await createWebpFromSvg(svgWireBasket("Bottle IQ"), path.join(targetDir, "hettich-cargo-iq-300.webp"));
  await createWebpFromSvg(svgWireBasket("Dish Drainer"), path.join(targetDir, "hettich-dish-drainer.webp"));
  await createWebpFromSvg(svgWireBasket("Bottle Soft Close"), path.join(targetDir, "ebco-bottle-pullout.webp"));
  await createWebpFromSvg(svgWireBasket("Side Pullout"), path.join(targetDir, "ebco-side-pullout.webp"));
  await createWebpFromSvg(svgWireBasket("Detergent Holder"), path.join(targetDir, "hettich-detergent-holder.webp"));
  await createWebpFromSvg(svgPantryUnit, path.join(targetDir, "hettich-duo-pantry.webp"));
  await createWebpFromSvg(svgMagicCorner, path.join(targetDir, "hettich-magic-corner.webp"));
  await createWebpFromSvg(svgTandemBox, path.join(targetDir, "ebco-roll-top-shutter.webp"));
  await createWebpFromSvg(svgTandemBox, path.join(targetDir, "ebco-eurolift-bifold.webp"));

  // Icons
  await createWebpFromSvg(iconTandem, path.join(subcatDir, "tandems-inserts-icon.webp"), 120);
  await createWebpFromSvg(iconBasket, path.join(subcatDir, "pullouts-baskets-wickers-icon.webp"), 120);
  await createWebpFromSvg(iconWasteBin, path.join(subcatDir, "waste-bins-other-accessories-icon.webp"), 120);
  await createWebpFromSvg(iconPantry, path.join(subcatDir, "magic-corner-pantry-units-pulldowns-icon.webp"), 120);
  await createWebpFromSvg(iconSkirting, path.join(subcatDir, "skirting-hardware-icon.webp"), 120);

  console.log("All modular kitchen assets generated successfully!");
}

run().catch(console.error);
