import sharp from "sharp";
import path from "path";

const subcatDir = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/subcategories";

async function genIcon(svg, filename) {
  const buf = Buffer.from(svg);
  await sharp(buf)
    .resize(128, 128)
    .webp({ quality: 95 })
    .toFile(path.join(subcatDir, filename));
  console.log("Subcat icon updated:", filename);
}

// 1. Cameras: Crisp Dome Camera
const camerasSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="62" fill="#F8FAFC"/>
  <!-- Mounting base plate -->
  <path d="M28 42 C 28 36, 100 36, 100 42 L96 52 L32 52 Z" fill="#CBD5E1" stroke="#94A3B8" stroke-width="2"/>
  <!-- Dome hemisphere -->
  <path d="M32 52 C 32 86, 96 86, 96 52 Z" fill="#FFFFFF" stroke="#94A3B8" stroke-width="2"/>
  <!-- Black optical bubble dome -->
  <ellipse cx="64" cy="60" rx="22" ry="22" fill="#0F172A"/>
  <!-- Glass lens reflection -->
  <ellipse cx="64" cy="60" rx="14" ry="14" fill="#1E293B" stroke="#0284C7" stroke-width="2"/>
  <circle cx="64" cy="60" r="6" fill="#000000"/>
  <circle cx="67" cy="57" r="2.5" fill="#38BDF8"/>
  <!-- Red status LED -->
  <circle cx="64" cy="78" r="2" fill="#EF4444"/>
</svg>`;

// 2. NVR, DVR & Switches: Metal Switch with green LEDs
const nvrDvrSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="62" fill="#F8FAFC"/>
  <!-- 3D Switch Box -->
  <polygon points="20,54 44,40 108,40 84,54" fill="#475569"/>
  <polygon points="84,54 108,40 108,68 84,82" fill="#1E293B"/>
  <polygon points="20,54 84,54 84,82 20,82" fill="#334155" stroke="#1E293B" stroke-width="1.5"/>
  <!-- RJ45 Ports -->
  <rect x="26" y="64" width="8" height="9" rx="1" fill="#0F172A"/>
  <rect x="38" y="64" width="8" height="9" rx="1" fill="#0F172A"/>
  <rect x="50" y="64" width="8" height="9" rx="1" fill="#0F172A"/>
  <rect x="62" y="64" width="8" height="9" rx="1" fill="#0F172A"/>
  <rect x="74" y="64" width="6" height="9" rx="1" fill="#0F172A"/>
  <!-- Green LEDs -->
  <circle cx="30" cy="60" r="1.5" fill="#22C55E"/>
  <circle cx="42" cy="60" r="1.5" fill="#22C55E"/>
  <circle cx="54" cy="60" r="1.5" fill="#22C55E"/>
  <circle cx="66" cy="60" r="1.5" fill="#22C55E"/>
  <!-- CP / Brand tag -->
  <rect x="25" y="56" width="18" height="5" rx="1" fill="#DC2626"/>
</svg>`;

// 3. CCTV Accessories: Rack Cabinet & Hard Drive
const accessoriesSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="62" fill="#F8FAFC"/>
  <!-- Wall mount rack cabinet -->
  <rect x="32" y="30" width="64" height="68" rx="4" fill="#334155" stroke="#1E293B" stroke-width="2"/>
  <!-- Glass front door -->
  <rect x="38" y="38" width="52" height="52" rx="2" fill="#0284C7" fill-opacity="0.2" stroke="#38BDF8" stroke-width="1.5"/>
  <!-- Rails inside -->
  <rect x="42" y="44" width="44" height="10" rx="1" fill="#0F172A"/>
  <circle cx="46" cy="49" r="1.5" fill="#22C55E"/>
  <rect x="42" y="58" width="44" height="12" rx="1" fill="#0F172A"/>
  <circle cx="46" cy="64" r="1.5" fill="#38BDF8"/>
  <rect x="42" y="74" width="44" height="12" rx="1" fill="#1E293B"/>
  <!-- Key lock -->
  <circle cx="84" cy="64" r="2.5" fill="#94A3B8"/>
</svg>`;

// 4. Wifi & Networking: Dual-band Router with antennas
const wifiSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="62" fill="#F8FAFC"/>
  <!-- Antennas -->
  <line x1="36" y1="62" x2="26" y2="28" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/>
  <line x1="52" y1="58" x2="48" y2="22" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/>
  <line x1="76" y1="58" x2="80" y2="22" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/>
  <line x1="92" y1="62" x2="102" y2="28" stroke="#1E293B" stroke-width="4" stroke-linecap="round"/>
  <!-- Body -->
  <polygon points="30,68 46,58 82,58 98,68 94,84 34,84" fill="#334155" stroke="#0F172A" stroke-width="2"/>
  <polygon points="34,68 48,60 80,60 94,68 90,80 38,80" fill="#0F172A"/>
  <!-- Blue / Green LED strip -->
  <circle cx="54" cy="74" r="1.5" fill="#22C55E"/>
  <circle cx="60" cy="74" r="1.5" fill="#22C55E"/>
  <circle cx="66" cy="74" r="1.5" fill="#38BDF8"/>
  <circle cx="72" cy="74" r="1.5" fill="#22C55E"/>
</svg>`;

// 5. CCTV & CAT6 Cable: Cable Box & Coil
const cableSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="62" fill="#F8FAFC"/>
  <!-- Cable Reel Carton Box -->
  <polygon points="32,46 54,34 94,44 72,56" fill="#F59E0B"/>
  <polygon points="32,46 72,56 72,88 32,78" fill="#D97706" stroke="#B45309" stroke-width="1.5"/>
  <polygon points="72,56 94,44 94,76 72,88" fill="#B45309"/>
  <!-- Pull hole -->
  <ellipse cx="52" cy="68" rx="7" ry="9" fill="#0F172A"/>
  <!-- Cable loop coming out -->
  <path d="M52 68 C 65 78, 55 96, 75 98" stroke="#0284C7" stroke-width="3.5" fill="none" stroke-linecap="round"/>
  <!-- Cable coil next to box -->
  <ellipse cx="88" cy="80" rx="16" ry="7" fill="#64748B"/>
  <ellipse cx="88" cy="83" rx="16" ry="7" fill="#475569"/>
</svg>`;

async function run() {
  await genIcon(camerasSvg, "cameras-icon.webp");
  await genIcon(nvrDvrSvg, "nvr-dvr-switches-icon.webp");
  await genIcon(accessoriesSvg, "cctv-accessories-icon.webp");
  await genIcon(wifiSvg, "wifi-networking-icon.webp");
  await genIcon(cableSvg, "cctv-cat6-cable-icon.webp");
  console.log("All subcategory icons updated!");
}

run();
