import sharp from "sharp";
import fs from "fs";
import path from "path";

const targetDir = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/products/cctv";
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

// 1. Switch / PoE Switch Generator
function svgSwitch({
  brand = "TP-Link",
  ports = 8,
  isPoE = false,
  isWhite = false,
  bodyColor = "#1E293B",
  accentColor = "#0284C7",
  title = "Switch",
}) {
  const bg = isWhite ? "#F1F5F9" : bodyColor;
  const stroke = isWhite ? "#CBD5E1" : "#0F172A";
  const portCount = Math.min(ports, 16);
  const portStartX = 300 - (portCount * 22) / 2;

  let portSvgs = "";
  for (let i = 0; i < portCount; i++) {
    const px = portStartX + i * 22;
    portSvgs += `
      <rect x="${px}" y="295" width="16" height="18" rx="2" fill="#0F172A" stroke="#475569" stroke-width="1.5"/>
      <rect x="${px + 3}" y="297" width="10" height="4" fill="#D97706"/>
      <!-- LED Indicator -->
      <circle cx="${px + 8}" cy="286" r="2.5" fill="${i < 4 || isPoE ? "#22C55E" : "#94A3B8"}"/>
    `;
  }

  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <!-- Subtle drop shadow -->
    <ellipse cx="300" cy="400" rx="220" ry="25" fill="#E2E8F0"/>

    <!-- Switch Main Enclosure 3D perspective -->
    <path d="M70 260 L140 230 L460 230 L530 260 L530 330 L460 360 L140 360 L70 330 Z" fill="${isWhite ? "#E2E8F0" : "#0F172A"}"/>
    <!-- Top Face -->
    <polygon points="70,260 140,230 460,230 530,260 70,260" fill="${isWhite ? "#FFFFFF" : "#334155"}"/>
    <!-- Front Face -->
    <rect x="70" y="260" width="460" height="75" rx="4" fill="${bg}" stroke="${stroke}" stroke-width="2"/>

    <!-- Brand Label -->
    <rect x="90" y="275" width="90" height="24" rx="3" fill="${accentColor}" opacity="0.9"/>
    <text x="135" y="292" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" text-anchor="middle">${brand.toUpperCase()}</text>
    
    ${isPoE ? `
      <rect x="190" y="275" width="60" height="22" rx="3" fill="#DC2626"/>
      <text x="220" y="290" font-family="system-ui, sans-serif" font-weight="800" font-size="11" fill="#FFFFFF" text-anchor="middle">PoE+</text>
    ` : ""}

    <!-- RJ45 Ports array -->
    ${portSvgs}

    <!-- Cooling Vents on side -->
    <line x1="85" y1="318" x2="150" y2="318" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 4"/>
    <line x1="85" y1="324" x2="150" y2="324" stroke="#64748B" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 4"/>

    <!-- Spec text -->
    <text x="300" y="520" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#475569" text-anchor="middle">${title}</text>
    <text x="300" y="545" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#94A3B8" text-anchor="middle">${ports} Ports • Plug &amp; Play • Heavy Metal Housing</text>
  </svg>`;
}

// 2. NVR / DVR Enclosure Generator
function svgNvrDvr({
  brand = "CP PLUS",
  channels = 8,
  type = "NVR",
  model = "CP-UNR-108F1",
  color = "#111827",
}) {
  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <!-- Shadow -->
    <ellipse cx="300" cy="420" rx="230" ry="24" fill="#E2E8F0"/>

    <!-- Isometric Top Surface -->
    <polygon points="90,260 180,210 490,210 400,260" fill="#374151"/>
    <!-- Right Side Face -->
    <polygon points="400,260 490,210 490,285 400,345" fill="#1F2937"/>
    <!-- Front Face -->
    <polygon points="90,260 400,260 400,345 90,345" fill="${color}" stroke="#1E293B" stroke-width="2"/>

    <!-- Subtle texture lines on front -->
    <line x1="90" y1="285" x2="400" y2="285" stroke="#374151" stroke-width="1"/>

    <!-- CP Plus red badge -->
    <rect x="110" y="295" width="85" height="24" rx="3" fill="#DC2626"/>
    <text x="152" y="312" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" text-anchor="middle">${brand}</text>

    <!-- Channel Badge -->
    <rect x="210" y="297" width="95" height="20" rx="3" fill="#0F172A" stroke="#475569" stroke-width="1"/>
    <text x="257" y="311" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#38BDF8" text-anchor="middle">${channels} CHANNEL ${type}</text>

    <!-- Front USB & Status LEDs -->
    <rect x="340" y="303" width="14" height="8" rx="1" fill="#475569" stroke="#94A3B8" stroke-width="1"/>
    <circle cx="370" cy="307" r="3" fill="#22C55E"/>
    <circle cx="382" cy="307" r="3" fill="#EAB308"/>

    <!-- Power button -->
    <circle cx="120" cy="272" r="6" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <line x1="120" y1="268" x2="120" y2="272" stroke="#22C55E" stroke-width="1.5" stroke-linecap="round"/>

    <!-- Subtitle text -->
    <text x="300" y="500" font-family="system-ui, sans-serif" font-weight="800" font-size="17" fill="#1E293B" text-anchor="middle">${brand} ${channels} Channel ${type}</text>
    <text x="300" y="525" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">${model} • 4K HDMI Output • H.265+ Compression</text>
  </svg>`;
}

// 3. Wi-Fi Router Generator (Archer C6 / WR850N / Mastel)
function svgRouter({
  brand = "TP-Link",
  model = "Archer C6",
  antennas = 4,
  isWhite = false,
  isVertical = false,
}) {
  if (isVertical) {
    // Mastel MT-300 AF-790 Pro standing router with 3 tall antennas
    return `
    <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" fill="#F8FAFC"/>
      <!-- Shadow -->
      <ellipse cx="300" cy="460" rx="150" ry="18" fill="#E2E8F0"/>

      <!-- 3 Antennas -->
      <line x1="220" y1="300" x2="190" y2="100" stroke="#CBD5E1" stroke-width="10" stroke-linecap="round"/>
      <line x1="220" y1="300" x2="190" y2="100" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>

      <line x1="300" y1="280" x2="300" y2="80" stroke="#CBD5E1" stroke-width="10" stroke-linecap="round"/>
      <line x1="300" y1="280" x2="300" y2="80" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>

      <line x1="380" y1="300" x2="410" y2="100" stroke="#CBD5E1" stroke-width="10" stroke-linecap="round"/>
      <line x1="380" y1="300" x2="410" y2="100" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round"/>

      <!-- Standing White Router Box -->
      <rect x="200" y="270" width="200" height="170" rx="16" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="4"/>
      
      <!-- Brand Logo -->
      <text x="300" y="340" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#0284C7" text-anchor="middle">MASTEL</text>
      <text x="300" y="360" font-family="system-ui, sans-serif" font-weight="700" font-size="11" fill="#64748B" text-anchor="middle">MT-300 AF-790 PRO</text>

      <!-- Status LED strip -->
      <rect x="240" y="400" width="120" height="8" rx="4" fill="#F1F5F9"/>
      <circle cx="260" cy="404" r="2.5" fill="#22C55E"/>
      <circle cx="280" cy="404" r="2.5" fill="#22C55E"/>
      <circle cx="300" cy="404" r="2.5" fill="#0284C7"/>
      <circle cx="320" cy="404" r="2.5" fill="#22C55E"/>
      <circle cx="340" cy="404" r="2.5" fill="#22C55E"/>

      <!-- Label -->
      <text x="300" y="520" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">Mastel MT-300 (N3) Pro 4G/Wi-Fi Router</text>
      <text x="300" y="545" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">Triple Omni-Antennas • SIM Slot • High Speed</text>
    </svg>`;
  }

  if (isWhite) {
    // TP-Link TL-WR850N (white curved body with 2 antennas)
    return `
    <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" fill="#F8FAFC"/>
      <ellipse cx="300" cy="420" rx="180" ry="20" fill="#E2E8F0"/>

      <!-- 2 Antennas -->
      <line x1="210" y1="300" x2="160" y2="120" stroke="#CBD5E1" stroke-width="12" stroke-linecap="round"/>
      <line x1="210" y1="300" x2="160" y2="120" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>

      <line x1="390" y1="300" x2="440" y2="120" stroke="#CBD5E1" stroke-width="12" stroke-linecap="round"/>
      <line x1="390" y1="300" x2="440" y2="120" stroke="#FFFFFF" stroke-width="8" stroke-linecap="round"/>

      <!-- Sleek Curved White Body -->
      <ellipse cx="300" cy="330" rx="140" ry="55" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="3"/>
      <ellipse cx="300" cy="325" rx="135" ry="50" fill="#FFFFFF"/>

      <!-- Brand -->
      <text x="300" y="325" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="#0284C7" text-anchor="middle">tp-link</text>
      <text x="300" y="342" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#94A3B8" text-anchor="middle">300Mbps Wireless N</text>

      <!-- Status LEDs on front curve -->
      <circle cx="280" cy="358" r="2.5" fill="#22C55E"/>
      <circle cx="293" cy="360" r="2.5" fill="#22C55E"/>
      <circle cx="307" cy="360" r="2.5" fill="#22C55E"/>
      <circle cx="320" cy="358" r="2.5" fill="#22C55E"/>

      <text x="300" y="515" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">TP-Link TL-WR850N 300 Mbps Wireless Router</text>
      <text x="300" y="540" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">2 High Gain Antennas • 3-Yr Warranty • AP Mode</text>
    </svg>`;
  }

  // Black Archer C6 with 4 antennas
  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <ellipse cx="300" cy="425" rx="200" ry="22" fill="#E2E8F0"/>

    <!-- 4 Black Antennas -->
    <line x1="160" y1="300" x2="110" y2="110" stroke="#0F172A" stroke-width="12" stroke-linecap="round"/>
    <line x1="240" y1="285" x2="220" y2="90" stroke="#0F172A" stroke-width="12" stroke-linecap="round"/>
    <line x1="360" y1="285" x2="380" y2="90" stroke="#0F172A" stroke-width="12" stroke-linecap="round"/>
    <line x1="440" y1="300" x2="490" y2="110" stroke="#0F172A" stroke-width="12" stroke-linecap="round"/>

    <!-- Diamond textured router chassis -->
    <polygon points="140,320 220,270 380,270 460,320 440,370 160,370" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
    <polygon points="160,320 230,280 370,280 440,320 420,360 180,360" fill="#0F172A"/>

    <!-- Diamond Texture Pattern -->
    <line x1="200" y1="300" x2="400" y2="340" stroke="#334155" stroke-width="1" stroke-dasharray="3 3"/>
    <line x1="400" y1="300" x2="200" y2="340" stroke="#334155" stroke-width="1" stroke-dasharray="3 3"/>

    <!-- Logo and status -->
    <text x="300" y="325" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#38BDF8" text-anchor="middle">tp-link</text>
    <!-- Green LED row -->
    <circle cx="280" cy="345" r="2" fill="#22C55E"/>
    <circle cx="293" cy="345" r="2" fill="#22C55E"/>
    <circle cx="307" cy="345" r="2" fill="#22C55E"/>
    <circle cx="320" cy="345" r="2" fill="#22C55E"/>

    <text x="300" y="515" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">TP-Link Archer C6 Dual Band Gigabit Router</text>
    <text x="300" y="540" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">AC1200 MU-MIMO • 4 External Antennas • Gigabit Ports</text>
  </svg>`;
}

// 4. Ceiling Mount Access Point Generator
function svgCeilingAP() {
  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <!-- Retail Box in background -->
    <rect x="310" y="140" width="180" height="230" rx="6" fill="#0F172A" stroke="#1E293B" stroke-width="2"/>
    <rect x="310" y="140" width="180" height="50" rx="6" fill="#0284C7"/>
    <text x="400" y="170" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" text-anchor="middle">tp-link Omada</text>
    <text x="400" y="215" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#FFFFFF" text-anchor="middle">AC1350</text>
    <text x="400" y="235" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#94A3B8" text-anchor="middle">Ceiling Mount AP</text>

    <!-- Foreground Circular Disc AP -->
    <ellipse cx="260" cy="360" rx="140" ry="85" fill="#E2E8F0"/>
    <ellipse cx="260" cy="350" rx="135" ry="80" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
    <ellipse cx="260" cy="345" rx="90" ry="50" fill="#F8FAFC"/>

    <!-- Subtle TP Link logo in center -->
    <text x="260" y="348" font-family="system-ui, sans-serif" font-weight="900" font-size="14" fill="#0284C7" text-anchor="middle">tp-link</text>
    <circle cx="260" cy="370" r="3" fill="#22C55E"/>

    <text x="300" y="520" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">TP-Link Ceiling Mount Gigabit Access Point</text>
    <text x="300" y="545" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">Omada SDN Cloud Managed • PoE Powered • Seamless Roaming</text>
  </svg>`;
}

// 5. CAT6 & CCTV Cables Generator (Box / Reel / Coil)
function svgCable({
  brand = "Finolex",
  type = "CAT 6 Lite LAN Cable",
  length = "100m",
  isBox = true,
  isReel = false,
  isCoil = false,
  boxColor = "#D97706",
}) {
  if (isCoil) {
    // Co-axial cable black coiled bundle
    return `
    <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" fill="#F8FAFC"/>
      <ellipse cx="300" cy="420" rx="190" ry="28" fill="#E2E8F0"/>

      <!-- Multi-ring cable coil -->
      <ellipse cx="300" cy="310" rx="170" ry="90" fill="#1E293B"/>
      <ellipse cx="300" cy="300" rx="165" ry="85" fill="#0F172A"/>
      <ellipse cx="300" cy="300" rx="90" ry="45" fill="#F8FAFC"/>

      <!-- Plastic shrink wrap label band in center -->
      <rect x="200" y="275" width="200" height="60" rx="4" fill="#0284C7"/>
      <text x="300" y="300" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" text-anchor="middle">Finolex RG-6 CCS</text>
      <text x="300" y="322" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#E0F2FE" text-anchor="middle">Co-Axial Cable 100m • TV/CCTV</text>

      <text x="300" y="515" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">${brand} RG-6 CCS Axial Cable, ${length}</text>
      <text x="300" y="540" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">Copper Clad Steel • High Frequency Shielding • UV Resistant</text>
    </svg>`;
  }

  if (isReel) {
    // 305m Cardboard carton + cable spool bundle (D-Link 305m style)
    return `
    <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="600" height="600" fill="#F8FAFC"/>
      <ellipse cx="300" cy="440" rx="210" ry="24" fill="#E2E8F0"/>

      <!-- Brown Carton Box on left -->
      <polygon points="120,200 230,170 330,200 330,390 220,420 120,390" fill="#D97706"/>
      <polygon points="220,170 330,200 330,390 220,420" fill="#B45309"/>
      <polygon points="120,200 230,170 330,200 220,230" fill="#F59E0B"/>
      
      <!-- Brand on Box -->
      <text x="210" y="280" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="#FFFFFF">D-Link</text>
      <text x="210" y="310" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="#FEF3C7">CAT6 305m</text>

      <!-- Cable spool next to it -->
      <ellipse cx="400" cy="380" rx="90" ry="35" fill="#475569"/>
      <ellipse cx="400" cy="320" rx="90" ry="35" fill="#64748B"/>
      <rect x="310" y="320" width="180" height="60" fill="#475569"/>
      <ellipse cx="400" cy="320" rx="90" ry="35" fill="#94A3B8"/>
      <!-- Inner hole -->
      <ellipse cx="400" cy="320" rx="35" ry="14" fill="#1E293B"/>

      <!-- Twisted pair protruding wires -->
      <path d="M400 310 Q 420 220 440 180" stroke="#0284C7" stroke-width="4" fill="none"/>
      <path d="M403 310 Q 425 215 450 175" stroke="#F97316" stroke-width="4" fill="none"/>
      <path d="M397 310 Q 415 225 435 185" stroke="#22C55E" stroke-width="4" fill="none"/>
      <path d="M400 310 Q 418 222 430 178" stroke="#A855F7" stroke-width="4" fill="none"/>

      <text x="300" y="515" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">${brand} CAT6 Solid LAN Cable, ${length}</text>
      <text x="300" y="540" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">Gigabit Ethernet • Pure Copper Conductors • 305m Easy Pull Box</text>
    </svg>`;
  }

  // Dispenser Pull Box (Finolex / Havells)
  const isHavells = brand.toLowerCase().includes("havells");
  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <ellipse cx="300" cy="430" rx="180" ry="22" fill="#E2E8F0"/>

    <!-- 3D Box -->
    <polygon points="150,220 280,180 440,220 440,390 310,430 150,390" fill="${isHavells ? "#DC2626" : boxColor}"/>
    <!-- Left face -->
    <polygon points="150,220 310,250 310,430 150,390" fill="${isHavells ? "#FFFFFF" : boxColor}" stroke="#92400E" stroke-width="2"/>
    <!-- Right face -->
    <polygon points="310,250 440,220 440,390 310,430" fill="${isHavells ? "#DC2626" : "#92400E"}"/>
    <!-- Top face -->
    <polygon points="150,220 280,180 440,220 310,250" fill="${isHavells ? "#F87171" : "#F59E0B"}"/>

    <!-- Pull Hole on front face -->
    <ellipse cx="230" cy="330" rx="20" ry="25" fill="#0F172A"/>
    <!-- Wire coming out of hole -->
    <path d="M230 330 C 260 380, 240 430, 270 450" stroke="#CBD5E1" stroke-width="6" fill="none" stroke-linecap="round"/>

    <!-- Brand stamp on front -->
    <text x="230" y="285" font-family="system-ui, sans-serif" font-weight="900" font-size="20" fill="${isHavells ? "#DC2626" : "#FFFFFF"}" text-anchor="middle">${brand.toUpperCase()}</text>
    <text x="230" y="305" font-family="system-ui, sans-serif" font-weight="800" font-size="12" fill="${isHavells ? "#1E293B" : "#FEF3C7"}" text-anchor="middle">${type} • ${length}</text>

    <text x="300" y="515" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">${brand} ${type}, ${length}</text>
    <text x="300" y="540" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">Zero Crosstalk • 24 AWG Bare Copper • Flame Retardant</text>
  </svg>`;
}

// 6. Monitor / Display Generator (Zebster / Zebronics 18.5" / 21.5" / 27")
function svgMonitor({
  sizeInch = "18.5",
  brand = "Zebster",
  refreshRate = "60Hz",
  title = "LED Monitor",
}) {
  const is27 = sizeInch === "27";
  const w = is27 ? 440 : 380;
  const h = is27 ? 250 : 220;
  const x = 300 - w / 2;
  const y = 160;

  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <!-- Stand Shadow -->
    <ellipse cx="300" cy="465" rx="140" ry="14" fill="#E2E8F0"/>

    <!-- Desk Stand Base -->
    <ellipse cx="300" cy="455" rx="90" ry="20" fill="#1E293B" stroke="#0F172A" stroke-width="2"/>
    <!-- Stand Neck -->
    <rect x="290" y="${y + h}" width="20" height="80" fill="#334155"/>

    <!-- Monitor Outer Bezel -->
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#0F172A" stroke="#334155" stroke-width="3"/>
    
    <!-- Screen Display Area (Displaying multi-camera CCTV matrix) -->
    <rect x="${x + 8}" y="${y + 8}" width="${w - 16}" height="${h - 24}" rx="4" fill="#111827"/>
    
    <!-- 4 CCTV Camera Grid feed on screen -->
    <rect x="${x + 12}" y="${y + 12}" width="${(w - 28) / 2}" height="${(h - 32) / 2}" fill="#1E3A8A"/>
    <text x="${x + 20}" y="${y + 30}" font-family="system-ui, sans-serif" font-weight="700" font-size="9" fill="#93C5FD">CAM 01 - GATE</text>

    <rect x="${x + 16 + (w - 28) / 2}" y="${y + 12}" width="${(w - 28) / 2}" height="${(h - 32) / 2}" fill="#065F46"/>
    <text x="${x + 24 + (w - 28) / 2}" y="${y + 30}" font-family="system-ui, sans-serif" font-weight="700" font-size="9" fill="#A7F3D0">CAM 02 - LOBBY</text>

    <rect x="${x + 12}" y="${y + 16 + (h - 32) / 2}" width="${(w - 28) / 2}" height="${(h - 32) / 2}" fill="#3730A3"/>
    <text x="${x + 20}" y="${y + 34 + (h - 32) / 2}" font-family="system-ui, sans-serif" font-weight="700" font-size="9" fill="#C7D2FE">CAM 03 - PARKING</text>

    <rect x="${x + 16 + (w - 28) / 2}" y="${y + 16 + (h - 32) / 2}" width="${(w - 28) / 2}" height="${(h - 32) / 2}" fill="#1E293B"/>
    <text x="${x + 24 + (w - 28) / 2}" y="${y + 34 + (h - 32) / 2}" font-family="system-ui, sans-serif" font-weight="700" font-size="9" fill="#94A3B8">CAM 04 - BACKYARD</text>

    <!-- Brand badge on bottom bezel -->
    <text x="300" y="${y + h - 6}" font-family="system-ui, sans-serif" font-weight="800" font-size="10" fill="#94A3B8" text-anchor="middle">${brand.toUpperCase()}</text>

    <text x="300" y="520" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">${title}</text>
    <text x="300" y="545" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">${sizeInch} Inch • ${refreshRate} • HDMI &amp; VGA • CCTV Surveillance Ready</text>
  </svg>`;
}

// 7. Server Rack Cabinet Generator (Nomwell Rack)
function svgRackCabinet() {
  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <ellipse cx="300" cy="470" rx="160" ry="20" fill="#E2E8F0"/>

    <!-- Rack Chassis -->
    <rect x="180" y="140" width="240" height="310" rx="10" fill="#1E293B" stroke="#0F172A" stroke-width="4"/>
    
    <!-- Top & Bottom Ventilation Louvers -->
    <rect x="200" y="155" width="200" height="15" rx="3" fill="#0F172A"/>
    <line x1="210" y1="162" x2="390" y2="162" stroke="#475569" stroke-width="2" stroke-dasharray="4 4"/>

    <!-- Tinted Glass Front Door with keyhole -->
    <rect x="200" y="180" width="200" height="235" rx="4" fill="#0EA5E9" fill-opacity="0.15" stroke="#38BDF8" stroke-width="2"/>
    <!-- Lock barrel -->
    <circle cx="380" cy="300" r="8" fill="#475569" stroke="#94A3B8" stroke-width="2"/>
    <circle cx="380" cy="300" r="3" fill="#0F172A"/>

    <!-- Inside 19" Rack Rails & Mounted Gear -->
    <rect x="220" y="210" width="160" height="30" rx="2" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
    <circle cx="230" cy="225" r="3" fill="#22C55E"/>
    <circle cx="240" cy="225" r="3" fill="#22C55E"/>
    <rect x="250" y="220" width="60" height="10" fill="#334155"/>

    <rect x="220" y="255" width="160" height="40" rx="2" fill="#0F172A" stroke="#334155" stroke-width="1.5"/>
    <circle cx="230" cy="275" r="3" fill="#0284C7"/>

    <rect x="220" y="310" width="160" height="45" rx="2" fill="#1E293B" stroke="#334155" stroke-width="1.5"/>

    <!-- Brand stamp -->
    <text x="300" y="435" font-family="system-ui, sans-serif" font-weight="900" font-size="12" fill="#94A3B8" text-anchor="middle">NOMWELL RACK</text>

    <text x="300" y="525" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">Nomwell Wall Mount Server Rack Cabinet</text>
    <text x="300" y="550" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">Toughened Glass Door • Top Grommets • Lockable</text>
  </svg>`;
}

// 8. Surveillance Hard Drive Generator (Seagate SkyHawk / WD Purple)
function svgHardDrive({
  brand = "Seagate",
  capacity = "1TB",
  model = "Skyhawk ST1000VX013",
  isPurple = false,
}) {
  const labelColor = isPurple ? "#7C3AED" : "#0284C7";

  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <ellipse cx="300" cy="445" rx="180" ry="20" fill="#E2E8F0"/>

    <!-- 3.5 Inch Metal HDD Body -->
    <rect x="180" y="170" width="240" height="280" rx="8" fill="#CBD5E1" stroke="#94A3B8" stroke-width="3"/>
    <rect x="190" y="180" width="220" height="260" rx="4" fill="#E2E8F0"/>

    <!-- Front Label Sticker -->
    <rect x="200" y="195" width="200" height="210" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1"/>
    
    <!-- Header banner on label -->
    <rect x="200" y="195" width="200" height="55" rx="4" fill="${labelColor}"/>
    <text x="300" y="222" font-family="system-ui, sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" text-anchor="middle">${isPurple ? "WD PURPLE" : "SEAGATE"}</text>
    <text x="300" y="242" font-family="system-ui, sans-serif" font-weight="700" font-size="12" fill="#E0F2FE" text-anchor="middle">${isPurple ? "Surveillance Hard Drive" : "SKYHAWK SURVEILLANCE"}</text>

    <!-- Capacity Badge -->
    <rect x="220" y="270" width="160" height="45" rx="4" fill="#F1F5F9" stroke="#E2E8F0" stroke-width="1.5"/>
    <text x="300" y="302" font-family="system-ui, sans-serif" font-weight="900" font-size="28" fill="#0F172A" text-anchor="middle">${capacity}</text>

    <!-- Specs text -->
    <text x="300" y="335" font-family="system-ui, sans-serif" font-weight="600" font-size="10" fill="#64748B" text-anchor="middle">SATA 6Gb/s • 3.5-Inch Internal HDD</text>
    <text x="300" y="350" font-family="system-ui, sans-serif" font-weight="700" font-size="10" fill="#059669" text-anchor="middle">Supports up to 64 HD Cameras 24/7</text>
    
    <!-- Barcode -->
    <line x1="220" y1="380" x2="380" y2="380" stroke="#0F172A" stroke-width="16" stroke-dasharray="2 3 6 2 4 1 5 3"/>

    <text x="300" y="515" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">${brand} Surveillance Internal HDD, ${capacity}</text>
    <text x="300" y="540" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">${model} • 64 HD Cameras • 24x7 Workload</text>
  </svg>`;
}

// 9. Power Adapter Generator (ERD 12V 2A)
function svgPowerAdapter() {
  return `
  <svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="600" height="600" fill="#F8FAFC"/>
    <ellipse cx="300" cy="440" rx="150" ry="18" fill="#E2E8F0"/>

    <!-- Black Wall Adapter Body -->
    <rect x="220" y="200" width="160" height="180" rx="14" fill="#1E293B" stroke="#0F172A" stroke-width="3"/>
    
    <!-- ERD Logo & specs -->
    <rect x="250" y="230" width="100" height="30" rx="4" fill="#0F172A"/>
    <text x="300" y="250" font-family="system-ui, sans-serif" font-weight="900" font-size="16" fill="#EF4444" text-anchor="middle">ERD</text>
    
    <text x="300" y="285" font-family="system-ui, sans-serif" font-weight="800" font-size="14" fill="#FFFFFF" text-anchor="middle">12V = 2.0A</text>
    <text x="300" y="305" font-family="system-ui, sans-serif" font-weight="600" font-size="11" fill="#94A3B8" text-anchor="middle">SMPS Power Supply</text>

    <!-- Green LED -->
    <circle cx="300" cy="340" r="4" fill="#22C55E"/>

    <!-- Output Cord & 5.5x2.1mm DC Pin -->
    <path d="M300 380 C 300 420, 360 410, 380 430" stroke="#0F172A" stroke-width="8" fill="none" stroke-linecap="round"/>
    <!-- Metal DC Barrel Jack -->
    <rect x="375" y="420" width="28" height="12" rx="2" fill="#CBD5E1" stroke="#475569" stroke-width="2"/>
    <rect x="403" y="423" width="6" height="6" fill="#EAB308"/>

    <text x="300" y="515" font-family="system-ui, sans-serif" font-weight="800" font-size="16" fill="#1E293B" text-anchor="middle">ERD 12V 2A Regulated Power Adapter</text>
    <text x="300" y="540" font-family="system-ui, sans-serif" font-weight="600" font-size="13" fill="#64748B" text-anchor="middle">Surge Protected • 5.5x2.1 mm DC Jack • For CCTV / DVR</text>
  </svg>`;
}

async function main() {
  console.log("Generating CCTV assets...");

  // 1. NVR, DVR & Switches
  await createWebpFromSvg(
    svgSwitch({ brand: "TP-Link", ports: 8, isWhite: true, title: "TP-Link 10/100 Mbps Switch" }),
    path.join(targetDir, "tp-link-10-100-mbps-switch.webp")
  );

  await createWebpFromSvg(
    svgSwitch({ brand: "CP PLUS", ports: 8, isPoE: true, accentColor: "#DC2626", title: "CP Plus 8 Port PoE Switch" }),
    path.join(targetDir, "cp-plus-8-port-poe-switch-cp-anw-hpu8h2-n12.webp")
  );

  await createWebpFromSvg(
    svgSwitch({ brand: "CP PLUS", ports: 4, isPoE: true, accentColor: "#DC2626", title: "CP Plus 4 Port PoE Switch, 65W" }),
    path.join(targetDir, "cp-plus-4-port-poe-switch-cp-anw-hp4h2-n65.webp")
  );

  await createWebpFromSvg(
    svgNvrDvr({ brand: "CP PLUS", channels: 8, type: "NVR", model: "CP-UNR-108F1" }),
    path.join(targetDir, "cp-plus-8-channel-nvr-cp-unr-108f1.webp")
  );

  await createWebpFromSvg(
    svgNvrDvr({ brand: "CP PLUS", channels: 4, type: "DVR", model: "CP-UVR-0401E1" }),
    path.join(targetDir, "cp-plus-4-channel-dvr.webp")
  );

  await createWebpFromSvg(
    svgSwitch({ brand: "TP-Link", ports: 16, accentColor: "#0284C7", title: "TP-Link 16 Port Switch" }),
    path.join(targetDir, "tp-link-16-port-switch.webp")
  );

  await createWebpFromSvg(
    svgSwitch({ brand: "TP-Link", ports: 8, isPoE: false, accentColor: "#0284C7", title: "TP-Link 10/100 8-Port Switch" }),
    path.join(targetDir, "tp-link-10-100-8-port-switch.webp")
  );

  await createWebpFromSvg(
    svgSwitch({ brand: "CP PLUS", ports: 24, accentColor: "#DC2626", title: "CP Plus 24 Port Gigabit Switch" }),
    path.join(targetDir, "cp-plus-24-port-gigabit-switch.webp")
  );

  await createWebpFromSvg(
    svgNvrDvr({ brand: "CP PLUS", channels: 4, type: "DVR", model: "CP-UVR-0401E1V-I" }),
    path.join(targetDir, "cp-plus-4-channel-dvr-cp-uvr-0401e1v-i.webp")
  );

  await createWebpFromSvg(
    svgNvrDvr({ brand: "CP PLUS", channels: 16, type: "NVR", model: "CP-UNR-216F1" }),
    path.join(targetDir, "cp-plus-16-channel-nvr.webp")
  );

  await createWebpFromSvg(
    svgNvrDvr({ brand: "CP PLUS", channels: 8, type: "DVR", model: "CP-UVR-0801E1V-I" }),
    path.join(targetDir, "cp-plus-8-channel-dvr-cp-uvr-0801e1v-i.webp")
  );

  await createWebpFromSvg(
    svgNvrDvr({ brand: "CP PLUS", channels: 32, type: "NVR", model: "CP-UNR-432F2" }),
    path.join(targetDir, "cp-plus-32-channel-nvr.webp")
  );

  await createWebpFromSvg(
    svgNvrDvr({ brand: "CP PLUS", channels: 4, type: "NVR", model: "CP-UNR-104F1" }),
    path.join(targetDir, "cp-plus-4-channel-nvr-cp-unr-104f1.webp")
  );

  await createWebpFromSvg(
    svgSwitch({ brand: "TP-Link", ports: 20, isPoE: true, accentColor: "#0284C7", title: "TP-Link ES220GMP 20-Port Managed PoE Switch" }),
    path.join(targetDir, "tp-link-es220gmp-20-port-managed-poe-switch.webp")
  );

  await createWebpFromSvg(
    svgSwitch({ brand: "TP-Link", ports: 18, isPoE: true, accentColor: "#0284C7", title: "TP-Link TL-SL1218MP 18-Port PoE Switch" }),
    path.join(targetDir, "tp-link-tl-sl1218mp-18-port-poe-switch.webp")
  );

  // 2. Wifi & Networking
  await createWebpFromSvg(
    svgRouter({ brand: "TP-Link", model: "Archer C6", antennas: 4, isWhite: false }),
    path.join(targetDir, "tp-link-archer-c6-wi-fi-router.webp")
  );

  await createWebpFromSvg(
    svgRouter({ brand: "TP-Link", model: "TL-WR850N", antennas: 2, isWhite: true }),
    path.join(targetDir, "tp-link-tl-wr850n-300-mbps-wireless-router.webp")
  );

  await createWebpFromSvg(
    svgRouter({ brand: "Mastel", model: "MT-300 AF-790 Pro", isVertical: true }),
    path.join(targetDir, "mastel-mt-300-n3-af-790-pro-wi-fi-router.webp")
  );

  await createWebpFromSvg(
    svgCeilingAP(),
    path.join(targetDir, "tp-link-ceiling-mount-access-point.webp")
  );

  await createWebpFromSvg(
    svgSwitch({ brand: "TP-Link", ports: 10, isPoE: true, accentColor: "#0284C7", title: "TP-Link LS110P 10-Port Gigabit PoE+ Switch" }),
    path.join(targetDir, "tp-link-ls110p-10-port-gigabit-poe-switch.webp")
  );

  await createWebpFromSvg(
    svgSwitch({ brand: "TP-Link", ports: 8, isPoE: true, accentColor: "#0284C7", title: "TP-Link LS108GP 8-Port PoE Switch" }),
    path.join(targetDir, "tp-link-ls108gp-8-port-poe-switch.webp")
  );

  // 3. Cables
  await createWebpFromSvg(
    svgCable({ brand: "Finolex", type: "CAT 6 Lite LAN Cable", length: "100m", boxColor: "#B45309" }),
    path.join(targetDir, "finolex-cat-6-lite-lan-cable-100m.webp")
  );

  await createWebpFromSvg(
    svgCable({ brand: "D-Link", type: "CAT6 Cable", length: "100m", boxColor: "#B45309" }),
    path.join(targetDir, "d-link-cat6-cable-100m.webp")
  );

  await createWebpFromSvg(
    svgCable({ brand: "D-Link", type: "CAT6 Cable", length: "305m", isReel: true }),
    path.join(targetDir, "d-link-cat6-cable-305m.webp")
  );

  await createWebpFromSvg(
    svgCable({ brand: "Havells", type: "CAT6 LAN Cable", length: "305m", boxColor: "#DC2626" }),
    path.join(targetDir, "havells-cat6-lan-cable-305m.webp")
  );

  await createWebpFromSvg(
    svgCable({ brand: "Finolex", type: "RG-6 CCS Coaxial Cable", length: "100m", isCoil: true }),
    path.join(targetDir, "finolex-rg-6-ccs-axial-cable-100m.webp")
  );

  await createWebpFromSvg(
    svgCable({ brand: "Finolex", type: "Gen Z (3+1) CCTV Cable", length: "90m", boxColor: "#EAB308" }),
    path.join(targetDir, "finolex-gen-z-3-plus-1-cctv-cable-90m.webp")
  );

  // 4. CCTV Accessories
  await createWebpFromSvg(
    svgMonitor({ sizeInch: "18.5", brand: "Zebster by Zebronics", refreshRate: "8ms", title: "Zebster Zeb-V19HD 18.5 Inch LED Monitor" }),
    path.join(targetDir, "zebster-by-zebronics-zeb-v19hd-18-5-inch-led-monitor.webp")
  );

  await createWebpFromSvg(
    svgMonitor({ sizeInch: "21.5", brand: "Zebster by Zebronics", refreshRate: "5ms", title: "Zebster Z-EE22HD 21.5 Inch LED Monitor" }),
    path.join(targetDir, "zebster-by-zebronics-z-ee22hd-21-5-inch-led-monitor.webp")
  );

  await createWebpFromSvg(
    svgMonitor({ sizeInch: "27", brand: "Zebronics", refreshRate: "100Hz 5ms", title: "Zebronics Full HD LED Monitor 27 inch" }),
    path.join(targetDir, "zebronics-full-hd-led-monitor-27-inch.webp")
  );

  await createWebpFromSvg(
    svgRackCabinet(),
    path.join(targetDir, "nomwell-rack-cabinet.webp")
  );

  await createWebpFromSvg(
    svgHardDrive({ brand: "Seagate", capacity: "1TB", model: "Skyhawk ST1000VX013", isPurple: false }),
    path.join(targetDir, "seagate-skyhawk-surveillance-internal-hard-drive-1tb.webp")
  );

  await createWebpFromSvg(
    svgHardDrive({ brand: "Western Digital", capacity: "2TB", model: "WD Purple WD23PURZ", isPurple: true }),
    path.join(targetDir, "western-digital-purple-surveillance-hard-drive-2tb.webp")
  );

  await createWebpFromSvg(
    svgPowerAdapter(),
    path.join(targetDir, "erd-12v-2a-power-adapter.webp")
  );

  console.log("All CCTV product assets generated successfully!");
}

main().catch(console.error);
