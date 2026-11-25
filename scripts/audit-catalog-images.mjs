import fs from "fs";
import path from "path";
import crypto from "crypto";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "artifacts/conon/public");

// 1. Audit catalogData.ts
const catalogDataPath = path.join(rootDir, "artifacts/conon/src/data/catalogData.ts");
const catalogContent = fs.readFileSync(catalogDataPath, "utf8");

let catalogProducts = [];
const startMarker = "export const CATALOG_PRODUCTS: IProduct[] = [";
const startIdx = catalogContent.indexOf(startMarker);
const endIdx = catalogContent.lastIndexOf("];\n\nexport const getProductsByCategory");
if (startIdx !== -1 && endIdx !== -1) {
  try {
    const jsonStr = catalogContent.slice(startIdx + startMarker.length - 1, endIdx + 1);
    catalogProducts = JSON.parse(jsonStr);
  } catch (e) {
    console.warn("Could not parse CATALOG_PRODUCTS via JSON:", e.message);
  }
}

console.log(`Loaded ${catalogProducts.length} products from catalogData.ts`);

// 2. Audit Storefront files
const storefrontDir = path.join(rootDir, "artifacts/conon/src/components");
const storefrontFiles = fs.readdirSync(storefrontDir).filter(f => f.includes("Storefront.tsx"));

console.log(`Found ${storefrontFiles.length} Storefront components.`);

const allProducts = new Map();

// Helper to compute sha256 of file
function getFileSha256(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(buf).digest("hex");
  } catch {
    return null;
  }
}

// Register product
function registerProduct(prod, source) {
  if (!prod.id) return;
  const key = `${source}:${prod.id}`;
  if (allProducts.has(key)) return;

  const img = prod.image || prod.imageUrl || "";
  let imgExists = false;
  let fileSize = 0;
  let sha256 = null;
  let isRemote = false;

  if (img.startsWith("http://") || img.startsWith("https://")) {
    isRemote = true;
  } else if (img) {
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    const fullPath = path.join(publicDir, cleanPath);
    if (fs.existsSync(fullPath)) {
      imgExists = true;
      const stats = fs.statSync(fullPath);
      fileSize = stats.size;
      sha256 = getFileSha256(fullPath);
    }
  }

  allProducts.set(key, {
    id: prod.id,
    title: prod.title || prod.name || prod.id,
    category: prod.categorySlug || prod.category || prod.materialTag || source.replace("CollectionStorefront.tsx", "").replace("Storefront.tsx", ""),
    brand: prod.brand || "Unknown",
    image: img,
    isRemote,
    imgExists,
    fileSize,
    sha256,
    source,
  });
}

catalogProducts.forEach(p => registerProduct(p, "catalogData"));

// Parse each storefront
for (const sf of storefrontFiles) {
  const sfPath = path.join(storefrontDir, sf);
  const sfContent = fs.readFileSync(sfPath, "utf8");

  // Regex extract products arrays
  const arrayMatches = sfContent.match(/export const [A-Z_]+_PRODUCTS(?:\s*:\s*[A-Za-z0-9_\[\]]+)?\s*=\s*(\[[\s\S]*?\]);/g);
  if (arrayMatches) {
    for (const arrStr of arrayMatches) {
      const jsonStrMatch = arrStr.match(/=\s*(\[[\s\S]*?\]);/);
      if (jsonStrMatch) {
        try {
          const prods = JSON.parse(jsonStrMatch[1]);
          prods.forEach(p => registerProduct(p, sf));
        } catch (e) {
          try {
            const prods = new Function(`return ${jsonStrMatch[1]}`)();
            prods.forEach(p => registerProduct(p, sf));
          } catch (err) {
            // regex fallback
            const idMatches = [...jsonStrMatch[1].matchAll(/\{\s*id:\s*"([^"]+)"[\s\S]*?title:\s*"([^"]+)"[\s\S]*?image:\s*"([^"]+)"/g)];
            for (const m of idMatches) {
              registerProduct({ id: m[1], title: m[2], image: m[3] }, sf);
            }
          }
        }
      }
    }
  }
}

console.log(`\n=== TOTAL PRODUCTS SCANNED: ${allProducts.size} ===\n`);

// Analyze missing images
const missing = [];
const remote = [];
const existingLocal = [];
const urlUsage = new Map(); // url -> array of products
const hashUsage = new Map(); // hash -> array of products

for (const [key, p] of allProducts.entries()) {
  if (!p.image) {
    missing.push(p);
    continue;
  }

  if (p.isRemote) {
    remote.push(p);
  } else if (!p.imgExists) {
    missing.push(p);
  } else {
    existingLocal.push(p);
    if (p.sha256) {
      if (!hashUsage.has(p.sha256)) hashUsage.set(p.sha256, []);
      hashUsage.get(p.sha256).push(p);
    }
  }

  if (!urlUsage.has(p.image)) urlUsage.set(p.image, []);
  urlUsage.get(p.image).push(p);
}

console.log(`Products with Valid Local Image on Disk: ${existingLocal.length}`);
console.log(`Products with Missing / Broken Image: ${missing.length}`);
console.log(`Products with Remote URLs: ${remote.length}`);

// Duplicate URLs across different products
const duplicateUrls = [];
for (const [url, prods] of urlUsage.entries()) {
  const uniqueTitles = new Set(prods.map(p => p.title));
  if (uniqueTitles.size > 1) {
    duplicateUrls.push({ url, prods });
  }
}
console.log(`Duplicate URLs across different products: ${duplicateUrls.length}`);

// Duplicate Hashes across different products
const duplicateHashes = [];
for (const [hash, prods] of hashUsage.entries()) {
  const uniqueTitles = new Set(prods.map(p => p.title));
  if (uniqueTitles.size > 1) {
    duplicateHashes.push({ hash, sampleUrl: prods[0].image, prods });
  }
}
console.log(`Duplicate SHA-256 Hashes across different products: ${duplicateHashes.length}`);

// Focus categories check
const targetCategories = ["sanitary", "cctv", "plumbing", "electrical"];
console.log("\n=== TARGET CATEGORIES AUDIT ===");
for (const cat of targetCategories) {
  const prods = [...allProducts.values()].filter(p => p.category.toLowerCase().includes(cat) || p.source.toLowerCase().includes(cat));
  const catMissing = prods.filter(p => !p.imgExists);
  const catRemote = prods.filter(p => p.isRemote);
  const catValid = prods.filter(p => p.imgExists);
  console.log(`\nCategory [${cat.toUpperCase()}]: Total=${prods.length}, Valid Local=${catValid.length}, Missing=${catMissing.length}, Remote=${catRemote.length}`);
}

// Dump detailed report to audit-report.json
fs.writeFileSync(
  path.join(rootDir, "scripts/audit-report.json"),
  JSON.stringify({
    totalScanned: allProducts.size,
    existingLocalCount: existingLocal.length,
    missingCount: missing.length,
    missingSamples: missing.slice(0, 15),
    remoteCount: remote.length,
    remoteUrls: remote.map(r => ({ id: r.id, title: r.title, url: r.image })),
    duplicateUrlCount: duplicateUrls.length,
    duplicateUrlsSample: duplicateUrls.slice(0, 15).map(d => ({
      url: d.url,
      titles: d.prods.map(p => p.title),
    })),
    duplicateHashCount: duplicateHashes.length,
    duplicateHashesSample: duplicateHashes.slice(0, 15).map(d => ({
      hash: d.hash,
      sampleUrl: d.sampleUrl,
      titles: d.prods.map(p => p.title),
    })),
  }, null, 2),
  "utf8"
);
console.log("\nWrote full audit to scripts/audit-report.json");
