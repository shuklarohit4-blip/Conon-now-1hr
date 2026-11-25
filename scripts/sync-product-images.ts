import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const manifestPath = path.join(rootDir, "scripts/image-manifest.json");

if (!fs.existsSync(manifestPath)) {
  console.error("image-manifest.json does not exist! Please run fetch-product-images first.");
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const entries = Object.values(manifest);
console.log(`Loaded ${entries.length} image entries from manifest.`);

// Build map: slug/id -> verified localPath
const pathBySlug = new Map();
entries.forEach((e: any) => {
  if (e.localPath) {
    pathBySlug.set(e.id, e.localPath);
    if (e.skuSlug) pathBySlug.set(e.skuSlug, e.localPath);
  }
});

let updatedCatalogData = 0;
let updatedStorefronts = 0;
let updatedMaterialsRoute = 0;
let updatedSeedDb = 0;

// 1. Sync catalogData.ts in conon & db
function syncCatalogFile(filePath: string) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, "utf8");
  let changes = 0;

  for (const [slug, newPath] of pathBySlug.entries()) {
    // Look for product block with this slug and its "image": "..."
    const slugRegex = new RegExp(`("slug":\\s*"${slug}"[\\s\\S]*?"image":\\s*")[^"]+(")`, "g");
    content = content.replace(slugRegex, (_m, p1, p2) => {
      changes++;
      return `${p1}${newPath}${p2}`;
    });
  }

  if (changes > 0) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Synced ${changes} image references in ${path.relative(rootDir, filePath)}`);
    updatedCatalogData += changes;
  }
}

syncCatalogFile(path.join(rootDir, "artifacts/conon/src/data/catalogData.ts"));
syncCatalogFile(path.join(rootDir, "lib/db/src/catalogData.ts"));

// 2. Sync Storefront files
const storefrontDir = path.join(rootDir, "artifacts/conon/src/components");
const sfFiles = fs.readdirSync(storefrontDir).filter((f) => f.includes("Storefront.tsx"));

for (const sf of sfFiles) {
  const fullPath = path.join(storefrontDir, sf);
  let content = fs.readFileSync(fullPath, "utf8");
  let sfChanges = 0;

  for (const [id, newPath] of pathBySlug.entries()) {
    // Match id: "..." ... image: "..."
    const idRegex = new RegExp(`(id:\\s*"${id}"[\\s\\S]*?image:\\s*")[^"]+(")`, "g");
    content = content.replace(idRegex, (_m, p1, p2) => {
      sfChanges++;
      return `${p1}${newPath}${p2}`;
    });
  }

  if (sfChanges > 0) {
    fs.writeFileSync(fullPath, content, "utf8");
    console.log(`Synced ${sfChanges} image references in ${sf}`);
    updatedStorefronts += sfChanges;
  }
}

// 3. Sync materials.ts
const materialsPath = path.join(rootDir, "artifacts/api-server/src/routes/materials.ts");
if (fs.existsSync(materialsPath)) {
  let matContent = fs.readFileSync(materialsPath, "utf8");
  let matChanges = 0;

  for (const [id, newPath] of pathBySlug.entries()) {
    const r = new RegExp(`("id":\\s*"${id}"[\\s\\S]*?"imageUrl":\\s*")[^"]+(")`, "g");
    matContent = matContent.replace(r, (_m, p1, p2) => {
      matChanges++;
      return `${p1}${newPath}${p2}`;
    });
  }

  if (matChanges > 0) {
    fs.writeFileSync(materialsPath, matContent, "utf8");
    console.log(`Synced ${matChanges} image references in materials.ts`);
    updatedMaterialsRoute += matChanges;
  }
}

// 4. Sync seed-local-db.ts
const seedPath = path.join(rootDir, "scripts/src/seed-local-db.ts");
if (fs.existsSync(seedPath)) {
  let seedContent = fs.readFileSync(seedPath, "utf8");
  let seedChanges = 0;

  for (const [id, newPath] of pathBySlug.entries()) {
    const r = new RegExp(`(externalId:\\s*"${id}"[\\s\\S]*?imageUrl:\\s*")[^"]+(")`, "g");
    seedContent = seedContent.replace(r, (_m, p1, p2) => {
      seedChanges++;
      return `${p1}${newPath}${p2}`;
    });
  }

  if (seedChanges > 0) {
    fs.writeFileSync(seedPath, seedContent, "utf8");
    console.log(`Synced ${seedChanges} image references in seed-local-db.ts`);
    updatedSeedDb += seedChanges;
  }
}

console.log("\nSync Summary:");
console.log(`- CatalogData updates: ${updatedCatalogData}`);
console.log(`- Storefront updates: ${updatedStorefronts}`);
console.log(`- Materials API updates: ${updatedMaterialsRoute}`);
console.log(`- Local DB Seed updates: ${updatedSeedDb}`);
console.log("Image catalog synchronization complete!\n");
