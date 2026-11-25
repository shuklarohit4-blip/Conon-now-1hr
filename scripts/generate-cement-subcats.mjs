import sharp from "sharp";
import path from "path";

const subcatDir = "/Users/rohiitshukla/Downloads/Conon-Builder-Network 4/artifacts/conon/public/images/subcategories";

async function genSubcatIcon(svg, filename) {
  const buf = Buffer.from(svg);
  await sharp(buf)
    .resize(128, 128)
    .webp({ quality: 95 })
    .toFile(path.join(subcatDir, filename));
  console.log("Updated subcat icon:", filename);
}

// 1. Cement: Yellow Sack
const cementSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="62" fill="#F8FAFC"/>
  <!-- Yellow Sack Body -->
  <path d="M36 28 C 46 25, 82 25, 92 28 C 100 48, 102 82, 94 100 C 82 104, 46 104, 34 100 C 26 82, 28 48, 36 28 Z" fill="#FACC15" stroke="#CA8A04" stroke-width="2"/>
  <!-- Stitched Edges -->
  <line x1="36" y1="30" x2="92" y2="30" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="2 2"/>
  <line x1="34" y1="98" x2="94" y2="98" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="2 2"/>
  <!-- Red Brand Box & ISI -->
  <rect x="44" y="44" width="40" height="32" rx="2" fill="#FFFFFF" stroke="#DC2626" stroke-width="1.5"/>
  <text x="64" y="58" font-family="system-ui, sans-serif" font-weight="900" font-size="7" fill="#DC2626" text-anchor="middle">CEMENT</text>
  <text x="64" y="68" font-family="system-ui, sans-serif" font-weight="800" font-size="6" fill="#1E293B" text-anchor="middle">50 KG</text>
</svg>`;

// 2. Sand, Plaster & Mortars: White/Silver Plaster Sack
const sandPlasterSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="62" fill="#F8FAFC"/>
  <!-- White Sack Body -->
  <path d="M36 28 C 46 25, 82 25, 92 28 C 100 48, 102 82, 94 100 C 82 104, 46 104, 34 100 C 26 82, 28 48, 36 28 Z" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <!-- Blue / Black Print -->
  <line x1="36" y1="30" x2="92" y2="30" stroke="#94A3B8" stroke-width="2" stroke-dasharray="2 2"/>
  <rect x="42" y="45" width="44" height="34" rx="2" fill="#F1F5F9" stroke="#0284C7" stroke-width="1.5"/>
  <text x="64" y="58" font-family="system-ui, sans-serif" font-weight="900" font-size="7" fill="#0284C7" text-anchor="middle">PLASTER</text>
  <text x="64" y="68" font-family="system-ui, sans-serif" font-weight="800" font-size="6" fill="#1E293B" text-anchor="middle">M-SAND</text>
</svg>`;

// 3. Masonry Tools & Hardware: Pointed Trowel
const masonryToolsSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="62" fill="#F8FAFC"/>
  <!-- Pointed Steel Blade (Angled 45 deg) -->
  <path d="M78 30 L94 46 L58 82 C 48 76, 46 66, 52 56 Z" fill="#CBD5E1" stroke="#64748B" stroke-width="2"/>
  <path d="M78 30 L94 46" stroke="#FFFFFF" stroke-width="2"/>
  <!-- Ferrule & Wooden Handle -->
  <path d="M48 86 L32 102" stroke="#D97706" stroke-width="8" stroke-linecap="round"/>
  <path d="M52 82 L46 88" stroke="#475569" stroke-width="5" stroke-linecap="round"/>
</svg>`;

// 4. Chemicals: Tub / Can with Red Stripe
const chemicalsSvg = `
<svg width="128" height="128" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="64" cy="64" r="62" fill="#F8FAFC"/>
  <!-- White Chemical Can/Tub -->
  <rect x="40" y="36" width="48" height="64" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="2"/>
  <rect x="44" y="30" width="40" height="6" rx="2" fill="#94A3B8"/>
  <!-- Red Chemical Band -->
  <rect x="40" y="52" width="48" height="14" fill="#DC2626"/>
  <text x="64" y="62" font-family="system-ui, sans-serif" font-weight="900" font-size="6" fill="#FFFFFF" text-anchor="middle">CHEM</text>
  <!-- Handle -->
  <path d="M44 42 C 44 24, 84 24, 84 42" stroke="#64748B" stroke-width="2" fill="none"/>
</svg>`;

async function run() {
  await genSubcatIcon(cementSvg, "cement-bag-icon.webp");
  await genSubcatIcon(sandPlasterSvg, "sand-plaster-icon.webp");
  await genSubcatIcon(masonryToolsSvg, "masonry-tools-icon.webp");
  await genSubcatIcon(chemicalsSvg, "chemicals-icon.webp");
  console.log("All subcategory icons updated!");
}

run();
